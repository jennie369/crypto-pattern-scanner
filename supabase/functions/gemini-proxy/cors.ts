/**
 * Gemini API Proxy - CORS Helper
 * Handles Cross-Origin Resource Sharing for the Edge Function
 */

import { ALLOWED_ORIGINS } from './types.ts';

/**
 * Check if the origin is allowed
 * @param origin - Request origin header
 * @returns boolean - Whether the origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  // Allow requests with no origin (mobile apps, server-to-server)
  if (!origin) return true;

  // Check against whitelist
  if (ALLOWED_ORIGINS.includes(origin)) return true;

  // Allow localhost with any port for development
  if (origin.startsWith('http://localhost:')) return true;
  if (origin.startsWith('http://127.0.0.1:')) return true;

  // Allow Expo development URLs
  if (origin.startsWith('exp://')) return true;

  // Allow any subdomain of gemral.vn
  if (origin.endsWith('.gemral.vn')) return true;

  return false;
}

/**
 * Get CORS headers for a given origin
 * @param origin - Request origin header
 * @returns Headers object with CORS headers
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  // Determine the allowed origin to return
  const allowedOrigin = isOriginAllowed(origin) ? (origin || '*') : '';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Client-Info, apikey, x-request-feature',
    'Access-Control-Max-Age': '86400', // 24 hours cache for preflight
    'Access-Control-Expose-Headers': 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset',
  };
}

/**
 * Handle CORS preflight request (OPTIONS method)
 * @param origin - Request origin header
 * @returns Response for preflight request
 */
export function handleCorsPreFlight(origin: string | null): Response {
  if (!isOriginAllowed(origin)) {
    return new Response(
      JSON.stringify({ error: 'Origin not allowed' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(null, {
    status: 204, // No content
    headers: getCorsHeaders(origin),
  });
}

/**
 * Create a JSON response with CORS headers
 * @param data - Response data
 * @param status - HTTP status code
 * @param origin - Request origin for CORS
 * @param extraHeaders - Additional headers (e.g., rate limit headers)
 * @returns Response object
 */
export function createResponse(
  data: Record<string, unknown>,
  status: number,
  origin: string | null,
  extraHeaders?: Record<string, string>
): Response {
  const headers = {
    'Content-Type': 'application/json',
    ...getCorsHeaders(origin),
    ...(extraHeaders || {}),
  };

  return new Response(JSON.stringify(data), { status, headers });
}

/**
 * Create an error response with CORS headers
 * @param message - Error message
 * @param status - HTTP status code
 * @param origin - Request origin for CORS
 * @returns Response object
 */
export function createErrorResponse(
  message: string,
  status: number,
  origin: string | null
): Response {
  return createResponse({ success: false, error: message }, status, origin);
}
