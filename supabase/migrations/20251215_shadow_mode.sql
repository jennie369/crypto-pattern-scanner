-- =====================================================
-- SHADOW MODE SYSTEM MIGRATION
-- Compare paper trades vs real trades from Binance
-- =====================================================

-- =====================================================
-- 1. USER EXCHANGE CONNECTIONS TABLE
-- Store encrypted API credentials (READ-ONLY only)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_exchange_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange VARCHAR(50) NOT NULL DEFAULT 'binance',
  api_key_encrypted TEXT NOT NULL,
  api_secret_encrypted TEXT NOT NULL,
  is_read_only BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  permissions JSONB DEFAULT '[]'::JSONB,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  sync_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one connection per exchange per user
  UNIQUE(user_id, exchange),

  -- Must be read-only for security
  CONSTRAINT check_read_only CHECK (is_read_only = TRUE)
);

-- Enable RLS
ALTER TABLE public.user_exchange_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own connections"
  ON public.user_exchange_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections"
  ON public.user_exchange_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON public.user_exchange_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON public.user_exchange_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_exchange_connections_user ON public.user_exchange_connections(user_id);

-- =====================================================
-- 2. REAL TRADES TABLE
-- Store synced trades from Binance
-- =====================================================

CREATE TABLE IF NOT EXISTS public.real_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.user_exchange_connections(id) ON DELETE SET NULL,
  exchange VARCHAR(50) NOT NULL DEFAULT 'binance',
  exchange_trade_id VARCHAR(100),
  exchange_order_id VARCHAR(100),
  symbol VARCHAR(50) NOT NULL,
  side VARCHAR(10) NOT NULL, -- BUY or SELL
  trade_type VARCHAR(20) DEFAULT 'SPOT', -- SPOT, FUTURES, MARGIN
  entry_price DECIMAL(20, 8) NOT NULL,
  exit_price DECIMAL(20, 8),
  quantity DECIMAL(20, 8) NOT NULL,
  quote_quantity DECIMAL(20, 8),
  commission DECIMAL(20, 8) DEFAULT 0,
  commission_asset VARCHAR(20),
  realized_pnl DECIMAL(20, 8),
  realized_pnl_percent DECIMAL(10, 4),
  is_maker BOOLEAN DEFAULT FALSE,
  trade_time TIMESTAMPTZ NOT NULL,
  close_time TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'open', -- open, closed, cancelled
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint for exchange trade
  UNIQUE(user_id, exchange, exchange_trade_id)
);

-- Enable RLS
ALTER TABLE public.real_trades ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own real trades"
  ON public.real_trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert real trades"
  ON public.real_trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service can update real trades"
  ON public.real_trades FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_real_trades_user ON public.real_trades(user_id);
CREATE INDEX idx_real_trades_symbol ON public.real_trades(symbol);
CREATE INDEX idx_real_trades_time ON public.real_trades(trade_time DESC);
CREATE INDEX idx_real_trades_status ON public.real_trades(status);

-- =====================================================
-- 3. SHADOW REPORTS TABLE
-- Store weekly/monthly comparison reports
-- =====================================================

CREATE TABLE IF NOT EXISTS public.shadow_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type VARCHAR(20) NOT NULL DEFAULT 'weekly', -- weekly, monthly, custom
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Paper trade stats
  paper_trades_count INT DEFAULT 0,
  paper_total_pnl DECIMAL(20, 8) DEFAULT 0,
  paper_win_rate DECIMAL(5, 2) DEFAULT 0,
  paper_avg_win DECIMAL(20, 8) DEFAULT 0,
  paper_avg_loss DECIMAL(20, 8) DEFAULT 0,
  paper_best_trade DECIMAL(20, 8) DEFAULT 0,
  paper_worst_trade DECIMAL(20, 8) DEFAULT 0,
  paper_profit_factor DECIMAL(10, 4) DEFAULT 0,

  -- Real trade stats
  real_trades_count INT DEFAULT 0,
  real_total_pnl DECIMAL(20, 8) DEFAULT 0,
  real_win_rate DECIMAL(5, 2) DEFAULT 0,
  real_avg_win DECIMAL(20, 8) DEFAULT 0,
  real_avg_loss DECIMAL(20, 8) DEFAULT 0,
  real_best_trade DECIMAL(20, 8) DEFAULT 0,
  real_worst_trade DECIMAL(20, 8) DEFAULT 0,
  real_profit_factor DECIMAL(10, 4) DEFAULT 0,

  -- Gap analysis
  pnl_gap_percent DECIMAL(10, 4) DEFAULT 0,
  win_rate_gap DECIMAL(5, 2) DEFAULT 0,
  consistency_score DECIMAL(5, 2) DEFAULT 0, -- 0-100

  -- AI analysis
  ai_analysis TEXT,
  ai_issues JSONB DEFAULT '[]'::JSONB,
  ai_recommendations JSONB DEFAULT '[]'::JSONB,
  ai_severity VARCHAR(20) DEFAULT 'info', -- info, warning, critical

  -- Karma impact
  karma_adjustment INT DEFAULT 0,
  karma_reason TEXT,

  is_reviewed BOOLEAN DEFAULT FALSE,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.shadow_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own shadow reports"
  ON public.shadow_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert shadow reports"
  ON public.shadow_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shadow reports"
  ON public.shadow_reports FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_shadow_reports_user ON public.shadow_reports(user_id);
CREATE INDEX idx_shadow_reports_period ON public.shadow_reports(period_start, period_end);
CREATE INDEX idx_shadow_reports_type ON public.shadow_reports(report_type);

-- =====================================================
-- 4. RPC FUNCTIONS
-- =====================================================

-- Function to get exchange connection status
CREATE OR REPLACE FUNCTION get_exchange_connection(p_user_id UUID, p_exchange VARCHAR DEFAULT 'binance')
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_connection RECORD;
BEGIN
  SELECT *
  INTO v_connection
  FROM public.user_exchange_connections
  WHERE user_id = p_user_id AND exchange = p_exchange;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'connected', false,
      'exchange', p_exchange
    );
  END IF;

  RETURN jsonb_build_object(
    'connected', true,
    'exchange', v_connection.exchange,
    'is_verified', v_connection.is_verified,
    'last_sync_at', v_connection.last_sync_at,
    'sync_status', v_connection.sync_status,
    'last_error', v_connection.last_error,
    'permissions', v_connection.permissions
  );
END;
$$;

-- Function to get comparison stats
CREATE OR REPLACE FUNCTION get_shadow_comparison_stats(
  p_user_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_paper_stats RECORD;
  v_real_stats RECORD;
  v_pnl_gap DECIMAL;
  v_win_rate_gap DECIMAL;
BEGIN
  -- Get paper trade stats
  SELECT
    COUNT(*) as count,
    COALESCE(SUM(realized_pnl), 0) as total_pnl,
    COALESCE(AVG(CASE WHEN realized_pnl > 0 THEN realized_pnl END), 0) as avg_win,
    COALESCE(AVG(CASE WHEN realized_pnl < 0 THEN realized_pnl END), 0) as avg_loss,
    CASE WHEN COUNT(*) > 0
      THEN (COUNT(*) FILTER (WHERE realized_pnl > 0)::DECIMAL / COUNT(*)::DECIMAL * 100)
      ELSE 0
    END as win_rate
  INTO v_paper_stats
  FROM public.paper_trades
  WHERE user_id = p_user_id
    AND status = 'closed'
    AND closed_at >= p_start_date
    AND closed_at <= p_end_date + INTERVAL '1 day';

  -- Get real trade stats
  SELECT
    COUNT(*) as count,
    COALESCE(SUM(realized_pnl), 0) as total_pnl,
    COALESCE(AVG(CASE WHEN realized_pnl > 0 THEN realized_pnl END), 0) as avg_win,
    COALESCE(AVG(CASE WHEN realized_pnl < 0 THEN realized_pnl END), 0) as avg_loss,
    CASE WHEN COUNT(*) > 0
      THEN (COUNT(*) FILTER (WHERE realized_pnl > 0)::DECIMAL / COUNT(*)::DECIMAL * 100)
      ELSE 0
    END as win_rate
  INTO v_real_stats
  FROM public.real_trades
  WHERE user_id = p_user_id
    AND status = 'closed'
    AND trade_time >= p_start_date
    AND trade_time <= p_end_date + INTERVAL '1 day';

  -- Calculate gaps
  v_pnl_gap := CASE
    WHEN v_paper_stats.total_pnl != 0
    THEN ((v_real_stats.total_pnl - v_paper_stats.total_pnl) / ABS(v_paper_stats.total_pnl)) * 100
    ELSE 0
  END;

  v_win_rate_gap := v_real_stats.win_rate - v_paper_stats.win_rate;

  RETURN jsonb_build_object(
    'period', jsonb_build_object('start', p_start_date, 'end', p_end_date),
    'paper', jsonb_build_object(
      'count', v_paper_stats.count,
      'total_pnl', ROUND(v_paper_stats.total_pnl::NUMERIC, 2),
      'win_rate', ROUND(v_paper_stats.win_rate::NUMERIC, 2),
      'avg_win', ROUND(v_paper_stats.avg_win::NUMERIC, 2),
      'avg_loss', ROUND(v_paper_stats.avg_loss::NUMERIC, 2)
    ),
    'real', jsonb_build_object(
      'count', v_real_stats.count,
      'total_pnl', ROUND(v_real_stats.total_pnl::NUMERIC, 2),
      'win_rate', ROUND(v_real_stats.win_rate::NUMERIC, 2),
      'avg_win', ROUND(v_real_stats.avg_win::NUMERIC, 2),
      'avg_loss', ROUND(v_real_stats.avg_loss::NUMERIC, 2)
    ),
    'gaps', jsonb_build_object(
      'pnl_gap_percent', ROUND(v_pnl_gap::NUMERIC, 2),
      'win_rate_gap', ROUND(v_win_rate_gap::NUMERIC, 2)
    )
  );
END;
$$;

-- Function to generate shadow report
CREATE OR REPLACE FUNCTION generate_shadow_report(
  p_user_id UUID,
  p_report_type VARCHAR DEFAULT 'weekly'
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
  v_stats JSONB;
  v_report_id UUID;
  v_issues JSONB := '[]'::JSONB;
  v_recommendations JSONB := '[]'::JSONB;
  v_severity VARCHAR := 'info';
  v_pnl_gap DECIMAL;
  v_win_rate_gap DECIMAL;
BEGIN
  -- Calculate period
  IF p_report_type = 'weekly' THEN
    v_start_date := CURRENT_DATE - INTERVAL '7 days';
    v_end_date := CURRENT_DATE;
  ELSIF p_report_type = 'monthly' THEN
    v_start_date := CURRENT_DATE - INTERVAL '30 days';
    v_end_date := CURRENT_DATE;
  ELSE
    v_start_date := CURRENT_DATE - INTERVAL '7 days';
    v_end_date := CURRENT_DATE;
  END IF;

  -- Get comparison stats
  v_stats := get_shadow_comparison_stats(p_user_id, v_start_date, v_end_date);

  -- Extract gaps
  v_pnl_gap := (v_stats->'gaps'->>'pnl_gap_percent')::DECIMAL;
  v_win_rate_gap := (v_stats->'gaps'->>'win_rate_gap')::DECIMAL;

  -- Analyze issues
  IF v_pnl_gap < -20 THEN
    v_issues := v_issues || jsonb_build_array(jsonb_build_object(
      'type', 'pnl_underperform',
      'severity', 'warning',
      'message', 'Lợi nhuận thực tế thấp hơn Paper Trade > 20%'
    ));
    v_severity := 'warning';
  END IF;

  IF v_win_rate_gap < -10 THEN
    v_issues := v_issues || jsonb_build_array(jsonb_build_object(
      'type', 'win_rate_underperform',
      'severity', 'warning',
      'message', 'Tỷ lệ thắng thực tế thấp hơn Paper Trade > 10%'
    ));
    IF v_severity = 'info' THEN v_severity := 'warning'; END IF;
  END IF;

  IF v_pnl_gap < -50 OR v_win_rate_gap < -25 THEN
    v_severity := 'critical';
  END IF;

  -- Add recommendations
  IF jsonb_array_length(v_issues) > 0 THEN
    v_recommendations := v_recommendations || jsonb_build_array(
      jsonb_build_object('action', 'review_emotions', 'message', 'Xem lại tâm lý khi giao dịch thực'),
      jsonb_build_object('action', 'reduce_size', 'message', 'Giảm size giao dịch thực'),
      jsonb_build_object('action', 'follow_rules', 'message', 'Tuân thủ đúng kế hoạch như Paper Trade')
    );
  END IF;

  -- Create report
  INSERT INTO public.shadow_reports (
    user_id,
    report_type,
    period_start,
    period_end,
    paper_trades_count,
    paper_total_pnl,
    paper_win_rate,
    paper_avg_win,
    paper_avg_loss,
    real_trades_count,
    real_total_pnl,
    real_win_rate,
    real_avg_win,
    real_avg_loss,
    pnl_gap_percent,
    win_rate_gap,
    ai_issues,
    ai_recommendations,
    ai_severity
  )
  VALUES (
    p_user_id,
    p_report_type,
    v_start_date,
    v_end_date,
    (v_stats->'paper'->>'count')::INT,
    (v_stats->'paper'->>'total_pnl')::DECIMAL,
    (v_stats->'paper'->>'win_rate')::DECIMAL,
    (v_stats->'paper'->>'avg_win')::DECIMAL,
    (v_stats->'paper'->>'avg_loss')::DECIMAL,
    (v_stats->'real'->>'count')::INT,
    (v_stats->'real'->>'total_pnl')::DECIMAL,
    (v_stats->'real'->>'win_rate')::DECIMAL,
    (v_stats->'real'->>'avg_win')::DECIMAL,
    (v_stats->'real'->>'avg_loss')::DECIMAL,
    v_pnl_gap,
    v_win_rate_gap,
    v_issues,
    v_recommendations,
    v_severity
  )
  RETURNING id INTO v_report_id;

  RETURN v_report_id;
END;
$$;

-- Function to get recent shadow reports
CREATE OR REPLACE FUNCTION get_shadow_reports(
  p_user_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_reports JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'report_type', report_type,
      'period_start', period_start,
      'period_end', period_end,
      'paper_pnl', paper_total_pnl,
      'real_pnl', real_total_pnl,
      'pnl_gap_percent', pnl_gap_percent,
      'win_rate_gap', win_rate_gap,
      'ai_severity', ai_severity,
      'created_at', created_at
    ) ORDER BY created_at DESC
  ), '[]'::JSONB)
  INTO v_reports
  FROM public.shadow_reports
  WHERE user_id = p_user_id
  LIMIT p_limit;

  RETURN v_reports;
END;
$$;

-- =====================================================
-- 5. UPDATE DATABASE SCHEMA DOC
-- =====================================================

COMMENT ON TABLE public.user_exchange_connections IS 'Store encrypted Binance API keys for Shadow Mode (READ-ONLY only)';
COMMENT ON TABLE public.real_trades IS 'Synced real trades from Binance for comparison with paper trades';
COMMENT ON TABLE public.shadow_reports IS 'Weekly/monthly reports comparing paper vs real trade performance';
