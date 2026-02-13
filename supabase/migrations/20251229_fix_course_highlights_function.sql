-- =============================================
-- Fix get_highlighted_course function
-- Column c.level does not exist -> use c.difficulty_level
-- Column c.instructor does not exist -> use c.instructor_name
-- =============================================

-- Drop and recreate the function with correct column names
DROP FUNCTION IF EXISTS get_highlighted_course();

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
    -- Course data (with corrected column names)
    c.title as course_title,
    c.description as course_description,
    c.thumbnail_url as course_thumbnail,
    c.price as course_price,
    (COALESCE(c.price, 0) = 0) as course_is_free,  -- Fixed: is_free doesn't exist, compute from price
    c.tier_required::VARCHAR(50) as course_tier,
    c.difficulty_level::VARCHAR(50) as course_level,  -- Fixed: was c.level, cast to VARCHAR
    c.duration_hours::INT as course_duration_hours,
    (SELECT COUNT(*)::INT FROM course_lessons cl
     JOIN course_modules cm ON cl.module_id = cm.id
     WHERE cm.course_id = c.id) as course_lesson_count,
    c.students_count as course_student_count,
    c.rating as course_rating,
    c.instructor_name as course_instructor  -- Fixed: was c.instructor
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

-- Notify completion
DO $$
BEGIN
  RAISE NOTICE 'Fixed get_highlighted_course function - corrected column names';
END $$;
