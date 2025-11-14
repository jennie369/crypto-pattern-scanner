/**
 * UPD (Up-Pause-Down) Pattern Detector
 *
 * Pattern đảo chiều bearish với 3 giai đoạn:
 * Phase 1: Giá tăng mạnh (retail FOMO) - UP
 * Phase 2: Consolidation (smart money phân phối) - PAUSE
 * Phase 3: Giảm mạnh (đảo chiều confirmed) - DOWN
 *
 * Win Rate: 65%
 * R:R: 1:2.2
 * Pattern Type: REVERSAL (Bearish)
 *
 * @module UPDPattern
 */

/**
 * Calculate average volume for a range of candles
 * @param {Array} candles - Array of candle objects
 * @param {number} start - Start index
 * @param {number} end - End index
 * @returns {number} Average volume
 */
function calculateAverageVolume(candles, start, end) {
  if (start >= end || start < 0 || end > candles.length) return 0;

  let totalVolume = 0;
  for (let i = start; i < end; i++) {
    totalVolume += candles[i].volume || 0;
  }

  return totalVolume / (end - start);
}

/**
 * Calculate volume moving average
 * @param {Array} candles - Array of candles
 * @param {number} period - MA period
 * @returns {number} Volume MA
 */
function calculateVolumeMA(candles, period = 20) {
  if (candles.length < period) return 0;

  const recentCandles = candles.slice(-period);
  const totalVolume = recentCandles.reduce((sum, c) => sum + (c.volume || 0), 0);
  return totalVolume / period;
}

/**
 * Tìm Phase 1 - UP (Giai đoạn tăng)
 * Tìm đợt tăng mạnh liên tục với volume cao
 *
 * @param {Array} candles - Mảng nến OHLCV
 * @param {number} endIndex - Index kết thúc để quét ngược
 * @param {Object} config - Configuration
 * @returns {Object|null} Phase 1 data or null
 */
function findUpPhase(candles, endIndex, config) {
  const { minCandles, minChange, volumeIncrease } = config;

  // Quét ngược từ endIndex để tìm đợt tăng
  let startIndex = endIndex - minCandles;
  if (startIndex < 0) return null;

  // Tìm start point của đợt tăng
  let bestStart = -1;
  let maxChange = 0;

  // Quét trong khoảng rộng hơn để tìm đợt tăng tốt nhất
  for (let i = Math.max(0, endIndex - minCandles * 2); i <= endIndex - minCandles; i++) {
    const startPrice = candles[i].close;
    const endPrice = candles[endIndex].close;
    const change = (endPrice - startPrice) / startPrice;

    if (change >= minChange && change > maxChange) {
      // Kiểm tra có phải tăng liên tục không
      let isConsistent = true;
      let upCandles = 0;

      for (let j = i; j < endIndex; j++) {
        if (candles[j + 1].close > candles[j].close) {
          upCandles++;
        }
      }

      // Ít nhất 60% nến phải tăng
      const upRatio = upCandles / (endIndex - i);
      if (upRatio >= 0.6) {
        maxChange = change;
        bestStart = i;
      }
    }
  }

  if (bestStart === -1) return null;

  startIndex = bestStart;

  const startPrice = candles[startIndex].close;
  const endPrice = candles[endIndex].close;
  const priceChange = (endPrice - startPrice) / startPrice;

  // Validate minimum change
  if (priceChange < minChange) return null;

  // Calculate average volume for this phase
  const avgVolume = calculateAverageVolume(candles, startIndex, endIndex + 1);
  const overallVolumeMA = calculateVolumeMA(candles.slice(0, endIndex + 1), 20);

  // Check if volume is elevated
  const hasStrongVolume = avgVolume > overallVolumeMA * volumeIncrease;

  // Find highest point in phase
  let highestPrice = 0;
  let highestIndex = startIndex;
  for (let i = startIndex; i <= endIndex; i++) {
    if (candles[i].high > highestPrice) {
      highestPrice = candles[i].high;
      highestIndex = i;
    }
  }

  return {
    start: startIndex,
    end: endIndex,
    startPrice,
    endPrice,
    change: priceChange,
    changePercent: priceChange * 100,
    avgVolume,
    hasStrongVolume,
    highestPrice,
    highestIndex,
    candles: endIndex - startIndex + 1,
  };
}

/**
 * Tìm Phase 2 - PAUSE (Giai đoạn nghỉ/phân phối)
 * Tìm range hẹp với volume vẫn cao (distribution)
 *
 * @param {Array} candles - Mảng nến OHLCV
 * @param {number} startIndex - Index bắt đầu pause
 * @param {Object} config - Configuration
 * @returns {Object|null} Phase 2 data or null
 */
function findPausePhase(candles, startIndex, config) {
  const { maxCandles, minCandles, maxRange, referencePrice } = config;

  if (startIndex + minCandles >= candles.length) return null;

  // Tìm pause phase với độ dài khác nhau (1-5 nến)
  for (let length = minCandles; length <= maxCandles; length++) {
    const endIndex = startIndex + length - 1;

    if (endIndex >= candles.length) break;

    // Tính range của phase này
    let high = 0;
    let low = Infinity;

    for (let i = startIndex; i <= endIndex; i++) {
      if (candles[i].high > high) high = candles[i].high;
      if (candles[i].low < low) low = candles[i].low;
    }

    const range = (high - low) / referencePrice;

    // Validate range
    if (range > maxRange) continue;

    // Calculate volume for pause phase
    const avgVolume = calculateAverageVolume(candles, startIndex, endIndex + 1);
    const overallVolumeMA = calculateVolumeMA(candles.slice(0, endIndex + 1), 20);

    // QUAN TRỌNG: Volume PHẢI cao trong pause (distribution)
    const hasHighVolume = avgVolume > overallVolumeMA * 1.0; // Ít nhất bằng MA

    // Pause phase hợp lệ
    return {
      start: startIndex,
      end: endIndex,
      high,
      low,
      range,
      rangePercent: range * 100,
      avgVolume,
      hasHighVolume,
      candles: length,
    };
  }

  return null;
}

/**
 * Tìm Phase 3 - DOWN (Giai đoạn giảm)
 * Tìm đợt giảm mạnh với volume đột biến
 *
 * @param {Array} candles - Mảng nến OHLCV
 * @param {number} startIndex - Index bắt đầu down phase
 * @param {Object} config - Configuration
 * @returns {Object|null} Phase 3 data or null
 */
function findDownPhase(candles, startIndex, config) {
  const { minChange, volumeIncrease } = config;

  // Cần ít nhất 2-3 nến để confirm down phase
  if (startIndex + 2 >= candles.length) return null;

  const startPrice = candles[startIndex].close;

  // Kiểm tra 2-5 nến tiếp theo
  for (let length = 2; length <= Math.min(5, candles.length - startIndex); length++) {
    const endIndex = startIndex + length - 1;
    const endPrice = candles[endIndex].close;

    const priceChange = (endPrice - startPrice) / startPrice;

    // Giảm ít nhất minChange
    if (priceChange <= -minChange) {
      // Calculate volume
      const avgVolume = calculateAverageVolume(candles, startIndex, endIndex + 1);
      const overallVolumeMA = calculateVolumeMA(candles.slice(0, endIndex + 1), 20);

      // Volume phải tăng đột biến (breakout)
      const hasStrongVolume = avgVolume > overallVolumeMA * volumeIncrease;

      // Find lowest point
      let lowestPrice = Infinity;
      let lowestIndex = startIndex;
      for (let i = startIndex; i <= endIndex; i++) {
        if (candles[i].low < lowestPrice) {
          lowestPrice = candles[i].low;
          lowestIndex = i;
        }
      }

      return {
        start: startIndex,
        end: endIndex,
        startPrice,
        endPrice,
        change: priceChange,
        changePercent: priceChange * 100,
        avgVolume,
        hasStrongVolume,
        lowestPrice,
        lowestIndex,
        candles: length,
      };
    }
  }

  return null;
}

/**
 * Validate UPD pattern - Kiểm tra tính hợp lệ
 *
 * @param {Object} phase1 - UP phase data
 * @param {Object} phase2 - PAUSE phase data
 * @param {Object} phase3 - DOWN phase data
 * @param {Array} candles - All candles
 * @returns {boolean} Is valid pattern
 */
function validateUPDPattern(phase1, phase2, phase3, candles) {
  // 1. Phase 1 phải là đỉnh gần nhất (không có đỉnh cao hơn trong 20-30 nến trước)
  const lookbackPeriod = Math.min(30, phase1.start);
  let isRealPeak = true;

  for (let i = Math.max(0, phase1.start - lookbackPeriod); i < phase1.start; i++) {
    if (candles[i].high > phase1.highestPrice) {
      isRealPeak = false;
      break;
    }
  }

  if (!isRealPeak) return false;

  // 2. Phase 2 PHẢI có volume distribution (volume cao)
  if (!phase2.hasHighVolume) return false;

  // 3. Phase 3 phải break xuống dưới pause range
  if (phase3.lowestPrice >= phase2.low) return false;

  // 4. Phases phải liên tục nhau (không có gap)
  if (phase2.start !== phase1.end + 1) return false;
  if (phase3.start !== phase2.end + 1) return false;

  // 5. Tổng độ dài pattern hợp lý (10-30 nến)
  const totalCandles = phase1.candles + phase2.candles + phase3.candles;
  if (totalCandles < 10 || totalCandles > 30) return false;

  // 6. Phase 3 phải có volume breakout
  if (!phase3.hasStrongVolume) return false;

  return true;
}

/**
 * Tạo HFZ (High Frequency Zone) từ Phase 2
 *
 * @param {Object} phase2 - PAUSE phase data
 * @param {Array} candles - All candles
 * @returns {Object} HFZ zone
 */
function createHFZFromPause(phase2, candles) {
  // Zone boundaries với buffer nhỏ
  const buffer = (phase2.high - phase2.low) * 0.05; // 5% buffer

  return {
    type: 'HFZ',
    top: phase2.high + buffer,
    bottom: phase2.low - buffer,
    mid: (phase2.high + phase2.low) / 2,
    strength: 100, // Fresh zone
    status: 'FRESH',
    candlesInZone: phase2.candles,
    avgVolume: phase2.avgVolume,
    createdAt: phase2.end,
  };
}

/**
 * Tính toán Entry, Stop Loss, Target levels
 *
 * @param {Object} hfzZone - HFZ zone from pause
 * @param {Object} phase1 - UP phase
 * @param {Object} phase3 - DOWN phase
 * @returns {Object} Trading levels
 */
function calculateTradingLevels(hfzZone, phase1, phase3) {
  // Entry: Giữa HFZ (đợi retest)
  const entry = hfzZone.mid;

  // Stop Loss: Trên HFZ + buffer 0.5%
  const stopLoss = hfzZone.top * 1.005;

  // Target: Measured move (chiều cao pattern × 2)
  const patternHeight = phase1.endPrice - phase3.lowestPrice;
  const target = entry - (patternHeight * 2);

  // Calculate R:R
  const risk = stopLoss - entry;
  const reward = entry - target;
  const riskReward = reward / risk;

  return {
    entry: parseFloat(entry.toFixed(8)),
    stopLoss: parseFloat(stopLoss.toFixed(8)),
    target: parseFloat(target.toFixed(8)),
    riskReward: parseFloat(riskReward.toFixed(2)),
    risk: parseFloat(risk.toFixed(8)),
    reward: parseFloat(reward.toFixed(8)),
  };
}

/**
 * Tính confidence score cho UPD pattern
 *
 * @param {Object} phase1 - UP phase
 * @param {Object} phase2 - PAUSE phase
 * @param {Object} phase3 - DOWN phase
 * @param {Array} candles - All candles
 * @returns {number} Confidence score (0-100)
 */
function calculateUPDConfidence(phase1, phase2, phase3, candles) {
  let confidence = 65; // Base confidence cho UPD (reversal pattern)

  // Bonus factors:

  // 1. Volume Phase 1 rất cao (+5)
  if (phase1.hasStrongVolume && phase1.avgVolume > calculateVolumeMA(candles, 20) * 1.5) {
    confidence += 5;
  }

  // 2. Volume Phase 2 cao - distribution rõ ràng (+5)
  if (phase2.hasHighVolume && phase2.avgVolume > calculateVolumeMA(candles, 20) * 1.3) {
    confidence += 5;
  }

  // 3. Volume Phase 3 đột biến (+5)
  if (phase3.hasStrongVolume && phase3.avgVolume > phase1.avgVolume * 1.2) {
    confidence += 5;
  }

  // 4. Phase 1 là đỉnh rõ ràng (+3)
  const lookback = Math.min(30, phase1.start);
  let isStrongPeak = true;
  for (let i = Math.max(0, phase1.start - lookback); i < phase1.start; i++) {
    if (candles[i].high > phase1.highestPrice * 0.98) {
      isStrongPeak = false;
      break;
    }
  }
  if (isStrongPeak) {
    confidence += 3;
  }

  // 5. Phase 1 tăng mạnh (>5%) (+2)
  if (phase1.changePercent > 5) {
    confidence += 2;
  }

  // 6. Phase 3 giảm mạnh (>5%) (+2)
  if (Math.abs(phase3.changePercent) > 5) {
    confidence += 2;
  }

  // 7. Pause phase ngắn (1-2 nến) (+2)
  if (phase2.candles <= 2) {
    confidence += 2;
  }

  // Penalty factors:

  // -5: Phase 1 không đủ mạnh (<3%)
  if (phase1.changePercent < 3) {
    confidence -= 5;
  }

  // -5: Phase 2 có nhiễu (range >1%)
  if (phase2.rangePercent > 1) {
    confidence -= 5;
  }

  // -3: Phase 3 yếu (<3%)
  if (Math.abs(phase3.changePercent) < 3) {
    confidence -= 3;
  }

  // Cap confidence trong khoảng 50-85%
  return Math.min(Math.max(confidence, 50), 85);
}

/**
 * Detect UPD (Up-Pause-Down) patterns trong candlestick data
 *
 * @param {Array} candles - Mảng nến OHLCV đã sắp xếp từ cũ → mới
 * @param {Object} config - Configuration parameters
 * @returns {Array} Mảng các UPD patterns phát hiện được
 */
export const detectUPD = (candles, config = {}) => {
  // Default configuration
  const {
    minPhase1Candles = 10,        // Ít nhất 10 nến cho phase tăng
    minPhase1Change = 0.02,       // Tăng tối thiểu 2%
    maxPhase2Candles = 5,         // Tối đa 5 nến trong pause
    maxPhase2Range = 0.015,       // Range tối đa 1.5%
    minPhase2Candles = 1,         // Ít nhất 1 nến pause
    minPhase3Change = 0.02,       // Giảm tối thiểu 2%
    volumeIncrease = 1.2,         // Volume tăng 20% so với MA
    minConfidence = 60,           // Confidence tối thiểu
    timeframe = '1D',             // Default timeframe
  } = config;

  const patterns = [];

  // Cần đủ data để phát hiện pattern (ít nhất 50 nến)
  if (candles.length < 50) {
    return patterns;
  }

  // BƯỚC 1: Quét qua tất cả nến để tìm potential patterns
  // Bắt đầu từ index đủ xa để có history
  const startScan = minPhase1Candles + maxPhase2Candles + 10;
  const endScan = candles.length - 5; // Giữ 5 nến để xác nhận

  for (let i = startScan; i < endScan; i++) {

    // BƯỚC 2: Tìm Phase 1 (UP)
    const phase1 = findUpPhase(candles, i, {
      minCandles: minPhase1Candles,
      minChange: minPhase1Change,
      volumeIncrease,
    });

    if (!phase1) continue;

    // BƯỚC 3: Tìm Phase 2 (PAUSE) ngay sau Phase 1
    const phase2 = findPausePhase(candles, phase1.end + 1, {
      maxCandles: maxPhase2Candles,
      minCandles: minPhase2Candles,
      maxRange: maxPhase2Range,
      referencePrice: phase1.endPrice,
    });

    if (!phase2) continue;

    // BƯỚC 4: Tìm Phase 3 (DOWN) ngay sau Phase 2
    const phase3 = findDownPhase(candles, phase2.end + 1, {
      minChange: minPhase3Change,
      volumeIncrease,
    });

    if (!phase3) continue;

    // BƯỚC 5: Validate toàn bộ pattern
    const isValid = validateUPDPattern(phase1, phase2, phase3, candles);

    if (!isValid) continue;

    // BƯỚC 6: Tạo HFZ zone từ Phase 2
    const hfzZone = createHFZFromPause(phase2, candles);

    // BƯỚC 7: Tính toán Entry, Stop Loss, Target
    const tradingLevels = calculateTradingLevels(hfzZone, phase1, phase3);

    // BƯỚC 8: Tính confidence score
    const confidence = calculateUPDConfidence(phase1, phase2, phase3, candles);

    if (confidence < minConfidence) continue;

    // BƯỚC 9: Tạo pattern object
    const pattern = {
      type: 'UPD',
      name: 'Up-Pause-Down',
      signal: 'BEARISH',
      patternType: 'REVERSAL',

      // Pattern phases
      phase1: {
        start: phase1.start,
        end: phase1.end,
        change: phase1.changePercent,
        volume: phase1.avgVolume,
        candles: phase1.candles,
        highestPrice: phase1.highestPrice,
      },
      phase2: {
        start: phase2.start,
        end: phase2.end,
        range: phase2.rangePercent,
        volume: phase2.avgVolume,
        candles: phase2.candles,
        high: phase2.high,
        low: phase2.low,
      },
      phase3: {
        start: phase3.start,
        end: phase3.end,
        change: phase3.changePercent,
        volume: phase3.avgVolume,
        candles: phase3.candles,
        lowestPrice: phase3.lowestPrice,
      },

      // Trading levels
      entry: tradingLevels.entry,
      stopLoss: tradingLevels.stopLoss,
      target: tradingLevels.target,
      riskReward: tradingLevels.riskReward,

      // Zone information
      zoneType: 'HFZ',
      zoneTop: hfzZone.top,
      zoneBottom: hfzZone.bottom,
      zoneMid: hfzZone.mid,
      zoneStatus: 'FRESH',
      strength: 100,

      // Metadata
      confidence: confidence,
      detectedAt: phase3.end,
      detectedPrice: candles[phase3.end].close,
      detectedOnTimeframe: timeframe,
      detectedTimestamp: candles[phase3.end].timestamp || new Date(),

      // Validation flags
      hasStrongVolume: phase1.hasStrongVolume && phase3.hasStrongVolume,
      hasDistribution: phase2.hasHighVolume,
      isValidReversal: true,

      // Win rate info
      expectedWinRate: 65,
      expectedRR: 2.2,
    };

    patterns.push(pattern);

    // Skip ahead để tránh overlap patterns
    i = phase3.end + 5;
  }

  return patterns;
};

export default detectUPD;
