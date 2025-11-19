/**
 * Widget Detector Service
 * Detects widget-worthy content in AI responses
 */

class WidgetDetector {
  /**
   * Detect potential widgets from AI response
   * @param {string} aiResponse - The AI's response text
   * @param {object} conversationContext - Context from conversation (coin, timeframe, etc)
   * @returns {array} Array of detected widget suggestions
   */
  detectWidgets(aiResponse, conversationContext = {}) {
    const detected = [];

    // Price Alert detection
    const priceAlertWidget = this.detectPriceAlert(aiResponse, conversationContext);
    if (priceAlertWidget) {
      detected.push(priceAlertWidget);
    }

    // Pattern Watch detection
    const patternWidget = this.detectPattern(aiResponse, conversationContext);
    if (patternWidget) {
      detected.push(patternWidget);
    }

    // Daily Reading detection (I Ching/Tarot)
    const readingWidget = this.detectDailyReading(aiResponse, conversationContext);
    if (readingWidget) {
      detected.push(readingWidget);
    }

    // Portfolio Tracker detection
    const portfolioWidget = this.detectPortfolio(aiResponse, conversationContext);
    if (portfolioWidget) {
      detected.push(portfolioWidget);
    }

    return detected;
  }

  /**
   * Detect price alert opportunities
   */
  detectPriceAlert(text, context) {
    // Match patterns like: "BTC $50,000", "Bitcoin 50000", "ETH lên 3000"
    const pricePatterns = [
      /(\w+).*?[\$]?\s*(\d{1,3}[,.]?\d{3,})/i,
      /(BTC|ETH|BNB|SOL|ADA|XRP|DOGE).*?(\d{4,})/i
    ];

    for (const pattern of pricePatterns) {
      const match = text.match(pattern);
      if (match) {
        const coin = this.normalizeCoinSymbol(match[1]);
        const targetPrice = parseFloat(match[2].replace(/[,$]/g, ''));

        // Determine condition based on keywords
        const isAbove = /tăng|lên|above|over|break|vượt|cao hơn/i.test(text);
        const isBelow = /giảm|xuống|below|under|dưới|thấp hơn/i.test(text);

        return {
          type: 'price_alert',
          suggestion: `💰 Theo dõi giá ${coin}?`,
          data: {
            coin,
            targetPrice,
            condition: isBelow ? 'below' : 'above',
            currentPrice: 0 // Will be fetched by widget component
          }
        };
      }
    }

    return null;
  }

  /**
   * Detect pattern watch opportunities
   */
  detectPattern(text, context) {
    const patternKeywords = {
      'head and shoulders': 'Head & Shoulders',
      'vai đầu vai': 'Head & Shoulders',
      'double top': 'Double Top',
      'đỉnh đôi': 'Double Top',
      'double bottom': 'Double Bottom',
      'đáy đôi': 'Double Bottom',
      'triangle': 'Triangle',
      'tam giác': 'Triangle',
      'flag': 'Flag',
      'cờ': 'Flag',
      'wedge': 'Wedge',
      'nêm': 'Wedge',
      'cup and handle': 'Cup & Handle'
    };

    for (const [keyword, patternName] of Object.entries(patternKeywords)) {
      if (text.toLowerCase().includes(keyword)) {
        // Extract coin symbol from context or text
        const coinMatch = text.match(/(BTC|ETH|BNB|SOL|ADA|XRP|DOGE)/i);
        const coin = coinMatch ? coinMatch[1].toUpperCase() : context.coin || 'BTC';

        // Extract timeframe
        const timeframeMatch = text.match(/(\d+)(h|m|d)/i);
        const timeframe = timeframeMatch ? `${timeframeMatch[1]}${timeframeMatch[2]}` : '4h';

        return {
          type: 'pattern_watch',
          suggestion: `📊 Theo dõi pattern ${patternName}?`,
          data: {
            coin,
            pattern: patternName,
            timeframe,
            confidence: 75,
            detectedAt: new Date().toISOString()
          }
        };
      }
    }

    return null;
  }

  /**
   * Detect daily reading opportunities (I Ching/Tarot)
   */
  detectDailyReading(text, context) {
    // I Ching detection
    const hexagramMatch = text.match(/Quẻ (\d+):|Hexagram (\d+):|卦 (\d+)/i);
    if (hexagramMatch) {
      const hexagramNumber = hexagramMatch[1] || hexagramMatch[2] || hexagramMatch[3];

      // Extract hexagram name
      const nameMatch = text.match(/Quẻ \d+[:\-\s]+([^\n]+)/i) ||
                       text.match(/Hexagram \d+[:\-\s]+([^\n]+)/i);
      const hexagramName = nameMatch ? nameMatch[1].trim() : `Quẻ ${hexagramNumber}`;

      return {
        type: 'daily_reading',
        suggestion: '🔮 Lưu quẻ này làm daily reminder?',
        data: {
          readingType: 'iching',
          hexagram: hexagramName,
          interpretation: text.slice(0, 300),
          tradingAdvice: this.extractTradingAdvice(text),
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      };
    }

    // Tarot detection
    const tarotMatch = text.match(/(The )?(Fool|Magician|High Priestess|Empress|Emperor|Hierophant|Lovers|Chariot|Strength|Hermit|Wheel|Justice|Hanged Man|Death|Temperance|Devil|Tower|Star|Moon|Sun|Judgement|World)/i);
    if (tarotMatch) {
      const cardName = tarotMatch[0];

      return {
        type: 'daily_reading',
        suggestion: '🃏 Lưu lá bài này làm daily reminder?',
        data: {
          readingType: 'tarot',
          card: cardName,
          interpretation: text.slice(0, 300),
          tradingAdvice: this.extractTradingAdvice(text),
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      };
    }

    return null;
  }

  /**
   * Detect portfolio tracker opportunities
   */
  detectPortfolio(text, context) {
    // Look for multiple coins mentioned with amounts
    const holdingPattern = /(\d+\.?\d*)\s*(BTC|ETH|BNB|SOL|ADA|XRP|DOGE)/gi;
    const matches = [...text.matchAll(holdingPattern)];

    if (matches.length >= 2) {
      const holdings = matches.map(match => ({
        coin: match[2].toUpperCase(),
        amount: parseFloat(match[1]),
        value: 0 // Will be calculated by widget
      }));

      return {
        type: 'portfolio_tracker',
        suggestion: '💼 Tạo portfolio tracker?',
        data: {
          holdings,
          totalValue: 0,
          change24h: 0
        }
      };
    }

    return null;
  }

  /**
   * Extract trading advice from response
   */
  extractTradingAdvice(text) {
    const adviceKeywords = ['nên|should|recommend|suggest|advice|khuyên|đề xuất'];
    const sentences = text.split(/[.!?]/);

    for (const sentence of sentences) {
      if (new RegExp(adviceKeywords, 'i').test(sentence)) {
        return sentence.trim();
      }
    }

    return text.slice(0, 150);
  }

  /**
   * Normalize coin symbols
   */
  normalizeCoinSymbol(symbol) {
    const coinMap = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'binance': 'BNB',
      'solana': 'SOL',
      'cardano': 'ADA',
      'ripple': 'XRP',
      'dogecoin': 'DOGE'
    };

    const normalized = symbol.toUpperCase();
    return coinMap[symbol.toLowerCase()] || normalized;
  }

  /**
   * Check if user can create widgets based on tier
   */
  canCreateWidget(userTier, currentWidgetCount = 0) {
    const limits = {
      FREE: 0,
      TIER1: 3,
      TIER2: 10,
      TIER3: 999
    };

    const limit = limits[userTier] || 0;
    return currentWidgetCount < limit;
  }

  /**
   * Get widget limit for tier
   */
  getWidgetLimit(userTier) {
    const limits = {
      FREE: 0,
      TIER1: 3,
      TIER2: 10,
      TIER3: 999
    };

    return limits[userTier] || 0;
  }
}

export const widgetDetector = new WidgetDetector();
