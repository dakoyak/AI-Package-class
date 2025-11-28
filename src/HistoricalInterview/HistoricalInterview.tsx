import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import "./HistoricalInterview.css";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

type HistoricalInterviewProps = {
  onStartLesson: () => void;
  onEndLesson: () => void;
};

type ChatMessage = {
  id: number;
  sender: "user" | "ai";
  text: string;
};

type SejongResponse = {
  answer: string;
};

function HistoricalInterview({
  onStartLesson,
  onEndLesson,
}: HistoricalInterviewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [userInteracted, setUserInteracted] = useState(false);
  const [showStartButton, setShowStartButton] = useState(true);
  const chatLogEndRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const speakText = async (text: string) => {
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Stop previous audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const response = await fetch(`${apiUrl}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("TTS request failed");

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      await audio.play();
    } catch (error) {
      console.error("TTS Error:", error);
      // Fallback to browser TTS if backend fails
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = "ko-KR";
      window.speechSynthesis.speak(speech);
    }
  };

  const getSejongResponse = async (userQuestion: string) => {
    if (!userQuestion.trim()) return;

    setIsAiThinking(true);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: userQuestion },
    ]);
    setInputValue("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const response = await fetch(`${apiUrl}/api/ask-sejong`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQuestion }),
      });
      const data: SejongResponse = await response.json();

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "ai", text: data.answer },
      ]);
      speakText(data.answer);
    } catch {
      const errorText = "미안하구나, 짐이 지금 생각이 많으니라.";
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "ai", text: errorText },
      ]);
      speakText(errorText);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleStartListening = () => {
    setUserInteracted(true);
    SpeechRecognition.startListening({ continuous: false, language: "ko-KR" });
  };

  const handleSendMessage = () => {
    setUserInteracted(true);
    getSejongResponse(inputValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isAiThinking) {
      e.preventDefault();
      setUserInteracted(true);
      getSejongResponse(inputValue);
    }
  };

  useEffect(() => {
    if (!listening && transcript) {
      getSejongResponse(transcript);
      resetTranscript();
    }
  }, [listening, transcript, resetTranscript]);

  useEffect(() => {
    chatLogEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartInterview = () => {
    setUserInteracted(true);
    setShowStartButton(false);
    const initialMessage = "내가 세종대왕이다. 짐에게 무엇이 궁금한가?";
    setMessages([{ id: 1, sender: "ai", text: initialMessage }]);
    speakText(initialMessage);
  };

  useEffect(() => {
    onStartLesson();
  }, [onStartLesson]);

  const handleEnd = () => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    SpeechRecognition.abortListening();
    onEndLesson();
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="lesson-start-screen">
        <div className="start-screen-content">
          <h1>오류</h1>
          <p>
            이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를
            사용해주세요.
          </p>
        </div>
      </div>
    );
  }

  if (showStartButton) {
    return (
      <div className="interview-page-container historical-interview-page">
        <div className="lesson-start-screen">
          <div className="start-screen-content">
            <div
              className="character-image-wrapper"
              style={{ width: "200px", height: "200px", marginBottom: "30px" }}
            >
              <img src="/sejong.jpg" alt="AI 세종대왕" />
            </div>
            <h1
              style={{
                fontSize: "2.5rem",
                marginBottom: "15px",
                color: "#333",
              }}
            >
              AI 세종대왕과의 대화
            </h1>
            <p
              style={{
                fontSize: "1.2rem",
                color: "#666",
                marginBottom: "30px",
              }}
            >
              세종대왕님께서 여러분을 기다리고 계십니다.
            </p>
            <button onClick={handleStartInterview} className="start-lesson-btn">
              대화 시작하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-page-container historical-interview-page">
      <div className="interview-character-zone">
        <h3 className="character-name">AI 세종대왕</h3>
      </div>
      <div className="interview-chat-log">
        <div ref={chatLogEndRef} />
        {isAiThinking && (
          <div className="message-bubble ai">
            <div className="message-text loading-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>
          </div>
        )}
        {listening && (
          <div className="message-bubble user">
            <div className="message-avatar">🎓</div>
            <div className="message-text transcript">{transcript}</div>
          </div>
        )}
        {[...messages].reverse().map((msg) => (
          <div key={msg.id} className={`message-bubble ${msg.sender}`}>
            <div className="message-avatar">
              {msg.sender === "ai" ? (
                <img src="/sejong.jpg" alt="AI 세종대왕 아바타" />
              ) : (
                "🎓"
              )}
            </div>
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
      </div>
      <footer className="interview-input-area">
        <input
          type="text"
          className="chat-input"
          placeholder="세종대왕에게 질문을 입력하세요..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAiThinking}
        />
        <button
          className="send-btn"
          onClick={handleSendMessage}
          disabled={isAiThinking || !inputValue.trim()}
        >
          전송
        </button>
        <button
          className={`mic-btn ${listening ? "listening" : ""}`}
          onClick={handleStartListening}
          disabled={isAiThinking}
        >
          🎤
        </button>
      </footer>
    </div>
  );
}

export default HistoricalInterview;
