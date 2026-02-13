# 🚀 Paper Trading Deployment Checklist

Production deployment guide for GEM Trading Paper Trading System.

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (see [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md))
- [ ] No console errors in production build
- [ ] No console.log statements in production code (or use conditional logging)
- [ ] All TypeScript/ESLint errors resolved
- [ ] Code reviewed and approved

### Database
- [ ] Database migrations ready and tested in staging
- [ ] Backup current production database
- [ ] Indexes created for performance
- [ ] Row Level Security (RLS) policies verified
- [ ] Database connection limits configured

### Environment Variables
- [ ] All environment variables configured in production
- [ ] Supabase URL and keys updated
- [ ] Binance WebSocket API endpoint configured
- [ ] Feature flags set correctly

### Documentation
- [ ] [User Guide](./USER_GUIDE_PAPER_TRADING.md) complete and published
- [ ] [Developer Guide](./DEVELOPER_GUIDE_PAPER_TRADING.md) up to date
- [ ] API documentation current
- [ ] Changelog updated

---

## Deployment Steps

### Step 1: Database Migration

**Run migrations in order:**

```sql
-- Migration 1: Add order type columns
-- File: supabase/migrations/YYYYMMDD_add_order_types.sql

ALTER TABLE paper_trading_orders
  ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) DEFAULT 'market',
  ADD COLUMN IF NOT EXISTS limit_price DECIMAL(20, 2),
  ADD COLUMN IF NOT EXISTS stop_price DECIMAL(20, 2);

-- Add check constraint
ALTER TABLE paper_trading_orders
  ADD CONSTRAINT check_order_type
  CHECK (order_type IN ('market', 'limit', 'stop-limit'));
```

```sql
-- Migration 2: Add TP/SL columns
-- File: supabase/migrations/YYYYMMDD_add_tp_sl.sql

ALTER TABLE paper_trading_orders
  ADD COLUMN IF NOT EXISTS take_profit_price DECIMAL(20, 2),
  ADD COLUMN IF NOT EXISTS stop_loss_price DECIMAL(20, 2),
  ADD COLUMN IF NOT EXISTS parent_order_id UUID,
  ADD COLUMN IF NOT EXISTS linked_order_type VARCHAR(2);

-- Add foreign key
ALTER TABLE paper_trading_orders
  ADD CONSTRAINT fk_parent_order
  FOREIGN KEY (parent_order_id)
  REFERENCES paper_trading_orders(id);
```

```sql
-- Migration 3: Add TIF and Reduce-Only
-- File: supabase/migrations/YYYYMMDD_add_tif_reduce_only.sql

ALTER TABLE paper_trading_orders
  ADD COLUMN IF NOT EXISTS time_in_force VARCHAR(10) DEFAULT 'GTC',
  ADD COLUMN IF NOT EXISTS reduce_only BOOLEAN DEFAULT false;
```

```sql
-- Migration 4: Create indexes
-- File: supabase/migrations/YYYYMMDD_create_indexes.sql

CREATE INDEX IF NOT EXISTS idx_orders_user_status
  ON paper_trading_orders(user_id, status);

CREATE INDEX IF NOT EXISTS idx_orders_parent
  ON paper_trading_orders(parent_order_id);

CREATE INDEX IF NOT EXISTS idx_holdings_user
  ON paper_trading_holdings(user_id);

CREATE INDEX IF NOT EXISTS idx_accounts_user
  ON paper_trading_accounts(user_id);
```

**Verification:**
```sql
-- Check all migrations applied
SELECT * FROM supabase_migrations;

-- Verify table structure
\d paper_trading_orders
\d paper_trading_holdings
\d paper_trading_accounts
```

---

### Step 2: Frontend Build

```bash
cd frontend

# Install dependencies
npm install

# Run production build
npm run build

# Verify build output
ls -la dist/
```

**Build Checklist:**
- [ ] Build completes without errors
- [ ] dist/ folder generated
- [ ] Asset files optimized
- [ ] Source maps generated (for debugging)

---

### Step 3: Deploy Frontend

**Option A: Vercel**
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Deploy
vercel --prod

# Verify deployment
curl https://your-domain.vercel.app
```

**Option B: Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Verify
curl https://your-domain.netlify.app
```

**Option C: Manual Upload**
1. Upload `dist/` folder to web server
2. Configure server to serve index.html for all routes
3. Set up HTTPS

---

### Step 4: Verify Deployment

**Smoke Tests:**

1. **Page Load:**
   - [ ] Open production URL
   - [ ] No 404 errors
   - [ ] Assets load correctly (CSS, JS, images)

2. **Authentication:**
   - [ ] Login works
   - [ ] User session persists
   - [ ] Logout works

3. **Paper Trading Panel:**
   - [ ] Panel opens when clicking "Paper Trade"
   - [ ] Current price loads from WebSocket
   - [ ] Order type tabs work
   - [ ] All inputs editable

4. **Place Order:**
   - [ ] Market order executes immediately
   - [ ] Limit order creates as pending
   - [ ] TP/SL orders created
   - [ ] Toast notifications show

5. **Open Positions:**
   - [ ] Widget displays positions
   - [ ] P&L updates real-time
   - [ ] Close Position works
   - [ ] Sort dropdown functions

6. **Database:**
   - [ ] Orders save correctly
   - [ ] Holdings update
   - [ ] Balance updates

---

### Step 5: Monitor for Errors

**Check Logs:**

```bash
# Supabase logs
supabase functions logs

# Server logs (if applicable)
tail -f /var/log/nginx/error.log

# Browser console
# Open DevTools → Console → Check for errors
```

**Monitoring Checklist:**
- [ ] No 500 errors
- [ ] WebSocket connections stable
- [ ] Database queries performant
- [ ] No memory leaks (check DevTools Performance)

---

### Step 6: Post-Deployment

**User Communication:**
- [ ] Send announcement email/notification
- [ ] Update documentation links
- [ ] Post changelog on website/blog

**Analytics:**
- [ ] Verify analytics tracking (if configured)
- [ ] Monitor user engagement
- [ ] Track error rates

**Performance:**
- [ ] Run Lighthouse audit
- [ ] Check page load times
- [ ] Verify Core Web Vitals

---

## Rollback Plan

**If critical issues found:**

### Step 1: Revert Frontend Deployment

**Vercel:**
```bash
vercel rollback
```

**Netlify:**
```bash
netlify rollback
```

**Manual:**
1. Re-deploy previous build
2. Clear CDN cache

### Step 2: Rollback Database (if needed)

**⚠️ USE WITH CAUTION - Data loss possible!**

```sql
-- Rollback Migration Example
-- (Create specific rollback scripts for each migration)

-- Remove columns added in migration
ALTER TABLE paper_trading_orders
  DROP COLUMN IF EXISTS order_type,
  DROP COLUMN IF EXISTS limit_price,
  DROP COLUMN IF EXISTS stop_price,
  DROP COLUMN IF EXISTS take_profit_price,
  DROP COLUMN IF EXISTS stop_loss_price,
  DROP COLUMN IF EXISTS parent_order_id,
  DROP COLUMN IF EXISTS linked_order_type,
  DROP COLUMN IF EXISTS time_in_force,
  DROP COLUMN IF EXISTS reduce_only;

-- Restore backup
-- pg_restore -d database_name backup_file.dump
```

### Step 3: Communicate

- [ ] Notify users of rollback
- [ ] Explain issue and timeline
- [ ] Provide workaround if available

### Step 4: Fix and Re-deploy

- [ ] Fix issues in staging environment
- [ ] Re-run full test suite
- [ ] Deploy when ready

---

## Environment-Specific Configs

### Production
```env
VITE_SUPABASE_URL=https://pgfkbcnzqozzkohwbgbk.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_key
VITE_BINANCE_WS_URL=wss://stream.binance.com:9443/ws
VITE_ENV=production
```

### Staging
```env
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_staging_key
VITE_BINANCE_WS_URL=wss://testnet.binance.vision/ws
VITE_ENV=staging
```

### Development
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_local_key
VITE_BINANCE_WS_URL=wss://stream.binance.com:9443/ws
VITE_ENV=development
```

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] API keys not exposed in client code
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Rate limiting configured
- [ ] Input validation on all forms
- [ ] SQL injection prevention
- [ ] XSS prevention

---

## Performance Targets

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Page Load (FCP) | < 1.5s | ____ | ⏳ |
| Page Load (LCP) | < 2.5s | ____ | ⏳ |
| Trade Execution | < 1s | ____ | ⏳ |
| WebSocket Reconnect | < 3s | ____ | ⏳ |
| UI Response | < 100ms | ____ | ⏳ |

---

## Final Sign-Off

**Deployment approved by:**

- [ ] **Product Owner:** _____________________________ Date: ________
- [ ] **Lead Developer:** ___________________________ Date: ________
- [ ] **DevOps:** ____________________________________ Date: ________
- [ ] **QA:** ________________________________________ Date: ________

**Deployment Status:** ⏳ Pending | ✅ Deployed | ❌ Rolled Back

**Deployment Date:** ____________

**Production URL:** https://___________________________

---

## Post-Deployment Monitoring

**Week 1:**
- Monitor error logs daily
- Track user feedback
- Check performance metrics
- Watch for edge cases

**Week 2-4:**
- Weekly error review
- User satisfaction survey
- Performance optimization
- Feature usage analytics

---

## Support Contacts

- **On-call Developer:** [Name] - [Phone/Email]
- **DevOps:** [Name] - [Phone/Email]
- **Product Owner:** [Name] - [Phone/Email]

---

## 🎉 Deployment Complete!

Congratulations! Paper Trading System is now live in production.

**Next Steps:**
1. Monitor metrics
2. Gather user feedback
3. Plan next iteration
4. Celebrate! 🚀

---

*Last updated: 2025-01-20*
*Version: 1.0*
