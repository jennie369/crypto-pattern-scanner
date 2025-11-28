import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

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
// HELPER: Get partner ID from order note_attributes
// ========================================
function getPartnerIdFromOrder(orderData) {
  const noteAttributes = orderData.note_attributes || [];
  const partnerAttr = noteAttributes.find((attr)=>attr.name === 'partner_id' || attr.name === 'ref' || attr.name === 'affiliate_id');
  return partnerAttr?.value || null;
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

  for (const item of lineItems){
    const sku = item.sku?.toLowerCase() || '';
    const price = parseFloat(item.price) || 0;
    quantity = item.quantity || 1;

    // ========================================
    // NEW: Gem pack detection (gem-pack-XXX)
    // ========================================
    if (sku.startsWith('gem-pack-')) {
      productType = 'gems';
      tierPurchased = 'none';
      amountPaid = price * quantity;
      // Extract gem amount from SKU (e.g., gem-pack-500 -> 500)
      const gemAmountStr = sku.replace('gem-pack-', '');
      gemAmount = parseInt(gemAmountStr, 10) * quantity;
      console.log(`💎 Gem pack detected: SKU=${sku}, Amount=${gemAmount}, Qty=${quantity}`);
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
    gemAmount
  };
}

// ========================================
// HELPER: Process Gem Purchase
// ========================================
async function processGemPurchase(supabase, userId: string | null, customerEmail: string, gemAmount: number, orderData: any) {
  console.log(`💎 Processing gem purchase: ${gemAmount} gems for ${customerEmail}`);

  // Lookup bonus from currency_packages table
  const { data: gemPackage } = await supabase
    .from('currency_packages')
    .select('gem_amount, bonus_gems')
    .eq('gem_amount', gemAmount)
    .single();

  const bonusGems = gemPackage?.bonus_gems || 0;
  const totalGems = gemAmount + bonusGems;
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

    // Update profiles.gems
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ gems: newBalance })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Failed to update gems:', updateError);
      throw updateError;
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

  // User not found - save to pending_gem_purchases
  console.log(`⏳ User not found, saving to pending_gem_purchases...`);
  const { error: pendingError } = await supabase.from('pending_gem_purchases').insert({
    email: customerEmail,
    order_id: orderData.id.toString(),
    gem_amount: totalGems,
    price_paid: parseFloat(orderData.total_price) || 0,
    currency: orderData.currency || 'VND',
    purchased_at: new Date().toISOString(),
    applied: false
  });

  if (pendingError) {
    console.error('❌ Failed to save pending gems:', pendingError);
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
  // STEP 1: Extract tier info from SKU
  // ========================================
  let { productType, tierPurchased, amountPaid, gemAmount } = extractTierFromSku(lineItems);
  // If amountPaid is 0, use total_price
  if (amountPaid === 0) {
    amountPaid = parseFloat(orderData.total_price) || 0;
  }
  console.log(`💎 Product: ${productType}, Tier: ${tierPurchased}, Amount: ${amountPaid}, Gems: ${gemAmount}`);
  // ========================================
  // STEP 2: Find user by email
  // ========================================
  const { data: userData, error: userError } = await supabase.from('users').select('id, course_tier, scanner_tier, chatbot_tier').eq('email', customerEmail).single();

  // ========================================
  // STEP 2.1: Handle GEM PURCHASE (special case)
  // ========================================
  if (productType === 'gems' && gemAmount > 0) {
    console.log(`💎 Processing GEM purchase...`);
    const userId = userData?.id || null;

    const gemResult = await processGemPurchase(supabase, userId, customerEmail, gemAmount, orderData);

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
      updateData.tier_expires_at = expiryDate;
      console.log(`⭐ BUNDLE GRANTED: Course ${tierPurchased}, Scanner ${bundle.scanner}, Chatbot ${bundle.chatbot}`);
    }
  } else if (shouldUpgradeTier && productType === 'scanner') {
    updateData.scanner_tier = tierPurchased;
    updateData.scanner_tier_expires_at = calculateExpiryDate(1);
    updateData.tier = tierPurchased;
    updateData.tier_expires_at = updateData.scanner_tier_expires_at;
  } else if (shouldUpgradeTier && productType === 'chatbot') {
    updateData.chatbot_tier = tierPurchased;
    updateData.chatbot_tier_expires_at = calculateExpiryDate(1);
  }
  if (shouldUpgradeTier) {
    const { error: updateError } = await supabase.from('users').update(updateData).eq('id', userId);
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
    if (affiliateId) {
      console.log(`🎉 AFFILIATE FOUND! ID: ${affiliateId}`);
      // Get affiliate profile if not already fetched
      let affiliateProfile = referralData?.affiliate_profile;
      if (!affiliateProfile) {
        const { data: profile } = await supabase.from('affiliate_profiles').select('id, user_id, role, ctv_tier, total_sales').eq('user_id', affiliateId).single();
        affiliateProfile = profile;
      }
      if (affiliateProfile) {
        const role = affiliateProfile.role;
        const ctvTier = affiliateProfile.ctv_tier;
        console.log(`   Role: ${role}, CTV Tier: ${ctvTier}`);
        // Calculate commission rate
        let commissionRate = 0;
        if (role === 'affiliate') {
          commissionRate = 3;
        } else if (role === 'ctv') {
          const ctvRates = {
            'beginner': 10,
            'growing': 15,
            'master': 20,
            'grand': 30
          };
          commissionRate = ctvRates[ctvTier] || 10;
        }
        if (commissionRate > 0) {
          const commissionAmount = Math.floor(amountPaid * commissionRate / 100);
          console.log(`💰 Commission: ${amountPaid} × ${commissionRate}% = ${commissionAmount}`);
          // Try new commission_sales table first (from SQL migration)
          const { error: commissionSalesError } = await supabase.from('commission_sales').insert({
            partner_id: affiliateId,
            shopify_order_id: orderIdShopify.toString(),
            order_total: amountPaid,
            product_type: determineProductType(lineItems),
            product_category: productType,
            commission_rate: commissionRate / 100,
            commission_amount: commissionAmount,
            status: 'pending',
            buyer_email: customerEmail,
            buyer_user_id: userId,
            created_at: new Date().toISOString()
          });
          if (commissionSalesError) {
            console.log('⚠️ commission_sales insert failed, trying affiliate_commissions...');
            // Fallback to existing affiliate_commissions table
            await supabase.from('affiliate_commissions').insert({
              affiliate_id: affiliateId,
              commission_rate: commissionRate / 100,
              commission_amount: commissionAmount,
              status: 'pending',
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
          // Update affiliate total_sales
          await supabase.from('affiliate_profiles').update({
            total_sales: (affiliateProfile.total_sales || 0) + amountPaid,
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
    message: 'Tier upgraded successfully',
    user_id: userId,
    product_type: productType,
    old_tier: productType === 'course' ? oldCourseTier : productType === 'scanner' ? oldScannerTier : oldChatbotTier,
    new_tier: tierPurchased,
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
