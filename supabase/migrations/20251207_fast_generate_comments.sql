-- =====================================================
-- FAST COMMENTS GENERATION - Using bulk INSERT
-- =====================================================

-- Vietnamese comment templates
CREATE TEMP TABLE comment_templates (id SERIAL, content TEXT);
INSERT INTO comment_templates (content) VALUES
  ('Cảm ơn bạn đã chia sẻ!'),
  ('Bài viết rất hữu ích 👍'),
  ('Hay quá, follow để học hỏi thêm'),
  ('Mình cũng nghĩ như vậy'),
  ('Thông tin rất giá trị, cảm ơn bạn'),
  ('Bài viết chất lượng!'),
  ('Chia sẻ hay, thanks bạn'),
  ('Đang học hỏi từ bạn, cảm ơn nhiều!'),
  ('Content chất, tiếp tục phát huy nhé'),
  ('Rất bổ ích, bookmark lại để đọc sau'),
  ('Hay lắm, mình cũng muốn thử'),
  ('Cảm ơn bạn đã chia sẻ kinh nghiệm'),
  ('Bài viết rất chi tiết và dễ hiểu'),
  ('Mình học được nhiều từ bài này'),
  ('Great content! Keep it up 🔥'),
  ('Đúng vậy, mình cũng có trải nghiệm tương tự'),
  ('Thanks for sharing! Very insightful'),
  ('Nội dung hay, mong bạn chia sẻ thêm'),
  ('Useful information, appreciated!'),
  ('Bạn viết hay quá, follow ngay'),
  ('Wow, bài này đỉnh thật'),
  ('Thông tin này rất cần thiết, cảm ơn'),
  ('Bài viết công phu, respect!'),
  ('Đã save lại để tham khảo'),
  ('Chia sẻ của bạn rất có giá trị'),
  ('Nice post! 👏'),
  ('Cảm ơn kiến thức bạn chia sẻ'),
  ('Hữu ích cho cộng đồng lắm'),
  ('Chờ bài tiếp theo của bạn'),
  ('Bạn chia sẻ rất dễ hiểu, thanks!');

-- Generate comments with random counts (5-25 per post)
CREATE TEMP TABLE temp_comments AS
WITH post_user_comments AS (
  SELECT
    sp.id as post_id,
    sp.created_at as post_created_at,
    su.id as user_id,
    ROW_NUMBER() OVER (PARTITION BY sp.id ORDER BY random()) as user_rank,
    -- Random comment count per post (5-25)
    5 + floor(random() * 21)::INT as target_comments
  FROM public.seed_posts sp
  CROSS JOIN public.seed_users su
)
SELECT
  p.post_id,
  p.user_id,
  ct.content,
  CASE
    WHEN p.user_rank <= 3 THEN p.post_created_at + (interval '5 minutes' + random() * interval '55 minutes')
    WHEN p.user_rank <= 8 THEN p.post_created_at + (interval '1 hour' + random() * interval '5 hours')
    ELSE p.post_created_at + (interval '6 hours' + random() * interval '42 hours')
  END as created_at
FROM post_user_comments p
CROSS JOIN LATERAL (
  SELECT content FROM comment_templates ORDER BY random() LIMIT 1
) ct
WHERE p.user_rank <= p.target_comments;

-- Make sure timestamps aren't in the future
UPDATE temp_comments
SET created_at = NOW() - (random() * interval '2 hours')
WHERE created_at > NOW();

-- Insert comments
INSERT INTO public.forum_comments (post_id, user_id, content, created_at, updated_at, likes_count)
SELECT
  post_id,
  user_id,
  content,
  created_at,
  created_at,
  0
FROM temp_comments;

-- Update comments_count for each seed post
UPDATE public.seed_posts sp
SET comments_count = (
  SELECT COUNT(*) FROM public.forum_comments fc WHERE fc.post_id = sp.id
);

-- Clean up
DROP TABLE temp_comments;
DROP TABLE comment_templates;

-- Show results
SELECT
  'Comments Summary' as report,
  COUNT(*) as total_comments,
  COUNT(DISTINCT post_id) as posts_with_comments,
  ROUND(AVG(comments_per_post)) as avg_comments,
  MIN(comments_per_post) as min_comments,
  MAX(comments_per_post) as max_comments
FROM (
  SELECT post_id, COUNT(*) as comments_per_post
  FROM public.forum_comments
  WHERE post_id IN (SELECT id FROM public.seed_posts)
  GROUP BY post_id
) sub;
