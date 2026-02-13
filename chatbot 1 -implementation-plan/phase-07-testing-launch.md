# Phase 07: Testing & Launch

## Phase Information

- **Duration:** 3-4 days (10-12 hours)
- **Status:** ⏳ Pending
- **Progress:** 0%
- **Dependencies:** All previous phases (01-06)
- **Priority:** 🔥🔥🔥 CRITICAL

---

## Objectives

Comprehensive testing and phased launch:
1. End-to-end testing (10 core scenarios)
2. Bug fixes and edge case handling
3. Performance optimization
4. Soft launch with TIER3 users
5. Full public launch
6. Success metrics tracking

---

## Deliverables

- [ ] E2E test suite (10 scenarios)
- [ ] Bug tracker with fixes
- [ ] Performance audit report
- [ ] Soft launch feedback analysis
- [ ] Public launch checklist
- [ ] Analytics dashboard

---

## Step 1: End-to-End Testing

### Test Scenarios

**Scenario 1: FREE User Journey**
```
1. Visit /chatbot as unauthenticated user
2. Click "Chat with Master Jennie"
3. Verify: Redirected to /login
4. Sign up with new account
5. Return to /chatbot
6. Send 5 messages (exhaust quota)
7. Try 6th message
8. Verify: Quota exceeded modal appears
9. Verify: Upgrade options displayed
```

**Scenario 2: I Ching Reading**
```
1. Login as TIER1 user
2. Switch to "I Ching" mode
3. Click "Cast Hexagram" button
4. Verify: Random hexagram (1-64) displayed
5. Verify: Vietnamese + English text
6. Verify: Trading interpretation shown
7. Click "Ask about this reading"
8. Verify: AI provides contextual response
9. Verify: Conversation history includes hexagram
```

**Scenario 3: Tarot Reading**
```
1. Login as TIER1 user
2. Switch to "Tarot" mode
3. Select "3-card spread"
4. Verify: 3 random cards drawn (from 78 deck)
5. Verify: Upright/Reversed indicated
6. Verify: Trading interpretation for each card
7. Click "Save this reading"
8. Navigate to /account
9. Verify: Reading appears in favorites
```

**Scenario 4: Voice Input (TIER3)**
```
1. Login as TIER3 user
2. Click microphone button
3. Speak Vietnamese: "Bitcoin có nên mua không?"
4. Verify: Text transcribed correctly
5. Verify: Message auto-sent
6. Switch language to English
7. Speak: "What about Ethereum?"
8. Verify: English recognized
9. Verify: AI responds contextually
```

**Scenario 5: Product Integration**
```
1. Login as FREE user
2. Ask: "Làm sao để upgrade?"
3. Verify: AI mentions tier options
4. Verify: Product cards appear in chat
5. Click "TIER 2" CTA button
6. Verify: Opens Shopify product page
7. Verify: Analytics tracked (view + click)
```

**Scenario 6: Conversation Memory**
```
1. Login as any tier
2. Ask: "BTC giá bao nhiêu?"
3. AI responds: "BTC đang ở $48,000..."
4. Ask follow-up: "Còn ETH thì sao?"
5. Verify: AI remembers BTC context
6. Refresh page
7. Verify: Conversation history loads
8. Continue conversation
9. Verify: Context maintained (10 messages)
```

**Scenario 7: Widget Creation (TIER2+)**
```
1. Login as TIER2 user
2. Ask: "Thông báo khi BTC lên $50,000"
3. Verify: Widget suggestion badge appears
4. Click suggestion
5. Verify: Widget preview modal opens
6. Customize name and size
7. Click "Save to Dashboard"
8. Navigate to /account
9. Verify: Widget in grid with live price
10. Verify: Price updates every 10s
```

**Scenario 8: PDF Export (TIER3)**
```
1. Login as TIER3 user
2. Chat with bot (5+ messages)
3. Cast I Ching hexagram
4. Click PDF export button
5. Verify: PDF downloads
6. Open PDF
7. Verify: All messages included
8. Verify: Hexagram details included
9. Verify: GEM branding present
```

**Scenario 9: CSKH Support Buttons**
```
1. Visit /chatbot
2. Scroll to sidebar
3. Verify: "Cần hỗ trợ?" section visible
4. Click "Facebook" button
5. Verify: Opens https://www.facebook.com/yinyangmasterscrystals/
6. Click "Zalo" button
7. Verify: Opens https://zalo.me/0787238002
8. Click "Telegram" button
9. Verify: Opens https://t.me/gemholdingchannel
```

**Scenario 10: Sound Effects**
```
1. Enable sound (🔊 button)
2. Send message
3. Verify: Send sound plays
4. Wait for AI response
5. Verify: Notification sound plays
6. Toggle sound off (🔇)
7. Send another message
8. Verify: No sound plays
9. Verify: Preference saved to localStorage
```

---

## Step 2: Bug Tracking & Fixes

### Create Bug Tracker

**File:** `chatbot-implementation-plan/BUG_TRACKER.md`

```markdown
# Bug Tracker - Phase 07

## Critical Bugs (Block Launch)

- [ ] **BUG-001**: [Description]
  - **Severity**: Critical
  - **Reported**: 2025-01-20
  - **Status**: Open
  - **Fix**: [Description of fix]
  - **Tested**: No

## High Priority Bugs

- [ ] **BUG-002**: [Description]
  - **Severity**: High
  - **Reported**: 2025-01-20
  - **Status**: In Progress
  - **Fix**: [Description]

## Medium Priority Bugs

- [ ] **BUG-003**: [Description]

## Low Priority Bugs (Post-Launch)

- [ ] **BUG-004**: [Description]
```

### Common Issues to Check

1. **Authentication Issues:**
   - Session persistence across page reloads
   - Token expiration handling
   - Protected route redirects

2. **Quota System:**
   - Daily quota resets at midnight
   - Quota checks before API calls
   - Edge case: Exactly at quota limit

3. **Gemini API:**
   - Rate limit handling (60 requests/minute)
   - Timeout handling (>30s responses)
   - Fallback to keyword matching on error

4. **Database:**
   - RLS policies allow correct access
   - Foreign key constraints working
   - Conversation history size limits

5. **UI/UX:**
   - Mobile responsiveness (320px - 1920px)
   - Loading states for all async operations
   - Error messages user-friendly
   - NFT styling consistent across components

---

## Step 3: Performance Optimization

### Performance Audit Checklist

**Frontend Performance:**
- [ ] Lazy load heavy components (PDF export, widgets)
- [ ] Debounce voice input transcription
- [ ] Optimize message list rendering (virtualization if >100 messages)
- [ ] Code splitting for route-based chunks
- [ ] Compress images (WebP format, <200KB each)

**Backend Performance:**
- [ ] Gemini API response caching (10 minutes for identical queries)
- [ ] Database query optimization (indexes on user_id, created_at)
- [ ] Edge function cold start optimization
- [ ] Conversation history limited to last 10 messages

**Metrics to Track:**
```javascript
// Add to Chatbot.jsx
const [metrics, setMetrics] = useState({
  messagesSent: 0,
  avgResponseTime: 0,
  apiErrors: 0,
  quotaUsage: 0
})

useEffect(() => {
  // Track metrics in analytics
  if (user) {
    supabase.from('chatbot_metrics').insert({
      user_id: user.id,
      messages_sent: metrics.messagesSent,
      avg_response_time: metrics.avgResponseTime,
      timestamp: new Date().toISOString()
    })
  }
}, [metrics])
```

**Performance Targets:**
- [ ] First Contentful Paint: <1.5s
- [ ] Time to Interactive: <3s
- [ ] Gemini API response: <2s average
- [ ] Database queries: <100ms
- [ ] Bundle size: <500KB (gzipped)

---

## Step 4: Soft Launch (TIER3 Users)

### Soft Launch Plan

**Phase 4.1: Internal Testing (Day 1)**
```
1. Deploy to production
2. Test with 5 internal accounts
3. Monitor error logs for 24 hours
4. Fix critical bugs immediately
```

**Phase 4.2: TIER3 Beta (Day 2-3)**
```
1. Enable for all TIER3 users (~20 users)
2. Send announcement email:
   Subject: "New AI Chatbot - Beta Access for TIER3"
   Body: "As a TIER3 member, you have early access to our new AI chatbot..."
3. Collect feedback via in-app survey
4. Monitor usage patterns
5. Track success metrics
```

**Feedback Collection:**

**File:** `frontend/src/components/Chatbot/FeedbackModal.jsx`

```jsx
export const FeedbackModal = ({ onSubmit, onClose }) => {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')

  const handleSubmit = async () => {
    await supabase.from('chatbot_feedback').insert({
      user_id: user.id,
      rating,
      feedback,
      timestamp: new Date().toISOString()
    })

    onSubmit()
    toast.success('Cảm ơn feedback của bạn!')
  }

  return (
    <div className="feedback-modal">
      <h3>Đánh giá Chatbot mới</h3>

      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => setRating(star)}
            className={rating >= star ? 'star filled' : 'star'}
          >
            ⭐
          </span>
        ))}
      </div>

      <textarea
        placeholder="Ý kiến của bạn về chatbot..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={4}
      />

      <div className="modal-actions">
        <button onClick={onClose}>Bỏ qua</button>
        <button onClick={handleSubmit} disabled={!rating}>Gửi</button>
      </div>
    </div>
  )
}
```

**Show after 5 messages:**
```jsx
useEffect(() => {
  if (messages.length === 5 && !feedbackSubmitted) {
    setShowFeedbackModal(true)
  }
}, [messages])
```

---

## Step 5: Public Launch

### Pre-Launch Checklist

**Technical Readiness:**
- [ ] All 64 I Ching hexagrams working
- [ ] All 78 Tarot cards working
- [ ] Gemini API responding <2s
- [ ] Conversation memory functional
- [ ] Voice input working (both languages)
- [ ] PDF export generating correctly
- [ ] Product cards displaying
- [ ] Widgets saving to dashboard
- [ ] CSKH buttons functional
- [ ] Sound effects working
- [ ] Clear history button works
- [ ] NFT styling applied everywhere
- [ ] Mobile responsive (tested on 3+ devices)
- [ ] No console errors in production
- [ ] Analytics tracking verified

**Content Readiness:**
- [ ] All product images uploaded to Shopify
- [ ] Product URLs verified (9 products)
- [ ] CSKH links tested (Facebook, Zalo, Telegram)
- [ ] Email templates prepared (welcome, upgrade prompts)

**Communication Readiness:**
- [ ] Announcement post drafted (Facebook, Telegram)
- [ ] Tutorial video recorded (optional)
- [ ] FAQ document prepared
- [ ] Support team briefed

---

### Launch Sequence

**Day 1: TIER2 Users**
```
1. Enable for TIER2 users (09:00 AM)
2. Send email announcement
3. Post on Telegram channel
4. Monitor for 6 hours
5. Fix any issues immediately
```

**Day 2: TIER1 Users**
```
1. Enable for TIER1 users (09:00 AM)
2. Send email announcement
3. Monitor usage spike
4. Scale resources if needed
```

**Day 3: FREE Users (Public Launch)**
```
1. Enable for all users (09:00 AM)
2. Public announcement on all channels
3. Facebook post with demo video
4. Monitor server load
5. Celebrate! 🎉
```

---

## Step 6: Success Metrics Tracking

### Analytics Dashboard

**Create metrics view:**

**File:** `supabase/migrations/20250124_chatbot_analytics.sql`

```sql
CREATE OR REPLACE VIEW chatbot_analytics_daily AS
SELECT
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as daily_active_users,
  COUNT(*) as total_messages,
  AVG(response_time_ms) as avg_response_time,
  COUNT(*) FILTER (WHERE mode = 'chat') as chat_queries,
  COUNT(*) FILTER (WHERE mode = 'iching') as iching_readings,
  COUNT(*) FILTER (WHERE mode = 'tarot') as tarot_readings
FROM chatbot_history
GROUP BY DATE(created_at)
ORDER BY date DESC;

CREATE OR REPLACE VIEW user_engagement_stats AS
SELECT
  user_id,
  COUNT(*) as total_queries,
  DATE(MIN(created_at)) as first_used,
  DATE(MAX(created_at)) as last_used,
  AVG(CASE WHEN rating IS NOT NULL THEN rating END) as avg_rating
FROM chatbot_history
GROUP BY user_id;
```

---

### Success Criteria

**Week 1 Targets:**
- [ ] Daily Active Users: 50+
- [ ] Total queries: 200+
- [ ] Average rating: 4.0/5.0+
- [ ] Response time: <2s average
- [ ] Error rate: <5%

**Week 2 Targets:**
- [ ] Daily Active Users: 100+
- [ ] Total queries: 500+
- [ ] Average rating: 4.3/5.0+
- [ ] Tier conversion: 3%+ (FREE → TIER1)

**Month 1 Targets:**
- [ ] Daily Active Users: 200+
- [ ] Total queries: 3000+
- [ ] Average rating: 4.5/5.0+
- [ ] Tier conversion: 5%+
- [ ] Revenue: $2,500+ (from upgrades)

---

## Step 7: Post-Launch Monitoring

### Daily Monitoring Checklist

**Day 1-7:**
- [ ] Check error logs (morning & evening)
- [ ] Review user feedback
- [ ] Monitor API rate limits
- [ ] Check database performance
- [ ] Review analytics dashboard
- [ ] Respond to support tickets within 4 hours

**Week 2-4:**
- [ ] Weekly metrics review
- [ ] Plan feature iterations based on feedback
- [ ] Optimize underperforming areas
- [ ] Scale infrastructure if needed

---

### Incident Response Plan

**If critical bug found:**
```
1. Assess severity (production down vs minor UI bug)
2. If critical:
   - Rollback to previous version immediately
   - Notify users via Telegram
   - Fix in development
   - Deploy fix within 2 hours
3. If minor:
   - Log to bug tracker
   - Fix in next update cycle
   - Deploy within 24 hours
```

---

## Completion Criteria

- [ ] All 10 E2E scenarios pass
- [ ] All critical bugs fixed
- [ ] Performance targets met
- [ ] Soft launch successful (4.0+ rating)
- [ ] Public launch completed
- [ ] Week 1 targets achieved
- [ ] Monitoring dashboard active
- [ ] Incident response plan documented
- [ ] Commit: `feat: complete phase-07 - testing & launch 🚀`

---

## Next Steps

**Post-Launch Iterations:**
1. Analyze Week 1 data
2. Identify top 3 pain points
3. Plan Phase 08: Enhancements (based on feedback)
4. Celebrate success with team! 🎉

---

**Project Complete! 🎉💎**

All 7 phases delivered:
- ✅ Phase 01: Content Expansion
- ✅ Phase 02: Gemini Integration
- ✅ Phase 03: UX Enhancements
- ✅ Phase 04: Product Integration
- ✅ Phase 05: Voice & Export
- ✅ Phase 06: Widget System
- ✅ Phase 07: Testing & Launch

**Timeline:** 3-4 weeks (18-24 days)
**Status:** Ready for implementation
**Priority:** AI Intelligence first, UX polish second

**Let's build! 🚀**
