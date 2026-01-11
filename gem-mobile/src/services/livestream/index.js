/**
 * GEMRAL AI Livestream Services
 * Export all livestream-related services
 */

// Core Services
export { streamingService, streamHealthMonitor } from '../streamingService';
export { compositorService, layoutCalculator } from '../compositorService';
export { default as livestreamService } from '../livestreamService';

// TTS & Avatar
export { default as ttsService } from '../ttsService';
export { default as avatarService } from '../avatarService';

// Platform Listeners
export {
  tiktokListenerService,
  mockTiktokListener,
} from '../tiktokListenerService';
export {
  facebookListenerService,
  mockFacebookListener,
} from '../facebookListenerService';

// AI Brain
export { default as aiBrainService } from '../aiBrainService';
export { default as intentClassifierService } from '../intentClassifierService';
export { default as emotionDetectorService } from '../emotionDetectorService';
export { default as knowledgeBaseService } from '../knowledgeBaseService';

// Comments & Engagement
export { default as commentAggregatorService } from '../commentAggregatorService';
export { default as commentModerationService } from '../commentModerationService';
export { default as proactiveEngagementService } from '../proactiveEngagementService';

// Analytics & Notifications
export { default as livestreamAnalyticsService } from '../livestreamAnalyticsService';
export { default as livestreamNotificationService } from '../livestreamNotificationService';
export { default as livestreamGiftService } from '../livestreamGiftService';
export { default as livestreamRecommendationService } from '../livestreamRecommendationService';

// NLP
export { vietnameseNLP, INTENT_KEYWORDS, SLANG_MAPPING } from '../nlp';
export { detectIntentEnhanced, detectIntent, isQuestion, detectSentiment, detectUrgency } from '../intentDetector';

// Production
export * from '../production';
