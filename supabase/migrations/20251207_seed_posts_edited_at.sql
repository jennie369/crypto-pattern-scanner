-- ============================================
-- Add edited_at column to seed_posts table
-- This allows tracking when seed posts are edited
-- ============================================

-- Add edited_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seed_posts'
    AND column_name = 'edited_at'
  ) THEN
    ALTER TABLE seed_posts ADD COLUMN edited_at TIMESTAMPTZ;
    RAISE NOTICE 'Added edited_at column to seed_posts';
  ELSE
    RAISE NOTICE 'edited_at column already exists in seed_posts';
  END IF;
END $$;

-- Create index for faster queries on edited posts
CREATE INDEX IF NOT EXISTS idx_seed_posts_edited_at
ON seed_posts(edited_at)
WHERE edited_at IS NOT NULL;
