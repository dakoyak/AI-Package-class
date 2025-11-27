/**
 * Browser detection and compatibility utilities
 * 
 * Helps detect the user's browser and provide appropriate warnings
 * or optimizations based on browser capabilities.
 */

/**
 * Detected browser information
 */
export interface BrowserInfo {
  /** Browser name */
  name: 'chrome' | 'edge' | 'firefox' | 'safari' | 'unknown';
  
  /** Browser version (major version number) */
  version: number;
  
  /** Whether the browser is fully supported */
  isSupported: boolean;
  
  /** Warning message if browser has limitations */
  warning?: string;
}

/**
 * Detect the user's browser and version
 * 
 * @returns Browser information object
 */
export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent;
  
  // Chrome detection (must come before Safari check)
  if (/Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor)) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    const version = match ? parseInt(match[1], 10) : 0;
    
    return {
      name: 'chrome',
      version,
      isSupported: version >= 90,
      warning: version < 90 ? 'Chrome 90 이상을 권장합니다.' : undefined,
    };
  }
  
  // Edge detection (Chromium-based)
  if (/Edg/.test(userAgent)) {
    const match = userAgent.match(/Edg\/(\d+)/);
    const version = match ? parseInt(match[1], 10) : 0;
    
    return {
      name: 'edge',
      version,
      isSupported: version >= 90,
      warning: version < 90 ? 'Edge 90 이상을 권장합니다.' : undefined,
    };
  }
  
  // Firefox detection
  if (/Firefox/.test(userAgent)) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    const version = match ? parseInt(match[1], 10) : 0;
    
    return {
      name: 'firefox',
      version,
      isSupported: version >= 88,
      warning: version >= 88 
        ? '성능이 Chrome보다 약간 낮을 수 있습니다.'
        : 'Firefox 88 이상을 권장합니다.',
    };
  }
  
  // Safari detection
  if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
    const match = userAgent.match(/Version\/(\d+)/);
    const version = match ? parseInt(match[1], 10) : 0;
    
    return {
      name: 'safari',
      version,
      isSupported: version >= 14,
      warning: version >= 14
        ? 'Safari는 제한적으로 지원됩니다. Chrome 사용을 권장합니다.'
        : 'Safari 14 이상이 필요합니다. Chrome 사용을 권장합니다.',
    };
  }
  
  // Unknown browser
  return {
    name: 'unknown',
    version: 0,
    isSupported: false,
    warning: '지원되지 않는 브라우저입니다. Chrome 또는 Edge를 사용해주세요.',
  };
}

/**
 * Check if the browser supports all required features
 * 
 * @returns Object with support status and missing features
 */
export function checkBrowserFeatures(): {
  isSupported: boolean;
  missingFeatures: string[];
} {
  const missingFeatures: string[] = [];
  
  // Check WebAssembly
  if (typeof WebAssembly === 'undefined') {
    missingFeatures.push('WebAssembly');
  }
  
  // Check getUserMedia
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    missingFeatures.push('getUserMedia (Camera Access)');
  }
  
  // Check Canvas 2D
  const canvas = document.createElement('canvas');
  if (!canvas.getContext || !canvas.getContext('2d')) {
    missingFeatures.push('Canvas 2D');
  }
  
  // Check requestAnimationFrame
  if (!window.requestAnimationFrame) {
    missingFeatures.push('requestAnimationFrame');
  }
  
  // Check Performance API
  if (!window.performance || !window.performance.now) {
    missingFeatures.push('Performance API');
  }
  
  return {
    isSupported: missingFeatures.length === 0,
    missingFeatures,
  };
}

/**
 * Get a user-friendly browser recommendation message
 * 
 * @returns Recommendation message based on current browser
 */
export function getBrowserRecommendation(): string | null {
  const browser = detectBrowser();
  
  if (browser.name === 'chrome' && browser.isSupported) {
    return null; // Chrome is optimal, no message needed
  }
  
  if (browser.name === 'edge' && browser.isSupported) {
    return null; // Edge is optimal, no message needed
  }
  
  if (browser.name === 'firefox' && browser.isSupported) {
    return '최적의 성능을 위해 Chrome 또는 Edge 사용을 권장합니다.';
  }
  
  if (browser.name === 'safari') {
    return 'Safari는 제한적으로 지원됩니다. Chrome 또는 Edge 사용을 강력히 권장합니다.';
  }
  
  return 'Chrome 또는 Edge 브라우저를 사용해주세요.';
}

/**
 * Log browser information to console
 * Useful for debugging and support
 */
export function logBrowserInfo(): void {
  const browser = detectBrowser();
  const features = checkBrowserFeatures();
  
  console.group('🌐 Browser Information');
  console.log(`Browser: ${browser.name} ${browser.version}`);
  console.log(`Supported: ${browser.isSupported ? '✅' : '❌'}`);
  
  if (browser.warning) {
    console.warn(`⚠️ ${browser.warning}`);
  }
  
  if (!features.isSupported) {
    console.error('❌ Missing required features:', features.missingFeatures);
  }
  
  console.groupEnd();
}
