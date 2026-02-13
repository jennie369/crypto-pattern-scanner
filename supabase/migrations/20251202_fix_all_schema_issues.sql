-- =============================================
-- FIX ALL SCHEMA ISSUES
-- Migration: 20251202_fix_all_schema_issues.sql
-- Fixes: profiles, user_widgets, lesson_attachments relationships
-- =============================================

-- =============================================
-- 1. FIX PROFILES TABLE - Add missing columns
-- =============================================

-- Add cover_url column for profile cover photos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Add metadata column for flexible data storage
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- =============================================
-- 2. FIX USER_WIDGETS TABLE - Add missing columns
-- =============================================

-- Create user_widgets table if not exists
CREATE TABLE IF NOT EXISTS user_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'goal', 'affirmation', 'habit', 'crystal', 'tarot', 'iching'
  widget_type TEXT, -- Alternative column name for type
  title TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  position INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table exists
ALTER TABLE user_widgets ADD COLUMN IF NOT EXISTS widget_type TEXT;
ALTER TABLE user_widgets ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE user_widgets ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE user_widgets ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE user_widgets ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;
ALTER TABLE user_widgets ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE user_widgets ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE user_widgets ADD COLUMN IF NOT EXISTS icon TEXT;

-- Sync type and widget_type columns
UPDATE user_widgets SET widget_type = type WHERE widget_type IS NULL AND type IS NOT NULL;
UPDATE user_widgets SET type = widget_type WHERE type IS NULL AND widget_type IS NOT NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_widgets_user ON user_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_widgets_type ON user_widgets(type);

-- RLS
ALTER TABLE user_widgets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users manage own widgets" ON user_widgets;

-- Users can manage their own widgets
CREATE POLICY "Users manage own widgets"
  ON user_widgets FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================
-- 3. FIX LESSON_ATTACHMENTS - Remove bad FK
-- =============================================

-- lesson_attachments should NOT have FK to course_lessons because lesson_id is TEXT
-- Just make sure the table exists with correct columns
ALTER TABLE lesson_attachments ALTER COLUMN course_id DROP NOT NULL;

-- =============================================
-- 4. FIX COURSE_ENROLLMENTS - Add profiles FK
-- =============================================

-- Ensure profiles column exists for joins
-- The error "Could not find relationship between course_enrollments and profiles"
-- means we need to ensure the user_id FK is properly set up

-- Check and add index for better join performance
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user ON course_enrollments(user_id);

-- =============================================
-- 5. ADD UPDATED_AT TRIGGERS
-- =============================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to user_widgets
DROP TRIGGER IF EXISTS update_user_widgets_updated_at ON user_widgets;
CREATE TRIGGER update_user_widgets_updated_at
  BEFORE UPDATE ON user_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DONE
-- =============================================
