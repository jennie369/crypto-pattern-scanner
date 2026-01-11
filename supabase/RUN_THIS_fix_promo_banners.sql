-- Fix promo_banners table schema issues
-- Run this manually in Supabase SQL Editor

-- Option 1: If table exists, alter to allow NULL image_url
ALTER TABLE promo_banners ALTER COLUMN image_url DROP NOT NULL;

-- Insert sample data with image URLs
INSERT INTO promo_banners (title, subtitle, image_url, action_type, action_value, cta_text, sort_order, is_active)
VALUES
  ('Khóa học Trading mới', 'Học giao dịch từ chuyên gia', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800', 'category', 'trading', 'Khám phá ngay', 1, true),
  ('Ưu đãi cuối năm', 'Giảm đến 50% tất cả khóa học', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800', 'screen', 'CourseList', 'Xem ngay', 2, true)
ON CONFLICT DO NOTHING;

-- Check data
SELECT * FROM promo_banners WHERE is_active = true ORDER BY sort_order;
