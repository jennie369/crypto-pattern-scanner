# PHASE 1D-E: Platform Integration Guide

## Overview

This guide covers the setup and integration for:
- **PHASE 1D**: Zalo OA (Official Account) Integration
- **PHASE 1E**: Facebook Messenger Integration

---

## PHASE 1D: Zalo OA Integration

### Step 1: Create Zalo OA Account

1. Go to [Zalo Official Account](https://oa.zalo.me/)
2. Register with your phone number
3. Create an OA for your business
4. Wait for approval (1-3 business days)

### Step 2: Create Zalo Mini App (Developer Console)

1. Go to [Zalo Developers](https://developers.zalo.me/)
2. Login with your Zalo account
3. Create a new application
4. Note down:
   - **App ID**: `ZALO_APP_ID`
   - **App Secret**: `ZALO_APP_SECRET`

### Step 3: Link OA to Application

1. In Zalo Developers console, go to your app
2. Navigate to "Zalo Official Account"
3. Link your OA to the application
4. Get your OA ID: `ZALO_OA_ID`

### Step 4: Generate Access Token

1. In the Zalo Developers console
2. Go to "Tools" > "API Explorer"
3. Generate OAuth 2.0 tokens:
   - **Access Token**: `ZALO_ACCESS_TOKEN` (expires in 1 month)
   - **Refresh Token**: `ZALO_REFRESH_TOKEN` (use to refresh access token)

### Step 5: Configure Webhook

1. In your application settings
2. Navigate to "Webhook"
3. Set Webhook URL: `https://gem-backend.railway.app/webhook/zalo`
4. Generate and note: `ZALO_WEBHOOK_SECRET`
5. Enable events:
   - `user_send_text` - User sends text message
   - `user_send_audio` - User sends voice message
   - `follow` - User follows OA
   - `unfollow` - User unfollows OA

### Step 6: Add Environment Variables

Add to your Railway environment:

```bash
ZALO_APP_ID=your_app_id
ZALO_APP_SECRET=your_app_secret
ZALO_OA_ID=your_oa_id
ZALO_ACCESS_TOKEN=your_access_token
ZALO_REFRESH_TOKEN=your_refresh_token
ZALO_WEBHOOK_SECRET=your_webhook_secret
```

### Step 7: Verify Webhook

Zalo will send a verification request. The backend handles this automatically:

```
POST /webhook/zalo
{
  "event_name": "verification",
  "app_id": "xxx",
  "timestamp": 1234567890
}
```

### Zalo API Reference

**Send Message:**
```python
POST https://openapi.zalo.me/v3.0/oa/message/cs
Headers:
  access_token: {ZALO_ACCESS_TOKEN}
Body:
  {
    "recipient": {"user_id": "xxx"},
    "message": {"text": "Hello"}
  }
```

**Send Typing Indicator:**
```python
POST https://openapi.zalo.me/v3.0/oa/message/cs
Headers:
  access_token: {ZALO_ACCESS_TOKEN}
Body:
  {
    "recipient": {"user_id": "xxx"},
    "sender_action": "typing"
  }
```

---

## PHASE 1E: Facebook Messenger Integration

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Select "Business" type
4. Add "Messenger" product

### Step 2: Create/Link Facebook Page

1. You need a Facebook Page for your bot
2. In App Dashboard > Messenger > Settings
3. Add your Page and generate token
4. Note: `FB_PAGE_ACCESS_TOKEN`

### Step 3: Configure Webhook

1. In App Dashboard > Messenger > Settings > Webhooks
2. Click "Add Callback URL"
3. Callback URL: `https://gem-backend.railway.app/webhook/messenger`
4. Create verify token: `FB_VERIFY_TOKEN` (e.g., `gem-master-verify-2024`)
5. Click "Verify and Save"

### Step 4: Subscribe to Events

After webhook verification, subscribe to:
- `messages` - Incoming messages
- `messaging_postbacks` - Button clicks
- `message_deliveries` - Delivery receipts (optional)
- `message_reads` - Read receipts (optional)

### Step 5: Get App Secret

1. In App Dashboard > Settings > Basic
2. Note: `FB_APP_SECRET`

### Step 6: Add Environment Variables

Add to your Railway environment:

```bash
FB_PAGE_ACCESS_TOKEN=your_page_access_token
FB_VERIFY_TOKEN=gem-master-verify-2024
FB_APP_SECRET=your_app_secret
```

### Step 7: Submit for Review (Production)

For production use beyond test users:
1. Go to App Review
2. Request permissions:
   - `pages_messaging` - Required for sending messages
3. Submit for review (may take 1-5 days)

### Facebook Graph API Reference

**Send Message:**
```python
POST https://graph.facebook.com/v21.0/me/messages
Headers:
  Authorization: Bearer {FB_PAGE_ACCESS_TOKEN}
Body:
  {
    "recipient": {"id": "xxx"},
    "message": {"text": "Hello"}
  }
```

**Send Typing Indicator:**
```python
POST https://graph.facebook.com/v21.0/me/messages
Headers:
  Authorization: Bearer {FB_PAGE_ACCESS_TOKEN}
Body:
  {
    "recipient": {"id": "xxx"},
    "sender_action": "typing_on"
  }
```

---

## Environment Variables Summary

### Required for Zalo OA

| Variable | Description |
|----------|-------------|
| `ZALO_APP_ID` | Your Zalo app ID |
| `ZALO_APP_SECRET` | Your Zalo app secret |
| `ZALO_OA_ID` | Your Official Account ID |
| `ZALO_ACCESS_TOKEN` | OAuth access token (refresh monthly) |
| `ZALO_REFRESH_TOKEN` | Used to refresh access token |
| `ZALO_WEBHOOK_SECRET` | Webhook verification secret |

### Required for Facebook Messenger

| Variable | Description |
|----------|-------------|
| `FB_PAGE_ACCESS_TOKEN` | Page access token (never expires) |
| `FB_VERIFY_TOKEN` | Webhook verify token (you create) |
| `FB_APP_SECRET` | App secret for signature verification |

---

## Testing

### Test Zalo OA

1. Follow your OA from Zalo app
2. Send a message
3. Check Railway logs for webhook events
4. Verify bot responds

### Test Facebook Messenger

1. During development, add test users in App Dashboard
2. Message your Page from a test user account
3. Check Railway logs for webhook events
4. Verify bot responds

### Webhook Debug Commands

```bash
# View Railway logs
railway logs

# Test Zalo webhook locally
curl -X POST http://localhost:8000/webhook/zalo \
  -H "Content-Type: application/json" \
  -d '{"event_name":"user_send_text","message":{"text":"hello"},"sender":{"id":"test123"}}'

# Test Messenger webhook locally
curl -X POST http://localhost:8000/webhook/messenger \
  -H "Content-Type: application/json" \
  -d '{"object":"page","entry":[{"messaging":[{"sender":{"id":"test"},"message":{"text":"hello"}}]}]}'
```

---

## Troubleshooting

### Zalo Issues

| Issue | Solution |
|-------|----------|
| Webhook not receiving events | Check OA is linked to app |
| 401 Unauthorized | Access token expired, refresh it |
| Rate limited | Max 10 req/sec, implement queue |

### Messenger Issues

| Issue | Solution |
|-------|----------|
| Webhook verification fails | Check verify token matches |
| 551 error | User blocked page or 24h window expired |
| Not receiving messages | Subscribe to `messages` event |

---

## Security Notes

1. **Never commit tokens to git** - Use Railway environment variables
2. **Verify webhook signatures** - Backend already implements this
3. **Refresh Zalo tokens monthly** - Set up a cron job or manual reminder
4. **Rate limiting** - Backend has built-in rate limiting

---

## Next Steps

After completing platform integration:

1. Run database migration: `supabase/migrations/20251227_phase1_platform_tables.sql`
2. Deploy to Railway (see DEPLOYMENT.md)
3. Test each platform
4. Monitor logs for errors
