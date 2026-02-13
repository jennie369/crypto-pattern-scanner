-- RUN THIS FIRST: Drop existing functions before updating
-- This fixes "cannot change return type of existing function" error

DROP FUNCTION IF EXISTS get_habit_grid_data(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_daily_completion_status(UUID);
DROP FUNCTION IF EXISTS track_daily_completion(UUID, TEXT);
DROP FUNCTION IF EXISTS update_streak(UUID, TEXT);

-- After running this, run the main migration file:
-- 20251211_action_tracking_gamification.sql
