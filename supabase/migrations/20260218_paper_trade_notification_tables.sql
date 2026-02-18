-- =====================================================
-- Migration: Paper Trade Notification Tables
-- Date: 2026-02-18
-- Description: Create missing notification history and settings tables
--              Referenced by send-paper-trade-push edge function
--              and paperTradeNotificationService.js
-- =====================================================

-- =====================================================
-- 1. paper_trade_notification_history
-- Logs all push notifications sent for paper trades
-- =====================================================
CREATE TABLE IF NOT EXISTS paper_trade_notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT,
  body TEXT,
  data JSONB,
  position_id UUID,
  order_id UUID,
  symbol TEXT,
  push_status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_paper_trade_notif_hist_user
  ON paper_trade_notification_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_paper_trade_notif_hist_position
  ON paper_trade_notification_history(position_id)
  WHERE position_id IS NOT NULL;

-- RLS
ALTER TABLE paper_trade_notification_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_paper_trade_notification_history"
  ON paper_trade_notification_history FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "users_select_own_notification_history"
  ON paper_trade_notification_history FOR SELECT
  TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_notification_history"
  ON paper_trade_notification_history FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

-- Grants
GRANT SELECT, INSERT ON paper_trade_notification_history TO authenticated;
GRANT ALL ON paper_trade_notification_history TO service_role;

-- =====================================================
-- 2. paper_trade_notification_settings
-- Per-user notification preferences for paper trading
-- =====================================================
CREATE TABLE IF NOT EXISTS paper_trade_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  push_enabled BOOLEAN DEFAULT true,
  notify_order_placed BOOLEAN DEFAULT true,
  notify_order_filled BOOLEAN DEFAULT true,
  notify_order_cancelled BOOLEAN DEFAULT true,
  notify_tp_hit BOOLEAN DEFAULT true,
  notify_sl_hit BOOLEAN DEFAULT true,
  notify_position_closed BOOLEAN DEFAULT true,
  notify_liquidation_warning BOOLEAN DEFAULT true,
  notify_liquidation BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  vibration_enabled BOOLEAN DEFAULT true,
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_start TEXT DEFAULT '22:00',
  quiet_end TEXT DEFAULT '08:00',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_paper_trade_notif_settings_user
  ON paper_trade_notification_settings(user_id);

-- RLS
ALTER TABLE paper_trade_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_paper_trade_notification_settings"
  ON paper_trade_notification_settings FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "users_crud_own_notification_settings"
  ON paper_trade_notification_settings FOR ALL
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Grants
GRANT ALL ON paper_trade_notification_settings TO authenticated;
GRANT ALL ON paper_trade_notification_settings TO service_role;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION handle_paper_trade_notif_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_paper_trade_notif_settings_updated_at ON paper_trade_notification_settings;
CREATE TRIGGER set_paper_trade_notif_settings_updated_at
  BEFORE UPDATE ON paper_trade_notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION handle_paper_trade_notif_settings_updated_at();

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
