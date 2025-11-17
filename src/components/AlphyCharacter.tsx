import styled from 'styled-components';
import { useState, useEffect } from 'react';

interface AlphyCharacterProps {
  state: 'idle' | 'thinking' | 'surprised' | 'shielding';
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = {
  small: '120px',
  medium: '200px',
  large: '300px',
};

const Container = styled.div<{ $size: string }>`
  width: ${(props) => props.$size};
  height: ${(props) => props.$size};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const SVGWrapper = styled.svg`
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease-in-out;
`;

const ThinkingAnimation = styled.g`
  animation: float 2s ease-in-out infinite;
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

const MagnifyingGlass = styled.g`
  animation: rotate 2s linear infinite;
  transform-origin: center;
  
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const ShieldPulse = styled.g`
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.05);
    }
  }
`;

const SurprisedEyes = styled.g`
  animation: blink 3s ease-in-out infinite;
  
  @keyframes blink {
    0%, 90%, 100% {
      transform: scaleY(1);
    }
    95% {
      transform: scaleY(0.1);
    }
  }
`;

export const AlphyCharacter: React.FC<AlphyCharacterProps> = ({ 
  state, 
  size = 'medium' 
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [state]);

  const renderCharacter = () => {
    const baseCharacter = (
      <>
        {/* Body */}
        <ellipse
          cx="100"
          cy="120"
          rx="60"
          ry="70"
          fill="#87CEEB"
          stroke="#333"
          strokeWidth="3"
        />
        
        {/* Head */}
        <circle
          cx="100"
          cy="70"
          r="45"
          fill="#87CEEB"
          stroke="#333"
          strokeWidth="3"
        />
        
        {/* Detective Hat */}
        <g>
          <ellipse
            cx="100"
            cy="35"
            rx="50"
            ry="8"
            fill="#FFD700"
            stroke="#333"
            strokeWidth="2"
          />
          <path
            d="M 70 35 Q 100 15 130 35"
            fill="#FFD700"
            stroke="#333"
            strokeWidth="2"
          />
          <rect
            x="85"
            y="20"
            width="30"
            height="15"
            fill="#FFD700"
            stroke="#333"
            strokeWidth="2"
          />
        </g>
      </>
    );

    switch (state) {
      case 'idle':
        return (
          <g>
            {baseCharacter}
            {/* Eyes */}
            <circle cx="85" cy="65" r="6" fill="#333" />
            <circle cx="115" cy="65" r="6" fill="#333" />
            {/* Smile */}
            <path
              d="M 80 80 Q 100 90 120 80"
              stroke="#333"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        );

      case 'thinking':
        return (
          <ThinkingAnimation>
            {baseCharacter}
            {/* Eyes looking up */}
            <circle cx="85" cy="60" r="6" fill="#333" />
            <circle cx="115" cy="60" r="6" fill="#333" />
            {/* Thoughtful mouth */}
            <line
              x1="85"
              y1="82"
              x2="115"
              y2="82"
              stroke="#333"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Magnifying glass */}
            <MagnifyingGlass transform="translate(140, 60)">
              <circle
                cx="0"
                cy="0"
                r="20"
                fill="none"
                stroke="#FFD700"
                strokeWidth="4"
              />
              <line
                x1="15"
                y1="15"
                x2="30"
                y2="30"
                stroke="#FFD700"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="0" cy="0" r="12" fill="#87CEEB" opacity="0.3" />
            </MagnifyingGlass>
          </ThinkingAnimation>
        );

      case 'surprised':
        return (
          <g>
            {baseCharacter}
            {/* Wide eyes */}
            <SurprisedEyes>
              <circle cx="85" cy="65" r="10" fill="none" stroke="#333" strokeWidth="3" />
              <circle cx="85" cy="65" r="5" fill="#333" />
              <circle cx="115" cy="65" r="10" fill="none" stroke="#333" strokeWidth="3" />
              <circle cx="115" cy="65" r="5" fill="#333" />
            </SurprisedEyes>
            {/* Open mouth */}
            <ellipse
              cx="100"
              cy="85"
              rx="12"
              ry="15"
              fill="#333"
            />
            {/* Exclamation marks */}
            <g>
              <text x="140" y="50" fontSize="30" fill="#FFD700" fontWeight="bold">!</text>
              <text x="40" y="50" fontSize="30" fill="#FFD700" fontWeight="bold">!</text>
            </g>
          </g>
        );

      case 'shielding':
        return (
          <g>
            {baseCharacter}
            {/* Determined eyes */}
            <circle cx="85" cy="65" r="6" fill="#333" />
            <circle cx="115" cy="65" r="6" fill="#333" />
            {/* Serious mouth */}
            <line
              x1="85"
              y1="82"
              x2="115"
              y2="82"
              stroke="#333"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Shield */}
            <ShieldPulse transform="translate(140, 100)">
              <path
                d="M 0 -30 L 20 -20 L 20 10 Q 20 25 0 35 Q -20 25 -20 10 L -20 -20 Z"
                fill="#90EE90"
                stroke="#333"
                strokeWidth="3"
              />
              <path
                d="M 0 -25 L 15 -17 L 15 8 Q 15 20 0 28 Q -15 20 -15 8 L -15 -17 Z"
                fill="#FFFFFF"
                opacity="0.5"
              />
              <text
                x="-8"
                y="5"
                fontSize="20"
                fill="#333"
                fontWeight="bold"
              >
                ✓
              </text>
            </ShieldPulse>
          </g>
        );

      default:
        return baseCharacter;
    }
  };

  return (
    <Container $size={sizeMap[size]} data-testid="alphy-character">
      <SVGWrapper
        viewBox="0 0 200 200"
        style={{
          transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
        }}
      >
        {renderCharacter()}
      </SVGWrapper>
    </Container>
  );
};
