-- Simple fix: Update FK to reference profiles for PostgREST join to work
-- Run this in Supabase SQL Editor

-- Step 1: Drop existing constraint on notifications table
ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS notifications_from_user_id_fkey;

-- Step 2: Add new constraint referencing profiles
ALTER TABLE public.notifications
ADD CONSTRAINT notifications_from_user_id_fkey
FOREIGN KEY (from_user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Step 3: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_from_user_id
ON public.notifications(from_user_id);

-- Done! The join should now work:
-- from_user:from_user_id(id, full_name, username, avatar_url)
