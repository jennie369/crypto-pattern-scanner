-- ============================================
-- VISION BOARD 2.0 - Calendar Events Table
-- Created: December 9, 2025
-- Purpose: Sync calendar events từ goals/actions/habits
-- ============================================

-- Calendar events table (sync từ goals/actions/habits)
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  source_type VARCHAR(50) NOT NULL, -- 'goal_deadline', 'action_due', 'habit_daily', 'divination', 'manual'
  source_id UUID, -- Reference to original widget/item
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_all_day BOOLEAN DEFAULT TRUE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule VARCHAR(100), -- e.g., 'DAILY', 'WEEKLY', 'MONTHLY'
  color VARCHAR(20) DEFAULT '#FFBD59', -- Default gold color
  icon VARCHAR(50) DEFAULT 'calendar',
  life_area VARCHAR(50), -- 'finance', 'career', 'health', 'relationships', 'personal', 'spiritual'
  priority INTEGER DEFAULT 1, -- 1 = low, 2 = medium, 3 = high
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  reminder_minutes INTEGER, -- Minutes before event to remind
  metadata JSONB DEFAULT '{}', -- Additional data (xp_reward, linked_goal_id, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_user ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON calendar_events(user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_source ON calendar_events(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_life_area ON calendar_events(life_area);

-- Enable Row Level Security
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own events
DROP POLICY IF EXISTS "Users manage own calendar events" ON calendar_events;
CREATE POLICY "Users manage own calendar events" ON calendar_events
  FOR ALL USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_calendar_events_updated_at ON calendar_events;
CREATE TRIGGER trigger_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_events_updated_at();

-- ============================================
-- Function: Sync calendar event from widget
-- ============================================
CREATE OR REPLACE FUNCTION sync_calendar_event(
  p_user_id UUID,
  p_source_type VARCHAR(50),
  p_source_id UUID,
  p_title VARCHAR(255),
  p_event_date DATE,
  p_description TEXT DEFAULT NULL,
  p_life_area VARCHAR(50) DEFAULT NULL,
  p_icon VARCHAR(50) DEFAULT 'calendar',
  p_color VARCHAR(20) DEFAULT '#FFBD59',
  p_is_recurring BOOLEAN DEFAULT FALSE,
  p_recurrence_rule VARCHAR(100) DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  -- Check if event already exists for this source
  SELECT id INTO v_event_id
  FROM calendar_events
  WHERE user_id = p_user_id
    AND source_type = p_source_type
    AND source_id = p_source_id
    AND event_date = p_event_date;

  IF v_event_id IS NOT NULL THEN
    -- Update existing event
    UPDATE calendar_events
    SET title = p_title,
        description = p_description,
        life_area = p_life_area,
        icon = p_icon,
        color = p_color,
        is_recurring = p_is_recurring,
        recurrence_rule = p_recurrence_rule,
        metadata = p_metadata,
        updated_at = NOW()
    WHERE id = v_event_id;
  ELSE
    -- Insert new event
    INSERT INTO calendar_events (
      user_id, source_type, source_id, title, description,
      event_date, life_area, icon, color, is_recurring,
      recurrence_rule, metadata
    ) VALUES (
      p_user_id, p_source_type, p_source_id, p_title, p_description,
      p_event_date, p_life_area, p_icon, p_color, p_is_recurring,
      p_recurrence_rule, p_metadata
    )
    RETURNING id INTO v_event_id;
  END IF;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Get calendar events for date range
-- ============================================
CREATE OR REPLACE FUNCTION get_calendar_events(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  description TEXT,
  source_type VARCHAR(50),
  source_id UUID,
  event_date DATE,
  start_time TIME,
  end_time TIME,
  is_all_day BOOLEAN,
  is_recurring BOOLEAN,
  recurrence_rule VARCHAR(100),
  color VARCHAR(20),
  icon VARCHAR(50),
  life_area VARCHAR(50),
  priority INTEGER,
  is_completed BOOLEAN,
  completed_at TIMESTAMPTZ,
  metadata JSONB
) AS $$
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
    AND ce.event_date BETWEEN p_start_date AND p_end_date
  ORDER BY ce.event_date, ce.start_time NULLS LAST, ce.priority DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Mark calendar event as completed
-- ============================================
CREATE OR REPLACE FUNCTION complete_calendar_event(
  p_event_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated BOOLEAN := FALSE;
BEGIN
  UPDATE calendar_events
  SET is_completed = TRUE,
      completed_at = NOW()
  WHERE id = p_event_id
    AND user_id = p_user_id
    AND is_completed = FALSE;

  IF FOUND THEN
    v_updated := TRUE;
  END IF;

  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Delete calendar events by source
-- ============================================
CREATE OR REPLACE FUNCTION delete_calendar_events_by_source(
  p_user_id UUID,
  p_source_type VARCHAR(50),
  p_source_id UUID
)
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION sync_calendar_event TO authenticated;
GRANT EXECUTE ON FUNCTION get_calendar_events TO authenticated;
GRANT EXECUTE ON FUNCTION complete_calendar_event TO authenticated;
GRANT EXECUTE ON FUNCTION delete_calendar_events_by_source TO authenticated;
