/**
 * GEM AI Trading Brain - Knowledge Base
 * Comprehensive knowledge for admin trading assistant
 *
 * Contains:
 * - Pattern knowledge (7 core + extensions)
 * - Zone concepts (HFZ, LFZ)
 * - Candle patterns
 * - Trading rules
 * - Known bugs and edge cases
 * - System prompt for Gemini
 */

// ═══════════════════════════════════════════════════════════
// PATTERN KNOWLEDGE - 7 Core Patterns + Extensions
// ═══════════════════════════════════════════════════════════
export const PATTERN_KNOWLEDGE = {
  // Core Patterns
  DPD: {
    name: 'DPD',
    fullName: 'Down-Peak-Down',
    direction: 'SHORT',
    type: 'continuation',
    description: 'Bearish continuation pattern - Lower high formed, expect further downside',
    structure: {
      phase1: 'Price makes a down move (impulse)',
      phase2: 'Price retraces up (correction/peak)',
      phase3: 'Price continues down (confirmation)',
    },
    detection: {
      logic: 'Look for lower high after significant down move',
      confirmation: 'Zone retest with rejection candle',
      invalidation: 'Break above the peak high',
    },
    entryRules: [
      'Wait for price to retest HFZ (resistance zone)',
      'Look for rejection candle (pin bar, engulfing)',
      'Enter on close of confirmation candle',
      'Alternative: Enter on break below recent swing low',
    ],
    stopLossRules: [
      'Place SL above zone high + buffer (0.5-1 ATR)',
      'Never place SL at exact zone boundary',
      'Account for spread/slippage',
    ],
    takeProfitRules: [
      'TP1: Equal to impulse move (1:1)',
      'TP2: 1.618 extension of impulse',
      'Consider moving SL to breakeven after TP1',
    ],
    statistics: {
      expectedWinRate: 65,
      avgRR: 2.1,
      commonMistakes: [
        'Entering before confirmation candle',
        'SL too tight (hit by wick)',
        'Ignoring higher timeframe trend',
      ],
    },
  },

  UPU: {
    name: 'UPU',
    fullName: 'Up-Peak-Up',
    direction: 'LONG',
    type: 'continuation',
    description: 'Bullish continuation pattern - Higher low formed, expect further upside',
    structure: {
      phase1: 'Price makes an up move (impulse)',
      phase2: 'Price retraces down (correction/dip)',
      phase3: 'Price continues up (confirmation)',
    },
    detection: {
      logic: 'Look for higher low after significant up move',
      confirmation: 'Zone retest with bounce candle',
      invalidation: 'Break below the dip low',
    },
    entryRules: [
      'Wait for price to retest LFZ (support zone)',
      'Look for bounce candle (hammer, bullish engulfing)',
      'Enter on close of confirmation candle',
      'Alternative: Enter on break above recent swing high',
    ],
    stopLossRules: [
      'Place SL below zone low - buffer (0.5-1 ATR)',
      'Never place SL at exact zone boundary',
      'Account for spread/slippage',
    ],
    takeProfitRules: [
      'TP1: Equal to impulse move (1:1)',
      'TP2: 1.618 extension of impulse',
      'Consider moving SL to breakeven after TP1',
    ],
    statistics: {
      expectedWinRate: 68,
      avgRR: 2.3,
      commonMistakes: [
        'Entering at first touch without confirmation',
        'SL too tight',
        'Counter-trend trading in strong downtrend',
      ],
    },
  },

  DPU: {
    name: 'DPU',
    fullName: 'Down-Peak-Up',
    direction: 'LONG',
    type: 'reversal',
    description: 'Bullish reversal pattern - Downtrend ending, higher low signals reversal',
    structure: {
      phase1: 'Price makes a down move (final push)',
      phase2: 'Price bounces and forms peak',
      phase3: 'Price holds higher than previous low (bullish)',
    },
    detection: {
      logic: 'After downtrend, look for higher low formation',
      confirmation: 'Break above the peak/neck line',
      invalidation: 'New lower low below phase 1',
    },
    entryRules: [
      'Wait for higher low to form after downtrend',
      'Look for bullish candle pattern at support',
      'Enter on break above intermediate high',
      'Or enter on retest of broken resistance',
    ],
    stopLossRules: [
      'Place SL below the higher low',
      'Add buffer for wick protection',
      'Wider SL for reversal patterns (higher risk)',
    ],
    takeProfitRules: [
      'TP1: Previous swing high',
      'TP2: Measured move of entire pattern',
      'Trail stop in profit',
    ],
    statistics: {
      expectedWinRate: 62,
      avgRR: 2.0,
      commonMistakes: [
        'Trying to catch falling knife',
        'Not waiting for confirmation',
        'Ignoring volume (should increase on reversal)',
      ],
    },
  },

  UPD: {
    name: 'UPD',
    fullName: 'Up-Peak-Down',
    direction: 'SHORT',
    type: 'reversal',
    description: 'Bearish reversal pattern - Uptrend ending, lower high signals reversal',
    structure: {
      phase1: 'Price makes an up move (final push)',
      phase2: 'Price drops and forms trough',
      phase3: 'Price fails to make new high (bearish)',
    },
    detection: {
      logic: 'After uptrend, look for lower high formation',
      confirmation: 'Break below the trough/neck line',
      invalidation: 'New higher high above phase 1',
    },
    entryRules: [
      'Wait for lower high to form after uptrend',
      'Look for bearish candle pattern at resistance',
      'Enter on break below intermediate low',
      'Or enter on retest of broken support',
    ],
    stopLossRules: [
      'Place SL above the lower high',
      'Add buffer for wick protection',
      'Wider SL for reversal patterns',
    ],
    takeProfitRules: [
      'TP1: Previous swing low',
      'TP2: Measured move of entire pattern',
      'Trail stop in profit',
    ],
    statistics: {
      expectedWinRate: 60,
      avgRR: 2.0,
      commonMistakes: [
        'Shorting too early in strong uptrend',
        'Not waiting for lower high confirmation',
        'SL placed at exact peak (gets wicked)',
      ],
    },
    knownBugs: [
      {
        issue: 'UPD Entry Detection Bug',
        description: 'Scanner sometimes detects entry too early before lower high is confirmed',
        workaround: 'Always verify lower high is complete with rejection candle',
      },
    ],
  },

  'Head & Shoulders': {
    name: 'H&S',
    fullName: 'Head & Shoulders',
    direction: 'SHORT',
    type: 'reversal',
    description: 'Classic bearish reversal - Three peaks with middle being highest',
    structure: {
      phase1: 'Left shoulder (first peak)',
      phase2: 'Head (higher peak)',
      phase3: 'Right shoulder (lower peak, similar to left)',
    },
    detection: {
      logic: 'Three peaks, middle highest, neckline connects troughs',
      confirmation: 'Break below neckline with volume',
      invalidation: 'Break above head',
    },
    entryRules: [
      'Wait for neckline break',
      'Enter on break or retest of neckline',
      'Volume should increase on break',
    ],
    stopLossRules: [
      'SL above right shoulder',
      'Or above neckline after break',
    ],
    takeProfitRules: [
      'TP: Distance from head to neckline projected down',
      'Scale out at 50% and 100% of target',
    ],
    statistics: {
      expectedWinRate: 72,
      avgRR: 2.5,
      commonMistakes: [
        'Entering before neckline break',
        'Not measuring target correctly',
        'Ignoring sloped neckline',
      ],
    },
  },

  'Double Top': {
    name: 'DT',
    fullName: 'Double Top',
    direction: 'SHORT',
    type: 'reversal',
    description: 'Bearish reversal - Two peaks at similar level indicating resistance',
    structure: {
      phase1: 'First peak at resistance',
      phase2: 'Pullback to support (neckline)',
      phase3: 'Second peak fails at same level',
    },
    detection: {
      logic: 'Two peaks within 3% of each other',
      confirmation: 'Break below neckline',
      invalidation: 'Break above both peaks',
    },
    entryRules: [
      'Wait for neckline (support) break',
      'Enter on break or retest',
      'Second peak should show weakness (smaller, lower volume)',
    ],
    stopLossRules: [
      'SL above the peaks',
      'Or tight SL above neckline after break',
    ],
    takeProfitRules: [
      'TP: Distance from peaks to neckline projected down',
    ],
    statistics: {
      expectedWinRate: 67,
      avgRR: 2.2,
      commonMistakes: [
        'Calling double top too early (may be consolidation)',
        'Not waiting for neckline break',
      ],
    },
  },

  'Double Bottom': {
    name: 'DB',
    fullName: 'Double Bottom',
    direction: 'LONG',
    type: 'reversal',
    description: 'Bullish reversal - Two troughs at similar level indicating support',
    structure: {
      phase1: 'First trough at support',
      phase2: 'Rally to resistance (neckline)',
      phase3: 'Second trough holds at same level',
    },
    detection: {
      logic: 'Two troughs within 3% of each other',
      confirmation: 'Break above neckline',
      invalidation: 'Break below both troughs',
    },
    entryRules: [
      'Wait for neckline (resistance) break',
      'Enter on break or retest',
      'Second trough should show strength (bullish candles, volume)',
    ],
    stopLossRules: [
      'SL below the troughs',
      'Or tight SL below neckline after break',
    ],
    takeProfitRules: [
      'TP: Distance from troughs to neckline projected up',
    ],
    statistics: {
      expectedWinRate: 68,
      avgRR: 2.3,
      commonMistakes: [
        'Buying at first bounce without confirmation',
        'Not waiting for neckline break',
      ],
    },
  },
};

// ═══════════════════════════════════════════════════════════
// ZONE CONCEPTS - HFZ and LFZ
// ═══════════════════════════════════════════════════════════
export const ZONE_CONCEPTS = {
  HFZ: {
    name: 'HFZ',
    fullName: 'High Frequency Zone',
    type: 'resistance',
    color: '#9C0612', // Burgundy
    description: 'Supply zone where sellers are expected to defend',
    formation: [
      'Formed by strong rejection from highs',
      'Multiple touches weaken the zone',
      'Fresh zones (0-1 touches) are strongest',
    ],
    tradingRules: [
      'Look for SHORT entries when price approaches',
      'Wait for rejection candle (pin bar, engulfing)',
      'Zone is invalidated if price closes above with volume',
    ],
    freshness: {
      fresh: '0 touches - Strongest',
      tested1x: '1 touch - Still valid',
      tested2x: '2 touches - Weakening',
      broken: '3+ touches or strong close above - Invalid',
    },
  },

  LFZ: {
    name: 'LFZ',
    fullName: 'Low Frequency Zone',
    type: 'support',
    color: '#3AF7A6', // Green
    description: 'Demand zone where buyers are expected to step in',
    formation: [
      'Formed by strong bounce from lows',
      'Multiple touches weaken the zone',
      'Fresh zones (0-1 touches) are strongest',
    ],
    tradingRules: [
      'Look for LONG entries when price approaches',
      'Wait for bounce candle (hammer, bullish engulfing)',
      'Zone is invalidated if price closes below with volume',
    ],
    freshness: {
      fresh: '0 touches - Strongest',
      tested1x: '1 touch - Still valid',
      tested2x: '2 touches - Weakening',
      broken: '3+ touches or strong close below - Invalid',
    },
  },
};

// ═══════════════════════════════════════════════════════════
// CANDLE PATTERNS
// ═══════════════════════════════════════════════════════════
export const CANDLE_PATTERNS = {
  bullish: {
    hammer: {
      name: 'Hammer',
      description: 'Long lower wick, small body at top',
      significance: 'Strong bullish reversal at support',
      bodyToWickRatio: 'Lower wick at least 2x body',
    },
    bullishEngulfing: {
      name: 'Bullish Engulfing',
      description: 'Large green candle engulfs previous red',
      significance: 'Strong bullish reversal signal',
      requirement: 'Body must fully engulf previous body',
    },
    morningStar: {
      name: 'Morning Star',
      description: 'Three candle pattern: red, small, green',
      significance: 'Reliable bullish reversal',
      requirement: 'Middle candle gaps down from first',
    },
    dragonfly: {
      name: 'Dragonfly Doji',
      description: 'Open/close at high, long lower wick',
      significance: 'Bullish reversal at support',
    },
  },
  bearish: {
    shootingStar: {
      name: 'Shooting Star',
      description: 'Long upper wick, small body at bottom',
      significance: 'Strong bearish reversal at resistance',
      bodyToWickRatio: 'Upper wick at least 2x body',
    },
    bearishEngulfing: {
      name: 'Bearish Engulfing',
      description: 'Large red candle engulfs previous green',
      significance: 'Strong bearish reversal signal',
      requirement: 'Body must fully engulf previous body',
    },
    eveningStar: {
      name: 'Evening Star',
      description: 'Three candle pattern: green, small, red',
      significance: 'Reliable bearish reversal',
      requirement: 'Middle candle gaps up from first',
    },
    gravestone: {
      name: 'Gravestone Doji',
      description: 'Open/close at low, long upper wick',
      significance: 'Bearish reversal at resistance',
    },
  },
  neutral: {
    doji: {
      name: 'Doji',
      description: 'Open and close at same level',
      significance: 'Indecision, potential reversal',
      types: ['Standard', 'Long-legged', 'Dragonfly', 'Gravestone'],
    },
    spinningTop: {
      name: 'Spinning Top',
      description: 'Small body with equal wicks',
      significance: 'Indecision in the market',
    },
  },
};

// ═══════════════════════════════════════════════════════════
// TRADING RULES - GEM Frequency Method
// ═══════════════════════════════════════════════════════════
export const TRADING_RULES = {
  entry: {
    mustHave: [
      'Pattern detected with confidence > 65%',
      'Zone retest or zone approach',
      'Confirmation candle present',
      'Risk:Reward ratio >= 2:1',
    ],
    niceToHave: [
      'Higher timeframe alignment',
      'Volume confirmation',
      'RSI divergence',
      'Multi-timeframe confluence',
    ],
    avoid: [
      'Entering against strong trend',
      'Entering on news events',
      'Entering without confirmation',
      'Entering when zone is exhausted (3+ touches)',
    ],
  },
  exit: {
    takeProfit: [
      'Measured move target',
      'Previous swing high/low',
      'Key S/R level',
      'Extension levels (1.27, 1.618)',
    ],
    stopLoss: [
      'Beyond zone boundary + buffer',
      'Below/above confirmation candle',
      'ATR-based (1-2 ATR)',
      'Never move SL against position',
    ],
    trailStop: [
      'Move to breakeven after 1R profit',
      'Trail below/above swing points',
      'Use ATR trailing (2 ATR)',
    ],
  },
  riskManagement: {
    maxRiskPerTrade: '1-2% of account',
    maxDailyLoss: '5% of account',
    maxOpenPositions: '3-5 positions',
    correlationRule: 'Avoid multiple correlated positions',
    sizing: 'Position size = (Risk Amount) / (SL Distance)',
  },
};

// ═══════════════════════════════════════════════════════════
// KNOWN BUGS - Issues in the Scanner
// ═══════════════════════════════════════════════════════════
export const KNOWN_BUGS = [
  {
    id: 'UPD_EARLY_ENTRY',
    pattern: 'UPD',
    issue: 'Entry detection sometimes triggers before lower high is confirmed',
    impact: 'May suggest entry too early',
    workaround: 'Always verify lower high is complete with rejection candle',
    status: 'known',
  },
  {
    id: 'ZONE_FRESHNESS_COUNT',
    pattern: 'All',
    issue: 'Zone touch count may not update in real-time during fast moves',
    impact: 'Zone may appear fresher than it is',
    workaround: 'Manually verify zone touches on chart',
    status: 'known',
  },
  {
    id: 'MTF_DELAY',
    pattern: 'Multi-TF',
    issue: 'Multi-timeframe scan may have delay between timeframes',
    impact: 'Short-term patterns may update faster than long-term',
    workaround: 'Refresh scan if patterns seem inconsistent',
    status: 'known',
  },
];

// ═══════════════════════════════════════════════════════════
// SYSTEM PROMPT - For Gemini AI
// ═══════════════════════════════════════════════════════════
export const ADMIN_AI_SYSTEM_PROMPT = `Bạn là **GEM AI Trading Brain** - Trợ lý giao dịch cá nhân của Admin.

## VAI TRÒ
- Phân tích thị trường crypto real-time
- Đánh giá pattern và zone
- Tư vấn entry/exit/risk management
- Giám sát positions đang mở

## NGÔN NGỮ & GIỌNG ĐIỆU
- Tiếng Việt có dấu đầy đủ
- Chuyên nghiệp, trực tiếp, không rườm rà
- Dùng emoji để làm rõ: ✅ ❌ ⚠️ 📊 💰 🎯
- Đưa ra quan điểm rõ ràng, không nước đôi

## KIẾN THỨC NỀN TẢNG
Bạn hiểu sâu về GEM Frequency Method:
- 7 Pattern chính: DPD, UPU, DPU, UPD, H&S, Double Top, Double Bottom
- Zone: HFZ (resistance/burgundy), LFZ (support/green)
- Zone Retest Methodology
- Confirmation Candle Patterns
- Risk:Reward optimization

## PHONG CÁCH TRẢ LỜI

### Khi phân tích pattern:
\`\`\`
📊 **[PATTERN NAME]** detected
• Confidence: X%
• Direction: LONG/SHORT
• Zone: [zone type] tại [price level]

✅ **Entry khuyến nghị:**
• Entry: [price]
• SL: [price] (-X%)
• TP1: [price] (+X%)
• TP2: [price] (+X%)
• R:R: X:1

⚠️ **Lưu ý:**
• [risk factors]
\`\`\`

### Khi review position:
\`\`\`
📈 **Position Review: [SYMBOL]**
• Entry: [price] | Current: [price]
• P&L: +X% / -X%
• Distance to SL: X%
• Distance to TP: X%

🎯 **Khuyến nghị:**
• [action: HOLD / CLOSE / PARTIAL]
• [reasoning]
\`\`\`

### Khi có warning:
\`\`\`
⚠️ **CẢNH BÁO**
• [warning type]
• [details]
• Action: [recommended action]
\`\`\`

## QUY TẮC QUAN TRỌNG
1. Luôn kiểm tra zone freshness trước khi khuyến nghị entry
2. R:R tối thiểu 2:1 cho mọi trade
3. Cảnh báo nếu pattern có known bug
4. Đề cập multi-timeframe alignment khi có
5. KHÔNG bao giờ khuyến nghị all-in hoặc YOLO
6. LUÔN sử dụng DỮ LIỆU THỰC từ context được cung cấp - KHÔNG NÓI "dữ liệu không được cung cấp" hay "không có thông tin"
7. Khi review position: LUÔN nêu giá hiện tại, Entry, SL, TP, P&L, leverage
8. Khi gợi ý entry: LUÔN cho giá CỤ THỂ (Entry, SL, TP), KHÔNG cho range mơ hồ
9. Position size khuyến nghị dựa trên balance thực tế (1-3% risk rule)

## KNOWN BUGS
- UPD pattern có thể detect entry sớm - cần verify lower high
- Zone touch count có thể delay - verify manually
- MTF scan có delay giữa các timeframe

## FORMAT OUTPUT
- Dùng Markdown: **bold**, bullet points
- Ngắn gọn nhưng ĐẦY ĐỦ thông tin quan trọng
- Mỗi position review phải có: Entry, Current, SL, TP, P&L, Risk, Khuyến nghị
- Action items rõ ràng với giá CỤ THỂ
- Emoji đầu mỗi section`;

// ═══════════════════════════════════════════════════════════
// QUICK ACTION PROMPTS
// ═══════════════════════════════════════════════════════════
export const QUICK_ACTION_PROMPTS = {
  analyze_pattern: (context) => {
    const patterns = context.pattern?.patterns || [];
    const summary = context.pattern?.summary || {};
    const zones = context.zone?.zones || [];
    const market = context.market || {};

    const patternsSummary = patterns.length > 0
      ? patterns.map(p => {
          const grade = p.confidenceGrade ? ` [${p.confidenceGrade}]` : '';
          const vol = p.volumeGrade ? ` | Vol: ${p.volumeGrade}` : '';
          let line = `- ${p.name}: ${p.direction} (${p.confidence || 0}%${grade})${vol}`;
          if (p.entryPrice) line += ` | Entry: $${p.entryPrice}`;
          if (p.stopLoss) line += ` | SL: $${p.stopLoss}`;
          if (p.takeProfit) line += ` | TP: $${p.takeProfit}`;
          if (p.riskReward) line += ` | R:R: ${p.riskReward}`;
          if (p.zoneType) line += ` | Zone: ${p.zoneType}`;
          return line;
        }).join('\n')
      : 'Không có pattern nào được phát hiện';

    const nearestZones = zones.slice(0, 3).map(z => {
      let line = `- ${z.type} [${z.freshness}]: $${z.low?.toFixed(0) || 'N/A'} - $${z.high?.toFixed(0) || 'N/A'} (${z.distance?.toFixed(1) || '?'}% ${z.position})`;
      if (z.entryPrice) line += ` | Entry: $${z.entryPrice} SL: $${z.stopLoss || 'N/A'} TP: $${z.takeProfit || 'N/A'}`;
      return line;
    }).join('\n');

    return `
Phân tích pattern hiện tại cho ${context.symbol} (${context.timeframe}):
Giá hiện tại: $${context.currentPrice}
Trend: ${market.trend?.toUpperCase() || 'N/A'}
RSI: ${market.indicators?.rsi?.toFixed(1) || 'N/A'} | SMA20: $${market.indicators?.sma20?.toFixed(2) || 'N/A'}
24h Change: ${market.change24h?.toFixed(2) || 'N/A'}%
Last candle: ${market.lastCandle?.type || 'N/A'} (${market.lastCandle?.signal || 'neutral'})

Patterns detected (${patterns.length}):
${patternsSummary}

Summary: ${summary.longCount || 0} LONG, ${summary.shortCount || 0} SHORT, ${summary.highConfidenceCount || 0} high-confidence

Nearest zones:
${nearestZones || 'Không có zone'}

Hãy đánh giá chi tiết:
1. Pattern nào mạnh nhất? Tại sao?
2. Zone alignment với pattern?
3. Confirmation signals (RSI, candle pattern, trend)
4. Nếu phù hợp entry, cho plan: Entry, SL, TP1, TP2, R:R, Position size % balance
5. Nếu KHÔNG nên entry, giải thích tại sao
`;
  },

  check_zone: (context) => {
    const zones = context.zone?.zones || [];
    const nearestZone = context.zone?.nearestZone;
    const summary = context.zone?.summary || {};
    const market = context.market || {};
    const patterns = context.pattern?.patterns || [];

    const zonesSummary = zones.length > 0
      ? zones.slice(0, 8).map(z => {
          const freshLabel = z.freshness === 'fresh' ? 'FRESH' :
                            z.freshness === 'tested_1x' ? 'Tested 1x' :
                            z.freshness === 'tested_2x' ? 'Tested 2x' : 'Exhausted';
          let line = `- ${z.type} [${freshLabel}]: $${z.low?.toFixed(0) || 'N/A'} - $${z.high?.toFixed(0) || 'N/A'} (width: ${z.width?.toFixed(2) || 'N/A'}%, ${z.distance?.toFixed(1) || '?'}% ${z.position}, touches: ${z.touches || 0})`;
          if (z.patternType) line += ` | Pattern: ${z.patternType} ${z.direction || ''}`;
          if (z.entryPrice) line += ` | Entry: $${z.entryPrice} SL: $${z.stopLoss || 'N/A'} TP: $${z.takeProfit || 'N/A'}`;
          return line;
        }).join('\n')
      : 'Không có zone nào';

    return `
Phân tích zones cho ${context.symbol} (${context.timeframe}):
Giá hiện tại: $${context.currentPrice}
Trend: ${market.trend?.toUpperCase() || 'N/A'}
RSI: ${market.indicators?.rsi?.toFixed(1) || 'N/A'}

Zones (${zones.length} total - ${summary.hfzCount || 0} HFZ, ${summary.lfzCount || 0} LFZ, ${summary.freshCount || 0} fresh):
${zonesSummary}

${nearestZone ? `Nearest zone: ${nearestZone.type} [${nearestZone.freshness}] at ${nearestZone.distance?.toFixed(1)}% ${nearestZone.position} ($${nearestZone.low?.toFixed(0)} - $${nearestZone.high?.toFixed(0)})` : 'Không có zone gần'}

Active patterns: ${patterns.map(p => `${p.name} ${p.direction}`).join(', ') || 'Không có'}

Hãy đánh giá:
1. Zone nào fresh và có khả năng phản ứng cao?
2. Price đang ở vị trí nào so với các zone (above/inside/below)?
3. Zone nào là key support/resistance gần nhất?
4. Nếu price tiến về zone, khả năng bounce hay break?
5. Kết hợp zone + pattern + trend → gợi ý trade setup nếu phù hợp
`;
  },

  entry_suggestion: (context) => {
    const patterns = context.pattern?.patterns || [];
    const zones = context.zone?.zones || [];
    const nearestZone = context.zone?.nearestZone;
    const market = context.market || {};
    const balanceInfo = context.position?.balanceInfo || {};
    const openPositions = context.position?.positions || [];

    const highConfPatterns = patterns.filter(p => (p.confidence || 0) >= 70);

    const patternDetails = patterns.map(p => {
      let line = `- ${p.name}: ${p.direction} (${p.confidence}%)`;
      if (p.entryPrice) line += ` | Suggested entry: $${p.entryPrice}`;
      if (p.stopLoss) line += ` | SL: $${p.stopLoss}`;
      if (p.takeProfit) line += ` | TP: $${p.takeProfit}`;
      if (p.riskReward) line += ` | R:R: ${p.riskReward}`;
      return line;
    }).join('\n') || 'Không có';

    const nearestZones = zones.slice(0, 3).map(z => {
      let line = `- ${z.type} [${z.freshness}]: $${z.low?.toFixed(0) || 'N/A'} - $${z.high?.toFixed(0) || 'N/A'} (${z.distance?.toFixed(1) || '?'}% ${z.position})`;
      if (z.entryPrice) line += ` | Entry: $${z.entryPrice} SL: $${z.stopLoss || 'N/A'} TP: $${z.takeProfit || 'N/A'}`;
      return line;
    }).join('\n') || 'Không có';

    return `
Gợi ý entry cho ${context.symbol} (${context.timeframe}):
Giá hiện tại: $${context.currentPrice}
Trend: ${market.trend?.toUpperCase() || 'N/A'}
RSI: ${market.indicators?.rsi?.toFixed(1) || 'N/A'}
24h Change: ${market.change24h?.toFixed(2) || 'N/A'}%
ATR: $${market.indicators?.atr?.toFixed(2) || 'N/A'}

Patterns (${patterns.length} total, ${highConfPatterns.length} high-conf):
${patternDetails}

Nearest zones:
${nearestZones}

Account: Balance $${balanceInfo.balance?.toFixed(2) || 'N/A'} | Open positions: ${openPositions.length}

Có nên entry không? Trả lời RÕ RÀNG:
1. **Có/Không** entry và lý do
2. Nếu CÓ, cho entry plan CHI TIẾT:
   - Entry price (giá entry cụ thể)
   - Stop Loss (và lý do chọn mức SL này)
   - Take Profit 1 và Take Profit 2
   - Risk:Reward ratio
   - Position size ($) dựa trên balance $${balanceInfo.balance?.toFixed(0) || '10000'} (khuyến nghị 1-3% risk)
   - Leverage phù hợp
3. Nếu KHÔNG, chờ điều kiện gì?
`;
  },

  position_review: (context) => {
    const positions = context.position?.positions || [];
    const positionCount = positions.length;
    const totalPnL = context.position?.totalPnLPercent || 0;
    const riskLevel = context.position?.riskLevel || 'UNKNOWN';
    const balanceInfo = context.position?.balanceInfo || {};
    const focusedPosition = context.position?.focusedPosition;

    if (positionCount === 0) {
      return `Không có positions đang mở. Tài khoản hiện không có vị thế nào.

Thông tin tài khoản:
- Balance: $${balanceInfo.balance?.toFixed(2) || 'N/A'}
- Initial: $${balanceInfo.initialBalance?.toFixed(2) || 'N/A'}
- P&L tài khoản: ${balanceInfo.pnlPercent?.toFixed(2) || 0}%

Symbol đang xem: ${context.symbol} (${context.timeframe}) - Giá: $${context.currentPrice}
Hãy tóm tắt tình hình tài khoản và gợi ý trade nếu phù hợp.`;
    }

    const positionsSummary = positions.map(p => {
      const sl = p.stopLoss ? `$${p.stopLoss}` : 'Không đặt';
      const tp = p.takeProfit ? `$${p.takeProfit}` : 'Không đặt';
      const distSL = p.distanceToSL != null ? `${p.distanceToSL}%` : 'N/A';
      const distTP = p.distanceToTP != null ? `${p.distanceToTP}%` : 'N/A';
      const rr = p.rrAchieved != null ? `${p.rrAchieved}R` : 'N/A';
      const opened = p.openedAt ? new Date(p.openedAt).toLocaleString('vi-VN') : 'N/A';
      return `### ${p.symbol} ${p.side} (x${p.leverage || 1})
- Entry: $${p.entryPrice} | Current: $${p.currentPrice || 'N/A'}
- SL: ${sl} (distance: ${distSL}) | TP: ${tp} (distance: ${distTP})
- P&L: ${p.pnlPercent}% ($${p.pnlAmount || 0})
- Risk: ${p.riskLevel} | R:R achieved: ${rr}
- Size: $${p.positionSize || p.margin || 'N/A'} | Qty: ${p.quantity || 'N/A'}
- Pattern: ${p.patternType || 'N/A'} (${p.timeframe || 'N/A'})
- Opened: ${opened}`;
    }).join('\n\n');

    const focusNote = focusedPosition
      ? `\n**User đang focus vào: ${focusedPosition.symbol} ${focusedPosition.side}** - Hãy phân tích position này chi tiết nhất.\n`
      : '';

    return `
Review ${positionCount} positions đang mở:
${focusNote}
${positionsSummary}

**Tổng quan portfolio:**
- Tổng P&L: ${totalPnL}%
- Risk Level: ${riskLevel}
- Exposure: $${context.position?.totalExposure?.toFixed(2) || 'N/A'} (${context.position?.exposureRatio != null ? (context.position.exposureRatio * 100).toFixed(1) + '%' : 'N/A'} of balance)
- Balance: $${balanceInfo.balance?.toFixed(2) || 'N/A'} (initial: $${balanceInfo.initialBalance?.toFixed(2) || 'N/A'})

Symbol đang xem: ${context.symbol} (${context.timeframe}) - Giá: $${context.currentPrice}

Hãy phân tích CHI TIẾT từng position:
1. P&L hiện tại, giá hiện tại so với entry
2. Distance to SL/TP và mức độ rủi ro
3. Đánh giá vị thế dựa trên xu hướng thị trường
4. Khuyến nghị cụ thể: HOLD / CLOSE / PARTIAL CLOSE / TRAIL STOP (dịch SL về breakeven)
5. Nếu cần dịch SL/TP, cho giá cụ thể
`;
  },

  risk_check: (context) => {
    const positions = context.position?.positions || [];
    const totalExposure = context.position?.exposureRatio || 0;
    const totalPnL = context.position?.totalPnLPercent || 0;
    const riskLevel = context.position?.riskLevel || 'UNKNOWN';
    const alerts = context.position?.alerts || [];
    const balanceInfo = context.position?.balanceInfo || {};
    const focusedPosition = context.position?.focusedPosition;

    const positionsSummary = positions.map(p => {
      const distSL = p.distanceToSL != null ? `${p.distanceToSL}%` : 'No SL';
      return `- ${p.symbol} ${p.side} (x${p.leverage || 1}): Entry $${p.entryPrice}, Current $${p.currentPrice || 'N/A'}, P&L: ${p.pnlPercent}%, SL distance: ${distSL}, Risk: ${p.riskLevel}, Size: $${p.positionSize || p.margin || 'N/A'}`;
    }).join('\n');

    const alertsSummary = alerts.length > 0
      ? alerts.map(a => `⚠️ ${a.message}`).join('\n')
      : 'Không có cảnh báo';

    return `
Kiểm tra risk tổng thể:

**Tài khoản:**
- Balance: $${balanceInfo.balance?.toFixed(2) || 'N/A'} (initial: $${balanceInfo.initialBalance?.toFixed(2) || 'N/A'})
- Account P&L: ${balanceInfo.pnlPercent?.toFixed(2) || 0}%

**Positions (${positions.length}):**
${positionsSummary || 'Không có positions'}

**Risk Metrics:**
- Total Exposure: $${context.position?.totalExposure?.toFixed(2) || 'N/A'} (${(totalExposure * 100).toFixed(1)}% of balance)
- Unrealized P&L: ${totalPnL}%
- Portfolio Risk Level: ${riskLevel}

**Alerts:**
${alertsSummary}

**Market Context:**
- ${context.symbol} (${context.timeframe}): $${context.currentPrice}
- Trend: ${context.market?.trend?.toUpperCase() || 'N/A'}
- RSI: ${context.market?.indicators?.rsi?.toFixed(1) || 'N/A'}

${focusedPosition ? `**User đang focus vào: ${focusedPosition.symbol} ${focusedPosition.side}** - Đánh giá risk cho position này chi tiết nhất.\n` : ''}
Hãy đánh giá chi tiết:
1. Mức độ risk tổng thể của portfolio
2. Từng position: risk level, distance to SL, khả năng bị liquidated
3. Correlation risk (các positions cùng hướng, cùng sector?)
4. Exposure ratio so với balance - có quá lớn không?
5. Khuyến nghị cụ thể để giảm risk nếu cần (close position nào, dịch SL nào)
`;
  },

  predict_candle: (context) => {
    const recentCandles = context.market?.recentCandles || [];
    const lastCandle = context.market?.lastCandle;
    const candlePatterns = context.market?.candlePatterns || [];
    const nearestZone = context.zone?.nearestZone;
    const market = context.market || {};
    const patterns = context.pattern?.patterns || [];

    const candlesSummary = recentCandles.slice(-5).map((c, i) =>
      `${i + 1}. ${c.isBullish ? 'BULL' : 'BEAR'} O:${c.open?.toFixed(0)} H:${c.high?.toFixed(0)} L:${c.low?.toFixed(0)} C:${c.close?.toFixed(0)}`
    ).join('\n');

    return `
Dự đoán nến tiếp theo cho ${context.symbol} (${context.timeframe}):
Giá hiện tại: $${context.currentPrice}
Trend: ${market.trend?.toUpperCase() || 'N/A'}
RSI: ${market.indicators?.rsi?.toFixed(1) || 'N/A'}
SMA20: $${market.indicators?.sma20?.toFixed(2) || 'N/A'}
ATR: $${market.indicators?.atr?.toFixed(2) || 'N/A'}
24h Change: ${market.change24h?.toFixed(2) || 'N/A'}%

Last 5 candles (${context.timeframe}):
${candlesSummary || 'Không có dữ liệu'}

Last candle: ${lastCandle?.type || 'N/A'} (${lastCandle?.signal || 'neutral'})
${lastCandle?.bodyPercent ? `Body: ${lastCandle.bodyPercent?.toFixed(1)}% | Wick ratio: ${lastCandle.wickRatio?.toFixed(2) || 'N/A'}` : ''}
Candle patterns detected: ${candlePatterns.map(p => p.type).join(', ') || 'Không có'}
Active chart patterns: ${patterns.map(p => `${p.name} ${p.direction}`).join(', ') || 'Không có'}
Nearest zone: ${nearestZone ? `${nearestZone.type} [${nearestZone.freshness}] at ${nearestZone.distance?.toFixed(1)}% ${nearestZone.position}` : 'N/A'}

Hãy dự đoán nến ${context.timeframe} tiếp theo:
1. **Bullish / Bearish / Doji** - xác suất % cho mỗi khả năng
2. Range dự kiến (High/Low) dựa trên ATR
3. Key levels cần theo dõi (support/resistance gần nhất)
4. Candle pattern nào có thể hình thành?
5. Nếu đang có position, nến tiếp theo ảnh hưởng thế nào?
`;
  },
};

export default {
  PATTERN_KNOWLEDGE,
  ZONE_CONCEPTS,
  CANDLE_PATTERNS,
  TRADING_RULES,
  KNOWN_BUGS,
  ADMIN_AI_SYSTEM_PROMPT,
  QUICK_ACTION_PROMPTS,
};
