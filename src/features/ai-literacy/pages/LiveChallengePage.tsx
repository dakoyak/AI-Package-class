import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { DialogueBox } from '../../../components/DialogueBox';
import { CharacterSprite } from '../../../components/CharacterSprite';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { ResultGrid } from '../../../components/ResultGrid';
import { getBiasCase } from '../data/cannedData';
import { getGuardrailCase } from '../data/guardrailCases';
import { runGuardrailChallenge } from '../../../core/apiClient';
import { playClickSound, playResultSound, playErrorSound } from '../../../core/soundEffects';
import type { GuardrailResponse } from '../../../core/apiClient';
import type { ChallengeRouteParams } from '../../../routes/paths';
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
  position: fixed;
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
  padding-bottom: ${({ theme }) => theme.spacing.xl};
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
`;

const Title = styled.h1`
  color: white;
  font-size: 36px;
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
    font-size: 24px;
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: 64px;
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
`;

const InvestigateButton = styled.button`
  background: #4ECDC4;
  color: white;
  font-size: ${({ theme }) => theme.fonts.sizes.large};
  font-weight: 700;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  border-radius: 20px;
  border: 4px solid #2c3e50;
  box-shadow: 0 8px 0 #2c3e50, 0 12px 24px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.1s ease;
  margin: ${({ theme }) => theme.spacing.lg} 0;
  
  &:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow: 0 12px 0 #2c3e50, 0 16px 32px rgba(0, 0, 0, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(4px);
    box-shadow: 0 4px 0 #2c3e50, 0 8px 16px rgba(0, 0, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: ${({ theme }) => theme.fonts.sizes.xlarge};
    padding: ${({ theme }) => theme.spacing.xl} 60px;
  }
`;

const NextCaseButton = styled.button`
  background: #FFD700;
  color: #2c3e50;
  font-size: ${({ theme }) => theme.fonts.sizes.large};
  font-weight: 700;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  border-radius: 20px;
  border: 4px solid #2c3e50;
  box-shadow: 0 8px 0 #2c3e50, 0 12px 24px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.1s ease;
  margin-top: ${({ theme }) => theme.spacing.xl};
  
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
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  width: 100%;
`;

const SwitchMissionButton = styled.button`
  background: #6C5CE7;
  color: white;
  font-size: ${({ theme }) => theme.fonts.sizes.large};
  font-weight: 700;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  border-radius: 20px;
  border: 4px solid #2c3e50;
  box-shadow: 0 8px 0 #2c3e50, 0 12px 24px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.1s ease;
  
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
  }
`;

const ResultSection = styled.div`
  width: 100%;
  background: white;
  border: 4px solid #2c3e50;
  border-radius: 24px;
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: 0 8px 0 #2c3e50, 0 12px 24px rgba(0, 0, 0, 0.3);
  margin-top: ${({ theme }) => theme.spacing.lg};
  animation: fadeIn 0.5s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DiscussionSection = styled.div`
  width: 100%;
  background: #FFD700;
  border: 4px solid #2c3e50;
  border-radius: 24px;
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: 0 8px 0 #2c3e50, 0 12px 24px rgba(0, 0, 0, 0.3);
  margin-top: ${({ theme }) => theme.spacing.lg};
  animation: fadeIn 0.5s ease-out 0.3s both;
`;

const DiscussionTitle = styled.h3`
  color: #2c3e50;
  font-size: ${({ theme }) => theme.fonts.sizes.large};
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: ${({ theme }) => theme.fonts.sizes.xlarge};
  }
`;

const DiscussionText = styled.p`
  color: #2c3e50;
  font-size: ${({ theme }) => theme.fonts.sizes.medium};
  line-height: 1.8;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    font-size: ${({ theme }) => theme.fonts.sizes.large};
  }
`;

const LearningPoint = styled.div`
  background: white;
  border: 3px solid #2c3e50;
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing.lg};
  
  p {
    color: #2c3e50;
    font-size: ${({ theme }) => theme.fonts.sizes.medium};
    line-height: 1.8;
    margin: 0;
    
    @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
      font-size: ${({ theme }) => theme.fonts.sizes.large};
    }
  }
  
  &::before {
    content: '💡 ';
    font-size: ${({ theme }) => theme.fonts.sizes.large};
  }
`;

const RejectionDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const RejectionIcon = styled.div`
  font-size: 100px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  animation: bounce 0.6s ease-out;
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
`;

const RejectionTitle = styled.h2`
  color: #2c3e50;
  font-size: ${({ theme }) => theme.fonts.sizes.xlarge};
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const RejectionReason = styled.div`
  background: #FFE4E4;
  border: 3px solid #2c3e50;
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing.lg};
  color: #2c3e50;
  font-size: ${({ theme }) => theme.fonts.sizes.medium};
  line-height: 1.8;
  max-width: 800px;
`;

const ErrorMessage = styled.div`
  background: #FFB6C1;
  border: 3px solid #2c3e50;
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  
  p {
    color: #2c3e50;
    font-size: ${({ theme }) => theme.fonts.sizes.medium};
    font-weight: 600;
    margin: 0;
  }
`;

interface Dialogue {
  character: 'kkoma' | 'banjjak';
  emotion: 'original' | 'surprised' | 'guess' | 'excited' | 'curious' | 'disappointed' | 'annoyed' | 'bored' | 'confident' | 'discover' | 'discovery';
  text: string;
}

export const LiveChallengePage: React.FC = () => {
  const { missionType, challengeId } = useParams<ChallengeRouteParams>();
  const navigate = useNavigate();
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [showInvestigate, setShowInvestigate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardrailResponse, setGuardrailResponse] = useState<GuardrailResponse | null>(null);
  const { isModuleFullscreen, toggleModuleFullscreen } = useAiLiteracyFullscreen();

  const resolvedMissionType = missionType ?? 'bias';
  const resolvedChallengeId = challengeId ?? '';

  // Get challenge data
  const biasData =
    resolvedMissionType === 'bias' && resolvedChallengeId ? getBiasCase(resolvedChallengeId) : null;
  const guardrailData =
    resolvedMissionType === 'guardrail' && resolvedChallengeId
      ? getGuardrailCase(resolvedChallengeId)
      : null;
  const challengeData = biasData || guardrailData;

  if (!challengeData) {
    return (
      <PageContainer $isModuleFullscreen={isModuleFullscreen}>
        <Overlay />
        <ToggleFullscreenButton isExpanded={isModuleFullscreen} onClick={toggleModuleFullscreen} />
        <Content>
          <ErrorMessage>
            <p>챌린지를 찾을 수 없습니다.</p>
          </ErrorMessage>
        </Content>
      </PageContainer>
    );
  }

  const dialogues: Dialogue[] = resolvedMissionType === 'bias' ? [
    {
      character: 'kkoma',
      emotion: 'excited',
      text: `좋아! "${challengeData.title}" 조사를 시작하자! 🔍`
    },
    {
      character: 'banjjak',
      emotion: 'curious',
      text: `AI에게 "${challengeData.prompt}"를 그려달라고 할 거예요.`
    },
    {
      character: 'kkoma',
      emotion: 'confident',
      text: '준비됐어? 그럼 조사 시작 버튼을 눌러봐!'
    }
  ] : [
    {
      character: 'banjjak',
      emotion: 'excited',
      text: `"${challengeData.title}" 테스트를 시작할게요! 🛡️`
    },
    {
      character: 'kkoma',
      emotion: 'curious',
      text: `AI에게 "${challengeData.prompt}"를 요청해볼 거야!`
    },
    {
      character: 'banjjak',
      emotion: 'guess',
      text: 'AI가 어떻게 반응할지 확인해봐요!'
    }
  ];

  const handleBack = () => {
    playClickSound();
    navigate(ROUTES.aiLiteracy.mission(resolvedMissionType));
  };

  const handleNextCase = () => {
    playClickSound();
    navigate(ROUTES.aiLiteracy.mission(resolvedMissionType));
  };

  const handleSwitchMission = () => {
    playClickSound();
    if (resolvedMissionType === 'bias') {
      navigate(ROUTES.aiLiteracy.mission('guardrail'));
    } else {
      navigate(ROUTES.aiLiteracy.mission('bias'));
    }
  };

  const handleNext = () => {
    playClickSound();
    if (currentDialogue < dialogues.length - 1) {
      setCurrentDialogue(currentDialogue + 1);
    } else {
      setShowInvestigate(true);
    }
  };

  const handlePrev = () => {
    playClickSound();
    if (currentDialogue > 0) {
      setCurrentDialogue(currentDialogue - 1);
    }
  };

  const handleInvestigate = async () => {
    playClickSound();
    setIsLoading(true);
    setShowResults(false);
    setError(null);
    setGuardrailResponse(null);

    if (resolvedMissionType === 'bias' && biasData) {
      // Bias challenge: Use canned data
      setTimeout(() => {
        setIsLoading(false);
        setShowResults(true);
        playResultSound();
      }, 1500);
    } else if (resolvedMissionType === 'guardrail' && guardrailData) {
      // Guardrail challenge: Make live API call
      try {
        const response = await runGuardrailChallenge(guardrailData.prompt, guardrailData.apiType);
        setGuardrailResponse(response);
        setIsLoading(false);
        setShowResults(true);

        if (response.status === 'rejected' || response.status === 'success') {
          playResultSound();
        } else {
          playErrorSound();
        }
      } catch (err) {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        playErrorSound();
      }
    }
  };

  const currentDialogueData = dialogues[currentDialogue];
  const getKkomaEmotion = (): 'original' | 'surprised' | 'guess' | 'excited' | 'curious' | 'disappointed' | 'discover' | 'confident' => {
    if (isLoading) return 'curious';
    if (showResults && resolvedMissionType === 'bias') return 'discover';
    if (showResults && resolvedMissionType === 'guardrail' && guardrailResponse?.status === 'rejected') return 'surprised';
    if (showResults && resolvedMissionType === 'guardrail' && guardrailResponse?.status === 'success') return 'disappointed';
    if (error) return 'disappointed';
    return 'original';
  };

  const getBanjjakEmotion = (): 'original' | 'surprised' | 'guess' | 'excited' | 'curious' | 'disappointed' | 'discovery' => {
    if (isLoading) return 'curious';
    if (showResults && resolvedMissionType === 'bias') return 'discovery';
    if (showResults && resolvedMissionType === 'guardrail' && guardrailResponse?.status === 'rejected') return 'surprised';
    if (showResults && resolvedMissionType === 'guardrail' && guardrailResponse?.status === 'success') return 'disappointed';
    if (error) return 'disappointed';
    return 'original';
  };

  return (
    <PageContainer $isModuleFullscreen={isModuleFullscreen}>
      <Overlay />
      <ToggleFullscreenButton isExpanded={isModuleFullscreen} onClick={toggleModuleFullscreen} />
      <Content>
        <Header>
          <BackButton onClick={handleBack}>
            ← 돌아가기
          </BackButton>
          <Title>{challengeData.title}</Title>
          <div style={{ width: '150px' }} />
        </Header>

        {!showInvestigate && !isLoading && !showResults ? (
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
                emotion={getKkomaEmotion()}
                position="left"
                size="medium"
              />
              <CharacterSprite
                character="banjjak"
                emotion={getBanjjakEmotion()}
                position="right"
                size="medium"
              />
            </CharactersContainer>

            {!isLoading && !showResults && (
              <InvestigateButton onClick={handleInvestigate}>
                🔍 조사 시작!
              </InvestigateButton>
            )}

            {isLoading && (
              <ResultSection>
                <LoadingSpinner message="AI가 열심히 생각하고 있어요..." />
              </ResultSection>
            )}

            {error && (
              <ResultSection>
                <ErrorMessage>
                  <p>{error}</p>
                </ErrorMessage>
              </ResultSection>
            )}

            {showResults && resolvedMissionType === 'bias' && biasData && (
              <>
                <ResultSection>
                  <ResultGrid images={biasData.results} columns={3} />
                </ResultSection>

                <DiscussionSection>
                  <DiscussionTitle>🤔 함께 생각해봐요</DiscussionTitle>
                  <DiscussionText>{biasData.discussionPrompt}</DiscussionText>
                  <LearningPoint>
                    <p>{biasData.learningPoint}</p>
                  </LearningPoint>
                </DiscussionSection>

                <ButtonContainer>
                  <NextCaseButton onClick={handleNextCase} style={{ marginTop: 0 }}>
                    🔍 다른 케이스 보기
                  </NextCaseButton>
                  <SwitchMissionButton onClick={handleSwitchMission}>
                    🛡️ 미션 2 보러가기
                  </SwitchMissionButton>
                </ButtonContainer>
              </>
            )}

            {showResults && resolvedMissionType === 'guardrail' && guardrailData && guardrailResponse && (
              <>
                {guardrailResponse.status === 'rejected' ? (
                  <>
                    <ResultSection>
                      <RejectionDisplay>
                        <RejectionIcon>🛡️</RejectionIcon>
                        <RejectionTitle>AI가 요청을 거절했어요!</RejectionTitle>
                        <RejectionReason>{guardrailResponse.reason}</RejectionReason>
                      </RejectionDisplay>
                    </ResultSection>

                    <DiscussionSection>
                      <DiscussionTitle>🤔 함께 생각해봐요</DiscussionTitle>
                      <DiscussionText>{guardrailData.discussionPrompt}</DiscussionText>
                      <LearningPoint>
                        <p>{guardrailData.learningPoint}</p>
                      </LearningPoint>
                    </DiscussionSection>

                    <ButtonContainer>
                      <NextCaseButton onClick={handleNextCase} style={{ marginTop: 0 }}>
                        🛡️ 다른 케이스 보기
                      </NextCaseButton>
                      <SwitchMissionButton onClick={handleSwitchMission}>
                        🔍 미션 1 보러가기
                      </SwitchMissionButton>
                    </ButtonContainer>
                  </>
                ) : guardrailResponse.status === 'success' ? (
                  <>
                    <ResultSection>
                      {guardrailResponse.data.type === 'image' ? (
                        <ResultGrid images={[guardrailResponse.data.content]} columns={1} />
                      ) : (
                        <DiscussionText>{guardrailResponse.data.content}</DiscussionText>
                      )}
                    </ResultSection>

                    <DiscussionSection>
                      <DiscussionTitle>🤔 함께 생각해봐요</DiscussionTitle>
                      <DiscussionText>
                        이번에는 AI가 요청을 수락했어요. 왜 이 요청은 괜찮았을까요?
                      </DiscussionText>
                    </DiscussionSection>

                    <ButtonContainer>
                      <NextCaseButton onClick={handleNextCase} style={{ marginTop: 0 }}>
                        🛡️ 다른 케이스 보기
                      </NextCaseButton>
                      <SwitchMissionButton onClick={handleSwitchMission}>
                        🔍 미션 1 보러가기
                      </SwitchMissionButton>
                    </ButtonContainer>
                  </>
                ) : (
                  <ResultSection>
                    <ErrorMessage>
                      <p>{guardrailResponse.reason}</p>
                    </ErrorMessage>
                  </ResultSection>
                )}
              </>
            )}
          </>
        )}
      </Content>
    </PageContainer>
  );
};
