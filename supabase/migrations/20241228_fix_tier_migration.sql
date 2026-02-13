-- ============================================================
-- FIX: PARTNERSHIP SYSTEM v3.0 - TIER MIGRATION
-- Date: 2024-12-28
-- Issue: Constraint added before data migration
-- Solution: Drop constraint -> Update data -> Re-add constraint
-- ============================================================

-- ============================================================
-- STEP 1: DROP CONSTRAINTS FIRST (if they exist)
-- ============================================================

ALTER TABLE affiliate_profiles
  DROP CONSTRAINT IF EXISTS affiliate_profiles_ctv_tier_check;

ALTER TABLE affiliate_profiles
  DROP CONSTRAINT IF EXISTS affiliate_profiles_role_check;

-- ============================================================
-- STEP 2: MIGRATE EXISTING TIER VALUES (EN -> VN)
-- Run BEFORE adding new constraints
-- ============================================================

-- beginner -> bronze
UPDATE affiliate_profiles
SET ctv_tier = 'bronze'
WHERE ctv_tier = 'beginner' OR ctv_tier IS NULL;

-- growing -> silver
UPDATE affiliate_profiles
SET ctv_tier = 'silver'
WHERE ctv_tier = 'growing';

-- master -> gold
UPDATE affiliate_profiles
SET ctv_tier = 'gold'
WHERE ctv_tier = 'master';

-- grand -> diamond
UPDATE affiliate_profiles
SET ctv_tier = 'diamond'
WHERE ctv_tier = 'grand';

-- Ensure all NULL tiers are set to bronze
UPDATE affiliate_profiles
SET ctv_tier = 'bronze'
WHERE ctv_tier IS NULL;

-- ============================================================
-- STEP 3: MIGRATE AFFILIATE ROLE TO CTV
-- ============================================================

UPDATE affiliate_profiles
SET role = 'ctv', ctv_tier = 'bronze'
WHERE role = 'affiliate';

-- Ensure all NULL roles are set to ctv
UPDATE affiliate_profiles
SET role = 'ctv'
WHERE role IS NULL;

-- ============================================================
-- STEP 4: VERIFY DATA BEFORE ADDING CONSTRAINTS
-- ============================================================

-- Check for any invalid tiers remaining
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM affiliate_profiles
  WHERE ctv_tier NOT IN ('bronze', 'silver', 'gold', 'platinum', 'diamond');

  IF invalid_count > 0 THEN
    -- Force update any remaining invalid tiers to bronze
    UPDATE affiliate_profiles
    SET ctv_tier = 'bronze'
    WHERE ctv_tier NOT IN ('bronze', 'silver', 'gold', 'platinum', 'diamond');

    RAISE NOTICE 'Fixed % invalid tier values', invalid_count;
  END IF;
END $$;

-- Check for any invalid roles remaining
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM affiliate_profiles
  WHERE role NOT IN ('ctv', 'kol');

  IF invalid_count > 0 THEN
    -- Force update any remaining invalid roles to ctv
    UPDATE affiliate_profiles
    SET role = 'ctv'
    WHERE role NOT IN ('ctv', 'kol');

    RAISE NOTICE 'Fixed % invalid role values', invalid_count;
  END IF;
END $$;

-- ============================================================
-- STEP 5: NOW ADD NEW CONSTRAINTS
-- ============================================================

-- Add tier constraint (5 VN tiers)
ALTER TABLE affiliate_profiles
  ADD CONSTRAINT affiliate_profiles_ctv_tier_check
  CHECK (ctv_tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond'));

-- Add role constraint
ALTER TABLE affiliate_profiles
  ADD CONSTRAINT affiliate_profiles_role_check
  CHECK (role IN ('ctv', 'kol'));

-- ============================================================
-- STEP 6: ADD NEW COLUMNS (if not exists)
-- ============================================================

ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);

ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS sub_affiliate_earnings DECIMAL(15,2) DEFAULT 0;

ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS monthly_sales DECIMAL(15,2) DEFAULT 0;

ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS last_tier_check_at TIMESTAMPTZ;

ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS last_upgrade_at TIMESTAMPTZ;

ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS last_downgrade_at TIMESTAMPTZ;

ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS payment_schedule VARCHAR(20) DEFAULT 'monthly';

ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS resource_access_level VARCHAR(20) DEFAULT 'basic';

ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS is_kol BOOLEAN DEFAULT FALSE;

ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS kol_approved_at TIMESTAMPTZ;

-- ============================================================
-- STEP 7: CREATE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_referred_by
  ON affiliate_profiles(referred_by);

CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_tier
  ON affiliate_profiles(ctv_tier);

CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_role
  ON affiliate_profiles(role);

-- ============================================================
-- VERIFICATION QUERY (run to check)
-- ============================================================
-- SELECT ctv_tier, role, COUNT(*)
-- FROM affiliate_profiles
-- GROUP BY ctv_tier, role;

SELECT 'Migration completed successfully!' as status;
