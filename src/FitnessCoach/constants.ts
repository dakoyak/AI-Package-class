/**
 * Configuration constants for the AI Fitness Coach
 * 
 * This file centralizes all magic numbers and thresholds used in pose detection
 * and feedback generation, making them easier to tune and maintain.
 */

// ============================================================================
// FEEDBACK THRESHOLDS
// ============================================================================

/**
 * Similarity score thresholds for feedback messages
 * 
 * These thresholds determine what feedback message is shown to the user
 * based on how closely their pose matches the target pose.
 * 
 * Rationale:
 * - PERFECT (>95%): Very high similarity indicates excellent form
 * - GOOD (85-95%): Good similarity indicates acceptable form with minor adjustments needed
 * - NEEDS_IMPROVEMENT (<85%): Lower similarity indicates significant adjustments needed
 */
export const FEEDBACK_THRESHOLDS = {
  /** Threshold for "PERFECT" feedback - requires very high similarity */
  PERFECT: 0.95,
  
  /** Threshold for "GOOD" feedback - requires good similarity */
  GOOD: 0.85,
} as const;

/**
 * Feedback messages for different similarity levels
 * Includes both Korean and English for bilingual support
 */
export const FEEDBACK_MESSAGES = {
  PERFECT: 'PERFECT! 완벽해요!',
  GOOD: 'GOOD! 아주 좋아요!',
  NEEDS_IMPROVEMENT: '조금 더 정확하게...',
  FULL_BODY_REQUIRED: '전신이 나오도록 서주세요.',
  PREPARING: '준비 중...',
  READY: '자세를 준비해주세요!',
} as const;

/**
 * CSS class names for feedback styling
 * Used to apply color coding to feedback messages
 */
export const FEEDBACK_CLASSES = {
  PERFECT: 'feedback-perfect',
  GOOD: 'feedback-good',
  NEEDS_IMPROVEMENT: 'feedback-needs-improvement',
} as const;

// ============================================================================
// SCORE CONFIGURATION
// ============================================================================

/**
 * Score increment values based on pose similarity
 * 
 * Rationale:
 * - PERFECT poses earn 5 points per frame to reward excellent form
 * - GOOD poses earn 1 point per frame to encourage improvement
 * - Poor poses earn 0 points to motivate correction
 * 
 * At 30fps, perfect form reaches max score (100) in ~0.67 seconds
 * At 30fps, good form reaches max score (100) in ~3.3 seconds
 */
export const SCORE_INCREMENTS = {
  /** Points added per frame when similarity > PERFECT threshold */
  PERFECT: 5,
  
  /** Points added per frame when similarity > GOOD threshold */
  GOOD: 1,
  
  /** Points added per frame when similarity < GOOD threshold */
  NEEDS_IMPROVEMENT: 0,
} as const;

/**
 * Maximum achievable score
 * Once reached, score stops incrementing
 */
export const MAX_SCORE = 100;

/**
 * Initial score when session starts
 */
export const INITIAL_SCORE = 0;

/**
 * Score update interval in milliseconds
 * 
 * Rationale:
 * Instead of updating score every frame (which can be too fast),
 * we update periodically to give users time to hold the pose.
 * Random interval between 2-3 seconds for faster feedback during testing.
 */
export const SCORE_UPDATE_INTERVAL = {
  /** Minimum interval in milliseconds (2 seconds) */
  MIN: 2000,
  
  /** Maximum interval in milliseconds (3 seconds) */
  MAX: 3000,
} as const;

// ============================================================================
// POSE NORMALIZATION CONFIGURATION
// ============================================================================

/**
 * Landmark indices for pose normalization
 * Based on MediaPipe Pose Landmarker 33-point model
 */
export const LANDMARK_INDICES = {
  /** Left hip landmark index */
  LEFT_HIP: 23,
  
  /** Right hip landmark index */
  RIGHT_HIP: 24,
  
  /** Left shoulder landmark index */
  LEFT_SHOULDER: 11,
  
  /** Right shoulder landmark index */
  RIGHT_SHOULDER: 12,
} as const;

/**
 * Minimum torso size threshold for normalization
 * 
 * Rationale:
 * If the detected torso is too small (< 0.01 in normalized coordinates),
 * it likely indicates poor detection or the user is too far from camera.
 * In this case, we use a default scale of 1 to avoid division by very small numbers.
 */
export const MIN_TORSO_SIZE = 0.01;

/**
 * Default scale factor when torso size is below threshold
 */
export const DEFAULT_SCALE = 1;

/**
 * Expected number of landmarks in a complete pose detection
 * MediaPipe Pose Landmarker detects 33 landmarks per person
 */
export const EXPECTED_LANDMARK_COUNT = 33;

// ============================================================================
// CAMERA CONFIGURATION
// ============================================================================

/**
 * Camera retry configuration
 * 
 * Rationale:
 * When camera access fails with NotReadableError (camera busy),
 * we retry up to 3 times with 1 second delay to allow other apps to release the camera.
 */
export const CAMERA_RETRY = {
  /** Maximum number of retry attempts */
  MAX_ATTEMPTS: 3,
  
  /** Delay between retry attempts in milliseconds */
  RETRY_DELAY_MS: 1000,
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

/**
 * User-facing error messages for different error scenarios
 */
export const ERROR_MESSAGES = {
  CAMERA_BUSY: '카메라를 사용할 수 없습니다. 다른 앱(Zoom, Teams 등)을 종료하고 페이지를 새로고침해주세요.',
  CAMERA_NOT_FOUND: '카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.',
  PERMISSION_DENIED: '카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.',
  CAMERA_GENERIC: '카메라 초기화 중 오류가 발생했습니다. 페이지를 새로고침해주세요.',
  MODEL_LOADING_FAILED: '모델 로딩 실패. 인터넷 연결을 확인해주세요.',
} as const;

/**
 * Loading state messages
 */
export const LOADING_MESSAGES = {
  MODEL_LOADING: '모델 로딩 중...',
  MODEL_DOWNLOADING: 'AI 모델 다운로드 중...',
  CAMERA_INITIALIZING: '카메라 초기화 중...',
  COACH_PREPARING: '코치 준비 중...',
} as const;

// ============================================================================
// MEDIAPIPE CONFIGURATION
// ============================================================================

/**
 * MediaPipe model configuration
 */
export const MEDIAPIPE_CONFIG = {
  /** CDN URL for MediaPipe WASM files */
  MODEL_URL: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm',
  
  /** Path to pose landmarker model file (served from public directory) */
  MODEL_ASSET_PATH: '/pose_landmarker_lite.task',
  
  /** GPU delegation for faster inference */
  DELEGATE: 'GPU' as const,
  
  /** Running mode for video stream processing */
  RUNNING_MODE: 'VIDEO' as const,
  
  /** Number of poses to detect (single person for MVP) */
  NUM_POSES: 1,
} as const;

// ============================================================================
// ASSET PATHS
// ============================================================================

/**
 * Paths to static assets served from public directory
 */
export const ASSET_PATHS = {
  /** Tree pose guide image */
  TREE_POSE_GUIDE: '/src/assets/tree_pose_guide.png',
} as const;

// ============================================================================
// DRAWING CONFIGURATION
// ============================================================================

/**
 * Configuration for pose landmark visualization
 */
export const DRAWING_CONFIG = {
  /** Color for detected landmarks (neon green for tech feel) */
  LANDMARK_COLOR: '#00FF00',
  
  /** Color for landmark connections (white) */
  CONNECTION_COLOR: '#FFFFFF',
  
  /** Line width for landmark points - INCREASED for better visibility */
  LANDMARK_LINE_WIDTH: 4,
  
  /** Line width for connections - INCREASED for better visibility */
  CONNECTION_LINE_WIDTH: 6,
  
  /** Color for landmarks when pose not detected (red) */
  ERROR_LANDMARK_COLOR: '#FF0000',
  
  /** Z-axis range for landmark size interpolation */
  Z_MIN: -0.15,
  Z_MAX: 0.1,
  
  /** Radius range for landmark size interpolation - Scaled to body size */
  RADIUS_MAX: 3,
  RADIUS_MIN: 1,
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
// Note: Main type definitions have been moved to types.ts for better organization
