// ============================================================
// GET ORDER NUMBER
// Purpose: Lookup order number (#4732) from OrderIdentity GID
// Strategy: Query pending_payments table (faster, no external API)
// Called by: Checkout UI Extension on Thank You page
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request
    let orderIdentityId: string | null = null;
    let confirmationNumber: string | null = null;
    let totalAmount: number | null = null;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      orderIdentityId = url.searchParams.get('orderIdentityId');
      confirmationNumber = url.searchParams.get('confirmationNumber');
      totalAmount = url.searchParams.get('totalAmount') ? parseFloat(url.searchParams.get('totalAmount')!) : null;
    } else {
      const body = await req.json();
      orderIdentityId = body.orderIdentityId;
      confirmationNumber = body.confirmationNumber;
      totalAmount = body.totalAmount;
    }

    console.log('[Get Order Number] Request:', { orderIdentityId, confirmationNumber, totalAmount });

    // Extract numeric ID from GID
    // Format: gid://shopify/OrderIdentity/6278078300337
    let numericId: string | null = null;
    if (orderIdentityId) {
      const match = orderIdentityId.match(/\/(\d+)$/);
      if (match) {
        numericId = match[1];
      }
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let orderNumber: string | null = null;

    // Strategy 1: Query by shopify_order_id (most reliable)
    if (numericId) {
      console.log('[Get Order Number] Searching by shopify_order_id:', numericId);

      const { data, error } = await supabase
        .from('pending_payments')
        .select('order_number, shopify_order_id')
        .eq('shopify_order_id', numericId)
        .single();

      if (data && !error) {
        orderNumber = data.order_number;
        console.log('[Get Order Number] Found by shopify_order_id:', orderNumber);
      }
    }

    // Strategy 2: Query recent order with matching amount (fallback)
    if (!orderNumber && totalAmount) {
      console.log('[Get Order Number] Searching by total_amount:', totalAmount);

      const { data, error } = await supabase
        .from('pending_payments')
        .select('order_number, total_amount, created_at')
        .eq('total_amount', totalAmount)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        orderNumber = data.order_number;
        console.log('[Get Order Number] Found by total_amount:', orderNumber);
      }
    }

    // Strategy 3: Get most recent pending order (last resort)
    if (!orderNumber) {
      console.log('[Get Order Number] Getting most recent order');

      const { data, error } = await supabase
        .from('pending_payments')
        .select('order_number, created_at')
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        orderNumber = data.order_number;
        console.log('[Get Order Number] Found most recent:', orderNumber);
      }
    }

    if (!orderNumber) {
      console.log('[Get Order Number] Order not found in database');
      return new Response(JSON.stringify({
        success: false,
        error: 'Order not found',
        orderIdentityId,
        confirmationNumber,
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[Get Order Number] Returning:', { orderNumber });

    return new Response(JSON.stringify({
      success: true,
      orderNumber,
      orderName: `#${orderNumber}`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Get Order Number] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
