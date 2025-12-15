-- ═══════════════════════════════════════════════════════════════════════════
-- AI SU PHU (GEM MASTER) DATABASE SCHEMA
-- Created: 2025-12-15
-- Description: AI trading mentor system - interactions, configs, blocking
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. AI MASTER INTERACTIONS LOG
-- Lưu lại mọi tương tác giữa AI và user
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ai_master_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Interaction type
  scenario_type VARCHAR(50) NOT NULL,
  -- Values: 'fomo_warning', 'revenge_trade_block', 'no_stoploss',
  --         'sl_moved_wider', 'big_win_caution', 'discipline_trade',
  --         'unlock_completed', 'daily_checkin', 'streak_warning'

  -- Related data
  trade_id UUID,  -- References paper_trades if exists
  trigger_conditions JSONB DEFAULT '{}',
  -- Example: { "rsi": 75, "priceChange1h": 6.5, "loseStreak": 3 }

  -- AI Response
  ai_message TEXT NOT NULL,
  ai_mood VARCHAR(20) NOT NULL DEFAULT 'calm',
  -- Values: 'calm', 'warning', 'angry', 'proud', 'silent'

  -- User action
  user_action VARCHAR(50),
  -- Values: 'accepted', 'dismissed', 'ignored', 'completed_unlock'
  user_action_at TIMESTAMPTZ,

  -- Karma impact
  karma_change INT DEFAULT 0,
  karma_reason VARCHAR(100),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. AI MASTER CONFIG (Scenario responses)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ai_master_config (
  id VARCHAR(50) PRIMARY KEY,

  scenario_category VARCHAR(30) NOT NULL,
  -- Values: 'fomo', 'revenge', 'discipline', 'greed', 'panic', 'praise'

  -- Message template (có thể dùng {variables})
  message_template TEXT NOT NULL,
  -- Example: "Nhịp tim thị trường đang ở vùng quá khích. RSI hiện tại: {rsi}%"

  -- AI mood when triggered
  mood VARCHAR(20) NOT NULL DEFAULT 'warning',

  -- Karma impact
  karma_impact INT DEFAULT 0,

  -- Action config
  block_trade BOOLEAN DEFAULT false,
  block_duration_minutes INT DEFAULT 0,
  require_unlock BOOLEAN DEFAULT false,
  cooldown_minutes INT DEFAULT 0,

  -- Display priority (lower = higher priority)
  priority INT DEFAULT 10,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. USER TRADE BLOCKS (khi bị AI block)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_trade_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  block_reason VARCHAR(50) NOT NULL,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,

  -- Unlock tracking
  unlock_method VARCHAR(50),
  -- Values: 'meditation', 'journal', 'rest', 'wait', 'admin_override'
  unlocked_at TIMESTAMPTZ,
  unlocked_by UUID REFERENCES profiles(id), -- If admin override

  -- Related interaction
  interaction_id UUID REFERENCES ai_master_interactions(id),

  is_active BOOLEAN DEFAULT true
);

-- Unique constraint: Only one active block per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_trade_blocks_unique_active
  ON user_trade_blocks(user_id) WHERE is_active = true;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. INSERT DEFAULT AI CONFIGS
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO ai_master_config (id, scenario_category, message_template, mood, karma_impact, block_trade, block_duration_minutes, require_unlock, priority) VALUES

-- FOMO scenarios
('fomo_buy_overbought', 'fomo',
'Dừng lại.

Nhịp tim thị trường đang ở vùng quá khích.
RSI hiện tại: {rsi}%. Giá đã tăng {priceChange}% trong 1 giờ.

Bạn đang định vào lệnh vì TÍN HIỆU hay vì SỢ BỎ LỠ?

Hệ thống từ chối lệnh này.
Hãy chờ đợi sự điều chỉnh.

Kiên nhẫn là vàng.',
'warning', 0, true, 15, false, 1),

('fomo_retry_penalty', 'fomo',
'Ta đã cảnh báo. Bạn vẫn cố gắng.

-5 Karma cho sự thiếu kỷ luật.

Thị trường sẽ vẫn còn đó ngày mai.
Tài khoản của bạn thì không chắc.',
'angry', -5, true, 30, false, 2),

-- Big win scenarios
('win_big_caution', 'greed',
'Kết quả tốt.

Nhưng hãy tự hỏi: Chiến thắng này đến từ KỸ NĂNG hay MAY MẮN?

Đừng để Dopamine làm mờ mắt.

Hệ thống khuyến nghị:
→ Tắt App 10 phút
→ Hít thở sâu 5 lần
→ Ghi nhật ký lệnh này

Đừng trả lại tiền cho thị trường.',
'calm', 0, false, 0, false, 5),

-- Revenge trade
('revenge_trade_block', 'revenge',
'DỪNG LẠI.

Tâm trí bạn đang hỗn loạn.
Bạn đã thua {loseStreak} lệnh liên tiếp.
Bạn đang muốn TRẢ THÙ thị trường.
Và thị trường sẽ NUỐT CHỬNG bạn.

Tài khoản bị ĐÓNG BĂNG tạm thời.

Hãy chọn một trong các hành động để lấy lại quyền giao dịch.',
'angry', -30, true, 60, true, 1),

-- No stoploss
('no_stoploss', 'discipline',
'Đi xe không phanh là hành vi TỰ SÁT.

Ta không cấp phép cho lệnh này.

Hãy xác định ĐIỂM CẮT LỖ.
Chấp nhận RỦI RO trước khi nghĩ đến LỢI NHUẬN.

Không có ngoại lệ.',
'warning', 0, true, 0, false, 1),

-- Stoploss moved wider
('sl_moved_wider', 'discipline',
'Bạn đang CHẠY LỖ.

Dời stoploss ra xa khi thua là hành vi của NGƯỜI THUA CUỘC.

-20 Karma.

Stoploss ban đầu: {originalSL}
Stoploss mới: {newSL}

Đây là lý do bạn không thể có lợi nhuận bền vững.',
'warning', -20, false, 0, false, 3),

-- Discipline - win
('discipline_win', 'praise',
'Kỷ luật. Đó là điều phân biệt Trader thắng và thua.

Trade này:
✓ Có stoploss từ đầu
✓ Không dời stoploss
✓ R:R = {riskReward}
✓ Theo đúng kế hoạch

+25 Karma.

Tiếp tục như vậy.',
'proud', 25, false, 0, false, 10),

-- Discipline - loss
('discipline_loss', 'praise',
'Lệnh thua. Nhưng bạn đã TUÂN THỦ KẾ HOẠCH.

Đây là lệnh thua ĐÚNG CÁCH:
✓ Có stoploss từ đầu
✓ Không dời stoploss
✓ Cắt lỗ đúng điểm

+10 Karma.

Thua đúng cách còn hơn thắng bằng may mắn.',
'calm', 10, false, 0, false, 10),

-- Account frozen
('account_frozen', 'panic',
'Tài khoản đã bị ĐÓNG BĂNG.

Karma của bạn đã về 0.
Quá nhiều vi phạm kỷ luật.

Để khôi phục, bạn cần hoàn thành QUEST PHỤC HỒI:
1. Hoàn thành Module "Tâm Lý Trading"
2. Meditation 7 ngày liên tiếp
3. Viết 5 entry trading journal

Sau đó karma sẽ reset về 100.',
'silent', 0, true, 0, true, 1),

-- Overtrade warning
('overtrade_warning', 'discipline',
'Bạn đã trade {tradesCount} lệnh hôm nay.

Quá nhiều lệnh trong 1 ngày sẽ:
→ Làm mờ phán đoán
→ Tăng rủi ro tích lũy
→ Gây mệt mỏi tâm lý

Hệ thống khuyến nghị: Dừng lại.
Hãy nghỉ ngơi và quay lại ngày mai.',
'warning', -15, false, 0, false, 4),

-- Streak broken
('streak_broken', 'discipline',
'Chuỗi kỷ luật của bạn đã bị phá vỡ.

Streak trước: {previousStreak} ngày
-20 Karma.

Bắt đầu lại từ đầu.
Kỷ luật là một cuộc chiến hàng ngày.',
'calm', -20, false, 0, false, 6)

ON CONFLICT (id) DO UPDATE SET
  message_template = EXCLUDED.message_template,
  mood = EXCLUDED.mood,
  karma_impact = EXCLUDED.karma_impact,
  block_trade = EXCLUDED.block_trade,
  block_duration_minutes = EXCLUDED.block_duration_minutes,
  require_unlock = EXCLUDED.require_unlock,
  updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_ai_interactions_user ON ai_master_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_type ON ai_master_interactions(scenario_type);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_date ON ai_master_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_trade ON ai_master_interactions(trade_id);

CREATE INDEX IF NOT EXISTS idx_trade_blocks_user ON user_trade_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_blocks_active ON user_trade_blocks(user_id, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_ai_config_category ON ai_master_config(scenario_category);
CREATE INDEX IF NOT EXISTS idx_ai_config_active ON ai_master_config(is_active) WHERE is_active = true;

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE ai_master_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_master_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trade_blocks ENABLE ROW LEVEL SECURITY;

-- Users can view own interactions
DROP POLICY IF EXISTS "Users view own interactions" ON ai_master_interactions;
CREATE POLICY "Users view own interactions" ON ai_master_interactions
  FOR SELECT USING (user_id = auth.uid());

-- System can insert interactions
DROP POLICY IF EXISTS "System insert interactions" ON ai_master_interactions;
CREATE POLICY "System insert interactions" ON ai_master_interactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Everyone can read AI config
DROP POLICY IF EXISTS "Public read AI config" ON ai_master_config;
CREATE POLICY "Public read AI config" ON ai_master_config
  FOR SELECT USING (true);

-- Only admins can modify AI config
DROP POLICY IF EXISTS "Admins modify AI config" ON ai_master_config;
CREATE POLICY "Admins modify AI config" ON ai_master_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Users can view own blocks
DROP POLICY IF EXISTS "Users view own blocks" ON user_trade_blocks;
CREATE POLICY "Users view own blocks" ON user_trade_blocks
  FOR SELECT USING (user_id = auth.uid());

-- System can manage blocks
DROP POLICY IF EXISTS "System manage blocks" ON user_trade_blocks;
CREATE POLICY "System manage blocks" ON user_trade_blocks
  FOR ALL USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Function to check if user is blocked from trading
CREATE OR REPLACE FUNCTION is_user_trade_blocked(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_block RECORD;
BEGIN
  SELECT * INTO v_block
  FROM user_trade_blocks
  WHERE user_id = p_user_id
    AND is_active = true
    AND (blocked_until IS NULL OR blocked_until > NOW())
  LIMIT 1;

  IF v_block IS NULL THEN
    RETURN jsonb_build_object('blocked', false);
  END IF;

  RETURN jsonb_build_object(
    'blocked', true,
    'block_id', v_block.id,
    'reason', v_block.block_reason,
    'blocked_at', v_block.blocked_at,
    'blocked_until', v_block.blocked_until,
    'require_unlock', v_block.unlock_method IS NULL,
    'interaction_id', v_block.interaction_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to block user from trading
CREATE OR REPLACE FUNCTION block_user_trading(
  p_user_id UUID,
  p_reason VARCHAR(50),
  p_duration_minutes INT DEFAULT NULL,
  p_interaction_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_blocked_until TIMESTAMPTZ;
  v_block_id UUID;
BEGIN
  -- Calculate blocked_until if duration provided
  IF p_duration_minutes IS NOT NULL AND p_duration_minutes > 0 THEN
    v_blocked_until := NOW() + (p_duration_minutes || ' minutes')::INTERVAL;
  END IF;

  -- Deactivate any existing blocks
  UPDATE user_trade_blocks
  SET is_active = false
  WHERE user_id = p_user_id AND is_active = true;

  -- Create new block
  INSERT INTO user_trade_blocks (user_id, block_reason, blocked_until, interaction_id)
  VALUES (p_user_id, p_reason, v_blocked_until, p_interaction_id)
  RETURNING id INTO v_block_id;

  RETURN v_block_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unlock user trading
CREATE OR REPLACE FUNCTION unlock_user_trading(
  p_user_id UUID,
  p_unlock_method VARCHAR(50),
  p_admin_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_trade_blocks
  SET
    is_active = false,
    unlock_method = p_unlock_method,
    unlocked_at = NOW(),
    unlocked_by = p_admin_id
  WHERE user_id = p_user_id AND is_active = true;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log AI interaction
CREATE OR REPLACE FUNCTION log_ai_interaction(
  p_user_id UUID,
  p_scenario_type VARCHAR(50),
  p_ai_message TEXT,
  p_ai_mood VARCHAR(20) DEFAULT 'calm',
  p_trade_id UUID DEFAULT NULL,
  p_trigger_conditions JSONB DEFAULT '{}',
  p_karma_change INT DEFAULT 0,
  p_karma_reason VARCHAR(100) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_interaction_id UUID;
BEGIN
  INSERT INTO ai_master_interactions (
    user_id, scenario_type, ai_message, ai_mood,
    trade_id, trigger_conditions, karma_change, karma_reason
  )
  VALUES (
    p_user_id, p_scenario_type, p_ai_message, p_ai_mood,
    p_trade_id, p_trigger_conditions, p_karma_change, p_karma_reason
  )
  RETURNING id INTO v_interaction_id;

  RETURN v_interaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get AI config by scenario
CREATE OR REPLACE FUNCTION get_ai_config(p_scenario_id VARCHAR(50))
RETURNS JSONB AS $$
DECLARE
  v_config RECORD;
BEGIN
  SELECT * INTO v_config
  FROM ai_master_config
  WHERE id = p_scenario_id AND is_active = true;

  IF v_config IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id', v_config.id,
    'category', v_config.scenario_category,
    'message_template', v_config.message_template,
    'mood', v_config.mood,
    'karma_impact', v_config.karma_impact,
    'block_trade', v_config.block_trade,
    'block_duration_minutes', v_config.block_duration_minutes,
    'require_unlock', v_config.require_unlock,
    'cooldown_minutes', v_config.cooldown_minutes
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- GRANT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════

GRANT EXECUTE ON FUNCTION is_user_trade_blocked(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION block_user_trading(UUID, VARCHAR, INT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION unlock_user_trading(UUID, VARCHAR, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_ai_interaction(UUID, VARCHAR, TEXT, VARCHAR, UUID, JSONB, INT, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ai_config(VARCHAR) TO authenticated;
