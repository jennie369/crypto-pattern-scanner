-- =====================================================
-- ADD TIER BADGES TO BADGE DEFINITIONS
-- =====================================================
-- These badges are based on subscription tier (scanner_tier field)

INSERT INTO public.badge_definitions (badge_type, badge_id, name, description, icon_name, color, bg_gradient, animation, auto_award, requirement) VALUES

-- Tier Badges (Based on scanner_tier)
('tier', 'tier_free', 'Free User', 'Người dùng miễn phí', 'User', '#7B68EE', 'linear-gradient(135deg, rgba(123, 104, 238, 0.15) 0%, rgba(123, 104, 238, 0.05) 100%)', 'none', FALSE, 'scanner_tier = FREE'),
('tier', 'tier_1', 'Basic Member', 'TIER 1 - Basic subscriber', 'Star', '#00D9FF', 'linear-gradient(135deg, rgba(0, 217, 255, 0.15) 0%, rgba(0, 217, 255, 0.05) 100%)', 'subtle-glow', FALSE, 'scanner_tier = TIER1'),
('tier', 'tier_2', 'Premium Member', 'TIER 2 - Premium subscriber', 'Sparkles', '#FFBD59', 'linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%)', 'gold-shine', FALSE, 'scanner_tier = TIER2'),
('tier', 'tier_3', 'VIP Member', 'TIER 3 - VIP Elite subscriber', 'Crown', '#FFFFFF', 'linear-gradient(135deg, #FFBD59 0%, #9C0612 100%)', 'premium-glow', FALSE, 'scanner_tier = TIER3')

ON CONFLICT (badge_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  color = EXCLUDED.color,
  bg_gradient = EXCLUDED.bg_gradient,
  animation = EXCLUDED.animation,
  requirement = EXCLUDED.requirement;
-- Verify tier badges were added
DO $$
DECLARE
  tier_badge_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tier_badge_count
  FROM badge_definitions
  WHERE badge_type = 'tier';

  IF tier_badge_count = 4 THEN
    RAISE NOTICE '✅ Successfully added 4 tier badges (tier_free, tier_1, tier_2, tier_3)';
  ELSE
    RAISE WARNING '⚠️ Expected 4 tier badges but found %', tier_badge_count;
  END IF;
END $$;
