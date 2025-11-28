import { useCallback, useEffect, useRef, useState } from 'react';
import './SmartDiscussion.css';

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{ 0: { transcript: string } }>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
};

type Message = {
  id: number;
  speaker: 'user' | 'bear';
  text: string;
  timestamp: string;
};

const formatTime = (date: Date) => {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};

type DiscussionPoint = {
  id: number;
  text: string;
  timestamp: string;
};

export const SmartDiscussion = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isBearThinking, setIsBearThinking] = useState(false);
  const [bearMessage, setBearMessage] = useState('안녕! 나는 곰곰이야. 오늘은 무엇에 대해 이야기해볼까?');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [bearAnimation, setBearAnimation] = useState<'idle' | 'listening' | 'speaking'>('idle');
  const [userPoints, setUserPoints] = useState<DiscussionPoint[]>([]);
  const [bearPoints, setBearPoints] = useState<DiscussionPoint[]>([]);
  
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const messageIdRef = useRef(0);
  const pointIdRef = useRef(0);
  const conversationHistoryRef = useRef<Array<{ role: string; content: string }>>([]);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // 음성 합성 (TTS) 함수
  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      console.log('TTS를 지원하지 않는 브라우저입니다.');
      return;
    }

    // 이전 음성 중지
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // 사용 가능한 한국어 음성 찾기
    const voices = window.speechSynthesis.getVoices();
    const koreanVoices = voices.filter(voice => voice.lang.includes('ko'));
    
    // 선호하는 음성 순서: Google 한국어 > Microsoft > 기본
    const preferredVoice = 
      koreanVoices.find(voice => voice.name.includes('Google')) ||
      koreanVoices.find(voice => voice.name.includes('Microsoft')) ||
      koreanVoices.find(voice => voice.name.includes('Heami')) ||
      koreanVoices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log('선택된 음성:', preferredVoice.name);
    }
    
    utterance.lang = 'ko-KR';
    utterance.rate = 1.2; // 말하는 속도 (1.2배)
    utterance.pitch = 1.15; // 음높이 (곰돌이 느낌)
    utterance.volume = 1;

    utterance.onstart = () => {
      setBearAnimation('speaking');
    };

    utterance.onend = () => {
      setBearAnimation('idle');
      // 음성이 끝나면 다시 듣기 모드로 자동 전환
      if (isListening && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
            setBearAnimation('listening');
            setBearMessage('계속 이야기해줘!');
          } catch (error) {
            console.log('음성 인식 재시작 중 오류:', error);
          }
        }, 500);
      }
    };

    utterance.onerror = (event) => {
      console.error('TTS 오류:', event);
      setBearAnimation('idle');
    };

    window.speechSynthesis.speak(utterance);
  }, [isListening]);

  // 음성 인식 초기화
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // TTS 초기화 및 음성 로드
    if (window.speechSynthesis) {
      speechSynthesisRef.current = window.speechSynthesis;
      // 음성 목록 로드 (일부 브라우저에서 필요)
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('사용 가능한 한국어 음성:', voices.filter(v => v.lang.includes('ko')).map(v => v.name));
      };
    }

    type SpeechWindow = Window &
      typeof globalThis & {
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
        SpeechRecognition?: new () => SpeechRecognitionLike;
      };

    const speechWindow = window as SpeechWindow;
    const SpeechRecognitionClass = speechWindow.webkitSpeechRecognition || speechWindow.SpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsListening(true);
      setBearAnimation('listening');
      setBearMessage('잘 듣고 있어! 편하게 말해봐.');
    };

    recognition.onend = () => {
      setIsListening(false);
      if (bearAnimation === 'listening') {
        setBearAnimation('idle');
      }
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = event.results[event.resultIndex][0].transcript;
      handleUserSpeech(transcript);
    };

    recognitionRef.current = recognition;
    setSpeechSupported(true);

    return () => {
      recognition.stop();
      recognitionRef.current = null;
      // TTS 정리
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // 메시지 추가
  const addMessage = useCallback((speaker: 'user' | 'bear', text: string) => {
    const id = ++messageIdRef.current;
    const timestamp = formatTime(new Date());
    setMessages((prev) => [...prev, { id, speaker, text, timestamp }]);
  }, []);

  // 토론 포인트 추가
  const addPoint = useCallback((speaker: 'user' | 'bear', text: string) => {
    const id = ++pointIdRef.current;
    const timestamp = formatTime(new Date());
    const point = { id, text, timestamp };
    
    if (speaker === 'user') {
      setUserPoints((prev) => [...prev, point].slice(-5)); // 최근 5개만
    } else {
      setBearPoints((prev) => [...prev, point].slice(-5)); // 최근 5개만
    }
  }, []);

  // 사용자 발화 처리
  const handleUserSpeech = useCallback(async (text: string) => {
    console.log('사용자 발화:', text);
    addMessage('user', text);
    
    // 음성 인식 일시 중지 (곰돌이가 말하는 동안)
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // 곰돌이 생각 중
    setIsBearThinking(true);
    setBearAnimation('idle');
    setBearMessage('음... 곰곰이 생각 중...');

    // 대화 히스토리에 추가
    conversationHistoryRef.current.push({
      role: 'user',
      content: text,
    });

    try {
      // 사용자 포인트 추가
      addPoint('user', text);

      // AI 응답 요청
      const response = await fetch('http://localhost:5001/api/discussion/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: conversationHistoryRef.current,
        }),
      });

      const data = await response.json();

      if (data.status === 'success' && data.reply) {
        // 곰돌이 응답
        addMessage('bear', data.reply);
        setBearMessage(data.reply);
        
        // 곰돌이 포인트 추가
        addPoint('bear', data.reply);
        
        // 대화 히스토리에 추가
        conversationHistoryRef.current.push({
          role: 'assistant',
          content: data.reply,
        });

        // 음성으로 읽어주기
        speakText(data.reply);
      } else {
        const errorMsg = '미안해, 잘 못 들었어. 다시 말해줄래?';
        setBearMessage(errorMsg);
        setBearAnimation('idle');
        speakText(errorMsg);
      }
    } catch (error) {
      console.error('AI 응답 오류:', error);
      const errorMsg = '앗, 잠깐 생각이 안 나... 다시 말해줄래?';
      setBearMessage(errorMsg);
      setBearAnimation('idle');
      speakText(errorMsg);
    } finally {
      setIsBearThinking(false);
    }
  }, [addMessage, addPoint, speakText]);

  // 말하기 시작
  const handleStartListening = useCallback(() => {
    if (!recognitionRef.current || !speechSupported) {
      alert('음성 인식을 사용할 수 없어요. Chrome 브라우저를 사용해주세요.');
      return;
    }

    try {
      recognitionRef.current.start();
      setBearMessage('잘 듣고 있어! 편하게 말해봐.');
    } catch (error) {
      console.error('음성 인식 시작 실패:', error);
    }
  }, [speechSupported]);

  // 작별 인사 (느린 속도)
  const speakGoodbye = useCallback((text: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    const koreanVoices = voices.filter(voice => voice.lang.includes('ko'));
    const preferredVoice = 
      koreanVoices.find(voice => voice.name.includes('Google')) ||
      koreanVoices.find(voice => voice.name.includes('Microsoft')) ||
      koreanVoices.find(voice => voice.name.includes('Heami')) ||
      koreanVoices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.lang = 'ko-KR';
    utterance.rate = 0.85; // 느리게
    utterance.pitch = 1.15;
    utterance.volume = 1;

    utterance.onstart = () => {
      setBearAnimation('speaking');
    };

    utterance.onend = () => {
      setBearAnimation('idle');
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // 말하기 중지 (대화 종료)
  const handleStopListening = useCallback(() => {
    // 음성 인식 중지
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    
    // TTS 중지
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    setBearAnimation('idle');
    const goodbyeMsg = '오늘 이야기 재미있었어! 또 만나자!';
    setBearMessage(goodbyeMsg);
    speakGoodbye(goodbyeMsg);
  }, [speakGoodbye]);

  // 대화 초기화
  const handleReset = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    // TTS 중지
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setMessages([]);
    setUserPoints([]);
    setBearPoints([]);
    setIsListening(false);
    setIsBearThinking(false);
    setBearAnimation('idle');
    setBearMessage('안녕! 나는 곰곰이야. 오늘은 무엇에 대해 이야기해볼까?');
    conversationHistoryRef.current = [];
    messageIdRef.current = 0;
    pointIdRef.current = 0;
  }, [isListening]);



  const userMessages = messages.filter((m) => m.speaker === 'user');
  const bearMessages = messages.filter((m) => m.speaker === 'bear');

  return (
    <div className="forest-chat">
      {/* 헤더 */}
      <header className="forest-header">
        <h1>곰곰이와 함께하는 토론 교실</h1>
      </header>

      {/* 메인 레이아웃 */}
      <div className="forest-layout">
        {/* 왼쪽: 내 토론 포인트 */}
        <section className="points-panel user-points">
          <h3>💭 내 의견</h3>
          <div className="points-list">
            {userPoints.length === 0 ? (
              <div className="empty-points">아직 발언이 없어요</div>
            ) : (
              userPoints.map((point) => (
                <div key={point.id} className="point-card user-card">
                  <div className="point-time">{point.timestamp}</div>
                  <div className="point-text">{point.text}</div>
                </div>
              ))
            )}
          </div>
        </section>
        <section className="bear-center">
          <div className={`bear-container ${bearAnimation}`}>
            <div className="bear-character">
              <div className="bear-face">🐻</div>
              {isBearThinking && (
                <div className="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bear-speech-bubble">
            <p>{bearMessage}</p>
          </div>

          <div className="control-buttons">
            <button
              className={`btn btn-speak ${isListening ? 'active' : ''}`}
              onClick={handleStartListening}
              disabled={isListening || isBearThinking || !speechSupported}
            >
              🎤 {isListening ? '듣는 중...' : '말하기'}
            </button>
            <button
              className="btn btn-stop"
              onClick={handleStopListening}
              disabled={!isListening}
            >
              ⏹️ 멈추기
            </button>
            <button
              className="btn btn-reset"
              onClick={handleReset}
              disabled={isListening || isBearThinking}
            >
              🔄 다시 시작
            </button>
          </div>

          {!speechSupported && (
            <p className="warning-text">
              ⚠️ 음성 인식을 사용할 수 없어요. Chrome 브라우저를 사용해주세요.
            </p>
          )}
        </section>

        {/* 오른쪽: 곰곰이 토론 포인트 */}
        <section className="points-panel bear-points">
          <h3>🐻 곰돌이 의견</h3>
          <div className="points-list">
            {bearPoints.length === 0 ? (
              <div className="empty-points">곰곰이가 아직 말하지 않았어요</div>
            ) : (
              bearPoints.map((point) => (
                <div key={point.id} className="point-card bear-card">
                  <div className="point-time">{point.timestamp}</div>
                  <div className="point-text">{point.text}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SmartDiscussion;
