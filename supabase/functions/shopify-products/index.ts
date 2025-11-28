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

  return {
    shopify_product_id: shopifyProduct.id.toString(),
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
    inventory_quantity: firstVariant?.inventory_quantity || 0,
    inventory_policy: firstVariant?.inventory_policy || 'deny',

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

    const { action, productId, handle, limit = 50, syncToDb = false, query } = await req.json();

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
    else if (action === 'getProduct' && productId) {
      console.log(`📦 Fetching product ${productId} from Shopify...`);

      shopifyUrl = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products/${productId}.json`;

      const response = await fetch(shopifyUrl, {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Product not found: ${productId}`);
      }

      shopifyData = await response.json();
      const product = transformProduct(shopifyData.product);

      console.log(`✅ Fetched product: ${product.title}`);

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

      if (dbProduct && !dbError) {
        console.log('✅ Found product in database');
        return new Response(JSON.stringify({
          success: true,
          product: dbProduct,
          source: 'database'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
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
    // INVALID ACTION
    // ==============================================
    else {
      throw new Error(`Invalid action: ${action}. Valid actions: getProducts, getProduct, getProductByHandle, search`);
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
   ============================================== */
