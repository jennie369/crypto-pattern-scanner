-- =====================================================
-- FIX READING HISTORY POLICIES
-- January 20, 2026
-- Drops and recreates policies to avoid "already exists" error
-- =====================================================

-- Drop existing policies for tarot_readings
DROP POLICY IF EXISTS "Users can view own tarot readings" ON tarot_readings;
DROP POLICY IF EXISTS "Users can insert own tarot readings" ON tarot_readings;
DROP POLICY IF EXISTS "Users can update own tarot readings" ON tarot_readings;
DROP POLICY IF EXISTS "Users can delete own tarot readings" ON tarot_readings;

-- Drop existing policies for iching_readings
DROP POLICY IF EXISTS "Users can view own iching readings" ON iching_readings;
DROP POLICY IF EXISTS "Users can insert own iching readings" ON iching_readings;
DROP POLICY IF EXISTS "Users can update own iching readings" ON iching_readings;
DROP POLICY IF EXISTS "Users can delete own iching readings" ON iching_readings;

-- Recreate RLS Policies - Tarot Readings
CREATE POLICY "Users can view own tarot readings" ON tarot_readings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tarot readings" ON tarot_readings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tarot readings" ON tarot_readings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tarot readings" ON tarot_readings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Recreate RLS Policies - I Ching Readings
CREATE POLICY "Users can view own iching readings" ON iching_readings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own iching readings" ON iching_readings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own iching readings" ON iching_readings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own iching readings" ON iching_readings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✅ Reading history policies recreated successfully!';
END $$;
