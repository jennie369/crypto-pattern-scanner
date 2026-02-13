-- =====================================================
-- FIX WITHDRAWAL_REQUESTS FK TO REFERENCE PROFILES
-- Date: 2025-11-28
-- Problem: withdrawal_requests.partner_id references auth.users(id)
--          but the join query references profiles table
-- Error: PGRST200 - Could not find a relationship between
--        'withdrawal_requests' and 'partner_id' in the schema cache
-- =====================================================

-- STEP 1: Drop the old FK constraint (references auth.users)
ALTER TABLE withdrawal_requests
DROP CONSTRAINT IF EXISTS withdrawal_requests_partner_id_fkey;

-- STEP 2: Add new FK constraint (references profiles.id)
-- This enables Supabase PostgREST to auto-detect the relationship for joins
ALTER TABLE withdrawal_requests
ADD CONSTRAINT withdrawal_requests_partner_id_fkey
FOREIGN KEY (partner_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- STEP 3: Ensure profiles has all required columns for the join
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'affiliate_code') THEN
    ALTER TABLE profiles ADD COLUMN affiliate_code VARCHAR(20) UNIQUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'partnership_role') THEN
    ALTER TABLE profiles ADD COLUMN partnership_role VARCHAR(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'ctv_tier') THEN
    ALTER TABLE profiles ADD COLUMN ctv_tier INTEGER DEFAULT 1;
  END IF;
END $$;

-- STEP 4: Also fix partnership_applications FK if needed
ALTER TABLE partnership_applications
DROP CONSTRAINT IF EXISTS partnership_applications_user_id_fkey;

ALTER TABLE partnership_applications
ADD CONSTRAINT partnership_applications_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- STEP 5: Verification
SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('withdrawal_requests', 'partnership_applications')
  AND kcu.column_name IN ('partner_id', 'user_id');
