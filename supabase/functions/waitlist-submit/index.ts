/**
 * Waitlist Submit Edge Function
 * GEMRAL Waitlist Form Submission
 * Created: January 2026
 *
 * Flow:
 * 1. Validate input (name, phone, interests)
 * 2. Check rate limits
 * 3. Normalize phone number
 * 4. Save to waitlist_leads table
 * 5. Sync to Shopify Customer (async)
 * 6. Link to Zalo waitlist_entries if phone matches
 * 7. Return success with queue number
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SHOPIFY_DOMAIN = Deno.env.get('SHOPIFY_DOMAIN');
const SHOPIFY_ACCESS_TOKEN = Deno.env.get('SHOPIFY_ACCESS_TOKEN');

// Validation constants
const VALID_INTERESTS = ['trading', 'spiritual', 'courses', 'affiliate'];
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', 'guerrillamail.com', 'mailinator.com', 'throwaway.email',
  '10minutemail.com', 'temp-mail.org', 'fakeinbox.com', 'trashmail.com',
  'yopmail.com', 'getnada.com', 'tmpail.com', 'mohmal.com'
];

// Rate limit settings
const RATE_LIMIT_PER_IP_PER_HOUR = 5;
const RATE_LIMIT_PER_PHONE_PER_DAY = 3;

// Interfaces
interface WaitlistRequest {
  full_name: string;
  phone: string;
  email?: string;
  interested_products?: string[];
  marketing_consent?: boolean;
  referral_code?: string;
  // UTM tracking
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  referrer_url?: string;
  // Honeypot (should be empty)
  website?: string;
}

interface WaitlistResponse {
  success: boolean;
  message: string;
  data?: {
    lead_id: string;
    queue_number: number;
    referral_code: string;
  };
  error?: string;
}

// ============================================================
// Main Handler
// ============================================================

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return jsonResponse({
      success: false,
      message: 'Method not allowed',
      error: 'Only POST requests are accepted'
    }, 405);
  }

  try {
    // Get client IP
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('cf-connecting-ip') ||
                     req.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = req.headers.get('user-agent') || '';

    // Parse request body
    let body: WaitlistRequest;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({
        success: false,
        message: 'Invalid JSON',
        error: 'Request body must be valid JSON'
      }, 400);
    }

    console.log(`[WaitlistSubmit] New submission from IP: ${clientIP}`);

    // ========== HONEYPOT CHECK ==========
    // If honeypot field is filled, it's a bot - return fake success
    if (body.website && body.website.trim() !== '') {
      console.log(`[WaitlistSubmit] Bot detected (honeypot filled) from IP: ${clientIP}`);
      // Return fake success to not alert the bot
      return jsonResponse({
        success: true,
        message: 'Đăng ký thành công!',
        data: {
          lead_id: 'fake-' + crypto.randomUUID(),
          queue_number: Math.floor(Math.random() * 500) + 100,
          referral_code: 'GEMXXXXX'
        }
      }, 200);
    }

    // ========== INPUT VALIDATION ==========
    const validationError = validateInput(body);
    if (validationError) {
      return jsonResponse({
        success: false,
        message: validationError,
        error: 'Validation failed'
      }, 400);
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // ========== RATE LIMITING ==========
    const rateLimitResult = await checkRateLimit(supabase, clientIP, body.phone);
    if (!rateLimitResult.allowed) {
      console.log(`[WaitlistSubmit] Rate limit exceeded for IP: ${clientIP}`);
      return jsonResponse({
        success: false,
        message: rateLimitResult.message || 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
        error: 'Rate limit exceeded'
      }, 429);
    }

    // ========== NORMALIZE DATA ==========
    const normalizedPhone = normalizeVietnamesePhone(body.phone);
    const normalizedEmail = body.email?.toLowerCase().trim() || null;
    const deviceType = detectDeviceType(userAgent);

    // Filter valid interests only
    const validInterests = (body.interested_products || [])
      .filter(i => VALID_INTERESTS.includes(i.toLowerCase()))
      .map(i => i.toLowerCase());

    // ========== CHECK EXISTING (by phone OR email) ==========
    // Build filter for existing check - must check BOTH phone AND email
    let existingLead = null;

    // First check by phone (primary identifier)
    const { data: leadByPhone } = await supabase
      .from('waitlist_leads')
      .select('id, queue_number, referral_code, lead_status, email')
      .eq('phone_normalized', normalizedPhone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (leadByPhone) {
      existingLead = leadByPhone;
      console.log(`[WaitlistSubmit] Found existing lead by phone: ${leadByPhone.id}`);
    }
    // If not found by phone and email provided, check by email
    else if (normalizedEmail) {
      const { data: leadByEmail } = await supabase
        .from('waitlist_leads')
        .select('id, queue_number, referral_code, lead_status, phone_normalized')
        .eq('email', normalizedEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (leadByEmail) {
        existingLead = leadByEmail;
        console.log(`[WaitlistSubmit] Found existing lead by email: ${leadByEmail.id}`);
      }
    }

    if (existingLead) {
      console.log(`[WaitlistSubmit] Existing lead found: ${existingLead.id}`);

      // Update interests if new ones provided
      if (validInterests.length > 0) {
        await supabase
          .from('waitlist_leads')
          .update({
            interested_products: validInterests,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingLead.id);
      }

      return jsonResponse({
        success: true,
        message: 'Bạn đã đăng ký trước đó. Thông tin đã được cập nhật!',
        data: {
          lead_id: existingLead.id,
          queue_number: existingLead.queue_number,
          referral_code: existingLead.referral_code
        }
      }, 200);
    }

    // ========== VALIDATE REFERRAL CODE ==========
    let referrerInfo: { user_id: string | null; name: string | null; source: string | null } | null = null;
    let validatedReferralCode: string | null = null;

    if (body.referral_code && body.referral_code.trim() !== '') {
      const referralCode = body.referral_code.toUpperCase().trim();

      // Check for self-referral (prevent gaming)
      const { data: isSelfReferral } = await supabase.rpc('check_self_referral', {
        p_email: normalizedEmail || '',
        p_phone: body.phone,
        p_referral_code: referralCode
      });

      if (isSelfReferral) {
        console.log(`[WaitlistSubmit] Self-referral attempt blocked: ${referralCode}`);
        // Don't reject, just ignore the referral code
      } else {
        // Validate referral code exists
        const { data: validation, error: validationError } = await supabase.rpc('validate_referral_code', {
          p_code: referralCode
        });

        if (!validationError && validation && validation.length > 0 && validation[0].is_valid) {
          referrerInfo = {
            user_id: validation[0].referrer_user_id,
            name: validation[0].referrer_name,
            source: validation[0].source_table
          };
          validatedReferralCode = referralCode;
          console.log(`[WaitlistSubmit] Valid referral from: ${referrerInfo.name} (${referrerInfo.source})`);
        } else {
          console.log(`[WaitlistSubmit] Invalid referral code: ${referralCode}`);
          // Don't reject, just ignore invalid code
        }
      }
    }

    // ========== INSERT NEW LEAD ==========
    const leadData = {
      full_name: sanitizeString(body.full_name),
      phone: body.phone,
      phone_normalized: normalizedPhone,
      email: normalizedEmail,
      interested_products: validInterests,
      marketing_consent: body.marketing_consent !== false, // Default true
      referred_by_code: validatedReferralCode, // Only store if validated
      affiliate_id: referrerInfo?.user_id || null, // Link to referrer
      // Source tracking
      source: 'landing_page',
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      utm_content: body.utm_content || null,
      referrer_url: body.referrer_url?.substring(0, 2000) || null,
      // Device info
      ip_address: clientIP,
      user_agent: userAgent.substring(0, 500),
      device_type: deviceType,
    };

    const { data: newLead, error: insertError } = await supabase
      .from('waitlist_leads')
      .insert(leadData)
      .select('id, queue_number, referral_code')
      .single();

    if (insertError) {
      console.error('[WaitlistSubmit] Insert error:', insertError);
      return jsonResponse({
        success: false,
        message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
        error: insertError.message
      }, 500);
    }

    console.log(`[WaitlistSubmit] New lead created: ${newLead.id}, queue: ${newLead.queue_number}`);

    // ========== INCREMENT REFERRER'S COUNT ==========
    if (validatedReferralCode && referrerInfo) {
      try {
        await supabase.rpc('increment_referral_count', {
          p_referrer_code: validatedReferralCode
        });
        console.log(`[WaitlistSubmit] Incremented referral count for: ${validatedReferralCode}`);
      } catch (err) {
        console.error(`[WaitlistSubmit] Failed to increment referral count:`, err);
        // Non-blocking, continue
      }
    }

    // ========== ASYNC: AUTO-LINK TO EXISTING ACCOUNT ==========
    // If user already has an account, auto-link this waitlist entry
    supabase.rpc('auto_link_waitlist_to_existing_account', {
      p_waitlist_id: newLead.id,
      p_email: normalizedEmail || '',
      p_phone: normalizedPhone
    }).then(({ data: linkResult }) => {
      if (linkResult?.success) {
        console.log(`[WaitlistSubmit] Auto-linked to existing account: ${linkResult.profile_id}`);
      }
    }).catch(err => {
      console.log('[WaitlistSubmit] No existing account to link (expected)');
    });

    // ========== ASYNC: SYNC TO SHOPIFY ==========
    // Don't await - run in background
    syncToShopify(supabase, newLead.id, leadData).catch(err => {
      console.error('[WaitlistSubmit] Shopify sync error:', err);
    });

    // ========== ASYNC: LINK TO ZALO WAITLIST ==========
    // Check if phone exists in waitlist_entries and link
    linkToZaloWaitlist(supabase, newLead.id, normalizedPhone).catch(err => {
      console.error('[WaitlistSubmit] Zalo link error:', err);
    });

    // ========== SUCCESS RESPONSE ==========
    return jsonResponse({
      success: true,
      message: 'Chúc mừng bạn đã đăng ký thành công!',
      data: {
        lead_id: newLead.id,
        queue_number: newLead.queue_number,
        referral_code: newLead.referral_code
      }
    }, 200);

  } catch (error) {
    console.error('[WaitlistSubmit] Unexpected error:', error);
    return jsonResponse({
      success: false,
      message: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================================
// Helper Functions
// ============================================================

function jsonResponse(data: WaitlistResponse, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function validateInput(body: WaitlistRequest): string | null {
  // Full name
  if (!body.full_name || typeof body.full_name !== 'string') {
    return 'Vui lòng nhập họ và tên';
  }
  const name = body.full_name.trim();
  if (name.length < 2) {
    return 'Họ và tên phải có ít nhất 2 ký tự';
  }
  if (name.length > 255) {
    return 'Họ và tên quá dài';
  }
  // Check for suspicious characters (XSS prevention)
  if (/<[^>]*>|javascript:|on\w+=/i.test(name)) {
    return 'Họ và tên chứa ký tự không hợp lệ';
  }

  // Phone
  if (!body.phone || typeof body.phone !== 'string') {
    return 'Vui lòng nhập số điện thoại';
  }
  const phone = body.phone.replace(/[\s\-\.]/g, '');
  if (!isValidVietnamesePhone(phone)) {
    return 'Số điện thoại không hợp lệ. Vui lòng nhập số Việt Nam (VD: 0912345678)';
  }

  // Email (optional but validate format if provided)
  if (body.email && body.email.trim() !== '') {
    const email = body.email.toLowerCase().trim();
    if (!isValidEmail(email)) {
      return 'Email không hợp lệ';
    }
    // Check disposable email
    const domain = email.split('@')[1];
    if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
      return 'Vui lòng sử dụng email chính thức (không chấp nhận email tạm thời)';
    }
  }

  // Interests (optional but validate if provided)
  if (body.interested_products && !Array.isArray(body.interested_products)) {
    return 'Định dạng interests không hợp lệ';
  }

  return null;
}

function isValidVietnamesePhone(phone: string): boolean {
  // Remove all non-digits except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Vietnamese phone patterns
  const patterns = [
    /^0\d{9}$/,           // 0xxxxxxxxx (10 digits)
    /^\+84\d{9}$/,        // +84xxxxxxxxx
    /^84\d{9}$/,          // 84xxxxxxxxx
    /^0\d{10}$/,          // 0xxxxxxxxxx (11 digits - some carriers)
    /^\+84\d{10}$/,       // +84xxxxxxxxxx
  ];

  return patterns.some(p => p.test(cleaned));
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function normalizeVietnamesePhone(phone: string): string {
  // Remove all non-digits
  let cleaned = phone.replace(/[^\d]/g, '');

  // Normalize to 0xxxxxxxxx format (Vietnamese standard)
  if (cleaned.startsWith('84')) {
    cleaned = '0' + cleaned.substring(2);
  } else if (cleaned.startsWith('+84')) {
    cleaned = '0' + cleaned.substring(3);
  } else if (!cleaned.startsWith('0') && cleaned.length === 9) {
    cleaned = '0' + cleaned;
  }

  return cleaned;
}

function sanitizeString(str: string): string {
  return str
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .substring(0, 255);
}

function detectDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'mobile';
  }
  if (/tablet|ipad/i.test(ua)) {
    return 'tablet';
  }
  return 'desktop';
}

// ============================================================
// Rate Limiting
// ============================================================

interface RateLimitResult {
  allowed: boolean;
  message?: string;
}

async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  ip: string,
  phone: string
): Promise<RateLimitResult> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  try {
    // Check IP rate limit (5/hour)
    const { count: ipCount } = await supabase
      .from('waitlist_leads')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', oneHourAgo.toISOString());

    if ((ipCount || 0) >= RATE_LIMIT_PER_IP_PER_HOUR) {
      return {
        allowed: false,
        message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 giờ.'
      };
    }

    // Check phone rate limit (3/day)
    const normalizedPhone = normalizeVietnamesePhone(phone);
    const { count: phoneCount } = await supabase
      .from('waitlist_leads')
      .select('id', { count: 'exact', head: true })
      .eq('phone_normalized', normalizedPhone)
      .gte('created_at', oneDayAgo.toISOString());

    if ((phoneCount || 0) >= RATE_LIMIT_PER_PHONE_PER_DAY) {
      return {
        allowed: false,
        message: 'Số điện thoại này đã được đăng ký. Vui lòng liên hệ hỗ trợ nếu cần.'
      };
    }

    return { allowed: true };

  } catch (error) {
    console.error('[WaitlistSubmit] Rate limit check error:', error);
    // On error, allow the request (fail open)
    return { allowed: true };
  }
}

// ============================================================
// Shopify Integration
// ============================================================

async function syncToShopify(
  supabase: ReturnType<typeof createClient>,
  leadId: string,
  leadData: Record<string, unknown>
): Promise<void> {
  if (!SHOPIFY_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
    console.log('[WaitlistSubmit] Shopify not configured, skipping sync');
    await supabase
      .from('waitlist_leads')
      .update({ shopify_sync_status: 'skipped' })
      .eq('id', leadId);
    return;
  }

  // Need either email or phone for Shopify customer
  if (!leadData.email && !leadData.phone) {
    console.log('[WaitlistSubmit] No email or phone for Shopify');
    await supabase
      .from('waitlist_leads')
      .update({ shopify_sync_status: 'skipped' })
      .eq('id', leadId);
    return;
  }

  try {
    const shopifyUrl = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/customers.json`;

    // Build tags
    const tags = ['waitlist', 'gemral'];
    const interests = leadData.interested_products as string[] || [];
    interests.forEach(i => tags.push(`interested_${i}`));

    // Check if customer exists by email
    let customerId: string | null = null;

    if (leadData.email) {
      const searchUrl = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/customers/search.json?query=email:${leadData.email}`;
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      if (searchResponse.ok) {
        const searchResult = await searchResponse.json();
        if (searchResult.customers && searchResult.customers.length > 0) {
          customerId = searchResult.customers[0].id.toString();
        }
      }
    }

    if (customerId) {
      // Update existing customer - add tags
      const updateUrl = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/customers/${customerId}.json`;
      const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            id: customerId,
            tags: tags.join(', '),
            note: `Waitlist signup: ${new Date().toISOString()}`
          }
        }),
      });

      if (!updateResponse.ok) {
        throw new Error(`Shopify update failed: ${updateResponse.status}`);
      }

      console.log(`[WaitlistSubmit] Updated Shopify customer: ${customerId}`);

    } else {
      // Create new customer
      const nameParts = (leadData.full_name as string).split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const createResponse = await fetch(shopifyUrl, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            first_name: firstName,
            last_name: lastName,
            email: leadData.email || undefined,
            phone: leadData.phone_normalized || undefined,
            tags: tags.join(', '),
            note: `Waitlist signup from landing page`,
            accepts_marketing: leadData.marketing_consent === true,
            metafields: [
              {
                key: 'waitlist_signup_date',
                value: new Date().toISOString(),
                type: 'single_line_text_field',
                namespace: 'gemral'
              },
              {
                key: 'interests',
                value: interests.join(', '),
                type: 'single_line_text_field',
                namespace: 'gemral'
              }
            ]
          }
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        // Check if it's a duplicate error (which is fine)
        if (createResponse.status === 422 && errorText.includes('has already been taken')) {
          console.log('[WaitlistSubmit] Customer already exists in Shopify');
        } else {
          throw new Error(`Shopify create failed: ${createResponse.status} - ${errorText}`);
        }
      } else {
        const result = await createResponse.json();
        customerId = result.customer?.id?.toString();
        console.log(`[WaitlistSubmit] Created Shopify customer: ${customerId}`);
      }
    }

    // Update lead with Shopify info
    await supabase
      .from('waitlist_leads')
      .update({
        shopify_customer_id: customerId,
        shopify_sync_status: 'synced',
        shopify_synced_at: new Date().toISOString(),
        shopify_tags: tags
      })
      .eq('id', leadId);

  } catch (error) {
    console.error('[WaitlistSubmit] Shopify sync error:', error);
    await supabase
      .from('waitlist_leads')
      .update({
        shopify_sync_status: 'failed',
        metadata: {
          shopify_error: error instanceof Error ? error.message : 'Unknown error'
        }
      })
      .eq('id', leadId);
  }
}

// ============================================================
// Zalo Waitlist Linking
// ============================================================

async function linkToZaloWaitlist(
  supabase: ReturnType<typeof createClient>,
  leadId: string,
  phoneNormalized: string
): Promise<void> {
  try {
    // Check if phone exists in waitlist_entries (Zalo system)
    const { data: zaloEntry } = await supabase
      .from('waitlist_entries')
      .select('id, zalo_user_id, status')
      .eq('phone_normalized', phoneNormalized)
      .single();

    if (zaloEntry) {
      console.log(`[WaitlistSubmit] Found matching Zalo entry: ${zaloEntry.id}`);

      // Link the lead to Zalo entry
      await supabase
        .from('waitlist_leads')
        .update({
          waitlist_entry_id: zaloEntry.id,
          zalo_synced: zaloEntry.zalo_user_id ? true : false,
          zalo_synced_at: zaloEntry.zalo_user_id ? new Date().toISOString() : null
        })
        .eq('id', leadId);

      // Log activity
      await supabase
        .from('waitlist_lead_activities')
        .insert({
          lead_id: leadId,
          activity_type: 'shopify_sync',
          activity_detail: `Linked to Zalo waitlist entry: ${zaloEntry.id}`,
          metadata: { zalo_entry_id: zaloEntry.id, has_zalo: !!zaloEntry.zalo_user_id }
        });
    }

  } catch (error) {
    console.error('[WaitlistSubmit] Zalo link error:', error);
    // Non-blocking, just log
  }
}
