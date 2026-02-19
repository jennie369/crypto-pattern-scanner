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

### Auth & Session Architecture

```
supabase.js
├── SecureStorageAdapter       # AES-256-CTR encryption (key in SecureStore, ciphertext in AsyncStorage)
├── JWT Freshness Guard        # Pre-request JWT exp check + auto-refresh (Rule 59)
│   ├── _decodeJwtExp()        # Decode JWT exp claim (base64url, no library)
│   ├── _ensureSessionFresh()  # Cached exp fast path + singleton refresh promise
│   └── Global fetch wrapper   # Intercepts /rest/v1/ and /functions/v1/ requests
└── Tiered fetch timeouts      # /rest/v1/ 8s, /auth/v1/ 8s, /functions/v1/ 30s

AppResumeManager.js (singleton)
├── AppState listener          # background → active resume sequence
├── Stuck-state timer (15s)    # Resets loading states stuck > 15s
├── Health check (60s)         # JWT freshness check + Supabase connectivity
└── Full recovery              # Session refresh → cache clear → WS reconnect → FORCE_REFRESH
```

- **Token storage**: Hybrid AES-256-CTR — random 256-bit key in SecureStore (hardware keychain), encrypted session ciphertext in AsyncStorage (no size limit). Auto-migrates unencrypted sessions on first read.
- **JWT freshness**: `autoRefreshToken` timer is unreliable on mobile (screen-off kills JS timers). The global fetch wrapper validates JWT `exp` before every data request. Uses cached `exp` (sub-ms) and singleton promise to dedup concurrent refreshes.
- **Session refresh**: `getSession()` (local storage read) everywhere, NOT `getUser()` (network API call). Prevents hangs on cold Supabase connections.

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

## Documentation

| Doc | Description |
|-----|-------------|
| `docs/feature-scanner-papertrade-engine.md` | Phase 6 architectural decisions and trade-offs |
| `docs/Troubleshooting_Tips.md` | 59 generalized engineering rules from Phase 1-14 bugs |
| `docs/SCANNER_TRADING_FEATURE_SPEC.md` | Complete Scanner/Trading feature specification (v4.1) |

## Important Conventions

- **Table name**: Always `profiles` (NOT `users`) — all app code reads `profiles`
- **API**: Always Binance Futures API (`fapi.binance.com`), never Spot (`api.binance.com`)
- **Affiliate ID**: Use `affiliate.user_id` (auth UUID), not `affiliate.id` (table UUID)
- **Notifications**: Only ONE `setNotificationHandler` call (in InAppNotificationContext)
- **Module caches**: Must clear on logout (forumCache, notificationsCache, etc.)
- **Auth reads**: Always `getSession()` (local storage), never `getUser()` (network call)
- **JWT freshness**: Handled by global fetch wrapper — never rely on `autoRefreshToken` alone on mobile
