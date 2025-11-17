import { GoogleGenerativeAI } from '@google/generative-ai';

type SparringPayload = {
  classicStory?: string;
  twist?: string;
  focus?: string;
};

type WritingPayload = {
  theme?: string;
  genre?: string;
  grade?: string;
};

type ArtStylePayload = {
  imageBase64: string;
  mimeType: string;
  styleLabel: string;
  stylePrompt: string;
  description: string;
};

export type ArtStyleResult = {
  mimeType?: string;
  dataUrl?: string;
  fileUri?: string;
  imageUrl?: string;
  resultUrl?: string;
  message?: string;
};

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY 환경 변수가 설정되어 있지 않습니다.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

const TEXT_MODEL = import.meta.env.VITE_GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
const IMAGE_MODEL = import.meta.env.VITE_GEMINI_IMAGE_MODEL || 'gemini-1.5-flash';

const textModel = genAI.getGenerativeModel({ model: TEXT_MODEL });
const imageModel = genAI.getGenerativeModel({ model: IMAGE_MODEL });

const buildSparringPrompt = ({ classicStory, twist, focus }: SparringPayload) => {
  return [
    '너는 초등학교 3~4학년 대상 AI 스파링 파트너이다.',
    '학생은 고전 동화를 비판적으로 다시 쓰도록 지도받는다.',
    '다음 형식을 반드시 지켜라.',
    '',
    `기준 동화: ${classicStory || '예)토끼와 거북이'}`,
    `AI가 제시할 엉뚱한 반론: ${twist || '예)거북이가 이긴 것은 불공평하다'}`,
    `수업 초점: ${focus || '예)불공정 상황을 발견하고 다시 구성하기'}`,
    '',
    '출력 템플릿:',
    '1. AI 반론: 한 문단으로 학생을 도발하되 안전한 표현을 사용한다.',
    '2. 비판적 사고 질문 2개: 질문은 번호 목록으로 만든다.',
    '3. 재구성 가이드: 학생이 새 결말을 쓰도록 단계별 안내를 bullet 3개로 제시한다.',
    '4. 확장 활동: STEAM 또는 창체 연계 아이디어를 한 줄로 제시한다.',
  ].join('\n');
};

const buildWritingPrompt = ({ theme, genre, grade }: WritingPayload) => {
  return [
    '너는 초등 국어/창체 수업용 AI 글쓰기 코치이다.',
    '학생 입력을 바탕으로 활동지를 대신 작성한다.',
    `학년: ${grade || '3학년'}`,
    `주제: ${theme || '거북이의 시점으로 쓰는 우정 이야기'}`,
    `장르: ${genre || '동화'}`,
    '',
    '출력 템플릿:',
    '1. 글쓰기 미션 제목',
    '2. 아이스브레이킹 질문 2개 (번호 목록)',
    '3. 글 구조 제안 (도입, 전개, 결말 형태)',
    '4. 표현 꿀팁 2개',
    '5. 확장 활동 아이디어 1개',
  ].join('\n');
};

type InlineImagePart = {
  inlineData: {
    data: string;
    mimeType: string;
  };
};

const extractInlineImage = (parts: InlineImagePart[]): ArtStyleResult | null => {
  for (const part of parts) {
    if (part.inlineData) {
      const { mimeType, data } = part.inlineData;
      return {
        mimeType,
        dataUrl: `data:${mimeType};base64,${data}`,
      };
    }
  }
  return null;
};

export async function requestSparringScenario(payload: SparringPayload): Promise<string> {
  const prompt = buildSparringPrompt(payload);
  const result = await textModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function requestWritingGuide(payload: WritingPayload): Promise<string> {
  const prompt = buildWritingPrompt(payload);
  const result = await textModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function requestImageFromText(prompt: string): Promise<ArtStyleResult> {
  const result = await imageModel.generateContent(prompt);
  const response = await result.response;

  const candidates = response.candidates?.[0]?.content?.parts;
  if (!candidates) {
    throw new Error('Gemini가 이미지 결과를 반환하지 않았습니다.');
  }

  const inlineImage = extractInlineImage(candidates as InlineImagePart[]);
  if (!inlineImage) {
    throw new Error('Gemini가 이미지 결과를 반환하지 않았습니다.');
  }

  return inlineImage;
}

export async function requestArtStyleRender(payload: ArtStylePayload): Promise<ArtStyleResult> {
  const imagePart: InlineImagePart = {
    inlineData: {
      data: payload.imageBase64,
      mimeType: payload.mimeType,
    },
  };

  const prompt = `주어진 이미지를 '${payload.styleLabel}' 스타일로 다시 그려주세요. 이 그림은 '${payload.description}'을 묘사하고 있습니다. 스타일 프롬프트는 다음과 같습니다: '${payload.stylePrompt}'.`;

  const result = await imageModel.generateContent([prompt, imagePart]);
  const response = await result.response;

  const candidates = response.candidates?.[0]?.content?.parts;
  if (!candidates) {
    throw new Error('Gemini가 이미지 결과를 반환하지 않았습니다.');
  }

  const inlineImage = extractInlineImage(candidates as InlineImagePart[]);
  if (!inlineImage) {
    throw new Error('Gemini가 이미지 결과를 반환하지 않았습니다.');
  }

  return inlineImage;
}
