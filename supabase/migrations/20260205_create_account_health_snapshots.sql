-- =====================================================
-- ACCOUNT HEALTH SNAPSHOTS - ROI PROOF SYSTEM PHASE A
-- File: migrations/20260205_create_account_health_snapshots.sql
-- Created: February 5, 2026
-- Description: Tracks daily account health status for ROI proof
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: account_health_snapshots
-- Daily snapshot of account health for each user
-- Health levels: healthy (>=80%), warning (50-79%),
--                danger (10-49%), burned (3-9%), wiped (<3%)
-- =====================================================
CREATE TABLE IF NOT EXISTS account_health_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Snapshot date (one per day per user)
  snapshot_date DATE NOT NULL,

  -- Balance tracking
  balance DECIMAL(20, 2) NOT NULL DEFAULT 0,
  initial_balance DECIMAL(20, 2) NOT NULL DEFAULT 10000,
  balance_pct DECIMAL(10, 4) GENERATED ALWAYS AS (
    CASE WHEN initial_balance > 0
      THEN (balance / initial_balance) * 100
      ELSE 0
    END
  ) STORED,

  -- Health status
  health_status VARCHAR(20) NOT NULL DEFAULT 'healthy'
    CHECK (health_status IN ('healthy', 'warning', 'danger', 'burned', 'wiped')),

  -- Previous day comparison
  previous_balance DECIMAL(20, 2),
  daily_change DECIMAL(20, 2),
  daily_change_pct DECIMAL(10, 4),

  -- Context at snapshot time
  karma_level VARCHAR(20),
  karma_points INTEGER,
  scanner_tier VARCHAR(20),
  ritual_streak INTEGER DEFAULT 0,

  -- Trading stats for the day
  trades_count INTEGER DEFAULT 0,
  wins_count INTEGER DEFAULT 0,
  losses_count INTEGER DEFAULT 0,
  pnl_amount DECIMAL(20, 2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one snapshot per user per day
  UNIQUE(user_id, snapshot_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_snapshots_user_date
  ON account_health_snapshots(user_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_health_snapshots_date
  ON account_health_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_health_snapshots_status
  ON account_health_snapshots(health_status);
CREATE INDEX IF NOT EXISTS idx_health_snapshots_status_date
  ON account_health_snapshots(health_status, snapshot_date DESC);

-- RLS Policies
ALTER TABLE account_health_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_health_snapshots" ON account_health_snapshots;
CREATE POLICY "users_select_own_health_snapshots" ON account_health_snapshots
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_select_all_health_snapshots" ON account_health_snapshots;
CREATE POLICY "admin_select_all_health_snapshots" ON account_health_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "service_insert_health_snapshots" ON account_health_snapshots;
CREATE POLICY "service_insert_health_snapshots" ON account_health_snapshots
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "service_update_health_snapshots" ON account_health_snapshots;
CREATE POLICY "service_update_health_snapshots" ON account_health_snapshots
  FOR UPDATE USING (TRUE);

-- Grant permissions
GRANT SELECT ON account_health_snapshots TO authenticated;
GRANT INSERT, UPDATE ON account_health_snapshots TO service_role;


-- =====================================================
-- FUNCTION: calculate_health_status
-- Calculates health status from balance percentage
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_health_status(p_balance_pct DECIMAL)
RETURNS VARCHAR(20) AS $$
BEGIN
  IF p_balance_pct >= 80 THEN
    RETURN 'healthy';
  ELSIF p_balance_pct >= 50 THEN
    RETURN 'warning';
  ELSIF p_balance_pct >= 10 THEN
    RETURN 'danger';
  ELSIF p_balance_pct >= 3 THEN
    RETURN 'burned';
  ELSE
    RETURN 'wiped';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- =====================================================
-- FUNCTION: generate_daily_health_snapshots
-- Runs daily at 00:05 UTC to generate snapshots for all users
-- =====================================================
CREATE OR REPLACE FUNCTION generate_daily_health_snapshots(
  p_target_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
  v_count INTEGER := 0;
  v_errors INTEGER := 0;
  v_user RECORD;
  v_balance DECIMAL(20, 2);
  v_initial_balance DECIMAL(20, 2);
  v_balance_pct DECIMAL(10, 4);
  v_health_status VARCHAR(20);
  v_previous RECORD;
  v_daily_stats RECORD;
BEGIN
  -- Loop through all users with profiles
  FOR v_user IN
    SELECT
      p.id as user_id,
      COALESCE(p.karma_level, 'student') as karma_level,
      COALESCE(p.karma_points, 200) as karma_points,
      COALESCE(p.scanner_tier, 'FREE') as scanner_tier
    FROM profiles p
    WHERE p.id IS NOT NULL
  LOOP
    BEGIN
      -- Get current balance from paper_trade_accounts or default
      SELECT COALESCE(pta.balance, 0), COALESCE(pta.initial_balance, 10000)
      INTO v_balance, v_initial_balance
      FROM paper_trade_accounts pta
      WHERE pta.user_id = v_user.user_id
      LIMIT 1;

      -- If no account found, use defaults
      IF v_balance IS NULL THEN
        v_balance := 0;
        v_initial_balance := 10000;
      END IF;

      -- Handle edge case: initial_balance = 0
      IF v_initial_balance = 0 THEN
        v_initial_balance := 10000;
      END IF;

      -- Calculate balance percentage
      v_balance_pct := (v_balance / v_initial_balance) * 100;

      -- Get health status
      v_health_status := calculate_health_status(v_balance_pct);

      -- Get previous snapshot
      SELECT balance, balance_pct
      INTO v_previous
      FROM account_health_snapshots
      WHERE user_id = v_user.user_id
        AND snapshot_date < p_target_date
      ORDER BY snapshot_date DESC
      LIMIT 1;

      -- Get daily trading stats (from trading_journal_entries)
      SELECT
        COUNT(*) as trades,
        COUNT(*) FILTER (WHERE result = 'win') as wins,
        COUNT(*) FILTER (WHERE result = 'loss') as losses,
        COALESCE(SUM(pnl_amount), 0) as pnl
      INTO v_daily_stats
      FROM trading_journal_entries
      WHERE user_id = v_user.user_id
        AND trade_date = p_target_date;

      -- Get ritual streak (from profiles or vision tables)
      -- For simplicity, we'll store 0 and update via trigger if needed

      -- UPSERT snapshot
      INSERT INTO account_health_snapshots (
        user_id, snapshot_date, balance, initial_balance, health_status,
        previous_balance, daily_change, daily_change_pct,
        karma_level, karma_points, scanner_tier, ritual_streak,
        trades_count, wins_count, losses_count, pnl_amount
      ) VALUES (
        v_user.user_id,
        p_target_date,
        v_balance,
        v_initial_balance,
        v_health_status,
        v_previous.balance,
        v_balance - COALESCE(v_previous.balance, v_balance),
        CASE WHEN v_previous.balance > 0
          THEN ((v_balance - v_previous.balance) / v_previous.balance) * 100
          ELSE 0
        END,
        v_user.karma_level,
        v_user.karma_points,
        v_user.scanner_tier,
        0, -- ritual_streak placeholder
        COALESCE(v_daily_stats.trades, 0),
        COALESCE(v_daily_stats.wins, 0),
        COALESCE(v_daily_stats.losses, 0),
        COALESCE(v_daily_stats.pnl, 0)
      )
      ON CONFLICT (user_id, snapshot_date)
      DO UPDATE SET
        balance = EXCLUDED.balance,
        initial_balance = EXCLUDED.initial_balance,
        health_status = EXCLUDED.health_status,
        previous_balance = EXCLUDED.previous_balance,
        daily_change = EXCLUDED.daily_change,
        daily_change_pct = EXCLUDED.daily_change_pct,
        karma_level = EXCLUDED.karma_level,
        karma_points = EXCLUDED.karma_points,
        scanner_tier = EXCLUDED.scanner_tier,
        trades_count = EXCLUDED.trades_count,
        wins_count = EXCLUDED.wins_count,
        losses_count = EXCLUDED.losses_count,
        pnl_amount = EXCLUDED.pnl_amount;

      v_count := v_count + 1;

    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors + 1;
      RAISE NOTICE 'Error processing user %: %', v_user.user_id, SQLERRM;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'success', TRUE,
    'date', p_target_date,
    'users_processed', v_count,
    'errors', v_errors
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- FUNCTION: backfill_health_from_history
-- One-time function to backfill historical health snapshots
-- =====================================================
CREATE OR REPLACE FUNCTION backfill_health_from_history(
  p_user_id UUID,
  p_days INTEGER DEFAULT 90
)
RETURNS JSONB AS $$
DECLARE
  v_count INTEGER := 0;
  v_start_date DATE;
  v_current_date DATE;
  v_initial_balance DECIMAL(20, 2);
  v_balance DECIMAL(20, 2);
BEGIN
  v_start_date := CURRENT_DATE - p_days;

  -- Get initial balance
  SELECT COALESCE(initial_balance, 10000)
  INTO v_initial_balance
  FROM paper_trade_accounts
  WHERE user_id = p_user_id
  LIMIT 1;

  IF v_initial_balance IS NULL THEN
    v_initial_balance := 10000;
  END IF;

  -- Loop through each day
  FOR v_current_date IN
    SELECT generate_series(v_start_date, CURRENT_DATE, '1 day'::INTERVAL)::DATE
  LOOP
    -- Estimate balance from trading journal
    SELECT v_initial_balance + COALESCE(SUM(pnl_amount), 0)
    INTO v_balance
    FROM trading_journal_entries
    WHERE user_id = p_user_id
      AND trade_date <= v_current_date;

    -- Handle NULL balance
    IF v_balance IS NULL THEN
      v_balance := v_initial_balance;
    END IF;

    -- Insert snapshot (skip if exists)
    INSERT INTO account_health_snapshots (
      user_id, snapshot_date, balance, initial_balance, health_status
    ) VALUES (
      p_user_id,
      v_current_date,
      v_balance,
      v_initial_balance,
      calculate_health_status((v_balance / v_initial_balance) * 100)
    )
    ON CONFLICT (user_id, snapshot_date) DO NOTHING;

    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', TRUE,
    'user_id', p_user_id,
    'days_processed', v_count,
    'start_date', v_start_date,
    'end_date', CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- FUNCTION: get_user_health_summary
-- Returns health summary for a user
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_health_summary(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'latest', (
      SELECT jsonb_build_object(
        'date', snapshot_date,
        'balance', balance,
        'balance_pct', ROUND(balance_pct::NUMERIC, 2),
        'health_status', health_status,
        'daily_change', daily_change,
        'daily_change_pct', ROUND(COALESCE(daily_change_pct, 0)::NUMERIC, 2)
      )
      FROM account_health_snapshots
      WHERE user_id = p_user_id
      ORDER BY snapshot_date DESC
      LIMIT 1
    ),
    'history', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'date', snapshot_date,
        'balance', balance,
        'balance_pct', ROUND(balance_pct::NUMERIC, 2),
        'health_status', health_status
      ) ORDER BY snapshot_date DESC)
      FROM account_health_snapshots
      WHERE user_id = p_user_id
        AND snapshot_date >= CURRENT_DATE - p_days
    ), '[]'::jsonb),
    'stats', (
      SELECT jsonb_build_object(
        'total_snapshots', COUNT(*),
        'healthy_days', COUNT(*) FILTER (WHERE health_status = 'healthy'),
        'warning_days', COUNT(*) FILTER (WHERE health_status = 'warning'),
        'danger_days', COUNT(*) FILTER (WHERE health_status = 'danger'),
        'burned_days', COUNT(*) FILTER (WHERE health_status = 'burned'),
        'wiped_days', COUNT(*) FILTER (WHERE health_status = 'wiped'),
        'avg_balance_pct', ROUND(AVG(balance_pct)::NUMERIC, 2),
        'min_balance_pct', ROUND(MIN(balance_pct)::NUMERIC, 2),
        'max_balance_pct', ROUND(MAX(balance_pct)::NUMERIC, 2)
      )
      FROM account_health_snapshots
      WHERE user_id = p_user_id
        AND snapshot_date >= CURRENT_DATE - p_days
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- GRANTS: Execute permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION calculate_health_status(DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_daily_health_snapshots(DATE) TO service_role;
GRANT EXECUTE ON FUNCTION backfill_health_from_history(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_health_summary(UUID, INTEGER) TO authenticated;


-- =====================================================
-- COMMENTS: Document tables and functions
-- =====================================================
COMMENT ON TABLE account_health_snapshots IS
  'Daily snapshots of account health for ROI proof system. Tracks balance percentage and health status over time.';

COMMENT ON FUNCTION calculate_health_status IS
  'Calculates health status (healthy/warning/danger/burned/wiped) from balance percentage.';

COMMENT ON FUNCTION generate_daily_health_snapshots IS
  'Generates daily health snapshots for all users. Run at 00:05 UTC via cron.';

COMMENT ON FUNCTION backfill_health_from_history IS
  'One-time function to backfill historical health data from trading journal.';

COMMENT ON FUNCTION get_user_health_summary IS
  'Returns health summary including latest snapshot, history, and stats for a user.';
