-- =====================================================
-- FIX: Add missing updated_at column to vision_daily_summary
-- File: migrations/20260203_fix_vision_daily_summary_updated_at.sql
-- Created: February 3, 2026
-- Issue: Trigger fn_update_summary_on_journal tries to set updated_at
--        but the column doesn't exist, causing insert failures
-- =====================================================

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vision_daily_summary' AND column_name = 'updated_at') THEN
    ALTER TABLE vision_daily_summary ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Also update the trigger function to handle case where column might not exist
-- by using a more defensive approach
CREATE OR REPLACE FUNCTION fn_update_summary_on_journal()
RETURNS TRIGGER AS $$
BEGIN
  -- Upsert daily summary
  INSERT INTO vision_daily_summary (user_id, summary_date, journal_count, updated_at)
  VALUES (NEW.user_id, NEW.entry_date, 1, NOW())
  ON CONFLICT (user_id, summary_date)
  DO UPDATE SET
    journal_count = COALESCE(vision_daily_summary.journal_count, 0) + 1,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN undefined_column THEN
    -- Fallback if updated_at column doesn't exist
    INSERT INTO vision_daily_summary (user_id, summary_date, journal_count)
    VALUES (NEW.user_id, NEW.entry_date, 1)
    ON CONFLICT (user_id, summary_date)
    DO UPDATE SET
      journal_count = COALESCE(vision_daily_summary.journal_count, 0) + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS trg_update_summary_journal ON calendar_journal_entries;
CREATE TRIGGER trg_update_summary_journal
  AFTER INSERT ON calendar_journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_summary_on_journal();

-- Also fix the trading summary trigger for consistency
CREATE OR REPLACE FUNCTION fn_update_summary_on_trading()
RETURNS TRIGGER AS $$
BEGIN
  -- Upsert daily summary
  INSERT INTO vision_daily_summary (
    user_id, summary_date, trading_count, trading_pnl, trading_wins, trading_losses, updated_at
  )
  VALUES (
    NEW.user_id,
    NEW.trade_date,
    1,
    COALESCE(NEW.pnl_amount, 0),
    CASE WHEN NEW.result = 'win' THEN 1 ELSE 0 END,
    CASE WHEN NEW.result = 'loss' THEN 1 ELSE 0 END,
    NOW()
  )
  ON CONFLICT (user_id, summary_date)
  DO UPDATE SET
    trading_count = COALESCE(vision_daily_summary.trading_count, 0) + 1,
    trading_pnl = COALESCE(vision_daily_summary.trading_pnl, 0) + COALESCE(NEW.pnl_amount, 0),
    trading_wins = COALESCE(vision_daily_summary.trading_wins, 0) +
      CASE WHEN NEW.result = 'win' THEN 1 ELSE 0 END,
    trading_losses = COALESCE(vision_daily_summary.trading_losses, 0) +
      CASE WHEN NEW.result = 'loss' THEN 1 ELSE 0 END,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN undefined_column THEN
    -- Fallback if updated_at column doesn't exist
    INSERT INTO vision_daily_summary (
      user_id, summary_date, trading_count, trading_pnl, trading_wins, trading_losses
    )
    VALUES (
      NEW.user_id,
      NEW.trade_date,
      1,
      COALESCE(NEW.pnl_amount, 0),
      CASE WHEN NEW.result = 'win' THEN 1 ELSE 0 END,
      CASE WHEN NEW.result = 'loss' THEN 1 ELSE 0 END
    )
    ON CONFLICT (user_id, summary_date)
    DO UPDATE SET
      trading_count = COALESCE(vision_daily_summary.trading_count, 0) + 1,
      trading_pnl = COALESCE(vision_daily_summary.trading_pnl, 0) + COALESCE(NEW.pnl_amount, 0),
      trading_wins = COALESCE(vision_daily_summary.trading_wins, 0) +
        CASE WHEN NEW.result = 'win' THEN 1 ELSE 0 END,
      trading_losses = COALESCE(vision_daily_summary.trading_losses, 0) +
        CASE WHEN NEW.result = 'loss' THEN 1 ELSE 0 END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS trg_update_summary_trading ON trading_journal_entries;
CREATE TRIGGER trg_update_summary_trading
  AFTER INSERT ON trading_journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_summary_on_trading();
