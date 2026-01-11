-- =====================================================
-- Migration: Paper Trade Cloud Sync
-- Date: 2024-12-25
-- Description: Add tables for full cloud sync of Paper Trade data
-- =====================================================

-- =====================================================
-- 1. USER PAPER TRADE SETTINGS
-- Stores user's paper trade balance and settings
-- =====================================================
CREATE TABLE IF NOT EXISTS user_paper_trade_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Balance
  balance DECIMAL(20, 8) NOT NULL DEFAULT 10000,
  initial_balance DECIMAL(20, 8) NOT NULL DEFAULT 10000,

  -- Stats cache (updated on each trade close)
  total_trades INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  total_realized_pnl DECIMAL(20, 8) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_trade_at TIMESTAMPTZ,

  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_paper_trade_settings_user_id
  ON user_paper_trade_settings(user_id);

-- RLS Policies
ALTER TABLE user_paper_trade_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own paper trade settings" ON user_paper_trade_settings;
CREATE POLICY "Users can view own paper trade settings"
  ON user_paper_trade_settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own paper trade settings" ON user_paper_trade_settings;
CREATE POLICY "Users can insert own paper trade settings"
  ON user_paper_trade_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own paper trade settings" ON user_paper_trade_settings;
CREATE POLICY "Users can update own paper trade settings"
  ON user_paper_trade_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 2. ADD MISSING COLUMNS TO paper_trades TABLE
-- Ensure all required columns exist
-- =====================================================
DO $$
BEGIN
  -- First check if paper_trades table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'paper_trades'
  ) THEN
    -- Create the table if it doesn't exist
    CREATE TABLE paper_trades (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      symbol VARCHAR(20) NOT NULL,
      direction VARCHAR(10) NOT NULL, -- 'LONG' or 'SHORT'
      status VARCHAR(20) DEFAULT 'OPEN', -- 'PENDING', 'OPEN', 'CLOSED', 'CANCELLED'
      entry_price DECIMAL(20, 8) NOT NULL,
      exit_price DECIMAL(20, 8),
      quantity DECIMAL(20, 8) NOT NULL,
      stop_loss DECIMAL(20, 8),
      opened_at TIMESTAMPTZ DEFAULT NOW(),
      closed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Add RLS
    ALTER TABLE paper_trades ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view own trades" ON paper_trades FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own trades" ON paper_trades FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own trades" ON paper_trades FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own trades" ON paper_trades FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- Add status column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paper_trades' AND column_name = 'status'
  ) THEN
    ALTER TABLE paper_trades ADD COLUMN status VARCHAR(20) DEFAULT 'OPEN';
  END IF;

  -- Add leverage column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paper_trades' AND column_name = 'leverage'
  ) THEN
    ALTER TABLE paper_trades ADD COLUMN leverage INTEGER DEFAULT 10;
  END IF;

  -- Add order_type column if not exists (MARKET/LIMIT)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paper_trades' AND column_name = 'order_type'
  ) THEN
    ALTER TABLE paper_trades ADD COLUMN order_type VARCHAR(20) DEFAULT 'MARKET';
  END IF;

  -- Add pending_at column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paper_trades' AND column_name = 'pending_at'
  ) THEN
    ALTER TABLE paper_trades ADD COLUMN pending_at TIMESTAMPTZ;
  END IF;

  -- Add filled_at column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paper_trades' AND column_name = 'filled_at'
  ) THEN
    ALTER TABLE paper_trades ADD COLUMN filled_at TIMESTAMPTZ;
  END IF;

  -- Add cancelled_at column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paper_trades' AND column_name = 'cancelled_at'
  ) THEN
    ALTER TABLE paper_trades ADD COLUMN cancelled_at TIMESTAMPTZ;
  END IF;

  -- Add holding_time column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paper_trades' AND column_name = 'holding_time'
  ) THEN
    ALTER TABLE paper_trades ADD COLUMN holding_time VARCHAR(50);
  END IF;

  -- Add margin column if not exists (alias for position_size)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paper_trades' AND column_name = 'margin'
  ) THEN
    ALTER TABLE paper_trades ADD COLUMN margin DECIMAL(20, 8);
  END IF;

  -- Add position_value column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paper_trades' AND column_name = 'position_value'
  ) THEN
    ALTER TABLE paper_trades ADD COLUMN position_value DECIMAL(20, 8);
  END IF;

  -- Add confidence column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paper_trades' AND column_name = 'confidence'
  ) THEN
    ALTER TABLE paper_trades ADD COLUMN confidence INTEGER;
  END IF;

  -- Add take_profit column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paper_trades' AND column_name = 'take_profit'
  ) THEN
    ALTER TABLE paper_trades ADD COLUMN take_profit DECIMAL(20, 8);
  END IF;

  -- Add realized_pnl_percent column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paper_trades' AND column_name = 'realized_pnl_percent'
  ) THEN
    ALTER TABLE paper_trades ADD COLUMN realized_pnl_percent DECIMAL(10, 4);
  END IF;

  -- Add pattern_data column for storing full pattern info
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paper_trades' AND column_name = 'pattern_data'
  ) THEN
    ALTER TABLE paper_trades ADD COLUMN pattern_data JSONB;
  END IF;
END $$;

-- =====================================================
-- 3. CREATE/UPDATE INDEXES FOR paper_trades
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_paper_trades_user_status
  ON paper_trades(user_id, status);

CREATE INDEX IF NOT EXISTS idx_paper_trades_user_closed
  ON paper_trades(user_id, closed_at DESC)
  WHERE status = 'CLOSED';

CREATE INDEX IF NOT EXISTS idx_paper_trades_user_open
  ON paper_trades(user_id, opened_at DESC)
  WHERE status = 'OPEN';

CREATE INDEX IF NOT EXISTS idx_paper_trades_user_pending
  ON paper_trades(user_id, pending_at DESC)
  WHERE status = 'PENDING';

-- =====================================================
-- 4. FUNCTION: Get or create user paper trade settings
-- =====================================================
DROP FUNCTION IF EXISTS get_or_create_paper_trade_settings CASCADE;
CREATE OR REPLACE FUNCTION get_or_create_paper_trade_settings(p_user_id UUID)
RETURNS user_paper_trade_settings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings user_paper_trade_settings;
BEGIN
  -- Try to get existing settings
  SELECT * INTO v_settings
  FROM user_paper_trade_settings
  WHERE user_id = p_user_id;

  -- If not found, create with defaults
  IF v_settings IS NULL THEN
    INSERT INTO user_paper_trade_settings (user_id, balance, initial_balance)
    VALUES (p_user_id, 10000, 10000)
    RETURNING * INTO v_settings;
  END IF;

  RETURN v_settings;
END;
$$;

-- =====================================================
-- 5. FUNCTION: Update paper trade balance
-- =====================================================
DROP FUNCTION IF EXISTS update_paper_trade_balance CASCADE;
CREATE OR REPLACE FUNCTION update_paper_trade_balance(
  p_user_id UUID,
  p_new_balance DECIMAL(20, 8),
  p_trade_result VARCHAR DEFAULT NULL -- 'WIN', 'LOSS', or NULL for no stat update
)
RETURNS user_paper_trade_settings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings user_paper_trade_settings;
BEGIN
  -- Update or insert settings
  INSERT INTO user_paper_trade_settings (user_id, balance, initial_balance)
  VALUES (p_user_id, p_new_balance, 10000)
  ON CONFLICT (user_id) DO UPDATE SET
    balance = p_new_balance,
    updated_at = NOW(),
    last_trade_at = CASE WHEN p_trade_result IS NOT NULL THEN NOW() ELSE user_paper_trade_settings.last_trade_at END,
    total_trades = CASE WHEN p_trade_result IS NOT NULL THEN user_paper_trade_settings.total_trades + 1 ELSE user_paper_trade_settings.total_trades END,
    total_wins = CASE WHEN p_trade_result = 'WIN' THEN user_paper_trade_settings.total_wins + 1 ELSE user_paper_trade_settings.total_wins END,
    total_losses = CASE WHEN p_trade_result = 'LOSS' THEN user_paper_trade_settings.total_losses + 1 ELSE user_paper_trade_settings.total_losses END
  RETURNING * INTO v_settings;

  RETURN v_settings;
END;
$$;

-- =====================================================
-- 6. FUNCTION: Reset paper trade account
-- =====================================================
DROP FUNCTION IF EXISTS reset_paper_trade_account CASCADE;
CREATE OR REPLACE FUNCTION reset_paper_trade_account(
  p_user_id UUID,
  p_initial_balance DECIMAL(20, 8) DEFAULT 10000
)
RETURNS user_paper_trade_settings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings user_paper_trade_settings;
BEGIN
  -- Delete all trades for this user
  DELETE FROM paper_trades WHERE user_id = p_user_id;

  -- Reset settings
  INSERT INTO user_paper_trade_settings (user_id, balance, initial_balance, total_trades, total_wins, total_losses, total_realized_pnl)
  VALUES (p_user_id, p_initial_balance, p_initial_balance, 0, 0, 0, 0)
  ON CONFLICT (user_id) DO UPDATE SET
    balance = p_initial_balance,
    initial_balance = p_initial_balance,
    total_trades = 0,
    total_wins = 0,
    total_losses = 0,
    total_realized_pnl = 0,
    updated_at = NOW(),
    last_trade_at = NULL
  RETURNING * INTO v_settings;

  RETURN v_settings;
END;
$$;

-- =====================================================
-- 7. FUNCTION: Get paper trade stats
-- =====================================================
DROP FUNCTION IF EXISTS get_paper_trade_stats CASCADE;
CREATE OR REPLACE FUNCTION get_paper_trade_stats(p_user_id UUID)
RETURNS TABLE (
  balance DECIMAL(20, 8),
  initial_balance DECIMAL(20, 8),
  total_trades INTEGER,
  open_trades INTEGER,
  pending_orders INTEGER,
  total_wins INTEGER,
  total_losses INTEGER,
  win_rate DECIMAL(5, 2),
  total_realized_pnl DECIMAL(20, 8),
  total_unrealized_pnl DECIMAL(20, 8)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH settings AS (
    SELECT * FROM get_or_create_paper_trade_settings(p_user_id)
  ),
  open_stats AS (
    SELECT
      COUNT(*) FILTER (WHERE status = 'OPEN') as open_count,
      COUNT(*) FILTER (WHERE status = 'PENDING') as pending_count,
      COALESCE(SUM(
        CASE
          WHEN status = 'OPEN' THEN
            CASE
              WHEN direction = 'LONG' THEN (COALESCE(quantity, 0) * (0 - entry_price))
              ELSE (COALESCE(quantity, 0) * (entry_price - 0))
            END
          ELSE 0
        END
      ), 0) as unrealized_pnl
    FROM paper_trades
    WHERE user_id = p_user_id
  )
  SELECT
    s.balance,
    s.initial_balance,
    s.total_trades,
    o.open_count::INTEGER,
    o.pending_count::INTEGER,
    s.total_wins,
    s.total_losses,
    CASE
      WHEN s.total_trades > 0
      THEN ROUND((s.total_wins::DECIMAL / s.total_trades) * 100, 2)
      ELSE 0
    END as win_rate,
    s.total_realized_pnl,
    o.unrealized_pnl
  FROM settings s
  CROSS JOIN open_stats o;
END;
$$;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
