-- ========================================
-- GEM Platform - Courses Functions (STEP 2)
-- Run this AFTER step 1 (tables)
-- ========================================

-- ========================================
-- VIEW: User course progress summary
-- ========================================
CREATE OR REPLACE VIEW user_course_progress AS
SELECT
    e.user_id,
    e.course_id,
    c.title as course_title,
    c.total_lessons,
    COUNT(CASE WHEN p.completed THEN 1 END) as completed_lessons,
    ROUND(
        (COUNT(CASE WHEN p.completed THEN 1 END)::DECIMAL / NULLIF(c.total_lessons, 0)) * 100,
        2
    ) as progress_percent,
    e.enrolled_at,
    e.completed_at,
    MAX(p.updated_at) as last_activity
FROM course_enrollments e
JOIN courses c ON c.id = e.course_id
LEFT JOIN course_progress p ON p.user_id = e.user_id AND p.course_id = e.course_id
GROUP BY e.user_id, e.course_id, c.title, c.total_lessons, e.enrolled_at, e.completed_at;

-- ========================================
-- FUNCTION: Update course completion status
-- ========================================
CREATE OR REPLACE FUNCTION update_course_completion()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
DECLARE
    v_total_lessons INTEGER;
    v_completed_lessons INTEGER;
BEGIN
    -- Get total lessons for the course
    SELECT COUNT(*) INTO v_total_lessons
    FROM course_lessons
    WHERE course_id = NEW.course_id;

    -- Get completed lessons for user
    SELECT COUNT(*) INTO v_completed_lessons
    FROM course_progress
    WHERE user_id = NEW.user_id
      AND course_id = NEW.course_id
      AND completed = true;

    -- If all lessons completed, mark enrollment as completed
    IF v_completed_lessons >= v_total_lessons AND v_total_lessons > 0 THEN
        UPDATE course_enrollments
        SET completed_at = NOW()
        WHERE user_id = NEW.user_id
          AND course_id = NEW.course_id
          AND completed_at IS NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for completion
DROP TRIGGER IF EXISTS trigger_update_course_completion ON course_progress;
CREATE TRIGGER trigger_update_course_completion
AFTER INSERT OR UPDATE OF completed ON course_progress
FOR EACH ROW
WHEN (NEW.completed = true)
EXECUTE FUNCTION update_course_completion();

-- ========================================
-- FUNCTION: Generate certificate number
-- ========================================
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.certificate_number IS NULL THEN
        NEW.certificate_number := 'GEM-CERT-' ||
            TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
            UPPER(SUBSTRING(MD5(COALESCE(NEW.user_id::TEXT, '') || COALESCE(NEW.course_id, '') || NOW()::TEXT) FROM 1 FOR 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for certificate
DROP TRIGGER IF EXISTS trigger_generate_certificate_number ON course_certificates;
CREATE TRIGGER trigger_generate_certificate_number
BEFORE INSERT ON course_certificates
FOR EACH ROW
EXECUTE FUNCTION generate_certificate_number();

-- Done! Now run step 3 for RLS policies
