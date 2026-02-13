-- =============================================
-- SYNC COURSE THUMBNAILS FROM SHOPIFY
-- Run this SQL to manually update course thumbnails from Shopify products
-- =============================================

-- This script updates courses.thumbnail_url from shopify_products table
-- (Assuming shopify_products table has been synced with Shopify data)

-- Step 1: Check current state - courses with Shopify product IDs
SELECT
    c.id,
    c.title,
    c.shopify_product_id,
    c.thumbnail_url as current_thumbnail,
    sp.image_url as shopify_image,
    sp.synced_at as shopify_last_sync
FROM courses c
LEFT JOIN shopify_products sp ON c.shopify_product_id = sp.shopify_product_id
WHERE c.shopify_product_id IS NOT NULL
ORDER BY c.title;

-- Step 2: Update course thumbnails from shopify_products table
-- Only updates if there's a matching product with an image
UPDATE courses c
SET
    thumbnail_url = sp.image_url,
    updated_at = NOW()
FROM shopify_products sp
WHERE c.shopify_product_id = sp.shopify_product_id
  AND sp.image_url IS NOT NULL
  AND sp.image_url != ''
  AND (c.thumbnail_url IS NULL OR c.thumbnail_url != sp.image_url);

-- Step 3: Verify results
SELECT
    c.id,
    c.title,
    c.shopify_product_id,
    c.thumbnail_url,
    c.updated_at
FROM courses c
WHERE c.shopify_product_id IS NOT NULL
ORDER BY c.updated_at DESC;

-- =============================================
-- NOTES:
-- =============================================
-- 1. This requires shopify_products table to be synced first
-- 2. Run this after updating products in Shopify
-- 3. To sync shopify_products, call the Edge Function:
--    POST /functions/v1/shopify-products
--    { "action": "getProducts", "limit": 100, "syncToDb": true }
-- =============================================
