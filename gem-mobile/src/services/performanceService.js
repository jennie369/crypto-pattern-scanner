/**
 * Gemral - Performance Monitoring Service
 * Track và log performance metrics cho debugging và optimization
 *
 * @version 1.0.0
 * @author GEM Team
 */

const SERVICE_NAME = '[PerformanceService]';

// ============================================================
// CONSTANTS
// ============================================================

const THRESHOLDS = {
  RENDER_TIME_WARNING: 16,    // 1 frame at 60fps (16.67ms)
  RENDER_TIME_ERROR: 100,     // Very slow render
  SCROLL_FPS_MIN: 55,         // Minimum acceptable FPS
  MEMORY_WARNING_MB: 200,     // Memory usage warning threshold
};

// ============================================================
// PERFORMANCE MARKERS
// ============================================================

const markers = new Map();

/**
 * Start measuring performance for a named operation
 * @param {string} name - Marker name (e.g., 'PostCard.render', 'FlatList.scroll')
 */
export const startMeasure = (name) => {
  if (!__DEV__) return;

  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  markers.set(name, now);
};

/**
 * End measuring and log if slow
 * @param {string} name - Marker name
 * @param {number} warningThreshold - Custom threshold (ms). Logs SLOW if exceeded.
 * @returns {number|null} Duration in ms or null if not in dev mode
 */
export const endMeasure = (name, warningThreshold = THRESHOLDS.RENDER_TIME_WARNING) => {
  if (!__DEV__) return null;

  const startTime = markers.get(name);
  if (!startTime) {
    console.warn(SERVICE_NAME, 'No start marker found for:', name);
    return null;
  }

  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const duration = now - startTime;
  markers.delete(name);

  // Log based on custom threshold (use passed threshold, not hardcoded)
  if (duration > warningThreshold) {
    console.warn(SERVICE_NAME, `SLOW: ${name} took ${duration.toFixed(2)}ms (threshold: ${warningThreshold}ms)`);
  }

  return duration;
};

/**
 * Measure an async function execution time
 * @param {string} name - Function name for logging
 * @param {function} fn - Async function to measure
 * @returns {Promise<*>} Result of the function
 */
export const measureFunction = async (name, fn) => {
  startMeasure(name);
  try {
    const result = await fn();
    endMeasure(name);
    return result;
  } catch (error) {
    endMeasure(name);
    throw error;
  }
};

// ============================================================
// RENDER TRACKING
// ============================================================

const renderCounts = new Map();
const renderTimestamps = new Map();

/**
 * Track component renders for detecting excessive re-renders
 * @param {string} componentName - Component name
 * @param {string} reason - Reason for render (optional, for debugging)
 */
export const trackRender = (componentName, reason = '') => {
  if (!__DEV__) return;

  const now = Date.now();
  const count = (renderCounts.get(componentName) || 0) + 1;
  renderCounts.set(componentName, count);

  // Track timestamps for rate detection
  const timestamps = renderTimestamps.get(componentName) || [];
  timestamps.push(now);

  // Keep only last 10 timestamps
  if (timestamps.length > 10) {
    timestamps.shift();
  }
  renderTimestamps.set(componentName, timestamps);

  // Detect rapid re-renders (more than 5 in 1 second)
  const recentRenders = timestamps.filter(t => now - t < 1000).length;
  if (recentRenders > 5) {
    console.warn(SERVICE_NAME, `RAPID RE-RENDERS: ${componentName} rendered ${recentRenders} times in 1s`, reason);
  }

  // Log milestone counts
  if (count % 50 === 0) {
    console.log(SERVICE_NAME, `${componentName} total renders: ${count}`);
  }
};

/**
 * Reset render counts (call on navigation/screen change)
 */
export const resetRenderCounts = () => {
  if (!__DEV__) return;
  renderCounts.clear();
  renderTimestamps.clear();
  console.log(SERVICE_NAME, 'Render counts reset');
};

/**
 * Get current render counts for debugging
 * @returns {Object} Map of component names to render counts
 */
export const getRenderCounts = () => {
  if (!__DEV__) return {};
  return Object.fromEntries(renderCounts);
};

// ============================================================
// SCROLL PERFORMANCE
// ============================================================

let scrollFrameCount = 0;
let lastScrollFPSCheck = 0;

/**
 * Track scroll performance - call in onScroll handler
 * Calculates approximate FPS during scrolling
 */
export const trackScroll = () => {
  if (!__DEV__) return;

  const now = Date.now();
  scrollFrameCount++;

  // Calculate FPS every second
  if (now - lastScrollFPSCheck >= 1000) {
    const fps = scrollFrameCount;
    scrollFrameCount = 0;
    lastScrollFPSCheck = now;

    // Only log if actively scrolling and FPS is low
    if (fps > 0 && fps < THRESHOLDS.SCROLL_FPS_MIN) {
      console.warn(SERVICE_NAME, `LOW SCROLL FPS: ${fps} (target: 60)`);
    }
  }
};

/**
 * Reset scroll tracking
 */
export const resetScrollTracking = () => {
  scrollFrameCount = 0;
  lastScrollFPSCheck = 0;
};

// ============================================================
// FLATLIST STATS
// ============================================================

/**
 * Log FlatList performance stats from scroll event
 * @param {Object} event - Scroll event from FlatList
 */
export const logFlatListStats = (event) => {
  if (!__DEV__) return;

  const nativeEvent = event?.nativeEvent;
  if (!nativeEvent) return;

  const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;

  if (!contentSize || !layoutMeasurement) return;

  const scrollY = contentOffset?.y || 0;
  const contentHeight = contentSize.height || 1;
  const viewportHeight = layoutMeasurement.height || 1;
  const scrollProgress = scrollY / Math.max(1, contentHeight - viewportHeight);

  console.log(SERVICE_NAME, 'FlatList stats:', {
    scrollY: Math.round(scrollY),
    contentHeight: Math.round(contentHeight),
    viewportHeight: Math.round(viewportHeight),
    progress: `${(scrollProgress * 100).toFixed(1)}%`,
  });
};

// ============================================================
// DEBUG UTILITIES
// ============================================================

/**
 * Create a performance summary for debugging
 * @returns {Object} Performance summary
 */
export const getPerformanceSummary = () => {
  if (!__DEV__) return {};

  return {
    activeMarkers: markers.size,
    componentRenders: getRenderCounts(),
    thresholds: THRESHOLDS,
  };
};

/**
 * Log performance summary to console
 */
export const logPerformanceSummary = () => {
  if (!__DEV__) return;

  const summary = getPerformanceSummary();
  console.log(SERVICE_NAME, '=== Performance Summary ===');
  console.log(SERVICE_NAME, 'Active markers:', summary.activeMarkers);
  console.log(SERVICE_NAME, 'Component renders:', summary.componentRenders);
};

// ============================================================
// EXPORTS
// ============================================================

const performanceService = {
  // Measurement
  startMeasure,
  endMeasure,
  measureFunction,

  // Render tracking
  trackRender,
  resetRenderCounts,
  getRenderCounts,

  // Scroll performance
  trackScroll,
  resetScrollTracking,
  logFlatListStats,

  // Debug utilities
  getPerformanceSummary,
  logPerformanceSummary,

  // Constants
  THRESHOLDS,
};

export default performanceService;
