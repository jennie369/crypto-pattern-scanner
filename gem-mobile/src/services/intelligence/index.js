/**
 * Intelligence Layer Services
 * Phase 4: GEMRAL AI Livestream
 *
 * Export all Phase 4 intelligence services:
 * - Recommendation Service (4 strategies)
 * - Analytics Service (livestream events)
 * - Preference Learning Service
 * - Proactive Engagement Service (6 triggers)
 * - Notification Service (livestream types)
 * - A/B Testing Service
 */

// Recommendation
export {
  livestreamRecommendationService,
  default as LivestreamRecommendationService,
} from '../livestreamRecommendationService';

// Analytics
export {
  livestreamAnalyticsService,
  default as LivestreamAnalyticsService,
} from '../livestreamAnalyticsService';

// Preference Learning
export {
  preferenceLearningService,
  default as PreferenceLearningService,
} from '../preferenceLearningService';

// Proactive Engagement
export {
  proactiveEngagementService,
  default as ProactiveEngagementService,
} from '../proactiveEngagementService';

// Notifications
export {
  livestreamNotificationService,
  TYPES as NOTIFICATION_TYPES,
  default as LivestreamNotificationService,
} from '../livestreamNotificationService';

// A/B Testing
export {
  abTestingService,
  default as ABTestingService,
} from '../abTestingService';

// Initialize all services
export const initializeIntelligenceServices = async (userId) => {
  const { abTestingService } = await import('../abTestingService');
  const { livestreamNotificationService } = await import('../livestreamNotificationService');
  const { livestreamAnalyticsService } = await import('../livestreamAnalyticsService');

  // Initialize A/B testing
  await abTestingService.initialize();

  // Initialize notifications
  await livestreamNotificationService.initialize();

  // Set user for analytics
  if (userId) {
    livestreamAnalyticsService.setUser(userId);
  }

  return {
    abTestingService,
    livestreamNotificationService,
    livestreamAnalyticsService,
  };
};

// Cleanup all services
export const cleanupIntelligenceServices = () => {
  const { proactiveEngagementService } = require('../proactiveEngagementService');
  const { livestreamAnalyticsService } = require('../livestreamAnalyticsService');

  proactiveEngagementService.cleanup();
  livestreamAnalyticsService.cleanup();
};
