// ResponseDetector Service
// Automatically detects AI response type to determine when to create dashboard widgets

export const ResponseTypes = {
  MANIFESTATION_GOAL: 'manifestation_goal',
  CRYSTAL_RECOMMENDATION: 'crystal_recommendation',
  TRADING_ANALYSIS: 'trading_analysis',
  AFFIRMATIONS_ONLY: 'affirmations_only',
  ICHING_READING: 'iching_reading',
  TAROT_READING: 'tarot_reading',
  GENERAL_CHAT: 'general_chat'
};

export class ResponseDetector {

  /**
   * Main detection method
   * @param {string} aiResponse - Full AI response text
   * @returns {Object} { type, confidence, extractedData }
   */
  detect(aiResponse) {
    try {
      // Handle empty or null responses
      if (!aiResponse || aiResponse.trim() === '') {
        return {
          type: ResponseTypes.GENERAL_CHAT,
          confidence: 1.0,
          extractedData: null
        };
      }

      const text = aiResponse.toLowerCase();

      // 1. Check for Manifestation Goal
      if (this.hasKeywords(text, ['manifest', 'goal', 'target', 'achieve', 'mục tiêu', 'đạt được'])) {
        if (this.hasStructuredData(aiResponse, ['affirmations', 'action', 'timeline', 'crystal'])) {
          return {
            type: ResponseTypes.MANIFESTATION_GOAL,
            confidence: 0.95,
            extractedData: null // Will be extracted in DataExtractor
          };
        }
      }

      // 2. Check for Crystal Recommendation
      if (this.hasKeywords(text, ['crystal', 'đá', 'chakra', 'năng lượng', 'stress', 'anxiety'])) {
        if (this.hasStructuredData(aiResponse, ['crystal', 'placement', 'cleanse', 'energy'])) {
          return {
            type: ResponseTypes.CRYSTAL_RECOMMENDATION,
            confidence: 0.92,
            extractedData: null
          };
        }
      }

      // 3. Check for Trading Analysis
      if (this.hasKeywords(text, ['loss', 'trade', 'pattern', 'btc', 'eth', 'long', 'short', 'leverage'])) {
        if (this.hasStructuredData(aiResponse, ['mistake', 'spiritual', 'lesson', 'chakra'])) {
          return {
            type: ResponseTypes.TRADING_ANALYSIS,
            confidence: 0.90,
            extractedData: null
          };
        }
      }

      // 4. Check for Affirmations Only
      if (this.hasAffirmationMarkers(aiResponse)) {
        return {
          type: ResponseTypes.AFFIRMATIONS_ONLY,
          confidence: 0.90,
          extractedData: null
        };
      }

      // 5. Check for I Ching Reading
      if (this.hasKeywords(text, ['quẻ', 'i ching', 'hexagram', 'càn', 'khôn', 'chấn'])) {
        return {
          type: ResponseTypes.ICHING_READING,
          confidence: 0.93,
          extractedData: null
        };
      }

      // 6. Check for Tarot Reading
      if (this.hasKeywords(text, ['tarot', 'lá bài', 'major arcana', 'minor arcana', 'wands', 'cups'])) {
        return {
          type: ResponseTypes.TAROT_READING,
          confidence: 0.93,
          extractedData: null
        };
      }

      // 7. Default: General Chat (no widget)
      return {
        type: ResponseTypes.GENERAL_CHAT,
        confidence: 1.0,
        extractedData: null
      };

    } catch (error) {
      console.error('Error in ResponseDetector:', error);
      return {
        type: ResponseTypes.GENERAL_CHAT,
        confidence: 0.5,
        extractedData: null,
        error: error.message
      };
    }
  }

  /**
   * Check if text contains any of the keywords
   */
  hasKeywords(text, keywords) {
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  }

  /**
   * Check if response has structured data patterns
   */
  hasStructuredData(response, requiredFields) {
    let count = 0;
    for (const field of requiredFields) {
      const pattern = new RegExp(field, 'i');
      if (pattern.test(response)) {
        count++;
      }
    }
    // At least 2 out of required fields should be present
    return count >= 2;
  }

  /**
   * Check for affirmation markers (✨, bullets, quotes)
   */
  hasAffirmationMarkers(response) {
    const affirmationPatterns = [
      /✨\s*["'](.+?)["']/g,
      /•\s*["'](.+?)["']/g,
      /\n\d+\.\s*["'](.+?)["']/g
    ];

    for (const pattern of affirmationPatterns) {
      const matches = response.match(pattern);
      if (matches && matches.length >= 3) {
        return true;
      }
    }

    return false;
  }
}
