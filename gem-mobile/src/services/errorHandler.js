/**
 * Error Handler Service
 * Phase 5: Production
 *
 * Error handling features:
 * - Error Classification
 * - Error Logging to Database
 * - Recovery Strategies (retry with backoff, fallback)
 * - Error Boundaries Integration
 * - User-Friendly Error Messages
 * - Severity Levels
 */

import { supabase } from './supabase';
import { Alert } from 'react-native';

// ============================================================================
// ERROR TYPES & CLASSIFICATION
// ============================================================================

const ERROR_TYPES = {
  NETWORK: 'network',
  AUTH: 'auth',
  VALIDATION: 'validation',
  SERVER: 'server',
  DATABASE: 'database',
  PAYMENT: 'payment',
  RATE_LIMIT: 'rate_limit',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown',
};

const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Error messages in Vietnamese
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: {
    title: 'Loi ket noi',
    message: 'Khong the ket noi den may chu. Vui long kiem tra ket noi mang.',
  },
  [ERROR_TYPES.AUTH]: {
    title: 'Loi xac thuc',
    message: 'Phien dang nhap da het han. Vui long dang nhap lai.',
  },
  [ERROR_TYPES.VALIDATION]: {
    title: 'Du lieu khong hop le',
    message: 'Vui long kiem tra lai thong tin da nhap.',
  },
  [ERROR_TYPES.SERVER]: {
    title: 'Loi he thong',
    message: 'Da co loi xay ra. Vui long thu lai sau.',
  },
  [ERROR_TYPES.DATABASE]: {
    title: 'Loi du lieu',
    message: 'Khong the truy cap du lieu. Vui long thu lai.',
  },
  [ERROR_TYPES.PAYMENT]: {
    title: 'Loi thanh toan',
    message: 'Khong the xu ly thanh toan. Vui long thu lai.',
  },
  [ERROR_TYPES.RATE_LIMIT]: {
    title: 'Qua nhieu yeu cau',
    message: 'Ban da gui qua nhieu yeu cau. Vui long doi mot chut.',
  },
  [ERROR_TYPES.TIMEOUT]: {
    title: 'Het thoi gian cho',
    message: 'Yeu cau mat qua nhieu thoi gian. Vui long thu lai.',
  },
  [ERROR_TYPES.UNKNOWN]: {
    title: 'Loi khong xac dinh',
    message: 'Da co loi xay ra. Vui long thu lai sau.',
  },
};

// ============================================================================
// ERROR CLASSIFIER
// ============================================================================

class ErrorClassifier {
  classify(error) {
    const errorString = error?.message?.toLowerCase() || '';
    const statusCode = error?.status || error?.statusCode;

    // Network errors
    if (
      errorString.includes('network') ||
      errorString.includes('fetch') ||
      errorString.includes('connection') ||
      error?.name === 'TypeError'
    ) {
      return {
        type: ERROR_TYPES.NETWORK,
        severity: SEVERITY_LEVELS.MEDIUM,
        isRetryable: true,
      };
    }

    // Auth errors
    if (
      statusCode === 401 ||
      statusCode === 403 ||
      errorString.includes('auth') ||
      errorString.includes('token') ||
      errorString.includes('unauthorized') ||
      errorString.includes('forbidden')
    ) {
      return {
        type: ERROR_TYPES.AUTH,
        severity: SEVERITY_LEVELS.HIGH,
        isRetryable: false,
      };
    }

    // Validation errors
    if (
      statusCode === 400 ||
      statusCode === 422 ||
      errorString.includes('validation') ||
      errorString.includes('invalid') ||
      errorString.includes('required')
    ) {
      return {
        type: ERROR_TYPES.VALIDATION,
        severity: SEVERITY_LEVELS.LOW,
        isRetryable: false,
      };
    }

    // Rate limit
    if (statusCode === 429 || errorString.includes('rate limit')) {
      return {
        type: ERROR_TYPES.RATE_LIMIT,
        severity: SEVERITY_LEVELS.MEDIUM,
        isRetryable: true,
        retryAfter: 60000, // Wait 1 minute
      };
    }

    // Timeout
    if (errorString.includes('timeout') || error?.code === 'ECONNABORTED') {
      return {
        type: ERROR_TYPES.TIMEOUT,
        severity: SEVERITY_LEVELS.MEDIUM,
        isRetryable: true,
      };
    }

    // Server errors
    if (statusCode >= 500) {
      return {
        type: ERROR_TYPES.SERVER,
        severity: SEVERITY_LEVELS.HIGH,
        isRetryable: true,
      };
    }

    // Database errors
    if (errorString.includes('database') || errorString.includes('postgres')) {
      return {
        type: ERROR_TYPES.DATABASE,
        severity: SEVERITY_LEVELS.HIGH,
        isRetryable: true,
      };
    }

    // Payment errors
    if (
      errorString.includes('payment') ||
      errorString.includes('charge') ||
      errorString.includes('transaction')
    ) {
      return {
        type: ERROR_TYPES.PAYMENT,
        severity: SEVERITY_LEVELS.CRITICAL,
        isRetryable: false,
      };
    }

    // Unknown
    return {
      type: ERROR_TYPES.UNKNOWN,
      severity: SEVERITY_LEVELS.MEDIUM,
      isRetryable: true,
    };
  }
}

// ============================================================================
// ERROR LOGGER
// ============================================================================

class ErrorLogger {
  constructor() {
    this.queue = [];
    this.batchSize = 10;
    this.flushInterval = null;
  }

  async log(error, context = {}) {
    const classification = errorHandler.classify(error);

    const logEntry = {
      error_type: classification.type,
      error_code: error?.code || null,
      error_message: error?.message || 'Unknown error',
      stack_trace: error?.stack || null,
      user_id: context.userId || null,
      session_id: context.sessionId || null,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        platform: 'mobile',
      },
      severity: classification.severity,
    };

    this.queue.push(logEntry);

    // Flush if queue is full or severity is critical
    if (
      this.queue.length >= this.batchSize ||
      classification.severity === SEVERITY_LEVELS.CRITICAL
    ) {
      await this.flush();
    }
  }

  async flush() {
    if (this.queue.length === 0) return;

    const entries = this.queue.splice(0, this.batchSize);

    try {
      await supabase.from('error_logs').insert(entries);
    } catch (err) {
      // Silent fail - don't recursively log errors
      console.warn('[ErrorLogger] Failed to flush:', err.message);
      // Put entries back in queue
      this.queue.unshift(...entries);
    }
  }

  startAutoFlush(intervalMs = 30000) {
    this.flushInterval = setInterval(() => this.flush(), intervalMs);
  }

  stopAutoFlush() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }
}

// ============================================================================
// RECOVERY STRATEGIES
// ============================================================================

class RecoveryManager {
  constructor() {
    this.fallbacks = new Map();
    this.retryDelays = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff
  }

  registerFallback(key, fallbackValue) {
    this.fallbacks.set(key, fallbackValue);
  }

  getFallback(key) {
    return this.fallbacks.get(key);
  }

  async withRetry(fn, options = {}) {
    const {
      maxRetries = 3,
      onRetry = () => {},
      retryCondition = () => true,
      fallbackKey = null,
    } = options;

    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const classification = errorHandler.classify(error);

        // Check if we should retry
        if (
          attempt < maxRetries &&
          classification.isRetryable &&
          retryCondition(error, attempt)
        ) {
          const delay =
            classification.retryAfter ||
            this.retryDelays[Math.min(attempt, this.retryDelays.length - 1)];

          onRetry(error, attempt + 1, delay);
          await this.sleep(delay);
        } else {
          break;
        }
      }
    }

    // All retries failed - try fallback
    if (fallbackKey && this.fallbacks.has(fallbackKey)) {
      console.warn(`[Recovery] Using fallback for ${fallbackKey}`);
      return this.fallbacks.get(fallbackKey);
    }

    throw lastError;
  }

  async withFallback(fn, fallbackValue) {
    try {
      return await fn();
    } catch (error) {
      console.warn('[Recovery] Using inline fallback:', error.message);
      return typeof fallbackValue === 'function' ? fallbackValue(error) : fallbackValue;
    }
  }

  async withTimeout(fn, timeoutMs = 10000) {
    return Promise.race([
      fn(),
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout'));
        }, timeoutMs);
      }),
    ]);
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// ERROR REPORTER UI
// ============================================================================

class ErrorReporter {
  constructor() {
    this.errorQueue = [];
    this.isShowingError = false;
  }

  show(error, options = {}) {
    const { silent = false, actionLabel = 'Thu lai', onAction = null } = options;

    const classification = errorHandler.classify(error);
    const messages = ERROR_MESSAGES[classification.type] || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN];

    if (silent) {
      console.error(`[Error] ${messages.title}: ${error.message}`);
      return;
    }

    // Queue errors if one is already showing
    if (this.isShowingError) {
      this.errorQueue.push({ error, options });
      return;
    }

    this.isShowingError = true;

    const buttons = [
      {
        text: 'Dong',
        style: 'cancel',
        onPress: () => this.onDismiss(),
      },
    ];

    if (classification.isRetryable && onAction) {
      buttons.push({
        text: actionLabel,
        onPress: () => {
          this.onDismiss();
          onAction();
        },
      });
    }

    Alert.alert(messages.title, messages.message, buttons);
  }

  onDismiss() {
    this.isShowingError = false;

    // Show next queued error
    if (this.errorQueue.length > 0) {
      const next = this.errorQueue.shift();
      setTimeout(() => this.show(next.error, next.options), 500);
    }
  }

  showToast(message, type = 'error') {
    // This would integrate with a toast library
    console.log(`[Toast] ${type}: ${message}`);
  }
}

// ============================================================================
// GLOBAL ERROR BOUNDARY HELPER
// ============================================================================

class ErrorBoundaryHelper {
  constructor() {
    this.errorBoundaries = new Map();
  }

  register(componentName, resetFn) {
    this.errorBoundaries.set(componentName, resetFn);
  }

  unregister(componentName) {
    this.errorBoundaries.delete(componentName);
  }

  resetBoundary(componentName) {
    const resetFn = this.errorBoundaries.get(componentName);
    if (resetFn) {
      resetFn();
    }
  }

  resetAll() {
    this.errorBoundaries.forEach((resetFn) => resetFn());
  }
}

// ============================================================================
// MAIN ERROR HANDLER
// ============================================================================

class ErrorHandler {
  constructor() {
    this.classifier = new ErrorClassifier();
    this.logger = new ErrorLogger();
    this.recovery = new RecoveryManager();
    this.reporter = new ErrorReporter();
    this.boundaryHelper = new ErrorBoundaryHelper();
    this.errorListeners = [];
  }

  initialize() {
    this.logger.startAutoFlush();

    // Register common fallbacks
    this.recovery.registerFallback('products', []);
    this.recovery.registerFallback('comments', []);
    this.recovery.registerFallback('user', null);
    this.recovery.registerFallback('settings', {});
  }

  classify(error) {
    return this.classifier.classify(error);
  }

  async log(error, context = {}) {
    return this.logger.log(error, context);
  }

  async withRetry(fn, options = {}) {
    return this.recovery.withRetry(fn, options);
  }

  async withFallback(fn, fallbackValue) {
    return this.recovery.withFallback(fn, fallbackValue);
  }

  async withTimeout(fn, timeoutMs = 10000) {
    return this.recovery.withTimeout(fn, timeoutMs);
  }

  show(error, options = {}) {
    return this.reporter.show(error, options);
  }

  showToast(message, type = 'error') {
    return this.reporter.showToast(message, type);
  }

  // Convenience method for handling errors with logging and UI
  async handle(error, context = {}, options = {}) {
    const classification = this.classify(error);

    // Log error
    await this.log(error, context);

    // Notify listeners
    this.errorListeners.forEach((listener) => {
      try {
        listener(error, classification, context);
      } catch (e) {
        // Ignore listener errors
      }
    });

    // Show error to user if not silent
    if (!options.silent) {
      this.show(error, options);
    }

    return classification;
  }

  // Add error listener
  addListener(listener) {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this.errorListeners.filter((l) => l !== listener);
    };
  }

  // Wrap async function with error handling
  wrap(fn, options = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        await this.handle(error, options.context || {}, options);
        if (options.rethrow) throw error;
        return options.fallback;
      }
    };
  }

  // Register error boundary
  registerBoundary(componentName, resetFn) {
    this.boundaryHelper.register(componentName, resetFn);
  }

  unregisterBoundary(componentName) {
    this.boundaryHelper.unregister(componentName);
  }

  resetBoundary(componentName) {
    this.boundaryHelper.resetBoundary(componentName);
  }

  resetAllBoundaries() {
    this.boundaryHelper.resetAll();
  }

  // Cleanup
  cleanup() {
    this.logger.stopAutoFlush();
    this.logger.flush();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const errorHandler = new ErrorHandler();
export const ERROR_TYPES_ENUM = ERROR_TYPES;
export const SEVERITY_LEVELS_ENUM = SEVERITY_LEVELS;

export {
  ErrorClassifier,
  ErrorLogger,
  RecoveryManager,
  ErrorReporter,
  ErrorBoundaryHelper,
};

export default errorHandler;
