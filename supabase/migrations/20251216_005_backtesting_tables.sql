-- supabase/migrations/20251216_005_backtesting_tables.sql
-- Tables cho Backtesting Engine
-- GEMRAL AI BRAIN - Phase 7

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. HISTORICAL CANDLES - Cache historical data
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_historical_candles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  exchange TEXT DEFAULT 'binance',

  -- Candle data
  open_time TIMESTAMPTZ NOT NULL,
  open FLOAT NOT NULL,
  high FLOAT NOT NULL,
  low FLOAT NOT NULL,
  close FLOAT NOT NULL,
  volume FLOAT NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(symbol, timeframe, exchange, open_time)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_ai_historical_candles_symbol_time
  ON ai_historical_candles(symbol, timeframe, open_time DESC);
CREATE INDEX IF NOT EXISTS idx_ai_historical_candles_open_time
  ON ai_historical_candles(open_time DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. BACKTEST RUNS - Mỗi lần chạy backtest
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_backtest_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Configuration
  name TEXT NOT NULL,
  description TEXT,

  -- Scope
  pattern_ids UUID[],                -- NULL = all patterns
  symbols TEXT[],                    -- NULL = all symbols
  timeframes TEXT[],                 -- NULL = all timeframes

  -- Time range
  date_from TIMESTAMPTZ NOT NULL,
  date_to TIMESTAMPTZ NOT NULL,

  -- Trading parameters
  initial_capital FLOAT DEFAULT 10000,
  position_size_type TEXT DEFAULT 'percent' CHECK (position_size_type IN ('fixed', 'percent', 'kelly')),
  position_size_value FLOAT DEFAULT 2,  -- 2% per trade
  max_concurrent_trades INTEGER DEFAULT 5,

  -- Risk parameters
  use_stop_loss BOOLEAN DEFAULT true,
  stop_loss_type TEXT DEFAULT 'pattern' CHECK (stop_loss_type IN ('pattern', 'atr', 'percent', 'fixed')),
  stop_loss_value FLOAT,

  use_take_profit BOOLEAN DEFAULT true,
  take_profit_type TEXT DEFAULT 'pattern' CHECK (take_profit_type IN ('pattern', 'rr_ratio', 'percent', 'trailing')),
  take_profit_value FLOAT,

  -- Filter settings (CRITICAL for win rate)
  use_filters BOOLEAN DEFAULT true,
  filter_config JSONB DEFAULT '{}',
  min_score_threshold FLOAT DEFAULT 0.5,
  require_zone_retest BOOLEAN DEFAULT true,  -- KEY for 68%+ win rate

  -- Results (filled after completion)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  progress_percent INTEGER DEFAULT 0,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_ai_backtest_runs_status ON ai_backtest_runs(status);
CREATE INDEX IF NOT EXISTS idx_ai_backtest_runs_created ON ai_backtest_runs(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. BACKTEST TRADES - Chi tiết từng trade trong backtest
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_backtest_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES ai_backtest_runs(id) ON DELETE CASCADE,

  -- Trade identity
  trade_number INTEGER NOT NULL,

  -- Pattern info
  pattern_id UUID REFERENCES ai_pattern_definitions(id),
  pattern_code TEXT NOT NULL,
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,

  -- Entry
  entry_time TIMESTAMPTZ NOT NULL,
  entry_price FLOAT NOT NULL,
  entry_score FLOAT,
  entry_reason TEXT,

  -- Position
  direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
  position_size FLOAT NOT NULL,
  position_value FLOAT NOT NULL,

  -- Exit
  exit_time TIMESTAMPTZ,
  exit_price FLOAT,
  exit_reason TEXT CHECK (exit_reason IN ('take_profit', 'stop_loss', 'trailing_stop', 'signal_exit', 'time_exit', 'manual')),

  -- Results
  profit_loss FLOAT,
  profit_loss_percent FLOAT,
  outcome TEXT CHECK (outcome IN ('win', 'loss', 'breakeven', 'open')),

  -- Risk metrics
  max_favorable_excursion FLOAT,      -- Maximum profit during trade
  max_adverse_excursion FLOAT,        -- Maximum loss during trade
  risk_reward_actual FLOAT,

  -- Duration
  duration_candles INTEGER,
  duration_hours FLOAT,

  -- Zone Retest info
  had_zone_retest BOOLEAN DEFAULT false,
  retest_quality FLOAT,

  -- Features at entry (for analysis)
  entry_features JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_backtest_trades_run ON ai_backtest_trades(run_id);
CREATE INDEX IF NOT EXISTS idx_ai_backtest_trades_pattern ON ai_backtest_trades(pattern_code);
CREATE INDEX IF NOT EXISTS idx_ai_backtest_trades_outcome ON ai_backtest_trades(outcome);
CREATE INDEX IF NOT EXISTS idx_ai_backtest_trades_entry_time ON ai_backtest_trades(entry_time);
CREATE INDEX IF NOT EXISTS idx_ai_backtest_trades_retest ON ai_backtest_trades(had_zone_retest);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. BACKTEST SUMMARY - Tổng kết mỗi backtest run
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_backtest_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL UNIQUE REFERENCES ai_backtest_runs(id) ON DELETE CASCADE,

  -- Trade counts
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  breakeven_trades INTEGER DEFAULT 0,

  -- Win rate
  win_rate FLOAT DEFAULT 0,
  win_rate_long FLOAT,
  win_rate_short FLOAT,
  win_rate_with_retest FLOAT,      -- Win rate for trades with zone retest
  win_rate_without_retest FLOAT,   -- Win rate for trades without zone retest

  -- Profit/Loss
  total_profit_loss FLOAT DEFAULT 0,
  total_profit_loss_percent FLOAT DEFAULT 0,
  gross_profit FLOAT DEFAULT 0,
  gross_loss FLOAT DEFAULT 0,

  -- Averages
  avg_win FLOAT,
  avg_loss FLOAT,
  avg_win_percent FLOAT,
  avg_loss_percent FLOAT,
  avg_trade_duration_hours FLOAT,

  -- Extremes
  largest_win FLOAT,
  largest_loss FLOAT,
  largest_win_percent FLOAT,
  largest_loss_percent FLOAT,
  max_consecutive_wins INTEGER,
  max_consecutive_losses INTEGER,

  -- Risk metrics
  profit_factor FLOAT,                -- gross_profit / gross_loss
  sharpe_ratio FLOAT,
  sortino_ratio FLOAT,
  calmar_ratio FLOAT,

  -- Drawdown
  max_drawdown FLOAT,
  max_drawdown_percent FLOAT,
  max_drawdown_duration_days FLOAT,
  avg_drawdown FLOAT,

  -- Capital curve
  final_capital FLOAT,
  peak_capital FLOAT,
  lowest_capital FLOAT,

  -- Monthly breakdown
  monthly_returns JSONB DEFAULT '{}',

  -- Pattern breakdown
  pattern_breakdown JSONB DEFAULT '{}',

  -- Symbol breakdown
  symbol_breakdown JSONB DEFAULT '{}',

  -- Equity curve (sampled points)
  equity_curve JSONB DEFAULT '[]',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. PARAMETER OPTIMIZATION RESULTS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_parameter_optimization_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Optimization scope
  pattern_id UUID REFERENCES ai_pattern_definitions(id),
  optimization_type TEXT NOT NULL CHECK (optimization_type IN (
    'detection_params',    -- Pattern detection parameters
    'filter_thresholds',   -- Filter threshold values
    'entry_rules',         -- Entry timing rules
    'exit_rules',          -- Exit rules (SL, TP)
    'position_sizing'      -- Position size optimization
  )),

  -- Test configuration
  date_from TIMESTAMPTZ NOT NULL,
  date_to TIMESTAMPTZ NOT NULL,
  symbols_tested TEXT[],
  timeframes_tested TEXT[],

  -- Parameters tested
  parameter_ranges JSONB NOT NULL,

  -- Results
  total_combinations_tested INTEGER,
  best_parameters JSONB,
  best_win_rate FLOAT,
  best_profit_factor FLOAT,
  best_sharpe FLOAT,

  -- Top 10 combinations
  top_results JSONB DEFAULT '[]',

  -- Statistical analysis
  parameter_sensitivity JSONB DEFAULT '{}',
  correlation_matrix JSONB DEFAULT '{}',

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Historical candles: Service role only (internal data)
ALTER TABLE ai_historical_candles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only candles" ON ai_historical_candles;
CREATE POLICY "Service role only candles" ON ai_historical_candles
  FOR ALL USING (auth.role() = 'service_role');

-- Backtest runs: Users see own, admins see all
ALTER TABLE ai_backtest_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own backtests" ON ai_backtest_runs;
CREATE POLICY "Users can view own backtests" ON ai_backtest_runs
  FOR SELECT USING (auth.uid() = created_by OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can create backtests" ON ai_backtest_runs;
CREATE POLICY "Users can create backtests" ON ai_backtest_runs
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Service role can manage all runs" ON ai_backtest_runs;
CREATE POLICY "Service role can manage all runs" ON ai_backtest_runs
  FOR ALL USING (auth.role() = 'service_role');

-- Backtest trades: Same as runs
ALTER TABLE ai_backtest_trades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own trades" ON ai_backtest_trades;
CREATE POLICY "Users can view own trades" ON ai_backtest_trades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ai_backtest_runs
      WHERE id = ai_backtest_trades.run_id
      AND (created_by = auth.uid() OR auth.role() = 'service_role')
    )
  );

DROP POLICY IF EXISTS "Service role can manage all trades" ON ai_backtest_trades;
CREATE POLICY "Service role can manage all trades" ON ai_backtest_trades
  FOR ALL USING (auth.role() = 'service_role');

-- Summaries: Same as runs
ALTER TABLE ai_backtest_summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own summaries" ON ai_backtest_summaries;
CREATE POLICY "Users can view own summaries" ON ai_backtest_summaries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ai_backtest_runs
      WHERE id = ai_backtest_summaries.run_id
      AND (created_by = auth.uid() OR auth.role() = 'service_role')
    )
  );

DROP POLICY IF EXISTS "Service role can manage all summaries" ON ai_backtest_summaries;
CREATE POLICY "Service role can manage all summaries" ON ai_backtest_summaries
  FOR ALL USING (auth.role() = 'service_role');

-- Parameter optimization: Service role only
ALTER TABLE ai_parameter_optimization_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only optimization" ON ai_parameter_optimization_results;
CREATE POLICY "Service role only optimization" ON ai_parameter_optimization_results
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Function: Get candles for backtesting
CREATE OR REPLACE FUNCTION get_candles_for_backtest(
  p_symbol TEXT,
  p_timeframe TEXT,
  p_from TIMESTAMPTZ,
  p_to TIMESTAMPTZ
)
RETURNS TABLE (
  open_time TIMESTAMPTZ,
  open FLOAT,
  high FLOAT,
  low FLOAT,
  close FLOAT,
  volume FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    hc.open_time,
    hc.open,
    hc.high,
    hc.low,
    hc.close,
    hc.volume
  FROM ai_historical_candles hc
  WHERE
    hc.symbol = p_symbol
    AND hc.timeframe = p_timeframe
    AND hc.open_time >= p_from
    AND hc.open_time <= p_to
  ORDER BY hc.open_time ASC;
END;
$$;

-- Function: Calculate backtest summary
CREATE OR REPLACE FUNCTION calculate_backtest_summary(p_run_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total INTEGER;
  v_wins INTEGER;
  v_losses INTEGER;
  v_gross_profit FLOAT;
  v_gross_loss FLOAT;
  v_win_rate_with_retest FLOAT;
  v_win_rate_without_retest FLOAT;
BEGIN
  -- Get basic counts
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE outcome = 'win'),
    COUNT(*) FILTER (WHERE outcome = 'loss'),
    COALESCE(SUM(profit_loss) FILTER (WHERE profit_loss > 0), 0),
    COALESCE(ABS(SUM(profit_loss) FILTER (WHERE profit_loss < 0)), 0)
  INTO v_total, v_wins, v_losses, v_gross_profit, v_gross_loss
  FROM ai_backtest_trades
  WHERE run_id = p_run_id AND outcome IN ('win', 'loss', 'breakeven');

  -- Calculate win rate with/without zone retest
  SELECT
    COALESCE(
      COUNT(*) FILTER (WHERE outcome = 'win')::FLOAT /
      NULLIF(COUNT(*) FILTER (WHERE outcome IN ('win', 'loss')), 0),
      0
    )
  INTO v_win_rate_with_retest
  FROM ai_backtest_trades
  WHERE run_id = p_run_id AND had_zone_retest = true;

  SELECT
    COALESCE(
      COUNT(*) FILTER (WHERE outcome = 'win')::FLOAT /
      NULLIF(COUNT(*) FILTER (WHERE outcome IN ('win', 'loss')), 0),
      0
    )
  INTO v_win_rate_without_retest
  FROM ai_backtest_trades
  WHERE run_id = p_run_id AND (had_zone_retest = false OR had_zone_retest IS NULL);

  -- Insert or update summary
  INSERT INTO ai_backtest_summaries (
    run_id,
    total_trades,
    winning_trades,
    losing_trades,
    win_rate,
    win_rate_with_retest,
    win_rate_without_retest,
    gross_profit,
    gross_loss,
    total_profit_loss,
    profit_factor,
    avg_win,
    avg_loss
  )
  SELECT
    p_run_id,
    v_total,
    v_wins,
    v_losses,
    CASE WHEN v_total > 0 THEN v_wins::FLOAT / v_total ELSE 0 END,
    v_win_rate_with_retest,
    v_win_rate_without_retest,
    v_gross_profit,
    v_gross_loss,
    v_gross_profit - v_gross_loss,
    CASE WHEN v_gross_loss > 0 THEN v_gross_profit / v_gross_loss ELSE 0 END,
    CASE WHEN v_wins > 0 THEN v_gross_profit / v_wins ELSE 0 END,
    CASE WHEN v_losses > 0 THEN v_gross_loss / v_losses ELSE 0 END
  ON CONFLICT (run_id) DO UPDATE SET
    total_trades = EXCLUDED.total_trades,
    winning_trades = EXCLUDED.winning_trades,
    losing_trades = EXCLUDED.losing_trades,
    win_rate = EXCLUDED.win_rate,
    win_rate_with_retest = EXCLUDED.win_rate_with_retest,
    win_rate_without_retest = EXCLUDED.win_rate_without_retest,
    gross_profit = EXCLUDED.gross_profit,
    gross_loss = EXCLUDED.gross_loss,
    total_profit_loss = EXCLUDED.total_profit_loss,
    profit_factor = EXCLUDED.profit_factor,
    avg_win = EXCLUDED.avg_win,
    avg_loss = EXCLUDED.avg_loss,
    updated_at = NOW();
END;
$$;

-- Function: Get win rate comparison (with vs without zone retest)
CREATE OR REPLACE FUNCTION get_zone_retest_impact(p_days_back INTEGER DEFAULT 90)
RETURNS TABLE (
  pattern_code TEXT,
  total_trades INTEGER,
  trades_with_retest INTEGER,
  trades_without_retest INTEGER,
  win_rate_with_retest FLOAT,
  win_rate_without_retest FLOAT,
  improvement_percent FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH trade_stats AS (
    SELECT
      t.pattern_code,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE pf.has_zone_retest = true) AS with_retest,
      COUNT(*) FILTER (WHERE pf.has_zone_retest = false OR pf.has_zone_retest IS NULL) AS without_retest,
      COUNT(*) FILTER (WHERE t.outcome = 'win' AND pf.has_zone_retest = true) AS wins_with_retest,
      COUNT(*) FILTER (WHERE t.outcome IN ('win', 'loss') AND pf.has_zone_retest = true) AS total_with_retest,
      COUNT(*) FILTER (WHERE t.outcome = 'win' AND (pf.has_zone_retest = false OR pf.has_zone_retest IS NULL)) AS wins_without_retest,
      COUNT(*) FILTER (WHERE t.outcome IN ('win', 'loss') AND (pf.has_zone_retest = false OR pf.has_zone_retest IS NULL)) AS total_without_retest
    FROM ai_pattern_detections t
    LEFT JOIN pattern_features pf ON pf.detection_id = t.id
    WHERE
      t.outcome IN ('win', 'loss')
      AND t.detected_at > NOW() - (p_days_back || ' days')::INTERVAL
    GROUP BY t.pattern_code
  )
  SELECT
    ts.pattern_code,
    ts.total::INTEGER,
    ts.with_retest::INTEGER,
    ts.without_retest::INTEGER,
    CASE WHEN ts.total_with_retest > 0 THEN ts.wins_with_retest::FLOAT / ts.total_with_retest ELSE 0 END,
    CASE WHEN ts.total_without_retest > 0 THEN ts.wins_without_retest::FLOAT / ts.total_without_retest ELSE 0 END,
    CASE
      WHEN ts.total_with_retest > 0 AND ts.total_without_retest > 0
      THEN (ts.wins_with_retest::FLOAT / ts.total_with_retest - ts.wins_without_retest::FLOAT / ts.total_without_retest) * 100
      ELSE 0
    END
  FROM trade_stats ts
  ORDER BY ts.total DESC;
END;
$$;
