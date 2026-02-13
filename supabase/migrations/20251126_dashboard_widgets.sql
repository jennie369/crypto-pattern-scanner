-- ═══════════════════════════════════════════════════════════
-- GEM Platform - Dashboard Widgets Migration
-- Day 17-19: AI Chat → Dashboard Integration
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════
-- TABLE: user_widgets
-- Stores user's dashboard widgets created from AI responses
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  position INTEGER DEFAULT 0,
  created_from_conversation_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE user_widgets IS 'Dashboard widgets created from AI chat responses';
COMMENT ON COLUMN user_widgets.type IS 'Widget type: GOAL_CARD, AFFIRMATION_CARD, ACTION_CHECKLIST, CRYSTAL_GRID, CROSS_DOMAIN_CARD, STATS_WIDGET';
COMMENT ON COLUMN user_widgets.data IS 'Widget-specific data stored as JSON';
COMMENT ON COLUMN user_widgets.position IS 'Display order position';

-- ═══════════════════════════════════════════════════════════
-- TABLE: widget_progress
-- Tracks progress updates for goal widgets
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS widget_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  widget_id UUID NOT NULL REFERENCES user_widgets(id) ON DELETE CASCADE,
  progress_date DATE NOT NULL,
  current_value DECIMAL,
  target_value DECIMAL,
  percentage DECIMAL,
  milestones_hit JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE widget_progress IS 'Progress tracking for goal widgets';
COMMENT ON COLUMN widget_progress.milestones_hit IS 'Array of milestone percentages hit: [10, 25, 50, 75, 90, 100]';

-- ═══════════════════════════════════════════════════════════
-- TABLE: widget_interactions
-- Tracks user interactions with widgets (for analytics)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS widget_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  widget_id UUID NOT NULL REFERENCES user_widgets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL,
  interaction_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE widget_interactions IS 'User interaction tracking for widgets';
COMMENT ON COLUMN widget_interactions.interaction_type IS 'Types: VIEW, UPDATE_PROGRESS, COMPLETE_TASK, AFFIRMATION_COMPLETED, TASK_TOGGLED';

-- ═══════════════════════════════════════════════════════════
-- INDEXES for performance
-- ═══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_user_widgets_user ON user_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_widgets_active ON user_widgets(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_widgets_type ON user_widgets(user_id, type);
CREATE INDEX IF NOT EXISTS idx_user_widgets_position ON user_widgets(user_id, position);

CREATE INDEX IF NOT EXISTS idx_widget_progress_widget ON widget_progress(widget_id);
CREATE INDEX IF NOT EXISTS idx_widget_progress_date ON widget_progress(widget_id, progress_date);

CREATE INDEX IF NOT EXISTS idx_widget_interactions_widget ON widget_interactions(widget_id);
CREATE INDEX IF NOT EXISTS idx_widget_interactions_user ON widget_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_interactions_type ON widget_interactions(widget_id, interaction_type);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) Policies
-- ═══════════════════════════════════════════════════════════

-- Enable RLS
ALTER TABLE user_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_interactions ENABLE ROW LEVEL SECURITY;

-- user_widgets policies
CREATE POLICY "Users can view own widgets"
  ON user_widgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own widgets"
  ON user_widgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own widgets"
  ON user_widgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own widgets"
  ON user_widgets FOR DELETE
  USING (auth.uid() = user_id);

-- widget_progress policies
CREATE POLICY "Users can view own widget progress"
  ON widget_progress FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_widgets
    WHERE user_widgets.id = widget_progress.widget_id
    AND user_widgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert progress for own widgets"
  ON widget_progress FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_widgets
    WHERE user_widgets.id = widget_progress.widget_id
    AND user_widgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can update progress for own widgets"
  ON widget_progress FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_widgets
    WHERE user_widgets.id = widget_progress.widget_id
    AND user_widgets.user_id = auth.uid()
  ));

-- widget_interactions policies
CREATE POLICY "Users can view own interactions"
  ON widget_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions"
  ON widget_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- FUNCTION: Update updated_at timestamp
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_widget_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_widgets_updated_at ON user_widgets;
CREATE TRIGGER update_user_widgets_updated_at
  BEFORE UPDATE ON user_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_widget_updated_at();

DROP TRIGGER IF EXISTS update_widget_progress_updated_at ON widget_progress;
CREATE TRIGGER update_widget_progress_updated_at
  BEFORE UPDATE ON widget_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_widget_updated_at();

-- ═══════════════════════════════════════════════════════════
-- FUNCTION: Get widget statistics for user
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_user_widget_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'activeGoals', (
      SELECT COUNT(*) FROM user_widgets
      WHERE user_id = p_user_id AND type = 'GOAL_CARD' AND is_active = true
    ),
    'totalWidgets', (
      SELECT COUNT(*) FROM user_widgets
      WHERE user_id = p_user_id AND is_active = true
    ),
    'affirmationsCompleted', (
      SELECT COUNT(*) FROM widget_interactions
      WHERE user_id = p_user_id AND interaction_type = 'AFFIRMATION_COMPLETED'
    ),
    'streak', COALESCE((
      SELECT (data->>'streak')::int FROM user_widgets
      WHERE user_id = p_user_id AND type = 'AFFIRMATION_CARD' AND is_active = true
      ORDER BY updated_at DESC LIMIT 1
    ), 0)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_widget_stats(UUID) TO authenticated;

-- ═══════════════════════════════════════════════════════════
-- SUCCESS MESSAGE
-- ═══════════════════════════════════════════════════════════
DO $$
BEGIN
  RAISE NOTICE 'Dashboard Widgets migration completed successfully!';
  RAISE NOTICE 'Tables created: user_widgets, widget_progress, widget_interactions';
  RAISE NOTICE 'RLS policies enabled for all tables';
END $$;
