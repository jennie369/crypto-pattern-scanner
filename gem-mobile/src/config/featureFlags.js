/**
 * FEATURE FLAGS
 * Toggle features on/off for gradual rollout
 */

const FEATURE_FLAGS = {
  // Core features
  'memory.enabled': true,
  'memory.extraction': true,
  'memory.personalization': true,

  // Emotion detection
  'emotion.enabled': true,
  'emotion.show_frequency': true,
  'emotion.history': true,
  'emotion.crisis_detection': true,

  // Proactive AI
  'proactive.enabled': true,
  'proactive.daily_insights': true,
  'proactive.ritual_reminders': true,
  'proactive.streak_alerts': true,
  'proactive.pattern_observations': true,
  'proactive.push_notifications': true,

  // Rituals & Habits
  'ritual.enabled': true,
  'ritual.gamification': true,
  'ritual.mood_tracking': true,
  'ritual.default_rituals': true,

  // Gamification
  'gamification.enabled': true,
  'gamification.badges': true,
  'gamification.levels': true,
  'gamification.xp_rewards': true,

  // RAG Search
  'rag.enabled': false, // Enable when vector search is ready
  'rag.course_search': false,

  // Tooltips & Onboarding
  'tooltips.enabled': true,
  'tooltips.feature_announcements': true,

  // Debug/Dev features
  'debug.show_emotion_details': __DEV__,
  'debug.show_memory_context': __DEV__,
  'debug.log_ai_prompts': __DEV__,
};

/**
 * Check if a feature is enabled
 * @param {string} featureKey - Feature key
 * @returns {boolean} Is enabled
 */
export const isFeatureEnabled = (featureKey) => {
  return FEATURE_FLAGS[featureKey] === true;
};

/**
 * Get all feature flags
 * @returns {Object} All flags
 */
export const getAllFlags = () => {
  return { ...FEATURE_FLAGS };
};

/**
 * Check multiple features at once
 * @param {string[]} featureKeys - Array of feature keys
 * @returns {Object} Object with feature keys and their status
 */
export const checkFeatures = (featureKeys) => {
  const result = {};
  for (const key of featureKeys) {
    result[key] = isFeatureEnabled(key);
  }
  return result;
};

/**
 * Feature flag hook helper
 * Use this in components to check feature status
 */
export const FEATURES = {
  // Memory
  MEMORY: 'memory.enabled',
  MEMORY_EXTRACTION: 'memory.extraction',
  MEMORY_PERSONALIZATION: 'memory.personalization',

  // Emotion
  EMOTION: 'emotion.enabled',
  EMOTION_FREQUENCY: 'emotion.show_frequency',
  EMOTION_HISTORY: 'emotion.history',
  CRISIS_DETECTION: 'emotion.crisis_detection',

  // Proactive
  PROACTIVE: 'proactive.enabled',
  DAILY_INSIGHTS: 'proactive.daily_insights',
  RITUAL_REMINDERS: 'proactive.ritual_reminders',
  STREAK_ALERTS: 'proactive.streak_alerts',
  PATTERN_OBSERVATIONS: 'proactive.pattern_observations',
  PUSH_NOTIFICATIONS: 'proactive.push_notifications',

  // Rituals
  RITUALS: 'ritual.enabled',
  RITUAL_GAMIFICATION: 'ritual.gamification',
  MOOD_TRACKING: 'ritual.mood_tracking',

  // Gamification
  GAMIFICATION: 'gamification.enabled',
  BADGES: 'gamification.badges',
  LEVELS: 'gamification.levels',
  XP_REWARDS: 'gamification.xp_rewards',

  // RAG
  RAG: 'rag.enabled',
  COURSE_SEARCH: 'rag.course_search',

  // Tooltips
  TOOLTIPS: 'tooltips.enabled',
  ANNOUNCEMENTS: 'tooltips.feature_announcements',

  // Debug
  DEBUG_EMOTION: 'debug.show_emotion_details',
  DEBUG_MEMORY: 'debug.show_memory_context',
  DEBUG_PROMPTS: 'debug.log_ai_prompts',
};

export default FEATURE_FLAGS;
