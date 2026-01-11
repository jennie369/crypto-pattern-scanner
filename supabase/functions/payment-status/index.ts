// ============================================================
// PAYMENT STATUS API
// Purpose: Check payment status for frontend polling
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  'Content-Type': 'application/json',
};

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

    const url = new URL(req.url);
    // Support both 'order' and 'order_number' params
    const orderNumber = url.searchParams.get('order_number') || url.searchParams.get('order');
    const email = url.searchParams.get('email');

    if (!orderNumber) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Order number required',
      }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Fetch payment status
    let query = supabase
      .from('pending_payments')
      .select(`
        id,
        order_number,
        payment_status,
        total_amount,
        currency,
        transfer_content,
        qr_code_url,
        bank_name,
        bank_account,
        bank_account_name,
        verified_at,
        verified_amount,
        verification_method,
        proof_image_url,
        expires_at,
        created_at,
        updated_at
      `)
      .eq('order_number', orderNumber);

    // Optional email filter for security
    if (email) {
      query = query.eq('customer_email', email);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment not found',
        status: 'not_found',
      }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Calculate time remaining
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    const timeRemaining = Math.max(0, expiresAt.getTime() - now.getTime());
    const timeRemainingSeconds = Math.floor(timeRemaining / 1000);

    // Check if expired
    if (data.payment_status === 'pending' && timeRemaining <= 0) {
      // Update to expired
      await supabase
        .from('pending_payments')
        .update({ payment_status: 'expired' })
        .eq('id', data.id);

      // Log event
      await supabase.from('payment_logs').insert({
        pending_payment_id: data.id,
        order_number: orderNumber,
        event_type: 'order_expired',
        event_data: {
          expired_at: now.toISOString(),
          original_expires_at: data.expires_at,
        },
        source: 'system',
      });

      data.payment_status = 'expired';
    }

    return new Response(JSON.stringify({
      success: true,
      status: data.payment_status, // Top-level status for easy access
      order_number: data.order_number,
      data: {
        ...data,
        time_remaining_seconds: timeRemainingSeconds,
        time_remaining_ms: timeRemaining,
        is_expired: data.payment_status === 'expired',
        is_paid: data.payment_status === 'paid',
        is_pending: data.payment_status === 'pending',
        is_verifying: data.payment_status === 'verifying',
      },
    }), {
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('[Payment Status] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
