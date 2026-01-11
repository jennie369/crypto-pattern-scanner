/**
 * Tarot Interpretation Service
 * Knowledge-first: Uses local tarot data FIRST, API only for advanced analysis
 */

import geminiService from './geminiService';
import { FULL_DECK, SUIT_INFO } from '../data/tarot';

class TarotInterpretationService {
  constructor() {
    this.cache = new Map();
    this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Generate interpretation using LOCAL KNOWLEDGE FIRST
   * Only calls API for advanced follow-up questions
   * @param {Array} cards - Array of drawn cards with positions
   * @param {Object} spread - Spread configuration
   * @param {string} question - User's question
   * @param {string} lifeArea - Life area context
   * @returns {Promise<{data: Object, error: string|null}>}
   */
  async generateInterpretation(cards, spread, question = '', lifeArea = 'general') {
    console.log('[TarotInterpretationService] Using LOCAL KNOWLEDGE first...');

    try {
      // STEP 1: Generate interpretation from LOCAL TAROT DATA
      const localInterpretation = this.generateFromLocalKnowledge(cards, spread, lifeArea, question);

      if (localInterpretation && localInterpretation.overview) {
        console.log('[TarotInterpretationService] SUCCESS - Using local knowledge');
        return {
          data: {
            ...localInterpretation,
            source: 'local_knowledge',
            isLocalKnowledge: true,
          },
          error: null,
        };
      }

      // STEP 2: Fallback to simple interpretation if local data incomplete
      console.log('[TarotInterpretationService] Using fallback interpretation');
      return {
        data: this.getFallbackInterpretation(cards, spread),
        error: null,
      };
    } catch (err) {
      console.error('[TarotInterpretationService] Error:', err);
      return {
        data: this.getFallbackInterpretation(cards, spread),
        error: err?.message || 'Failed to generate interpretation',
      };
    }
  }

  /**
   * Generate interpretation from LOCAL tarot card data
   * This is the PRIMARY method - no API calls
   */
  generateFromLocalKnowledge(cards, spread, lifeArea = 'general', question = '') {
    if (!cards || cards.length === 0) return null;

    // Map life area to card data field
    const areaFieldMap = {
      general: 'overview',
      love: 'love',
      career: 'career',
      money: 'finance',
      finance: 'finance',
      health: 'health',
      spiritual: 'spiritual',
      trading: 'finance', // Trading uses finance readings
      family: 'love', // Family uses love/relationship readings
    };

    const areaField = areaFieldMap[lifeArea] || 'overview';

    // Build card analyses from local data
    const cardAnalyses = [];
    const allCrystals = [];
    const allAffirmations = [];
    const adviceItems = [];
    const actionStepsItems = []; // NEW: Separate array for action steps

    // Track sentiment for trading advice
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    cards.forEach((card, index) => {
      // Find full card data from FULL_DECK
      const fullCardData = FULL_DECK.find(c => c.id === card.id) || card;
      const isReversed = card.isReversed || false;

      // Get reading based on upright/reversed
      const readingData = isReversed ? fullCardData.reversed : fullCardData.upright;

      if (readingData) {
        // Get area-specific reading
        let areaReading = null;
        if (areaField !== 'overview' && readingData[areaField]) {
          areaReading = readingData[areaField];
        }

        // Build card analysis
        const cardName = fullCardData.vietnameseName || fullCardData.name || 'La bai';
        const reversedText = isReversed ? ' (Nguoc)' : '';

        let cardText = readingData.overview || '';
        if (areaReading?.reading) {
          cardText = areaReading.reading;
        }

        cardAnalyses.push({
          position: index + 1,
          name: cardName + reversedText,
          interpretation: cardText,
          keywords: fullCardData.keywords || [],
        });

        // Collect advice from action steps
        if (areaReading?.actionSteps) {
          adviceItems.push(...areaReading.actionSteps.slice(0, 2));
          // Also add to actionStepsItems for Vision Board
          actionStepsItems.push(...areaReading.actionSteps);
        } else if (isReversed && readingData.advice) {
          adviceItems.push(readingData.advice);
        }

        // Add warning for reversed cards
        if (isReversed && readingData.warning) {
          adviceItems.push('Lưu ý: ' + readingData.warning);
        }

        // Track sentiment for trading analysis
        const sentiment = this.analyzeCardSentiment(fullCardData, isReversed);
        if (sentiment > 0) positiveCount++;
        else if (sentiment < 0) negativeCount++;
        else neutralCount++;
      }

      // Collect crystals
      if (fullCardData.crystals) {
        fullCardData.crystals.forEach(crystal => {
          if (!allCrystals.find(c => c.name === crystal.name)) {
            allCrystals.push({
              name: crystal.vietnameseName || crystal.name,
              description: crystal.reason || 'Tăng cường năng lượng',
              shopHandle: crystal.shopHandle,
            });
          }
        });
      }

      // Collect affirmations
      if (fullCardData.affirmations) {
        allAffirmations.push(...fullCardData.affirmations);
      }
    });

    // Build overview from card analyses
    const spreadName = spread?.name_vi || spread?.name_en || 'Trải bài Tarot';
    const cardNames = cards.map(c => {
      const fullData = FULL_DECK.find(fc => fc.id === c.id) || c;
      return (fullData.vietnameseName || fullData.name) + (c.isReversed ? ' (Ngược)' : '');
    }).join(', ');

    // Generate smart overview based on question and life area
    const overviewText = this.generateSmartOverview(
      cardAnalyses,
      spreadName,
      cardNames,
      question,
      lifeArea,
      { positiveCount, negativeCount, neutralCount }
    );

    // Select unique advice (max 5)
    const uniqueAdvice = [...new Set(adviceItems)].slice(0, 5);

    // Select crystals (max 3)
    const selectedCrystals = allCrystals.slice(0, 3);

    // Select random affirmation
    const selectedAffirmation = allAffirmations.length > 0
      ? allAffirmations[Math.floor(Math.random() * allAffirmations.length)]
      : 'Tôi tin tưởng vào hành trình của mình và đón nhận mọi bài học cuộc sống mang lại.';

    // Calculate fortune (1-5 stars) based on card energy
    const totalCards = positiveCount + negativeCount + neutralCount;
    let fortune = 3; // Default neutral
    if (totalCards > 0) {
      const positiveRatio = positiveCount / totalCards;
      const negativeRatio = negativeCount / totalCards;
      if (positiveRatio > 0.6) fortune = 5;
      else if (positiveRatio > 0.4) fortune = 4;
      else if (negativeRatio > 0.6) fortune = 2;
      else if (negativeRatio > 0.4) fortune = 2;
      else fortune = 3;
    }
    // Add some randomness (±1)
    fortune = Math.max(1, Math.min(5, fortune + (Math.random() > 0.5 ? 1 : 0)));

    // Generate action steps from collected items (or default)
    const finalActionSteps = actionStepsItems.length > 0
      ? [...new Set(actionStepsItems)].slice(0, 5) // Dedupe and limit to 5
      : [
          'Dành 10 phút mỗi ngày thiền định với thông điệp từ lá bài',
          'Ghi lại những insight và đồng bộ hóa trong nhật ký',
          'Thực hành affirmation mỗi sáng trước gương',
        ];

    // Default rituals for Tarot (similar to I Ching)
    const defaultRituals = [
      {
        name: 'Thiền Định Với Lá Bài',
        description: 'Mỗi sáng thiền 5-10 phút với hình ảnh lá bài trong tâm trí. Cảm nhận năng lượng và thông điệp.',
      },
      {
        name: 'Ghi Chép Insight',
        description: 'Viết nhật ký về những insight từ trải bài. Ghi lại các dấu hiệu, đồng bộ hóa bạn nhận thấy trong ngày.',
      },
      {
        name: 'Nghi Thức Tẩy Tịnh',
        description: 'Thắp nến trắng hoặc xô, đặt intention dựa trên lời khuyên từ các lá bài.',
      },
    ];

    return {
      overview: overviewText.trim(),
      cardAnalysis: cardAnalyses,
      advice: uniqueAdvice.length > 0 ? uniqueAdvice : [
        'Tin tưởng vào trực giác của bạn',
        'Hành động với sự cân nhắc và kiên nhẫn',
        'Mở lòng đón nhận những thay đổi tích cực',
      ],
      actionSteps: finalActionSteps, // NEW: For Vision Board
      rituals: defaultRituals, // NEW: For Vision Board
      crystals: selectedCrystals.length > 0 ? selectedCrystals : [
        { name: 'Thạch Anh Trắng', description: 'Tăng cường năng lượng và làm rõ suy nghĩ' },
        { name: 'Amethyst', description: 'Hỗ trợ trực giác và bình an nội tâm' },
      ],
      affirmation: selectedAffirmation,
      fortune: fortune, // Độ may mắn (1-5 stars)
      isLocalKnowledge: true,
    };
  }

  /**
   * Analyze card sentiment for trading decisions
   */
  analyzeCardSentiment(cardData, isReversed) {
    const positiveCards = [1, 3, 6, 9, 10, 14, 17, 19, 21]; // Major Arcana positive
    const negativeCards = [12, 13, 15, 16, 18]; // Major Arcana challenging

    const cardId = typeof cardData.id === 'number' ? cardData.id : -1;

    if (positiveCards.includes(cardId)) {
      return isReversed ? -1 : 1;
    }
    if (negativeCards.includes(cardId)) {
      return isReversed ? 0.5 : -1;
    }
    return 0;
  }

  /**
   * Generate a smart overview that answers the user's question
   */
  generateSmartOverview(cardAnalyses, spreadName, cardNames, question, lifeArea, sentiment) {
    const { positiveCount, negativeCount, neutralCount } = sentiment;
    const totalCards = positiveCount + negativeCount + neutralCount;

    // Determine overall energy
    let overallEnergy = 'trung lập';
    let energyEmoji = '⚖️';

    if (positiveCount > negativeCount + 1) {
      overallEnergy = 'tích cực';
      energyEmoji = '✨';
    } else if (negativeCount > positiveCount + 1) {
      overallEnergy = 'cần thận trọng';
      energyEmoji = '⚠️';
    } else {
      overallEnergy = 'hỗn hợp';
      energyEmoji = '🔄';
    }

    // Detect question type
    const questionLower = question?.toLowerCase() || '';
    const spreadLower = spreadName?.toLowerCase() || '';

    const isTradingQuestion =
      lifeArea === 'trading' ||
      questionLower.includes('mua') ||
      questionLower.includes('bán') ||
      questionLower.includes('trading') ||
      questionLower.includes('đầu tư') ||
      spreadLower.includes('mua');

    const isLoveQuestion =
      lifeArea === 'love' ||
      questionLower.includes('tình yêu') ||
      questionLower.includes('quan hệ') ||
      questionLower.includes('người yêu') ||
      questionLower.includes('crush') ||
      questionLower.includes('hẹn hò') ||
      spreadLower.includes('tình yêu');

    const isCareerQuestion =
      lifeArea === 'career' ||
      questionLower.includes('công việc') ||
      questionLower.includes('sự nghiệp') ||
      questionLower.includes('việc làm') ||
      questionLower.includes('thăng tiến') ||
      spreadLower.includes('sự nghiệp');

    const isHealthQuestion =
      lifeArea === 'health' ||
      questionLower.includes('sức khỏe') ||
      questionLower.includes('bệnh') ||
      questionLower.includes('khỏe');

    const isMoneyQuestion =
      lifeArea === 'money' || lifeArea === 'finance' ||
      questionLower.includes('tiền') ||
      questionLower.includes('tài chính');

    const isDecisionQuestion =
      questionLower.includes('nên') ||
      questionLower.includes('có nên') ||
      questionLower.includes('quyết định') ||
      spreadLower.includes('quyết định');

    let overviewText = '';

    // Generate context-specific advice based on question type
    if (isTradingQuestion) {
      const tradingAdvice = positiveCount > negativeCount
        ? 'CÓ THỂ CÂN NHẮC - năng lượng đang thuận lợi'
        : negativeCount > positiveCount
          ? 'NÊN CHỜ ĐỢI - cần thận trọng'
          : 'GIỮ VỮNG - chưa phải thời điểm hành động';

      overviewText = `📊 KẾT LUẬN TRADING: ${tradingAdvice}\n\n`;
      overviewText += `Năng lượng: ${overallEnergy.toUpperCase()} (${positiveCount} thuận / ${negativeCount} nghịch)\n\n`;
      overviewText += this.buildCombinedInsight(cardAnalyses, 'trading');

    } else if (isLoveQuestion) {
      const loveAdvice = positiveCount > negativeCount
        ? 'Năng lượng tình cảm đang thuận lợi - hãy mở lòng đón nhận'
        : negativeCount > positiveCount
          ? 'Cần thời gian để chữa lành - đừng vội vàng'
          : 'Hãy lắng nghe trái tim và kiên nhẫn chờ đợi';

      overviewText = `💕 KẾT LUẬN TÌNH YÊU: ${loveAdvice}\n\n`;
      overviewText += `Năng lượng tình cảm: ${overallEnergy.toUpperCase()}\n\n`;
      overviewText += this.buildCombinedInsight(cardAnalyses, 'love');

    } else if (isCareerQuestion) {
      const careerAdvice = positiveCount > negativeCount
        ? 'Thời điểm tốt để phát triển sự nghiệp - hãy nắm bắt cơ hội'
        : negativeCount > positiveCount
          ? 'Cần chuẩn bị kỹ lưỡng trước khi hành động'
          : 'Duy trì hiện trạng và quan sát thêm';

      overviewText = `💼 KẾT LUẬN SỰ NGHIỆP: ${careerAdvice}\n\n`;
      overviewText += `Năng lượng sự nghiệp: ${overallEnergy.toUpperCase()}\n\n`;
      overviewText += this.buildCombinedInsight(cardAnalyses, 'career');

    } else if (isHealthQuestion) {
      const healthAdvice = positiveCount > negativeCount
        ? 'Năng lượng sức khỏe ổn định - tiếp tục duy trì thói quen tốt'
        : negativeCount > positiveCount
          ? 'Cần chú ý nghỉ ngơi và chăm sóc bản thân hơn'
          : 'Cân bằng giữa công việc và nghỉ ngơi';

      overviewText = `🌿 KẾT LUẬN SỨC KHỎE: ${healthAdvice}\n\n`;
      overviewText += `Năng lượng: ${overallEnergy.toUpperCase()}\n\n`;
      overviewText += this.buildCombinedInsight(cardAnalyses, 'health');

    } else if (isMoneyQuestion) {
      const moneyAdvice = positiveCount > negativeCount
        ? 'Tài chính đang có xu hướng tích cực - cơ hội để phát triển'
        : negativeCount > positiveCount
          ? 'Cần cẩn trọng với chi tiêu và đầu tư'
          : 'Giữ vững quản lý tài chính hiện tại';

      overviewText = `💰 KẾT LUẬN TÀI CHÍNH: ${moneyAdvice}\n\n`;
      overviewText += `Năng lượng tài chính: ${overallEnergy.toUpperCase()}\n\n`;
      overviewText += this.buildCombinedInsight(cardAnalyses, 'finance');

    } else if (isDecisionQuestion) {
      const decisionAdvice = positiveCount > negativeCount
        ? 'Có thể tiến hành - năng lượng đang ủng hộ quyết định này'
        : negativeCount > positiveCount
          ? 'Nên cân nhắc thêm - chưa phải thời điểm tốt nhất'
          : 'Cả hai lựa chọn đều có ưu nhược điểm - hãy theo trực giác';

      overviewText = `🎯 KẾT LUẬN: ${decisionAdvice}\n\n`;
      overviewText += `Năng lượng quyết định: ${overallEnergy.toUpperCase()}\n\n`;
      overviewText += this.buildCombinedInsight(cardAnalyses, 'decision');

    } else if (question) {
      // General question with specific context
      overviewText = `${energyEmoji} KẾT LUẬN: Năng lượng ${overallEnergy}\n\n`;
      overviewText += `Với câu hỏi "${question}":\n\n`;
      overviewText += this.buildCombinedInsight(cardAnalyses, 'general');

    } else {
      // No question - general reading
      overviewText = `${energyEmoji} TỔNG HỢP NĂNG LƯỢNG: ${overallEnergy.toUpperCase()}\n\n`;
      overviewText += this.buildCombinedInsight(cardAnalyses, 'general');
    }

    return overviewText;
  }

  /**
   * Build comprehensive insight from all cards - DETAILED VERSION
   */
  buildCombinedInsight(cardAnalyses, context) {
    if (!cardAnalyses || cardAnalyses.length === 0) return '';

    let insight = '';

    // Get FULL interpretation from each card (not just first sentence)
    const fullInterpretations = cardAnalyses.map((card, index) => {
      return {
        name: card.name,
        interpretation: card.interpretation || '',
        keywords: card.keywords || [],
        position: card.position,
      };
    });

    // Build comprehensive narrative based on context
    switch (context) {
      case 'trading':
        insight = this.buildTradingNarrative(fullInterpretations);
        break;
      case 'love':
        insight = this.buildLoveNarrative(fullInterpretations);
        break;
      case 'career':
        insight = this.buildCareerNarrative(fullInterpretations);
        break;
      case 'health':
        insight = this.buildHealthNarrative(fullInterpretations);
        break;
      case 'finance':
        insight = this.buildFinanceNarrative(fullInterpretations);
        break;
      case 'decision':
        insight = this.buildDecisionNarrative(fullInterpretations);
        break;
      default:
        insight = this.buildGeneralNarrative(fullInterpretations);
    }

    return insight.trim();
  }

  /**
   * Build detailed trading narrative
   */
  buildTradingNarrative(cards) {
    let narrative = '📈 PHÂN TÍCH CHI TIẾT CHO GIAO DỊCH:\n\n';

    cards.forEach((card, i) => {
      const positionMeaning = this.getTradingPositionMeaning(i, cards.length);
      narrative += `【Lá ${i + 1} - ${positionMeaning}】\n`;
      narrative += `${card.name}\n`;
      narrative += `${card.interpretation}\n`;
      if (card.keywords?.length > 0) {
        narrative += `→ Từ khóa: ${card.keywords.slice(0, 3).join(', ')}\n`;
      }
      narrative += '\n';
    });

    narrative += '💡 GỢI Ý HÀNH ĐỘNG:\n';
    narrative += '• Xem xét kỹ các tín hiệu từ thị trường trước khi quyết định\n';
    narrative += '• Đặt stop-loss và take-profit rõ ràng\n';
    narrative += '• Không FOMO, tuân thủ kế hoạch giao dịch đã đề ra\n';

    return narrative;
  }

  /**
   * Build detailed love narrative
   */
  buildLoveNarrative(cards) {
    let narrative = '💕 PHÂN TÍCH CHI TIẾT VỀ TÌNH YÊU:\n\n';

    cards.forEach((card, i) => {
      const positionMeaning = this.getLovePositionMeaning(i, cards.length);
      narrative += `【Lá ${i + 1} - ${positionMeaning}】\n`;
      narrative += `${card.name}\n`;
      narrative += `${card.interpretation}\n`;
      if (card.keywords?.length > 0) {
        narrative += `→ Cảm xúc: ${card.keywords.slice(0, 3).join(', ')}\n`;
      }
      narrative += '\n';
    });

    narrative += '💝 LỜI KHUYÊN TÌNH CẢM:\n';
    narrative += '• Lắng nghe trái tim nhưng cũng cần sự sáng suốt\n';
    narrative += '• Giao tiếp chân thành và cởi mở với đối phương\n';
    narrative += '• Yêu thương bản thân trước khi trao yêu thương cho người khác\n';

    return narrative;
  }

  /**
   * Build detailed career narrative
   */
  buildCareerNarrative(cards) {
    let narrative = '💼 PHÂN TÍCH CHI TIẾT VỀ SỰ NGHIỆP:\n\n';

    cards.forEach((card, i) => {
      const positionMeaning = this.getCareerPositionMeaning(i, cards.length);
      narrative += `【Lá ${i + 1} - ${positionMeaning}】\n`;
      narrative += `${card.name}\n`;
      narrative += `${card.interpretation}\n`;
      if (card.keywords?.length > 0) {
        narrative += `→ Định hướng: ${card.keywords.slice(0, 3).join(', ')}\n`;
      }
      narrative += '\n';
    });

    narrative += '🎯 LỜI KHUYÊN SỰ NGHIỆP:\n';
    narrative += '• Xác định mục tiêu rõ ràng và lập kế hoạch cụ thể\n';
    narrative += '• Phát triển kỹ năng và mở rộng mối quan hệ\n';
    narrative += '• Kiên nhẫn và bền bỉ với hành trình của mình\n';

    return narrative;
  }

  /**
   * Build detailed health narrative
   */
  buildHealthNarrative(cards) {
    let narrative = '🌿 PHÂN TÍCH CHI TIẾT VỀ SỨC KHỎE:\n\n';

    cards.forEach((card, i) => {
      narrative += `【Lá ${i + 1}】${card.name}\n`;
      narrative += `${card.interpretation}\n\n`;
    });

    narrative += '🏃 LỜI KHUYÊN SỨC KHỎE:\n';
    narrative += '• Cân bằng giữa công việc và nghỉ ngơi\n';
    narrative += '• Chú ý đến dinh dưỡng và giấc ngủ\n';
    narrative += '• Thực hành thiền định hoặc yoga để giảm stress\n';

    return narrative;
  }

  /**
   * Build detailed finance narrative
   */
  buildFinanceNarrative(cards) {
    let narrative = '💰 PHÂN TÍCH CHI TIẾT VỀ TÀI CHÍNH:\n\n';

    cards.forEach((card, i) => {
      narrative += `【Lá ${i + 1}】${card.name}\n`;
      narrative += `${card.interpretation}\n\n`;
    });

    narrative += '📊 LỜI KHUYÊN TÀI CHÍNH:\n';
    narrative += '• Lập ngân sách và theo dõi chi tiêu hàng tháng\n';
    narrative += '• Đa dạng hóa nguồn thu nhập và đầu tư\n';
    narrative += '• Xây dựng quỹ dự phòng cho tình huống khẩn cấp\n';

    return narrative;
  }

  /**
   * Build detailed decision narrative
   */
  buildDecisionNarrative(cards) {
    let narrative = '🎯 PHÂN TÍCH CHI TIẾT CHO QUYẾT ĐỊNH:\n\n';

    if (cards.length >= 3) {
      narrative += `【Lựa chọn thứ nhất】\n${cards[0].name}\n${cards[0].interpretation}\n\n`;
      narrative += `【Lựa chọn thứ hai】\n${cards[1].name}\n${cards[1].interpretation}\n\n`;
      narrative += `【Lời khuyên tổng hợp】\n${cards[2].name}\n${cards[2].interpretation}\n\n`;
    } else {
      cards.forEach((card, i) => {
        narrative += `【Lá ${i + 1}】${card.name}\n${card.interpretation}\n\n`;
      });
    }

    narrative += '⚖️ HƯỚNG DẪN QUYẾT ĐỊNH:\n';
    narrative += '• Cân nhắc ưu và nhược điểm của mỗi lựa chọn\n';
    narrative += '• Lắng nghe trực giác nhưng cũng xem xét logic\n';
    narrative += '• Quyết định nào phù hợp với giá trị cốt lõi của bạn?\n';

    return narrative;
  }

  /**
   * Build detailed general narrative
   */
  buildGeneralNarrative(cards) {
    let narrative = '🔮 PHÂN TÍCH CHI TIẾT TỪNG LÁ BÀI:\n\n';

    cards.forEach((card, i) => {
      narrative += `【Lá ${i + 1}】${card.name}\n`;
      narrative += `${card.interpretation}\n`;
      if (card.keywords?.length > 0) {
        narrative += `→ Thông điệp: ${card.keywords.slice(0, 4).join(', ')}\n`;
      }
      narrative += '\n';
    });

    narrative += '✨ THÔNG ĐIỆP CHUNG:\n';
    narrative += '• Tin tưởng vào hành trình và quá trình của bạn\n';
    narrative += '• Mỗi thử thách là cơ hội để trưởng thành\n';
    narrative += '• Hãy sống với sự tỉnh thức và lòng biết ơn\n';

    return narrative;
  }

  /**
   * Get position meaning for trading spread
   */
  getTradingPositionMeaning(index, total) {
    if (total === 1) return 'Năng lượng hiện tại';
    if (total === 3) {
      const meanings = ['Tình hình thị trường', 'Hành động nên làm', 'Kết quả dự kiến'];
      return meanings[index] || `Vị trí ${index + 1}`;
    }
    if (total === 5) {
      const meanings = ['Xu hướng hiện tại', 'Thách thức', 'Cơ hội', 'Hành động', 'Kết quả'];
      return meanings[index] || `Vị trí ${index + 1}`;
    }
    return `Vị trí ${index + 1}`;
  }

  /**
   * Get position meaning for love spread
   */
  getLovePositionMeaning(index, total) {
    if (total === 1) return 'Năng lượng tình yêu';
    if (total === 3) {
      const meanings = ['Bạn', 'Đối phương', 'Mối quan hệ'];
      return meanings[index] || `Vị trí ${index + 1}`;
    }
    if (total === 5) {
      const meanings = ['Hiện tại của bạn', 'Cảm xúc đối phương', 'Thử thách', 'Lời khuyên', 'Tương lai'];
      return meanings[index] || `Vị trí ${index + 1}`;
    }
    return `Vị trí ${index + 1}`;
  }

  /**
   * Get position meaning for career spread
   */
  getCareerPositionMeaning(index, total) {
    if (total === 1) return 'Năng lượng sự nghiệp';
    if (total === 3) {
      const meanings = ['Hiện tại', 'Thách thức', 'Hướng đi'];
      return meanings[index] || `Vị trí ${index + 1}`;
    }
    if (total === 5) {
      const meanings = ['Tình hình hiện tại', 'Điểm mạnh', 'Điểm cần cải thiện', 'Cơ hội', 'Kết quả'];
      return meanings[index] || `Vị trí ${index + 1}`;
    }
    return `Vị trí ${index + 1}`;
  }

  /**
   * Generate ADVANCED interpretation using API
   * Only called for follow-up questions or deep analysis requests
   */
  async generateAdvancedInterpretation(cards, spread, question, lifeArea = 'general') {
    try {
      const prompt = this.buildPrompt(cards, spread, question, lifeArea);

      console.log('[TarotInterpretationService] Generating ADVANCED interpretation via API...');

      const response = await geminiService.generateResponse(prompt, []);

      if (!response?.text) {
        throw new Error('Empty response from AI');
      }

      const interpretation = this.parseResponse(response.text);

      return {
        data: {
          ...interpretation,
          rawText: response.text,
          tokensUsed: response.tokensUsed || 0,
          duration: response.duration || 0,
          source: 'api',
        },
        error: null,
      };
    } catch (err) {
      console.error('[TarotInterpretationService] API Error:', err);
      return {
        data: this.getFallbackInterpretation(cards, spread),
        error: err?.message || 'Failed to generate advanced interpretation',
      };
    }
  }

  /**
   * Build prompt for AI interpretation
   */
  buildPrompt(cards, spread, question, lifeArea) {
    const spreadName = spread?.name_vi || spread?.name_en || 'Trải bài';
    const positions = typeof spread?.positions === 'string'
      ? JSON.parse(spread.positions)
      : spread?.positions || [];

    // Build card descriptions
    const cardDescriptions = cards.map((card, index) => {
      const position = positions.find(p => p.index === index) || {};
      const positionName = position?.name_vi || `Vị trí ${index + 1}`;
      const reversed = card.isReversed ? ' (Ngược)' : '';

      return `- **${positionName}**: ${card.vietnameseName || card.name}${reversed}`;
    }).join('\n');

    // Life area context
    const areaContextMap = {
      general: 'tổng quát về cuộc sống',
      love: 'tình yêu và mối quan hệ',
      career: 'sự nghiệp và công việc',
      health: 'sức khỏe và năng lượng',
      money: 'tài chính và tiền bạc',
      family: 'gia đình và các mối quan hệ thân thiết',
      trading: 'giao dịch crypto và đầu tư',
    };
    const areaContext = areaContextMap[lifeArea] || areaContextMap.general;

    const prompt = `Bạn là một chuyên gia bói bài Tarot với hơn 20 năm kinh nghiệm. Hãy phân tích trải bài sau đây một cách sâu sắc và đưa ra lời khuyên thiết thực.

**Loại trải bài**: ${spreadName}
**Lĩnh vực**: ${areaContext}
${question ? `**Câu hỏi**: ${question}` : ''}

**Các lá bài đã rút**:
${cardDescriptions}

Hãy đưa ra phân tích theo cấu trúc sau:

1. **TỔNG QUAN** (2-3 câu): Thông điệp chính của trải bài này là gì?

2. **PHÂN TÍCH TỪNG LÁ** (ngắn gọn cho mỗi lá):
${cards.map((_, i) => `   - Lá ${i + 1}: Ý nghĩa trong ngữ cảnh`).join('\n')}

3. **LỜI KHUYÊN HÀNH ĐỘNG** (3 điểm cụ thể):
   - Điều nên làm ngay
   - Điều cần tránh
   - Điều cần chú ý

4. **TINH THỂ KHUYÊN DÙNG**: Đề xuất 2-3 loại đá phong thủy phù hợp với năng lượng trải bài.

5. **AFFIRMATION**: Một câu khẳng định tích cực để người hỏi sử dụng.

Hãy viết bằng tiếng Việt, giọng văn ấm áp, động viên nhưng vẫn thực tế. Không dài quá 400 từ.`;

    return prompt;
  }

  /**
   * Parse AI response into structured format
   */
  parseResponse(text) {
    try {
      const sections = {
        overview: '',
        cardAnalysis: [],
        advice: [],
        crystals: [],
        affirmation: '',
      };

      // Extract overview (TỔNG QUAN section)
      const overviewMatch = text.match(/TỔNG QUAN[:\s]*\n?([\s\S]*?)(?=\n\s*\d+\.|PHÂN TÍCH|$)/i);
      if (overviewMatch) {
        sections.overview = overviewMatch[1].trim().replace(/^\*+|\*+$/g, '').trim();
      }

      // Extract advice (LỜI KHUYÊN section)
      const adviceMatch = text.match(/LỜI KHUYÊN[:\s]*[\s\S]*?(?=\n\s*\d+\.\s*(?:TINH THỂ|AFFIRMATION)|$)/i);
      if (adviceMatch) {
        const adviceLines = adviceMatch[0].match(/[-•]\s*[^-•\n]+/g) || [];
        sections.advice = adviceLines.map(line =>
          line.replace(/^[-•]\s*/, '').replace(/\*+/g, '').trim()
        ).filter(Boolean);
      }

      // Extract crystals (TINH THỂ section)
      const crystalMatch = text.match(/TINH THỂ[:\s]*[\s\S]*?(?=\n\s*\d+\.\s*AFFIRMATION|$)/i);
      if (crystalMatch) {
        const crystalLines = crystalMatch[0].match(/[-•]\s*[^-•\n]+/g) || [];
        sections.crystals = crystalLines.map(line => {
          const cleanLine = line.replace(/^[-•]\s*/, '').replace(/\*+/g, '').trim();
          // Try to extract crystal name
          const nameMatch = cleanLine.match(/^([^:(]+)/);
          return {
            name: nameMatch ? nameMatch[1].trim() : cleanLine,
            description: cleanLine,
          };
        }).filter(c => c.name);
      }

      // Extract affirmation
      const affirmationMatch = text.match(/AFFIRMATION[:\s]*\n?([\s\S]*?)$/i);
      if (affirmationMatch) {
        sections.affirmation = affirmationMatch[1]
          .trim()
          .replace(/^\*+|\*+$/g, '')
          .replace(/^[""]|[""]$/g, '')
          .trim();
      }

      return sections;
    } catch (err) {
      console.error('[TarotInterpretationService] Parse error:', err);
      return {
        overview: text?.substring(0, 500) || '',
        cardAnalysis: [],
        advice: [],
        crystals: [],
        affirmation: '',
      };
    }
  }

  /**
   * Get fallback interpretation when AI fails
   */
  getFallbackInterpretation(cards, spread) {
    const cardNames = cards.map(c => c.vietnameseName || c.name).join(', ');

    return {
      overview: `Trải bài "${spread?.name_vi || 'Tarot'}" với các lá: ${cardNames}. Hãy dành thời gian suy ngẫm về thông điệp từ các lá bài này.`,
      cardAnalysis: [],
      advice: [
        'Tin tưởng vào trực giác của bạn',
        'Hành động với sự cân nhắc và kiên nhẫn',
        'Mở lòng đón nhận những thay đổi tích cực',
      ],
      crystals: [
        { name: 'Thạch Anh Trắng', description: 'Tăng cường năng lượng và làm rõ suy nghĩ' },
        { name: 'Amethyst', description: 'Hỗ trợ trực giác và bình an nội tâm' },
      ],
      affirmation: 'Tôi tin tưởng vào hành trình của mình và đón nhận mọi bài học cuộc sống mang lại.',
      fortune: Math.floor(Math.random() * 3) + 2, // Random 2-4 stars for fallback
      isFallback: true,
    };
  }

  /**
   * Generate quick interpretation for a single card
   */
  async generateQuickInterpretation(card, question = '') {
    try {
      const reversed = card.isReversed ? ' (Ngược)' : '';
      const prompt = `Với tư cách chuyên gia Tarot, hãy cho một lời khuyên ngắn gọn (2-3 câu) về lá bài "${card.vietnameseName || card.name}"${reversed}${question ? ` cho câu hỏi: "${question}"` : ''}. Viết bằng tiếng Việt, động viên và thực tế.`;

      const response = await geminiService.generateResponse(prompt, []);

      return {
        data: response?.text || '',
        error: null,
      };
    } catch (err) {
      console.error('[TarotInterpretationService] Quick interpretation error:', err);
      return {
        data: 'Hãy lắng nghe trực giác và để lá bài hướng dẫn bạn.',
        error: err?.message,
      };
    }
  }

  /**
   * Generate interpretation for I Ching hexagram
   */
  async generateIChingInterpretation(hexagram, question = '', lifeArea = 'general') {
    try {
      const areaContextMap = {
        general: 'tổng quát',
        love: 'tình yêu',
        career: 'sự nghiệp',
        health: 'sức khỏe',
        money: 'tài chính',
        family: 'gia đình',
        trading: 'giao dịch',
      };

      const prompt = `Bạn là chuyên gia Kinh Dịch với 20 năm kinh nghiệm. Hãy giải quẻ sau:

**Quẻ**: ${hexagram.name} (${hexagram.chineseName}) - Quẻ số ${hexagram.id}
**Hình ảnh**: ${hexagram.image}
**Lĩnh vực hỏi**: ${areaContextMap[lifeArea] || 'tổng quát'}
${question ? `**Câu hỏi**: ${question}` : ''}

Hãy đưa ra:
1. **Ý NGHĨA TỔNG QUÁT** (2-3 câu)
2. **LỜI KHUYÊN CHO ${(areaContextMap[lifeArea] || 'cuộc sống').toUpperCase()}** (3 điểm)
3. **TINH THỂ PHÙ HỢP** (2 loại)
4. **AFFIRMATION**

Viết ngắn gọn, tiếng Việt, không quá 300 từ.`;

      const response = await geminiService.generateResponse(prompt, []);

      return {
        data: this.parseResponse(response?.text || ''),
        error: null,
      };
    } catch (err) {
      console.error('[TarotInterpretationService] I Ching error:', err);
      return {
        data: {
          overview: `Quẻ ${hexagram?.name || 'Kinh Dịch'} mang thông điệp về sự biến đổi và cơ hội mới.`,
          advice: ['Kiên nhẫn chờ đợi thời cơ', 'Hành động với sự cân nhắc', 'Tin vào dòng chảy tự nhiên'],
          crystals: [{ name: 'Citrine', description: 'Thu hút năng lượng tích cực' }],
          affirmation: 'Tôi hòa hợp với dòng chảy của vũ trụ.',
        },
        error: err?.message,
      };
    }
  }
}

export const tarotInterpretationService = new TarotInterpretationService();
export default tarotInterpretationService;
