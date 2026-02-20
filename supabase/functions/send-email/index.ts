/**
 * Send Email Edge Function
 * GEM Partnership System v3.0 - Phase 5
 * Uses Resend API for email delivery
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'GEM Partnership <partnership@gemral.com>';
const RESEND_URL = 'https://api.resend.com/emails';

// Vietnamese tier info
const TIER_INFO: Record<string, { name: string; icon: string; digital: string; physical: string; subAff: string }> = {
  bronze: { name: 'Đồng', icon: '🥉', digital: '10%', physical: '6%', subAff: '2%' },
  silver: { name: 'Bạc', icon: '🥈', digital: '15%', physical: '8%', subAff: '2.5%' },
  gold: { name: 'Vàng', icon: '🥇', digital: '20%', physical: '10%', subAff: '3%' },
  platinum: { name: 'Bạch Kim', icon: '💎', digital: '25%', physical: '12%', subAff: '3.5%' },
  diamond: { name: 'Kim Cương', icon: '👑', digital: '30%', physical: '15%', subAff: '4%' },
};

interface EmailRequest {
  to: string;
  template: string;
  data?: Record<string, unknown>;
  subject?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, template, data, subject } = await req.json() as EmailRequest;

    if (!to || !template) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: to, template' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Generate email content
    const emailContent = generateEmailContent(template, data);

    // Send via Resend
    const response = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: subject || emailContent.subject,
        html: emailContent.html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[SendEmail] Resend error:', result);
      return new Response(
        JSON.stringify({ success: false, error: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`[SendEmail] Sent ${template} email to ${to}`);

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[SendEmail] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function generateEmailContent(template: string, data?: Record<string, unknown>): { subject: string; html: string } {
  switch (template) {
    case 'welcome_ctv':
      return welcomeCTVEmail(data);
    case 'welcome_kol':
      return welcomeKOLEmail(data);
    case 'application_rejected':
      return applicationRejectedEmail(data);
    case 'tier_upgrade':
      return tierUpgradeEmail(data);
    case 'tier_downgrade':
      return tierDowngradeEmail(data);
    case 'commission_summary':
      return commissionSummaryEmail(data);
    case 'withdrawal_approved':
      return withdrawalApprovedEmail(data);
    case 'withdrawal_rejected':
      return withdrawalRejectedEmail(data);
    default:
      return { subject: 'Thông báo từ GEM', html: '<p>Bạn có thông báo mới từ GEM Partnership.</p>' };
  }
}

// Email Templates

function welcomeCTVEmail(data?: Record<string, unknown>): { subject: string; html: string } {
  const name = data?.name || 'Partner';
  const referralCode = data?.referral_code || '';
  const tier = TIER_INFO.bronze;

  return {
    subject: '🎉 Chào mừng bạn đến với GEM Partnership!',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #FFBD59, #FF8C00); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { background: #fff; padding: 30px; border: 1px solid #eee; }
    .tier-badge { display: inline-block; background: #CD7F32; color: white; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
    .rates-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .rates-table th, .rates-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    .rates-table th { background: #f8f9fa; }
    .highlight { color: #FFBD59; font-weight: bold; }
    .code-box { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .code { font-size: 24px; font-weight: bold; color: #333; letter-spacing: 2px; }
    .cta-button { display: inline-block; background: #FFBD59; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Chào mừng ${name}!</h1>
  </div>
  <div class="content">
    <p>Chúc mừng bạn đã chính thức trở thành <strong>Đối Tác Phát Triển (CTV)</strong> của GEM!</p>

    <p style="text-align: center;">
      <span class="tier-badge">${tier.icon} ${tier.name}</span>
    </p>

    <h3>📊 Hoa hồng của bạn:</h3>
    <table class="rates-table">
      <tr>
        <th>Loại sản phẩm</th>
        <th>Hoa hồng</th>
      </tr>
      <tr>
        <td>Khóa học & Digital</td>
        <td class="highlight">${tier.digital}</td>
      </tr>
      <tr>
        <td>Đá & Trang sức</td>
        <td class="highlight">${tier.physical}</td>
      </tr>
      <tr>
        <td>Sub-Affiliate</td>
        <td class="highlight">${tier.subAff}</td>
      </tr>
    </table>

    <h3>🔗 Mã giới thiệu của bạn:</h3>
    <div class="code-box">
      <div class="code">${referralCode}</div>
      <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Chia sẻ mã này để nhận hoa hồng sub-affiliate!</p>
    </div>

    <h3>🚀 Các bước tiếp theo:</h3>
    <ol>
      <li>Mở app GEM và vào mục <strong>Partnership</strong></li>
      <li>Tạo link giới thiệu cho sản phẩm bạn muốn quảng bá</li>
      <li>Chia sẻ link với khách hàng tiềm năng</li>
      <li>Theo dõi hoa hồng trong mục <strong>Báo cáo</strong></li>
    </ol>

    <p style="text-align: center;">
      <a href="https://gem.vn/partnership" class="cta-button">Bắt đầu ngay</a>
    </p>

    <p>Nếu cần hỗ trợ, liên hệ <a href="mailto:support@gem.vn">support@gem.vn</a> hoặc chat trong app.</p>
  </div>
  <div class="footer">
    <p>© 2024 GEM. All rights reserved.</p>
    <p>Email này được gửi vì bạn đã đăng ký làm đối tác của GEM.</p>
  </div>
</body>
</html>
    `,
  };
}

function welcomeKOLEmail(data?: Record<string, unknown>): { subject: string; html: string } {
  const name = data?.name || 'Partner';
  const referralCode = data?.referral_code || '';

  return {
    subject: '⭐ Chào mừng KOL Affiliate!',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #9C27B0, #673AB7); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { background: #fff; padding: 30px; border: 1px solid #eee; }
    .kol-badge { display: inline-block; background: #9C27B0; color: white; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
    .rates-box { background: linear-gradient(135deg, #f3e5f5, #e1bee7); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
    .rate-big { font-size: 48px; font-weight: bold; color: #9C27B0; }
    .code-box { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .code { font-size: 24px; font-weight: bold; color: #333; letter-spacing: 2px; }
    .cta-button { display: inline-block; background: #9C27B0; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>⭐ Chào mừng ${name}!</h1>
  </div>
  <div class="content">
    <p>Chúc mừng bạn đã được chấp nhận làm <strong>KOL Affiliate</strong> của GEM!</p>

    <p style="text-align: center;">
      <span class="kol-badge">⭐ KOL Affiliate</span>
    </p>

    <div class="rates-box">
      <p style="margin: 0; color: #666;">Hoa hồng cố định cho mọi sản phẩm</p>
      <div class="rate-big">20%</div>
      <p style="margin: 5px 0 0; color: #666;">+ 3.5% từ đội ngũ sub-affiliate</p>
    </div>

    <h3>🔗 Mã giới thiệu của bạn:</h3>
    <div class="code-box">
      <div class="code">${referralCode}</div>
    </div>

    <h3>🎁 Quyền lợi KOL:</h3>
    <ul>
      <li>Hoa hồng <strong>20%</strong> cho tất cả sản phẩm (digital & physical)</li>
      <li>Hoa hồng sub-affiliate <strong>3.5%</strong></li>
      <li>Thanh toán <strong>2 lần/tháng</strong> (ngày 1 và 15)</li>
      <li>Tài nguyên marketing cao cấp</li>
      <li>Hỗ trợ ưu tiên từ đội ngũ GEM</li>
    </ul>

    <p style="text-align: center;">
      <a href="https://gem.vn/partnership" class="cta-button">Khám phá ngay</a>
    </p>
  </div>
  <div class="footer">
    <p>© 2024 GEM. All rights reserved.</p>
  </div>
</body>
</html>
    `,
  };
}

function applicationRejectedEmail(data?: Record<string, unknown>): { subject: string; html: string } {
  const name = data?.name || 'Bạn';
  const reason = data?.reason || 'Hồ sơ chưa đáp ứng yêu cầu tại thời điểm này.';
  const applicationType = data?.application_type === 'kol' ? 'KOL Affiliate' : 'CTV';

  return {
    subject: '📋 Kết quả đơn đăng ký Partnership',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f8f9fa; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #eee; }
    .reason-box { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
    .cta-button { display: inline-block; background: #FFBD59; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Kết quả đơn đăng ký</h1>
  </div>
  <div class="content">
    <p>Xin chào ${name},</p>

    <p>Cảm ơn bạn đã quan tâm đến chương trình <strong>${applicationType}</strong> của GEM.</p>

    <p>Sau khi xem xét, chúng tôi rất tiếc phải thông báo rằng đơn đăng ký của bạn chưa được chấp nhận vào thời điểm này.</p>

    <div class="reason-box">
      <strong>Lý do:</strong><br>
      ${reason}
    </div>

    <h3>🔄 Bạn có thể làm gì?</h3>
    <ul>
      <li>Đọc lại yêu cầu của chương trình ${applicationType}</li>
      <li>Cải thiện hồ sơ và đăng ký lại sau 30 ngày</li>
      <li>Liên hệ support@gem.vn nếu cần hỗ trợ thêm</li>
    </ul>

    <p>Chúng tôi hy vọng sẽ được hợp tác cùng bạn trong tương lai!</p>

    <p>Trân trọng,<br><strong>GEM Partnership Team</strong></p>
  </div>
  <div class="footer">
    <p>© 2024 GEM. All rights reserved.</p>
  </div>
</body>
</html>
    `,
  };
}

function tierUpgradeEmail(data?: Record<string, unknown>): { subject: string; html: string } {
  const name = data?.name || 'Partner';
  const oldTier = data?.old_tier as string || 'bronze';
  const newTier = data?.new_tier as string || 'silver';
  const newTierInfo = TIER_INFO[newTier] || TIER_INFO.silver;
  const oldTierInfo = TIER_INFO[oldTier] || TIER_INFO.bronze;

  return {
    subject: `🎉 Chúc mừng thăng cấp lên ${newTierInfo.icon} ${newTierInfo.name}!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #FFD700, #FFA500); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 28px; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
    .content { background: #fff; padding: 30px; border: 1px solid #eee; }
    .upgrade-visual { text-align: center; padding: 20px; }
    .tier-icon { font-size: 48px; }
    .arrow { font-size: 32px; color: #4CAF50; margin: 0 15px; }
    .rates-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .rates-table th, .rates-table td { padding: 12px; text-align: center; border-bottom: 1px solid #eee; }
    .rates-table th { background: #f8f9fa; }
    .new-rate { color: #4CAF50; font-weight: bold; }
    .cta-button { display: inline-block; background: #FFD700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Chúc mừng ${name}!</h1>
  </div>
  <div class="content">
    <p style="text-align: center; font-size: 18px;">Bạn đã thăng cấp thành công!</p>

    <div class="upgrade-visual">
      <span class="tier-icon">${oldTierInfo.icon}</span>
      <span class="arrow">→</span>
      <span class="tier-icon">${newTierInfo.icon}</span>
    </div>

    <h3>📊 Hoa hồng mới của bạn:</h3>
    <table class="rates-table">
      <tr>
        <th>Loại</th>
        <th>Trước (${oldTierInfo.name})</th>
        <th>Sau (${newTierInfo.name})</th>
      </tr>
      <tr>
        <td>Digital</td>
        <td>${oldTierInfo.digital}</td>
        <td class="new-rate">${newTierInfo.digital}</td>
      </tr>
      <tr>
        <td>Physical</td>
        <td>${oldTierInfo.physical}</td>
        <td class="new-rate">${newTierInfo.physical}</td>
      </tr>
      <tr>
        <td>Sub-Affiliate</td>
        <td>${oldTierInfo.subAff}</td>
        <td class="new-rate">${newTierInfo.subAff}</td>
      </tr>
    </table>

    <p>Tiếp tục phấn đấu để lên tier cao hơn và nhận hoa hồng hấp dẫn hơn!</p>

    <p style="text-align: center;">
      <a href="https://gem.vn/partnership" class="cta-button">Xem chi tiết</a>
    </p>
  </div>
  <div class="footer">
    <p>© 2024 GEM. All rights reserved.</p>
  </div>
</body>
</html>
    `,
  };
}

function tierDowngradeEmail(data?: Record<string, unknown>): { subject: string; html: string } {
  const name = data?.name || 'Partner';
  const newTier = data?.new_tier as string || 'bronze';
  const newTierInfo = TIER_INFO[newTier] || TIER_INFO.bronze;

  return {
    subject: `📉 Thông báo thay đổi tier`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f8f9fa; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #eee; }
    .notice-box { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
    .cta-button { display: inline-block; background: #FFBD59; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📉 Thông báo tier</h1>
  </div>
  <div class="content">
    <p>Xin chào ${name},</p>

    <p>Tier của bạn đã được điều chỉnh xuống <strong>${newTierInfo.icon} ${newTierInfo.name}</strong> do doanh số tháng trước chưa đạt yêu cầu duy trì tier.</p>

    <div class="notice-box">
      <strong>Lưu ý:</strong> Để duy trì tier, bạn cần đạt ít nhất 10% doanh số ngưỡng của tier đó mỗi tháng.
    </div>

    <h3>💪 Cách lấy lại tier:</h3>
    <ul>
      <li>Tăng cường chia sẻ sản phẩm GEM</li>
      <li>Sử dụng tài nguyên marketing trong app</li>
      <li>Mời thêm sub-affiliate để tăng thu nhập</li>
    </ul>

    <p>Hệ thống sẽ đánh giá lại tier vào thứ 2 hàng tuần. Hãy nỗ lực để quay lại tier cao hơn!</p>

    <p style="text-align: center;">
      <a href="https://gem.vn/partnership" class="cta-button">Xem báo cáo doanh số</a>
    </p>
  </div>
  <div class="footer">
    <p>© 2024 GEM. All rights reserved.</p>
  </div>
</body>
</html>
    `,
  };
}

function commissionSummaryEmail(data?: Record<string, unknown>): { subject: string; html: string } {
  const name = data?.name || 'Partner';
  const period = data?.period || 'tháng này';
  const totalCommission = formatCurrency(data?.total_commission as number || 0);
  const directCommission = formatCurrency(data?.direct_commission as number || 0);
  const subAffCommission = formatCurrency(data?.sub_affiliate_commission as number || 0);
  const orderCount = data?.order_count || 0;

  return {
    subject: `💰 Báo cáo hoa hồng ${period}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4CAF50, #2E7D32); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #eee; }
    .total-box { background: #e8f5e9; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
    .total-amount { font-size: 36px; font-weight: bold; color: #2E7D32; }
    .stats-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .stats-table td { padding: 12px; border-bottom: 1px solid #eee; }
    .cta-button { display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>💰 Báo cáo hoa hồng</h1>
  </div>
  <div class="content">
    <p>Xin chào ${name},</p>
    <p>Đây là báo cáo hoa hồng của bạn trong ${period}:</p>

    <div class="total-box">
      <p style="margin: 0; color: #666;">Tổng hoa hồng</p>
      <div class="total-amount">${totalCommission}</div>
    </div>

    <table class="stats-table">
      <tr>
        <td>📦 Số đơn hàng</td>
        <td style="text-align: right; font-weight: bold;">${orderCount}</td>
      </tr>
      <tr>
        <td>💵 Hoa hồng trực tiếp</td>
        <td style="text-align: right; font-weight: bold;">${directCommission}</td>
      </tr>
      <tr>
        <td>👥 Hoa hồng sub-affiliate</td>
        <td style="text-align: right; font-weight: bold;">${subAffCommission}</td>
      </tr>
    </table>

    <p style="text-align: center;">
      <a href="https://gem.vn/partnership" class="cta-button">Xem chi tiết</a>
    </p>
  </div>
  <div class="footer">
    <p>© 2024 GEM. All rights reserved.</p>
  </div>
</body>
</html>
    `,
  };
}

function withdrawalApprovedEmail(data?: Record<string, unknown>): { subject: string; html: string } {
  const name = data?.name || 'Partner';
  const amount = formatCurrency(data?.amount as number || 0);
  const bankName = data?.bank_name || '';
  const accountNumber = data?.account_number || '';

  return {
    subject: '✅ Yêu cầu rút tiền đã được duyệt',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4CAF50; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #eee; }
    .amount-box { background: #e8f5e9; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
    .amount { font-size: 32px; font-weight: bold; color: #2E7D32; }
    .bank-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>✅ Rút tiền thành công</h1>
  </div>
  <div class="content">
    <p>Xin chào ${name},</p>
    <p>Yêu cầu rút tiền của bạn đã được phê duyệt!</p>

    <div class="amount-box">
      <p style="margin: 0; color: #666;">Số tiền</p>
      <div class="amount">${amount}</div>
    </div>

    <div class="bank-info">
      <strong>Thông tin chuyển khoản:</strong><br>
      Ngân hàng: ${bankName}<br>
      Số tài khoản: ****${accountNumber.slice(-4)}
    </div>

    <p>Tiền sẽ được chuyển vào tài khoản của bạn trong vòng <strong>1-3 ngày làm việc</strong>.</p>

    <p>Cảm ơn bạn đã đồng hành cùng GEM!</p>
  </div>
  <div class="footer">
    <p>© 2024 GEM. All rights reserved.</p>
  </div>
</body>
</html>
    `,
  };
}

function withdrawalRejectedEmail(data?: Record<string, unknown>): { subject: string; html: string } {
  const name = data?.name || 'Partner';
  const amount = formatCurrency(data?.amount as number || 0);
  const reason = data?.reason || 'Vui lòng liên hệ support để biết thêm chi tiết.';

  return {
    subject: '❌ Yêu cầu rút tiền không được duyệt',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f44336; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #eee; }
    .reason-box { background: #ffebee; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f44336; }
    .cta-button { display: inline-block; background: #FFBD59; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>❌ Yêu cầu bị từ chối</h1>
  </div>
  <div class="content">
    <p>Xin chào ${name},</p>
    <p>Yêu cầu rút ${amount} của bạn không được phê duyệt.</p>

    <div class="reason-box">
      <strong>Lý do:</strong><br>
      ${reason}
    </div>

    <p>Số dư đã được hoàn lại vào tài khoản của bạn. Vui lòng kiểm tra và gửi lại yêu cầu nếu cần.</p>

    <p>Nếu cần hỗ trợ, liên hệ <a href="mailto:support@gem.vn">support@gem.vn</a>.</p>

    <p style="text-align: center;">
      <a href="https://gem.vn/partnership" class="cta-button">Kiểm tra số dư</a>
    </p>
  </div>
  <div class="footer">
    <p>© 2024 GEM. All rights reserved.</p>
  </div>
</body>
</html>
    `,
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
}
