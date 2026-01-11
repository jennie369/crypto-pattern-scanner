-- =============================================
-- GEM ACADEMY - SEED DAILY QUESTS
-- Migration: 20251224_003_seed_daily_quests.sql
-- Vietnamese text with proper diacritics
-- =============================================

INSERT INTO daily_quests (code, name, description, icon, requirement_type, requirement_value, xp_reward, difficulty) VALUES
('complete_1_lesson', 'Hoàn thành 1 bài học', 'Hoàn thành 1 bài học bất kỳ', 'BookOpen', 'lessons_completed', 1, 10, 'easy'),
('watch_10_min', 'Xem video 10 phút', 'Xem ít nhất 10 phút video', 'PlayCircle', 'watch_minutes', 10, 10, 'easy'),
('complete_2_lessons', 'Hoàn thành 2 bài học', 'Hoàn thành 2 bài học bất kỳ', 'BookOpen', 'lessons_completed', 2, 20, 'medium'),
('watch_20_min', 'Xem video 20 phút', 'Xem ít nhất 20 phút video', 'PlayCircle', 'watch_minutes', 20, 20, 'medium'),
('pass_quiz', 'Vượt qua 1 quiz', 'Hoàn thành và vượt qua 1 bài quiz', 'CheckSquare', 'quizzes_passed', 1, 25, 'medium'),
('pass_quiz_80', 'Điểm cao quiz', 'Đạt ít nhất 80% trong 1 bài quiz', 'Target', 'quiz_score_80', 1, 35, 'hard'),
('complete_module', 'Hoàn thành 1 module', 'Hoàn thành tất cả bài trong 1 module', 'Layers', 'modules_completed', 1, 50, 'hard')

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  xp_reward = EXCLUDED.xp_reward;
