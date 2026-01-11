/**
 * GEM Mobile - Alert Condition Checking Service
 * Phase 3C: Alert trigger logic for all alert types
 */

import { checkFTBStatus } from './ftbTracker';
import { validateLookRight } from './lookRightValidator';
import { scanConfirmationPatterns, calculateConfirmationScore } from './confirmationPatterns';
import { detectPinEngulfCombo } from './pinEngulfCombo';

/**
 * Check all alert conditions for a zone
 * @param {Object} zone - Zone to check
 * @param {number} currentPrice - Current market price
 * @param {Array} recentCandles - Recent candles for confirmation check
 * @param {Object} preferences - User alert preferences
 * @returns {Array} Array of triggered alerts
 */
export const checkAlertConditions = (zone, currentPrice, recentCandles = [], preferences = {}) => {
  const alerts = [];

  if (!zone || !currentPrice) return alerts;

  // 1. FTB Alert (highest priority)
  if (preferences.ftbAlerts !== false) {
    const ftbAlert = checkFTBAlert(zone, currentPrice);
    if (ftbAlert) alerts.push(ftbAlert);
  }

  // 2. Zone Approach Alert
  if (preferences.zoneApproachAlerts !== false) {
    const approachAlert = checkZoneApproachAlert(zone, currentPrice, preferences.approachDistancePercent);
    if (approachAlert) alerts.push(approachAlert);
  }

  // 3. Confirmation Alert
  if (preferences.confirmationAlerts !== false && recentCandles.length >= 3) {
    const confirmAlert = checkConfirmationAlert(zone, recentCandles);
    if (confirmAlert) alerts.push(confirmAlert);
  }

  // 4. Pin + Engulf Combo Alert (high priority)
  if (recentCandles.length >= 2) {
    const comboAlert = checkPinEngulfComboAlert(zone, recentCandles);
    if (comboAlert) alerts.push(comboAlert);
  }

  // 5. Zone Broken Alert
  if (preferences.zoneBrokenAlerts !== false) {
    const brokenAlert = checkZoneBrokenAlert(zone, recentCandles);
    if (brokenAlert) alerts.push(brokenAlert);
  }

  // 6. High Score Alert
  if (preferences.highScoreAlerts !== false) {
    const minScore = preferences.minOddsScore || 12;
    if (zone.oddsScore >= minScore) {
      alerts.push(createHighScoreAlert(zone));
    }
  }

  // Sort by priority (lowest number = highest priority)
  return alerts.sort((a, b) => a.priority - b.priority);
};

/**
 * Check FTB (First Time Back) alert
 * @param {Object} zone - Zone to check
 * @param {number} currentPrice - Current price
 * @returns {Object|null} Alert or null
 */
const checkFTBAlert = (zone, currentPrice) => {
  const ftbStatus = checkFTBStatus(zone, currentPrice, zone.testCount || 0);

  // FTB + price is IN the zone
  if (ftbStatus?.isFTB && ftbStatus?.priceStatus?.isInZone) {
    return {
      type: 'ftb',
      priority: 1,
      title: `FTB Alert: ${zone.symbol}`,
      titleVi: `FTB Alert: ${zone.symbol}`,
      message: `Giá đang trong zone LẦN ĐẦU TIÊN! Entry opportunity.`,
      messageEn: `Price is IN the zone for the FIRST TIME! Entry opportunity.`,
      zone,
      currentPrice,
      ftbStatus,
      actionRequired: true,
      suggestedAction: zone.zoneType === 'LFZ' ? 'BUY' : 'SELL',
      createdAt: new Date().toISOString(),
    };
  }

  // FTB + price is approaching
  if (ftbStatus?.isFirstTimeBack && ftbStatus?.priceStatus?.isNear) {
    return {
      type: 'ftb_approaching',
      priority: 2,
      title: `FTB Approaching: ${zone.symbol}`,
      titleVi: `FTB Đang Đến: ${zone.symbol}`,
      message: `Giá cách zone ${ftbStatus.priceStatus.distancePercent}%. Chuẩn bị entry.`,
      messageEn: `Price is ${ftbStatus.priceStatus.distancePercent}% from zone. Prepare for entry.`,
      zone,
      currentPrice,
      ftbStatus,
      actionRequired: false,
      createdAt: new Date().toISOString(),
    };
  }

  return null;
};

/**
 * Check Zone Approach alert
 * @param {Object} zone - Zone to check
 * @param {number} currentPrice - Current price
 * @param {number} thresholdPercent - Distance threshold
 * @returns {Object|null} Alert or null
 */
const checkZoneApproachAlert = (zone, currentPrice, thresholdPercent = 1.0) => {
  const entryPrice = zone.entryPrice;
  const distance = Math.abs(currentPrice - entryPrice);
  const distancePercent = (distance / currentPrice) * 100;

  // Price is close but not too close (between 0.1% and threshold)
  if (distancePercent <= thresholdPercent && distancePercent > 0.1) {
    // Check direction
    const isApproaching = zone.zoneType === 'LFZ'
      ? currentPrice > entryPrice
      : currentPrice < entryPrice;

    if (isApproaching) {
      return {
        type: 'zone_approach',
        priority: 2,
        title: `Zone Approach: ${zone.symbol}`,
        titleVi: `Tiếp Cận Zone: ${zone.symbol}`,
        message: `Giá cách zone ${distancePercent.toFixed(2)}%. ${zone.zoneType} tại ${entryPrice.toFixed(4)}`,
        messageEn: `Price is ${distancePercent.toFixed(2)}% from zone. ${zone.zoneType} at ${entryPrice.toFixed(4)}`,
        zone,
        currentPrice,
        distancePercent,
        actionRequired: false,
        createdAt: new Date().toISOString(),
      };
    }
  }

  return null;
};

/**
 * Check Confirmation Pattern alert
 * @param {Object} zone - Zone to check
 * @param {Array} candles - Recent candles
 * @returns {Object|null} Alert or null
 */
const checkConfirmationAlert = (zone, candles) => {
  if (!candles || candles.length < 2) return null;

  const patterns = scanConfirmationPatterns(candles, zone);

  if (patterns.length > 0) {
    const bestPattern = patterns[0];
    const totalScore = calculateConfirmationScore(patterns);

    // Only alert for meaningful confirmations
    if (totalScore >= 3) {
      const patternName = bestPattern.pattern?.nameVi || bestPattern.patternId || 'Pattern';

      return {
        type: 'confirmation',
        priority: 3,
        title: `Confirmation: ${zone.symbol}`,
        titleVi: `Xác Nhận: ${zone.symbol}`,
        message: `${patternName} tại ${zone.zoneType}. Score: ${totalScore}`,
        messageEn: `${bestPattern.pattern?.name || patternName} at ${zone.zoneType}. Score: ${totalScore}`,
        zone,
        patterns,
        totalScore,
        bestPattern,
        actionRequired: totalScore >= 5,
        suggestedAction: bestPattern.type === 'bullish' ? 'BUY' : 'SELL',
        createdAt: new Date().toISOString(),
      };
    }
  }

  return null;
};

/**
 * Check Pin + Engulf Combo alert
 * @param {Object} zone - Zone to check
 * @param {Array} candles - Recent candles
 * @returns {Object|null} Alert or null
 */
const checkPinEngulfComboAlert = (zone, candles) => {
  if (!candles || candles.length < 2) return null;

  const combo = detectPinEngulfCombo(candles, zone);

  if (combo && combo.hasPinEngulfCombo) {
    return {
      type: 'pin_engulf_combo',
      priority: 1,
      title: `Combo Alert: ${zone.symbol}`,
      titleVi: `Combo Siêu Mạnh: ${zone.symbol}`,
      message: `${combo.comboTypeVi} tại ${zone.zoneType}! Reliability: ${combo.reliability}%`,
      messageEn: `${combo.comboType} at ${zone.zoneType}! Reliability: ${combo.reliability}%`,
      zone,
      combo,
      actionRequired: true,
      suggestedAction: combo.type === 'bullish' ? 'BUY' : 'SELL',
      createdAt: new Date().toISOString(),
    };
  }

  return null;
};

/**
 * Check Zone Broken alert
 * @param {Object} zone - Zone to check
 * @param {Array} candles - Recent candles
 * @returns {Object|null} Alert or null
 */
const checkZoneBrokenAlert = (zone, candles) => {
  if (!candles || candles.length === 0) return null;

  const validation = validateLookRight(zone, candles);

  if (!validation.isValid) {
    return {
      type: 'zone_broken',
      priority: 2,
      title: `Zone Broken: ${zone.symbol}`,
      titleVi: `Zone Bị Phá: ${zone.symbol}`,
      message: `${zone.zoneType} bị phá vỡ! Không trade zone này.`,
      messageEn: `${zone.zoneType} has been broken! Do not trade this zone.`,
      zone,
      validation,
      actionRequired: true,
      suggestedAction: 'CANCEL_ORDERS',
      createdAt: new Date().toISOString(),
    };
  }

  return null;
};

/**
 * Create High Score alert
 * @param {Object} zone - Zone with high score
 * @returns {Object} Alert object
 */
const createHighScoreAlert = (zone) => {
  return {
    type: 'high_score',
    priority: 2,
    title: `High Score: ${zone.symbol}`,
    titleVi: `Điểm Cao: ${zone.symbol}`,
    message: `${zone.zoneType} với Odds Score ${zone.oddsGrade} (${zone.oddsScore}/16)`,
    messageEn: `${zone.zoneType} with Odds Score ${zone.oddsGrade} (${zone.oddsScore}/16)`,
    zone,
    actionRequired: false,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Check price level alert
 * @param {Object} alertConfig - Alert configuration
 * @param {number} currentPrice - Current price
 * @param {number} previousPrice - Previous price
 * @returns {Object|null} Alert or null
 */
export const checkPriceLevelAlert = (alertConfig, currentPrice, previousPrice) => {
  const { triggerPrice, triggerCondition, symbol } = alertConfig;

  if (!triggerPrice || !currentPrice) return null;

  let triggered = false;

  switch (triggerCondition) {
    case 'above':
      triggered = currentPrice >= triggerPrice && previousPrice < triggerPrice;
      break;
    case 'below':
      triggered = currentPrice <= triggerPrice && previousPrice > triggerPrice;
      break;
    case 'cross':
      triggered =
        (currentPrice >= triggerPrice && previousPrice < triggerPrice) ||
        (currentPrice <= triggerPrice && previousPrice > triggerPrice);
      break;
    case 'touch':
      triggered = Math.abs(currentPrice - triggerPrice) / triggerPrice < 0.001;
      break;
    default:
      triggered = false;
  }

  if (triggered) {
    const direction = currentPrice >= triggerPrice ? 'vượt lên' : 'xuống dưới';
    const directionEn = currentPrice >= triggerPrice ? 'crossed above' : 'crossed below';

    return {
      type: 'price_level',
      priority: 4,
      title: `Price Alert: ${symbol}`,
      titleVi: `Giá Alert: ${symbol}`,
      message: `Giá ${direction} ${triggerPrice}`,
      messageEn: `Price ${directionEn} ${triggerPrice}`,
      alertConfig,
      currentPrice,
      triggerPrice,
      actionRequired: false,
      createdAt: new Date().toISOString(),
    };
  }

  return null;
};

/**
 * Check stacked zones alert
 * @param {Array} stackedZones - Detected stacked zones
 * @param {string} symbol - Symbol
 * @returns {Object|null} Alert or null
 */
export const checkStackedZonesAlert = (stackedZones, symbol) => {
  if (!stackedZones || stackedZones.length < 2) return null;

  const strength = stackedZones.length >= 3 ? 'very_strong' : 'strong';
  const strengthVi = stackedZones.length >= 3 ? 'Rất Mạnh' : 'Mạnh';

  return {
    type: 'stacked_zone',
    priority: 1,
    title: `Stacked Zones: ${symbol}`,
    titleVi: `Zones Chồng: ${symbol}`,
    message: `${stackedZones.length} zones chồng lên nhau! Confluence ${strengthVi}`,
    messageEn: `${stackedZones.length} zones stacked! ${strength} confluence`,
    stackedZones,
    stackCount: stackedZones.length,
    actionRequired: true,
    createdAt: new Date().toISOString(),
  };
};

export default {
  checkAlertConditions,
  checkPriceLevelAlert,
  checkStackedZonesAlert,
};
