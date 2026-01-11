-- =====================================================
-- Fix: Set default tier_required for courses with NULL
-- This ensures consistent behavior across web and mobile
-- Date: 2024-12-25
-- =====================================================

-- Update courses with NULL tier_required to 'FREE'
UPDATE courses
SET tier_required = 'FREE'
WHERE tier_required IS NULL;

-- Also set default for future courses
ALTER TABLE courses
  ALTER COLUMN tier_required SET DEFAULT 'FREE';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Migration 20251225_015 completed';
  RAISE NOTICE 'Fixed: courses.tier_required NULL -> FREE';
  RAISE NOTICE '=========================================';
END $$;
