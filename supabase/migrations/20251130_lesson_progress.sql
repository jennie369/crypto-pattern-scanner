-- =====================================================
-- Lesson Progress Table Enhancement Migration
-- Adds quiz tracking columns to existing lesson_progress table
-- =====================================================

-- 1. Add new columns for quiz tracking (if they don't exist)
ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS quiz_results JSONB DEFAULT '{}';
ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS completed_quizzes TEXT[] DEFAULT '{}';
ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Update existing rows to have default values
UPDATE lesson_progress
SET quiz_results = '{}'
WHERE quiz_results IS NULL;

UPDATE lesson_progress
SET completed_quizzes = '{}'
WHERE completed_quizzes IS NULL;

UPDATE lesson_progress
SET last_accessed_at = COALESCE(updated_at, created_at, NOW())
WHERE last_accessed_at IS NULL;

-- 3. Create index on last_accessed_at
CREATE INDEX IF NOT EXISTS idx_lesson_progress_accessed ON lesson_progress(last_accessed_at DESC);

-- 4. Enable RLS (if not already enabled)
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (drop and recreate to ensure correct setup)
DROP POLICY IF EXISTS "Users can read own lesson progress" ON lesson_progress;
CREATE POLICY "Users can read own lesson progress"
  ON lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own lesson progress" ON lesson_progress;
CREATE POLICY "Users can insert own lesson progress"
  ON lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own lesson progress" ON lesson_progress;
CREATE POLICY "Users can update own lesson progress"
  ON lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins/Teachers can read all progress (for analytics)
DROP POLICY IF EXISTS "Admins can read all lesson progress" ON lesson_progress;
CREATE POLICY "Admins can read all lesson progress"
  ON lesson_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND (public.users.role IN ('admin', 'teacher', 'ADMIN') OR public.users.role_badge IN ('admin', 'instructor'))
    )
  );

-- 6. Function to get lesson completion stats
CREATE OR REPLACE FUNCTION get_lesson_stats(p_lesson_id TEXT)
RETURNS TABLE (
  total_students BIGINT,
  avg_progress NUMERIC,
  completed_count BIGINT,
  avg_quiz_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT lp.user_id)::BIGINT as total_students,
    AVG(lp.progress_percent)::NUMERIC as avg_progress,
    COUNT(*) FILTER (WHERE lp.progress_percent = 100)::BIGINT as completed_count,
    AVG(
      (
        SELECT AVG((value->>'score')::NUMERIC)
        FROM jsonb_each(COALESCE(lp.quiz_results, '{}'::JSONB)) AS t(key, value)
        WHERE value->>'score' IS NOT NULL
      )
    )::NUMERIC as avg_quiz_score
  FROM lesson_progress lp
  WHERE lp.lesson_id = p_lesson_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. Function to get user's course progress
CREATE OR REPLACE FUNCTION get_user_course_progress(p_user_id UUID, p_course_id TEXT)
RETURNS TABLE (
  total_lessons BIGINT,
  completed_lessons BIGINT,
  overall_progress NUMERIC,
  quiz_scores JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(cl.id)::BIGINT as total_lessons,
    COUNT(*) FILTER (WHERE lp.progress_percent = 100)::BIGINT as completed_lessons,
    COALESCE(AVG(lp.progress_percent), 0)::NUMERIC as overall_progress,
    COALESCE(
      jsonb_object_agg(lp.lesson_id, COALESCE(lp.quiz_results, '{}'::JSONB))
        FILTER (WHERE lp.quiz_results IS NOT NULL AND lp.quiz_results != '{}'::JSONB),
      '{}'::JSONB
    ) as quiz_scores
  FROM course_lessons cl
  LEFT JOIN lesson_progress lp ON cl.id = lp.lesson_id AND lp.user_id = p_user_id
  WHERE cl.course_id = p_course_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_lesson_stats(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_course_progress(UUID, TEXT) TO authenticated;

-- 8. Enable realtime for lesson_progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'lesson_progress'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE lesson_progress;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 9. Add comments
COMMENT ON COLUMN lesson_progress.quiz_results IS 'JSON object mapping quiz IDs to results with score, earnedPoints, etc.';
COMMENT ON COLUMN lesson_progress.completed_quizzes IS 'Array of quiz IDs that have been completed';
COMMENT ON COLUMN lesson_progress.last_accessed_at IS 'Last time student accessed this lesson';
