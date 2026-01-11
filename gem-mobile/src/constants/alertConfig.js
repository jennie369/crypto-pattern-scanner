/**
 * GEM Mobile - Alert System Configuration
 * Phase 3C: Alert types, priorities, and preferences
 */

import { COLORS } from '../utils/tokens';

/**
 * Alert Types Configuration
 */
export const ALERT_TYPES = {
  FTB: {
    id: 'ftb',
    name: 'First Time Back',
    nameVi: 'Lần Đầu Quay Lại',
    icon: 'Star',
    color: COLORS.gold,
    priority: 1, // Highest priority
    description: 'Alert khi giá quay lại zone lần đầu tiên',
    descriptionEn: 'Alert when price returns to zone for the first time',
  },
  FTB_APPROACHING: {
    id: 'ftb_approaching',
    name: 'FTB Approaching',
    nameVi: 'FTB Đang Đến',
    icon: 'Star',
    color: COLORS.gold,
    priority: 2,
    description: 'Alert khi giá đang tiến gần zone FTB',
    descriptionEn: 'Alert when price is approaching FTB zone',
  },
  ZONE_APPROACH: {
    id: 'zone_approach',
    name: 'Zone Approach',
    nameVi: 'Tiếp Cận Zone',
    icon: 'Target',
    color: COLORS.success,
    priority: 2,
    description: 'Alert khi giá đang tiến gần zone',
    descriptionEn: 'Alert when price is approaching a zone',
  },
  CONFIRMATION: {
    id: 'confirmation',
    name: 'Confirmation Pattern',
    nameVi: 'Pattern Xác Nhận',
    icon: 'CheckCircle',
    color: COLORS.primary,
    priority: 3,
    description: 'Alert khi xuất hiện confirmation pattern',
    descriptionEn: 'Alert when confirmation pattern appears',
  },
  ZONE_BROKEN: {
    id: 'zone_broken',
    name: 'Zone Broken',
    nameVi: 'Zone Bị Phá',
    icon: 'AlertTriangle',
    color: COLORS.error,
    priority: 2,
    description: 'Alert khi zone bị invalidate',
    descriptionEn: 'Alert when zone is invalidated',
  },
  PRICE_LEVEL: {
    id: 'price_level',
    name: 'Price Level',
    nameVi: 'Mức Giá',
    icon: 'DollarSign',
    color: COLORS.purple,
    priority: 4,
    description: 'Alert khi giá chạm mức đã set',
    descriptionEn: 'Alert when price hits a set level',
  },
  STACKED_ZONE: {
    id: 'stacked_zone',
    name: 'Stacked Zone',
    nameVi: 'Zone Chồng',
    icon: 'Layers',
    color: COLORS.warning,
    priority: 1,
    description: 'Alert khi phát hiện stacked zones',
    descriptionEn: 'Alert when stacked zones detected',
  },
  HIGH_SCORE: {
    id: 'high_score',
    name: 'High Odds Score',
    nameVi: 'Điểm Cao',
    icon: 'Award',
    color: COLORS.success,
    priority: 2,
    description: 'Alert khi zone có odds score A+ hoặc A',
    descriptionEn: 'Alert when zone has A+ or A odds score',
  },
  PIN_ENGULF_COMBO: {
    id: 'pin_engulf_combo',
    name: 'Pin + Engulf Combo',
    nameVi: 'Combo Pin + Engulf',
    icon: 'Zap',
    color: COLORS.success,
    priority: 1,
    description: 'Alert khi có combo siêu mạnh',
    descriptionEn: 'Alert when super strong combo detected',
  },
};

/**
 * Get alert config by type
 * @param {string} alertType - Alert type ID
 * @returns {Object} Alert configuration
 */
export const getAlertConfig = (alertType) => {
  const upperType = alertType?.toUpperCase()?.replace(/-/g, '_');
  return ALERT_TYPES[upperType] || ALERT_TYPES.PRICE_LEVEL;
};

/**
 * Trigger conditions for price alerts
 */
export const TRIGGER_CONDITIONS = {
  ABOVE: {
    id: 'above',
    name: 'Crosses Above',
    nameVi: 'Vượt Lên',
    description: 'Alert khi giá vượt qua mức từ dưới lên',
  },
  BELOW: {
    id: 'below',
    name: 'Crosses Below',
    nameVi: 'Xuống Dưới',
    description: 'Alert khi giá giảm xuống dưới mức',
  },
  CROSS: {
    id: 'cross',
    name: 'Crosses',
    nameVi: 'Cắt Qua',
    description: 'Alert khi giá cắt qua mức (cả 2 chiều)',
  },
  TOUCH: {
    id: 'touch',
    name: 'Touches',
    nameVi: 'Chạm',
    description: 'Alert khi giá chạm vào mức',
  },
};

/**
 * Default alert preferences
 */
export const DEFAULT_ALERT_PREFERENCES = {
  alertsEnabled: true,
  quietHoursStart: null,
  quietHoursEnd: null,

  // Alert type toggles
  ftbAlerts: true,
  zoneApproachAlerts: true,
  confirmationAlerts: true,
  priceAlerts: true,
  zoneBrokenAlerts: true,
  highScoreAlerts: true,
  stackedZoneAlerts: true,

  // Thresholds
  approachDistancePercent: 1.0, // Alert when 1% away from zone
  minOddsScore: 8, // Minimum C grade

  // Notification channels
  pushEnabled: true,
  telegramEnabled: false,
  telegramChatId: null,
};

/**
 * Priority colors for sorting
 */
export const PRIORITY_COLORS = {
  1: COLORS.gold,    // Highest - FTB, Stacked, Combo
  2: COLORS.warning, // High - Approach, Broken, High Score
  3: COLORS.primary, // Medium - Confirmation
  4: COLORS.textSecondary, // Low - Price Level
};

/**
 * Get sorted alert types by priority
 * @returns {Array} Sorted alert types
 */
export const getSortedAlertTypes = () => {
  return Object.values(ALERT_TYPES).sort((a, b) => a.priority - b.priority);
};

/**
 * Check if alert type is high priority
 * @param {string} alertType - Alert type ID
 * @returns {boolean} True if high priority
 */
export const isHighPriority = (alertType) => {
  const config = getAlertConfig(alertType);
  return config.priority <= 2;
};

export default {
  ALERT_TYPES,
  getAlertConfig,
  TRIGGER_CONDITIONS,
  DEFAULT_ALERT_PREFERENCES,
  PRIORITY_COLORS,
  getSortedAlertTypes,
  isHighPriority,
};
