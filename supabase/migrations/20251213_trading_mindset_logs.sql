-- =====================================================
-- TRADING MINDSET ADVISOR - DATABASE SCHEMA
-- Date: 2025-12-13
-- Purpose: Track psychological assessments before trading
-- =====================================================

-- Trading Mindset Assessment Logs
CREATE TABLE IF NOT EXISTS trading_mindset_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Emotional Assessment (40% weight)
  emotional_score DECIMAL(5,2) NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('calm', 'neutral', 'anxious', 'excited')),
  energy_level INT NOT NULL CHECK (energy_level BETWEEN 1 AND 5),
  sleep_quality TEXT CHECK (sleep_quality IN ('good', 'average', 'poor')),
  fomo_level INT CHECK (fomo_level BETWEEN 1 AND 5),
  revenge_trading_urge INT CHECK (revenge_trading_urge BETWEEN 1 AND 5),

  -- History Score (30% weight) - Calculated from paperTradeService
  history_score DECIMAL(5,2) NOT NULL,
  recent_win_rate DECIMAL(5,2),
  last_5_trades_result TEXT, -- 'WWLWL' etc.
  current_trade_streak INT DEFAULT 0,

  -- Discipline Score (30% weight) - From gamificationService
  discipline_score DECIMAL(5,2) NOT NULL,
  affirmation_done BOOLEAN DEFAULT FALSE,
  habit_done BOOLEAN DEFAULT FALSE,
  goal_done BOOLEAN DEFAULT FALSE,
  action_done BOOLEAN DEFAULT FALSE,
  combo_count INT DEFAULT 0,

  -- Final Score & Recommendation
  total_score DECIMAL(5,2) NOT NULL,
  recommendation TEXT NOT NULL CHECK (recommendation IN ('ready', 'prepare', 'caution', 'stop')),
  recommendation_message TEXT,

  -- Context
  pattern_symbol TEXT,
  pattern_type TEXT,
  pattern_timeframe TEXT,
  source_screen TEXT CHECK (source_screen IN ('paper_trade_modal', 'gemmaster', 'quick_action', 'scanner')),

  -- Action taken
  user_decision TEXT CHECK (user_decision IN ('proceed', 'skip', 'breathe', 'consult')),
  proceeded_to_trade BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mindset_logs_user ON trading_mindset_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mindset_logs_date ON trading_mindset_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mindset_logs_recommendation ON trading_mindset_logs(recommendation);
CREATE INDEX IF NOT EXISTS idx_mindset_logs_user_date ON trading_mindset_logs(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE trading_mindset_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own mindset logs
CREATE POLICY "Users view own mindset logs" ON trading_mindset_logs
FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own mindset logs
CREATE POLICY "Users insert own mindset logs" ON trading_mindset_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role has full access (for analytics)
CREATE POLICY "Service role mindset logs" ON trading_mindset_logs
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- RPC FUNCTIONS
-- =====================================================

-- Get user's mindset assessment history
CREATE OR REPLACE FUNCTION get_mindset_history(
  p_user_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  total_score DECIMAL,
  emotional_score DECIMAL,
  history_score DECIMAL,
  discipline_score DECIMAL,
  recommendation TEXT,
  pattern_symbol TEXT,
  proceeded_to_trade BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.total_score,
    m.emotional_score,
    m.history_score,
    m.discipline_score,
    m.recommendation,
    m.pattern_symbol,
    m.proceeded_to_trade,
    m.created_at
  FROM trading_mindset_logs m
  WHERE m.user_id = p_user_id
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get mindset statistics for a user
CREATE OR REPLACE FUNCTION get_mindset_stats(
  p_user_id UUID,
  p_days INT DEFAULT 30
)
RETURNS TABLE (
  total_assessments BIGINT,
  avg_score DECIMAL,
  ready_count BIGINT,
  prepare_count BIGINT,
  caution_count BIGINT,
  stop_count BIGINT,
  proceeded_when_ready BIGINT,
  proceeded_when_not_ready BIGINT,
  compliance_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_assessments,
    ROUND(AVG(m.total_score)::DECIMAL, 1) as avg_score,
    COUNT(*) FILTER (WHERE m.recommendation = 'ready')::BIGINT as ready_count,
    COUNT(*) FILTER (WHERE m.recommendation = 'prepare')::BIGINT as prepare_count,
    COUNT(*) FILTER (WHERE m.recommendation = 'caution')::BIGINT as caution_count,
    COUNT(*) FILTER (WHERE m.recommendation = 'stop')::BIGINT as stop_count,
    COUNT(*) FILTER (WHERE m.recommendation = 'ready' AND m.proceeded_to_trade = TRUE)::BIGINT as proceeded_when_ready,
    COUNT(*) FILTER (WHERE m.recommendation IN ('caution', 'stop') AND m.proceeded_to_trade = TRUE)::BIGINT as proceeded_when_not_ready,
    ROUND(
      (COUNT(*) FILTER (WHERE m.recommendation = 'ready' AND m.proceeded_to_trade = TRUE)::DECIMAL +
       COUNT(*) FILTER (WHERE m.recommendation IN ('caution', 'stop') AND m.proceeded_to_trade = FALSE)::DECIMAL) /
      NULLIF(COUNT(*)::DECIMAL, 0) * 100, 1
    ) as compliance_rate
  FROM trading_mindset_logs m
  WHERE m.user_id = p_user_id
    AND m.created_at > NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get today's latest mindset score (for quick widget)
CREATE OR REPLACE FUNCTION get_today_mindset_score(
  p_user_id UUID
)
RETURNS TABLE (
  total_score DECIMAL,
  recommendation TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.total_score,
    m.recommendation,
    m.created_at
  FROM trading_mindset_logs m
  WHERE m.user_id = p_user_id
    AND DATE(m.created_at) = CURRENT_DATE
  ORDER BY m.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Done
SELECT 'Trading Mindset Logs migration complete!' as result;
