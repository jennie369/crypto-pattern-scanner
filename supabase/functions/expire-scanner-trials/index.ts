/**
 * EXPIRE SCANNER TRIALS - Cron Job
 * Runs daily to check and expire scanner trials that have ended
 *
 * Schedule: Every day at 00:00 UTC
 * Trigger: Supabase cron or external scheduler
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    console.log('[ExpireScannerTrials] Starting cron job...');

    // Call the expire function
    const { data: result, error } = await supabase.rpc('expire_scanner_trials');

    if (error) {
      console.error('[ExpireScannerTrials] Error:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('[ExpireScannerTrials] Result:', result);

    // Log to audit table if exists
    try {
      await supabase.from('system_logs').insert({
        event_type: 'cron_expire_scanner_trials',
        details: result,
        created_at: new Date().toISOString()
      });
    } catch (logError) {
      // Non-critical, table might not exist
      console.log('[ExpireScannerTrials] Could not log to system_logs');
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[ExpireScannerTrials] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
