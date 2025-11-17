import styled, { keyframes } from 'styled-components';

interface ResultTextboxProps {
  text: string;
  speaker?: 'alphy' | 'ai';
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  animation: ${fadeIn} 0.4s ease-out;
`;

const SpeechBubble = styled.div<{ $speaker: 'alphy' | 'ai' }>`
  position: relative;
  background-color: ${({ theme, $speaker }) => 
    $speaker === 'alphy' ? theme.colors.primary : '#FFFFFF'};
  border: 4px solid ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 800px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  /* Speech bubble tail */
  &::before {
    content: '';
    position: absolute;
    bottom: -20px;
    left: ${({ $speaker }) => $speaker === 'alphy' ? '50px' : 'auto'};
    right: ${({ $speaker }) => $speaker === 'ai' ? '50px' : 'auto'};
    width: 0;
    height: 0;
    border-left: 20px solid transparent;
    border-right: 20px solid transparent;
    border-top: 20px solid ${({ theme }) => theme.colors.text};
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -14px;
    left: ${({ $speaker }) => $speaker === 'alphy' ? '53px' : 'auto'};
    right: ${({ $speaker }) => $speaker === 'ai' ? '53px' : 'auto'};
    width: 0;
    height: 0;
    border-left: 17px solid transparent;
    border-right: 17px solid transparent;
    border-top: 17px solid ${({ theme, $speaker }) => 
      $speaker === 'alphy' ? theme.colors.primary : '#FFFFFF'};
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    max-width: 1200px;
    padding: ${({ theme }) => theme.spacing.xl};
    border-width: 5px;
  }
`;

const TextContent = styled.p`
  font-size: ${({ theme }) => theme.fonts.sizes.medium};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.8;
  margin: 0;
  white-space: pre-wrap;
  word-break: keep-all;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: ${({ theme }) => theme.fonts.sizes.large};
    line-height: 2;
  }
`;

const SpeakerLabel = styled.div<{ $speaker: 'alphy' | 'ai' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fonts.sizes.small};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  
  &::before {
    content: '${({ $speaker }) => $speaker === 'alphy' ? '🕵️' : '🤖'}';
    font-size: ${({ theme }) => theme.fonts.sizes.medium};
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: ${({ theme }) => theme.fonts.sizes.medium};
    
    &::before {
      font-size: ${({ theme }) => theme.fonts.sizes.large};
    }
  }
`;

const QuoteIcon = styled.span`
  font-size: 48px;
  color: ${({ theme }) => theme.colors.secondary};
  opacity: 0.3;
  line-height: 0;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: 64px;
  }
`;

const QuoteStart = styled(QuoteIcon)`
  position: absolute;
  top: 10px;
  left: 10px;
`;

const QuoteEnd = styled(QuoteIcon)`
  position: absolute;
  bottom: 10px;
  right: 10px;
  transform: rotate(180deg);
`;

export const ResultTextbox: React.FC<ResultTextboxProps> = ({ 
  text, 
  speaker = 'ai' 
}) => {
  const speakerName = speaker === 'alphy' ? '알피' : 'AI';

  return (
    <Container data-testid="result-textbox">
      <SpeechBubble $speaker={speaker}>
        <QuoteStart>"</QuoteStart>
        <SpeakerLabel $speaker={speaker}>
          {speakerName}
        </SpeakerLabel>
        <TextContent>{text}</TextContent>
        <QuoteEnd>"</QuoteEnd>
      </SpeechBubble>
    </Container>
  );
};
