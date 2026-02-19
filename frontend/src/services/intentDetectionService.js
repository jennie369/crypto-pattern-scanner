/**
 * Intent Detection Service (Web)
 * Ported from gem-mobile/src/services/intentDetectionService.js
 *
 * Classifies user intent from message using keyword matching.
 * Pure JavaScript - no mobile dependencies.
 */

const SERVICE_NAME = '[IntentDetectionService]';

// ============================================================
// INTENT CATEGORIES & KEYWORDS
// ============================================================

export const INTENT_CATEGORIES = {
  LEARNING: {
    name: 'LEARNING',
    keywords: ['hoc', 'hieu', 'giai thich', 'la gi', 'the nao', 'tai sao', 'nhu the nao', 'cach', 'huong dan', 'day', 'teach', 'explain', 'what is', 'how to'],
    responseStyle: {
      tone: 'educational',
      depth: 'detailed',
      includeExamples: true,
    },
    priority: 3,
  },
  TRADING: {
    name: 'TRADING',
    keywords: ['entry', 'exit', 'trade', 'setup', 'signal', 'btc', 'eth', 'bitcoin', 'pattern', 'dpd', 'upu', 'dpu', 'upd', 'chart', 'gia', 'mua', 'ban', 'long', 'short', 'stoploss', 'tp', 'crypto', 'coin', 'market', 'trend', 'breakout', 'support', 'resistance'],
    responseStyle: {
      tone: 'disciplined',
      depth: 'technical',
      includeWarnings: true,
    },
    priority: 1,
  },
  FOMO_TRADING: {
    name: 'FOMO_TRADING',
    keywords: ['mua ngay', 'nhay vao', 'vao ngay', 'tang roi', 'tang % roi', 'pump roi', 'so lo', 'bo lo', 'khong kip', 'dang tang', 'dang pump', 'tang manh', 'rocket', 'moon', 'fomo', 'nhay lenh', 'vao lenh ngay', 'mua gap', 'all in', 'cho gi nua'],
    responseStyle: {
      tone: 'protective',
      depth: 'analytical',
      includeFOMOCheck: true,
    },
    priority: 0,
  },
  EMOTIONAL: {
    name: 'EMOTIONAL',
    keywords: ['buon', 'lo', 'so', 'thua', 'mat', 'stress', 'lo lang', 'chan', 'that vong', 'tuc gian', 'buc', 'met', 'kiet suc', 'ap luc', 'fomo', 'fud', 'sad', 'worry', 'fear', 'anxious', 'depressed', 'overwhelmed'],
    responseStyle: {
      tone: 'empathetic',
      depth: 'supportive',
      includeHealing: true,
    },
    priority: 2,
  },
  RELATIONSHIP: {
    name: 'RELATIONSHIP',
    keywords: ['nguoi ay', 'dinh menh', 'duyen', 'nua kia', 'tinh duyen', 'yeu', 'crush', 'ban trai', 'ban gai', 'vo', 'chong', 'chia tay', 'hen ho', 'ket hon', 'moi quan he', 'soulmate', 'twin flame', 'nguoi yeu', 'ex', 'tinh cu', 'phai long', 'co duyen', 'hop tuoi'],
    responseStyle: {
      tone: 'compassionate',
      depth: 'insightful',
      includeEnergy: true,
    },
    priority: 2,
  },
  CAREER: {
    name: 'CAREER',
    keywords: ['doi viec', 'nghi viec', 'su nghiep', 'cong viec', 'career', 'job', 'luong', 'sep', 'dong nghiep', 'thang tien', 'o lai', 'nhay viec', 'khoi nghiep', 'startup', 'kinh doanh', 'mo shop', 'freelance', 'that nghiep', 'phong van', 'offer'],
    responseStyle: {
      tone: 'strategic',
      depth: 'practical',
      includeAction: true,
    },
    priority: 2,
  },
  SELF_DISCOVERY: {
    name: 'SELF_DISCOVERY',
    keywords: ['tiem nang', 'ngan can', 'block', 'chuong ngai', 'muc dich', 'su menh', 'tai sao toi', 'toi la ai', 'con duong', 'dinh huong', 'be tac', 'lac loi', 'khong biet', 'hoang mang', 'purpose', 'calling', 'passion', 'gioi han', 'tu sabotage', 'song dung'],
    responseStyle: {
      tone: 'philosophical',
      depth: 'transformative',
      includeReflection: true,
    },
    priority: 2,
  },
  WEALTH: {
    name: 'WEALTH',
    keywords: ['tien', 'tuot', 'giu tien', 'tiet kiem', 'block tien', 'ngheo', 'giau', 'tai chinh', 'thu nhap', 'no', 'dau tu', 'thinh vuong', 'abundance', 'wealthy', 'money block', 'scarcity', 'khong du', 'chi tieu', 'manifest tien'],
    responseStyle: {
      tone: 'empowering',
      depth: 'root-cause',
      includeExercise: true,
    },
    priority: 2,
  },
  SPIRITUAL: {
    name: 'SPIRITUAL',
    keywords: ['thien', 'tan so', 'nang luong', 'crystal', 'chakra', 'tam linh', 'vu tru', 'meditation', 'affirmation', 'ritual', 'chua lanh', 'healing', 'mindfulness', 'frequency', 'vibration', 'manifestation', 'yin', 'yang', 'am duong', 'thach anh', 'da', 'phong thuy'],
    responseStyle: {
      tone: 'mystical',
      depth: 'philosophical',
      includeExercises: true,
    },
    priority: 4,
  },
  UPGRADE: {
    name: 'UPGRADE',
    keywords: ['nang cap', 'tier', 'mua', 'gia', 'goi', 'premium', 'subscription', 'dang ky', 'thanh toan', 'unlock', 'upgrade', 'pro', 'vip', 'plan', 'pricing'],
    responseStyle: {
      tone: 'informative',
      depth: 'concise',
      includeCTA: true,
    },
    priority: 5,
  },
  GREETING: {
    name: 'GREETING',
    keywords: ['xin chao', 'hello', 'hi', 'chao', 'alo', 'hey', 'good morning', 'good evening', 'chao buoi sang', 'chao buoi toi'],
    responseStyle: {
      tone: 'friendly',
      depth: 'brief',
      includePersonalization: true,
    },
    priority: 6,
  },
  GENERAL: {
    name: 'GENERAL',
    keywords: [],
    responseStyle: {
      tone: 'helpful',
      depth: 'moderate',
      includeFollowUp: true,
    },
    priority: 99,
  },
};

// ============================================================
// SENTIMENT KEYWORDS
// ============================================================

const SENTIMENT_KEYWORDS = {
  positive: ['vui', 'tuyet', 'tot', 'hay', 'thich', 'cam on', 'thanks', 'great', 'awesome', 'win', 'lai', 'thang', 'happy', 'excited', 'amazing', 'wonderful'],
  negative: ['buon', 'te', 'xau', 'ghet', 'chan', 'fail', 'thua', 'lo', 'mat', 'kho', 'bad', 'terrible', 'hate', 'angry', 'upset'],
  neutral: [],
};

// ============================================================
// CORE FUNCTIONS
// ============================================================

const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

const countKeywordMatches = (normalizedText, keywords) => {
  if (!normalizedText || !keywords?.length) return 0;
  let count = 0;
  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedText.includes(normalizedKeyword)) {
      count++;
    }
  }
  return count;
};

export const detectIntent = (message) => {
  if (!message || typeof message !== 'string') {
    return {
      primaryIntent: INTENT_CATEGORIES.GENERAL,
      secondaryIntents: [],
      confidence: 0,
      sentiment: 'neutral',
    };
  }

  const normalizedMessage = normalizeText(message);
  const results = [];

  for (const [key, category] of Object.entries(INTENT_CATEGORIES)) {
    if (key === 'GENERAL') continue;
    const matches = countKeywordMatches(normalizedMessage, category.keywords);
    if (matches > 0) {
      results.push({
        category,
        matches,
        score: matches * (1 / category.priority),
      });
    }
  }

  results.sort((a, b) => b.score - a.score);

  let sentiment = 'neutral';
  const positiveMatches = countKeywordMatches(normalizedMessage, SENTIMENT_KEYWORDS.positive);
  const negativeMatches = countKeywordMatches(normalizedMessage, SENTIMENT_KEYWORDS.negative);

  if (positiveMatches > negativeMatches) sentiment = 'positive';
  else if (negativeMatches > positiveMatches) sentiment = 'negative';
  else if (positiveMatches > 0 && negativeMatches > 0) sentiment = 'mixed';

  const primaryIntent = results[0]?.category || INTENT_CATEGORIES.GENERAL;
  const secondaryIntents = results.slice(1, 3).map(r => r.category);
  const confidence = results[0]
    ? Math.min(results[0].matches / 3, 1)
    : 0;

  return {
    primaryIntent,
    secondaryIntents,
    confidence,
    sentiment,
    matchDetails: results.slice(0, 3),
  };
};

export const getResponseStyle = (intentResult, userTier = 'FREE') => {
  const baseStyle = intentResult?.primaryIntent?.responseStyle || {
    tone: 'helpful',
    depth: 'moderate',
  };

  const tierAdjustments = {
    FREE: { maxWords: 150, ctaFrequency: 'high' },
    STARTER: { maxWords: 150, ctaFrequency: 'high' },
    TIER1: { maxWords: 200, ctaFrequency: 'medium' },
    TIER2: { maxWords: 300, ctaFrequency: 'low' },
    TIER3: { maxWords: 400, ctaFrequency: 'none' },
    PRO: { maxWords: 200, ctaFrequency: 'medium' },
    PREMIUM: { maxWords: 300, ctaFrequency: 'low' },
    VIP: { maxWords: 400, ctaFrequency: 'none' },
  };

  const adjustment = tierAdjustments[userTier] || tierAdjustments.FREE;

  return {
    ...baseStyle,
    ...adjustment,
    userTier,
  };
};

export const buildIntentInstruction = (intentResult, responseStyle) => {
  const intent = intentResult?.primaryIntent?.name || 'GENERAL';
  const sentiment = intentResult?.sentiment || 'neutral';
  let instruction = '';

  switch (intent) {
    case 'EMOTIONAL':
      instruction = `**RESPONSE STYLE: EMPATHETIC & SUPPORTIVE**
- User dang co cam xuc ${sentiment === 'negative' ? 'tieu cuc' : 'can duoc lang nghe'}
- Bat dau bang viec dong cam voi user
- Dua ra 1 bai tap chua lanh cu the
- Ket thuc voi affirmation tich cuc
- KHONG giang dao, KHONG phan xet`;
      break;
    case 'TRADING':
      instruction = `**RESPONSE STYLE: DISCIPLINED & TECHNICAL**
- Tra loi danh thep, ky luat
- Nhan manh quan ly rui ro
- Cung cap thong tin ky thuat cu the
- LUON nhac nho: "Day khong phai loi khuyen tai chinh"`;
      break;
    case 'FOMO_TRADING':
      instruction = `**RESPONSE STYLE: FOMO PROTECTION MODE**
PHAT HIEN TAM LY FOMO - User dang muon vao lenh voi vang!
BAT BUOC PHAI:
1. MO DAU bang: "Phat hien tam ly FOMO."
2. Neu chi so ky thuat (RSI, xu huong) neu co
3. KHONG khuyen khich vao lenh ngay
4. Dua ra loi khuyen cu the: "Hay tho sau 3 lan roi hoi lai sau 15 phut."
GIONG VAN: Nghiem khac nhung bao ve.`;
      break;
    case 'SPIRITUAL':
      instruction = `**RESPONSE STYLE: MYSTICAL & PHILOSOPHICAL**
- Su dung ngon ngu tam linh, huyen bi
- Ket noi voi triet ly Am Duong, Vu tru
- Goi y ritual hoac meditation phu hop
- Truyen cam hung ve su chuyen hoa nang luong`;
      break;
    case 'RELATIONSHIP':
      instruction = `**RESPONSE STYLE: COMPASSIONATE & INSIGHTFUL**
1. BAT DAU bang cau dan dong cam
2. Phan tich NGAN GON nang luong moi quan he (2-3 cau)
3. Dat 1 cau hoi reflection giup user tu nhin nhan
4. KET THUC bang: "Ban muon boi Tarot hoac Kinh Dich de co goc nhin sau hon khong?"
- Tone: Dong cam, khong phan xet`;
      break;
    case 'CAREER':
      instruction = `**RESPONSE STYLE: STRATEGIC & PRACTICAL**
1. BAT DAU bang cau dan phan tich
2. Dua ra framework NGAN GON (3-4 tieu chi danh gia)
3. Dat 1-2 cau hoi reflection
4. KET THUC bang cau hoi mo
- Ket hop goc nhin nang luong + thuc te`;
      break;
    case 'SELF_DISCOVERY':
      instruction = `**RESPONSE STYLE: TRANSFORMATIVE & DEEP**
1. BAT DAU bang cau dan sau sac
2. Dao sau vao GOC RE van de (2-3 cau insight)
3. Dat 1 CAU HOI REFLECTION manh me
4. CHI DUA 1 BAI TAP/NGHI THUC cu the
5. KET THUC bang: "Ban cam thay dieu nay co dung voi minh khong?"
- Response phai tao "Aha moment"`;
      break;
    case 'WEALTH':
      instruction = `**RESPONSE STYLE: EMPOWERING & ROOT-CAUSE**
1. BAT DAU bang cau dan dong cam
2. Phan tich NGAN GON goc re (2-3 cau ve money block)
3. CHI DUA 1 BAI TAP DUY NHAT - cu the nhat
4. KET THUC bang: "Ban muon them bai tap khac hoac tim hieu ve da ho tro tai chinh khong?"
- Bai tap phai co huong dan THUC HANH CU THE`;
      break;
    case 'LEARNING':
      instruction = `**RESPONSE STYLE: EDUCATIONAL**
- Giai thich tung buoc, de hieu
- Su dung vi du cu the
- Cung cap tai lieu tham khao neu co
- Khuyen khich user thuc hanh`;
      break;
    case 'UPGRADE':
      instruction = `**RESPONSE STYLE: INFORMATIVE**
- Giai thich loi ich cua tung tier
- So sanh cac goi ro rang
- Khong ep buoc, ton trong quyet dinh cua user
- Cung cap link nang cap neu user quan tam`;
      break;
    case 'GREETING':
      instruction = `**RESPONSE STYLE: FRIENDLY & WARM**
- Chao hoi than thien, am ap
- Su dung ten user neu biet
- Hoi user hom nay the nao hoac can giup gi
- Giu response ngan gon`;
      break;
    default:
      instruction = `**RESPONSE STYLE: HELPFUL**
- Tra loi ngan gon, dung trong tam
- Hoi clarifying question neu can
- Than thien nhung chuyen nghiep`;
  }

  if (responseStyle?.maxWords) {
    instruction += `\n- Gioi han: Toi da ${responseStyle.maxWords} tu`;
  }
  if (responseStyle?.ctaFrequency === 'high') {
    instruction += `\n- Goi y nang cap tier neu phu hop voi cau hoi`;
  }

  return instruction.trim();
};

export const extractTopic = (message, intentResult) => {
  if (!message) {
    return { topic: 'general', category: 'general' };
  }

  const normalizedMessage = normalizeText(message);
  const intent = intentResult?.primaryIntent?.name || 'GENERAL';

  const topicPatterns = {
    TRADING: {
      extract: (text) => {
        const match = text.match(/(dpd|upu|dpu|upd|btc|eth|bitcoin|ethereum)/i);
        return match ? match[0].toUpperCase() : 'trading-general';
      },
    },
    FOMO_TRADING: {
      extract: (text) => {
        const coinMatch = text.match(/(btc|eth|sol|bnb|xrp|doge|ada)/i);
        const coin = coinMatch ? coinMatch[0].toUpperCase() : 'CRYPTO';
        return `FOMO-${coin}`;
      },
    },
    SPIRITUAL: {
      extract: (text) => {
        if (text.includes('thien') || text.includes('meditation')) return 'meditation';
        if (text.includes('chakra')) return 'chakra';
        if (text.includes('crystal') || text.includes('thach anh') || text.includes('da ')) return 'crystal';
        if (text.includes('ritual')) return 'ritual';
        return 'spiritual-general';
      },
    },
    EMOTIONAL: {
      extract: (text) => {
        if (text.includes('fomo')) return 'FOMO';
        if (text.includes('fud')) return 'FUD';
        if (text.includes('stress')) return 'stress';
        return 'emotional-support';
      },
    },
    RELATIONSHIP: {
      extract: (text) => {
        if (text.includes('dinh menh') || text.includes('soulmate')) return 'destiny';
        if (text.includes('chia tay') || text.includes('ex')) return 'breakup';
        if (text.includes('crush') || text.includes('thich')) return 'crush';
        return 'relationship-general';
      },
    },
    CAREER: {
      extract: (text) => {
        if (text.includes('doi viec') || text.includes('nhay viec')) return 'job-change';
        if (text.includes('nghi viec') || text.includes('that nghiep')) return 'resignation';
        if (text.includes('khoi nghiep') || text.includes('startup')) return 'startup';
        return 'career-general';
      },
    },
    SELF_DISCOVERY: {
      extract: (text) => {
        if (text.includes('tiem nang') || text.includes('song dung')) return 'potential';
        if (text.includes('ngan can') || text.includes('block')) return 'blocks';
        if (text.includes('muc dich') || text.includes('su menh')) return 'purpose';
        return 'self-discovery-general';
      },
    },
    WEALTH: {
      extract: (text) => {
        if (text.includes('tuot') || text.includes('giu khong duoc')) return 'money-leak';
        if (text.includes('block tien') || text.includes('bi block')) return 'money-block';
        if (text.includes('manifest') || text.includes('thu hut')) return 'manifest-wealth';
        return 'wealth-general';
      },
    },
  };

  const topicConfig = topicPatterns[intent];
  let topic = intent.toLowerCase();

  if (topicConfig) {
    topic = topicConfig.extract(normalizedMessage);
  }

  const categoryMap = {
    TRADING: 'trading',
    FOMO_TRADING: 'trading',
    SPIRITUAL: 'spiritual',
    EMOTIONAL: 'emotional',
    LEARNING: 'learning',
    UPGRADE: 'upgrade',
    RELATIONSHIP: 'emotional',
    CAREER: 'general',
    SELF_DISCOVERY: 'spiritual',
    WEALTH: 'general',
  };

  return {
    topic,
    category: categoryMap[intent] || 'general',
    sentiment: intentResult?.sentiment || 'neutral',
  };
};

export default {
  INTENT_CATEGORIES,
  detectIntent,
  getResponseStyle,
  buildIntentInstruction,
  extractTopic,
};
