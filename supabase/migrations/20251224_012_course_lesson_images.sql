-- =====================================================
-- GEM MOBILE - COURSE LESSON IMAGES
-- Migration for image management in lessons
-- Date: 2024-12-24
-- =====================================================

-- 1. Tao bang luu thong tin hinh anh
CREATE TABLE IF NOT EXISTS course_lesson_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,

  -- Thong tin hinh anh
  image_url TEXT NOT NULL,
  storage_path TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(50),

  -- Vi tri va hien thi
  position_id VARCHAR(50) NOT NULL,
  section_number INTEGER,
  sort_order INTEGER DEFAULT 0,

  -- Noi dung
  title VARCHAR(200),
  caption TEXT,
  alt_text VARCHAR(300),

  -- Kich thuoc
  width INTEGER,
  height INTEGER,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_lesson_position UNIQUE(lesson_id, position_id)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_lesson_images_lesson
  ON course_lesson_images(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_images_active
  ON course_lesson_images(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_lesson_images_position
  ON course_lesson_images(position_id);
CREATE INDEX IF NOT EXISTS idx_lesson_images_created
  ON course_lesson_images(created_at DESC);

-- 3. Enable RLS
ALTER TABLE course_lesson_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view active images" ON course_lesson_images;
DROP POLICY IF EXISTS "Authenticated users can manage images" ON course_lesson_images;

-- Create RLS Policies
CREATE POLICY "Public can view active images"
  ON course_lesson_images FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage images"
  ON course_lesson_images FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 4. Trigger updated_at
CREATE OR REPLACE FUNCTION update_lesson_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lesson_images_updated_at ON course_lesson_images;
CREATE TRIGGER trigger_lesson_images_updated_at
  BEFORE UPDATE ON course_lesson_images
  FOR EACH ROW
  EXECUTE FUNCTION update_lesson_images_updated_at();

-- 5. Storage Bucket (run separately if bucket already exists)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'course-images',
    'course-images',
    true,
    10485760,  -- 10MB
    ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
  )
  ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,  -- 10MB
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'storage.buckets table not found - run in Supabase Dashboard';
END $$;

-- 6. Storage Policies (run separately if needed)
DO $$
BEGIN
  -- Public view
  DROP POLICY IF EXISTS "Public view course images" ON storage.objects;
  CREATE POLICY "Public view course images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-images');

  -- Auth users upload
  DROP POLICY IF EXISTS "Auth users upload course images" ON storage.objects;
  CREATE POLICY "Auth users upload course images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'course-images' AND auth.role() = 'authenticated');

  -- Auth users update
  DROP POLICY IF EXISTS "Auth users update course images" ON storage.objects;
  CREATE POLICY "Auth users update course images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'course-images' AND auth.role() = 'authenticated');

  -- Auth users delete
  DROP POLICY IF EXISTS "Auth users delete course images" ON storage.objects;
  CREATE POLICY "Auth users delete course images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'course-images' AND auth.role() = 'authenticated');
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'storage.objects table not accessible - configure via Dashboard';
END $$;

-- 7. Comments
COMMENT ON TABLE course_lesson_images IS 'Hinh anh minh hoa cho bai hoc';
COMMENT ON COLUMN course_lesson_images.position_id IS 'ID duy nhat de tham chieu trong HTML (vd: diagram-1, hero-image)';
COMMENT ON COLUMN course_lesson_images.storage_path IS 'Duong dan file trong Supabase Storage';
COMMENT ON COLUMN course_lesson_images.sort_order IS 'Thu tu sap xep trong danh sach';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Migration 20251224_012_course_lesson_images completed';
  RAISE NOTICE 'Created: course_lesson_images table';
  RAISE NOTICE 'Storage: course-images bucket';
  RAISE NOTICE '===========================================';
END $$;
