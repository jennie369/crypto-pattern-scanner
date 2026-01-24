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
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

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
        .select('id, user_id, role, ctv_tier, referred_by, total_sales, monthly_sales')
        .eq('referral_code', finalReferralCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (affiliate && !affError) {
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
        const { data: commissionRecord, error: commInsertError } = await supabase
          .from('affiliate_commissions')
          .insert({
            affiliate_id: affiliate.id,
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

          // Update affiliate's total_sales and monthly_sales
          await supabase
            .from('affiliate_profiles')
            .update({
              total_sales: (affiliate.total_sales || 0) + totalOrderAmount,
              monthly_sales: (affiliate.monthly_sales || 0) + totalOrderAmount,
              total_earnings: supabase.rpc('increment', { x: totalCommission }),
            })
            .eq('id', affiliate.id);

          // ========== SUB-AFFILIATE COMMISSION ==========
          if (affiliate.referred_by) {
            // Find the referrer (sub-affiliate parent)
            const { data: referrer } = await supabase
              .from('affiliate_profiles')
              .select('id, user_id, role, ctv_tier')
              .eq('user_id', affiliate.referred_by)
              .eq('is_active', true)
              .single();

            if (referrer) {
              const subAffiliateRate = getSubAffiliateRate(referrer.role, referrer.ctv_tier || 'bronze');
              const subAffiliateCommission = totalOrderAmount * subAffiliateRate;
              totalSubAffiliateCommission = subAffiliateCommission;

              // Insert sub-affiliate commission
              await supabase
                .from('affiliate_commissions')
                .insert({
                  affiliate_id: referrer.id,
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
                  sub_affiliate_earnings: supabase.rpc('increment', { x: subAffiliateCommission }),
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
