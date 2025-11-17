import { useCallback, useEffect, useRef, useState } from 'react';
import './SmartDiscussion.css';

const BEAR_FRAMES = {
  idle: '/images/smart-discussion/bear_4.png',
  idleAlt: '/images/smart-discussion/bear_1.png',
  talk: '/images/smart-discussion/bear_3.png',
  talkAlt: '/images/smart-discussion/bear_2.png',
  conflict: '/images/smart-discussion/bear_3.png',
  celebrate: '/images/smart-discussion/bear_5.png',
  wink: '/images/smart-discussion/bear_6.png',
};

const CONFLICT_KEYWORDS = ['싫어', '그만', '못해', '잘못', '틀려', '왜 그래', '짜증', '싸우'];

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

const formatTime = (date: Date) => {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};

export const SmartDiscussion = () => {
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date()));
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantInput, setParticipantInput] = useState('');
  const [location, setLocation] = useState('');
  const [topic, setTopic] = useState('');
  const [liveSpeech, setLiveSpeech] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [bearMessage, setBearMessage] = useState('오늘은 어떤 주제로 이야기해볼까?');
  const [bearFrame, setBearFrame] = useState(BEAR_FRAMES.idle);
  const [isBearShocked, setIsBearShocked] = useState(false);
  const [isDiscussionActive, setIsDiscussionActive] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [conflictStatus, setConflictStatus] = useState('지금은 평화로운 숲이에요');
  const [showMediation, setShowMediation] = useState(false);
  const [mediationText, setMediationText] = useState('');
  const idleIntervalRef = useRef<number | null>(null);
  const idleToggleRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const discussingRef = useRef(false);

  const scheduleTimeout = useCallback((cb: () => void, delay: number) => {
    const timeout = window.setTimeout(cb, delay);
    timeoutsRef.current.push(timeout);
  }, []);

  const clearScheduledTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const stopBearIdle = useCallback(() => {
    if (idleIntervalRef.current) {
      clearInterval(idleIntervalRef.current);
      idleIntervalRef.current = null;
    }
  }, []);

  const startBearIdle = useCallback(() => {
    stopBearIdle();
    idleIntervalRef.current = window.setInterval(() => {
      idleToggleRef.current = !idleToggleRef.current;
      setBearFrame(idleToggleRef.current ? BEAR_FRAMES.idle : BEAR_FRAMES.idleAlt);
    }, 2300);
  }, [stopBearIdle]);

  const bearTalk = useCallback(() => {
    stopBearIdle();
    setBearFrame(BEAR_FRAMES.talk);
    scheduleTimeout(() => setBearFrame(BEAR_FRAMES.talkAlt), 200);
    scheduleTimeout(() => startBearIdle(), 700);
  }, [scheduleTimeout, startBearIdle, stopBearIdle]);

  const bearConflict = useCallback(() => {
    stopBearIdle();
    setIsBearShocked(true);
    setBearFrame(BEAR_FRAMES.conflict);
    scheduleTimeout(() => {
      setIsBearShocked(false);
      startBearIdle();
    }, 600);
  }, [scheduleTimeout, startBearIdle, stopBearIdle]);

  const bearCelebrate = useCallback(() => {
    stopBearIdle();
    setBearFrame(BEAR_FRAMES.celebrate);
    scheduleTimeout(() => startBearIdle(), 800);
  }, [scheduleTimeout, startBearIdle, stopBearIdle]);

  const addLogEntry = useCallback((text: string) => {
    const now = new Date();
    const timestamp = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setLogs((prev) => [...prev, `[${timestamp}] ${text}`]);
  }, []);

  const handleConflict = useCallback(
    (text: string) => {
      bearConflict();
      setConflictStatus('조금 다투는 것 같아요…');
      setMediationText(`"${text}" 라고 말해서 조금 놀랐어요.\n서로의 의견을 다시 차분하게 들어볼까요?`);
      setShowMediation(true);
      setBearMessage('곰곰이가 잠시 중재할게요!');
    },
    [bearConflict],
  );

  const handleSpeech = useCallback(
    (text: string) => {
      setLiveSpeech(text);
      addLogEntry(text);
      bearTalk();

      const hasConflict = CONFLICT_KEYWORDS.some((keyword) => text.includes(keyword));
      if (hasConflict) {
        handleConflict(text);
      }
    },
    [addLogEntry, bearTalk, handleConflict],
  );

  useEffect(() => {
    const tick = () => setCurrentTime(formatTime(new Date()));
    const interval = window.setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    startBearIdle();
    return () => {
      stopBearIdle();
      clearScheduledTimeouts();
      recognitionRef.current?.stop();
    };
  }, [clearScheduledTimeouts, startBearIdle, stopBearIdle]);

  useEffect(() => {
    discussingRef.current = isDiscussionActive;
  }, [isDiscussionActive]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
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
      setBearMessage('친구들이 말하는 걸 듣고 있어요!');
    };
    recognition.onend = () => {
      if (discussingRef.current) {
        recognition.start();
      }
    };
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = event.results[event.resultIndex][0].transcript;
      handleSpeech(transcript);
    };

    recognitionRef.current = recognition;
    setSpeechSupported(true);

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [handleSpeech]);

  const handleAddParticipant = useCallback(() => {
    const trimmed = participantInput.trim();
    if (!trimmed) return;
    setParticipants((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setParticipantInput('');
  }, [participantInput]);

  const removeParticipant = useCallback((name: string) => {
    setParticipants((prev) => prev.filter((p) => p !== name));
  }, []);

  const handleStartDiscussion = useCallback(() => {
    if (!recognitionRef.current) {
      setBearMessage('이 브라우저에서는 음성 인식을 사용할 수 없어요.');
      return;
    }
    setLiveSpeech('');
    setLogs([]);
    setBearMessage('토론을 시작해볼까요?');
    discussingRef.current = true;
    setIsDiscussionActive(true);
    bearCelebrate();
    recognitionRef.current.start();
  }, [bearCelebrate]);

  const handleStopDiscussion = useCallback(() => {
    discussingRef.current = false;
    setIsDiscussionActive(false);
    recognitionRef.current?.stop();
    setBearMessage('오늘 토론이 끝났어요!');
    stopBearIdle();
    setBearFrame(BEAR_FRAMES.wink);
    scheduleTimeout(() => startBearIdle(), 1200);
  }, [scheduleTimeout, startBearIdle, stopBearIdle]);

  const closeMediationCard = useCallback(() => {
    setShowMediation(false);
    setConflictStatus('다시 평화로운 숲이에요');
    setBearMessage('오늘은 어떤 주제로 이야기해볼까?');
  }, []);

  return (
    <div className="sd-module sd-forest">
      <div className="sd-forest-decor">
        <div className="sd-tree sd-tree-left" />
        <div className="sd-tree sd-tree-right" />
        <div className="sd-animal sd-rabbit" />
        <div className="sd-animal sd-squirrel" />
        <div className="sd-animal sd-bird" />
      </div>

      <header className="sd-forest-header">
        <h1>숲속 곰곰이 스마트 토론 교실</h1>
        <p>숲속 친구 곰곰이와 함께 재미있게 이야기해봐요</p>
      </header>

      <div className="sd-layout">
        <section className="sd-left">
          <div className="sd-bear-area">
            <div className="sd-bear-hill" />
            <img
              src={bearFrame}
              alt="곰곰이"
              className={`sd-bear-img ${isBearShocked ? 'sd-bear-shock' : ''}`}
            />
          </div>

          <div className="sd-bear-speech">
            <div className="sd-bear-bubble">{bearMessage}</div>
          </div>

          <div className="sd-live-board">
            <h3>지금 친구들이 말한 내용</h3>
            <div className="sd-live-text">{liveSpeech || '아직 인식된 말이 없어요.'}</div>
          </div>

          <div className="sd-status-line">
            <span className="sd-status-title">곰곰이 진단</span>
            <span className={`sd-status-value ${conflictStatus.includes('다투') ? 'conflict' : ''}`}>
              {conflictStatus}
            </span>
          </div>

          <div className="sd-tip-box">
            <div className="sd-tip-title">곰곰이의 토론 약속</div>
            <ul className="sd-tip-list">
              <li>한 번에 한 명씩 말해요.</li>
              <li>친구가 말할 때 끼어들지 않아요.</li>
              <li>다른 생각은 틀린 게 아니에요.</li>
            </ul>
          </div>
        </section>

        <section className="sd-right">
          <div className="sd-panel wood-panel">
            <h3>토론 준비하기</h3>

            <div className="sd-input-group">
              <label>현재 시간</label>
              <div className="sd-time-display sd-text-input" style={{ textAlign: 'center' }}>
                {currentTime}
              </div>
            </div>

            <div className="sd-input-group">
              <label>참가자 명단</label>
              <div className="sd-tag-box">
                {participants.map((name) => (
                  <span key={name} className="sd-tag">
                    {name}
                    <button
                      type="button"
                      aria-label={`${name} 제거`}
                      className="sd-tag-remove"
                      onClick={() => removeParticipant(name)}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  value={participantInput}
                  onChange={(event) => setParticipantInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleAddParticipant();
                    }
                  }}
                  className="sd-tag-input"
                  placeholder="이름 적고 Enter"
                />
              </div>
            </div>

            <div className="sd-input-group">
              <label>토론 장소</label>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="sd-text-input"
                placeholder="예: 3학년 2반 교실"
              />
            </div>

            <div className="sd-input-group">
              <label>토론 주제</label>
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="sd-text-input"
                placeholder="예: 숙제를 언제 할까?"
              />
            </div>

            <div className="sd-btn-row">
              <button
                type="button"
                className="sd-btn sd-btn-start"
                onClick={handleStartDiscussion}
                disabled={!speechSupported && isDiscussionActive}
              >
                토론 시작
              </button>
              <button
                type="button"
                className="sd-btn sd-btn-stop"
                onClick={handleStopDiscussion}
                disabled={!isDiscussionActive}
              >
                토론 종료
              </button>
            </div>
            {!speechSupported && (
              <p className="sd-warning">⚠️ 브라우저에서 음성 인식을 지원하지 않아요. Chrome을 권장합니다.</p>
            )}

            {(location || topic) && (
              <p style={{ fontSize: 13, color: '#4c4334', marginTop: 12 }}>
                <strong>오늘의 토론</strong> — {location || '장소 미정'} · {topic || '주제를 입력해주세요'}
              </p>
            )}
          </div>

          <div className="sd-panel log-panel">
            <h3>토론 기록</h3>
            <div className="sd-log-list">{logs.length ? logs.join('\n') : '아직 기록이 없어요.'}</div>
          </div>
        </section>
      </div>

      {showMediation && (
        <div className="sd-mediation-card" role="dialog" aria-modal="true">
          <div className="sd-mediation-inner">
            <img src={BEAR_FRAMES.conflict} alt="걱정하는 곰곰이" className="sd-mediation-bear" />
            <h4>곰곰이의 중재</h4>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{mediationText}</p>
            <button type="button" className="sd-btn sd-btn-close" onClick={closeMediationCard}>
              다시 차분하게 이야기할게요
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartDiscussion;
