-- =============================================
-- Fix RLS Policy for Section Banners
-- Run this in Supabase SQL Editor
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read active section banners" ON section_banners;
DROP POLICY IF EXISTS "Admins can manage section banners" ON section_banners;

-- Create new policies
-- Policy 1: Everyone (including anonymous) can read active banners
CREATE POLICY "Public can read active section banners"
  ON section_banners FOR SELECT
  USING (is_active = true);

-- Policy 2: Admins/Managers can do everything
CREATE POLICY "Admins can manage section banners"
  ON section_banners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Ensure grants are in place
GRANT SELECT ON section_banners TO authenticated;
GRANT SELECT ON section_banners TO anon;
GRANT ALL ON section_banners TO service_role;

-- Test: Check what banners exist
SELECT section_id, title, is_active,
       CASE WHEN image_url IS NOT NULL THEN 'has image' ELSE 'no image' END as has_image,
       link_url
FROM section_banners
ORDER BY section_id;
