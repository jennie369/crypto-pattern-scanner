// ============================================================
// SHOPIFY ORDER CREATED WEBHOOK
// Trigger: Shopify orders/create
// Purpose: Tạo pending_payment record khi có order mới (bank transfer)
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Shopify-Hmac-Sha256, X-Shopify-Topic, X-Shopify-Shop-Domain',
};

// Verify Shopify webhook signature
function verifyShopifyWebhook(body: string, hmacHeader: string): boolean {
  const secret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET');
  if (!secret) {
    console.error('[Shopify Webhook] Missing SHOPIFY_WEBHOOK_SECRET');
    return false;
  }

  const hash = createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  return hash === hmacHeader;
}

// Generate VietQR URL
function generateVietQRUrl(amount: number, transferContent: string): string {
  const bankId = 'VCB';
  const accountNo = '1074286868';
  const accountName = encodeURIComponent('CT TNHH GEM CAPITAL HOLDING');
  const encodedContent = encodeURIComponent(transferContent);

  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodedContent}&accountName=${accountName}`;
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

    // Verify webhook signature
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
    const body = await req.text();

    if (!hmacHeader || !verifyShopifyWebhook(body, hmacHeader)) {
      console.error('[Shopify Order Webhook] Invalid signature');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const order = JSON.parse(body);
    console.log('[Shopify Order Webhook] Order received:', order.order_number);

    // Detect payment method (Rule 40: handle ALL payment types)
    const paymentGateway = order.payment_gateway_names?.[0] || '';
    const isBankTransfer =
      paymentGateway.toLowerCase().includes('bank') ||
      paymentGateway.toLowerCase().includes('manual') ||
      paymentGateway.toLowerCase().includes('chuyển khoản') ||
      paymentGateway.toLowerCase().includes('chuyen khoan') ||
      paymentGateway === '' ||
      order.financial_status === 'pending';

    // Determine payment status based on financial_status from Shopify
    // Credit card orders arrive with financial_status = 'paid'
    // Bank transfer orders arrive with financial_status = 'pending'
    const isPaidAlready = order.financial_status === 'paid' || order.financial_status === 'partially_paid';
    const paymentMethod = isBankTransfer ? 'bank_transfer' : paymentGateway || 'unknown';
    const initialPaymentStatus = isPaidAlready ? 'paid' : 'pending';

    console.log('[Shopify Order Webhook] Payment method:', paymentMethod, '| Status:', initialPaymentStatus);

    // Check if already exists
    const { data: existing } = await supabase
      .from('pending_payments')
      .select('id')
      .eq('shopify_order_id', order.id.toString())
      .single();

    if (existing) {
      console.log('[Shopify Order Webhook] Order already exists:', order.order_number);
      return new Response(JSON.stringify({
        success: true,
        message: 'Order already tracked',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate transfer content
    const phone = order.shipping_address?.phone?.replace(/\s/g, '').replace(/^\+84/, '0') || '';
    const transferContent = `DH${order.order_number}`;

    // Calculate expires_at (24 hours from now for bank transfer, already paid for credit card)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Generate QR code URL (only useful for bank transfer, but store for all)
    const totalAmount = parseFloat(order.total_price);
    const qrCodeUrl = generateVietQRUrl(totalAmount, transferContent);

    // Create payment record for ALL order types (Rule 20: single system of record)
    const { data: newPayment, error: insertError } = await supabase
      .from('pending_payments')
      .insert({
        shopify_order_id: order.id.toString(),
        order_number: order.order_number.toString(),
        checkout_token: order.checkout_token || null,
        customer_email: order.email,
        customer_phone: phone,
        customer_name: order.shipping_address?.name || order.customer?.first_name || order.customer?.email,
        total_amount: totalAmount,
        currency: order.currency || 'VND',
        transfer_content: transferContent,
        qr_code_url: qrCodeUrl,
        payment_status: initialPaymentStatus,
        payment_method: paymentMethod,
        expires_at: expiresAt.toISOString(),
        // If already paid (credit card), mark verified immediately
        ...(isPaidAlready ? {
          verified_at: new Date().toISOString(),
          verified_amount: totalAmount,
          verification_method: 'shopify_verified',
        } : {}),
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Shopify Order Webhook] Insert error:', insertError);
      throw insertError;
    }

    // Log event
    await supabase.from('payment_logs').insert({
      pending_payment_id: newPayment.id,
      order_number: order.order_number.toString(),
      event_type: isPaidAlready ? 'payment_verified' : 'order_created',
      event_data: {
        shopify_order_id: order.id,
        total_amount: totalAmount,
        payment_gateway: paymentGateway,
        payment_method: paymentMethod,
        financial_status: order.financial_status,
        customer_email: order.email,
      },
      source: 'shopify_webhook',
    });

    console.log('[Shopify Order Webhook] Payment record created:', newPayment.id, '| Status:', initialPaymentStatus);

    return new Response(JSON.stringify({
      success: true,
      payment_id: newPayment.id,
      order_number: order.order_number,
      payment_status: initialPaymentStatus,
      payment_method: paymentMethod,
      transfer_content: transferContent,
      qr_code_url: qrCodeUrl,
      expires_at: expiresAt.toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Shopify Order Webhook] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
