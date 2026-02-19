-- =============================================
-- Fix GemMaster Web Sync Issues
-- Date: 2026-02-19
-- =============================================

-- =============================================
-- FIX 1: get_user_level_info ROW constructor bug
-- The NOT FOUND path used ROW(1,0,0,0,NULL,0) which creates
-- an anonymous record without field names, causing:
-- "record v_level_data has no field current_level"
-- Fix: Use SELECT ... INTO with named columns instead.
-- =============================================
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
    -- Fix: Use SELECT with named columns instead of anonymous ROW constructor
    SELECT 1 AS current_level, 0 AS total_xp, 0 AS xp_this_week,
           0 AS xp_this_month, NULL::timestamptz AS last_level_up, 0 AS level_up_count
    INTO v_level_data;
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
        GREATEST(v_thresholds[v_level_data.current_level + 1] - v_thresholds[v_level_data.current_level], 1) * 100
      )
    END,
    'last_level_up', v_level_data.last_level_up,
    'total_level_ups', v_level_data.level_up_count
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_level_info TO authenticated;

-- =============================================
-- FIX 2: user_achievements RLS policy leak
-- Old "Anyone can view user achievements" policy with USING(true)
-- coexists with newer user-scoped policy. Since Postgres OR's
-- multiple SELECT policies, the USING(true) wins and exposes
-- all user achievement data to anonymous users.
-- Fix: Drop the permissive policy, keep only user-scoped one.
-- =============================================
DROP POLICY IF EXISTS "Anyone can view user achievements" ON user_achievements;
DROP POLICY IF EXISTS "Anyone can view achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can read own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can insert achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can unlock own achievements" ON user_achievements;

-- Recreate with proper user-scoped policies
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role needs full access for RPC functions that award achievements
CREATE POLICY "Service role full access on user_achievements"
  ON user_achievements FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
