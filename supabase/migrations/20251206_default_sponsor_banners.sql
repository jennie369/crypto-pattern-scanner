-- ============================================
-- Add default sponsor banners to database
-- These can be edited via Admin Dashboard
-- ============================================

-- First, check if we already have banners and only insert if none exist
DO $$
DECLARE
  banner_count INT;
BEGIN
  SELECT COUNT(*) INTO banner_count FROM sponsor_banners;

  IF banner_count = 0 THEN
    -- Insert default fallback banners
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
    (
      '🚀 Nâng cấp lên TIER 1',
      'Mở khóa Zone Retest Scanner và 10+ công cụ phân tích chuyên nghiệp',
      'Nâng cấp ngay',
      '/upgrade/tier1',
      'navigate',
      NULL,
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
    (
      '⚡ Nâng cấp lên TIER 2',
      'Whale Tracking + AI Predictions + Backtesting Engine Pro',
      'Nâng cấp ngay',
      '/upgrade/tier2',
      'navigate',
      NULL,
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
    (
      '🔮 Khóa học: Crystal Healing cho Traders',
      'Kết hợp Trading & Spiritual Wellness - Giảm stress, tăng focus',
      'Tìm hiểu thêm',
      '/academy/crystal-healing',
      'navigate',
      NULL,
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
    (
      '📒 Top Trading Journals trên Amazon',
      'Sổ tay giao dịch được đánh giá cao nhất - Track & improve your trades',
      'Xem ngay',
      'https://amzn.to/trading-journal',
      'external_link',
      NULL,
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
    (
      '💎 Gem Master AI - Tư vấn 24/7',
      'Hỏi đáp về đá quý, tarot, I Ching và trading psychology',
      'Trò chuyện ngay',
      '/gemmaster',
      'navigate',
      NULL,
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

    RAISE NOTICE 'Successfully added 5 default sponsor banners';
  ELSE
    RAISE NOTICE 'Sponsor banners already exist (% banners found), skipping insert', banner_count;
  END IF;
END $$;
