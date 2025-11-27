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
import {
  FEEDBACK_THRESHOLDS,
  FEEDBACK_MESSAGES,
  FEEDBACK_CLASSES,
  SCORE_INCREMENTS,
  MAX_SCORE,
  INITIAL_SCORE,
  SCORE_UPDATE_INTERVAL,
  LANDMARK_INDICES,
  MIN_TORSO_SIZE,
  DEFAULT_SCALE,
  CAMERA_RETRY,
  ERROR_MESSAGES,
  LOADING_MESSAGES,
  MEDIAPIPE_CONFIG,
  ASSET_PATHS,
  DRAWING_CONFIG,
} from './constants';
import type {
  Landmark,
  NormalizedPoseVector,
  FitnessCoachProps,
  ErrorType,
  CameraErrorName,
} from './types';
import { startPerformanceMonitoring, clearPerformanceMetrics } from './performanceUtils';
import { detectBrowser, checkBrowserFeatures, logBrowserInfo } from './browserDetection';

// 헬퍼 함수: 랜드마크 정규화 (상대 좌표 변환)
function normalizeLandmarks(landmarks: Landmark[]): NormalizedPoseVector {
  if (!landmarks[LANDMARK_INDICES.LEFT_HIP] || !landmarks[LANDMARK_INDICES.RIGHT_HIP]) {
    return landmarks.flatMap((lm) => [lm.x, lm.y]);
  }

  const centerX = (landmarks[LANDMARK_INDICES.LEFT_HIP].x + landmarks[LANDMARK_INDICES.RIGHT_HIP].x) / 2;
  const centerY = (landmarks[LANDMARK_INDICES.LEFT_HIP].y + landmarks[LANDMARK_INDICES.RIGHT_HIP].y) / 2;

  const shoulderCenterX = (landmarks[LANDMARK_INDICES.LEFT_SHOULDER].x + landmarks[LANDMARK_INDICES.RIGHT_SHOULDER].x) / 2;
  const shoulderCenterY = (landmarks[LANDMARK_INDICES.LEFT_SHOULDER].y + landmarks[LANDMARK_INDICES.RIGHT_SHOULDER].y) / 2;
  const torsoSize = Math.sqrt(
    Math.pow(centerX - shoulderCenterX, 2) + Math.pow(centerY - shoulderCenterY, 2)
  );
  
  const scale = torsoSize > MIN_TORSO_SIZE ? torsoSize : DEFAULT_SCALE;

  return landmarks.flatMap((lm) => {
    return [
      (lm.x - centerX) / scale,
      (lm.y - centerY) / scale
    ];
  });
}

// 헬퍼 함수 2: 두 벡터 간의 코사인 유사도 계산
function calculateCosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(vecA.length, vecB.length);
  
  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0; 
  }
  
  return dotProduct / (normA * normB);
}

// 헬퍼 함수 3: 나무 자세 특화 코칭 - 구체적인 방향 제시
function generateCoachingFeedback(currentLandmarks: Landmark[], targetLandmarks: Landmark[]): string {
  const messages: string[] = [];
  
  // 1. Check if one leg is raised (tree pose requirement)
  const leftAnkle = currentLandmarks[27];
  const rightAnkle = currentLandmarks[28];
  const leftKnee = currentLandmarks[25];
  const rightKnee = currentLandmarks[26];
  const leftHip = currentLandmarks[23];
  const rightHip = currentLandmarks[24];
  
  // More lenient check: ankle significantly higher than other ankle OR knee bent outward
  const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
  const leftLegRaised = leftAnkle.y < avgAnkleY - 0.05 || leftKnee.x < leftHip.x - 0.1;
  const rightLegRaised = rightAnkle.y < avgAnkleY - 0.05 || rightKnee.x > rightHip.x + 0.1;
  
  if (!leftLegRaised && !rightLegRaised) {
    return '🦵 한쪽 다리를 들어주세요!';
  }
  
  // 2. Check arms - should be raised above head
  const leftWrist = currentLandmarks[15];
  const rightWrist = currentLandmarks[16];
  const leftShoulder = currentLandmarks[11];
  const rightShoulder = currentLandmarks[12];
  const nose = currentLandmarks[0];
  
  const leftArmRaised = leftWrist.y < nose.y;
  const rightArmRaised = rightWrist.y < nose.y;
  
  if (!leftArmRaised || !rightArmRaised) {
    messages.push('팔을 더 위로 올려주세요 ⬆️');
  }
  
  // 3. Check specific body part positions vs target (only if significant difference)
  const armDiffLeft = leftWrist.y - targetLandmarks[15].y;
  const armDiffRight = rightWrist.y - targetLandmarks[16].y;
  const legDiffLeft = leftAnkle.y - targetLandmarks[27].y;
  const legDiffRight = rightAnkle.y - targetLandmarks[28].y;
  
  // Check arms
  if (Math.abs(armDiffLeft) > 0.15 || Math.abs(armDiffRight) > 0.15) {
    if (armDiffLeft > 0 || armDiffRight > 0) {
      messages.push('팔을 더 올려주세요 ⬆️');
    } else {
      messages.push('팔을 조금 내려주세요 ⬇️');
    }
  }
  
  // Check legs
  if (Math.abs(legDiffLeft) > 0.15 || Math.abs(legDiffRight) > 0.15) {
    if (legDiffLeft > 0 || legDiffRight > 0) {
      messages.push('다리를 더 올려주세요 ⬆️');
    } else {
      messages.push('다리를 조금 내려주세요 ⬇️');
    }
  }
  
  // Return most important message
  if (messages.length > 0) {
    return messages[0]; // Show first (most important) message
  }
  
  return '좋아요! 자세를 유지하세요! 💯';
}

// Props type is now imported from types.ts

let poseLandmarker: PoseLandmarker | undefined;
let lastVideoTime = -1;
let lastScoreUpdateTime = 0; // Track last score update time
let accumulatedSimilarity = 0; // Accumulate similarity scores
let frameCount = 0; // Count frames for averaging
let currentUpdateInterval = 0; // Current score update interval (calculated once per period)

// Asset paths (served from public/ directory at root path)
// - Model: public/pose_landmarker_lite.task → /pose_landmarker_lite.task
// - Guide: public/images/tree_pose_guide.svg → /images/tree_pose_guide.svg
const setupMediaPipe = async () => {
  if (poseLandmarker) {
    return;
  }

  const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_CONFIG.MODEL_URL);
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MEDIAPIPE_CONFIG.MODEL_ASSET_PATH, // Verified: public/pose_landmarker_lite.task (5.5 MB)
      delegate: MEDIAPIPE_CONFIG.DELEGATE,
    },
    runningMode: MEDIAPIPE_CONFIG.RUNNING_MODE,
    numPoses: MEDIAPIPE_CONFIG.NUM_POSES,
  });
};

function FitnessCoach({ onStartLesson, onEndLesson }: FitnessCoachProps) {
  const navigate = useNavigate();
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [feedback, setFeedback] = useState<string>(FEEDBACK_MESSAGES.READY);
  const [feedbackClass, setFeedbackClass] = useState(''); // Track feedback level for color coding
  const [score, setScore] = useState(INITIAL_SCORE);
  const [coachingMessage, setCoachingMessage] = useState<string>(''); // Coaching feedback
  const [targetVector, setTargetVector] = useState<NormalizedPoseVector | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Debug: Log when targetVector changes
  useEffect(() => {
    console.log('🎯 targetVector state changed:', {
      isNull: targetVector === null,
      length: targetVector?.length,
      firstValues: targetVector?.slice(0, 4)
    });
  }, [targetVector]);
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES.MODEL_LOADING);
  const [errorType, setErrorType] = useState<ErrorType>('none');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>(''); // Debug info for display

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isInitialized = useRef(false);
  const targetVectorRef = useRef<NormalizedPoseVector | null>(null);
  const webcamRunningRef = useRef(false); // Use ref instead of state for loop control

  // Fullscreen effect
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      
      // 전체화면일 때 body 스타일 변경
      if (isNowFullscreen) {
        document.body.style.background = '#000';
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.background = '';
        document.body.style.overflow = '';
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      // cleanup
      document.body.style.background = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (isInitialized.current) {
      console.log('⏭️ Skipping duplicate initialization (React Strict Mode)');
      return;
    }
    isInitialized.current = true;
    
    console.log('🚀 Initializing FitnessCoach...');
    
    // Log browser information for debugging
    logBrowserInfo();
    
    // Check browser compatibility
    const browser = detectBrowser();
    const features = checkBrowserFeatures();
    
    if (!features.isSupported) {
      console.error('❌ Browser missing required features:', features.missingFeatures);
      setErrorType('model');
      setErrorMessage(`브라우저가 필요한 기능을 지원하지 않습니다: ${features.missingFeatures.join(', ')}`);
      return;
    }
    
    if (browser.warning) {
      console.warn('⚠️ Browser compatibility warning:', browser.warning);
    }
    
    // Load and normalize target pose
    console.log('📥 Loading target pose data...');
    console.log('  Raw data type:', typeof targetPoseData);
    console.log('  Is array:', Array.isArray(targetPoseData));
    console.log('  Length:', targetPoseData?.length);
    
    if (!targetPoseData || !Array.isArray(targetPoseData) || targetPoseData.length === 0) {
      console.error('❌ Invalid target pose data!', targetPoseData);
      setErrorType('model');
      setErrorMessage('타겟 포즈 데이터를 로드할 수 없습니다.');
      return;
    }
    
    try {
      const normalizedTarget = normalizeLandmarks(targetPoseData);
      console.log('✅ Target pose normalized successfully!');
      console.log('  Raw data length:', targetPoseData.length);
      console.log('  Normalized length:', normalizedTarget.length);
      console.log('  First 4 values:', normalizedTarget.slice(0, 4));
      
      // Store in both state and ref for immediate access
      targetVectorRef.current = normalizedTarget;
      setTargetVector(normalizedTarget);
      console.log('✅ Target vector state AND ref updated');
    } catch (error) {
      console.error('❌ Error normalizing target pose:', error);
      setErrorType('model');
      setErrorMessage('타겟 포즈 처리 중 오류가 발생했습니다.');
      return;
    }
    
    onStartLesson();

    // Initialize score update timer
    lastScoreUpdateTime = performance.now();
    accumulatedSimilarity = 0;
    frameCount = 0;
    // Set initial random interval
    currentUpdateInterval = SCORE_UPDATE_INTERVAL.MIN + 
      Math.random() * (SCORE_UPDATE_INTERVAL.MAX - SCORE_UPDATE_INTERVAL.MIN);
    console.log(`⏰ 첫 점수 업데이트 간격: ${(currentUpdateInterval / 1000).toFixed(1)}초`);

    // Start performance monitoring in development
    const stopMonitoring = process.env.NODE_ENV === 'development' 
      ? startPerformanceMonitoring(10000) // Log every 10 seconds
      : () => {};

    const initCamera = async () => {
        try {
            setLoadingMessage(LOADING_MESSAGES.MODEL_DOWNLOADING);
            await setupMediaPipe();
            setLoadingMessage(LOADING_MESSAGES.CAMERA_INITIALIZING);
            if (!streamRef.current) {
                enableCam();
            }
        } catch (error: unknown) {
            console.error('Model loading failed:', error);
            setErrorType('model');
            setErrorMessage(ERROR_MESSAGES.MODEL_LOADING_FAILED);
        }
    };
    initCamera();

    return () => {
      console.log('Unmounting FitnessCoach...');
      stopMonitoring(); // Stop performance monitoring and log final metrics
      disableCam();
      clearPerformanceMetrics(); // Clear metrics for next session
      onEndLesson();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enableCam = async (retryCount = 0) => {
    if (!poseLandmarker) {
      console.warn('PoseLandmarker not loaded yet.');
      return;
    }

    setWebcamRunning(true);
    webcamRunningRef.current = true; // Set ref as well
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        setErrorType('none');
        setErrorMessage('');

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Force video to play
          videoRef.current.onloadedmetadata = async () => {
             console.log('✅ Video metadata loaded');
             try {
               await videoRef.current!.play();
               console.log('✅ Video playing successfully');
               console.log(`📹 Video dimensions: ${videoRef.current!.videoWidth}x${videoRef.current!.videoHeight}`);
             } catch (e) {
               console.error('❌ Play failed:', e);
             }
          };
          
          // Start prediction loop when video data is loaded
          videoRef.current.addEventListener('loadeddata', () => {
            console.log('✅ Video data loaded, starting prediction loop');
            predictWebcam();
          });
          
          // Also try to play immediately
          videoRef.current.play().catch(() => {
            console.log('⏳ Initial play attempt (will retry on metadata load)');
          });
        }
    } catch (error: unknown) {
        console.error('Camera access error:', error);
        
        const cameraError = error as { name: CameraErrorName; message: string };
        
        if (cameraError.name === 'NotReadableError' && retryCount < CAMERA_RETRY.MAX_ATTEMPTS) {
            console.log(`Camera busy, retrying in 1s... (${retryCount + 1}/${CAMERA_RETRY.MAX_ATTEMPTS})`);
            setErrorType('camera');
            setErrorMessage(`카메라 연결 재시도 중... (${retryCount + 1}/${CAMERA_RETRY.MAX_ATTEMPTS})`);
            setFeedback(`카메라 연결 재시도 중... (${retryCount + 1})`);
            setTimeout(() => enableCam(retryCount + 1), CAMERA_RETRY.RETRY_DELAY_MS);
        } else if (cameraError.name === 'NotAllowedError') {
            setErrorType('permission');
            setErrorMessage(ERROR_MESSAGES.PERMISSION_DENIED);
            setFeedback('카메라 권한이 필요합니다.');
        } else if (cameraError.name === 'NotFoundError') {
            setErrorType('camera');
            setErrorMessage(ERROR_MESSAGES.CAMERA_NOT_FOUND);
            setFeedback('카메라를 찾을 수 없습니다.');
        } else if (cameraError.name === 'NotReadableError') {
            setErrorType('camera');
            setErrorMessage(ERROR_MESSAGES.CAMERA_BUSY);
            setFeedback('카메라를 사용할 수 없습니다. 다른 앱을 종료해주세요.');
        } else {
            setErrorType('camera');
            setErrorMessage(ERROR_MESSAGES.CAMERA_GENERIC);
            setFeedback('카메라 오류가 발생했습니다.');
        }
    }
  };

  const disableCam = () => {
    // Performance mark: Cleanup start
    performance.mark('cleanup-start');
    
    setWebcamRunning(false);
    webcamRunningRef.current = false; // Set ref as well
    
    // Stop all media stream tracks to release camera
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          // Ensure track is fully released
          track.enabled = false;
        });
        streamRef.current = null;
    }

    // Clean up video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.removeEventListener('loadeddata', predictWebcam);
      // Pause video to free resources
      videoRef.current.pause();
    }
    
    // Clear canvas to free memory
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    
    // Performance mark: Cleanup end
    performance.mark('cleanup-end');
    performance.measure('cleanup-duration', 'cleanup-start', 'cleanup-end');
  };

  const predictWebcam = () => {
    // Performance mark: Start of prediction cycle
    performance.mark('predict-start');
    
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

    // Frame skipping: Skip if video hasn't advanced (DISABLED for webcam - webcam currentTime doesn't change)
    // Webcam streams need to process every frame
    // if (video.currentTime === lastVideoTime) {
    //   if (webcamRunning) {
    //     window.requestAnimationFrame(predictWebcam);
    //   }
    //   return;
    // }
    
    // Debug: Log video time changes
    if (frameCount % 60 === 0) {
      console.log(`⏱️ Video time: ${video.currentTime.toFixed(3)}s (changed from ${lastVideoTime.toFixed(3)}s)`);
    }
    
    lastVideoTime = video.currentTime;

    // Only resize canvas if dimensions changed (performance optimization)
    if (canvasElement.width !== video.videoWidth || canvasElement.height !== video.videoHeight) {
      canvasElement.width = video.videoWidth;
      canvasElement.height = video.videoHeight;
    }

    const startTimeMs = performance.now();
    performance.mark('detection-start');
    
    // Debug: Log detection call
    if (frameCount % 60 === 0) {
      console.log(`🎥 detectForVideo 호출 중... (time: ${startTimeMs.toFixed(0)}ms)`);
    }
    
    poseLandmarker.detectForVideo(video, startTimeMs, (result: PoseLandmarkerResult) => {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Debug: Update debug info every frame
      if (result.landmarks.length > 0) {
        const currentLandmarks = result.landmarks[0];
        setDebugInfo(`감지: ${currentLandmarks.length}개 관절 | 첫 관절: (${currentLandmarks[0].x.toFixed(2)}, ${currentLandmarks[0].y.toFixed(2)}) | 시간: ${video.currentTime.toFixed(1)}s`);
        
        // Log detection status every 60 frames
        if (frameCount % 60 === 0) {
          console.log('🔍 감지 결과:', {
            targetVectorLoaded: !!targetVectorRef.current,
            landmarksDetected: result.landmarks.length,
            landmarkCount: currentLandmarks.length,
            firstLandmark: `(${currentLandmarks[0].x.toFixed(3)}, ${currentLandmarks[0].y.toFixed(3)})`,
            videoTime: video.currentTime.toFixed(3)
          });
        }
      } else {
        setDebugInfo('감지: 관절 없음');
      }

      if (result.landmarks.length > 0) {
        const currentLandmarks = result.landmarks[0];
        
        // Scale skeleton to be larger - expand from center
        const scaleFactor = 1.2; // 20% larger - not too much to avoid clipping
        const centerX = (currentLandmarks[LANDMARK_INDICES.LEFT_HIP].x + currentLandmarks[LANDMARK_INDICES.RIGHT_HIP].x) / 2;
        const centerY = (currentLandmarks[LANDMARK_INDICES.LEFT_HIP].y + currentLandmarks[LANDMARK_INDICES.RIGHT_HIP].y) / 2;
        
        const scaledLandmarks = currentLandmarks.map(lm => ({
          x: centerX + (lm.x - centerX) * scaleFactor,
          y: centerY + (lm.y - centerY) * scaleFactor,
          z: lm.z,
          visibility: lm.visibility
        }));
        
        // Draw landmarks with scaled positions
        drawingUtils.drawLandmarks(scaledLandmarks, {
          radius: (data) => {
            const z = data.from?.z ?? 0;
            return DrawingUtils.lerp(
              z,
              DRAWING_CONFIG.Z_MIN,
              DRAWING_CONFIG.Z_MAX,
              DRAWING_CONFIG.RADIUS_MAX,
              DRAWING_CONFIG.RADIUS_MIN
            );
          },
          color: DRAWING_CONFIG.LANDMARK_COLOR,
          lineWidth: 2
        });
        drawingUtils.drawConnectors(scaledLandmarks, PoseLandmarker.POSE_CONNECTIONS, {
          color: DRAWING_CONFIG.CONNECTION_COLOR,
          lineWidth: 3
        });

        // Only calculate similarity if targetVector is loaded (use ref for immediate access)
        if (targetVectorRef.current) {
          const targetVector = targetVectorRef.current;
          
          // Check if full body is visible (key landmarks for tree pose)
          const keyLandmarks = [
            LANDMARK_INDICES.LEFT_SHOULDER,
            LANDMARK_INDICES.RIGHT_SHOULDER,
            LANDMARK_INDICES.LEFT_HIP,
            LANDMARK_INDICES.RIGHT_HIP,
            23, // left hip
            24, // right hip
            25, // left knee
            26, // right knee
            27, // left ankle
            28, // right ankle
          ];
          
          const allVisible = keyLandmarks.every(idx => 
            currentLandmarks[idx] && (currentLandmarks[idx].visibility ?? 1) > 0.5
          );
          
          if (!allVisible) {
            // Full body not visible - give low score
            accumulatedSimilarity += 0;
            frameCount++;
            setCoachingMessage('전신이 보이도록 서주세요! 📷');
          } else {
            // Full body visible - calculate similarity
            const currentVector = normalizeLandmarks(currentLandmarks);
            let similarity = calculateCosineSimilarity(targetVector, currentVector);
            
            // TREE POSE SPECIFIC VALIDATION - penalize if not doing tree pose
            const leftAnkle = currentLandmarks[27];
            const rightAnkle = currentLandmarks[28];
            const leftKnee = currentLandmarks[25];
            const rightKnee = currentLandmarks[26];
            const leftHip = currentLandmarks[23];
            const rightHip = currentLandmarks[24];
            const leftWrist = currentLandmarks[15];
            const rightWrist = currentLandmarks[16];
            const nose = currentLandmarks[0];
            
            // Check if one leg is raised (more lenient)
            const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
            const leftLegRaised = leftAnkle.y < avgAnkleY - 0.05 || leftKnee.x < leftHip.x - 0.1;
            const rightLegRaised = rightAnkle.y < avgAnkleY - 0.05 || rightKnee.x > rightHip.x + 0.1;
            const oneLegRaised = leftLegRaised || rightLegRaised;
            
            // Check if arms are raised
            const armsRaised = (leftWrist.y < nose.y) && (rightWrist.y < nose.y);
            
            // Penalize score if not doing tree pose
            if (!oneLegRaised) {
              similarity *= 0.5; // 50% penalty if not raising leg
            }
            if (!armsRaised) {
              similarity *= 0.7; // 30% penalty if arms not raised
            }

            // Accumulate similarity for periodic score update
            accumulatedSimilarity += similarity;
            frameCount++;
            
            // Generate coaching feedback only if score is not good enough
            if (similarity < 0.85) {
              const coaching = generateCoachingFeedback(currentLandmarks, targetVector as unknown as Landmark[]);
              setCoachingMessage(coaching);
            } else {
              setCoachingMessage('좋아요! 자세를 유지하세요! 💯');
            }
          }

          // Update score periodically (every 1-2 seconds) - DIRECT 0-100 scoring
          const currentTime = performance.now();
          const timeSinceLastUpdate = currentTime - lastScoreUpdateTime;
          
          // Require minimum 30 frames (1 second) before updating score
          if (timeSinceLastUpdate >= currentUpdateInterval && frameCount >= 30) {
            // Calculate average similarity over the period
            const avgSimilarity = accumulatedSimilarity / frameCount;
            
            // DIRECT SCORING: Convert similarity to 0-100 score
            const newScore = Math.round(avgSimilarity * 100);
            setScore(newScore);
            
            console.log(`🎯 점수 업데이트! 평균 유사도: ${(avgSimilarity * 100).toFixed(1)}% → 점수: ${newScore}`);
            
            // Reset accumulators and set new random interval (1-2 seconds)
            lastScoreUpdateTime = currentTime;
            accumulatedSimilarity = 0;
            frameCount = 0;
            currentUpdateInterval = 1000 + Math.random() * 1000; // 1-2 seconds
          }
        } else {
          // targetVector not loaded yet
          setFeedback(FEEDBACK_MESSAGES.PREPARING);
        }
      } else {
        // No landmarks detected
        setFeedback(FEEDBACK_MESSAGES.FULL_BODY_REQUIRED);
      }

      canvasCtx.restore();
      
      // Performance mark: End of detection
      performance.mark('detection-end');
      performance.measure('pose-detection', 'detection-start', 'detection-end');
      
      // Performance mark: End of prediction cycle
      performance.mark('predict-end');
      performance.measure('predict-cycle', 'predict-start', 'predict-end');

      // Continue the loop - MUST be inside the callback!
      if (webcamRunningRef.current) {
        window.requestAnimationFrame(predictWebcam);
      }
    });
  };

  const handleEnd = () => {
    disableCam();
    onEndLesson();
    navigate(-1);
  };

  // 데이터 로딩 중이거나 웹캠 준비 전에는 로딩 화면 표시
  if (!targetVector) {
    return (
        <div className="loading-container">
            <div className="loading-spinner-wrapper">
                <div className="loading-spinner"></div>
                <div className="loading-pulse"></div>
            </div>
            <h1 className="loading-title">{LOADING_MESSAGES.COACH_PREPARING}</h1>
            <p className="loading-message">{loadingMessage}</p>
        </div>
    );
  }

  // 에러 상태 표시
  if (errorType !== 'none') {
    return (
        <div className={`error-container error-${errorType}`}>
            <div className="error-icon">
                {errorType === 'camera' && '📷'}
                {errorType === 'model' && '⚠️'}
                {errorType === 'permission' && '🔒'}
            </div>
            <h1 className="error-title">
                {errorType === 'camera' && '카메라 오류'}
                {errorType === 'model' && '모델 로딩 오류'}
                {errorType === 'permission' && '권한 필요'}
            </h1>
            <p className="error-message">{errorMessage}</p>
            <button className="error-retry-button" onClick={handleEnd}>
                돌아가기
            </button>
        </div>
    );
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      width: '100%', 
      height: '100vh', 
      background: '#1a1a2e',
      overflow: 'hidden',
      boxSizing: 'border-box',
      borderRadius: isFullscreen ? '0' : '20px',
      position: isFullscreen ? 'fixed' : 'relative',
      top: isFullscreen ? 0 : 'auto',
      left: isFullscreen ? 0 : 'auto',
      zIndex: isFullscreen ? 9999 : 'auto'
    }}>
      {/* Fullscreen button - top right (hidden when fullscreen) */}
      {!isFullscreen && (
        <button
          onClick={toggleFullscreen}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '2px solid #00FF00',
            borderRadius: '10px',
            padding: '10px 20px',
            color: '#00FF00',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 1000,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 0, 0.2)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ⛶ 전체화면
        </button>
      )}

      {/* Left Side - Camera Feed (50%) */}
      <div style={{ 
        width: '50%', 
        height: '100%', 
        position: 'relative',
        background: '#000',
        boxSizing: 'border-box',
        borderRadius: isFullscreen ? '0' : '20px 0 0 20px',
        overflow: 'hidden'
      }}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
        />
        <canvas ref={canvasRef} style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: 'scaleX(-1)'
        }} />
        
        {/* Title - top left of camera */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '12px 24px',
          borderRadius: '12px',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#FFFFFF',
          border: '2px solid #00FF00',
        }}>
          AI 피트니스 코치
        </div>
      </div>

      {/* Right Side - Guide (50%) */}
      <div style={{ 
        width: '50%', 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: isFullscreen ? '0' : '0 20px 20px 0'
      }}>
        {/* Guide image container - full size */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '15px',
          borderRadius: '0',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Score - top right corner */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.95)',
            padding: '18px 32px',
            borderRadius: '15px',
            border: '5px solid #00FF00',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
            boxShadow: '0 5px 20px rgba(0, 255, 0, 0.4)'
          }}>
            <span style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '5px', fontWeight: '600' }}>점수</span>
            <span style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#00FF00', textShadow: '0 0 10px rgba(0, 255, 0, 0.5)' }}>{score}</span>
          </div>

          <div style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: '#000',
            flexShrink: 0,
            marginTop: '15px'
          }}>
            나무 자세
          </div>
          
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            minHeight: 0
          }}>
            <img 
              src={ASSET_PATHS.TREE_POSE_GUIDE} 
              alt="나무 자세" 
              style={{ 
                width: 'auto', 
                height: '100%', 
                maxWidth: '100%',
                objectFit: 'contain',
                mixBlendMode: 'multiply',
                filter: 'contrast(1.1) brightness(1.05)'
              }}
            />
          </div>
          
          {/* Coaching message */}
          <div style={{
            fontSize: '2.2rem',
            color: '#00FF00',
            textAlign: 'center',
            fontWeight: 'bold',
            background: 'rgba(0, 0, 0, 0.95)',
            padding: '20px 30px',
            borderRadius: '15px',
            width: '95%',
            border: '4px solid #00FF00',
            flexShrink: 0,
            marginBottom: '15px',
            boxShadow: '0 5px 20px rgba(0, 255, 0, 0.3)',
            textShadow: '0 0 10px rgba(0, 255, 0, 0.5)'
          }}>
            {coachingMessage || '자세를 취해주세요!'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FitnessCoach;
