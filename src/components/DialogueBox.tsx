import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

interface DialogueBoxProps {
  character: 'kkoma' | 'banjjak';
  text: string;
  onNext?: () => void;
  showNext?: boolean;
  onPrev?: () => void;
  showPrev?: boolean;
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

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  animation: ${fadeIn} 0.3s ease-out;
`;

const DialogueWindow = styled.div`
  background: white;
  border: 4px solid #2c3e50;
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  position: relative;
  min-height: 150px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.lg};
    min-height: 120px;
    border: 3px solid #2c3e50;
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    min-height: 200px;
    padding: ${({ theme }) => theme.spacing.xxl};
  }
`;

const CharacterName = styled.div<{ $character: 'kkoma' | 'banjjak' }>`
  position: absolute;
  top: -20px;
  ${({ $character }) => $character === 'kkoma' ? 'left: 30px;' : 'right: 30px;'}
  background: ${({ $character }) => $character === 'kkoma' ? '#FFD700' : '#FF69B4'};
  color: white;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: 20px;
  font-weight: 700;
  font-size: ${({ theme }) => theme.fonts.sizes.medium};
  border: 3px solid #2c3e50;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: ${({ theme }) => theme.fonts.sizes.large};
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  }
`;

const DialogueText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fonts.sizes.large};
  line-height: 1.8;
  margin: 0;
  white-space: pre-wrap;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.fonts.sizes.medium};
    line-height: 1.6;
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: ${({ theme }) => theme.fonts.sizes.xlarge};
    line-height: 2;
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
  showPrev = false
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
    <Container>
      <DialogueWindow onClick={handleClick}>
        <CharacterName $character={character}>
          {characterName}
        </CharacterName>
        <DialogueText>{displayedText}</DialogueText>
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
