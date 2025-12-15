-- ============================================
-- Calendar Events System for Vision Board 2.0
-- Created: December 10, 2025
-- ============================================

-- Drop existing functions first
DROP FUNCTION IF EXISTS get_calendar_events(UUID, DATE, DATE);
DROP FUNCTION IF EXISTS complete_calendar_event(UUID, UUID);
DROP FUNCTION IF EXISTS sync_calendar_event(UUID, TEXT, UUID, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT, JSONB);
DROP FUNCTION IF EXISTS delete_calendar_events_by_source(UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS get_today_events_count(UUID);
DROP FUNCTION IF EXISTS get_upcoming_events(UUID, INTEGER, INTEGER);

-- Drop existing table if needed
DROP TABLE IF EXISTS calendar_events CASCADE;

-- ============================================
-- CALENDAR_EVENTS TABLE
-- ============================================
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event details
  title TEXT NOT NULL,
  description TEXT,

  -- Source tracking (link to goals/actions/habits)
  source_type TEXT NOT NULL DEFAULT 'manual',
  source_id UUID, -- Reference to widget/goal/action ID

  -- Date & Time
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_all_day BOOLEAN DEFAULT TRUE,

  -- Recurrence
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT, -- 'DAILY', 'WEEKLY', 'MONTHLY', etc.
  recurrence_end_date DATE,

  -- Display
  color TEXT DEFAULT '#FFBD59',
  icon TEXT DEFAULT 'calendar',
  life_area TEXT,
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),

  -- Status
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,

  -- Reminder
  reminder_minutes INTEGER, -- Minutes before event

  -- Extra data
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX idx_calendar_events_user_date ON calendar_events(user_id, event_date);
CREATE INDEX idx_calendar_events_source ON calendar_events(source_type, source_id);
CREATE INDEX idx_calendar_events_recurring ON calendar_events(is_recurring) WHERE is_recurring = TRUE;

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Users can only see their own events
CREATE POLICY "Users can view own calendar events"
  ON calendar_events FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own events
CREATE POLICY "Users can create own calendar events"
  ON calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own events
CREATE POLICY "Users can update own calendar events"
  ON calendar_events FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own events
CREATE POLICY "Users can delete own calendar events"
  ON calendar_events FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_events_updated_at();

-- ============================================
-- RPC: GET CALENDAR EVENTS
-- ============================================
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
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.title,
    ce.description,
    ce.source_type,
    ce.source_id,
    ce.event_date,
    ce.start_time,
    ce.end_time,
    ce.is_all_day,
    ce.is_recurring,
    ce.recurrence_rule,
    ce.color,
    ce.icon,
    ce.life_area,
    ce.priority,
    ce.is_completed,
    ce.completed_at,
    ce.metadata
  FROM calendar_events ce
  WHERE ce.user_id = p_user_id
    AND ce.event_date >= p_start_date
    AND ce.event_date <= p_end_date
  ORDER BY ce.event_date, ce.start_time NULLS LAST, ce.priority DESC;
END;
$$;

-- ============================================
-- RPC: COMPLETE CALENDAR EVENT
-- ============================================
CREATE OR REPLACE FUNCTION complete_calendar_event(
  p_event_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated BOOLEAN := FALSE;
BEGIN
  UPDATE calendar_events
  SET
    is_completed = TRUE,
    completed_at = NOW()
  WHERE id = p_event_id
    AND user_id = p_user_id
    AND is_completed = FALSE;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  RETURN v_updated > 0;
END;
$$;

-- ============================================
-- RPC: SYNC CALENDAR EVENT (Upsert from widget)
-- ============================================
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
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  -- Try to update existing event
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

  -- If no existing event, insert new one
  IF v_event_id IS NULL THEN
    INSERT INTO calendar_events (
      user_id,
      source_type,
      source_id,
      title,
      description,
      event_date,
      life_area,
      icon,
      color,
      is_recurring,
      recurrence_rule,
      metadata
    ) VALUES (
      p_user_id,
      p_source_type,
      p_source_id,
      p_title,
      p_description,
      p_event_date,
      p_life_area,
      p_icon,
      p_color,
      p_is_recurring,
      p_recurrence_rule,
      p_metadata
    )
    RETURNING id INTO v_event_id;
  END IF;

  RETURN v_event_id;
END;
$$;

-- ============================================
-- RPC: DELETE CALENDAR EVENTS BY SOURCE
-- ============================================
CREATE OR REPLACE FUNCTION delete_calendar_events_by_source(
  p_user_id UUID,
  p_source_type TEXT,
  p_source_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM calendar_events
  WHERE user_id = p_user_id
    AND source_type = p_source_type
    AND source_id = p_source_id;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count;
END;
$$;

-- ============================================
-- RPC: GET TODAY'S EVENTS COUNT
-- ============================================
CREATE OR REPLACE FUNCTION get_today_events_count(p_user_id UUID)
RETURNS TABLE (
  total INTEGER,
  completed INTEGER,
  pending INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total,
    COUNT(*) FILTER (WHERE is_completed = TRUE)::INTEGER as completed,
    COUNT(*) FILTER (WHERE is_completed = FALSE)::INTEGER as pending
  FROM calendar_events
  WHERE user_id = p_user_id
    AND event_date = CURRENT_DATE;
END;
$$;

-- ============================================
-- RPC: GET UPCOMING EVENTS
-- ============================================
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
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.title,
    ce.event_date,
    ce.start_time,
    ce.source_type,
    ce.color,
    ce.icon,
    ce.is_completed
  FROM calendar_events ce
  WHERE ce.user_id = p_user_id
    AND ce.event_date >= CURRENT_DATE
    AND ce.event_date <= CURRENT_DATE + p_days
    AND ce.is_completed = FALSE
  ORDER BY ce.event_date, ce.start_time NULLS LAST
  LIMIT p_limit;
END;
$$;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON calendar_events TO authenticated;
GRANT EXECUTE ON FUNCTION get_calendar_events TO authenticated;
GRANT EXECUTE ON FUNCTION complete_calendar_event TO authenticated;
GRANT EXECUTE ON FUNCTION sync_calendar_event TO authenticated;
GRANT EXECUTE ON FUNCTION delete_calendar_events_by_source TO authenticated;
GRANT EXECUTE ON FUNCTION get_today_events_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_upcoming_events TO authenticated;

-- ============================================
-- DONE!
-- ============================================
