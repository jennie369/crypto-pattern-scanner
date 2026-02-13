-- =============================================
-- GEM ACADEMY - SEED ACHIEVEMENTS
-- Migration: 20251224_002_seed_achievements.sql
-- =============================================

INSERT INTO achievements (code, name, description, icon, color, requirement_type, requirement_value, xp_reward, category, sort_order) VALUES
-- Streak Achievements
('streak_3', 'Khoi dau tot dep', 'Duy tri streak 3 ngay', 'Flame', '#FF6B35', 'streak_days', 3, 25, 'streak', 1),
('streak_7', 'Tuan le can cu', 'Duy tri streak 7 ngay', 'Flame', '#FF8C00', 'streak_days', 7, 50, 'streak', 2),
('streak_14', 'Nguoi kien tri', 'Duy tri streak 14 ngay', 'Flame', '#FFD700', 'streak_days', 14, 100, 'streak', 3),
('streak_30', 'Thoi quen vang', 'Duy tri streak 30 ngay', 'Flame', '#FFBD59', 'streak_days', 30, 200, 'streak', 4),
('streak_100', 'Huyen thoai', 'Duy tri streak 100 ngay', 'Crown', '#FFBD59', 'streak_days', 100, 500, 'streak', 5),

-- Learning Achievements
('first_lesson', 'Buoc dau tien', 'Hoan thanh bai hoc dau tien', 'BookOpen', '#3AF7A6', 'lessons_completed', 1, 10, 'learning', 1),
('lessons_10', 'Hoc vien cham chi', 'Hoan thanh 10 bai hoc', 'BookOpen', '#3AF7A6', 'lessons_completed', 10, 50, 'learning', 2),
('lessons_50', 'Nguoi ham hoc', 'Hoan thanh 50 bai hoc', 'BookOpen', '#00F0FF', 'lessons_completed', 50, 100, 'learning', 3),
('lessons_100', 'Hoc gia', 'Hoan thanh 100 bai hoc', 'GraduationCap', '#6A5BFF', 'lessons_completed', 100, 200, 'learning', 4),

-- Mastery Achievements
('first_course', 'Nguoi chinh phuc', 'Hoan thanh khoa hoc dau tien', 'Trophy', '#FFBD59', 'courses_completed', 1, 100, 'mastery', 1),
('courses_3', 'Da tai', 'Hoan thanh 3 khoa hoc', 'Medal', '#FFBD59', 'courses_completed', 3, 200, 'mastery', 2),
('courses_5', 'Chuyen gia', 'Hoan thanh 5 khoa hoc', 'Award', '#FFBD59', 'courses_completed', 5, 300, 'mastery', 3),
('quiz_perfect', 'Hoan hao', 'Dat diem tuyet doi trong quiz', 'Star', '#FFBD59', 'quiz_perfect_score', 1, 50, 'mastery', 4),

-- XP Achievements
('xp_500', 'Nguoi moi noi', 'Dat 500 XP', 'Zap', '#00F0FF', 'xp_earned', 500, 25, 'general', 1),
('xp_1000', 'Dang len', 'Dat 1,000 XP', 'Zap', '#6A5BFF', 'xp_earned', 1000, 50, 'general', 2),
('xp_5000', 'Sieu sao', 'Dat 5,000 XP', 'Star', '#FFBD59', 'xp_earned', 5000, 100, 'general', 3)

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  xp_reward = EXCLUDED.xp_reward;
