// =====================================================
// SHOPIFY PRODUCTS EDGE FUNCTION
// =====================================================
// Purpose: Fetch products from Shopify Admin API (no CORS!)
// Endpoint: POST /functions/v1/shopify-products
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Environment variables
const SHOPIFY_DOMAIN = Deno.env.get('SHOPIFY_DOMAIN')!;
const SHOPIFY_ADMIN_TOKEN = Deno.env.get('SHOPIFY_ADMIN_TOKEN')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
};

// Helper: Transform Shopify product to our format
function transformProduct(shopifyProduct: any) {
  const firstVariant = shopifyProduct.variants?.[0];
  const productId = shopifyProduct.id.toString();

  return {
    // IMPORTANT: Include both `id` and `shopify_product_id` for compatibility
    // Many components (WishlistButton, CartContext) expect `id` field
    id: productId,
    shopify_product_id: productId,
    title: shopifyProduct.title,
    description: shopifyProduct.body_html?.replace(/<[^>]*>/g, ''), // Strip HTML
    description_html: shopifyProduct.body_html,
    handle: shopifyProduct.handle,
    product_type: shopifyProduct.product_type || null,
    vendor: shopifyProduct.vendor || 'Yinyang Masters',
    tags: shopifyProduct.tags ? shopifyProduct.tags.split(', ') : [],

    price: firstVariant ? parseFloat(firstVariant.price) : 0,
    compare_at_price: firstVariant?.compare_at_price
      ? parseFloat(firstVariant.compare_at_price)
      : null,
    currency: 'VND',

    image_url: shopifyProduct.image?.src || shopifyProduct.images?.[0]?.src || null,
    images: shopifyProduct.images || [],

    variants: shopifyProduct.variants || [],
    options: shopifyProduct.options || [],

    status: shopifyProduct.status || 'active',
    inventory_quantity: firstVariant?.inventory_quantity ?? null,
    inventory_policy: firstVariant?.inventory_policy || 'deny',

    // availableForSale logic:
    // 1. Digital products (no inventory tracking) - always available
    // 2. Physical products with inventory > 0 - available
    // 3. Products with policy 'continue' (allow overselling) - available
    // 4. Products with null/undefined inventory - assume available (digital)
    availableForSale:
      firstVariant?.inventory_quantity === null ||
      firstVariant?.inventory_quantity === undefined ||
      firstVariant?.inventory_quantity > 0 ||
      firstVariant?.inventory_policy === 'continue' ||
      firstVariant?.inventory_management === null, // No inventory tracking = digital

    published_at: shopifyProduct.published_at || null,
    synced_at: new Date().toISOString(),
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🛍️ Shopify Products API called');

    const { action, productId, id, handle, limit = 50, syncToDb = false, query } = await req.json();
    // Support both 'productId' and 'id' parameter names
    const resolvedProductId = productId || id;

    let shopifyUrl = '';
    let shopifyData: any;

    // ==============================================
    // ACTION: GET ALL PRODUCTS
    // ==============================================
    if (action === 'getProducts') {
      console.log(`📦 Fetching ${limit} products from Shopify...`);

      shopifyUrl = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products.json?limit=${limit}&status=active`;

      const response = await fetch(shopifyUrl, {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Shopify API error: ${response.status} - ${error}`);
      }

      shopifyData = await response.json();

      // Transform products to our format
      const products = shopifyData.products.map(transformProduct);

      console.log(`✅ Fetched ${products.length} products`);

      // Optional: Sync to database
      if (syncToDb) {
        console.log('💾 Syncing products to database...');
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        for (const product of products) {
          await supabase
            .from('shopify_products')
            .upsert(product, {
              onConflict: 'shopify_product_id',
            });
        }

        console.log('✅ Products synced to database');
      }

      return new Response(JSON.stringify({
        success: true,
        products,
        count: products.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ==============================================
    // ACTION: GET SINGLE PRODUCT BY ID
    // ==============================================
    else if ((action === 'getProduct' || action === 'getProductById') && resolvedProductId) {
      console.log(`📦 Fetching product ${resolvedProductId} from Shopify...`);

      shopifyUrl = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products/${resolvedProductId}.json`;

      const response = await fetch(shopifyUrl, {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Product not found: ${resolvedProductId}`);
      }

      shopifyData = await response.json();
      const product = transformProduct(shopifyData.product);

      // Save to database for caching (with description_html)
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      await supabase.from('shopify_products').upsert(product, {
        onConflict: 'shopify_product_id',
      });

      console.log(`✅ Fetched and saved product: ${product.title}`);

      return new Response(JSON.stringify({
        success: true,
        product
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ==============================================
    // ACTION: GET PRODUCT BY HANDLE
    // ==============================================
    else if (action === 'getProductByHandle' && handle) {
      console.log(`📦 Fetching product with handle: ${handle}`);

      // First check database
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      const { data: dbProduct, error: dbError } = await supabase
        .from('shopify_products')
        .select('*')
        .eq('handle', handle)
        .single();

      // Check if DB cache is fresh (synced within last 1 hour)
      const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
      const isCacheFresh = dbProduct?.synced_at &&
        (new Date().getTime() - new Date(dbProduct.synced_at).getTime()) < CACHE_DURATION_MS;

      // Only use DB cache if: has description_html AND synced recently
      if (dbProduct && !dbError && dbProduct.description_html && isCacheFresh) {
        console.log('✅ Found fresh product in database (synced within 1 hour)');
        return new Response(JSON.stringify({
          success: true,
          product: dbProduct,
          source: 'database'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // DB cache is stale or missing data - fetch fresh
      if (dbProduct) {
        const reason = !dbProduct.description_html ? 'missing description_html' : 'cache expired';
        console.log(`⚠️ DB product stale (${reason}), fetching fresh from Shopify...`);
      }

      // If not in database, fetch from Shopify
      console.log('📡 Product not in DB, fetching from Shopify...');

      // Unfortunately Shopify Admin API doesn't support handle lookup directly
      // So we need to fetch all products and filter (or use GraphQL)
      shopifyUrl = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products.json?handle=${handle}&limit=1`;

      const response = await fetch(shopifyUrl, {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      shopifyData = await response.json();

      if (shopifyData.products && shopifyData.products.length > 0) {
        const product = transformProduct(shopifyData.products[0]);

        // Save to database for next time
        await supabase.from('shopify_products').upsert(product);

        console.log(`✅ Fetched and saved product: ${product.title}`);

        return new Response(JSON.stringify({
          success: true,
          product,
          source: 'shopify'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`Product not found with handle: ${handle}`);
    }

    // ==============================================
    // ACTION: SEARCH PRODUCTS
    // ==============================================
    else if (action === 'search') {
      console.log(`🔍 Searching products: ${query}`);

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      const { data: products, error } = await supabase
        .from('shopify_products')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('status', 'active')
        .limit(20);

      if (error) throw error;

      console.log(`✅ Found ${products?.length || 0} matching products`);

      return new Response(JSON.stringify({
        success: true,
        products: products || [],
        count: products?.length || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ==============================================
    // ACTION: SYNC COURSE THUMBNAILS FROM SHOPIFY
    // ==============================================
    else if (action === 'syncCourseThumbnails') {
      console.log('🔄 Syncing course thumbnails from Shopify...');

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      // Get all courses with shopify_product_id
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, shopify_product_id, thumbnail_url')
        .not('shopify_product_id', 'is', null);

      if (coursesError) {
        throw new Error(`Failed to fetch courses: ${coursesError.message}`);
      }

      console.log(`📚 Found ${courses?.length || 0} courses with Shopify product IDs`);

      const results: any[] = [];
      let updated = 0;
      let failed = 0;

      for (const course of courses || []) {
        try {
          console.log(`📦 Fetching product ${course.shopify_product_id} for course: ${course.title}`);

          // Fetch product from Shopify Admin API
          const productUrl = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products/${course.shopify_product_id}.json`;

          const response = await fetch(productUrl, {
            headers: {
              'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            console.warn(`⚠️ Product not found: ${course.shopify_product_id}`);
            results.push({
              course_id: course.id,
              title: course.title,
              status: 'product_not_found',
              shopify_product_id: course.shopify_product_id,
            });
            failed++;
            continue;
          }

          const productData = await response.json();
          const imageUrl = productData.product?.image?.src || productData.product?.images?.[0]?.src;

          if (!imageUrl) {
            console.warn(`⚠️ No image for product: ${course.shopify_product_id}`);
            results.push({
              course_id: course.id,
              title: course.title,
              status: 'no_image',
              shopify_product_id: course.shopify_product_id,
            });
            failed++;
            continue;
          }

          // Update course thumbnail_url
          const { error: updateError } = await supabase
            .from('courses')
            .update({
              thumbnail_url: imageUrl,
              updated_at: new Date().toISOString(),
            })
            .eq('id', course.id);

          if (updateError) {
            console.error(`❌ Failed to update course ${course.id}: ${updateError.message}`);
            results.push({
              course_id: course.id,
              title: course.title,
              status: 'update_failed',
              error: updateError.message,
            });
            failed++;
            continue;
          }

          console.log(`✅ Updated: ${course.title}`);
          results.push({
            course_id: course.id,
            title: course.title,
            status: 'updated',
            old_thumbnail: course.thumbnail_url,
            new_thumbnail: imageUrl,
          });
          updated++;

        } catch (err) {
          console.error(`❌ Error processing course ${course.id}:`, err);
          results.push({
            course_id: course.id,
            title: course.title,
            status: 'error',
            error: err instanceof Error ? err.message : String(err),
          });
          failed++;
        }
      }

      console.log(`✅ Sync complete: ${updated} updated, ${failed} failed`);

      return new Response(JSON.stringify({
        success: true,
        summary: {
          total: courses?.length || 0,
          updated,
          failed,
        },
        results,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ==============================================
    // INVALID ACTION
    // ==============================================
    else {
      throw new Error(`Invalid action: ${action}. Valid actions: getProducts, getProduct, getProductByHandle, search, syncCourseThumbnails`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/* ==============================================
   USAGE EXAMPLES
   ==============================================

   1. Get all products:
   POST /functions/v1/shopify-products
   {
     "action": "getProducts",
     "limit": 50,
     "syncToDb": true
   }

   2. Get single product by ID:
   POST /functions/v1/shopify-products
   {
     "action": "getProduct",
     "productId": "1234567890"
   }

   3. Get product by handle:
   POST /functions/v1/shopify-products
   {
     "action": "getProductByHandle",
     "handle": "crystal-amethyst"
   }

   4. Search products:
   POST /functions/v1/shopify-products
   {
     "action": "search",
     "query": "crystal"
   }

   5. Sync course thumbnails from Shopify:
   POST /functions/v1/shopify-products
   {
     "action": "syncCourseThumbnails"
   }
   ============================================== */
