const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * POST /api/discussion/mediate
 * 토론 내용을 분석하고 중재/요약 제공
 */
router.post('/mediate', async (req, res) => {
  try {
    const { topic, content } = req.body;

    console.log('중재 요청 받음:', { topic, contentLength: content?.length });

    if (!content || content.trim() === '') {
      console.log('토론 내용이 비어있음');
      return res.status(400).json({
        status: 'error',
        reason: '토론 내용이 비어있습니다.',
      });
    }

    // OpenAI GPT API 호출
    const prompt = `당신은 초등학생들의 토론을 중재하는 선생님입니다.
다음은 "${topic}"에 대한 레드팀과 블루팀의 토론 내용입니다:

${content}

위 토론 내용을 바탕으로:
1. 각 팀의 주요 의견을 간단히 요약해주세요
2. 양측의 좋은 점을 칭찬해주세요
3. 서로 배울 점이나 타협할 수 있는 부분을 제안해주세요

친근하고 따뜻한 말투로, 초등학생이 이해하기 쉽게 200자 이내로 작성해주세요.`;

    console.log('OpenAI API 호출 시작');
    
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '당신은 초등학생들의 토론을 중재하는 친절한 선생님입니다.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const mediation = openaiResponse.data.choices[0].message.content;

    console.log('중재 생성 완료:', mediation.substring(0, 50) + '...');

    return res.json({
      status: 'success',
      mediation: mediation,
    });
  } catch (error) {
    console.error('AI 중재 생성 오류:', error);
    console.error('에러 상세:', error.message);
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    }
    return res.status(500).json({
      status: 'error',
      reason: 'AI 중재를 생성하는 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
});

module.exports = router;

/**
 * POST /api/discussion/chat
 * 곰곰이와 대화하기 - 사용자 메시지에 대한 AI 응답
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    console.log('곰곰이 대화 요청:', { message, historyLength: history.length });

    if (!message || message.trim() === '') {
      return res.status(400).json({
        status: 'error',
        reason: '메시지가 비어있습니다.',
      });
    }

    // 대화 히스토리 구성
    const messages = [
      {
        role: 'system',
        content: `당신은 "곰곰이"라는 이름의 친근한 곰 캐릭터입니다. 
초등학생과 자유롭게 토론하고 있습니다.
다음 규칙을 따라주세요:
1. 항상 친근하고 따뜻한 말투를 사용하세요 (예: "그렇구나!", "좋은 생각이야!")
2. 초등학생 수준에 맞는 쉬운 단어를 사용하세요
3. 아이의 의견을 존중하고 칭찬해주세요
4. 다양한 관점을 제시하여 생각을 넓혀주세요
5. 질문을 통해 더 깊이 생각하도록 유도하세요
6. 한 번에 2-3문장 정도로 간결하게 답변하세요
7. 이모티콘이나 이모지는 절대 사용하지 마세요. 오직 텍스트로만 답변하세요
8. 토론 상대로서 때로는 반대 의견도 제시하여 생각을 자극하세요`,
      },
      ...history,
      {
        role: 'user',
        content: message,
      },
    ];

    console.log('OpenAI API 호출 시작');

    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: messages,
        max_tokens: 300,
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const reply = openaiResponse.data.choices[0].message.content;

    console.log('곰곰이 응답 생성 완료:', reply.substring(0, 50) + '...');

    return res.json({
      status: 'success',
      reply: reply,
    });
  } catch (error) {
    console.error('곰곰이 대화 오류:', error);
    console.error('에러 상세:', error.message);
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    }
    return res.status(500).json({
      status: 'error',
      reason: '곰곰이가 답변하는 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
});
