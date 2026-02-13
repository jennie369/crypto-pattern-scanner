-- ========================================
-- FIX: Auto-update 'updated_at' on courses table
-- This ensures cache-busting works for course images
-- ========================================

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS set_courses_updated_at ON courses;

-- Create trigger for courses table
CREATE TRIGGER set_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Also add triggers for course_modules and course_lessons
DROP TRIGGER IF EXISTS set_course_modules_updated_at ON course_modules;
CREATE TRIGGER set_course_modules_updated_at
    BEFORE UPDATE ON course_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_course_lessons_updated_at ON course_lessons;
CREATE TRIGGER set_course_lessons_updated_at
    BEFORE UPDATE ON course_lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update all existing courses to refresh updated_at with current timestamp
-- This will force cache-bust all current images
UPDATE courses SET updated_at = NOW() WHERE updated_at IS NULL OR updated_at < NOW() - INTERVAL '1 minute';

-- Add trigger for promo_banners (course banners)
DROP TRIGGER IF EXISTS set_promo_banners_updated_at ON promo_banners;
CREATE TRIGGER set_promo_banners_updated_at
    BEFORE UPDATE ON promo_banners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for shop_banners
DROP TRIGGER IF EXISTS set_shop_banners_updated_at ON shop_banners;
CREATE TRIGGER set_shop_banners_updated_at
    BEFORE UPDATE ON shop_banners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify triggers are created
SELECT
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE 'set_%_updated_at';
