/**
 * =====================================================
 * File: src/services/scanner/index.js
 * Description: Scanner services exports (V2 Upgrade)
 * =====================================================
 */

// Validators
export { default as volumeValidator, validatePatternVolume, validateBreakoutVolume, analyzeVolumeTrend } from './volumeValidator';
export { default as zoneRetestValidator, validateZoneRetest, isPriceApproachingZone, isPriceInZone, getDistanceToZone, findStrongestRetest } from './zoneRetestValidator';
export { default as mtfAnalyzer, validateHigherTFTrend, analyzeTrend, getMultipleTFTrends, calculateMTFAlignmentScore, TF_HIERARCHY } from './mtfAnalyzer';
export { default as swingPointValidator, validateSwingQuality, findSwingHighs, findSwingLows, validateSingleSwing } from './swingPointValidator';

// Calculators
export { default as confidenceCalculatorV2, calculateConfidenceV2, calculateQuickConfidence, CONFIDENCE_CONFIG_V2 } from './confidenceCalculatorV2';

// Services
export { default as scannerConfigService, getScannerConfig, updateScannerConfig, getMergedConfig, isFeatureEnabled, getVolumeThresholds, getConfidenceThresholds } from './scannerConfigService';
export { default as scanAlertService, createScanAlert, getAlerts, getUnreadCount, markAsRead, markAllAsRead, formatAlertForDisplay, createPatternDetectedAlert, createZoneApproachAlert, createZoneRetestAlert, createEntryTriggeredAlert, ALERT_TYPES, ALERT_PRIORITY } from './scanAlertService';

// Pattern Enhancer V2 (Integration)
export { default as patternEnhancerV2, applyV2Enhancements, shouldRejectPattern, filterPatternsV2, sortPatternsV2, getV2Summary } from './patternEnhancerV2';
