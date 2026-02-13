-- ========================================
-- ADD MISSING COLUMNS TO USERS TABLE
-- Created: 2025-01-16
-- Purpose: Add columns expected by service files
-- ========================================

-- Add missing columns to public.users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS online_status TEXT DEFAULT 'offline' CHECK (online_status IN ('online', 'offline', 'away')),
  ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();

-- Create index for online status queries
CREATE INDEX IF NOT EXISTS idx_users_online_status ON public.users(online_status) WHERE online_status = 'online';

-- Create index for last_seen queries
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON public.users(last_seen DESC);

-- Update existing users to sync full_name from display_name
UPDATE public.users
SET full_name = display_name
WHERE full_name IS NULL AND display_name IS NOT NULL;

-- Create trigger to auto-sync full_name from display_name if not set
CREATE OR REPLACE FUNCTION public.sync_full_name_from_display_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.full_name IS NULL AND NEW.display_name IS NOT NULL THEN
    NEW.full_name := NEW.display_name;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_full_name
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_full_name_from_display_name();

-- Force schema reload for PostgREST
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Missing user columns added successfully!';
  RAISE NOTICE '   - full_name (synced from display_name)';
  RAISE NOTICE '   - online_status (default: offline)';
  RAISE NOTICE '   - last_seen (tracks last activity)';
  RAISE NOTICE '🔄 Trigger created to auto-sync full_name from display_name';
END $$;
