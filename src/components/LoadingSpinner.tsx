import styled, { keyframes } from 'styled-components';

interface LoadingSpinnerProps {
  message?: string;
  duration?: number;
}

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const SpinnerWrapper = styled.div`
  width: 120px;
  height: 120px;
  position: relative;
  animation: ${float} 2s ease-in-out infinite;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    width: 180px;
    height: 180px;
  }
`;

const MagnifyingGlassSVG = styled.svg`
  width: 100%;
  height: 100%;
`;

const GlassCircle = styled.circle`
  animation: ${rotate} 2s linear infinite;
  transform-origin: 60px 60px;
`;

const Handle = styled.line`
  animation: ${rotate} 2s linear infinite;
  transform-origin: 60px 60px;
`;

const Sparkle = styled.circle<{ $delay: number }>`
  animation: sparkle 1.5s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  
  @keyframes sparkle {
    0%, 100% {
      opacity: 0;
      r: 2;
    }
    50% {
      opacity: 1;
      r: 4;
    }
  }
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.fonts.sizes.medium};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  font-weight: 600;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: ${({ theme }) => theme.fonts.sizes.large};
  }
`;

const Dots = styled.span`
  animation: dots 1.5s steps(4, end) infinite;
  
  @keyframes dots {
    0%, 20% {
      content: '';
    }
    40% {
      content: '.';
    }
    60% {
      content: '..';
    }
    80%, 100% {
      content: '...';
    }
  }
  
  &::after {
    content: '...';
    animation: dots 1.5s steps(4, end) infinite;
  }
`;

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = '탐색 중',
}) => {
  return (
    <Container data-testid="loading-spinner">
      <SpinnerWrapper>
        <MagnifyingGlassSVG viewBox="0 0 120 120">
          {/* Magnifying glass handle */}
          <Handle
            x1="85"
            y1="85"
            x2="110"
            y2="110"
            stroke="#FFD700"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Magnifying glass circle */}
          <GlassCircle
            cx="60"
            cy="60"
            r="35"
            fill="none"
            stroke="#FFD700"
            strokeWidth="8"
          />
          
          {/* Inner glass effect */}
          <circle
            cx="60"
            cy="60"
            r="28"
            fill="#87CEEB"
            opacity="0.2"
          />
          
          {/* Sparkles */}
          <Sparkle cx="45" cy="45" r="3" fill="#FFD700" $delay={0} />
          <Sparkle cx="75" cy="45" r="3" fill="#FFD700" $delay={0.3} />
          <Sparkle cx="60" cy="70" r="3" fill="#FFD700" $delay={0.6} />
          
          {/* Magnifying glass shine */}
          <ellipse
            cx="50"
            cy="50"
            rx="12"
            ry="18"
            fill="white"
            opacity="0.4"
            transform="rotate(-45 50 50)"
          />
        </MagnifyingGlassSVG>
      </SpinnerWrapper>
      
      <Message>
        {message}
        <Dots />
      </Message>
    </Container>
  );
};
