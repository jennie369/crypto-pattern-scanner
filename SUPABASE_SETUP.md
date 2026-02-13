# 🚀 Supabase Backend Setup - GEM Trading Platform

## 📋 Overview

This guide will help you set up the Supabase backend for the GEM Trading Platform with:
- ✅ User Authentication
- ✅ FREE Tier (5 scans/day)
- ✅ Premium Tiers (Unlimited scans)
- ✅ Scan History Tracking
- ✅ Quota Management

---

## 🔧 STEP 1: Create Supabase Project

1. Visit [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - **Project Name**: `gem-trading-platform`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: `Singapore (ap-southeast-1)` (closest to Vietnam)
   - **Pricing Plan**: Free (for testing)

5. Wait 3-5 minutes for project provisioning

---

## 🔑 STEP 2: Get Your Credentials

After project is created:

1. Go to **Settings** → **API**
2. Find and copy:
   - **Project URL** (`https://xxxxx.supabase.co`)
   - **Anon/Public Key** (`eyJhbGc...`)

---

## 📦 STEP 3: Configure Frontend

### 3.1 Install Dependencies (Already Done)
```bash
npm install @supabase/supabase-js
```

### 3.2 Create .env.local File

1. Copy the example file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-key-here
```

3. **IMPORTANT**: Make sure `.env.local` is in `.gitignore`!

---

## 🗄️ STEP 4: Deploy Database Schema

1. Go to Supabase Dashboard → **SQL Editor**
2. Click "New Query"
3. Copy and paste this complete schema:

```sql
-- =============================================
-- GEM TRADING PLATFORM - DATABASE SCHEMA
-- Version: 1.0
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE 1: USERS
-- Stores user profile and tier information
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'tier1', 'tier2', 'tier3')),
  tier_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =============================================
-- TABLE 2: DAILY_SCAN_QUOTA
-- Tracks FREE tier daily scan limits
-- =============================================
CREATE TABLE IF NOT EXISTS daily_scan_quota (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scan_count INT DEFAULT 0 CHECK (scan_count >= 0),
  max_scans INT DEFAULT 5,
  last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_quota_user_id ON daily_scan_quota(user_id);

-- =============================================
-- TABLE 3: SCAN_HISTORY
-- Stores user's pattern scanning history
-- =============================================
CREATE TABLE IF NOT EXISTS scan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  symbols TEXT[] NOT NULL,
  patterns_found JSONB DEFAULT '{}'::jsonb,
  timeframe TEXT NOT NULL,
  tier_at_scan TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_created_at ON scan_history(created_at DESC);

-- =============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_scan_quota ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Users table policies
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Quota table policies
CREATE POLICY "Users can read own quota"
  ON daily_scan_quota FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own quota"
  ON daily_scan_quota FOR UPDATE
  USING (auth.uid() = user_id);

-- Scan history policies
CREATE POLICY "Users can read own scan history"
  ON scan_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan history"
  ON scan_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scan history"
  ON scan_history FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function: Check and increment scan quota
CREATE OR REPLACE FUNCTION check_and_increment_quota(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quota_record RECORD;
  v_result JSONB;
  v_current_date DATE;
BEGIN
  -- Get current date in Ho Chi Minh timezone
  v_current_date := CURRENT_DATE AT TIME ZONE 'Asia/Ho_Chi_Minh';

  -- Get or create quota record
  SELECT * INTO v_quota_record
  FROM daily_scan_quota
  WHERE user_id = p_user_id;

  -- If quota doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO daily_scan_quota (user_id, scan_count, max_scans, last_reset_at)
    VALUES (p_user_id, 0, 5, NOW())
    RETURNING * INTO v_quota_record;
  END IF;

  -- Reset if new day
  IF DATE(v_quota_record.last_reset_at AT TIME ZONE 'Asia/Ho_Chi_Minh') < v_current_date THEN
    UPDATE daily_scan_quota
    SET scan_count = 0, last_reset_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO v_quota_record;
  END IF;

  -- Check if quota exceeded
  IF v_quota_record.scan_count >= v_quota_record.max_scans THEN
    v_result := jsonb_build_object(
      'can_scan', false,
      'remaining', 0,
      'max_scans', v_quota_record.max_scans,
      'message', 'Daily scan limit reached'
    );
    RETURN v_result;
  END IF;

  -- Increment scan count
  UPDATE daily_scan_quota
  SET scan_count = scan_count + 1
  WHERE user_id = p_user_id;

  v_result := jsonb_build_object(
    'can_scan', true,
    'remaining', v_quota_record.max_scans - v_quota_record.scan_count - 1,
    'max_scans', v_quota_record.max_scans,
    'message', 'Scan allowed'
  );

  RETURN v_result;
END;
$$;

-- Function: Get user quota status
CREATE OR REPLACE FUNCTION get_quota_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quota_record RECORD;
  v_result JSONB;
  v_current_date DATE;
BEGIN
  v_current_date := CURRENT_DATE AT TIME ZONE 'Asia/Ho_Chi_Minh';

  SELECT * INTO v_quota_record
  FROM daily_scan_quota
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    v_result := jsonb_build_object(
      'scan_count', 0,
      'max_scans', 5,
      'remaining', 5,
      'can_scan', true
    );
    RETURN v_result;
  END IF;

  -- Reset if new day
  IF DATE(v_quota_record.last_reset_at AT TIME ZONE 'Asia/Ho_Chi_Minh') < v_current_date THEN
    v_quota_record.scan_count := 0;
  END IF;

  v_result := jsonb_build_object(
    'scan_count', v_quota_record.scan_count,
    'max_scans', v_quota_record.max_scans,
    'remaining', v_quota_record.max_scans - v_quota_record.scan_count,
    'can_scan', v_quota_record.scan_count < v_quota_record.max_scans
  );

  RETURN v_result;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INITIAL DATA (Optional)
-- =============================================

-- Create test user quota (will be auto-created on first scan)
-- No need to insert manually, the app will handle it

COMMIT;
```

4. Click **Run** or press `Ctrl+Enter`
5. Check for success message: "Success. No rows returned"

---

## ✅ STEP 5: Verify Installation

### 5.1 Check Tables
Go to **Table Editor** and verify these tables exist:
- ✅ `users`
- ✅ `daily_scan_quota`
- ✅ `scan_history`

### 5.2 Check RLS Policies
Go to **Authentication** → **Policies**
- Each table should have policies enabled

### 5.3 Test Authentication
1. Go to **Authentication** → **Users**
2. Click "Add User" and create a test user
3. Verify user appears in the list

---

## 🔐 STEP 6: Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation and reset password emails

---

## 🎯 STEP 7: Test the Integration

### 7.1 Start Development Server
```bash
npm run dev
```

### 7.2 Test Features
1. **Sign Up**: Create a new account
2. **Sign In**: Log in with credentials
3. **Check Quota**: Should show 5 scans remaining
4. **Run Scan**: Perform a pattern scan
5. **Check History**: View scan history

---

## 📊 Usage Examples

### Using the Hooks in Your Components

```jsx
import { useAuth } from './hooks/useAuth';
import { useQuota } from './hooks/useQuota';
import { useScanHistory } from './hooks/useScanHistory';

function MyComponent() {
  const { user, profile, signIn, signOut } = useAuth();
  const { quota, checkQuota, incrementScan } = useQuota();
  const { history, saveScan } = useScanHistory();

  // Check if user can scan
  const handleScan = async () => {
    const { canScan, remaining, reason } = checkQuota();

    if (!canScan) {
      alert(reason);
      return;
    }

    // Perform scan...
    const scanResults = await performPatternScan();

    // Save to history
    await saveScan({
      symbols: ['BTCUSDT', 'ETHUSDT'],
      patternsFound: scanResults,
      timeframe: '1h',
    });

    // Increment quota
    await incrementScan();
  };

  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {profile?.full_name}</p>
          <p>Scans remaining: {quota?.remaining || 0}</p>
          <button onClick={handleScan}>Run Scan</button>
        </>
      ) : (
        <button onClick={() => signIn('email@example.com', 'password')}>
          Sign In
        </button>
      )}
    </div>
  );
}
```

---

## 🔒 Security Checklist

- ✅ RLS enabled on all tables
- ✅ Policies restrict users to own data
- ✅ Environment variables not committed to Git
- ✅ Strong database password used
- ✅ Anon key is public-safe (not service role key)

---

## 🚨 Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure `.env.local` file exists
- Check that variables start with `VITE_`
- Restart development server after creating `.env.local`

### Error: "Failed to fetch user"
- Check Supabase project is active
- Verify credentials in `.env.local`
- Check browser console for CORS errors

### Error: "Quota not loaded"
- Make sure user is signed in
- Check `daily_scan_quota` table exists
- Verify RLS policies are enabled

### Error: "Can't insert into scan_history"
- Check RLS policies allow INSERT
- Verify user is authenticated
- Check browser console for detailed error

---

## 📈 Next Steps

1. **Implement Premium Tiers**
   - Create Stripe/PayPal integration
   - Update user tier on payment
   - Disable quota checks for premium users

2. **Add Email Notifications**
   - Quota limit reached
   - Premium tier expiring
   - Weekly scan reports

3. **Analytics Dashboard**
   - Track user engagement
   - Monitor quota usage
   - Analyze pattern detection trends

---

## 🆘 Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors
3. Verify RLS policies are correct
4. Test with Supabase API playground

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] Supabase project created and active
- [ ] Database schema deployed successfully
- [ ] All 3 tables visible in Table Editor
- [ ] RLS enabled on all tables
- [ ] RLS policies created and working
- [ ] Functions deployed (check_and_increment_quota, get_quota_status)
- [ ] Environment variables configured (.env.local)
- [ ] Email authentication enabled
- [ ] Test user can sign up
- [ ] Test user can sign in
- [ ] Quota tracking works correctly
- [ ] Scan history saves properly
- [ ] Premium tier check works

---

**🎉 Congratulations! Your Supabase backend is ready!**
