/**
 * Type definitions for the AI Fitness Coach
 * 
 * This file contains all TypeScript interfaces and types used in the fitness coach component,
 * providing type safety and better IDE support.
 */

// ============================================================================
// MEDIAPIPE TYPES
// ============================================================================

/**
 * Represents a single pose landmark detected by MediaPipe
 * 
 * MediaPipe Pose Landmarker detects 33 landmarks per person,
 * each with normalized coordinates and visibility score.
 */
export interface Landmark {
  /** Normalized x coordinate (0-1, relative to image width) */
  x: number;
  
  /** Normalized y coordinate (0-1, relative to image height) */
  y: number;
  
  /** Depth coordinate (z-axis, relative to hip center) */
  z: number;
  
  /** Visibility/confidence score (0-1, higher means more confident detection) */
  visibility: number;
}

/**
 * Array of 33 landmarks representing a complete pose
 */
export type PoseLandmarks = Landmark[];

/**
 * Normalized pose vector for similarity comparison
 * Contains flattened [x, y] coordinates relative to hip center and scaled by torso size
 */
export type NormalizedPoseVector = number[];

// ============================================================================
// FEEDBACK TYPES
// ============================================================================

/**
 * Feedback level based on pose similarity score
 */
export type FeedbackLevel = 'PERFECT' | 'GOOD' | 'NEEDS_IMPROVEMENT';

/**
 * Configuration for a feedback threshold
 */
export interface FeedbackThreshold {
  /** Minimum similarity score for this feedback level (0-1) */
  minScore: number;
  
  /** Maximum similarity score for this feedback level (0-1) */
  maxScore: number;
  
  /** Message to display to the user */
  message: string;
  
  /** Points to add to score per frame at this level */
  scoreIncrement: number;
  
  /** CSS class name for styling this feedback level */
  className: string;
}

/**
 * Feedback state containing message and styling information
 */
export interface FeedbackState {
  /** Current feedback message */
  message: string;
  
  /** CSS class for styling the feedback */
  className: string;
  
  /** Similarity score percentage (0-100) */
  similarityScore: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Types of errors that can occur in the fitness coach
 */
export type ErrorType = 'none' | 'camera' | 'model' | 'permission';

/**
 * Error state information
 */
export interface ErrorState {
  /** Type of error */
  type: ErrorType;
  
  /** User-facing error message */
  message: string;
  
  /** Optional technical error details for debugging */
  details?: string;
}

/**
 * Camera error names from getUserMedia API
 */
export type CameraErrorName = 
  | 'NotAllowedError'    // Permission denied
  | 'NotFoundError'      // No camera found
  | 'NotReadableError'   // Camera busy/in use
  | 'OverconstrainedError' // Constraints not satisfied
  | 'SecurityError'      // Security issue
  | 'TypeError';         // Invalid constraints

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * Props for the FitnessCoach component
 */
export interface FitnessCoachProps {
  /** Callback when lesson starts (component mounts) */
  onStartLesson: () => void;
  
  /** Callback when lesson ends (user exits or component unmounts) */
  onEndLesson: () => void;
}

// ============================================================================
// STATE TYPES
// ============================================================================

/**
 * Main state for the FitnessCoach component
 */
export interface FitnessCoachState {
  /** Whether webcam is currently running */
  webcamRunning: boolean;
  
  /** Current feedback message */
  feedback: string;
  
  /** CSS class for feedback styling */
  feedbackClass: string;
  
  /** Current accumulated score (0-100) */
  score: number;
  
  /** Normalized target pose vector, null until loaded */
  targetVector: NormalizedPoseVector | null;
  
  /** Loading message during initialization */
  loadingMessage: string;
  
  /** Current error type */
  errorType: ErrorType;
  
  /** Current error message */
  errorMessage: string;
}

// ============================================================================
// DRAWING TYPES
// ============================================================================

/**
 * Configuration for drawing pose landmarks on canvas
 */
export interface DrawingOptions {
  /** Color for landmarks */
  color: string;
  
  /** Line width for drawing */
  lineWidth: number;
  
  /** Radius for landmark points (can be function for dynamic sizing) */
  radius?: number | ((data: { from?: Landmark }) => number);
}

/**
 * Landmark indices for key body points
 */
export interface LandmarkIndices {
  /** Left hip landmark index (23) */
  LEFT_HIP: number;
  
  /** Right hip landmark index (24) */
  RIGHT_HIP: number;
  
  /** Left shoulder landmark index (11) */
  LEFT_SHOULDER: number;
  
  /** Right shoulder landmark index (12) */
  RIGHT_SHOULDER: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Camera retry configuration
 */
export interface CameraRetryConfig {
  /** Maximum number of retry attempts */
  MAX_ATTEMPTS: number;
  
  /** Delay between retries in milliseconds */
  RETRY_DELAY_MS: number;
}

/**
 * MediaPipe configuration options
 */
export interface MediaPipeConfig {
  /** CDN URL for MediaPipe WASM files */
  MODEL_URL: string;
  
  /** Path to pose landmarker model file */
  MODEL_ASSET_PATH: string;
  
  /** Delegate for inference (GPU or CPU) */
  DELEGATE: 'GPU' | 'CPU';
  
  /** Running mode for processing */
  RUNNING_MODE: 'VIDEO' | 'IMAGE';
  
  /** Number of poses to detect */
  NUM_POSES: number;
}

/**
 * Result from similarity comparison
 */
export interface SimilarityResult {
  /** Similarity score (0-1) */
  score: number;
  
  /** Feedback level based on score */
  level: FeedbackLevel;
  
  /** Points to add to accumulated score */
  scoreIncrement: number;
}

// ============================================================================
// HELPER FUNCTION TYPES
// ============================================================================

/**
 * Function signature for normalizing landmarks
 */
export type NormalizeLandmarksFunction = (landmarks: Landmark[]) => NormalizedPoseVector;

/**
 * Function signature for calculating cosine similarity
 */
export type CalculateCosineSimilarityFunction = (
  vectorA: number[],
  vectorB: number[]
) => number;

/**
 * Function signature for determining feedback based on similarity
 */
export type GetFeedbackFunction = (similarity: number) => FeedbackState;
