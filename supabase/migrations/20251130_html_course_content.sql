-- =====================================================
-- HTML Course Content System Migration
-- Enables teachers to paste HTML content with embedded quizzes
-- =====================================================

-- 1. Check if course_lessons table exists first
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_lessons') THEN
    RAISE EXCEPTION 'Table course_lessons does not exist. Please run course tables migration first.';
  END IF;
END $$;

-- 2. Add HTML content columns to course_lessons
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS html_content TEXT;
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS parsed_content JSONB;
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS embedded_quizzes JSONB DEFAULT '[]';
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS embedded_images JSONB DEFAULT '[]';
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS last_edited_by UUID;

-- 3. Update content type constraint to include 'html' and 'mixed'
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  -- Find and drop the check constraint for type column
  FOR constraint_name IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE rel.relname = 'course_lessons'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%type%'
  LOOP
    EXECUTE 'ALTER TABLE course_lessons DROP CONSTRAINT IF EXISTS ' || constraint_name;
  END LOOP;
EXCEPTION WHEN OTHERS THEN
  -- Ignore if no constraint exists
  NULL;
END $$;

-- Add new constraint with expanded types (ignore if already exists)
DO $$
BEGIN
  ALTER TABLE course_lessons ADD CONSTRAINT course_lessons_type_check
    CHECK (type IN ('video', 'article', 'quiz', 'html', 'mixed', 'assignment'));
EXCEPTION WHEN duplicate_object THEN
  -- Constraint already exists
  NULL;
END $$;

-- 4. Create lesson_versions table for rollback support
CREATE TABLE IF NOT EXISTS lesson_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  html_content TEXT,
  parsed_content JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lesson_id, version_number)
);

-- Index for fast version lookups
CREATE INDEX IF NOT EXISTS idx_lesson_versions_lesson ON lesson_versions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_versions_created ON lesson_versions(created_at DESC);

-- 5. Enable realtime for course_lessons (with error handling)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'course_lessons'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE course_lessons;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore if publication doesn't exist
  NULL;
END $$;

-- 6. Auto-version trigger function
CREATE OR REPLACE FUNCTION create_lesson_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if html_content actually changed
  IF OLD.html_content IS DISTINCT FROM NEW.html_content AND OLD.html_content IS NOT NULL THEN
    INSERT INTO lesson_versions (
      lesson_id,
      version_number,
      html_content,
      parsed_content,
      created_by
    )
    SELECT
      OLD.id,
      COALESCE((SELECT MAX(version_number) FROM lesson_versions WHERE lesson_id = OLD.id), 0) + 1,
      OLD.html_content,
      OLD.parsed_content,
      NEW.last_edited_by;
  END IF;

  -- Update the last_edited_at timestamp
  NEW.last_edited_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for auto-versioning
DROP TRIGGER IF EXISTS lesson_version_trigger ON course_lessons;
CREATE TRIGGER lesson_version_trigger
BEFORE UPDATE ON course_lessons
FOR EACH ROW
EXECUTE FUNCTION create_lesson_version();

-- 8. RLS Policies for lesson_versions
ALTER TABLE lesson_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read lesson versions" ON lesson_versions;
CREATE POLICY "Anyone can read lesson versions"
  ON lesson_versions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage lesson versions" ON lesson_versions;
CREATE POLICY "Admins can manage lesson versions"
  ON lesson_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND (public.users.role IN ('admin', 'teacher', 'ADMIN') OR public.users.role_badge IN ('admin', 'instructor'))
    )
  );

-- 9. Helper function to get lesson with versions count
CREATE OR REPLACE FUNCTION get_lesson_with_version_count(p_lesson_id TEXT)
RETURNS TABLE (
  lesson_id TEXT,
  html_content TEXT,
  parsed_content JSONB,
  version_count BIGINT,
  last_edited_at TIMESTAMPTZ,
  last_edited_by UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cl.id::TEXT as lesson_id,
    cl.html_content::TEXT,
    cl.parsed_content::JSONB,
    (SELECT COUNT(*)::BIGINT FROM lesson_versions lv WHERE lv.lesson_id = cl.id) as version_count,
    cl.last_edited_at::TIMESTAMPTZ,
    cl.last_edited_by::UUID
  FROM course_lessons cl
  WHERE cl.id = p_lesson_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- 10. Function to restore a version
CREATE OR REPLACE FUNCTION restore_lesson_version(
  p_lesson_id TEXT,
  p_version_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_html_content TEXT;
  v_parsed_content JSONB;
BEGIN
  SELECT html_content, parsed_content
  INTO v_html_content, v_parsed_content
  FROM lesson_versions
  WHERE id = p_version_id AND lesson_id = p_lesson_id;

  IF v_html_content IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE course_lessons
  SET
    html_content = v_html_content,
    parsed_content = v_parsed_content,
    last_edited_by = p_user_id
  WHERE id = p_lesson_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION restore_lesson_version(TEXT, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_lesson_with_version_count(TEXT) TO authenticated;

-- 11. Add comments
COMMENT ON TABLE lesson_versions IS 'Stores historical versions of lesson HTML content for rollback support';
