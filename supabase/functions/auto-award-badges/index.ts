// ==============================================================================
// AUTO-AWARD BADGES EDGE FUNCTION
// ==============================================================================
// Automatically awards level badges based on user stats (win rate)
// Triggered by: INSERT/UPDATE on user_stats table

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserStats {
  user_id: string;
  win_rate: number;
  total_trades: number;
}

interface LevelBadge {
  name: string;
  threshold: number;
}

const LEVEL_BADGES: LevelBadge[] = [
  { name: 'diamond', threshold: 95 },
  { name: 'platinum', threshold: 85 },
  { name: 'gold', threshold: 75 },
  { name: 'silver', threshold: 60 },
  { name: 'bronze', threshold: 0 }
];

function determineLevelBadge(winRate: number): string {
  for (const badge of LEVEL_BADGES) {
    if (winRate >= badge.threshold) {
      return badge.name;
    }
  }
  return 'bronze'; // Default
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const { record } = await req.json();
    const userStats = record as UserStats;

    if (!userStats || !userStats.user_id) {
      throw new Error('Invalid user_stats record');
    }

    console.log(`📊 Processing user stats for user: ${userStats.user_id}`);
    console.log(`📈 Win rate: ${userStats.win_rate}%, Total trades: ${userStats.total_trades}`);

    // Determine level badge based on win rate
    const newLevelBadge = determineLevelBadge(userStats.win_rate || 0);

    console.log(`🏅 Awarding level badge: ${newLevelBadge}`);

    // Update user's level_badge
    const { error: updateError } = await supabaseClient
      .from('users')
      .update({ level_badge: newLevelBadge })
      .eq('id', userStats.user_id);

    if (updateError) {
      console.error('❌ Error updating level badge:', updateError);
      throw updateError;
    }

    console.log(`✅ Successfully updated level badge for user ${userStats.user_id} to ${newLevelBadge}`);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userStats.user_id,
        level_badge: newLevelBadge,
        win_rate: userStats.win_rate
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error in auto-award-badges function:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
