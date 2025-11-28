import { createGlobalStyle } from 'styled-components';
import { useAiLiteracyFullscreen } from '../features/ai-literacy/AiLiteracyFullscreenContext';
import chalkboardBg from '../assets/칠판백그.png';

// define the styled component OUTSIDE the functional component
const StyledGlobalStyle = createGlobalStyle<{ isModuleFullscreen: boolean }>`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.primary};
    font-size: ${({ theme }) => theme.fonts.sizes.small};
    color: #f0f0f0;
    background-image: url(${chalkboardBg});
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    position: relative;
  }

  #root {
    width: 100%;
    min-height: 100vh;
    padding: 0;
  }

  h1 {
    font-size: ${({ theme }) => theme.fonts.sizes.xlarge};
    font-weight: 700;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  h2 {
    font-size: ${({ theme }) => theme.fonts.sizes.large};
    font-weight: 600;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  h3 {
    font-size: ${({ theme }) => theme.fonts.sizes.medium};
    font-weight: 600;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  p {
    font-size: ${({ theme }) => theme.fonts.sizes.small};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  button {
    font-family: ${({ theme }) => theme.fonts.primary};
    font-size: ${({ theme }) => theme.fonts.sizes.medium};
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.1s ease;
    
    &:hover {
      transform: scale(1.02);
    }
    
    &:active {
      transform: scale(0.98);
    }
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: opacity 0.2s ease;
    
    &:hover {
      opacity: 0.8;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* Optimizations for classroom TV display at 1920x1080 */
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    body {
      font-size: ${({ theme }) => theme.fonts.sizes.medium};
      /* Prevent scrolling on TV display */
    }
    
    #root {
      max-height: 100vh;
    }
    
    h1 {
      font-size: 64px;
    }
    
    h2 {
      font-size: 48px;
    }
    
    h3 {
      font-size: 36px;
    }
    
    button {
      font-size: ${({ theme }) => theme.fonts.sizes.large};
    }
  }

  /* High contrast for better visibility from distance */
  @media (prefers-contrast: high) {
    body {
      color: #000000;
    }
    
    button {
      border: 2px solid ${({ theme }) => theme.colors.text};
    }
  }
  
  /* Ensure minimum font sizes for readability */
  * {
    min-font-size: 18px;
  }
`;

export const GlobalStyle = () => {
  const { isModuleFullscreen } = useAiLiteracyFullscreen();
  return <StyledGlobalStyle isModuleFullscreen={isModuleFullscreen} />;
};
