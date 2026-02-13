-- =====================================================
-- FAST LIKES GENERATION - Using bulk INSERT
-- Much faster than loops
-- =====================================================

-- Step 1: Create temp table with post-user combinations
CREATE TEMP TABLE temp_likes AS
WITH post_user_pairs AS (
  SELECT
    sp.id as post_id,
    sp.created_at as post_created_at,
    su.id as user_id,
    ROW_NUMBER() OVER (PARTITION BY sp.id ORDER BY random()) as user_rank,
    -- Random likes count per post (50-300)
    50 + floor(random() * 251)::INT as target_likes
  FROM public.seed_posts sp
  CROSS JOIN public.seed_users su
)
SELECT
  post_id as seed_post_id,
  user_id,
  post_created_at + (random() * (NOW() - post_created_at)) as created_at
FROM post_user_pairs
WHERE user_rank <= target_likes;

-- Step 2: Insert likes from temp table
INSERT INTO public.forum_likes (seed_post_id, user_id, created_at)
SELECT seed_post_id, user_id, created_at
FROM temp_likes
ON CONFLICT DO NOTHING;

-- Step 3: Update likes_count for each post
UPDATE public.seed_posts sp
SET likes_count = (
  SELECT COUNT(*) FROM public.forum_likes fl WHERE fl.seed_post_id = sp.id
);

-- Step 4: Clean up
DROP TABLE temp_likes;

-- Step 5: Show results
SELECT
  'Likes Summary' as report,
  COUNT(*) as total_likes,
  COUNT(DISTINCT seed_post_id) as posts_with_likes,
  ROUND(AVG(likes_per_post)) as avg_likes,
  MIN(likes_per_post) as min_likes,
  MAX(likes_per_post) as max_likes
FROM (
  SELECT seed_post_id, COUNT(*) as likes_per_post
  FROM public.forum_likes
  WHERE seed_post_id IS NOT NULL
  GROUP BY seed_post_id
) sub;
