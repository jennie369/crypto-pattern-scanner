-- Add cover_url column to profiles table
-- This allows users to set a cover photo for their profile

-- Check if column exists before adding
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'cover_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN cover_url TEXT;
        COMMENT ON COLUMN profiles.cover_url IS 'URL of the user profile cover photo';
    END IF;
END
$$;

-- Create index for faster lookups (optional)
CREATE INDEX IF NOT EXISTS idx_profiles_cover_url ON profiles(cover_url) WHERE cover_url IS NOT NULL;
