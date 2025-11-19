# GEM CHATBOT - Context Brief for AI Implementation

## Quick Overview

**Gem Chatbot** là tính năng AI mystical trading advisor kết hợp:
- ☯️ I Ching divination (Dịch Kinh)
- 🔮 Tarot readings
- 💬 Trading & Life guidance chat

**Current Status:** Demo-level feature with hardcoded responses, NO real AI yet
**Tech Stack:** React + Supabase + Keyword matching (needs Claude API upgrade)
**Integration:** Community Hub, Scanner Dashboard, Tier-gated access

---

## Current Implementation Summary

### 1. Architecture

```
Frontend: Chatbot.jsx (348 lines) + Chatbot.css (613 lines)
Service: chatbot.js (389 lines) - keyword matching only
Database: chatbot_history table (Supabase PostgreSQL)
Auth: Integrated with users.chatbot_tier column
```

### 2. Three Modes

**A. Chat Mode**
- Keyword-based responses (8 categories)
- Topics: greetings, trading, spiritual, patterns, risk, emotions
- NO conversation memory, NO context awareness

**B. I Ching Mode**
- 5/64 hexagrams implemented (hardcoded)
- Returns: hexagram number, name, Chinese character, interpretation, trading advice
- Format: Markdown response

**C. Tarot Mode**
- 10/78 cards implemented (Major Arcana only)
- Two spreads: Single card, 3-card (Past-Present-Future)
- 50% chance of "reversed" reading
- Returns: Card name, upright/reversed meanings

### 3. Tier System & Limits

| Tier   | Daily Limit | Annual Cost | Notes |
|--------|-------------|-------------|-------|
| FREE   | 5 queries   | Free        | Basic gate |
| TIER1  | 15 queries  | 11M VND     | Chatbot Pro |
| TIER2  | 50 queries  | 21M VND     | Chatbot Pro |
| TIER3  | Unlimited   | 68M VND     | Chatbot Premium |

**Storage:** `users.chatbot_tier` + `users.chatbot_tier_expires_at`
**Usage Tracking:** Count records from `chatbot_history` where `created_at >= today`

### 4. Database Schema

```sql
CREATE TABLE chatbot_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type TEXT CHECK (type IN ('iching', 'tarot', 'chat')),
  question TEXT,
  response TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only view/insert/delete their own history
```

### 5. Key Service Methods

```javascript
class ChatbotService {
  // Returns hardcoded hexagram based on random selection
  async getIChingReading(question)

  // Returns random tarot card(s) with upright/reversed
  async getTarotReading(question, spreadType)

  // Keyword matching for chat responses
  async chatWithMaster(message, context)

  // Saves conversation to database
  async saveChatHistory(userId, chatData)

  // Checks if user has remaining quota for today
  async checkUsageLimit(userId, userTier)
}
```

---

## Critical Gaps & Limitations

### ❌ Missing AI Intelligence
- **NO LLM integration** - uses hardcoded keyword matching
- **NO conversation memory** - each query is isolated
- **NO context awareness** - cannot understand nuance
- **NO learning** - responses never improve

### ❌ Limited Content
- **Only 5/64 I Ching hexagrams**
- **Only 10/78 Tarot cards**
- **Only 8 chat response categories**
- All hardcoded in JavaScript arrays

### ❌ No Trading Integration
- Cannot access real price data
- Cannot analyze charts
- Cannot see user's portfolio
- No personalized trading advice

### ❌ UX Limitations
- No follow-up questions
- No clarification ability
- No reading explanations
- No customization (reading depth, style)

### ❌ Technical Debt
- No TypeScript
- No unit tests
- Vietnamese only (no i18n)
- No proper error logging
- No rate limiting (client-side only)

---

## Upgrade Opportunities - PRIORITIZED

### 🚀 PHASE 1: AI Core Upgrade (HIGH PRIORITY)

**Goal:** Replace keyword matching with real AI intelligence

**Implementation:**
1. **Integrate Anthropic Claude API**
   ```javascript
   import Anthropic from '@anthropic-ai/sdk';

   const anthropic = new Anthropic({
     apiKey: process.env.VITE_ANTHROPIC_API_KEY,
   });

   async chatWithMaster(message, conversationHistory) {
     const response = await anthropic.messages.create({
       model: "claude-3-5-sonnet-20241022",
       max_tokens: 1024,
       system: MYSTICAL_TRADING_ADVISOR_PROMPT,
       messages: conversationHistory,
     });
     return response.content[0].text;
   }
   ```

2. **Create System Prompt**
   ```
   You are Master Jennie, a mystical trading advisor who combines:
   - Ancient wisdom (I Ching, Tarot, Eastern philosophy)
   - Modern technical analysis (chart patterns, indicators)
   - Risk management and psychology

   Your personality:
   - Wise and calming, never pushy
   - Speaks in metaphors and trading terms
   - Vietnamese-English bilingual
   - Encourages discipline and patience

   Your knowledge:
   - 64 I Ching hexagrams with trading correlations
   - 78 Tarot cards with market interpretations
   - Chart patterns and technical indicators
   - Risk/reward analysis
   ```

3. **Add Conversation Memory**
   - Store last 10 messages in `metadata` JSONB field
   - Pass conversation history to Claude API
   - Enable follow-up questions

4. **Estimated Cost:**
   - Claude 3.5 Sonnet: $3 per 1M input tokens, $15 per 1M output tokens
   - Average query: ~500 input + ~300 output tokens = $0.0069 per query
   - TIER3 unlimited → cap at 200/day/user = $1.38/day/user
   - Add 2x safety margin → $3/day/user max cost

**Benefits:**
- ✅ Intelligent, context-aware responses
- ✅ Can handle any question about trading/spirituality
- ✅ Natural conversation flow
- ✅ Learns from user's questions

---

### 🎯 PHASE 2: Content Expansion (MEDIUM PRIORITY)

**Goal:** Complete the mystical knowledge database

**Implementation:**

1. **Create Content Database Tables**
   ```sql
   CREATE TABLE iching_hexagrams (
     number INTEGER PRIMARY KEY CHECK (number BETWEEN 1 AND 64),
     name_en TEXT NOT NULL,
     name_zh TEXT NOT NULL,
     character TEXT,
     trigrams TEXT[2],
     interpretation TEXT NOT NULL,
     trading_advice TEXT NOT NULL,
     keywords TEXT[],
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE TABLE tarot_cards (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     suit TEXT CHECK (suit IN ('major', 'wands', 'cups', 'swords', 'pentacles')),
     number INTEGER,
     name_en TEXT NOT NULL,
     name_vi TEXT,
     upright_meaning TEXT NOT NULL,
     reversed_meaning TEXT NOT NULL,
     trading_upright TEXT NOT NULL,
     trading_reversed TEXT NOT NULL,
     keywords_upright TEXT[],
     keywords_reversed TEXT[],
     image_url TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **Populate Complete I Ching Database**
   - All 64 hexagrams with:
     - Traditional interpretations
     - Trading correlations (trend, reversal, consolidation)
     - Risk levels (low, medium, high)
     - Recommended actions (hold, buy, sell, wait)

3. **Populate Complete Tarot Database**
   - All 78 cards (22 Major + 56 Minor Arcana)
   - Each card with:
     - Upright/reversed meanings
     - Trading interpretations
     - Market sentiment correlations
     - Time frame suggestions

4. **Create Admin Panel**
   - CRUD interface for managing hexagrams/cards
   - Bulk import from CSV/JSON
   - Preview readings before publishing

**Benefits:**
- ✅ Complete mystical knowledge base
- ✅ Easy to maintain and update
- ✅ Can add new divination systems (Runes, Astrology)

---

### 📊 PHASE 3: Trading Data Integration (MEDIUM PRIORITY)

**Goal:** Connect chatbot to real market data for personalized advice

**Implementation:**

1. **Pass Trading Context to AI**
   ```javascript
   async analyzeWithContext(question, userId) {
     // Fetch user's current trades
     const positions = await getOpenPositions(userId);

     // Fetch current market data
     const marketData = await getMarketSnapshot();

     // Fetch recent scanner results
     const patterns = await getRecentPatterns(userId);

     const context = {
       positions: positions.map(p => ({
         symbol: p.symbol,
         side: p.side,
         entry: p.entry_price,
         current: p.current_price,
         pnl: p.unrealized_pnl,
       })),
       market: {
         btc_price: marketData.BTC,
         fear_greed: marketData.fear_greed_index,
         volatility: marketData.volatility,
       },
       patterns: patterns.map(p => ({
         symbol: p.symbol,
         pattern: p.pattern_type,
         timeframe: p.timeframe,
         confidence: p.confidence,
       })),
     };

     return await chatWithMaster(question, context);
   }
   ```

2. **Enable Pattern Analysis Questions**
   - "Should I enter this Head & Shoulders?"
   - "Is my Triangle pattern still valid?"
   - "What's the risk/reward on this trade?"

3. **Portfolio Review**
   - "Review my current positions"
   - "Which trade should I close first?"
   - "Am I over-leveraged?"

**Benefits:**
- ✅ Personalized trading advice
- ✅ Real-time market context
- ✅ Pattern validation
- ✅ Risk assessment

---

### 🌟 PHASE 4: Advanced Features (LOW PRIORITY)

**Goal:** Premium features for TIER3 users

**New Features:**

1. **Daily Reading Subscription**
   - Auto-generate I Ching + Tarot reading every morning
   - Send via email/Telegram notification
   - Market sentiment forecast for the day

2. **Custom Reading Templates**
   - User creates custom spread layouts
   - Save favorite reading types
   - Share readings with community

3. **Reading Interpretation Tutorials**
   - Interactive guide for each hexagram/card
   - Video lessons on divination
   - Trading correlation examples

4. **Community Features**
   - Share readings with community
   - Comment and discuss interpretations
   - Leaderboard for prediction accuracy

5. **Voice Input** (Future)
   - Speak questions to chatbot
   - Voice responses using ElevenLabs

6. **Image Analysis** (Future)
   - Upload chart screenshot
   - AI analyzes pattern + gives reading

**Benefits:**
- ✅ Increased engagement
- ✅ Premium value for TIER3
- ✅ Community building
- ✅ Higher retention

---

### 🔧 PHASE 5: Technical Improvements (ONGOING)

**Goal:** Production-ready code quality

**Tasks:**

1. **TypeScript Migration**
   ```typescript
   interface ChatMessage {
     role: 'user' | 'assistant' | 'system';
     content: string;
     timestamp: Date;
     type: 'chat' | 'iching' | 'tarot';
     metadata?: {
       hexagram?: number;
       cards?: string[];
       spread?: 'single' | 'three';
     };
   }

   interface UsageQuota {
     used: number;
     limit: number;
     remaining: number;
     resetAt: Date;
   }

   class ChatbotService {
     async checkUsageLimit(userId: string, tier: UserTier): Promise<UsageQuota>;
     async sendMessage(userId: string, message: string, type: ChatType): Promise<ChatMessage>;
   }
   ```

2. **Error Handling & Logging**
   ```javascript
   import * as Sentry from '@sentry/react';

   async chatWithMaster(message, context) {
     try {
       const response = await anthropic.messages.create({...});
       return response.content[0].text;
     } catch (error) {
       if (error.status === 429) {
         // Rate limit exceeded
         Sentry.captureMessage('Claude API rate limit exceeded', 'warning');
         return FALLBACK_RESPONSES.RATE_LIMIT;
       } else if (error.status === 500) {
         // API error
         Sentry.captureException(error);
         return FALLBACK_RESPONSES.API_ERROR;
       }
       throw error;
     }
   }
   ```

3. **Testing Suite**
   ```javascript
   describe('ChatbotService', () => {
     it('should check usage limit correctly', async () => {
       const quota = await service.checkUsageLimit('user-123', 'TIER1');
       expect(quota.limit).toBe(15);
       expect(quota.remaining).toBeLessThanOrEqual(15);
     });

     it('should handle API errors gracefully', async () => {
       // Mock API failure
       const response = await service.chatWithMaster('test', []);
       expect(response).toContain('temporarily unavailable');
     });
   });
   ```

4. **Rate Limiting Middleware**
   - Server-side rate limiting (not just client)
   - Per-user: 1 request/3 seconds
   - Per-IP: 10 requests/minute
   - Global: 1000 requests/minute

5. **Caching Strategy**
   - Cache I Ching interpretations (rarely change)
   - Cache Tarot meanings (rarely change)
   - Cache daily market summaries (update hourly)
   - Use Redis for session storage

**Benefits:**
- ✅ Type safety
- ✅ Better error handling
- ✅ Test coverage
- ✅ Performance optimization
- ✅ Cost control

---

## Implementation Roadmap

### Week 1-2: Phase 1 - AI Core (Claude Integration)
- [ ] Set up Anthropic API key
- [ ] Create system prompt for Master Jennie persona
- [ ] Implement conversation memory (last 10 messages)
- [ ] Add Claude API calls to chatWithMaster()
- [ ] Test with TIER1 users (15 queries/day limit)
- [ ] Monitor costs and adjust limits

**Deliverable:** Working AI chatbot with intelligent responses

### Week 3-4: Phase 2 - Content Expansion
- [ ] Design database schema for hexagrams/cards
- [ ] Research and populate all 64 I Ching hexagrams
- [ ] Research and populate all 78 Tarot cards
- [ ] Create admin panel for content management
- [ ] Migrate hardcoded data to database
- [ ] Add search/filter for readings

**Deliverable:** Complete mystical knowledge database

### Week 5-6: Phase 3 - Trading Integration
- [ ] Create API to fetch user positions
- [ ] Create API to fetch market data
- [ ] Create API to fetch scanner patterns
- [ ] Update Claude prompt with trading context
- [ ] Test pattern analysis questions
- [ ] Test portfolio review questions

**Deliverable:** Personalized trading advice with real data

### Week 7-8: Phase 4 - Advanced Features
- [ ] Implement daily reading subscription
- [ ] Create custom reading templates
- [ ] Add reading tutorials
- [ ] Enable community sharing
- [ ] Add accuracy leaderboard

**Deliverable:** Premium TIER3 features

### Ongoing: Phase 5 - Technical Improvements
- [ ] TypeScript conversion
- [ ] Unit test suite (80% coverage)
- [ ] Integration tests
- [ ] Error logging with Sentry
- [ ] Rate limiting middleware
- [ ] Performance monitoring

**Deliverable:** Production-ready code quality

---

## Cost Analysis

### Current Costs
- **Infrastructure:** $0/month (Supabase free tier)
- **AI:** $0/month (no AI yet)

### Projected Costs (After Claude Integration)

**Assumptions:**
- Average query: 500 input tokens + 300 output tokens
- Claude 3.5 Sonnet: $3/1M input + $15/1M output
- Cost per query: $0.0069

**Daily Usage Estimates:**
- FREE users (5/day): 100 users × 5 = 500 queries/day
- TIER1 users (15/day): 50 users × 10 avg = 500 queries/day
- TIER2 users (50/day): 20 users × 25 avg = 500 queries/day
- TIER3 users (unlimited): 10 users × 50 avg = 500 queries/day

**Total:** 2,000 queries/day × $0.0069 = **$13.80/day = $414/month**

**Revenue:**
- TIER1: 50 users × 11M VND/year ≈ $22,000/year
- TIER2: 20 users × 21M VND/year ≈ $17,000/year
- TIER3: 10 users × 68M VND/year ≈ $27,000/year
- **Total Revenue:** $66,000/year

**Profit Margin:**
- Annual AI cost: $414 × 12 = $4,968
- Annual revenue: $66,000
- **Profit:** $61,032 (92% margin)

**Conclusion:** Very profitable feature even with AI costs

---

## Security Considerations

### Current Security
- ✅ RLS policies on chatbot_history
- ✅ User authentication required
- ✅ Tier validation

### Needed Security
- ⚠️ Input sanitization (prevent prompt injection)
- ⚠️ Rate limiting (server-side)
- ⚠️ API key rotation
- ⚠️ Response content filtering
- ⚠️ Audit logging for compliance

**Prompt Injection Prevention:**
```javascript
// Sanitize user input before sending to Claude
function sanitizeInput(message) {
  // Remove potential system prompt injections
  const blocked = ['ignore previous', 'new instructions', 'system:', 'assistant:'];
  let clean = message.toLowerCase();

  for (const phrase of blocked) {
    if (clean.includes(phrase)) {
      throw new Error('Invalid input detected');
    }
  }

  // Limit length
  if (message.length > 1000) {
    return message.substring(0, 1000);
  }

  return message;
}
```

---

## Success Metrics

### KPIs to Track

**Engagement:**
- Daily Active Users (DAU)
- Queries per user per day
- Session duration
- Repeat usage rate

**Quality:**
- User satisfaction score (1-5 stars)
- Response relevance rating
- Follow-up question rate
- Positive feedback percentage

**Business:**
- Conversion rate (FREE → TIER1)
- Upgrade rate (TIER1 → TIER2 → TIER3)
- Retention rate (monthly)
- Revenue per user

**Technical:**
- Response time (target: <2s)
- API success rate (target: >99%)
- Error rate (target: <1%)
- AI cost per query (target: <$0.01)

### Target Metrics (3 months post-launch)
- **DAU:** 100+ users/day
- **Queries/user:** 3-5 per session
- **Satisfaction:** 4.5/5 stars
- **Conversion:** 10% FREE → TIER1
- **Response Time:** <2 seconds
- **Uptime:** 99.9%

---

## Quick Start Guide for Developers

### Setup Claude API

1. **Get API Key**
   ```bash
   # Sign up at https://console.anthropic.com
   # Create API key
   ```

2. **Add to Environment**
   ```bash
   # .env.local
   VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx
   ```

3. **Install SDK**
   ```bash
   cd frontend
   npm install @anthropic-ai/sdk
   ```

4. **Update Service**
   ```javascript
   // frontend/src/services/chatbot.js
   import Anthropic from '@anthropic-ai/sdk';

   const anthropic = new Anthropic({
     apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
   });

   async chatWithMaster(message, conversationHistory = []) {
     try {
       const response = await anthropic.messages.create({
         model: "claude-3-5-sonnet-20241022",
         max_tokens: 1024,
         system: SYSTEM_PROMPT,
         messages: [
           ...conversationHistory,
           { role: 'user', content: message }
         ],
       });

       return response.content[0].text;
     } catch (error) {
       console.error('Claude API Error:', error);
       return this.getFallbackResponse(message);
     }
   }
   ```

5. **Test**
   ```bash
   npm run dev
   # Navigate to /community/chatbot
   # Try: "What is the I Ching reading for BTC today?"
   ```

---

## Files to Modify

**Phase 1 Changes:**
```
frontend/
  src/
    services/
      chatbot.js              [MODIFY] Add Claude API
    pages/
      Chatbot.jsx             [MODIFY] Add conversation history
    .env.local                [CREATE] Add API key

package.json                  [MODIFY] Add @anthropic-ai/sdk
```

**Phase 2 Changes:**
```
supabase/
  migrations/
    20250119_create_iching_table.sql     [CREATE]
    20250119_create_tarot_table.sql      [CREATE]
    20250119_populate_iching.sql         [CREATE]
    20250119_populate_tarot.sql          [CREATE]

frontend/
  src/
    services/
      divination.js           [CREATE] New service for DB queries
    pages/
      Admin/
        DivinationManager.jsx [CREATE] Admin panel
```

---

## Testing Checklist

### Before Deploy
- [ ] Test with different tier users (FREE, TIER1, TIER2, TIER3)
- [ ] Test quota limits (hit limit and verify blocking)
- [ ] Test all three modes (Chat, I Ching, Tarot)
- [ ] Test conversation memory (follow-up questions)
- [ ] Test error handling (invalid input, API failure)
- [ ] Test rate limiting (spam protection)
- [ ] Test on mobile, tablet, desktop
- [ ] Test in Vietnamese and English
- [ ] Verify costs match projections
- [ ] Load test (100 concurrent users)

### After Deploy
- [ ] Monitor error logs
- [ ] Monitor API costs
- [ ] Monitor response times
- [ ] Collect user feedback
- [ ] A/B test response quality
- [ ] Track conversion rates

---

## FAQ for Implementation

**Q: Should we use Claude 3.5 Sonnet or Claude 3 Opus?**
A: Start with Sonnet (faster, cheaper). Opus is overkill for this use case.

**Q: How do we prevent users from abusing unlimited TIER3?**
A: Soft cap at 200/day, then throttle to 1 query/5 seconds.

**Q: Should we store full conversation history?**
A: Store last 10 messages in metadata JSONB. Archive old conversations after 90 days.

**Q: How do we handle Vietnamese vs English?**
A: Detect language from input, set system prompt accordingly. Claude is fluent in both.

**Q: What if Claude API goes down?**
A: Fallback to keyword matching + show error banner. Store failed requests, retry later.

**Q: How do we measure response quality?**
A: Add thumbs up/down after each response. Store feedback, review weekly.

---

## Next Steps

1. **Review this document** with product team
2. **Prioritize phases** based on business goals
3. **Allocate resources** (1-2 developers, 8 weeks)
4. **Set up Claude API** access
5. **Start with Phase 1** (AI Core integration)
6. **Ship incrementally** (test with TIER1 users first)
7. **Measure and iterate**

---

**Document Status:** Ready for implementation planning
**Last Updated:** November 18, 2025
**Owner:** Development Team
**Estimated Effort:** 8 weeks for Phases 1-4
