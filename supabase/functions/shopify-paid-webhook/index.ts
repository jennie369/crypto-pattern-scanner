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
  // Scanner tiers
  'scanner-tier1': { type: 'scanner', tier: 1 },
  'scanner-tier2': { type: 'scanner', tier: 2 },
  'scanner-tier3': { type: 'scanner', tier: 3 },
  'scanner-pro': { type: 'scanner', tier: 1 },
  'scanner-premium': { type: 'scanner', tier: 2 },
  'scanner-vip': { type: 'scanner', tier: 3 },

  // Course tiers (Trading courses)
  'course-starter': { type: 'course', tier: 0 }, // Starter = tier 0
  'course-tier1': { type: 'course', tier: 1 },
  'course-tier2': { type: 'course', tier: 2 },
  'course-tier3': { type: 'course', tier: 3 },
  'tier-starter': { type: 'course', tier: 0 },
  'tier 1': { type: 'course', tier: 1 },
  'tier 2': { type: 'course', tier: 2 },
  'tier 3': { type: 'course', tier: 3 },
  'khóa học trading': { type: 'course', tier: 1 }, // Default to tier 1 for generic trading tag

  // Individual mindset courses (no tier, just enrollment)
  'khóa học': { type: 'individual_course', tier: 0 },
  'tan-so-goc': { type: 'individual_course', tier: 0 },
  'khai-mo': { type: 'individual_course', tier: 0 },

  // Chatbot tiers
  'chatbot-tier1': { type: 'chatbot', tier: 1 },
  'chatbot-tier2': { type: 'chatbot', tier: 2 },
  'chatbot-tier3': { type: 'chatbot', tier: 3 },
  'chatbot-pro': { type: 'chatbot', tier: 1 },
  'chatbot-premium': { type: 'chatbot', tier: 2 },
  'chatbot-vip': { type: 'chatbot', tier: 3 },
  'gem chatbot': { type: 'chatbot', tier: 1 },

  // Gem packs
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
    if (skuLower.includes('pro')) return { type: 'scanner', tier: 1 };
    if (skuLower.includes('premium')) return { type: 'scanner', tier: 2 };
    if (skuLower.includes('vip')) return { type: 'scanner', tier: 3 };
    return { type: 'scanner', tier: 1 };
  }

  // Course tiers (Trading courses)
  if (skuLower.includes('gem-course') || skuLower.includes('course-tier')) {
    // Check for starter first
    if (skuLower.includes('starter')) {
      return { type: 'course', tier: 0 };
    }
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
    if (skuLower.includes('pro')) return { type: 'chatbot', tier: 1 };
    if (skuLower.includes('premium')) return { type: 'chatbot', tier: 2 };
    if (skuLower.includes('vip')) return { type: 'chatbot', tier: 3 };
    return { type: 'chatbot', tier: 1 };
  }

  // Gem packs
  if (skuLower.includes('gem-pack')) {
    const amountMatch = skuLower.match(/(\d+)/);
    if (amountMatch) {
      return { type: 'gems', tier: parseInt(amountMatch[1]) };
    }
  }

  // Individual courses (mindset/spiritual)
  if (skuLower.includes('individual-course') || skuLower.includes('course-id')) {
    return { type: 'individual_course', tier: 0 };
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
            // Trading courses: set tier AND enroll in course
            courseTier = Math.max(courseTier, accessInfo.tier);
            if (item.product_id) {
              enrolledCourses.push(item.product_id.toString());
            }
            break;
          case 'individual_course':
            // Individual/mindset courses: just enroll (no tier upgrade)
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

      // ALWAYS add product_id to enrolledCourses if it looks like a course
      // This ensures all course purchases are tracked
      const sku = item.sku?.toLowerCase() || '';
      const productTitle = (item.title || '').toLowerCase();
      const isCourseProduct = sku.includes('course') ||
                              productTitle.includes('khóa học') ||
                              productTitle.includes('khoa hoc');

      if (isCourseProduct && item.product_id) {
        const productIdStr = item.product_id.toString();
        if (!enrolledCourses.includes(productIdStr)) {
          enrolledCourses.push(productIdStr);
          console.log('[Shopify Paid Webhook] Added course to enrollment:', item.title, productIdStr);
        }
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

    // Add enrolled courses - store in BOTH user_access AND course_enrollments
    if (enrolledCourses.length > 0) {
      // 1. Store in user_access (legacy/backup)
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

      // 2. ALSO create course_enrollments for each course (primary source)
      // First, find the user by email
      const { data: userData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .single();

      if (userData?.id) {
        for (const shopifyProductId of enrolledCourses) {
          // Find course by shopify_product_id
          const { data: courseData } = await supabase
            .from('courses')
            .select('id, title')
            .or(`shopify_product_id.eq.${shopifyProductId},shopify_product_id.eq."${shopifyProductId}"`)
            .single();

          if (courseData?.id) {
            // Create enrollment record
            const { error: enrollError } = await supabase
              .from('course_enrollments')
              .upsert({
                user_id: userData.id,
                course_id: courseData.id,
                enrolled_at: new Date().toISOString(),
                progress_percentage: 0,
                is_active: true,
                access_source: 'shopify_purchase',
              }, {
                onConflict: 'user_id,course_id',
              });

            if (enrollError) {
              console.error('[Shopify Paid Webhook] course_enrollment error:', enrollError);
            } else {
              console.log('[Shopify Paid Webhook] Enrolled user in course:', courseData.title);
            }
          } else {
            console.warn('[Shopify Paid Webhook] Course not found for shopify_product_id:', shopifyProductId);
          }
        }
      } else {
        console.warn('[Shopify Paid Webhook] User not found for email:', customerEmail);
      }
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
