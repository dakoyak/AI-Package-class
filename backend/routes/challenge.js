const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * POST /api/challenge/guardrail
 * Execute a guardrail challenge with live AI API
 * 
 * Request body:
 * - prompt: string (required) - The prompt to send to the AI
 * - apiType: string (optional) - 'dalle' or 'gpt' (default: 'dalle')
 * 
 * Response formats:
 * - Success: { status: 'success', data: { type: 'image'|'text', content: string } }
 * - Rejected: { status: 'rejected', reason: string }
 * - Error: { status: 'error', reason: string }
 */
router.post('/guardrail', async (req, res) => {
  try {
    const { prompt, apiType = 'dalle' } = req.body;
    
    // Validate request body
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        status: 'error',
        reason: '유효하지 않은 요청입니다. prompt 필드가 필요합니다.'
      });
    }

    if (prompt.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        reason: 'prompt는 비어있을 수 없습니다.'
      });
    }

    // Validate apiType
    if (apiType !== 'dalle' && apiType !== 'gpt') {
      return res.status(400).json({
        status: 'error',
        reason: 'apiType은 "dalle" 또는 "gpt"여야 합니다.'
      });
    }

    let openaiResponse;

    // Route to appropriate API based on apiType
    if (apiType === 'dalle') {
      // DALL-E Image Generation
      openaiResponse = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024'
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000, // 60 second timeout for image generation
          validateStatus: function (status) {
            // Don't throw on any status code
            return status < 500;
          }
        }
      );

      // Handle successful DALL-E response
      if (openaiResponse.data && openaiResponse.data.data && openaiResponse.data.data.length > 0) {
        return res.json({
          status: 'success',
          data: {
            type: 'image',
            content: openaiResponse.data.data[0].url
          }
        });
      }
    } else if (apiType === 'gpt') {
      // GPT Text Generation
      openaiResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000, // 30 second timeout for text generation
          validateStatus: function (status) {
            // Don't throw on any status code
            return status < 500;
          }
        }
      );

      // Handle successful GPT response
      if (openaiResponse.data && openaiResponse.data.choices && openaiResponse.data.choices.length > 0) {
        const responseText = openaiResponse.data.choices[0].message.content;
        
        // Check if GPT refused the request (it usually explains why it can't help)
        const refusalKeywords = ['cannot', 'can\'t', 'unable', 'not able', 'sorry', 'apologize', 'inappropriate', 'illegal', 'harmful', 'dangerous'];
        const isRefusal = refusalKeywords.some(keyword => responseText.toLowerCase().includes(keyword));
        
        if (isRefusal) {
          return res.json({
            status: 'rejected',
            reason: responseText
          });
        }
        
        return res.json({
          status: 'success',
          data: {
            type: 'text',
            content: responseText
          }
        });
      }
    }

    // Unexpected response format
    return res.status(500).json({
      status: 'error',
      reason: 'AI API로부터 예상치 못한 응답을 받았습니다.'
    });

  } catch (error) {
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      return res.status(504).json({
        status: 'error',
        reason: 'AI 응답 시간이 초과되었습니다. 다시 시도해주세요.'
      });
    }

    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('Network error:', error.code);
      return res.status(503).json({
        status: 'error',
        reason: 'AI 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
      });
    }

    // Detect AI rejection (400 status)
    if (error.response && error.response.status === 400) {
      // Extract rejection reason from OpenAI error response
      const rejectionMessage = error.response.data?.error?.message || 
                               'AI가 이 요청을 거절했습니다.';
      
      console.log('AI Rejection:', rejectionMessage);
      
      return res.json({
        status: 'rejected',
        reason: rejectionMessage
      });
    }

    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.error('Authentication error: Invalid API key');
      return res.status(500).json({
        status: 'error',
        reason: 'API 인증 오류가 발생했습니다.'
      });
    }

    // Handle rate limiting
    if (error.response && error.response.status === 429) {
      console.error('Rate limit exceeded');
      return res.status(429).json({
        status: 'error',
        reason: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
      });
    }

    // Handle server errors from OpenAI
    if (error.response && error.response.status >= 500) {
      console.error('OpenAI server error:', error.response.status);
      return res.status(503).json({
        status: 'error',
        reason: 'AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.'
      });
    }

    // Handle other errors
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }

    return res.status(500).json({
      status: 'error',
      reason: '서버 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
