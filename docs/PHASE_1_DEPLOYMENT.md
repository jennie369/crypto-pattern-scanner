# PHASE 1F: Deployment Guide

## Overview

This guide covers deploying the GEM Master FastAPI Backend to Railway.

---

## Prerequisites

1. [Railway Account](https://railway.app/) (free tier available)
2. [Railway CLI](https://docs.railway.app/develop/cli) installed
3. Git repository with backend code
4. Supabase project with migration applied

---

## Step 1: Install Railway CLI

```bash
# macOS
brew install railway

# Windows (PowerShell)
iwr https://raw.githubusercontent.com/railwayapp/cli/master/install.ps1 -useb | iex

# Linux
curl -sSL https://railway.app/install.sh | sh
```

## Step 2: Login to Railway

```bash
railway login
```

## Step 3: Initialize Project

```bash
cd backend
railway init
```

Select:
- Create new project
- Name: `gem-backend`

## Step 4: Add Redis Plugin

```bash
railway add
```

Select "Redis" from the list.

## Step 5: Set Environment Variables

```bash
# Core Settings
railway variables set APP_NAME="GEM Master Backend"
railway variables set ENVIRONMENT="production"
railway variables set DEBUG="false"

# Supabase
railway variables set SUPABASE_URL="https://pgfkbcnzqozzkohwbgbk.supabase.co"
railway variables set SUPABASE_ANON_KEY="your_anon_key"
railway variables set SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
railway variables set SUPABASE_JWT_SECRET="your_jwt_secret"

# AI Services
railway variables set GEMINI_API_KEY="your_gemini_key"
railway variables set OPENAI_API_KEY="your_openai_key"

# Zalo OA (optional - add when ready)
railway variables set ZALO_APP_ID=""
railway variables set ZALO_APP_SECRET=""
railway variables set ZALO_OA_ID=""
railway variables set ZALO_ACCESS_TOKEN=""
railway variables set ZALO_REFRESH_TOKEN=""
railway variables set ZALO_WEBHOOK_SECRET=""

# Facebook Messenger (optional - add when ready)
railway variables set FB_PAGE_ACCESS_TOKEN=""
railway variables set FB_VERIFY_TOKEN="gem-master-verify"
railway variables set FB_APP_SECRET=""

# Rate Limits
railway variables set WS_MAX_CONNECTIONS_PER_USER="5"
railway variables set WS_MESSAGE_RATE_LIMIT="30"
railway variables set API_RATE_LIMIT="100"
```

**Note:** Redis URL is automatically set by the Redis plugin.

## Step 6: Deploy

```bash
railway up
```

## Step 7: Get Deployment URL

```bash
railway domain
```

This will output something like: `gem-backend-production.up.railway.app`

Custom domain:
```bash
railway domain add gem-backend.yourdomain.com
```

## Step 8: Verify Deployment

```bash
# Health check
curl https://gem-backend-production.up.railway.app/health

# Detailed health check
curl https://gem-backend-production.up.railway.app/health/detailed
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-12-27T10:00:00Z"
}
```

---

## Step 9: Apply Database Migration

Run the migration in Supabase:

```bash
# Option 1: Via Supabase CLI
cd ..
supabase db push

# Option 2: Via SQL Editor in Supabase Dashboard
# Copy contents of supabase/migrations/20251227_phase1_platform_tables.sql
# Paste and run in SQL Editor
```

---

## Step 10: Update Mobile App Config

Update `gem-mobile/src/config/api.js`:

```javascript
export const API_CONFIG = {
  BACKEND_URL: 'https://gem-backend-production.up.railway.app',
  BACKEND_WS_URL: 'wss://gem-backend-production.up.railway.app/ws/chat',
  // ... rest of config
};
```

Or use environment variables in your mobile build.

---

## Monitoring & Logs

### View Logs

```bash
# Stream logs
railway logs

# View last 100 lines
railway logs --tail 100
```

### Railway Dashboard

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your project
3. View metrics, logs, and settings

---

## Scaling

Railway automatically scales based on usage. For custom scaling:

1. Go to Railway Dashboard
2. Select your service
3. Settings > Deploy > Resources
4. Adjust CPU and Memory

Free tier limits:
- 500 MB RAM
- Shared CPU
- $5/month credit

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check Dockerfile syntax |
| Redis connection error | Verify Redis plugin is added |
| WebSocket fails | Ensure wss:// protocol is used |
| 502 Bad Gateway | Check app logs for errors |
| Memory exceeded | Optimize code or upgrade plan |

### Debug Commands

```bash
# Check environment variables
railway variables

# Restart service
railway restart

# Connect to shell
railway shell

# Check Redis
railway connect redis
```

---

## CI/CD (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Railway CLI
        run: npm i -g @railway/cli

      - name: Deploy
        run: |
          cd backend
          railway up --service gem-backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

Get RAILWAY_TOKEN:
```bash
railway login --browserless
```

Add to GitHub Secrets.

---

## Rollback

```bash
# View deployments
railway deployments

# Rollback to previous
railway rollback
```

---

## Cost Estimation

| Resource | Free Tier | Paid |
|----------|-----------|------|
| Compute | $5/month credit | $0.000463/vCPU-min |
| Memory | Included | $0.000231/GB-min |
| Redis | $5/month | $5/month |
| Network | 100GB/month | $0.10/GB |

Estimated monthly cost for moderate usage: **$5-15/month**

---

## Security Checklist

- [ ] Environment variables set (not in code)
- [ ] HTTPS enforced (Railway auto-provides)
- [ ] Rate limiting enabled
- [ ] JWT secret is strong
- [ ] Webhook secrets configured
- [ ] CORS configured properly

---

## Post-Deployment Testing

### Test WebSocket

```javascript
// Browser console or Node.js
const ws = new WebSocket('wss://gem-backend-production.up.railway.app/ws/chat?token=YOUR_JWT_TOKEN');

ws.onopen = () => {
  console.log('Connected');
  ws.send(JSON.stringify({ type: 'chat', content: 'Hello' }));
};

ws.onmessage = (e) => {
  console.log('Received:', JSON.parse(e.data));
};
```

### Test API Endpoints

```bash
# Health
curl https://gem-backend-production.up.railway.app/health

# Zalo webhook (verification)
curl https://gem-backend-production.up.railway.app/webhook/zalo

# Messenger webhook (verification)
curl "https://gem-backend-production.up.railway.app/webhook/messenger?hub.mode=subscribe&hub.verify_token=gem-master-verify&hub.challenge=test123"
```

---

## Summary

After completing these steps:

1. Backend is live on Railway
2. WebSocket ready for mobile app
3. Webhooks ready for Zalo/Messenger
4. Database migration applied
5. Mobile app configured to use new backend

**Next steps:**
- Complete Zalo OA setup (see PLATFORM_INTEGRATION_GUIDE.md)
- Complete Facebook Messenger setup
- Test all features end-to-end
- Monitor logs for issues
