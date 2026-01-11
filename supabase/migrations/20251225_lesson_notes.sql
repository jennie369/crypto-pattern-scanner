-- ═══════════════════════════════════════════════════════════════════
-- LESSON NOTES - User notes for course lessons
-- Created: 2025-12-25
-- ═══════════════════════════════════════════════════════════════════

-- Table for storing user lesson notes
CREATE TABLE IF NOT EXISTS lesson_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One note per user per lesson
  UNIQUE(user_id, lesson_id)
);

-- Indexes
CREATE INDEX idx_lesson_notes_user_id ON lesson_notes(user_id);
CREATE INDEX idx_lesson_notes_lesson_id ON lesson_notes(lesson_id);
CREATE INDEX idx_lesson_notes_user_lesson ON lesson_notes(user_id, lesson_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_lesson_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lesson_notes_updated_at_trigger
  BEFORE UPDATE ON lesson_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_lesson_notes_updated_at();

-- RLS Policies
ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;

-- Users can view own notes
CREATE POLICY "Users can view own lesson notes"
  ON lesson_notes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert own notes
CREATE POLICY "Users can insert own lesson notes"
  ON lesson_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own notes
CREATE POLICY "Users can update own lesson notes"
  ON lesson_notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete own notes
CREATE POLICY "Users can delete own lesson notes"
  ON lesson_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Function to upsert lesson note
CREATE OR REPLACE FUNCTION upsert_lesson_note(
  p_user_id UUID,
  p_lesson_id TEXT,
  p_content TEXT
)
RETURNS lesson_notes AS $$
DECLARE
  result lesson_notes;
BEGIN
  INSERT INTO lesson_notes (user_id, lesson_id, content)
  VALUES (p_user_id, p_lesson_id, p_content)
  ON CONFLICT (user_id, lesson_id)
  DO UPDATE SET content = p_content, updated_at = NOW()
  RETURNING * INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION upsert_lesson_note(UUID, TEXT, TEXT) TO authenticated;

COMMENT ON TABLE lesson_notes IS 'User notes for course lessons - synced across devices';
COMMENT ON FUNCTION upsert_lesson_note(UUID, TEXT, TEXT) IS 'Insert or update a lesson note';
