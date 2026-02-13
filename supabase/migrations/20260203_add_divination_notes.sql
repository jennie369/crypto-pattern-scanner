-- ============================================================
-- ADD NOTES COLUMN TO DIVINATION_READINGS
-- Migration: 20260203_add_divination_notes.sql
-- Purpose: Allow users to save personal notes on their readings
-- ============================================================

-- Add notes column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'divination_readings'
    AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.divination_readings ADD COLUMN notes TEXT;
    RAISE NOTICE 'Added notes column to divination_readings';
  ELSE
    RAISE NOTICE 'notes column already exists in divination_readings';
  END IF;
END $$;

-- Add starred column for favorites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'divination_readings'
    AND column_name = 'starred'
  ) THEN
    ALTER TABLE public.divination_readings ADD COLUMN starred BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added starred column to divination_readings';
  ELSE
    RAISE NOTICE 'starred column already exists in divination_readings';
  END IF;
END $$;

-- Done
DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'DIVINATION_READINGS TABLE UPDATED';
  RAISE NOTICE 'Added columns: notes (TEXT), starred (BOOLEAN)';
  RAISE NOTICE '============================================================';
END $$;
