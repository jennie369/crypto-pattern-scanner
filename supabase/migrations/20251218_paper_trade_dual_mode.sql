-- =====================================================
-- Migration: Paper Trade Dual Mode
-- Date: 2024-12-18
-- Description: Add columns for Pattern Mode vs Custom Mode
-- =====================================================

-- Column: trade_mode (pattern | custom)
-- Pattern Mode: Entry/SL/TP locked from pattern scan
-- Custom Mode: User can customize Entry/SL/TP
ALTER TABLE paper_trades
ADD COLUMN IF NOT EXISTS trade_mode VARCHAR(20) DEFAULT 'pattern';

-- Column: pattern_entry (Entry gốc từ pattern scan)
ALTER TABLE paper_trades
ADD COLUMN IF NOT EXISTS pattern_entry DECIMAL(20, 8);

-- Column: pattern_sl (Stop Loss gốc từ pattern scan)
ALTER TABLE paper_trades
ADD COLUMN IF NOT EXISTS pattern_sl DECIMAL(20, 8);

-- Column: pattern_tp (Take Profit gốc từ pattern scan)
ALTER TABLE paper_trades
ADD COLUMN IF NOT EXISTS pattern_tp DECIMAL(20, 8);

-- Column: entry_deviation_percent (độ lệch Entry so với pattern)
ALTER TABLE paper_trades
ADD COLUMN IF NOT EXISTS entry_deviation_percent DECIMAL(10, 4) DEFAULT 0;

-- Column: sl_deviation_percent (độ lệch SL so với pattern)
ALTER TABLE paper_trades
ADD COLUMN IF NOT EXISTS sl_deviation_percent DECIMAL(10, 4) DEFAULT 0;

-- Column: tp_deviation_percent (độ lệch TP so với pattern)
ALTER TABLE paper_trades
ADD COLUMN IF NOT EXISTS tp_deviation_percent DECIMAL(10, 4) DEFAULT 0;

-- Column: ai_score (điểm AI đánh giá 0-100, chỉ Custom Mode)
ALTER TABLE paper_trades
ADD COLUMN IF NOT EXISTS ai_score INTEGER DEFAULT 0;

-- Column: ai_feedback (JSON feedback từ AI)
ALTER TABLE paper_trades
ADD COLUMN IF NOT EXISTS ai_feedback JSONB;

-- Index cho query theo mode
CREATE INDEX IF NOT EXISTS idx_paper_trades_mode
ON paper_trades(trade_mode);

-- Index cho query custom trades today (check daily limit)
CREATE INDEX IF NOT EXISTS idx_paper_trades_user_mode_date
ON paper_trades(user_id, trade_mode, created_at);

-- =====================================================
-- COMMENTS for documentation
-- =====================================================
COMMENT ON COLUMN paper_trades.trade_mode IS 'pattern = follow GEM pattern, custom = user customized';
COMMENT ON COLUMN paper_trades.pattern_entry IS 'Original entry price from pattern scan';
COMMENT ON COLUMN paper_trades.pattern_sl IS 'Original stop loss from pattern scan';
COMMENT ON COLUMN paper_trades.pattern_tp IS 'Original take profit from pattern scan';
COMMENT ON COLUMN paper_trades.entry_deviation_percent IS 'Percentage deviation of entry from pattern';
COMMENT ON COLUMN paper_trades.sl_deviation_percent IS 'Percentage deviation of SL from pattern';
COMMENT ON COLUMN paper_trades.tp_deviation_percent IS 'Percentage deviation of TP from pattern';
COMMENT ON COLUMN paper_trades.ai_score IS 'AI assessment score 0-100 (Custom Mode only)';
COMMENT ON COLUMN paper_trades.ai_feedback IS 'JSON object with AI warnings, recommendations, etc.';
