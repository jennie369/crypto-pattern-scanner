-- ============================================
-- VISION BOARD 2.0 - Enhanced Gamification
-- Created: December 9, 2025
-- Purpose: XP rewards, level system, expanded achievements
-- ============================================

-- ============================================
-- Add xp_earned column to daily_completions if not exists
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_completions' AND column_name = 'xp_earned'
  ) THEN
    ALTER TABLE daily_completions ADD COLUMN xp_earned INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- Add xp_rewards column to vision_board_widgets if not exists
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vision_board_widgets' AND column_name = 'xp_rewards'
  ) THEN
    ALTER TABLE vision_board_widgets ADD COLUMN xp_rewards JSONB DEFAULT '{}';
  END IF;
END $$;

-- ============================================
-- Create user_levels table for tracking level progress
-- ============================================
CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  xp_this_week INTEGER DEFAULT 0,
  xp_this_month INTEGER DEFAULT 0,
  last_level_up TIMESTAMPTZ,
  level_up_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own levels" ON user_levels;
CREATE POLICY "Users manage own levels" ON user_levels
  FOR ALL USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_levels_user ON user_levels(user_id);

-- ============================================
-- Create achievements_catalog table for storing achievement definitions
-- ============================================
CREATE TABLE IF NOT EXISTS achievements_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_key VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  xp_reward INTEGER DEFAULT 0,
  category VARCHAR(50),
  threshold INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Populate achievements catalog
INSERT INTO achievements_catalog (achievement_key, title, description, icon, xp_reward, category, threshold)
VALUES
  -- Streak achievements
  ('streak_3', 'Khởi Đầu Tốt', 'Duy trì streak 3 ngày liên tiếp', 'flame', 30, 'streak', 3),
  ('streak_7', 'Một Tuần Kiên Trì', 'Duy trì streak 7 ngày liên tiếp', 'fire', 70, 'streak', 7),
  ('streak_14', 'Chiến Binh 2 Tuần', 'Duy trì streak 14 ngày liên tiếp', 'zap', 150, 'streak', 14),
  ('streak_30', 'Bậc Thầy Kiên Trì', 'Duy trì streak 30 ngày liên tiếp', 'award', 300, 'streak', 30),
  ('streak_100', 'Huyền Thoại', 'Duy trì streak 100 ngày liên tiếp', 'crown', 1000, 'streak', 100),

  -- Combo achievements
  ('combo_first', 'Combo Đầu Tiên', 'Hoàn thành combo đầu tiên trong ngày', 'sparkles', 20, 'combo', 1),
  ('combo_3_days', 'Combo 3 Ngày', 'Đạt combo 3 ngày liên tiếp', 'star', 50, 'combo', 3),
  ('combo_7_days', 'Combo Tuần', 'Đạt combo 7 ngày liên tiếp', 'trophy', 100, 'combo', 7),
  ('combo_14_days', 'Combo Master', 'Đạt combo 14 ngày liên tiếp', 'gem', 200, 'combo', 14),

  -- Goal achievements
  ('goal_first', 'Mục Tiêu Đầu Tiên', 'Tạo mục tiêu đầu tiên', 'target', 20, 'goal', 1),
  ('goal_complete_1', 'Chinh Phục', 'Hoàn thành mục tiêu đầu tiên', 'check-circle', 100, 'goal', 1),
  ('goal_complete_5', 'Người Chinh Phục', 'Hoàn thành 5 mục tiêu', 'medal', 300, 'goal', 5),
  ('goal_complete_10', 'Bậc Thầy Mục Tiêu', 'Hoàn thành 10 mục tiêu', 'crown', 500, 'goal', 10),

  -- Life area achievements
  ('balanced_life', 'Cuộc Sống Cân Bằng', 'Có mục tiêu trong 3+ lĩnh vực', 'compass', 50, 'life_area', 3),
  ('area_master', 'Bậc Thầy Lĩnh Vực', 'Đạt 100% trong 1 lĩnh vực', 'award', 150, 'life_area', 100),
  ('all_areas', 'Toàn Diện', 'Có mục tiêu trong tất cả 6 lĩnh vực', 'hexagon', 200, 'life_area', 6),

  -- Special achievements
  ('early_bird', 'Chim Sớm', 'Hoàn thành task trước 7 giờ sáng', 'sunrise', 30, 'special', 1),
  ('night_owl', 'Cú Đêm', 'Hoàn thành task sau 10 giờ tối', 'moon', 30, 'special', 1),
  ('perfect_week', 'Tuần Hoàn Hảo', 'Hoàn thành tất cả tasks 7 ngày liên tiếp', 'calendar', 200, 'special', 7),
  ('perfect_month', 'Tháng Hoàn Hảo', 'Hoàn thành tất cả tasks 30 ngày liên tiếp', 'calendar-check', 1000, 'special', 30)
ON CONFLICT (achievement_key) DO NOTHING;

-- Enable RLS on achievements_catalog (public read)
ALTER TABLE achievements_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read achievements" ON achievements_catalog;
CREATE POLICY "Anyone can read achievements" ON achievements_catalog FOR SELECT USING (true);

-- ============================================
-- Function: Calculate level from total XP
-- ============================================
CREATE OR REPLACE FUNCTION calculate_level(p_total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_thresholds INTEGER[] := ARRAY[0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000];
  v_level INTEGER := 1;
BEGIN
  FOR i IN REVERSE 12..1 LOOP
    IF p_total_xp >= v_thresholds[i] THEN
      v_level := i;
      EXIT;
    END IF;
  END LOOP;
  RETURN v_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Function: Award XP to user
-- ============================================
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_reason VARCHAR(100)
)
RETURNS JSONB AS $$
DECLARE
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_new_total INTEGER;
  v_level_up BOOLEAN := FALSE;
BEGIN
  -- Get current level
  SELECT current_level, total_xp INTO v_old_level, v_new_total
  FROM user_levels
  WHERE user_id = p_user_id;

  -- Create record if not exists
  IF NOT FOUND THEN
    INSERT INTO user_levels (user_id, current_level, total_xp)
    VALUES (p_user_id, 1, p_xp_amount)
    RETURNING current_level, total_xp INTO v_old_level, v_new_total;
    v_old_level := 1;
  ELSE
    v_new_total := v_new_total + p_xp_amount;
  END IF;

  -- Calculate new level
  v_new_level := calculate_level(v_new_total);

  -- Check for level up
  IF v_new_level > v_old_level THEN
    v_level_up := TRUE;
  END IF;

  -- Update user_levels
  UPDATE user_levels
  SET total_xp = v_new_total,
      current_level = v_new_level,
      xp_this_week = xp_this_week + p_xp_amount,
      xp_this_month = xp_this_month + p_xp_amount,
      last_level_up = CASE WHEN v_level_up THEN NOW() ELSE last_level_up END,
      level_up_count = CASE WHEN v_level_up THEN level_up_count + 1 ELSE level_up_count END,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Update daily_completions xp_earned
  INSERT INTO daily_completions (user_id, completion_date, xp_earned)
  VALUES (p_user_id, CURRENT_DATE, p_xp_amount)
  ON CONFLICT (user_id, completion_date)
  DO UPDATE SET xp_earned = daily_completions.xp_earned + p_xp_amount;

  RETURN jsonb_build_object(
    'xp_earned', p_xp_amount,
    'reason', p_reason,
    'new_total', v_new_total,
    'old_level', v_old_level,
    'new_level', v_new_level,
    'level_up', v_level_up
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Get user level info
-- ============================================
CREATE OR REPLACE FUNCTION get_user_level_info(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_level_data RECORD;
  v_level_titles TEXT[] := ARRAY[
    'Người Mới Bắt Đầu',
    'Người Tập Sự',
    'Người Nỗ Lực',
    'Người Kiên Trì',
    'Người Quyết Tâm',
    'Chiến Binh',
    'Chiến Binh Bạc',
    'Chiến Binh Vàng',
    'Bậc Thầy',
    'Huyền Thoại',
    'Đại Sư',
    'Bất Tử'
  ];
  v_level_badges TEXT[] := ARRAY[
    'seedling',
    'sprout',
    'tree',
    'star',
    'star-filled',
    'sword',
    'shield',
    'crown',
    'gem',
    'trident',
    'galaxy',
    'sparkles'
  ];
  v_thresholds INTEGER[] := ARRAY[0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000];
BEGIN
  SELECT
    current_level,
    total_xp,
    xp_this_week,
    xp_this_month,
    last_level_up,
    level_up_count
  INTO v_level_data
  FROM user_levels
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    v_level_data := ROW(1, 0, 0, 0, NULL, 0);
  END IF;

  v_result := jsonb_build_object(
    'current_level', v_level_data.current_level,
    'total_xp', v_level_data.total_xp,
    'xp_this_week', v_level_data.xp_this_week,
    'xp_this_month', v_level_data.xp_this_month,
    'level_title', v_level_titles[v_level_data.current_level],
    'level_badge', v_level_badges[v_level_data.current_level],
    'xp_for_current_level', v_thresholds[v_level_data.current_level],
    'xp_for_next_level', CASE
      WHEN v_level_data.current_level >= 12 THEN 0
      ELSE v_thresholds[v_level_data.current_level + 1]
    END,
    'xp_progress', CASE
      WHEN v_level_data.current_level >= 12 THEN 100
      ELSE ROUND(
        (v_level_data.total_xp - v_thresholds[v_level_data.current_level])::DECIMAL /
        (v_thresholds[v_level_data.current_level + 1] - v_thresholds[v_level_data.current_level]) * 100
      )
    END,
    'last_level_up', v_level_data.last_level_up,
    'total_level_ups', v_level_data.level_up_count
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Check and unlock achievements
-- ============================================
CREATE OR REPLACE FUNCTION check_achievements(
  p_user_id UUID,
  p_category VARCHAR(50)
)
RETURNS JSONB AS $$
DECLARE
  v_unlocked JSONB := '[]'::JSONB;
  v_achievement RECORD;
  v_threshold_met BOOLEAN;
  v_current_value INTEGER;
BEGIN
  FOR v_achievement IN
    SELECT * FROM achievements_catalog
    WHERE category = p_category
      AND achievement_key NOT IN (
        SELECT ua.achievement_id::TEXT FROM user_achievements ua
        WHERE ua.user_id = p_user_id
      )
  LOOP
    v_threshold_met := FALSE;

    -- Check threshold based on category
    CASE p_category
      WHEN 'streak' THEN
        SELECT current_streak INTO v_current_value
        FROM user_streaks WHERE user_id = p_user_id;
        v_threshold_met := COALESCE(v_current_value, 0) >= v_achievement.threshold;

      WHEN 'combo' THEN
        SELECT combo_count INTO v_current_value
        FROM daily_completions
        WHERE user_id = p_user_id AND completion_date = CURRENT_DATE;
        v_threshold_met := COALESCE(v_current_value, 0) >= v_achievement.threshold;

      WHEN 'goal' THEN
        SELECT COUNT(*) INTO v_current_value
        FROM vision_board_widgets
        WHERE user_id = p_user_id AND widget_type = 'goal' AND is_completed = TRUE;
        v_threshold_met := v_current_value >= v_achievement.threshold;

      WHEN 'life_area' THEN
        SELECT COUNT(DISTINCT content->>'life_area') INTO v_current_value
        FROM vision_board_widgets
        WHERE user_id = p_user_id AND widget_type = 'goal';
        v_threshold_met := v_current_value >= v_achievement.threshold;

      ELSE
        v_threshold_met := FALSE;
    END CASE;

    -- Unlock achievement if threshold met
    IF v_threshold_met THEN
      INSERT INTO user_achievements (user_id, achievement_id, achievement_type, points_awarded)
      VALUES (p_user_id, v_achievement.achievement_key, p_category, v_achievement.xp_reward)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;

      -- Award XP for achievement
      PERFORM award_xp(p_user_id, v_achievement.xp_reward, 'achievement_' || v_achievement.achievement_key);

      v_unlocked := v_unlocked || jsonb_build_object(
        'id', v_achievement.id,
        'key', v_achievement.achievement_key,
        'title', v_achievement.title,
        'description', v_achievement.description,
        'icon', v_achievement.icon,
        'xp_reward', v_achievement.xp_reward
      );
    END IF;
  END LOOP;

  RETURN v_unlocked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Complete widget with XP
-- ============================================
CREATE OR REPLACE FUNCTION complete_widget_with_xp(
  p_widget_id UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_widget RECORD;
  v_xp_amount INTEGER;
  v_xp_result JSONB;
  v_achievements JSONB;
BEGIN
  -- Get widget info
  SELECT * INTO v_widget
  FROM vision_board_widgets
  WHERE id = p_widget_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Widget not found');
  END IF;

  -- Determine XP based on widget type
  CASE v_widget.widget_type
    WHEN 'action' THEN v_xp_amount := 20;
    WHEN 'affirmation' THEN v_xp_amount := 5;
    WHEN 'habit' THEN v_xp_amount := 10;
    WHEN 'goal' THEN v_xp_amount := 500;
    ELSE v_xp_amount := 10;
  END CASE;

  -- Mark widget as completed
  UPDATE vision_board_widgets
  SET is_completed = TRUE,
      completed_at = NOW()
  WHERE id = p_widget_id;

  -- Award XP
  SELECT award_xp(p_user_id, v_xp_amount, v_widget.widget_type || '_complete')
  INTO v_xp_result;

  -- Update daily completion using existing track_daily_completion function
  -- Maps widget types to existing boolean columns in daily_completions
  CASE v_widget.widget_type
    WHEN 'action' THEN
      -- Actions count as goal progress
      UPDATE daily_completions
      SET goal_done = TRUE, updated_at = NOW()
      WHERE user_id = p_user_id AND completion_date = CURRENT_DATE;
    WHEN 'affirmation' THEN
      UPDATE daily_completions
      SET affirmation_done = TRUE, updated_at = NOW()
      WHERE user_id = p_user_id AND completion_date = CURRENT_DATE;
    WHEN 'habit' THEN
      UPDATE daily_completions
      SET habit_done = TRUE, updated_at = NOW()
      WHERE user_id = p_user_id AND completion_date = CURRENT_DATE;
    ELSE NULL;
  END CASE;

  -- Check for achievements
  SELECT check_achievements(p_user_id, 'goal') INTO v_achievements;

  RETURN jsonb_build_object(
    'success', TRUE,
    'widget_type', v_widget.widget_type,
    'xp_awarded', v_xp_result,
    'achievements_unlocked', v_achievements
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- NOTE: user_achievements table is already used for tracking unlocked achievements
-- No need for separate user_unlocked_achievements table
-- ============================================

-- ============================================
-- Weekly XP reset function (run via cron)
-- ============================================
CREATE OR REPLACE FUNCTION reset_weekly_xp()
RETURNS void AS $$
BEGIN
  UPDATE user_levels
  SET xp_this_week = 0,
      updated_at = NOW()
  WHERE TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Monthly XP reset function (run via cron)
-- ============================================
CREATE OR REPLACE FUNCTION reset_monthly_xp()
RETURNS void AS $$
BEGIN
  UPDATE user_levels
  SET xp_this_month = 0,
      updated_at = NOW()
  WHERE TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION award_xp TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_level_info TO authenticated;
GRANT EXECUTE ON FUNCTION check_achievements TO authenticated;
GRANT EXECUTE ON FUNCTION complete_widget_with_xp TO authenticated;
