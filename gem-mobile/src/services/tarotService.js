/**
 * Tarot Service - Vision Board 2.0
 * Tarot card drawing, AI interpretation, reading history
 * Created: December 10, 2025
 */

import { supabase } from './supabase';
import geminiService from './geminiService';

// ============ TAROT CARDS - MAJOR ARCANA ============
export const MAJOR_ARCANA = [
  { id: 0, name: 'The Fool', nameVi: 'Kẻ Khờ', image: 'fool', keywords: ['beginnings', 'innocence', 'spontaneity', 'free spirit'] },
  { id: 1, name: 'The Magician', nameVi: 'Nhà Ảo Thuật', image: 'magician', keywords: ['manifestation', 'power', 'action', 'resourcefulness'] },
  { id: 2, name: 'The High Priestess', nameVi: 'Nữ Tư Tế', image: 'high_priestess', keywords: ['intuition', 'mystery', 'wisdom', 'inner knowledge'] },
  { id: 3, name: 'The Empress', nameVi: 'Nữ Hoàng', image: 'empress', keywords: ['femininity', 'abundance', 'nature', 'nurturing'] },
  { id: 4, name: 'The Emperor', nameVi: 'Hoàng Đế', image: 'emperor', keywords: ['authority', 'structure', 'control', 'fatherhood'] },
  { id: 5, name: 'The Hierophant', nameVi: 'Giáo Hoàng', image: 'hierophant', keywords: ['tradition', 'conformity', 'morality', 'spiritual wisdom'] },
  { id: 6, name: 'The Lovers', nameVi: 'Người Yêu', image: 'lovers', keywords: ['love', 'harmony', 'relationships', 'choices'] },
  { id: 7, name: 'The Chariot', nameVi: 'Cỗ Xe', image: 'chariot', keywords: ['control', 'willpower', 'success', 'determination'] },
  { id: 8, name: 'Strength', nameVi: 'Sức Mạnh', image: 'strength', keywords: ['courage', 'patience', 'influence', 'compassion'] },
  { id: 9, name: 'The Hermit', nameVi: 'Ẩn Sĩ', image: 'hermit', keywords: ['soul-searching', 'introspection', 'inner guidance', 'solitude'] },
  { id: 10, name: 'Wheel of Fortune', nameVi: 'Bánh Xe Vận Mệnh', image: 'wheel', keywords: ['good luck', 'karma', 'life cycles', 'destiny'] },
  { id: 11, name: 'Justice', nameVi: 'Công Lý', image: 'justice', keywords: ['fairness', 'truth', 'cause and effect', 'law'] },
  { id: 12, name: 'The Hanged Man', nameVi: 'Người Treo', image: 'hanged_man', keywords: ['surrender', 'letting go', 'new perspective', 'sacrifice'] },
  { id: 13, name: 'Death', nameVi: 'Tử Thần', image: 'death', keywords: ['endings', 'change', 'transformation', 'transition'] },
  { id: 14, name: 'Temperance', nameVi: 'Tiết Độ', image: 'temperance', keywords: ['balance', 'moderation', 'patience', 'purpose'] },
  { id: 15, name: 'The Devil', nameVi: 'Ác Quỷ', image: 'devil', keywords: ['shadow self', 'attachment', 'addiction', 'restriction'] },
  { id: 16, name: 'The Tower', nameVi: 'Tòa Tháp', image: 'tower', keywords: ['sudden change', 'upheaval', 'chaos', 'revelation'] },
  { id: 17, name: 'The Star', nameVi: 'Ngôi Sao', image: 'star', keywords: ['hope', 'faith', 'purpose', 'renewal'] },
  { id: 18, name: 'The Moon', nameVi: 'Mặt Trăng', image: 'moon', keywords: ['illusion', 'fear', 'anxiety', 'subconscious'] },
  { id: 19, name: 'The Sun', nameVi: 'Mặt Trời', image: 'sun', keywords: ['positivity', 'fun', 'warmth', 'success', 'vitality'] },
  { id: 20, name: 'Judgement', nameVi: 'Phán Xét', image: 'judgement', keywords: ['reflection', 'reckoning', 'awakening', 'inner calling'] },
  { id: 21, name: 'The World', nameVi: 'Thế Giới', image: 'world', keywords: ['completion', 'integration', 'accomplishment', 'travel'] },
];

// ============ MINOR ARCANA SUITS ============
const SUITS = {
  wands: { name: 'Wands', nameVi: 'Gậy', element: 'Fire' },
  cups: { name: 'Cups', nameVi: 'Cốc', element: 'Water' },
  swords: { name: 'Swords', nameVi: 'Kiếm', element: 'Air' },
  pentacles: { name: 'Pentacles', nameVi: 'Tiền', element: 'Earth' },
};

const RANKS = [
  { value: 1, name: 'Ace', nameVi: 'Át' },
  { value: 2, name: 'Two', nameVi: 'Hai' },
  { value: 3, name: 'Three', nameVi: 'Ba' },
  { value: 4, name: 'Four', nameVi: 'Bốn' },
  { value: 5, name: 'Five', nameVi: 'Năm' },
  { value: 6, name: 'Six', nameVi: 'Sáu' },
  { value: 7, name: 'Seven', nameVi: 'Bảy' },
  { value: 8, name: 'Eight', nameVi: 'Tám' },
  { value: 9, name: 'Nine', nameVi: 'Chín' },
  { value: 10, name: 'Ten', nameVi: 'Mười' },
  { value: 11, name: 'Page', nameVi: 'Chàng Trai' },
  { value: 12, name: 'Knight', nameVi: 'Hiệp Sĩ' },
  { value: 13, name: 'Queen', nameVi: 'Hoàng Hậu' },
  { value: 14, name: 'King', nameVi: 'Nhà Vua' },
];

// Generate Minor Arcana
const generateMinorArcana = () => {
  const cards = [];
  Object.keys(SUITS).forEach(suitKey => {
    const suit = SUITS[suitKey];
    RANKS.forEach(rank => {
      cards.push({
        id: `${suitKey}_${rank.value.toString().padStart(2, '0')}`,
        name: `${rank.name} of ${suit.name}`,
        nameVi: `${rank.nameVi} ${suit.nameVi}`,
        image: `${suitKey}_${rank.value.toString().padStart(2, '0')}`,
        suit: suitKey,
        suitVi: suit.nameVi,
        rank: rank.value,
        element: suit.element,
      });
    });
  });
  return cards;
};

export const MINOR_ARCANA = generateMinorArcana();

export const TAROT_CARDS = [...MAJOR_ARCANA, ...MINOR_ARCANA];

// ============ SPREAD TYPES ============
export const SPREAD_TYPES = {
  single: { cards: 1, name: 'Single Card', nameVi: 'Một lá bài', description: 'Câu trả lời nhanh' },
  threeCard: { cards: 3, name: 'Three Card', nameVi: 'Ba lá bài', description: 'Quá khứ - Hiện tại - Tương lai' },
  celticCross: { cards: 10, name: 'Celtic Cross', nameVi: 'Chữ Thập Celtic', description: 'Phân tích chi tiết' },
};

// ============ DRAW RANDOM CARDS ============
export const drawCards = (count, allowReversed = true) => {
  const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
  const drawn = shuffled.slice(0, count);

  return drawn.map(card => ({
    ...card,
    isReversed: allowReversed ? Math.random() > 0.5 : false,
  }));
};

// ============ AI INTERPRETATION ============
export const getAIInterpretation = async (cards, question, spreadType = 'threeCard') => {
  try {
    const positions = {
      single: ['Câu trả lời'],
      threeCard: ['Quá khứ', 'Hiện tại', 'Tương lai'],
      celticCross: ['Hiện tại', 'Thử thách', 'Quá khứ xa', 'Quá khứ gần', 'Tương lai', 'Tiềm thức', 'Lời khuyên', 'Ảnh hưởng', 'Hy vọng/Sợ hãi', 'Kết quả'],
    };

    const positionNames = positions[spreadType] || positions.threeCard;

    const cardsDescription = cards.map((card, i) => {
      const position = positionNames[i] || `Lá ${i + 1}`;
      const reversed = card.isReversed ? ' (Ngược)' : '';
      return `${position}: ${card.nameVi} - ${card.name}${reversed}`;
    }).join('\n');

    const prompt = `Bạn là một chuyên gia Tarot với 20 năm kinh nghiệm. Hãy giải bài Tarot sau:

Câu hỏi: ${question || 'Điều gì đang chờ đợi tôi?'}

Các lá bài:
${cardsDescription}

Hãy đưa ra:
1. Ý nghĩa tổng quan của trải bài (2-3 câu)
2. Giải thích từng lá bài trong context câu hỏi
3. Lời khuyên cụ thể và thiết thực (3-4 điểm)
4. Nếu liên quan đến tài chính/đầu tư, đưa ra góc nhìn trading

Trả lời bằng tiếng Việt, giọng văn thân thiện nhưng sâu sắc. Sử dụng emoji phù hợp.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    let text;
    try {
      const response = await geminiService.callEdgeFunction({
        feature: 'tarot',
        messages: [
          { role: 'user', parts: [{ text: prompt }] },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
        },
        metadata: { requestType: 'tarot' },
      });
      text = response?.text || 'Không thể giải bài lúc này.';
    } finally {
      clearTimeout(timeoutId);
    }

    return {
      interpretation: text,
      cards,
      question,
      spreadType,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[tarotService] getAIInterpretation error:', err);
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
        type: 'tarot',
        question: reading.question,
        cards: reading.cards,
        spread_type: reading.spreadType,
        interpretation: reading.interpretation,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[tarotService] saveReading error:', err);
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
      .eq('type', 'tarot')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[tarotService] getReadingHistory error:', err);
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
      .eq('type', 'tarot')
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
    console.error('[tarotService] checkQuota error:', err);
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
      .eq('type', 'tarot')
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[tarotService] getReadingById error:', err);
    return null;
  }
};

// ============ DELETE READING ============
export const deleteReading = async (readingId) => {
  try {
    await supabase
      .from('divination_readings')
      .delete()
      .eq('id', readingId);
    return true;
  } catch (err) {
    console.error('[tarotService] deleteReading error:', err);
    throw err;
  }
};

export default {
  TAROT_CARDS,
  MAJOR_ARCANA,
  MINOR_ARCANA,
  SPREAD_TYPES,
  drawCards,
  getAIInterpretation,
  saveReading,
  getReadingHistory,
  checkQuota,
  getReadingById,
  deleteReading,
};
