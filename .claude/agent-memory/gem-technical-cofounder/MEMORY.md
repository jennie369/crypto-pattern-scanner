# GEM Technical Co-Founder Memory

## Architecture

### Layout System
- GlassBottomTab is `position: absolute` with iOS `bottom: 6`, Android `bottom: insets.bottom || 16`
- Tab bar pill height: 76px (`Tokens.sizes.barHeight`)
- GemMaster chat input is absolutely positioned, `bottom` controlled by `gemMasterLayout.js` constants
- iOS vs Android: Tab bar occupies different vertical space (iOS ~82px, Android ~100px from screen bottom)
- All layout constants for GemMaster keyboard positioning in `gem-mobile/src/constants/gemMasterLayout.js`
- SafeAreaView in GemMasterScreen uses `edges={['top']}` only (no bottom inset)

### Auth & Session
- AuthContext (`gem-mobile/src/contexts/AuthContext.js`) is the single source of auth truth
- `refreshProfile()` method added for app resume re-hydration (2026-02-09)
- AppState listener in AuthContext refreshes session + profile after 60s background threshold
- GemMasterScreen does NOT use AuthContext - has its own local user/tier/quota state via `supabase.auth.getUser()`
- AccountScreen uses `useAuth()` for `isAdmin` but fetches its own profile via `forumService.getUserProfile()`
- accountCache in AccountScreen has 5-min CACHE_DURATION, invalidated by FORCE_REFRESH_EVENT

### App Resume System
- `useGlobalAppResume` in AppNavigator handles: WebSocket reconnect, cache clear, loading state reset
- `useAppResume.js` exports `registerResumeCallback` for global resume hooks
- `FORCE_REFRESH_EVENT` from `loadingStateManager.js` is emitted on resume > 1 min
- ForumScreen and AccountScreen listen for FORCE_REFRESH_EVENT to invalidate caches

## Common Bug Patterns
- iOS spacing: GlassBottomTab position differs from Android, any hardcoded `bottom` values must be Platform-aware
- Auth desync: Profile/role/quota fetched only on mount, not refreshed on app resume -> stale state after background
- GemMasterScreen maintains its own auth state independently of AuthContext -> can get out of sync
- accountCache prevents re-fetch even when data is stale -> needs FORCE_REFRESH_EVENT invalidation

## Files Modified Together
- `gemMasterLayout.js` + `GemMasterScreen.js` (layout constants used in screen)
- `AuthContext.js` + `AppNavigator.js` + `useAppResume.js` (auth lifecycle chain)
- `GlassBottomTab.js` + `TabBarContext.js` + `gemMasterLayout.js` (tab bar positioning chain)
