# 🚀 MASTER PROMPT - GEM CHATBOT + INTERACTIVE DASHBOARD
## TOÀN BỘ IMPLEMENTATION - 8 TUẦN

**To:** Claude Code  
**Project:** Gemral - Chatbot AI + Interactive Dashboard  
**Timeline:** 8 tuần (60 ngày)  
**Status:** READY TO BUILD

---

## 📋 EXECUTIVE SUMMARY

Implement complete system bao gồm:
1. ✅ Smart AI Response Detection
2. ✅ Widget Factory System  
3. ✅ Interactive Dashboard với Drag & Drop
4. ✅ Shopify Product Integration
5. ✅ Daily Notifications
6. ✅ Analytics & Tracking
7. ✅ TIER Access Control

**CRITICAL:** User không biết đang dùng AI - present như Gemral features!

---

## 📁 REFERENCE FILES (ĐỌC TRƯỚC)

Files trong `C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\Gem Chatbot`:
1. ✅ `KE_HOACH_FINAL_SIMPLIFIED.md` - 8-week plan chi tiết
2. ✅ `SUPPLEMENT_SHOPIFY_INTEGRATION.md` - Shopify integration  
3. ✅ `GEM_CHATBOT_DATA_FINAL.json` - Chatbot data structure
4. ✅ `SESSION_SUMMARY_NEXT_STEPS.md` - Summary & next steps

**Đọc kỹ cả 4 files trước khi code!**

---

## 🎯 8-WEEK IMPLEMENTATION

Copy TOÀN BỘ code từ `KE_HOACH_FINAL_SIMPLIFIED.md`

### **WEEK 1: DETECTION SYSTEM**
- Day 1-2: Response Type Detector (`responseDetector.js`)
- Day 3-4: Data Extractor (`dataExtractor.js`)
- Day 5: System Prompt (`systemPrompts.js`)

### **WEEK 2: DATABASE & SHOPIFY**
- Day 1: Dashboard Widgets Schema (SQL migration)
- Day 2: Shopify Products Schema (SQL migration)
- Day 3: Shopify Sync Service (`shopifySync.js`)
- Day 4-5: Product Recommendation Engine (`productRecommendation.js`)

### **WEEK 3: WIDGET FACTORY**
- Day 1-3: Widget Factory Service (`widgetFactory.js`)
- Day 4-5: Chat Integration (update `Chatbot.jsx`)

### **WEEK 4: WIDGET PREVIEW**
- Day 1-3: Preview Modal (`WidgetPreviewModal.jsx`)
- Day 4-5: Widget Components (GoalCard, AffirmationCard, etc.)

### **WEEK 5: DASHBOARD**
- Day 1-2: Dashboard Page (`Dashboard.jsx`)
- Day 3-5: Dashboard Styles (`dashboard.css`)

### **WEEK 6: INTERACTIONS**
- Day 1-2: Update Progress Modal
- Day 3-4: Widget Actions (edit/delete/pin)
- Day 5: Cross-Widget Linking

### **WEEK 7: NOTIFICATIONS**
- Day 1-3: Notification Service (`notificationService.js`)
- Day 4-5: Notification UI (Bell, Dropdown, Settings)

### **WEEK 8: TESTING & LAUNCH**
- Day 1-2: E2E Testing (10 scenarios)
- Day 3-4: Bug Fixing
- Day 5: Soft Launch → Full Launch

---

## 🎨 DESIGN GUIDELINES

### **Use GEM Design Tokens:**
```css
--brand-burgundy: #9C0612;
--brand-gold: #FFBD59;
--brand-cyan: #00D9FF;
--brand-purple: #8B5CF6;
--glass-bg: rgba(30, 42, 94, 0.4);
--glass-border: rgba(255, 255, 255, 0.12);
```

### **Glassmorphism Style:**
- background: var(--glass-bg)
- backdrop-filter: blur(20px)
- border: 1px solid var(--glass-border)
- Smooth transitions

---

## 🔒 TIER ACCESS CONTROL

```javascript
const WIDGET_LIMITS = {
  FREE: { maxWidgets: 3, maxGoals: 1, hasReminders: false },
  TIER1: { maxWidgets: 10, maxGoals: 3, hasReminders: true },
  TIER2: { maxWidgets: 25, maxGoals: 10, hasReminders: true },
  TIER3: { maxWidgets: -1, maxGoals: -1, hasReminders: true }
};
```

---

## 🚨 CRITICAL REQUIREMENTS

1. ❌ NEVER mention "AI", "Claude"
2. ✅ ALWAYS say "Gemral phân tích..."
3. ✅ Recommend products từ database only
4. ✅ RLS policies on ALL tables
5. ✅ Performance < 2s page load
6. ✅ Responsive mobile/tablet/desktop

---

## 📦 DEPENDENCIES

```bash
npm install --save \
  react-beautiful-dnd \
  @anthropic-ai/sdk \
  date-fns \
  react-hot-toast \
  framer-motion
```

---

## 📁 FILE STRUCTURE (20+ files)

```
src/
├── services/ (7 NEW)
│   ├── responseDetector.js
│   ├── dataExtractor.js
│   ├── widgetFactory.js
│   ├── shopifySync.js
│   ├── productRecommendation.js
│   ├── notificationService.js
│   └── chatbot.js (UPDATE)
├── components/ (6 NEW)
│   ├── WidgetPreviewModal.jsx
│   ├── NotificationBell.jsx
│   ├── widgets/
│   │   ├── GoalCard.jsx
│   │   ├── AffirmationCard.jsx
│   │   ├── ActionPlanWidget.jsx
│   │   └── CrystalGridWidget.jsx
├── pages/ (2 NEW, 1 UPDATE)
│   ├── Dashboard.jsx (NEW)
│   ├── NotificationSettings.jsx (NEW)
│   └── Chatbot.jsx (UPDATE)
└── styles/ (2 NEW)
    ├── dashboard.css
    └── widgetPrompt.css

supabase/migrations/ (2 NEW)
├── 20250120_dashboard_widgets.sql
└── 20250121_shopify_products.sql
```

---

## ✅ SUCCESS METRICS

### **Target Month 3:**
- 60% users create widgets
- 40% check dashboard daily
- 70% notification open rate
- 25% goal completion rate
- +₫245M-1.15B revenue/month

---

## 🚀 START NOW

### **Step 1: Read All Reference Files**
```bash
1. KE_HOACH_FINAL_SIMPLIFIED.md
2. SUPPLEMENT_SHOPIFY_INTEGRATION.md
3. GEM_CHATBOT_DATA_FINAL.json
4. SESSION_SUMMARY_NEXT_STEPS.md
```

### **Step 2: Begin Week 1 Day 1**
```bash
Create: src/services/responseDetector.js
Copy full code từ KE_HOACH_FINAL_SIMPLIFIED.md
Test với 10 sample responses
```

### **Step 3: Follow Week-by-Week**
```bash
Complete Week 1 → Week 2 → ... → Week 8
Test after each day
Document progress
Flag blockers immediately
```

---

## 💡 TIPS

1. **Start Small, Test Often** - Don't skip testing
2. **Copy From Plan** - Code đã ready trong plan files
3. **Preserve Existing** - Don't break current features
4. **Ask Early** - Don't struggle >30 mins
5. **Celebrate Wins** - Each week is a milestone!

---

## 🎉 FINAL NOTE

This is a **HIGH-VALUE** project:
- Revenue potential: ₫245M-1.15B/month
- Engagement: +80%
- Retention: +65%

Take your time. Follow the plan. Build something amazing.

**Ready? Let's build! 🚀💎**

---

**START: Week 1 Day 1 - Response Detector**

**Reference:** `KE_HOACH_FINAL_SIMPLIFIED.md` Week 1 Day 1-2

---

END OF MASTER PROMPT
