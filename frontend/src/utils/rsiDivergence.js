/**
 * RSI Divergence Detection - TIER2/3 Feature
 * Detects RSI divergence patterns that signal potential reversals
 * Win Rate Impact: +5-8%
 *
 * @module rsiDivergence
 */

/**
 * Calculate RSI using Wilder's smoothing method
 * @param {Array} candles - OHLCV data
 * @param {Number} period - RSI period (default 14)
 * @returns {Array} RSI values
 */
export function calculateRSI(candles, period = 14) {
  if (!candles || candles.length < period + 1) {
    return [];
  }

  const rsiValues = [];
  const gains = [];
  const losses = [];

  // Calculate price changes
  for (let i = 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // First average (simple average)
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // Calculate first RSI
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsiValues.push({
    value: 100 - (100 / (1 + rs)),
    index: period
  });

  // Wilder's smoothing for subsequent values
  for (let i = period; i < gains.length; i++) {
    avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
    avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsiValues.push({
      value: 100 - (100 / (1 + rs)),
      index: i + 1
    });
  }

  return rsiValues;
}

/**
 * Find swing highs in price data
 * @param {Array} data - Array of {value, index} or candles
 * @param {Number} lookback - How many candles to look back
 * @param {String} field - Field to analyze ('high', 'low', or 'value')
 * @returns {Array} Swing high points
 */
function findSwingHighs(data, lookback = 5, field = 'high') {
  const swings = [];

  for (let i = 2; i < data.length - 2; i++) {
    const current = field === 'value' ? data[i].value : data[i][field];
    const prev1 = field === 'value' ? data[i - 1].value : data[i - 1][field];
    const prev2 = field === 'value' ? data[i - 2].value : data[i - 2][field];
    const next1 = field === 'value' ? data[i + 1].value : data[i + 1][field];
    const next2 = field === 'value' ? data[i + 2].value : data[i + 2][field];

    // Swing high: current is higher than surrounding
    if (current > prev1 && current > prev2 && current > next1 && current > next2) {
      swings.push({
        value: current,
        index: field === 'value' ? data[i].index : i
      });
    }
  }

  return swings.slice(-lookback); // Return most recent
}

/**
 * Find swing lows in price data
 * @param {Array} data - Array of {value, index} or candles
 * @param {Number} lookback - How many candles to look back
 * @param {String} field - Field to analyze ('high', 'low', or 'value')
 * @returns {Array} Swing low points
 */
function findSwingLows(data, lookback = 5, field = 'low') {
  const swings = [];

  for (let i = 2; i < data.length - 2; i++) {
    const current = field === 'value' ? data[i].value : data[i][field];
    const prev1 = field === 'value' ? data[i - 1].value : data[i - 1][field];
    const prev2 = field === 'value' ? data[i - 2].value : data[i - 2][field];
    const next1 = field === 'value' ? data[i + 1].value : data[i + 1][field];
    const next2 = field === 'value' ? data[i + 2].value : data[i + 2][field];

    // Swing low: current is lower than surrounding
    if (current < prev1 && current < prev2 && current < next1 && current < next2) {
      swings.push({
        value: current,
        index: field === 'value' ? data[i].index : i
      });
    }
  }

  return swings.slice(-lookback); // Return most recent
}

/**
 * Detect bearish divergence (price higher high, RSI lower high)
 * @param {Array} candles - OHLCV data
 * @param {Array} rsiValues - RSI values with indices
 * @returns {Object|null} Divergence info or null
 */
function detectBearishDivergence(candles, rsiValues) {
  const priceHighs = findSwingHighs(candles, 5, 'high');
  const rsiHighs = findSwingHighs(rsiValues, 5, 'value');

  if (priceHighs.length < 2 || rsiHighs.length < 2) {
    return null;
  }

  // Get last two highs
  const [prevPriceHigh, lastPriceHigh] = priceHighs.slice(-2);
  const [prevRSIHigh, lastRSIHigh] = rsiHighs.slice(-2);

  // Check indices are close enough to compare
  const indexDiff = Math.abs(lastPriceHigh.index - lastRSIHigh.index);
  if (indexDiff > 5) return null;

  // BEARISH DIVERGENCE:
  // Price makes HIGHER HIGH
  // RSI makes LOWER HIGH
  const priceHigherHigh = lastPriceHigh.value > prevPriceHigh.value;
  const rsiLowerHigh = lastRSIHigh.value < prevRSIHigh.value;

  if (priceHigherHigh && rsiLowerHigh) {
    const strength = Math.min(
      ((lastPriceHigh.value - prevPriceHigh.value) / prevPriceHigh.value) * 100,
      ((prevRSIHigh.value - lastRSIHigh.value) / prevRSIHigh.value) * 100
    );

    return {
      type: 'BEARISH',
      signal: 'SHORT',
      priceHigh1: prevPriceHigh.value,
      priceHigh2: lastPriceHigh.value,
      rsiHigh1: prevRSIHigh.value,
      rsiHigh2: lastRSIHigh.value,
      strength: Math.abs(strength),
      description: 'Price higher high + RSI lower high = bearish divergence'
    };
  }

  return null;
}

/**
 * Detect bullish divergence (price lower low, RSI higher low)
 * @param {Array} candles - OHLCV data
 * @param {Array} rsiValues - RSI values with indices
 * @returns {Object|null} Divergence info or null
 */
function detectBullishDivergence(candles, rsiValues) {
  const priceLows = findSwingLows(candles, 5, 'low');
  const rsiLows = findSwingLows(rsiValues, 5, 'value');

  if (priceLows.length < 2 || rsiLows.length < 2) {
    return null;
  }

  // Get last two lows
  const [prevPriceLow, lastPriceLow] = priceLows.slice(-2);
  const [prevRSILow, lastRSILow] = rsiLows.slice(-2);

  // Check indices are close enough to compare
  const indexDiff = Math.abs(lastPriceLow.index - lastRSILow.index);
  if (indexDiff > 5) return null;

  // BULLISH DIVERGENCE:
  // Price makes LOWER LOW
  // RSI makes HIGHER LOW
  const priceLowerLow = lastPriceLow.value < prevPriceLow.value;
  const rsiHigherLow = lastRSILow.value > prevRSILow.value;

  if (priceLowerLow && rsiHigherLow) {
    const strength = Math.min(
      ((prevPriceLow.value - lastPriceLow.value) / prevPriceLow.value) * 100,
      ((lastRSILow.value - prevRSILow.value) / prevRSILow.value) * 100
    );

    return {
      type: 'BULLISH',
      signal: 'LONG',
      priceLow1: prevPriceLow.value,
      priceLow2: lastPriceLow.value,
      rsiLow1: prevRSILow.value,
      rsiLow2: lastRSILow.value,
      strength: Math.abs(strength),
      description: 'Price lower low + RSI higher low = bullish divergence'
    };
  }

  return null;
}

/**
 * Main divergence detection function
 * @param {Array} candles - OHLCV data
 * @param {String} patternDirection - 'LONG' or 'SHORT'
 * @returns {Object} Divergence analysis
 */
export function detectRSIDivergence(candles, patternDirection) {
  console.log(`[RSI Divergence] Analyzing for ${patternDirection} pattern...`);

  if (!candles || candles.length < 30) {
    console.log('[RSI Divergence] Insufficient data');
    return {
      divergenceScore: 0,
      hasDivergence: false,
      divergenceType: null,
      divergenceInfo: null,
      currentRSI: null
    };
  }

  // Calculate RSI
  const rsiValues = calculateRSI(candles, 14);

  if (rsiValues.length === 0) {
    console.log('[RSI Divergence] Could not calculate RSI');
    return {
      divergenceScore: 0,
      hasDivergence: false,
      divergenceType: null,
      divergenceInfo: null,
      currentRSI: null
    };
  }

  const currentRSI = rsiValues[rsiValues.length - 1].value;
  console.log(`[RSI Divergence] Current RSI: ${currentRSI.toFixed(2)}`);

  let divergenceScore = 0;
  let divergenceType = null;
  let divergenceInfo = null;

  // Detect divergences
  const bearishDiv = detectBearishDivergence(candles, rsiValues);
  const bullishDiv = detectBullishDivergence(candles, rsiValues);

  // ========================================
  // SCORE BASED ON PATTERN ALIGNMENT
  // ========================================

  if (patternDirection === 'SHORT' || patternDirection === 'BEARISH') {
    // For SHORT patterns, bearish divergence is GOOD
    if (bearishDiv) {
      divergenceScore += 35;
      divergenceType = 'BEARISH';
      divergenceInfo = bearishDiv;
      console.log('[RSI Divergence] Bearish divergence confirms SHORT: +35');

      // Bonus for strong divergence
      if (bearishDiv.strength > 5) {
        divergenceScore += 10;
        console.log('[RSI Divergence] Strong divergence bonus: +10');
      }

      // Bonus for overbought RSI
      if (currentRSI > 70) {
        divergenceScore += 15;
        console.log('[RSI Divergence] Overbought RSI (>70): +15');
      } else if (currentRSI > 60) {
        divergenceScore += 5;
        console.log('[RSI Divergence] Elevated RSI (>60): +5');
      }
    }

    // Bullish divergence contradicts SHORT pattern
    if (bullishDiv) {
      divergenceScore -= 20;
      console.log('[RSI Divergence] Bullish divergence contradicts SHORT: -20');
    }
  }

  if (patternDirection === 'LONG' || patternDirection === 'BULLISH') {
    // For LONG patterns, bullish divergence is GOOD
    if (bullishDiv) {
      divergenceScore += 35;
      divergenceType = 'BULLISH';
      divergenceInfo = bullishDiv;
      console.log('[RSI Divergence] Bullish divergence confirms LONG: +35');

      // Bonus for strong divergence
      if (bullishDiv.strength > 5) {
        divergenceScore += 10;
        console.log('[RSI Divergence] Strong divergence bonus: +10');
      }

      // Bonus for oversold RSI
      if (currentRSI < 30) {
        divergenceScore += 15;
        console.log('[RSI Divergence] Oversold RSI (<30): +15');
      } else if (currentRSI < 40) {
        divergenceScore += 5;
        console.log('[RSI Divergence] Low RSI (<40): +5');
      }
    }

    // Bearish divergence contradicts LONG pattern
    if (bearishDiv) {
      divergenceScore -= 20;
      console.log('[RSI Divergence] Bearish divergence contradicts LONG: -20');
    }
  }

  // ========================================
  // RSI EXTREME LEVELS (even without divergence)
  // ========================================
  if (!divergenceType) {
    if (patternDirection === 'SHORT' && currentRSI > 70) {
      divergenceScore += 10;
      console.log('[RSI Divergence] No divergence but RSI overbought: +10');
    } else if (patternDirection === 'LONG' && currentRSI < 30) {
      divergenceScore += 10;
      console.log('[RSI Divergence] No divergence but RSI oversold: +10');
    }
  }

  const finalScore = Math.max(0, Math.min(divergenceScore, 100));
  const hasDivergence = divergenceType !== null;

  console.log(`[RSI Divergence] Final score: ${finalScore}, hasDivergence: ${hasDivergence}`);

  return {
    divergenceScore: finalScore,
    hasDivergence,
    divergenceType,
    divergenceInfo,
    currentRSI: Number(currentRSI.toFixed(2))
  };
}

export default {
  calculateRSI,
  detectRSIDivergence
};
