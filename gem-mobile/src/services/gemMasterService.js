// src/services/gemMasterService.js
// GEM Master AI Service - WITH QUESTIONNAIRE FLOW + LOCAL KNOWLEDGE BASE + RAG
// GEMRAL AI BRAIN - Updated with RAG integration

import { supabase } from './supabase';
import {
  MONEY_QUESTIONS,
  LOVE_QUESTIONS,
  HEALTH_QUESTIONS,
  CAREER_QUESTIONS,
  FAMILY_QUESTIONS,
  SCENARIOS,
  matchScenario,
  KARMA_TYPES,
  getQuestionsForKarma,
} from '../data/gemMasterKnowledge';
import gemKnowledge from '../data/gemKnowledge.json';
import ragService from './ragService';
import karmaService from './karmaService';
import binanceService from './binanceService';
import { vietnameseNLP } from './nlp';
import { detectIntentEnhanced } from './intentDetector';

// ========== API CONFIG ==========
const API_KEY = 'AIzaSyCymkgeL0ERDYYePtbV4zuL-BZ2mfMxehc';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// RAG Configuration
const USE_RAG = true; // Enable RAG by default
const RAG_FALLBACK_TO_API = true; // Fallback to direct API if RAG fails

console.log('[GEM] API Key exists:', !!API_KEY);
console.log('[GEM] Local Knowledge loaded:', !!gemKnowledge?.faq);
console.log('[GEM] RAG enabled:', USE_RAG);

// ========== REAL-TIME TRADING ANALYSIS ==========

/**
 * Calculate RSI from candle data
 * @param {Array} candles - Array of candle objects with close prices
 * @param {number} period - RSI period (default 14)
 * @returns {number} - RSI value (0-100)
 */
const calculateRSI = (candles, period = 14) => {
  if (!candles || candles.length < period + 1) return null;

  // Get close prices
  const closes = candles.map(c => c.close);

  // Calculate price changes
  const changes = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }

  // Separate gains and losses
  const gains = changes.map(c => c > 0 ? c : 0);
  const losses = changes.map(c => c < 0 ? Math.abs(c) : 0);

  // Calculate initial average gain/loss
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // Calculate smoothed averages for remaining periods
  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }

  // Calculate RS and RSI
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return Math.round(rsi * 100) / 100;
};

/**
 * Find support and resistance zones from candle data
 * @param {Array} candles - Array of candle objects
 * @returns {Object} - { support: [], resistance: [] }
 */
const findSupportResistance = (candles) => {
  if (!candles || candles.length < 20) return { support: [], resistance: [] };

  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const currentPrice = candles[candles.length - 1].close;

  // Find local maxima and minima
  const pivotHighs = [];
  const pivotLows = [];

  for (let i = 2; i < candles.length - 2; i++) {
    // Check if it's a pivot high
    if (highs[i] > highs[i-1] && highs[i] > highs[i-2] &&
        highs[i] > highs[i+1] && highs[i] > highs[i+2]) {
      pivotHighs.push(highs[i]);
    }
    // Check if it's a pivot low
    if (lows[i] < lows[i-1] && lows[i] < lows[i-2] &&
        lows[i] < lows[i+1] && lows[i] < lows[i+2]) {
      pivotLows.push(lows[i]);
    }
  }

  // Sort and get top 3 levels
  const resistance = pivotHighs
    .filter(p => p > currentPrice)
    .sort((a, b) => a - b)
    .slice(0, 3);

  const support = pivotLows
    .filter(p => p < currentPrice)
    .sort((a, b) => b - a)
    .slice(0, 3);

  return { support, resistance };
};

/**
 * Get real-time market data for a coin
 * @param {string} symbol - Trading pair symbol (e.g., 'BTCUSDT')
 * @returns {Object} - Market data object
 */
const getRealTimeMarketData = async (symbol) => {
  try {
    console.log('[GEM] Fetching real-time data for:', symbol);

    // Get 24h ticker data
    const ticker = await binanceService.get24hrTicker(symbol);

    // Get candle data for RSI calculation (1h candles, last 100)
    const candles1h = await binanceService.getCandles(symbol, '1h', 100);

    // Get candle data for 4h timeframe
    const candles4h = await binanceService.getCandles(symbol, '4h', 50);

    // Get daily candles for longer-term analysis
    const candles1d = await binanceService.getCandles(symbol, '1d', 30);

    // Calculate RSI for different timeframes
    const rsi1h = calculateRSI(candles1h);
    const rsi4h = calculateRSI(candles4h);
    const rsi1d = calculateRSI(candles1d);

    // Find support/resistance from daily candles
    const levels = findSupportResistance(candles1d);

    // Determine trend from candles
    let trend = 'SIDEWAY';
    if (candles1d.length >= 3) {
      const recentCloses = candles1d.slice(-3).map(c => c.close);
      if (recentCloses[2] > recentCloses[1] && recentCloses[1] > recentCloses[0]) {
        trend = 'UPTREND';
      } else if (recentCloses[2] < recentCloses[1] && recentCloses[1] < recentCloses[0]) {
        trend = 'DOWNTREND';
      }
    }

    const data = {
      symbol,
      price: parseFloat(ticker?.lastPrice) || 0,
      priceChange24h: parseFloat(ticker?.priceChangePercent) || 0,
      high24h: parseFloat(ticker?.highPrice) || 0,
      low24h: parseFloat(ticker?.lowPrice) || 0,
      volume24h: parseFloat(ticker?.volume) || 0,
      quoteVolume24h: parseFloat(ticker?.quoteVolume) || 0,
      rsi: {
        '1h': rsi1h,
        '4h': rsi4h,
        '1d': rsi1d,
      },
      trend,
      support: levels.support,
      resistance: levels.resistance,
      timestamp: new Date().toISOString(),
    };

    console.log('[GEM] Market data:', JSON.stringify(data).substring(0, 300));
    return data;

  } catch (error) {
    console.error('[GEM] Error fetching market data:', error);
    return null;
  }
};

/**
 * Generate real-time trading analysis using Gemini AI
 * @param {string} queryType - Type of analysis (bitcoin, ethereum, market_trend, long_short)
 * @param {string} userMessage - Original user message
 * @returns {Object} - Analysis result
 */
const generateRealTimeAnalysis = async (queryType, userMessage) => {
  try {
    console.log('[GEM] Generating real-time analysis for:', queryType);

    // Determine which symbols to analyze
    let symbols = [];
    let analysisType = 'single';

    switch (queryType) {
      case 'bitcoin_analysis':
        symbols = ['BTCUSDT'];
        break;
      case 'ethereum_analysis':
        symbols = ['ETHUSDT'];
        break;
      case 'bnb_analysis':
        symbols = ['BNBUSDT'];
        break;
      case 'market_trend_analysis':
      case 'long_short_analysis':
        symbols = ['BTCUSDT', 'ETHUSDT']; // Analyze BTC + ETH for market overview
        analysisType = 'market';
        break;
      default:
        symbols = ['BTCUSDT'];
    }

    // Fetch real-time data for all symbols
    const marketDataPromises = symbols.map(s => getRealTimeMarketData(s));
    const marketDataResults = await Promise.all(marketDataPromises);

    // Filter out failed fetches
    const marketData = marketDataResults.filter(d => d !== null);

    if (marketData.length === 0) {
      throw new Error('Không thể lấy dữ liệu thị trường');
    }

    // Build the AI prompt with real-time data
    let prompt = `Ta là GEM MASTER - Người Bảo Hộ Tỉnh Thức. Trader lão luyện kết hợp Thiền sư bình thản.

**GIỌNG VĂN:** NGẮN GỌN - ĐANH THÉP - CÓ TÍNH GIÁO DỤC. KHÔNG emoji. Xưng "Ta - Bạn".

**DỮ LIỆU THỊ TRƯỜNG REAL-TIME (${new Date().toLocaleString('vi-VN')}):**
`;

    for (const data of marketData) {
      const coinName = data.symbol.replace('USDT', '');
      prompt += `
**${coinName}/USDT:**
- Giá hiện tại: $${data.price.toLocaleString()}
- Thay đổi 24h: ${data.priceChange24h >= 0 ? '+' : ''}${data.priceChange24h.toFixed(2)}%
- Cao 24h: $${data.high24h.toLocaleString()}
- Thấp 24h: $${data.low24h.toLocaleString()}
- Volume 24h: ${(data.quoteVolume24h / 1000000).toFixed(2)}M USDT
- RSI 1H: ${data.rsi['1h'] || 'N/A'} | RSI 4H: ${data.rsi['4h'] || 'N/A'} | RSI Daily: ${data.rsi['1d'] || 'N/A'}
- Xu hướng: ${data.trend}
- Kháng cự gần nhất: ${data.resistance.length > 0 ? '$' + data.resistance[0].toLocaleString() : 'Không xác định'}
- Hỗ trợ gần nhất: ${data.support.length > 0 ? '$' + data.support[0].toLocaleString() : 'Không xác định'}
`;
    }

    prompt += `
**PHƯƠNG PHÁP GEM FREQUENCY:**
- UPU (Up-Pause-Up): Trend tăng tiếp tục
- DPD (Down-Pause-Down): Trend giảm tiếp tục
- DPU (Down-Pause-Up): Đảo chiều tăng
- UPD (Up-Pause-Down): Đảo chiều giảm
- RSI > 70: Overbought - thận trọng LONG
- RSI < 30: Oversold - thận trọng SHORT

**YÊU CẦU PHÂN TÍCH:**
${userMessage}

**HƯỚNG DẪN TRẢ LỜI:**
1. Phân tích dựa trên dữ liệu REAL-TIME - chỉ số liệu cụ thể
2. Đưa ra nhận định xu hướng một cách đanh thép
3. Chỉ ra các vùng giá quan trọng (kháng cự/hỗ trợ)
4. Đề xuất chiến lược: LONG/SHORT/SIDEWAY với lý do rõ ràng
5. Nhắc về kỷ luật: SL 2-3%, không FOMO, không revenge trade
6. Kết thúc bằng câu triết lý hoặc cảnh báo uy nghiêm
7. KHÔNG emoji - KHÔNG ngôn ngữ lùa gà - Xưng "Ta - Bạn"

**VÍ DỤ GIỌNG VĂN:**
- "RSI đang ở vùng quá mua. Nếu bạn vào lệnh lúc này, đó là FOMO, không phải trading."
- "Thị trường đang sideway. Người kiên nhẫn sẽ thắng. Kẻ nôn nóng sẽ mất tiền."

**TRẢ LỜI (ngắn gọn, đanh thép, có số liệu từ data real-time):**`;

    console.log('[GEM] Calling AI for real-time analysis...');

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[GEM] AI API Error:', err);
      throw new Error(`API ${res.status}`);
    }

    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Không nhận được phản hồi từ AI');
    }

    console.log('[GEM] Real-time analysis generated successfully');

    return {
      text,
      marketData: marketData[0], // Return primary coin's data
      source: 'realtime_analysis',
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error('[GEM] Error generating real-time analysis:', error);

    // Return fallback response with error message
    return {
      text: `⚠️ Không thể lấy dữ liệu thị trường real-time lúc này.\n\n**Gợi ý:** Vui lòng thử lại sau hoặc sử dụng **GEM Scanner** trong tab Giao Dịch để xem phân tích kỹ thuật chi tiết với signals real-time.\n\n📱 Vào **Giao Dịch > Scanner** để phân tích coin!`,
      source: 'realtime_analysis_error',
      error: error.message,
    };
  }
};

/**
 * Trading FAQ keys that require real-time analysis
 */
const REALTIME_ANALYSIS_FAQS = [
  'bitcoin_analysis',
  'ethereum_analysis',
  'bnb_analysis',
  'market_trend_analysis',
  'long_short_analysis',
];

// ========== CONVERSATION STATE ==========
let conversationState = {
  mode: 'chat', // 'chat' | 'questionnaire'
  karmaType: null, // 'money' | 'love' | 'health' | 'career' | 'family'
  currentQuestionIndex: 0,
  answers: [],
  analysisComplete: false,
};

let messageCount = 0;

// ========== DETECT KARMA INTENT ==========
// IMPORTANT: Only trigger questionnaire when user EXPLICITLY REQUESTS karma analysis
// Do NOT trigger for questions ABOUT karma - those should use FAQ knowledge
const detectKarmaIntent = (message) => {
  const m = message.toLowerCase();

  // Skip if user is asking about manifest, hướng dẫn, giới thiệu - these are NOT karma analysis
  const skipKeywords = ['manifest', 'hướng dẫn', 'giới thiệu', 'dạy', 'học', 'cách', 'làm sao', 'làm thế nào', 'khóa học', 'course'];
  if (skipKeywords.some(kw => m.includes(kw))) {
    console.log('[GEM] Skip karma detection - manifest/guide request detected');
    return null;
  }

  // CRITICAL: Skip if user is ASKING A QUESTION about karma (not requesting analysis)
  // These should be answered with FAQ knowledge, not start a questionnaire
  const questionIndicators = [
    'có phải', 'là gì', 'tại sao', 'vì sao', 'như thế nào', 'thế nào',
    'có phải là', 'có phải không', 'phải không', 'đúng không',
    'giải thích', 'cho hỏi', 'hỏi', 'muốn biết', 'muốn hỏi',
    'lo lắng', 'lo âu', 'cảm thấy', 'không hiểu'
  ];
  if (questionIndicators.some(q => m.includes(q))) {
    console.log('[GEM] Skip karma questionnaire - user is asking a QUESTION about karma, not requesting analysis');
    return null;
  }

  // Only trigger questionnaire when user EXPLICITLY requests karma analysis
  // Must include action words: phân tích, khám phá, xem, đo, kiểm tra, tìm hiểu + nghiệp
  const analysisKeywords = ['phân tích', 'khám phá', 'xem', 'đo', 'kiểm tra', 'tìm hiểu', 'của tôi', 'của mình', 'giúp tôi'];
  const hasAnalysisRequest = analysisKeywords.some(kw => m.includes(kw));

  if (!hasAnalysisRequest) {
    console.log('[GEM] Skip karma questionnaire - no explicit analysis request');
    return null;
  }

  // Now check for specific karma types with analysis request
  // Money karma - must mention "nghiệp tiền" or "nghiệp tài chính"
  if (m.includes('nghiệp tiền') || m.includes('nghiệp tài chính') || (m.includes('nghiệp') && (m.includes('tiền') || m.includes('tài')))) {
    return 'money';
  }
  // Love karma - must mention "nghiệp tình" or "nghiệp duyên"
  if (m.includes('nghiệp tình') || m.includes('nghiệp duyên') || (m.includes('nghiệp') && (m.includes('tình') || m.includes('yêu')))) {
    return 'love';
  }
  // Health karma - must mention "nghiệp sức khỏe" or "nghiệp bệnh"
  if (m.includes('nghiệp sức khỏe') || m.includes('nghiệp bệnh') || (m.includes('nghiệp') && m.includes('khỏe'))) {
    return 'health';
  }
  // Career karma - must mention "nghiệp sự nghiệp" or "nghiệp công việc"
  if (m.includes('nghiệp sự nghiệp') || m.includes('nghiệp công việc') || (m.includes('nghiệp') && (m.includes('nghiệp') || m.includes('việc')))) {
    return 'career';
  }
  // Family karma - must mention "nghiệp gia đình"
  if (m.includes('nghiệp gia đình') || (m.includes('nghiệp') && m.includes('gia đình'))) {
    return 'family';
  }
  // Frequency analysis - explicit request
  if ((m.includes('phân tích') || m.includes('đo')) && (m.includes('tần số') || m.includes('năng lượng') || m.includes('hawkins'))) {
    return 'frequency';
  }

  return null;
};

// ========== GET QUESTIONS FOR KARMA TYPE ==========
const getQuestions = (karmaType) => {
  switch (karmaType) {
    case 'money':
      return MONEY_QUESTIONS;
    case 'love':
      return LOVE_QUESTIONS;
    case 'health':
      return HEALTH_QUESTIONS;
    case 'career':
      return CAREER_QUESTIONS;
    case 'family':
      return FAMILY_QUESTIONS;
    default:
      return [];
  }
};

// ========== FORMAT QUESTION FOR USER ==========
// Returns { text, options } for interactive button rendering
const formatQuestion = (question, index, total) => {
  let text = `📋 **Câu hỏi ${index + 1}/${total}**\n\n`;
  text += `${question.question}`;

  // Return both text AND options array for interactive buttons
  // Options will be rendered as buttons in MessageBubble
  const formattedOptions = question.options.map((opt, i) => ({
    id: opt.id || String.fromCharCode(97 + i), // a, b, c, d...
    label: String.fromCharCode(65 + i), // A, B, C, D...
    text: opt.text,
    score: opt.score,
  }));

  return {
    text,
    options: formattedOptions,
    questionId: question.id,
    questionIndex: index,
    totalQuestions: total,
  };
};

// ========== PARSE USER ANSWER ==========
const parseAnswer = (message, question) => {
  const m = message.trim().toUpperCase();

  // Check if answer is a letter
  const letterMatch = m.match(/^[A-Z]$/);
  if (letterMatch) {
    const index = letterMatch[0].charCodeAt(0) - 65;
    if (index >= 0 && index < question.options.length) {
      return question.options[index];
    }
  }

  // Check if answer contains option text
  for (const opt of question.options) {
    if (message.toLowerCase().includes(opt.text.toLowerCase().slice(0, 20))) {
      return opt;
    }
  }

  return null;
};

// ========== FORMAT ANALYSIS RESULT ==========
const formatAnalysisResult = (result) => {
  const { scenario, frequency, dominantEmotions } = result;

  if (!scenario) {
    return `Tôi chưa thể phân tích chính xác. Bạn có thể chia sẻ thêm về tình huống cụ thể không?`;
  }

  let text = `🔮 **KẾT QUẢ PHÂN TÍCH**\n\n`;

  // Frequency
  text += `📊 **Tần số hiện tại:** ${frequency} Hz\n`;
  text += `${scenario.frequencyName}\n\n`;

  // Karma Type
  text += `🔴 **${scenario.title}**\n`;
  text += `${scenario.description}\n\n`;

  // Root Cause
  text += `📍 **Nguyên nhân gốc:**\n`;
  text += `${scenario.rootCause}\n\n`;

  // Healing
  text += `✨ **Bài tập chữa lành:**\n`;
  scenario.healing.forEach((step, i) => {
    text += `${i + 1}. ${step}\n`;
  });

  // Affirmations (NEW)
  if (scenario.affirmations && scenario.affirmations.length > 0) {
    text += `\n💫 **Câu khẳng định:**\n`;
    scenario.affirmations.forEach((aff, i) => {
      text += `• "${aff}"\n`;
    });
  }

  // Action Steps (NEW)
  if (scenario.actionSteps && scenario.actionSteps.length > 0) {
    text += `\n📋 **Kế hoạch hành động:**\n`;
    scenario.actionSteps.forEach((step, i) => {
      text += `${i + 1}. ${step}\n`;
    });
  }

  // Rituals (NEW)
  if (scenario.rituals && scenario.rituals.length > 0) {
    text += `\n🕯️ **Nghi thức chuyển hóa:**\n`;
    scenario.rituals.forEach((ritual, i) => {
      text += `• ${ritual}\n`;
    });
  }

  // Crystal
  text += `\n💎 **Đá phù hợp:** ${scenario.crystal}\n`;

  // Follow-up
  text += `\n🤔 Bạn có muốn tôi hướng dẫn chi tiết về bài tập hoặc nghi thức nào không?`;

  return text;
};

// ========== WIDGET SUGGESTIONS ==========
export const WIDGET_SUGGESTIONS = {
  money: {
    type: 'affirmation',
    title: 'Widget Affirmation Tiền Bạc',
    icon: '💰',
    affirmations: [
      'Tiền đến với tôi dễ dàng và dồi dào',
      'Tôi là nam châm thu hút tài lộc',
      'Mọi việc tôi làm đều sinh ra tiền',
    ],
    explanation: 'Widget nhắc đọc affirmation tiền bạc mỗi ngày.',
  },
  love: {
    type: 'affirmation',
    title: 'Widget Chữa Lành Tình Yêu',
    icon: '💕',
    affirmations: [
      'Tôi yêu thương và chấp nhận bản thân',
      'Tôi xứng đáng có tình yêu đích thực',
      'Tim tôi rộng mở để yêu và được yêu',
    ],
    explanation: 'Widget giúp yêu thương bản thân mỗi ngày.',
  },
  health: {
    type: 'affirmation',
    title: 'Widget Sức Khỏe',
    icon: '🏥',
    affirmations: [
      'Cơ thể tôi là đền thờ linh thiêng',
      'Tôi lắng nghe và yêu thương cơ thể mình',
      'Mỗi ngày tôi càng khỏe mạnh hơn',
    ],
    explanation: 'Widget nhắc chăm sóc sức khỏe mỗi ngày.',
  },
  career: {
    type: 'affirmation',
    title: 'Widget Sự Nghiệp',
    icon: '💼',
    affirmations: [
      'Tôi xứng đáng với mọi thành công',
      'Tôi đang sống đúng purpose của mình',
      'Công việc mang lại niềm vui và ý nghĩa',
    ],
    explanation: 'Widget nhắc về sự nghiệp mỗi ngày.',
  },
  family: {
    type: 'affirmation',
    title: 'Widget Gia Đình',
    icon: '👨‍👩‍👧‍👦',
    affirmations: [
      'Tôi yêu gia đình VÀ yêu bản thân',
      'Tôi đặt boundaries lành mạnh với gia đình',
      'Tôi tự hào là người tôi đang trở thành',
    ],
    explanation: 'Widget về mối quan hệ gia đình.',
  },
  frequency: {
    type: 'exercise',
    title: 'Widget Nâng Tần Số',
    icon: '🔮',
    exercises: ['Thiền 5 phút mỗi sáng', 'Viết gratitude journal'],
    explanation: 'Widget nhắc nâng tần số mỗi ngày.',
  },
  karma: {
    type: 'exercise',
    title: 'Widget Chuyển Hóa Nghiệp',
    icon: '🔄',
    exercises: ['Viết 10 niềm tin tiêu cực', 'Viết thư tha thứ'],
    explanation: 'Widget nhắc làm bài tập chuyển hóa.',
  },
};

// ========== COURSE RECOMMENDATIONS ==========
export const COURSE_RECOMMENDATIONS = {
  money: {
    id: 'course_money',
    title: 'Manifest Tiền Bạc - Tư Duy Triệu Phú',
    subtitle: '30 ngày thay đổi Money Mindset',
    price: '499K',
    icon: '💰',
    benefits: ['Công thức hiện hóa tài chính', 'Phá vỡ block tiền bạc'],
    url: 'courses',
  },
  love: {
    id: 'course_love',
    title: 'Kích Hoạt Tần Số Tình Yêu',
    subtitle: '21 ngày thu hút tình yêu',
    price: '399K',
    icon: '💖',
    benefits: ['Chữa lành trauma tình cảm', 'Mở khóa Heart Chakra'],
    url: 'courses',
  },
  frequency: {
    id: 'course_frequency',
    title: 'Khóa 7 Ngày Khai Mở Tần Số Gốc',
    subtitle: 'Chuyển hóa năng lượng cốt lõi',
    price: '1.997K',
    icon: '🌟',
    benefits: ['Nâng cao tần số toàn diện', 'Kết nối với Higher Self'],
    url: 'courses',
  },
  health: {
    id: 'course_frequency',
    title: 'Khóa 7 Ngày Khai Mở Tần Số Gốc',
    subtitle: 'Chuyển hóa năng lượng cốt lõi',
    price: '1.997K',
    icon: '🌟',
    benefits: ['Nâng cao tần số toàn diện', 'Kết nối với Higher Self'],
    url: 'courses',
  },
  career: {
    id: 'course_frequency',
    title: 'Khóa 7 Ngày Khai Mở Tần Số Gốc',
    subtitle: 'Chuyển hóa năng lượng cốt lõi',
    price: '1.997K',
    icon: '🌟',
    benefits: ['Nâng cao tần số toàn diện', 'Kết nối với Higher Self'],
    url: 'courses',
  },
  family: {
    id: 'course_frequency',
    title: 'Khóa 7 Ngày Khai Mở Tần Số Gốc',
    subtitle: 'Chuyển hóa năng lượng cốt lõi',
    price: '1.997K',
    icon: '🌟',
    benefits: ['Nâng cao tần số toàn diện', 'Kết nối với Higher Self'],
    url: 'courses',
  },
  general: {
    id: 'course_frequency',
    title: 'Khóa 7 Ngày Khai Mở Tần Số Gốc',
    subtitle: 'Chuyển hóa năng lượng cốt lõi',
    price: '1.997K',
    icon: '🌟',
    benefits: ['Nâng cao tần số toàn diện', 'Kết nối với Higher Self'],
    url: 'courses',
  },
  trading: {
    id: 'course_frequency',
    title: 'Khóa 7 Ngày Khai Mở Tần Số Gốc',
    subtitle: 'Chuyển hóa năng lượng cốt lõi',
    price: '1.997K',
    icon: '🌟',
    benefits: ['Nâng cao tần số toàn diện', 'Kết nối với Higher Self'],
    url: 'courses',
  },
};

// ========== AFFILIATE PROMO ==========
export const AFFILIATE_PROMO = {
  title: 'Cơ hội Cộng tác viên Gemral',
  description: 'Kiếm thu nhập thụ động với hoa hồng lên đến 30%!',
  tiers: [
    { name: 'Affiliate', commission: '3%' },
    { name: 'CTV Bronze', commission: '10%' },
    { name: 'CTV Silver', commission: '20%' },
    { name: 'CTV Gold', commission: '30%' },
  ],
  cta: 'Đăng ký làm CTV ngay',
  url: 'https://gemral.com/affiliate',
};

// ========== TOPIC KEYWORDS ==========
const TOPIC_KEYWORDS = {
  money: ['tiền', 'nghiệp tiền', 'tài chính', 'giàu', 'nghèo', 'nợ', 'thu nhập', 'kiếm tiền', 'manifest', 'tài lộc'],
  love: ['tình yêu', 'nghiệp tình', 'người yêu', 'sai người', 'chia tay', 'cô đơn', 'hẹn hò', 'crush'],
  health: ['sức khỏe', 'stress', 'kiệt sức', 'bệnh', 'mệt mỏi', 'ngủ'],
  career: ['công việc', 'sự nghiệp', 'burnout', 'imposter', 'thành công'],
  family: ['gia đình', 'bố mẹ', 'cha mẹ', 'con cái'],
  frequency: ['tần số', 'năng lượng', 'hawkins', 'hz'],
  karma: ['nghiệp', 'karma', 'tiền kiếp'],
  crystal: ['đá', 'crystal', 'thạch anh'],
  trading: ['trading', 'crypto', 'bitcoin', 'scanner'],
  affiliate: ['kiếm thêm', 'thu nhập thụ động', 'cộng tác', 'affiliate', 'ctv', 'hoa hồng'],
};

const detectTopics = (msg) => {
  const m = msg.toLowerCase();
  const topics = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(kw => m.includes(kw))) topics.push(topic);
  }
  return topics.length > 0 ? topics : ['general'];
};

// ========== LOCAL KNOWLEDGE LOOKUP ==========
const MATCH_THRESHOLD = 0.5; // Minimum confidence to use local answer (lowered for better matching)

/**
 * Check if message matches any FAQ in local knowledge base
 * Returns { matched: true, faqKey, answer, confidence } or { matched: false }
 */
const matchLocalKnowledge = (message) => {
  if (!gemKnowledge?.faq) {
    console.log('[GEM] No local FAQ found');
    return { matched: false };
  }

  const m = message.toLowerCase().trim();
  let bestMatch = { matched: false, confidence: 0, matchCount: 0 };

  // Check each FAQ category
  for (const [faqKey, faqData] of Object.entries(gemKnowledge.faq)) {
    if (!faqData.keywords || !faqData.answers) continue;

    // Count how many keywords match
    let matchCount = 0;
    const matchedKeywords = [];

    for (const keyword of faqData.keywords) {
      if (m.includes(keyword.toLowerCase())) {
        matchCount++;
        matchedKeywords.push(keyword);
      }
    }

    // Calculate confidence - use minimum of 3 keywords required for good match
    // If matchCount >= 3, confidence is high
    // If matchCount >= 2 and includes primary keyword (first 5), confidence is medium
    let confidence = 0;
    if (matchCount >= 3) {
      confidence = 0.9; // High confidence
    } else if (matchCount >= 2) {
      confidence = 0.7; // Medium confidence
    } else if (matchCount === 1) {
      confidence = 0.4; // Low confidence
    }

    // Boost confidence if matched keyword is in first 5 (primary keywords)
    const primaryKeywords = faqData.keywords.slice(0, 5);
    const hasPrimaryMatch = matchedKeywords.some(kw => primaryKeywords.includes(kw));
    if (hasPrimaryMatch && matchCount >= 2) {
      confidence = Math.max(confidence, 0.8);
    }

    if (matchCount > bestMatch.matchCount || (matchCount === bestMatch.matchCount && confidence > bestMatch.confidence)) {
      bestMatch = {
        matched: true,
        faqKey,
        answer: faqData.answers[Math.floor(Math.random() * faqData.answers.length)],
        confidence: Math.min(confidence, faqData.confidence || 0.9),
        matchCount,
        matchedKeywords,
        searchTags: faqData.searchTags || [],
        quickActions: faqData.quickActions || [],
      };
    }
  }

  console.log('[GEM] Local match result:', bestMatch.matched ? `${bestMatch.faqKey} (${(bestMatch.confidence * 100).toFixed(0)}%, ${bestMatch.matchCount} keywords: ${bestMatch.matchedKeywords?.join(', ')})` : 'No match');

  // Only return if confidence meets threshold
  if (bestMatch.matched && bestMatch.confidence >= MATCH_THRESHOLD) {
    return bestMatch;
  }

  return { matched: false };
};

/**
 * Get knowledge content by key (philosophy, hawkins_scale, etc.)
 */
const getKnowledgeContent = (key) => {
  return gemKnowledge?.knowledge?.[key] || null;
};

/**
 * Knowledge topics mapping - keywords to knowledge keys
 */
const KNOWLEDGE_KEYWORDS = {
  financial_karma: [
    'nghiệp tài chính', 'nghiệp tiền', 'nghiệp tiền bạc', 'karma tiền',
    'chủng tử nghiệp', 'chủng tử', 'hạt giống nghiệp',
    'tần số khan hiếm', 'khan hiếm di truyền', 'di truyền tài chính',
    'lo lắng về tiền dù', 'lo tiền dù thu nhập', 'thu nhập ổn định nhưng lo',
    'niềm tin tiền bạc từ nhỏ', 'niềm tin từ gia đình', 'thế hệ trước',
    'pattern tiền bạc', 'không bao giờ đủ dù có', 'cảm giác thiếu dù đủ',
    'chuyển hóa nghiệp tiền', '4 bước chuyển hóa',
  ],
  karma_transformation: [
    'chuyển hóa nghiệp', 'quy trình chuyển hóa', 'cách chuyển hóa',
    'giải nghiệp', 'release karma', 'phá vỡ pattern',
    'nhận biết pattern', 'hiểu nguồn gốc', 'giải phóng', 'tái lập trình',
    'niềm tin vô thức', 'pattern lặp lại', 'dấu ấn cảm xúc',
    'inherited frequencies', 'tần số thừa kế',
    'inner child', 'đứa trẻ bên trong', 'tuổi thơ',
    'tha thứ', 'release', 'reprogram', 'affirmation 21 ngày',
  ],
  generational_patterns: [
    'pattern thế hệ', 'niềm tin di truyền', 'di truyền từ cha mẹ',
    'ông bà', 'thế hệ trước', 'câu chuyện gia đình',
    'nhà mình đời đời', 'từ nhỏ đã nghe', 'cha mẹ hay nói',
    'thừa kế niềm tin', 'không phải của tôi',
    'phá vỡ pattern gia đình', 'người đầu tiên trong gia đình',
    'viết câu chuyện mới', 'thoát khỏi pattern cũ',
  ],
  hawkins_scale: [
    'thang hawkins', 'thang đo hawkins', 'hawkins scale', 'tần số hawkins',
    'bao nhiêu hz', 'mức hz', 'hz là gì', 'tần số là gì',
    '20hz', '100hz', '200hz', '500hz', '700hz',
    'shame', 'guilt', 'apathy', 'grief', 'fear', 'desire', 'anger', 'pride',
    'courage', 'neutrality', 'willingness', 'acceptance', 'reason', 'love', 'joy', 'peace', 'enlightenment',
    'xấu hổ', 'tội lỗi', 'thờ ơ', 'đau khổ', 'sợ hãi', 'tức giận', 'kiêu ngạo',
    'can đảm', 'chấp nhận', 'bình an', 'giác ngộ',
    'các mức tần số', 'tần số thấp', 'tần số cao', 'điểm chuyển hóa',
  ],
  mindset_errors: [
    'lỗi tâm thức', '7 lỗi', 'bảy lỗi', 'mindset error', 'tâm thức sai',
    'siết chặt dòng chảy', 'money block', 'block tiền',
    'tư duy thiếu hụt', 'scarcity mindset', 'thiếu hụt',
    'nạn nhân tâm lý', 'victim mentality', 'đổ lỗi',
    'sợ thành công', 'fear of success', 'tự sabotage',
    'tê liệt hoàn hảo', 'perfectionism', 'cầu toàn',
    'vòng lặp thiếu thốn', 'scarcity loop',
    'mất kết nối', 'disconnection', 'cô đơn tâm linh',
    'niềm tin gốc', 'niềm tin sai', 'belief system',
  ],
  healing_exercises: [
    'bài tập', 'bài tập chữa lành', 'exercise', 'healing exercise',
    'chi tiền trong hạnh phúc', 'chi tiền hạnh phúc',
    'gương soi', 'gương soi yêu thương', 'mirror work',
    'thiền higher self', 'thiền kết nối', 'kết nối higher self',
    'nhật ký biết ơn', 'gratitude journal', 'biết ơn',
    'nhật ký trách nhiệm', 'responsibility journal',
    'thực hành', 'practice', 'làm bài tập', '21 ngày',
  ],
  affirmations_library: [
    'affirmation', 'affirmations', 'khẳng định', 'câu khẳng định',
    'lời khẳng định', 'positive affirmation',
    'tiền bạc affirmation', 'tình yêu affirmation',
    'sức khỏe affirmation', 'sự nghiệp affirmation',
    'câu nói tích cực', 'lời nói tích cực',
    'tôi là nam châm', 'tiền đến với tôi',
  ],
  crystal_chakra_mapping: [
    'chakra', 'luân xa', '7 chakra', 'bảy luân xa',
    'crown chakra', 'third eye', 'throat chakra', 'heart chakra',
    'solar plexus', 'sacral chakra', 'root chakra',
    'đỉnh đầu', 'con mắt thứ 3', 'cổ họng', 'tim', 'búi mặt trời', 'bụng dưới', 'gốc',
    'đá nào cho chakra', 'chakra nào', 'luân xa nào',
    '963hz', '852hz', '741hz', '639hz', '528hz', '417hz', '396hz',
  ],
  philosophy: [
    'triết lý', 'philosophy', 'học thuyết', 'yinyang masters',
    'luật hấp dẫn', 'law of attraction', 'manifestation',
    'năng lượng rung động', 'vũ trụ', 'universe',
    'jennie uyen chu', 'founder', 'người sáng lập',
  ],
  frequency_formulas: [
    '11 công thức', 'công thức frequency', '6 công thức core',
    'dpd là gì', 'upu là gì', 'upd là gì', 'dpu là gì',
    'hfz là gì', 'lfz là gì',
    'giải thích dpd', 'giải thích upu', 'giải thích upd', 'giải thích dpu',
    'down pause down', 'up pause up', 'up pause down', 'down pause up',
    'high frequency zone', 'low frequency zone',
    'công thức độc quyền', 'nghiên cứu gem', 'gem academy',
  ],
};

/**
 * Match message to knowledge content
 * Returns { matched: true, key, content } or { matched: false }
 */
const matchKnowledge = (message) => {
  if (!gemKnowledge?.knowledge) {
    return { matched: false };
  }

  const m = message.toLowerCase().trim();
  let bestMatch = { matched: false, score: 0 };

  for (const [key, keywords] of Object.entries(KNOWLEDGE_KEYWORDS)) {
    let matchCount = 0;

    for (const keyword of keywords) {
      if (m.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    if (matchCount > bestMatch.score) {
      const content = getKnowledgeContent(key);
      if (content) {
        bestMatch = {
          matched: true,
          key,
          content,
          score: matchCount,
        };
      }
    }
  }

  console.log('[GEM] Knowledge match:', bestMatch.matched ? `${bestMatch.key} (score: ${bestMatch.score})` : 'No match');

  return bestMatch.score >= 1 ? bestMatch : { matched: false };
};

// ========== HELPER FUNCTIONS ==========
const getWidgetSuggestion = (scenario) => {
  if (!scenario) return null;

  return {
    type: 'affirmation',
    title: `Widget ${scenario.title}`,
    icon: KARMA_TYPES[scenario.type]?.icon || '✨',
    affirmations: scenario.healing.filter(h => h.includes('Affirmation')),
    explanation: `Widget nhắc bạn thực hành chữa lành ${scenario.frequencyName} mỗi ngày.`,
  };
};

const getCourseRecommendation = (scenario) => {
  if (!scenario?.course) return null;

  const courses = {
    course_money: COURSE_RECOMMENDATIONS.money,
    course_love: COURSE_RECOMMENDATIONS.love,
    course_frequency: COURSE_RECOMMENDATIONS.frequency,
    course_health: COURSE_RECOMMENDATIONS.health,
    course_career: COURSE_RECOMMENDATIONS.career,
    course_family: COURSE_RECOMMENDATIONS.family,
  };

  return courses[scenario.course] || null;
};

// ========== MAIN PROCESS FUNCTION ==========
export const processMessage = async (userMessage, history = []) => {
  console.log('[GEM] === START ===');
  console.log('[GEM] Message:', userMessage);
  console.log('[GEM] State:', conversationState);
  messageCount++;

  // ========== NLP PREPROCESSING ==========
  // Chuẩn hóa text tiếng Việt và detect intent
  const nlpResult = vietnameseNLP.process(userMessage);
  const intentResult = detectIntentEnhanced(userMessage);

  console.log('[GEM] NLP Result:', {
    original: nlpResult.original,
    normalized: nlpResult.normalized,
    keywords: nlpResult.keywords,
    entities: nlpResult.entities,
  });
  console.log('[GEM] Intent:', intentResult.intent, 'Confidence:', intentResult.confidence);

  // Dùng normalized text cho xử lý (giảm token usage ~30%)
  const cleanMessage = nlpResult.normalized || userMessage;

  // Extract useful info từ entities
  const userLocation = nlpResult.entities.find(e => e.label === 'LOCATION')?.value;
  const userBudget = nlpResult.entities.find(e => e.label === 'MONEY')?.value;
  const userQuantity = nlpResult.entities.find(e => e.label === 'QUANTITY')?.value;

  try {
    // ========== MODE: QUESTIONNAIRE ==========
    if (conversationState.mode === 'questionnaire') {
      // CRITICAL: Check if user is asking a NEW QUESTION instead of answering the quiz
      // If so, reset questionnaire and process as normal chat
      const newQuestionIndicators = [
        'tại sao', 'vì sao', 'là gì', 'như thế nào', 'thế nào',
        'cho hỏi', 'muốn hỏi', 'giải thích', 'hướng dẫn',
        'giúp tôi', 'làm sao', 'làm thế nào', 'cách nào',
        'có phải', 'đúng không', 'phải không',
        'block tiền', 'bị block', 'bị chặn', 'không vào tiền',
        'manifest', 'khóa học', 'course', 'mua đá', 'tìm đá',
        // NEW: Detect karma analysis requests during questionnaire
        'phân tích nghiệp', 'nghiệp tình', 'nghiệp tiền', 'nghiệp sức khỏe',
        'nghiệp sự nghiệp', 'nghiệp gia đình', 'nghiệp của tôi', 'nghiệp của mình',
        'xem nghiệp', 'khám phá nghiệp', 'tần số năng lượng',
      ];
      const lowerMsg = userMessage.toLowerCase();
      const isNewQuestion = newQuestionIndicators.some(indicator => lowerMsg.includes(indicator));

      // Check if user is requesting a DIFFERENT karma type than current questionnaire
      const isDifferentKarmaRequest = (
        (lowerMsg.includes('tình') && conversationState.karmaType !== 'love') ||
        (lowerMsg.includes('tiền') && conversationState.karmaType !== 'money') ||
        (lowerMsg.includes('sức khỏe') && conversationState.karmaType !== 'health') ||
        (lowerMsg.includes('sự nghiệp') && conversationState.karmaType !== 'career') ||
        (lowerMsg.includes('gia đình') && conversationState.karmaType !== 'family')
      ) && lowerMsg.includes('nghiệp');

      // If message is too long (> 20 chars) and not a simple letter/option answer, likely a new question
      const isLongMessage = userMessage.trim().length > 20;
      const isSimpleAnswer = /^[A-Ea-e]\.?$/.test(userMessage.trim()) ||
                            /^(lo lắng|tức giận|tội lỗi|bình thường|hào hứng)/i.test(userMessage.trim().toLowerCase());
      const isNotSimpleAnswer = !isSimpleAnswer;

      if (isNewQuestion || isDifferentKarmaRequest || (isLongMessage && isNotSimpleAnswer)) {
        console.log('[GEM] User asked NEW QUESTION during questionnaire, resetting state...');
        // Reset questionnaire state
        conversationState = {
          mode: 'chat',
          karmaType: null,
          currentQuestionIndex: 0,
          answers: [],
          analysisComplete: false,
        };
        // Continue to normal chat processing below (don't return here)
      } else {
        // Normal questionnaire answer processing
        const questions = getQuestions(conversationState.karmaType);
        const currentQ = questions[conversationState.currentQuestionIndex];

        // Parse answer
        const answer = parseAnswer(userMessage, currentQ);

        if (!answer) {
          // Return question with interactive options
          const formattedQ = formatQuestion(currentQ, conversationState.currentQuestionIndex, questions.length);
          return {
            text: `Tôi không hiểu câu trả lời. Vui lòng chọn một trong các đáp án:`,
            mode: 'questionnaire',
            // Pass options for interactive button rendering
            options: formattedQ.options,
            questionId: formattedQ.questionId,
            questionIndex: formattedQ.questionIndex,
            totalQuestions: formattedQ.totalQuestions,
            isQuestionMessage: true,
          };
        }

        // Save answer
        conversationState.answers.push(answer);
        conversationState.currentQuestionIndex++;

        // Check if more questions
        if (conversationState.currentQuestionIndex < questions.length) {
          const nextQ = questions[conversationState.currentQuestionIndex];
          const formattedQ = formatQuestion(nextQ, conversationState.currentQuestionIndex, questions.length);
          return {
            text: `Cảm ơn bạn! ✨\n\n${formattedQ.text}`,
            mode: 'questionnaire',
            // Pass options for interactive button rendering
            options: formattedQ.options,
            questionId: formattedQ.questionId,
            questionIndex: formattedQ.questionIndex,
            totalQuestions: formattedQ.totalQuestions,
            isQuestionMessage: true,
          };
        }

        // Analysis complete - Match scenario
        const result = matchScenario(conversationState.answers, conversationState.karmaType);

        // Reset state
        const karmaType = conversationState.karmaType;
        conversationState = {
          mode: 'chat',
          karmaType: null,
          currentQuestionIndex: 0,
          answers: [],
          analysisComplete: true,
        };

        // ========== SAVE KARMA DATA TO DATABASE ==========
        // Get current user and save karma analysis result
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.id) {
            console.log('[GEM] Saving karma analysis for user:', user.id, 'type:', karmaType);

            // Update karma based on analysis result
            // Karma points based on scenario severity (lower frequency = lower karma)
            let karmaChange = 0;
            if (result.frequency) {
              if (result.frequency < 100) karmaChange = -10;
              else if (result.frequency < 200) karmaChange = -5;
              else if (result.frequency < 300) karmaChange = 5;
              else if (result.frequency < 500) karmaChange = 10;
              else karmaChange = 15;
            }

            // Save karma update
            const karmaResult = await karmaService.updateKarma(
              user.id,
              karmaChange,
              `karma_analysis_${karmaType}`,
              {
                actionDetail: `Phân tích ${KARMA_TYPES[karmaType]?.name || 'nghiệp'} - ${result.scenario?.title || 'Đã phân tích'}`,
                frequency: result.frequency,
                scenarioId: result.scenario?.id,
              }
            );
            console.log('[GEM] Karma saved:', karmaResult?.success ? 'success' : 'failed');

            // Log AI interaction for tracking
            try {
              await supabase.from('ai_master_interactions').insert({
                user_id: user.id,
                scenario_type: `karma_${karmaType}`,
                ai_message: formatAnalysisResult(result).substring(0, 500),
                ai_mood: result.frequency < 200 ? 'warning' : 'calm',
                karma_change: karmaChange,
                trigger_conditions: {
                  karmaType,
                  frequency: result.frequency,
                  scenario: result.scenario?.id,
                  answersCount: result.answers?.length,
                },
              });
            } catch (logError) {
              console.warn('[GEM] Failed to log AI interaction:', logError?.message);
            }
          }
        } catch (saveError) {
          console.error('[GEM] Failed to save karma data:', saveError);
          // Continue even if save fails - still return the analysis
        }
        // ========== END SAVE KARMA ==========

        return {
          text: formatAnalysisResult(result),
          scenario: result.scenario,
          frequency: result.frequency,
          topics: [karmaType],
          // NEW: Include affirmations, actionSteps, and rituals for VisionBoard goal cards
          affirmations: result.scenario?.affirmations || [],
          actionSteps: result.scenario?.actionSteps || [],
          rituals: result.scenario?.rituals || [],
          widgetSuggestion: getWidgetSuggestion(result.scenario) || WIDGET_SUGGESTIONS[karmaType],
          courseRecommendation: getCourseRecommendation(result.scenario) || COURSE_RECOMMENDATIONS[karmaType],
          showCrystals: true,
          crystalTags: [result.scenario?.crystal?.toLowerCase().replace(/\s+/g, '-') || 'crystal'],
        };
      } // End of else block (normal questionnaire processing)
    } // End of if (conversationState.mode === 'questionnaire')

    // ========== MODE: CHAT ==========

    const isFirst = history.length === 0;
    const topics = detectTopics(userMessage);
    console.log('[GEM] Topics:', topics, 'IsFirst:', isFirst);

    // ========== STEP 1: CHECK KARMA INTENT FOR QUESTIONNAIRE (PRIORITY) ==========
    // IMPORTANT: Check karma questionnaire FIRST before local knowledge
    // This ensures "nghiệp tiền của tôi là gì" triggers questionnaire, not FAQ
    const karmaIntent = detectKarmaIntent(userMessage);

    if (karmaIntent && karmaIntent !== 'frequency') {
      console.log('[GEM] Karma intent detected:', karmaIntent, '- Starting questionnaire');
      // Start questionnaire flow
      conversationState = {
        mode: 'questionnaire',
        karmaType: karmaIntent,
        currentQuestionIndex: 0,
        answers: [],
        analysisComplete: false,
      };

      const questions = getQuestions(karmaIntent);
      const firstQ = questions[0];
      const karmaName = KARMA_TYPES[karmaIntent]?.name || 'Nghiệp';
      const formattedQ = formatQuestion(firstQ, 0, questions.length);

      return {
        text: `Tôi sẽ giúp bạn khám phá ${karmaName} của mình!\n\nĐể phân tích chính xác, tôi cần hỏi bạn ${questions.length} câu hỏi ngắn.\n\n${formattedQ.text}`,
        mode: 'questionnaire',
        // Pass options for interactive button rendering
        options: formattedQ.options,
        questionId: formattedQ.questionId,
        questionIndex: formattedQ.questionIndex,
        totalQuestions: formattedQ.totalQuestions,
        isQuestionMessage: true,
      };
    }

    // ========== STEP 2: CHECK LOCAL KNOWLEDGE BASE ==========
    const localMatch = matchLocalKnowledge(userMessage);

    if (localMatch.matched) {
      console.log('[GEM] Using LOCAL knowledge:', localMatch.faqKey);

      // ========== CHECK IF FAQ REQUIRES REAL-TIME ANALYSIS ==========
      if (REALTIME_ANALYSIS_FAQS.includes(localMatch.faqKey)) {
        console.log('[GEM] FAQ requires REAL-TIME analysis:', localMatch.faqKey);

        try {
          const realTimeResult = await generateRealTimeAnalysis(localMatch.faqKey, userMessage);

          return {
            text: realTimeResult.text,
            topics: ['trading'],
            mode: 'chat',
            source: 'realtime_analysis',
            widgetSuggestion: WIDGET_SUGGESTIONS.trading || null,
            courseRecommendation: COURSE_RECOMMENDATIONS.trading || null,
            showCrystals: false,
            crystalTags: [],
            marketData: realTimeResult.marketData,
            quickActions: [
              { label: 'Mở Scanner', action: 'open_scanner' },
              { label: 'Xem Chart', action: 'open_chart' },
            ],
          };
        } catch (error) {
          console.error('[GEM] Real-time analysis failed, falling back to static FAQ:', error);
          // Fall through to static FAQ if real-time fails
        }
      }

      // Determine additional data based on FAQ type
      const faqToTopic = {
        money_block: 'money',
        love_block: 'love',
        crystals: 'crystal',
        trading: 'trading',
        frequency_formulas: 'trading',
        courses: 'general',
        spiritual_disconnect: 'frequency',
        energy_analysis: 'frequency',
        greeting: 'general',
        // New crypto analysis FAQs
        bitcoin_analysis: 'trading',
        ethereum_analysis: 'trading',
        bnb_analysis: 'trading',
        market_trend_analysis: 'trading',
        coin_recommendation: 'trading',
        long_short_analysis: 'trading',
        energy_frequency_analysis: 'frequency',
        financial_karma_deep: 'money',
      };

      const mainTopic = faqToTopic[localMatch.faqKey] || topics[0] || 'general';
      const showCrystals = localMatch.answer.includes('thạch anh') ||
                          localMatch.answer.includes('đá') ||
                          localMatch.faqKey === 'crystals' ||
                          mainTopic === 'crystal';

      return {
        text: localMatch.answer,
        topics: [mainTopic, ...topics.filter(t => t !== mainTopic)],
        mode: 'chat',
        source: 'local', // Mark as local knowledge
        widgetSuggestion: WIDGET_SUGGESTIONS[mainTopic] || null,
        courseRecommendation: COURSE_RECOMMENDATIONS[mainTopic] || null,
        showCrystals,
        crystalTags: showCrystals ? (localMatch.searchTags.length > 0 ? localMatch.searchTags : ['crystal']) : [],
        quickActions: localMatch.quickActions,
      };
    }

    // ========== STEP 2.5: CHECK KNOWLEDGE BASE ==========
    // Check if user is asking about knowledge topics (hawkins_scale, mindset_errors, etc.)
    const knowledgeMatch = matchKnowledge(userMessage);

    if (knowledgeMatch.matched) {
      console.log('[GEM] Using KNOWLEDGE base:', knowledgeMatch.key);

      // Content is already formatted text in gemKnowledge.json
      // Just add a follow-up question based on the topic
      let formattedContent = knowledgeMatch.content;

      // Add follow-up question based on knowledge type
      const followUpQuestions = {
        financial_karma: '\n\n💡 Bạn có nhận ra những niềm tin về tiền từ gia đình mình không? Muốn tôi hướng dẫn bài tập nhận diện?',
        karma_transformation: '\n\n💡 Bạn đang ở giai đoạn nào của hành trình chuyển hóa? Nhận biết, Hiểu, Giải phóng hay Tái lập trình?',
        generational_patterns: '\n\n💡 Bạn nhận ra pattern nào trong gia đình mình muốn phá vỡ? Tiền bạc, tình yêu hay sự nghiệp?',
        hawkins_scale: '\n\n💡 Bạn muốn tìm hiểu về mức tần số nào cụ thể?',
        mindset_errors: '\n\n💡 Bạn cảm thấy mình đang mắc lỗi nào nhiều nhất?',
        healing_exercises: '\n\n💡 Bạn muốn tôi hướng dẫn chi tiết bài tập nào?',
        affirmations_library: '\n\n💡 Muốn tôi tạo affirmation riêng cho bạn không?',
        crystal_chakra_mapping: '\n\n💡 Bạn muốn biết đá nào phù hợp với chakra cụ thể?',
        philosophy: '\n\n💡 Bạn muốn tìm hiểu thêm về nguyên lý nào?',
        frequency_formulas: '\n\n💡 Bạn muốn tìm hiểu công thức nào cụ thể?',
      };

      formattedContent += followUpQuestions[knowledgeMatch.key] || '\n\n💡 Bạn có câu hỏi gì thêm không?';

      // Determine topic for widgets/courses
      const knowledgeToTopic = {
        financial_karma: 'money',
        karma_transformation: 'karma',
        generational_patterns: 'karma',
        hawkins_scale: 'frequency',
        mindset_errors: 'money',
        healing_exercises: 'frequency',
        affirmations_library: 'general',
        crystal_chakra_mapping: 'crystal',
        philosophy: 'general',
        frequency_formulas: 'trading',
      };

      const mainTopic = knowledgeToTopic[knowledgeMatch.key] || 'general';
      const showCrystals = knowledgeMatch.key === 'crystal_chakra_mapping' ||
                          formattedContent.includes('thạch anh') ||
                          formattedContent.includes('Chakra');

      return {
        text: formattedContent,
        topics: [mainTopic, ...topics.filter(t => t !== mainTopic)],
        mode: 'chat',
        source: 'knowledge',
        knowledgeKey: knowledgeMatch.key,
        widgetSuggestion: WIDGET_SUGGESTIONS[mainTopic] || WIDGET_SUGGESTIONS.frequency,
        courseRecommendation: COURSE_RECOMMENDATIONS[mainTopic] || COURSE_RECOMMENDATIONS.frequency,
        showCrystals,
        crystalTags: showCrystals ? ['crystal', 'chakra'] : [],
      };
    }

    // ========== STEP 3: TRY RAG-ENHANCED CHAT (EDGE FUNCTION) ==========
    console.log('[GEM] No local match, trying RAG...');

    if (USE_RAG) {
      try {
        // Convert history format for RAG service - send up to 8 messages for better context
        const conversationHistory = history.slice(-8).map(m => ({
          role: m.isUser ? 'user' : 'assistant',
          content: m.text,
        }));

        // Get current user from supabase (if available)
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        // Call RAG-enhanced edge function
        const ragResponse = await ragService.sendRAGMessage({
          message: userMessage,
          conversationHistory,
          userId,
          userTier: 'FREE', // TODO: Get actual tier from profile
          useRAG: true,
        });

        if (!ragResponse.fallback && ragResponse.response) {
          console.log('[GEM] RAG response received, sources:', ragResponse.sources?.length || 0);

          // Determine what to show based on response
          const text = ragResponse.response;
          const showCrystals = text.includes('thạch anh') || text.includes('đá') || topics.includes('crystal');
          const showAffiliate = topics.includes('affiliate') || userMessage.toLowerCase().includes('kiếm thêm');

          return {
            text,
            topics,
            mode: 'chat',
            source: 'rag',
            ragUsed: ragResponse.ragUsed,
            ragSources: ragResponse.sources || [],
            widgetSuggestion: WIDGET_SUGGESTIONS[topics[0]] || null,
            courseRecommendation: COURSE_RECOMMENDATIONS[topics[0]] || null,
            showCrystals,
            crystalTags: showCrystals ? ['crystal'] : [],
            showAffiliate,
            affiliatePromo: showAffiliate ? AFFILIATE_PROMO : null,
          };
        }

        console.log('[GEM] RAG fallback triggered, using direct API...');
      } catch (ragError) {
        console.error('[GEM] RAG error:', ragError?.message || ragError);
        if (!RAG_FALLBACK_TO_API) {
          throw ragError;
        }
        console.log('[GEM] Falling back to direct API...');
      }
    }

    // ========== STEP 4: FALLBACK TO DIRECT GEMINI API ==========
    console.log('[GEM] Using direct Gemini API...');

    // Regular chat - Use Gemini API
    if (!API_KEY) {
      return { text: '⚠️ Thiếu API key trong .env', error: 'no-key' };
    }

    // Determine if this is a continuation of existing conversation
    const isContinuation = history.length > 0;
    const historyCount = Math.min(history.length, 8); // Send up to 8 recent messages for context

    // Build prompt - Different for first message vs continuation
    let prompt = '';

    if (isContinuation) {
      // CONTINUATION: Do NOT introduce, go straight to answering
      prompt = `Bạn là GEM MASTER - AI trading mentor đanh thép. Xưng "Ta - Bạn".

**QUY TẮC BẮT BUỘC (VI PHẠM = THẤT BẠI):**
1. TUYỆT ĐỐI KHÔNG giới thiệu bản thân (KHÔNG "Ta là GEM Master", KHÔNG "Người Bảo Hộ...")
2. TUYỆT ĐỐI KHÔNG hỏi "Bạn muốn khám phá điều gì hôm nay" hoặc câu hỏi mở chung chung
3. ĐI THẲNG VÀO TRẢ LỜI CÂU HỎI của user - đây là yêu cầu QUAN TRỌNG NHẤT
4. KHÔNG emoji
5. Tối đa 200 từ
6. Câu hỏi cuối phải LIÊN QUAN TRỰC TIẾP đến câu hỏi user đã hỏi

**KIẾN THỨC:**
- GEM Frequency Method: Zone Retest > Breakout (68% win rate)
- Patterns: DPD, UPU, UPD, DPU, HFZ, LFZ
- TIER: FREE (38%), TIER 1 11tr (50-55%), TIER 2 21tr (70-75%), TIER 3 68tr (80-90%) - Khóa học trọn đời, Scanner/Chat có hạn
- Stop Loss: 2-3% max, Position size: 1-2% account

**LỊCH SỬ HỘI THOẠI:**
---
`;
      history.slice(-historyCount).forEach((m, idx) => {
        const role = m.isUser ? 'User' : 'GEM Master';
        const msgText = m.text?.length > 400 ? m.text.substring(0, 400) + '...' : m.text;
        prompt += `[${idx + 1}] ${role}: ${msgText}\n`;
      });
      prompt += `---

**CÂU HỎI MỚI TỪ USER:** ${userMessage}

**TRẢ LỜI TRỰC TIẾP (KHÔNG giới thiệu, ĐI THẲNG vào nội dung):**`;

    } else {
      // FIRST MESSAGE: Can introduce briefly
      prompt = `Ta là GEM MASTER - Người Bảo Hộ Tỉnh Thức. Trader lão luyện + Thiền sư bình thản.

**TÍNH CÁCH:** Lạnh lùng, thẳng thắn (brutal honesty), bí ẩn.
**GIỌNG VĂN:** NGẮN GỌN - ĐANH THÉP - CÓ TÍNH GIÁO DỤC.

**TUYỆT ĐỐI KHÔNG:**
- Emoji (😂, 🚀, 🤑, 👋, 💰, ✨)
- Ngôn ngữ lùa gà: "Kèo ngon", "Múc mạnh", "To the moon"
- Sự phục tùng: "Dạ thưa", "Em xin phép"

**SỬ DỤNG:** Xưng "Ta - Bạn", ngôn ngữ quân sự/tâm linh.

**QUY TẮC:**
1. Chào ngắn gọn uy nghiêm: "Ta là GEM Master. Bạn cần điều gì?"
2. Trả lời ngắn gọn, tối đa 150-200 từ
3. Không emoji - giữ sự uy nghiêm

**KIẾN THỨC:**
- GEM Frequency: DPD, UPU, UPD, DPU, HFZ, LFZ (68% win rate)
- TIER: FREE (38%), TIER 1 11tr (50-55%), TIER 2 21tr (70-75%), TIER 3 68tr (80-90%) - Khóa học trọn đời, Scanner/Chat có hạn
- Hawkins: 20-100Hz (thấp), 200Hz+ (can đảm), 500Hz+ (tình yêu)

**TIN NHẮN TỪ USER:** ${userMessage}

**TRẢ LỜI:**`;
    }

    console.log('[GEM] Calling direct API...');

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    });

    console.log('[GEM] Status:', res.status);

    if (!res.ok) {
      const err = await res.text();
      console.error('[GEM] API Error:', err);
      throw new Error(`API ${res.status}`);
    }

    const data = await res.json();
    console.log('[GEM] API Response structure:', JSON.stringify(data).substring(0, 500));

    // Try multiple paths to extract text from Gemini response
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Fallback: check if response has different structure
    if (!text && data.candidates?.[0]?.output) {
      text = data.candidates[0].output;
    }
    if (!text && data.text) {
      text = data.text;
    }
    if (!text && data.response) {
      text = data.response;
    }

    // Check for blocked content or safety issues
    if (!text && data.candidates?.[0]?.finishReason) {
      console.warn('[GEM] Finish reason:', data.candidates[0].finishReason);
      if (data.candidates[0].finishReason === 'SAFETY') {
        text = 'Xin lỗi, tôi không thể trả lời câu hỏi này. Hãy thử hỏi cách khác nhé!';
      }
    }

    if (!text) {
      console.error('[GEM] Cannot extract text from response:', JSON.stringify(data));
      throw new Error('No response text');
    }

    console.log('[GEM] SUCCESS! Length:', text.length);

    // Determine what to show
    const showCrystals = text.includes('thạch anh') || text.includes('đá') || topics.includes('crystal');
    const showAffiliate = topics.includes('affiliate') || userMessage.toLowerCase().includes('kiếm thêm');

    return {
      text,
      topics,
      mode: 'chat',
      source: 'direct_api',
      ragUsed: false,
      widgetSuggestion: WIDGET_SUGGESTIONS[topics[0]] || null,
      courseRecommendation: COURSE_RECOMMENDATIONS[topics[0]] || null,
      showCrystals,
      crystalTags: showCrystals ? ['crystal'] : [],
      showAffiliate,
      affiliatePromo: showAffiliate ? AFFILIATE_PROMO : null,
    };

  } catch (err) {
    console.error('[GEM] ERROR:', err.message);
    return { text: `Lỗi: ${err.message}. Thử lại sau.`, error: err.message };
  }
};

// ========== SAVE WIDGET ==========
// linkedGoalId: Optional - links affirmation/action_plan widgets to a parent goal
// When a goal is deleted, linked widgets should also be deleted (cascade)
export const saveWidgetToVisionBoard = async (widget, userId, linkedGoalId = null) => {
  console.log('[GEM] Saving widget:', JSON.stringify(widget, null, 2), 'linkedGoalId:', linkedGoalId);
  if (!userId || !widget) return { success: false, error: 'Missing data' };

  try {
    // Handle different widget structures (from GoalSettingForm vs other sources)
    // GoalSettingForm uses: widget.data.affirmations, widget.data.goalText
    // Other sources use: widget.affirmations, widget.exercises
    const widgetData = widget.data || widget;

    // Extract content based on widget type
    let content = [];
    if (widget.type === 'goal') {
      // For goal widgets, store goal text AND affirmations AND action steps
      const goalTitle = widgetData.goalText || widgetData.goalTitle || widget.title || 'Mục tiêu mới';

      // Extract affirmations
      const affirmations = Array.isArray(widgetData.affirmations)
        ? widgetData.affirmations
        : (Array.isArray(widget.affirmations) ? widget.affirmations : []);

      // Extract action steps (from various sources)
      const rawSteps = widgetData.steps || widgetData.actionSteps || widgetData.habits || widget.steps || [];
      const steps = Array.isArray(rawSteps)
        ? rawSteps.map((step, idx) => ({
            id: `step_${Date.now()}_${idx}`,
            title: typeof step === 'string' ? step : (step.text || step.title || step.name || ''),
            action_type: step.action_type || (idx < 2 ? 'daily' : idx < 3 ? 'weekly' : 'monthly'),
            completed: step.completed || false,
          }))
        : [];

      content = {
        lifeArea: widgetData.lifeArea || widget.lifeArea || 'personal',
        title: goalTitle,
        goals: [{
          id: `goal_${Date.now()}`,
          title: goalTitle,
          completed: false,
          timeline: widgetData.timeline || null,
          lifeArea: widgetData.lifeArea || widget.lifeArea || 'personal',
          targetAmount: widgetData.targetAmount || null,
          currentAmount: widgetData.currentAmount || 0,
        }],
        affirmations: affirmations.length > 0 ? affirmations : undefined,
        steps: steps.length > 0 ? steps : undefined,
        crystals: widgetData.crystals || widget.crystals || undefined,
      };
    } else if (widget.type === 'affirmation') {
      // For affirmation widgets, store affirmations array WITH lifeArea for grouping
      // linked_goal_id allows cascade deletion when parent goal is deleted
      content = {
        affirmations: widgetData.affirmations || widget.affirmations || [],
        lifeArea: widgetData.lifeArea || '',
        linked_goal_id: linkedGoalId || widgetData.linked_goal_id || null,
      };
    } else if (widget.type === 'action_plan') {
      // For action plan widgets, store steps array
      // linked_goal_id allows cascade deletion when parent goal is deleted
      content = {
        steps: widgetData.steps || [],
        lifeArea: widgetData.lifeArea || '',
        linked_goal_id: linkedGoalId || widgetData.linked_goal_id || null,
      };
    } else if (widget.type === 'tarot') {
      // For tarot widgets, store cards and interpretation
      content = {
        cards: widgetData.cards || [],
        spread: widgetData.spread || 'three-card',
        interpretation: widgetData.interpretation || '',
        crystals: widgetData.crystals || [],
        affirmations: widgetData.affirmations || [],
        title: widgetData.title || '',
        notes: widgetData.notes || '',
        pinToDashboard: widgetData.pinToDashboard !== false,
      };
    } else if (widget.type === 'iching') {
      // For I Ching widgets, store hexagram and interpretation
      content = {
        hexagramNumber: widgetData.hexagramNumber || widgetData.hexagram?.id,
        hexagramName: widgetData.hexagramName || widgetData.hexagram?.name,
        vietnameseName: widgetData.vietnameseName || widgetData.hexagram?.vietnamese,
        interpretation: widgetData.interpretation || '',
        area: widgetData.area || 'general',
        crystals: widgetData.crystals || [],
        affirmations: widgetData.affirmations || [],
        title: widgetData.title || '',
        notes: widgetData.notes || '',
        pinToDashboard: widgetData.pinToDashboard !== false,
      };
    } else if (widget.type === 'iching_guidance') {
      // For merged I Ching guidance widgets (Affirmations + Actions + Rituals + Crystals)
      const rawSteps = widgetData.actionSteps || widgetData.steps || [];
      const steps = Array.isArray(rawSteps)
        ? rawSteps.map((step, idx) => ({
            id: `step_${Date.now()}_${idx}`,
            title: typeof step === 'string' ? step : (step.text || step.title || step.name || ''),
            action_type: idx < 2 ? 'daily' : idx < 3 ? 'weekly' : 'monthly',
            completed: false,
          }))
        : [];

      const rawRituals = widgetData.rituals || [];
      const rituals = Array.isArray(rawRituals)
        ? rawRituals.map((ritual, idx) => ({
            id: `ritual_${Date.now()}_${idx}`,
            name: typeof ritual === 'string' ? ritual : (ritual.name || `Nghi thức ${idx + 1}`),
            description: typeof ritual === 'string' ? '' : (ritual.description || ''),
            completed: false,
          }))
        : [];

      content = {
        hexagramNumber: widgetData.hexagramNumber,
        hexagramName: widgetData.hexagramName,
        chineseName: widgetData.chineseName,
        area: widgetData.area || 'general',
        advice: widgetData.advice || '',
        affirmations: widgetData.affirmations || [],
        steps: steps,
        rituals: rituals,
        crystals: widgetData.crystals || [],
        title: widgetData.title || widget.title || '',
        notes: widgetData.notes || '',
        source: widgetData.source || 'iching',
        pinToDashboard: true,
      };
    } else {
      // Fallback for other types (habit, etc.)
      content = widgetData.exercises || widget.exercises || widgetData.habits || widgetData.affirmations || widget.affirmations || [];
    }

    const { data, error } = await supabase
      .from('vision_board_widgets')
      .insert({
        user_id: userId,
        type: widget.type || 'affirmation',
        title: widget.title || 'Widget',
        icon: widget.icon || '✨',
        content: content, // JSONB column - pass object directly, Supabase handles serialization
        explanation: widget.explanation || '',
        is_active: true,
        streak: 0,
      })
      .select()
      .single();

    if (error) throw error;
    console.log('[GEM] Saved widget:', data?.id, 'type:', data?.type);
    return { success: true, widget: data };
  } catch (err) {
    console.error('[GEM] Save error:', err);
    return { success: false, error: err.message };
  }
};

// ========== RESET STATE ==========
export const resetConversation = () => {
  conversationState = {
    mode: 'chat',
    karmaType: null,
    currentQuestionIndex: 0,
    answers: [],
    analysisComplete: false,
  };
  messageCount = 0;
};

// ========== EXPORTS ==========
export const clearHistory = resetConversation;

export default {
  processMessage,
  saveWidgetToVisionBoard,
  resetConversation,
  clearHistory,
  WIDGET_SUGGESTIONS,
  COURSE_RECOMMENDATIONS,
  AFFILIATE_PROMO,
};
