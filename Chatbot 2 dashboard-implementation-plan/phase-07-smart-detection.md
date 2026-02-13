# Phase 07: Smart Detection System

## Thông Tin Phase
- **Thời lượng ước tính:** 3-4 ngày
- **Trạng thái:** ⏳ Pending
- **Tiến độ:** 0%
- **Phụ thuộc:** Phase 01-06 (Chatbot cơ bản đã hoàn thành)

## Mục Tiêu
Xây dựng hệ thống AI tự động phát hiện loại response và extract structured data từ AI chatbot responses, để biết khi nào cần tạo dashboard widgets.

## Deliverables
- [ ] ResponseDetector service (7 response types)
- [ ] DataExtractor service (extract structured data)
- [ ] System prompt updates cho Gemini API
- [ ] Integration tests cho detection system

---

## Bước 1: Tạo ResponseDetector Service

### Mục đích
Phân loại AI responses thành 7 loại: Manifestation Goal, Crystal Recommendation, Trading Analysis, Affirmations Only, I Ching Reading, Tarot Reading, General Chat.

### Công việc cần làm

1. **Tạo file responseDetector.js**

```javascript
// File: frontend/src/services/responseDetector.js

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
          confidence: 0.88,
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
```

### Files cần tạo
- `frontend/src/services/responseDetector.js` - Main detector service

### Verification Checklist
- [ ] File tạo thành công
- [ ] ResponseTypes enum có 7 types
- [ ] detect() method hoạt động
- [ ] hasKeywords() hoạt động
- [ ] hasStructuredData() hoạt động
- [ ] hasAffirmationMarkers() hoạt động

---

## Bước 2: Tạo DataExtractor Service

### Mục đích
Extract structured data từ AI response (goal title, target amount, timeline, affirmations, action steps, crystals).

### Công việc cần làm

1. **Tạo file dataExtractor.js**

```javascript
// File: frontend/src/services/dataExtractor.js

export class DataExtractor {

  /**
   * Extract manifestation goal data
   */
  extractManifestationData(aiResponse) {
    return {
      goalTitle: this.extractTitle(aiResponse),
      targetAmount: this.extractAmount(aiResponse),
      timeline: this.extractTimeline(aiResponse),
      affirmations: this.extractAffirmations(aiResponse),
      actionSteps: this.extractActionSteps(aiResponse),
      crystalRecommendations: this.extractCrystals(aiResponse)
    };
  }

  /**
   * Extract goal title
   */
  extractTitle(text) {
    const patterns = [
      /🎯\s*MỤC TIÊU\s*[:：]?\s*([^\n]+)/i,
      /manifest\s+([^.!?\n]+)/i,
      /mục tiêu\s*[:：]?\s*([^.!?\n]+)/i,
      /goal\s*[:：]?\s*([^.!?\n]+)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return 'Mục tiêu mới';
  }

  /**
   * Extract monetary amount
   */
  extractAmount(text) {
    const patterns = [
      /💰\s*Target\s*[:：]?\s*([0-9,\.]+)\s*(triệu|million|m|vnd)/i,
      /(\d{1,3}(?:[,\.]\d{3})+)\s*(triệu|million|m)/i,
      /(\d+)\s*(triệu|million|m)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const num = parseFloat(match[1].replace(/[,\.]/g, ''));

        if (match[2] && (match[2].toLowerCase().includes('triệu') || match[2].toLowerCase().includes('m'))) {
          return num * 1000000;
        }

        return num;
      }
    }

    return null;
  }

  /**
   * Extract timeline
   */
  extractTimeline(text) {
    const patterns = [
      /📅\s*Timeline\s*[:：]?\s*(\d+)\s*(tháng|month|months)/i,
      /(\d+)\s*(tháng|month|months)/i,
      /(\d+)\s*(tuần|week|weeks)/i,
      /(\d+)\s*(ngày|day|days)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const num = parseInt(match[1]);

        if (match[2].toLowerCase().includes('tháng') || match[2].toLowerCase().includes('month')) {
          return { months: num };
        }
        if (match[2].toLowerCase().includes('tuần') || match[2].toLowerCase().includes('week')) {
          return { weeks: num };
        }
        if (match[2].toLowerCase().includes('ngày') || match[2].toLowerCase().includes('day')) {
          return { days: num };
        }
      }
    }

    return { months: 6 }; // Default 6 months
  }

  /**
   * Extract affirmations (lines starting with ✨, •, -, or numbers)
   */
  extractAffirmations(text) {
    const lines = text.split('\n');
    const affirmations = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Match patterns: ✨ "text", • "text", - "text", 1. "text"
      const patterns = [
        /^✨\s*["'](.+?)["']$/,
        /^✨\s*(.+)$/,
        /^•\s*["'](.+?)["']$/,
        /^•\s*(.+)$/,
        /^-\s*["'](.+?)["']$/,
        /^-\s*(.+)$/,
        /^\d+\.\s*["'](.+?)["']$/,
        /^\d+\.\s*(.+)$/
      ];

      for (const pattern of patterns) {
        const match = trimmed.match(pattern);
        if (match && match[1] && match[1].length > 10) {
          const cleaned = match[1].replace(/^["']|["']$/g, '').trim();
          if (cleaned.length > 10) {
            affirmations.push(cleaned);
            break;
          }
        }
      }
    }

    return affirmations.slice(0, 10); // Max 10 affirmations
  }

  /**
   * Extract action plan steps
   */
  extractActionSteps(text) {
    const steps = [];
    const sections = text.split(/Week\s+(\d+)[:：]?|Tuần\s+(\d+)[:：]?/i);

    for (let i = 1; i < sections.length; i += 3) {
      const weekNum = sections[i] || sections[i + 1];
      const content = sections[i + 2] || sections[i + 1] || '';

      if (!weekNum || !content) continue;

      const lines = content.split('\n');
      const tasks = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.match(/^\d+\./)) {
          const cleaned = trimmed.replace(/^[•\-\d.]+\s*/, '').trim();
          if (cleaned && cleaned.length > 5) {
            tasks.push(cleaned);
          }
        }
      }

      if (tasks.length > 0) {
        steps.push({
          week: parseInt(weekNum),
          tasks: tasks
        });
      }
    }

    return steps;
  }

  /**
   * Extract crystal recommendations
   */
  extractCrystals(text) {
    const crystals = [];
    const lines = text.split('\n');
    let inCrystalSection = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (/💎\s*CRYSTALS?/i.test(trimmed) || /CRYSTAL.*RECOMMENDATION/i.test(trimmed)) {
        inCrystalSection = true;
        continue;
      }

      if (inCrystalSection) {
        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
          const cleaned = trimmed.replace(/^[•\-]+\s*/, '').trim();
          if (cleaned) {
            crystals.push(cleaned);
          }
        } else if (trimmed === '' || /^[#\*]/.test(trimmed)) {
          // End of crystal section
          break;
        }
      }
    }

    return crystals.slice(0, 5); // Max 5 crystals
  }
}
```

### Files cần tạo
- `frontend/src/services/dataExtractor.js` - Data extraction service

### Verification Checklist
- [ ] File tạo thành công
- [ ] extractTitle() hoạt động với nhiều formats
- [ ] extractAmount() parse được số tiền
- [ ] extractTimeline() parse được thời gian
- [ ] extractAffirmations() lấy được affirmations
- [ ] extractActionSteps() parse được action plan
- [ ] extractCrystals() lấy được crystal recommendations

---

## Bước 3: Update System Prompts

### Mục đích
Hướng dẫn Gemini AI trả response theo format chuẩn để dễ dàng detect và extract data.

### Công việc cần làm

1. **Tạo hoặc update file systemPrompts.js**

```javascript
// File: frontend/src/config/systemPrompts.js

export const MANIFESTATION_SYSTEM_PROMPT = `
Bạn là Gemral - ứng dụng hỗ trợ manifestation và trading thông minh.

KHI user hỏi về MANIFESTATION GOAL hoặc đặt mục tiêu:
1. Trả lời với cấu trúc RÕ RÀNG theo format sau:

🎯 MỤC TIÊU: [Tên mục tiêu rõ ràng, cụ thể]
💰 Target: [Số tiền] triệu VND (hoặc số tiền cụ thể)
📅 Timeline: [X] tháng

✨ AFFIRMATIONS (5-10 câu):
✨ "Affirmation 1 - bắt đầu bằng 'Tôi là', 'Tôi có', 'Tôi xứng đáng'..."
✨ "Affirmation 2..."
✨ "Affirmation 3..."

📋 ACTION PLAN:
Week 1: [Tên phase]
• Task 1
• Task 2

Week 2: [Tên phase]
• Task 3
• Task 4

💎 CRYSTALS:
• Crystal 1 (Mục đích sử dụng)
• Crystal 2 (Mục đích sử dụng)

QUAN TRỌNG:
- KHÔNG BAO GIỜ nói "AI", "Claude", "tôi là AI"
- LUÔN nói "Gemral phân tích...", "Dựa trên dữ liệu..."
- User nghĩ đây là tính năng của app, không phải chat với AI
- Format PHẢI đúng như trên để hệ thống tự động tạo dashboard widgets
`;

export const CRYSTAL_SYSTEM_PROMPT = `
Bạn là Gemral - chuyên gia về crystal healing và manifestation.

KHI user hỏi về crystals:
1. Recommend 3-5 crystals phù hợp
2. Format trả lời:

💎 CRYSTAL RECOMMENDATIONS:
• [Crystal Name] - [Purpose/Benefit] - [How to use]
• [Crystal Name] - [Purpose/Benefit] - [How to use]

🧘 PLACEMENT GUIDE:
• [Location 1]: [Which crystals]
• [Location 2]: [Which crystals]

🌙 CLEANSING:
• [Method 1]
• [Method 2]

KHÔNG nói "AI recommends", nói "Gemral suggests"
`;

export const TRADING_ANALYSIS_PROMPT = `
Bạn là Gemral - kết hợp spiritual wisdom với trading analysis.

KHI user chia sẻ về trading loss:
1. Phân tích SPIRITUAL ROOT CAUSES (chakra blocks, energy imbalances)
2. Đưa ra PRACTICAL LESSONS
3. Recommend HEALING STEPS

Format:

🔮 SPIRITUAL ANALYSIS:
• [Chakra/Energy issue identified]
• [Why this caused the loss]

📚 LESSONS:
• Lesson 1
• Lesson 2

💎 HEALING PLAN:
• Crystal recommendations
• Meditation practices
• Affirmations

KHÔNG nói "AI thinks", nói "Based on energy analysis"
`;
```

### Files cần tạo/sửa
- `frontend/src/config/systemPrompts.js` - System prompts

### Verification Checklist
- [ ] File tạo thành công
- [ ] MANIFESTATION_SYSTEM_PROMPT đầy đủ
- [ ] CRYSTAL_SYSTEM_PROMPT đầy đủ
- [ ] TRADING_ANALYSIS_PROMPT đầy đủ
- [ ] Format instructions rõ ràng

---

## Bước 4: Integration Tests

### Mục đích
Test toàn bộ detection + extraction flow với sample responses.

### Công việc cần làm

1. **Tạo test file**

```javascript
// File: frontend/src/services/__tests__/responseDetector.test.js

import { ResponseDetector, ResponseTypes } from '../responseDetector';
import { DataExtractor } from '../dataExtractor';

describe('ResponseDetector', () => {
  const detector = new ResponseDetector();

  test('Should detect MANIFESTATION_GOAL', () => {
    const sampleResponse = `
    🎯 MỤC TIÊU: Kiếm thêm 100 triệu VND passive income
    💰 Target: 100 triệu VND
    📅 Timeline: 6 tháng

    ✨ AFFIRMATIONS:
    ✨ "Tôi xứng đáng với 100 triệu mỗi tháng"
    ✨ "Tiền bạc chảy vào cuộc đời tôi dễ dàng"

    📋 ACTION PLAN:
    Week 1: Research
    • Task 1
    `;

    const result = detector.detect(sampleResponse);

    expect(result.type).toBe(ResponseTypes.MANIFESTATION_GOAL);
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  test('Should detect CRYSTAL_RECOMMENDATION', () => {
    const sampleResponse = `
    💎 CRYSTAL RECOMMENDATIONS:
    • Citrine - For abundance
    • Rose Quartz - For love
    `;

    const result = detector.detect(sampleResponse);
    expect(result.type).toBe(ResponseTypes.CRYSTAL_RECOMMENDATION);
  });

  test('Should detect GENERAL_CHAT when no special markers', () => {
    const sampleResponse = "Hello, how can I help you today?";
    const result = detector.detect(sampleResponse);
    expect(result.type).toBe(ResponseTypes.GENERAL_CHAT);
  });
});

describe('DataExtractor', () => {
  const extractor = new DataExtractor();

  test('Should extract goal title', () => {
    const text = "🎯 MỤC TIÊU: Kiếm 100 triệu VND";
    const title = extractor.extractTitle(text);
    expect(title).toBe("Kiếm 100 triệu VND");
  });

  test('Should extract amount', () => {
    const text = "💰 Target: 100 triệu VND";
    const amount = extractor.extractAmount(text);
    expect(amount).toBe(100000000);
  });

  test('Should extract timeline', () => {
    const text = "📅 Timeline: 6 tháng";
    const timeline = extractor.extractTimeline(text);
    expect(timeline).toEqual({ months: 6 });
  });

  test('Should extract affirmations', () => {
    const text = `
    ✨ "Affirmation 1"
    ✨ "Affirmation 2"
    `;
    const affirmations = extractor.extractAffirmations(text);
    expect(affirmations.length).toBe(2);
  });
});
```

### Manual Testing Checklist
- [ ] Test với manifestation goal response
- [ ] Test với crystal recommendation
- [ ] Test với trading analysis
- [ ] Test với general chat
- [ ] Test với malformed responses
- [ ] Test edge cases (empty response, very long response)

---

## Edge Cases & Error Handling

### Edge Cases cần xử lý

1. **Empty or null response**
   - Hiện tượng: AI trả về empty string
   - Giải pháp: Return GENERAL_CHAT type với confidence 1.0

2. **Malformed response (không đúng format)**
   - Hiện tượng: AI không follow system prompt
   - Giải pháp: Still detect based on keywords, confidence sẽ thấp hơn

3. **Mixed response types**
   - Hiện tượng: Response vừa có goal vừa có crystals
   - Giải pháp: Ưu tiên type có confidence cao nhất

### Error Handling

```javascript
// In responseDetector.js
detect(aiResponse) {
  try {
    if (!aiResponse || aiResponse.trim() === '') {
      return {
        type: ResponseTypes.GENERAL_CHAT,
        confidence: 1.0,
        extractedData: null
      };
    }

    // ... existing detection logic ...

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
```

---

## Dependencies & Prerequisites

### Packages cần cài
```bash
# No new packages needed for Phase 07
# (Existing: React, Supabase client)
```

### Environment Variables
```env
# Already set from Phase 01-06
VITE_GEMINI_API_KEY=AIzaSyCymkgeL0ERDYYePtbV4zuL-BZ2mfMxehc
```

---

## Completion Criteria

Phase 07 được coi là hoàn thành khi:
- [ ] ResponseDetector service hoạt động với 7 types
- [ ] DataExtractor extract được tất cả fields
- [ ] System prompts đã được tạo/update
- [ ] Tests pass với >80% coverage
- [ ] Manual testing với 5 sample responses thành công
- [ ] Không có errors trong console

---

## Notes & Best Practices

### Lưu ý khi thực hiện
- ⚠️ Gemini API có thể không luôn follow exact format → detection phải flexible
- ⚠️ Confidence threshold: Chỉ create widget khi confidence >= 0.85
- ⚠️ Test với tiếng Việt VÀ tiếng Anh

### Best Practices
- ✅ Sử dụng regex cẩn thận, tránh quá strict
- ✅ Luôn có fallback cho các patterns không match
- ✅ Log detection results để debug dễ dàng

### Common Pitfalls
- ❌ Regex quá strict → miss nhiều cases → Làm flexible hơn
- ❌ Quên handle Unicode characters (Vietnamese) → Dùng /u flag
- ❌ Không test với real AI responses → Test với Gemini thật

---

## Next Steps

Sau khi hoàn thành Phase 07:
1. Cập nhật `plan.md`: Mark Phase 07 = ✅ Completed
2. Commit: `feat: complete phase-07 - smart detection system`
3. Hỏi user review kết quả
4. Chuyển sang `phase-08-widget-factory-database.md`
