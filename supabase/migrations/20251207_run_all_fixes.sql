-- ============================================
-- COMBINED FIXES - Run all fixes in one migration
-- Date: December 7, 2024
-- ============================================
-- This migration combines all fixes for:
-- 1. For You tab showing viewed posts first (impressions upsert)
-- 2. Post update not working (forum_posts UPDATE RLS)
-- 3. Sponsor banners with Vietnamese text and images
-- ============================================

-- ============================================
-- FIX 1: IMPRESSIONS UPSERT (For You feed)
-- ============================================

-- Add UPDATE policy for feed_impressions
DROP POLICY IF EXISTS "Users can update own impressions" ON feed_impressions;
CREATE POLICY "Users can update own impressions" ON feed_impressions
  FOR UPDATE USING (auth.uid() = user_id);

-- Add UPDATE policy for seed_impressions
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can update own seed impressions" ON seed_impressions;
  CREATE POLICY "Users can update own seed impressions" ON seed_impressions
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Ensure unique constraints for upsert
DO $$
BEGIN
  ALTER TABLE feed_impressions
  ADD CONSTRAINT feed_impressions_user_post_unique
  UNIQUE (user_id, post_id);
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE seed_impressions
  ADD CONSTRAINT seed_impressions_user_post_unique
  UNIQUE (user_id, post_id);
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

-- Clean up duplicate impressions
DELETE FROM feed_impressions a
USING feed_impressions b
WHERE a.id > b.id
  AND a.user_id = b.user_id
  AND a.post_id = b.post_id;

DO $$
BEGIN
  DELETE FROM seed_impressions a
  USING seed_impressions b
  WHERE a.id > b.id
    AND a.user_id = b.user_id
    AND a.post_id = b.post_id;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Grant update permission
GRANT UPDATE ON feed_impressions TO authenticated;

DO $$
BEGIN
  GRANT UPDATE ON seed_impressions TO authenticated;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- ============================================
-- FIX 2: FORUM POSTS UPDATE RLS
-- ============================================

DROP POLICY IF EXISTS "Users can update own posts" ON forum_posts;
DROP POLICY IF EXISTS "Enable update for post authors" ON forum_posts;
DROP POLICY IF EXISTS "Admins can update any post" ON forum_posts;

CREATE POLICY "Users can update own posts" ON forum_posts
  FOR UPDATE USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

GRANT UPDATE ON forum_posts TO authenticated;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Fix seed_posts UPDATE for admin
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can update seed posts" ON seed_posts;

  CREATE POLICY "Admins can update seed posts" ON seed_posts
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );

  GRANT UPDATE ON seed_posts TO authenticated;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- ============================================
-- FIX 3: SPONSOR BANNERS WITH VIETNAMESE TEXT
-- ============================================

DELETE FROM sponsor_banners;

INSERT INTO sponsor_banners (
  title,
  subtitle,
  action_label,
  action_value,
  action_type,
  image_url,
  background_color,
  text_color,
  accent_color,
  is_active,
  is_dismissible,
  priority,
  target_screens,
  target_tiers,
  created_at
) VALUES
-- Banner 1: Upgrade to TIER 1 for FREE users
(
  '🚀 Nâng cấp lên TIER 1',
  'Mở khóa Zone Retest Scanner và 10+ công cụ phân tích chuyên nghiệp',
  'Nâng cấp ngay',
  '/upgrade/tier1',
  'navigate',
  'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800',
  '#1a1a2e',
  '#ffffff',
  '#FFD700',
  true,
  true,
  100,
  ARRAY['home', 'forum', 'scanner'],
  ARRAY['FREE'],
  NOW()
),
-- Banner 2: Upgrade to TIER 2 for TIER_1 users
(
  '⚡ Nâng cấp lên TIER 2',
  'Whale Tracking + AI Predictions + Backtesting Engine Pro',
  'Nâng cấp ngay',
  '/upgrade/tier2',
  'navigate',
  'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
  '#1e3a5f',
  '#ffffff',
  '#3498DB',
  true,
  true,
  90,
  ARRAY['home', 'forum', 'scanner'],
  ARRAY['TIER_1'],
  NOW()
),
-- Banner 3: Crystal Healing Course
(
  '🔮 Khóa học: Crystal Healing cho Traders',
  'Kết hợp Trading & Spiritual Wellness - Giảm stress, tăng focus',
  'Tìm hiểu thêm',
  '/academy/crystal-healing',
  'navigate',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800',
  '#2d1f4e',
  '#ffffff',
  '#9B59B6',
  true,
  true,
  80,
  ARRAY['home', 'forum'],
  ARRAY['FREE', 'TIER_1', 'TIER_2', 'TIER_3'],
  NOW()
),
-- Banner 4: Trading Journals
(
  '📒 Sổ Tay Giao Dịch Chuyên Nghiệp',
  'Ghi chép và phân tích mọi giao dịch - Cải thiện chiến lược của bạn',
  'Xem ngay',
  'https://amzn.to/trading-journal',
  'external_link',
  'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
  '#1e3a5f',
  '#ffffff',
  '#3498DB',
  true,
  true,
  70,
  ARRAY['home', 'forum'],
  ARRAY['FREE', 'TIER_1', 'TIER_2', 'TIER_3'],
  NOW()
),
-- Banner 5: Gem Master AI
(
  '💎 Gem Master AI - Tư vấn 24/7',
  'Hỏi đáp về đá quý, tarot, I Ching và trading psychology',
  'Trò chuyện ngay',
  '/gemmaster',
  'navigate',
  'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800',
  '#4a1a6b',
  '#ffffff',
  '#E91E63',
  true,
  true,
  60,
  ARRAY['home', 'forum'],
  ARRAY['FREE', 'TIER_1', 'TIER_2', 'TIER_3'],
  NOW()
);

-- ============================================
-- LOG SUCCESS
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ All fixes applied successfully:';
  RAISE NOTICE '  - Feed impressions upsert fixed';
  RAISE NOTICE '  - Forum posts UPDATE RLS policy fixed';
  RAISE NOTICE '  - Sponsor banners with Vietnamese text inserted';
END $$;
