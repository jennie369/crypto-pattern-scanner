import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// ========================================
// COMMISSION RATES v3.0
// Reference: GEM_PARTNERSHIP_OFFICIAL_POLICY_V3.md
// ========================================
const COMMISSION_RATES_V3 = {
  kol: { digital: 20, physical: 20 },  // KOL: 20% all products
  ctv: {
    bronze: { digital: 10, physical: 6 },   // 10% digital, 6% physical
    silver: { digital: 15, physical: 8 },   // 15% digital, 8% physical
    gold: { digital: 20, physical: 10 },    // 20% digital, 10% physical
    platinum: { digital: 25, physical: 12 }, // 25% digital, 12% physical
    diamond: { digital: 30, physical: 15 },  // 30% digital, 15% physical
  },
};

// Sub-Affiliate Rates v3.0 (%)
const SUB_AFFILIATE_RATES_V3 = {
  kol: 3.5,      // KOL: 3.5%
  bronze: 2,     // 2%
  silver: 2.5,   // 2.5%
  gold: 3,       // 3%
  platinum: 3.5, // 3.5%
  diamond: 4,    // 4%
};

// Vietnamese tier names for notifications
const TIER_NAMES_VN = {
  bronze: '🥉 Đồng',
  silver: '🥈 Bạc',
  gold: '🥇 Vàng',
  platinum: '💎 Bạch Kim',
  diamond: '👑 Kim Cương',
};

/**
 * Get commission rate based on role, tier, and product type
 * v3.0: Separate rates for digital and physical
 */
function getCommissionRateV3(role: string, tier: string, productType: string): number {
  if (role === 'kol') {
    return productType === 'digital'
      ? COMMISSION_RATES_V3.kol.digital
      : COMMISSION_RATES_V3.kol.physical;
  }

  if (role === 'ctv') {
    const tierConfig = COMMISSION_RATES_V3.ctv[tier as keyof typeof COMMISSION_RATES_V3.ctv];
    if (tierConfig) {
      return productType === 'digital' ? tierConfig.digital : tierConfig.physical;
    }
    // Default to bronze
    return productType === 'digital'
      ? COMMISSION_RATES_V3.ctv.bronze.digital
      : COMMISSION_RATES_V3.ctv.bronze.physical;
  }

  return 0;
}

/**
 * Get sub-affiliate rate based on role and tier
 * v3.0: New feature
 */
function getSubAffiliateRateV3(role: string, tier: string): number {
  if (role === 'kol') {
    return SUB_AFFILIATE_RATES_V3.kol;
  }
  return SUB_AFFILIATE_RATES_V3[tier as keyof typeof SUB_AFFILIATE_RATES_V3] || SUB_AFFILIATE_RATES_V3.bronze;
}

// ========================================
// HELPER: Send push notification to partner
// ========================================
async function sendCommissionNotification(
  supabaseUrl: string,
  supabaseServiceKey: string,
  partnerId: string,
  orderNumber: string,
  commissionAmount: number,
  productName?: string
) {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/partnership-notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        event_type: 'commission_earned',
        user_id: partnerId,
        data: {
          order_number: orderNumber,
          amount: commissionAmount,
          product_name: productName || null,
        }
      })
    });

    if (response.ok) {
      console.log('📱 Commission notification sent to partner');
    } else {
      console.log('⚠️ Failed to send notification:', await response.text());
    }
  } catch (error) {
    console.error('⚠️ Notification error (non-blocking):', error);
  }
}
// ========================================
// HELPER: Determine product type (digital vs physical)
// ========================================
function determineProductType(lineItems) {
  for (const item of lineItems){
    const productType = item.product_type?.toLowerCase() || '';
    const tags = (item.tags || '').toLowerCase();
    const sku = item.sku?.toLowerCase() || '';
    // Digital products
    if (productType.includes('course') || productType.includes('tier') || productType.includes('subscription') || tags.includes('digital') || sku.includes('tier') || sku.includes('course') || sku.includes('scanner') || sku.includes('chatbot')) {
      return 'digital';
    }
    // Physical products
    if (productType.includes('crystal') || productType.includes('jewelry') || tags.includes('physical')) {
      return 'physical';
    }
  }
  return 'physical' // Default
  ;
}

// ========================================
// HELPER: Check if line item is an individual course
// Returns courses matching by SKU pattern OR shopify_product_id in database
// ========================================
async function extractIndividualCourses(lineItems, supabase) {
  const courses = [];

  for (const item of lineItems) {
    const sku = item.sku?.toLowerCase() || '';
    const productId = item.product_id?.toString() || '';
    const itemPrice = parseFloat(item.price) || 0;
    const itemQty = item.quantity || 1;

    // Method 1: Match by SKU pattern (gem-individual-course-{courseId} or course-{courseId})
    const courseMatch = sku.match(/(?:gem-)?individual-course-(\w+)/i) ||
                        sku.match(/course-id-(\w+)/i);

    if (courseMatch) {
      courses.push({
        course_id: courseMatch[1],
        sku: item.sku,
        name: item.name,
        price: itemPrice,
        quantity: itemQty,
        shopify_product_id: productId,
      });
      continue; // Skip other checks for this item
    }

    // Method 2: Check product metadata for course_id
    if (item.properties) {
      const courseIdProp = item.properties.find(p =>
        p.name?.toLowerCase() === 'course_id' || p.name?.toLowerCase() === 'courseid'
      );
      if (courseIdProp?.value) {
        courses.push({
          course_id: courseIdProp.value,
          sku: item.sku,
          name: item.name,
          price: itemPrice,
          quantity: itemQty,
          shopify_product_id: productId,
        });
        continue; // Skip other checks for this item
      }
    }

    // Method 3 (NEW): Look up course by shopify_product_id in database
    if (productId && supabase) {
      try {
        const { data: courseByProduct, error } = await supabase
          .from('courses')
          .select('id, title, shopify_product_id')
          .eq('shopify_product_id', productId)
          .single();

        if (!error && courseByProduct) {
          console.log(`📚 Found course by shopify_product_id: ${productId} -> ${courseByProduct.id}`);
          courses.push({
            course_id: courseByProduct.id,
            sku: item.sku,
            name: item.name || courseByProduct.title,
            price: itemPrice,
            quantity: itemQty,
            shopify_product_id: productId,
          });
        }
      } catch (lookupError) {
        console.log(`ℹ️ No course found for product_id ${productId}`);
      }
    }
  }
  return courses;
}

// ========================================
// HELPER: Grant course access to user
// ========================================
async function grantCourseAccess(
  supabase,
  userId: string,
  courseId: string,
  accessType: string,
  orderData: any
) {
  console.log(`📚 Granting course access: User ${userId} -> Course ${courseId}`);

  try {
    // Get course details for duration
    const { data: course } = await supabase
      .from('courses')
      .select('id, title, membership_duration_days, tier_required')
      .eq('id', courseId)
      .single();

    if (!course) {
      // Try finding by shopify_product_id
      const { data: courseByShopify } = await supabase
        .from('courses')
        .select('id, title, membership_duration_days, tier_required')
        .eq('shopify_product_id', courseId)
        .single();

      if (!courseByShopify) {
        console.error(`❌ Course not found: ${courseId}`);
        return { success: false, error: 'Course not found' };
      }

      return grantCourseAccess(supabase, userId, courseByShopify.id, accessType, orderData);
    }

    // Calculate expiry date
    const expiresAt = course.membership_duration_days
      ? new Date(Date.now() + course.membership_duration_days * 24 * 60 * 60 * 1000).toISOString()
      : null; // null = lifetime access

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('course_enrollments')
      .select('id, expires_at')
      .eq('user_id', userId)
      .eq('course_id', course.id)
      .single();

    if (existingEnrollment) {
      // Extend existing enrollment
      const currentExpiry = existingEnrollment.expires_at
        ? new Date(existingEnrollment.expires_at)
        : null;
      const newExpiry = expiresAt
        ? (currentExpiry && currentExpiry > new Date()
            ? new Date(currentExpiry.getTime() + course.membership_duration_days * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + course.membership_duration_days * 24 * 60 * 60 * 1000))
        : null;

      await supabase
        .from('course_enrollments')
        .update({
          expires_at: newExpiry?.toISOString() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingEnrollment.id);

      console.log(`✅ Extended enrollment for course: ${course.title}`);
      return { success: true, action: 'extended', course_title: course.title };
    }

    // Create new enrollment
    const { error: enrollError } = await supabase
      .from('course_enrollments')
      .insert({
        user_id: userId,
        course_id: course.id,
        access_type: accessType,
        enrolled_at: new Date().toISOString(),
        expires_at: expiresAt,
        metadata: {
          shopify_order_id: orderData.id?.toString(),
          order_number: orderData.order_number || orderData.name,
          purchase_price: orderData.total_price,
        },
      });

    if (enrollError) {
      console.error(`❌ Failed to create enrollment:`, enrollError);
      return { success: false, error: enrollError.message };
    }

    console.log(`✅ Granted access to course: ${course.title}`);
    return { success: true, action: 'created', course_title: course.title };

  } catch (error) {
    console.error(`❌ Course access error:`, error);
    return { success: false, error: error.message };
  }
}
// ========================================
// HELPER: Get partner ID from order note_attributes
// ========================================
function getPartnerIdFromOrder(orderData) {
  const noteAttributes = orderData.note_attributes || [];
  const partnerAttr = noteAttributes.find((attr)=>attr.name === 'partner_id' || attr.name === 'ref' || attr.name === 'affiliate_id');
  return partnerAttr?.value || null;
}

// ========================================
// HELPER: Get user_id from order note_attributes
// Mobile App injects user_id for direct user matching
// ========================================
function getUserIdFromOrder(orderData) {
  const noteAttributes = orderData.note_attributes || [];
  const userAttr = noteAttributes.find((attr)=>attr.name === 'user_id');
  const userId = userAttr?.value || null;
  if (userId) {
    console.log(`📱 Found user_id from note_attributes: ${userId}`);
  }
  return userId;
}

// ========================================
// HELPER: Get order source from note_attributes
// ========================================
function getOrderSource(orderData) {
  const noteAttributes = orderData.note_attributes || [];
  const sourceAttr = noteAttributes.find((attr)=>attr.name === 'source');
  return sourceAttr?.value || 'unknown';
}

// ========================================
// HELPER: Extract tier info from SKU (existing logic)
// ========================================
function extractTierFromSku(lineItems) {
  let productType = null;
  let tierPurchased = null;
  let amountPaid = 0;
  let gemAmount = 0;
  let quantity = 1;
  let variantId = null; // NEW: Track variant ID for gem_packs lookup

  for (const item of lineItems){
    const sku = item.sku?.toLowerCase() || '';
    const price = parseFloat(item.price) || 0;
    quantity = item.quantity || 1;
    const itemVariantId = item.variant_id?.toString() || null;

    // ========================================
    // NEW: Gem pack detection (gem-pack-XXX or by variant_id)
    // ========================================
    if (sku.startsWith('gem-pack-') || sku.includes('gem') && sku.includes('pack')) {
      productType = 'gems';
      tierPurchased = 'none';
      amountPaid = price * quantity;
      variantId = itemVariantId;
      // Extract gem amount from SKU (e.g., gem-pack-500 -> 500)
      const gemAmountMatch = sku.match(/gem-pack-(\d+)/);
      if (gemAmountMatch) {
        gemAmount = parseInt(gemAmountMatch[1], 10) * quantity;
      } else {
        // Try to extract from title or properties
        const titleMatch = (item.name || item.title || '').match(/(\d+)\s*gems?/i);
        if (titleMatch) {
          gemAmount = parseInt(titleMatch[1], 10) * quantity;
        }
      }
      console.log(`💎 Gem pack detected: SKU=${sku}, VariantID=${variantId}, Amount=${gemAmount}, Qty=${quantity}`);
      break;
    }

    // Course products
    if (sku.includes('gem-course-tier1') || sku.includes('course-tier1')) {
      productType = 'course';
      tierPurchased = 'TIER1';
      amountPaid = price;
      break;
    } else if (sku.includes('gem-course-tier2') || sku.includes('course-tier2')) {
      productType = 'course';
      tierPurchased = 'TIER2';
      amountPaid = price;
      break;
    } else if (sku.includes('gem-course-tier3') || sku.includes('course-tier3')) {
      productType = 'course';
      tierPurchased = 'TIER3';
      amountPaid = price;
      break;
    } else if (sku.includes('gem-scanner-pro') || sku.includes('scanner-pro')) {
      productType = 'scanner';
      tierPurchased = 'TIER1';
      amountPaid = price;
      break;
    } else if (sku.includes('gem-scanner-premium') || sku.includes('scanner-premium')) {
      productType = 'scanner';
      tierPurchased = 'TIER2';
      amountPaid = price;
      break;
    } else if (sku.includes('gem-scanner-vip') || sku.includes('scanner-vip')) {
      productType = 'scanner';
      tierPurchased = 'TIER3';
      amountPaid = price;
      break;
    } else if (sku.includes('gem-chatbot-pro') || sku.includes('chatbot-pro')) {
      productType = 'chatbot';
      tierPurchased = 'TIER1';
      amountPaid = price;
      break;
    } else if (sku.includes('gem-chatbot-premium') || sku.includes('chatbot-premium')) {
      productType = 'chatbot';
      tierPurchased = 'TIER2';
      amountPaid = price;
      break;
    } else if (sku.includes('gem-chatbot-vip') || sku.includes('chatbot-vip')) {
      productType = 'chatbot';
      tierPurchased = 'TIER3';
      amountPaid = price;
      break;
    } else if (sku.includes('gem-course-starter') || sku.includes('course-starter') || sku.includes('tier-starter')) {
      productType = 'course';
      tierPurchased = 'STARTER';
      amountPaid = price;
      break;
    }

    // ========================================
    // SPIRITUAL COURSES (Individual courses by Variant ID)
    // ========================================
    const spiritualCourseVariants: Record<string, { courseId: string; courseName: string }> = {
      '46448176758961': { courseId: 'tan-so-goc', courseName: '7 Ngày Khai Mở Tần Số Gốc' },
      '46448180166833': { courseId: 'tinh-yeu', courseName: 'Kích Hoạt Tần Số Tình Yêu' },
      '46448192192689': { courseId: 'trieu-phu', courseName: 'Tái Tạo Tư Duy Triệu Phú' },
    };

    if (variantId && spiritualCourseVariants[variantId]) {
      productType = 'individual_course';
      tierPurchased = spiritualCourseVariants[variantId].courseId;
      amountPaid = price;
      console.log(`📚 Spiritual course detected: ${spiritualCourseVariants[variantId].courseName}`);
      break;
    }
  }
  // If no tier product found, treat as physical product
  if (!productType || !tierPurchased) {
    productType = 'physical';
    tierPurchased = 'none';
  }
  return {
    productType,
    tierPurchased,
    amountPaid,
    gemAmount,
    variantId // NEW: Include variant ID for gem_packs lookup
  };
}

// ========================================
// HELPER: Process Gem Purchase (Updated for GEM_ECONOMY)
// ========================================
async function processGemPurchase(supabase, userId: string | null, customerEmail: string, gemAmount: number, orderData: any, variantId?: string) {
  console.log(`💎 Processing gem purchase: ${gemAmount} gems for ${customerEmail}`);

  let bonusGems = 0;
  let totalGems = gemAmount;

  // Priority 1: Lookup from gem_packs table (GEM_ECONOMY v2)
  if (variantId) {
    const { data: gemPack } = await supabase
      .from('gem_packs')
      .select('gems_quantity, bonus_gems, total_gems')
      .eq('shopify_variant_id', variantId)
      .single();

    if (gemPack) {
      bonusGems = gemPack.bonus_gems || 0;
      totalGems = gemPack.total_gems || (gemAmount + bonusGems);
      console.log(`   Found in gem_packs: Base=${gemPack.gems_quantity}, Bonus=${bonusGems}, Total=${totalGems}`);
    }
  }

  // Priority 2: Fallback to currency_packages table (legacy)
  if (bonusGems === 0) {
    const { data: gemPackage } = await supabase
      .from('currency_packages')
      .select('gem_amount, bonus_gems')
      .eq('gem_amount', gemAmount)
      .single();

    if (gemPackage) {
      bonusGems = gemPackage.bonus_gems || 0;
      totalGems = gemAmount + bonusGems;
    }
  }

  console.log(`   Base: ${gemAmount}, Bonus: ${bonusGems}, Total: ${totalGems}`);

  // If user exists, add gems directly
  if (userId) {
    // Get current balance from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('gems')
      .eq('id', userId)
      .single();

    const currentBalance = profile?.gems || 0;
    const newBalance = currentBalance + totalGems;

    // Update profiles.gems with OPTIMISTIC LOCKING to prevent race condition
    // If another request changed the balance, .eq('gems', currentBalance) will match 0 rows
    const { error: updateError, count: updateCount } = await supabase
      .from('profiles')
      .update({ gems: newBalance })
      .eq('id', userId)
      .eq('gems', currentBalance);

    if (updateError) {
      console.error('❌ Failed to update gems:', updateError);
      throw updateError;
    }

    // If optimistic lock failed (another concurrent update), retry once
    if (updateCount === 0) {
      console.log('⚠️ Gem balance changed concurrently, retrying...');
      const { data: freshProfile } = await supabase
        .from('profiles')
        .select('gems')
        .eq('id', userId)
        .single();

      const freshBalance = freshProfile?.gems || 0;
      const retryBalance = freshBalance + totalGems;

      const { error: retryError } = await supabase
        .from('profiles')
        .update({ gems: retryBalance })
        .eq('id', userId)
        .eq('gems', freshBalance);

      if (retryError) {
        console.error('❌ Retry failed to update gems:', retryError);
        throw retryError;
      }
    }

    // Log transaction to gems_transactions
    await supabase.from('gems_transactions').insert({
      user_id: userId,
      type: 'purchase',
      amount: totalGems,
      description: `Mua ${totalGems} gems qua Shopify (${gemAmount} + ${bonusGems} bonus)`,
      reference_type: 'shopify_order',
      reference_id: orderData.id.toString(),
      balance_before: currentBalance,
      balance_after: newBalance,
      metadata: {
        order_number: orderData.order_number || orderData.name,
        price_paid: orderData.total_price,
        currency: orderData.currency,
        base_gems: gemAmount,
        bonus_gems: bonusGems
      }
    });

    console.log(`✅ Added ${totalGems} gems to user ${userId}. New balance: ${newBalance}`);
    return { success: true, totalGems, newBalance };
  }

  // User not found - save to pending_gem_credits (GEM_ECONOMY v2)
  console.log(`⏳ User not found, saving to pending_gem_credits...`);

  // Try new pending_gem_credits table first
  // NOTE: Column is gems_amount (not gem_amount) per schema in 20251209_gem_economy.sql
  const { error: pendingError } = await supabase.from('pending_gem_credits').insert({
    email: customerEmail,
    order_id: orderData.id.toString(),
    order_number: orderData.order_number?.toString() || orderData.name,
    gems_amount: totalGems,
    status: 'pending',
  });

  if (pendingError) {
    console.log('⚠️ pending_gem_credits failed, trying pending_gem_purchases...');
    // Fallback to legacy table
    const { error: legacyError } = await supabase.from('pending_gem_purchases').insert({
      email: customerEmail,
      order_id: orderData.id.toString(),
      gem_amount: totalGems,
      price_paid: parseFloat(orderData.total_price) || 0,
      currency: orderData.currency || 'VND',
      purchased_at: new Date().toISOString(),
      applied: false
    });

    if (legacyError) {
      console.error('❌ Failed to save pending gems:', legacyError);
    } else {
      console.log(`✅ Pending gems saved (legacy) for ${customerEmail}`);
    }
  } else {
    console.log(`✅ Pending gems saved for ${customerEmail}`);
  }

  return { success: true, totalGems, pending: true };
}
// ========================================
// HANDLER: orders/create event
// ========================================
async function handleOrderCreated(supabase, orderData) {
  console.log('📦 Handling ORDER CREATED:', orderData.id);
  const customerEmail = orderData.customer?.email || orderData.email;
  const lineItems = orderData.line_items || [];
  const productTypeCategory = determineProductType(lineItems);
  const partnerId = getPartnerIdFromOrder(orderData);
  const { productType, tierPurchased, amountPaid } = extractTierFromSku(lineItems);
  console.log(`📧 Customer: ${customerEmail}`);
  console.log(`📦 Product Type: ${productTypeCategory}`);
  console.log(`🎫 Tier: ${tierPurchased}`);
  console.log(`👥 Partner ID: ${partnerId || 'none (organic)'}`);
  // Save order to shopify_orders table (status: pending)
  const { error: insertError } = await supabase.from('shopify_orders').upsert({
    shopify_order_id: orderData.id.toString(),
    order_number: orderData.order_number?.toString() || orderData.name,
    email: customerEmail,
    total_price: parseFloat(orderData.total_price) || 0,
    subtotal_price: parseFloat(orderData.subtotal_price) || 0,
    currency: orderData.currency || 'VND',
    financial_status: orderData.financial_status || 'pending',
    fulfillment_status: orderData.fulfillment_status || 'unfulfilled',
    line_items: lineItems,
    product_type: productType,
    tier_purchased: tierPurchased,
    amount: amountPaid,
    partner_id: partnerId,
    created_at: orderData.created_at || new Date().toISOString(),
    paid_at: null,
    processed_at: null
  }, {
    onConflict: 'shopify_order_id'
  });
  if (insertError) {
    console.error('❌ Failed to save order:', insertError);
  // Don't fail - order might already exist
  } else {
    console.log('✅ Order created saved (waiting for payment)');
  }
  return new Response(JSON.stringify({
    success: true,
    message: 'Order created, waiting for payment',
    order_id: orderData.id,
    financial_status: orderData.financial_status,
    partner_id: partnerId
  }), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
// ========================================
// HANDLER: orders/paid event (MAIN LOGIC)
// ========================================
async function handleOrderPaid(supabase, orderData) {
  console.log('💰 Handling ORDER PAID:', orderData.id);
  const customerEmail = orderData.customer?.email || orderData.email;
  const orderIdShopify = orderData.id;
  const lineItems = orderData.line_items || [];
  const partnerId = getPartnerIdFromOrder(orderData);
  const userIdFromOrder = getUserIdFromOrder(orderData); // NEW: Get user_id from mobile app
  const orderSource = getOrderSource(orderData); // NEW: Track order source (mobile_app, web, etc.)

  console.log(`📱 Order source: ${orderSource}, user_id from order: ${userIdFromOrder || 'none'}`);


  // ========================================
  // CRITICAL: Check if already processed to prevent duplicate grants
  // This prevents race condition when orders/paid and orders/updated
  // webhooks fire simultaneously
  // ========================================
  const { data: existingOrder } = await supabase
    .from('shopify_orders')
    .select('processed_at')
    .eq('shopify_order_id', orderIdShopify.toString())
    .single();

  if (existingOrder?.processed_at) {
    console.log('⚠️ Order already processed, skipping to prevent duplicate grant');
    return new Response(JSON.stringify({
      success: true,
      message: 'Order already processed',
      skipped: true
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }

  // ========================================
  // CROSS-WEBHOOK DEDUP: Check if shopify-paid-webhook already processed
  // Both webhooks listen to orders/paid — prevent double processing
  // ========================================
  const { data: processedByPaidWebhook } = await supabase
    .from('shopify_webhook_logs')
    .select('id')
    .eq('topic', 'orders/paid')
    .eq('shopify_id', orderIdShopify.toString())
    .eq('processed', true)
    .maybeSingle();

  if (processedByPaidWebhook) {
    console.log('⚠️ Order already processed by shopify-paid-webhook, skipping (cross-dedup)');
    return new Response(JSON.stringify({
      success: true,
      message: 'Already processed by paid webhook (cross-dedup)',
      skipped: true
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }

  // ========================================
  // CRITICAL: Immediately mark as processing to prevent race condition
  // ========================================
  const { error: lockError } = await supabase
    .from('shopify_orders')
    .upsert({
      shopify_order_id: orderIdShopify.toString(),
      email: customerEmail,
      financial_status: 'processing',
      processed_at: new Date().toISOString()
    }, {
      onConflict: 'shopify_order_id'
    });

  if (lockError) {
    console.error('⚠️ Failed to lock order, may be processed by another request');
  } else {
    console.log('🔒 Order locked for processing');
  }

  if (!customerEmail) {
    console.error('❌ No customer email in order');
    return new Response(JSON.stringify({
      error: 'No customer email'
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  console.log(`📧 Order from: ${customerEmail}, Order ID: ${orderIdShopify}`);

  // ========================================
  // STEP 0.5: Check for individual course purchases
  // Enroll user in matched courses, then CONTINUE to tier processing
  // (Do NOT return early — order may contain both individual courses AND tier products)
  // ========================================
  const individualCourses = await extractIndividualCourses(lineItems, supabase);
  let enrolledCourseResults = [];
  if (individualCourses.length > 0) {
    console.log(`📚 Found ${individualCourses.length} individual course(s) in order`);

    // Find user by email (use profiles table - single source of truth)
    const { data: courseUserData } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .single();

    if (courseUserData) {
      // Grant access to each course
      for (const course of individualCourses) {
        const result = await grantCourseAccess(
          supabase,
          courseUserData.id,
          course.course_id,
          'purchase',
          orderData
        );
        enrolledCourseResults.push({ ...course, result });
      }
      console.log(`✅ Enrolled user in ${enrolledCourseResults.length} course(s), continuing to tier processing...`);
    } else {
      // Save to pending for when user signs up
      console.log(`⏳ User not found, saving individual courses to pending...`);
      for (const course of individualCourses) {
        await supabase.from('pending_course_access').insert({
          email: customerEmail,
          course_id: course.course_id,
          shopify_order_id: orderIdShopify.toString(),
          access_type: 'purchase',
          price_paid: course.price,
          purchased_at: new Date().toISOString(),
          applied: false,
        });
      }
      console.log(`✅ Saved ${individualCourses.length} course(s) to pending, continuing to tier processing...`);
    }
  }
  // NOTE: No early return here — always continue to STEP 1 for tier extraction

  // ========================================
  // STEP 1: Extract tier info from SKU
  // ========================================
  let { productType, tierPurchased, amountPaid, gemAmount, variantId } = extractTierFromSku(lineItems);
  // If amountPaid is 0, use total_price
  if (amountPaid === 0) {
    amountPaid = parseFloat(orderData.total_price) || 0;
  }
  console.log(`💎 Product: ${productType}, Tier: ${tierPurchased}, Amount: ${amountPaid}, Gems: ${gemAmount}`);
  // ========================================
  // STEP 2: Find user (PRIORITY: user_id from order > email lookup)
  // ========================================
  let userData = null;
  let userError = null;

  // Priority 1: Use user_id from note_attributes (passed from Mobile App)
  if (userIdFromOrder) {
    console.log(`📱 Looking up user by ID: ${userIdFromOrder}`);
    const { data, error } = await supabase.from('profiles').select('id, email, course_tier, scanner_tier, chatbot_tier').eq('id', userIdFromOrder).single();
    if (!error && data) {
      userData = data;
      console.log(`✅ Found user by ID: ${data.id} (email: ${data.email})`);
    } else {
      console.log(`⚠️ user_id from order not found in database, falling back to email`);
    }
  }

  // Priority 2: Fallback to email lookup
  if (!userData && customerEmail) {
    console.log(`📧 Looking up user by email: ${customerEmail}`);
    const { data, error } = await supabase.from('profiles').select('id, email, course_tier, scanner_tier, chatbot_tier').eq('email', customerEmail).single();
    userData = data;
    userError = error;
    if (data) {
      console.log(`✅ Found user by email: ${data.id}`);
    }
  }

  // ========================================
  // STEP 2.1: Handle GEM PURCHASE (special case)
  // ========================================
  if (productType === 'gems' && gemAmount > 0) {
    console.log(`💎 Processing GEM purchase...`);
    const userId = userData?.id || null;

    // Pass variantId for gem_packs table lookup
    const gemResult = await processGemPurchase(supabase, userId, customerEmail, gemAmount, orderData, variantId);

    // Update order record
    await supabase.from('shopify_orders').upsert({
      shopify_order_id: orderIdShopify.toString(),
      order_number: orderData.order_number?.toString() || orderData.name,
      user_id: userId,
      email: customerEmail,
      total_price: parseFloat(orderData.total_price) || 0,
      product_type: 'gems',
      tier_purchased: 'none',
      amount: amountPaid,
      partner_id: partnerId,
      financial_status: 'paid',
      paid_at: new Date().toISOString(),
      processed_at: new Date().toISOString()
    }, {
      onConflict: 'shopify_order_id'
    });

    return new Response(JSON.stringify({
      success: true,
      message: gemResult.pending
        ? 'Gems saved to pending. Will be applied when user signs up.'
        : `Added ${gemResult.totalGems} gems to user account`,
      product_type: 'gems',
      gem_amount: gemResult.totalGems,
      user_id: userId,
      pending: gemResult.pending || false
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }

  // ========================================
  // STEP 2.5: If user not found, save to pending
  // ========================================
  if (userError || !userData) {
    console.log(`⏳ User not found for email: ${customerEmail}`);
    console.log(`   Saving to pending_tier_upgrades table...`);
    let bundleInfo = null;
    if (productType === 'course') {
      const bundleMapping = {
        'TIER1': {
          scanner: 'TIER1',
          chatbot: 'TIER1',
          months: 12
        },
        'TIER2': {
          scanner: 'TIER2',
          chatbot: 'TIER2',
          months: 12
        },
        'TIER3': {
          scanner: 'TIER3',
          chatbot: 'TIER2',
          months: 24
        }
      };
      bundleInfo = bundleMapping[tierPurchased];
    }
    const { error: pendingError } = await supabase.from('pending_tier_upgrades').insert({
      email: customerEmail,
      order_id: orderIdShopify,
      product_type: productType,
      tier_purchased: tierPurchased,
      amount: amountPaid,
      purchased_at: new Date().toISOString(),
      applied: false,
      bundle_scanner_tier: bundleInfo?.scanner || null,
      bundle_chatbot_tier: bundleInfo?.chatbot || null,
      bundle_duration_months: bundleInfo?.months || null,
      partner_id: partnerId
    });
    if (pendingError) {
      console.error('❌ Failed to save pending upgrade:', pendingError);
    } else {
      console.log(`✅ Pending upgrade saved for ${customerEmail}`);
    }
    // Update order status
    await supabase.from('shopify_orders').update({
      financial_status: 'paid',
      paid_at: new Date().toISOString()
    }).eq('shopify_order_id', orderIdShopify.toString());
    return new Response(JSON.stringify({
      success: true,
      message: 'Order saved. Tier will be applied when user signs up.',
      email: customerEmail,
      product_type: productType,
      tier: tierPurchased,
      pending: true
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  const userId = userData.id;
  const oldCourseTier = userData.course_tier;
  const oldScannerTier = userData.scanner_tier;
  const oldChatbotTier = userData.chatbot_tier;
  console.log(`👤 Found user ${userId}`);
  console.log(`   Course: ${oldCourseTier}, Scanner: ${oldScannerTier}, Chatbot: ${oldChatbotTier}`);
  // ========================================
  // STEP 3: Update user tier (EXISTING LOGIC)
  // ========================================
  const calculateExpiryDate = (months)=>{
    const now = new Date();
    now.setMonth(now.getMonth() + months);
    return now.toISOString();
  };
  const updateData = {
    updated_at: new Date().toISOString()
  };
  const shouldUpgradeTier = productType !== 'physical';
  if (shouldUpgradeTier && productType === 'course') {
    const bundleMapping = {
      'TIER1': {
        scanner: 'TIER1',
        chatbot: 'TIER1',
        months: 12
      },
      'TIER2': {
        scanner: 'TIER2',
        chatbot: 'TIER2',
        months: 12
      },
      'TIER3': {
        scanner: 'TIER3',
        chatbot: 'TIER2',
        months: 24
      }
    };
    const bundle = bundleMapping[tierPurchased];
    if (bundle) {
      const expiryDate = calculateExpiryDate(bundle.months);
      updateData.course_tier = tierPurchased;
      updateData.course_tier_expires_at = expiryDate;
      updateData.scanner_tier = bundle.scanner;
      updateData.scanner_tier_expires_at = expiryDate;
      updateData.chatbot_tier = bundle.chatbot;
      updateData.chatbot_tier_expires_at = expiryDate;
      updateData.tier = tierPurchased;
      // NOTE: tier_expires_at column does NOT exist on profiles table — do not set it
      console.log(`⭐ BUNDLE GRANTED: Course ${tierPurchased}, Scanner ${bundle.scanner}, Chatbot ${bundle.chatbot}`);
    }
  } else if (shouldUpgradeTier && productType === 'scanner') {
    updateData.scanner_tier = tierPurchased;
    updateData.scanner_tier_expires_at = calculateExpiryDate(1);
    updateData.tier = tierPurchased;
    // NOTE: tier_expires_at column does NOT exist on profiles table — do not set it
  } else if (shouldUpgradeTier && productType === 'chatbot') {
    updateData.chatbot_tier = tierPurchased;
    updateData.chatbot_tier_expires_at = calculateExpiryDate(1);
  }
  if (shouldUpgradeTier) {
    const { error: updateError } = await supabase.from('profiles').update(updateData).eq('id', userId);
    if (updateError) {
      console.error('❌ Failed to update tier:', updateError);
    } else {
      console.log(`✅ User ${productType}_tier updated: ${tierPurchased}`);
    }
  }
  // ========================================
  // STEP 4: AFFILIATE COMMISSION TRACKING (ENHANCED)
  // ========================================
  console.log(`🎯 Checking for affiliate referral...`);
  try {
    // First check: partner_id from order note_attributes
    let affiliateId = partnerId;
    let referralData = null;
    // If no partner_id in order, check affiliate_referrals table
    if (!affiliateId) {
      const { data: refData, error: referralError } = await supabase.from('affiliate_referrals').select(`
          id,
          affiliate_id,
          referral_code,
          status,
          affiliate_profile:affiliate_profiles!affiliate_id (
            id,
            user_id,
            role,
            ctv_tier,
            total_sales
          )
        `).eq('referred_user_id', userId).eq('status', 'pending').single();
      if (!referralError && refData) {
        referralData = refData;
        affiliateId = refData.affiliate_id;
      }
    }
    // If we have an affiliate, process commission
    // SECURITY: Prevent self-referral (user earning commission on own purchase)
    if (affiliateId && affiliateId === userId) {
      console.log(`⚠️ Self-referral detected! User ${userId} cannot earn commission on own purchase.`);
      affiliateId = null;
    }

    if (affiliateId) {
      console.log(`🎉 AFFILIATE FOUND! ID: ${affiliateId}`);
      // Get affiliate profile if not already fetched
      // v3.0: Include referred_by and monthly_sales fields
      let affiliateProfile = referralData?.affiliate_profile;
      if (!affiliateProfile) {
        const { data: profile } = await supabase
          .from('affiliate_profiles')
          .select('id, user_id, role, ctv_tier, total_sales, monthly_sales, referred_by, sub_affiliate_earnings')
          .eq('user_id', affiliateId)
          .single();
        affiliateProfile = profile;
      }
      if (affiliateProfile) {
        const role = affiliateProfile.role;
        const ctvTier = affiliateProfile.ctv_tier || 'bronze';
        const productTypeCategory = determineProductType(lineItems);  // 'digital' or 'physical'
        console.log(`   Role: ${role}, CTV Tier: ${ctvTier}, Product: ${productTypeCategory}`);

        // ========================================
        // v3.0: Calculate commission rate based on role, tier, and product type
        // ========================================
        const commissionRate = getCommissionRateV3(role, ctvTier, productTypeCategory);

        if (commissionRate > 0) {
          const commissionAmount = Math.floor(amountPaid * commissionRate / 100);
          console.log(`💰 Commission: ${amountPaid} × ${commissionRate}% = ${commissionAmount}`);

          // ========================================
          // v3.0: Process sub-affiliate commission
          // ========================================
          let subAffiliateId = null;
          let subAffiliateCommission = 0;
          let subAffiliateRate = 0;

          if (affiliateProfile.referred_by) {
            console.log(`   Checking sub-affiliate for referrer: ${affiliateProfile.referred_by}`);

            // Get referrer (the one who referred this affiliate)
            const { data: referrerProfile } = await supabase
              .from('affiliate_profiles')
              .select('user_id, role, ctv_tier, sub_affiliate_earnings, available_balance')
              .eq('user_id', affiliateProfile.referred_by)
              .single();

            if (referrerProfile) {
              subAffiliateId = referrerProfile.user_id;
              subAffiliateRate = getSubAffiliateRateV3(referrerProfile.role, referrerProfile.ctv_tier || 'bronze');
              subAffiliateCommission = Math.floor(amountPaid * subAffiliateRate / 100);

              console.log(`   Sub-affiliate: ${subAffiliateId} gets ${subAffiliateRate}% = ${subAffiliateCommission}`);

              // Update referrer's sub_affiliate_earnings
              await supabase
                .from('affiliate_profiles')
                .update({
                  sub_affiliate_earnings: (referrerProfile.sub_affiliate_earnings || 0) + subAffiliateCommission,
                  available_balance: (referrerProfile.available_balance || 0) + subAffiliateCommission,
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', subAffiliateId);

              console.log(`✅ Sub-affiliate commission added: ${subAffiliateCommission} to ${subAffiliateId}`);
            }
          }

          // Try new commission_sales table first (from SQL migration)
          const { error: commissionSalesError } = await supabase.from('commission_sales').insert({
            partner_id: affiliateId,
            shopify_order_id: orderIdShopify.toString(),
            order_total: amountPaid,
            product_type: productTypeCategory,  // v3.0: 'digital' or 'physical'
            product_category: productType,
            commission_rate: commissionRate / 100,
            commission_amount: commissionAmount,
            status: 'pending',
            buyer_email: customerEmail,
            buyer_user_id: userId,
            // v3.0: Sub-affiliate tracking
            sub_affiliate_id: subAffiliateId,
            sub_affiliate_commission: subAffiliateCommission,
            sub_affiliate_rate: subAffiliateRate / 100,
            affiliate_role: role,
            affiliate_tier: ctvTier,
            created_at: new Date().toISOString()
          });
          if (commissionSalesError) {
            console.log('⚠️ commission_sales insert failed, trying affiliate_commissions...');
            // Fallback to existing affiliate_commissions table with v3.0 fields
            await supabase.from('affiliate_commissions').insert({
              affiliate_id: affiliateId,
              commission_rate: commissionRate / 100,
              commission_amount: commissionAmount,
              status: 'pending',
              // v3.0 fields
              affiliate_role: role,
              affiliate_tier: ctvTier,
              sub_affiliate_id: subAffiliateId,
              sub_affiliate_commission: subAffiliateCommission,
              sub_affiliate_rate: subAffiliateRate / 100,
              created_at: new Date().toISOString()
            });
          }
          // Create sale record
          await supabase.from('affiliate_sales').insert({
            affiliate_id: affiliateId,
            referral_id: referralData?.id || null,
            product_type: `${productType}-${tierPurchased}`,
            product_name: `${productType?.toUpperCase()} ${tierPurchased?.toUpperCase()}`,
            sale_amount: amountPaid,
            purchase_date: new Date().toISOString(),
            buyer_id: userId
          });
          // Update referral status if exists
          if (referralData) {
            await supabase.from('affiliate_referrals').update({
              status: 'converted',
              first_purchase_date: new Date().toISOString()
            }).eq('id', referralData.id);
          }
          // Update affiliate total_sales AND monthly_sales (v3.0)
          await supabase.from('affiliate_profiles').update({
            total_sales: (affiliateProfile.total_sales || 0) + amountPaid,
            monthly_sales: (affiliateProfile.monthly_sales || 0) + amountPaid,  // v3.0: For downgrade check
            updated_at: new Date().toISOString()
          }).eq('user_id', affiliateId);
          // Try to record course enrollment for KPI (if function exists)
          if (productType === 'course') {
            try {
              await supabase.rpc('record_course_enrollment', {
                partner_id_param: affiliateId,
                user_id_param: userId,
                order_id_param: orderIdShopify.toString(),
                product_name_param: lineItems[0]?.name || `Course ${tierPurchased}`,
                sku_param: lineItems[0]?.sku || `course-${tierPurchased?.toLowerCase()}`,
                price_param: amountPaid
              });
              console.log('✅ Course enrollment recorded for KPI');
            } catch (kpiError) {
              console.log('ℹ️ KPI function not available (optional)');
            }
          }
          console.log(`🎉 AFFILIATE COMMISSION COMPLETE! Amount: ${commissionAmount}`);

          // Send push notification to partner
          const supabaseUrl = Deno.env.get('SUPABASE_URL');
          const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
          if (supabaseUrl && supabaseServiceKey) {
            const orderNumber = orderData.order_number?.toString() || orderData.name || orderIdShopify.toString();
            const productDisplayName = lineItems[0]?.name || `${productType?.toUpperCase()} ${tierPurchased}`;
            await sendCommissionNotification(
              supabaseUrl,
              supabaseServiceKey,
              affiliateId,
              orderNumber,
              commissionAmount,
              productDisplayName
            );
          }
        } else {
          console.log(`ℹ️ Role '${role}' does not earn commissions`);
        }
      }
    } else {
      console.log('ℹ️ No affiliate found (organic purchase)');
    }
  } catch (affiliateError) {
    console.error('⚠️ Affiliate tracking error (non-blocking):', affiliateError);
  }
  // ========================================
  // STEP 5: Log transaction to shopify_orders
  // ========================================
  await supabase.from('shopify_orders').upsert({
    shopify_order_id: orderIdShopify.toString(),
    order_number: orderData.order_number?.toString() || orderData.name,
    user_id: userId,
    email: customerEmail,
    total_price: parseFloat(orderData.total_price) || 0,
    product_type: productType,
    tier_purchased: tierPurchased,
    amount: amountPaid,
    partner_id: partnerId,
    financial_status: 'paid',
    paid_at: new Date().toISOString(),
    processed_at: new Date().toISOString()
  }, {
    onConflict: 'shopify_order_id'
  });
  console.log('✅ Transaction logged successfully');
  // ========================================
  // STEP 6: Return success response
  // ========================================
  return new Response(JSON.stringify({
    success: true,
    message: enrolledCourseResults.length > 0
      ? `Tier upgraded + ${enrolledCourseResults.length} course(s) enrolled`
      : 'Tier upgraded successfully',
    user_id: userId,
    product_type: productType,
    old_tier: productType === 'course' ? oldCourseTier : productType === 'scanner' ? oldScannerTier : oldChatbotTier,
    new_tier: tierPurchased,
    partner_id: partnerId,
    enrolled_courses: enrolledCourseResults.length > 0 ? enrolledCourseResults : undefined,
  }), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
// ========================================
// HANDLER: orders/updated event
// ========================================
async function handleOrderUpdated(supabase, orderData) {
  console.log('🔄 Handling ORDER UPDATED:', orderData.id);
  // Check if order changed to paid
  if (orderData.financial_status === 'paid') {
    // Check if already processed
    const { data: existing } = await supabase.from('shopify_orders').select('processed_at').eq('shopify_order_id', orderData.id.toString()).single();
    if (!existing?.processed_at) {
      console.log('📌 Order updated to PAID - processing...');
      return await handleOrderPaid(supabase, orderData);
    } else {
      console.log('ℹ️ Order already processed');
    }
  }

  // Check if order was refunded or cancelled
  if (orderData.financial_status === 'refunded' || orderData.financial_status === 'partially_refunded' || orderData.cancelled_at) {
    console.log(`🔄 Order status changed to ${orderData.financial_status || 'cancelled'}, processing reversal...`);
    return await handleOrderRefunded(supabase, orderData);
  }

  // Update order record
  await supabase.from('shopify_orders').update({
    financial_status: orderData.financial_status,
    fulfillment_status: orderData.fulfillment_status
  }).eq('shopify_order_id', orderData.id.toString());
  return new Response(JSON.stringify({
    success: true,
    message: 'Order update logged'
  }), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
// ========================================
// HANDLER: orders/cancelled or refunded
// Reverses: tier upgrades, gem credits, commissions
// ========================================
async function handleOrderRefunded(supabase, orderData) {
  const orderId = orderData.id.toString();
  const customerEmail = orderData.customer?.email || orderData.email;
  console.log(`🔴 Handling ORDER REFUND/CANCEL: ${orderId} for ${customerEmail}`);

  // Check if this order was previously processed
  const { data: existingOrder } = await supabase
    .from('shopify_orders')
    .select('user_id, product_type, tier_purchased, processed_at, financial_status')
    .eq('shopify_order_id', orderId)
    .single();

  if (!existingOrder?.processed_at) {
    console.log('ℹ️ Order was never processed, nothing to reverse');
    // Update status anyway
    await supabase.from('shopify_orders').update({
      financial_status: orderData.financial_status || 'cancelled',
    }).eq('shopify_order_id', orderId);
    return new Response(JSON.stringify({
      success: true,
      message: 'Order was never processed, no reversal needed',
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (existingOrder.financial_status === 'refunded') {
    console.log('ℹ️ Order already refunded, skipping duplicate');
    return new Response(JSON.stringify({
      success: true,
      message: 'Refund already processed',
      skipped: true,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const userId = existingOrder.user_id;
  const productType = existingOrder.product_type;
  const lineItems = orderData.line_items || [];
  const results = { tier_reversed: false, gems_reversed: false, commission_reversed: false };

  // ========================================
  // REVERSAL 1: Reverse tier upgrade (reset to FREE)
  // ========================================
  if (userId && productType && productType !== 'gems' && productType !== 'physical') {
    console.log(`⬇️ Reversing tier upgrade for user ${userId}, product: ${productType}`);

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };

    if (productType === 'course') {
      updateData.course_tier = 'FREE';
      updateData.course_tier_expires_at = null;
      updateData.scanner_tier = 'FREE';
      updateData.scanner_tier_expires_at = null;
      updateData.chatbot_tier = 'FREE';
      updateData.chatbot_tier_expires_at = null;
      updateData.tier = 'FREE';
      updateData.tier_expires_at = null;
    } else if (productType === 'scanner') {
      updateData.scanner_tier = 'FREE';
      updateData.scanner_tier_expires_at = null;
      updateData.tier = 'FREE';
      updateData.tier_expires_at = null;
    } else if (productType === 'chatbot') {
      updateData.chatbot_tier = 'FREE';
      updateData.chatbot_tier_expires_at = null;
    }

    const { error: revertError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (revertError) {
      console.error('❌ Failed to reverse tier:', revertError);
    } else {
      console.log(`✅ Tier reversed to FREE for user ${userId}`);
      results.tier_reversed = true;
    }
  }

  // ========================================
  // REVERSAL 2: Reverse gem credits
  // ========================================
  if (userId && productType === 'gems') {
    // Find the original gem transaction for this order
    const { data: gemTx } = await supabase
      .from('gems_transactions')
      .select('amount, id')
      .eq('user_id', userId)
      .eq('reference_id', orderId)
      .eq('type', 'purchase')
      .maybeSingle();

    if (gemTx) {
      const gemsToRemove = gemTx.amount;
      console.log(`💎 Reversing ${gemsToRemove} gems for user ${userId}`);

      // Get current balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('gems')
        .eq('id', userId)
        .single();

      const currentBalance = profile?.gems || 0;
      const newBalance = Math.max(0, currentBalance - gemsToRemove);

      // Deduct gems with optimistic lock
      const { error: deductError } = await supabase
        .from('profiles')
        .update({ gems: newBalance })
        .eq('id', userId)
        .eq('gems', currentBalance);

      if (deductError) {
        console.error('❌ Failed to reverse gems:', deductError);
      } else {
        // Log reversal transaction
        await supabase.from('gems_transactions').insert({
          user_id: userId,
          type: 'refund',
          amount: -gemsToRemove,
          description: `Hoàn tiền đơn hàng #${orderData.order_number || orderId}`,
          reference_type: 'shopify_refund',
          reference_id: orderId,
          balance_before: currentBalance,
          balance_after: newBalance,
        });
        console.log(`✅ Reversed ${gemsToRemove} gems. Balance: ${currentBalance} → ${newBalance}`);
        results.gems_reversed = true;
      }
    }

    // Also mark any pending_gem_credits as revoked
    await supabase.from('pending_gem_credits')
      .update({ status: 'revoked' })
      .eq('order_id', orderId);
  }

  // ========================================
  // REVERSAL 3: Reverse affiliate commissions
  // ========================================
  // Mark commissions as 'reversed' in commission_sales
  const { error: commRevError } = await supabase
    .from('commission_sales')
    .update({ status: 'reversed' })
    .eq('shopify_order_id', orderId);

  if (!commRevError) {
    console.log('✅ Commission marked as reversed');
    results.commission_reversed = true;
  } else {
    // Try affiliate_commissions fallback table
    console.log('ℹ️ commission_sales update failed, trying affiliate_commissions...');
  }

  // Also mark pending_tier_upgrades as revoked if not yet applied
  await supabase.from('pending_tier_upgrades')
    .update({ applied: true })
    .eq('order_id', orderId.toString())
    .eq('applied', false);

  // ========================================
  // Update order record with refund status
  // ========================================
  await supabase.from('shopify_orders').update({
    financial_status: orderData.financial_status || 'refunded',
    refunded_at: new Date().toISOString(),
  }).eq('shopify_order_id', orderId);

  console.log(`✅ Refund processing complete for order ${orderId}`, results);

  return new Response(JSON.stringify({
    success: true,
    message: 'Refund processed',
    order_id: orderId,
    reversals: results,
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
// ========================================
// MAIN: Webhook Entry Point
// ========================================
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // ========================================
    // 1. VERIFY SHOPIFY HMAC SIGNATURE
    // ========================================
    const hmacHeader = req.headers.get('X-Shopify-Hmac-Sha256');
    const shopifySecret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET');
    if (!hmacHeader || !shopifySecret) {
      console.error('❌ Missing HMAC header or secret');
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Read request body
    const bodyText = await req.text();
    // Verify HMAC
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(shopifySecret), {
      name: 'HMAC',
      hash: 'SHA-256'
    }, false, [
      'sign'
    ]);
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(bodyText));
    const computedHmac = btoa(String.fromCharCode(...new Uint8Array(signature)));
    if (computedHmac !== hmacHeader) {
      console.error('❌ HMAC verification failed');
      return new Response(JSON.stringify({
        error: 'Invalid signature'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log('✅ HMAC verified successfully');
    // ========================================
    // 2. PARSE ORDER DATA & GET TOPIC
    // ========================================
    const topic = req.headers.get('X-Shopify-Topic');
    const orderData = JSON.parse(bodyText);
    console.log(`📨 Webhook received: ${topic}`, {
      order_id: orderData.id,
      financial_status: orderData.financial_status
    });
    // ========================================
    // 3. CONNECT TO SUPABASE
    // ========================================
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // ========================================
    // 4. LOG WEBHOOK TO shopify_webhook_logs
    // ========================================
    await supabase.from('shopify_webhook_logs').insert({
      topic: topic,
      shopify_id: orderData.id?.toString(),
      payload: orderData,
      processed: false
    });
    // ========================================
    // 5. ROUTE TO HANDLER BASED ON TOPIC
    // ========================================
    if (topic === 'orders/create') {
      return await handleOrderCreated(supabase, orderData);
    } else if (topic === 'orders/paid') {
      return await handleOrderPaid(supabase, orderData);
    } else if (topic === 'orders/updated') {
      return await handleOrderUpdated(supabase, orderData);
    } else if (topic === 'orders/cancelled' || topic === 'refunds/create') {
      return await handleOrderRefunded(supabase, orderData);
    }
    // ========================================
    // FALLBACK: Old behavior (check financial_status)
    // For backwards compatibility with existing webhook
    // ========================================
    console.log('⚠️ Unknown topic, using fallback logic...');
    if (orderData.financial_status === 'paid') {
      return await handleOrderPaid(supabase, orderData);
    } else {
      return await handleOrderCreated(supabase, orderData);
    }
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
