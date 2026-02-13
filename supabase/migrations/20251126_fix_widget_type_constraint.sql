-- ═══════════════════════════════════════════════════════════
-- GEM Master - Fix Widget Type Constraint
-- Fixes error 23514: violates check constraint "user_widgets_type_check"
-- ═══════════════════════════════════════════════════════════

-- Drop the old type constraint if exists
ALTER TABLE user_widgets DROP CONSTRAINT IF EXISTS user_widgets_widget_type_check;
ALTER TABLE user_widgets DROP CONSTRAINT IF EXISTS user_widgets_type_check;

-- If table uses 'widget_type' column, rename to 'type' for consistency
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_widgets' AND column_name = 'widget_type'
  ) THEN
    -- Rename column
    ALTER TABLE user_widgets RENAME COLUMN widget_type TO type;
  END IF;
END $$;

-- Add new type constraint with all supported widget types
ALTER TABLE user_widgets ADD CONSTRAINT user_widgets_type_check
  CHECK (type IN (
    -- Legacy types
    'price_alert',
    'pattern_watch',
    'portfolio_tracker',
    'daily_reading',
    -- New GEM Master widget types
    'GOAL_CARD',
    'AFFIRMATION_CARD',
    'ACTION_CHECKLIST',
    'CRYSTAL_GRID',
    'CROSS_DOMAIN_CARD',
    'STATS_WIDGET',
    'TRADING_ANALYSIS',
    'PRODUCT_RECOMMENDATION'
  ));

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add 'title' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_widgets' AND column_name = 'title'
  ) THEN
    ALTER TABLE user_widgets ADD COLUMN title VARCHAR(200);
  END IF;

  -- Add 'data' column if using 'widget_data'
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_widgets' AND column_name = 'widget_data'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_widgets' AND column_name = 'data'
  ) THEN
    ALTER TABLE user_widgets RENAME COLUMN widget_data TO data;
  END IF;

  -- Add 'position' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_widgets' AND column_name = 'position'
  ) THEN
    ALTER TABLE user_widgets ADD COLUMN position INTEGER DEFAULT 0;
  END IF;

  -- Add 'is_active' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_widgets' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE user_widgets ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Widget type constraint fixed successfully!';
  RAISE NOTICE 'Supported types: GOAL_CARD, AFFIRMATION_CARD, ACTION_CHECKLIST, CRYSTAL_GRID, CROSS_DOMAIN_CARD, STATS_WIDGET, TRADING_ANALYSIS, PRODUCT_RECOMMENDATION';
END $$;
