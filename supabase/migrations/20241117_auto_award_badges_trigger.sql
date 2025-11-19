-- ==============================================================================
-- AUTO-AWARD BADGES TRIGGER
-- ==============================================================================
-- Creates a database trigger that automatically calls the Edge Function
-- to award level badges when user_stats are updated

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_auto_award_badges ON user_stats;
DROP FUNCTION IF EXISTS notify_auto_award_badges();

-- Create function to call Edge Function
CREATE OR REPLACE FUNCTION notify_auto_award_badges()
RETURNS TRIGGER AS $$
DECLARE
  request_id INT;
BEGIN
  -- Only trigger if win_rate changed or new record
  IF (TG_OP = 'INSERT') OR (NEW.win_rate IS DISTINCT FROM OLD.win_rate) THEN

    -- Call Edge Function using pg_net extension
    SELECT
      net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/auto-award-badges',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
        ),
        body := jsonb_build_object(
          'record', jsonb_build_object(
            'user_id', NEW.user_id,
            'win_rate', COALESCE(NEW.win_rate, 0),
            'total_trades', COALESCE(NEW.total_trades, 0)
          )
        )
      ) INTO request_id;

    RAISE NOTICE 'Auto-award badges triggered for user: % (request_id: %)', NEW.user_id, request_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER trigger_auto_award_badges
  AFTER INSERT OR UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION notify_auto_award_badges();

COMMENT ON TRIGGER trigger_auto_award_badges ON user_stats IS
  'Automatically awards level badges based on win rate when user stats are updated';

-- ==============================================================================
-- ALTERNATIVE: Manual Award Function (if Edge Function not available)
-- ==============================================================================
-- This function can be called directly from the application if needed

CREATE OR REPLACE FUNCTION award_level_badge(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_win_rate NUMERIC;
  v_level_badge TEXT;
BEGIN
  -- Get current win rate
  SELECT win_rate INTO v_win_rate
  FROM user_stats
  WHERE user_id = p_user_id;

  -- Determine badge
  IF v_win_rate >= 95 THEN
    v_level_badge := 'diamond';
  ELSIF v_win_rate >= 85 THEN
    v_level_badge := 'platinum';
  ELSIF v_win_rate >= 75 THEN
    v_level_badge := 'gold';
  ELSIF v_win_rate >= 60 THEN
    v_level_badge := 'silver';
  ELSE
    v_level_badge := 'bronze';
  END IF;

  -- Update user
  UPDATE users
  SET level_badge = v_level_badge
  WHERE id = p_user_id;

  RETURN v_level_badge;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION award_level_badge(UUID) IS
  'Manually award level badge to a user based on their win rate';

-- Grant execute permission
GRANT EXECUTE ON FUNCTION award_level_badge(UUID) TO authenticated;
