import React from 'react';
import styled from 'styled-components';
import { useAiLiteracyFullscreen } from '../features/ai-literacy/AiLiteracyFullscreenContext';

const Button = styled.button`
  position: absolute; /* 부모 컨테이너(PageContainer)에 상대적으로 배치 */
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.7);
  border: 2px solid #2c3e50;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100; /* PageContainer 내 다른 요소 위에 표시 */
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    background: white;
  }

  &:active {
    transform: scale(0.98);
  }
  
  svg {
    width: 20px;
    height: 20px;
    fill: #2c3e50;
  }

  @media (max-width: 768px) {
    width: 35px;
    height: 35px;
    top: 10px;
    right: 10px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

export const ToggleFullscreenButton: React.FC = () => {
  const { isModuleFullscreen, toggleModuleFullscreen } = useAiLiteracyFullscreen();
  
  return (
    <Button onClick={toggleModuleFullscreen} title={isModuleFullscreen ? "화면 축소" : "화면 확대"}>
      {isModuleFullscreen ? (
        // 축소 아이콘 (Exit Fullscreen)
        <svg viewBox="0 0 24 24">
          <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
        </svg>
      ) : (
        // 확대 아이콘 (Enter Fullscreen)
        <svg viewBox="0 0 24 24">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
      )}
    </Button>
  );
};
