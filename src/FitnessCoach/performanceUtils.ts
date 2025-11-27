/**
 * Performance monitoring utilities for the AI Fitness Coach
 * 
 * These utilities help track and log performance metrics during development
 * and can be used to identify bottlenecks in the pose detection pipeline.
 */

/**
 * Performance metrics for a session
 */
export interface PerformanceMetrics {
  /** Average time for pose detection in milliseconds */
  avgDetectionTime: number;
  
  /** Average time for full prediction cycle in milliseconds */
  avgPredictCycle: number;
  
  /** Total number of frames processed */
  frameCount: number;
  
  /** Frames per second */
  fps: number;
  
  /** Peak memory usage in MB (if available) */
  peakMemoryMB?: number;
}

/**
 * Get performance metrics from Performance API
 * 
 * @returns Performance metrics object
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  const detectionMeasures = performance.getEntriesByName('pose-detection', 'measure');
  const predictMeasures = performance.getEntriesByName('predict-cycle', 'measure');
  
  const avgDetectionTime = detectionMeasures.length > 0
    ? detectionMeasures.reduce((sum, m) => sum + m.duration, 0) / detectionMeasures.length
    : 0;
    
  const avgPredictCycle = predictMeasures.length > 0
    ? predictMeasures.reduce((sum, m) => sum + m.duration, 0) / predictMeasures.length
    : 0;
  
  const frameCount = predictMeasures.length;
  
  // Calculate FPS based on average cycle time
  const fps = avgPredictCycle > 0 ? 1000 / avgPredictCycle : 0;
  
  // Get memory info if available (Chrome only)
  let peakMemoryMB: number | undefined;
  if ('memory' in performance && (performance as any).memory) {
    const memory = (performance as any).memory;
    peakMemoryMB = memory.usedJSHeapSize / (1024 * 1024);
  }
  
  return {
    avgDetectionTime,
    avgPredictCycle,
    frameCount,
    fps,
    peakMemoryMB,
  };
}

/**
 * Log performance metrics to console
 * Useful for debugging and optimization
 */
export function logPerformanceMetrics(): void {
  const metrics = getPerformanceMetrics();
  
  console.group('🎯 Fitness Coach Performance Metrics');
  console.log(`📊 Frames Processed: ${metrics.frameCount}`);
  console.log(`⚡ Average Detection Time: ${metrics.avgDetectionTime.toFixed(2)}ms`);
  console.log(`🔄 Average Predict Cycle: ${metrics.avgPredictCycle.toFixed(2)}ms`);
  console.log(`📈 FPS: ${metrics.fps.toFixed(1)}`);
  
  if (metrics.peakMemoryMB !== undefined) {
    console.log(`💾 Memory Usage: ${metrics.peakMemoryMB.toFixed(2)}MB`);
  }
  
  // Performance warnings
  if (metrics.avgDetectionTime > 50) {
    console.warn('⚠️ Detection time is high (>50ms). Consider optimizing.');
  }
  
  if (metrics.fps < 24) {
    console.warn('⚠️ FPS is low (<24). Performance may be degraded.');
  }
  
  if (metrics.peakMemoryMB && metrics.peakMemoryMB > 200) {
    console.warn('⚠️ Memory usage is high (>200MB). Check for memory leaks.');
  }
  
  console.groupEnd();
}

/**
 * Clear all performance marks and measures
 * Useful for resetting metrics between sessions
 */
export function clearPerformanceMetrics(): void {
  performance.clearMarks();
  performance.clearMeasures();
}

/**
 * Monitor performance and log metrics periodically
 * 
 * @param intervalMs - Interval in milliseconds to log metrics (default: 10000ms = 10s)
 * @returns Function to stop monitoring
 */
export function startPerformanceMonitoring(intervalMs: number = 10000): () => void {
  const intervalId = setInterval(() => {
    logPerformanceMetrics();
  }, intervalMs);
  
  return () => {
    clearInterval(intervalId);
    logPerformanceMetrics(); // Log final metrics
    clearPerformanceMetrics();
  };
}
