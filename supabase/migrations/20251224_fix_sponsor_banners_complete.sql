-- ============================================
-- COMPLETE FIX: Sponsor Banners Display Issue
-- 1. Reset all sponsor banners with correct data
-- 2. Ensure all target_screens include all main screens
-- 3. Support both TIER_1 and TIER1 formats
-- 4. Clear dismissed_banners to show banners again
-- ============================================

-- Step 1: Clear dismissed banners to reset display
DELETE FROM dismissed_banners;

-- Step 2: Delete existing sponsor banners
DELETE FROM sponsor_banners;

-- Step 3: Insert fresh banners with ALL screens and ALL tier formats
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
  start_date,
  end_date,
  created_at
) VALUES
-- Banner 1: Upgrade to TIER 1 for FREE users
(
  '🚀 Nâng cấp lên TIER 1',
  'Mở khóa Zone Retest Scanner và 10+ công cụ phân tích chuyên nghiệp',
  'Nâng cấp ngay',
  'TierUpgrade',
  'screen',
  'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800',
  '#1a1a2e',
  '#ffffff',
  '#FFD700',
  true,
  true,
  100,
  ARRAY['home', 'forum', 'shop', 'scanner', 'wallet', 'account', 'visionboard', 'gemmaster'],
  ARRAY['FREE', 'free'],
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '365 days',
  NOW()
),
-- Banner 2: Upgrade to TIER 2 for TIER 1 users (support both formats)
(
  '⚡ Nâng cấp lên TIER 2',
  'Whale Tracking + AI Predictions + Backtesting Engine Pro',
  'Nâng cấp ngay',
  'TierUpgrade',
  'screen',
  'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
  '#1e3a5f',
  '#ffffff',
  '#3498DB',
  true,
  true,
  90,
  ARRAY['home', 'forum', 'shop', 'scanner', 'wallet', 'account', 'visionboard', 'gemmaster'],
  ARRAY['TIER_1', 'TIER1', 'tier_1', 'tier1'],
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '365 days',
  NOW()
),
-- Banner 3: Crystal Healing Course (for all users)
(
  '🔮 Khóa học: Crystal Healing cho Traders',
  'Kết hợp Trading & Spiritual Wellness - Giảm stress, tăng focus',
  'Tìm hiểu thêm',
  'Courses',
  'screen',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800',
  '#2d1f4e',
  '#ffffff',
  '#9B59B6',
  true,
  true,
  80,
  ARRAY['home', 'forum', 'shop', 'scanner', 'wallet', 'account', 'visionboard', 'gemmaster'],
  ARRAY['FREE', 'free', 'TIER_1', 'TIER1', 'tier_1', 'tier1', 'TIER_2', 'TIER2', 'tier_2', 'tier2', 'TIER_3', 'TIER3', 'tier_3', 'tier3', 'ADMIN', 'admin'],
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '365 days',
  NOW()
),
-- Banner 4: Shop promotion (for all users)
(
  '💎 Shop Đá Phong Thủy',
  'Khám phá bộ sưu tập đá quý và trang sức mang năng lượng tích cực',
  'Mua sắm ngay',
  'Shop',
  'screen',
  'https://images.unsplash.com/photo-1615655114865-4cc7c9504b44?w=800',
  '#1a0b2e',
  '#ffffff',
  '#E91E63',
  true,
  true,
  70,
  ARRAY['home', 'forum', 'scanner', 'wallet', 'account', 'visionboard', 'gemmaster'],
  ARRAY['FREE', 'free', 'TIER_1', 'TIER1', 'tier_1', 'tier1', 'TIER_2', 'TIER2', 'tier_2', 'tier2', 'TIER_3', 'TIER3', 'tier_3', 'tier3', 'ADMIN', 'admin'],
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '365 days',
  NOW()
),
-- Banner 5: Gem Master AI (for all users)
(
  '💎 Gem Master AI - Tư vấn 24/7',
  'Hỏi đáp về đá quý, tarot, I Ching và trading psychology',
  'Trò chuyện ngay',
  'GemMaster',
  'screen',
  'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800',
  '#4a1a6b',
  '#ffffff',
  '#E91E63',
  true,
  true,
  60,
  ARRAY['home', 'forum', 'shop', 'scanner', 'wallet', 'account', 'visionboard'],
  ARRAY['FREE', 'free', 'TIER_1', 'TIER1', 'tier_1', 'tier1', 'TIER_2', 'TIER2', 'tier_2', 'tier2', 'TIER_3', 'TIER3', 'tier_3', 'tier3', 'ADMIN', 'admin'],
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '365 days',
  NOW()
);

-- Step 4: Verify the fix
DO $$
DECLARE
  banner_count INTEGER;
  dismissed_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO banner_count FROM sponsor_banners WHERE is_active = true;
  SELECT COUNT(*) INTO dismissed_count FROM dismissed_banners;

  RAISE NOTICE '✅ SPONSOR BANNERS FIX COMPLETE!';
  RAISE NOTICE '   - Active banners: %', banner_count;
  RAISE NOTICE '   - Dismissed banners cleared: %', dismissed_count;
  RAISE NOTICE '   - All banners now show on: home, forum, shop, scanner, wallet, account, visionboard, gemmaster';
  RAISE NOTICE '   - Tiers supported: FREE, TIER1, TIER_1, TIER2, TIER_2, TIER3, TIER_3, ADMIN';
END $$;
