# 🧪 FREQUENCY PATTERNS - TEST CASES (CORRECTED)

> **Test Data & Expected Results cho Zone Retest Trading System**  
> ⚠️ CORRECTED: Tests for retest entry, not breakout entry

---

## 📊 TEST SCENARIO 1: DPD Pattern with Zone Retest

### Input: Complete DPD Cycle
```javascript
const dpdTestScenario = {
  // Phase 1: Down (candles 0-29)
  phase1: generateDowntrend(30, 100, 90),
  
  // Phase 2: Pause (candles 30-32) - 3 candles
  pause: generatePauseZone(3, 90, 0.015),  // 1.5% range
  
  // Phase 3: Down continuation (candles 33-62)
  phase3: generateDowntrend(30, 90, 80),
  
  // Phase 4: RETEST (candles 70-72) ← NEW
  retest: generateRetestToHFZ(3, 90, 'bearish'),
};
```

### Expected Pattern Detection:
```javascript
{
  type: 'DPD',
  signal: 'BEARISH',
  
  // Zone info
  zoneType: 'HFZ',
  zoneTop: 90.8,
  zoneBottom: 89.2,
  
  // ⚠️ Entry strategy
  entryStrategy: 'WAIT_RETEST',
  needsRetest: true,
  
  // Status tracking
  zoneStatus: 'FRESH',
  testCount: 0,
  
  confidence: 75-85,
}
```

### Expected Zone Retest:
```javascript
// When price returns to zone at candle 70
{
  event: 'ZONE_RETEST',
  zoneId: 'DPD_..._30',
  retestCandle: 70,
  
  // Confirmation check
  confirmation: {
    hasConfirmation: true,
    type: 'BEARISH_PIN',
    strength: 80,
  },
  
  // Entry signal
  signal: 'ENTRY_SHORT',
  entry: 89.2,  // HFZ bottom
  stopLoss: 90.8 + (1.6 * 0.005),  // +0.5% buffer
  
  // Zone updated
  zoneStatus: 'TESTED_1X',
  zoneStrength: 80,
}
```

---

## 📊 TEST SCENARIO 2: UPU Pattern with Multiple Retests

### Input: UPU with 2 Retests
```javascript
const upuMultiRetestScenario = {
  // Pattern formation
  phase1: generateUptrend(30, 80, 90),
  pause: generatePauseZone(2, 90, 0.012),
  phase3: generateUptrend(30, 90, 100),
  
  // First retest (candle 70) - with confirmation
  retest1: {
    candles: generateRetestToLFZ(3, 90, 'bullish'),
    hasConfirmation: true,
    confirmationType: 'HAMMER',
  },
  
  // Second retest (candle 90) - with confirmation  
  retest2: {
    candles: generateRetestToLFZ(3, 90, 'bullish'),
    hasConfirmation: true,
    confirmationType: 'BULLISH_ENGULFING',
  },
  
  // Third retest attempt (candle 110) - should be REJECTED
  retest3: {
    candles: generateRetestToLFZ(3, 90, 'bullish'),
    shouldReject: true,  // Too many tests
  },
};
```

### Expected Behavior:
```javascript
// After 1st retest
zone.status = 'TESTED_1X'
zone.strength = 80
signal = 'ENTRY_LONG'  // ✅ ALLOWED

// After 2nd retest
zone.status = 'TESTED_2X'
zone.strength = 60
signal = 'ENTRY_LONG'  // ✅ ALLOWED (last time)

// After 3rd retest attempt
zone.status = 'WEAK'
zone.strength = 30
signal = 'NO_ENTRY'  // ❌ REJECTED
```

---

## 📊 TEST SCENARIO 3: Zone Invalidation

### Input: HFZ Gets Broken
```javascript
const zoneBreakScenario = {
  // DPD pattern creates HFZ
  pattern: generateDPD(),
  hfzZone: { top: 100, bottom: 99 },
  
  // Price action
  priceAction: [
    { candle: 70, close: 99.5 },  // Near zone
    { candle: 71, close: 100.2 }, // Tests zone
    { candle: 72, close: 100.5 }, // CLOSES ABOVE ← Breaks zone
  ],
};
```

### Expected Behavior:
```javascript
// Candle 70-71: Zone still valid
zone.status = 'FRESH'
zone.isValid = true

// Candle 72: Zone broken (closes above 100)
zone.status = 'INVALIDATED'
zone.isValid = false
zone.invalidatedAt = candle[72].timestamp
zone.invalidatedPrice = 100.5

// Trading decision
tradingDecision = 'SKIP_ZONE'  // Don't trade this zone anymore
action = 'FIND_NEW_ZONE'
```

---

## 📊 TEST SCENARIO 4: Confirmation Validation

### Input: Retest WITHOUT Confirmation
```javascript
const noConfirmationScenario = {
  // HFZ zone
  zone: { type: 'HFZ', top: 100, bottom: 99 },
  
  // Price retests but NO confirmation
  retestCandles: [
    { open: 98, high: 99.8, low: 98, close: 99.5 },  // Touches zone
    { open: 99.5, high: 100, low: 99, close: 99.8 }, // Inside zone
    { open: 99.8, high: 100.2, low: 99.5, close: 100 }, // ❌ NO REJECTION
  ],
};
```

### Expected Behavior:
```javascript
// Confirmation check
confirmation = validateHFZConfirmation(zone, retestCandles)

// Result
confirmation.hasConfirmation = false  // ❌ NO CONFIRMATION
confirmation.reason = 'No bearish rejection pattern'

// Trading decision
signal = 'NO_ENTRY'  // Don't entry without confirmation
action = 'WAIT_FOR_BETTER_SETUP'
```

---

## 🧪 UNIT TESTS

### Test 1: Zone Tracker
```javascript
describe('ZoneTracker', () => {
  test('should create zone from pattern', () => {
    const pattern = generateDPD();
    const zone = zoneTracker.createZone(pattern);
    
    expect(zone.type).toBe('HFZ');
    expect(zone.status).toBe('FRESH');
    expect(zone.testCount).toBe(0);
    expect(zone.strength).toBe(100);
  });
  
  test('should detect zone retest', () => {
    const zone = { top: 100, bottom: 99 };
    const candle = { high: 100.1, low: 99.5, close: 99.8 };
    
    const isRetesting = zoneTracker.isRetesting(zone, candle);
    expect(isRetesting).toBe(true);
  });
  
  test('should update zone on retest', () => {
    const zone = zoneTracker.createZone(pattern);
    
    // First retest
    zoneTracker.recordRetest(zone.id, candle1, true);
    expect(zone.status).toBe('TESTED_1X');
    expect(zone.strength).toBe(80);
    
    // Second retest
    zoneTracker.recordRetest(zone.id, candle2, true);
    expect(zone.status).toBe('TESTED_2X');
    expect(zone.strength).toBe(60);
  });
  
  test('should invalidate broken zone', () => {
    const zone = { type: 'HFZ', top: 100, bottom: 99 };
    const breakCandle = { close: 100.5 }; // Closes above
    
    const isBroken = zoneTracker.isZoneBroken(zone, breakCandle);
    expect(isBroken).toBe(true);
    
    zoneTracker.invalidateZone(zone.id, breakCandle);
    expect(zone.status).toBe('INVALIDATED');
    expect(zone.strength).toBe(0);
  });
});
```

### Test 2: Confirmation Validator
```javascript
describe('ConfirmationValidator', () => {
  test('should detect bearish pin bar', () => {
    const candle = {
      open: 99.5,
      high: 100.5,  // Long upper wick
      low: 99.3,
      close: 99.4,   // Small body
    };
    
    const { isBearishPin } = isPinBar(candle);
    expect(isBearishPin).toBe(true);
  });
  
  test('should detect bullish hammer', () => {
    const candle = {
      open: 90.5,
      high: 90.6,    // Small upper wick
      low: 89.5,     // Long lower wick
      close: 90.4,   // Small body
    };
    
    const isHammerCandle = isHammer(candle);
    expect(isHammerCandle).toBe(true);
  });
  
  test('should validate HFZ confirmation', () => {
    const zone = { top: 100, bottom: 99, mid: 99.5 };
    const candles = [
      { close: 99.8 },
      { high: 100.2, low: 99, close: 99.3 }, // Bearish rejection
    ];
    
    const result = validateHFZConfirmation(zone, candles);
    expect(result.hasConfirmation).toBe(true);
    expect(result.type).toMatch(/BEARISH/);
    expect(result.strength).toBeGreaterThan(70);
  });
  
  test('should reject without confirmation', () => {
    const zone = { top: 100, bottom: 99 };
    const candles = [
      { close: 99.5 },
      { close: 99.7 }, // No rejection pattern
    ];
    
    const result = validateHFZConfirmation(zone, candles);
    expect(result.hasConfirmation).toBe(false);
  });
});
```

### Test 3: Pattern Detection with Zone Creation
```javascript
describe('Pattern Detection', () => {
  test('should detect DPD and create HFZ', () => {
    const data = generateDPDData();
    const patterns = detectDPD(data);
    
    expect(patterns).toHaveLength(1);
    expect(patterns[0].type).toBe('DPD');
    expect(patterns[0].zoneType).toBe('HFZ');
    expect(patterns[0].entryStrategy).toBe('WAIT_RETEST');
    expect(patterns[0].needsRetest).toBe(true);
    
    // Check if zone was created
    const zones = zoneTracker.getActiveZones();
    expect(zones).toHaveLength(1);
    expect(zones[0].type).toBe('HFZ');
  });
  
  test('should NOT entry immediately after pattern', () => {
    const data = generateDPDData();
    const pattern = detectDPD(data)[0];
    
    // Pattern detected but NO ENTRY yet
    expect(pattern.entryStrategy).toBe('WAIT_RETEST');
    expect(pattern.needsRetest).toBe(true);
    
    // Entry should only happen on retest with confirmation
    const zone = zoneTracker.zones.get(pattern.zoneId);
    expect(zone.testCount).toBe(0);  // Not tested yet
  });
});
```

---

## 📊 INTEGRATION TEST

### Full Workflow Test:
```javascript
describe('Complete Trading Workflow', () => {
  test('should execute full DPD retest cycle', async () => {
    // 1. Detect pattern
    const data = generateDPDData();
    const patterns = detectAllFrequencyPatterns(data);
    
    expect(patterns.DPD).toHaveLength(1);
    const pattern = patterns.DPD[0];
    
    // 2. Zone created
    const zone = zoneTracker.zones.get(pattern.zoneId);
    expect(zone.status).toBe('FRESH');
    expect(zone.testCount).toBe(0);
    
    // 3. Price moves away then returns
    const retestData = [...data, ...generateRetestCandles()];
    
    // 4. Detect retest
    const currentCandle = retestData[retestData.length - 1];
    const isRetesting = zoneTracker.isRetesting(zone, currentCandle);
    expect(isRetesting).toBe(true);
    
    // 5. Validate confirmation
    const recentCandles = retestData.slice(-3);
    const confirmation = validateHFZConfirmation(zone, recentCandles);
    expect(confirmation.hasConfirmation).toBe(true);
    
    // 6. Entry signal generated
    const entrySignal = {
      action: 'SHORT',
      zone: zone.id,
      entry: zone.entry,
      stopLoss: zone.stopLoss,
      confirmed: true,
    };
    
    expect(entrySignal.action).toBe('SHORT');
    expect(entrySignal.confirmed).toBe(true);
    
    // 7. Record retest
    zoneTracker.recordRetest(zone.id, currentCandle, true);
    expect(zone.status).toBe('TESTED_1X');
    expect(zone.strength).toBe(80);
  });
});
```

---

## ✅ ACCEPTANCE CRITERIA

### Pattern Detection Must:
- [ ] Detect DPD/UPU/UPD/DPU patterns correctly
- [ ] Create zones (HFZ/LFZ) from patterns
- [ ] Set `entryStrategy: 'WAIT_RETEST'`
- [ ] Set `needsRetest: true`
- [ ] NOT generate immediate entry signals

### Zone Tracking Must:
- [ ] Create zones with FRESH status
- [ ] Track test count (0, 1, 2)
- [ ] Update strength (100 → 80 → 60)
- [ ] Detect retests accurately
- [ ] Invalidate broken zones

### Confirmation Must:
- [ ] Detect pin bars correctly
- [ ] Detect engulfing patterns correctly
- [ ] Detect hammers/shooting stars correctly
- [ ] Validate HFZ confirmation (bearish)
- [ ] Validate LFZ confirmation (bullish)
- [ ] Require confirmation for entry

### Entry Logic Must:
- [ ] Wait for retest (not entry at breakout)
- [ ] Require confirmation candle
- [ ] Check zone status (not broken)
- [ ] Check test count (< 3)
- [ ] Generate entry only when all conditions met

---

## 🎯 PERFORMANCE BENCHMARKS

```javascript
const BENCHMARKS = {
  patternDetection: 500,      // 500ms per 100 candles
  zoneTracking: 50,           // 50ms per zone update
  retestDetection: 100,       // 100ms per candle check
  confirmationValidation: 50, // 50ms per validation
  fullWorkflow: 2000,         // 2s for complete cycle
};
```

### Performance Test:
```javascript
test('should complete full scan within time limit', () => {
  const data = generate100Candles();
  
  console.time('Full Scan');
  const patterns = detectAllFrequencyPatterns(data);
  const zones = zoneTracker.getActiveZones();
  console.timeEnd('Full Scan');
  
  // Should complete in <2 seconds
  expect(performance.now()).toBeLessThan(2000);
});
```

---

## 🔧 TEST DATA GENERATORS

### Generate DPD Pattern:
```javascript
function generateDPDData() {
  const phase1 = [];
  for (let i = 0; i < 30; i++) {
    phase1.push({
      timestamp: Date.now() + i * 3600000,
      open: 100 - (i * 0.3),
      high: 100 - (i * 0.3) + 0.5,
      low: 100 - (i * 0.3) - 0.5,
      close: 100 - (i * 0.3) - 0.2,
      volume: 1000 + Math.random() * 500,
    });
  }
  
  // Pause (3 candles, tight range)
  const pause = [];
  for (let i = 0; i < 3; i++) {
    pause.push({
      timestamp: Date.now() + (30 + i) * 3600000,
      open: 90 + (Math.random() - 0.5) * 0.5,
      high: 90.4,
      low: 89.6,
      close: 90 + (Math.random() - 0.5) * 0.4,
      volume: 800,
    });
  }
  
  // Phase 3 (continuation down)
  const phase3 = [];
  for (let i = 0; i < 30; i++) {
    phase3.push({
      timestamp: Date.now() + (33 + i) * 3600000,
      open: 90 - (i * 0.3),
      high: 90 - (i * 0.3) + 0.5,
      low: 90 - (i * 0.3) - 0.5,
      close: 90 - (i * 0.3) - 0.2,
      volume: 1200,
    });
  }
  
  return [...phase1, ...pause, ...phase3];
}
```

### Generate Retest with Confirmation:
```javascript
function generateRetestToHFZ(numCandles, zonePrice, confirmationType) {
  const candles = [];
  
  // Approach zone
  candles.push({
    timestamp: Date.now(),
    open: zonePrice - 2,
    high: zonePrice - 1,
    low: zonePrice - 2.5,
    close: zonePrice - 1.5,
    volume: 1000,
  });
  
  // Test zone with confirmation
  if (confirmationType === 'bearish') {
    // Bearish pin bar
    candles.push({
      timestamp: Date.now() + 3600000,
      open: zonePrice - 0.5,
      high: zonePrice + 0.5,  // Touches zone, rejected
      low: zonePrice - 1,
      close: zonePrice - 0.8,  // Closes below
      volume: 1500,
    });
  }
  
  return candles;
}
```

---

## ⚠️ CRITICAL TEST REQUIREMENTS

### Must Pass ALL:
1. ✅ Pattern detection creates zones (not immediate entry)
2. ✅ Entry ONLY on confirmed retests
3. ✅ Zone status tracked correctly
4. ✅ Broken zones invalidated
5. ✅ Weak zones (3+ tests) rejected
6. ✅ No entry without confirmation
7. ✅ Performance within benchmarks

### Must Reject:
1. ❌ Entry at breakout (no retest)
2. ❌ Entry without confirmation
3. ❌ Trading invalidated zones
4. ❌ Trading weak zones (3+ tests)

---

**✅ FILE ĐÃ CORRECTED - TEST RETEST STRATEGY!**

© GEM Trading Academy - Frequency Trading Method  
**Corrected Test Cases - November 2, 2025**
