/**
 * GEM AI Trading Brain - Service Layer Exports
 * Admin-only AI trading assistant services
 */

// Knowledge Base
export {
  PATTERN_KNOWLEDGE,
  ZONE_CONCEPTS,
  CANDLE_PATTERNS,
  TRADING_RULES,
  KNOWN_BUGS,
  ADMIN_AI_SYSTEM_PROMPT,
  QUICK_ACTION_PROMPTS,
} from './adminAIKnowledge';

// Market Service
export { adminAIMarketService } from './adminAIMarketService';

// Position Service
export {
  adminAIPositionService,
  ALERT_TYPES,
} from './adminAIPositionService';

// Context Service
export {
  adminAIContextService,
  CONTEXT_TYPES,
} from './adminAIContextService';

// Chat Service
export { adminAIChatService } from './adminAIChatService';

// Default export with all services
export default {
  market: require('./adminAIMarketService').adminAIMarketService,
  position: require('./adminAIPositionService').adminAIPositionService,
  context: require('./adminAIContextService').adminAIContextService,
  chat: require('./adminAIChatService').adminAIChatService,
};
