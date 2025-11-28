/**
 * Canned Bias Data for Mission 1: AI Bias Detection
 * 
 * This module contains pre-generated AI results that demonstrate various types
 * of biases in AI systems. These are used for educational purposes to teach
 * students about how training data affects AI outputs.
 */

export interface BiasCase {
  id: string;
  title: string;
  category: 'occupation' | 'culture' | 'gender-role';
  prompt: string;
  type: 'image';
  results: string[]; // URLs for images
  discussionPrompt: string;
  learningPoint: string;
}

export interface CannedBiasData {
  [caseId: string]: BiasCase;
}

/**
 * Canned bias cases demonstrating AI biases in various contexts
 */
export const cannedBiasData: CannedBiasData = {
  case1_doctor: {
    id: 'case1_doctor',
    title: '의사 선생님',
    category: 'occupation',
    prompt: '다양한 상황의 의사',
    type: 'image',
    results: [
      '/images/bias/doctor/doctor_1.png',
      '/images/bias/doctor/doctor_2.png',
      '/images/bias/doctor/doctor_3.png',
      '/images/bias/doctor/doctor_4.png',
      '/images/bias/doctor/doctor_5.png',
      '/images/bias/doctor/doctor_6.png',
    ],
    discussionPrompt: '왜 AI는 의사를 대부분 남자로 그렸을까요?',
    learningPoint: 'AI는 인터넷의 데이터를 학습했는데, 과거에는 남자 의사 사진이 더 많았어요. 하지만 실제로는 여자 의사도 많이 있답니다!'
  },

  case2_nurse: {
    id: 'case2_nurse',
    title: '간호사',
    category: 'occupation',
    prompt: '다양한 상황의 간호사',
    type: 'image',
    results: [
      '/images/bias/nurse/nurse_1.png',
      '/images/bias/nurse/nurse_2.png',
      '/images/bias/nurse/nurse_3.png',
      '/images/bias/nurse/nurse_4.png',
      '/images/bias/nurse/nurse_5.png',
      '/images/bias/nurse/nurse_6.png',
    ],
    discussionPrompt: '간호사는 모두 여자일까요? AI는 어떻게 생각했을까요?',
    learningPoint: 'AI는 간호사를 대부분 여자로 그렸어요. 하지만 남자 간호사도 많이 있답니다. AI가 학습한 데이터에 편견이 있었던 거예요.'
  },

  case3_ceo: {
    id: 'case3_ceo',
    title: '회사 대표',
    category: 'occupation',
    prompt: '다양한 상황의 회사 대표',
    type: 'image',
    results: [
      '/images/bias/ceo/ceo_1.png',
      '/images/bias/ceo/ceo_2.png',
      '/images/bias/ceo/ceo_3.png',
      '/images/bias/ceo/ceo_4.png',
      '/images/bias/ceo/ceo_5.png',
      '/images/bias/ceo/ceo_6.png',
    ],
    discussionPrompt: 'AI가 그린 회사 대표는 어떤 모습인가요? 다양한 사람들이 보이나요?',
    learningPoint: 'AI는 회사 대표를 주로 나이 많은 남자로 그렸어요. 하지만 실제로는 젊은 대표, 여성 대표도 많이 있답니다!'
  },

  case5_engineer: {
    id: 'case5_engineer',
    title: '엔지니어',
    category: 'occupation',
    prompt: '다양한 상황의 엔지니어',
    type: 'image',
    results: [
      '/images/bias/engineer/engineer_1.png',
      '/images/bias/engineer/engineer_2.png',
      '/images/bias/engineer/engineer_3.png',
      '/images/bias/engineer/engineer_4.png',
      '/images/bias/engineer/engineer_5.png',
      '/images/bias/engineer/engineer_6.png',
    ],
    discussionPrompt: 'AI가 그린 엔지니어는 어떤 모습인가요? 다양한 사람들이 보이나요?',
    learningPoint: 'AI는 엔지니어를 주로 남자로 그렸어요. 하지만 여자 엔지니어도 많이 있고, 누구나 엔지니어가 될 수 있답니다!'
  },

  case6_teacher: {
    id: 'case6_teacher',
    title: '선생님',
    category: 'gender-role',
    prompt: '다양한 상황의 선생님',
    type: 'image',
    results: [
      '/images/bias/teacher/teacher_1.png',
      '/images/bias/teacher/teacher_2.png',
      '/images/bias/teacher/teacher_3.png',
      '/images/bias/teacher/teacher_4.png',
      '/images/bias/teacher/teacher_5.png',
      '/images/bias/teacher/teacher_6.png',
    ],
    discussionPrompt: 'AI가 그린 선생님들을 보세요. 어떤 패턴이 보이나요?',
    learningPoint: 'AI는 초등학교 선생님을 주로 여자로 그렸어요. 하지만 남자 선생님도 많이 있답니다. 누구나 훌륭한 선생님이 될 수 있어요!'
  }
};

/**
 * Get a bias case by ID
 * @param caseId - The ID of the bias case to retrieve
 * @returns The bias case if found, undefined otherwise
 */
export const getBiasCase = (caseId: string): BiasCase | undefined => {
  if (!caseId || typeof caseId !== 'string') {
    console.warn('Invalid caseId provided to getBiasCase:', caseId);
    return undefined;
  }
  
  const biasCase = cannedBiasData[caseId];
  
  if (!biasCase) {
    console.warn(`Bias case not found: ${caseId}`);
  }
  
  return biasCase;
};

/**
 * Get all bias cases
 */
export const getAllBiasCases = (): BiasCase[] => {
  return Object.values(cannedBiasData);
};

/**
 * Get bias cases by category
 */
export const getBiasCasesByCategory = (category: BiasCase['category']): BiasCase[] => {
  return Object.values(cannedBiasData).filter(biasCase => biasCase.category === category);
};