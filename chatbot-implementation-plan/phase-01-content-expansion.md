# Phase 01: Content Expansion

## Phase Information

- **Duration:** 2-3 days (6-8 hours total)
- **Status:** ⏳ Pending
- **Progress:** 0%
- **Dependencies:** None (can start immediately)
- **Priority:** 🔥🔥🔥 CRITICAL

---

## Objectives

Complete the divination content foundation by adding:
1. 59 additional I Ching hexagrams (total 64)
2. 68 additional Tarot cards (total 78)
3. Vietnamese + English + Trading-specific interpretations
4. Validation and testing of all readings

**Why This Phase First:**
- Foundation for all AI responses
- Can reuse existing data from YinYang project
- Critical for chatbot to provide accurate readings
- No dependencies on other features

---

## Deliverables

- [ ] Add 59 I Ching hexagrams (numbers 6-64)
- [ ] Add 12 remaining Major Arcana cards (11-21)
- [ ] Add 56 Minor Arcana cards (Wands, Cups, Swords, Pentacles)
- [ ] Format all entries consistently
- [ ] Test all readings generate correctly
- [ ] Document data structure

---

## What Already Exists

✅ **File:** `frontend/src/services/chatbot.js`

✅ **Current I Ching Array:** (Lines 9-55)
```javascript
const iChingHexagrams = [
  {
    number: 1,
    name: 'Càn (Khởi Đầu)',
    chinese: '乾',
    meaning: 'Sức mạnh sáng tạo...',
    interpretation: 'Thời điểm tốt để bắt đầu...',
    trading: 'BTC và thị trường có thể tăng mạnh...',
    advice: 'Hãy mạnh mẽ và quyết đoán...'
  },
  // Only 5 hexagrams exist (1-5)
];
```

✅ **Current Tarot Array:** (Lines 58-158)
```javascript
const tarotCards = [
  {
    number: 0,
    name: 'The Fool',
    vietnamese: 'Kẻ Ngốc',
    upright: 'Khởi đầu mới...',
    reversed: 'Thiếu thận trọng...',
    trading: 'Cơ hội mới trong thị trường...',
    advice: 'Hãy mạo hiểm có tính toán...'
  },
  // Only 11 cards exist (0-10)
];
```

---

## Step 1: Prepare Data Sources

### Mục đích
Gather I Ching and Tarot data from existing sources to minimize research time.

### Công việc cần làm

1. **Locate YinYang AI Chatbot data:**
   ```bash
   # Navigate to reference folder
   cd "D:\Claude Projects\Yinyang AI Chatbot"

   # Look for data files
   ls *.json *.md
   ```

   Expected files:
   - `iching-data.json` or similar
   - `tarot-data.json` or similar
   - Or embedded in main chatbot file

2. **Extract I Ching data:**
   - Open the file containing hexagram data
   - Copy hexagrams 6-64
   - Verify format matches current structure
   - Note any missing fields

3. **Extract Tarot data:**
   - Open file containing Tarot data
   - Copy Major Arcana 11-21
   - Copy all Minor Arcana (if available)
   - Check for suit structure (Wands, Cups, Swords, Pentacles)

4. **Prepare supplementary data:**
   If YinYang data is incomplete:
   - Use Wikipedia I Ching reference: https://en.wikipedia.org/wiki/List_of_hexagrams_of_the_I_Ching
   - Use Biddy Tarot reference: https://www.biddytarot.com/tarot-card-meanings/
   - Adapt meanings for crypto trading context

### Verification Checklist

- [ ] YinYang chatbot folder accessed
- [ ] I Ching data files located (or alternative source ready)
- [ ] Tarot data files located (or alternative source ready)
- [ ] Data format reviewed and understood
- [ ] Backup plan if data incomplete (Wikipedia + Biddy Tarot)

---

## Step 2: Add 59 I Ching Hexagrams

### Mục đích
Complete the I Ching system from 5 to 64 hexagrams.

### Công việc cần làm

1. **Open chatbot.js:**
   ```bash
   code "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\frontend\src\services\chatbot.js"
   ```

2. **Locate iChingHexagrams array** (line ~9)

3. **Add hexagrams 6-64:**

   **Template for each hexagram:**
   ```javascript
   {
     number: 6,
     name: 'Tụng (Tranh Tụng)',
     chinese: '訟',
     trigrams: ['☰', '☵'],  // Upper and lower trigrams
     meaning: 'Conflict - Thời kỳ xung đột và tranh chấp',
     interpretation: 'Quẻ này cảnh báo về các xung đột trong quyết định. Có sự bất đồng giữa các lực lượng. Cần thận trọng và tránh tranh cãi.',
     trading: 'Thị trường đang có tín hiệu mâu thuẫn. BTC có thể sideway với nhiều biến động nhỏ. Không nên vào lệnh lớn trong thời điểm này.',
     advice: 'Tránh FOMO và quyết định vội vàng. Chờ tín hiệu rõ ràng hơn. Ưu tiên bảo toàn vốn.',
     keywords: ['xung đột', 'tranh chấp', 'thận trọng', 'sideway']
   },
   ```

4. **Field guidelines:**
   - `number`: 1-64
   - `name`: Vietnamese name + English in parentheses
   - `chinese`: Traditional Chinese character
   - `trigrams`: Array of 2 trigram symbols (☰☷☵☶☴☳☱☲)
   - `meaning`: Short 1-sentence meaning
   - `interpretation`: 2-3 sentences explaining the hexagram
   - `trading`: Specific crypto trading advice
   - `advice`: General life/trading wisdom
   - `keywords`: Array of 3-5 keywords for search

5. **Batch entry strategy:**
   ```javascript
   // Group by similarity for faster entry
   // Example: Hexagrams 6-10
   {
     number: 6,
     name: 'Tụng (Conflict)',
     // ... full entry
   },
   {
     number: 7,
     name: 'Sư (The Army)',
     // ... full entry
   },
   // Continue through 64...
   ```

6. **Save and format:**
   - Run Prettier to format code
   - Ensure no syntax errors
   - Verify array structure intact

### Files to Modify

- `frontend/src/services/chatbot.js` (lines ~9-200)

### Verification Checklist

- [ ] All 64 hexagrams present (numbers 1-64)
- [ ] No duplicate numbers
- [ ] All fields populated for each hexagram
- [ ] Trading advice relevant to crypto
- [ ] Vietnamese + English names
- [ ] No syntax errors in JavaScript
- [ ] Array properly closed with `];`

---

## Step 3: Add 68 Tarot Cards

### Mục đích
Complete the Tarot system with all 78 cards.

### Công việc cần làm

1. **Add 12 remaining Major Arcana (11-21):**

   **Template:**
   ```javascript
   {
     number: 11,
     name: 'Justice',
     vietnamese: 'Công Lý',
     suit: 'major',
     upright: 'Công bằng, cân bằng, chân lý, karma, trách nhiệm',
     reversed: 'Bất công, mất cân bằng, trốn tránh trách nhiệm',
     trading: 'Thị trường đang tìm sự cân bằng sau biến động. Price action phản ánh đúng giá trị. Hãy trade công bằng, đừng manipulate.',
     advice: 'Hành động với integrity. Những gì bạn làm sẽ quay lại với bạn (karma). Make ethical trading decisions.',
     keywords: ['công bằng', 'cân bằng', 'karma', 'chân lý']
   },
   ```

2. **Add 56 Minor Arcana:**

   **Structure:**
   - **Wands (14 cards):** Ace, 2-10, Page, Knight, Queen, King
   - **Cups (14 cards):** Ace, 2-10, Page, Knight, Queen, King
   - **Swords (14 cards):** Ace, 2-10, Page, Knight, Queen, King
   - **Pentacles (14 cards):** Ace, 2-10, Page, Knight, Queen, King

   **Template for numbered cards:**
   ```javascript
   {
     number: null,  // Minor Arcana don't have number 0-21
     name: 'Ace of Wands',
     vietnamese: 'Át Gậy',
     suit: 'wands',
     element: 'fire',
     upright: 'Khởi đầu sáng tạo, cơ hội mới, inspiration, năng lượng',
     reversed: 'Thiếu động lực, delay, false start',
     trading: 'Cơ hội trading mới xuất hiện! Có thể là altcoin mới hoặc pattern mới. Energy tốt để vào lệnh.',
     advice: 'Hãy nắm bắt cơ hội khi nó xuất hiện. Trust your instinct nhưng verify bằng analysis.',
     keywords: ['khởi đầu', 'cơ hội', 'năng lượng', 'sáng tạo']
   },
   ```

   **Template for court cards:**
   ```javascript
   {
     number: null,
     name: 'King of Wands',
     vietnamese: 'Vua Gậy',
     suit: 'wands',
     element: 'fire',
     rank: 'king',
     upright: 'Lãnh đạo tự nhiên, visionary, bold, passionate, confident',
     reversed: 'Arrogant, impulsive, overbearing',
     trading: 'Trade với sự tự tin và vision rõ ràng. Đừng sợ take calculated risks. Be a leader, not follower.',
     advice: 'Hãy mạnh mẽ trong quyết định nhưng không kiêu ngạo. Lead by example.',
     keywords: ['lãnh đạo', 'tự tin', 'vision', 'quyết đoán']
   },
   ```

3. **Suit meanings for trading context:**
   - **Wands (Fire):** Energy, action, short-term trades, momentum
   - **Cups (Water):** Emotions, market sentiment, FOMO/FUD, intuition
   - **Swords (Air):** Logic, analysis, technical indicators, decisions
   - **Pentacles (Earth):** Long-term holds, wealth, portfolio management, stability

### Files to Modify

- `frontend/src/services/chatbot.js` (lines ~158-500)

### Verification Checklist

- [ ] 22 Major Arcana cards (0-21)
- [ ] 14 Wands cards
- [ ] 14 Cups cards
- [ ] 14 Swords cards
- [ ] 14 Pentacles cards
- [ ] **Total: 78 cards**
- [ ] All upright/reversed meanings present
- [ ] Trading context for each card
- [ ] Vietnamese names included
- [ ] No syntax errors

---

## Step 4: Data Structure Validation

### Mục đích
Ensure data consistency and accessibility.

### Công việc cần làm

1. **Add helper functions:**

   ```javascript
   // Add after the arrays in chatbot.js

   /**
    * Get I Ching hexagram by number
    */
   export const getHexagramByNumber = (number) => {
     return iChingHexagrams.find(h => h.number === number);
   };

   /**
    * Get random I Ching hexagram
    */
   export const getRandomHexagram = () => {
     const index = Math.floor(Math.random() * iChingHexagrams.length);
     return iChingHexagrams[index];
   };

   /**
    * Get Tarot card by name
    */
   export const getTarotCardByName = (name) => {
     return tarotCards.find(c => c.name.toLowerCase() === name.toLowerCase());
   };

   /**
    * Get random Tarot card
    */
   export const getRandomTarotCard = () => {
     const index = Math.floor(Math.random() * tarotCards.length);
     return tarotCards[index];
   };

   /**
    * Get Tarot cards by suit
    */
   export const getTarotCardsBySuit = (suit) => {
     return tarotCards.filter(c => c.suit === suit);
   };

   /**
    * Perform 3-card Tarot spread
    */
   export const getThreeCardSpread = () => {
     const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
     return {
       past: shuffled[0],
       present: shuffled[1],
       future: shuffled[2]
     };
   };
   ```

2. **Validate array integrity:**

   ```javascript
   // Add validation function (for testing only, can remove later)
   const validateData = () => {
     console.log('Validating I Ching data...');
     console.log(`Total hexagrams: ${iChingHexagrams.length}`); // Should be 64

     // Check for duplicates
     const numbers = iChingHexagrams.map(h => h.number);
     const hasDuplicates = numbers.length !== new Set(numbers).size;
     console.log(`Has duplicate numbers: ${hasDuplicates}`); // Should be false

     // Check for missing numbers
     for (let i = 1; i <= 64; i++) {
       if (!iChingHexagrams.find(h => h.number === i)) {
         console.error(`Missing hexagram #${i}`);
       }
     }

     console.log('Validating Tarot data...');
     console.log(`Total cards: ${tarotCards.length}`); // Should be 78

     // Check suits
     const major = tarotCards.filter(c => c.suit === 'major');
     const wands = tarotCards.filter(c => c.suit === 'wands');
     const cups = tarotCards.filter(c => c.suit === 'cups');
     const swords = tarotCards.filter(c => c.suit === 'swords');
     const pentacles = tarotCards.filter(c => c.suit === 'pentacles');

     console.log(`Major Arcana: ${major.length}`); // Should be 22
     console.log(`Wands: ${wands.length}`); // Should be 14
     console.log(`Cups: ${cups.length}`); // Should be 14
     console.log(`Swords: ${swords.length}`); // Should be 14
     console.log(`Pentacles: ${pentacles.length}`); // Should be 14
   };

   // Run validation (comment out after confirming)
   // validateData();
   ```

### Verification Checklist

- [ ] Helper functions added
- [ ] Validation function runs without errors
- [ ] 64 I Ching hexagrams confirmed
- [ ] 78 Tarot cards confirmed
- [ ] No duplicate entries
- [ ] No missing entries
- [ ] All required fields present

---

## Step 5: Testing

### Mục đích
Verify all readings generate correctly.

### Manual Testing Checklist

1. **Test I Ching readings:**
   - [ ] Open chatbot at http://localhost:5174/chatbot
   - [ ] Select "I Ching" mode
   - [ ] Ask 10 different questions
   - [ ] Verify each response shows:
     - Hexagram number (1-64)
     - Name (Vietnamese + English)
     - Chinese character
     - Interpretation
     - Trading advice
   - [ ] Verify variety (not same hexagram every time)

2. **Test Tarot readings (single card):**
   - [ ] Select "Tarot" mode
   - [ ] Choose "1 Lá (Single)"
   - [ ] Ask 10 different questions
   - [ ] Verify each response shows:
     - Card name (English + Vietnamese)
     - Upright/Reversed status
     - Meaning (upright or reversed)
     - Trading advice
   - [ ] Verify variety across suits (not just Major Arcana)

3. **Test Tarot readings (3-card spread):**
   - [ ] Choose "3 Lá (Past-Present-Future)"
   - [ ] Ask 5 different questions
   - [ ] Verify each response shows:
     - Past card with meaning
     - Present card with meaning
     - Future card with meaning
     - Cohesive narrative
   - [ ] Verify different cards in each spread

4. **Test data integrity:**
   - [ ] Open browser console (F12)
   - [ ] Check for JavaScript errors
   - [ ] Verify no "undefined" in responses
   - [ ] Check all Vietnamese characters display correctly

### Edge Cases to Test

1. **Missing field:**
   - If any hexagram/card has missing field → Should show placeholder or skip gracefully
   - Example: If `advice` is empty, don't show "Advice: undefined"

2. **Special characters:**
   - Vietnamese diacritics (á, ă, ê, ô, ơ, ư) should display correctly
   - Chinese characters should render properly
   - Trigram symbols (☰☷☵☶☴☳☱☲) should show

3. **Long responses:**
   - Some interpretations may be very long
   - Ensure they don't break UI layout
   - Test on mobile viewport

### Unit Tests (Optional)

```javascript
// Add to chatbot.test.js (if exists)
describe('I Ching Data', () => {
  test('should have 64 hexagrams', () => {
    expect(iChingHexagrams.length).toBe(64);
  });

  test('should have all numbers from 1-64', () => {
    for (let i = 1; i <= 64; i++) {
      const hexagram = iChingHexagrams.find(h => h.number === i);
      expect(hexagram).toBeDefined();
    }
  });

  test('each hexagram should have required fields', () => {
    iChingHexagrams.forEach(hexagram => {
      expect(hexagram.number).toBeDefined();
      expect(hexagram.name).toBeDefined();
      expect(hexagram.chinese).toBeDefined();
      expect(hexagram.meaning).toBeDefined();
      expect(hexagram.interpretation).toBeDefined();
      expect(hexagram.trading).toBeDefined();
    });
  });
});

describe('Tarot Data', () => {
  test('should have 78 cards', () => {
    expect(tarotCards.length).toBe(78);
  });

  test('should have 22 Major Arcana', () => {
    const major = tarotCards.filter(c => c.suit === 'major');
    expect(major.length).toBe(22);
  });

  test('should have 14 cards per Minor Arcana suit', () => {
    expect(tarotCards.filter(c => c.suit === 'wands').length).toBe(14);
    expect(tarotCards.filter(c => c.suit === 'cups').length).toBe(14);
    expect(tarotCards.filter(c => c.suit === 'swords').length).toBe(14);
    expect(tarotCards.filter(c => c.suit === 'pentacles').length).toBe(14);
  });
});
```

---

## Edge Cases & Error Handling

### Edge Case 1: Data File Too Large
**Scenario:** After adding 64 hexagrams + 78 cards, chatbot.js becomes >2000 lines

**Solution:**
- Split into separate files:
  - `data/iching.json`
  - `data/tarot.json`
- Import in chatbot.js:
  ```javascript
  import iChingData from './data/iching.json';
  import tarotData from './data/tarot.json';
  ```

### Edge Case 2: Special Character Encoding
**Scenario:** Chinese characters or Vietnamese diacritics not displaying

**Solution:**
- Ensure file saved as UTF-8
- Add meta tag to index.html (should already exist):
  ```html
  <meta charset="UTF-8" />
  ```

### Edge Case 3: Random Selection Bias
**Scenario:** Some cards/hexagrams appear more frequently than others

**Solution:**
- Use crypto-secure randomization:
  ```javascript
  const getSecureRandom = (max) => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  };
  ```

---

## Dependencies & Prerequisites

### Required Files
- ✅ `frontend/src/services/chatbot.js` (already exists)
- ✅ Access to `D:\Claude Projects\Yinyang AI Chatbot\` (data source)

### Optional Dependencies
- Wikipedia I Ching reference (if YinYang data incomplete)
- Biddy Tarot reference (for Tarot meanings)

### No Package Installation Needed
This phase only modifies existing JavaScript file - no new dependencies.

---

## Completion Criteria

Phase 01 is complete when:

- [ ] `iChingHexagrams` array has 64 entries
- [ ] `tarotCards` array has 78 entries
- [ ] All entries have required fields populated
- [ ] Trading advice relevant to crypto market
- [ ] Vietnamese + English names present
- [ ] No JavaScript syntax errors
- [ ] Validation function confirms data integrity
- [ ] Manual testing shows variety in readings
- [ ] No "undefined" or missing data in UI
- [ ] Commit made: `feat: complete phase-01 - content expansion`

---

## Notes & Best Practices

### Data Entry Tips

✅ **DO:**
- Copy-paste from YinYang data when possible (faster)
- Use Prettier to auto-format code
- Test every 10-15 entries to catch errors early
- Keep trading advice crypto-specific (BTC, ETH, altcoins)
- Use simple, clear Vietnamese

❌ **DON'T:**
- Manually type all 127 entries (too slow and error-prone)
- Use machine translation for Vietnamese (quality issues)
- Copy generic Tarot meanings without crypto context
- Skip testing until all entries complete

### Time Savers

1. **Batch similar entries:**
   - Do all Wands together
   - Do all Cups together
   - Use find-replace for common phrases

2. **Template reuse:**
   - Save court card template
   - Save numbered card template
   - Modify only unique parts

3. **Validation early:**
   - Run validateData() after each suit
   - Catch duplicates/errors immediately

---

## Next Steps

After completing Phase 01:

1. ✅ Update `plan.md`:
   - Change Phase 01 status to "✅ Completed"
   - Update progress to 100%
   - Add completion date

2. ✅ Commit changes:
   ```bash
   git add frontend/src/services/chatbot.js
   git commit -m "feat: complete phase-01 - add 64 I Ching + 78 Tarot cards

   - Added 59 new I Ching hexagrams (6-64)
   - Added 12 remaining Major Arcana (11-21)
   - Added 56 Minor Arcana cards (all suits)
   - All entries include Vietnamese, English, trading advice
   - Validation confirms 64 hexagrams + 78 cards"
   ```

3. ✅ Open next phase:
   ```
   phase-02-gemini-integration.md
   ```

---

**Phase 01 Complete! Ready for AI Intelligence (Phase 02)** 🎉
