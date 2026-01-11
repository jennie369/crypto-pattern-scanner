// ============================================================
// SHOPIFY ORDER PAID WEBHOOK
// Trigger: Shopify orders/paid
// Purpose: Unlock access khi order được mark as paid
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Shopify-Hmac-Sha256, X-Shopify-Topic, X-Shopify-Shop-Domain',
};

// Product tag to tier mapping
const PRODUCT_TAG_MAPPING: Record<string, { type: string; tier: number }> = {
  'scanner-tier1': { type: 'scanner', tier: 1 },
  'scanner-tier2': { type: 'scanner', tier: 2 },
  'scanner-tier3': { type: 'scanner', tier: 3 },
  'course-tier1': { type: 'course', tier: 1 },
  'course-tier2': { type: 'course', tier: 2 },
  'course-tier3': { type: 'course', tier: 3 },
  'chatbot-tier1': { type: 'chatbot', tier: 1 },
  'chatbot-tier2': { type: 'chatbot', tier: 2 },
  'chatbot-tier3': { type: 'chatbot', tier: 3 },
  'gem-pack-100': { type: 'gems', tier: 100 },
  'gem-pack-500': { type: 'gems', tier: 500 },
  'gem-pack-1000': { type: 'gems', tier: 1000 },
  'gem-pack-5000': { type: 'gems', tier: 5000 },
};

// Verify Shopify webhook
function verifyShopifyWebhook(body: string, hmacHeader: string): boolean {
  const secret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET');
  if (!secret) {
    console.error('[Shopify Paid Webhook] Missing SHOPIFY_WEBHOOK_SECRET');
    return false;
  }

  const hash = createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  return hash === hmacHeader;
}

// Parse product tags to determine access
function parseProductTags(tags: string): { type: string; tier: number } | null {
  if (!tags) return null;

  const tagArray = tags.split(',').map(t => t.trim().toLowerCase());

  for (const tag of tagArray) {
    if (PRODUCT_TAG_MAPPING[tag]) {
      return PRODUCT_TAG_MAPPING[tag];
    }
  }
  return null;
}

// Parse SKU for tier info
function parseProductSku(sku: string): { type: string; tier: number } | null {
  if (!sku) return null;

  const skuLower = sku.toLowerCase();

  // Scanner tiers
  if (skuLower.includes('scanner-tier') || skuLower.includes('gem-scanner')) {
    const tierMatch = skuLower.match(/tier(\d)/);
    if (tierMatch) {
      return { type: 'scanner', tier: parseInt(tierMatch[1]) };
    }
    return { type: 'scanner', tier: 1 };
  }

  // Course tiers
  if (skuLower.includes('course-tier')) {
    const tierMatch = skuLower.match(/tier(\d)/);
    if (tierMatch) {
      return { type: 'course', tier: parseInt(tierMatch[1]) };
    }
    return { type: 'course', tier: 1 };
  }

  // Chatbot tiers
  if (skuLower.includes('chatbot-tier') || skuLower.includes('gem-chatbot')) {
    const tierMatch = skuLower.match(/tier(\d)/);
    if (tierMatch) {
      return { type: 'chatbot', tier: parseInt(tierMatch[1]) };
    }
    return { type: 'chatbot', tier: 1 };
  }

  // Gem packs
  if (skuLower.includes('gem-pack')) {
    const amountMatch = skuLower.match(/(\d+)/);
    if (amountMatch) {
      return { type: 'gems', tier: parseInt(amountMatch[1]) };
    }
  }

  return null;
}

// NOTE: Shopify automatically sends payment confirmation emails
// No need to send duplicate emails via Resend
// See: Shopify Admin > Settings > Notifications

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify webhook
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
    const body = await req.text();

    if (!hmacHeader || !verifyShopifyWebhook(body, hmacHeader)) {
      console.error('[Shopify Paid Webhook] Invalid signature');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const order = JSON.parse(body);
    console.log('[Shopify Paid Webhook] Order paid:', order.order_number);

    const customerEmail = order.email;
    const orderNumber = order.order_number.toString();

    // Update pending_payment status (if exists)
    await supabase
      .from('pending_payments')
      .update({
        payment_status: 'paid',
        verified_at: new Date().toISOString(),
        verification_method: 'shopify',
      })
      .eq('order_number', orderNumber);

    // Process line items and unlock access
    let scannerTier = 0;
    let courseTier = 0;
    let chatbotTier = 0;
    let gemsToAdd = 0;
    const enrolledCourses: string[] = [];

    for (const item of order.line_items || []) {
      // Try tags first
      const productTags = item.product?.tags || item.tags || '';
      let accessInfo = parseProductTags(productTags);

      // If no tags, try SKU
      if (!accessInfo) {
        accessInfo = parseProductSku(item.sku);
      }

      if (accessInfo) {
        switch (accessInfo.type) {
          case 'scanner':
            scannerTier = Math.max(scannerTier, accessInfo.tier);
            break;
          case 'course':
            courseTier = Math.max(courseTier, accessInfo.tier);
            if (item.product_id) {
              enrolledCourses.push(item.product_id.toString());
            }
            break;
          case 'chatbot':
            chatbotTier = Math.max(chatbotTier, accessInfo.tier);
            break;
          case 'gems':
            gemsToAdd += accessInfo.tier;
            break;
        }
      }

      // Check for individual course purchase
      const sku = item.sku?.toLowerCase() || '';
      const courseMatch = sku.match(/(?:gem-)?individual-course-(\w+)/i) ||
                          sku.match(/course-id-(\w+)/i);
      if (courseMatch && item.product_id) {
        enrolledCourses.push(item.product_id.toString());
      }
    }

    // Unlock access in database
    if (scannerTier > 0 || courseTier > 0 || chatbotTier > 0) {
      const { error: rpcError } = await supabase.rpc('unlock_user_access', {
        p_email: customerEmail,
        p_scanner_tier: scannerTier > 0 ? scannerTier : null,
        p_course_tier: courseTier > 0 ? courseTier : null,
        p_chatbot_tier: chatbotTier > 0 ? chatbotTier : null,
        p_order_id: order.id.toString(),
      });

      if (rpcError) {
        console.error('[Shopify Paid Webhook] unlock_user_access error:', rpcError);
      } else {
        console.log('[Shopify Paid Webhook] Access unlocked for:', customerEmail);
      }
    }

    // Add gems if purchased
    if (gemsToAdd > 0) {
      const { error: gemError } = await supabase.rpc('add_user_gems', {
        p_email: customerEmail,
        p_amount: gemsToAdd,
        p_source: 'purchase',
      });

      if (gemError) {
        console.error('[Shopify Paid Webhook] add_user_gems error:', gemError);
      } else {
        console.log('[Shopify Paid Webhook] Gems added:', gemsToAdd);
      }
    }

    // Add enrolled courses
    if (enrolledCourses.length > 0) {
      // Get existing user_access
      const { data: existingAccess } = await supabase
        .from('user_access')
        .select('enrolled_courses')
        .eq('user_email', customerEmail)
        .single();

      const currentCourses = existingAccess?.enrolled_courses || [];
      const newCourses = [...new Set([...currentCourses, ...enrolledCourses])];

      await supabase
        .from('user_access')
        .upsert({
          user_email: customerEmail,
          enrolled_courses: newCourses,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_email',
        });
    }

    // Log event
    await supabase.from('payment_logs').insert({
      order_number: orderNumber,
      event_type: 'access_unlocked',
      event_data: {
        shopify_order_id: order.id,
        scanner_tier: scannerTier,
        course_tier: courseTier,
        chatbot_tier: chatbotTier,
        gems_added: gemsToAdd,
        enrolled_courses: enrolledCourses,
      },
      source: 'shopify_webhook',
    });

    // Email notifications handled by Shopify automatically
    console.log('[Shopify Paid Webhook] Email handled by Shopify Notifications');

    return new Response(JSON.stringify({
      success: true,
      order_number: orderNumber,
      access_unlocked: {
        scanner_tier: scannerTier,
        course_tier: courseTier,
        chatbot_tier: chatbotTier,
        gems_added: gemsToAdd,
        enrolled_courses: enrolledCourses,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Shopify Paid Webhook] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
