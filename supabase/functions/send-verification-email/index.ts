/**
 * Send Verification Email Edge Function
 * Sends OTP for email verification before order linking
 *
 * Supports: Resend API or fallback to console log (for development)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationRequest {
  email: string;
  purpose: 'link_email' | 'link_order';
  order_number?: string;
}

/**
 * Send email via Resend API
 */
async function sendEmailViaResend(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');

  if (!resendApiKey) {
    console.log('[SendVerificationEmail] No RESEND_API_KEY, logging OTP instead');
    console.log(`📧 Would send email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    return { success: true }; // Simulate success for development
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: Deno.env.get('EMAIL_FROM') || 'GEM App <no-reply@gem.app>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[SendVerificationEmail] Resend error:', error);
      return { success: false, error };
    }

    console.log('[SendVerificationEmail] Email sent successfully to:', to);
    return { success: true };
  } catch (error) {
    console.error('[SendVerificationEmail] Send error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate email HTML template
 */
function generateEmailHtml(otp: string, purpose: string, orderNumber?: string): string {
  const purposeText = purpose === 'link_order'
    ? `liên kết đơn hàng #${orderNumber}`
    : 'liên kết email với tài khoản';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác thực Email - GEM App</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0a0a14;
      color: #ffffff;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 16px;
      padding: 40px;
      border: 1px solid rgba(106, 91, 255, 0.3);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo-text {
      font-size: 32px;
      font-weight: bold;
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    h1 {
      color: #ffffff;
      font-size: 24px;
      margin-bottom: 20px;
      text-align: center;
    }
    p {
      color: #a0a0a0;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .otp-container {
      background: rgba(106, 91, 255, 0.1);
      border: 2px dashed rgba(106, 91, 255, 0.5);
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .otp-label {
      color: #888;
      font-size: 14px;
      margin-bottom: 10px;
    }
    .otp-code {
      font-size: 40px;
      font-weight: bold;
      letter-spacing: 10px;
      color: #FFD700;
      font-family: 'Courier New', monospace;
    }
    .warning {
      background: rgba(255, 107, 107, 0.1);
      border-left: 4px solid #FF6B6B;
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .warning p {
      color: #FF6B6B;
      margin: 0;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    .footer p {
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-text">GEM</span>
    </div>

    <h1>Xác Thực Email</h1>

    <p>
      Bạn đang yêu cầu ${purposeText}. Vui lòng sử dụng mã OTP bên dưới để xác nhận:
    </p>

    <div class="otp-container">
      <div class="otp-label">Mã xác thực của bạn</div>
      <div class="otp-code">${otp}</div>
    </div>

    <p style="text-align: center; color: #888;">
      Mã này sẽ hết hạn sau <strong style="color: #FFD700;">15 phút</strong>
    </p>

    <div class="warning">
      <p>
        <strong>Lưu ý bảo mật:</strong> Không chia sẻ mã này với bất kỳ ai.
        GEM sẽ không bao giờ yêu cầu mã OTP qua điện thoại hoặc tin nhắn.
      </p>
    </div>

    <div class="footer">
      <p>
        Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.<br>
        &copy; 2025 GEM App. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { email, purpose, order_number }: VerificationRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[SendVerificationEmail] Request from user ${user.id} for email: ${email}`);

    // Request verification token via database function
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('request_email_verification', {
        p_user_id: user.id,
        p_email: email.toLowerCase(),
        p_purpose: purpose || 'link_email',
        p_order_number: order_number || null,
      });

    if (tokenError) {
      console.error('[SendVerificationEmail] Token error:', tokenError);
      return new Response(
        JSON.stringify({ error: tokenError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = tokenData?.[0];

    if (!result?.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: result?.message || 'Không thể tạo mã xác thực',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // The OTP is returned in the message field from the function
    const otp = result.message;

    // Generate email content
    const subject = purpose === 'link_order'
      ? `Mã xác thực liên kết đơn hàng #${order_number} - GEM App`
      : 'Mã xác thực liên kết email - GEM App';

    const html = generateEmailHtml(otp, purpose || 'link_email', order_number);

    // Send email
    const emailResult = await sendEmailViaResend(email, subject, html);

    if (!emailResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Không thể gửi email. Vui lòng thử lại.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return success (don't expose OTP in response!)
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Mã xác thực đã được gửi đến email của bạn',
        token_id: result.token_id,
        expires_in: 900, // 15 minutes in seconds
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[SendVerificationEmail] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
