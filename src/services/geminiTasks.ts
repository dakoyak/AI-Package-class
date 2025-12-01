import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the client
// The API key is injected from import.meta.env.VITE_GEMINI_API_KEY automatically.
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY as string);

export interface ArtStyleRequest {
  imageBase64: string;
  mimeType: string;
  styleLabel: string;
  stylePrompt: string;
}

export interface ArtStyleResult {
  dataUrl?: string;
  message?: string;
}

export interface SparringScenarioRequest {
  classicStory: string;
  twist: string;
  focus: string;
}

export interface WritingGuideRequest {
  grade: string;
  theme: string;
  genre: string;
}

/**
 * Requests an image generation task from the 'gemini-pro-vision' model.
 * It takes an existing image, a style prompt, and a description to guide the generation.
 */
export const requestArtStyleRender = async (
  params: ArtStyleRequest
): Promise<ArtStyleResult> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("CRITICAL: VITE_GEMINI_API_KEY is missing or empty!");
    throw new Error("API Key가 설정되지 않았습니다. .env 파일을 확인해주세요.");
  }

  const modelName = "gemini-2.5-flash-image";

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      console.log(`[Fetch] Attempting image generation with model: ${modelName} (Attempt ${retryCount + 1}/${maxRetries})`);

      // Construct a prompt that guides the model to modify the image style
      // while respecting the original content description.
      const finalPrompt = `
        Instructions:
        1. Analyze the attached image to understand its composition and subject matter.
        2. Redraw this exact scene, maintaining the original composition.
        3. Apply the following artistic style to the new image: "${params.stylePrompt}".
        
        IMPORTANT:
        - Do NOT generate a generic "Starry Night" or famous painting.
        - You MUST preserve the original subject and composition of the user's drawing.
        - Only apply the *technique* (brush strokes, color palette, texture) of the requested style.
        - If the style is "Van Gogh", do NOT draw a starry night sky unless it is in the original drawing.
        
        The output must be a high-quality image that looks like a finished artwork in the requested style, but strictly based on the input image.
      `.trim();

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: finalPrompt },
                {
                  inline_data: {
                    mime_type: params.mimeType,
                    data: params.imageBase64
                  }
                }
              ]
            }],
            generationConfig: {
              responseModalities: ["IMAGE"]
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
          })
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000 * Math.pow(2, retryCount);
          console.warn(`[Fetch] Rate limited (429). Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retryCount++;
          continue;
        }

        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json();

      // Check for candidates
      const candidates = data.candidates;
      if (!candidates || candidates.length === 0) {
        // Check promptFeedback for block reason
        if (data.promptFeedback && data.promptFeedback.blockReason) {
          throw new Error(`이미지 생성이 차단되었습니다. 사유: ${data.promptFeedback.blockReason}`);
        }
        throw new Error('Gemini 응답에 후보(candidates)가 없습니다.');
      }

      const firstCandidate = candidates[0];

      // Check finishReason
      if (firstCandidate.finishReason && firstCandidate.finishReason !== 'STOP') {
        throw new Error(`이미지 생성이 완료되지 않았습니다. 사유: ${firstCandidate.finishReason}`);
      }

      // Extract the generated image
      const parts = firstCandidate.content?.parts;
      if (parts) {
        for (const part of parts) {
          // API response might use camelCase (inlineData) or snake_case (inline_data)
          const inlineData = part.inlineData || part.inline_data;

          if (inlineData && inlineData.data) {
            const base64Image = inlineData.data;
            const mimeType = inlineData.mimeType || inlineData.mime_type || 'image/png';
            return {
              dataUrl: `data:${mimeType};base64,${base64Image}`,
              message: 'AI가 당신의 그림을 예술적으로 재해석했습니다.',
            };
          }
          // If we get text instead of image, it's likely a refusal or explanation
          if (part.text) {
            console.warn('AI returned text instead of image:', part.text);
            throw new Error(`AI가 이미지 생성을 거부했습니다: "${part.text}"`);
          }
        }
      }

      throw new Error('AI 응답에서 이미지 데이터를 찾을 수 없습니다. (텍스트 응답만 왔을 수 있습니다)');

    } catch (error) {
      if (retryCount === maxRetries - 1 || (error instanceof Error && !error.message.includes('429'))) {
        console.warn(`[Fetch] Failed with model ${modelName}:`, error);

        let userMessage = '스타일 변환 중 알 수 없는 오류가 발생했습니다.';
        if (error instanceof Error) {
          if (error.message.includes('429')) {
            userMessage = '사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
          } else if (error.message.includes('400')) {
            userMessage = '요청 형식이 잘못되었습니다. (지원되지 않는 모델일 수 있습니다)';
          } else {
            userMessage = `이미지 생성 실패: ${error.message}`;
          }
        }

        throw new Error(userMessage);
      }
      // If it was a 429 and we haven't hit maxRetries, the loop continues
    }
  }
  // If the loop finishes without returning, it means all retries failed.
  throw new Error('이미지 생성에 실패했습니다. 여러 번 시도했지만 응답을 받지 못했습니다.');
};

/**
 * Requests a creative sparring scenario from Gemini.
 * Takes a classic story, a twist, and a focus area to generate
 * a creative reinterpretation or discussion prompt.
 */
export const requestSparringScenario = async (
  params: SparringScenarioRequest,
  onUpdate?: (text: string) => void
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      당신은 창의적 사고를 돕는 교육 AI입니다.
      
      기준 동화: "${params.classicStory}"
      엉뚱한 반론: "${params.twist}"
      수업 초점: "${params.focus}"
      
      위 정보를 바탕으로 학생들이 비판적 사고와 창의력을 발휘할 수 있도록 
      흥미진진한 토론 시나리오와 가이드 질문을 작성해주세요.
      
      출력 형식:
      1. 시나리오 개요
      2. 주요 논쟁 포인트
      3. 학생들에게 던질 질문 (3가지)
      4. 예상되는 반론과 재반론
    `;

    const result = await model.generateContentStream(prompt);

    let fullText = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      if (onUpdate) {
        onUpdate(fullText);
      }
    }

    return fullText;
  } catch (error) {
    console.error("Sparring Scenario Error:", error);
    throw new Error("스파링 시나리오 생성에 실패했습니다.");
  }
};

/**
 * Requests a writing guide from Gemini.
 * Takes grade, theme, and genre to generate a structured writing worksheet.
 */
export const requestWritingGuide = async (
  params: WritingGuideRequest,
  onUpdate?: (text: string) => void
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      당신은 초등학생 글쓰기 지도 전문가 AI입니다.
      
      대상 학년: ${params.grade}
      글쓰기 장르: ${params.genre}
      주제: "${params.theme}"
      
      위 정보를 바탕으로 초등학생이 글쓰기를 쉽게 시작하고 완성할 수 있도록 
      단계별 가이드와 예시를 포함한 글쓰기 워크시트 내용을 작성해주세요.
      
      출력 형식:
      1. 글쓰기 목표
      2. 아이디어 구상하기 (질문 포함)
      3. 개요 짜기 (예시 포함)
      4. 글쓰기 시작하기 (팁 포함)
      5. 퇴고하기 (체크리스트 포함)
    `;

    const result = await model.generateContentStream(prompt);

    let fullText = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      if (onUpdate) {
        onUpdate(fullText);
      }
    }

    return fullText;
  } catch (error) {
    console.error("Writing Guide Error:", error);
    throw new Error("글쓰기 가이드 생성에 실패했습니다.");
  }
};