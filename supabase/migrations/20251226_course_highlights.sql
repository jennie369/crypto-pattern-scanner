-- =============================================
-- Course Highlights - Featured Course Section
-- Admin-manageable highlighted course display
-- =============================================

-- Create course_highlights table
CREATE TABLE IF NOT EXISTS course_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,

  -- Custom display content (optional overrides)
  custom_title TEXT,
  custom_subtitle TEXT,
  custom_description TEXT,
  custom_image_url TEXT,

  -- Badge/Label
  badge_text VARCHAR(50) DEFAULT 'Nổi bật',
  badge_color VARCHAR(20) DEFAULT 'gold',

  -- CTA Button
  cta_text VARCHAR(50) DEFAULT 'Xem chi tiết',
  cta_color VARCHAR(20) DEFAULT 'gold',

  -- Display settings
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,

  -- Stats to show
  show_price BOOLEAN DEFAULT true,
  show_students BOOLEAN DEFAULT true,
  show_rating BOOLEAN DEFAULT true,
  show_lessons BOOLEAN DEFAULT true,

  -- Scheduling
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Create index for active highlights
CREATE INDEX idx_course_highlights_active ON course_highlights(is_active, display_order);
CREATE INDEX idx_course_highlights_schedule ON course_highlights(start_date, end_date) WHERE is_active = true;

-- Enable RLS
ALTER TABLE course_highlights ENABLE ROW LEVEL SECURITY;

-- Public can read active highlights
CREATE POLICY "Anyone can read active highlights"
  ON course_highlights FOR SELECT
  USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- Admins can manage highlights
CREATE POLICY "Admins can manage highlights"
  ON course_highlights FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to get active highlighted course
CREATE OR REPLACE FUNCTION get_highlighted_course()
RETURNS TABLE (
  highlight_id UUID,
  course_id TEXT,
  custom_title TEXT,
  custom_subtitle TEXT,
  custom_description TEXT,
  custom_image_url TEXT,
  badge_text VARCHAR(50),
  badge_color VARCHAR(20),
  cta_text VARCHAR(50),
  cta_color VARCHAR(20),
  show_price BOOLEAN,
  show_students BOOLEAN,
  show_rating BOOLEAN,
  show_lessons BOOLEAN,
  -- Course data
  course_title TEXT,
  course_description TEXT,
  course_thumbnail TEXT,
  course_price DECIMAL,
  course_is_free BOOLEAN,
  course_tier VARCHAR(50),
  course_level VARCHAR(50),
  course_duration_hours INT,
  course_lesson_count INT,
  course_student_count INT,
  course_rating DECIMAL,
  course_instructor TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.id as highlight_id,
    h.course_id,
    h.custom_title,
    h.custom_subtitle,
    h.custom_description,
    h.custom_image_url,
    h.badge_text,
    h.badge_color,
    h.cta_text,
    h.cta_color,
    h.show_price,
    h.show_students,
    h.show_rating,
    h.show_lessons,
    -- Course data
    c.title as course_title,
    c.description as course_description,
    c.thumbnail_url as course_thumbnail,
    c.price as course_price,
    c.is_free as course_is_free,
    c.tier_required as course_tier,
    c.level as course_level,
    c.duration_hours as course_duration_hours,
    (SELECT COUNT(*)::INT FROM course_lessons cl
     JOIN course_modules cm ON cl.module_id = cm.id
     WHERE cm.course_id = c.id) as course_lesson_count,
    c.students_count as course_student_count,
    c.rating as course_rating,
    c.instructor as course_instructor
  FROM course_highlights h
  JOIN courses c ON h.course_id = c.id
  WHERE h.is_active = true
    AND c.is_published = true
    AND (h.start_date IS NULL OR h.start_date <= NOW())
    AND (h.end_date IS NULL OR h.end_date >= NOW())
  ORDER BY h.display_order ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE TRIGGER update_course_highlights_updated_at
  BEFORE UPDATE ON course_highlights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample highlighted course (if courses exist)
DO $$
DECLARE
  sample_course_id TEXT;
BEGIN
  -- Get the first published course
  SELECT id INTO sample_course_id
  FROM courses
  WHERE is_published = true
  ORDER BY students_count DESC NULLS LAST
  LIMIT 1;

  IF sample_course_id IS NOT NULL THEN
    INSERT INTO course_highlights (
      course_id,
      custom_subtitle,
      badge_text,
      is_active
    ) VALUES (
      sample_course_id,
      'Khóa học được yêu thích nhất - Dành cho bạn!',
      'Nổi bật',
      true
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

COMMENT ON TABLE course_highlights IS 'Admin-manageable highlighted/featured course section';
