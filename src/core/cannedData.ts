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
  type: 'image' | 'text';
  results: string[]; // URLs for images or text content
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
    prompt: 'A doctor in a hospital',
    type: 'image',
    results: [
      '/images/bias/doctor/Gemini_Generated_Image_1kqacp1kqacp1kqa.png',
      '/images/bias/doctor/Gemini_Generated_Image_2e35552e35552e35.png',
      '/images/bias/doctor/Gemini_Generated_Image_3fc0og3fc0og3fc0.png',
      '/images/bias/doctor/Gemini_Generated_Image_54gkv154gkv154gk.png',
      '/images/bias/doctor/Gemini_Generated_Image_hcxhhphcxhhphcxh.png',
      '/images/bias/doctor/Gemini_Generated_Image_upp7wdupp7wdupp7.png',
    ],
    discussionPrompt: '왜 AI는 의사를 대부분 남자로 그렸을까요?',
    learningPoint: 'AI는 인터넷의 데이터를 학습했는데, 과거에는 남자 의사 사진이 더 많았어요. 하지만 실제로는 여자 의사도 많이 있답니다!'
  },

  case2_nurse: {
    id: 'case2_nurse',
    title: '간호사',
    category: 'occupation',
    prompt: 'A nurse taking care of patients',
    type: 'image',
    results: [
      '/images/bias/nurse/Gemini_Generated_Image_4zfgtp4zfgtp4zfg.png',
      '/images/bias/nurse/Gemini_Generated_Image_e4d1yee4d1yee4d1.png',
      '/images/bias/nurse/Gemini_Generated_Image_hur4z6hur4z6hur4.png',
      '/images/bias/nurse/Gemini_Generated_Image_maqy0fmaqy0fmaqy.png',
      '/images/bias/nurse/Gemini_Generated_Image_sbzl4qsbzl4qsbzl.png',
      '/images/bias/nurse/Gemini_Generated_Image_txq0bqtxq0bqtxq0.png',
    ],
    discussionPrompt: '간호사는 모두 여자일까요? AI는 어떻게 생각했을까요?',
    learningPoint: 'AI는 간호사를 대부분 여자로 그렸어요. 하지만 남자 간호사도 많이 있답니다. AI가 학습한 데이터에 편견이 있었던 거예요.'
  },

  case3_ceo: {
    id: 'case3_ceo',
    title: '회사 대표',
    category: 'occupation',
    prompt: 'A CEO in an office',
    type: 'image',
    results: [
      '/images/canned/ceo_1.svg',
      '/images/canned/ceo_2.svg',
      '/images/canned/ceo_3.svg',
      '/images/canned/ceo_4.svg',
      '/images/canned/ceo_5.svg',
      '/images/canned/ceo_6.svg',
    ],
    discussionPrompt: 'AI가 그린 회사 대표는 어떤 모습인가요? 다양한 사람들이 보이나요?',
    learningPoint: 'AI는 회사 대표를 주로 나이 많은 남자로 그렸어요. 하지만 실제로는 젊은 대표, 여성 대표도 많이 있답니다!'
  },

  case4_family: {
    id: 'case4_family',
    title: '가족 사진',
    category: 'culture',
    prompt: 'A happy family',
    type: 'image',
    results: [
      '/images/canned/family_1.svg',
      '/images/canned/family_2.svg',
      '/images/canned/family_3.svg',
      '/images/canned/family_4.svg',
      '/images/canned/family_5.svg',
      '/images/canned/family_6.svg',
    ],
    discussionPrompt: 'AI가 그린 가족들은 모두 비슷해 보이나요? 어떤 점이 비슷한가요?',
    learningPoint: 'AI는 가족을 그릴 때 특정 인종이나 문화의 가족을 더 많이 그렸어요. 세상에는 다양한 모습의 가족이 있는데 말이에요!'
  },

  case5_beauty: {
    id: 'case5_beauty',
    title: '아름다운 사람',
    category: 'culture',
    prompt: 'A beautiful person',
    type: 'image',
    results: [
      '/images/canned/beauty_1.svg',
      '/images/canned/beauty_2.svg',
      '/images/canned/beauty_3.svg',
      '/images/canned/beauty_4.svg',
      '/images/canned/beauty_5.svg',
      '/images/canned/beauty_6.svg',
    ],
    discussionPrompt: 'AI가 생각하는 "아름다운 사람"은 어떤 모습인가요? 모두 비슷한가요?',
    learningPoint: 'AI는 특정한 외모를 "아름답다"고 학습했어요. 하지만 아름다움은 사람마다 다르고, 모든 사람은 각자의 아름다움이 있답니다!'
  },

  case6_cooking: {
    id: 'case6_cooking',
    title: '요리하는 사람',
    category: 'gender-role',
    prompt: 'A person cooking in the kitchen',
    type: 'image',
    results: [
      '/images/canned/cooking_1.svg',
      '/images/canned/cooking_2.svg',
      '/images/canned/cooking_3.svg',
      '/images/canned/cooking_4.svg',
      '/images/canned/cooking_5.svg',
      '/images/canned/cooking_6.svg',
    ],
    discussionPrompt: '요리하는 사람은 주로 누구인가요? AI는 어떻게 생각했을까요?',
    learningPoint: 'AI는 요리하는 사람을 주로 여자로 그렸어요. 하지만 남자도 여자도 모두 요리를 할 수 있답니다. 이것도 AI의 편견이에요!'
  },

  case7_engineer: {
    id: 'case7_engineer',
    title: '엔지니어',
    category: 'occupation',
    prompt: 'A software engineer working on a computer',
    type: 'image',
    results: [
      '/images/canned/engineer_1.svg',
      '/images/canned/engineer_2.svg',
      '/images/canned/engineer_3.svg',
      '/images/canned/engineer_4.svg',
      '/images/canned/engineer_5.svg',
      '/images/canned/engineer_6.svg',
    ],
    discussionPrompt: 'AI가 그린 엔지니어는 어떤 모습인가요? 다양한 사람들이 보이나요?',
    learningPoint: 'AI는 엔지니어를 주로 남자로 그렸어요. 하지만 여자 엔지니어도 많이 있고, 누구나 엔지니어가 될 수 있답니다!'
  },

  case8_teacher: {
    id: 'case8_teacher',
    title: '선생님',
    category: 'gender-role',
    prompt: 'A teacher in a classroom',
    type: 'image',
    results: [
      '/images/bias/teacher/Gemini_Generated_Image_daa5c2daa5c2daa5.png',
      '/images/bias/teacher/Gemini_Generated_Image_gvkybagvkybagvky.png',
      '/images/bias/teacher/Gemini_Generated_Image_i0csp4i0csp4i0cs.png',
      '/images/bias/teacher/Gemini_Generated_Image_rt8sddrt8sddrt8s.png',
      '/images/bias/teacher/Gemini_Generated_Image_u2kjtmu2kjtmu2kj.png',
      '/images/bias/teacher/Gemini_Generated_Image_ugrwxvugrwxvugrw.png',
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
