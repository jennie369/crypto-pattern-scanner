# GEM CHATBOT - Enhanced Implementation Plan

## Project Overview

**Goal:** Transform the existing GEM Chatbot from keyword-matching demo into an intelligent AI-powered advisor with mystical trading insights.

**Current Status:**
- ✅ UI shell complete (layout, modes, tier access)
- ✅ Account Dashboard at `/account` fully functional
- ⚠️ Content incomplete (5/64 I Ching, 11/78 Tarot)
- ❌ AI integration missing (still keyword matching)
- ❌ Premium features not implemented

**Target:** Production-ready intelligent chatbot with full divination content, conversation memory, voice input, product recommendations, and widget integration.

---

## Tech Stack

**Frontend:**
- React 19 + Vite
- Existing components-v2 library (Card, Button, Badge, Modal)
- Glassmorphism design system
- Responsive layout (mobile/tablet/desktop)

**Backend:**
- Supabase PostgreSQL
- Supabase Edge Functions (TypeScript)
- Row Level Security (RLS) policies

**AI & APIs:**
- Gemini 2.5 Flash API (key: AIzaSyCymkgeL0ERDYYePtbV4zuL-BZ2mfMxehc)
- Web Speech API (browser-native voice input)
- Shopify Storefront API (product integration)

**Existing Infrastructure:**
- ✅ Authentication system working
- ✅ Tier system (FREE, TIER1, TIER2, TIER3)
- ✅ Database tables for chatbot_history
- ✅ 3 Shopify edge functions deployed

---

## Scope of Work

### What Already Exists (Don't Rebuild)
- ✅ Account Dashboard (`/account`) - 3-column layout with stats, profile, quick actions
- ✅ Chatbot page (`/chatbot`) - UI shell with mode switching, message handling
- ✅ Component library - Card, Button, Badge, Modal patterns ready
- ✅ Tier access control - Quota checking, upgrade prompts
- ✅ History panel - Load/display past conversations

### What Needs Enhancement
- ⚠️ `chatbot.js` - Expand I Ching (5→64) + Tarot (11→78)
- ⚠️ `Chatbot.jsx` - Add Gemini integration, CSKH buttons, sound toggle
- ⚠️ `AccountDashboard.jsx` - Add widget grid section (optional)

### What Needs Creation
- ❌ Gemini edge function (`chatbot-gemini`)
- ❌ Conversation memory table + migration
- ❌ CSKH modal component
- ❌ Voice input service
- ❌ PDF export service
- ❌ Widget system (detection, factory, preview)

---

## Implementation Roadmap

### Phase 01: Content Expansion
**Duration:** 2-3 days
**Status:** ✅ Completed
**Progress:** 100%
**Completed:** 2025-11-19

**Deliverables:**
- [x] Add 59 I Ching hexagrams (6-64) to chatbot.js
- [x] Add 68 Tarot cards (12 Major + 56 Minor) to chatbot.js
- [x] Vietnamese + English + Trading interpretations
- [x] Test all readings work correctly

**Files:** [phase-01-content-expansion.md](./phase-01-content-expansion.md)

---

### Phase 02: Gemini Integration
**Duration:** 3-4 days
**Status:** ⏳ Pending
**Progress:** 0%
**Dependencies:** Phase 01

**Deliverables:**
- [ ] Create `chatbot-gemini` edge function
- [ ] Add conversation memory table + migration
- [ ] Replace keyword matching with Gemini API
- [ ] Implement session tracking (last 10 messages)
- [ ] Test AI responses quality

**Files:** [phase-02-gemini-integration.md](./phase-02-gemini-integration.md)

---

### Phase 03: UX Enhancements
**Duration:** 2-3 days
**Status:** ⏳ Pending
**Progress:** 0%

**Deliverables:**
- [ ] CSKH buttons (Facebook, Zalo, Telegram)
- [ ] Sound effects with on/off toggle
- [ ] NFT-style card redesign
- [ ] Auto-send on suggestion click
- [ ] Clear chat history button

**Files:** [phase-03-ux-enhancements.md](./phase-03-ux-enhancements.md)

---

### Phase 04: Product Integration
**Duration:** 2-3 days
**Status:** ⏳ Pending
**Progress:** 0%

**Deliverables:**
- [ ] Product cards in chat (9 Shopify products)
- [ ] Tier upgrade prompts after quota
- [ ] In-chat CTAs with product images
- [ ] Analytics tracking (views, clicks)

**Files:** [phase-04-product-integration.md](./phase-04-product-integration.md)

---

### Phase 05: Voice & Export
**Duration:** 2-3 days
**Status:** ✅ Completed
**Progress:** 90%
**Completed:** 2025-01-19

**Deliverables:**
- [x] Voice input (Web Speech API) - Vietnamese + English
- [x] PDF export (jspdf + html2canvas) - TIER3 exclusive
- [x] Social share service created
- [x] Favorites database migration
- [ ] Favorites UI (deferred - can be added later)

**Files:** [phase-05-voice-export.md](./phase-05-voice-export.md)

---

### Phase 06: Widget System
**Duration:** 3-4 days
**Status:** ⏳ Pending
**Progress:** 0%

**Deliverables:**
- [ ] Widget detection from AI responses
- [ ] Widget preview modal
- [ ] Save to dashboard
- [ ] Widget grid in Account Dashboard

**Files:** [phase-06-widget-system.md](./phase-06-widget-system.md)

---

### Phase 07: Testing & Launch
**Duration:** 3-4 days
**Status:** ⏳ Pending
**Progress:** 0%
**Dependencies:** All previous phases

**Deliverables:**
- [ ] E2E testing (10 scenarios)
- [ ] Bug fixes & polish
- [ ] Performance optimization
- [ ] Soft launch (TIER3 users)
- [ ] Full launch (all tiers)

**Files:** [phase-07-testing-launch.md](./phase-07-testing-launch.md)

---

## Timeline Summary

| Phase | Days | Cumulative |
|-------|------|------------|
| Phase 1 | 2-3 | Day 1-3 |
| Phase 2 | 3-4 | Day 4-7 |
| Phase 3 | 2-3 | Day 8-10 |
| Phase 4 | 2-3 | Day 11-13 |
| Phase 5 | 2-3 | Day 14-16 |
| Phase 6 | 3-4 | Day 17-20 |
| Phase 7 | 3-4 | Day 21-24 |
| **Total** | **18-24 days** | **~3-4 weeks** |

---

## Execution Guidelines

### Getting Started

1. **Read this plan.md** to understand the full roadmap
2. **Open phase-01** and begin implementation
3. **Complete all deliverables** in a phase before moving on
4. **Update this plan.md** after each phase (mark ✅ completed items)
5. **Test thoroughly** before proceeding to next phase

### Implementation Rules

✅ **DO:**
- Complete one phase fully before starting the next
- Update status and progress in this file after each phase
- Test every deliverable before marking as complete
- Commit code after each phase: `feat: complete phase-XX`
- Ask for help if stuck >30 minutes

❌ **DON'T:**
- Skip phases or deliverables
- Make changes without testing
- Move to next phase with failing tests
- Recreate components that already exist
- Break existing functionality

### When You Encounter Issues

1. **Stop immediately** - Don't continue if blocked
2. **Document the blocker** - What went wrong, what you tried
3. **Ask for help** - Describe the issue clearly
4. **Propose alternatives** - Suggest potential solutions
5. **Get approval** - Don't proceed without confirmation

---

## Success Criteria

### Technical Metrics
- ✅ All 64 I Ching hexagrams available
- ✅ All 78 Tarot cards available
- ✅ Gemini API response time <2 seconds
- ✅ Conversation memory working (10 messages)
- ✅ Voice input functional (Vietnamese + English)
- ✅ PDF export quality verified
- ✅ No breaking changes to existing features

### Business Metrics
- ✅ Daily Active Users: 100+
- ✅ Queries per user: 3-5
- ✅ User satisfaction: 4.5/5 stars
- ✅ Response helpfulness: 85%+
- ✅ Tier conversion rate: 5%+
- ✅ Monthly revenue: $2,500+

### Quality Metrics
- ✅ All tests passing
- ✅ No console errors
- ✅ Mobile responsive
- ✅ Accessibility compliant
- ✅ Performance <2s load time

---

## Key Reference Files

### Existing Code (Already Built)
- `frontend/src/pages/Account/AccountDashboard.jsx` - Dashboard layout
- `frontend/src/pages/Chatbot.jsx` - Chatbot UI shell
- `frontend/src/services/chatbot.js` - Chatbot logic
- `frontend/src/components-v2/` - Reusable components

### Data Sources
- `D:\Claude Projects\Yinyang AI Chatbot\` - I Ching + Tarot data
- `C:\Users\Jennie Chu\Downloads\NFT - NFT Webflow Template - BRIX Templates.jpeg` - Design reference

### Documentation
- `GEM_CHATBOT_CONTEXT_FOR_CLAUDE.md` - Full context doc
- `MASTER_PROMPT_FULL_IMPLEMENTATION.md` - Original plan
- `progressive-disclosure-planning-prompt.md` - Template guide

---

## Quick Commands

### Start Development Server
```bash
cd frontend
npm run dev
# Server: http://localhost:5174
```

### Deploy Edge Function
```bash
supabase functions deploy chatbot-gemini
```

### Run Migrations
```bash
supabase migration up
```

### Install Dependencies
```bash
npm install jspdf html2canvas
```

---

## Contact & Support

**Project Owner:** Jennie Chu
**Development Team:** [Your team]
**Timeline:** 3-4 weeks (18-24 days)
**Priority:** AI Intelligence first

---

**Last Updated:** 2025-11-19
**Status:** Ready to begin Phase 01
**Next Action:** Open `phase-01-content-expansion.md` and start implementation

---

**Let's build! 🚀💎**
