/**
 * Fixed Manual Test Runner for UPD Pattern
 * Now with enough candles (50+) for proper detection
 */

import { detectUPD } from './UPDPattern.js';

function generateValidPattern() {
  const candles = [];
  let price = 40000;

  console.log('📊 Generating VALID UPD pattern with sufficient history...\n');

  // Pre-history (30 candles) - enough history to validate peak
  console.log('1️⃣ Creating pre-history (30 candles)...');
  for (let i = 0; i < 30; i++) {
    candles.push({
      open: price,
      high: price + 100,
      low: price - 100,
      close: price + 30,
      volume: 1000 + Math.random() * 200,
      timestamp: new Date(2021, 10, i + 1),
    });
    price += 30;
  }
  console.log(`   Price after pre-history: $${price.toFixed(2)}`);
  console.log(`   Candles so far: ${candles.length}`);

  // Phase 1: UP - Rally +20% (12 candles)
  console.log('\n2️⃣ Phase 1 (UP): Creating 12-candle rally (+20%)...');
  const phase1Start = candles.length;
  const phase1StartPrice = price;

  for (let i = 0; i < 12; i++) {
    const increase = 650; // Total will be ~20%
    candles.push({
      open: price,
      high: price + increase + 100,
      low: price - 50,
      close: price + increase,
      volume: 1300 + i * 50, // Increasing volume (FOMO)
      timestamp: new Date(2021, 11, 1 + i),
    });
    price += increase;
  }

  const phase1Change = ((price - phase1StartPrice) / phase1StartPrice * 100);
  console.log(`   Phase 1: Candles ${phase1Start} to ${candles.length - 1}`);
  console.log(`   Change: $${phase1StartPrice.toFixed(2)} → $${price.toFixed(2)} (+${phase1Change.toFixed(2)}%)`);
  console.log(`   Candles so far: ${candles.length}`);

  // Phase 2: PAUSE - Distribution (3 candles)
  console.log('\n3️⃣ Phase 2 (PAUSE): Creating 3-candle consolidation...');
  const phase2Start = candles.length;
  const pauseHigh = price + 200;
  const pauseLow = price - 200;
  const pauseMid = (pauseHigh + pauseLow) / 2;

  for (let i = 0; i < 3; i++) {
    candles.push({
      open: pauseMid + (i % 2 === 0 ? 100 : -100),
      high: pauseHigh,
      low: pauseLow,
      close: pauseMid + (i % 2 === 0 ? -50 : 50),
      volume: 1500, // HIGH volume (distribution!)
      timestamp: new Date(2021, 11, 13 + i),
    });
  }

  const pauseRange = ((pauseHigh - pauseLow) / price * 100);
  console.log(`   Phase 2: Candles ${phase2Start} to ${candles.length - 1}`);
  console.log(`   Range: $${pauseLow.toFixed(2)} - $${pauseHigh.toFixed(2)} (${pauseRange.toFixed(2)}%)`);
  console.log(`   Volume: 1500 (HIGH - distribution)`);
  console.log(`   Candles so far: ${candles.length}`);

  // Phase 3: DOWN - Breakdown -10% (3 candles)
  console.log('\n4️⃣ Phase 3 (DOWN): Creating 3-candle breakdown (-10%)...');
  const phase3Start = candles.length;
  const phase3StartPrice = price;

  for (let i = 0; i < 3; i++) {
    const decrease = 1600; // Total ~-10%
    candles.push({
      open: price,
      high: price + 50,
      low: price - decrease - 100,
      close: price - decrease,
      volume: 2200 + i * 300, // Spiking volume (breakout!)
      timestamp: new Date(2021, 11, 16 + i),
    });
    price -= decrease;
  }

  const phase3Change = ((price - phase3StartPrice) / phase3StartPrice * 100);
  console.log(`   Phase 3: Candles ${phase3Start} to ${candles.length - 1}`);
  console.log(`   Change: $${phase3StartPrice.toFixed(2)} → $${price.toFixed(2)} (${phase3Change.toFixed(2)}%)`);
  console.log(`   Candles so far: ${candles.length}`);

  // Post-pattern (10 candles) - more post-pattern data
  console.log('\n5️⃣ Adding post-pattern continuation (10 candles)...');
  for (let i = 0; i < 10; i++) {
    candles.push({
      open: price,
      high: price + 100,
      low: price - 150,
      close: price - 80,
      volume: 1600,
      timestamp: new Date(2021, 11, 19 + i),
    });
    price -= 80;
  }

  console.log(`\n✅ Pattern generated: ${candles.length} candles (need 50+ for detection)`);
  console.log(`   Final price: $${price.toFixed(2)}\n`);

  return candles;
}

function printPattern(pattern, index = 0) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`🎯 UPD PATTERN #${index + 1} DETECTED!`);
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📊 PATTERN INFO:');
  console.log(`   Type: ${pattern.type} (${pattern.patternType})`);
  console.log(`   Name: ${pattern.name}`);
  console.log(`   Signal: ${pattern.signal}`);
  console.log(`   Confidence: ${pattern.confidence}%`);
  console.log(`   Expected Win Rate: ${pattern.expectedWinRate}%`);
  console.log(`   Expected R:R: 1:${pattern.expectedRR}\n`);

  console.log('1️⃣ PHASE 1 (UP):');
  console.log(`   Candles: ${pattern.phase1.start} → ${pattern.phase1.end} (${pattern.phase1.candles} total)`);
  console.log(`   Price Change: +${pattern.phase1.change.toFixed(2)}%`);
  console.log(`   Volume: ${pattern.phase1.volume.toFixed(0)}`);
  console.log(`   Highest Price: $${pattern.phase1.highestPrice.toFixed(2)}\n`);

  console.log('2️⃣ PHASE 2 (PAUSE):');
  console.log(`   Candles: ${pattern.phase2.start} → ${pattern.phase2.end} (${pattern.phase2.candles} total)`);
  console.log(`   Range: ${pattern.phase2.range.toFixed(2)}%`);
  console.log(`   Volume: ${pattern.phase2.volume.toFixed(0)} ${pattern.hasDistribution ? '✅ HIGH' : '⚠️ LOW'}`);
  console.log(`   High: $${pattern.phase2.high.toFixed(2)}`);
  console.log(`   Low: $${pattern.phase2.low.toFixed(2)}\n`);

  console.log('3️⃣ PHASE 3 (DOWN):');
  console.log(`   Candles: ${pattern.phase3.start} → ${pattern.phase3.end} (${pattern.phase3.candles} total)`);
  console.log(`   Price Change: ${pattern.phase3.change.toFixed(2)}%`);
  console.log(`   Volume: ${pattern.phase3.volume.toFixed(0)} ${pattern.hasStrongVolume ? '✅ HIGH' : '⚠️ LOW'}`);
  console.log(`   Lowest Price: $${pattern.phase3.lowestPrice.toFixed(2)}\n`);

  console.log('🎯 HFZ ZONE (from Phase 2):');
  console.log(`   Zone Type: ${pattern.zoneType}`);
  console.log(`   Top: $${pattern.zoneTop.toFixed(2)}`);
  console.log(`   Mid: $${pattern.zoneMid.toFixed(2)}`);
  console.log(`   Bottom: $${pattern.zoneBottom.toFixed(2)}`);
  console.log(`   Status: ${pattern.zoneStatus} (Strength: ${pattern.strength}%)\n`);

  console.log('💰 TRADING SETUP:');
  console.log(`   Entry: $${pattern.entry.toFixed(2)} (wait for HFZ retest)`);
  console.log(`   Stop Loss: $${pattern.stopLoss.toFixed(2)}`);
  console.log(`   Target: $${pattern.target.toFixed(2)}`);

  const riskPercent = ((pattern.stopLoss - pattern.entry) / pattern.entry * 100);
  const rewardPercent = ((pattern.entry - pattern.target) / pattern.entry * 100);

  console.log(`   Risk: ${riskPercent.toFixed(2)}%`);
  console.log(`   Reward: ${rewardPercent.toFixed(2)}%`);
  console.log(`   R:R Ratio: 1:${pattern.riskReward.toFixed(2)}\n`);

  console.log('✅ VALIDATION FLAGS:');
  console.log(`   Strong Volume (Phase 1 & 3): ${pattern.hasStrongVolume ? '✅ YES' : '❌ NO'}`);
  console.log(`   Distribution (Phase 2): ${pattern.hasDistribution ? '✅ YES' : '❌ NO'}`);
  console.log(`   Valid Reversal: ${pattern.isValidReversal ? '✅ YES' : '❌ NO'}\n`);

  console.log('═══════════════════════════════════════════════════════════\n');
}

async function runTest() {
  console.log('\n🚀 UPD PATTERN DETECTION TEST (FIXED)\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Generate test data
  const candles = generateValidPattern();

  console.log('───────────────────────────────────────────────────────────\n');
  console.log('🔍 Running UPD detection...\n');

  // Run detection with default config
  const patterns = detectUPD(candles, {
    minPhase1Candles: 10,
    minPhase1Change: 0.02,      // 2%
    maxPhase2Candles: 5,
    minPhase2Candles: 1,
    maxPhase2Range: 0.015,      // 1.5%
    minPhase3Change: 0.02,      // 2%
    volumeIncrease: 1.2,        // 20% above MA
    minConfidence: 60,
    timeframe: '1D',
  });

  console.log(`📊 RESULTS: ${patterns.length} pattern(s) detected\n`);

  if (patterns.length > 0) {
    console.log('✅ SUCCESS! Pattern(s) detected:\n');
    patterns.forEach((pattern, idx) => {
      printPattern(pattern, idx);
    });

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📈 TRADING SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');

    const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
    const avgRR = patterns.reduce((sum, p) => sum + p.riskReward, 0) / patterns.length;

    console.log(`Total Patterns Found: ${patterns.length}`);
    console.log(`Average Confidence: ${avgConfidence.toFixed(1)}%`);
    console.log(`Average R:R: 1:${avgRR.toFixed(2)}`);
    console.log(`Expected Win Rate: 65%`);
    console.log('\n✅ UPD pattern detection is working correctly!\n');
  } else {
    console.log('❌ FAILED: No patterns detected\n');
    console.log('Possible reasons:');
    console.log('  • Not enough candles (<50)');
    console.log('  • Phase 1 change too small (<2%)');
    console.log('  • Phase 2 range too wide (>1.5%)');
    console.log('  • Phase 3 change too small (<2%)');
    console.log('  • Volume requirements not met');
    console.log('  • Phases not continuous');
    console.log('  • Peak validation failed\n');
  }

  console.log('═══════════════════════════════════════════════════════════\n');
}

runTest().catch(console.error);
