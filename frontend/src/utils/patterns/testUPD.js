/**
 * Manual Test Runner for UPD Pattern
 * Run this file directly with: node testUPD.js
 */

import { detectUPD } from './UPDPattern.js';

// ============================================
// TEST DATA
// ============================================

/**
 * Generate valid UPD pattern for testing
 */
function generateTestPattern() {
  const candles = [];
  let price = 40000;

  console.log('📊 Generating test pattern...\n');

  // Pre-history (20 candles)
  console.log('1️⃣ Creating pre-history (20 candles)...');
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
  console.log(`   Price after pre-history: $${price.toFixed(2)}`);

  // Phase 1: UP - Rally +20%
  console.log('\n2️⃣ Phase 1 (UP): Creating 12-candle rally (+20%)...');
  const phase1StartPrice = price;
  for (let i = 0; i < 12; i++) {
    const increase = 650;
    candles.push({
      open: price,
      high: price + increase + 100,
      low: price - 50,
      close: price + increase,
      volume: 1200 + i * 50, // Volume increases (FOMO)
      timestamp: new Date(2021, 10, 21 + i),
    });
    price += increase;
  }
  const phase1Change = ((price - phase1StartPrice) / phase1StartPrice * 100).toFixed(2);
  console.log(`   Phase 1 complete: $${phase1StartPrice.toFixed(2)} → $${price.toFixed(2)} (+${phase1Change}%)`);

  // Phase 2: PAUSE - Distribution
  console.log('\n3️⃣ Phase 2 (PAUSE): Creating 3-candle consolidation (distribution)...');
  const pauseHigh = price + 200;
  const pauseLow = price - 200;
  const pauseMid = (pauseHigh + pauseLow) / 2;

  for (let i = 0; i < 3; i++) {
    candles.push({
      open: pauseMid + (i % 2 === 0 ? 100 : -100),
      high: pauseHigh,
      low: pauseLow,
      close: pauseMid + (i % 2 === 0 ? -100 : 100),
      volume: 1400, // HIGH volume (distribution!)
      timestamp: new Date(2021, 11, 3 + i),
    });
  }
  const pauseRange = ((pauseHigh - pauseLow) / price * 100).toFixed(2);
  console.log(`   Pause range: $${pauseLow.toFixed(2)} - $${pauseHigh.toFixed(2)} (${pauseRange}%)`);
  console.log(`   Distribution volume: 1400 (HIGH)`);

  // Phase 3: DOWN - Reversal
  console.log('\n4️⃣ Phase 3 (DOWN): Creating 3-candle breakdown (-10%)...');
  const phase3StartPrice = price;
  for (let i = 0; i < 3; i++) {
    const decrease = 1600;
    candles.push({
      open: price,
      high: price + 50,
      low: price - decrease - 100,
      close: price - decrease,
      volume: 2000 + i * 200, // Volume SPIKE (breakout!)
      timestamp: new Date(2021, 11, 6 + i),
    });
    price -= decrease;
  }
  const phase3Change = ((price - phase3StartPrice) / phase3StartPrice * 100).toFixed(2);
  console.log(`   Phase 3 complete: $${phase3StartPrice.toFixed(2)} → $${price.toFixed(2)} (${phase3Change}%)`);

  // Post-pattern
  console.log('\n5️⃣ Adding post-pattern continuation (5 candles)...');
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

  console.log(`\n✅ Test pattern generated: ${candles.length} candles`);
  console.log(`   Final price: $${price.toFixed(2)}\n`);

  return candles;
}

/**
 * Real BTC November 2021 ATH example
 */
function generateBTCExample() {
  console.log('🪙 Generating real BTC November 2021 ATH example...\n');

  return [
    // Pre-history
    ...Array.from({ length: 10 }, (_, i) => ({
      open: 55000 + i * 800,
      high: 55000 + i * 800 + 500,
      low: 55000 + i * 800 - 300,
      close: 55000 + (i + 1) * 800,
      volume: 25000 + i * 500,
      timestamp: new Date(2021, 9, 20 + i),
    })),

    // Phase 1: Rally to ATH
    ...Array.from({ length: 10 }, (_, i) => ({
      open: 63000 + i * 600,
      high: 63000 + i * 600 + 500,
      low: 63000 + i * 600 - 200,
      close: 63000 + (i + 1) * 600,
      volume: 33000 + i * 1000,
      timestamp: new Date(2021, 10, 1 + i),
    })),

    // Phase 2: Distribution at ATH
    { open: 68800, high: 69200, low: 67500, close: 68000, volume: 40000, timestamp: new Date(2021, 10, 11) },
    { open: 68000, high: 68800, low: 67300, close: 67900, volume: 39500, timestamp: new Date(2021, 10, 12) },
    { open: 67900, high: 68500, low: 67200, close: 67700, volume: 38500, timestamp: new Date(2021, 10, 13) },
    { open: 67700, high: 68300, low: 67400, close: 67800, volume: 39000, timestamp: new Date(2021, 10, 14) },

    // Phase 3: Reversal
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
// TEST RUNNER
// ============================================

function printPattern(pattern) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`🎯 UPD PATTERN DETECTED!`);
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📊 PATTERN INFO:');
  console.log(`   Type: ${pattern.type} (${pattern.patternType})`);
  console.log(`   Signal: ${pattern.signal}`);
  console.log(`   Confidence: ${pattern.confidence}%`);
  console.log(`   Expected Win Rate: ${pattern.expectedWinRate}%`);
  console.log(`   Expected R:R: 1:${pattern.expectedRR}\n`);

  console.log('1️⃣ PHASE 1 (UP):');
  console.log(`   Candles: ${pattern.phase1.candles}`);
  console.log(`   Change: +${pattern.phase1.change.toFixed(2)}%`);
  console.log(`   Volume: ${pattern.phase1.volume.toFixed(0)}`);
  console.log(`   Highest: $${pattern.phase1.highestPrice.toFixed(2)}\n`);

  console.log('2️⃣ PHASE 2 (PAUSE):');
  console.log(`   Candles: ${pattern.phase2.candles}`);
  console.log(`   Range: ${pattern.phase2.range.toFixed(2)}%`);
  console.log(`   Volume: ${pattern.phase2.volume.toFixed(0)} ${pattern.hasDistribution ? '✅ HIGH (Distribution)' : '⚠️ LOW'}`);
  console.log(`   High: $${pattern.phase2.high.toFixed(2)}`);
  console.log(`   Low: $${pattern.phase2.low.toFixed(2)}\n`);

  console.log('3️⃣ PHASE 3 (DOWN):');
  console.log(`   Candles: ${pattern.phase3.candles}`);
  console.log(`   Change: ${pattern.phase3.change.toFixed(2)}%`);
  console.log(`   Volume: ${pattern.phase3.volume.toFixed(0)} ${pattern.hasStrongVolume ? '✅ HIGH (Breakout)' : '⚠️ LOW'}`);
  console.log(`   Lowest: $${pattern.phase3.lowestPrice.toFixed(2)}\n`);

  console.log('🎯 HFZ ZONE (from Pause):');
  console.log(`   Top: $${pattern.zoneTop.toFixed(2)}`);
  console.log(`   Mid: $${pattern.zoneMid.toFixed(2)}`);
  console.log(`   Bottom: $${pattern.zoneBottom.toFixed(2)}`);
  console.log(`   Status: ${pattern.zoneStatus}\n`);

  console.log('💰 TRADING LEVELS:');
  console.log(`   Entry: $${pattern.entry.toFixed(2)} (at HFZ retest)`);
  console.log(`   Stop Loss: $${pattern.stopLoss.toFixed(2)}`);
  console.log(`   Target: $${pattern.target.toFixed(2)}`);
  console.log(`   Risk: $${pattern.riskReward.toFixed(2)} (${((pattern.stopLoss - pattern.entry) / pattern.entry * 100).toFixed(2)}%)`);
  console.log(`   Reward: $${pattern.riskReward.toFixed(2)} (${((pattern.entry - pattern.target) / pattern.entry * 100).toFixed(2)}%)`);
  console.log(`   R:R Ratio: 1:${pattern.riskReward.toFixed(2)}\n`);

  console.log('✅ VALIDATION:');
  console.log(`   Strong Volume: ${pattern.hasStrongVolume ? '✅' : '❌'}`);
  console.log(`   Distribution: ${pattern.hasDistribution ? '✅' : '❌'}`);
  console.log(`   Valid Reversal: ${pattern.isValidReversal ? '✅' : '❌'}\n`);

  console.log('═══════════════════════════════════════════════════════════\n');
}

async function runTests() {
  console.log('\n🚀 UPD PATTERN DETECTION TEST\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Test 1: Synthetic pattern
  console.log('TEST 1: Synthetic Valid Pattern\n');
  console.log('───────────────────────────────────────────────────────────\n');

  const testCandles = generateTestPattern();
  console.log('🔍 Running detection...\n');

  const patterns1 = detectUPD(testCandles);

  if (patterns1.length > 0) {
    console.log(`✅ SUCCESS: Detected ${patterns1.length} pattern(s)\n`);
    printPattern(patterns1[0]);
  } else {
    console.log('❌ FAILED: No patterns detected\n\n');
  }

  // Test 2: Real BTC data
  console.log('\n───────────────────────────────────────────────────────────\n');
  console.log('TEST 2: Real BTC November 2021 ATH\n');
  console.log('───────────────────────────────────────────────────────────\n');

  const btcCandles = generateBTCExample();
  console.log(`🔍 Running detection on ${btcCandles.length} BTC candles...\n`);

  const patterns2 = detectUPD(btcCandles);

  if (patterns2.length > 0) {
    console.log(`✅ SUCCESS: Detected ${patterns2.length} pattern(s) in BTC data\n`);
    printPattern(patterns2[0]);
  } else {
    console.log('❌ FAILED: No patterns detected in BTC data\n\n');
  }

  // Summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`Test 1 (Synthetic): ${patterns1.length > 0 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 2 (Real BTC): ${patterns2.length > 0 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`\nTotal Patterns Detected: ${patterns1.length + patterns2.length}`);
  console.log('\n✅ Testing complete!\n');
}

// Run tests
runTests().catch(console.error);
