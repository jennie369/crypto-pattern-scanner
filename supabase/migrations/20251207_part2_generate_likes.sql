-- =====================================================
-- PART 2: Generate random likes for seed posts
-- Run this AFTER part 1 completes
-- Process 10 posts at a time to avoid timeout
-- =====================================================

-- Batch 1: First 10 posts
DO $$
DECLARE
  post_record RECORD;
  seed_user_ids UUID[];
  likes_count INT;
  i INT;
BEGIN
  -- Get all seed user IDs
  SELECT array_agg(id) INTO seed_user_ids FROM public.seed_users;

  FOR post_record IN
    SELECT id, created_at FROM public.seed_posts
    ORDER BY created_at DESC
    LIMIT 10 OFFSET 0
  LOOP
    -- Random likes between 50-300
    likes_count := 50 + floor(random() * 251)::INT;

    -- Insert likes
    FOR i IN 1..LEAST(likes_count, array_length(seed_user_ids, 1)) LOOP
      BEGIN
        INSERT INTO public.forum_likes (seed_post_id, user_id, created_at)
        VALUES (
          post_record.id,
          seed_user_ids[i],
          post_record.created_at + (random() * (NOW() - post_record.created_at))
        );
      EXCEPTION WHEN unique_violation THEN
        NULL;
      END;
    END LOOP;

    -- Update count
    UPDATE public.seed_posts
    SET likes_count = (SELECT COUNT(*) FROM public.forum_likes WHERE seed_post_id = post_record.id)
    WHERE id = post_record.id;
  END LOOP;
END $$;

-- Batch 2: Posts 11-20
DO $$
DECLARE
  post_record RECORD;
  seed_user_ids UUID[];
  likes_count INT;
  i INT;
BEGIN
  SELECT array_agg(id) INTO seed_user_ids FROM public.seed_users;

  FOR post_record IN
    SELECT id, created_at FROM public.seed_posts
    ORDER BY created_at DESC
    LIMIT 10 OFFSET 10
  LOOP
    likes_count := 50 + floor(random() * 251)::INT;

    FOR i IN 1..LEAST(likes_count, array_length(seed_user_ids, 1)) LOOP
      BEGIN
        INSERT INTO public.forum_likes (seed_post_id, user_id, created_at)
        VALUES (
          post_record.id,
          seed_user_ids[i],
          post_record.created_at + (random() * (NOW() - post_record.created_at))
        );
      EXCEPTION WHEN unique_violation THEN
        NULL;
      END;
    END LOOP;

    UPDATE public.seed_posts
    SET likes_count = (SELECT COUNT(*) FROM public.forum_likes WHERE seed_post_id = post_record.id)
    WHERE id = post_record.id;
  END LOOP;
END $$;

-- Batch 3: Posts 21-30
DO $$
DECLARE
  post_record RECORD;
  seed_user_ids UUID[];
  likes_count INT;
  i INT;
BEGIN
  SELECT array_agg(id) INTO seed_user_ids FROM public.seed_users;

  FOR post_record IN
    SELECT id, created_at FROM public.seed_posts
    ORDER BY created_at DESC
    LIMIT 10 OFFSET 20
  LOOP
    likes_count := 50 + floor(random() * 251)::INT;

    FOR i IN 1..LEAST(likes_count, array_length(seed_user_ids, 1)) LOOP
      BEGIN
        INSERT INTO public.forum_likes (seed_post_id, user_id, created_at)
        VALUES (
          post_record.id,
          seed_user_ids[i],
          post_record.created_at + (random() * (NOW() - post_record.created_at))
        );
      EXCEPTION WHEN unique_violation THEN
        NULL;
      END;
    END LOOP;

    UPDATE public.seed_posts
    SET likes_count = (SELECT COUNT(*) FROM public.forum_likes WHERE seed_post_id = post_record.id)
    WHERE id = post_record.id;
  END LOOP;
END $$;

-- Batch 4: Posts 31-40
DO $$
DECLARE
  post_record RECORD;
  seed_user_ids UUID[];
  likes_count INT;
  i INT;
BEGIN
  SELECT array_agg(id) INTO seed_user_ids FROM public.seed_users;

  FOR post_record IN
    SELECT id, created_at FROM public.seed_posts
    ORDER BY created_at DESC
    LIMIT 10 OFFSET 30
  LOOP
    likes_count := 50 + floor(random() * 251)::INT;

    FOR i IN 1..LEAST(likes_count, array_length(seed_user_ids, 1)) LOOP
      BEGIN
        INSERT INTO public.forum_likes (seed_post_id, user_id, created_at)
        VALUES (
          post_record.id,
          seed_user_ids[i],
          post_record.created_at + (random() * (NOW() - post_record.created_at))
        );
      EXCEPTION WHEN unique_violation THEN
        NULL;
      END;
    END LOOP;

    UPDATE public.seed_posts
    SET likes_count = (SELECT COUNT(*) FROM public.forum_likes WHERE seed_post_id = post_record.id)
    WHERE id = post_record.id;
  END LOOP;
END $$;

-- Batch 5: Posts 41-50
DO $$
DECLARE
  post_record RECORD;
  seed_user_ids UUID[];
  likes_count INT;
  i INT;
BEGIN
  SELECT array_agg(id) INTO seed_user_ids FROM public.seed_users;

  FOR post_record IN
    SELECT id, created_at FROM public.seed_posts
    ORDER BY created_at DESC
    LIMIT 10 OFFSET 40
  LOOP
    likes_count := 50 + floor(random() * 251)::INT;

    FOR i IN 1..LEAST(likes_count, array_length(seed_user_ids, 1)) LOOP
      BEGIN
        INSERT INTO public.forum_likes (seed_post_id, user_id, created_at)
        VALUES (
          post_record.id,
          seed_user_ids[i],
          post_record.created_at + (random() * (NOW() - post_record.created_at))
        );
      EXCEPTION WHEN unique_violation THEN
        NULL;
      END;
    END LOOP;

    UPDATE public.seed_posts
    SET likes_count = (SELECT COUNT(*) FROM public.forum_likes WHERE seed_post_id = post_record.id)
    WHERE id = post_record.id;
  END LOOP;
END $$;

-- Check progress
SELECT
  'Likes Progress' as status,
  COUNT(*) as total_likes,
  COUNT(DISTINCT seed_post_id) as posts_with_likes
FROM public.forum_likes
WHERE seed_post_id IS NOT NULL;
