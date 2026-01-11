/**
 * Gemini API Proxy Edge Function
 *
 * Secure proxy for Gemini API with:
 * - JWT authentication
 * - Tier-based rate limiting
 * - CORS protection
 * - Usage logging
 *
 * Model: gemini-2.5-flash (with thinking tokens)
 * API Key: Hardcoded
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import {
  ProxyRequest,
  ProxyResponse,
  GeminiRequest,
  GeminiResponse,
  GeminiErrorResponse,
  GEMINI_MODEL,
  GEMINI_API_BASE,
  GEMINI_API_KEY,
  DEFAULT_GENERATION_CONFIG,
  FEATURE_CONFIGS,
} from './types.ts';

import {
  isOriginAllowed,
  handleCorsPreFlight,
  createResponse,
  createErrorResponse,
} from './cors.ts';

import {
  checkRateLimit,
  getRateLimitHeaders,
  logAIUsage,
  getUserTier,
} from './rate-limiter.ts';

// ===========================================
// MAIN HANDLER
// ===========================================

serve(async (req: Request): Promise<Response> => {
  const startTime = Date.now();
  const origin = req.headers.get('origin');

  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreFlight(origin);
  }

  // 2. Check origin
  if (!isOriginAllowed(origin)) {
    console.error('[GeminiProxy] Blocked origin:', origin);
    return createErrorResponse('Origin not allowed', 403, origin);
  }

  // 3. Only allow POST
  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405, origin);
  }

  try {
    // 4. Use hardcoded API key
    const apiKey = GEMINI_API_KEY;

    // 5. Get Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[GeminiProxy] Supabase credentials not configured');
      return createErrorResponse('Server configuration error', 500, origin);
    }

    // 6. Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('Missing or invalid authorization header', 401, origin);
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client with user's token for auth verification
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    // Verify the JWT and get user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      console.error('[GeminiProxy] Auth error:', authError?.message);
      return createErrorResponse('Invalid or expired token', 401, origin);
    }

    const userId = user.id;
    console.log('[GeminiProxy] Authenticated user:', userId);

    // 7. Create service role client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 8. Get user tier
    const userTier = await getUserTier(supabaseAdmin, userId);
    console.log('[GeminiProxy] User tier:', userTier);

    // 9. Parse request body
    let body: ProxyRequest;
    try {
      body = await req.json();
    } catch {
      return createErrorResponse('Invalid JSON body', 400, origin);
    }

    const { feature, messages, systemPrompt, generationConfig, metadata } = body;

    if (!feature || !messages || !Array.isArray(messages)) {
      return createErrorResponse('Missing required fields: feature, messages', 400, origin);
    }

    // 10. Check rate limit
    const rateLimitResult = await checkRateLimit(supabaseAdmin, userId, userTier, feature);

    if (!rateLimitResult.allowed) {
      console.log('[GeminiProxy] Rate limit exceeded for user:', userId);
      return createResponse(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          rateLimit: {
            limit: rateLimitResult.limit,
            remaining: 0,
            resetAt: rateLimitResult.resetAt,
          },
        },
        429,
        origin,
        getRateLimitHeaders(rateLimitResult)
      );
    }

    // 11. Build Gemini API request
    const featureConfig = FEATURE_CONFIGS[feature] || {};
    const geminiRequest: GeminiRequest = {
      contents: messages,
      generationConfig: {
        ...DEFAULT_GENERATION_CONFIG,
        ...featureConfig,
        ...(generationConfig || {}),
      },
    };

    // Add system instruction if provided
    if (systemPrompt) {
      geminiRequest.systemInstruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    // 12. Call Gemini API
    const geminiUrl = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    console.log('[GeminiProxy] Calling Gemini API for feature:', feature);

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiRequest),
    });

    const responseTimeMs = Date.now() - startTime;

    // 13. Handle Gemini response
    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json() as GeminiErrorResponse;
      console.error('[GeminiProxy] Gemini API error:', errorData);

      // Log failed request
      await logAIUsage(supabaseAdmin, {
        userId,
        feature,
        model: GEMINI_MODEL,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        requestType: metadata?.requestType as string || 'chat',
        success: false,
        errorMessage: errorData.error?.message || 'Unknown error',
        responseTimeMs,
        metadata,
      });

      return createResponse(
        {
          success: false,
          error: errorData.error?.message || 'Gemini API error',
        },
        geminiResponse.status,
        origin,
        getRateLimitHeaders(rateLimitResult)
      );
    }

    const geminiData = await geminiResponse.json() as GeminiResponse;

    // Extract response text
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const usageMetadata = geminiData.usageMetadata || {
      promptTokenCount: 0,
      candidatesTokenCount: 0,
      totalTokenCount: 0,
    };

    // 14. Log successful request
    await logAIUsage(supabaseAdmin, {
      userId,
      feature,
      model: GEMINI_MODEL,
      promptTokens: usageMetadata.promptTokenCount,
      completionTokens: usageMetadata.candidatesTokenCount,
      totalTokens: usageMetadata.totalTokenCount,
      requestType: metadata?.requestType as string || 'chat',
      success: true,
      responseTimeMs,
      metadata,
    });

    // 15. Return success response
    const proxyResponse: ProxyResponse = {
      success: true,
      data: {
        text: responseText,
        usage: {
          promptTokens: usageMetadata.promptTokenCount,
          completionTokens: usageMetadata.candidatesTokenCount,
          totalTokens: usageMetadata.totalTokenCount,
        },
      },
      rateLimit: {
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
        resetAt: rateLimitResult.resetAt,
      },
    };

    console.log('[GeminiProxy] Success - tokens used:', usageMetadata.totalTokenCount);

    return createResponse(
      proxyResponse,
      200,
      origin,
      getRateLimitHeaders(rateLimitResult)
    );

  } catch (error) {
    console.error('[GeminiProxy] Unexpected error:', error);

    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      origin
    );
  }
});
