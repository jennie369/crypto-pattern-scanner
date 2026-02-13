-- =====================================================
-- GENERATE RANDOM INTERACTIONS FOR SEED POSTS
-- This creates varied likes (50-300) and comments (5-25) per post
-- to make the forum look more natural
-- =====================================================

-- Step 1: Drop FK constraint on forum_comments.user_id to allow seed user IDs
ALTER TABLE public.forum_comments
DROP CONSTRAINT IF EXISTS forum_comments_user_id_fkey;

-- Step 2: Delete all existing likes for seed posts (to recreate with varied counts)
DELETE FROM public.forum_likes WHERE seed_post_id IS NOT NULL;

-- Step 3: Reset likes_count on seed_posts
UPDATE public.seed_posts SET likes_count = 0;

-- Step 4: Delete any existing comments for seed posts
DELETE FROM public.forum_comments
WHERE post_id IN (SELECT id FROM public.seed_posts);

-- Reset comments_count
UPDATE public.seed_posts SET comments_count = 0;

-- Step 5: Create function to generate random likes for a post
CREATE OR REPLACE FUNCTION generate_random_likes_for_post(
  p_post_id UUID,
  p_min_likes INT DEFAULT 50,
  p_max_likes INT DEFAULT 300
) RETURNS INT AS $$
DECLARE
  target_likes INT;
  likes_created INT := 0;
  seed_user_ids UUID[];
  user_id UUID;
  random_timestamp TIMESTAMPTZ;
  post_created_at TIMESTAMPTZ;
BEGIN
  -- Get post creation time
  SELECT created_at INTO post_created_at FROM public.seed_posts WHERE id = p_post_id;
  IF post_created_at IS NULL THEN
    RETURN 0;
  END IF;

  -- Generate random target likes
  target_likes := p_min_likes + floor(random() * (p_max_likes - p_min_likes + 1))::INT;

  -- Get all seed user IDs
  SELECT array_agg(id) INTO seed_user_ids FROM public.seed_users;

  IF seed_user_ids IS NULL OR array_length(seed_user_ids, 1) = 0 THEN
    RETURN 0;
  END IF;

  -- Shuffle and pick users
  FOR i IN 1..LEAST(target_likes, array_length(seed_user_ids, 1)) LOOP
    user_id := seed_user_ids[(i % array_length(seed_user_ids, 1)) + 1];

    -- Random timestamp between post creation and now
    random_timestamp := post_created_at + (random() * (NOW() - post_created_at));

    BEGIN
      INSERT INTO public.forum_likes (seed_post_id, user_id, created_at)
      VALUES (p_post_id, user_id, random_timestamp);
      likes_created := likes_created + 1;
    EXCEPTION WHEN unique_violation THEN
      -- Skip duplicates
      NULL;
    END;
  END LOOP;

  -- Update post likes count
  UPDATE public.seed_posts SET likes_count = likes_created WHERE id = p_post_id;

  RETURN likes_created;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create function to generate random comments for a post
CREATE OR REPLACE FUNCTION generate_random_comments_for_post(
  p_post_id UUID,
  p_min_comments INT DEFAULT 5,
  p_max_comments INT DEFAULT 25
) RETURNS INT AS $$
DECLARE
  target_comments INT;
  comments_created INT := 0;
  seed_user_ids UUID[];
  user_id UUID;
  random_timestamp TIMESTAMPTZ;
  post_created_at TIMESTAMPTZ;
  comment_content TEXT;
  comment_templates TEXT[];
BEGIN
  -- Get post creation time
  SELECT created_at INTO post_created_at FROM public.seed_posts WHERE id = p_post_id;
  IF post_created_at IS NULL THEN
    RETURN 0;
  END IF;

  -- Vietnamese comment templates
  comment_templates := ARRAY[
    'Cảm ơn bạn đã chia sẻ!',
    'Bài viết rất hữu ích 👍',
    'Hay quá, follow để học hỏi thêm',
    'Mình cũng nghĩ như vậy',
    'Thông tin rất giá trị, cảm ơn bạn',
    'Bài viết chất lượng!',
    'Chia sẻ hay, thanks bạn',
    'Đang học hỏi từ bạn, cảm ơn nhiều!',
    'Content chất, tiếp tục phát huy nhé',
    'Rất bổ ích, bookmark lại để đọc sau',
    'Hay lắm, mình cũng muốn thử',
    'Cảm ơn bạn đã chia sẻ kinh nghiệm',
    'Bài viết rất chi tiết và dễ hiểu',
    'Mình học được nhiều từ bài này',
    'Great content! Keep it up 🔥',
    'Đúng vậy, mình cũng có trải nghiệm tương tự',
    'Thanks for sharing! Very insightful',
    'Nội dung hay, mong bạn chia sẻ thêm',
    'Useful information, appreciated!',
    'Bạn viết hay quá, follow ngay',
    'Wow, bài này đỉnh thật',
    'Thông tin này rất cần thiết, cảm ơn',
    'Bài viết công phu, respect!',
    'Đã save lại để tham khảo',
    'Chia sẻ của bạn rất có giá trị',
    'Nice post! 👏',
    'Cảm ơn kiến thức bạn chia sẻ',
    'Hữu ích cho cộng đồng lắm',
    'Chờ bài tiếp theo của bạn',
    'Bạn chia sẻ rất dễ hiểu, thanks!'
  ];

  -- Generate random target comments
  target_comments := p_min_comments + floor(random() * (p_max_comments - p_min_comments + 1))::INT;

  -- Get all seed user IDs (shuffled)
  SELECT array_agg(id ORDER BY random()) INTO seed_user_ids FROM public.seed_users;

  IF seed_user_ids IS NULL OR array_length(seed_user_ids, 1) = 0 THEN
    RETURN 0;
  END IF;

  -- Create comments
  FOR i IN 1..LEAST(target_comments, array_length(seed_user_ids, 1)) LOOP
    user_id := seed_user_ids[i];

    -- Pick random comment template
    comment_content := comment_templates[(floor(random() * array_length(comment_templates, 1)) + 1)::INT];

    -- Random timestamp - earlier comments come faster
    IF i <= 3 THEN
      -- First 3 comments: 5-60 minutes after post
      random_timestamp := post_created_at + (interval '5 minutes' + random() * interval '55 minutes');
    ELSIF i <= 8 THEN
      -- Comments 4-8: 1-6 hours after post
      random_timestamp := post_created_at + (interval '1 hour' + random() * interval '5 hours');
    ELSE
      -- Later comments: 6-48 hours after post
      random_timestamp := post_created_at + (interval '6 hours' + random() * interval '42 hours');
    END IF;

    -- Make sure timestamp is not in the future
    IF random_timestamp > NOW() THEN
      random_timestamp := NOW() - (random() * interval '2 hours');
    END IF;

    BEGIN
      INSERT INTO public.forum_comments (post_id, user_id, content, created_at, updated_at, likes_count)
      VALUES (p_post_id, user_id, comment_content, random_timestamp, random_timestamp, 0);
      comments_created := comments_created + 1;
    EXCEPTION WHEN OTHERS THEN
      -- Skip on error
      NULL;
    END;
  END LOOP;

  -- Update post comments count
  UPDATE public.seed_posts SET comments_count = comments_created WHERE id = p_post_id;

  RETURN comments_created;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Generate likes and comments for ALL seed posts
DO $$
DECLARE
  post_record RECORD;
  total_likes INT := 0;
  total_comments INT := 0;
  post_likes INT;
  post_comments INT;
BEGIN
  FOR post_record IN SELECT id FROM public.seed_posts ORDER BY created_at DESC LOOP
    -- Generate random likes (50-300)
    post_likes := generate_random_likes_for_post(post_record.id, 50, 300);
    total_likes := total_likes + post_likes;

    -- Generate random comments (5-25)
    post_comments := generate_random_comments_for_post(post_record.id, 5, 25);
    total_comments := total_comments + post_comments;

    RAISE NOTICE 'Post %: % likes, % comments', post_record.id, post_likes, post_comments;
  END LOOP;

  RAISE NOTICE 'TOTAL: % likes, % comments generated', total_likes, total_comments;
END $$;

-- Step 8: Clean up functions (optional - keep them for future use)
-- DROP FUNCTION IF EXISTS generate_random_likes_for_post;
-- DROP FUNCTION IF EXISTS generate_random_comments_for_post;

-- Step 9: Verify results
SELECT
  'Summary' as report,
  (SELECT COUNT(*) FROM public.seed_posts) as total_posts,
  (SELECT COUNT(*) FROM public.forum_likes WHERE seed_post_id IS NOT NULL) as total_likes,
  (SELECT COUNT(*) FROM public.forum_comments WHERE post_id IN (SELECT id FROM public.seed_posts)) as total_comments,
  (SELECT AVG(likes_count) FROM public.seed_posts) as avg_likes_per_post,
  (SELECT MIN(likes_count) FROM public.seed_posts) as min_likes,
  (SELECT MAX(likes_count) FROM public.seed_posts) as max_likes,
  (SELECT AVG(comments_count) FROM public.seed_posts) as avg_comments_per_post;
