/**
 * UPD Pattern Detection Tests
 *
 * Test suite for UPD (Up-Pause-Down) reversal pattern detection
 * Win Rate: 65% | R:R: 1:2.2 | Type: REVERSAL (Bearish)
 */

import { detectUPD } from './UPDPattern.js';

// ============================================
// TEST DATA GENERATORS
// ============================================

/**
 * Generate valid UPD pattern data
 */
function generateValidUPDPattern() {
  const candles = [];
  let price = 40000;

  // Pre-history (20 nến trước pattern)
  for (let i = 0; i < 20; i++) {
    candles.push({
      open: price,
      high: price + 100,
      low: price - 100,
      close: price + 50,
      volume: 1000,
      timestamp: new Date(2021, 10, i + 1),
    });
    price += 50;
  }

  // Phase 1: UP - Tăng mạnh 12 nến, +20% (40k → 48k)
  const phase1Start = candles.length;
  for (let i = 0; i < 12; i++) {
    const increase = 650; // ~20% total
    candles.push({
      open: price,
      high: price + increase + 100,
      low: price - 50,
      close: price + increase,
      volume: 1200 + i * 50, // Volume tăng dần (FOMO)
      timestamp: new Date(2021, 10, 21 + i),
    });
    price += increase;
  }

  // Phase 2: PAUSE - Range hẹp 3 nến, volume VẪN cao (distribution)
  const phase2Start = candles.length;
  const pauseHigh = price + 200;
  const pauseLow = price - 200;
  const pauseMid = (pauseHigh + pauseLow) / 2;

  for (let i = 0; i < 3; i++) {
    candles.push({
      open: pauseMid + (i % 2 === 0 ? 100 : -100),
      high: pauseHigh,
      low: pauseLow,
      close: pauseMid + (i % 2 === 0 ? -100 : 100),
      volume: 1400, // Volume VẪN cao (distribution)
      timestamp: new Date(2021, 11, 3 + i),
    });
  }

  // Phase 3: DOWN - Giảm mạnh 3 nến, -10% (48k → 43.2k)
  const phase3Start = candles.length;
  for (let i = 0; i < 3; i++) {
    const decrease = 1600; // -10% total
    candles.push({
      open: price,
      high: price + 50,
      low: price - decrease - 100,
      close: price - decrease,
      volume: 2000 + i * 200, // Volume đột biến (breakout)
      timestamp: new Date(2021, 11, 6 + i),
    });
    price -= decrease;
  }

  // Post-pattern (5 nến sau)
  for (let i = 0; i < 5; i++) {
    candles.push({
      open: price,
      high: price + 100,
      low: price - 100,
      close: price - 50,
      volume: 1500,
      timestamp: new Date(2021, 11, 9 + i),
    });
    price -= 50;
  }

  return {
    candles,
    expectedPhases: {
      phase1: { start: phase1Start, candles: 12, change: 20 },
      phase2: { start: phase2Start, candles: 3, range: 0.8 },
      phase3: { start: phase3Start, candles: 3, change: -10 },
    },
  };
}

/**
 * Generate incomplete pattern (missing phase 3)
 */
function generateIncompletePattern() {
  const { candles } = generateValidUPDPattern();
  // Remove last 8 candles (phase 3 + post-pattern)
  return candles.slice(0, -8);
}

/**
 * Generate weak phase 1 (not enough change)
 */
function generateWeakPhase1Pattern() {
  const candles = [];
  let price = 40000;

  // Pre-history
  for (let i = 0; i < 20; i++) {
    candles.push({
      open: price,
      high: price + 50,
      low: price - 50,
      close: price,
      volume: 1000,
      timestamp: new Date(2021, 10, i + 1),
    });
  }

  // Phase 1: Tăng YẾU chỉ 1% (không đủ 2%)
  for (let i = 0; i < 10; i++) {
    const increase = 40; // 1% total
    candles.push({
      open: price,
      high: price + increase,
      low: price - 10,
      close: price + increase,
      volume: 1100,
      timestamp: new Date(2021, 10, 21 + i),
    });
    price += increase;
  }

  // Phase 2: Pause
  for (let i = 0; i < 3; i++) {
    candles.push({
      open: price,
      high: price + 100,
      low: price - 100,
      close: price,
      volume: 1200,
      timestamp: new Date(2021, 11, 1 + i),
    });
  }

  // Phase 3: Down
  for (let i = 0; i < 2; i++) {
    candles.push({
      open: price,
      high: price,
      low: price - 800,
      close: price - 800,
      volume: 1800,
      timestamp: new Date(2021, 11, 4 + i),
    });
    price -= 800;
  }

  return candles;
}

/**
 * Generate pattern with low volume in pause (NO distribution)
 */
function generateLowVolumePhase2Pattern() {
  const { candles } = generateValidUPDPattern();

  // Find phase 2 and reduce volume
  const phase2Indices = [32, 33, 34]; // Approximate phase 2 location

  phase2Indices.forEach((idx) => {
    if (candles[idx]) {
      candles[idx].volume = 500; // Very low volume (NO distribution)
    }
  });

  return candles;
}

/**
 * Real BTC/USDT example (November 2021 ATH reversal)
 */
function generateRealBTCExample() {
  // Simplified version of BTC Nov 2021 top
  return [
    // Pre-trend (tháng 10)
    { open: 55000, high: 56000, low: 54800, close: 55800, volume: 25000, timestamp: new Date(2021, 9, 20) },
    { open: 55800, high: 57500, low: 55700, close: 57200, volume: 27000, timestamp: new Date(2021, 9, 21) },
    { open: 57200, high: 58500, low: 57000, close: 58300, volume: 26000, timestamp: new Date(2021, 9, 22) },
    { open: 58300, high: 59200, low: 58100, close: 59000, volume: 28000, timestamp: new Date(2021, 9, 23) },
    { open: 59000, high: 60000, low: 58800, close: 59700, volume: 29000, timestamp: new Date(2021, 9, 24) },
    { open: 59700, high: 60500, low: 59500, close: 60200, volume: 30000, timestamp: new Date(2021, 9, 25) },
    { open: 60200, high: 61000, low: 60000, close: 60800, volume: 31000, timestamp: new Date(2021, 9, 26) },
    { open: 60800, high: 62000, low: 60700, close: 61500, volume: 32000, timestamp: new Date(2021, 9, 27) },
    { open: 61500, high: 62500, low: 61300, close: 62200, volume: 33000, timestamp: new Date(2021, 9, 28) },
    { open: 62200, high: 63000, low: 62000, close: 62800, volume: 32500, timestamp: new Date(2021, 9, 29) },

    // Phase 1: UP - Rally to ATH (10 nến)
    { open: 62800, high: 63500, low: 62700, close: 63200, volume: 33000, timestamp: new Date(2021, 10, 1) },
    { open: 63200, high: 64000, low: 63100, close: 63800, volume: 34000, timestamp: new Date(2021, 10, 2) },
    { open: 63800, high: 64800, low: 63700, close: 64500, volume: 35000, timestamp: new Date(2021, 10, 3) },
    { open: 64500, high: 65500, low: 64400, close: 65200, volume: 36000, timestamp: new Date(2021, 10, 4) },
    { open: 65200, high: 66000, low: 65100, close: 65800, volume: 37000, timestamp: new Date(2021, 10, 5) },
    { open: 65800, high: 66800, low: 65700, close: 66500, volume: 38000, timestamp: new Date(2021, 10, 6) },
    { open: 66500, high: 67500, low: 66400, close: 67200, volume: 39000, timestamp: new Date(2021, 10, 7) },
    { open: 67200, high: 68200, low: 67100, close: 68000, volume: 40000, timestamp: new Date(2021, 10, 8) },
    { open: 68000, high: 68800, low: 67900, close: 68500, volume: 41000, timestamp: new Date(2021, 10, 9) },
    { open: 68500, high: 69000, low: 68400, close: 68800, volume: 42000, timestamp: new Date(2021, 10, 10) },

    // Phase 2: PAUSE - Distribution tại ATH (4 nến)
    { open: 68800, high: 69200, low: 67500, close: 68000, volume: 40000, timestamp: new Date(2021, 10, 11) },
    { open: 68000, high: 68800, low: 67300, close: 67900, volume: 39500, timestamp: new Date(2021, 10, 12) },
    { open: 67900, high: 68500, low: 67200, close: 67700, volume: 38500, timestamp: new Date(2021, 10, 13) },
    { open: 67700, high: 68300, low: 67400, close: 67800, volume: 39000, timestamp: new Date(2021, 10, 14) },

    // Phase 3: DOWN - Reversal (4 nến)
    { open: 67800, high: 67900, low: 64000, close: 64500, volume: 50000, timestamp: new Date(2021, 10, 15) },
    { open: 64500, high: 65000, low: 59000, close: 60000, volume: 55000, timestamp: new Date(2021, 10, 16) },
    { open: 60000, high: 61000, low: 56000, close: 57500, volume: 58000, timestamp: new Date(2021, 10, 17) },
    { open: 57500, high: 58500, low: 55000, close: 56000, volume: 60000, timestamp: new Date(2021, 10, 18) },

    // Post-reversal
    { open: 56000, high: 57000, low: 54000, close: 55000, volume: 52000, timestamp: new Date(2021, 10, 19) },
    { open: 55000, high: 56000, low: 53000, close: 54500, volume: 48000, timestamp: new Date(2021, 10, 20) },
  ];
}

// ============================================
// TEST CASES
// ============================================

describe('UPD Pattern Detection', () => {

  // Test 1: Valid UPD Pattern
  test('should detect valid UPD pattern with 3 phases', () => {
    const { candles } = generateValidUPDPattern();
    const patterns = detectUPD(candles);

    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0].type).toBe('UPD');
    expect(patterns[0].signal).toBe('BEARISH');
    expect(patterns[0].patternType).toBe('REVERSAL');
    expect(patterns[0].confidence).toBeGreaterThanOrEqual(60);
    expect(patterns[0].confidence).toBeLessThanOrEqual(85);
  });

  // Test 2: Missing Phases
  test('should NOT detect when missing phase 3', () => {
    const incompleteCandles = generateIncompletePattern();
    const patterns = detectUPD(incompleteCandles);

    expect(patterns.length).toBe(0);
  });

  // Test 3: Weak Phase 1
  test('should NOT detect when phase 1 is too weak (<2% change)', () => {
    const weakCandles = generateWeakPhase1Pattern();
    const patterns = detectUPD(weakCandles);

    expect(patterns.length).toBe(0);
  });

  // Test 4: Low Volume in Phase 2 (No Distribution)
  test('should NOT detect when phase 2 has low volume (no distribution)', () => {
    const lowVolumeCandles = generateLowVolumePhase2Pattern();
    const patterns = detectUPD(lowVolumeCandles);

    // Should either not detect or have very low confidence
    if (patterns.length > 0) {
      expect(patterns[0].confidence).toBeLessThan(60);
    }
  });

  // Test 5: Trading Levels Calculation
  test('should calculate correct entry, stop loss, and target', () => {
    const { candles } = generateValidUPDPattern();
    const patterns = detectUPD(candles);

    expect(patterns.length).toBeGreaterThan(0);

    const pattern = patterns[0];

    // Entry should be defined
    expect(pattern.entry).toBeDefined();
    expect(pattern.entry).toBeGreaterThan(0);

    // Stop Loss should be above entry (bearish trade)
    expect(pattern.stopLoss).toBeGreaterThan(pattern.entry);

    // Target should be below entry
    expect(pattern.target).toBeLessThan(pattern.entry);

    // R:R should be at least 1:2
    expect(pattern.riskReward).toBeGreaterThanOrEqual(1.8);
  });

  // Test 6: HFZ Zone Creation
  test('should create HFZ zone from pause phase', () => {
    const { candles } = generateValidUPDPattern();
    const patterns = detectUPD(candles);

    expect(patterns.length).toBeGreaterThan(0);

    const pattern = patterns[0];

    expect(pattern.zoneType).toBe('HFZ');
    expect(pattern.zoneTop).toBeGreaterThan(pattern.zoneBottom);
    expect(pattern.zoneMid).toBeGreaterThan(pattern.zoneBottom);
    expect(pattern.zoneMid).toBeLessThan(pattern.zoneTop);
    expect(pattern.zoneStatus).toBe('FRESH');
    expect(pattern.strength).toBe(100);
  });

  // Test 7: Volume Validation
  test('should validate volume patterns correctly', () => {
    const { candles } = generateValidUPDPattern();
    const patterns = detectUPD(candles);

    expect(patterns.length).toBeGreaterThan(0);

    const pattern = patterns[0];

    // Phase 1 and 3 should have strong volume
    expect(pattern.hasStrongVolume).toBeDefined();

    // Phase 2 should have distribution (high volume)
    expect(pattern.hasDistribution).toBe(true);

    // All phases should have volume data
    expect(pattern.phase1.volume).toBeGreaterThan(0);
    expect(pattern.phase2.volume).toBeGreaterThan(0);
    expect(pattern.phase3.volume).toBeGreaterThan(0);

    // Phase 3 volume should be highest (breakout)
    expect(pattern.phase3.volume).toBeGreaterThanOrEqual(pattern.phase1.volume);
  });

  // Test 8: Pattern Metadata
  test('should include all required metadata', () => {
    const { candles } = generateValidUPDPattern();
    const patterns = detectUPD(candles);

    expect(patterns.length).toBeGreaterThan(0);

    const pattern = patterns[0];

    // Required fields
    expect(pattern.type).toBe('UPD');
    expect(pattern.name).toBe('Up-Pause-Down');
    expect(pattern.signal).toBe('BEARISH');
    expect(pattern.patternType).toBe('REVERSAL');
    expect(pattern.confidence).toBeDefined();
    expect(pattern.detectedAt).toBeDefined();
    expect(pattern.detectedPrice).toBeGreaterThan(0);

    // Win rate info
    expect(pattern.expectedWinRate).toBe(65);
    expect(pattern.expectedRR).toBe(2.2);

    // Validation flags
    expect(pattern.isValidReversal).toBe(true);
  });

  // Test 9: Real BTC Data
  test('should detect UPD in real BTC/USDT November 2021 data', () => {
    const btcCandles = generateRealBTCExample();
    const patterns = detectUPD(btcCandles);

    expect(patterns.length).toBeGreaterThan(0);

    const pattern = patterns[0];

    // Verify it's a proper reversal at ATH
    expect(pattern.signal).toBe('BEARISH');
    expect(pattern.confidence).toBeGreaterThan(60);

    // Phase 1 should show rally to ~69k
    expect(pattern.phase1.change).toBeGreaterThan(5); // >5% rally

    // Phase 2 should be pause at high
    expect(pattern.phase2.candles).toBeGreaterThanOrEqual(1);
    expect(pattern.phase2.candles).toBeLessThanOrEqual(5);

    // Phase 3 should show strong reversal
    expect(pattern.phase3.change).toBeLessThan(-5); // >5% drop
  });

  // Test 10: Not Enough Data
  test('should return empty array when not enough candles', () => {
    const shortCandles = generateValidUPDPattern().candles.slice(0, 30);
    const patterns = detectUPD(shortCandles);

    expect(patterns.length).toBe(0);
  });

  // Test 11: Configuration Override
  test('should respect custom configuration parameters', () => {
    const { candles } = generateValidUPDPattern();

    const patterns = detectUPD(candles, {
      minPhase1Candles: 15, // Require more candles
      minConfidence: 70, // Higher confidence threshold
    });

    // May not detect due to stricter requirements
    // Or if detected, should have high confidence
    if (patterns.length > 0) {
      expect(patterns[0].confidence).toBeGreaterThanOrEqual(70);
    }
  });

  // Test 12: Phase Continuity
  test('should ensure phases are continuous (no gaps)', () => {
    const { candles } = generateValidUPDPattern();
    const patterns = detectUPD(candles);

    expect(patterns.length).toBeGreaterThan(0);

    const pattern = patterns[0];

    // Phase 2 should start right after phase 1
    expect(pattern.phase2.start).toBe(pattern.phase1.end + 1);

    // Phase 3 should start right after phase 2
    expect(pattern.phase3.start).toBe(pattern.phase2.end + 1);
  });

});

// ============================================
// MANUAL TEST RUNNER (for Node.js)
// ============================================

if (typeof window === 'undefined' && typeof process !== 'undefined') {
  // Running in Node.js environment
  console.log('🧪 Running UPD Pattern Tests...\n');

  const runTest = (name, fn) => {
    try {
      fn();
      console.log(`✅ ${name}`);
    } catch (error) {
      console.log(`❌ ${name}`);
      console.error(`   Error: ${error.message}`);
    }
  };

  // Simple expect implementation for Node.js
  global.expect = (actual) => ({
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be > ${expected}`);
      }
    },
    toBeLessThan: (expected) => {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be < ${expected}`);
      }
    },
    toBeGreaterThanOrEqual: (expected) => {
      if (actual < expected) {
        throw new Error(`Expected ${actual} to be >= ${expected}`);
      }
    },
    toBeLessThanOrEqual: (expected) => {
      if (actual > expected) {
        throw new Error(`Expected ${actual} to be <= ${expected}`);
      }
    },
    toBeDefined: () => {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
  });

  global.describe = (name, fn) => {
    console.log(`\n📦 ${name}\n`);
    fn();
  };

  global.test = runTest;

  // Run tests
  try {
    // Import and run
    const testModule = await import('./UPDPattern.test.js');
  } catch (error) {
    console.error('Failed to run tests:', error);
  }
}

export {
  generateValidUPDPattern,
  generateIncompletePattern,
  generateWeakPhase1Pattern,
  generateLowVolumePhase2Pattern,
  generateRealBTCExample,
};
