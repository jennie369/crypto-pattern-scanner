// ============================================================
// SHOPIFY ORDER PAID WEBHOOK
// Trigger: Shopify orders/paid
// Purpose:
//   1. Unlock access khi order được mark as paid
//   2. Calculate affiliate commissions (CTV/KOL)
//   3. Calculate instructor revenue share
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Shopify-Hmac-Sha256, X-Shopify-Topic, X-Shopify-Shop-Domain',
};

// ============================================================
// COMMISSION RATES (from partnershipConstants.js)
// ============================================================
const CTV_COMMISSION_RATES = {
  bronze: { digital: 0.10, physical: 0.06, sub_affiliate: 0.02 },
  silver: { digital: 0.15, physical: 0.08, sub_affiliate: 0.025 },
  gold: { digital: 0.20, physical: 0.10, sub_affiliate: 0.03 },
  platinum: { digital: 0.25, physical: 0.12, sub_affiliate: 0.035 },
  diamond: { digital: 0.30, physical: 0.15, sub_affiliate: 0.04 },
};

const KOL_COMMISSION_RATES = {
  digital: 0.20,
  physical: 0.20,
  sub_affiliate: 0.035,
};

// Instructor revenue share rates (instructor-platform)
const INSTRUCTOR_REVENUE_SHARES: Record<string, { instructor: number; platform: number }> = {
  '30-70': { instructor: 0.30, platform: 0.70 }, // Entry-level instructors
  '40-60': { instructor: 0.40, platform: 0.60 },
  '50-50': { instructor: 0.50, platform: 0.50 },
  '60-40': { instructor: 0.60, platform: 0.40 },
  '70-30': { instructor: 0.70, platform: 0.30 }, // Top-tier instructors
};

// Helper to get commission rate
function getCommissionRate(role: string, tier: string, productType: string): number {
  if (role === 'kol') {
    return productType === 'physical' ? KOL_COMMISSION_RATES.physical : KOL_COMMISSION_RATES.digital;
  }

  const tierRates = CTV_COMMISSION_RATES[tier as keyof typeof CTV_COMMISSION_RATES] || CTV_COMMISSION_RATES.bronze;
  return productType === 'physical' ? tierRates.physical : tierRates.digital;
}

// Helper to get sub-affiliate rate
function getSubAffiliateRate(role: string, tier: string): number {
  if (role === 'kol') {
    return KOL_COMMISSION_RATES.sub_affiliate;
  }

  const tierRates = CTV_COMMISSION_RATES[tier as keyof typeof CTV_COMMISSION_RATES] || CTV_COMMISSION_RATES.bronze;
  return tierRates.sub_affiliate;
}

// Determine product type from tags/sku
function determineProductType(item: any): 'digital' | 'physical' {
  const tags = (item.product?.tags || item.tags || '').toLowerCase();
  const sku = (item.sku || '').toLowerCase();
  const title = (item.title || '').toLowerCase();

  // Physical products
  if (tags.includes('physical') || tags.includes('vật lý') ||
      sku.includes('physical') || title.includes('crystal') ||
      title.includes('pha lê') || title.includes('đá')) {
    return 'physical';
  }

  // Default to digital (courses, scanner, chatbot, etc.)
  return 'digital';
}

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

// Verify Shopify webhook using Web Crypto API (works reliably in Deno)
async function verifyShopifyWebhook(body: string, hmacHeader: string): Promise<boolean> {
  const secret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET');
  if (!secret) {
    console.error('[Shopify Paid Webhook] Missing SHOPIFY_WEBHOOK_SECRET');
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const computedHmac = btoa(String.fromCharCode(...new Uint8Array(signature)));
    return computedHmac === hmacHeader;
  } catch (err) {
    console.error('[Shopify Paid Webhook] HMAC verification error:', err);
    return false;
  }
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

    if (!hmacHeader || !(await verifyShopifyWebhook(body, hmacHeader))) {
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
    const shopifyOrderId = order.id.toString();

    // ============================================================
    // IDEMPOTENCY CHECK: Prevent duplicate processing on webhook retries
    // ============================================================
    const { data: existingLog } = await supabase
      .from('shopify_webhook_logs')
      .select('id, processed')
      .eq('topic', 'orders/paid')
      .eq('shopify_id', shopifyOrderId)
      .eq('processed', true)
      .maybeSingle();

    if (existingLog) {
      console.log('[Shopify Paid Webhook] Already processed, skipping:', shopifyOrderId);
      return new Response(JSON.stringify({
        success: true,
        message: 'Already processed (idempotent)',
        skipped: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============================================================
    // CROSS-WEBHOOK DEDUP: Check if shopify-webhook already processed this order
    // Both webhooks fire for orders/paid — prevent double tier grants & commissions
    // ============================================================
    const { data: alreadyProcessedByMainWebhook } = await supabase
      .from('shopify_orders')
      .select('processed_at')
      .eq('shopify_order_id', shopifyOrderId)
      .maybeSingle();

    if (alreadyProcessedByMainWebhook?.processed_at) {
      console.log('[Shopify Paid Webhook] Already processed by main shopify-webhook, skipping:', shopifyOrderId);
      return new Response(JSON.stringify({
        success: true,
        message: 'Already processed by main webhook (cross-dedup)',
        skipped: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log this webhook event and mark as processing
    const { data: webhookLog } = await supabase
      .from('shopify_webhook_logs')
      .insert({
        topic: 'orders/paid',
        shopify_id: shopifyOrderId,
        payload: { order_number: orderNumber, email: customerEmail },
        processed: false,
      })
      .select('id')
      .single();

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
      const variantId = item.variant_id?.toString() || '';
      const productId = item.product_id?.toString() || '';
      let accessInfo: { type: string; tier: number } | null = null;

      // ============================================================
      // METHOD 1 (PRIMARY): Database lookup by variant_id
      // shopify_product_variants table has tier_type and tier_level
      // This is the most reliable method since webhook payloads
      // do NOT include product tags in line_items
      // ============================================================
      if (variantId) {
        try {
          const { data: variantData } = await supabase
            .from('shopify_product_variants')
            .select('tier_type, tier_level, tier_name, course_id, sku')
            .eq('shopify_variant_id', variantId)
            .single();

          if (variantData?.tier_type) {
            accessInfo = { type: variantData.tier_type, tier: variantData.tier_level || 0 };
            console.log(`[Shopify Paid Webhook] DB lookup: variant ${variantId} -> ${variantData.tier_type} tier ${variantData.tier_level} (${variantData.tier_name})`);
          }
        } catch (e) {
          // Not found in DB, continue to fallback methods
        }

        // Also check gem_packs table (variant_id based, includes bonus gems)
        if (!accessInfo) {
          try {
            const { data: gemPack } = await supabase
              .from('gem_packs')
              .select('total_gems, gems_quantity, bonus_gems')
              .eq('shopify_variant_id', variantId)
              .single();

            if (gemPack) {
              accessInfo = { type: 'gems', tier: gemPack.total_gems || gemPack.gems_quantity };
              console.log(`[Shopify Paid Webhook] Gem pack DB match: variant ${variantId} -> ${gemPack.total_gems} gems (${gemPack.gems_quantity} + ${gemPack.bonus_gems} bonus)`);
            }
          } catch (e) {
            // Not a gem pack variant
          }
        }
      }

      // ============================================================
      // METHOD 2: Try product tags (available if Shopify includes them)
      // ============================================================
      if (!accessInfo) {
        const productTags = item.product?.tags || item.tags || '';
        accessInfo = parseProductTags(productTags);
        if (accessInfo) {
          console.log(`[Shopify Paid Webhook] Tag match: "${productTags}" -> ${accessInfo.type} tier ${accessInfo.tier}`);
        }
      }

      // ============================================================
      // METHOD 3: Try SKU pattern matching
      // ============================================================
      if (!accessInfo) {
        accessInfo = parseProductSku(item.sku);
        if (accessInfo) {
          console.log(`[Shopify Paid Webhook] SKU match: "${item.sku}" -> ${accessInfo.type} tier ${accessInfo.tier}`);
        }
      }

      // Apply detected access info
      if (accessInfo) {
        switch (accessInfo.type) {
          case 'scanner':
            scannerTier = Math.max(scannerTier, accessInfo.tier);
            break;
          case 'course':
            // Trading courses: set tier AND enroll in course
            courseTier = Math.max(courseTier, accessInfo.tier);
            if (productId) {
              enrolledCourses.push(productId);
            }
            break;
          case 'individual_course':
            // Individual/mindset courses: just enroll (no tier upgrade)
            if (productId) {
              enrolledCourses.push(productId);
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

      // ============================================================
      // METHOD 4: Check courses table by product_id for enrollment
      // This catches individual/mindset courses even if tier detection fails
      // ============================================================
      if (productId) {
        try {
          const { data: courseData } = await supabase
            .from('courses')
            .select('id, title, shopify_product_id')
            .eq('shopify_product_id', productId)
            .single();

          if (courseData) {
            if (!enrolledCourses.includes(productId)) {
              enrolledCourses.push(productId);
              console.log(`[Shopify Paid Webhook] Course DB match: ${courseData.title} (${productId})`);
            }
          }
        } catch (e) {
          // Not a course product, that's fine
        }
      }

      // Fallback: title-based course detection
      if (!accessInfo && productId) {
        const productTitle = (item.title || item.name || '').toLowerCase();
        const isCourseProduct = productTitle.includes('khóa học') ||
                                productTitle.includes('khoa hoc') ||
                                productTitle.includes('course');

        if (isCourseProduct && !enrolledCourses.includes(productId)) {
          enrolledCourses.push(productId);
          console.log(`[Shopify Paid Webhook] Title match for course enrollment:`, item.title, productId);
        }
      }

      console.log(`[Shopify Paid Webhook] Item processed: "${item.title}" variant=${variantId} product=${productId} -> accessInfo=${JSON.stringify(accessInfo)}`);
    }

    // Unlock access in database
    if (scannerTier > 0 || courseTier > 0 || chatbotTier > 0) {
      // 1. Update user_access table via RPC (legacy)
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
        console.log('[Shopify Paid Webhook] Access unlocked in user_access for:', customerEmail);
      }

      // 2. ALSO update profiles table directly (app reads tiers from profiles, not user_access)
      const tierNames = ['FREE', 'STARTER', 'TIER1', 'TIER2', 'TIER3'];
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, course_tier, scanner_tier, chatbot_tier')
        .eq('email', customerEmail)
        .single();

      if (profileData) {
        const calculateExpiryDate = (months: number) => {
          const now = new Date();
          now.setMonth(now.getMonth() + months);
          return now.toISOString();
        };

        const updateData: Record<string, any> = { updated_at: new Date().toISOString() };

        // Course tier upgrade (includes scanner + chatbot bundle for TIER1+)
        if (courseTier > 0) {
          const tierName = courseTier === 0 ? 'STARTER' : `TIER${courseTier}`;
          const bundleMapping: Record<string, { scanner: string; chatbot: string; months: number }> = {
            'TIER1': { scanner: 'TIER1', chatbot: 'TIER1', months: 12 },
            'TIER2': { scanner: 'TIER2', chatbot: 'TIER2', months: 12 },
            'TIER3': { scanner: 'TIER3', chatbot: 'TIER2', months: 24 },
          };
          const bundle = bundleMapping[tierName];
          if (bundle) {
            const expiryDate = calculateExpiryDate(bundle.months);
            updateData.course_tier = tierName;
            updateData.course_tier_expires_at = expiryDate;
            updateData.scanner_tier = bundle.scanner;
            updateData.scanner_tier_expires_at = expiryDate;
            updateData.chatbot_tier = bundle.chatbot;
            updateData.chatbot_tier_expires_at = expiryDate;
            updateData.tier = tierName;
            // NOTE: tier_expires_at column does NOT exist on profiles table — do not set it
            console.log(`[Shopify Paid Webhook] BUNDLE: Course ${tierName}, Scanner ${bundle.scanner}, Chatbot ${bundle.chatbot}`);
          } else {
            // STARTER tier — course only, no bundle
            updateData.course_tier = tierName;
            updateData.course_tier_expires_at = calculateExpiryDate(12);
            console.log(`[Shopify Paid Webhook] Course tier: ${tierName}`);
          }
        }

        // Scanner-only upgrade (if no course tier already set it)
        if (scannerTier > 0 && !updateData.scanner_tier) {
          const tierName = `TIER${scannerTier}`;
          updateData.scanner_tier = tierName;
          updateData.scanner_tier_expires_at = calculateExpiryDate(1);
          updateData.tier = tierName;
          // NOTE: tier_expires_at column does NOT exist on profiles table — do not set it
        }

        // Chatbot-only upgrade (if no course tier already set it)
        if (chatbotTier > 0 && !updateData.chatbot_tier) {
          const tierName = `TIER${chatbotTier}`;
          updateData.chatbot_tier = tierName;
          updateData.chatbot_tier_expires_at = calculateExpiryDate(1);
        }

        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', profileData.id);

        if (profileUpdateError) {
          console.error('[Shopify Paid Webhook] profiles update error:', profileUpdateError);
        } else {
          console.log('[Shopify Paid Webhook] Profile tiers updated for:', customerEmail);
        }
      } else {
        console.log('[Shopify Paid Webhook] No profile found for email, tiers saved in user_access only:', customerEmail);
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
        // User doesn't have account yet - create pending_course_access entries
        console.log('[Shopify Paid Webhook] User not signed up yet, creating pending_course_access for:', customerEmail);
        for (const shopifyProductId of enrolledCourses) {
          try {
            const { data: courseData } = await supabase
              .from('courses')
              .select('id')
              .eq('shopify_product_id', shopifyProductId)
              .single();

            if (courseData?.id) {
              const courseItem = order.line_items?.find((li: any) => li.product_id?.toString() === shopifyProductId);
              const { error: pendingError } = await supabase.from('pending_course_access').insert({
                email: customerEmail,
                course_id: courseData.id,
                shopify_order_id: order.id.toString(),
                access_type: 'purchase',
                price_paid: courseItem ? parseFloat(courseItem.price) * (courseItem.quantity || 1) : 0,
              });
              if (pendingError) console.error('[Shopify Paid Webhook] pending_course_access insert error:', pendingError);
              else console.log('[Shopify Paid Webhook] Created pending_course_access:', courseData.id);
            }
          } catch (e) {
            // Course not found
          }
        }
      }
    }

    // ============================================================
    // FALLBACK: Create pending tier/gem records if user has no account
    // RPCs above work with user_access table, but on signup
    // apply_all_pending_purchases() only reads pending_* tables
    // ============================================================
    {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .single();

      if (!userProfile?.id) {
        console.log('[Shopify Paid Webhook] Creating pending tier/gem records for new user:', customerEmail);

        // Pending tier upgrades
        if (scannerTier > 0) {
          await supabase.from('pending_tier_upgrades').insert({
            email: customerEmail, order_id: order.id.toString(),
            product_type: 'scanner', tier_purchased: `TIER${scannerTier}`,
            amount: parseFloat(order.total_price) || 0,
          }).then(({ error }) => error && console.error('[Shopify Paid Webhook] pending scanner tier error:', error));
        }
        if (courseTier >= 0 && (courseTier > 0 || enrolledCourses.length > 0)) {
          // Only create course tier pending if an actual trading course tier was purchased (not just individual courses)
          if (courseTier > 0) {
            await supabase.from('pending_tier_upgrades').insert({
              email: customerEmail, order_id: order.id.toString(),
              product_type: 'course', tier_purchased: courseTier === 0 ? 'STARTER' : `TIER${courseTier}`,
              amount: parseFloat(order.total_price) || 0,
            }).then(({ error }) => error && console.error('[Shopify Paid Webhook] pending course tier error:', error));
          }
        }
        if (chatbotTier > 0) {
          await supabase.from('pending_tier_upgrades').insert({
            email: customerEmail, order_id: order.id.toString(),
            product_type: 'chatbot', tier_purchased: `TIER${chatbotTier}`,
            amount: parseFloat(order.total_price) || 0,
          }).then(({ error }) => error && console.error('[Shopify Paid Webhook] pending chatbot tier error:', error));
        }

        // Pending gem credits
        if (gemsToAdd > 0) {
          await supabase.from('pending_gem_credits').insert({
            email: customerEmail, gems_amount: gemsToAdd,
            order_id: order.id.toString(), status: 'pending',
          }).then(({ error }) => error && console.error('[Shopify Paid Webhook] pending gems error:', error));
          console.log('[Shopify Paid Webhook] Created pending gem credits:', gemsToAdd);
        }
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

    // ============================================================
    // AFFILIATE COMMISSION CALCULATION
    // ============================================================
    let affiliateCommissionResult = null;
    let instructorRevenueResult = null;

    // Get discount code from order (used as referral code)
    const discountCodes = order.discount_codes || [];
    const referralCode = discountCodes.find((dc: any) =>
      dc.code?.startsWith('GEM') || dc.code?.startsWith('KOL') || dc.code?.startsWith('REF')
    )?.code || null;

    // Also check note_attributes for referral_code
    const noteRefCode = order.note_attributes?.find((attr: any) =>
      attr.name?.toLowerCase() === 'referral_code' || attr.name?.toLowerCase() === 'ref'
    )?.value || null;

    const finalReferralCode = referralCode || noteRefCode;

    if (finalReferralCode) {
      console.log('[Shopify Paid Webhook] Processing referral code:', finalReferralCode);

      // Find affiliate by referral_code
      const { data: affiliate, error: affError } = await supabase
        .from('affiliate_profiles')
        .select('id, user_id, role, ctv_tier, referred_by, total_sales, monthly_sales, total_earnings, sub_affiliate_earnings')
        .eq('referral_code', finalReferralCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (affiliate && !affError) {
        // SECURITY: Prevent self-referral (affiliate cannot earn commission on own purchase)
        const buyerProfile = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .maybeSingle();

        if (buyerProfile?.data?.id === affiliate.user_id) {
          console.log('[Shopify Paid Webhook] Self-referral prevented:', customerEmail);
        } else {

        const totalOrderAmount = parseFloat(order.total_price) || 0;

        // Calculate commission for each line item
        let totalCommission = 0;
        let totalSubAffiliateCommission = 0;
        const commissionDetails: any[] = [];

        for (const item of order.line_items || []) {
          const itemPrice = parseFloat(item.price) * (item.quantity || 1);
          const productType = determineProductType(item);
          const commissionRate = getCommissionRate(affiliate.role, affiliate.ctv_tier || 'bronze', productType);
          const itemCommission = itemPrice * commissionRate;

          totalCommission += itemCommission;
          commissionDetails.push({
            product_id: item.product_id,
            product_title: item.title,
            product_type: productType,
            price: itemPrice,
            commission_rate: commissionRate,
            commission: itemCommission,
          });
        }

        // Insert commission record
        // NOTE: Use affiliate.user_id (auth UUID) for consistency with client-side queries
        const { data: commissionRecord, error: commInsertError } = await supabase
          .from('affiliate_commissions')
          .insert({
            affiliate_id: affiliate.user_id,
            order_id: order.id.toString(),
            order_number: orderNumber,
            order_amount: totalOrderAmount,
            commission_amount: totalCommission,
            commission_rate: totalCommission / totalOrderAmount,
            product_type: 'mixed',
            status: 'pending',
            affiliate_role: affiliate.role,
            affiliate_tier: affiliate.ctv_tier,
            metadata: {
              discount_code: finalReferralCode,
              customer_email: customerEmail,
              line_items: commissionDetails,
            },
          })
          .select()
          .single();

        if (commInsertError) {
          console.error('[Shopify Paid Webhook] Commission insert error:', commInsertError);
        } else {
          console.log('[Shopify Paid Webhook] Commission created:', totalCommission, 'VND for affiliate:', affiliate.id);

          // Update affiliate's total_sales, monthly_sales, and total_earnings
          await supabase
            .from('affiliate_profiles')
            .update({
              total_sales: (affiliate.total_sales || 0) + totalOrderAmount,
              monthly_sales: (affiliate.monthly_sales || 0) + totalOrderAmount,
              total_earnings: (affiliate.total_earnings || 0) + totalCommission,
            })
            .eq('id', affiliate.id);

          // ========== SUB-AFFILIATE COMMISSION ==========
          if (affiliate.referred_by) {
            // Find the referrer (sub-affiliate parent)
            const { data: referrer } = await supabase
              .from('affiliate_profiles')
              .select('id, user_id, role, ctv_tier, sub_affiliate_earnings')
              .eq('user_id', affiliate.referred_by)
              .eq('is_active', true)
              .single();

            if (referrer) {
              const subAffiliateRate = getSubAffiliateRate(referrer.role, referrer.ctv_tier || 'bronze');
              const subAffiliateCommission = totalOrderAmount * subAffiliateRate;
              totalSubAffiliateCommission = subAffiliateCommission;

              // Insert sub-affiliate commission
              // NOTE: Use referrer.user_id (auth UUID) for consistency with client-side queries
              await supabase
                .from('affiliate_commissions')
                .insert({
                  affiliate_id: referrer.user_id,
                  order_id: order.id.toString(),
                  order_number: orderNumber,
                  order_amount: totalOrderAmount,
                  commission_amount: subAffiliateCommission,
                  commission_rate: subAffiliateRate,
                  product_type: 'sub_affiliate',
                  status: 'pending',
                  affiliate_role: referrer.role,
                  affiliate_tier: referrer.ctv_tier,
                  sub_affiliate_id: affiliate.user_id,
                  sub_affiliate_commission: subAffiliateCommission,
                  sub_affiliate_rate: subAffiliateRate,
                  metadata: {
                    source: 'sub_affiliate',
                    original_affiliate_id: affiliate.id,
                    original_discount_code: finalReferralCode,
                  },
                });

              // Update referrer's sub_affiliate_earnings
              await supabase
                .from('affiliate_profiles')
                .update({
                  sub_affiliate_earnings: (referrer.sub_affiliate_earnings || 0) + subAffiliateCommission,
                })
                .eq('id', referrer.id);

              console.log('[Shopify Paid Webhook] Sub-affiliate commission created:', subAffiliateCommission, 'VND');
            }
          }

          affiliateCommissionResult = {
            affiliate_id: affiliate.id,
            commission: totalCommission,
            sub_affiliate_commission: totalSubAffiliateCommission,
          };
        }

        } // end self-referral else block
      } else {
        console.log('[Shopify Paid Webhook] Affiliate not found for code:', finalReferralCode);
      }
    }

    // ============================================================
    // INSTRUCTOR REVENUE SHARE CALCULATION
    // ============================================================
    for (const shopifyProductId of enrolledCourses) {
      // Find course and its instructor
      const { data: courseData } = await supabase
        .from('courses')
        .select('id, title, instructor_id, revenue_share_type')
        .or(`shopify_product_id.eq.${shopifyProductId},shopify_product_id.eq."${shopifyProductId}"`)
        .single();

      if (courseData?.instructor_id) {
        // Get instructor profile
        const { data: instructor } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .eq('id', courseData.instructor_id)
          .single();

        if (instructor) {
          // Find the line item for this course to get price
          const courseItem = order.line_items?.find((item: any) =>
            item.product_id?.toString() === shopifyProductId
          );

          if (courseItem) {
            const coursePrice = parseFloat(courseItem.price) * (courseItem.quantity || 1);
            const revenueShareType = courseData.revenue_share_type || '50-50';
            const shareRates = INSTRUCTOR_REVENUE_SHARES[revenueShareType] || INSTRUCTOR_REVENUE_SHARES['50-50'];
            const instructorEarning = coursePrice * shareRates.instructor;
            const platformEarning = coursePrice * shareRates.platform;

            // Insert instructor earning record
            const { error: instructorError } = await supabase
              .from('instructor_earnings')
              .insert({
                instructor_id: courseData.instructor_id,
                course_id: courseData.id,
                order_id: order.id.toString(),
                order_number: orderNumber,
                course_price: coursePrice,
                revenue_share_type: revenueShareType,
                instructor_share_rate: shareRates.instructor,
                platform_share_rate: shareRates.platform,
                instructor_earning: instructorEarning,
                platform_earning: platformEarning,
                student_email: customerEmail,
                status: 'pending',
              });

            if (instructorError) {
              console.error('[Shopify Paid Webhook] Instructor earning insert error:', instructorError);
            } else {
              console.log('[Shopify Paid Webhook] Instructor earning created:', instructorEarning, 'VND for course:', courseData.title);

              instructorRevenueResult = {
                instructor_id: courseData.instructor_id,
                course_id: courseData.id,
                earning: instructorEarning,
              };
            }
          }
        }
      }
    }

    // Email notifications handled by Shopify automatically
    console.log('[Shopify Paid Webhook] Email handled by Shopify Notifications');

    // Mark webhook as processed (idempotency)
    if (webhookLog?.id) {
      await supabase
        .from('shopify_webhook_logs')
        .update({ processed: true })
        .eq('id', webhookLog.id);
    }

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
      affiliate_commission: affiliateCommissionResult,
      instructor_revenue: instructorRevenueResult,
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
