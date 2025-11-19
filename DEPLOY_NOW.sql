-- ========================================
-- QUICK DEPLOY SCRIPT - RUN THIS IN SUPABASE SQL EDITOR
-- ========================================
-- URL: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/editor
-- ========================================

-- STEP 1: Check if old tables exist
-- (Skip to STEP 2 if no results)
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('backtestconfigs', 'backtestresults', 'backtesttrades')
ORDER BY table_name;

-- ========================================

-- STEP 2: Drop old tables (ONLY if STEP 1 returned rows)
DROP TABLE IF EXISTS backtesttrades CASCADE;
DROP TABLE IF EXISTS backtestresults CASCADE;
DROP TABLE IF EXISTS backtestconfigs CASCADE;
DROP TABLE IF EXISTS ai_predictions CASCADE;
DROP TABLE IF EXISTS whale_alerts CASCADE;
DROP TABLE IF EXISTS whale_transactions CASCADE;
DROP TABLE IF EXISTS whale_wallets CASCADE;

-- ========================================

-- STEP 3: Deploy full migration
-- ═══════════════════════════════════════════════════════════════════
-- TIER 3 ELITE TOOLS - DATABASE MIGRATION
-- Created: 2025-01-10
-- Description: Tables for Professional Backtesting Engine, AI Prediction Tool,
--              and Whale Tracker (TIER 3 / VIP only features)
-- ═══════════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE 1: backtestconfigs
-- Purpose: Store backtest strategy configurations
-- Access: TIER 3 (VIP) only
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS backtestconfigs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., 'DPD Strategy 4H'
  description TEXT,

  -- Strategy settings
  patterns TEXT[] NOT NULL DEFAULT ARRAY['DPD', 'UPU'], -- Patterns to detect
  symbols TEXT[] NOT NULL DEFAULT ARRAY['BTCUSDT'], -- Symbols to test
  timeframe TEXT NOT NULL DEFAULT '4h', -- '1h', '4h', '1d', etc.

  -- Entry rules
  entry_rules JSONB NOT NULL DEFAULT '{
    "requireConfirmation": true,
    "minConfidence": 70,
    "zoneStatusRequired": ["fresh", "tested_1x"]
  }'::jsonb,

  -- Exit rules
  exit_rules JSONB NOT NULL DEFAULT '{
    "rrRatio": 2,
    "useTrailingStop": false,
    "partialTpLevels": [1.5, 2.5]
  }'::jsonb,

  -- Risk management
  risk_per_trade DECIMAL(5,2) DEFAULT 2.0 CHECK (risk_per_trade > 0 AND risk_per_trade <= 10), -- 2% risk
  initial_capital DECIMAL(20,2) DEFAULT 10000 CHECK (initial_capital > 0), -- Starting capital

  -- Backtest period
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Validation
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Indexes for backtestconfigs
CREATE INDEX idx_backtestconfigs_user_id ON backtestconfigs(user_id);
CREATE INDEX idx_backtestconfigs_created_at ON backtestconfigs(created_at DESC);
CREATE INDEX idx_backtestconfigs_timeframe ON backtestconfigs(timeframe);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_backtestconfigs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER backtestconfigs_updated_at_trigger
  BEFORE UPDATE ON backtestconfigs
  FOR EACH ROW
  EXECUTE FUNCTION update_backtestconfigs_updated_at();

-- RLS Policies (TIER 3 only)
ALTER TABLE backtestconfigs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TIER3 users can view own backtest configs"
  ON backtestconfigs
  FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.scanner_tier = 'TIER3' OR profiles.course_tier = 'TIER3' OR profiles.scanner_tier = 'vip' OR profiles.course_tier = 'vip')
    )
  );

CREATE POLICY "TIER3 users can create backtest configs"
  ON backtestconfigs
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.scanner_tier = 'TIER3' OR profiles.course_tier = 'TIER3' OR profiles.scanner_tier = 'vip' OR profiles.course_tier = 'vip')
    )
  );

CREATE POLICY "TIER3 users can update own backtest configs"
  ON backtestconfigs
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.scanner_tier = 'TIER3' OR profiles.course_tier = 'TIER3' OR profiles.scanner_tier = 'vip' OR profiles.course_tier = 'vip')
    )
  )
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "TIER3 users can delete own backtest configs"
  ON backtestconfigs
  FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.scanner_tier = 'TIER3' OR profiles.course_tier = 'TIER3' OR profiles.scanner_tier = 'vip' OR profiles.course_tier = 'vip')
    )
  );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE 2: backtestresults
-- Purpose: Store backtest execution results and metrics
-- Access: TIER 3 (VIP) only
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS backtestresults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID NOT NULL REFERENCES backtestconfigs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Performance metrics
  total_trades INTEGER NOT NULL DEFAULT 0,
  winning_trades INTEGER NOT NULL DEFAULT 0,
  losing_trades INTEGER NOT NULL DEFAULT 0,
  neutral_trades INTEGER NOT NULL DEFAULT 0,
  win_rate DECIMAL(5,2) NOT NULL DEFAULT 0, -- Percentage

  -- Financial metrics
  total_return DECIMAL(10,2) NOT NULL DEFAULT 0, -- Percentage
  net_profit DECIMAL(20,2) NOT NULL DEFAULT 0, -- Dollar amount
  max_drawdown DECIMAL(10,2) NOT NULL DEFAULT 0, -- Percentage
  sharpe_ratio DECIMAL(10,4), -- Risk-adjusted return
  profit_factor DECIMAL(10,4), -- Gross profit / Gross loss

  -- Risk metrics
  avg_win DECIMAL(20,2) DEFAULT 0,
  avg_loss DECIMAL(20,2) DEFAULT 0,
  largest_win DECIMAL(20,2) DEFAULT 0,
  largest_loss DECIMAL(20,2) DEFAULT 0,
  avg_rratio DECIMAL(10,2) DEFAULT 0, -- Average risk:reward ratio

  -- Trade distribution
  avg_trade_duration_hours INTEGER, -- Average bars in trade
  avg_bars_to_entry INTEGER, -- Average bars from pattern to entry

  -- Equity curve (time series)
  equity_curve JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{date, equity, drawdown}]

  -- Execution metadata
  candles_analyzed INTEGER NOT NULL DEFAULT 0,
  patterns_detected INTEGER NOT NULL DEFAULT 0,
  patterns_entered INTEGER NOT NULL DEFAULT 0, -- Patterns that met entry criteria
  execution_time_seconds INTEGER, -- How long backtest took
  status TEXT DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  error_message TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for backtestresults
CREATE INDEX idx_backtestresults_config_id ON backtestresults(config_id);
CREATE INDEX idx_backtestresults_user_id ON backtestresults(user_id);
CREATE INDEX idx_backtestresults_created_at ON backtestresults(created_at DESC);
CREATE INDEX idx_backtestresults_win_rate ON backtestresults(win_rate DESC);
CREATE INDEX idx_backtestresults_total_return ON backtestresults(total_return DESC);

-- RLS Policies (TIER 3 only)
ALTER TABLE backtestresults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TIER3 users can view own backtest results"
  ON backtestresults
  FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.scanner_tier = 'TIER3' OR profiles.course_tier = 'TIER3' OR profiles.scanner_tier = 'vip' OR profiles.course_tier = 'vip')
    )
  );

CREATE POLICY "TIER3 users can create backtest results"
  ON backtestresults
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.scanner_tier = 'TIER3' OR profiles.course_tier = 'TIER3' OR profiles.scanner_tier = 'vip' OR profiles.course_tier = 'vip')
    )
  );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE 3: backtesttrades
-- Purpose: Store individual trades from backtests for detailed analysis
-- Access: TIER 3 (VIP) only
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS backtesttrades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_id UUID NOT NULL REFERENCES backtestresults(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Trade identification
  symbol TEXT NOT NULL,
  pattern_type TEXT NOT NULL, -- 'DPD', 'UPU', 'UPD', 'DPU'
  zone_type TEXT NOT NULL CHECK (zone_type IN ('HFZ', 'LFZ')),
  trade_direction TEXT NOT NULL CHECK (trade_direction IN ('LONG', 'SHORT')),

  -- Zone information
  zone_status TEXT NOT NULL, -- 'fresh', 'tested_1x', 'tested_2x'
  zone_top DECIMAL(20,8) NOT NULL,
  zone_bottom DECIMAL(20,8) NOT NULL,
  zone_mid DECIMAL(20,8) NOT NULL,

  -- Entry details
  entry_price DECIMAL(20,8) NOT NULL,
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  entry_candle_index INTEGER NOT NULL,
  confirmation_type TEXT, -- 'BEARISH_PIN', 'BULLISH_HAMMER', etc.
  pattern_confidence INTEGER CHECK (pattern_confidence >= 0 AND pattern_confidence <= 100),

  -- Exit details
  exit_price DECIMAL(20,8) NOT NULL,
  exit_time TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_candle_index INTEGER NOT NULL,
  exit_reason TEXT NOT NULL CHECK (exit_reason IN ('TARGET_HIT', 'STOP_LOSS', 'NEUTRAL')),

  -- Trade metrics
  stop_loss DECIMAL(20,8) NOT NULL,
  target DECIMAL(20,8) NOT NULL,
  position_size DECIMAL(20,8) NOT NULL,
  risk_amount DECIMAL(20,2) NOT NULL,
  pnl DECIMAL(20,2) NOT NULL, -- Profit/Loss in dollars
  pnl_percent DECIMAL(10,4) NOT NULL, -- P&L percentage
  rratio_actual DECIMAL(10,2), -- Actual risk:reward achieved
  trade_duration_hours INTEGER NOT NULL, -- Hours in trade
  bars_to_retest INTEGER, -- Bars from pattern detection to retest

  -- Result
  result TEXT NOT NULL CHECK (result IN ('WIN', 'LOSS', 'NEUTRAL')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for backtesttrades
CREATE INDEX idx_backtesttrades_result_id ON backtesttrades(result_id);
CREATE INDEX idx_backtesttrades_user_id ON backtesttrades(user_id);
CREATE INDEX idx_backtesttrades_symbol ON backtesttrades(symbol);
CREATE INDEX idx_backtesttrades_pattern_type ON backtesttrades(pattern_type);
CREATE INDEX idx_backtesttrades_result ON backtesttrades(result);
CREATE INDEX idx_backtesttrades_zone_status ON backtesttrades(zone_status);

-- RLS Policies (TIER 3 only)
ALTER TABLE backtesttrades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TIER3 users can view own backtest trades"
  ON backtesttrades
  FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.scanner_tier = 'TIER3' OR profiles.course_tier = 'TIER3' OR profiles.scanner_tier = 'vip' OR profiles.course_tier = 'vip')
    )
  );

CREATE POLICY "TIER3 users can create backtest trades"
  ON backtesttrades
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.scanner_tier = 'TIER3' OR profiles.course_tier = 'TIER3' OR profiles.scanner_tier = 'vip' OR profiles.course_tier = 'vip')
    )
  );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE 4: ai_predictions
-- Purpose: Store AI predictions from Gemini 2.5 Flash
-- Access: TIER 3 (VIP) only
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS ai_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,

  -- Prediction data (JSONB for flexibility)
  prediction JSONB NOT NULL, -- Full prediction object from AI
  /*
    Example structure:
    {
      "confidence": 75,
      "prediction": "UP",
      "nextPrice": 45000,
      "timeframe": "4-8 hours",
      "keyLevels": {
        "support": [43500, 42000],
        "resistance": [46000, 48000]
      },
      "risk": "MEDIUM",
      "action": "LONG",
      "reasoning": "Strong UPU pattern..."
    }
  */

  -- Quick access fields (denormalized from JSONB)
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  prediction_direction TEXT CHECK (prediction_direction IN ('UP', 'DOWN', 'SIDEWAYS')),
  suggested_action TEXT CHECK (suggested_action IN ('LONG', 'SHORT', 'WAIT')),

  -- Input metadata
  candles_analyzed INTEGER NOT NULL DEFAULT 0,
  patterns_detected INTEGER NOT NULL DEFAULT 0,
  ai_model TEXT DEFAULT 'gemini-2.5-flash',

  -- Verification (to track accuracy over time)
  actual_result TEXT CHECK (actual_result IN ('CORRECT', 'INCORRECT', 'PARTIAL', NULL)),
  actual_price DECIMAL(20,8), -- Actual price after prediction timeframe
  accuracy_score INTEGER CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
  verified_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ai_predictions
CREATE INDEX idx_ai_predictions_user_id ON ai_predictions(user_id);
CREATE INDEX idx_ai_predictions_symbol ON ai_predictions(symbol);
CREATE INDEX idx_ai_predictions_created_at ON ai_predictions(created_at DESC);
CREATE INDEX idx_ai_predictions_confidence ON ai_predictions(confidence DESC);
CREATE INDEX idx_ai_predictions_direction ON ai_predictions(prediction_direction);
CREATE INDEX idx_ai_predictions_model ON ai_predictions(ai_model);

-- RLS Policies (TIER 3 only)
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TIER3 users can view own ai predictions"
  ON ai_predictions
  FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.scanner_tier = 'TIER3' OR profiles.course_tier = 'TIER3' OR profiles.scanner_tier = 'vip' OR profiles.course_tier = 'vip')
    )
  );

CREATE POLICY "TIER3 users can create ai predictions"
  ON ai_predictions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.scanner_tier = 'TIER3' OR profiles.course_tier = 'TIER3' OR profiles.scanner_tier = 'vip' OR profiles.course_tier = 'vip')
    )
  );

CREATE POLICY "TIER3 users can update own ai predictions"
  ON ai_predictions
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.scanner_tier = 'TIER3' OR profiles.course_tier = 'TIER3' OR profiles.scanner_tier = 'vip' OR profiles.course_tier = 'vip')
    )
  )
  WITH CHECK (auth.uid() = user_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE 5: whale_wallets
-- Purpose: Track top whale wallet addresses
-- Access: TIER 3 (VIP) only
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS whale_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT UNIQUE NOT NULL, -- Wallet address
  blockchain TEXT NOT NULL DEFAULT 'ETH' CHECK (blockchain IN ('BTC', 'ETH', 'BSC')),
  label TEXT, -- 'Binance Hot Wallet', 'Unknown Whale', 'Vitalik', etc.
  entity_type TEXT CHECK (entity_type IN ('exchange', 'whale', 'foundation', 'unknown')),

  -- Balance tracking
  balance DECIMAL(30, 8), -- Current balance
  balance_usd DECIMAL(20, 2), -- USD value
  rank INTEGER, -- Rank by balance (1 = largest)

  -- Metadata
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Activity stats
  total_transactions INTEGER DEFAULT 0,
  total_volume_usd DECIMAL(20, 2) DEFAULT 0
);

-- Indexes for whale_wallets
CREATE INDEX idx_whale_wallets_address ON whale_wallets(address);
CREATE INDEX idx_whale_wallets_blockchain ON whale_wallets(blockchain);
CREATE INDEX idx_whale_wallets_rank ON whale_wallets(rank);
CREATE INDEX idx_whale_wallets_balance_usd ON whale_wallets(balance_usd DESC);

-- Auto-update last_updated timestamp
CREATE OR REPLACE FUNCTION update_whale_wallets_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER whale_wallets_last_updated_trigger
  BEFORE UPDATE ON whale_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_whale_wallets_last_updated();

-- RLS Policies (TIER 3 users can read, system can write)
ALTER TABLE whale_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TIER3 users can view whale wallets"
  ON whale_wallets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.scanner_tier = 'TIER3' OR profiles.course_tier = 'TIER3' OR profiles.scanner_tier = 'vip' OR profiles.course_tier = 'vip')
    )
  );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE 6: whale_transactions
-- Purpose: Track large blockchain transactions (whale movements)
-- Access: TIER 3 (VIP) only
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS whale_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tx_hash TEXT UNIQUE NOT NULL, -- Transaction hash
  blockchain TEXT NOT NULL DEFAULT 'ETH' CHECK (blockchain IN ('BTC', 'ETH', 'BSC')),

  -- Transaction details
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  from_label TEXT, -- Label if known (e.g., 'Binance')
  to_label TEXT, -- Label if known

  -- Amount
  amount DECIMAL(30, 8) NOT NULL, -- Amount in crypto
  amount_usd DECIMAL(20, 2), -- USD value
  symbol TEXT NOT NULL, -- 'BTC', 'ETH', 'USDT'

  -- Classification
  transaction_type TEXT CHECK (transaction_type IN ('transfer', 'deposit', 'withdrawal', 'unknown')),
  market_impact TEXT DEFAULT 'LOW' CHECK (market_impact IN ('HIGH', 'MEDIUM', 'LOW')),

  -- Timestamp
  block_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Additional metadata
  block_number BIGINT,
  gas_used BIGINT,
  tx_fee DECIMAL(20, 8)
);

-- Indexes for whale_transactions
CREATE INDEX idx_whale_transactions_tx_hash ON whale_transactions(tx_hash);
CREATE INDEX idx_whale_transactions_blockchain ON whale_transactions(blockchain);
CREATE INDEX idx_whale_transactions_from_address ON whale_transactions(from_address);
CREATE INDEX idx_whale_transactions_to_address ON whale_transactions(to_address);
CREATE INDEX idx_whale_transactions_amount_usd ON whale_transactions(amount_usd DESC);
CREATE INDEX idx_whale_transactions_block_timestamp ON whale_transactions(block_timestamp DESC);
CREATE INDEX idx_whale_transactions_symbol ON whale_transactions(symbol);
CREATE INDEX idx_whale_transactions_impact ON whale_transactions(market_impact);

-- RLS Policies (TIER 3 users can read, system can write)
ALTER TABLE whale_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TIER3 users can view whale transactions"
  ON whale_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.scanner_tier = 'TIER3' OR profiles.course_tier = 'TIER3' OR profiles.scanner_tier = 'vip' OR profiles.course_tier = 'vip')
    )
  );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE 7: whale_alerts
-- Purpose: User-configured whale transaction alerts
-- Access: TIER 3 (VIP) only
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS whale_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Alert configuration
  min_amount_usd DECIMAL(20, 2) DEFAULT 1000000 CHECK (min_amount_usd > 0), -- $1M+ default
  symbols TEXT[] DEFAULT ARRAY['BTC', 'ETH'], -- Symbols to track
  blockchains TEXT[] DEFAULT ARRAY['BTC', 'ETH'], -- Blockchains to monitor
  transaction_types TEXT[] DEFAULT ARRAY['transfer', 'deposit', 'withdrawal'],

  -- Notification settings
  telegram_enabled BOOLEAN DEFAULT false,
  telegram_chat_id TEXT,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,

  -- Alert metadata
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for whale_alerts
CREATE INDEX idx_whale_alerts_user_id ON whale_alerts(user_id);
CREATE INDEX idx_whale_alerts_is_active ON whale_alerts(is_active) WHERE is_active = true;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_whale_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER whale_alerts_updated_at_trigger
  BEFORE UPDATE ON whale_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_whale_alerts_updated_at();

-- RLS Policies (TIER 3 only)
ALTER TABLE whale_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TIER3 users can view own whale alerts"
  ON whale_alerts
  FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.scanner_tier = 'TIER3' OR profiles.course_tier = 'TIER3' OR profiles.scanner_tier = 'vip' OR profiles.course_tier = 'vip')
    )
  );

CREATE POLICY "TIER3 users can create whale alerts"
  ON whale_alerts
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.scanner_tier = 'TIER3' OR profiles.course_tier = 'TIER3' OR profiles.scanner_tier = 'vip' OR profiles.course_tier = 'vip')
    )
  );

CREATE POLICY "TIER3 users can update own whale alerts"
  ON whale_alerts
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.scanner_tier = 'TIER3' OR profiles.course_tier = 'TIER3' OR profiles.scanner_tier = 'vip' OR profiles.course_tier = 'vip')
    )
  )
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "TIER3 users can delete own whale alerts"
  ON whale_alerts
  FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.scanner_tier = 'TIER3' OR profiles.course_tier = 'TIER3' OR profiles.scanner_tier = 'vip' OR profiles.course_tier = 'vip')
    )
  );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- HELPER FUNCTIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Function to get backtest summary
CREATE OR REPLACE FUNCTION get_backtest_summary(p_result_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_trades', total_trades,
    'win_rate', win_rate,
    'total_return', total_return,
    'net_profit', net_profit,
    'sharpe_ratio', sharpe_ratio,
    'max_drawdown', max_drawdown,
    'profit_factor', profit_factor
  ) INTO result
  FROM backtestresults
  WHERE id = p_result_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate AI prediction accuracy
CREATE OR REPLACE FUNCTION calculate_ai_prediction_accuracy(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  total_predictions INTEGER;
  verified_predictions INTEGER;
  correct_predictions INTEGER;
  accuracy_rate DECIMAL(5,2);
BEGIN
  -- Count total predictions
  SELECT COUNT(*) INTO total_predictions
  FROM ai_predictions
  WHERE user_id = p_user_id;

  -- Count verified predictions
  SELECT COUNT(*) INTO verified_predictions
  FROM ai_predictions
  WHERE user_id = p_user_id AND actual_result IS NOT NULL;

  -- Count correct predictions
  SELECT COUNT(*) INTO correct_predictions
  FROM ai_predictions
  WHERE user_id = p_user_id AND actual_result = 'CORRECT';

  -- Calculate accuracy
  IF verified_predictions > 0 THEN
    accuracy_rate := (correct_predictions::DECIMAL / verified_predictions::DECIMAL) * 100;
  ELSE
    accuracy_rate := 0;
  END IF;

  -- Build result
  result := jsonb_build_object(
    'total_predictions', total_predictions,
    'verified_predictions', verified_predictions,
    'correct_predictions', correct_predictions,
    'accuracy_rate', accuracy_rate
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- GRANT PERMISSIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GRANT EXECUTE ON FUNCTION get_backtest_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_ai_prediction_accuracy(UUID) TO authenticated;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- COMMENTS FOR DOCUMENTATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMMENT ON TABLE backtestconfigs IS 'Backtest strategy configurations (TIER 3 - Professional Backtesting Engine)';
COMMENT ON TABLE backtestresults IS 'Backtest execution results and performance metrics (TIER 3)';
COMMENT ON TABLE backtesttrades IS 'Individual trades from backtests for detailed analysis (TIER 3)';
COMMENT ON TABLE ai_predictions IS 'AI-powered market predictions using Gemini 2.5 Flash (TIER 3)';
COMMENT ON TABLE whale_wallets IS 'Top whale wallet addresses tracking (TIER 3 - Whale Tracker)';
COMMENT ON TABLE whale_transactions IS 'Large blockchain transactions (whale movements) (TIER 3)';
COMMENT ON TABLE whale_alerts IS 'User-configured alerts for whale transactions (TIER 3)';

COMMENT ON FUNCTION get_backtest_summary(UUID) IS 'Get summary metrics for a backtest result';
COMMENT ON FUNCTION calculate_ai_prediction_accuracy(UUID) IS 'Calculate AI prediction accuracy rate for a user';

-- ═══════════════════════════════════════════════════════════════════
-- END OF MIGRATION
-- ═══════════════════════════════════════════════════════════════════


-- ========================================

-- STEP 4: Force schema cache reload
NOTIFY pgrst, 'reload schema';

-- Wait 10 seconds for cache refresh...

-- ========================================

-- STEP 5: Grant TIER 3 access
UPDATE profiles
SET scanner_tier = 'TIER3'
WHERE email = maow390@gmail.com';
-- ========================================

-- STEP 6: Verify deployment
-- Should return 28 columns for backtestresults
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'backtestresults'
ORDER BY ordinal_position;

-- Expected columns:
-- 1. id
-- 2. config_id
-- 3. user_id
-- 4. total_trades
-- 5. winning_trades
-- 6. losing_trades
-- 7. neutral_trades
-- 8. win_rate
-- 9. total_return
-- 10. net_profit
-- 11. max_drawdown
-- 12. sharpe_ratio
-- 13. profit_factor
-- 14. avg_win
-- 15. avg_loss
-- 16. largest_win
-- 17. largest_loss
-- 18. avg_rratio
-- 19. avg_trade_duration_hours
-- 20. avg_bars_to_entry
-- 21. equity_curve
-- 22. candles_analyzed
-- 23. patterns_detected
-- 24. patterns_entered
-- 25. execution_time_seconds
-- 26. status
-- 27. error_message
-- 28. created_at

-- ========================================

-- STEP 7: Verify TIER 3 access
SELECT id, email, scanner_tier, course_tier
FROM profiles
WHERE id = auth.uid();

-- Expected: scanner_tier should be 'TIER3'

-- ========================================

-- ✅ DEPLOYMENT COMPLETE!
-- Test at: http://localhost:5173/tier3/backtesting
-- ========================================
