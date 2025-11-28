import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { DialogueBox } from '../../../components/DialogueBox';
import { CharacterSprite } from '../../../components/CharacterSprite';
import { MissionTransition } from '../../../components/MissionTransition';
import { playClickSound } from '../../../core/soundEffects';
import { ROUTES } from '../../../routes/paths';
import { ToggleFullscreenButton } from '../../../shared/ToggleFullscreenButton';
import { useAiLiteracyFullscreen } from '../AiLiteracyFullscreenContext';

const PageContainer = styled.div<{ $isModuleFullscreen: boolean }>`
  min-height: 100vh;
  background-image: url('/images/backgrounds/ai-detective-office-bg.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  
  ${({ $isModuleFullscreen }) => $isModuleFullscreen && `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999; /* 다른 요소들 위에 오도록 */
    padding: 0; /* 전체화면 시 패딩 제거 */
    overflow: auto; /* 내용이 많아지면 스크롤 가능하게 */
  `}
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.md};
    justify-content: flex-start;
    padding-top: ${({ theme }) => theme.spacing.xl};
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 0;
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h1`
  color: white;
  font-size: 48px;
  font-weight: 900;
  text-align: center;
  text-shadow: 
    4px 4px 0 #2c3e50,
    -2px -2px 0 #2c3e50,
    2px -2px 0 #2c3e50,
    -2px 2px 0 #2c3e50,
    0 4px 8px rgba(0, 0, 0, 0.5);
  margin-bottom: 0;
  margin-top: 0;
  animation: pulse 2s ease-in-out infinite;
  flex-shrink: 0;
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 32px;
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: 80px;
  }
`;

const CharactersContainer = styled.div`
  position: relative;
  width: 100%;
  height: 280px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  flex-shrink: 0;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    height: 200px;
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    height: 400px;
  }
`;

const DialogueContainer = styled.div`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const MissionSelectContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  justify-content: center;
`;

const MissionButton = styled.button<{ $color: string }>`
  background: ${({ $color }) => $color};
  color: white;
  font-size: ${({ theme }) => theme.fonts.sizes.large};
  font-weight: 700;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  border-radius: 20px;
  border: 4px solid #2c3e50;
  box-shadow: 0 8px 0 #2c3e50, 0 12px 24px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.1s ease;
  min-width: 300px;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 0 #2c3e50, 0 16px 32px rgba(0, 0, 0, 0.4);
  }
  
  &:active {
    transform: translateY(4px);
    box-shadow: 0 4px 0 #2c3e50, 0 8px 16px rgba(0, 0, 0, 0.3);
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: ${({ theme }) => theme.fonts.sizes.xlarge};
    padding: ${({ theme }) => theme.spacing.xl} 60px;
    min-width: 400px;
  }
`;

interface Dialogue {
  character: 'kkoma' | 'banjjak';
  emotion: 'original' | 'surprised' | 'guess' | 'excited' | 'curious' | 'disappointed' | 'annoyed' | 'bored' | 'confident' | 'discover' | 'discovery';
  text: string;
}

const dialogues: Dialogue[] = [
  {
    character: 'kkoma',
    emotion: 'excited',
    text: '안녕! 나는 꼬마루야! 🔍\n호기심 많고 활동적인 소년 탐정이지!'
  },
  {
    character: 'banjjak',
    emotion: 'excited',
    text: '안녕하세요! 저는 반짝이예요! ✨\n침착하고 똑똑한 소녀 탐정이랍니다!'
  },
  {
    character: 'kkoma',
    emotion: 'confident',
    text: '우리는 AI 탐정단이야!\nAI의 비밀을 함께 파헤쳐보자!'
  },
  {
    character: 'banjjak',
    emotion: 'curious',
    text: '오늘은 두 가지 중요한 미션이 있어요.\n어떤 미션을 먼저 해볼까요?'
  }
];

export const LiteracyIntroPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [showMissionSelect, setShowMissionSelect] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [selectedMission, setSelectedMission] = useState<'bias' | 'guardrail' | null>(null);
  const { isModuleFullscreen, toggleModuleFullscreen } = useAiLiteracyFullscreen();

  const handleNext = () => {
    playClickSound();
    if (currentDialogue < dialogues.length - 1) {
      setCurrentDialogue(currentDialogue + 1);
    } else {
      setShowMissionSelect(true);
    }
  };

  const handlePrev = () => {
    playClickSound();
    if (currentDialogue > 0) {
      setCurrentDialogue(currentDialogue - 1);
    }
  };

  const handleMissionSelect = (mission: 'bias' | 'guardrail') => {
    playClickSound();
    setSelectedMission(mission);
    setShowTransition(true);
  };

  const handleTransitionComplete = () => {
    if (selectedMission) {
      navigate(ROUTES.aiLiteracy.mission(selectedMission));
    }
  };

  const currentDialogueData = dialogues[currentDialogue];

  return (
    <PageContainer $isModuleFullscreen={isModuleFullscreen}>
      <Overlay />
      {showTransition && <MissionTransition onComplete={handleTransitionComplete} />}
      <ToggleFullscreenButton isExpanded={isModuleFullscreen} onClick={toggleModuleFullscreen} />
      <Content>
        <Title>AI 탐정단 본부</Title>
        
        {!showMissionSelect ? (
          <>
            <CharactersContainer>
              {currentDialogueData.character === 'kkoma' ? (
                <>
                  <CharacterSprite 
                    character="kkoma" 
                    emotion={currentDialogueData.emotion}
                    position="left"
                    size="large"
                  />
                  <CharacterSprite 
                    character="banjjak" 
                    emotion="curious"
                    position="right"
                    size="medium"
                  />
                </>
              ) : (
                <>
                  <CharacterSprite 
                    character="kkoma" 
                    emotion="guess"
                    position="left"
                    size="medium"
                  />
                  <CharacterSprite 
                    character="banjjak" 
                    emotion={currentDialogueData.emotion}
                    position="right"
                    size="large"
                  />
                </>
              )}
            </CharactersContainer>
            
            <DialogueContainer>
              <DialogueBox
                character={currentDialogueData.character}
                text={currentDialogueData.text}
                onNext={handleNext}
                showNext={true}
                onPrev={handlePrev}
                showPrev={currentDialogue > 0}
              />
            </DialogueContainer>
          </>
        ) : (
          <>
            <CharactersContainer>
              <CharacterSprite 
                character="kkoma" 
                emotion="original"
                position="left"
                size="large"
              />
              <CharacterSprite 
                character="banjjak" 
                emotion="original"
                position="right"
                size="large"
              />
            </CharactersContainer>
            
            <MissionSelectContainer>
              <MissionButton 
                $color="#FF6B6B"
                onClick={() => handleMissionSelect('bias')}
              >
                미션 1: 편견 찾기
              </MissionButton>
              <MissionButton 
                $color="#4ECDC4"
                onClick={() => handleMissionSelect('guardrail')}
              >
                미션 2: 안전장치 확인
              </MissionButton>
            </MissionSelectContainer>
          </>
        )}
      </Content>
    </PageContainer>
  );
};
