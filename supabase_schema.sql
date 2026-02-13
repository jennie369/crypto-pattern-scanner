-- =============================================
-- GEM TRADING PLATFORM - DATABASE SCHEMA
-- Version: 1.0
-- Deploy this in Supabase SQL Editor
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
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Quota table policies
DROP POLICY IF EXISTS "Users can read own quota" ON daily_scan_quota;
CREATE POLICY "Users can read own quota"
  ON daily_scan_quota FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own quota" ON daily_scan_quota;
CREATE POLICY "Users can update own quota"
  ON daily_scan_quota FOR UPDATE
  USING (auth.uid() = user_id);

-- Scan history policies
DROP POLICY IF EXISTS "Users can read own scan history" ON scan_history;
CREATE POLICY "Users can read own scan history"
  ON scan_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own scan history" ON scan_history;
CREATE POLICY "Users can insert own scan history"
  ON scan_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own scan history" ON scan_history;
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

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TELEGRAM INTEGRATION MIGRATION
-- =============================================

-- Add telegram_id column to users table for Telegram notifications
ALTER TABLE users
ADD COLUMN IF NOT EXISTS telegram_id TEXT;

-- Create index for efficient telegram_id lookups
CREATE INDEX IF NOT EXISTS idx_users_telegram_id
ON users(telegram_id)
WHERE telegram_id IS NOT NULL;

-- Add column comment
COMMENT ON COLUMN users.telegram_id IS 'Telegram Chat ID for pattern and price alerts (Tier 1+ only)';

-- =============================================
-- TABLE 4: TRADING JOURNAL
-- Stores manual trade tracking (FREE: 50 max, TIER 1+: Unlimited)
-- =============================================
CREATE TABLE IF NOT EXISTS trading_journal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  position_type TEXT NOT NULL CHECK (position_type IN ('long', 'short')),
  entry_price DECIMAL(20, 8) NOT NULL,
  exit_price DECIMAL(20, 8),
  quantity DECIMAL(20, 8) NOT NULL,
  stop_loss DECIMAL(20, 8),
  take_profit DECIMAL(20, 8),
  profit_loss DECIMAL(20, 8),
  profit_loss_percent DECIMAL(10, 4),
  pattern_used TEXT,
  notes TEXT,
  entry_at TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trading_journal_user_id ON trading_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_journal_entry_at ON trading_journal(entry_at DESC);
CREATE INDEX IF NOT EXISTS idx_trading_journal_symbol ON trading_journal(symbol);

-- Enable RLS for trading_journal
ALTER TABLE trading_journal ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trading_journal
DROP POLICY IF EXISTS "Users can read own trades" ON trading_journal;
CREATE POLICY "Users can read own trades"
  ON trading_journal FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own trades" ON trading_journal;
CREATE POLICY "Users can insert own trades"
  ON trading_journal FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own trades" ON trading_journal;
CREATE POLICY "Users can update own trades"
  ON trading_journal FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own trades" ON trading_journal;
CREATE POLICY "Users can delete own trades"
  ON trading_journal FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- TABLE 5: RISK CALCULATIONS
-- Stores risk calculator history (TIER 1+ Feature)
-- =============================================
CREATE TABLE IF NOT EXISTS risk_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_balance DECIMAL(20, 2) NOT NULL,
  risk_percent DECIMAL(5, 2) NOT NULL,
  entry_price DECIMAL(20, 8) NOT NULL,
  stop_loss DECIMAL(20, 8) NOT NULL,
  take_profit DECIMAL(20, 8),
  position_type VARCHAR(10) NOT NULL CHECK (position_type IN ('LONG', 'SHORT')),
  position_size DECIMAL(20, 8) NOT NULL,
  risk_amount DECIMAL(20, 2) NOT NULL,
  risk_reward DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_calc_user ON risk_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_calc_created ON risk_calculations(created_at DESC);

-- Enable RLS for risk_calculations
ALTER TABLE risk_calculations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for risk_calculations
DROP POLICY IF EXISTS "Users can view own calculations" ON risk_calculations;
CREATE POLICY "Users can view own calculations"
  ON risk_calculations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own calculations" ON risk_calculations;
CREATE POLICY "Users can insert own calculations"
  ON risk_calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own calculations" ON risk_calculations;
CREATE POLICY "Users can delete own calculations"
  ON risk_calculations FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database schema deployed successfully!';
  RAISE NOTICE '📊 Tables created: users, daily_scan_quota, scan_history, trading_journal, risk_calculations';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '⚙️ Functions created: check_and_increment_quota, get_quota_status';
  RAISE NOTICE '📱 Telegram integration: telegram_id column added';
  RAISE NOTICE '📝 Trading Journal: ready for manual trade tracking';
  RAISE NOTICE '📊 Risk Calculator: ready for position sizing (Tier 1+)';
  RAISE NOTICE '🎉 Ready to use!';
END $$;
