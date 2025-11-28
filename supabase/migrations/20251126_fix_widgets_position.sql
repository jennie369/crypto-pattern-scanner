-- ═══════════════════════════════════════════════════════════
-- GEM Platform - Fix: Add position column to user_widgets
-- Day 17-19: Dashboard Widgets Fix
-- ═══════════════════════════════════════════════════════════

-- Check if user_widgets table exists and add position column if missing
DO $$
BEGIN
  -- Add position column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_widgets' AND column_name = 'position'
  ) THEN
    ALTER TABLE user_widgets ADD COLUMN position INTEGER DEFAULT 0;
    RAISE NOTICE 'Added position column to user_widgets table';
  END IF;

  -- Add type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_widgets' AND column_name = 'type'
  ) THEN
    ALTER TABLE user_widgets ADD COLUMN type VARCHAR(50);
    RAISE NOTICE 'Added type column to user_widgets table';
  END IF;

  -- Add title column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_widgets' AND column_name = 'title'
  ) THEN
    ALTER TABLE user_widgets ADD COLUMN title VARCHAR(200);
    RAISE NOTICE 'Added title column to user_widgets table';
  END IF;

  -- Add data column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_widgets' AND column_name = 'data'
  ) THEN
    ALTER TABLE user_widgets ADD COLUMN data JSONB DEFAULT '{}';
    RAISE NOTICE 'Added data column to user_widgets table';
  END IF;

  -- Add is_active column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_widgets' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE user_widgets ADD COLUMN is_active BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added is_active column to user_widgets table';
  END IF;

  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_widgets' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE user_widgets ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added created_at column to user_widgets table';
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_widgets' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE user_widgets ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column to user_widgets table';
  END IF;

END $$;

-- Create index on position if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_widgets_position ON user_widgets(user_id, position);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'user_widgets table fix completed successfully!';
END $$;
