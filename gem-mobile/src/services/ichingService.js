/**
 * I Ching Service - Vision Board 2.0
 * Coin throwing, hexagram generation, AI interpretation
 * Created: December 10, 2025
 */

import { supabase } from './supabase';
import { GEMINI_CONFIG } from '../config/gemini.config';

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

// ============ 64 HEXAGRAMS ============
export const HEXAGRAMS = [
  { number: 1, name: 'Qián', nameVi: 'Càn', meaning: 'The Creative', meaningVi: 'Thuần Càn - Sáng tạo', lines: [1, 1, 1, 1, 1, 1], upper: 'heaven', lower: 'heaven' },
  { number: 2, name: 'Kūn', nameVi: 'Khôn', meaning: 'The Receptive', meaningVi: 'Thuần Khôn - Tiếp nhận', lines: [0, 0, 0, 0, 0, 0], upper: 'earth', lower: 'earth' },
  { number: 3, name: 'Zhūn', nameVi: 'Truân', meaning: 'Difficulty at Beginning', meaningVi: 'Thủy Lôi Truân - Khó khăn ban đầu', lines: [0, 1, 0, 1, 0, 0], upper: 'water', lower: 'thunder' },
  { number: 4, name: 'Méng', nameVi: 'Mông', meaning: 'Youthful Folly', meaningVi: 'Sơn Thủy Mông - Ngu dại', lines: [0, 0, 1, 0, 1, 0], upper: 'mountain', lower: 'water' },
  { number: 5, name: 'Xū', nameVi: 'Nhu', meaning: 'Waiting', meaningVi: 'Thủy Thiên Nhu - Chờ đợi', lines: [0, 1, 0, 1, 1, 1], upper: 'water', lower: 'heaven' },
  { number: 6, name: 'Sòng', nameVi: 'Tụng', meaning: 'Conflict', meaningVi: 'Thiên Thủy Tụng - Tranh tụng', lines: [1, 1, 1, 0, 1, 0], upper: 'heaven', lower: 'water' },
  { number: 7, name: 'Shī', nameVi: 'Sư', meaning: 'The Army', meaningVi: 'Địa Thủy Sư - Quân đội', lines: [0, 0, 0, 0, 1, 0], upper: 'earth', lower: 'water' },
  { number: 8, name: 'Bǐ', nameVi: 'Tỷ', meaning: 'Holding Together', meaningVi: 'Thủy Địa Tỷ - Liên kết', lines: [0, 1, 0, 0, 0, 0], upper: 'water', lower: 'earth' },
  { number: 9, name: 'Xiǎo Chù', nameVi: 'Tiểu Súc', meaning: 'Small Taming', meaningVi: 'Phong Thiên Tiểu Súc', lines: [1, 1, 0, 1, 1, 1], upper: 'wind', lower: 'heaven' },
  { number: 10, name: 'Lǚ', nameVi: 'Lý', meaning: 'Treading', meaningVi: 'Thiên Trạch Lý - Bước đi', lines: [1, 1, 1, 0, 1, 1], upper: 'heaven', lower: 'lake' },
  { number: 11, name: 'Tài', nameVi: 'Thái', meaning: 'Peace', meaningVi: 'Địa Thiên Thái - Thái hòa', lines: [0, 0, 0, 1, 1, 1], upper: 'earth', lower: 'heaven' },
  { number: 12, name: 'Pǐ', nameVi: 'Bĩ', meaning: 'Standstill', meaningVi: 'Thiên Địa Bĩ - Bế tắc', lines: [1, 1, 1, 0, 0, 0], upper: 'heaven', lower: 'earth' },
  { number: 13, name: 'Tóng Rén', nameVi: 'Đồng Nhân', meaning: 'Fellowship', meaningVi: 'Thiên Hỏa Đồng Nhân', lines: [1, 1, 1, 1, 0, 1], upper: 'heaven', lower: 'fire' },
  { number: 14, name: 'Dà Yǒu', nameVi: 'Đại Hữu', meaning: 'Great Possession', meaningVi: 'Hỏa Thiên Đại Hữu', lines: [1, 0, 1, 1, 1, 1], upper: 'fire', lower: 'heaven' },
  { number: 15, name: 'Qiān', nameVi: 'Khiêm', meaning: 'Modesty', meaningVi: 'Địa Sơn Khiêm - Khiêm tốn', lines: [0, 0, 0, 0, 0, 1], upper: 'earth', lower: 'mountain' },
  { number: 16, name: 'Yù', nameVi: 'Dự', meaning: 'Enthusiasm', meaningVi: 'Lôi Địa Dự - Hoan hỉ', lines: [1, 0, 0, 0, 0, 0], upper: 'thunder', lower: 'earth' },
  { number: 17, name: 'Suí', nameVi: 'Tùy', meaning: 'Following', meaningVi: 'Trạch Lôi Tùy - Theo dõi', lines: [0, 1, 1, 1, 0, 0], upper: 'lake', lower: 'thunder' },
  { number: 18, name: 'Gǔ', nameVi: 'Cổ', meaning: 'Work on Decayed', meaningVi: 'Sơn Phong Cổ - Sửa chữa', lines: [0, 0, 1, 1, 1, 0], upper: 'mountain', lower: 'wind' },
  { number: 19, name: 'Lín', nameVi: 'Lâm', meaning: 'Approach', meaningVi: 'Địa Trạch Lâm - Tiếp cận', lines: [0, 0, 0, 0, 1, 1], upper: 'earth', lower: 'lake' },
  { number: 20, name: 'Guān', nameVi: 'Quán', meaning: 'Contemplation', meaningVi: 'Phong Địa Quán - Chiêm ngưỡng', lines: [1, 1, 0, 0, 0, 0], upper: 'wind', lower: 'earth' },
  // Continue with remaining hexagrams...
  { number: 29, name: 'Kǎn', nameVi: 'Khảm', meaning: 'The Abysmal Water', meaningVi: 'Thuần Khảm - Hiểm nguy', lines: [0, 1, 0, 0, 1, 0], upper: 'water', lower: 'water' },
  { number: 30, name: 'Lí', nameVi: 'Ly', meaning: 'The Clinging Fire', meaningVi: 'Thuần Ly - Lửa sáng', lines: [1, 0, 1, 1, 0, 1], upper: 'fire', lower: 'fire' },
  { number: 45, name: 'Cuì', nameVi: 'Tụ', meaning: 'Gathering Together', meaningVi: 'Trạch Địa Tụ - Tập hợp', lines: [0, 1, 1, 0, 0, 0], upper: 'lake', lower: 'earth' },
  { number: 63, name: 'Jì Jì', nameVi: 'Ký Tế', meaning: 'After Completion', meaningVi: 'Thủy Hỏa Ký Tế', lines: [0, 1, 0, 1, 0, 1], upper: 'water', lower: 'fire' },
  { number: 64, name: 'Wèi Jì', nameVi: 'Vị Tế', meaning: 'Before Completion', meaningVi: 'Hỏa Thủy Vị Tế', lines: [1, 0, 1, 0, 1, 0], upper: 'fire', lower: 'water' },
];

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

    const prompt = `Bạn là một đạo sĩ Kinh Dịch với 30 năm kinh nghiệm. Hãy giải quẻ sau:

Câu hỏi: ${question || 'Điều gì đang chờ đợi tôi?'}

Quẻ chính: ${hexagram.primaryHexagram.number}. ${hexagram.primaryHexagram.nameVi} (${hexagram.primaryHexagram.meaningVi})
${changingLinesText}
${relatingText}

Hãy đưa ra:
1. Ý nghĩa tổng quát của quẻ (2-3 câu)
2. Giải thích liên quan đến câu hỏi
3. Nếu có hào động, giải thích ý nghĩa của các hào động
4. Nếu có quẻ biến, giải thích sự biến đổi
5. Lời khuyên cụ thể cho người hỏi (3-4 điểm)
6. Nếu liên quan đến tài chính/đầu tư, đưa ra góc nhìn trading

Trả lời bằng tiếng Việt, giọng văn uyên bác nhưng dễ hiểu. Sử dụng emoji phù hợp.`;

    const apiKey = GEMINI_CONFIG.apiKey;

    if (!apiKey) {
      console.warn('[ichingService] No Gemini API key found');
      return {
        interpretation: 'Chưa có API key để giải quẻ. Vui lòng cấu hình GEMINI_CONFIG.apiKey.',
        hexagram,
        question,
        timestamp: new Date().toISOString(),
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
          },
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không thể giải quẻ lúc này.';

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
