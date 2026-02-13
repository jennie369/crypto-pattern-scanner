// ============================================
// 🔍 PATTERN VALIDATION UTILITY
// Ensures direction, entry, stop, target are consistent
// ============================================

import { PATTERN_SIGNALS } from '../constants/patternSignals';

/**
 * Get pattern signal info from PATTERN_SIGNALS (source of truth)
 */
export function getPatternSignalInfo(patternType) {
  // Normalize pattern type to uppercase
  const normalized = patternType?.toUpperCase?.() || '';

  // Direct match
  if (PATTERN_SIGNALS[normalized]) {
    return PATTERN_SIGNALS[normalized];
  }

  // Try common aliases
  const aliases = {
    'UP-PAUSE-UP': 'UPU',
    'UP-PAUSE-DOWN': 'UPD',
    'DOWN-PAUSE-UP': 'DPU',
    'DOWN-PAUSE-DOWN': 'DPD',
    'UPPAUSED': 'UPD',
    'UPPAUSEU': 'UPU',
    'DOWNPAUSED': 'DPD',
    'DOWNPAUSEU': 'DPU',
    // Additional aliases - matching PATTERN_SIGNALS keys
    'H&S': 'HEAD_SHOULDERS',
    'HS': 'HEAD_SHOULDERS',
    'HEAD&SHOULDERS': 'HEAD_SHOULDERS',
    'HEADANDSHOULDERS': 'HEAD_SHOULDERS',
    'HEAD AND SHOULDERS': 'HEAD_SHOULDERS',
    'HEAD SHOULDERS': 'HEAD_SHOULDERS',
    'DOUBLE-TOP': 'DOUBLE_TOP',
    'DOUBLETOP': 'DOUBLE_TOP',
    'DOUBLE TOP': 'DOUBLE_TOP',
    'DOUBLE-BOTTOM': 'DOUBLE_BOTTOM',
    'DOUBLEBOTTOM': 'DOUBLE_BOTTOM',
    'DOUBLE BOTTOM': 'DOUBLE_BOTTOM',
    'BULLFLAG': 'BULL_FLAG',
    'BULL-FLAG': 'BULL_FLAG',
    'BULL FLAG': 'BULL_FLAG',
    'BEARFLAG': 'BEAR_FLAG',
    'BEAR-FLAG': 'BEAR_FLAG',
    'BEAR FLAG': 'BEAR_FLAG',
  };

  const alias = aliases[normalized];
  if (alias && PATTERN_SIGNALS[alias]) {
    return PATTERN_SIGNALS[alias];
  }

  console.warn(`[PatternValidator] Unknown pattern type: ${patternType}`);
  return null;
}

/**
 * Validate pattern levels match direction
 * @param {Object} pattern - Pattern object with entry, stopLoss, target, direction
 * @returns {Object} - { isValid, errors, warnings }
 */
export function validatePatternLevels(pattern) {
  const errors = [];
  const warnings = [];

  const { direction, entry, stopLoss } = pattern;
  // 🔥 FIX: Accept both 'target' and 'takeProfit' property names
  const target = pattern.target || pattern.takeProfit;

  // Required fields check
  if (!entry || !stopLoss || !target) {
    errors.push('Missing entry/stopLoss/target values');
    return { isValid: false, errors, warnings };
  }

  // Get authoritative direction from PATTERN_SIGNALS
  const patternType = pattern.patternType || pattern.pattern || pattern.patternName;
  const signalInfo = getPatternSignalInfo(patternType);
  const authoritativeDirection = signalInfo?.direction || direction;

  // Validate based on direction
  if (authoritativeDirection === 'SHORT' || authoritativeDirection === 'BEARISH') {
    // SHORT: Stop should be ABOVE entry, Target should be BELOW entry

    if (stopLoss <= entry) {
      errors.push(
        `SHORT: Stop (${stopLoss.toFixed(2)}) should be ABOVE entry (${entry.toFixed(2)})`
      );
    }

    if (target >= entry) {
      errors.push(
        `SHORT: Target (${target.toFixed(2)}) should be BELOW entry (${entry.toFixed(2)})`
      );
    }
  }

  if (authoritativeDirection === 'LONG' || authoritativeDirection === 'BULLISH') {
    // LONG: Stop should be BELOW entry, Target should be ABOVE entry

    if (stopLoss >= entry) {
      errors.push(
        `LONG: Stop (${stopLoss.toFixed(2)}) should be BELOW entry (${entry.toFixed(2)})`
      );
    }

    if (target <= entry) {
      errors.push(
        `LONG: Target (${target.toFixed(2)}) should be ABOVE entry (${entry.toFixed(2)})`
      );
    }
  }

  // Check if direction in pattern matches authoritative
  if (direction && signalInfo && direction !== signalInfo.direction) {
    warnings.push(
      `Direction mismatch: Pattern has "${direction}" but ${patternType} should be "${signalInfo.direction}"`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    authoritativeDirection
  };
}

/**
 * Auto-fix pattern levels if they're reversed
 * @param {Object} pattern - Original pattern
 * @returns {Object} - { pattern, wasFixed, fixes }
 */
export function autoFixPattern(pattern) {
  const fixes = [];
  const fixed = { ...pattern };

  const { entry, stopLoss } = pattern;
  // 🔥 FIX: Accept both 'target' and 'takeProfit' property names
  const target = pattern.target || pattern.takeProfit;

  // Get authoritative direction
  const patternType = pattern.patternType || pattern.pattern || pattern.patternName;
  const signalInfo = getPatternSignalInfo(patternType);
  const authoritativeDirection = signalInfo?.direction || pattern.direction;

  // Enforce signal and direction from PATTERN_SIGNALS
  if (signalInfo) {
    if (fixed.signal !== signalInfo.signal) {
      fixed.signal = signalInfo.signal;
      fixes.push(`Fixed signal: ${pattern.signal} → ${signalInfo.signal}`);
    }

    if (fixed.direction !== signalInfo.direction) {
      fixed.direction = signalInfo.direction;
      fixes.push(`Fixed direction: ${pattern.direction} → ${signalInfo.direction}`);
    }
  }

  // 🔥 AGGRESSIVE FIX: Force correct levels based on direction
  if (authoritativeDirection === 'SHORT' || authoritativeDirection === 'BEARISH') {
    // SHORT: Stop > Entry > Target (Stop ABOVE entry, Target BELOW entry)

    // Ensure stopLoss is ABOVE entry
    if (fixed.stopLoss <= entry) {
      // Try swapping with target if target is above entry
      if (target > entry) {
        fixed.stopLoss = target;
        fixed.target = stopLoss;
        fixed.takeProfit = stopLoss;
        fixes.push(`Swapped stop/target for SHORT (stop was below entry)`);
      } else {
        // Force stopLoss to 3% above entry
        fixed.stopLoss = entry * 1.03;
        fixes.push(`Forced stop to 3% above entry for SHORT`);
      }
    }

    // Ensure target is BELOW entry
    if (fixed.target >= entry) {
      // Calculate based on risk distance
      const riskDistance = fixed.stopLoss - entry;
      fixed.target = entry - (riskDistance * 2); // 1:2 R:R
      fixed.takeProfit = fixed.target;
      fixes.push(`Forced target below entry for SHORT (1:2 R:R)`);
    }
  }

  if (authoritativeDirection === 'LONG' || authoritativeDirection === 'BULLISH') {
    // LONG: Stop < Entry < Target (Stop BELOW entry, Target ABOVE entry)

    // Ensure stopLoss is BELOW entry
    if (fixed.stopLoss >= entry) {
      // Try swapping with target if target is below entry
      if (target < entry) {
        fixed.stopLoss = target;
        fixed.target = stopLoss;
        fixed.takeProfit = stopLoss;
        fixes.push(`Swapped stop/target for LONG (stop was above entry)`);
      } else {
        // Force stopLoss to 3% below entry
        fixed.stopLoss = entry * 0.97;
        fixes.push(`Forced stop to 3% below entry for LONG`);
      }
    }

    // Ensure target is ABOVE entry
    if (fixed.target <= entry) {
      // Calculate based on risk distance
      const riskDistance = entry - fixed.stopLoss;
      fixed.target = entry + (riskDistance * 2); // 1:2 R:R
      fixed.takeProfit = fixed.target;
      fixes.push(`Forced target above entry for LONG (1:2 R:R)`);
    }
  }

  // Recalculate R:R if fixed
  if (fixes.length > 0) {
    const stopDistance = Math.abs(fixed.entry - fixed.stopLoss);
    const targetDistance = Math.abs(fixed.entry - fixed.target);
    fixed.riskReward = targetDistance / stopDistance;
    fixes.push(`Recalculated R:R: ${fixed.riskReward.toFixed(2)}`);
  }

  return {
    pattern: fixed,
    wasFixed: fixes.length > 0,
    fixes
  };
}

/**
 * Validate and auto-fix pattern
 * @param {Object} pattern - Original pattern
 * @returns {Object} - Fixed pattern with validation info
 */
export function validateAndFixPattern(pattern) {
  // First validate
  const validation = validatePatternLevels(pattern);

  // If invalid, try to fix
  if (!validation.isValid) {
    const { pattern: fixedPattern, wasFixed, fixes } = autoFixPattern(pattern);

    // Re-validate after fix
    const revalidation = validatePatternLevels(fixedPattern);

    if (wasFixed) {
      console.log(`[PatternValidator] Auto-fixed pattern ${pattern.patternType || pattern.pattern}:`, fixes);
    }

    if (!revalidation.isValid) {
      console.error(`[PatternValidator] Could not fix pattern:`, revalidation.errors);
    }

    return {
      pattern: fixedPattern,
      wasFixed,
      fixes,
      validation: revalidation
    };
  }

  return {
    pattern,
    wasFixed: false,
    fixes: [],
    validation
  };
}

export default {
  getPatternSignalInfo,
  validatePatternLevels,
  autoFixPattern,
  validateAndFixPattern
};
