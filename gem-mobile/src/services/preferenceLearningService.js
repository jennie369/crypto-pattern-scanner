/**
 * Preference Learning Service
 * Phase 4: Intelligence Layer
 *
 * Learn and update user preferences from behavior:
 * - Element preference from products viewed/purchased
 * - Zodiac preference from comments or profile
 * - Price range from purchase history
 * - Category preferences
 * - Communication style analysis
 */

import { supabase } from './supabase';

// Ngu Hanh elements
const NGU_HANH_ELEMENTS = ['Kim', 'Moc', 'Thuy', 'Hoa', 'Tho'];

// Zodiac signs
const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

// Vietnamese zodiac names for detection
const ZODIAC_VIETNAMESE = {
  Aries: ['bach duong', 'bạch dương'],
  Taurus: ['kim nguu', 'kim ngưu'],
  Gemini: ['song tu', 'song tử'],
  Cancer: ['cu giai', 'cự giải'],
  Leo: ['su tu', 'sư tử'],
  Virgo: ['xu nu', 'xử nữ'],
  Libra: ['thien binh', 'thiên bình'],
  Scorpio: ['bo cap', 'bọ cạp', 'thien yet', 'thiên yết'],
  Sagittarius: ['nhan ma', 'nhân mã'],
  Capricorn: ['ma ket', 'ma kết'],
  Aquarius: ['bao binh', 'bảo bình'],
  Pisces: ['song ngu', 'song ngư'],
};

class PreferenceLearningService {
  constructor() {
    this.learningThreshold = 5; // Minimum interactions to learn
  }

  // ============================================================================
  // MAIN LEARNING METHOD
  // ============================================================================

  async learnUserPreferences(userId) {
    try {
      // 1. Get behavior data
      const behavior = await this.getUserBehavior(userId);
      if (!behavior) return null;

      // 2. Get current preferences
      const currentPrefs = await this.getCurrentPreferences(userId);

      // 3. Learn from behavior
      const learnedPrefs = await this.extractPreferences(userId, behavior);

      // 4. Merge with current preferences
      const mergedPrefs = this.mergePreferences(currentPrefs, learnedPrefs);

      // 5. Save updated preferences
      await this.savePreferences(userId, mergedPrefs);

      return mergedPrefs;
    } catch (error) {
      console.error('[PreferenceLearning] Error:', error);
      return null;
    }
  }

  // ============================================================================
  // PREFERENCE EXTRACTION
  // ============================================================================

  async extractPreferences(userId, behavior) {
    const preferences = {
      preferred_element: null,
      zodiac_sign: null,
      price_range: { min: 0, max: 10000000 },
      favorite_categories: [],
      formality_level: 'casual',
      response_length: 'medium',
      emoji_preference: 'low',
      confidence_scores: {},
    };

    // 1. Extract element preference from products viewed/purchased
    const elementPreference = await this.extractElementPreference(behavior);
    if (elementPreference) {
      preferences.preferred_element = elementPreference.element;
      preferences.confidence_scores.element = elementPreference.confidence;
    }

    // 2. Extract zodiac from comments or profile
    const zodiacPreference = await this.extractZodiacPreference(userId, behavior);
    if (zodiacPreference) {
      preferences.zodiac_sign = zodiacPreference.zodiac;
      preferences.confidence_scores.zodiac = zodiacPreference.confidence;
    }

    // 3. Extract price range from purchase history
    const pricePreference = this.extractPricePreference(behavior);
    if (pricePreference) {
      preferences.price_range = pricePreference.range;
      preferences.confidence_scores.price = pricePreference.confidence;
    }

    // 4. Extract favorite categories
    const categoryPreference = await this.extractCategoryPreference(behavior);
    if (categoryPreference) {
      preferences.favorite_categories = categoryPreference.categories;
      preferences.confidence_scores.categories = categoryPreference.confidence;
    }

    // 5. Extract communication style from comments
    const stylePreference = await this.extractCommunicationStyle(userId);
    if (stylePreference) {
      preferences.formality_level = stylePreference.formality;
      preferences.response_length = stylePreference.length;
      preferences.emoji_preference = stylePreference.emoji;
    }

    return preferences;
  }

  async extractElementPreference(behavior) {
    const productIds = [
      ...(behavior.products_viewed || []),
      ...(behavior.products_purchased || []), // Weight purchased more
      ...(behavior.products_purchased || []), // Double weight for purchased
    ];

    if (productIds.length < this.learningThreshold) {
      return null;
    }

    // Get products with elements
    const { data: products, error } = await supabase
      .from('products')
      .select('element')
      .in('id', [...new Set(productIds)]);

    if (error || !products || products.length === 0) return null;

    // Count elements
    const elementCounts = {};
    products.forEach((p) => {
      if (p.element && NGU_HANH_ELEMENTS.includes(p.element)) {
        elementCounts[p.element] = (elementCounts[p.element] || 0) + 1;
      }
    });

    // Find dominant element
    const sortedElements = Object.entries(elementCounts).sort((a, b) => b[1] - a[1]);

    if (sortedElements.length === 0) return null;

    const [topElement, topCount] = sortedElements[0];
    const totalCount = Object.values(elementCounts).reduce((a, b) => a + b, 0);
    const confidence = topCount / totalCount;

    return {
      element: topElement,
      confidence: Math.min(1, confidence * 1.5), // Boost confidence
    };
  }

  async extractZodiacPreference(userId, behavior) {
    // Check if user has zodiac in profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('birth_date, preferences')
      .eq('id', userId)
      .single();

    if (profile?.preferences?.zodiac_sign) {
      return {
        zodiac: profile.preferences.zodiac_sign,
        confidence: 1.0, // User-provided, full confidence
      };
    }

    // Calculate zodiac from birth_date if available
    if (profile?.birth_date) {
      const zodiac = this.getZodiacFromBirthDate(profile.birth_date);
      if (zodiac) {
        return {
          zodiac,
          confidence: 1.0,
        };
      }
    }

    // Extract from comments (if user mentions zodiac)
    const { data: comments } = await supabase
      .from('livestream_comments')
      .select('message')
      .eq('user_id', userId)
      .limit(100);

    if (!comments || comments.length === 0) return null;

    // Search for zodiac mentions
    const zodiacCounts = {};

    comments.forEach((c) => {
      const message = c.message?.toLowerCase() || '';

      // Check English names
      ZODIAC_SIGNS.forEach((z) => {
        if (message.includes(z.toLowerCase())) {
          zodiacCounts[z] = (zodiacCounts[z] || 0) + 1;
        }
      });

      // Check Vietnamese names
      Object.entries(ZODIAC_VIETNAMESE).forEach(([zodiac, names]) => {
        names.forEach((name) => {
          if (message.includes(name)) {
            zodiacCounts[zodiac] = (zodiacCounts[zodiac] || 0) + 1;
          }
        });
      });
    });

    if (Object.keys(zodiacCounts).length === 0) return null;

    const sortedZodiacs = Object.entries(zodiacCounts).sort((a, b) => b[1] - a[1]);

    return {
      zodiac: sortedZodiacs[0][0],
      confidence: 0.7, // Lower confidence from inference
    };
  }

  getZodiacFromBirthDate(birthDate) {
    const date = new Date(birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const zodiacDates = [
      { sign: 'Capricorn', start: [1, 1], end: [1, 19] },
      { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
      { sign: 'Pisces', start: [2, 19], end: [3, 20] },
      { sign: 'Aries', start: [3, 21], end: [4, 19] },
      { sign: 'Taurus', start: [4, 20], end: [5, 20] },
      { sign: 'Gemini', start: [5, 21], end: [6, 20] },
      { sign: 'Cancer', start: [6, 21], end: [7, 22] },
      { sign: 'Leo', start: [7, 23], end: [8, 22] },
      { sign: 'Virgo', start: [8, 23], end: [9, 22] },
      { sign: 'Libra', start: [9, 23], end: [10, 22] },
      { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
      { sign: 'Sagittarius', start: [11, 22], end: [12, 21] },
      { sign: 'Capricorn', start: [12, 22], end: [12, 31] },
    ];

    for (const z of zodiacDates) {
      const [startMonth, startDay] = z.start;
      const [endMonth, endDay] = z.end;

      if (month === startMonth && day >= startDay) return z.sign;
      if (month === endMonth && day <= endDay) return z.sign;
    }

    return null;
  }

  extractPricePreference(behavior) {
    const purchases = behavior.purchase_history || [];

    if (purchases.length < 2) {
      return null;
    }

    const prices = purchases.map((p) => p.price).filter((p) => p > 0);
    if (prices.length === 0) return null;

    const sortedPrices = prices.sort((a, b) => a - b);
    const median = sortedPrices[Math.floor(sortedPrices.length / 2)];

    // Calculate range based on distribution
    const min = Math.max(0, median * 0.5);
    const max = median * 2;

    return {
      range: { min: Math.round(min), max: Math.round(max) },
      confidence: Math.min(1, prices.length / 10), // More purchases = higher confidence
    };
  }

  async extractCategoryPreference(behavior) {
    const productIds = [
      ...(behavior.products_viewed || []),
      ...(behavior.products_purchased || []),
    ];

    if (productIds.length < this.learningThreshold) {
      return null;
    }

    const { data: products } = await supabase
      .from('products')
      .select('product_type')
      .in('id', [...new Set(productIds)]);

    if (!products || products.length === 0) return null;

    const categoryCounts = {};
    products.forEach((p) => {
      if (p.product_type) {
        categoryCounts[p.product_type] = (categoryCounts[p.product_type] || 0) + 1;
      }
    });

    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat);

    return {
      categories: sortedCategories,
      confidence: Math.min(1, productIds.length / 20),
    };
  }

  async extractCommunicationStyle(userId) {
    const { data: comments } = await supabase
      .from('livestream_comments')
      .select('message')
      .eq('user_id', userId)
      .limit(50);

    if (!comments || comments.length === 0) {
      return {
        formality: 'casual',
        length: 'medium',
        emoji: 'low',
      };
    }

    // Analyze formality
    const formalKeywords = ['a', 'vang', 'da', 'thua', 'xin', 'ạ', 'vâng', 'dạ'];
    const casualKeywords = ['nha', 'nhe', 'hen', 'luon', 'nghen', 'nhé', 'luôn', 'nhen'];

    let formalCount = 0;
    let casualCount = 0;
    let totalEmojis = 0;
    let totalLength = 0;

    comments.forEach((c) => {
      const text = c.message?.toLowerCase() || '';
      totalLength += text.length;

      formalKeywords.forEach((k) => {
        if (text.includes(k)) formalCount++;
      });
      casualKeywords.forEach((k) => {
        if (text.includes(k)) casualCount++;
      });

      // Count emojis (rough estimate)
      const emojiRegex = /[\u{1F600}-\u{1F6FF}]/gu;
      totalEmojis += (text.match(emojiRegex) || []).length;
    });

    const avgLength = totalLength / comments.length;
    const avgEmojis = totalEmojis / comments.length;

    return {
      formality: formalCount > casualCount ? 'formal' : 'casual',
      length: avgLength < 20 ? 'short' : avgLength > 50 ? 'long' : 'medium',
      emoji: avgEmojis < 0.5 ? 'none' : avgEmojis < 1.5 ? 'low' : 'high',
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  async getUserBehavior(userId) {
    const { data } = await supabase
      .from('user_behavior')
      .select('*')
      .eq('user_id', userId)
      .single();

    return data || null;
  }

  async getCurrentPreferences(userId) {
    const { data } = await supabase
      .from('user_profiles')
      .select('preferences')
      .eq('id', userId)
      .single();

    return data?.preferences || {};
  }

  mergePreferences(current, learned) {
    // Merge with priority for learned if confidence is high
    const merged = { ...current };

    Object.keys(learned).forEach((key) => {
      if (key === 'confidence_scores') return;

      const learnedConfidence = learned.confidence_scores?.[key] || 0;
      const currentConfidence = current.confidence_scores?.[key] || 0;

      // Update if learned confidence is higher or no current value
      if (learnedConfidence > currentConfidence || !current[key]) {
        merged[key] = learned[key];
      }
    });

    // Merge confidence scores
    merged.confidence_scores = {
      ...(current.confidence_scores || {}),
      ...(learned.confidence_scores || {}),
    };

    return merged;
  }

  async savePreferences(userId, preferences) {
    await supabase
      .from('user_profiles')
      .update({
        preferences,
        preferences_updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  }

  // ============================================================================
  // REAL-TIME LEARNING TRIGGERS
  // ============================================================================

  async onProductView(userId, productId) {
    // Light-weight update on product view
    try {
      await supabase.rpc('increment_product_view', {
        p_user_id: userId,
        p_product_id: productId,
      });
    } catch (error) {
      console.warn('[PreferenceLearning] onProductView error:', error);
    }
  }

  async onPurchase(userId, productIds, totalValue) {
    // Trigger full preference learning after purchase
    await this.learnUserPreferences(userId);
  }

  async onZodiacMention(userId, zodiac) {
    // Update zodiac preference directly
    if (!ZODIAC_SIGNS.includes(zodiac)) return;

    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('id', userId)
        .single();

      const preferences = data?.preferences || {};
      preferences.zodiac_sign = zodiac;
      preferences.confidence_scores = preferences.confidence_scores || {};
      preferences.confidence_scores.zodiac = 0.9;

      await supabase
        .from('user_profiles')
        .update({ preferences })
        .eq('id', userId);
    } catch (error) {
      console.warn('[PreferenceLearning] onZodiacMention error:', error);
    }
  }

  async onElementMention(userId, element) {
    // Update element preference directly
    if (!NGU_HANH_ELEMENTS.includes(element)) return;

    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('id', userId)
        .single();

      const preferences = data?.preferences || {};
      preferences.preferred_element = element;
      preferences.confidence_scores = preferences.confidence_scores || {};
      preferences.confidence_scores.element = 0.9;

      await supabase
        .from('user_profiles')
        .update({ preferences })
        .eq('id', userId);
    } catch (error) {
      console.warn('[PreferenceLearning] onElementMention error:', error);
    }
  }
}

export const preferenceLearningService = new PreferenceLearningService();
export default preferenceLearningService;
