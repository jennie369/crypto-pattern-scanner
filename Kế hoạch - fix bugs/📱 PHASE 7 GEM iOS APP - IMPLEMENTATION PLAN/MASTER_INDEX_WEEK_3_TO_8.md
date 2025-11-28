# 📱 GEM iOS APP - IMPLEMENTATION PROMPTS MASTER INDEX

**Version:** 1.0  
**Date:** November 23, 2025  
**Status:** READY FOR IMPLEMENTATION

---

## 📋 DANH SÁCH FILES

### **1. Design & Navigation Foundation**
- ✅ `DESIGN_TOKENS.md` - Design system specs (v3.0)
- ✅ `FINAL_NAVIGATION_STRUCTURE_6_TABS.md` - Navigation structure
- ✅ `PHASE_07_iOS_APP_IMPLEMENTATION_PLAN_V2.md` - Overall plan

### **2. Tab Bar Fix**
- ✅ `FIX_TABBAR_STRICT_COMPLIANCE_FINAL.md` - Fix tab names

### **3. Week-by-Week Prompts**
- ✅ `WEEK_03_FORUM_IMPLEMENTATION.md` - Home tab (Forum)
- ✅ `WEEK_04_TO_08_ALL_PROMPTS.md` - Shop, Scanner, Gemral, Notifications, Account

---

## 🗓️ IMPLEMENTATION TIMELINE

```
Week 1-2: Setup & Navigation ✅ DONE
├─ Project setup
├─ 6 placeholder screens
├─ Tab navigation
└─ Design tokens

Week 3: HOME TAB (Forum) 🎯 NEXT
├─ Forum feed
├─ Category tabs
├─ Post cards
├─ Pull-to-refresh
├─ Infinite scroll
├─ Like/Comment
├─ Create post
└─ Post detail

Week 4: SHOP TAB
├─ Product catalog
├─ Product grid (2 columns)
├─ Category filter
├─ Cart management
├─ Shopify checkout
├─ Order history
└─ Wishlist

Week 5: SCANNER TAB (Giao Dịch)
├─ Pattern scanner UI
├─ Coin selector
├─ Timeframe buttons
├─ Pattern cards
├─ Confidence bars
├─ Pattern detail
├─ Chart WebView
└─ Real-time updates

Week 6: Gemral TAB (AI Chat)
├─ Chat interface
├─ Message bubbles
├─ Streaming responses
├─ I Ching readings
├─ Tarot readings
├─ Quick actions
└─ Dashboard widgets

Week 7: NOTIFICATIONS TAB
├─ Notification list
├─ Category filter
├─ Mark as read
├─ Swipe to delete
├─ Push notifications
├─ Deep linking
└─ Badge count

Week 8: ACCOUNT TAB (Tài Sản)
├─ Profile display
├─ Stats cards
├─ Quick actions grid
├─ Settings
├─ Affiliate dashboard
├─ Tools list (18 tools)
├─ Trading journal
└─ Logout

Week 9: Polish & Testing
Week 10: App Store Submission
```

---

## 🎯 CÁC ĐIỂM QUAN TRỌNG

### **1. Design Compliance**
```markdown
CRITICAL: PHẢI follow DESIGN_TOKENS.md

✅ Colors:
- Navy: #112250
- Gold: #FFBD59
- Cyan: #00D9FF (numbers only)
- Glass: rgba(37, 38, 65, 0.4)

✅ Typography:
- Primary: Montserrat (UI text)
- Display: Noto Sans Display (headings)
- Mono: SF Mono (numbers)

✅ Spacing:
- 8px grid: 4, 8, 12, 16, 20, 24
- Page padding: 16px
- Card gap: 12px
```

### **2. Service Reuse**
```markdown
CRITICAL: REUSE existing services from web app

✅ Forum: forumService.js (working!)
✅ Shop: shopifyService.js (working!)
✅ Scanner: patternDetection.js (working!)
✅ Chat: Claude API integration
✅ Notifications: Expo Notifications
✅ Auth: supabaseClient.js (working!)

❌ DON'T rewrite database logic
❌ DON'T create new API calls
```

### **3. Naming Updates**
```markdown
CRITICAL: "Chatbot" → "Gemral"

✅ Tab title: "Gemral"
✅ Screen name: GemMasterScreen
✅ Folder: src/screens/GemMaster/
✅ All references updated
```

---

## 📝 CÁCH SỬ DỤNG PROMPTS

### **Bước 1: Đọc Design Specs**
```bash
# Đọc TRƯỚC KHI code
1. DESIGN_TOKENS.md
2. FINAL_NAVIGATION_STRUCTURE_6_TABS.md
3. PHASE_07_iOS_APP_IMPLEMENTATION_PLAN_V2.md
```

### **Bước 2: Fix Tab Bar**
```bash
# Week 1-2: Fix tab names
File: FIX_TABBAR_STRICT_COMPLIANCE_FINAL.md

Expected result:
Tab 1: "Home" ✅
Tab 2: "Shop" ✅  
Tab 3: "Giao Dịch" ✅
Tab 4: "Gemral" ✅
Tab 5: "Thông Báo" ✅
Tab 6: "Tài Sản" ✅
```

### **Bước 3: Implement Week by Week**
```bash
# Week 3: Forum
File: WEEK_03_FORUM_IMPLEMENTATION.md
→ Copy prompt → Paste to Claude Code → Execute

# Week 4-8: Remaining tabs
File: WEEK_04_TO_08_ALL_PROMPTS.md
→ Find section for current week
→ Copy prompt → Paste to Claude Code → Execute
```

---

## ✅ VALIDATION CHECKLISTS

### **Design Compliance**
- [ ] All colors from DESIGN_TOKENS.md
- [ ] All fonts from DESIGN_TOKENS.md
- [ ] All spacing on 8px grid
- [ ] Glass cards matching spec
- [ ] Touch targets ≥ 44px

### **Services Integration**
- [ ] forumService.js copied and working
- [ ] shopifyService.js copied and working
- [ ] patternDetection.js copied and working
- [ ] supabaseClient.js working
- [ ] No new database logic created

### **Features Completion**
- [ ] All features from prompt implemented
- [ ] No features skipped
- [ ] No random features added
- [ ] Validation checklist completed

### **Testing**
- [ ] iOS simulator tested
- [ ] All navigation working
- [ ] All interactions working
- [ ] Performance optimized
- [ ] No memory leaks

---

## 🚨 ENFORCEMENT RULES

### **MUST DO:**
1. ✅ Read DESIGN_TOKENS.md FIRST
2. ✅ Read FINAL_NAVIGATION_STRUCTURE_6_TABS.md
3. ✅ Use ONLY values from specs
4. ✅ Reuse existing services
5. ✅ Complete ALL features in prompt
6. ✅ Complete validation checklist
7. ✅ Report completion

### **MUST NOT DO:**
1. ❌ Create random values
2. ❌ Modify specs
3. ❌ Rewrite existing services
4. ❌ Skip features
5. ❌ Add unspecified features
6. ❌ Use different tab names

---

## 📊 PROGRESS TRACKING

### **Completion Status**

| Week | Tab | Status | File |
|------|-----|--------|------|
| 1-2 | Setup | ✅ DONE | FIX_TABBAR_STRICT_COMPLIANCE_FINAL.md |
| 3 | Home (Forum) | 🎯 NEXT | WEEK_03_FORUM_IMPLEMENTATION.md |
| 4 | Shop | ⏳ TODO | WEEK_04_TO_08_ALL_PROMPTS.md (Section 1) |
| 5 | Scanner | ⏳ TODO | WEEK_04_TO_08_ALL_PROMPTS.md (Section 2) |
| 6 | Gemral | ⏳ TODO | WEEK_04_TO_08_ALL_PROMPTS.md (Section 3) |
| 7 | Notifications | ⏳ TODO | WEEK_04_TO_08_ALL_PROMPTS.md (Section 4) |
| 8 | Account | ⏳ TODO | WEEK_04_TO_08_ALL_PROMPTS.md (Section 5) |
| 9 | Polish | ⏳ TODO | Manual testing |
| 10 | App Store | ⏳ TODO | Submission process |

---

## 📱 EXPECTED OUTCOMES

### **After Week 3:**
- ✅ Forum feed with posts
- ✅ Category filtering
- ✅ Pull-to-refresh
- ✅ Infinite scroll
- ✅ Like/comment working
- ✅ Create post modal
- ✅ Glass design throughout

### **After Week 4:**
- ✅ Product catalog
- ✅ 2-column grid
- ✅ Add to cart
- ✅ Shopify checkout
- ✅ Order history

### **After Week 5:**
- ✅ Pattern detection working
- ✅ Coin/timeframe selectors
- ✅ Pattern cards with stats
- ✅ Chart WebView
- ✅ Real-time updates

### **After Week 6:**
- ✅ AI chat working
- ✅ I Ching readings
- ✅ Tarot readings
- ✅ Quick actions
- ✅ Streaming responses

### **After Week 7:**
- ✅ Notification list
- ✅ Push notifications
- ✅ Deep linking
- ✅ Badge count on tab

### **After Week 8:**
- ✅ Profile display
- ✅ Trading stats
- ✅ Tools access
- ✅ Settings
- ✅ Affiliate dashboard

---

## 🎯 SUCCESS CRITERIA

```markdown
✅ All 6 tabs working
✅ Design tokens followed 100%
✅ Services reused (not rebuilt)
✅ All features implemented
✅ Validation checklists complete
✅ iOS simulator tested
✅ Performance optimized
✅ Ready for App Store
```

---

## 📞 SUPPORT

**Questions?**
- Check DESIGN_TOKENS.md for styling
- Check FINAL_NAVIGATION_STRUCTURE_6_TABS.md for structure
- Check PHASE_07_iOS_APP_IMPLEMENTATION_PLAN_V2.md for overall plan

**Issues?**
- Verify design tokens usage
- Verify service integration
- Verify feature completion
- Verify validation checklist

---

**STATUS: ALL PROMPTS READY! START WEEK 3! 🚀**

**NEXT ACTION:** Copy WEEK_03_FORUM_IMPLEMENTATION.md → Paste to Claude Code → Execute!
