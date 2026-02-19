# PHASE 7 MASTER PLAN - GEM PLATFORM FIX
## 5 Issues: AI Chat UX, Deep Links, Chatbot Logic, Ritual Nav, Auth/Tier Recovery
## Created: 2026-02-15

---

## EXECUTIVE SUMMARY
Phase 7 addresses 5 user-reported bugs across the GEM Master chatbot, Admin AI Brain,
deep linking system, and auth session recovery. All issues are regressions or incomplete
fixes from Phase 5 that still affect production.

| # | Issue | Severity | Team |
|---|-------|----------|------|
| 1 | AI Brain chat: no typing indicator | P1-HIGH | Alpha |
| 2 | Deep link broken: blank page on shared URLs | P0-CRITICAL | Gamma |
| 3 | Gem Knowledge: wrong quick select responses | P1-HIGH | Beta |
| 4 | Ritual navigation: no CTA, back goes to home | P1-HIGH | Beta |
| 5 | Admin role lost on app resume / infinite loading | P0-CRITICAL | Alpha |

---

## TEAM STRUCTURE

### Team Alpha: AI Chat UX + Auth/Tier Recovery (Issues 1 + 5)
**Rationale**: Both issues live in the GemMaster/AdminAI area. Auth fix is prerequisite
for proper chatbot functioning (admin detection affects quota display).

### Team Beta: Chatbot Logic + Ritual Navigation (Issues 3 + 4)
**Rationale**: Both issues are about chatbot quick select response handling and navigation.
Issue 3 (wrong response) and Issue 4 (direct ritual nav) share the same code path in
GemMasterScreen.js quick select handlers.

### Team Gamma: Deep Links (Issue 2)
**Rationale**: Independent web/app linking infrastructure. Requires edge function work,
app.json config, and potentially well-known file deployment.

---

## ISSUE 1: AI BRAIN CHAT - TYPING INDICATOR
### Problem
Screenshot shows: User sends "Goi y Entry" in AdminAI Brain chat, sees blank area with
spinner at bottom. No visual feedback that AI is processing/typing.

### Root Cause
`AdminAIChatModal.js` does not render a typing indicator while waiting for Gemini response.
The `isLoading` state exists but only shows a generic spinner, not animated typing dots.

### Files to Modify
| File | Change |
|------|--------|
| `components/AdminAI/AdminAIChatModal.js` | Add TypingIndicator component while `isLoading` |
| `screens/GemMaster/components/TypingIndicator.js` | Reuse existing component (already exists!) |
| `components/AdminAI/AdminAIMessageBubble.js` | Ensure typing bubble renders in message list |

### Fix Strategy
1. Import existing `TypingIndicator` from GemMaster components
2. Render it at the bottom of the message list when `isLoading === true`
3. Style it to match AdminAI chat theme (dark background, gold accent)
4. Auto-scroll to typing indicator when it appears
5. Remove typing indicator once AI response arrives

### Edge Cases
- Multiple rapid sends while AI is still responding
- Network timeout during AI response (show error after 30s)
- Voice message transcription + AI response (double loading state)
- Very long AI responses that stream in chunks
- User closes modal while AI is typing

### Verification
- [ ] Typing dots appear immediately after user sends message
- [ ] Dots animate smoothly (opacity + Y-axis bounce)
- [ ] Dots disappear when AI response arrives
- [ ] Auto-scroll shows typing dots in view
- [ ] Works with quick action buttons (Pattern Analysis, Zone Check, etc.)

---

## ISSUE 2: DEEP LINK BROKEN - BLANK PAGE
### Problem
Screenshot shows: www.gemral.com opened from Messenger shows completely blank dark blue page.
No content renders, no redirect to app, no OG meta preview.

### Root Cause (Multi-factor)
1. **Missing AASA file**: `/.well-known/apple-app-site-association` not deployed on gemral.com
2. **Missing assetlinks.json**: `/.well-known/assetlinks.json` not deployed for Android
3. **og-meta edge function**: May not be correctly routing or the Vercel/hosting config
   doesn't proxy to the Supabase edge function
4. **Domain conflict**: gemral.com is managed by Shopify, which blocks custom server-side logic
5. **No fallback redirect**: If app not installed, user sees blank page instead of web content

### Files to Modify
| File | Change |
|------|--------|
| `gem-mobile/app.json` | Verify scheme, associatedDomains, intent filters |
| `supabase/functions/og-meta/index.ts` | Fix meta tag generation + redirect logic |
| `supabase/functions/smart-link/index.ts` | Fix mobile redirect flow |
| `gem-mobile/src/services/deepLinkHandler.js` | Verify URL pattern matching |
| `gem-mobile/src/navigation/AppNavigator.js` | Add React Navigation linking config |

### Fix Strategy
1. **Diagnose**: Check og-meta edge function deployment status via Supabase MCP
2. **Fix og-meta**: Ensure it returns proper HTML with OG tags + redirect
3. **Deploy AASA**: Create apple-app-site-association via Supabase edge function
4. **Deploy assetlinks**: Create assetlinks.json via Supabase edge function
5. **Add fallback page**: When app not installed, show landing page with CTA to download
6. **Test all paths**: courses, shop, forum, products, affiliate links

### Edge Cases
- Link opened on device without app installed
- Link opened on desktop browser
- Link opened from Facebook Messenger in-app browser
- Link opened from Telegram, SMS, Email
- Link with expired affiliate code
- Link to non-existent product/course
- Very slow network (OG meta timeout)
- CORS issues between Messenger WebView and gemral.com

### Verification
- [ ] Shared link shows rich preview in Messenger/Facebook
- [ ] Tapping link opens app to correct screen (if installed)
- [ ] Tapping link shows fallback page (if not installed)
- [ ] Deep links work for: courses, shop, forum, products
- [ ] Affiliate links track clicks correctly

---

## ISSUE 3: GEM KNOWLEDGE - WRONG QUICK SELECT RESPONSES
### Problem
Screenshot shows: User asks "Gioi thieu Khoa Tu Duy Trieu Phu - Manifest Tien Bac"
(introduce the Millionaire Mindset course). Bot responds with "Hay dien form de tao nhat ky
va muc tieu" (fill form to create journal and goals) - completely wrong response.

### Root Cause
The chatbot's response detection system (`responseDetector.js` / `widgetDetectionService.js`)
incorrectly classifies course-related queries as widget/form triggers. Keywords like
"manifest", "muc tieu" (goal) trigger the journal/goal form widget instead of returning
course information.

### Files to Investigate & Fix
| File | Purpose |
|------|---------|
| `services/responseDetector.js` | Response type detection logic |
| `services/widgetDetectionService.js` | Widget trigger keywords |
| `services/gemMasterService.js` | Main chatbot message processing |
| `services/chatbot/index.js` | Enhanced chatbot processor |
| `services/chatbot/khoKienThuc/` | Knowledge base files |
| `components/GemMaster/InlineChatForm.js` | Form display logic |
| `components/GemMaster/WidgetSuggestionCard.js` | Widget suggestion rendering |
| `components/GemMaster/CourseRecommendation.js` | Course recommendation cards |

### Fix Strategy
1. **Audit widget detection**: Map ALL keywords that trigger forms vs knowledge responses
2. **Priority system**: Course/product queries should take priority over form triggers
3. **Context awareness**: If user is asking ABOUT a course, don't trigger a form
4. **Test ALL quick selects**: Map each quick select → expected response type
5. **Fix keyword conflicts**: "manifest", "muc tieu" in course name vs goal form trigger

### Quick Select Response Mapping (Expected)
| Quick Select | Expected Response |
|-------------|-------------------|
| Kinh Dich | I Ching divination interface |
| Tarot | Tarot card reading interface |
| Phan tich | Trading pattern analysis |
| Goi y | Entry suggestions |
| Tai loc | Wealth/prosperity guidance |
| Tinh yeu | Love/relationship guidance |
| Khoa hoc | Course recommendations (NOT forms) |
| Thach anh | Crystal recommendations |

### Edge Cases
- Course names containing keywords that match form triggers
- Mixed queries (e.g., "set a goal to complete this course")
- Follow-up questions about a course
- Vietnamese diacritics vs no-diacritics matching
- Multiple keyword matches in same message

### Verification
- [ ] "Gioi thieu khoa tu duy trieu phu" → Course recommendation card (NOT form)
- [ ] "Khoa hoc" quick select → Course list/recommendations
- [ ] "Tao muc tieu" → Goal form (correct trigger)
- [ ] Each quick select returns appropriate response type
- [ ] No form pop-ups for course-related questions

---

## ISSUE 4: RITUAL NAVIGATION - NO CTA, BACK GOES TO HOME
### Problem
1. Quick select "nghi thuc manifest may man" → navigates directly to "Thu Gui Vu Tru" ritual
   without showing a chat response first
2. No CTA button in chat — should show brief explanation + CTA to navigate
3. Back button from ritual goes to Home tab instead of back to GemMaster chat
4. Ritual "Thu Gui Vu Tru" stuck in "Tai San" (Account) tab instead of GemMaster tab

### Root Cause
1. Quick select handler calls `navigation.navigate()` directly instead of adding a chat message
2. Ritual screens are registered under AccountStack/VisionBoardStack, not GemMasterStack
3. Back navigation from Account stack goes to Account tab root, not GemMaster

### Files to Modify
| File | Change |
|------|--------|
| `screens/GemMaster/GemMasterScreen.js` | Quick select ritual handler → chat message + CTA |
| `components/GemMaster/QuickActionBar.js` | Ritual action type handling |
| `components/GemMaster/FAQPanelData.js` | Ritual quick select action definitions |
| `navigation/GemMasterStack.js` | Add ritual screens to GemMaster stack |
| `screens/GemMaster/RitualsScreen.js` | Ensure proper back navigation |
| `screens/VisionBoard/rituals/LetterToUniverseRitual.js` | Back button handler |

### Fix Strategy
1. **Chat-first flow**: When user selects ritual quick action:
   - Show AI chat message: brief description of the ritual
   - Include inline CTA button: "Bat dau nghi thuc" → navigates to ritual
2. **Navigation fix**: Register ritual screens in GemMasterStack so back goes to chat
3. **Back button**: Override back handler in ritual screens to navigate to GemMaster chat
4. **Tab fix**: Ensure ritual opened from GemMaster stays in GemMaster tab

### Correct Flow
```
User taps "Nghi thuc manifest may man"
    ↓
AI responds: "Nghi thuc 'Thu Gui Vu Tru' la cach tuyet voi de gui y dinh
manifest cua ban den vu tru. Hay viet dieu uoc voi long biet on va niem tin."
    ↓
[Bat dau Nghi thuc →] (CTA button in chat message)
    ↓
User taps CTA → Navigate to LetterToUniverseRitual (within GemMaster stack)
    ↓
User completes or taps Back → Returns to GemMaster chat
```

### Edge Cases
- User taps ritual quick select while another ritual is in progress
- User taps back during multi-step ritual (partial completion)
- Deep link to ritual from notification
- Ritual completion → should return to chat with congratulations message
- Offline ritual attempt
- Ritual with required daily completion tracking

### Verification
- [ ] Ritual quick select → chat message appears first (NOT direct navigation)
- [ ] CTA button visible in chat message
- [ ] Tapping CTA opens ritual in GemMaster stack (NOT Account tab)
- [ ] Back button from ritual returns to GemMaster chat
- [ ] Ritual not stuck in Account tab
- [ ] All ritual quick selects produce chat message + CTA

---

## ISSUE 5: ADMIN ROLE LOST ON APP RESUME / INFINITE LOADING
### Problem
Screenshot shows: GemMaster displays "FREE" badge, "Het luot hoi hom nay" (quota exhausted),
3/3 quota counter — but user is ADMIN with unlimited access.

### Root Cause (Traced end-to-end)
1. `AuthContext.refreshProfile()` correctly fetches `is_admin: true` on app resume
2. `TierService.getUserTier()` correctly returns 'ADMIN' when profile is fresh
3. **BUT**: `GemMasterScreen.js` has its own LOCAL `userTier` state
4. `GemMasterScreen.fetchUserAndTier()` runs only on INITIAL MOUNT
5. It does NOT listen to AuthContext profile changes
6. It does NOT refresh on screen focus or app resume
7. Result: `userTier` stays 'FREE', `quota.unlimited = false`, shows "Het luot"

### Files to Modify
| File | Change |
|------|--------|
| `screens/GemMaster/GemMasterScreen.js` | Subscribe to AuthContext, refresh on focus |
| `contexts/AuthContext.js` | Verify refreshProfile() works on resume |
| `services/quotaService.js` | Verify admin bypass in checkQuota() |
| `services/tierService.js` | Verify getUserTier() admin detection |
| `components/GemMaster/TierBadge.js` | Verify reactive to tier changes |
| `components/GemMaster/QuotaIndicator.js` | Verify reactive to quota changes |

### Fix Strategy
1. **Use AuthContext**: GemMasterScreen should get `isAdmin`, `userTier`, `profile` from
   `useAuth()` hook instead of maintaining local tier state
2. **Listen to profile changes**: When AuthContext.profile updates, re-compute quota
3. **Screen focus refresh**: Add `navigation.addListener('focus', refreshTierAndQuota)`
4. **AppState listener**: When app comes back to foreground while on GemMaster tab,
   re-fetch tier and quota
5. **Grep for similar pattern**: Check ALL screens that cache tier/quota locally

### Grep for Similar Issues
```bash
# Find all files that call TierService.getUserTier locally instead of using AuthContext
grep -rn "TierService.getUserTier" gem-mobile/src/screens/
grep -rn "setUserTier" gem-mobile/src/screens/
grep -rn "QuotaService.checkQuota" gem-mobile/src/screens/
```

### Edge Cases
- App in background for < 60 seconds (no refresh triggered)
- App in background for > 60 seconds (should trigger refresh)
- Session expired while in background (re-auth needed)
- Network offline when resuming (use cached profile)
- Multiple rapid foreground/background transitions
- Admin role revoked while in background
- Screen mounted but not focused (tab not active)
- Hot reload during development (reset state)

### Verification
- [ ] Admin user resumes app → "ADMIN" badge shows (not FREE)
- [ ] Admin user → "unlimited" quota (not 3/3)
- [ ] Admin user → input placeholder says "Nhap tin nhan..." (not "Het luot")
- [ ] Quick selects are NOT disabled for admin
- [ ] Tab switch back to GemMaster refreshes tier
- [ ] Background resume on GemMaster tab refreshes tier
- [ ] Non-admin user still sees correct tier and quota limits

---

## CROSS-CUTTING CONCERNS

### Backup Plan
- Create git backup before any changes: `git stash` or branch `phase7-backup`
- Each team commits independently with descriptive messages
- No force pushes; linear history only

### Communication Protocol
- Teams share findings about overlapping files (especially GemMasterScreen.js)
- Alpha handles GemMasterScreen auth/tier state
- Beta handles GemMasterScreen quick select/response logic
- Changes to shared files must be coordinated

### Shared Files (Conflict Risk)
| File | Alpha | Beta | Gamma |
|------|-------|------|-------|
| GemMasterScreen.js | Auth/tier state | Quick select handlers | - |
| AppNavigator.js | - | - | Deep link config |
| GemMasterStack.js | - | Navigation structure | - |
| AuthContext.js | Session recovery | - | - |

### Documentation Requirements (After all fixes)
1. Update `docs/Troubleshooting_Tips.md` with Phase 7 rules
2. Update `docs/README.md` with architecture changes
3. Create `docs/feature-phase7-fixes.md` with detailed write-up
4. Update `.env.example` if new env vars needed

---

## TASK DEPENDENCY GRAPH

```
Issue 5 (Auth/Tier) ← Must fix FIRST (affects Issue 1 and Issue 3 quota)
    ↓
Issue 1 (Typing Indicator) ← Independent after auth fix
Issue 3 (Gem Knowledge) ← Independent after auth fix
Issue 4 (Ritual Nav) ← Depends on Issue 3 response logic
    ↓
Issue 2 (Deep Links) ← Fully independent, can run parallel
    ↓
Documentation ← After all fixes complete
```

---

## SUCCESS CRITERIA
- [ ] All 5 issues verified fixed
- [ ] No regressions in existing functionality
- [ ] Admin user always shows correct tier/quota
- [ ] Deep links open app to correct screen
- [ ] Chatbot responses match expected quick select behavior
- [ ] All navigation back buttons work correctly
- [ ] Documentation updated
- [ ] Code committed and pushed
