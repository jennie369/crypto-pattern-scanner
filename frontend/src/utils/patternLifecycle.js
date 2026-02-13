// ============================================
// 🔄 PATTERN LIFECYCLE MANAGEMENT
// ============================================

import { PATTERN_STATES } from '../constants/patternSignals';

/**
 * Tính toán state hiện tại của pattern dựa trên giá và thời gian
 */
export function calculatePatternState(pattern, currentPrice, currentTime) {
  const { signal, entry, stopLoss, target, zone, detectedAt, hasRetested } = pattern;

  // CHECK 1: Đã hit target?
  if (signal === 'BEARISH') {
    if (currentPrice <= target) {
      return {
        state: 'TARGET_HIT',
        completedAt: currentTime,
        profitPercent: ((entry - target) / entry) * 100
      };
    }
  } else {
    if (currentPrice >= target) {
      return {
        state: 'TARGET_HIT',
        completedAt: currentTime,
        profitPercent: ((target - entry) / entry) * 100
      };
    }
  }

  // CHECK 2: Đã hit stop?
  if (signal === 'BEARISH') {
    if (currentPrice >= stopLoss) {
      return {
        state: 'STOPPED_OUT',
        stoppedAt: currentTime,
        lossPercent: ((currentPrice - entry) / entry) * 100
      };
    }
  } else {
    if (currentPrice <= stopLoss) {
      return {
        state: 'STOPPED_OUT',
        stoppedAt: currentTime,
        lossPercent: ((entry - currentPrice) / entry) * 100
      };
    }
  }

  // CHECK 3: Giá có trong zone không? (ACTIVE)
  // Only check zone if it exists
  if (zone && zone.bottom && zone.top) {
    const inZone = currentPrice >= zone.bottom && currentPrice <= zone.top;

    if (inZone) {
      return {
        state: 'ACTIVE',
        canTradeNow: true
      };
    }
  } else {
    // If no zone defined, check if price is near entry (within 1%)
    const nearEntry = Math.abs((currentPrice - entry) / entry) < 0.01;
    if (nearEntry) {
      return {
        state: 'ACTIVE',
        canTradeNow: true
      };
    }
  }

  // CHECK 4: Giá đã đi xa quá? (MISSED)
  const distanceFromEntry = Math.abs((currentPrice - entry) / entry);

  if (distanceFromEntry > 0.05) { // >5% xa entry
    return {
      state: 'MISSED',
      missedBy: distanceFromEntry * 100
    };
  }

  // CHECK 5: Quá lâu không retest? (EXPIRED)
  if (detectedAt) {
    const daysSinceDetection = (currentTime - detectedAt) / (1000 * 60 * 60 * 24);

    if (daysSinceDetection > 7) { // >7 ngày
      return {
        state: 'EXPIRED',
        expiredAfter: Math.floor(daysSinceDetection)
      };
    }
  }

  // CHECK 6: Có retest trước đó chưa?
  if (hasRetested) {
    return {
      state: 'WAITING_RETEST'
    };
  }

  // DEFAULT: FRESH
  return {
    state: 'FRESH'
  };
}

/**
 * Update pattern state và merge với pattern data
 */
export function updatePatternState(pattern, currentPrice, currentTime) {
  const stateUpdate = calculatePatternState(pattern, currentPrice, currentTime);
  const stateInfo = PATTERN_STATES[stateUpdate.state];

  return {
    ...pattern,
    ...stateUpdate,
    stateInfo,
    lastStateUpdate: currentTime
  };
}

/**
 * Filter patterns để chỉ hiển thị những cái shouldShow = true
 */
export function filterPatternsForDisplay(patterns, currentPrice, currentTime) {
  return patterns
    .map(p => updatePatternState(p, currentPrice, currentTime))
    .filter(p => {
      const stateInfo = PATTERN_STATES[p.state];
      return stateInfo?.shouldShow !== false;
    })
    .map(p => ({
      ...p,
      opacity: PATTERN_STATES[p.state]?.dimmed ? 0.5 : 1.0,
      highlight: PATTERN_STATES[p.state]?.highlight || false
    }));
}

/**
 * Sort patterns theo priority (ACTIVE > WAITING > FRESH > COMPLETED)
 */
export function sortPatternsByPriority(patterns) {
  const priority = {
    ACTIVE: 1,
    WAITING_RETEST: 2,
    FRESH: 3,
    TARGET_HIT: 4,
    STOPPED_OUT: 5,
    EXPIRED: 6,
    MISSED: 7
  };

  return [...patterns].sort((a, b) => {
    const priorityA = priority[a.state] || 999;
    const priorityB = priority[b.state] || 999;
    return priorityA - priorityB;
  });
}
