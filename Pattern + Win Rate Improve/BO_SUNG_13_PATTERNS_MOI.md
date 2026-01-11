# 🆕 BỔ SUNG 13 PATTERNS MỚI - GEM PATTERN SCANNER

**Ngày:** 12 Tháng 11, 2025  
**Version:** 2.1 - Extended Pattern Library  
**Patterns mới:** 13 patterns  
**Tổng số patterns:** 24 patterns  

---

## 📊 TỔNG QUAN PATTERNS MỚI

### **Phân Loại:**

**Reversal Patterns (2):**
1. Inverse Head and Shoulders (H&S Ngược)
2. Cup and Handle (Cốc và Tay Cầm)

**Continuation Patterns (7):**
3. Descending Triangle
4. Symmetrical Triangle
5. Bear Flag
6. Rising Wedge
7. Falling Wedge
8. Falling Three Methods
9. Rising Three Methods

**Candlestick Patterns (5):**
10. Bullish/Bearish Engulfing
11. Morning Star / Evening Star
12. Hammer / Inverted Hammer
13. Shooting Star / Hanging Man
14. Doji Patterns (Dragonfly, Gravestone)

---

## 1️⃣ INVERSE HEAD AND SHOULDERS (Đầu Vai Ngược)

### **Thông Tin Cơ Bản:**
```yaml
Tên: Inverse Head and Shoulders
Tiếng Việt: Đầu Vai Ngược
Type: REVERSAL (Đảo chiều)
Signal: BULLISH (Tăng giá)
Win Rate: 75%
Avg R:R: 1:3.0
Best Timeframe: 1D, 1W
Icon: 🔄👤📈
```

### **Cấu Trúc Pattern:**
```
   NECKLINE
  |____|____|
  ↑    ↑    ↑
👈LEFT HEAD RIGHT👉
SHOULDER    SHOULDER
  \      /
   \    /
    \  /
    👤
   HEAD
  (Lowest)
```

### **Đặc Điểm Nhận Diện:**
- ✅ 3 troughs: Left shoulder, Head (lowest), Right shoulder
- ✅ Shoulders roughly equal depth (±5%)
- ✅ Head >10% lower than shoulders
- ✅ Neckline connects the peaks
- ✅ Break neckline upward = confirmation
- ✅ Thường xuất hiện ở cuối downtrend

### **Detection Algorithm:**
```javascript
// File: src/utils/patterns/InverseHeadAndShouldersPattern.js

export const detectInverseHeadAndShoulders = (candles, config = {}) => {
  const {
    minPatternCandles = 30,
    shoulderSymmetry = 0.05,    // Shoulders within 5%
    headDepthMin = 1.1,         // Head at least 10% lower
    necklineSlope = 0.02,       // Neckline slope <2%
  } = config;

  const patterns = [];
  
  // Find troughs (potential shoulders and head)
  const troughs = findTroughs(candles, 5);
  
  if (troughs.length < 3) return patterns;
  
  for (let i = 0; i < troughs.length - 2; i++) {
    const leftShoulder = troughs[i];
    const head = troughs[i + 1];
    const rightShoulder = troughs[i + 2];
    
    // Get prices
    const leftShoulderLow = candles[leftShoulder].low;
    const headLow = candles[head].low;
    const rightShoulderLow = candles[rightShoulder].low;
    
    // 1. Head must be lowest
    if (headLow >= leftShoulderLow || headLow >= rightShoulderLow) continue;
    
    // 2. Shoulders should be roughly equal (within 5%)
    const shoulderDiff = Math.abs(leftShoulderLow - rightShoulderLow) / leftShoulderLow;
    if (shoulderDiff > shoulderSymmetry) continue;
    
    // 3. Head should be significantly lower (at least 10%)
    const headRatio = Math.min(leftShoulderLow, rightShoulderLow) / headLow;
    if (headRatio < headDepthMin) continue;
    
    // 4. Find neckline (peaks between troughs)
    const leftPeak = findHighestBetween(candles, leftShoulder, head);
    const rightPeak = findHighestBetween(candles, head, rightShoulder);
    
    const leftPeakHigh = candles[leftPeak].high;
    const rightPeakHigh = candles[rightPeak].high;
    
    // Calculate neckline
    const necklineHigh = Math.max(leftPeakHigh, rightPeakHigh);
    const necklineLow = Math.min(leftPeakHigh, rightPeakHigh);
    const slope = Math.abs(leftPeakHigh - rightPeakHigh) / leftPeakHigh;
    
    if (slope > necklineSlope) continue;
    
    // 5. Confirm pattern completion (break neckline)
    const lastCandle = candles[candles.length - 1];
    const necklineBroken = lastCandle.close > necklineLow;
    
    if (!necklineBroken) continue;
    
    // ✅ INVERSE H&S DETECTED!
    const pattern = {
      type: 'INVERSE_HEAD_AND_SHOULDERS',
      name: 'Inverse Head and Shoulders',
      signal: 'BULLISH',
      patternType: 'REVERSAL',
      
      // Pattern points
      leftShoulder: { index: leftShoulder, price: leftShoulderLow },
      head: { index: head, price: headLow },
      rightShoulder: { index: rightShoulder, price: rightShoulderLow },
      neckline: {
        high: necklineHigh,
        low: necklineLow,
        leftIndex: leftPeak,
        rightIndex: rightPeak,
      },
      
      // Trading info
      entryStrategy: 'NECKLINE_BREAK_RETEST',
      entry: necklineLow, // Entry on retest of broken neckline
      stopLoss: headLow,
      target: necklineLow + (necklineLow - headLow), // Measured move
      
      // Metadata
      confidence: calculateIHSConfidence(headRatio, shoulderDiff, slope),
      patternHeight: necklineLow - headLow,
      symmetry: 1 - shoulderDiff,
      
      // Zone info
      zoneType: 'LFZ',
      zoneTop: necklineLow + (necklineLow * 0.005),
      zoneBottom: necklineLow - (necklineLow * 0.005),
      zoneStatus: 'FRESH',
      testCount: 0,
      strength: 100,
      detectedOnTimeframe: config.timeframe || '1D',
    };
    
    patterns.push(pattern);
  }
  
  return patterns;
};

const calculateIHSConfidence = (headRatio, shoulderDiff, slope) => {
  let confidence = 65; // Base
  if (headRatio > 1.2) confidence += 15;
  else if (headRatio > 1.15) confidence += 10;
  if (shoulderDiff < 0.03) confidence += 15;
  else if (shoulderDiff < 0.05) confidence += 10;
  if (slope < 0.01) confidence += 10;
  return Math.min(100, confidence);
};
```

### **Entry Strategy:**
```
1. Wait for neckline break upward
2. ⏰ Wait for retest of broken neckline
3. 🔍 Bullish confirmation (hammer, bullish engulfing)
4. ✅ LONG at neckline
5. 🛑 Stop: Below head
6. 🎯 Target: Measured move (pattern height)
```

---

## 2️⃣ CUP AND HANDLE (Cốc và Tay Cầm)

### **Thông Tin Cơ Bản:**
```yaml
Tên: Cup and Handle
Tiếng Việt: Cốc và Tay Cầm
Type: CONTINUATION (Tiếp diễn)
Signal: BULLISH (Tăng giá)
Win Rate: 68%
Avg R:R: 1:2.5
Best Timeframe: 1D, 1W
Icon: ☕📈
```

### **Cấu Trúc Pattern:**
```
        Handle
         ↓
    ____/
   /    
  /      CUP (U-shape)
 /         ___
|         /   \
|        /     \
|_______/       \
```

### **Đặc Điểm Nhận Diện:**
- ✅ Cup: U-shaped bottom (không phải V)
- ✅ Cup depth: 12-33% retracement
- ✅ Cup duration: 1-6 months (weekly/daily chart)
- ✅ Handle: Small pullback (10-20% của cup depth)
- ✅ Handle duration: 1-4 weeks
- ✅ Handle slopes down hoặc sideways
- ✅ Breakout trên handle với volume tăng

### **Detection Algorithm:**
```javascript
// File: src/utils/patterns/CupAndHandlePattern.js

export const detectCupAndHandle = (candles, config = {}) => {
  const {
    minCupCandles = 50,         // Minimum 50 candles for cup
    maxCupCandles = 200,        // Maximum 200 candles
    cupDepthMin = 0.12,         // 12% minimum depth
    cupDepthMax = 0.33,         // 33% maximum depth
    handleDepthMax = 0.20,      // Handle max 20% of cup depth
    minHandleCandles = 5,       // Minimum 5 candles for handle
    maxHandleCandles = 30,      // Maximum 30 candles
    volumeDecreaseInHandle = 0.7, // Volume should decrease 30% in handle
  } = config;

  const patterns = [];
  
  // Need enough data
  if (candles.length < minCupCandles + minHandleCandles) return patterns;
  
  // Scan through data
  for (let i = minCupCandles; i < candles.length - minHandleCandles; i++) {
    // Find cup formation
    const cupStart = i - minCupCandles;
    const cupCandles = candles.slice(cupStart, i);
    
    // Cup must start with uptrend before forming
    const preCupHigh = Math.max(...cupCandles.slice(0, 5).map(c => c.high));
    const cupLow = Math.min(...cupCandles.map(c => c.low));
    const cupDepth = (preCupHigh - cupLow) / preCupHigh;
    
    // Check cup depth
    if (cupDepth < cupDepthMin || cupDepth > cupDepthMax) continue;
    
    // Find cup bottom (should be U-shaped, not V)
    const cupBottomIndex = cupCandles.findIndex(c => c.low === cupLow);
    const leftSideDuration = cupBottomIndex;
    const rightSideDuration = cupCandles.length - cupBottomIndex;
    
    // Sides should be roughly equal (U-shape)
    const sideRatio = Math.min(leftSideDuration, rightSideDuration) / 
                      Math.max(leftSideDuration, rightSideDuration);
    if (sideRatio < 0.6) continue; // Not U-shaped enough
    
    // Cup should end near starting price
    const cupEndHigh = Math.max(...cupCandles.slice(-5).map(c => c.high));
    const cupRecovery = (cupEndHigh - cupLow) / (preCupHigh - cupLow);
    if (cupRecovery < 0.8) continue; // Didn't recover enough
    
    // Find handle formation
    const handleStart = i;
    let handleEnd = handleStart;
    let handleLow = cupEndHigh;
    
    for (let j = handleStart; j < Math.min(handleStart + maxHandleCandles, candles.length); j++) {
      const handleCandles = candles.slice(handleStart, j + 1);
      const currentLow = Math.min(...handleCandles.map(c => c.low));
      
      // Handle shouldn't go too deep
      const handleDepth = (cupEndHigh - currentLow) / (preCupHigh - cupLow);
      if (handleDepth > handleDepthMax) break;
      
      handleLow = currentLow;
      handleEnd = j;
      
      // Check for breakout
      if (candles[j].close > cupEndHigh * 1.005) { // 0.5% above resistance
        // Found potential handle with breakout
        break;
      }
    }
    
    const handleCandles = candles.slice(handleStart, handleEnd + 1);
    if (handleCandles.length < minHandleCandles) continue;
    
    // Verify volume pattern (should decrease in handle)
    const cupAvgVolume = cupCandles.reduce((sum, c) => sum + c.volume, 0) / cupCandles.length;
    const handleAvgVolume = handleCandles.reduce((sum, c) => sum + c.volume, 0) / handleCandles.length;
    
    if (handleAvgVolume > cupAvgVolume * volumeDecreaseInHandle) continue;
    
    // Check if breakout occurred
    const lastCandle = candles[candles.length - 1];
    const breakoutOccurred = lastCandle.close > cupEndHigh;
    
    if (!breakoutOccurred) continue;
    
    // ✅ CUP AND HANDLE DETECTED!
    const pattern = {
      type: 'CUP_AND_HANDLE',
      name: 'Cup and Handle',
      signal: 'BULLISH',
      patternType: 'CONTINUATION',
      
      // Pattern components
      cupStart: cupStart,
      cupEnd: i - 1,
      cupHigh: preCupHigh,
      cupLow: cupLow,
      cupDepth: cupDepth,
      
      handleStart: handleStart,
      handleEnd: handleEnd,
      handleLow: handleLow,
      handleDepth: (cupEndHigh - handleLow) / (preCupHigh - cupLow),
      
      // Trading info
      entryStrategy: 'BREAKOUT_RETEST',
      entry: cupEndHigh, // Entry on breakout or retest
      stopLoss: handleLow,
      target: cupEndHigh + (preCupHigh - cupLow), // Measured move
      
      // Metadata
      confidence: calculateCHConfidence(cupDepth, cupRecovery, handleDepth, sideRatio),
      volumeDecrease: handleAvgVolume / cupAvgVolume,
      cupShape: sideRatio, // How U-shaped (1.0 = perfect U)
      
      // Zone info
      zoneType: 'LFZ',
      zoneTop: cupEndHigh + (cupEndHigh * 0.01),
      zoneBottom: cupEndHigh - (cupEndHigh * 0.01),
      zoneStatus: 'FRESH',
      testCount: 0,
      strength: 100,
      detectedOnTimeframe: config.timeframe || '1D',
    };
    
    patterns.push(pattern);
  }
  
  return patterns;
};

const calculateCHConfidence = (cupDepth, recovery, handleDepth, uShape) => {
  let confidence = 55;
  
  // Good cup depth
  if (cupDepth >= 0.2 && cupDepth <= 0.3) confidence += 15;
  else if (cupDepth >= 0.15 && cupDepth <= 0.35) confidence += 10;
  
  // Strong recovery
  if (recovery > 0.9) confidence += 15;
  else if (recovery > 0.8) confidence += 10;
  
  // Shallow handle
  if (handleDepth < 0.15) confidence += 10;
  
  // Good U-shape
  if (uShape > 0.8) confidence += 10;
  
  return Math.min(100, confidence);
};
```

### **Entry Strategy:**
```
1. Wait for breakout above cup resistance
2. ⏰ Ideally entry on handle retest (pullback to resistance)
3. 🔍 Bullish confirmation + volume increase on breakout
4. ✅ LONG at resistance (now support)
5. 🛑 Stop: Below handle low
6. 🎯 Target: Measured move (cup depth)
```

---

## 3️⃣ DESCENDING TRIANGLE

### **Thông Tin Cơ Bản:**
```yaml
Tên: Descending Triangle
Tiếng Việt: Tam Giác Giảm Dần
Type: CONTINUATION (Tiếp diễn, thường bearish)
Signal: BEARISH (Giảm giá)
Win Rate: 64%
Avg R:R: 1:2.2
Best Timeframe: 4H, 1D
Icon: 🔻📉
```

### **Cấu Trúc Pattern:**
```
\           Descending Highs
 \         (Lower highs)
  \       /
   \     /
    \   /
     \ /
      X
_____|_____ Flat Support
   Support
```

### **Đặc Điểm Nhận Diện:**
- ✅ Flat horizontal support (at least 2 touches)
- ✅ Descending resistance (lower highs)
- ✅ Converging lines forming triangle
- ✅ Volume decreases as pattern develops
- ✅ Breakout thường xuống (bearish)
- ✅ Duration: 1-3 months typically

### **Detection Algorithm:**
```javascript
// File: src/utils/patterns/DescendingTrianglePattern.js

export const detectDescendingTriangle = (candles, config = {}) => {
  const {
    minPatternCandles = 20,
    maxPatternCandles = 100,
    supportTolerance = 0.02,      // 2% tolerance for flat support
    minTouches = 2,               // Minimum touches per line
    volumeDecrease = 0.8,         // Volume should decrease 20%
  } = config;

  const patterns = [];
  
  for (let i = minPatternCandles; i < candles.length; i++) {
    const patternCandles = candles.slice(i - minPatternCandles, i);
    
    // Find support level (lows should be roughly equal)
    const lows = patternCandles.map(c => c.low);
    const minLow = Math.min(...lows);
    const maxLow = Math.max(...lows);
    const supportRange = (maxLow - minLow) / minLow;
    
    // Support must be relatively flat
    if (supportRange > supportTolerance) continue;
    
    const supportLevel = (minLow + maxLow) / 2;
    
    // Count support touches
    const supportTouches = patternCandles.filter(c => 
      Math.abs(c.low - supportLevel) / supportLevel < supportTolerance
    ).length;
    
    if (supportTouches < minTouches) continue;
    
    // Find descending highs
    const highs = patternCandles.map((c, idx) => ({ price: c.high, index: idx }));
    const peaks = findPeaks(highs.map(h => h.price), 3);
    
    if (peaks.length < 2) continue;
    
    // Check if highs are descending
    let isDescending = true;
    for (let j = 1; j < peaks.length; j++) {
      if (highs[peaks[j]].price >= highs[peaks[j-1]].price) {
        isDescending = false;
        break;
      }
    }
    
    if (!isDescending) continue;
    
    // Calculate resistance trendline
    const firstPeak = { x: peaks[0], y: highs[peaks[0]].price };
    const lastPeak = { x: peaks[peaks.length - 1], y: highs[peaks[peaks.length - 1]].price };
    const slope = (lastPeak.y - firstPeak.y) / (lastPeak.x - firstPeak.x);
    
    // Slope should be negative (descending)
    if (slope >= 0) continue;
    
    // Check volume pattern
    const earlyVolume = patternCandles.slice(0, Math.floor(patternCandles.length / 2))
      .reduce((sum, c) => sum + c.volume, 0) / Math.floor(patternCandles.length / 2);
    const lateVolume = patternCandles.slice(Math.floor(patternCandles.length / 2))
      .reduce((sum, c) => sum + c.volume, 0) / (patternCandles.length - Math.floor(patternCandles.length / 2));
    
    const volumeDecreased = lateVolume < earlyVolume * volumeDecrease;
    
    // Check for breakout
    const lastCandle = candles[candles.length - 1];
    const breakoutOccurred = lastCandle.close < supportLevel * 0.995; // 0.5% below support
    
    if (!breakoutOccurred) continue;
    
    // ✅ DESCENDING TRIANGLE DETECTED!
    const patternHeight = highs[peaks[0]].price - supportLevel;
    
    const pattern = {
      type: 'DESCENDING_TRIANGLE',
      name: 'Descending Triangle',
      signal: 'BEARISH',
      patternType: 'CONTINUATION',
      
      // Pattern lines
      support: supportLevel,
      supportTouches: supportTouches,
      resistanceSlope: slope,
      firstHigh: firstPeak.y,
      lastHigh: lastPeak.y,
      
      // Trading info
      entryStrategy: 'BREAKOUT_RETEST',
      entry: supportLevel, // Entry on breakdown or retest
      stopLoss: supportLevel + patternHeight * 0.3, // 30% of pattern height
      target: supportLevel - patternHeight, // Measured move
      
      // Metadata
      confidence: calculateDTConfidence(supportTouches, peaks.length, volumeDecreased),
      patternHeight: patternHeight,
      volumePattern: volumeDecreased ? 'DECREASING' : 'STABLE',
      
      // Zone info
      zoneType: 'HFZ',
      zoneTop: supportLevel + (supportLevel * 0.01),
      zoneBottom: supportLevel - (supportLevel * 0.01),
      zoneStatus: 'FRESH',
      testCount: 0,
      strength: 100,
      detectedOnTimeframe: config.timeframe || '4H',
    };
    
    patterns.push(pattern);
  }
  
  return patterns;
};

const calculateDTConfidence = (supportTouches, peakCount, volumeDecreased) => {
  let confidence = 55;
  if (supportTouches >= 3) confidence += 15;
  else if (supportTouches >= 2) confidence += 10;
  if (peakCount >= 3) confidence += 10;
  if (volumeDecreased) confidence += 15;
  return Math.min(100, confidence);
};
```

---

## 4️⃣ SYMMETRICAL TRIANGLE

### **Thông Tin Cơ Bản:**
```yaml
Tên: Symmetrical Triangle
Tiếng Việt: Tam Giác Đối Xứng
Type: CONTINUATION (Tiếp diễn, theo trend trước)
Signal: NEUTRAL (Breakout direction = trend direction)
Win Rate: 62%
Avg R:R: 1:2.0
Best Timeframe: 4H, 1D
Icon: 🔺🔻
```

### **Cấu Trúc:**
```
\         /  Descending Resistance
 \       /   
  \     /    
   \   /     
    \ /      
     X       
    / \      
   /   \     Ascending Support
  /     \    
```

### **Đặc Điểm:**
- ✅ Converging trendlines (both angled)
- ✅ Lower highs + Higher lows
- ✅ Symmetrical shape
- ✅ Volume decreases toward apex
- ✅ Breakout direction usually follows prior trend
- ✅ Occurs mid-trend (continuation pattern)

---

## 5️⃣ BEAR FLAG

### **Thông Tin Cơ Bản:**
```yaml
Tên: Bear Flag
Tiếng Việt: Cờ Giảm Giá
Type: CONTINUATION (Tiếp diễn bearish)
Signal: BEARISH (Giảm giá)
Win Rate: 66%
Avg R:R: 1:2.3
Best Timeframe: 4H, 1D
Icon: 🚩📉
```

### **Cấu Trúc:**
```
|        Flagpole (Sharp down)
|      _/‾  Flag (Upward consolidation)
|    _/     
|  _/       
|_/         

Breakdown →
```

### **Đặc Điểm:**
- ✅ Flagpole: Sharp downward move (>5%)
- ✅ Flag: Upward consolidation (counter-trend)
- ✅ Flag slopes UP slightly (bearish flag characteristic)
- ✅ Volume decreases in flag
- ✅ Breakout down với volume tăng
- ✅ Duration: 1-3 weeks typically

---

## 6️⃣ RISING WEDGE

### **Thông Tin Cơ Bản:**
```yaml
Tên: Rising Wedge
Tiếng Việt: Nêm Tăng Dần
Type: REVERSAL (Đảo chiều bearish)
Signal: BEARISH (Giảm giá)
Win Rate: 70%
Avg R:R: 1:2.8
Best Timeframe: 1D, 1W
Icon: 📐📉
```

### **Cấu Trúc:**
```
      /‾‾  Rising resistance (steeper)
    /‾     
  /‾       
/‾         
           Rising support (less steep)
```

### **Đặc Điểm:**
- ✅ Both trendlines slope UP
- ✅ Converging (narrowing range)
- ✅ Higher highs + Higher lows
- ✅ Volume decreases as wedge forms
- ✅ Breakout DOWN (bearish reversal)
- ✅ Appears at top of uptrends

---

## 7️⃣ FALLING WEDGE

### **Thông Tin Cơ Bản:**
```yaml
Tên: Falling Wedge
Tiếng Việt: Nêm Giảm Dần
Type: REVERSAL (Đảo chiều bullish)
Signal: BULLISH (Tăng giá)
Win Rate: 72%
Avg R:R: 1:2.9
Best Timeframe: 1D, 1W
Icon: 📐📈
```

### **Cấu Trúc:**
```
\____      Falling resistance
 \___      
  \__      
   \_      
    \     Falling support (steeper)
```

### **Đặc Điểm:**
- ✅ Both trendlines slope DOWN
- ✅ Converging (narrowing range)
- ✅ Lower highs + Lower lows
- ✅ Volume decreases
- ✅ Breakout UP (bullish reversal)
- ✅ Appears at bottom of downtrends

---

## 8️⃣ FALLING THREE METHODS

### **Thông Tin Cơ Bản:**
```yaml
Tên: Falling Three Methods
Tiếng Việt: Ba Phương Pháp Giảm
Type: CONTINUATION (Tiếp diễn bearish)
Signal: BEARISH (Giảm giá)
Win Rate: 64%
Avg R:R: 1:2.1
Best Timeframe: 4H, 1D
Icon: 📉⏸️📉
```

### **Cấu Trúc:**
```
█       Long bearish candle
▐▌      
 ▐▌     Small bullish candles (3)
  ▐▌    (Pause/consolidation)
   █    Long bearish candle (continuation)
```

### **Đặc Điểm:**
- ✅ 5 candles minimum
- ✅ Candle 1: Long bearish candle
- ✅ Candles 2-4: Small bullish candles (countertrend)
- ✅ Candle 5: Long bearish candle (continuation)
- ✅ Small candles stay within range of first candle
- ✅ Volume low on small candles, high on bearish candles

---

## 9️⃣ RISING THREE METHODS

### **Thông Tin Cơ Bản:**
```yaml
Tên: Rising Three Methods
Tiếng Việt: Ba Phương Pháp Tăng
Type: CONTINUATION (Tiếp diễn bullish)
Signal: BULLISH (Tăng giá)
Win Rate: 65%
Avg R:R: 1:2.2
Best Timeframe: 4H, 1D
Icon: 📈⏸️📈
```

### **Cấu Trúc:**
```
   █    Long bullish candle (continuation)
  ▐▌    
 ▐▌     Small bearish candles (3)
▐▌      (Pause/consolidation)
█       Long bullish candle
```

### **Đặc Điểm:**
- ✅ 5 candles minimum
- ✅ Candle 1: Long bullish candle
- ✅ Candles 2-4: Small bearish candles (countertrend)
- ✅ Candle 5: Long bullish candle (continuation)
- ✅ Small candles stay within range of first candle
- ✅ Volume pattern similar to Falling Three

---

## 🔟 BULLISH/BEARISH ENGULFING

### **Thông Tin Cơ Bản:**
```yaml
Tên: Engulfing Pattern
Tiếng Việt: Mẫu Hình Nhấn Chìm
Type: REVERSAL (Đảo chiều)
Signal: BULLISH hoặc BEARISH
Win Rate: 67%
Avg R:R: 1:2.0
Best Timeframe: 4H, 1D, 1W
Icon: 🔄📊
```

### **Bullish Engulfing:**
```
 ▐█  Previous: Small bearish
██   Current: Large bullish (engulfs previous)
```

### **Bearish Engulfing:**
```
██   Previous: Small bullish
 ▐█  Current: Large bearish (engulfs previous)
```

### **Detection Algorithm:**
```javascript
// File: src/utils/patterns/EngulfingPattern.js

export const detectEngulfing = (candles, config = {}) => {
  const {
    minBodyRatio = 1.5,  // Current body must be 1.5x previous
    volumeMultiplier = 1.2, // Volume should increase 20%
  } = config;

  const patterns = [];
  
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1];
    const current = candles[i];
    
    const prevBody = Math.abs(prev.close - prev.open);
    const currentBody = Math.abs(current.close - current.open);
    
    // Current body must be larger
    if (currentBody < prevBody * minBodyRatio) continue;
    
    // Volume should increase
    if (current.volume < prev.volume * volumeMultiplier) continue;
    
    // Bullish Engulfing
    if (prev.close < prev.open && current.close > current.open) {
      if (current.open <= prev.close && current.close >= prev.open) {
        patterns.push({
          type: 'BULLISH_ENGULFING',
          name: 'Bullish Engulfing',
          signal: 'BULLISH',
          patternType: 'REVERSAL',
          index: i,
          confidence: calculateEngulfingConfidence(currentBody / prevBody, current.volume / prev.volume),
          entry: current.close,
          stopLoss: current.low - (current.low * 0.005),
          target: current.close + (current.close - current.low) * 2,
          detectedOnTimeframe: config.timeframe || '4H',
        });
      }
    }
    
    // Bearish Engulfing
    if (prev.close > prev.open && current.close < current.open) {
      if (current.open >= prev.close && current.close <= prev.open) {
        patterns.push({
          type: 'BEARISH_ENGULFING',
          name: 'Bearish Engulfing',
          signal: 'BEARISH',
          patternType: 'REVERSAL',
          index: i,
          confidence: calculateEngulfingConfidence(currentBody / prevBody, current.volume / prev.volume),
          entry: current.close,
          stopLoss: current.high + (current.high * 0.005),
          target: current.close - (current.high - current.close) * 2,
          detectedOnTimeframe: config.timeframe || '4H',
        });
      }
    }
  }
  
  return patterns;
};

const calculateEngulfingConfidence = (bodyRatio, volumeRatio) => {
  let confidence = 60;
  if (bodyRatio > 2) confidence += 15;
  else if (bodyRatio > 1.5) confidence += 10;
  if (volumeRatio > 1.5) confidence += 15;
  else if (volumeRatio > 1.2) confidence += 10;
  return Math.min(100, confidence);
};
```

---

## 1️⃣1️⃣ MORNING STAR / EVENING STAR

### **Morning Star (Sao Mai - Bullish):**
```yaml
Type: REVERSAL
Signal: BULLISH
Win Rate: 71%
Icon: 🌅⭐
```

**Cấu Trúc:**
```
     █   3rd: Long bullish
    ▐    
   ▐     2nd: Small body (star)
  █      1st: Long bearish
```

### **Evening Star (Sao Chiều - Bearish):**
```yaml
Type: REVERSAL
Signal: BEARISH
Win Rate: 70%
Icon: 🌆⭐
```

**Cấu Trúc:**
```
  █      1st: Long bullish
   ▐     2nd: Small body (star)
    ▐    
     █   3rd: Long bearish
```

### **Detection:**
```javascript
// Already implemented in confirmationValidator.js
// Just need to expose as standalone patterns
```

---

## 1️⃣2️⃣ HAMMER / INVERTED HAMMER

### **Hammer (Búa - Bullish):**
```yaml
Type: REVERSAL
Signal: BULLISH
Win Rate: 66%
Icon: 🔨📈
```

**Cấu Trúc:**
```
 ▐   Small body at top
 ▐   
 |   Long lower wick (2-3x body)
 |
```

### **Inverted Hammer (Búa Ngược - Bullish):**
```yaml
Type: REVERSAL
Signal: BULLISH
Win Rate: 64%
Icon: 🔨📈
```

**Cấu Trúc:**
```
 |   Long upper wick
 |
 ▐   Small body at bottom
 ▐
```

---

## 1️⃣3️⃣ SHOOTING STAR / HANGING MAN

### **Shooting Star (Sao Băng - Bearish):**
```yaml
Type: REVERSAL
Signal: BEARISH
Win Rate: 68%
Icon: 🌠📉
```

### **Hanging Man (Người Treo Cổ - Bearish):**
```yaml
Type: REVERSAL
Signal: BEARISH
Win Rate: 65%
Icon: 👤📉
```

---

## 1️⃣4️⃣ DOJI PATTERNS

### **Dragonfly Doji (Chuồn Chuồn - Bullish):**
```yaml
Type: REVERSAL
Signal: BULLISH
Win Rate: 63%
Icon: 🦋📈
```

**Cấu Trúc:**
```
 ─   Open = Close (at high)
 |   Long lower wick
 |
```

### **Gravestone Doji (Bia Mộ - Bearish):**
```yaml
Type: REVERSAL
Signal: BEARISH
Win Rate: 64%
Icon: 🪦📉
```

**Cấu Trúc:**
```
 |   Long upper wick
 |
 ─   Open = Close (at low)
```

### **Standard Doji (Không Quyết Định):**
```yaml
Type: INDECISION
Signal: NEUTRAL
Win Rate: N/A
Icon: ➕
```

---

## 📊 BẢNG TỔNG HỢP 24 PATTERNS

### **Phân Loại Theo Type:**

**REVERSAL PATTERNS (10):**
1. Head & Shoulders - 72%
2. Inverse H&S - 75%
3. Double Top - 68%
4. Double Bottom - 70%
5. Rising Wedge - 70%
6. Falling Wedge - 72%
7. Cup and Handle - 68%
8. Bullish/Bearish Engulfing - 67%
9. Morning/Evening Star - 70.5%
10. Hammer/Inverted Hammer - 65%

**CONTINUATION PATTERNS (8):**
11. DPD - 68%
12. UPU - 71%
13. UPD - 65%
14. DPU - 69%
15. Ascending Triangle - 66%
16. Descending Triangle - 64%
17. Symmetrical Triangle - 62%
18. Bull/Bear Flag - 65.5%
19. Falling Three Methods - 64%
20. Rising Three Methods - 65%

**ZONE PATTERNS (2):**
21. HFZ - N/A
22. LFZ - N/A

**CANDLESTICK PATTERNS (2):**
23. Shooting Star/Hanging Man - 66.5%
24. Doji Patterns - 63.5%

### **Average Win Rate: 67.8%** ✅

---

## 📅 IMPLEMENTATION TIMELINE

### **Đã Implement (11 patterns):**
- DPD, UPU, UPD, DPU, HFZ, LFZ
- Head & Shoulders, Double Top, Double Bottom
- Ascending Triangle, Bull Flag

### **Cần Implement (13 patterns mới):**

**Week 1 (Day 1-3):**
- Inverse Head & Shoulders
- Cup and Handle
- Descending Triangle
- Symmetrical Triangle
- Bear Flag

**Week 2 (Day 4-6):**
- Rising Wedge
- Falling Wedge
- Falling Three Methods
- Rising Three Methods

**Week 2 (Day 7-8):**
- Engulfing Patterns
- Morning/Evening Star
- Hammer/Inverted Hammer
- Shooting Star/Hanging Man
- Doji Patterns

---

## ✅ DELIVERABLES

### **Code Files (13 mới):**
```
1. InverseHeadAndShouldersPattern.js
2. CupAndHandlePattern.js
3. DescendingTrianglePattern.js
4. SymmetricalTrianglePattern.js
5. BearFlagPattern.js
6. RisingWedgePattern.js
7. FallingWedgePattern.js
8. FallingThreeMethodsPattern.js
9. RisingThreeMethodsPattern.js
10. EngulfingPattern.js
11. MorningEveningStarPattern.js
12. HammerShootingStarPattern.js
13. DojiPattern.js
```

### **Testing:**
- Unit tests for each pattern
- Integration tests
- Backtest validation
- Performance benchmarks

---

## 🎯 UPDATED SUCCESS METRICS

### **Pattern Coverage:**
```
Before: 11/24 patterns (46%)
After: 24/24 patterns (100%) ✅
```

### **Win Rate Target:**
```
Expected Average: 67.8%
Target: 68%+ ✅
```

### **Detection Coverage:**
```
Chart Patterns: 100%
Candlestick Patterns: 100%
Zone Patterns: 100%
```

---

## 📞 NEXT STEPS

1. Review 13 patterns mới
2. Prioritize implementation
3. Implement code
4. Write tests
5. Update UI
6. Deploy

---

© 2025 GEM Trading Academy  
**Bổ Sung 13 Patterns Mới**  
**Tổng: 24 Patterns - Complete Library**  
**Average Win Rate: 67.8%+**
