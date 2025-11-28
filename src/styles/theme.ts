export const theme = {
  colors: {
    primary: '#87CEEB',      // Sky blue
    secondary: '#FFD700',    // Yellow
    background: '#FFFFFF',   // White
    text: '#1a1a1a',         // Darker gray for better contrast (was #333333)
    success: '#90EE90',      // Light green
    error: '#FFB6C1',        // Light red
    alphy: {
      body: '#87CEEB',
      hat: '#FFD700',
      eyes: '#1a1a1a'        // Darker for better contrast
    },
    // Chalkboard UI Theme
    chalkboard: {
      noticeBar: '#1e3a5f',  // 공지사항 네이비
      postit: '#f5f5dc',     // 포스트잇 베이지
      bodyBg: '#e8e8e8',     // Body 배경
      logout: '#dc3545',     // 로그아웃 빨강
      chalkWhite: '#f0f0f0', // 분필 흰색
    }
  },
  fonts: {
    primary: "'Noto Sans KR', sans-serif",
    sizes: {
      small: '18px',
      medium: '24px',
      large: '32px',
      xlarge: '48px'
    }
  },
  spacing: {
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px',
    xxl: '64px'
  },
  borderRadius: {
    small: '8px',
    medium: '16px',
    large: '24px'
  },
  breakpoints: {
    tablet: '768px',
    desktop: '1024px',
    tv: '1920px'
  }
};

export type Theme = typeof theme;
