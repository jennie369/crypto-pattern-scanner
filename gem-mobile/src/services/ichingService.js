/**
 * I Ching Service - Vision Board 2.0
 * Coin throwing, hexagram generation, AI interpretation
 * Created: December 10, 2025
 */

import { supabase } from './supabase';
import geminiService from './geminiService';
import HEXAGRAM_DATABASE, { getHexagramByNumber, getTradingInterpretation, getAllHexagrams } from '../data/ichingHexagrams';

// ============ TRIGRAMS (8 Quái) ============
export const TRIGRAMS = {
  heaven: { lines: [1, 1, 1], name: 'Qián', nameVi: 'Càn', element: 'Kim', meaning: 'Trời', attribute: 'Mạnh mẽ' },
  earth: { lines: [0, 0, 0], name: 'Kūn', nameVi: 'Khôn', element: 'Thổ', meaning: 'Đất', attribute: 'Thuận theo' },
  thunder: { lines: [1, 0, 0], name: 'Zhèn', nameVi: 'Chấn', element: 'Mộc', meaning: 'Sấm', attribute: 'Chấn động' },
  water: { lines: [0, 1, 0], name: 'Kǎn', nameVi: 'Khảm', element: 'Thủy', meaning: 'Nước', attribute: 'Hiểm nguy' },
  mountain: { lines: [0, 0, 1], name: 'Gèn', nameVi: 'Cấn', element: 'Thổ', meaning: 'Núi', attribute: 'Dừng lại' },
  wind: { lines: [1, 1, 0], name: 'Xùn', nameVi: 'Tốn', element: 'Mộc', meaning: 'Gió', attribute: 'Thuận nhập' },
  fire: { lines: [1, 0, 1], name: 'Lí', nameVi: 'Ly', element: 'Hỏa', meaning: 'Lửa', attribute: 'Sáng sủa' },
  lake: { lines: [0, 1, 1], name: 'Duì', nameVi: 'Đoài', element: 'Kim', meaning: 'Hồ', attribute: 'Vui vẻ' },
};

// ============ 64 HEXAGRAMS (từ ichingHexagrams.js) ============
// Sử dụng đầy đủ 64 quẻ từ HEXAGRAM_DATABASE
export const HEXAGRAMS = getAllHexagrams().map(hex => ({
  number: hex.number,
  name: hex.name,
  nameVi: hex.name,
  meaning: hex.meaning,
  meaningVi: hex.meaning,
  lines: hex.lines,
  chinese: hex.chinese,
  essence: hex.essence,
  trading: hex.trading,
}));

// ============ THROW COINS ============
export const throwCoins = () => {
  // Throw 3 coins
  const coins = [
    Math.random() > 0.5 ? 3 : 2, // Heads = 3, Tails = 2
    Math.random() > 0.5 ? 3 : 2,
    Math.random() > 0.5 ? 3 : 2,
  ];

  const sum = coins.reduce((a, b) => a + b, 0);

  // Sum meanings:
  // 6 = Old Yin (broken, changing) - ---x---
  // 7 = Young Yang (solid) - -------
  // 8 = Young Yin (broken) - --- ---
  // 9 = Old Yang (solid, changing) - ===o===

  return {
    coins,
    sum,
    line: sum % 2 === 1 ? 1 : 0, // Odd = yang (1), Even = yin (0)
    isChanging: sum === 6 || sum === 9,
    type: sum === 6 ? 'old_yin' : sum === 7 ? 'young_yang' : sum === 8 ? 'young_yin' : 'old_yang',
  };
};

// ============ GENERATE HEXAGRAM ============
export const generateHexagram = () => {
  const throws = [];
  const lines = [];
  const changingLines = [];

  // Throw 6 times (bottom to top)
  for (let i = 0; i < 6; i++) {
    const result = throwCoins();
    throws.push(result);
    lines.push(result.line);
    if (result.isChanging) {
      changingLines.push(i);
    }
  }

  // Find primary hexagram
  const primaryHexagram = findHexagram(lines);

  // Calculate relating hexagram (if changing lines exist)
  let relatingHexagram = null;
  if (changingLines.length > 0) {
    const changedLines = lines.map((l, i) =>
      changingLines.includes(i) ? (l === 1 ? 0 : 1) : l
    );
    relatingHexagram = findHexagram(changedLines);
  }

  return {
    throws,
    lines,
    changingLines,
    primaryHexagram,
    relatingHexagram,
  };
};

// ============ FIND HEXAGRAM ============
const findHexagram = (lines) => {
  return HEXAGRAMS.find(h =>
    h.lines.every((l, i) => l === lines[i])
  ) || HEXAGRAMS[0];
};

// ============ AI INTERPRETATION ============
export const getAIInterpretation = async (hexagram, question) => {
  try {
    const changingLinesText = hexagram.changingLines.length > 0
      ? `Hào động: ${hexagram.changingLines.map(l => l + 1).join(', ')}`
      : 'Không có hào động';

    const relatingText = hexagram.relatingHexagram
      ? `Quẻ biến: ${hexagram.relatingHexagram.number}. ${hexagram.relatingHexagram.nameVi} (${hexagram.relatingHexagram.meaningVi})`
      : '';

    // Get trading knowledge from database
    const hexData = getHexagramByNumber(hexagram.primaryHexagram.number);
    const tradingInfo = hexData ? getTradingInterpretation(hexData) : null;
    const tradingContext = tradingInfo
      ? `\n\n📊 DỮ LIỆU TRADING TỪ KNOWLEDGE BASE:
- Xu hướng: ${tradingInfo.trend}
- Tín hiệu: ${tradingInfo.signal}
- Hành động: ${tradingInfo.actionList.join(', ')}`
      : '';

    const prompt = `Bạn là Master Sư Phụ - một đạo sĩ Kinh Dịch kết hợp với trading crypto. Giải quẻ theo format sau:

Câu hỏi: ${question || 'Thị trường crypto hôm nay như thế nào?'}

**QUẺ ${hexagram.primaryHexagram.number} - ${hexagram.primaryHexagram.nameVi.toUpperCase()}** ${hexData?.chinese || ''}

${changingLinesText}
${relatingText}
${tradingContext}

---

TRƯỚC TIÊN, cho output NGẮN GỌN như format này:

**Ý nghĩa:** [1 câu ngắn gọn về bản chất quẻ]

**📊 Góc nhìn thị trường:**
→ [Xu hướng thị trường: sideway/uptrend/downtrend/volatile]
→ [1 hành động cụ thể]
→ [1 lời nhắc quan trọng]

**🔮 Lời khuyên:**
[2-3 câu ngắn, súc tích, dễ hiểu]

---

SAU ĐÓ, nếu có hào động hoặc quẻ biến, giải thích thêm ngắn gọn.

QUAN TRỌNG:
- Giọng văn uyên bác nhưng DỄ HIỂU
- Sử dụng emoji phù hợp
- KHÔNG viết dài dòng
- Nếu câu hỏi về trading/crypto, ưu tiên góc nhìn thị trường
- Dùng → để bullet point`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    let text;
    try {
      const response = await geminiService.callEdgeFunction({
        feature: 'i_ching',
        messages: [
          { role: 'user', parts: [{ text: prompt }] },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
        },
        metadata: { requestType: 'i_ching' },
      });
      text = response?.text || 'Không thể giải quẻ lúc này.';
    } finally {
      clearTimeout(timeoutId);
    }

    return {
      interpretation: text,
      hexagram,
      question,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[ichingService] getAIInterpretation error:', err);
    throw err;
  }
};

// ============ SAVE READING ============
export const saveReading = async (userId, reading) => {
  try {
    const { data, error } = await supabase
      .from('divination_readings')
      .insert({
        user_id: userId,
        type: 'iching',
        question: reading.question,
        hexagram_number: reading.hexagram.primaryHexagram.number,
        hexagram_data: reading.hexagram,
        interpretation: reading.interpretation,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[ichingService] saveReading error:', err);
    throw err;
  }
};

// ============ GET READING HISTORY ============
export const getReadingHistory = async (userId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('divination_readings')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'iching')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[ichingService] getReadingHistory error:', err);
    return [];
  }
};

// ============ CHECK QUOTA ============
export const checkQuota = async (userId, userTier = 'free') => {
  const quotas = {
    free: 5,
    tier1: 15,
    tier2: 999,
    tier3: 999,
  };

  const today = new Date().toISOString().split('T')[0];

  try {
    const { count } = await supabase
      .from('divination_readings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', 'iching')
      .gte('created_at', today);

    const used = count || 0;
    const limit = quotas[userTier] || quotas.free;

    return {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      canRead: used < limit,
    };
  } catch (err) {
    console.error('[ichingService] checkQuota error:', err);
    return { used: 0, limit: 5, remaining: 5, canRead: true };
  }
};

// ============ GET READING BY ID ============
export const getReadingById = async (readingId) => {
  try {
    const { data, error } = await supabase
      .from('divination_readings')
      .select('*')
      .eq('id', readingId)
      .eq('type', 'iching')
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[ichingService] getReadingById error:', err);
    return null;
  }
};

export default {
  TRIGRAMS,
  HEXAGRAMS,
  throwCoins,
  generateHexagram,
  getAIInterpretation,
  saveReading,
  getReadingHistory,
  checkQuota,
  getReadingById,
};
