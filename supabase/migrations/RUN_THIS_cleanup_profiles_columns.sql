-- =====================================================
-- CLEANUP PROFILES COLUMNS
-- Date: 2025-12-11
-- 1. Sync 'tier' column with 'scanner_tier' (keep for view compatibility)
-- 2. Set default badges for users
-- =====================================================

-- =====================================================
-- STEP 1: SYNC 'tier' COLUMN WITH 'scanner_tier'
-- =====================================================

-- The 'tier' column is used by all_users_view - keep it but sync with scanner_tier
-- Update tier to match scanner_tier for consistency
UPDATE public.profiles
SET tier = LOWER(COALESCE(scanner_tier, 'FREE'))
WHERE tier IS NULL OR tier = 'free' OR tier != LOWER(COALESCE(scanner_tier, 'FREE'));

-- Update view to use scanner_tier instead of tier
DROP VIEW IF EXISTS all_users_view CASCADE;

CREATE OR REPLACE VIEW all_users_view AS
SELECT
  id,
  email,
  full_name,
  avatar_url,
  bio,
  COALESCE(location, '') as location,
  COALESCE(LOWER(scanner_tier), 'free') as tier,
  COALESCE(followers_count, 0) as followers_count,
  COALESCE(following_count, 0) as following_count,
  false as is_seed_user,
  NULL::VARCHAR as seed_persona,
  false as is_premium_seed,
  created_at,
  updated_at
FROM profiles
UNION ALL
SELECT
  id,
  email,
  full_name,
  avatar_url,
  bio,
  COALESCE(location, '') as location,
  COALESCE(tier, 'free') as tier,
  COALESCE(followers_count, 0) as followers_count,
  COALESCE(following_count, 0) as following_count,
  true as is_seed_user,
  seed_persona,
  is_premium_seed,
  created_at,
  updated_at
FROM seed_users;

-- Grant permissions on view
GRANT SELECT ON all_users_view TO authenticated;
GRANT SELECT ON all_users_view TO anon;

-- =====================================================
-- STEP 2: SET DEFAULT level_badge FOR ALL USERS
-- =====================================================

-- Set level_badge = 'bronze' for users who don't have one
UPDATE public.profiles
SET level_badge = 'bronze'
WHERE level_badge IS NULL;

-- Set default value for future users
ALTER TABLE public.profiles ALTER COLUMN level_badge SET DEFAULT 'bronze';

-- =====================================================
-- STEP 3: SET role_badge BASED ON ROLE
-- =====================================================

-- Admin users get 'admin' role_badge
UPDATE public.profiles
SET role_badge = 'admin'
WHERE (role = 'admin' OR is_admin = true OR scanner_tier = 'ADMIN' OR chatbot_tier = 'ADMIN')
  AND (role_badge IS NULL OR role_badge = '');

-- Moderator users
UPDATE public.profiles
SET role_badge = 'moderator'
WHERE role = 'moderator' AND (role_badge IS NULL OR role_badge = '');

-- Mentor/Teacher users
UPDATE public.profiles
SET role_badge = 'mentor'
WHERE role IN ('mentor', 'teacher') AND (role_badge IS NULL OR role_badge = '');

-- =====================================================
-- STEP 4: SET achievement_badges FOR EARLY ADOPTERS
-- =====================================================

-- Give 'early_adopter' badge to users who registered early (first 100 users)
UPDATE public.profiles
SET achievement_badges = ARRAY['early_adopter']
WHERE achievement_badges IS NULL
  AND id IN (
    SELECT id FROM public.profiles
    ORDER BY created_at ASC
    LIMIT 100
  );

-- =====================================================
-- STEP 5: ENSURE ADMIN USER HAS CORRECT BADGES
-- =====================================================

-- Make sure your admin account has all the right values
-- Replace with your actual admin email if needed
UPDATE public.profiles
SET
  role = 'admin',
  is_admin = true,
  role_badge = 'admin',
  level_badge = COALESCE(level_badge, 'diamond'),
  scanner_tier = 'ADMIN',
  chatbot_tier = 'ADMIN',
  course_tier = 'ADMIN'
WHERE email LIKE '%@gemholdingofficial%'
   OR email LIKE '%admin%'
   OR is_admin = true
   OR role = 'admin';

-- =====================================================
-- STEP 6: VERIFY CHANGES
-- =====================================================

SELECT
  id,
  email,
  role,
  is_admin,
  scanner_tier,
  chatbot_tier,
  level_badge,
  role_badge,
  achievement_badges
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;
