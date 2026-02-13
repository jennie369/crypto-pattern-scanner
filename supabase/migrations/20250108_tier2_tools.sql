-- ═══════════════════════════════════════════════════════════════════
-- TIER 2 ADVANCED TOOLS - DATABASE MIGRATION
-- Created: 2025-01-08
-- Description: Tables for Portfolio Tracker, Multi-Timeframe Analysis,
--              and other TIER 2 advanced trading tools
-- ═══════════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE 1: portfolio_holdings
-- Purpose: Track user's cryptocurrency holdings for Portfolio Tracker
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL, -- e.g., 'BTCUSDT', 'ETHUSDT'
  quantity DECIMAL(20, 8) NOT NULL CHECK (quantity > 0), -- Amount of crypto owned
  avg_buy_price DECIMAL(20, 8) NOT NULL CHECK (avg_buy_price > 0), -- Average purchase price
  current_price DECIMAL(20, 8), -- Current market price (updated via API)
  total_value DECIMAL(20, 2), -- current_price * quantity
  profit_loss DECIMAL(20, 2), -- (current_price - avg_buy_price) * quantity
  profit_loss_percent DECIMAL(10, 4), -- ((current_price - avg_buy_price) / avg_buy_price) * 100
  notes TEXT, -- Optional user notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure user doesn't have duplicate holdings for same symbol
  UNIQUE(user_id, symbol)
);

-- Indexes for portfolio_holdings
CREATE INDEX idx_portfolio_holdings_user_id ON portfolio_holdings(user_id);
CREATE INDEX idx_portfolio_holdings_symbol ON portfolio_holdings(symbol);
CREATE INDEX idx_portfolio_holdings_created_at ON portfolio_holdings(created_at DESC);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_portfolio_holdings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portfolio_holdings_updated_at_trigger
  BEFORE UPDATE ON portfolio_holdings
  FOR EACH ROW
  EXECUTE FUNCTION update_portfolio_holdings_updated_at();

-- RLS Policies for portfolio_holdings
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- Users can only view their own holdings
CREATE POLICY "Users can view own portfolio holdings"
  ON portfolio_holdings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own holdings
CREATE POLICY "Users can insert own portfolio holdings"
  ON portfolio_holdings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own holdings
CREATE POLICY "Users can update own portfolio holdings"
  ON portfolio_holdings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own holdings
CREATE POLICY "Users can delete own portfolio holdings"
  ON portfolio_holdings
  FOR DELETE
  USING (auth.uid() = user_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE 2: portfolio_transactions
-- Purpose: Track buy/sell transactions for portfolio history
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS portfolio_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL, -- e.g., 'BTCUSDT'
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  quantity DECIMAL(20, 8) NOT NULL CHECK (quantity > 0), -- Amount traded
  price DECIMAL(20, 8) NOT NULL CHECK (price > 0), -- Price per unit
  total_amount DECIMAL(20, 2) NOT NULL, -- quantity * price
  fee DECIMAL(20, 2) DEFAULT 0, -- Trading fees
  notes TEXT, -- Optional notes
  transaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- When the trade happened
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for portfolio_transactions
CREATE INDEX idx_portfolio_transactions_user_id ON portfolio_transactions(user_id);
CREATE INDEX idx_portfolio_transactions_symbol ON portfolio_transactions(symbol);
CREATE INDEX idx_portfolio_transactions_transaction_at ON portfolio_transactions(transaction_at DESC);
CREATE INDEX idx_portfolio_transactions_type ON portfolio_transactions(transaction_type);

-- RLS Policies for portfolio_transactions
ALTER TABLE portfolio_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own transactions
CREATE POLICY "Users can view own portfolio transactions"
  ON portfolio_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own portfolio transactions"
  ON portfolio_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own transactions
CREATE POLICY "Users can update own portfolio transactions"
  ON portfolio_transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own transactions
CREATE POLICY "Users can delete own portfolio transactions"
  ON portfolio_transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE 3: price_alerts
-- Purpose: Price alerts for Multi-Timeframe Analysis and pattern retests
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL, -- e.g., 'BTCUSDT'
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_above', 'price_below', 'pattern_detected', 'zone_retest')),
  target_price DECIMAL(20, 8), -- For price_above/price_below alerts
  pattern_type TEXT, -- For pattern_detected alerts (e.g., 'DPD', 'HFZ')
  zone_data JSONB, -- For zone_retest alerts (HFZ/LFZ zone info)
  timeframes TEXT[], -- Array of timeframes ['15m', '1h', '4h', '1d']
  is_active BOOLEAN DEFAULT true, -- Whether alert is still active
  triggered_at TIMESTAMP WITH TIME ZONE, -- When alert was triggered
  notification_sent BOOLEAN DEFAULT false, -- Whether notification was sent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for price_alerts
CREATE INDEX idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_symbol ON price_alerts(symbol);
CREATE INDEX idx_price_alerts_is_active ON price_alerts(is_active) WHERE is_active = true;
CREATE INDEX idx_price_alerts_alert_type ON price_alerts(alert_type);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_price_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER price_alerts_updated_at_trigger
  BEFORE UPDATE ON price_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_price_alerts_updated_at();

-- RLS Policies for price_alerts
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Users can only view their own alerts
CREATE POLICY "Users can view own price alerts"
  ON price_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own alerts
CREATE POLICY "Users can insert own price alerts"
  ON price_alerts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own alerts
CREATE POLICY "Users can update own price alerts"
  ON price_alerts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own alerts
CREATE POLICY "Users can delete own price alerts"
  ON price_alerts
  FOR DELETE
  USING (auth.uid() = user_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- HELPER FUNCTIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Function to calculate portfolio total value
CREATE OR REPLACE FUNCTION calculate_portfolio_total_value(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_value DECIMAL;
BEGIN
  SELECT COALESCE(SUM(total_value), 0) INTO total_value
  FROM portfolio_holdings
  WHERE user_id = p_user_id;

  RETURN total_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate portfolio total P&L
CREATE OR REPLACE FUNCTION calculate_portfolio_total_pl(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  total_pl DECIMAL;
  total_pl_percent DECIMAL;
  total_invested DECIMAL;
  total_current DECIMAL;
BEGIN
  -- Calculate total invested (avg_buy_price * quantity)
  SELECT COALESCE(SUM(avg_buy_price * quantity), 0) INTO total_invested
  FROM portfolio_holdings
  WHERE user_id = p_user_id;

  -- Calculate total current value
  SELECT COALESCE(SUM(total_value), 0) INTO total_current
  FROM portfolio_holdings
  WHERE user_id = p_user_id;

  -- Calculate P&L
  total_pl := total_current - total_invested;

  -- Calculate P&L percentage
  IF total_invested > 0 THEN
    total_pl_percent := (total_pl / total_invested) * 100;
  ELSE
    total_pl_percent := 0;
  END IF;

  -- Build result JSON
  result := jsonb_build_object(
    'total_invested', total_invested,
    'total_current_value', total_current,
    'total_profit_loss', total_pl,
    'total_pl_percent', total_pl_percent
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get portfolio summary
CREATE OR REPLACE FUNCTION get_portfolio_summary(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  holdings_count INTEGER;
  total_value DECIMAL;
  pl_data JSONB;
BEGIN
  -- Count holdings
  SELECT COUNT(*) INTO holdings_count
  FROM portfolio_holdings
  WHERE user_id = p_user_id;

  -- Get total value
  total_value := calculate_portfolio_total_value(p_user_id);

  -- Get P&L data
  pl_data := calculate_portfolio_total_pl(p_user_id);

  -- Build result
  result := jsonb_build_object(
    'holdings_count', holdings_count,
    'total_value', total_value,
    'pl_data', pl_data
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- GRANT PERMISSIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Grant execute permissions on helper functions to authenticated users
GRANT EXECUTE ON FUNCTION calculate_portfolio_total_value(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_portfolio_total_pl(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_portfolio_summary(UUID) TO authenticated;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- COMMENTS FOR DOCUMENTATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMMENT ON TABLE portfolio_holdings IS 'User cryptocurrency holdings for Portfolio Tracker (TIER 2)';
COMMENT ON TABLE portfolio_transactions IS 'Buy/sell transaction history for portfolio management (TIER 2)';
COMMENT ON TABLE price_alerts IS 'Price and pattern alerts for Multi-Timeframe Analysis (TIER 2)';

COMMENT ON FUNCTION calculate_portfolio_total_value(UUID) IS 'Calculate total portfolio value for a user';
COMMENT ON FUNCTION calculate_portfolio_total_pl(UUID) IS 'Calculate total P&L and P&L% for a user portfolio';
COMMENT ON FUNCTION get_portfolio_summary(UUID) IS 'Get complete portfolio summary including holdings count, value, and P&L';

-- ═══════════════════════════════════════════════════════════════════
-- END OF MIGRATION
-- ═══════════════════════════════════════════════════════════════════
