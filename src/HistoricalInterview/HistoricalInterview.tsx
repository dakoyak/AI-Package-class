import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import './HistoricalInterview.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

type HistoricalInterviewProps = {
  onStartLesson: () => void;
  onEndLesson: () => void;
};

type ChatMessage = {
  id: number;
  sender: 'user' | 'ai';
  text: string;
};

type SejongResponse = {
  answer: string;
};

function HistoricalInterview({ onStartLesson, onEndLesson }: HistoricalInterviewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const chatLogEndRef = useRef<HTMLDivElement | null>(null);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const speakText = (text: string) => {
    const speech = new SpeechSynthesisUtterance(text);
    const setKoreanVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const koreanMaleVoice = voices.find((voice) => voice.lang === 'ko-KR' && voice.name.includes('남성'));
      const anyKoreanVoice = voices.find((voice) => voice.lang === 'ko-KR');

      speech.voice = koreanMaleVoice || anyKoreanVoice || null;
      speech.lang = 'ko-KR';
      speech.pitch = 0.9;
      speech.rate = 1.0;
    };
    setKoreanVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = setKoreanVoice;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  const getSejongResponse = async (userQuestion: string) => {
    if (!userQuestion.trim()) return;

    setIsAiThinking(true);
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: userQuestion }]);
    setInputValue('');

    try {
      const response = await fetch('http://localhost:3001/api/ask-sejong', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userQuestion }),
      });
      const data: SejongResponse = await response.json();

      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: data.answer }]);
      speakText(data.answer);
    } catch {
      const errorText = '미안하구나, 짐이 지금 생각이 많으니라.';
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: errorText }]);
      speakText(errorText);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleStartListening = () => {
    SpeechRecognition.startListening({ continuous: false, language: 'ko-KR' });
  };

  const handleSendMessage = () => {
    getSejongResponse(inputValue);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isAiThinking) {
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (!listening && transcript) {
      getSejongResponse(transcript);
      resetTranscript();
    }
  }, [listening, transcript, resetTranscript]);

  useEffect(() => {
    chatLogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    onStartLesson();
    const initialMessage = '내가 세종대왕이다. 짐에게 무엇이 궁금한가?';
    setMessages([{ id: 1, sender: 'ai', text: initialMessage }]);
    setTimeout(() => speakText(initialMessage), 500);
  }, [onStartLesson]);

  const handleEnd = () => {
    window.speechSynthesis.cancel();
    SpeechRecognition.abortListening();
    onEndLesson();
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="lesson-start-screen">
        <div className="start-screen-content">
          <h1>오류</h1>
          <p>이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-page-container historical-interview-page">
      <button className="exit-lesson-btn" onClick={handleEnd}>
        &times; 메뉴로 돌아가기
      </button>
      <div className="interview-character-zone">
        <div className="character-image-wrapper">
          <img src="/sejong.jpg" alt="AI 세종대왕" className={isAiThinking ? 'thinking' : ''} />
        </div>
        <h3 className="character-name">AI 세종대왕</h3>
        <p className="character-status">
          {listening ? '듣고 있노라...' : isAiThinking ? '생각 중이니라...' : '대화 가능'}
        </p>
      </div>
      <div className="interview-chat-log">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-bubble ${msg.sender}`}>
            <div className="message-avatar">
              {msg.sender === 'ai' ? <img src="/sejong.jpg" alt="AI 세종대왕 아바타" /> : '🎓'}
            </div>
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
        {listening && (
          <div className="message-bubble user">
            <div className="message-avatar">🎓</div>
            <div className="message-text transcript">{transcript}</div>
          </div>
        )}
        {isAiThinking && (
          <div className="message-bubble ai">
            <div className="message-text loading-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>
          </div>
        )}
        <div ref={chatLogEndRef} />
      </div>
      <footer className="interview-input-area">
        <input
          type="text"
          className="chat-input"
          placeholder="세종대왕에게 질문을 입력하세요..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isAiThinking}
        />
        <button className="send-btn" onClick={handleSendMessage} disabled={isAiThinking || !inputValue.trim()}>
          전송
        </button>
        <button className={`mic-btn ${listening ? 'listening' : ''}`} onClick={handleStartListening} disabled={isAiThinking}>
          🎤
        </button>
      </footer>
    </div>
  );
}

export default HistoricalInterview;
