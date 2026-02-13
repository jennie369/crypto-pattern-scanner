-- ============================================
-- FORUM POSTS FEED OPTIMIZATION INDEXES
-- Created: 2026-01-25
-- Purpose: Speed up feed queries from ~2.5s to ~500ms
-- ============================================

-- Index 1: Main feed query (status + created_at DESC)
-- Used by: generateFeed fast mode, explore feed
CREATE INDEX IF NOT EXISTS idx_forum_posts_feed_main
ON public.forum_posts(status, created_at DESC)
WHERE status = 'published';

-- Index 2: User's posts query (for following feed)
-- Used by: getFollowingPosts, getUserOwnPosts
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_created
ON public.forum_posts(user_id, created_at DESC)
WHERE status = 'published';

-- Index 3: Category filter
-- Used by: filter by topic/category
CREATE INDEX IF NOT EXISTS idx_forum_posts_category_created
ON public.forum_posts(category_id, created_at DESC)
WHERE status = 'published';

-- Index 4: Hot/trending posts (likes + views)
-- Used by: hot algorithm sorting
CREATE INDEX IF NOT EXISTS idx_forum_posts_engagement
ON public.forum_posts(likes_count DESC, views_count DESC, created_at DESC)
WHERE status = 'published';

-- Index 5: Pinned posts (for showing pinned first)
CREATE INDEX IF NOT EXISTS idx_forum_posts_pinned
ON public.forum_posts(is_pinned DESC, created_at DESC)
WHERE status = 'published' AND is_pinned = true;

-- ============================================
-- VERIFY INDEXES CREATED
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Forum posts feed indexes created successfully';
  RAISE NOTICE 'Expected improvement: ~2.5s → ~500ms for feed queries';
END $$;
