import styled, { keyframes } from 'styled-components';

interface CharacterSpriteProps {
  character: 'kkoma' | 'banjjak';
  emotion: 'original' | 'surprised' | 'guess' | 'excited' | 'curious' | 'disappointed' | 'annoyed' | 'bored' | 'confident' | 'discover' | 'discovery';
  position?: 'left' | 'right' | 'center';
  size?: 'small' | 'medium' | 'large';
}

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const Container = styled.div<{ $position: string; $size: string }>`
  position: ${({ $position }) => $position === 'center' ? 'relative' : 'absolute'};
  ${({ $position }) => $position === 'left' && 'left: 10%;'}
  ${({ $position }) => $position === 'right' && 'right: 10%;'}
  ${({ $position }) => $position !== 'center' && 'bottom: 0;'}
  
  animation: ${({ $position }) => 
    $position === 'left' ? slideInLeft :
    $position === 'right' ? slideInRight :
    'none'
  } 0.5s ease-out;
  
  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return 'width: 150px; height: 150px;';
      case 'large':
        return 'width: 350px; height: 350px;';
      default:
        return 'width: 250px; height: 250px;';
    }
  }}
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    ${({ $size }) => {
      switch ($size) {
        case 'small':
          return 'width: 100px; height: 100px;';
        case 'large':
          return 'width: 220px; height: 220px;';
        default:
          return 'width: 160px; height: 160px;';
      }
    }}
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    ${({ $size }) => {
      switch ($size) {
        case 'small':
          return 'width: 220px; height: 220px;';
        case 'large':
          return 'width: 450px; height: 450px;';
        default:
          return 'width: 350px; height: 350px;';
      }
    }}
  }
`;

const CharacterImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  animation: ${float} 3s ease-in-out infinite;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
`;

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({
  character,
  emotion,
  position = 'center',
  size = 'medium'
}) => {
  const imagePath = `/images/characters/${character}/${emotion}.png`;

  return (
    <Container $position={position} $size={size}>
      <CharacterImage 
        src={imagePath} 
        alt={character === 'kkoma' ? '꼬마루' : '반짝이'}
      />
    </Container>
  );
};
