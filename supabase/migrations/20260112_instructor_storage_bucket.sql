-- ============================================================================
-- INSTRUCTOR CV STORAGE BUCKET
-- ============================================================================
-- Creates storage bucket for instructor CV uploads and sets up policies

-- Create the storage bucket for instructor CVs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'instructor-cvs',
    'instructor-cvs',
    true,  -- Public so we can access URLs
    10485760,  -- 10MB max file size
    ARRAY['application/pdf']::text[]  -- Only PDF files allowed
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf']::text[];

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can upload instructor CVs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view instructor CVs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete instructor CVs" ON storage.objects;

-- Policy: Anyone can upload CVs (for landing page submissions)
CREATE POLICY "Anyone can upload instructor CVs"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'instructor-cvs');

-- Policy: Anyone can view/download CVs (public bucket)
CREATE POLICY "Anyone can view instructor CVs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'instructor-cvs');

-- Policy: Only admins can delete CVs
CREATE POLICY "Admins can delete instructor CVs"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'instructor-cvs'
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE storage.buckets IS 'Supabase storage buckets';
