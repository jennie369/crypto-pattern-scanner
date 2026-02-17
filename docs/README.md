# GEM Mobile

React Native (Expo SDK 54) mobile app for the GEM trading ecosystem.

## Architecture

```
gem-mobile/src/
├── contexts/          # 17 React Contexts (state management)
│   ├── AuthContext.js          # Auth state, session management (741 lines)
│   ├── ScannerContext.js       # Scan results, zones, selected TF/coin
│   └── ...                     # Theme, Notifications, Language, etc.
├── services/
│   ├── paperTradeService.js    # Paper trading engine (singleton)
│   ├── binanceService.js       # Binance Futures API + WebSocket
│   ├── patternDetection.js     # Pattern detection engine (24+ patterns)
│   ├── zoneManager.js          # Zone creation from patterns
│   ├── scanner/                # Scanner sub-services
│   │   ├── patternEnricherService.js   # Field name normalization
│   │   └── webSocketPoolService.js     # WebSocket connection pool
│   └── adminAI/                # Admin AI assistant services
│       ├── adminAIMarketService.js     # Market data for AI
│       └── adminAIContextService.js    # Context building for AI
├── screens/
│   ├── Scanner/                # Scanner tab (scan, chart, patterns)
│   ├── PaperTrade/             # Paper trading screens
│   └── ...                     # Home, Shop, Account, etc.
├── components/
│   └── Trading/                # PaperTradeModalV2, TradingChart, etc.
├── navigation/                 # React Navigation (6 tabs)
└── utils/                      # Tokens, helpers, formatters
```

### Key Design Decisions

- **State**: 17 React Contexts, no Redux/Zustand. AsyncStorage for persistence.
- **API**: Binance Futures (`fapi.binance.com/fapi/v1`) for all market data.
- **Backend**: Supabase (Auth, Postgres, Realtime, Edge Functions, RPC).
- **Trading Engine**: `paperTradeService.js` singleton handles order lifecycle, position monitoring (5s interval), SL/TP/liquidation checks, PNL calculation.
- **Order Types**: MARKET (instant fill) and PENDING (limit + stop orders). Fill direction determined by `createdAtMarketPrice` field.

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or Expo Go on device)

### Setup

```bash
cd gem-mobile
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `EXPO_PUBLIC_GEMINI_API_KEY` | Yes | Google Gemini API key for AI features |

### Run

```bash
npx expo start
```

## Data Flow

### Scanner Pipeline

```
User clicks "Scan"
  → patternDetection.detectPatterns(symbol, timeframe, tier)
  → Each detector (DP, FTR, FL, QM, H&S, etc.) runs on candle data
  → Results enriched via patternEnricherService (field normalization)
  → Zones created via zoneManager._patternToZone()
  → Stored in ScannerContext (patterns[], zones[])
  → Rendered in ScannerScreen → CoinAccordion → PatternCard
```

### Paper Trade Order Lifecycle

```
User clicks "Paper Trade" on pattern
  → PaperTradeModalV2 opens (entry/SL/TP pre-filled)
  → User confirms → paperTradeService.openPosition()
  → If entry ≈ market (0.1%): MARKET order → status: OPEN
  → If entry ≠ market: PENDING order → status: PENDING
  → Monitoring loop (every 5s):
      → _fetchCurrentPrices() from Binance Futures
      → checkPendingOrders(): fill if price reaches entry
      → updatePrices(): check SL/TP/liquidation, update PNL
      → Auto-close on hit → push notification
```

## Fix History

| Phase | Commit | Description | Plan |
|-------|--------|-------------|------|
| 1 | `2e4719c` | 34 fixes: notifications, auth, trading, state leaks | `gem-mobile/MASTER_FIX_PLAN.md` |
| 2 | — | 32 fixes: Shopify, security/RLS, courses, offline, perf | `gem-mobile/MASTER_FIX_PLAN_PHASE2.md` |
| 3 | `68af8ad` | 52 issues: chatbot API security, tier enforcement, quotas, i18n | `PHASE_3_MASTER_PLAN.md` |
| 4 | — | 12 issues: ritual system, chat, vision board, notifications, KOL | `PHASE_4_MASTER_PLAN.md` |
| 5 | `49399e7` | 13 critical: black screen, boost analytics, referral codes, scanner crash | `PHASE_5_MASTER_PLAN.md` |
| 6 | `075aa4c` | 5 fixes: scanner state wipe, PENDING orders, TP mismatch, PNL, API URL | `gem-mobile/PHASE_6_MASTER_PLAN.md` |
| 7 | — | 5 fixes: admin tier on resume, AI typing dots, chatbot keyword collision, ritual nav, deep links | `PHASE_7_MASTER_PLAN.md` |
| 7.5 | `e0633bd` | Auth profile fetch error handling + retry to prevent silent null cascade | `docs/feature-phase7.5-auth-profile-fix.md` |
| 7.75 | — | Pending orders disappearing fix (paper_pending_orders as single source of truth) | `docs/feature-phase7.75-resume-pending-fix.md` |
| 7.8 | `5966896` | App resume deadlock definitive fix: 27 files, 3 root causes, AbortController on 17 Binance fetches, FORCE_REFRESH on 15 screens | `docs/feature-phase7.8-resume-deadlock-fix.md` |
| 9 | — | Startup freeze fix: broken watchdog, edge function timeout, resume sequence timeout, defensive cleanup (6 files, 4 root causes) | `docs/feature-phase9-startup-freeze-fix.md` |
| 10 | — | Biometric identity display + push notification dedup (5 files, 5 root causes) | `docs/feature-phase10-biometric-push-fix.md` |
| 11 | — | RLS vulnerability fix: 24 misconfigured policies + 20 tables without RLS (43 tables, 2 migrations) | `supabase/migrations/20260217_rls_fix_service_role_policies.sql` |
| 12 | — | 62 fixes: COALESCE type mismatch, 5 RPC name mismatches, AbortController on 38 fetch calls, `follows` table cleanup in 4 services, edge function auth+SDK updates (8 functions), 2 missing SQL functions created | `docs/Troubleshooting_Tips.md` Rules 42-46 |

## Documentation

| Doc | Description |
|-----|-------------|
| `docs/feature-scanner-papertrade-engine.md` | Phase 6 architectural decisions and trade-offs |
| `docs/feature-phase7-fixes.md` | Phase 7 architectural decisions and fix details |
| `docs/feature-phase7.8-resume-deadlock-fix.md` | Phase 7.8 resume deadlock fix (27 files, 3 root causes) |
| `docs/feature-phase9-startup-freeze-fix.md` | Phase 9 startup freeze fix (6 files, 4 root causes) |
| `docs/feature-phase10-biometric-push-fix.md` | Phase 10 biometric identity + push dedup (5 files, 5 root causes) |
| `docs/Troubleshooting_Tips.md` | 46 generalized engineering rules from Phase 1-12 bugs |
| `docs/SCANNER_TRADING_FEATURE_SPEC.md` | Complete Scanner/Trading feature specification (v4.1) |

## Database Migrations

### RLS Security Fix (2026-02-17)

Two migrations were deployed to fix critical RLS vulnerabilities:

1. **`20260217_rls_fix_service_role_policies`** — Fixed 24 policies on 23 tables that had `TO {public}` instead of `TO service_role`, allowing any user to read/write all data. Added user-facing policies where missing.

2. **`20260217_rls_enable_missing_tables`** — Enabled RLS on 20 tables that had zero access control. Added `service_role ALL` + user policies (own-data SELECT/INSERT) + catalog policies (authenticated SELECT).

**Verification queries** (should both return 0 rows):
```sql
-- No {public} write policies with USING(true)
SELECT tablename, policyname FROM pg_policies
WHERE schemaname='public' AND qual='true'
AND roles='{public}' AND cmd IN ('ALL','UPDATE','INSERT','DELETE');

-- All tables have RLS enabled
SELECT tablename FROM pg_tables
WHERE schemaname='public' AND rowsecurity=false;
```

## Important Conventions

- **Table name**: Always `profiles` (NOT `users`) — all app code reads `profiles`
- **API**: Always Binance Futures API (`fapi.binance.com`), never Spot (`api.binance.com`)
- **Affiliate ID**: Use `affiliate.user_id` (auth UUID), not `affiliate.id` (table UUID)
- **Notifications**: Only ONE `setNotificationHandler` call (in InAppNotificationContext)
- **Module caches**: Must clear on logout (forumCache, notificationsCache, etc.)
- **RLS**: Every table must have RLS enabled + `service_role ALL` policy + user policies for client-accessible tables
- **RPC names**: App code must call exact function names from live DB — verify with `SELECT proname FROM pg_proc`
- **AbortController**: EVERY `fetch()` to external API must have AbortController timeout — not just Binance
- **Edge functions**: Use `SERVICE_ROLE_KEY` (not `ANON_KEY`) and `@supabase/supabase-js@2` (not pinned versions)
- **`follows` table**: Does NOT exist. Use `user_follows` or degrade gracefully with empty arrays
