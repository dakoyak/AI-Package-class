/**
 * API Client for AI Detective HQ Backend
 * Handles communication with the backend server for guardrail challenges
 */

import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Response types from the backend API
 */
export interface GuardrailSuccessResponse {
  status: 'success';
  data: {
    type: 'image' | 'text';
    content: string;
  };
}

export interface GuardrailRejectedResponse {
  status: 'rejected';
  reason: string;
}

export interface GuardrailErrorResponse {
  status: 'error';
  reason: string;
}

export type GuardrailResponse = 
  | GuardrailSuccessResponse 
  | GuardrailRejectedResponse 
  | GuardrailErrorResponse;

/**
 * Execute a guardrail challenge by sending a prompt to the backend
 * 
 * @param prompt - The prompt to send to the AI
 * @param apiType - The type of API to use ('dalle' or 'gpt')
 * @returns Promise with the API response
 * @throws Error if network request fails
 */
export const runGuardrailChallenge = async (
  prompt: string, 
  apiType: 'dalle' | 'gpt' = 'dalle'
): Promise<GuardrailResponse> => {
  // Validate prompt before sending
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('유효하지 않은 프롬프트입니다.');
  }

  try {
    const response = await axios.post<GuardrailResponse>(
      `${API_BASE_URL}/api/challenge/guardrail`,
      { prompt, apiType },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    return response.data;
  } catch (error) {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<GuardrailErrorResponse>;
      
      if (axiosError.response) {
        // Server responded with error status
        const status = axiosError.response.status;
        
        // Handle specific HTTP status codes
        if (status === 400) {
          // Bad request - validation error
          return axiosError.response.data;
        } else if (status === 401 || status === 403) {
          // Authentication/Authorization error
          throw new Error('서버 인증 오류가 발생했습니다. 관리자에게 문의하세요.');
        } else if (status === 404) {
          // Not found
          throw new Error('요청한 API를 찾을 수 없습니다.');
        } else if (status === 429) {
          // Rate limiting
          throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
        } else if (status >= 500) {
          // Server error
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
        
        // Return error response for other cases
        return axiosError.response.data;
      } else if (axiosError.request) {
        // Request made but no response received
        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.');
        } else if (axiosError.code === 'ERR_NETWORK') {
          throw new Error('네트워크 연결이 끊어졌습니다. 인터넷 연결을 확인해주세요.');
        } else {
          throw new Error('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
        }
      }
    }
    
    // Something else happened
    console.error('Unexpected error:', error);
    throw new Error('알 수 없는 오류가 발생했습니다.');
  }
};

/**
 * Check backend health status
 * 
 * @returns Promise with health check result
 */
export const checkHealth = async (): Promise<{ status: string; message: string }> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('서버 응답 시간이 초과되었습니다.');
      } else if (error.code === 'ERR_NETWORK') {
        throw new Error('서버에 연결할 수 없습니다.');
      }
    }
    throw new Error('서버 상태를 확인할 수 없습니다.');
  }
};

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - The function to retry
 * @param maxRetries - Maximum number of retries (default: 2)
 * @param delay - Initial delay in milliseconds (default: 1000)
 * @returns Promise with the function result
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry on validation errors or client errors
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status && status >= 400 && status < 500) {
          throw error;
        }
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying with exponential backoff
      const waitTime = delay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError || new Error('Retry failed');
};
