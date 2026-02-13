-- supabase/migrations/20251216_003_trading_intelligence_tables.sql
-- Tables cho Pattern Detection AI và Win Rate Improvement
-- GEMRAL AI BRAIN - Phase 1

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. PATTERN DEFINITIONS - Định nghĩa các patterns
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_pattern_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Pattern info
  pattern_code TEXT NOT NULL UNIQUE,  -- 'dpd', 'upu', 'head_shoulders', etc.
  pattern_name TEXT NOT NULL,
  pattern_name_vi TEXT NOT NULL,
  description TEXT,
  description_vi TEXT,

  -- Classification
  pattern_type TEXT NOT NULL CHECK (pattern_type IN (
    'reversal',      -- Đảo chiều
    'continuation',  -- Tiếp diễn
    'bilateral',     -- Hai chiều
    'zone',          -- Vùng (HFZ, LFZ)
    'candlestick'    -- Mẫu nến (Hammer, Engulfing, etc.)
  )),
  signal_type TEXT NOT NULL CHECK (signal_type IN ('bullish', 'bearish', 'neutral')),

  -- Detection parameters
  detection_params JSONB DEFAULT '{}',  -- Min/max values, timeframes, etc.

  -- Base statistics (from historical backtesting - matched với app)
  base_win_rate FLOAT DEFAULT 0.65,      -- Win rate cơ bản từ backtest
  base_risk_reward FLOAT DEFAULT 2.0,    -- R:R cơ bản

  -- Live statistics (updated daily from real detections)
  total_detections INTEGER DEFAULT 0,
  successful_trades INTEGER DEFAULT 0,
  failed_trades INTEGER DEFAULT 0,
  win_rate FLOAT DEFAULT 0,
  avg_profit_percent FLOAT DEFAULT 0,
  avg_loss_percent FLOAT DEFAULT 0,
  risk_reward_ratio FLOAT DEFAULT 0,

  -- AI model info
  ai_model_version TEXT,
  last_trained_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,
  tier_required TEXT DEFAULT 'FREE' CHECK (tier_required IN ('FREE', 'TIER1', 'TIER2', 'TIER3')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. PATTERN DETECTIONS - Mỗi lần detect pattern
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_pattern_detections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_id UUID NOT NULL REFERENCES ai_pattern_definitions(id),

  -- Market context
  symbol TEXT NOT NULL,           -- 'BTCUSDT', 'ETHUSDT'
  timeframe TEXT NOT NULL,        -- '1h', '4h', '1d'
  exchange TEXT DEFAULT 'binance',

  -- Detection info
  detected_at TIMESTAMPTZ NOT NULL,
  detection_confidence FLOAT NOT NULL,  -- 0-1

  -- Price data at detection
  entry_price FLOAT NOT NULL,
  stop_loss_price FLOAT,
  take_profit_price FLOAT,

  -- Pattern specific data
  pattern_data JSONB DEFAULT '{}',  -- Coordinates, support/resistance, etc.

  -- Chart image (for review)
  chart_image_url TEXT,

  -- AI analysis
  ai_analysis TEXT,
  ai_confidence FLOAT,

  -- Outcome (filled after trade completes)
  outcome TEXT CHECK (outcome IN ('win', 'loss', 'breakeven', 'pending', 'invalidated')),
  exit_price FLOAT,
  profit_loss_percent FLOAT,
  exit_reason TEXT,
  exited_at TIMESTAMPTZ,

  -- User interaction
  user_notified BOOLEAN DEFAULT false,
  user_traded BOOLEAN DEFAULT false,
  user_feedback TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_pattern_detections_symbol ON ai_pattern_detections(symbol);
CREATE INDEX IF NOT EXISTS idx_ai_pattern_detections_pattern ON ai_pattern_detections(pattern_id);
CREATE INDEX IF NOT EXISTS idx_ai_pattern_detections_detected ON ai_pattern_detections(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_pattern_detections_outcome ON ai_pattern_detections(outcome);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. PATTERN LEARNING DATA - Data để AI học
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_pattern_learning_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_id UUID NOT NULL REFERENCES ai_pattern_definitions(id),

  -- Market context
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,

  -- Candle data (OHLCV)
  candle_data JSONB NOT NULL,  -- Array of candles before and after pattern

  -- Pattern characteristics
  pattern_start_index INTEGER,
  pattern_end_index INTEGER,
  pattern_features JSONB,  -- Extracted features for ML

  -- Labels (for supervised learning)
  is_valid_pattern BOOLEAN,
  outcome TEXT CHECK (outcome IN ('win', 'loss', 'breakeven')),
  profit_loss_percent FLOAT,

  -- Metadata
  data_source TEXT DEFAULT 'backtesting',  -- backtesting, live
  verified_by TEXT,  -- manual, ai, backtesting

  -- Timestamps
  pattern_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pattern_learning_pattern ON ai_pattern_learning_data(pattern_id);
CREATE INDEX IF NOT EXISTS idx_pattern_learning_outcome ON ai_pattern_learning_data(outcome);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. BACKTESTING RESULTS - Kết quả backtest
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_backtesting_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Test configuration
  test_name TEXT NOT NULL,
  pattern_ids UUID[],  -- Patterns tested
  symbols TEXT[],
  timeframes TEXT[],
  date_from TIMESTAMPTZ NOT NULL,
  date_to TIMESTAMPTZ NOT NULL,

  -- Parameters
  initial_capital FLOAT DEFAULT 10000,
  position_size_percent FLOAT DEFAULT 2,
  stop_loss_percent FLOAT,
  take_profit_percent FLOAT,

  -- Results
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  win_rate FLOAT DEFAULT 0,

  total_profit_loss FLOAT DEFAULT 0,
  profit_factor FLOAT,  -- gross profit / gross loss
  max_drawdown FLOAT,
  max_drawdown_percent FLOAT,
  sharpe_ratio FLOAT,

  avg_win FLOAT,
  avg_loss FLOAT,
  largest_win FLOAT,
  largest_loss FLOAT,
  avg_trade_duration_hours FLOAT,

  -- Detailed results
  trade_history JSONB,  -- Array of all trades
  equity_curve JSONB,   -- Equity over time
  monthly_returns JSONB,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  error_message TEXT,

  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. DAILY PATTERN METRICS - Metrics hàng ngày
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_daily_pattern_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_date DATE NOT NULL,

  -- Overall metrics
  total_detections INTEGER DEFAULT 0,
  total_signals_sent INTEGER DEFAULT 0,
  signals_traded INTEGER DEFAULT 0,

  -- Win/Loss
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  breakeven INTEGER DEFAULT 0,
  pending INTEGER DEFAULT 0,
  overall_win_rate FLOAT,

  -- Per pattern breakdown
  pattern_breakdown JSONB DEFAULT '{}',
  /*
  {
    "double_bottom": { "detections": 5, "wins": 3, "losses": 1, "win_rate": 0.75 },
    "falling_wedge": { "detections": 3, "wins": 2, "losses": 1, "win_rate": 0.67 }
  }
  */

  -- Per symbol breakdown
  symbol_breakdown JSONB DEFAULT '{}',

  -- AI metrics
  avg_detection_confidence FLOAT,
  false_positive_rate FLOAT,
  false_negative_rate FLOAT,  -- Estimated

  -- Model version
  model_version TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(metric_date)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. PATTERN IMPROVEMENT SUGGESTIONS - AI đề xuất cải tiến
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_pattern_improvement_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_id UUID REFERENCES ai_pattern_definitions(id),

  -- Suggestion
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN (
    'parameter_tuning',    -- Điều chỉnh params
    'filter_addition',     -- Thêm filter
    'entry_rule_change',   -- Thay đổi rule entry
    'exit_rule_change',    -- Thay đổi rule exit
    'timeframe_change',    -- Đổi timeframe
    'symbol_filter',       -- Lọc symbol
    'deprecation'          -- Bỏ pattern
  )),

  -- Details
  current_value JSONB,
  suggested_value JSONB,
  reasoning TEXT,

  -- Expected impact
  expected_win_rate_change FLOAT,  -- +/- percentage points
  expected_trade_count_change FLOAT,
  confidence FLOAT,

  -- Based on analysis
  analysis_period_days INTEGER,
  sample_size INTEGER,
  statistical_significance FLOAT,  -- p-value

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'implemented', 'testing'
  )),
  reviewed_by TEXT,
  review_notes TEXT,

  -- Results after implementation
  actual_win_rate_change FLOAT,
  actual_trade_count_change FLOAT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  implemented_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Pattern definitions: Public read
ALTER TABLE ai_pattern_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active patterns" ON ai_pattern_definitions;
CREATE POLICY "Anyone can view active patterns" ON ai_pattern_definitions
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role can manage patterns" ON ai_pattern_definitions;
CREATE POLICY "Service role can manage patterns" ON ai_pattern_definitions
  FOR ALL USING (auth.role() = 'service_role');

-- Pattern detections: Based on user tier
ALTER TABLE ai_pattern_detections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view detections" ON ai_pattern_detections;
CREATE POLICY "Users can view detections" ON ai_pattern_detections
  FOR SELECT USING (true);  -- Tier filtering done in app

DROP POLICY IF EXISTS "Service role can manage detections" ON ai_pattern_detections;
CREATE POLICY "Service role can manage detections" ON ai_pattern_detections
  FOR ALL USING (auth.role() = 'service_role');

-- Others: Service role only
ALTER TABLE ai_pattern_learning_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only learning" ON ai_pattern_learning_data;
CREATE POLICY "Service role only learning" ON ai_pattern_learning_data
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE ai_backtesting_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only backtesting" ON ai_backtesting_results;
CREATE POLICY "Service role only backtesting" ON ai_backtesting_results
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE ai_daily_pattern_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only metrics" ON ai_daily_pattern_metrics;
CREATE POLICY "Service role only metrics" ON ai_daily_pattern_metrics
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE ai_pattern_improvement_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only suggestions" ON ai_pattern_improvement_suggestions;
CREATE POLICY "Service role only suggestions" ON ai_pattern_improvement_suggestions
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. SEED DATA - Pattern definitions (24 patterns matched với app)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO ai_pattern_definitions (
  pattern_code, pattern_name, pattern_name_vi,
  pattern_type, signal_type,
  description, description_vi,
  detection_params, tier_required,
  base_win_rate, base_risk_reward
) VALUES
-- ═══════════════════════════════════════════════════════════════════════════
-- FREE TIER (3 patterns) - Matched với app patternDetection.js
-- ═══════════════════════════════════════════════════════════════════════════

('dpd', 'DPD (Down-Pause-Down)', 'Giảm-Nghỉ-Giảm',
 'continuation', 'bearish',
 'GEM proprietary continuation pattern - Down move, pause/consolidation, then continuation down',
 'Mẫu hình tiếp diễn độc quyền GEM - Giảm, nghỉ/tích lũy, rồi tiếp tục giảm',
 '{"pause_min_candles": 3, "pause_max_candles": 12, "continuation_confirm": true, "min_initial_move_percent": 2}',
 'FREE', 0.71, 2.5),

('upu', 'UPU (Up-Pause-Up)', 'Tăng-Nghỉ-Tăng',
 'continuation', 'bullish',
 'GEM proprietary continuation pattern - Up move, pause/consolidation, then continuation up',
 'Mẫu hình tiếp diễn độc quyền GEM - Tăng, nghỉ/tích lũy, rồi tiếp tục tăng',
 '{"pause_min_candles": 3, "pause_max_candles": 12, "continuation_confirm": true, "min_initial_move_percent": 2}',
 'FREE', 0.68, 2.8),

('head_shoulders', 'Head and Shoulders', 'Vai Đầu Vai',
 'reversal', 'bearish',
 'Classic reversal pattern with three peaks, middle being highest',
 'Mẫu hình đảo chiều cổ điển với ba đỉnh, đỉnh giữa cao nhất',
 '{"shoulder_symmetry_percent": 15, "neckline_slope_max": 0.1, "head_prominence_min": 1.03}',
 'FREE', 0.68, 2.5),

-- ═══════════════════════════════════════════════════════════════════════════
-- TIER1 (+4 patterns = 7 total) - Matched với app patternDetection.js
-- ═══════════════════════════════════════════════════════════════════════════

('upd', 'UPD (Up-Pause-Down)', 'Tăng-Nghỉ-Giảm',
 'reversal', 'bearish',
 'GEM proprietary reversal pattern - Up move, pause, then reversal down',
 'Mẫu hình đảo chiều độc quyền GEM - Tăng, nghỉ, rồi đảo chiều giảm',
 '{"pause_min_candles": 3, "pause_max_candles": 15, "reversal_confirm": true, "min_initial_move_percent": 3}',
 'TIER1', 0.65, 2.2),

('dpu', 'DPU (Down-Pause-Up)', 'Giảm-Nghỉ-Tăng',
 'reversal', 'bullish',
 'GEM proprietary reversal pattern - Down move, pause, then reversal up',
 'Mẫu hình đảo chiều độc quyền GEM - Giảm, nghỉ, rồi đảo chiều tăng',
 '{"pause_min_candles": 3, "pause_max_candles": 15, "reversal_confirm": true, "min_initial_move_percent": 3}',
 'TIER1', 0.67, 2.4),

('double_top', 'Double Top', 'Hai Đỉnh',
 'reversal', 'bearish',
 'A reversal pattern indicating potential trend change from bullish to bearish',
 'Mẫu hình đảo chiều cho thấy xu hướng có thể thay đổi từ tăng sang giảm',
 '{"min_height_percent": 3, "max_height_diff_percent": 1.5, "neckline_break_confirm": true}',
 'TIER1', 0.66, 2.3),

('double_bottom', 'Double Bottom', 'Hai Đáy',
 'reversal', 'bullish',
 'A reversal pattern indicating potential trend change from bearish to bullish',
 'Mẫu hình đảo chiều cho thấy xu hướng có thể thay đổi từ giảm sang tăng',
 '{"min_depth_percent": 3, "max_depth_diff_percent": 1.5, "neckline_break_confirm": true}',
 'TIER1', 0.67, 2.4),

-- ═══════════════════════════════════════════════════════════════════════════
-- TIER2 (+8 patterns = 15 total) - Matched với app patternDetection.js
-- ═══════════════════════════════════════════════════════════════════════════

('inv_head_shoulders', 'Inverse Head and Shoulders', 'Vai Đầu Vai Ngược',
 'reversal', 'bullish',
 'Bullish reversal pattern with three troughs, middle being lowest',
 'Mẫu hình đảo chiều tăng với ba đáy, đáy giữa thấp nhất',
 '{"shoulder_symmetry_percent": 15, "neckline_slope_max": 0.1, "head_depth_min": 1.03}',
 'TIER2', 0.69, 2.5),

('ascending_triangle', 'Ascending Triangle', 'Tam Giác Tăng',
 'continuation', 'bullish',
 'Bullish pattern with flat resistance and rising support',
 'Mẫu hình tăng với kháng cự ngang và hỗ trợ tăng dần',
 '{"min_touches_resistance": 2, "min_touches_support": 2, "max_resistance_slope": 0.02}',
 'TIER2', 0.66, 2.2),

('descending_triangle', 'Descending Triangle', 'Tam Giác Giảm',
 'continuation', 'bearish',
 'Bearish pattern with flat support and falling resistance',
 'Mẫu hình giảm với hỗ trợ ngang và kháng cự giảm dần',
 '{"min_touches_support": 2, "min_touches_resistance": 2, "max_support_slope": 0.02}',
 'TIER2', 0.65, 2.2),

('hfz', 'HFZ (High Frequency Zone)', 'Vùng Tần Số Cao',
 'zone', 'bullish',
 'GEM proprietary zone pattern - High frequency support zone with multiple touches',
 'Mẫu hình vùng độc quyền GEM - Vùng hỗ trợ tần số cao với nhiều lần chạm',
 '{"min_touches": 3, "zone_width_percent": 1.5, "touch_precision_percent": 0.5, "min_bounce_percent": 1}',
 'TIER2', 0.70, 2.3),

('lfz', 'LFZ (Low Frequency Zone)', 'Vùng Tần Số Thấp',
 'zone', 'bearish',
 'GEM proprietary zone pattern - Low frequency resistance zone with multiple touches',
 'Mẫu hình vùng độc quyền GEM - Vùng kháng cự tần số thấp với nhiều lần chạm',
 '{"min_touches": 3, "zone_width_percent": 1.5, "touch_precision_percent": 0.5, "min_rejection_percent": 1}',
 'TIER2', 0.71, 2.3),

('symmetrical_triangle', 'Symmetrical Triangle', 'Tam Giác Cân',
 'bilateral', 'neutral',
 'Pattern that can break either direction, wait for confirmation',
 'Mẫu hình có thể breakout cả hai hướng, đợi xác nhận',
 '{"min_touches": 2, "convergence_angle_min": 20, "convergence_angle_max": 60}',
 'TIER2', 0.63, 2.0),

('rounding_bottom', 'Rounding Bottom', 'Đáy Vòng Cung',
 'reversal', 'bullish',
 'Gradual reversal pattern forming a U-shape bottom',
 'Mẫu hình đảo chiều từ từ tạo thành đáy hình chữ U',
 '{"min_duration_candles": 20, "symmetry_score_min": 0.7, "depth_percent_min": 5}',
 'TIER2', 0.68, 2.4),

('rounding_top', 'Rounding Top', 'Đỉnh Vòng Cung',
 'reversal', 'bearish',
 'Gradual reversal pattern forming an inverted U-shape top',
 'Mẫu hình đảo chiều từ từ tạo thành đỉnh hình chữ U ngược',
 '{"min_duration_candles": 20, "symmetry_score_min": 0.7, "height_percent_min": 5}',
 'TIER2', 0.67, 2.3),

-- ═══════════════════════════════════════════════════════════════════════════
-- TIER3 (+9 patterns = 24 total) - Matched với app patternDetection.js
-- ═══════════════════════════════════════════════════════════════════════════

('bull_flag', 'Bull Flag', 'Cờ Tăng',
 'continuation', 'bullish',
 'Short consolidation after strong upward move',
 'Tích lũy ngắn sau đợt tăng mạnh',
 '{"pole_min_percent": 5, "flag_retrace_max_percent": 38.2, "flag_duration_max_candles": 20}',
 'TIER3', 0.70, 2.5),

('bear_flag', 'Bear Flag', 'Cờ Giảm',
 'continuation', 'bearish',
 'Short consolidation after strong downward move',
 'Tích lũy ngắn sau đợt giảm mạnh',
 '{"pole_min_percent": 5, "flag_retrace_max_percent": 38.2, "flag_duration_max_candles": 20}',
 'TIER3', 0.69, 2.4),

('wedge', 'Wedge', 'Nêm',
 'reversal', 'neutral',
 'Rising or falling wedge pattern indicating potential reversal',
 'Mẫu hình nêm tăng hoặc giảm báo hiệu đảo chiều tiềm năng',
 '{"min_touches": 2, "convergence_required": true, "min_duration_candles": 10, "wedge_angle_min": 15}',
 'TIER3', 0.64, 2.1),

('cup_handle', 'Cup and Handle', 'Cốc và Tay Cầm',
 'continuation', 'bullish',
 'Bullish continuation pattern resembling a cup with handle',
 'Mẫu hình tiếp diễn tăng giống hình cốc có tay cầm',
 '{"cup_depth_percent_min": 12, "cup_depth_percent_max": 33, "handle_retrace_max": 50}',
 'TIER3', 0.72, 2.8),

('engulfing', 'Engulfing', 'Nhấn Chìm',
 'candlestick', 'neutral',
 'Strong reversal candle pattern where current candle engulfs previous',
 'Mẫu nến đảo chiều mạnh khi nến hiện tại nhấn chìm nến trước',
 '{"body_ratio_min": 1.2, "trend_candles_min": 3, "volume_confirm": true}',
 'TIER3', 0.64, 2.0),

('morning_evening_star', 'Morning/Evening Star', 'Sao Mai/Sao Hôm',
 'candlestick', 'neutral',
 'Three-candle reversal pattern with small middle candle (doji or spinning top)',
 'Mẫu hình ba nến đảo chiều với nến giữa nhỏ (doji hoặc con quay)',
 '{"middle_body_max_percent": 30, "gap_preferred": true, "trend_candles_min": 3}',
 'TIER3', 0.66, 2.2),

('three_methods', 'Three Methods', 'Ba Phương Pháp',
 'continuation', 'neutral',
 'Continuation pattern with three small candles between two strong candles',
 'Mẫu hình tiếp diễn với ba nến nhỏ giữa hai nến mạnh',
 '{"small_candles_count": 3, "containment_required": true, "trend_confirm": true}',
 'TIER3', 0.67, 2.3),

('hammer', 'Hammer', 'Búa',
 'candlestick', 'bullish',
 'Bullish reversal candlestick with long lower shadow',
 'Nến đảo chiều tăng với bóng dưới dài',
 '{"shadow_body_ratio_min": 2, "upper_shadow_max_percent": 20, "downtrend_candles_min": 3}',
 'TIER3', 0.62, 1.8),

('flag', 'Flag', 'Cờ',
 'continuation', 'neutral',
 'Generic flag pattern - consolidation after strong move',
 'Mẫu hình cờ tổng quát - tích lũy sau đợt di chuyển mạnh',
 '{"pole_min_percent": 4, "flag_retrace_max_percent": 50, "flag_duration_max_candles": 25}',
 'TIER3', 0.65, 2.1)

ON CONFLICT (pattern_code) DO UPDATE SET
  pattern_name = EXCLUDED.pattern_name,
  pattern_name_vi = EXCLUDED.pattern_name_vi,
  description = EXCLUDED.description,
  description_vi = EXCLUDED.description_vi,
  detection_params = EXCLUDED.detection_params,
  base_win_rate = EXCLUDED.base_win_rate,
  base_risk_reward = EXCLUDED.base_risk_reward,
  tier_required = EXCLUDED.tier_required,
  updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. TRIGGER FOR UPDATED_AT
-- ═══════════════════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS tr_ai_pattern_definitions_updated_at ON ai_pattern_definitions;
CREATE TRIGGER tr_ai_pattern_definitions_updated_at
  BEFORE UPDATE ON ai_pattern_definitions
  FOR EACH ROW EXECUTE FUNCTION update_ai_knowledge_updated_at();

DROP TRIGGER IF EXISTS tr_ai_pattern_detections_updated_at ON ai_pattern_detections;
CREATE TRIGGER tr_ai_pattern_detections_updated_at
  BEFORE UPDATE ON ai_pattern_detections
  FOR EACH ROW EXECUTE FUNCTION update_ai_knowledge_updated_at();
