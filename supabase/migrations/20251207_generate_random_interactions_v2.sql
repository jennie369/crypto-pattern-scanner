-- =====================================================
-- GENERATE RANDOM INTERACTIONS FOR SEED POSTS - V2
-- Optimized version with smaller batches to avoid timeout
-- Run this in parts if needed
-- =====================================================

-- PART 1: Drop FK constraints and clean up
-- =====================================================
ALTER TABLE public.forum_comments DROP CONSTRAINT IF EXISTS forum_comments_user_id_fkey;

-- Delete existing likes for seed posts
DELETE FROM public.forum_likes WHERE seed_post_id IS NOT NULL;

-- Reset likes_count
UPDATE public.seed_posts SET likes_count = 0;

-- Delete existing comments for seed posts
DELETE FROM public.forum_comments WHERE post_id IN (SELECT id FROM public.seed_posts);

-- Reset comments_count
UPDATE public.seed_posts SET comments_count = 0;
