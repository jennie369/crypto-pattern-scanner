import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ========================================
    // 1. VERIFY SHOPIFY HMAC SIGNATURE
    // ========================================
    const hmacHeader = req.headers.get('X-Shopify-Hmac-Sha256')
    const shopifySecret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET')

    if (!hmacHeader || !shopifySecret) {
      console.error('❌ Missing HMAC header or secret')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Read request body
    const bodyText = await req.text()

    // Verify HMAC
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(shopifySecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(bodyText)
    )

    const computedHmac = btoa(String.fromCharCode(...new Uint8Array(signature)))

    if (computedHmac !== hmacHeader) {
      console.error('❌ HMAC verification failed')
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ HMAC verified successfully')

    // ========================================
    // 2. PARSE ORDER DATA
    // ========================================
    const orderData = JSON.parse(bodyText)

    const customerEmail = orderData.customer?.email
    const orderIdShopify = orderData.id
    const financialStatus = orderData.financial_status
    const lineItems = orderData.line_items || []

    if (!customerEmail) {
      console.error('❌ No customer email in order')
      return new Response(
        JSON.stringify({ error: 'No customer email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📧 Order from: ${customerEmail}, Order ID: ${orderIdShopify}`)
    console.log(`💰 Financial status: ${financialStatus}`)

    // ========================================
    // 2.5. CHECK PAYMENT STATUS
    // ========================================
    // Only process orders that are already paid
    // This prevents tier upgrades for pending/unpaid orders
    if (financialStatus !== 'paid') {
      console.log(`⏳ Order ${orderIdShopify} not paid yet (status: ${financialStatus})`)
      console.log(`   Skipping tier update. Will process when marked as paid.`)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Order received but not paid yet',
          order_id: orderIdShopify,
          financial_status: financialStatus,
          note: 'Tier will be upgraded when order is marked as paid'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ Order is paid. Processing tier upgrade...`)

    // ========================================
    // 3. EXTRACT PRODUCT TYPE & TIER FROM SKU
    // ========================================
    let productType = null // course, scanner, chatbot
    let tierPurchased = null
    let amountPaid = 0

    for (const item of lineItems) {
      const sku = item.sku?.toLowerCase() || ''
      const price = parseFloat(item.price) || 0

      // Course products
      if (sku.includes('gem-course-tier1') || sku.includes('course-tier1')) {
        productType = 'course'
        tierPurchased = 'TIER1'
        amountPaid = price
        break
      } else if (sku.includes('gem-course-tier2') || sku.includes('course-tier2')) {
        productType = 'course'
        tierPurchased = 'TIER2'
        amountPaid = price
        break
      } else if (sku.includes('gem-course-tier3') || sku.includes('course-tier3')) {
        productType = 'course'
        tierPurchased = 'TIER3'
        amountPaid = price
        break
      }

      // Scanner products (pro → TIER1, premium → TIER2, vip → TIER3)
      else if (sku.includes('gem-scanner-pro') || sku.includes('scanner-pro')) {
        productType = 'scanner'
        tierPurchased = 'TIER1'
        amountPaid = price
        break
      } else if (sku.includes('gem-scanner-premium') || sku.includes('scanner-premium')) {
        productType = 'scanner'
        tierPurchased = 'TIER2'
        amountPaid = price
        break
      } else if (sku.includes('gem-scanner-vip') || sku.includes('scanner-vip')) {
        productType = 'scanner'
        tierPurchased = 'TIER3'
        amountPaid = price
        break
      }

      // Chatbot products (pro → TIER1, premium → TIER2)
      else if (sku.includes('gem-chatbot-pro') || sku.includes('chatbot-pro')) {
        productType = 'chatbot'
        tierPurchased = 'TIER1'
        amountPaid = price
        break
      } else if (sku.includes('gem-chatbot-premium') || sku.includes('chatbot-premium')) {
        productType = 'chatbot'
        tierPurchased = 'TIER2'
        amountPaid = price
        break
      }
    }

    // If no tier product found, treat as physical product (crystals, jewelry, etc.)
    if (!productType || !tierPurchased) {
      console.log('💎 No tier product found, treating as physical/crystal product')
      productType = 'physical'
      tierPurchased = 'none'
      // amountPaid already set from total_price
    }

    console.log(`💎 Product: ${productType}, Tier: ${tierPurchased}, Amount: ${amountPaid}`)

    // ========================================
    // 4. CONNECT TO SUPABASE & UPDATE USER TIER
    // ========================================
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, course_tier, scanner_tier, chatbot_tier')
      .eq('email', customerEmail)
      .single()

    // ========================================
    // 4.5. IF USER NOT FOUND: SAVE TO PENDING TABLE
    // ========================================
    if (userError || !userData) {
      console.log(`⏳ User not found for email: ${customerEmail}`)
      console.log(`   Saving to pending_tier_upgrades table...`)

      // Determine bundle info for course purchases
      let bundleInfo = null
      if (productType === 'course') {
        const bundleMapping: { [key: string]: { scanner: string; chatbot: string; months: number } } = {
          'TIER1': { scanner: 'TIER1', chatbot: 'TIER1', months: 12 },
          'TIER2': { scanner: 'TIER2', chatbot: 'TIER2', months: 12 },
          'TIER3': { scanner: 'TIER3', chatbot: 'TIER2', months: 24 }
        }
        bundleInfo = bundleMapping[tierPurchased]

        if (bundleInfo) {
          console.log(`⭐ Course bundle detected:`)
          console.log(`   Scanner: ${bundleInfo.scanner}, Chatbot: ${bundleInfo.chatbot}`)
        }
      }

      // Save to pending_tier_upgrades table
      const { error: pendingError } = await supabase
        .from('pending_tier_upgrades')
        .insert({
          email: customerEmail,
          order_id: orderIdShopify,
          product_type: productType,
          tier_purchased: tierPurchased,
          amount: amountPaid,
          purchased_at: new Date().toISOString(),
          applied: false,
          // Store bundle info if it's a course
          bundle_scanner_tier: bundleInfo?.scanner || null,
          bundle_chatbot_tier: bundleInfo?.chatbot || null,
          bundle_duration_months: bundleInfo?.months || null
        })

      if (pendingError) {
        console.error('❌ Failed to save pending upgrade:', pendingError)
        return new Response(
          JSON.stringify({ error: 'Failed to save pending upgrade' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`✅ Pending upgrade saved for ${customerEmail}`)
      console.log(`   Product: ${productType}, Tier: ${tierPurchased}`)
      if (bundleInfo) {
        console.log(`   Bundle: Scanner ${bundleInfo.scanner} + Chatbot ${bundleInfo.chatbot}`)
      }
      console.log(`   Will be applied automatically when user signs up!`)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Order saved. Tier will be applied when user signs up.',
          email: customerEmail,
          product_type: productType,
          tier: tierPurchased,
          bundle: bundleInfo || null,
          pending: true
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const userId = userData.id
    const oldCourseTier = userData.course_tier
    const oldScannerTier = userData.scanner_tier
    const oldChatbotTier = userData.chatbot_tier

    console.log(`👤 Found user ${userId}`)
    console.log(`   Course: ${oldCourseTier}, Scanner: ${oldScannerTier}, Chatbot: ${oldChatbotTier}`)

    // ========================================
    // 4.5. CALCULATE EXPIRY DATES
    // ========================================
    const calculateExpiryDate = (months: number): string => {
      const now = new Date()
      now.setMonth(now.getMonth() + months)
      return now.toISOString()
    }

    // Prepare update object based on product type
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Skip tier upgrade for physical products (crystals, jewelry, etc.)
    const shouldUpgradeTier = productType !== 'physical'

    if (shouldUpgradeTier && productType === 'course') {
      // ⭐ AUTO-GRANT SCANNER + CHATBOT WHEN BUYING COURSE
      const bundleMapping: { [key: string]: { scanner: string; chatbot: string; months: number } } = {
        'TIER1': { scanner: 'TIER1', chatbot: 'TIER1', months: 12 },
        'TIER2': { scanner: 'TIER2', chatbot: 'TIER2', months: 12 },
        'TIER3': { scanner: 'TIER3', chatbot: 'TIER2', months: 24 }
      }

      const bundle = bundleMapping[tierPurchased]

      if (bundle) {
        const expiryDate = calculateExpiryDate(bundle.months)

        // Update course tier
        updateData.course_tier = tierPurchased
        updateData.course_tier_expires_at = expiryDate

        // ⭐ AUTO-GRANT Scanner
        updateData.scanner_tier = bundle.scanner
        updateData.scanner_tier_expires_at = expiryDate

        // ⭐ AUTO-GRANT Chatbot
        updateData.chatbot_tier = bundle.chatbot
        updateData.chatbot_tier_expires_at = expiryDate

        // Backward compatibility: Update old 'tier' column
        updateData.tier = tierPurchased
        updateData.tier_expires_at = expiryDate

        console.log(`⭐ BUNDLE GRANTED:`)
        console.log(`   Course: ${tierPurchased}`)
        console.log(`   Scanner: ${bundle.scanner}`)
        console.log(`   Chatbot: ${bundle.chatbot}`)
        console.log(`   Expires: ${expiryDate} (${bundle.months} months)`)
      } else {
        // Fallback if tier not mapped
        updateData.course_tier = tierPurchased
      }

    } else if (shouldUpgradeTier && productType === 'scanner') {
      updateData.scanner_tier = tierPurchased
      updateData.scanner_tier_expires_at = calculateExpiryDate(1) // 1 month for standalone

      // Also update old 'tier' column for backward compatibility
      updateData.tier = tierPurchased
      updateData.tier_expires_at = updateData.scanner_tier_expires_at

    } else if (shouldUpgradeTier && productType === 'chatbot') {
      updateData.chatbot_tier = tierPurchased
      updateData.chatbot_tier_expires_at = calculateExpiryDate(1) // 1 month for standalone
    }

    // Update user tier (skip for physical products)
    if (shouldUpgradeTier) {
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)

      if (updateError) {
        console.error('❌ Failed to update tier:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update tier' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`✅ User ${productType}_tier updated: ${tierPurchased}`)
    } else {
      console.log(`ℹ️  Physical product - no tier upgrade needed`)
    }

    // ========================================
    // 4.9. AFFILIATE COMMISSION TRACKING
    // ========================================
    console.log(`🎯 Checking for affiliate referral...`)

    try {
      // Look up referral by referred_user_id and status='pending'
      const { data: referralData, error: referralError } = await supabase
        .from('affiliate_referrals')
        .select(`
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
        `)
        .eq('referred_user_id', userId)
        .eq('status', 'pending')
        .single()

      if (referralError && referralError.code !== 'PGRST116') {
        console.error('⚠️ Referral lookup error:', referralError)
      }

      if (referralData && referralData.affiliate_profile) {
        console.log(`🎉 REFERRAL FOUND!`)
        console.log(`   Affiliate ID: ${referralData.affiliate_id}`)
        console.log(`   Role: ${referralData.affiliate_profile.role}`)
        console.log(`   CTV Tier: ${referralData.affiliate_profile.ctv_tier}`)

        // Calculate commission rate based on role and tier
        let commissionRate = 0
        const role = referralData.affiliate_profile.role
        const ctvTier = referralData.affiliate_profile.ctv_tier

        if (role === 'affiliate') {
          commissionRate = 3 // 3% fixed for affiliates
        } else if (role === 'ctv') {
          // CTV rates: beginner 10%, growing 15%, master 20%, grand 30%
          const ctvRates: { [key: string]: number } = {
            'beginner': 10,
            'growing': 15,
            'master': 20,
            'grand': 30
          }
          commissionRate = ctvRates[ctvTier] || 10
        } else if (role === 'instructor') {
          commissionRate = 0 // Instructors get salary, not commission
        }

        // Skip commission tracking for instructors (salary-based, not referral commission)
        if (commissionRate === 0) {
          console.log(`ℹ️  Role '${role}' does not earn referral commissions (salary-based)`)
          console.log(`✅ Referral tracked but no commission created`)
          return new Response(
            JSON.stringify({
              success: true,
              message: `Tier upgraded successfully. No commission for role: ${role}`,
              user_id: userId,
              product_type: productType,
              tier: tierPurchased
            }),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const commissionAmount = Math.floor((amountPaid * commissionRate) / 100)

        console.log(`💰 Commission Calculation:`)
        console.log(`   Order Total: ${amountPaid.toLocaleString()} VND`)
        console.log(`   Commission Rate: ${commissionRate}%`)
        console.log(`   Commission Amount: ${commissionAmount.toLocaleString()} VND`)

        // Create commission record
        const { error: commissionError } = await supabase
          .from('affiliate_commissions')
          .insert({
            affiliate_id: referralData.affiliate_id,
            sale_id: null, // Will be populated when we create affiliate_sales record
            commission_rate: commissionRate / 100, // Store as decimal (0.03, 0.10, etc.)
            commission_amount: commissionAmount,
            status: 'pending',
            created_at: new Date().toISOString()
          })

        if (commissionError) {
          console.error('❌ Failed to create commission:', commissionError)
        } else {
          console.log('✅ Commission record created')
        }

        // Create sale record in affiliate_sales
        const { error: saleError } = await supabase
          .from('affiliate_sales')
          .insert({
            affiliate_id: referralData.affiliate_id,
            referral_id: referralData.id,
            product_type: `${productType}-${tierPurchased}`,
            product_name: `${productType.toUpperCase()} ${tierPurchased.toUpperCase()}`,
            sale_amount: amountPaid,
            purchase_date: new Date().toISOString(),
            buyer_id: userId
          })

        if (saleError) {
          console.error('❌ Failed to create sale record:', saleError)
        } else {
          console.log('✅ Sale record created')
        }

        // Update referral status to 'converted'
        const { error: statusError } = await supabase
          .from('affiliate_referrals')
          .update({
            status: 'converted',
            first_purchase_date: new Date().toISOString()
          })
          .eq('id', referralData.id)

        if (statusError) {
          console.error('❌ Failed to update referral status:', statusError)
        } else {
          console.log('✅ Referral status updated to "converted"')
        }

        // Update affiliate profile total_sales (triggers tier upgrade via database trigger)
        const { error: statsError } = await supabase
          .from('affiliate_profiles')
          .update({
            total_sales: referralData.affiliate_profile.total_sales + amountPaid,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', referralData.affiliate_id)

        if (statsError) {
          console.error('❌ Failed to update affiliate stats:', statsError)
        } else {
          const newTotalSales = referralData.affiliate_profile.total_sales + amountPaid
          console.log('✅ Affiliate stats updated')
          console.log(`   Total Sales: ${newTotalSales.toLocaleString()} VND`)

          // Check if tier upgrade will be triggered
          if (newTotalSales >= 600000000 && ctvTier !== 'grand') {
            console.log('   🎉 TIER UPGRADE: → GRAND (600M threshold reached!)')
          } else if (newTotalSales >= 300000000 && ['beginner', 'growing'].includes(ctvTier)) {
            console.log('   🎉 TIER UPGRADE: → MASTER (300M threshold reached!)')
          } else if (newTotalSales >= 100000000 && ctvTier === 'beginner') {
            console.log('   🎉 TIER UPGRADE: → GROWING (100M threshold reached!)')
          }
        }

        console.log(`🎉 AFFILIATE COMMISSION COMPLETE!`)
        console.log(`   Commission: ${commissionAmount.toLocaleString()} VND`)

      } else {
        console.log('ℹ️  No pending referral found (organic purchase)')
      }
    } catch (affiliateError) {
      console.error('⚠️ Affiliate tracking error (non-blocking):', affiliateError)
      // Don't fail the whole request if affiliate tracking fails
    }

    // ========================================
    // 5. LOG TRANSACTION TO shopify_orders TABLE
    // ========================================
    const { error: logError } = await supabase
      .from('shopify_orders')
      .insert({
        user_id: userId,
        order_id: orderIdShopify,
        product_type: productType,
        tier_purchased: tierPurchased,
        amount: amountPaid,
        processed_at: new Date().toISOString()
      })

    if (logError) {
      console.error('⚠️ Failed to log transaction:', logError)
      // Don't fail the whole request if logging fails
    } else {
      console.log('✅ Transaction logged successfully')
    }

    // ========================================
    // 6. RETURN SUCCESS RESPONSE
    // ========================================
    const responseData: any = {
      success: true,
      message: 'Tier upgraded successfully',
      user_id: userId,
      product_type: productType,
      old_tier: productType === 'course' ? oldCourseTier : productType === 'scanner' ? oldScannerTier : oldChatbotTier,
      new_tier: tierPurchased
    }

    // Add bundle info if it's a course purchase
    if (productType === 'course') {
      const bundleMapping: { [key: string]: { scanner: string; chatbot: string; months: number } } = {
        'TIER1': { scanner: 'TIER1', chatbot: 'TIER1', months: 12 },
        'TIER2': { scanner: 'TIER2', chatbot: 'TIER2', months: 12 },
        'TIER3': { scanner: 'TIER3', chatbot: 'TIER2', months: 24 }
      }
      const bundle = bundleMapping[tierPurchased]

      if (bundle) {
        responseData.bundle_granted = {
          course_tier: tierPurchased,
          scanner_tier: bundle.scanner,
          chatbot_tier: bundle.chatbot,
          duration_months: bundle.months
        }
      }
    }

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
