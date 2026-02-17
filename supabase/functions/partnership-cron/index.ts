/**
 * Partnership Cron Edge Function
 * GEM Partnership System v3.0
 *
 * Alternative to pg_cron - Call this from external cron service
 * (cron-job.org, GitHub Actions, etc.)
 *
 * Usage:
 * POST /functions/v1/partnership-cron
 * Body: { "action": "auto_approve" | "weekly_upgrade" | "monthly_downgrade" | "reset_monthly_sales" | "test" }
 * Header: Authorization: Bearer YOUR_SERVICE_ROLE_KEY
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request
    let action = 'test';
    try {
      const body = await req.json();
      action = body.action || 'test';
    } catch (e) {
      console.log('No body or invalid JSON, defaulting to test action');
    }

    // Connect to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing environment variables',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let result;

    switch (action) {
      case 'test':
        // Simple test - just check connection
        const { data: testData, error: testError } = await supabase
          .from('affiliate_profiles')
          .select('count')
          .limit(1);

        if (testError) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Database connection test failed',
            details: testError.message,
            hint: testError.hint,
            code: testError.code,
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        result = { action: 'test', message: 'Connection OK', data: testData };
        break;

      case 'auto_approve':
        // Auto-approve CTV applications after 3 days
        console.log('Calling auto_approve_ctv_applications RPC...');
        const { data: approveResult, error: approveError } = await supabase
          .rpc('auto_approve_ctv_applications');

        if (approveError) {
          console.error('RPC Error:', approveError);
          return new Response(JSON.stringify({
            success: false,
            error: 'RPC auto_approve_ctv_applications failed',
            details: approveError.message,
            hint: approveError.hint,
            code: approveError.code,
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        result = { action, approved: approveResult };
        console.log(`✅ Auto-approved ${approveResult} CTV applications`);
        break;

      case 'weekly_upgrade':
        // Weekly tier upgrade check
        const { data: upgradeResult, error: upgradeError } = await supabase
          .rpc('process_weekly_tier_upgrades');

        if (upgradeError) {
          return new Response(JSON.stringify({
            success: false,
            error: 'RPC process_weekly_tier_upgrades failed',
            details: upgradeError.message,
            hint: upgradeError.hint,
            code: upgradeError.code,
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        result = { action, upgraded: upgradeResult };
        console.log(`✅ Upgraded ${upgradeResult} affiliates`);
        break;

      case 'monthly_downgrade':
        // Monthly tier downgrade check
        const { data: downgradeResult, error: downgradeError } = await supabase
          .rpc('process_monthly_tier_downgrades');

        if (downgradeError) {
          return new Response(JSON.stringify({
            success: false,
            error: 'RPC process_monthly_tier_downgrades failed',
            details: downgradeError.message,
            hint: downgradeError.hint,
            code: downgradeError.code,
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        result = { action, downgraded: downgradeResult };
        console.log(`✅ Downgraded ${downgradeResult} affiliates`);
        break;

      case 'reset_monthly_sales':
        // Reset monthly sales on 1st of month
        const { data: resetResult, error: resetError } = await supabase
          .rpc('reset_monthly_sales');

        if (resetError) {
          return new Response(JSON.stringify({
            success: false,
            error: 'RPC reset_monthly_sales failed',
            details: resetError.message,
            hint: resetError.hint,
            code: resetError.code,
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        result = { action, reset: resetResult };
        console.log(`✅ Reset monthly sales for ${resetResult} affiliates`);
        break;

      case 'verify_kol': {
        // Re-verify KOL profiles that haven't been checked in 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data: staleResults, error: staleError } = await supabase
          .from('kol_verification_results')
          .select('application_id')
          .lt('last_checked_at', thirtyDaysAgo)
          .eq('verification_status', 'verified')
          .limit(10);

        if (staleError) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to query stale KOL verification results',
            details: staleError.message,
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Deduplicate application IDs
        const uniqueAppIds = [...new Set((staleResults || []).map(r => r.application_id))];

        let reverifiedCount = 0;
        for (const applicationId of uniqueAppIds) {
          try {
            await supabase.functions.invoke('kol-intelligence-crawl', {
              body: { application_id: applicationId, force: true },
            });
            reverifiedCount++;
          } catch (err) {
            console.error(`[Cron] Re-verify failed for ${applicationId}:`, err);
          }
        }

        result = { action: 'verify_kol', reverified: reverifiedCount, stale_found: uniqueAppIds.length };
        console.log(`✅ Re-verified ${reverifiedCount}/${uniqueAppIds.length} stale KOL profiles`);
        break;
      }

      default:
        return new Response(JSON.stringify({
          error: 'Invalid action',
          valid_actions: ['test', 'auto_approve', 'weekly_upgrade', 'monthly_downgrade', 'reset_monthly_sales', 'verify_kol']
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Partnership cron error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error',
      stack: error.stack,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
