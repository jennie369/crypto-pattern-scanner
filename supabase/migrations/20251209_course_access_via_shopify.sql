-- =============================================
-- COURSE ACCESS VIA SHOPIFY PURCHASE
-- Migration: 20251209_course_access_via_shopify.sql
--
-- Changes course access logic:
-- 1. FREE courses -> accessible by all
-- 2. Courses with shopify_product_id -> requires enrollment (via purchase)
-- 3. Removes tier-based access check
-- =============================================

-- Update check_course_access function
CREATE OR REPLACE FUNCTION check_course_access(
  user_id_param UUID,
  course_id_param TEXT
)
RETURNS TABLE (
  has_access BOOLEAN,
  reason TEXT,
  expires_at TIMESTAMPTZ
) AS $$
DECLARE
  enrollment RECORD;
  course_record RECORD;
BEGIN
  -- Get course
  SELECT * INTO course_record FROM courses WHERE id = course_id_param;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'course_not_found'::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- FREE course (tier_required = 'FREE' or no shopify_product_id with no tier_required)
  IF course_record.tier_required = 'FREE' OR
     (course_record.shopify_product_id IS NULL AND course_record.tier_required IS NULL) THEN
    RETURN QUERY SELECT true, 'free_course'::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Check for admin role - admins always have access
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id_param
    AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
  ) THEN
    RETURN QUERY SELECT true, 'admin_access'::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Check enrollment (created by Shopify webhook or admin grant)
  SELECT * INTO enrollment
  FROM course_enrollments
  WHERE course_enrollments.user_id = user_id_param
  AND course_enrollments.course_id = course_id_param;

  IF NOT FOUND THEN
    -- No enrollment = need to purchase
    RETURN QUERY SELECT false, 'purchase_required'::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Check if enrollment has expired (for courses with duration limit)
  IF enrollment.expires_at IS NOT NULL AND enrollment.expires_at < NOW() THEN
    RETURN QUERY SELECT false, 'enrollment_expired'::TEXT, enrollment.expires_at;
    RETURN;
  END IF;

  -- Has valid enrollment
  RETURN QUERY SELECT true, 'enrolled'::TEXT, enrollment.expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the new logic
COMMENT ON FUNCTION check_course_access(UUID, TEXT) IS
'Check if user has access to a course.
NEW LOGIC (Dec 2024):
- FREE courses or courses without shopify_product_id = accessible by all
- Courses with shopify_product_id = requires enrollment (via Shopify purchase)
- Admin role always has access
- Checks enrollment expiry if applicable';

-- =============================================
-- UPDATE MOBILE courseAccessService to use this logic
-- (The service already calls check_course_access RPC, so it will use new logic automatically)
-- =============================================

-- Grant execute permission (should already exist, but ensure it)
GRANT EXECUTE ON FUNCTION check_course_access(UUID, TEXT) TO authenticated;

-- =============================================
-- SAMPLE: Link existing courses to Shopify products
-- Run these manually in Supabase SQL editor to link courses
-- =============================================

-- Example: Link Trading courses to Shopify products
-- UPDATE courses SET shopify_product_id = '8904646820017' WHERE id = 'course-tier-starter';
-- UPDATE courses SET shopify_product_id = 'YOUR_TIER1_PRODUCT_ID' WHERE id = 'course-tier1-trading';
-- UPDATE courses SET shopify_product_id = 'YOUR_TIER2_PRODUCT_ID' WHERE id = 'course-tier2-trading';
-- UPDATE courses SET shopify_product_id = 'YOUR_TIER3_PRODUCT_ID' WHERE id = 'course-tier3-trading';

-- Example: Link Tư Duy (Mindset) courses
-- UPDATE courses SET shopify_product_id = '8904651342001' WHERE title LIKE '%7 Ngày Khai Mở%';
-- UPDATE courses SET shopify_product_id = '8904653111473' WHERE title LIKE '%Tần Số Tình Yêu%';
-- UPDATE courses SET shopify_product_id = '8904656257201' WHERE title LIKE '%Tư Duy Triệu Phú%';
