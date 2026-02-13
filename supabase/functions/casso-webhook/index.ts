// ============================================================
// CASSO BANK WEBHOOK
// Trigger: Casso.vn webhook khi có giao dịch mới
// Purpose: Auto-verify bank transfers
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';
import { encode } from 'https://deno.land/std@0.168.0/encoding/hex.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Secure-Token, Authorization',
};

// Update Shopify order to paid
async function markShopifyOrderPaid(shopifyOrderId: string): Promise<boolean> {
  const shopifyDomain = Deno.env.get('SHOPIFY_DOMAIN');
  const accessToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');

  if (!shopifyDomain || !accessToken) {
    console.error('[Shopify API] Missing credentials');
    return false;
  }

  try {
    // Try to create a capture transaction
    const captureRes = await fetch(
      `https://${shopifyDomain}/admin/api/2024-01/orders/${shopifyOrderId}/transactions.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction: {
            kind: 'capture',
            status: 'success',
            source: 'external',
          },
        }),
      }
    );

    if (!captureRes.ok) {
      // Try marking order as paid via note attributes
      await fetch(
        `https://${shopifyDomain}/admin/api/2024-01/orders/${shopifyOrderId}.json`,
        {
          method: 'PUT',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order: {
              id: shopifyOrderId,
              note_attributes: [
                { name: 'payment_verified', value: 'bank_transfer' },
                { name: 'verified_at', value: new Date().toISOString() },
                { name: 'verified_by', value: 'casso_webhook' },
              ],
            },
          }),
        }
      );
    }

    console.log('[Shopify API] Order marked as paid:', shopifyOrderId);
    return true;
  } catch (error) {
    console.error('[Shopify API] Error:', error);
    return false;
  }
}

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

    // Log all headers for debugging
    const allHeaders: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      allHeaders[key] = value;
    });
    console.log('[Casso Webhook] Headers received:', JSON.stringify(allHeaders));

    // Get raw body for signature verification
    const rawBody = await req.text();
    console.log('[Casso Webhook] Raw body length:', rawBody.length);

    // Get signature from header or URL query parameter
    const url = new URL(req.url);
    const receivedSignature =
      req.headers.get('x-casso-signature') ||
      req.headers.get('X-Casso-Signature') ||
      req.headers.get('secure-token') ||
      req.headers.get('Secure-Token') ||
      req.headers.get('authorization')?.replace('Bearer ', '') ||
      url.searchParams.get('secure_token') ||
      url.searchParams.get('token');

    const secretKey = Deno.env.get('CASSO_SECURE_TOKEN');

    console.log('[Casso Webhook] Signature received:', receivedSignature ? receivedSignature.substring(0, 20) + '...' : 'NONE');
    console.log('[Casso Webhook] Secret key set:', secretKey ? 'YES (' + secretKey.substring(0, 10) + '...)' : 'NO');

    if (!secretKey) {
      console.error('[Casso Webhook] CASSO_SECURE_TOKEN not set in environment!');
      return new Response(JSON.stringify({ error: 'Server configuration error - token not set' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Casso gửi signature format: t={timestamp},v1={signature}
    let isValid = false;

    // Method 1: Direct token comparison
    if (receivedSignature === secretKey) {
      console.log('[Casso Webhook] Direct token match!');
      isValid = true;
    }

    // Method 2: Parse Casso signature format (t=timestamp,v1=signature)
    if (!isValid && receivedSignature && receivedSignature.includes('t=') && receivedSignature.includes('v1=')) {
      try {
        // Parse: t=1767625694336,v1=abc123...
        const parts = receivedSignature.split(',');
        let timestamp = '';
        let v1Signature = '';

        for (const part of parts) {
          if (part.startsWith('t=')) {
            timestamp = part.substring(2);
          } else if (part.startsWith('v1=')) {
            v1Signature = part.substring(3);
          }
        }

        console.log('[Casso Webhook] Parsed - timestamp:', timestamp, 'v1:', v1Signature.substring(0, 20) + '...');

        if (timestamp && v1Signature) {
          // Compute HMAC of: timestamp.body
          const signedPayload = `${timestamp}.${rawBody}`;
          const encoder = new TextEncoder();
          const keyData = encoder.encode(secretKey);
          const messageData = encoder.encode(signedPayload);

          const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
          );

          const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
          const computedSignature = new TextDecoder().decode(encode(new Uint8Array(signature)));

          console.log('[Casso Webhook] Computed HMAC (t.body):', computedSignature.substring(0, 20) + '...');

          if (v1Signature.toLowerCase() === computedSignature.toLowerCase()) {
            console.log('[Casso Webhook] Stripe-style signature match!');
            isValid = true;
          } else {
            // Try without timestamp prefix (just body)
            const messageData2 = encoder.encode(rawBody);
            const signature2 = await crypto.subtle.sign('HMAC', cryptoKey, messageData2);
            const computedSignature2 = new TextDecoder().decode(encode(new Uint8Array(signature2)));

            console.log('[Casso Webhook] Computed HMAC (body only):', computedSignature2.substring(0, 20) + '...');

            if (v1Signature.toLowerCase() === computedSignature2.toLowerCase()) {
              console.log('[Casso Webhook] Body-only HMAC match!');
              isValid = true;
            }
          }
        }
      } catch (e) {
        console.error('[Casso Webhook] Signature parse error:', e);
      }
    }

    // Method 3: Simple HMAC of body (fallback)
    if (!isValid && receivedSignature) {
      try {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secretKey);
        const messageData = encoder.encode(rawBody);

        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );

        const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
        const computedSignature = new TextDecoder().decode(encode(new Uint8Array(signature)));

        if (receivedSignature.toLowerCase() === computedSignature.toLowerCase()) {
          console.log('[Casso Webhook] Simple HMAC match!');
          isValid = true;
        }
      } catch (e) {
        console.error('[Casso Webhook] HMAC verification error:', e);
      }
    }

    if (!isValid) {
      console.error('[Casso Webhook] Authentication failed');
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        hint: 'Signature verification failed',
        receivedHeaders: Object.keys(allHeaders),
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse body
    const payload = JSON.parse(rawBody);
    console.log('[Casso Webhook] Received:', JSON.stringify(payload));

    // Casso payload structure (can be object or array)
    // {
    //   "error": 0,
    //   "data": {  // or data: [...]
    //     "id": 123456,
    //     "reference": "FT24123456789",
    //     "description": "DH4714 chuyen tien",
    //     "amount": 570000,
    //     "runningBalance": 1000000,
    //     "transactionDateTime": "2025-02-12 15:36:21"
    //   }
    // }

    if (payload.error !== 0) {
      console.error('[Casso Webhook] Error in payload:', payload);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid payload',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const processedOrders: string[] = [];
    const failedOrders: { order: string; reason: string }[] = [];

    // Handle both array and single object formats
    const transactions = Array.isArray(payload.data)
      ? payload.data
      : (payload.data ? [payload.data] : []);

    console.log('[Casso Webhook] Processing', transactions.length, 'transaction(s)');

    for (const transaction of transactions) {
      const description = transaction.description || '';
      const amount = transaction.amount || 0;
      // Casso uses 'reference' for transaction ID
      const transactionId = transaction.reference || transaction.tid || transaction.id?.toString() || '';

      // Parse order number from description
      // Format: DH{orderNumber} hoặc DH{orderNumber}_{phone}
      const orderMatch = description.match(/DH(\d+)/i);

      if (!orderMatch) {
        console.log('[Casso Webhook] No order number in:', description);
        continue;
      }

      const orderNumber = orderMatch[1];
      console.log('[Casso Webhook] Processing order:', orderNumber, 'Amount:', amount);

      // Find pending payment
      const { data: pendingPayment, error: findError } = await supabase
        .from('pending_payments')
        .select('*')
        .eq('order_number', orderNumber)
        .eq('payment_status', 'pending')
        .single();

      if (findError || !pendingPayment) {
        console.log('[Casso Webhook] No pending payment for order:', orderNumber);

        // Log unknown transaction
        await supabase.from('payment_logs').insert({
          order_number: orderNumber,
          event_type: 'unknown_transaction',
          event_data: {
            transaction_id: transactionId,
            amount: amount,
            description: description,
            reason: 'No pending payment found',
          },
          source: 'casso_webhook',
        });

        failedOrders.push({ order: orderNumber, reason: 'No pending payment found' });
        continue;
      }

      // Verify amount (allow 1% tolerance for fees)
      const expectedAmount = parseFloat(pendingPayment.total_amount);
      const tolerance = expectedAmount * 0.01;
      const isAmountValid = amount >= (expectedAmount - tolerance);

      if (!isAmountValid) {
        console.log('[Casso Webhook] Amount mismatch:', amount, 'vs', expectedAmount);

        // Update status to verifying (cần kiểm tra thủ công)
        await supabase
          .from('pending_payments')
          .update({
            payment_status: 'verifying',
            bank_transaction_id: transactionId,
            verified_amount: amount,
            verification_note: `Số tiền không khớp: nhận ${amount.toLocaleString()}, cần ${expectedAmount.toLocaleString()}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pendingPayment.id);

        await supabase.from('payment_logs').insert({
          pending_payment_id: pendingPayment.id,
          order_number: orderNumber,
          event_type: 'amount_mismatch',
          event_data: {
            transaction_id: transactionId,
            received_amount: amount,
            expected_amount: expectedAmount,
            difference: amount - expectedAmount,
          },
          source: 'casso_webhook',
        });

        failedOrders.push({
          order: orderNumber,
          reason: `Amount mismatch: received ${amount}, expected ${expectedAmount}`,
        });
        continue;
      }

      // Payment verified!
      const { error: updateError } = await supabase
        .from('pending_payments')
        .update({
          payment_status: 'paid',
          bank_transaction_id: transactionId,
          verified_amount: amount,
          verified_at: new Date().toISOString(),
          verification_method: 'auto',
        })
        .eq('id', pendingPayment.id);

      if (updateError) {
        console.error('[Casso Webhook] Update error:', updateError);
        failedOrders.push({ order: orderNumber, reason: 'Database update failed' });
        continue;
      }

      // Log success
      await supabase.from('payment_logs').insert({
        pending_payment_id: pendingPayment.id,
        order_number: orderNumber,
        event_type: 'payment_verified',
        event_data: {
          transaction_id: transactionId,
          amount: amount,
          verification_method: 'auto',
          bank_description: description,
        },
        source: 'casso_webhook',
      });

      // Mark Shopify order as paid (for Shopify admin status)
      await markShopifyOrderPaid(pendingPayment.shopify_order_id);

      // ============================================================
      // DIRECT ACCESS CREATION
      // Don't rely on Shopify webhook chain (markShopifyOrderPaid creates
      // a capture transaction which does NOT trigger orders/paid webhook).
      // Instead, fetch order details and create access directly.
      // ============================================================
      const customerEmail = pendingPayment.customer_email;
      if (customerEmail && pendingPayment.shopify_order_id) {
        console.log('[Casso Webhook] Creating direct access for:', customerEmail);

        try {
          // Fetch Shopify order to get line_items
          const shopifyDomain = Deno.env.get('SHOPIFY_DOMAIN');
          const accessToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
          let lineItems: any[] = [];

          if (shopifyDomain && accessToken) {
            const orderRes = await fetch(
              `https://${shopifyDomain}/admin/api/2024-01/orders/${pendingPayment.shopify_order_id}.json?fields=line_items,email`,
              {
                headers: { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json' },
              }
            );
            if (orderRes.ok) {
              const orderData = await orderRes.json();
              lineItems = orderData.order?.line_items || [];
              console.log('[Casso Webhook] Fetched', lineItems.length, 'line items from Shopify');
            } else {
              console.error('[Casso Webhook] Shopify order fetch failed:', orderRes.status);
            }
          }

          // Process line items - detect products via DB lookup
          let scannerTier = 0, courseTier = 0, chatbotTier = 0, gemsToAdd = 0;
          const enrolledCourseIds: string[] = [];

          for (const item of lineItems) {
            const variantId = item.variant_id?.toString() || '';
            const productId = item.product_id?.toString() || '';

            // DB lookup by variant_id (most reliable)
            if (variantId) {
              const { data: variantData } = await supabase
                .from('shopify_product_variants')
                .select('tier_type, tier_level')
                .eq('shopify_variant_id', variantId)
                .single();

              if (variantData?.tier_type) {
                if (variantData.tier_type === 'scanner') scannerTier = Math.max(scannerTier, variantData.tier_level || 0);
                else if (variantData.tier_type === 'course') courseTier = Math.max(courseTier, variantData.tier_level || 0);
                else if (variantData.tier_type === 'chatbot') chatbotTier = Math.max(chatbotTier, variantData.tier_level || 0);
                console.log(`[Casso Webhook] Variant ${variantId} -> ${variantData.tier_type} tier ${variantData.tier_level}`);
              }

              // Check gem_packs
              if (!variantData) {
                const { data: gemPack } = await supabase
                  .from('gem_packs')
                  .select('total_gems')
                  .eq('shopify_variant_id', variantId)
                  .single();
                if (gemPack) {
                  gemsToAdd += gemPack.total_gems;
                  console.log(`[Casso Webhook] Gem pack: ${gemPack.total_gems} gems`);
                }
              }
            }

            // Course enrollment by product_id
            if (productId) {
              const { data: courseData } = await supabase
                .from('courses')
                .select('id')
                .eq('shopify_product_id', productId)
                .single();
              if (courseData?.id && !enrolledCourseIds.includes(courseData.id)) {
                enrolledCourseIds.push(courseData.id);
                console.log(`[Casso Webhook] Course detected: ${courseData.id}`);
              }
            }
          }

          // Check if user has account
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', customerEmail)
            .single();

          if (userProfile?.id) {
            // User exists - grant access directly
            if (scannerTier > 0 || courseTier > 0 || chatbotTier > 0) {
              await supabase.rpc('unlock_user_access', {
                p_email: customerEmail,
                p_scanner_tier: scannerTier > 0 ? scannerTier : null,
                p_course_tier: courseTier > 0 ? courseTier : null,
                p_chatbot_tier: chatbotTier > 0 ? chatbotTier : null,
                p_order_id: pendingPayment.shopify_order_id,
              });
              console.log('[Casso Webhook] Access unlocked for existing user:', customerEmail);
            }
            if (gemsToAdd > 0) {
              await supabase.rpc('add_user_gems', { p_email: customerEmail, p_amount: gemsToAdd, p_source: 'purchase' });
            }
            // Enroll in courses
            for (const courseId of enrolledCourseIds) {
              await supabase.from('course_enrollments').upsert({
                user_id: userProfile.id, course_id: courseId,
                enrolled_at: new Date().toISOString(), is_active: true, access_source: 'shopify_purchase',
              }, { onConflict: 'user_id,course_id' });
            }
          } else {
            // User not signed up yet - create pending records
            console.log('[Casso Webhook] User not signed up, creating pending records for:', customerEmail);

            if (scannerTier > 0) {
              await supabase.from('pending_tier_upgrades').insert({
                email: customerEmail, order_id: pendingPayment.shopify_order_id,
                product_type: 'scanner', tier_purchased: `TIER${scannerTier}`, amount: amount,
              });
            }
            if (courseTier > 0) {
              await supabase.from('pending_tier_upgrades').insert({
                email: customerEmail, order_id: pendingPayment.shopify_order_id,
                product_type: 'course', tier_purchased: courseTier === 0 ? 'STARTER' : `TIER${courseTier}`, amount: amount,
              });
            }
            if (chatbotTier > 0) {
              await supabase.from('pending_tier_upgrades').insert({
                email: customerEmail, order_id: pendingPayment.shopify_order_id,
                product_type: 'chatbot', tier_purchased: `TIER${chatbotTier}`, amount: amount,
              });
            }
            if (gemsToAdd > 0) {
              await supabase.from('pending_gem_credits').insert({
                email: customerEmail, gems_amount: gemsToAdd,
                order_id: pendingPayment.shopify_order_id, status: 'pending',
              });
            }
            for (const courseId of enrolledCourseIds) {
              await supabase.from('pending_course_access').insert({
                email: customerEmail, course_id: courseId,
                shopify_order_id: pendingPayment.shopify_order_id,
                access_type: 'purchase', price_paid: amount,
              });
              console.log('[Casso Webhook] Created pending_course_access:', courseId);
            }
          }

          // Log access event
          await supabase.from('payment_logs').insert({
            pending_payment_id: pendingPayment.id,
            order_number: orderNumber,
            event_type: 'access_unlocked',
            event_data: {
              scanner_tier: scannerTier, course_tier: courseTier, chatbot_tier: chatbotTier,
              gems_added: gemsToAdd, enrolled_courses: enrolledCourseIds,
              user_exists: !!userProfile?.id,
              line_items_count: lineItems.length,
            },
            source: 'casso_webhook',
          });
        } catch (accessError) {
          console.error('[Casso Webhook] Direct access creation error:', accessError);
          // Don't fail the whole payment verification if access creation fails
        }
      }

      processedOrders.push(orderNumber);
      console.log('[Casso Webhook] Payment verified for order:', orderNumber);
    }

    return new Response(JSON.stringify({
      success: true,
      processed_orders: processedOrders,
      failed_orders: failedOrders,
      total_transactions: transactions.length,
      message: processedOrders.length > 0
        ? `Đã xử lý ${processedOrders.length} đơn hàng`
        : 'Không tìm thấy đơn hàng nào để xử lý (cần format DH{orderNumber} trong description)',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Casso Webhook] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
