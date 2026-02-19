# PHASE 4 MASTER PLAN - 12 SYSTEMIC ISSUES FIX
## Created: 2026-02-14

---

## SCREENSHOTS ANALYZED
1. KOL Application view too minimal (only email/phone/date)
2. Message preview showing raw call_id JSON
3. Messages page missing bottom tab bar
4. (Other screenshots: ritual stuck, chatbot ***, vision board truncated, course CTA cut off)

---

## SYSTEM AUDIT MAP

### Group A: RITUAL SYSTEM
- **Issue #1**: Heartbeat ritual cycle stuck at "Chu kỳ 1/4"
- Files: breathing/ritual screen, timer logic, state machine
- Complexity: HIGH (state machine + timer race conditions)

### Group B: CHAT & MESSAGING
- **Issue #2**: Chatbot CHART_HINT showing raw "***" markdown
- **Issue #3**: Chat history delete not working
- **Issue #6**: Add call back button in call history widget
- **Issue #7**: Message preview showing raw call_id JSON
- **Issue #8**: Messages page missing bottom tab
- Files: chat screens, message service, call service, navigation
- Complexity: MEDIUM-HIGH

### Group C: VISION BOARD
- **Issue #4**: AI-created goal action plan truncated, ** artifacts
- Files: goalService, vision board screens, AI parsing
- Complexity: MEDIUM

### Group D: NAVIGATION & UI
- **Issue #5**: Course detail page bottom CTA cut off
- **Issue #8**: Messages page missing bottom tab
- Files: course screens, navigation config, SafeArea
- Complexity: SIMPLE-MEDIUM

### Group E: NOTIFICATIONS
- **Issue #9**: Full push notification system audit
- **Issue #10**: Home message icon never shows unread badge
- **Issue #11**: KOL/CTV approval missing notification
- Files: notification service, badge logic, Supabase triggers
- Complexity: HIGH

### Group F: KOL/ADMIN
- **Issue #12**: KOL application view too minimal
- Files: admin screens, KOL application schema
- Complexity: MEDIUM

---

## BACKUP PLAN
- Branch: Current work on `main`, all changes committed
- Snapshot: Phase 3 committed as 68af8ad + 45d6e54
- DB: Use Supabase MCP to check schema before any migration
- Rollback: git revert per commit group if needed

---

## FIX PRIORITY ORDER

### Team 1: Chat & Messaging (Issues #2, #3, #6, #7, #8)
Priority: HIGHEST - visible to every user, raw JSON in UI

### Team 2: Ritual + Vision Board + Course (Issues #1, #4, #5)
Priority: HIGH - broken features

### Team 3: Notifications + Badge + KOL (Issues #9, #10, #11, #12)
Priority: HIGH - missing functionality

---

## DETAILED ISSUE ANALYSIS

### Issue #1: Ritual Heartbeat Cycle Stuck
- Root cause: Timer/state machine not advancing cycle counter
- Trace: timer tick → phase change → cycle increment → state update → render
- Check: useEffect cleanup, setInterval vs setTimeout, stale closure

### Issue #2: Chatbot "***" Raw Markdown
- Root cause: Rich response parser not stripping markdown bold syntax
- Trace: AI response → parser → markdown renderer → card component
- Fix: Sanitize *** before render, or use proper markdown renderer

### Issue #3: Chat History Delete Broken
- Root cause: Delete handler not removing from DB or local state not refreshing
- Trace: button click → handler → supabase delete → state update → re-render
- Check: soft vs hard delete, query filters, cache invalidation

### Issue #4: Vision Board Action Plan Truncated
- Root cause: Text column limit, markdown trimming, or JSON field mapping
- Trace: AI output → parsing → DB insert → column type → retrieval → render
- Check: DB column type (text vs varchar), split logic, sanitizer

### Issue #5: Course Detail CTA Cut Off
- Root cause: ScrollView/SafeArea padding, tab bar overlap
- Fix: Add paddingBottom for tab bar height, ensure full scroll

### Issue #6: Call Back Button in Chat
- Add: Touchable call button in call history widget
- Must: Check permissions, respect tier access, not break existing call logic

### Issue #7: Message Preview Raw JSON
- Root cause: Last message content stored as JSON object, preview renders raw
- Fix: Format call messages → "Cuộc gọi 25s" / "Cuộc gọi nhỡ"

### Issue #8: Messages Page Missing Bottom Tab
- Root cause: Messages screen likely pushed as modal/stack without tab wrapper
- Fix: Ensure Messages uses same navigation structure with bottom tabs

### Issue #9: Push Notification Full Audit
- Check: FCM/APNS setup, payload format, badge count, event differentiation
- Trace: event → DB → trigger → push payload → app receive → badge → UI

### Issue #10: Unread Badge Not Showing
- Root cause: Unread count query, listener, subscription, or state refresh
- Fix: Real-time subscription for unread count, refresh on mount

### Issue #11: KOL Approval Missing Notification
- Add: Push to admin on new registration, in-app notification, badge update
- Trace: user submit → DB insert → admin detect → notification → render

### Issue #12: KOL Application View Minimal
- Screenshot confirms: Only shows email, phone, date
- Add: Social links, follower count, tier, account stats, history, notes

---

## RISK TABLE

| Issue | Risk Level | Regression Risk | Cross-Feature Impact |
|-------|-----------|----------------|---------------------|
| #1 Ritual | Medium | Low - isolated | None |
| #2 Chat *** | Low | Low | All chatbot responses |
| #3 Chat Delete | Medium | Medium - state | Chat history |
| #4 Vision Board | Medium | Medium | Goal detail, journal |
| #5 Course CTA | Low | Low | Course screens |
| #6 Call Back | Medium | Medium | Call system |
| #7 Message JSON | Low | Low | Message list |
| #8 Messages Tab | Medium | Medium | Navigation |
| #9 Notifications | HIGH | HIGH | All push |
| #10 Badge | Medium | Medium | Home screen |
| #11 KOL Notif | Low | Low | Admin only |
| #12 KOL View | Low | Low | Admin only |
