-- ============================================
-- FIX CALENDAR FUNCTIONS
-- Run this to fix sync_calendar_event duplicate error
-- December 10, 2025
-- ============================================

-- STEP 1: Drop ALL versions of conflicting functions
DO $$
DECLARE
  func RECORD;
BEGIN
  FOR func IN
    SELECT oid::regprocedure as func_sig
    FROM pg_proc
    WHERE proname IN (
      'sync_calendar_event',
      'get_calendar_events',
      'complete_calendar_event',
      'delete_calendar_events_by_source',
      'get_today_events_count',
      'get_upcoming_events'
    )
    AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || func.func_sig || ' CASCADE';
  END LOOP;
END $$;

-- STEP 2: Ensure calendar_events table has all columns
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS end_time TIME;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS is_all_day BOOLEAN DEFAULT TRUE;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS recurrence_rule TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS life_area TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS reminder_minutes INTEGER;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- STEP 3: Create calendar functions

-- Get calendar events
CREATE OR REPLACE FUNCTION get_calendar_events(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  source_type TEXT,
  source_id UUID,
  event_date DATE,
  start_time TIME,
  end_time TIME,
  is_all_day BOOLEAN,
  is_recurring BOOLEAN,
  recurrence_rule TEXT,
  color TEXT,
  icon TEXT,
  life_area TEXT,
  priority INTEGER,
  is_completed BOOLEAN,
  completed_at TIMESTAMPTZ,
  metadata JSONB
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.title::TEXT,
    ce.description::TEXT,
    ce.source_type::TEXT,
    ce.source_id,
    ce.event_date,
    ce.start_time,
    ce.end_time,
    ce.is_all_day,
    ce.is_recurring,
    ce.recurrence_rule::TEXT,
    ce.color::TEXT,
    ce.icon::TEXT,
    ce.life_area::TEXT,
    ce.priority,
    ce.is_completed,
    ce.completed_at,
    ce.metadata
  FROM calendar_events ce
  WHERE ce.user_id = p_user_id
    AND ce.event_date >= p_start_date
    AND ce.event_date <= p_end_date
  ORDER BY ce.event_date, ce.start_time NULLS LAST;
END;
$$;

-- Complete calendar event
CREATE OR REPLACE FUNCTION complete_calendar_event(
  p_event_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE calendar_events
  SET is_completed = TRUE, completed_at = NOW()
  WHERE id = p_event_id
    AND user_id = p_user_id
    AND is_completed = FALSE;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;

-- Sync calendar event (upsert from widget)
CREATE OR REPLACE FUNCTION sync_calendar_event(
  p_user_id UUID,
  p_source_type TEXT,
  p_source_id UUID,
  p_title TEXT,
  p_event_date DATE,
  p_description TEXT DEFAULT NULL,
  p_life_area TEXT DEFAULT NULL,
  p_icon TEXT DEFAULT 'calendar',
  p_color TEXT DEFAULT '#FFBD59',
  p_is_recurring BOOLEAN DEFAULT FALSE,
  p_recurrence_rule TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_event_id UUID;
BEGIN
  -- Try update first
  UPDATE calendar_events
  SET
    title = p_title,
    description = p_description,
    event_date = p_event_date,
    life_area = p_life_area,
    icon = p_icon,
    color = p_color,
    is_recurring = p_is_recurring,
    recurrence_rule = p_recurrence_rule,
    metadata = p_metadata,
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND source_type = p_source_type
    AND source_id = p_source_id
  RETURNING id INTO v_event_id;

  -- Insert if not exists
  IF v_event_id IS NULL THEN
    INSERT INTO calendar_events (
      user_id, source_type, source_id, title, description,
      event_date, life_area, icon, color, is_recurring,
      recurrence_rule, metadata
    )
    VALUES (
      p_user_id, p_source_type, p_source_id, p_title, p_description,
      p_event_date, p_life_area, p_icon, p_color, p_is_recurring,
      p_recurrence_rule, p_metadata
    )
    RETURNING id INTO v_event_id;
  END IF;

  RETURN v_event_id;
END;
$$;

-- Delete calendar events by source
CREATE OR REPLACE FUNCTION delete_calendar_events_by_source(
  p_user_id UUID,
  p_source_type TEXT,
  p_source_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM calendar_events
  WHERE user_id = p_user_id
    AND source_type = p_source_type
    AND source_id = p_source_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Get today's events count
CREATE OR REPLACE FUNCTION get_today_events_count(p_user_id UUID)
RETURNS TABLE (total INTEGER, completed INTEGER, pending INTEGER)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total,
    COUNT(*) FILTER (WHERE ce.is_completed)::INTEGER as completed,
    COUNT(*) FILTER (WHERE NOT ce.is_completed)::INTEGER as pending
  FROM calendar_events ce
  WHERE ce.user_id = p_user_id
    AND ce.event_date = CURRENT_DATE;
END;
$$;

-- Get upcoming events
CREATE OR REPLACE FUNCTION get_upcoming_events(
  p_user_id UUID,
  p_days INTEGER DEFAULT 7,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  event_date DATE,
  start_time TIME,
  source_type TEXT,
  color TEXT,
  icon TEXT,
  is_completed BOOLEAN
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.title::TEXT,
    ce.event_date,
    ce.start_time,
    ce.source_type::TEXT,
    ce.color::TEXT,
    ce.icon::TEXT,
    ce.is_completed
  FROM calendar_events ce
  WHERE ce.user_id = p_user_id
    AND ce.event_date >= CURRENT_DATE
    AND ce.event_date <= CURRENT_DATE + p_days
    AND NOT ce.is_completed
  ORDER BY ce.event_date, ce.start_time NULLS LAST
  LIMIT p_limit;
END;
$$;

-- STEP 4: Grant permissions
GRANT EXECUTE ON FUNCTION get_calendar_events(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_calendar_event(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_calendar_event(UUID, TEXT, UUID, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_calendar_events_by_source(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_today_events_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_upcoming_events(UUID, INTEGER, INTEGER) TO authenticated;

-- DONE!
SELECT 'Calendar functions created successfully!' as status;
