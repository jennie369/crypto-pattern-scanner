-- ============================================
-- Expand banner target_screens to show on more screens
-- All banners should be distributed across all main screens
-- ============================================

-- Update all banners to show on all main screens
UPDATE sponsor_banners
SET target_screens = ARRAY['home', 'forum', 'shop', 'scanner', 'wallet', 'account']
WHERE is_active = true;

-- Verify the update
DO $$
DECLARE
  banner_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO banner_count FROM sponsor_banners WHERE is_active = true;
  RAISE NOTICE 'Updated % active banners to show on all main screens', banner_count;
END $$;
