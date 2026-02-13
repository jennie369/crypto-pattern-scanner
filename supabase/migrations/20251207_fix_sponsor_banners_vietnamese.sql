-- ============================================
-- Fix Vietnamese text encoding in sponsor banners
-- and add proper images for each banner
-- ============================================

-- Delete all existing sponsor banners and re-insert with correct Vietnamese
DELETE FROM sponsor_banners;

-- Re-insert with proper Vietnamese diacritics and images
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
-- Banner 1: Upgrade to TIER 1 for FREE users (Crypto trading theme)
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
-- Banner 2: Upgrade to TIER 2 for TIER_1 users (Whale/advanced trading)
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
-- Banner 3: Crystal Healing Course (Crystal/gem theme)
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
-- Banner 4: Trading Journals (Notebook/journal theme)
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
-- Banner 5: Gem Master AI (AI/chatbot theme with gems)
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

-- Add notification about the fix
DO $$
BEGIN
  RAISE NOTICE 'Successfully replaced sponsor banners with correct Vietnamese text and images';
END $$;
