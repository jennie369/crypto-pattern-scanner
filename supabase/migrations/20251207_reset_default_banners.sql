-- ============================================
-- Reset and add 5 default sponsor banners
-- Run this if banners are missing
-- ============================================

-- Insert 5 default banners (even if some already exist)
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
  created_at
) VALUES
-- Banner 1: Upgrade to Tier 1
(
  'Nang cap len TIER 1',
  'Mo khoa Zone Retest Scanner va 10+ cong cu phan tich chuyen nghiep',
  'Nang cap ngay',
  'AffiliateProgram',
  'screen',
  NULL,
  '#1a1a2e',
  '#ffffff',
  '#FFD700',
  true,
  true,
  100,
  ARRAY['home', 'scanner', 'portfolio'],
  ARRAY['FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN'],
  NOW(),
  NOW()
),
-- Banner 2: Upgrade to Tier 2
(
  'Nang cap len TIER 2',
  'Whale Tracking + AI Predictions + Backtesting Engine Pro',
  'Nang cap ngay',
  'AffiliateDashboard',
  'screen',
  NULL,
  '#1e3a5f',
  '#ffffff',
  '#3498DB',
  true,
  true,
  90,
  ARRAY['home', 'scanner', 'portfolio'],
  ARRAY['FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN'],
  NOW(),
  NOW()
),
-- Banner 3: Crystal Healing Course
(
  'Khoa hoc: Crystal Healing cho Traders',
  'Ket hop Trading & Spiritual Wellness - Giam stress, tang focus',
  'Tim hieu them',
  'Courses',
  'screen',
  NULL,
  '#2d1f4e',
  '#ffffff',
  '#9B59B6',
  true,
  true,
  80,
  ARRAY['home', 'portfolio', 'account'],
  ARRAY['FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN'],
  NOW(),
  NOW()
),
-- Banner 4: Trading Journal
(
  'Top Trading Journals tren Amazon',
  'So tay giao dich duoc danh gia cao nhat - Track & improve your trades',
  'Xem ngay',
  'https://amzn.to/trading-journal',
  'url',
  NULL,
  '#1e3a5f',
  '#ffffff',
  '#3498DB',
  true,
  true,
  70,
  ARRAY['home', 'portfolio'],
  ARRAY['FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN'],
  NOW(),
  NOW()
),
-- Banner 5: Gem Master AI
(
  'Gem Master AI - Tu van 24/7',
  'Hoi dap ve da quy, tarot, I Ching va trading psychology',
  'Tro chuyen ngay',
  'Home',
  'screen',
  NULL,
  '#4a1a6b',
  '#ffffff',
  '#E91E63',
  true,
  true,
  60,
  ARRAY['home', 'portfolio', 'visionboard'],
  ARRAY['FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN'],
  NOW(),
  NOW()
);

-- Show how many banners now exist
SELECT 'Inserted 5 default sponsor banners!' AS status, COUNT(*) AS total_banners FROM sponsor_banners;
