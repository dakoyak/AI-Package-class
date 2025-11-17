import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { playClickSound } from '../core/soundEffects';

interface MissionButtonProps {
  title: string;
  description: string;
  icon: string;
  targetPath: string;
  onClick?: () => void;
}

const ButtonContainer = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 300px;
  min-height: 200px;
  transition: all 0.1s ease;
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    background-color: #9DD9F3;
  }
  
  &:active {
    transform: translateY(-2px) scale(0.98);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    min-width: 400px;
    min-height: 280px;
    padding: ${({ theme }) => theme.spacing.xl};
  }
`;

const IconWrapper = styled.div`
  font-size: 64px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: 96px;
  }
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fonts.sizes.large};
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  text-align: center;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: 48px;
  }
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fonts.sizes.small};
  text-align: center;
  line-height: 1.5;
  opacity: 0.9;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: ${({ theme }) => theme.fonts.sizes.medium};
  }
`;

export const MissionButton: React.FC<MissionButtonProps> = ({
  title,
  description,
  icon,
  targetPath,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Play click sound effect
    playClickSound();

    if (onClick) {
      onClick();
    }
    navigate(targetPath);
  };

  return (
    <ButtonContainer onClick={handleClick} data-testid="mission-button">
      <IconWrapper>{icon}</IconWrapper>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </ButtonContainer>
  );
};
