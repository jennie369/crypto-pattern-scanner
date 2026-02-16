# Phase 10 — Biometric Identity + Push Notification Dedup Fix
## 5 Files Changed, 5 Root Causes
**Date**: 2026-02-17 | **Severity**: Medium (UX) + High (Notification spam)

---

## ISSUE 1: Biometric Login Shows No Account Identity

### Root Cause
`BiometricButton.checkBiometricStatus()` checks device support, enabled status, and biometric type name — but **never calls `biometricService.getStoredCredentials()`** to retrieve the stored email. The email IS stored in SecureStore (key `biometric_user_email`) by `autoEnableBiometric()` on first login, but BiometricButton never reads it.

Button text was: `"Đăng nhập bằng Nhận diện khuôn mặt"` — no identity shown.

### Fix (BiometricButton.js)
- Added `storedEmail` state
- In `checkBiometricStatus()`, call `biometricService.getStoredCredentials()` when biometric is enabled
- Mask email for privacy: `je****@gmail.com`
- Display masked email below button text

### Before/After
```
BEFORE: [Face ID icon] Đăng nhập bằng Nhận diện khuôn mặt

AFTER:  [Face ID icon] Đăng nhập bằng Nhận diện khuôn mặt
                        je****@gmail.com
```

---

## ISSUE 2: Duplicate Push Notifications + Only On App Open

### Root Cause 1: Two detection systems, zero coordination
- **Client monitoring** (`paperTradeService.startGlobalMonitoring`): 5s interval, ACTIVE-ONLY
- **Server cron** (`paper-trade-monitor-cron`): every 60s, always running
- Both independently detect the same liquidation/SL/TP and send separate notifications

### Root Cause 2: Two notification services for same event
- `paperTradeService.updatePrices()` calls `paperTradeNotificationService.notifySLHit()` → LOCAL + REMOTE push
- `OpenPositionsScreen` then calls `notificationService.sendStopLossHitNotification()` → another LOCAL push
- Result: 2 local + 1 remote = 3 notifications per event (4 for SL/TP)

### Root Cause 3: No dedup mechanism
- `paper_trade_notification_history` table exists but is never read for dedup
- No position-ID-based dedup existed

### Root Cause 4: Non-atomic close in cron
- Cron's `closePosition()` did `.eq('id', position.id)` without `.eq('status', 'OPEN')`
- Already-closed positions could be "re-closed" successfully, triggering another notification

### Why "only shows when app opens"
- Client monitoring is ACTIVE-ONLY (`if (!this.isAppActive) return;`)
- On resume, monitoring fires immediate check → detects stale events → notifications appear

---

## Fixes Applied (5 files)

### Fix A: Client dedup (paperTradeService.js)
Added `_notifiedPositionIds` Set. Before sending any SL/TP/liquidation notification, checks if position.id was already notified. Prevents the same position from triggering multiple notifications across consecutive `updatePrices()` calls.

### Fix B: Remove duplicate notification calls (OpenPositionsScreen.js)
Removed `notificationService.sendTakeProfitHitNotification()`, `sendStopLossHitNotification()`, and `sendLimitOrderFilledNotification()` calls from OpenPositionsScreen. Push notifications are now sent solely by `paperTradeService` → `paperTradeNotificationService`. OpenPositionsScreen still shows UI alerts (`showAlert()`).

### Fix C: Position-ID dedup in notification service (paperTradeNotificationService.js)
Added `_notifiedKeys` Set in `sendNotification()`. Keyed by `${positionId}_${type}` with 60s TTL auto-cleanup. Defense-in-depth — prevents duplicate even if caller dedup fails.

### Fix D: Atomic close in cron (paper-trade-monitor-cron/index.ts)
Added `.eq('status', 'OPEN')` and `.select('id')` to the UPDATE query. If 0 rows returned, position was already closed by client or previous cron run — skip notification.

### Fix E: Remove client remote push (paperTradeNotificationService.js)
Removed `sendRemotePush()` call from `sendNotification()`. Client now sends LOCAL push only. Remote push is handled exclusively by server cron via `send-paper-trade-push` edge function. This cleanly separates responsibilities:
- Client = local/foreground notifications
- Server = remote/background notifications

---

## Architecture After Fix

```
BEFORE (Phase 9):
  Client detects liquidation → LOCAL push + REMOTE push (via edge function)
  Server cron detects same  → REMOTE push (via edge function)
  OpenPositionsScreen       → another LOCAL push (via notificationService)
  = UP TO 4 NOTIFICATIONS PER EVENT

AFTER (Phase 10):
  Client detects liquidation → LOCAL push only (deduped by positionId)
  Server cron detects same  → REMOTE push only (atomic close prevents re-fire)
  OpenPositionsScreen       → UI alert only (no push)
  = EXACTLY 1 LOCAL + 1 REMOTE = 2 NOTIFICATIONS MAX
  (1 seen as banner when app active, 1 delivered via FCM/APNs when in background)
```

---

## Files Changed

| File | Change | Fix |
|------|--------|-----|
| `components/Auth/BiometricButton.js` | Added email display with masking | Issue 1 |
| `services/paperTradeService.js` | Added `_notifiedPositionIds` dedup Set | Fix A |
| `screens/Scanner/OpenPositionsScreen.js` | Removed duplicate notification calls, removed unused import | Fix B |
| `services/paperTradeNotificationService.js` | Position-ID dedup + removed client remote push | Fix C + E |
| `supabase/functions/paper-trade-monitor-cron/index.ts` | Atomic close with `.eq('status', 'OPEN')` | Fix D |

---

## Engineering Principles

### Rule 36: Single Notification Source Per Event
Never have two separate notification services or two separate detection systems send push notifications for the same event type. Designate one service as the single source and route all notifications through it.

### Rule 37: Client vs Server Notification Responsibility
Client sends LOCAL push only (foreground). Server sends REMOTE push only (background). Neither sends both types. This eliminates the cross-system duplication problem entirely.

---

## Test Scenarios

- [ ] Biometric button shows masked email after login
- [ ] Biometric button hides email when biometric disabled
- [ ] SL hit produces exactly 1 notification (not 2-4)
- [ ] TP hit produces exactly 1 notification
- [ ] Liquidation produces exactly 1 notification
- [ ] Server cron skips already-closed positions (no duplicate remote push)
- [ ] App in background → cron closes position → 1 remote push delivered
- [ ] App opens after cron close → no additional local push (position already removed)
- [ ] Limit order fill produces exactly 1 notification
