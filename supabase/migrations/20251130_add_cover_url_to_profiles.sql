-- ========================================
-- Migration: Add cover_url to profiles table
-- Date: 2024-11-30
-- Purpose: Enable profile cover/banner images (Instagram/TikTok style)
-- ========================================

-- Add cover_url column to profiles table for profile cover/banner images
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.cover_url IS 'URL to user profile cover/banner image';

-- Create storage bucket for cover images if not exists (run in Supabase Dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true)
-- ON CONFLICT DO NOTHING;

-- RLS Policy for covers bucket (run in Supabase Dashboard)
-- CREATE POLICY "Users can upload their own covers" ON storage.objects
-- FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Cover images are publicly accessible" ON storage.objects
-- FOR SELECT USING (bucket_id = 'covers');

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
