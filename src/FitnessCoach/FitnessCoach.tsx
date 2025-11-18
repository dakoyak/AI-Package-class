import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
  type PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';
import './FitnessCoach.css';
import targetPoseData from '../assets/target_pose.json'; // JSON 파일을 직접 import

// 헬퍼 함수 1: MediaPipe 랜드마크 배열을 1D 벡터로 변환 (x, y 좌표만 사용)
function landmarksToVector(landmarks: any[]) {
  // 33개의 랜드마크 * 2 (x, y) = 66개 차원의 벡터 생성
  return landmarks.flatMap(lm => [lm.x, lm.y]);
}

// 헬퍼 함수 2: 두 벡터 간의 코사인 유사도 계산
function calculateCosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0; // 0으로 나누기 방지
  }
  
  // 유사도는 0 (완전 다름) ~ 1 (완전 같음) 사이의 값
  return dotProduct / (normA * normB);
}

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
  const navigate = useNavigate();
  const [isStarted, setIsStarted] = useState(true);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [feedback, setFeedback] = useState('자세를 준비해주세요!');
  const [score, setScore] = useState(0);
  const [targetVector, setTargetVector] = useState<number[] | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // fetch 대신 import한 데이터를 직접 사용
    console.log('정답 자세 로드 성공 (from import):', targetPoseData);
    setTargetVector(landmarksToVector(targetPoseData));

    onStartLesson();
    return () => {
      disableCam();
      onEndLesson();
    };
  }, [onStartLesson, onEndLesson]);

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

      if (targetVector && result.landmarks.length > 0) {
        const currentLandmarks = result.landmarks[0];
        drawingUtils.drawLandmarks(currentLandmarks, {
          radius: (data) => DrawingUtils.lerp(data.from?.z ?? 0, -0.15, 0.1, 5, 1),
        });
        drawingUtils.drawConnectors(currentLandmarks, PoseLandmarker.POSE_CONNECTIONS);

        const currentVector = landmarksToVector(currentLandmarks);
        const similarity = calculateCosineSimilarity(targetVector, currentVector);
        const similarityScore = Math.round(similarity * 100);

        if (similarity > 0.90) {
          setFeedback(`PERFECT! 아주 잘하고 있어요! (${similarityScore}%)`);
          setScore((prev) => Math.min(prev + 5, 100));
        } else if (similarity > 0.80) {
          setFeedback(`GOOD! 조금만 더! (${similarityScore}%)`);
          setScore((prev) => Math.min(prev + 1, 100));
        } else {
          setFeedback(`자세가 다릅니다. (${similarityScore}%)`);
        }
      } else {
        if (result.landmarks.length > 0) {
           drawingUtils.drawLandmarks(result.landmarks[0], { radius: (data) => DrawingUtils.lerp(data.from?.z ?? 0, -0.15, 0.1, 5, 1) });
           drawingUtils.drawConnectors(result.landmarks[0], PoseLandmarker.POSE_CONNECTIONS);
        }
        setFeedback(targetVector ? '카메라에 전신이 나오도록 서주세요.' : '정답 자세 데이터 준비 중...');
      }

      canvasCtx.restore();
    });

    if (webcamRunning) {
      window.requestAnimationFrame(predictWebcam);
    }
  };

  const handleEnd = () => {
    disableCam();
    onEndLesson();
    setIsStarted(false);
    navigate(-1);
  };

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
          <video ref={videoRef} autoPlay playsInline />
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
            <div className="pose-guide-placeholder">나무 자세</div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default FitnessCoach;
