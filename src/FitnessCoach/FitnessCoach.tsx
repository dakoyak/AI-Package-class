import { useEffect, useRef, useState } from 'react';
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
  type PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';
import './FitnessCoach.css';

type FitnessCoachProps = {
  onStartLesson: () => void;
  onEndLesson: () => void;
};

let poseLandmarker: PoseLandmarker | undefined;
const RUNNING_MODE: 'VIDEO' = 'VIDEO';
let lastVideoTime = -1;

const POSE_MODEL_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm';

const setupMediaPipe = async () => {
  if (poseLandmarker) {
    return;
  }

  const vision = await FilesetResolver.forVisionTasks(POSE_MODEL_URL);
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `/pose_landmarker_lite.task`,
      delegate: 'GPU',
    },
    runningMode: RUNNING_MODE,
    numPoses: 1,
  });
};

function FitnessCoach({ onStartLesson, onEndLesson }: FitnessCoachProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [feedback, setFeedback] = useState('자세를 준비해주세요!');
  const [score, setScore] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isStarted) {
      setupMediaPipe().then(() => {
        enableCam();
      });
    } else if (webcamRunning) {
      disableCam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStarted]);

  const enableCam = () => {
    if (!poseLandmarker) {
      console.warn('PoseLandmarker not loaded yet.');
      return;
    }

    setWebcamRunning(true);
    const constraints = { video: true };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        }
      })
      .catch((error) => {
        console.error('Could not start webcam', error);
      });
  };

  const disableCam = () => {
    const mediaStream = videoRef.current?.srcObject as MediaStream | null;
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.removeEventListener('loadeddata', predictWebcam);
    }
    setWebcamRunning(false);
  };

  const predictWebcam = () => {
    if (!videoRef.current || !canvasRef.current || !poseLandmarker) {
      return;
    }

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');
    if (!canvasCtx) {
      return;
    }

    const drawingUtils = new DrawingUtils(canvasCtx);
    const video = videoRef.current;

    if (video.currentTime === lastVideoTime) {
      if (webcamRunning) {
        window.requestAnimationFrame(predictWebcam);
      }
      return;
    }
    lastVideoTime = video.currentTime;

    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;

    const startTimeMs = performance.now();
    poseLandmarker.detectForVideo(video, startTimeMs, (result: PoseLandmarkerResult) => {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      for (const landmark of result.landmarks) {
        drawingUtils.drawLandmarks(landmark, {
          radius: (data) => DrawingUtils.lerp(data.from?.z ?? 0, -0.15, 0.1, 5, 1),
        });
        drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);

        const rightWrist = landmark[16];
        if (rightWrist && rightWrist.y < 0.3) {
          setFeedback('오른손 올리기 성공!');
          setScore((prev) => Math.min(prev + 1, 100));
        } else {
          setFeedback('오른손을 위로 올려보세요!');
        }
      }
      canvasCtx.restore();
    });

    if (webcamRunning) {
      window.requestAnimationFrame(predictWebcam);
    }
  };

  const handleStart = () => {
    onStartLesson();
    setIsStarted(true);
  };

  const handleEnd = () => {
    disableCam();
    onEndLesson();
    setIsStarted(false);
  };

  if (!isStarted) {
    return (
      <div className="lesson-start-screen">
        <div className="start-screen-content">
          <div className="start-screen-icon">🤸</div>
          <h1>AI 댄스 챌린지</h1>
          <p>AI 코치의 동작을 따라하고 실시간으로 점수 피드백을 받아보세요!</p>
          <button className="start-lesson-btn coach-btn" onClick={handleStart}>
            도전하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="coach-page-container">
      <button className="exit-lesson-btn" onClick={handleEnd}>
        &times; 메뉴로 돌아가기
      </button>
      <header className="coach-header">
        <h2>AI 댄스 챌린지</h2>
      </header>

      <main className="coach-main-layout">
        <div className="coach-video-wrapper">
          <video ref={videoRef} autoPlay playsInline style={{ transform: 'scaleX(-1)' }} />
          <canvas ref={canvasRef} className="pose-canvas" />
        </div>
        <aside className="coach-sidebar">
          <div className="sidebar-card score-card">
            <h3>실시간 점수</h3>
            <div className="score-display">
              {score}
              <span>점</span>
            </div>
          </div>
          <div className="sidebar-card feedback-card">
            <h3>AI 코치의 조언</h3>
            <p className="feedback-text">{feedback}</p>
          </div>
          <div className="sidebar-card guide-card">
            <h3>목표 자세</h3>
            <div className="pose-guide-placeholder">오른손을 위로!</div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default FitnessCoach;
