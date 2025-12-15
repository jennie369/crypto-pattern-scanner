-- Fix RLS policy for sponsor_banners to match DATABASE_SCHEMA.md admin check pattern
-- Problem: role in profiles can be 'admin' or 'ADMIN', policy should check both

-- Drop existing admin policy
DROP POLICY IF EXISTS "Admins can manage banners" ON sponsor_banners;

-- Create new policy matching DATABASE_SCHEMA.md admin check pattern
-- Check: is_admin = TRUE OR role = 'admin' OR role = 'ADMIN' OR scanner_tier = 'ADMIN' OR chatbot_tier = 'ADMIN'
CREATE POLICY "Admins can manage banners" ON sponsor_banners
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.is_admin = TRUE OR
        profiles.role = 'admin' OR
        profiles.role = 'ADMIN' OR
        profiles.scanner_tier = 'ADMIN' OR
        profiles.chatbot_tier = 'ADMIN'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.is_admin = TRUE OR
        profiles.role = 'admin' OR
        profiles.role = 'ADMIN' OR
        profiles.scanner_tier = 'ADMIN' OR
        profiles.chatbot_tier = 'ADMIN'
      )
    )
  );

-- Also add a policy for admins to SELECT all banners (not just active ones)
DROP POLICY IF EXISTS "Admins can view all banners" ON sponsor_banners;
CREATE POLICY "Admins can view all banners" ON sponsor_banners
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.is_admin = TRUE OR
        profiles.role = 'admin' OR
        profiles.role = 'ADMIN' OR
        profiles.scanner_tier = 'ADMIN' OR
        profiles.chatbot_tier = 'ADMIN'
      )
    )
  );
