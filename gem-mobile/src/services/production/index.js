/**
 * Production Services
 * Phase 5: Production
 *
 * Export all Phase 5 production services:
 * - Performance Optimizer (caching, batching, lazy loading)
 * - Error Handler (classification, recovery, logging)
 * - Health Check Service (monitoring, status)
 * - Beta Feedback Service (user feedback)
 */

// Performance Optimizer
export {
  performanceOptimizer,
  LRUCache,
  PersistentCache,
  RequestDeduplicator,
  RequestBatcher,
  CircuitBreaker,
  PerformanceMetrics,
  OptimizedDataFetcher,
  LazyLoader,
  ImagePreloader,
  default as PerformanceOptimizer,
} from '../performanceOptimizer';

// Error Handler
export {
  errorHandler,
  ERROR_TYPES_ENUM,
  SEVERITY_LEVELS_ENUM,
  ErrorClassifier,
  ErrorLogger,
  RecoveryManager,
  ErrorReporter,
  ErrorBoundaryHelper,
  default as ErrorHandler,
} from '../errorHandler';

// Health Check
export {
  healthCheckService,
  HEALTH_STATUS_ENUM,
  SERVICE_NAMES_ENUM,
  HealthChecker,
  default as HealthCheckService,
} from '../healthCheckService';

// Beta Feedback
export {
  betaFeedbackService,
  FEEDBACK_TYPES_ENUM,
  FEEDBACK_PRIORITY_ENUM,
  FEEDBACK_STATUS_ENUM,
  default as BetaFeedbackService,
} from '../betaFeedbackService';

// ============================================================================
// INITIALIZATION
// ============================================================================

export const initializeProductionServices = async () => {
  const { performanceOptimizer } = await import('../performanceOptimizer');
  const { errorHandler } = await import('../errorHandler');
  const { healthCheckService } = await import('../healthCheckService');
  const { betaFeedbackService } = await import('../betaFeedbackService');

  // Initialize services
  performanceOptimizer.initialize();
  errorHandler.initialize();
  healthCheckService.initialize();
  await betaFeedbackService.initialize();

  // Start health monitoring (every 5 minutes)
  healthCheckService.startMonitoring(5 * 60 * 1000);

  return {
    performanceOptimizer,
    errorHandler,
    healthCheckService,
    betaFeedbackService,
  };
};

// ============================================================================
// CLEANUP
// ============================================================================

export const cleanupProductionServices = () => {
  const { performanceOptimizer } = require('../performanceOptimizer');
  const { errorHandler } = require('../errorHandler');
  const { healthCheckService } = require('../healthCheckService');
  const { betaFeedbackService } = require('../betaFeedbackService');

  performanceOptimizer.cleanup();
  errorHandler.cleanup();
  healthCheckService.cleanup();
  betaFeedbackService.cleanup();
};
