-- =====================================================
-- CENTRALIZED TEMPLATES - Database Migration
-- Created: 2026-02-02
-- Part of Centralized Templates Feature
-- =====================================================

-- ==================== EXTEND calendar_journal_entries ====================

-- Add template_id column for template identification
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_journal_entries' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE calendar_journal_entries ADD COLUMN template_id VARCHAR(50);
  END IF;
END $$;

-- Add template_data JSONB column for flexible template content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_journal_entries' AND column_name = 'template_data'
  ) THEN
    ALTER TABLE calendar_journal_entries ADD COLUMN template_data JSONB DEFAULT '{}';
  END IF;
END $$;

-- Add template_version for schema versioning
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_journal_entries' AND column_name = 'template_version'
  ) THEN
    ALTER TABLE calendar_journal_entries ADD COLUMN template_version INTEGER DEFAULT 1;
  END IF;
END $$;

-- Add linked_goal_ids array for two-way linking (journal -> goals)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_journal_entries' AND column_name = 'linked_goal_ids'
  ) THEN
    ALTER TABLE calendar_journal_entries ADD COLUMN linked_goal_ids UUID[] DEFAULT '{}';
  END IF;
END $$;

-- Add source_entry_point to track origin (gemmaster, visionboard, calendar)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_journal_entries' AND column_name = 'source_entry_point'
  ) THEN
    ALTER TABLE calendar_journal_entries ADD COLUMN source_entry_point VARCHAR(30);
  END IF;
END $$;

-- ==================== EXTEND vision_goals ====================

-- Add source_journal_id for two-way linking (goal -> journal)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vision_goals' AND column_name = 'source_journal_id'
  ) THEN
    ALTER TABLE vision_goals ADD COLUMN source_journal_id UUID REFERENCES calendar_journal_entries(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add created_from_template to track template origin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vision_goals' AND column_name = 'created_from_template'
  ) THEN
    ALTER TABLE vision_goals ADD COLUMN created_from_template VARCHAR(50);
  END IF;
END $$;

-- ==================== CREATE user_template_settings ====================

CREATE TABLE IF NOT EXISTS user_template_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Template preferences
  favorite_templates VARCHAR(50)[] DEFAULT '{}',
  last_used_template VARCHAR(50),
  default_life_area VARCHAR(50) DEFAULT 'personal',

  -- Feature flags
  show_tooltips BOOLEAN DEFAULT true,
  auto_create_goal BOOLEAN DEFAULT false,

  -- Think Day tracking (monthly reminder)
  last_think_day_date DATE,
  think_day_reminder_days INTEGER DEFAULT 30,

  -- Onboarding
  has_seen_onboarding BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint per user
  UNIQUE(user_id)
);

-- ==================== INDEXES ====================

-- Index for template lookups
CREATE INDEX IF NOT EXISTS idx_journal_template_id
  ON calendar_journal_entries(template_id)
  WHERE template_id IS NOT NULL;

-- GIN index for linked_goal_ids array searches
CREATE INDEX IF NOT EXISTS idx_journal_linked_goals
  ON calendar_journal_entries USING GIN(linked_goal_ids)
  WHERE linked_goal_ids != '{}';

-- Index for goal source journal lookups
CREATE INDEX IF NOT EXISTS idx_goals_source_journal
  ON vision_goals(source_journal_id)
  WHERE source_journal_id IS NOT NULL;

-- Index for template settings
CREATE INDEX IF NOT EXISTS idx_template_settings_user
  ON user_template_settings(user_id);

-- ==================== RLS POLICIES ====================

-- Enable RLS on user_template_settings
ALTER TABLE user_template_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own template settings" ON user_template_settings;
DROP POLICY IF EXISTS "Users can insert own template settings" ON user_template_settings;
DROP POLICY IF EXISTS "Users can update own template settings" ON user_template_settings;
DROP POLICY IF EXISTS "Users can delete own template settings" ON user_template_settings;

-- Create policies
CREATE POLICY "Users can view own template settings"
  ON user_template_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own template settings"
  ON user_template_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own template settings"
  ON user_template_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own template settings"
  ON user_template_settings FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== TRIGGERS ====================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_template_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_template_settings_timestamp ON user_template_settings;
CREATE TRIGGER trigger_update_template_settings_timestamp
  BEFORE UPDATE ON user_template_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_template_settings_timestamp();

-- ==================== HELPER FUNCTIONS ====================

-- Function to link journal to goal (adds goal_id to linked_goal_ids array)
CREATE OR REPLACE FUNCTION link_journal_to_goal(
  p_journal_id UUID,
  p_goal_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Add goal_id to journal's linked_goal_ids array if not already present
  UPDATE calendar_journal_entries
  SET linked_goal_ids = array_append(
    COALESCE(linked_goal_ids, '{}'),
    p_goal_id
  )
  WHERE id = p_journal_id
    AND NOT (p_goal_id = ANY(COALESCE(linked_goal_ids, '{}')));

  -- Set source_journal_id on goal
  UPDATE vision_goals
  SET source_journal_id = p_journal_id
  WHERE id = p_goal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unlink journal from goal
CREATE OR REPLACE FUNCTION unlink_journal_from_goal(
  p_journal_id UUID,
  p_goal_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Remove goal_id from journal's linked_goal_ids array
  UPDATE calendar_journal_entries
  SET linked_goal_ids = array_remove(linked_goal_ids, p_goal_id)
  WHERE id = p_journal_id;

  -- Clear source_journal_id on goal
  UPDATE vision_goals
  SET source_journal_id = NULL
  WHERE id = p_goal_id AND source_journal_id = p_journal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get or create user template settings
CREATE OR REPLACE FUNCTION get_or_create_template_settings(p_user_id UUID)
RETURNS user_template_settings AS $$
DECLARE
  v_settings user_template_settings;
BEGIN
  -- Try to get existing settings
  SELECT * INTO v_settings
  FROM user_template_settings
  WHERE user_id = p_user_id;

  -- If not found, create default settings
  IF v_settings IS NULL THEN
    INSERT INTO user_template_settings (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_settings;
  END IF;

  RETURN v_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== TEMPLATE USAGE ANALYTICS (Optional) ====================

CREATE TABLE IF NOT EXISTS template_usage_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  template_id VARCHAR(50) NOT NULL,
  entry_point VARCHAR(30) NOT NULL, -- 'gemmaster', 'visionboard', 'calendar'

  -- Metrics
  completion_time_seconds INTEGER,
  fields_filled INTEGER,
  goals_created INTEGER DEFAULT 0,

  -- Result
  journal_created BOOLEAN DEFAULT true,
  goal_created BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE template_usage_analytics ENABLE ROW LEVEL SECURITY;

-- Policy for analytics
DROP POLICY IF EXISTS "Users can insert own analytics" ON template_usage_analytics;
CREATE POLICY "Users can insert own analytics"
  ON template_usage_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own analytics" ON template_usage_analytics;
CREATE POLICY "Users can view own analytics"
  ON template_usage_analytics FOR SELECT
  USING (auth.uid() = user_id);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_template_analytics_user_template
  ON template_usage_analytics(user_id, template_id);

-- ==================== COMMENTS ====================

COMMENT ON COLUMN calendar_journal_entries.template_id IS 'ID of template used (e.g., fear_setting, think_day)';
COMMENT ON COLUMN calendar_journal_entries.template_data IS 'JSONB containing all form field data';
COMMENT ON COLUMN calendar_journal_entries.template_version IS 'Version of template schema used';
COMMENT ON COLUMN calendar_journal_entries.linked_goal_ids IS 'Array of goal IDs created from this journal';
COMMENT ON COLUMN calendar_journal_entries.source_entry_point IS 'Entry point: gemmaster, visionboard, or calendar';

COMMENT ON COLUMN vision_goals.source_journal_id IS 'Journal entry this goal was created from';
COMMENT ON COLUMN vision_goals.created_from_template IS 'Template ID used to create this goal';

COMMENT ON TABLE user_template_settings IS 'User preferences for template system';
COMMENT ON TABLE template_usage_analytics IS 'Analytics for template usage patterns';
