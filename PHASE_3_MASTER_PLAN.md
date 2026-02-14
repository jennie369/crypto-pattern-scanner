# PHASE 3 MASTER PLAN - GEM PLATFORM COMPREHENSIVE FIX
## Areas M, N, O, P, Q | Created: 2026-02-14

---

## EXECUTIVE SUMMARY
Phase 3 addresses 52 issues across 5 areas discovered during comprehensive audit.
- **CRITICAL (P0)**: 8 issues - Security, data loss, crash risks
- **HIGH (P1)**: 15 issues - Functional bugs, race conditions
- **MEDIUM (P2)**: 18 issues - UX, performance, consistency
- **LOW (P3)**: 11 issues - Polish, optimization

---

## TEAM ASSIGNMENTS

### TEAM ALPHA: Security & API (Areas M + Q)
**Focus**: Chatbot API security, Tier enforcement, Quota race conditions
**Files**: ichingService.js, tarotService.js, geminiService.js, tierService.js, quotaService.js, accessControlService.js

### TEAM BETA: Data & Storage (Areas N + O)
**Focus**: Vision Board storage cleanup, Binance WebSocket lifecycle, rate limits
**Files**: goalService.js, binanceService.js, webSocketPoolService.js, patternCacheService.js

### TEAM GAMMA: UI & Localization (Area P)
**Focus**: i18n coverage, number formatting, hardcoded strings
**Files**: i18n/locales/*.json, formatters.js, all screens with hardcoded Vietnamese

---

## CRITICAL (P0) - MUST FIX IMMEDIATELY

### P0-1: ichingService.js Direct Gemini API Call [TEAM ALPHA]
- **File**: `src/services/ichingService.js`
- **Bug**: Calls Gemini API directly via fetch(), bypasses rate limiting, exposes API key in client
- **Fix**: Route through `geminiService.js` edge function proxy OR create dedicated edge function
- **Impact**: Security vulnerability, API key exposure, no rate limiting

### P0-2: tarotService.js Direct Gemini API Call [TEAM ALPHA]
- **File**: `src/services/tarotService.js`
- **Bug**: Same as P0-1, direct Gemini API call
- **Fix**: Route through geminiService edge function proxy
- **Impact**: Same security concerns

### P0-3: Quota Race Condition - Concurrent Bypass [TEAM ALPHA]
- **File**: `src/services/quotaService.js`
- **Bug**: Check-then-decrement is not atomic. Two concurrent requests both pass check before either decrements
- **Fix**: Create Supabase RPC `atomic_check_and_decrement_quota()` that does SELECT + UPDATE in single transaction
- **Database**: New RPC function needed

### P0-4: Quota Returns Unlimited on Error [TEAM ALPHA]
- **File**: `src/services/quotaService.js`
- **Bug**: When quota check fails (network error), returns `{ allowed: true, unlimited: true }` - security gap
- **Fix**: Return `{ allowed: false }` on error, let UI show retry option
- **Impact**: Users bypass all limits during network issues

### P0-5: No Database RLS for Tier Enforcement [TEAM ALPHA]
- **File**: Supabase RLS policies
- **Bug**: Tier restrictions only enforced client-side. Direct Supabase calls bypass all tier checks
- **Fix**: Add RLS policies that check `profiles.subscription_tier` for scanner_results, chatbot_conversations, vision_goals
- **Database**: New RLS policies needed

### P0-6: Vision Board Image Deletion Orphans Storage [TEAM BETA]
- **File**: `src/services/goalService.js`
- **Bug**: Deleting a goal removes DB row but NOT the image file from Supabase Storage
- **Fix**: Add `supabase.storage.from('vision-board').remove([filePath])` before DB delete
- **Impact**: Storage bloat, billing increase over time

### P0-7: No Image Upload Validation [TEAM BETA]
- **File**: `src/services/goalService.js`
- **Bug**: No file type or size validation on image upload. Users can upload any file type, any size
- **Fix**: Validate MIME type (image/jpeg, image/png, image/webp) and max size (5MB)
- **Impact**: Storage abuse, potential crash on large files

### P0-8: Binance WebSocket Reconnection Scope Bug [TEAM BETA]
- **File**: `src/services/webSocketPoolService.js`
- **Bug**: `symbols` variable undefined in reconnection callback scope. Reconnect silently fails
- **Fix**: Capture symbols in closure or store in instance variable
- **Impact**: Scanner stops receiving real-time data after network interruption

---

## HIGH (P1) - FIX BEFORE NEXT RELEASE

### P1-1: No AbortController Timeout on API Calls [TEAM ALPHA]
- **Files**: ichingService.js, tarotService.js, geminiService.js
- **Bug**: No timeout on Gemini API calls. Slow responses hang indefinitely
- **Fix**: Add AbortController with 30s timeout

### P1-2: No API Call Timeout on Chatbot [TEAM ALPHA]
- **File**: `src/services/geminiService.js`
- **Bug**: Edge function calls have no client-side timeout
- **Fix**: Add AbortController with 60s timeout (AI responses can be long)

### P1-3: Chat History No Pagination [TEAM ALPHA]
- **File**: `src/screens/GemMasterChatScreen.js`
- **Bug**: Loads ALL chat messages at once. Heavy users with 1000+ messages will lag
- **Fix**: Implement cursor-based pagination (load last 50, scroll to load more)

### P1-4: Tử Vi System Not Implemented [TEAM ALPHA]
- **File**: Referenced in chatbot but no code exists
- **Bug**: UI shows Tử Vi option but no backend service
- **Fix**: Either implement or remove from UI to prevent user confusion

### P1-5: Three Tier Definition Files Inconsistent [TEAM ALPHA]
- **Files**: tierFeatures.js, tierService.js, tierAccessService.js
- **Bug**: Feature names/limits differ between files (e.g., "scanner" vs "pattern_scanner")
- **Fix**: Create single source of truth `TIER_CONFIG` exported from one file

### P1-6: Quota Not Reset on Tier Upgrade [TEAM ALPHA]
- **File**: `src/services/quotaService.js`
- **Bug**: When user upgrades tier, daily quota from old tier persists until next day
- **Fix**: Clear quota cache and reset daily counters on tier change event

### P1-7: Binance No Rate Limit Tracking [TEAM BETA]
- **File**: `src/services/binanceService.js`
- **Bug**: No tracking of API requests against 1200/min limit. Scanner can trigger 150+ calls per scan
- **Fix**: Add rate limit counter with sliding window, queue requests when approaching limit

### P1-8: Dual WebSocket Instances [TEAM BETA]
- **Files**: binanceService.js, webSocketPoolService.js
- **Bug**: Both create independent WebSocket connections. Subscription leaks when switching
- **Fix**: Consolidate to webSocketPoolService only, remove WS from binanceService

### P1-9: Cache TTL Too Long for Scanner [TEAM BETA]
- **File**: `src/services/patternCacheService.js`
- **Bug**: 5-min cache TTL means scanner shows stale data
- **Fix**: Reduce to 60s for scanner data, keep 5min for static data

### P1-10: Vision Board Dual Table Architecture [TEAM BETA]
- **Files**: vision_board_widgets table vs vision_goals table
- **Bug**: Two tables for similar purpose, inconsistent data
- **Fix**: Audit which is actually used, consolidate or clearly separate concerns

### P1-11: Vision Board Duplicate Context State [TEAM BETA]
- **Files**: VisionBoardContext.js, GoalContext.js
- **Bug**: Two React contexts managing overlapping state
- **Fix**: Merge into single VisionBoardContext

### P1-12: Hardcoded Vietnamese in 60%+ of Screens [TEAM GAMMA]
- **Files**: All screens outside i18n system
- **Bug**: ~60% of UI strings are hardcoded Vietnamese, not using i18n `t()` function
- **Fix**: Extract all strings to vi.json, wrap in `t()` calls

### P1-13: Tab Labels Hardcoded [TEAM GAMMA]
- **File**: `src/components/GlassBottomTab.js`
- **Bug**: Tab labels hardcoded in component, not using i18n
- **Fix**: Use `t('tabs.home')`, `t('tabs.shop')`, etc.

### P1-14: formatPrice Uses English Format [TEAM GAMMA]
- **File**: `src/utils/formatters.js`
- **Bug**: `formatPrice()` outputs `$1,234.56` format regardless of locale
- **Fix**: Use `Intl.NumberFormat` with locale-aware currency formatting

### P1-15: Binance HTTP 200 with Error Code Treated as Success [TEAM BETA]
- **File**: `src/services/binanceService.js`
- **Bug**: Binance returns HTTP 200 with `{ code: -1121, msg: "Invalid symbol" }`. Code treats as valid empty data
- **Fix**: Check for `code` field in response, throw on negative codes

---

## MEDIUM (P2) - FIX IN NEXT SPRINT

### P2-1: Fisher-Yates Shuffle Modulo Bias [TEAM ALPHA]
- tarotService.js uses `Math.random() * (i + 1)` with Math.floor, minor statistical bias
- Fix: Use crypto.getRandomValues for uniform distribution

### P2-2: Context Window Limited to 10 Messages [TEAM ALPHA]
- geminiService.js only sends last 10 messages as context
- Fix: Implement token counting, use max tokens instead of message count

### P2-3: No Transaction Support for Goal Creation [TEAM BETA]
- goalService.js creates goal row then uploads image separately. Partial failure = orphaned data
- Fix: Use Supabase RPC to wrap in transaction

### P2-4: Vision Board No Reminder System [TEAM BETA]
- Referenced in UI but no notification scheduling
- Fix: Implement with expo-notifications local scheduling

### P2-5: Binance Ticker Spam Unthrottled [TEAM BETA]
- Ticker updates fire on every message, causing re-renders
- Fix: Throttle to max 1 update per second per symbol

### P2-6: No Custom Fonts [TEAM GAMMA]
- System fonts only, inconsistent across devices
- Fix: Bundle Inter or similar font, load via expo-font

### P2-7: Date Formatting Hardcoded to vi-VN [TEAM GAMMA]
- Fix: Use i18n locale for date formatting

### P2-8: Number Formatting Inconsistent [TEAM GAMMA]
- Some use `toLocaleString()`, some manual formatting
- Fix: Centralize in formatters.js with locale support

### P2-9-18: Additional medium-priority items tracked in individual team backlogs

---

## LOW (P3) - NICE TO HAVE

### P3-1 through P3-11: Performance optimizations, code cleanup, additional test coverage

---

## DATABASE CHANGES NEEDED

### New RPC Functions:
1. `atomic_check_and_decrement_quota(p_user_id, p_feature, p_tier)` - Atomic quota check+decrement
2. `reset_user_quota(p_user_id)` - Reset quota on tier upgrade

### New RLS Policies:
1. `scanner_results` - Check tier allows scanner access
2. `chatbot_conversations` - Check tier allows chatbot access
3. `vision_goals` - Check tier allows vision board access + quota

### Migrations:
- All changes via `mcp__supabase__apply_migration`
- Test on branch first if available

---

## EXECUTION ORDER

1. **TEAM ALPHA starts**: P0-1 through P0-5 (security/API fixes first)
2. **TEAM BETA starts simultaneously**: P0-6 through P0-8 (data/storage fixes)
3. **TEAM GAMMA starts simultaneously**: P1-12 through P1-14 (UI/i18n)
4. All teams proceed to P1 items after P0 complete
5. Commit after each logical group of fixes
6. Build + TestFlight after all P0 + P1 complete

---

## BACKUP PLAN
- Before modifying any service: Copy current working version
- Before DB migrations: Test with `execute_sql` first
- Before RLS changes: Verify existing policies with `list_tables`
- If any fix breaks: Revert commit, investigate, try alternative approach
