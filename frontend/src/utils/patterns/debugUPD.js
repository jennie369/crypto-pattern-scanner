/**
 * Debug UPD Pattern Detection
 * Shows detailed logging of detection process
 */

import { detectUPD } from './UPDPattern.js';

function generateSimplePattern() {
  const candles = [];
  let price = 40000;

  // Pre-history (20 candles)
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

  console.log(`✅ Pre-history: 20 candles, price $${candles[0].close} → $${candles[19].close}`);

  // Phase 1: UP (12 candles, +20%)
  const phase1StartIdx = candles.length;
  const phase1StartPrice = price;

  for (let i = 0; i < 12; i++) {
    const increase = 650;
    candles.push({
      open: price,
      high: price + increase + 100,
      low: price - 50,
      close: price + increase,
      volume: 1200 + i * 50,
      timestamp: new Date(2021, 10, 21 + i),
    });
    price += increase;
  }

  const phase1EndIdx = candles.length - 1;
  const phase1Change = ((price - phase1StartPrice) / phase1StartPrice) * 100;
  console.log(`✅ Phase 1 (UP): Idx ${phase1StartIdx}-${phase1EndIdx}, $${phase1StartPrice.toFixed(0)} → $${price.toFixed(0)} (+${phase1Change.toFixed(2)}%)`);

  // Phase 2: PAUSE (3 candles)
  const phase2StartIdx = candles.length;
  const pauseHigh = price + 200;
  const pauseLow = price - 200;
  const pauseMid = (pauseHigh + pauseLow) / 2;

  for (let i = 0; i < 3; i++) {
    candles.push({
      open: pauseMid,
      high: pauseHigh,
      low: pauseLow,
      close: pauseMid,
      volume: 1400,
      timestamp: new Date(2021, 11, 3 + i),
    });
  }

  const phase2EndIdx = candles.length - 1;
  const pauseRange = ((pauseHigh - pauseLow) / price) * 100;
  console.log(`✅ Phase 2 (PAUSE): Idx ${phase2StartIdx}-${phase2EndIdx}, Range $${pauseLow.toFixed(0)}-$${pauseHigh.toFixed(0)} (${pauseRange.toFixed(2)}%)`);

  // Phase 3: DOWN (3 candles, -10%)
  const phase3StartIdx = candles.length;
  const phase3StartPrice = price;

  for (let i = 0; i < 3; i++) {
    const decrease = 1600;
    candles.push({
      open: price,
      high: price + 50,
      low: price - decrease - 100,
      close: price - decrease,
      volume: 2000 + i * 200,
      timestamp: new Date(2021, 11, 6 + i),
    });
    price -= decrease;
  }

  const phase3EndIdx = candles.length - 1;
  const phase3Change = ((price - phase3StartPrice) / phase3StartPrice) * 100;
  console.log(`✅ Phase 3 (DOWN): Idx ${phase3StartIdx}-${phase3EndIdx}, $${phase3StartPrice.toFixed(0)} → $${price.toFixed(0)} (${phase3Change.toFixed(2)}%)`);

  // Post-pattern (5 candles)
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

  console.log(`✅ Total candles: ${candles.length}\n`);

  return candles;
}

console.log('🐛 UPD PATTERN DEBUG\n');
console.log('═══════════════════════════════════════════════════════════\n');
console.log('Generating test pattern:\n');

const candles = generateSimplePattern();

console.log('───────────────────────────────────────────────────────────\n');
console.log('Running detection with default config:\n');

const patterns = detectUPD(candles, {
  minPhase1Candles: 10,
  minPhase1Change: 0.02,
  maxPhase2Candles: 5,
  minPhase2Candles: 1,
  maxPhase2Range: 0.015,
  minPhase3Change: 0.02,
  volumeIncrease: 1.2,
  minConfidence: 60,
  timeframe: '1D',
});

console.log(`\n📊 Detection Results: ${patterns.length} pattern(s) found\n`);

if (patterns.length > 0) {
  patterns.forEach((pattern, idx) => {
    console.log(`Pattern ${idx + 1}:`);
    console.log(`  Type: ${pattern.type}`);
    console.log(`  Confidence: ${pattern.confidence}%`);
    console.log(`  Phase 1: ${pattern.phase1.candles} candles, +${pattern.phase1.change.toFixed(2)}%`);
    console.log(`  Phase 2: ${pattern.phase2.candles} candles, ${pattern.phase2.range.toFixed(2)}% range`);
    console.log(`  Phase 3: ${pattern.phase3.candles} candles, ${pattern.phase3.change.toFixed(2)}%`);
    console.log(`  Entry: $${pattern.entry.toFixed(2)}`);
    console.log(`  Stop: $${pattern.stopLoss.toFixed(2)}`);
    console.log(`  Target: $${pattern.target.toFixed(2)}`);
    console.log(`  R:R: 1:${pattern.riskReward.toFixed(2)}\n`);
  });
} else {
  console.log('❌ No patterns detected. Possible issues:');
  console.log('   1. Not enough candles before pattern (need 50+)');
  console.log('   2. Phase 1 not detected as significant peak');
  console.log('   3. Volume thresholds not met');
  console.log('   4. Phases not continuous');
  console.log('   5. Validation failed\n');

  // Try with more relaxed config
  console.log('Trying with relaxed configuration...\n');

  const relaxedPatterns = detectUPD(candles, {
    minPhase1Candles: 8, // Less strict
    minPhase1Change: 0.015, // 1.5% instead of 2%
    maxPhase2Candles: 6,
    minPhase2Candles: 1,
    maxPhase2Range: 0.02, // 2% instead of 1.5%
    minPhase3Change: 0.015, // 1.5% instead of 2%
    volumeIncrease: 1.0, // No volume requirement
    minConfidence: 50, // Lower confidence threshold
  });

  console.log(`📊 Relaxed Results: ${relaxedPatterns.length} pattern(s) found\n`);

  if (relaxedPatterns.length > 0) {
    console.log('✅ Found patterns with relaxed config!');
    relaxedPatterns.forEach((pattern, idx) => {
      console.log(`\nPattern ${idx + 1}:`);
      console.log(`  Confidence: ${pattern.confidence}%`);
      console.log(`  Phase 1: ${pattern.phase1.candles} candles, +${pattern.phase1.change.toFixed(2)}%`);
      console.log(`  Phase 2: ${pattern.phase2.candles} candles, ${pattern.phase2.range.toFixed(2)}% range`);
      console.log(`  Phase 3: ${pattern.phase3.candles} candles, ${pattern.phase3.change.toFixed(2)}%`);
    });
  }
}

console.log('\n═══════════════════════════════════════════════════════════\n');
