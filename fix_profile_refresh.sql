-- =============================================
-- FIX: Profile Refresh Issue
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add missing 'role' column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. Update existing users to have 'user' role if NULL
UPDATE users
SET role = 'user'
WHERE role IS NULL;

-- 3. Re-apply RLS policies for users table
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- 4. Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON daily_scan_quota TO authenticated;
GRANT ALL ON scan_history TO authenticated;
GRANT ALL ON trading_journal TO authenticated;
GRANT ALL ON risk_calculations TO authenticated;

-- 5. Verify your current user
SELECT
  id,
  email,
  full_name,
  tier,
  role,
  created_at
FROM users
WHERE id = auth.uid();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Profile refresh fix applied!';
  RAISE NOTICE '📝 Added role column with default value "user"';
  RAISE NOTICE '🔒 RLS policies re-applied';
  RAISE NOTICE '✅ Permissions granted';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Now try clicking "Refresh Profile" button again!';
END $$;
