import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

interface DialogueBoxProps {
  character: 'kkoma' | 'banjjak';
  text: string;
  onNext?: () => void;
  showNext?: boolean;
  onPrev?: () => void;
  showPrev?: boolean;
  isFullscreen?: boolean;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div<{ $isFullscreen?: boolean }>`
  position: relative;
  width: 100%;
  max-width: ${({ $isFullscreen }) => $isFullscreen ? '1000px' : '800px'};
  margin: 0 auto;
  animation: ${fadeIn} 0.3s ease-out;
  transition: max-width 0.3s ease;
`;

const DialogueWindow = styled.div<{ $isFullscreen?: boolean }>`
  background: white;
  border: 4px solid #2c3e50;
  border-radius: 16px;
  padding: ${({ theme, $isFullscreen }) => $isFullscreen ? theme.spacing.xl : theme.spacing.lg};
  padding-top: ${({ theme, $isFullscreen }) => $isFullscreen ? theme.spacing.xxl : theme.spacing.xl};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  position: relative;
  min-height: ${({ $isFullscreen }) => $isFullscreen ? '180px' : '120px'};
  transition: all 0.3s ease;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.md};
    padding-top: ${({ theme }) => theme.spacing.xl};
    min-height: 100px;
    border: 3px solid #2c3e50;
  }
`;

const CharacterName = styled.div<{ $character: 'kkoma' | 'banjjak'; $isFullscreen?: boolean }>`
  position: absolute;
  top: -25px;
  ${({ $character }) => $character === 'kkoma' ? 'left: 30px;' : 'right: 30px;'}
  background: ${({ $character }) => $character === 'kkoma' ? '#FFD700' : '#FF69B4'};
  color: white;
  padding: ${({ theme, $isFullscreen }) => $isFullscreen ? `${theme.spacing.md} ${theme.spacing.xl}` : `${theme.spacing.sm} ${theme.spacing.lg}`};
  border-radius: 20px;
  font-weight: 700;
  font-size: ${({ theme, $isFullscreen }) => $isFullscreen ? theme.fonts.sizes.large : theme.fonts.sizes.medium};
  border: 3px solid #2c3e50;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 2;
`;

const DialogueText = styled.p<{ $isFullscreen?: boolean }>`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme, $isFullscreen }) => $isFullscreen ? theme.fonts.sizes.xlarge : theme.fonts.sizes.large};
  line-height: ${({ $isFullscreen }) => $isFullscreen ? 2 : 1.8};
  margin: 0;
  white-space: pre-wrap;
  transition: all 0.3s ease;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.fonts.sizes.medium};
    line-height: 1.6;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: 0 ${({ theme }) => theme.spacing.sm};
  position: relative;
  z-index: 10;
`;

const StyledNavButton = styled.button<{ $type: 'prev' | 'next' }>`
  background: ${({ $type }) => $type === 'prev' ? '#95a5a6' : '#FFD700'};
  color: ${({ $type }) => $type === 'prev' ? 'white' : '#2c3e50'};
  font-size: ${({ theme }) => theme.fonts.sizes.medium};
  font-weight: 800;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: 30px;
  border: 3px solid #2c3e50;
  box-shadow: 0 4px 0 #2c3e50, 0 5px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.1s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  visibility: ${({ disabled }) => disabled ? 'hidden' : 'visible'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 #2c3e50, 0 8px 15px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #2c3e50, 0 3px 6px rgba(0, 0, 0, 0.2);
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: ${({ theme }) => theme.fonts.sizes.large};
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  }
`;

const ClickOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  cursor: pointer;
  z-index: 1;
`;

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  character,
  text,
  onNext,
  showNext = true,
  onPrev,
  showPrev = false,
  isFullscreen = false
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const characterName = character === 'kkoma' ? '꼬마루' : '반짝이';

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(typingInterval);
      }
    }, 50); // 타이핑 속도

    return () => clearInterval(typingInterval);
  }, [text]);

  const handleClick = () => {
    if (!isComplete) {
      // 타이핑 중이면 즉시 완성
      setDisplayedText(text);
      setIsComplete(true);
    } else if (onNext && showNext) {
      // 완성되었으면 다음으로
      onNext();
    }
  };

  const handlePrevClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPrev) onPrev();
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNext) onNext();
  };

  return (
    <Container $isFullscreen={isFullscreen}>
      <DialogueWindow onClick={handleClick} $isFullscreen={isFullscreen}>
        <CharacterName $character={character} $isFullscreen={isFullscreen}>
          {characterName}
        </CharacterName>
        <DialogueText $isFullscreen={isFullscreen}>{displayedText}</DialogueText>
        <ClickOverlay onClick={handleClick} />
      </DialogueWindow>

      {(showPrev || showNext) && isComplete && (
        <ButtonGroup>
          <StyledNavButton
            $type="prev"
            onClick={handlePrevClick}
            disabled={!showPrev}
            style={{ visibility: showPrev ? 'visible' : 'hidden' }}
          >
            ◀ 이전
          </StyledNavButton>

          <StyledNavButton
            $type="next"
            onClick={handleNextClick}
            disabled={!showNext}
            style={{ visibility: showNext ? 'visible' : 'hidden' }}
          >
            다음 ▶
          </StyledNavButton>
        </ButtonGroup>
      )}
    </Container>
  );
};
