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

// NEW: Import enhanced services for chatbot upgrade
import userContextService from './userContextService';
import smartTriggerService from './smartTriggerService';
import chatbotAnalyticsService from './chatbotAnalyticsService';

// CRITICAL: Import enhanced chatbot modules for entity extraction, knowledge base, and fallback handling
import {
  enhancedMessageProcessor,
  handleFormulaQuestion,
  handleTarotReading,
  handleHawkinsAssessment,
  handleKinhDichReading,
  quickSearch,
  trichXuatThucThe,
  determineDomain,
  handleFallback,
  shouldUseFallback,
  calculateCompositeConfidence,
  systemErrorFallback,
  BASE_SYSTEM_PROMPT,
  searchAllKnowledge,
  getFormulaById,
  checkTierAccess,
} from './chatbot';

// Import for two-way linking (journal ↔ goal)
import { createQuickGoalWithJournal } from './templates/journalRoutingService';

// ========== API CONFIG ==========
// API key from environment variable (set in .env file)
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

if (!API_KEY) {
  console.warn('[GEM] WARNING: EXPO_PUBLIC_GEMINI_API_KEY is not set in .env file!');
}

// API Request timeout (ms)
const API_TIMEOUT = 60000; // 60 seconds

// RAG Configuration
const USE_RAG = true; // Enable RAG by default
const RAG_FALLBACK_TO_API = true; // Fallback to direct API if RAG fails

console.log('[GEM] API Key exists:', !!API_KEY);
console.log('[GEM] API URL:', API_URL);
console.log('[GEM] Local Knowledge loaded:', !!gemKnowledge?.faq);
console.log('[GEM] RAG enabled:', USE_RAG);

/**
 * Fetch with timeout wrapper
 */
const fetchWithTimeout = async (url, options, timeout = API_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - vui lòng thử lại');
    }
    throw error;
  }
};

/**
 * Call Gemini API with retry logic
 */
const callGeminiAPI = async (prompt, config = {}) => {
  const { temperature = 0.7, maxOutputTokens = 8192, retries = 2 } = config;

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`[GEM] API call attempt ${attempt + 1}/${retries + 1}`);

      const res = await fetchWithTimeout(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens },
        }),
      });

      console.log('[GEM] API Status:', res.status);

      if (!res.ok) {
        const errText = await res.text();
        console.error('[GEM] API Error:', errText);

        // Parse error message
        let errorMsg = `API ${res.status}`;
        try {
          const errJson = JSON.parse(errText);
          errorMsg = errJson.error?.message || errorMsg;
        } catch (e) {}

        // Don't retry on 4xx errors (except 429 rate limit)
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          throw new Error(errorMsg);
        }

        lastError = new Error(errorMsg);
        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`[GEM] Retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
        }
        continue;
      }

      const data = await res.json();
      console.log('[GEM] API Response received');

      // Extract text from response
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text && data.candidates?.[0]?.output) {
        text = data.candidates[0].output;
      }

      if (!text) {
        const finishReason = data.candidates?.[0]?.finishReason;
        if (finishReason === 'SAFETY') {
          return { text: 'Xin lỗi, tôi không thể trả lời câu hỏi này. Hãy thử hỏi cách khác nhé!', blocked: true };
        }
        throw new Error('Không nhận được phản hồi từ AI');
      }

      return { text, usage: data.usageMetadata };

    } catch (error) {
      console.error(`[GEM] Attempt ${attempt + 1} failed:`, error.message);
      lastError = error;

      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`[GEM] Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  throw lastError || new Error('API call failed after retries');
};

/**
 * Test API connection - call this to debug
 */
export const testAPIConnection = async () => {
  console.log('[GEM] Testing API connection...');
  console.log('[GEM] URL:', API_URL);

  try {
    const result = await callGeminiAPI('Hello, respond with just "OK"', {
      temperature: 0.1,
      maxOutputTokens: 100,
      retries: 0, // No retry for test
    });

    return {
      success: true,
      response: result.text,
    };
  } catch (error) {
    console.error('[GEM] Test Error:', error);
    return { success: false, error: error.message };
  }
};

// ========== RICH RESPONSE TYPE DETECTION (Day 25) ==========
// Response types for interactive UI components
const RICH_RESPONSE_TYPES = {
  TEXT: 'text',
  CHECKLIST: 'checklist',
  COMPARISON: 'comparison',
  CHART_HINT: 'chart_hint',
  QUIZ: 'quiz',
  AFFIRMATION: 'affirmation',
};

/**
 * Enrich response with rich response type and data for interactive UI
 * @param {Object} response - The response object from processMessage
 * @param {string} userMessage - The user's message for context detection
 * @returns {Object} - Response with responseType and richData
 */
const enrichWithRichResponse = (response, userMessage = '') => {
  const lowerMsg = userMessage.toLowerCase();

  // DEBUG: Log response data to check what we receive
  console.log('[enrichWithRichResponse] Checking response:', {
    hasAffirmations: !!response.affirmations,
    affirmationsLength: response.affirmations?.length,
    hasActionSteps: !!response.actionSteps,
    actionStepsLength: response.actionSteps?.length,
    hasRituals: !!response.rituals,
    ritualsLength: response.rituals?.length,
    frequency: response.frequency,
    scenarioTitle: response.scenario?.title,
  });

  // CHECKLIST: Priority - When response has actionSteps or rituals (interactive)
  // Check this BEFORE affirmation because checklist is more engaging
  if ((response.actionSteps && response.actionSteps.length > 0) ||
      (response.rituals && response.rituals.length > 0)) {
    const items = [];

    // Add action steps
    if (response.actionSteps && response.actionSteps.length > 0) {
      response.actionSteps.forEach((step, idx) => {
        items.push({
          step: idx + 1,
          text: typeof step === 'string' ? step : step.text || step.title,
          done: false,
        });
      });
    }

    // Add rituals if no action steps
    if (items.length === 0 && response.rituals) {
      response.rituals.forEach((ritual, idx) => {
        items.push({
          step: idx + 1,
          text: typeof ritual === 'string' ? ritual : ritual.name || ritual.title,
          done: false,
        });
      });
    }

    if (items.length > 0) {
      console.log('[enrichWithRichResponse] Returning CHECKLIST with', items.length, 'items');
      return {
        ...response,
        responseType: RICH_RESPONSE_TYPES.CHECKLIST,
        richData: {
          title: response.scenario?.title || 'Bài tập chữa lành',
          summary: response.scenario?.description || null,
          rootCause: response.scenario?.rootCause || null,
          crystal: response.scenario?.crystal || null,
          items: items,
          duration: '21 ngày',
        },
      };
    }
  }

  // AFFIRMATION: When response has affirmations (but no actionSteps)
  if (response.affirmations && response.affirmations.length > 0) {
    // Pick first affirmation as main content
    const mainAffirmation = response.affirmations[0];
    console.log('[enrichWithRichResponse] Returning AFFIRMATION');
    return {
      ...response,
      responseType: RICH_RESPONSE_TYPES.AFFIRMATION,
      richData: {
        text: typeof mainAffirmation === 'string' ? mainAffirmation : mainAffirmation.text,
        frequency: response.frequency || 528,
        backgroundColor: response.scenario?.colorGradient?.[0] || '#6A5BFF',
        allAffirmations: response.affirmations,
      },
    };
  }

  // COMPARISON: When user asks to compare tiers/plans
  if (lowerMsg.includes('so sánh') && (lowerMsg.includes('tier') || lowerMsg.includes('gói'))) {
    return {
      ...response,
      responseType: RICH_RESPONSE_TYPES.COMPARISON,
      richData: {
        title: 'So sánh các TIER',
        items: [
          {
            name: 'STARTER',
            price: '299K',
            features: ['Scanner cơ bản', '5 cặp coin', 'Hỗ trợ community'],
            highlight: false,
          },
          {
            name: 'TIER 1',
            price: '11tr',
            features: ['50-55% win rate', '15 patterns', 'AI Signals cơ bản'],
            highlight: false,
          },
          {
            name: 'TIER 2',
            price: '21tr',
            features: ['70-75% win rate', 'AI Prediction', 'Whale Tracker'],
            highlight: true,
          },
          {
            name: 'TIER 3',
            price: '68tr',
            features: ['80-90% win rate', 'Private mentoring', 'VIP signals'],
            highlight: false,
          },
        ],
        highlightIndex: 2,
      },
    };
  }

  // CHART_HINT: When response mentions specific trading symbols
  const symbolMatch = response.text?.match(/\b(BTC|ETH|BNB|SOL|XRP|DOGE|ADA)(?:USDT)?\b/i);
  if (symbolMatch && (lowerMsg.includes('chart') || lowerMsg.includes('phân tích') ||
      response.source === 'realtime_analysis' || response.marketData)) {
    const symbol = symbolMatch[1].toUpperCase() + 'USDT';
    const patternMatch = response.text?.match(/(DPD|UPU|UPD|DPU|HFZ|LFZ|Zone Retest|Breakout)/i);

    return {
      ...response,
      responseType: RICH_RESPONSE_TYPES.CHART_HINT,
      richData: {
        symbol: symbol,
        pattern: patternMatch ? patternMatch[1].toUpperCase() : null,
        message: response.text || '', // Full text, no truncation
      },
    };
  }

  // QUIZ: For educational content (future enhancement)
  // Can be triggered when AI returns quiz-like content

  // Default: TEXT response
  return response;
};

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

    const result = await callGeminiAPI(prompt, { temperature: 0.7 });
    const text = result.text;

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
// IMPORTANT: Trigger questionnaire for:
// 1. Explicit requests: "phân tích nghiệp tình của tôi"
// 2. Implicit love questions: "người yêu cũ có quay lại không?" (needs energy analysis)
const detectKarmaIntent = (message) => {
  const m = message.toLowerCase();

  // Skip if user is asking about manifest, hướng dẫn, giới thiệu - these are NOT karma analysis
  const skipKeywords = ['manifest', 'hướng dẫn', 'giới thiệu', 'dạy', 'học', 'cách', 'làm sao', 'làm thế nào', 'khóa học', 'course'];
  if (skipKeywords.some(kw => m.includes(kw))) {
    console.log('[GEM] Skip karma detection - manifest/guide request detected');
    return null;
  }

  // ========== IMPLICIT LOVE ANALYSIS ==========
  // Questions about relationships that need energy/karma analysis (not yes/no answers)
  const implicitLoveQuestions = [
    'người yêu cũ', 'tình cũ', 'ex quay lại', 'quay lại với',
    'có nên gặp lại', 'có nên nhắn', 'liên lạc lại',
    'còn yêu', 'hết yêu', 'quên người cũ', 'nhớ người cũ',
    'bị ghosted', 'bị block', 'tại sao chia tay',
    'tại sao bị bỏ', 'không có người yêu', 'mãi không có ai',
    'luôn bị phản bội', 'luôn bị bỏ rơi', 'pattern tình yêu'
  ];

  const hasImplicitLoveQuestion = implicitLoveQuestions.some(kw => m.includes(kw));
  if (hasImplicitLoveQuestion) {
    console.log('[GEM] Implicit love question detected - trigger love questionnaire');
    return 'love';
  }

  // ========== EXPLICIT KARMA ANALYSIS REQUESTS ==========
  // Must include action words: phân tích, khám phá, xem, đo, kiểm tra, tìm hiểu + nghiệp
  const analysisKeywords = ['phân tích', 'khám phá', 'xem', 'đo', 'kiểm tra', 'tìm hiểu', 'của tôi', 'của mình', 'giúp tôi'];
  const hasAnalysisRequest = analysisKeywords.some(kw => m.includes(kw));

  // Also check for question patterns that indicate need for deep analysis
  const deepAnalysisIndicators = [
    'tại sao tôi', 'vì sao tôi', 'tại sao mình', 'vì sao mình',
    'gốc vấn đề', 'nguyên nhân', 'pattern', 'lặp lại'
  ];
  const needsDeepAnalysis = deepAnalysisIndicators.some(kw => m.includes(kw));

  if (!hasAnalysisRequest && !needsDeepAnalysis) {
    console.log('[GEM] Skip karma questionnaire - no explicit analysis request');
    return null;
  }

  // Now check for specific karma types with analysis request
  // Money karma - must mention "nghiệp tiền" or "nghiệp tài chính"
  if (m.includes('nghiệp tiền') || m.includes('nghiệp tài chính') || (m.includes('nghiệp') && (m.includes('tiền') || m.includes('tài')))) {
    return 'money';
  }
  // Love karma - must mention "nghiệp tình" or "nghiệp duyên" or love-related + analysis
  if (m.includes('nghiệp tình') || m.includes('nghiệp duyên') || (m.includes('nghiệp') && (m.includes('tình') || m.includes('yêu')))) {
    return 'love';
  }
  // Also trigger love questionnaire for deep analysis questions about relationships
  if (needsDeepAnalysis && (m.includes('tình') || m.includes('yêu') || m.includes('quan hệ') || m.includes('bỏ rơi'))) {
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

// ========== PREMIUM CONTENT GATING ==========
// Protect premium course content and trading formulas

/**
 * Keywords indicating user is asking for DETAILED premium content
 * Must include both topic keyword + detail indicator
 */
const PREMIUM_DETAIL_INDICATORS = [
  'chi tiết', 'cụ thể', 'giải thích', 'hướng dẫn', 'cách dùng', 'cách sử dụng',
  'làm sao', 'làm thế nào', 'như thế nào', 'step by step', 'từng bước',
  'ví dụ', 'case study', 'thực hành', 'áp dụng', 'setup', 'entry', 'exit',
  'backtest', 'kết quả', 'win rate', 'công thức', 'formula', 'bí quyết',
  'secret', 'độc quyền', 'nội dung', 'bài học', 'lesson', 'module',
  'dạy tôi', 'teach me', 'show me', 'chỉ cho tôi',
];

/**
 * Premium content by tier - what content requires which tier
 */
const PREMIUM_CONTENT_MAP = {
  // TIER 1 Content (11M)
  tier1: {
    keywords: [
      'tier 1', 'tier1', '7 pattern', 'bảy pattern', '7 mô hình',
      'harmonic pattern', 'elliott wave', 'wyckoff', 'volume profile',
      'market structure', 'fibonacci', 'divergence',
      'khóa 11 triệu', 'khóa 11tr', 'course tier 1',
    ],
    features: [
      '7 Patterns cốt lõi (Harmonic, Elliott, Wyckoff...)',
      'Win rate 50-55%',
      'GEM Scanner 1 tháng',
      'Cộng đồng VIP Discord',
    ],
    price: '11.000.000đ',
    originalPrice: '15.000.000đ',
    discount: '27%',
  },

  // TIER 2 Content (21M)
  tier2: {
    keywords: [
      'tier 2', 'tier2', '15 pattern', 'mười lăm pattern',
      '6 công thức', 'sáu công thức', '6 formula',
      'dpd', 'upu', 'upd', 'dpu', 'hfz', 'lfz',
      'down pause down', 'up pause up', 'frequency formula',
      'smart money', 'smc', 'liquidity', 'order block', 'fvg',
      'institutional', 'market maker', 'manipulation',
      'khóa 21 triệu', 'khóa 21tr', 'course tier 2',
    ],
    features: [
      'Tất cả TIER 1 + 8 Patterns nâng cao',
      '6 Công thức Frequency độc quyền (DPD, UPU, HFZ...)',
      'Smart Money Concepts (SMC)',
      'Win rate 70-75%',
      'GEM Scanner 3 tháng',
      'Mentorship group riêng',
    ],
    price: '21.000.000đ',
    originalPrice: '35.000.000đ',
    discount: '40%',
  },

  // TIER 3 Content (68M)
  tier3: {
    keywords: [
      'tier 3', 'tier3', '11 công thức', 'mười một công thức',
      '5 công thức nâng cao', 'advanced formula',
      'ai prediction', 'whale tracker', 'institutional flow',
      'market manipulation', 'liquidity hunt', 'stop hunt',
      'wyckoff accumulation', 'wyckoff distribution',
      'order flow', 'tape reading', 'delta', 'cvd',
      'khóa 68 triệu', 'khóa 68tr', 'course tier 3', 'elite',
      'full package', 'trọn bộ', 'tất cả công thức',
    ],
    features: [
      'Tất cả TIER 1 + TIER 2',
      '11 Công thức Frequency hoàn chỉnh',
      'AI Prediction System',
      'Whale Tracker (theo dõi cá mập)',
      'Win rate 80-90%',
      'GEM Scanner TRỌN ĐỜI',
      '1-on-1 với Founder (4 sessions)',
      'Private Telegram signals',
    ],
    price: '68.000.000đ',
    originalPrice: '120.000.000đ',
    discount: '43%',
  },

  // Frequency Formulas (protected content)
  formulas: {
    keywords: [
      'công thức frequency', 'frequency formula', 'công thức độc quyền',
      'dpd là gì', 'upu là gì', 'upd là gì', 'dpu là gì', 'hfz là gì', 'lfz là gì',
      'cách dùng dpd', 'cách dùng upu', 'cách trade dpd', 'cách trade upu',
      'setup dpd', 'setup upu', 'entry dpd', 'entry upu',
      'down pause down chi tiết', 'up pause up chi tiết',
      'giải thích công thức', 'explain formula',
    ],
    requiredTier: 'tier2', // Minimum tier to access
  },
};

/**
 * FOMO Teaser responses - tạo tò mò và urgency
 */
const FOMO_TEASERS = {
  tier1: [
    `🔒 **NỘI DUNG TIER 1 - PREMIUM**

Bạn đang hỏi về nội dung thuộc **Khóa Trading TIER 1** (11 triệu).

**Những gì bạn sẽ được học:**
• 7 Patterns cốt lõi được backtest trên 686 trades
• Win rate thực tế: 50-55% (gấp đôi trader bình thường)
• Harmonic, Elliott Wave, Wyckoff, Volume Profile...

💡 **Tại sao ta không thể chia sẻ chi tiết?**
Đây là kiến thức độc quyền mà team GEM đã nghiên cứu 10+ năm. Nếu ai cũng biết, nó sẽ không còn hiệu quả.

📊 **Thực tế:** 89% học viên TIER 1 đã profitable sau 3 tháng.

🔥 **Ưu đãi hiện tại:** Giảm 27% còn **11 triệu** (gốc 15 triệu)
⏰ Chỉ còn 3 slot cho tháng này.

Bạn có muốn xem chi tiết khóa học không?`,

    `⚡ **BẠN ĐANG CHẠM VÀO KIẾN THỨC TIER 1**

Ta hiểu sự tò mò của bạn. Nhưng đây là nội dung mà học viên đã đầu tư **11 triệu** để sở hữu.

**Sneak peek nhỏ:**
• Pattern này có win rate 52% trên BTC/ETH
• Kết hợp với Frequency Method → tăng lên 65%
• Có video hướng dẫn chi tiết từng setup

💰 **ROI thực tế:** Nhiều học viên đã gỡ vốn chỉ sau 2-3 trades đầu tiên.

Nếu bạn nghiêm túc với trading, đây là đầu tư nhỏ nhất cho kiến thức lớn nhất.

Muốn ta tư vấn thêm về khóa học?`,
  ],

  tier2: [
    `🔐 **NỘI DUNG TIER 2 - ADVANCED**

Bạn đang hỏi về **6 Công thức Frequency** - kiến thức độc quyền chỉ có ở TIER 2.

**Đây là gì?**
• DPD, UPU, UPD, DPU, HFZ, LFZ
• Công thức dự đoán xu hướng với độ chính xác 70-75%
• Được nghiên cứu 10+ năm bởi Founder Jennie Chu

🤫 **Bí mật:** Những công thức này KHÔNG có trên Google, YouTube hay bất kỳ khóa học nào khác. Đây là intellectual property của GEM.

📈 **Kết quả học viên TIER 2:**
• Win rate trung bình: 72%
• Thời gian gỡ vốn: 1-2 tháng
• 94% hài lòng với khóa học

💎 **Giá trị:** 21 triệu cho kiến thức đáng giá 100 triệu+

Bạn đã sẵn sàng nâng cấp lên TIER 2 chưa?`,

    `⚡ **CÔNG THỨC FREQUENCY - TOP SECRET**

Ta sẽ không nói dối bạn: Công thức DPD/UPU/HFZ là "vũ khí bí mật" của GEM traders.

**Tại sao ta không thể share free?**
1. Mất 10 năm để nghiên cứu và backtest
2. Nếu ai cũng biết → market sẽ arbitrage hết
3. Học viên TIER 2 đã trả 21 triệu cho kiến thức này

**Ta có thể hint nhỏ:**
• DPD = Down-Pause-Down → Dấu hiệu continuation giảm
• UPU = Up-Pause-Up → Dấu hiệu continuation tăng
• Nhưng CÁCH ĐỌC và ENTRY thì... chỉ có trong khóa học 😉

🔥 **FOMO thật:** Tháng này chỉ nhận 5 học viên TIER 2 mới.

Upgrade ngay?`,
  ],

  tier3: [
    `👑 **TIER 3 ELITE - KIẾN THỨC TỐI THƯỢNG**

Bạn đang hỏi về nội dung **TIER 3 Elite** - cấp độ cao nhất của GEM Trading.

**Đây là những gì chỉ TIER 3 mới có:**
• 11 Công thức Frequency hoàn chỉnh (5 công thức nâng cao)
• **AI Prediction System** - dự đoán bằng machine learning
• **Whale Tracker** - theo dõi giao dịch cá mập real-time
• Win rate: 80-90%

🐋 **Whale Tracker là gì?**
Công cụ theo dõi các ví lớn (>1000 BTC) đang mua/bán. Khi cá mập accumulate, bạn biết trước.

💰 **Giá trị thực:**
• 68 triệu nghe có vẻ nhiều
• Nhưng 1 trade với Whale Tracker có thể lãi 50-200 triệu
• ROI trung bình của học viên TIER 3: 500% trong năm đầu

👤 **Bonus:** 4 sessions 1-on-1 với Founder Jennie Chu

Đây là investment, không phải expense. Bạn sẵn sàng chưa?`,

    `🏆 **BẠN ĐANG HỎI VỀ "HOLY GRAIL" CỦA TRADING**

AI Prediction và Whale Tracker là 2 công cụ mà 99% traders không biết tồn tại.

**Tại sao TIER 3 đắt nhất?**
• Vì nó ĐÁNG GIÁ nhất
• Học viên TIER 3 có win rate 85%+
• Nhiều người đã quit job để trade full-time

**Ta không thể share chi tiết vì:**
1. Đây là competitive advantage
2. Số lượng học viên TIER 3 được giới hạn (để không làm loãng edge)
3. NDA - học viên ký cam kết không share

📊 **Fun fact:** 78% học viên TIER 3 đã refer thêm bạn bè vì kết quả quá tốt.

Muốn được tư vấn 1-1 về TIER 3?`,
  ],

  formulas: [
    `🔒 **CÔNG THỨC ĐỘC QUYỀN - PROTECTED**

Bạn đang hỏi chi tiết về công thức Frequency - đây là **intellectual property** của GEM.

**Ta có thể nói:**
• Có 6 công thức core (TIER 2) và 5 công thức advanced (TIER 3)
• Win rate từ 68-90% tùy công thức
• Được backtest trên 686+ trades trong 3 năm

**Ta KHÔNG thể nói:**
• Cách setup cụ thể
• Entry/Exit rules
• Risk management cho từng công thức

💡 **Lý do:** Nếu công thức bị lan truyền free, market makers sẽ counter và nó mất hiệu quả.

Học viên TIER 2+ được quyền truy cập đầy đủ.

Bạn đang ở tier nào? Muốn upgrade không?`,
  ],

  // Generic teaser for unknown tier requests
  generic: [
    `🔐 **NỘI DUNG PREMIUM**

Câu hỏi của bạn liên quan đến kiến thức trong các khóa học TIER cao hơn.

**Hệ thống GEM Trading có 4 cấp độ:**
• **FREE** - Kiến thức cơ bản, win rate ~38%
• **TIER 1** (11tr) - 7 Patterns, win rate 50-55%
• **TIER 2** (21tr) - 6 Công thức Frequency, win rate 70-75%
• **TIER 3** (68tr) - AI Prediction + Whale Tracker, win rate 80-90%

Mỗi tier là một bước nhảy vọt về kiến thức và kết quả.

📈 Bạn đang ở tier nào? Ta sẽ tư vấn lộ trình phù hợp.`,
  ],
};

/**
 * Detect if user is asking for premium content details
 * Returns { isPremium: true, tier: 'tier2', ... } or { isPremium: false }
 */
const detectPremiumContentRequest = (message) => {
  const m = message.toLowerCase();

  // Check if message contains detail indicators
  const hasDetailIndicator = PREMIUM_DETAIL_INDICATORS.some(ind => m.includes(ind));

  // If no detail indicator, might just be asking overview (OK to answer)
  if (!hasDetailIndicator) {
    return { isPremium: false };
  }

  // Check which premium content they're asking about
  for (const [tierKey, tierData] of Object.entries(PREMIUM_CONTENT_MAP)) {
    const matchCount = tierData.keywords.filter(kw => m.includes(kw)).length;

    if (matchCount >= 1) {
      return {
        isPremium: true,
        tier: tierKey,
        matchedKeywords: tierData.keywords.filter(kw => m.includes(kw)),
        requiredTier: tierData.requiredTier || tierKey,
        features: tierData.features,
        price: tierData.price,
        discount: tierData.discount,
      };
    }
  }

  return { isPremium: false };
};

/**
 * Generate FOMO teaser response based on tier
 */
const generateFOMOTeaser = (tierKey, userTier = 'FREE') => {
  const teasers = FOMO_TEASERS[tierKey] || FOMO_TEASERS.generic;
  const randomTeaser = teasers[Math.floor(Math.random() * teasers.length)];

  return {
    text: randomTeaser,
    isPremiumGated: true,
    requiredTier: tierKey,
    userTier: userTier,
    showUpgradeButton: true,
    upgradeUrl: tierKey === 'tier1' ? 'tier1' : tierKey === 'tier2' ? 'tier2' : 'tier3',
  };
};

/**
 * Get user's current tier from profile
 * Returns: 'FREE' | 'STARTER' | 'TIER1' | 'TIER2' | 'TIER3'
 */
const getUserTier = async (userId) => {
  if (!userId) return 'FREE';

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_tier, purchased_tiers')
      .eq('id', userId)
      .single();

    if (error || !profile) return 'FREE';

    // Check purchased_tiers array or subscription_tier
    const purchasedTiers = profile.purchased_tiers || [];
    const subTier = profile.subscription_tier || 'FREE';

    // Return highest tier
    if (purchasedTiers.includes('TIER3') || subTier === 'TIER3') return 'TIER3';
    if (purchasedTiers.includes('TIER2') || subTier === 'TIER2') return 'TIER2';
    if (purchasedTiers.includes('TIER1') || subTier === 'TIER1') return 'TIER1';
    if (purchasedTiers.includes('STARTER') || subTier === 'STARTER') return 'STARTER';

    return 'FREE';
  } catch (error) {
    console.error('[GEM] Error getting user tier:', error);
    return 'FREE';
  }
};

/**
 * Check if user has access to content tier
 */
const hasAccessToTier = (userTier, requiredTier) => {
  const tierHierarchy = ['FREE', 'STARTER', 'TIER1', 'TIER2', 'TIER3'];
  const userLevel = tierHierarchy.indexOf(userTier.toUpperCase());
  const requiredLevel = tierHierarchy.indexOf(requiredTier.toUpperCase().replace('tier', 'TIER'));

  return userLevel >= requiredLevel;
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
    'mất kết nối', 'disconnection', 'cô đơn tâm thức',
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
export const processMessage = async (userMessage, history = [], options = {}) => {
  // options can include: intentInstruction, userContext, userTier, etc.
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

  // ========== ENHANCED ENTITY EXTRACTION (NEW CHATBOT UPGRADE) ==========
  // Use enhanced entity extraction for trading coins, formulas, zones, tarot, crystals
  let enhancedEntities = { byType: {}, entities: [] };
  try {
    enhancedEntities = trichXuatThucThe(userMessage);
    console.log('[GEM] Enhanced entities:', {
      coins: enhancedEntities.byType?.COIN || [],
      formulas: enhancedEntities.byType?.FORMULA || [],
      zones: enhancedEntities.byType?.ZONE || [],
      tarot: enhancedEntities.byType?.TAROT || [],
      crystals: enhancedEntities.byType?.CRYSTAL || [],
      hawkins: enhancedEntities.byType?.HAWKINS || [],
      totalEntities: enhancedEntities.entities?.length || 0,
    });
  } catch (entityError) {
    console.warn('[GEM] Enhanced entity extraction failed:', entityError?.message);
  }

  // ========== DETERMINE DOMAIN (NEW CHATBOT UPGRADE) ==========
  // Detect if message is about trading, spiritual, or general topics
  const messageDomain = determineDomain(userMessage, intentResult.intent);
  console.log('[GEM] Message domain:', messageDomain);

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
          // Fallback: healing → actionSteps if actionSteps not defined
          affirmations: result.scenario?.affirmations || [],
          actionSteps: result.scenario?.actionSteps || result.scenario?.healing || [],
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

      // ========== CONTEXTUAL INTRO MESSAGE ==========
      // Check if triggered by implicit love question (not explicit karma analysis request)
      const m = userMessage.toLowerCase();
      const implicitLovePatterns = [
        'người yêu cũ', 'tình cũ', 'ex quay lại', 'quay lại',
        'có nên gặp', 'có nên nhắn', 'còn yêu', 'quên người',
        'bị ghosted', 'bị block', 'tại sao chia tay', 'bị bỏ'
      ];
      const isImplicitLoveQuestion = karmaIntent === 'love' &&
        implicitLovePatterns.some(p => m.includes(p)) &&
        !m.includes('nghiệp');

      let introText;
      if (isImplicitLoveQuestion) {
        // Wisdom-based contextual response for implicit love questions
        introText = `✨ Tôi hiểu bạn đang muốn biết câu trả lời cho câu hỏi này...\n\n` +
          `Nhưng **câu trả lời có/không** sẽ không giúp bạn hiểu rõ vấn đề.\n\n` +
          `Điều quan trọng hơn là hiểu **tại sao pattern này lặp lại** trong cuộc sống của bạn.\n\n` +
          `Hãy để Sư Phụ đánh giá **năng lượng tình duyên** của bạn qua ${questions.length} câu hỏi ngắn:\n\n${formattedQ.text}`;
      } else {
        // Standard intro for explicit karma analysis requests
        introText = `Tôi sẽ giúp bạn khám phá ${karmaName} của mình!\n\nĐể phân tích chính xác, tôi cần hỏi bạn ${questions.length} câu hỏi ngắn.\n\n${formattedQ.text}`;
      }

      return {
        text: introText,
        mode: 'questionnaire',
        // Pass options for interactive button rendering
        options: formattedQ.options,
        questionId: formattedQ.questionId,
        questionIndex: formattedQ.questionIndex,
        totalQuestions: formattedQ.totalQuestions,
        isQuestionMessage: true,
      };
    }

    // ========== STEP 1.5: PREMIUM CONTENT GATING ==========
    // Check if user is asking for DETAILED premium content (courses, formulas)
    // If so, return FOMO teaser instead of revealing protected content
    const premiumCheck = detectPremiumContentRequest(userMessage);

    if (premiumCheck.isPremium) {
      console.log('[GEM] Premium content request detected:', premiumCheck.tier, 'Keywords:', premiumCheck.matchedKeywords);

      // Get user's current tier
      const { data: { user } } = await supabase.auth.getUser();
      const userTier = await getUserTier(user?.id);

      console.log('[GEM] User tier:', userTier, 'Required tier:', premiumCheck.requiredTier);

      // Check if user has access
      if (!hasAccessToTier(userTier, premiumCheck.requiredTier)) {
        console.log('[GEM] User does NOT have access - returning FOMO teaser');

        const fomoResponse = generateFOMOTeaser(premiumCheck.tier, userTier);

        return {
          text: fomoResponse.text,
          topics: ['trading'],
          mode: 'chat',
          source: 'premium_gated',
          isPremiumGated: true,
          requiredTier: premiumCheck.requiredTier,
          userTier: userTier,
          showUpgradeButton: true,
          courseRecommendation: COURSE_RECOMMENDATIONS.trading || null,
          quickActions: [
            { label: 'Xem chi tiết khóa học', action: 'view_courses' },
            { label: 'So sánh các TIER', action: 'compare_tiers' },
          ],
        };
      } else {
        console.log('[GEM] User HAS access - proceeding to answer');
        // User has access, continue to normal processing
      }
    }

    // ========== STEP 2: CHECK LOCAL KNOWLEDGE BASE ==========
    const localMatch = matchLocalKnowledge(userMessage);
    const isContinuation = history.length > 0;

    // IMPORTANT: Skip greeting FAQ if already in conversation (avoid repeated intros)
    if (localMatch.matched && localMatch.faqKey === 'greeting' && isContinuation) {
      console.log('[GEM] Skipping greeting FAQ - already in conversation');
      localMatch.matched = false; // Force to use AI for natural response
    }

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

      // ========== CONVERSATIONAL WRAPPER FOR FAQ RESPONSES ==========
      // Make FAQ answers feel natural in conversation context
      let finalAnswer = localMatch.answer;

      if (isContinuation) {
        // Check last message context for relevance
        const lastUserMsg = history.filter(m => m.isUser).pop()?.text?.toLowerCase() || '';
        const lastAssistantMsg = history.filter(m => !m.isUser).pop()?.text?.toLowerCase() || '';

        // Check if there was divination context (I Ching/Tarot)
        const hasDivinationContext = history.some(m =>
          m.divinationType === 'iching' || m.divinationType === 'tarot' ||
          m.hexagram || m.cards
        );

        // Build natural transition phrase based on context
        let transitionPhrase = '';

        // If user is asking follow-up to divination
        if (hasDivinationContext && (lastUserMsg.includes('quẻ') || lastUserMsg.includes('bài') || lastUserMsg.includes('kết quả'))) {
          transitionPhrase = 'Dựa trên kết quả bói của bạn, ';
        }
        // If user is continuing a topic already discussed
        else if (localMatch.faqKey.includes('money') && lastAssistantMsg.includes('tiền')) {
          transitionPhrase = 'Về vấn đề tiền bạc bạn đang hỏi, ';
        }
        else if (localMatch.faqKey.includes('love') && lastAssistantMsg.includes('yêu')) {
          transitionPhrase = 'Về tình yêu bạn đang thắc mắc, ';
        }
        else if (localMatch.faqKey.includes('course') || localMatch.faqKey.includes('tier')) {
          transitionPhrase = 'Về khóa học bạn quan tâm, ';
        }
        else if (localMatch.faqKey.includes('trading') || localMatch.faqKey.includes('scanner')) {
          transitionPhrase = 'Về trading mà bạn hỏi, ';
        }
        // Generic transition for continuation
        else if (history.length > 2) {
          // Don't add transition if answer already starts with analysis header
          if (!finalAnswer.startsWith('**') && !finalAnswer.startsWith('🔮') && !finalAnswer.startsWith('💰')) {
            transitionPhrase = '';
          }
        }

        // Only add transition if not empty and answer doesn't already have intro
        if (transitionPhrase && !finalAnswer.toLowerCase().startsWith('ta ') && !finalAnswer.toLowerCase().startsWith('dựa trên')) {
          finalAnswer = transitionPhrase + finalAnswer.charAt(0).toLowerCase() + finalAnswer.slice(1);
        }
      }

      return {
        text: finalAnswer,
        topics: [mainTopic, ...topics.filter(t => t !== mainTopic)],
        mode: 'chat',
        source: 'local', // Mark as local knowledge
        knowledgeKey: localMatch.faqKey,
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
    // RAG now supports intentInstruction and userContext
    console.log('[GEM] No local match, trying RAG...');

    if (USE_RAG) {
      try {
        // Convert history format for RAG service - send up to 8 messages for better context
        // IMPORTANT: Include divination context (I Ching/Tarot) in message content
        const conversationHistory = history.slice(-8).map(m => {
          let content = m.text || '';

          // Add divination context if present
          if (m.divinationType === 'iching' && m.hexagram) {
            content += `\n[Context: Quẻ Kinh Dịch #${m.hexagram.id} - ${m.hexagram.name} (${m.hexagram.vietnamese || ''})]`;
          }
          if (m.divinationType === 'tarot' && m.cards) {
            const cardNames = m.cards.map(c => c.name || c.title).join(', ');
            content += `\n[Context: Bài Tarot - ${cardNames}]`;
          }

          return {
            role: m.isUser ? 'user' : 'assistant',
            content,
          };
        });

        // Get current user from supabase (if available)
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        // Call RAG-enhanced edge function
        const ragResponse = await ragService.sendRAGMessage({
          message: userMessage,
          conversationHistory,
          userId,
          userTier: options.userTier || 'FREE',
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

    // ========== STEP 4: ENHANCED CHATBOT PROCESSING + DIRECT GEMINI API ==========
    console.log('[GEM] Using enhanced chatbot + direct Gemini API...');

    // Regular chat - Use Gemini API
    if (!API_KEY) {
      return { text: '⚠️ Thiếu API key trong .env', error: 'no-key' };
    }

    // ========== NEW: ENHANCED MESSAGE PROCESSOR ==========
    // Use the new chatbot upgrade modules for better context and knowledge
    let enhancedContext = null;
    let knowledgeContextStr = '';
    let entityContextStr = '';

    try {
      // Run enhanced message processor
      enhancedContext = await enhancedMessageProcessor({
        message: userMessage,
        intent: intentResult.intent,
        intentConfidence: intentResult.confidence,
        userContext: {
          tier: options.userTier || 'FREE',
          ...(options.userContext || {}),
        },
        history: history.slice(-6),
      });

      console.log('[GEM] Enhanced processor result:', {
        success: enhancedContext?.success,
        useFallback: enhancedContext?.useFallback,
        domain: enhancedContext?.domain,
        confidence: enhancedContext?.confidence,
        entitiesFound: Object.keys(enhancedContext?.entities || {}).length,
        knowledgeFound: enhancedContext?.knowledgeContext?.length || 0,
      });

      // Check if fallback is needed (low confidence)
      if (enhancedContext?.useFallback && enhancedContext?.fallback?.finalResponse) {
        console.log('[GEM] Using fallback response from Sư Phụ persona');
        return {
          text: enhancedContext.fallback.finalResponse,
          topics,
          mode: 'chat',
          source: 'enhanced_fallback',
          confidence: enhancedContext.confidence,
          domain: enhancedContext.domain,
          widgetSuggestion: WIDGET_SUGGESTIONS[topics[0]] || null,
          courseRecommendation: COURSE_RECOMMENDATIONS[topics[0]] || null,
          showCrystals: false,
          crystalTags: [],
        };
      }

      // Build knowledge context string from search results
      if (enhancedContext?.knowledgeContext && enhancedContext.knowledgeContext.length > 0) {
        const relevantKnowledge = enhancedContext.knowledgeContext
          .slice(0, 2)
          .map(k => `- ${k.ten || k.title}: ${(k.moTaNgan || k.description || '').substring(0, 200)}`)
          .join('\n');

        if (relevantKnowledge) {
          knowledgeContextStr = `\n**KIẾN THỨC LIÊN QUAN (từ kho kiến thức GEM):**\n${relevantKnowledge}\n`;
          console.log('[GEM] Added knowledge context to prompt');
        }
      }

      // Build entity context string
      if (enhancedContext?.entities) {
        const entityParts = [];
        if (enhancedContext.entities.COIN?.length > 0) {
          entityParts.push(`Coins: ${enhancedContext.entities.COIN.join(', ')}`);
        }
        if (enhancedContext.entities.FORMULA?.length > 0) {
          entityParts.push(`Công thức: ${enhancedContext.entities.FORMULA.join(', ')}`);
        }
        if (enhancedContext.entities.ZONE?.length > 0) {
          entityParts.push(`Zones: ${enhancedContext.entities.ZONE.join(', ')}`);
        }
        if (enhancedContext.entities.TAROT?.length > 0) {
          entityParts.push(`Tarot: ${enhancedContext.entities.TAROT.join(', ')}`);
        }
        if (enhancedContext.entities.HAWKINS?.length > 0) {
          entityParts.push(`Tần số Hawkins: ${enhancedContext.entities.HAWKINS.join(', ')}`);
        }

        if (entityParts.length > 0) {
          entityContextStr = `\n**THỰC THỂ PHÁT HIỆN:** ${entityParts.join(' | ')}\n`;
          console.log('[GEM] Added entity context to prompt');
        }
      }
    } catch (enhancedError) {
      console.warn('[GEM] Enhanced processor error (using standard flow):', enhancedError?.message);
    }

    // isContinuation already defined above
    const historyCount = Math.min(history.length, 8); // Send up to 8 recent messages for context

    // Build prompt - Different for first message vs continuation
    let prompt = '';

    if (isContinuation) {
      // CONTINUATION: Natural opener + content (no self-intro)
      prompt = `Bạn là GEM MASTER - AI trading mentor đanh thép. Xưng "Ta - Bạn".

**QUY TẮC BẮT BUỘC (VI PHẠM = THẤT BẠI):**
1. TUYỆT ĐỐI KHÔNG giới thiệu bản thân (KHÔNG "Ta là GEM Master", KHÔNG "Người Bảo Hộ...")
2. TUYỆT ĐỐI KHÔNG chào hỏi (KHÔNG "Chào bạn", KHÔNG "Xin chào") - Đã trong cuộc hội thoại!
3. ⚠️ TUYỆT ĐỐI CẤM gọi user là "Gemral", "GEMral", "Gem" hoặc BẤT KỲ tên app nào - CHỈ gọi "bạn"
4. LUÔN BẮT ĐẦU bằng 1 CÂU DẪN TỰ NHIÊN LIÊN QUAN ĐẾN CÂU HỎI (VD: "Về câu hỏi này...", "Ta sẽ giúp bạn hiểu...")
5. SAU CÂU DẪN mới đi vào nội dung chi tiết
6. KHÔNG emoji
7. Tối đa 250 từ
8. NẾU có bài tập: CHỈ đưa 1 bài tập cụ thể nhất, cuối response hỏi "Bạn muốn thêm bài tập khác không?"

**VÍ DỤ CÂU DẪN TỰ NHIÊN:**
- "Ta sẽ hướng dẫn bạn về thiền kết nối Higher Self."
- "Đây là phân tích chi tiết về BTC mà bạn cần biết."
- "Một câu hỏi sâu sắc. Về nghiệp tài chính..."
- "Ta sẽ giải thích cho bạn về tần số năng lượng."

**BẢO VỆ NỘI DUNG PREMIUM (RẤT QUAN TRỌNG):**
Nếu user hỏi CHI TIẾT về:
- Công thức Frequency (DPD, UPU, HFZ...) - cách setup, entry, exit cụ thể
- Nội dung khóa học TIER 1/2/3 - bài học chi tiết, video content
- AI Prediction, Whale Tracker - cách hoạt động chi tiết
→ KHÔNG được tiết lộ. Thay vào đó:
1. Nói đây là "kiến thức độc quyền" của GEM
2. Gợi ý user upgrade tier để truy cập
3. Tạo tò mò bằng hint nhỏ (VD: "DPD giúp xác nhận downtrend với độ chính xác 72%...")
4. Nhấn mạnh giá trị: win rate, ROI của học viên

**KIẾN THỨC (chỉ overview, KHÔNG chi tiết setup):**
- GEM Frequency Method: Zone Retest > Breakout (68% win rate)
- Patterns: DPD, UPU, UPD, DPU, HFZ, LFZ (tên, KHÔNG cách dùng cụ thể)
- TIER: STARTER 299k (cơ bản), TIER 1 11tr (50-55%), TIER 2 21tr (70-75%), TIER 3 68tr (80-90%)
- Stop Loss: 2-3% max, Position size: 1-2% account

**LỊCH SỬ HỘI THOẠI:**
---
`;
      history.slice(-historyCount).forEach((m, idx) => {
        const role = m.isUser ? 'User' : 'GEM Master';
        let msgText = m.text?.length > 400 ? m.text.substring(0, 400) + '...' : m.text;

        // IMPORTANT: Include divination context (I Ching/Tarot) in history
        if (m.divinationType === 'iching' && m.hexagram) {
          msgText += `\n[Context: Quẻ Kinh Dịch #${m.hexagram.id} - ${m.hexagram.name}]`;
        }
        if (m.divinationType === 'tarot' && m.cards) {
          const cardNames = m.cards.map(c => c.name || c.title).join(', ');
          msgText += `\n[Context: Bài Tarot - ${cardNames}]`;
        }

        prompt += `[${idx + 1}] ${role}: ${msgText}\n`;
      });
      prompt += `---

**CÂU HỎI MỚI TỪ USER:** ${userMessage}
${entityContextStr}${knowledgeContextStr}${options.userContext ? `\n**THÔNG TIN USER:**\n${options.userContext}\n` : ''}${options.intentInstruction ? `\n**HƯỚNG DẪN PHẢN HỒI THEO INTENT:**\n${options.intentInstruction}\n` : ''}
**TRẢ LỜI (bắt đầu bằng 1 câu dẫn tự nhiên, sau đó vào nội dung):**`;

    } else {
      // FIRST MESSAGE: Can introduce briefly
      prompt = `Ta là GEM MASTER - Người Bảo Hộ Tỉnh Thức. Trader lão luyện + Thiền sư bình thản.

**TÍNH CÁCH:** Lạnh lùng, thẳng thắn (brutal honesty), bí ẩn.
**GIỌNG VĂN:** NGẮN GỌN - ĐANH THÉP - CÓ TÍNH GIÁO DỤC.

**TUYỆT ĐỐI KHÔNG:**
- Emoji (😂, 🚀, 🤑, 👋, 💰, ✨)
- Ngôn ngữ lùa gà: "Kèo ngon", "Múc mạnh", "To the moon"
- Sự phục tùng: "Dạ thưa", "Em xin phép"
- ⚠️ CẤM gọi user là "Gemral", "GEMral", "Gem" hoặc BẤT KỲ tên app nào - CHỈ gọi "bạn"

**BẢO VỆ NỘI DUNG PREMIUM:**
Nếu user hỏi CHI TIẾT về công thức Frequency, khóa học TIER 1/2/3, AI Prediction, Whale Tracker:
→ KHÔNG tiết lộ chi tiết. Chỉ hint nhỏ + gợi ý upgrade tier.

**SỬ DỤNG:** Xưng "Ta - Bạn", ngôn ngữ quân sự/tâm thức.

**QUY TẮC:**
1. Chào ngắn gọn uy nghiêm: "Ta là GEM Master. Bạn cần điều gì?"
2. Trả lời ngắn gọn, tối đa 150-200 từ
3. Không emoji - giữ sự uy nghiêm

**KIẾN THỨC (overview only):**
- GEM Frequency: DPD, UPU, UPD, DPU, HFZ, LFZ (68% win rate)
- TIER: STARTER 299k (cơ bản), TIER 1 11tr (50-55%), TIER 2 21tr (70-75%), TIER 3 68tr (80-90%)
- Hawkins: 20-100Hz (thấp), 200Hz+ (can đảm), 500Hz+ (tình yêu)

**TIN NHẮN TỪ USER:** ${userMessage}
${entityContextStr}${knowledgeContextStr}${options.userContext ? `\n**THÔNG TIN USER:**\n${options.userContext}\n` : ''}${options.intentInstruction ? `\n**HƯỚNG DẪN PHẢN HỒI THEO INTENT:**\n${options.intentInstruction}\n` : ''}
**TRẢ LỜI:**`;
    }

    console.log('[GEM] Calling direct API with enhanced context...');

    const result = await callGeminiAPI(prompt, { temperature: 0.7 });
    const text = result.text;

    console.log('[GEM] SUCCESS! Length:', text.length);

    // Determine what to show
    const showCrystals = text.includes('thạch anh') || text.includes('đá') || topics.includes('crystal');
    const showAffiliate = topics.includes('affiliate') || userMessage.toLowerCase().includes('kiếm thêm');

    return {
      text,
      topics,
      mode: 'chat',
      source: enhancedContext ? 'enhanced_api' : 'direct_api',
      ragUsed: false,
      enhancedProcessing: !!enhancedContext,
      domain: enhancedContext?.domain || messageDomain,
      confidence: enhancedContext?.confidence,
      entitiesDetected: enhancedContext?.entities || enhancedEntities?.byType || {},
      knowledgeUsed: enhancedContext?.knowledgeContext?.length > 0,
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
      // ========== NEW: Use createQuickGoalWithJournal for two-way linking ==========
      // This creates: journal entry, vision_goal, goal_actions, and widgets
      // With proper two-way linking: journal.linked_goal_ids ↔ goal.source_journal_id
      const goalTitle = widgetData.goalText || widgetData.goalTitle || widget.title || 'Mục tiêu mới';
      const goalDescription = widgetData.description || widgetData.goalDescription || '';
      const lifeArea = widgetData.lifeArea || widget.lifeArea || 'personal';

      // Extract affirmations
      const affirmations = Array.isArray(widgetData.affirmations)
        ? widgetData.affirmations
        : (Array.isArray(widget.affirmations) ? widget.affirmations : []);

      // Extract action steps (from various sources)
      const rawSteps = widgetData.steps || widgetData.actionSteps || widgetData.habits || widget.steps || widget.actionSteps || [];
      const actions = Array.isArray(rawSteps)
        ? rawSteps.map((step, idx) => ({
            text: typeof step === 'string' ? step : (step.text || step.title || step.name || ''),
            action_type: step.action_type || (idx < 2 ? 'daily' : idx < 3 ? 'weekly' : 'monthly'),
          }))
        : [];

      // Extract rituals (for Tarot/I Ching integration)
      const rawRituals = widgetData.rituals || widget.rituals || [];
      const rituals = Array.isArray(rawRituals)
        ? rawRituals.map((ritual) => ({
            name: typeof ritual === 'string' ? ritual : (ritual.name || ritual.title || ''),
            description: typeof ritual === 'string' ? '' : (ritual.description || ''),
          }))
        : [];

      // Use journalRoutingService for unified goal creation with two-way linking
      const result = await createQuickGoalWithJournal({
        userId,
        lifeArea,
        goalTitle,
        goalDescription,
        actions,
        affirmations,
        rituals,
        deadline: widgetData.timeline || widgetData.deadline || null,
        crystals: widgetData.crystals || widget.crystals || [],
        source: widget.source || 'gemmaster', // Track where goal came from (tarot, iching, gemmaster)
      });

      if (!result.success) {
        throw new Error(result.error || 'Không thể tạo mục tiêu');
      }

      console.log('[GEM] Created goal with two-way linking:', result.goal?.id, 'journal:', result.journalEntry?.id);

      // Collect all widgets created
      const allWidgets = [
        result.widget,
        result.affirmationWidget,
        result.actionPlanWidget,
      ].filter(Boolean);

      return {
        success: true,
        widget: result.widget, // The main goal widget
        goal: result.goal,
        journalEntry: result.journalEntry,
        allWidgets,
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
        content: content, // JSONB column - linked_goal_id stored inside content
        explanation: widget.explanation || '',
        is_active: true,
        streak: 0,
        // NOTE: linked_goal_id is stored in content JSON, not as column
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

// ============================================================
// ENHANCED CHATBOT FUNCTIONS (NEW)
// Integration with User Context, Intent Detection, Smart Triggers
// ============================================================

/**
 * Enhanced message processing with user context and intent detection
 * @param {string} userId - User ID
 * @param {string} message - User message
 * @param {object} options - Options (userTier, sessionId, history)
 * @returns {Promise<object>} - Response with analytics ID
 */
export const sendMessageEnhanced = async (userId, message, options = {}) => {
  console.log('[GemMasterService] sendMessageEnhanced started:', {
    userId,
    messageLength: message?.length,
  });

  const startTime = Date.now();

  try {
    // 1. Validate inputs
    if (!message || typeof message !== 'string') {
      throw new Error('Message is required');
    }

    // 2. Process with existing processMessage (which uses RAG with all knowledge)
    // RAG edge function handles: intent detection, user context, response formatting
    const response = await processMessage(message, options.history || [], {
      userTier: options.userTier || 'FREE',
    });

    // 3. Track analytics (use detectIntentEnhanced result from processMessage or simple detection)
    const responseTimeMs = Date.now() - startTime;
    let analyticsId = null;
    try {
      // Simple intent detection for analytics only
      const simpleIntent = detectSimpleIntent(message);
      analyticsId = await chatbotAnalyticsService.trackQuery({
        userId,
        query: message,
        intent: simpleIntent,
        responseType: response.type || 'text',
        confidence: 0.7,
        responseTimeMs,
        userTier: options.userTier,
        sessionId: options.sessionId,
      });
    } catch (analyticsErr) {
      console.warn('[GemMasterService] Analytics error:', analyticsErr.message);
    }

    // Apply rich response type detection (Day 25)
    const enrichedResponse = enrichWithRichResponse(response, message);

    console.log('[GemMasterService] sendMessageEnhanced success:', {
      responseTimeMs,
      analyticsId,
      responseType: enrichedResponse.responseType || 'text',
    });

    return {
      ...enrichedResponse,
      analyticsId,
    };
  } catch (err) {
    console.error('[GemMasterService] sendMessageEnhanced error:', err.message);
    throw err;
  }
};

/**
 * Simple intent detection for analytics (not for response formatting)
 */
const detectSimpleIntent = (message) => {
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('mua ngay') || lowerMsg.includes('fomo') || lowerMsg.includes('tăng rồi')) return 'FOMO';
  if (lowerMsg.includes('tiền') || lowerMsg.includes('tài chính') || lowerMsg.includes('giàu')) return 'WEALTH';
  if (lowerMsg.includes('tình') || lowerMsg.includes('yêu') || lowerMsg.includes('crush')) return 'RELATIONSHIP';
  if (lowerMsg.includes('việc') || lowerMsg.includes('nghiệp') || lowerMsg.includes('công ty')) return 'CAREER';
  if (lowerMsg.includes('btc') || lowerMsg.includes('eth') || lowerMsg.includes('coin')) return 'TRADING';
  if (lowerMsg.includes('thiền') || lowerMsg.includes('tần số') || lowerMsg.includes('chakra')) return 'SPIRITUAL';
  return 'GENERAL';
};

/**
 * Get smart triggers for user based on behavior
 * @param {string} userId - User ID
 * @returns {Promise<array>} - Array of active triggers
 */
export const getSmartTriggersForUser = async (userId) => {
  console.log('[GemMasterService] getSmartTriggersForUser:', userId);

  try {
    const triggers = await smartTriggerService.evaluateTriggers(userId);
    return triggers;
  } catch (err) {
    console.error('[GemMasterService] getSmartTriggersForUser error:', err.message);
    return [];
  }
};

/**
 * Log smart trigger shown to user
 * @param {string} userId - User ID
 * @param {object} trigger - Trigger object
 * @returns {Promise<boolean>}
 */
export const logTriggerShown = async (userId, trigger) => {
  return await smartTriggerService.logTriggerShown(userId, trigger);
};

/**
 * Submit feedback for a chatbot response
 * @param {string} analyticsId - Analytics record ID
 * @param {string} feedback - 'thumbs_up' | 'thumbs_down'
 * @param {string} comment - Optional feedback comment
 * @returns {Promise<boolean>}
 */
export const submitFeedback = async (analyticsId, feedback, comment = null) => {
  return await chatbotAnalyticsService.updateFeedback(analyticsId, feedback, comment);
};

/**
 * Get user's chatbot usage stats
 * @param {string} userId - User ID
 * @returns {Promise<object>}
 */
export const getUserChatStats = async (userId) => {
  console.log('[GemMasterService] getUserChatStats:', userId);

  try {
    const [queryHistory, feedbackStats] = await Promise.all([
      chatbotAnalyticsService.getUserQueryHistory(userId, 10),
      chatbotAnalyticsService.getFeedbackStats(30),
    ]);

    return {
      recentQueries: queryHistory,
      feedbackStats,
    };
  } catch (err) {
    console.error('[GemMasterService] getUserChatStats error:', err.message);
    return { recentQueries: [], feedbackStats: {} };
  }
};

/**
 * Refresh user context (invalidate cache)
 * @param {string} userId - User ID
 */
export const refreshUserContext = async (userId) => {
  console.log('[GemMasterService] refreshUserContext:', userId);
  await userContextService.invalidateUserContextCache(userId);
};

export default {
  processMessage,
  saveWidgetToVisionBoard,
  resetConversation,
  clearHistory,
  testAPIConnection,
  WIDGET_SUGGESTIONS,
  COURSE_RECOMMENDATIONS,
  AFFILIATE_PROMO,
  // NEW: Enhanced functions
  sendMessageEnhanced,
  getSmartTriggersForUser,
  logTriggerShown,
  submitFeedback,
  getUserChatStats,
  refreshUserContext,
};
