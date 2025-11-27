import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { DialogueBox } from '../../../components/DialogueBox';
import { CharacterSprite } from '../../../components/CharacterSprite';
import { playClickSound } from '../../../core/soundEffects';
import { getAllBiasCases } from '../data/cannedData';
import { getAllGuardrailCases } from '../data/guardrailCases';
import type { MissionRouteParams } from '../../../routes/paths';
import { ROUTES } from '../../../routes/paths';
import { ToggleFullscreenButton } from '../../../shared/ToggleFullscreenButton';
import { useAiLiteracyFullscreen } from '../AiLiteracyFullscreenContext';

const PageContainer = styled.div<{ $isModuleFullscreen: boolean }>`
  min-height: 100vh;
  background-image: url('/images/backgrounds/mission-hub-bg.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
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
    z-index: 999;
    padding: 0;
    overflow: auto;
  `}
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.md};
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
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const BackButton = styled.button`
  background: #FFD700;
  color: #2c3e50;
  font-size: ${({ theme }) => theme.fonts.sizes.medium};
  font-weight: 700;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: 16px;
  border: 3px solid #2c3e50;
  box-shadow: 0 6px 0 #2c3e50, 0 8px 16px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.1s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 0 #2c3e50, 0 10px 20px rgba(0, 0, 0, 0.4);
  }
  
  &:active {
    transform: translateY(2px);
    box-shadow: 0 4px 0 #2c3e50, 0 6px 12px rgba(0, 0, 0, 0.3);
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: ${({ theme }) => theme.fonts.sizes.large};
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  }
`;

const Title = styled.h1`
  color: white;
  font-size: 40px;
  font-weight: 900;
  text-align: center;
  text-shadow: 
    4px 4px 0 #2c3e50,
    -2px -2px 0 #2c3e50,
    2px -2px 0 #2c3e50,
    -2px 2px 0 #2c3e50,
    0 4px 8px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 28px;
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: 72px;
  }
`;

const CharactersContainer = styled.div`
  position: relative;
  width: 100%;
  height: 250px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  flex-shrink: 0;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    height: 180px;
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    height: 350px;
  }
`;

const DialogueContainer = styled.div`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ChallengeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: ${({ theme }) => theme.spacing.md};
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: ${({ theme }) => theme.spacing.xl};
  }
`;

const ChallengeCard = styled.button`
  background: white;
  border: 4px solid #2c3e50;
  border-radius: 20px;
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: 0 6px 0 #2c3e50, 0 8px 16px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.1s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: 160px;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 0 #2c3e50, 0 12px 24px rgba(0, 0, 0, 0.4);
  }
  
  &:active {
    transform: translateY(2px);
    box-shadow: 0 4px 0 #2c3e50, 0 6px 12px rgba(0, 0, 0, 0.3);
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    padding: ${({ theme }) => theme.spacing.xl};
    min-height: 200px;
  }
`;

const ChallengeIcon = styled.div`
  font-size: 56px;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: 80px;
  }
`;

const ChallengeTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fonts.sizes.medium};
  font-weight: 700;
  text-align: center;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: ${({ theme }) => theme.fonts.sizes.large};
  }
`;

const ChallengeDescription = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fonts.sizes.small};
  text-align: center;
  opacity: 0.7;
  line-height: 1.5;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: ${({ theme }) => theme.fonts.sizes.medium};
  }
`;

interface Dialogue {
  character: 'kkoma' | 'banjjak';
  emotion: 'original' | 'surprised' | 'guess' | 'excited' | 'curious' | 'disappointed' | 'annoyed' | 'bored' | 'confident' | 'discover' | 'discovery';
  text: string;
}

const biasDialogues: Dialogue[] = [
  {
    character: 'kkoma',
    emotion: 'excited',
    text: '미션 1: 편견 찾기에 온 걸 환영해! 🔍\nAI가 가진 편견을 함께 찾아보자!'
  },
  {
    character: 'banjjak',
    emotion: 'guess',
    text: 'AI는 인터넷의 데이터를 학습했어요.\n그래서 데이터에 있던 편견도 함께 배웠답니다.'
  },
  {
    character: 'kkoma',
    emotion: 'confident',
    text: '아래에서 조사하고 싶은 직업을 선택해봐!\n어떤 편견이 숨어있을까?'
  }
];

const guardrailDialogues: Dialogue[] = [
  {
    character: 'banjjak',
    emotion: 'excited',
    text: '미션 2: 안전장치 확인에 온 걸 환영해요! 🛡️\nAI의 안전장치를 함께 확인해봐요!'
  },
  {
    character: 'kkoma',
    emotion: 'confident',
    text: 'AI는 나쁜 일에 사용되지 않도록\n안전장치가 있어!'
  },
  {
    character: 'banjjak',
    emotion: 'curious',
    text: '아래에서 테스트하고 싶은 항목을 선택하세요.\nAI가 어떻게 반응할까요?'
  }
];

const challengeIcons: { [key: string]: string } = {
  // Bias challenges
  case1_doctor: '👨‍⚕️',
  case2_nurse: '👩‍⚕️',
  case3_ceo: '💼',
  case5_engineer: '👨‍💻',
  case6_teacher: '👨‍🏫',
  // Guardrail challenges
  case1_copyright: '©️',
  case2_violence: '⚠️',
  case3_illegal: '🚫',
  case4_celebrity: '🌟',
  case5_dangerous_instructions: '💣',
  case6_hate_speech: '🚷'
};

export const MissionHubPage: React.FC = () => {
  const { missionType } = useParams<MissionRouteParams>();
  const resolvedMissionType = missionType ?? 'bias';
  const navigate = useNavigate();
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [showChallenges, setShowChallenges] = useState(false);
  const { isModuleFullscreen, toggleModuleFullscreen } = useAiLiteracyFullscreen();

  const isBiasMission = resolvedMissionType === 'bias';
  const dialogues = isBiasMission ? biasDialogues : guardrailDialogues;
  
  // Get actual challenges from data
  const challenges = isBiasMission 
    ? getAllBiasCases().map(c => ({
        id: c.id,
        title: c.title,
        icon: challengeIcons[c.id] || '🔍',
        description: c.prompt
      }))
    : getAllGuardrailCases().map(c => ({
        id: c.id,
        title: c.title,
        icon: challengeIcons[c.id] || '🛡️',
        description: c.prompt
      }));

  const handleBack = () => {
    playClickSound();
    navigate(ROUTES.home);
  };

  const handleNext = () => {
    playClickSound();
    if (currentDialogue < dialogues.length - 1) {
      setCurrentDialogue(currentDialogue + 1);
    } else {
      setShowChallenges(true);
    }
  };

  const handlePrev = () => {
    playClickSound();
    if (currentDialogue > 0) {
      setCurrentDialogue(currentDialogue - 1);
    }
  };

  const handleChallengeClick = (challengeId: string) => {
    playClickSound();
    navigate(ROUTES.aiLiteracy.challenge(resolvedMissionType, challengeId));
  };

  const currentDialogueData = dialogues[currentDialogue];

  return (
    <PageContainer $isModuleFullscreen={isModuleFullscreen}>
      <Overlay />
      <ToggleFullscreenButton isExpanded={isModuleFullscreen} onClick={toggleModuleFullscreen} />
      <Content>
        <Header>
          <BackButton onClick={handleBack}>
            ← 돌아가기
          </BackButton>
          <Title>
            {isBiasMission ? '미션 1: 편견 찾기' : '미션 2: 안전장치 확인'}
          </Title>
          <div style={{ width: '150px' }} />
        </Header>

        {!showChallenges ? (
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
                    emotion="guess"
                    position="right"
                    size="medium"
                  />
                </>
              ) : (
                <>
                  <CharacterSprite 
                    character="kkoma" 
                    emotion="curious"
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
                size="medium"
              />
              <CharacterSprite 
                character="banjjak" 
                emotion="original"
                position="right"
                size="medium"
              />
            </CharactersContainer>
            
            <ChallengeGrid>
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  onClick={() => handleChallengeClick(challenge.id)}
                >
                  <ChallengeIcon>{challenge.icon}</ChallengeIcon>
                  <ChallengeTitle>{challenge.title}</ChallengeTitle>
                  <ChallengeDescription>{challenge.description}</ChallengeDescription>
                </ChallengeCard>
              ))}
            </ChallengeGrid>
          </>
        )}
      </Content>
    </PageContainer>
  );
};