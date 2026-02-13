-- Migration: Add missing columns to forum_notifications for Facebook-style display
-- This adds from_user_id, body, and data columns to match the notifications table structure

-- Add from_user_id column for tracking who triggered the notification
-- References profiles(id) directly to allow PostgREST join syntax
ALTER TABLE public.forum_notifications
ADD COLUMN IF NOT EXISTS from_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add body column (forum_notifications uses 'message', but forumService sends 'body')
-- We'll use a trigger to sync message and body
ALTER TABLE public.forum_notifications
ADD COLUMN IF NOT EXISTS body TEXT;

-- Add data column for additional metadata
ALTER TABLE public.forum_notifications
ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';

-- Create index for from_user_id
CREATE INDEX IF NOT EXISTS idx_forum_notifications_from_user
ON public.forum_notifications(from_user_id);

-- Sync message to body for existing records
UPDATE public.forum_notifications
SET body = message
WHERE body IS NULL AND message IS NOT NULL;

-- Create a trigger to keep message and body in sync
CREATE OR REPLACE FUNCTION sync_forum_notification_body()
RETURNS TRIGGER AS $$
BEGIN
  -- If body is set but message is not, copy body to message
  IF NEW.body IS NOT NULL AND NEW.message IS NULL THEN
    NEW.message := NEW.body;
  END IF;
  -- If message is set but body is not, copy message to body
  IF NEW.message IS NOT NULL AND NEW.body IS NULL THEN
    NEW.body := NEW.message;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_forum_notification_body ON public.forum_notifications;
CREATE TRIGGER trg_sync_forum_notification_body
BEFORE INSERT OR UPDATE ON public.forum_notifications
FOR EACH ROW EXECUTE FUNCTION sync_forum_notification_body();

-- Grant permissions
GRANT SELECT ON public.forum_notifications TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.forum_notifications TO authenticated;

-- ==============================================
-- Also fix notifications table FK to reference profiles
-- ==============================================

-- Drop existing FK constraint if it references auth.users
DO $$
BEGIN
  -- Check if constraint exists and drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'notifications_from_user_id_fkey'
    AND table_name = 'notifications'
  ) THEN
    ALTER TABLE public.notifications DROP CONSTRAINT notifications_from_user_id_fkey;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore if constraint doesn't exist
  NULL;
END $$;

-- Add FK to profiles for PostgREST join support
DO $$
BEGIN
  ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_from_user_id_fkey
  FOREIGN KEY (from_user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN
  -- Constraint already exists
  NULL;
END $$;

-- Create index if not exists
CREATE INDEX IF NOT EXISTS idx_notifications_from_user
ON public.notifications(from_user_id);

-- Add foreign key relationship hint for PostgREST
-- This allows the join: from_user:from_user_id(id, full_name, username, avatar_url)
COMMENT ON COLUMN public.forum_notifications.from_user_id IS
'References profiles(id) for the user who triggered this notification';
COMMENT ON COLUMN public.notifications.from_user_id IS
'References profiles(id) for the user who triggered this notification';
