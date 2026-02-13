/**
 * Gemini API Proxy - Rate Limiter
 * Handles rate limiting based on user tier using Supabase
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { UserTier, RateLimitResult, TIER_RATE_LIMITS } from './types.ts';

/**
 * Check rate limit for a user
 * Uses the check_rate_limit PostgreSQL function
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param userTier - User's subscription tier
 * @param feature - Feature name (optional)
 * @returns RateLimitResult
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  userTier: UserTier,
  feature: string = 'all'
): Promise<RateLimitResult> {
  try {
    // Call the PostgreSQL function
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_user_id: userId,
      p_user_tier: userTier,
      p_feature: feature,
    });

    if (error) {
      console.error('[RateLimiter] check_rate_limit error:', error);
      // On error, allow the request but log it
      return {
        allowed: true,
        remaining: TIER_RATE_LIMITS[userTier].requestsPerMinute,
        resetAt: new Date(Date.now() + 60000).toISOString(),
        limit: TIER_RATE_LIMITS[userTier].requestsPerMinute,
        current: 0,
      };
    }

    return {
      allowed: data?.allowed ?? true,
      remaining: data?.remaining ?? 0,
      resetAt: data?.reset_at ?? new Date(Date.now() + 60000).toISOString(),
      limit: data?.limit ?? TIER_RATE_LIMITS[userTier].requestsPerMinute,
      current: data?.current ?? 0,
    };
  } catch (err) {
    console.error('[RateLimiter] Exception:', err);
    // On exception, allow the request
    return {
      allowed: true,
      remaining: TIER_RATE_LIMITS[userTier].requestsPerMinute,
      resetAt: new Date(Date.now() + 60000).toISOString(),
      limit: TIER_RATE_LIMITS[userTier].requestsPerMinute,
      current: 0,
    };
  }
}

/**
 * Get rate limit headers for response
 * @param rateLimitResult - Result from checkRateLimit
 * @returns Headers object
 */
export function getRateLimitHeaders(rateLimitResult: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(rateLimitResult.limit),
    'X-RateLimit-Remaining': String(Math.max(0, rateLimitResult.remaining)),
    'X-RateLimit-Reset': rateLimitResult.resetAt,
  };
}

/**
 * Log AI usage to the database
 * @param supabase - Supabase client
 * @param params - Usage parameters
 */
export async function logAIUsage(
  supabase: SupabaseClient,
  params: {
    userId: string;
    feature: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    requestType?: string;
    success: boolean;
    errorMessage?: string;
    responseTimeMs: number;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    const { error } = await supabase.from('ai_usage_logs').insert({
      user_id: params.userId,
      feature: params.feature,
      model: params.model,
      prompt_tokens: params.promptTokens,
      completion_tokens: params.completionTokens,
      total_tokens: params.totalTokens,
      request_type: params.requestType || 'chat',
      success: params.success,
      error_message: params.errorMessage || null,
      response_time_ms: params.responseTimeMs,
      metadata: params.metadata || {},
    });

    if (error) {
      console.error('[RateLimiter] logAIUsage error:', error);
    }
  } catch (err) {
    console.error('[RateLimiter] logAIUsage exception:', err);
  }
}

/**
 * Get user's subscription tier from profile
 * @param supabase - Supabase client
 * @param userId - User ID
 * @returns UserTier
 */
export async function getUserTier(
  supabase: SupabaseClient,
  userId: string
): Promise<UserTier> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('[RateLimiter] getUserTier error:', error);
      return 'free';
    }

    const tier = data.subscription_tier?.toLowerCase() || 'free';

    // Validate tier value
    if (['tier1', 'tier2', 'tier3'].includes(tier)) {
      return tier as UserTier;
    }

    return 'free';
  } catch (err) {
    console.error('[RateLimiter] getUserTier exception:', err);
    return 'free';
  }
}
