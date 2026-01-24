-- ============================================
-- FIX DUPLICATE COURSES - Xóa bản duplicate và publish bản gốc
-- Run this in Supabase SQL Editor
-- ============================================

-- BƯỚC 1: Xem trước các khóa học sẽ bị xóa (duplicates không có dấu)
SELECT id, title, thumbnail_url, is_published, students_count, created_at
FROM courses
WHERE title LIKE 'Khoa hoc%'
  AND (title LIKE '%NGAY KHAI MO TAN SO GOC%'
       OR title LIKE '%KICH HOAT TAN SO TINH YEU%'
       OR title LIKE '%TAI TAO TU DUY TRIEU PHU%');

-- BƯỚC 2: Xem trước các khóa học gốc (có dấu tiếng Việt)
SELECT id, title, thumbnail_url, is_published, students_count, created_at
FROM courses
WHERE title IN ('Tái Tạo Tư Duy Triệu Phú', '7 Ngày Khai Mở Tần Số Gốc', 'Kích Hoạt Tần Số Tình Yêu');

-- ============================================
-- CHẠY SAU KHI ĐÃ XÁC NHẬN ĐÚNG KHÓA HỌC
-- ============================================

-- BƯỚC 3: XÓA các khóa học duplicate (không có dấu tiếng Việt)
-- Xóa lessons trước
DELETE FROM course_lessons
WHERE module_id IN (
  SELECT id FROM course_modules
  WHERE course_id IN (
    SELECT id FROM courses
    WHERE title LIKE 'Khoa hoc%'
      AND (title LIKE '%NGAY KHAI MO TAN SO GOC%'
           OR title LIKE '%KICH HOAT TAN SO TINH YEU%'
           OR title LIKE '%TAI TAO TU DUY TRIEU PHU%')
  )
);

-- Xóa modules
DELETE FROM course_modules
WHERE course_id IN (
  SELECT id FROM courses
  WHERE title LIKE 'Khoa hoc%'
    AND (title LIKE '%NGAY KHAI MO TAN SO GOC%'
         OR title LIKE '%KICH HOAT TAN SO TINH YEU%'
         OR title LIKE '%TAI TAO TU DUY TRIEU PHU%')
);

-- Xóa enrollments (nếu có)
DELETE FROM course_enrollments
WHERE course_id IN (
  SELECT id FROM courses
  WHERE title LIKE 'Khoa hoc%'
    AND (title LIKE '%NGAY KHAI MO TAN SO GOC%'
         OR title LIKE '%KICH HOAT TAN SO TINH YEU%'
         OR title LIKE '%TAI TAO TU DUY TRIEU PHU%')
);

-- Xóa courses duplicate
DELETE FROM courses
WHERE title LIKE 'Khoa hoc%'
  AND (title LIKE '%NGAY KHAI MO TAN SO GOC%'
       OR title LIKE '%KICH HOAT TAN SO TINH YEU%'
       OR title LIKE '%TAI TAO TU DUY TRIEU PHU%');

-- BƯỚC 4: PUBLISH các khóa học gốc
UPDATE courses
SET is_published = true,
    updated_at = NOW()
WHERE title IN ('Tái Tạo Tư Duy Triệu Phú', '7 Ngày Khai Mở Tần Số Gốc', 'Kích Hoạt Tần Số Tình Yêu');

-- BƯỚC 5: Xác nhận kết quả
SELECT id, title, thumbnail_url, is_published, students_count, created_at
FROM courses
WHERE title IN ('Tái Tạo Tư Duy Triệu Phú', '7 Ngày Khai Mở Tần Số Gốc', 'Kích Hoạt Tần Số Tình Yêu')
   OR title LIKE 'Khoa hoc%TAI TAO%'
   OR title LIKE 'Khoa hoc%KHAI MO%'
   OR title LIKE 'Khoa hoc%KICH HOAT%';
