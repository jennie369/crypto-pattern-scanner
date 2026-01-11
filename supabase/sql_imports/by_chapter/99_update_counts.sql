-- =====================================================
-- UPDATE COURSE LESSON COUNTS (Run after all imports)
-- =====================================================

UPDATE courses SET total_lessons = (
  SELECT COUNT(*) FROM course_lessons WHERE course_id = 'course-tier1-trading-foundation'
), updated_at = NOW()
WHERE id = 'course-tier1-trading-foundation';

UPDATE courses SET total_lessons = (
  SELECT COUNT(*) FROM course_lessons WHERE course_id = 'course-tier2-trading-advanced'
), updated_at = NOW()
WHERE id = 'course-tier2-trading-advanced';

UPDATE courses SET total_lessons = (
  SELECT COUNT(*) FROM course_lessons WHERE course_id = 'course-tier3-trading-mastery'
), updated_at = NOW()
WHERE id = 'course-tier3-trading-mastery';

-- Verify
SELECT id, title, total_lessons FROM courses WHERE id LIKE 'course-tier%';
