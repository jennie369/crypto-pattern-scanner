-- =============================================
-- UPDATE DAILY QUESTS WITH PROPER VIETNAMESE DIACRITICS
-- Run this in Supabase SQL Editor to fix the Vietnamese text
-- =============================================

UPDATE daily_quests SET
  name = 'Hoàn thành 1 bài học',
  description = 'Hoàn thành 1 bài học bất kỳ'
WHERE code = 'complete_1_lesson';

UPDATE daily_quests SET
  name = 'Hoàn thành 2 bài học',
  description = 'Hoàn thành 2 bài học bất kỳ'
WHERE code = 'complete_2_lessons';

UPDATE daily_quests SET
  name = 'Xem video 10 phút',
  description = 'Xem ít nhất 10 phút video'
WHERE code = 'watch_10_min';

UPDATE daily_quests SET
  name = 'Xem video 20 phút',
  description = 'Xem ít nhất 20 phút video'
WHERE code = 'watch_20_min';

UPDATE daily_quests SET
  name = 'Vượt qua 1 quiz',
  description = 'Hoàn thành và vượt qua 1 bài quiz'
WHERE code = 'pass_quiz';

UPDATE daily_quests SET
  name = 'Điểm cao quiz',
  description = 'Đạt ít nhất 80% trong 1 bài quiz'
WHERE code = 'pass_quiz_80';

UPDATE daily_quests SET
  name = 'Hoàn thành 1 module',
  description = 'Hoàn thành tất cả bài trong 1 module'
WHERE code = 'complete_module';

-- Verify the updates
SELECT code, name, description FROM daily_quests;
