import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

interface MissionTransitionProps {
  onComplete: () => void;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const Container = styled.div<{ $isExiting: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-image: url('/images/backgrounds/mission_going.png');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: ${({ $isExiting }) => $isExiting ? fadeOut : fadeIn} 0.5s ease-out;
`;

const Message = styled.div`
  color: white;
  font-size: 64px;
  font-weight: 900;
  text-align: center;
  text-shadow: 
    4px 4px 0 #2c3e50,
    -2px -2px 0 #2c3e50,
    2px -2px 0 #2c3e50,
    -2px 2px 0 #2c3e50,
    0 8px 16px rgba(0, 0, 0, 0.5);
  animation: ${pulse} 1.5s ease-in-out infinite;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 40px;
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: 96px;
  }
`;

const LoadingDots = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Dot = styled.div<{ $delay: number }>`
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  border: 3px solid #2c3e50;
  animation: ${pulse} 1s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    width: 30px;
    height: 30px;
  }
`;

export const MissionTransition: React.FC<MissionTransitionProps> = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 2초 후 페이드아웃 시작
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2000);

    // 2.5초 후 완료
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <Container $isExiting={isExiting}>
      <Message>미션 시작!</Message>
      <LoadingDots>
        <Dot $delay={0} />
        <Dot $delay={0.2} />
        <Dot $delay={0.4} />
      </LoadingDots>
    </Container>
  );
};
