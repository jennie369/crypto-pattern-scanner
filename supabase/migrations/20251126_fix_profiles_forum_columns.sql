-- =====================================================
-- FIX PROFILES COLUMNS FOR FORUM
-- Date: 2025-11-26
-- Problem: Forum posts not showing because profiles missing columns
-- =====================================================

-- Add missing columns used by forum queries
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_seller BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_trader BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level_badge TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_badge TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS achievement_badges TEXT[];

-- Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('verified_seller', 'verified_trader', 'level_badge', 'role_badge', 'achievement_badges')
ORDER BY column_name;
