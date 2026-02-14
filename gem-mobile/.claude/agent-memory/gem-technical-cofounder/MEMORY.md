# GEM Technical Co-Founder Memory

## Key File Paths
- **goalService.js**: `src/services/goalService.js` - Vision Board CRUD, image upload, XP, milestones
- **binanceService.js**: `src/services/binanceService.js` - REST API + legacy WebSocket for Binance
- **webSocketPoolService.js**: `src/services/scanner/webSocketPoolService.js` - Singleton pooled WS connection
- **patternCacheService.js**: `src/services/scanner/patternCacheService.js` - TTL-based pattern cache with dedup
- **useOptimizedScan.js**: `src/hooks/useOptimizedScan.js` - Scanner hook, uses patternCache.get()

## Architecture Notes
- binanceService has TWO WebSocket paths: main `ws` (multi-symbol stream) and `singleSymbolWs` (detail screen)
- webSocketPoolService is a separate singleton for the scanner, stores subs in `this.subscriptions` Map
- patternCacheService has two TTLs: DEFAULT_TTL (5min, static data) and SCANNER_TTL (60s, scanner data)
- Supabase Storage bucket for vision board images: `vision-board`, path pattern: `{userId}/{goalId}.{ext}`
- Image URL path extraction: split on `/vision-board/` and take index [1]

## Patterns & Conventions
- goalService uses `formatSupabaseError()` helper for error logging
- Binance error detection: check `data.code < 0` (negative = error, e.g., -1121 = Invalid symbol)
- Rate limit: 1200 req/min for Binance REST API, warn at 80%
- Vietnamese error messages with diacritics for user-facing strings

## Tier System Architecture
- **4 files define tiers**: `src/constants/tierFeatures.js`, `src/services/tierService.js`, `src/services/tierAccessService.js`, `src/config/tierAccess.js`
- Tier naming: FREE, TIER1/PRO, TIER2/PREMIUM, TIER3/VIP, ADMIN, MANAGER
- `tierFeatures.js` is at `src/constants/` (NOT `src/config/`)
- `tierAccessService.js` is singleton holding current tier state; `tierService.js` is static class querying DB
- `quotaService.js` has module-level cache with 30s TTL; `clearQuotaCache()` named export available

## Gemini API Pattern
- `geminiService.js` singleton routes through `${SUPABASE_URL}/functions/v1/gemini-proxy`
- `callEdgeFunction(params)` accepts `{ feature, messages, systemPrompt, metadata, generationConfig }`
- Returns `{ text, usage, rateLimit }`

## i18n Architecture
- i18n configured in `src/i18n/index.js` using i18next + react-i18next
- Three locales: vi.json, en.json, zh.json in `src/i18n/locales/`
- Default language: vi, fallback: vi
- `useSettings()` from SettingsContext provides `t()` (wraps useTranslation)
- Components can also use `useTranslation()` from react-i18next directly
- GlassBottomTab gets `t()` from useSettings; AccountScreen uses useTranslation directly
- Tab screens: `src/screens/tabs/` (HomeScreen, AccountScreen, ShopScreen, ScannerScreen, etc.)

## Formatting Architecture
- `formatters.js` has crypto formatPrice() (dynamic precision) and formatLocaleCurrency() (Intl-based)
- `SettingsContext.formatPrice()` handles VND/USD toggle for user-facing product prices
- formatTimestamp/formatRelativeTime/formatDate/formatNumber all accept locale parameter

## Bugs Fixed (Phase 3)
- P0-1/P0-2: ichingService & tarotService routed through edge function proxy (no more direct API key exposure)
- P0-3: quotaService.decrementQuotaManual has race condition note (needs atomic RPC)
- P0-4: quotaService error handler returns denied quotas (remaining: 0) instead of generous defaults
- P1-1: AbortController 30s timeout on AI API calls in ichingService & tarotService
- P1-5: Tier display labels aligned: TIER1=PRO, TIER2=PREMIUM, TIER3=VIP across all 4 tier files
- P1-6: Quota cache cleared on tier change in tierAccessService.setTier()
- P0-6: deleteGoal now cleans up storage images before DB delete
- P0-7: uploadGoalCoverImage validates MIME type and 5MB size limit
- P0-8: WebSocket pool reconnect captures symbol snapshot to survive subscription clearing
- P1-7: Rate limit tracking added to all binanceService REST API methods
- P1-9: Scanner-specific 60s TTL vs 5min static TTL in patternCacheService
- P1-15: All Binance REST methods check for negative error codes in HTTP 200 responses
