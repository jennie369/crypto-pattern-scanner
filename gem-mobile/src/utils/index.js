/**
 * GEM Mobile - Pattern Enhancement Utilities
 * TIER2/3 Feature Exports
 */

// Volume Analysis
export {
  analyzeVolumeProfile,
  confirmVolumeDirection,
  analyzeVolumeSpike,
} from './volumeAnalysis';

// Trend Analysis
export {
  calculateSMA,
  calculateEMA,
  identifyTrend,
  detectTrendStructure,
  isImpulsiveMove,
  calculateATR,
  analyzeTrend,
  assessMarketConditions,
  calculateTrendBonus,
  getTrendAlignment,
} from './trendAnalysis';

// Retest Validation
export {
  validateRetest,
  calculateDistanceFromZone,
  isPriceInZone,
  countRetests,
  getRetestStatus,
} from './retestValidation';

// Support/Resistance
export {
  findKeyLevels,
  checkConfluence,
} from './supportResistance';

// Candle Patterns
export {
  checkCandleConfirmation,
  isBullishEngulfing,
  isBearishEngulfing,
  isHammer,
  isShootingStar,
  isDoji,
  isPinBar,
} from './candlePatterns';

// RSI Divergence
export {
  calculateRSI,
  detectRSIDivergence,
} from './rsiDivergence';

// Dynamic R:R
export {
  calculateATR as calculateATRForRR,
  optimizeRiskReward,
} from './dynamicRR';

// Pattern Lifecycle
export {
  calculatePatternState,
  updatePatternState,
  filterPatternsForDisplay,
  sortPatternsByPriority,
  getActivePatterns,
  getTradeablePatterns,
  calculatePatternStats,
} from './patternLifecycle';

// Pattern Validator
export {
  getPatternSignalInfo,
  validatePatternLevels,
  autoFixPattern,
  validateAndFixPattern,
} from './patternValidator';
