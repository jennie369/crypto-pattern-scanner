-- ============================================================
-- ADD callee_id COLUMN TO CALLS TABLE
-- Date: 2026-01-27
-- Issue: The calls table was missing callee_id column, but
--        RLS policies and app code reference it
-- ============================================================

-- Add callee_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'calls'
    AND column_name = 'callee_id'
  ) THEN
    ALTER TABLE calls ADD COLUMN callee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added callee_id column to calls table';
  ELSE
    RAISE NOTICE 'callee_id column already exists';
  END IF;
END $$;

-- Create index for callee_id lookups
CREATE INDEX IF NOT EXISTS idx_calls_callee_id ON calls(callee_id);

-- Backfill existing calls with callee_id from call_participants
-- This helps fix any existing records that don't have callee_id set
UPDATE calls c
SET callee_id = (
  SELECT cp.user_id
  FROM call_participants cp
  WHERE cp.call_id = c.id
  AND cp.role = 'callee'
  LIMIT 1
)
WHERE c.callee_id IS NULL
AND EXISTS (
  SELECT 1 FROM call_participants cp
  WHERE cp.call_id = c.id
  AND cp.role = 'callee'
);

-- ============================================================
-- Verification
-- ============================================================
SELECT 'callee_id column added/verified!' as status;
