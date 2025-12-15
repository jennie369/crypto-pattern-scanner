-- ═══════════════════════════════════════════════════════════════════════════
-- KARMA SYSTEM DATABASE SCHEMA
-- Created: 2025-12-15
-- Description: Karma points, levels, history, and benefits system
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. USER KARMA (main karma tracking per user)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_karma (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Current stats
  karma_points INT DEFAULT 200 CHECK (karma_points >= 0 AND karma_points <= 9999),
  karma_level VARCHAR(20) DEFAULT 'student',
  -- Values: 'novice', 'student', 'warrior', 'master', 'guardian'

  -- Lifetime stats
  total_earned INT DEFAULT 0,
  total_lost INT DEFAULT 0,
  highest_karma INT DEFAULT 200,
  lowest_karma INT DEFAULT 200,

  -- Streaks
  current_discipline_streak INT DEFAULT 0,
  best_discipline_streak INT DEFAULT 0,
  last_discipline_trade_at TIMESTAMPTZ,

  -- Daily tracking
  karma_earned_today INT DEFAULT 0,
  karma_lost_today INT DEFAULT 0,
  trades_today INT DEFAULT 0,
  last_trade_date DATE,

  -- Restrictions
  is_frozen BOOLEAN DEFAULT false,
  frozen_until TIMESTAMPTZ,
  frozen_reason TEXT,
  daily_trade_limit INT, -- NULL = unlimited based on level

  -- AI monitoring level
  ai_monitoring VARCHAR(20) DEFAULT 'normal',
  -- Values: 'strict', 'normal', 'light', 'minimal', 'trusted'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. KARMA HISTORY LOG
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS karma_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Change details
  change_amount INT NOT NULL,
  new_total INT NOT NULL,
  previous_total INT NOT NULL,

  -- Action info
  action_type VARCHAR(50) NOT NULL,
  -- Values: 'trade_discipline_win', 'trade_discipline_loss', 'trade_violation',
  --         'course_complete', 'module_complete', 'quiz_complete',
  --         'meditation', 'journal_entry', 'weekly_review',
  --         'streak_bonus', 'streak_break', 'inactivity_penalty',
  --         'refer_friend', 'refer_subscribe', 'level_change',
  --         'admin_adjustment', 'recovery_quest'

  action_detail TEXT,
  related_trade_id UUID,
  related_ai_interaction_id UUID REFERENCES ai_master_interactions(id),

  -- Level change tracking
  old_level VARCHAR(20),
  new_level VARCHAR(20),
  level_changed BOOLEAN DEFAULT false,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. KARMA LEVELS DEFINITION
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS karma_levels (
  id VARCHAR(20) PRIMARY KEY,
  name_vi VARCHAR(50) NOT NULL,
  name_en VARCHAR(50),

  -- Thresholds
  min_karma INT NOT NULL,
  max_karma INT, -- NULL = unlimited (for top level)

  -- Benefits (JSONB for flexibility)
  benefits JSONB DEFAULT '{}',

  -- Restrictions
  restrictions JSONB DEFAULT '{}',

  -- Display
  icon VARCHAR(50),
  color VARCHAR(20),
  badge_image_url TEXT,
  description_vi TEXT,

  display_order INT DEFAULT 0
);

-- Insert default karma levels
INSERT INTO karma_levels (id, name_vi, name_en, min_karma, max_karma, benefits, restrictions, icon, color, display_order, description_vi) VALUES
('novice', 'Tập sự', 'Novice', 0, 199,
  '{"daily_signals": 0, "vip_group": false, "group_chat": false, "course_access": ["intro"]}',
  '{"daily_trade_limit": 3, "ai_monitoring": "strict", "size_limit_percent": 1}',
  'UserX', '#6B7280', 1,
  'Giai đoạn học việc. Cần tuân thủ kỷ luật để lên cấp.'),

('student', 'Học viên', 'Student', 200, 499,
  '{"daily_signals": 3, "vip_group": false, "group_chat": false, "course_access": ["intro", "basic"]}',
  '{"daily_trade_limit": 10, "ai_monitoring": "normal", "size_limit_percent": 2}',
  'GraduationCap', '#3B82F6', 2,
  'Đang trong quá trình học tập. Được mở khóa các course cơ bản.'),

('warrior', 'Chiến binh', 'Warrior', 500, 799,
  '{"daily_signals": -1, "vip_group": false, "group_chat": true, "course_access": ["intro", "basic", "advanced"], "badge": "warrior"}',
  '{"ai_monitoring": "light", "size_limit_percent": 3}',
  'Sword', '#F59E0B', 3,
  'Đã chứng minh kỷ luật. Được tham gia Group Chat và xem tất cả signals.'),

('master', 'Bậc thầy', 'Master', 800, 999,
  '{"daily_signals": -1, "vip_group": true, "group_chat": true, "course_access": ["all"], "badge": "master_trader", "secret_course": true}',
  '{"ai_monitoring": "minimal"}',
  'Crown', '#8B5CF6', 4,
  'Trader xuất sắc. VIP Group access và khóa học bí mật.'),

('guardian', 'Bảo hộ', 'Guardian', 1000, NULL,
  '{"daily_signals": -1, "vip_group": true, "group_chat": true, "private_mentorship": true, "course_access": ["all"], "badge": "guardian", "can_mentor": true, "leaderboard": true}',
  '{"ai_monitoring": "trusted"}',
  'Shield', '#FFD700', 5,
  'Bậc cao nhất. Có thể mentor người khác. Được gặp riêng Founder.')
ON CONFLICT (id) DO UPDATE SET
  benefits = EXCLUDED.benefits,
  restrictions = EXCLUDED.restrictions,
  description_vi = EXCLUDED.description_vi;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. KARMA ACTIONS CONFIG
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS karma_actions (
  id VARCHAR(50) PRIMARY KEY,
  category VARCHAR(30) NOT NULL,
  -- Values: 'trading', 'learning', 'wellness', 'social', 'violation', 'inactivity'

  name_vi VARCHAR(100) NOT NULL,
  description_vi TEXT,

  karma_change INT NOT NULL,
  is_positive BOOLEAN DEFAULT true,

  -- Conditions (JSONB)
  conditions JSONB DEFAULT '{}',

  -- Limits
  cooldown_hours INT DEFAULT 0,
  daily_limit INT, -- NULL = unlimited

  is_active BOOLEAN DEFAULT true
);

-- Insert default karma actions
INSERT INTO karma_actions (id, category, name_vi, karma_change, is_positive, conditions, daily_limit) VALUES
-- Trading positive
('trade_discipline_win', 'trading', 'Win trade đúng kỷ luật', 25, true,
  '{"has_sl": true, "sl_moved": false, "min_rr": 2, "result": "win"}', NULL),
('trade_discipline_loss', 'trading', 'Thua đúng kỷ luật', 10, true,
  '{"has_sl": true, "sl_moved": false, "result": "loss"}', NULL),
('win_streak_3', 'trading', 'Win streak 3 ngày', 30, true, '{"win_streak": 3}', 1),
('win_streak_7', 'trading', 'Win streak 7 ngày', 100, true, '{"win_streak": 7}', 1),
('patience_bonus', 'trading', 'Kiên nhẫn (tránh FOMO thành công)', 10, true,
  '{"avoided_fomo": true, "ai_was_right": true}', 3),

-- Trading violations
('fomo_trade', 'violation', 'FOMO trade (bỏ qua cảnh báo)', -30, false,
  '{"ignored_warning": true, "scenario": "fomo"}', NULL),
('revenge_trade', 'violation', 'Revenge trade', -50, false,
  '{"lose_streak_gte": 3, "size_increased": true}', NULL),
('no_stoploss', 'violation', 'Trade không Stoploss', -10, false, '{"has_sl": false}', NULL),
('sl_moved_wider', 'violation', 'Dời Stoploss ra xa', -20, false,
  '{"sl_moved": true, "direction": "wider"}', NULL),
('ignore_warning_loss', 'violation', 'Bỏ qua AI cảnh báo + thua', -40, false,
  '{"ignored_warning": true, "result": "loss"}', NULL),
('overtrade', 'violation', 'Overtrade (>10 lệnh/ngày)', -15, false, '{"trades_today_gte": 10}', 1),

-- Learning
('lesson_complete', 'learning', 'Hoàn thành lesson', 10, true, '{}', 5),
('module_complete', 'learning', 'Hoàn thành module', 30, true, '{}', NULL),
('quiz_perfect', 'learning', 'Quiz đạt 100%', 20, true, '{"score": 100}', NULL),
('quiz_pass', 'learning', 'Quiz đạt >= 80%', 10, true, '{"score_gte": 80}', NULL),
('course_complete', 'learning', 'Hoàn thành khóa học', 100, true, '{}', NULL),

-- Wellness
('meditation', 'wellness', 'Nghe bài thiền', 5, true, '{}', 3),
('journal_entry', 'wellness', 'Viết trading journal', 5, true, '{}', 3),
('weekly_review', 'wellness', 'Review tuần', 15, true, '{}', 1),
('morning_ritual', 'wellness', 'Morning ritual check-in', 3, true, '{}', 1),
('tarot_reading', 'wellness', 'Đọc bài Tarot', 3, true, '{}', 2),
('iching_reading', 'wellness', 'Bói quẻ Kinh Dịch', 3, true, '{}', 2),

-- Social
('refer_signup', 'social', 'Giới thiệu bạn đăng ký', 50, true, '{}', NULL),
('refer_subscribe', 'social', 'Bạn giới thiệu mua subscription', 100, true, '{}', NULL),
('helpful_comment', 'social', 'Comment được vote hữu ích', 5, true, '{}', 5),
('quality_post', 'social', 'Bài viết được nhiều like', 10, true, '{"likes_gte": 10}', 3),

-- Inactivity
('inactive_3_days', 'inactivity', 'Không hoạt động 3 ngày', -10, false, '{"inactive_days": 3}', 1),
('inactive_7_days', 'inactivity', 'Không hoạt động 7 ngày', -30, false, '{"inactive_days": 7}', 1),
('inactive_14_days', 'inactivity', 'Không hoạt động 14 ngày', -50, false, '{"inactive_days": 14}', 1),
('streak_break', 'inactivity', 'Mất discipline streak', -20, false, '{}', 1),

-- Recovery
('recovery_meditation_7', 'wellness', 'Meditation 7 ngày liên tiếp', 50, true, '{}', NULL),
('recovery_journal_5', 'wellness', 'Viết 5 journal entries', 30, true, '{}', NULL),
('recovery_course', 'learning', 'Hoàn thành module Tâm Lý Trading', 50, true, '{}', NULL)

ON CONFLICT (id) DO UPDATE SET
  karma_change = EXCLUDED.karma_change,
  conditions = EXCLUDED.conditions,
  daily_limit = EXCLUDED.daily_limit;

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_user_karma_user ON user_karma(user_id);
CREATE INDEX IF NOT EXISTS idx_user_karma_level ON user_karma(karma_level);
CREATE INDEX IF NOT EXISTS idx_user_karma_points ON user_karma(karma_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_karma_frozen ON user_karma(is_frozen) WHERE is_frozen = true;

CREATE INDEX IF NOT EXISTS idx_karma_history_user ON karma_history(user_id);
CREATE INDEX IF NOT EXISTS idx_karma_history_date ON karma_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_karma_history_action ON karma_history(action_type);
CREATE INDEX IF NOT EXISTS idx_karma_history_level_change ON karma_history(level_changed) WHERE level_changed = true;

CREATE INDEX IF NOT EXISTS idx_karma_actions_category ON karma_actions(category);
CREATE INDEX IF NOT EXISTS idx_karma_actions_active ON karma_actions(is_active) WHERE is_active = true;

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE user_karma ENABLE ROW LEVEL SECURITY;
ALTER TABLE karma_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE karma_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE karma_actions ENABLE ROW LEVEL SECURITY;

-- User karma
DROP POLICY IF EXISTS "Users view own karma" ON user_karma;
CREATE POLICY "Users view own karma" ON user_karma
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users view others public karma" ON user_karma;
CREATE POLICY "Users view others public karma" ON user_karma
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = user_karma.user_id AND public_profile = true)
  );

DROP POLICY IF EXISTS "System manage karma" ON user_karma;
CREATE POLICY "System manage karma" ON user_karma
  FOR ALL USING (user_id = auth.uid());

-- Karma history
DROP POLICY IF EXISTS "Users view own history" ON karma_history;
CREATE POLICY "Users view own history" ON karma_history
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System insert history" ON karma_history;
CREATE POLICY "System insert history" ON karma_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Karma levels - public read
DROP POLICY IF EXISTS "Public read karma levels" ON karma_levels;
CREATE POLICY "Public read karma levels" ON karma_levels
  FOR SELECT USING (true);

-- Karma actions - public read
DROP POLICY IF EXISTS "Public read karma actions" ON karma_actions;
CREATE POLICY "Public read karma actions" ON karma_actions
  FOR SELECT USING (true);

-- Admin policies
DROP POLICY IF EXISTS "Admins manage karma levels" ON karma_levels;
CREATE POLICY "Admins manage karma levels" ON karma_levels
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "Admins manage karma actions" ON karma_actions;
CREATE POLICY "Admins manage karma actions" ON karma_actions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Function to determine karma level from points
CREATE OR REPLACE FUNCTION get_karma_level(p_points INT)
RETURNS VARCHAR(20) AS $$
BEGIN
  IF p_points >= 1000 THEN RETURN 'guardian';
  ELSIF p_points >= 800 THEN RETURN 'master';
  ELSIF p_points >= 500 THEN RETURN 'warrior';
  ELSIF p_points >= 200 THEN RETURN 'student';
  ELSE RETURN 'novice';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update user karma
CREATE OR REPLACE FUNCTION update_user_karma(
  p_user_id UUID,
  p_change INT,
  p_action_type VARCHAR(50),
  p_action_detail TEXT DEFAULT NULL,
  p_trade_id UUID DEFAULT NULL,
  p_ai_interaction_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
  v_current_karma INT;
  v_new_karma INT;
  v_old_level VARCHAR(20);
  v_new_level VARCHAR(20);
  v_level_changed BOOLEAN := false;
  v_result JSONB;
  v_level_info RECORD;
BEGIN
  -- Get or create user karma record
  INSERT INTO user_karma (user_id, karma_points, karma_level)
  VALUES (p_user_id, 200, 'student')
  ON CONFLICT (user_id) DO NOTHING;

  -- Lock row for update
  SELECT karma_points, karma_level INTO v_current_karma, v_old_level
  FROM user_karma
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Calculate new karma (clamp between 0 and 9999)
  v_new_karma := GREATEST(0, LEAST(9999, v_current_karma + p_change));

  -- Determine new level
  v_new_level := get_karma_level(v_new_karma);
  v_level_changed := (v_old_level != v_new_level);

  -- Get level restrictions
  SELECT * INTO v_level_info FROM karma_levels WHERE id = v_new_level;

  -- Update user_karma
  UPDATE user_karma SET
    karma_points = v_new_karma,
    karma_level = v_new_level,
    total_earned = CASE WHEN p_change > 0 THEN total_earned + p_change ELSE total_earned END,
    total_lost = CASE WHEN p_change < 0 THEN total_lost + ABS(p_change) ELSE total_lost END,
    highest_karma = GREATEST(highest_karma, v_new_karma),
    lowest_karma = LEAST(lowest_karma, v_new_karma),
    karma_earned_today = CASE
      WHEN last_trade_date = CURRENT_DATE AND p_change > 0 THEN karma_earned_today + p_change
      WHEN last_trade_date != CURRENT_DATE AND p_change > 0 THEN p_change
      WHEN p_change > 0 THEN p_change
      ELSE karma_earned_today
    END,
    karma_lost_today = CASE
      WHEN last_trade_date = CURRENT_DATE AND p_change < 0 THEN karma_lost_today + ABS(p_change)
      WHEN last_trade_date != CURRENT_DATE AND p_change < 0 THEN ABS(p_change)
      WHEN p_change < 0 THEN ABS(p_change)
      ELSE karma_lost_today
    END,
    last_trade_date = CURRENT_DATE,
    is_frozen = (v_new_karma = 0),
    frozen_until = CASE WHEN v_new_karma = 0 THEN NOW() + INTERVAL '24 hours' ELSE frozen_until END,
    ai_monitoring = COALESCE(v_level_info.restrictions->>'ai_monitoring', 'normal'),
    daily_trade_limit = (v_level_info.restrictions->>'daily_trade_limit')::INT,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Insert history record
  INSERT INTO karma_history (
    user_id, change_amount, new_total, previous_total,
    action_type, action_detail, related_trade_id, related_ai_interaction_id,
    old_level, new_level, level_changed, metadata
  ) VALUES (
    p_user_id, p_change, v_new_karma, v_current_karma,
    p_action_type, p_action_detail, p_trade_id, p_ai_interaction_id,
    v_old_level, v_new_level, v_level_changed, p_metadata
  );

  -- Build result
  v_result := jsonb_build_object(
    'success', true,
    'previous_karma', v_current_karma,
    'new_karma', v_new_karma,
    'change', p_change,
    'old_level', v_old_level,
    'new_level', v_new_level,
    'level_changed', v_level_changed,
    'is_frozen', (v_new_karma = 0)
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user karma with full level info
CREATE OR REPLACE FUNCTION get_user_karma_full(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_karma RECORD;
  v_level RECORD;
  v_result JSONB;
BEGIN
  -- Get user karma
  SELECT * INTO v_karma FROM user_karma WHERE user_id = p_user_id;

  IF v_karma IS NULL THEN
    -- Create default karma
    INSERT INTO user_karma (user_id, karma_points, karma_level)
    VALUES (p_user_id, 200, 'student')
    RETURNING * INTO v_karma;
  END IF;

  -- Get level info
  SELECT * INTO v_level FROM karma_levels WHERE id = v_karma.karma_level;

  -- Build result
  v_result := jsonb_build_object(
    'karma_points', v_karma.karma_points,
    'karma_level', v_karma.karma_level,
    'level_name_vi', v_level.name_vi,
    'level_icon', v_level.icon,
    'level_color', v_level.color,
    'level_min_karma', v_level.min_karma,
    'level_max_karma', v_level.max_karma,
    'benefits', v_level.benefits,
    'restrictions', v_level.restrictions,
    'total_earned', v_karma.total_earned,
    'total_lost', v_karma.total_lost,
    'highest_karma', v_karma.highest_karma,
    'lowest_karma', v_karma.lowest_karma,
    'discipline_streak', v_karma.current_discipline_streak,
    'best_streak', v_karma.best_discipline_streak,
    'is_frozen', v_karma.is_frozen,
    'frozen_until', v_karma.frozen_until,
    'ai_monitoring', v_karma.ai_monitoring,
    'daily_trade_limit', v_karma.daily_trade_limit,
    'trades_today', v_karma.trades_today,
    'karma_earned_today', v_karma.karma_earned_today,
    'karma_lost_today', v_karma.karma_lost_today
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get karma leaderboard
CREATE OR REPLACE FUNCTION get_karma_leaderboard(p_limit INT DEFAULT 20)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'rank', row_number,
      'user_id', user_id,
      'karma_points', karma_points,
      'karma_level', karma_level,
      'streak', current_discipline_streak,
      'display_name', display_name,
      'avatar_url', avatar_url
    )
  )
  INTO v_result
  FROM (
    SELECT
      ROW_NUMBER() OVER (ORDER BY uk.karma_points DESC) as row_number,
      uk.user_id,
      uk.karma_points,
      uk.karma_level,
      uk.current_discipline_streak,
      p.display_name,
      p.avatar_url
    FROM user_karma uk
    JOIN profiles p ON uk.user_id = p.id
    WHERE uk.is_frozen = false
      AND p.public_profile = true
    ORDER BY uk.karma_points DESC
    LIMIT p_limit
  ) ranked;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update discipline streak
CREATE OR REPLACE FUNCTION update_discipline_streak(
  p_user_id UUID,
  p_is_disciplined BOOLEAN
)
RETURNS JSONB AS $$
DECLARE
  v_karma RECORD;
  v_new_streak INT;
  v_streak_bonus INT := 0;
  v_streak_broken BOOLEAN := false;
BEGIN
  SELECT * INTO v_karma FROM user_karma WHERE user_id = p_user_id FOR UPDATE;

  IF v_karma IS NULL THEN
    INSERT INTO user_karma (user_id) VALUES (p_user_id) RETURNING * INTO v_karma;
  END IF;

  IF p_is_disciplined THEN
    -- Check if last trade was today or yesterday
    IF v_karma.last_discipline_trade_at IS NULL
       OR v_karma.last_discipline_trade_at::DATE = CURRENT_DATE - 1
       OR v_karma.last_discipline_trade_at::DATE = CURRENT_DATE THEN
      v_new_streak := v_karma.current_discipline_streak + 1;

      -- Streak bonuses
      IF v_new_streak = 3 THEN v_streak_bonus := 30;
      ELSIF v_new_streak = 7 THEN v_streak_bonus := 100;
      ELSIF v_new_streak = 14 THEN v_streak_bonus := 200;
      ELSIF v_new_streak = 30 THEN v_streak_bonus := 500;
      END IF;
    ELSE
      -- Streak was already broken, start new
      v_new_streak := 1;
    END IF;

    UPDATE user_karma SET
      current_discipline_streak = v_new_streak,
      best_discipline_streak = GREATEST(best_discipline_streak, v_new_streak),
      last_discipline_trade_at = NOW()
    WHERE user_id = p_user_id;

  ELSE
    -- Break streak
    v_streak_broken := v_karma.current_discipline_streak > 0;
    v_new_streak := 0;

    UPDATE user_karma SET
      current_discipline_streak = 0,
      last_discipline_trade_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'new_streak', v_new_streak,
    'streak_bonus', v_streak_bonus,
    'streak_broken', v_streak_broken,
    'previous_streak', v_karma.current_discipline_streak
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment trades today
CREATE OR REPLACE FUNCTION increment_trades_today(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_trades INT;
BEGIN
  UPDATE user_karma SET
    trades_today = CASE
      WHEN last_trade_date = CURRENT_DATE THEN trades_today + 1
      ELSE 1
    END,
    last_trade_date = CURRENT_DATE
  WHERE user_id = p_user_id
  RETURNING trades_today INTO v_trades;

  -- Create record if not exists
  IF v_trades IS NULL THEN
    INSERT INTO user_karma (user_id, trades_today, last_trade_date)
    VALUES (p_user_id, 1, CURRENT_DATE)
    ON CONFLICT (user_id) DO UPDATE SET
      trades_today = 1,
      last_trade_date = CURRENT_DATE
    RETURNING trades_today INTO v_trades;
  END IF;

  RETURN COALESCE(v_trades, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to reset daily counters
CREATE OR REPLACE FUNCTION reset_daily_karma_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_trade_date IS DISTINCT FROM OLD.last_trade_date THEN
    NEW.karma_earned_today := 0;
    NEW.karma_lost_today := 0;
    NEW.trades_today := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reset_daily_karma ON user_karma;
CREATE TRIGGER trigger_reset_daily_karma
  BEFORE UPDATE ON user_karma
  FOR EACH ROW
  WHEN (NEW.last_trade_date IS DISTINCT FROM OLD.last_trade_date)
  EXECUTE FUNCTION reset_daily_karma_counters();

-- ═══════════════════════════════════════════════════════════════════════════
-- GRANT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════

GRANT EXECUTE ON FUNCTION get_karma_level(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_karma(UUID, INT, VARCHAR, TEXT, UUID, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_karma_full(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_karma_leaderboard(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_discipline_streak(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_trades_today(UUID) TO authenticated;
