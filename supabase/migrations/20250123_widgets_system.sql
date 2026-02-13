-- Migration: Widget System
-- Created: 2025-01-23
-- Description: User widgets for saving AI insights to dashboard

-- Create user_widgets table
CREATE TABLE IF NOT EXISTS user_widgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL CHECK (widget_type IN ('price_alert', 'pattern_watch', 'portfolio_tracker', 'daily_reading')),
  widget_name TEXT,
  widget_data JSONB NOT NULL,
  size TEXT DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large')),
  position_x INT DEFAULT 0,
  position_y INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_widgets_user ON user_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_widgets_type ON user_widgets(widget_type);
CREATE INDEX IF NOT EXISTS idx_user_widgets_created ON user_widgets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_widgets_user_type ON user_widgets(user_id, widget_type);

-- Enable Row Level Security
ALTER TABLE user_widgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_widgets
-- Users can insert their own widgets
CREATE POLICY "Users can insert their own widgets"
  ON user_widgets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own widgets
CREATE POLICY "Users can view their own widgets"
  ON user_widgets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own widgets
CREATE POLICY "Users can update their own widgets"
  ON user_widgets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own widgets
CREATE POLICY "Users can delete their own widgets"
  ON user_widgets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_widgets_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_widgets_timestamp
  BEFORE UPDATE ON user_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_user_widgets_timestamp();

-- Comments
COMMENT ON TABLE user_widgets IS 'User-saved widgets from AI chatbot insights';
COMMENT ON COLUMN user_widgets.user_id IS 'User who created the widget';
COMMENT ON COLUMN user_widgets.widget_type IS 'Type of widget: price_alert, pattern_watch, portfolio_tracker, daily_reading';
COMMENT ON COLUMN user_widgets.widget_name IS 'User-provided name for the widget';
COMMENT ON COLUMN user_widgets.widget_data IS 'JSONB data for the widget (coin, price, pattern, etc)';
COMMENT ON COLUMN user_widgets.size IS 'Widget size: small, medium, large';
COMMENT ON COLUMN user_widgets.position_x IS 'Horizontal position in grid (for future drag & drop)';
COMMENT ON COLUMN user_widgets.position_y IS 'Vertical position in grid (for future drag & drop)';
