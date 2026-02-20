/**
 * Send Bulk Email Edge Function
 * Uses Resend Batch API to send emails to multiple recipients
 *
 * Endpoints:
 *   POST /send-bulk-email
 *     - action: "send"    → Send bulk email (immediate or from campaign)
 *     - action: "preview"  → Preview email HTML without sending
 *     - action: "list-campaigns" → List all campaigns
 *     - action: "campaign-status" → Get campaign status + recipient details
 *
 * Resend Batch API: max 100 emails per call
 * Free plan: 100 emails/day, 3,000/month
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const RESEND_BATCH_URL = 'https://api.resend.com/emails/batch';
const DEFAULT_FROM = Deno.env.get('BULK_EMAIL_FROM') || 'GEM <hello@gemral.com>';
const BATCH_SIZE = 100; // Resend max per batch call

// ── Types ──────────────────────────────────────────────────────────

interface BulkEmailRequest {
  action: 'send' | 'preview' | 'list-campaigns' | 'campaign-status';
  // For "send"
  campaign_name?: string;
  subject?: string;
  from?: string;
  to?: string[];           // Array of email addresses
  html?: string;           // Raw HTML content
  template?: string;       // Template name (built-in)
  template_data?: Record<string, unknown>; // Data for template
  // For "campaign-status"
  campaign_id?: string;
}

interface ResendBatchEmail {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

// ── Built-in Templates ─────────────────────────────────────────────

function getTemplate(name: string, data: Record<string, unknown> = {}): { subject: string; html: string } | null {
  switch (name) {
    case 'welcome':
      return welcomeTemplate(data);
    case 'announcement':
      return announcementTemplate(data);
    case 'promotion':
      return promotionTemplate(data);
    case 'newsletter':
      return newsletterTemplate(data);
    default:
      return null;
  }
}

function baseLayout(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: #0a0a14; color: #e0e0e0; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #FFBD59, #FF8C00); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
    .header h1 { color: #1a1a2e; margin: 0; font-size: 26px; font-weight: 700; }
    .header .subtitle { color: rgba(26, 26, 46, 0.7); font-size: 14px; margin-top: 8px; }
    .body { background: #1a1a2e; padding: 30px; border: 1px solid rgba(255, 189, 89, 0.15); }
    .body p { line-height: 1.7; margin-bottom: 16px; color: #c0c0c0; }
    .body h2 { color: #FFBD59; font-size: 20px; margin: 24px 0 12px; }
    .body h3 { color: #e0e0e0; font-size: 16px; margin: 20px 0 10px; }
    .cta { display: inline-block; background: linear-gradient(135deg, #FFBD59, #FF8C00); color: #1a1a2e; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; margin: 20px 0; }
    .cta:hover { opacity: 0.9; }
    .highlight-box { background: rgba(255, 189, 89, 0.08); border-left: 4px solid #FFBD59; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
    .footer { text-align: center; padding: 24px; color: #666; font-size: 12px; border-top: 1px solid rgba(255, 255, 255, 0.05); }
    .footer a { color: #FFBD59; text-decoration: none; }
    .logo { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #FFD700, #FFA500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  </style>
</head>
<body>
  <div class="wrapper">
    ${bodyContent}
    <div class="footer">
      <p><span class="logo">GEM</span></p>
      <p>GEM - Gem Frequency Trading Platform</p>
      <p><a href="https://www.gemral.com">www.gemral.com</a></p>
      <p style="margin-top: 16px; color: #555;">
        You received this email because you're a GEM member.<br>
        <a href="https://www.gemral.com/unsubscribe?email={{email}}">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function welcomeTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const name = (data.name as string) || 'there';
  return {
    subject: data.subject as string || 'Welcome to GEM!',
    html: baseLayout('Welcome to GEM', `
    <div class="header">
      <h1>Welcome to GEM!</h1>
      <div class="subtitle">Your trading journey starts here</div>
    </div>
    <div class="body">
      <p>Hi ${name},</p>
      <p>Welcome to <strong>GEM</strong> - the smart trading platform powered by pattern detection and AI analysis.</p>
      <div class="highlight-box">
        <h3>What you can do:</h3>
        <p>
          <strong>Scanner</strong> - Real-time pattern detection on Binance Futures<br>
          <strong>AI Chatbot</strong> - Ask anything about trading<br>
          <strong>Courses</strong> - Learn from our curated education content<br>
          <strong>Community</strong> - Connect with fellow traders
        </p>
      </div>
      <p style="text-align: center;">
        <a href="https://www.gemral.com" class="cta">Get Started</a>
      </p>
    </div>`),
  };
}

function announcementTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const title = (data.title as string) || 'Important Update';
  const message = (data.message as string) || '';
  const ctaText = (data.cta_text as string) || 'Learn More';
  const ctaUrl = (data.cta_url as string) || 'https://www.gemral.com';
  return {
    subject: data.subject as string || `GEM: ${title}`,
    html: baseLayout(title, `
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="body">
      ${message}
      ${ctaUrl ? `<p style="text-align: center;"><a href="${ctaUrl}" class="cta">${ctaText}</a></p>` : ''}
    </div>`),
  };
}

function promotionTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const title = (data.title as string) || 'Special Offer';
  const message = (data.message as string) || '';
  const discount = (data.discount as string) || '';
  const ctaText = (data.cta_text as string) || 'Claim Now';
  const ctaUrl = (data.cta_url as string) || 'https://www.gemral.com/pricing';
  return {
    subject: data.subject as string || `GEM: ${title}`,
    html: baseLayout(title, `
    <div class="header">
      <h1>${title}</h1>
      ${discount ? `<div class="subtitle" style="font-size: 20px; font-weight: 700; color: #1a1a2e;">${discount}</div>` : ''}
    </div>
    <div class="body">
      ${message}
      <p style="text-align: center;">
        <a href="${ctaUrl}" class="cta">${ctaText}</a>
      </p>
    </div>`),
  };
}

function newsletterTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const title = (data.title as string) || 'GEM Newsletter';
  const sections = (data.sections as Array<{ heading: string; content: string }>) || [];
  const sectionsHtml = sections.map(s => `<h2>${s.heading}</h2>${s.content}`).join('');
  return {
    subject: data.subject as string || title,
    html: baseLayout(title, `
    <div class="header">
      <h1>${title}</h1>
      <div class="subtitle">${(data.subtitle as string) || ''}</div>
    </div>
    <div class="body">
      ${sectionsHtml || '<p>No content provided.</p>'}
      <p style="text-align: center;">
        <a href="https://www.gemral.com" class="cta">Visit GEM</a>
      </p>
    </div>`),
  };
}

// ── Main Handler ───────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return jsonResponse({ error: 'Admin access required' }, 403);
    }

    const body: BulkEmailRequest = await req.json();

    switch (body.action) {
      case 'preview':
        return handlePreview(body);
      case 'send':
        return await handleSend(body, supabase, user.id);
      case 'list-campaigns':
        return await handleListCampaigns(supabase);
      case 'campaign-status':
        return await handleCampaignStatus(body, supabase);
      default:
        return jsonResponse({ error: 'Invalid action. Use: send, preview, list-campaigns, campaign-status' }, 400);
    }
  } catch (error) {
    console.error('[SendBulkEmail] Error:', error);
    return jsonResponse({ error: error.message }, 500);
  }
});

// ── Action Handlers ────────────────────────────────────────────────

function handlePreview(body: BulkEmailRequest): Response {
  let html = body.html || '';
  let subject = body.subject || '';

  if (body.template) {
    const tpl = getTemplate(body.template, body.template_data || {});
    if (!tpl) {
      return jsonResponse({ error: `Unknown template: ${body.template}. Available: welcome, announcement, promotion, newsletter` }, 400);
    }
    html = tpl.html;
    subject = subject || tpl.subject;
  }

  if (!html) {
    return jsonResponse({ error: 'Provide html or template' }, 400);
  }

  return jsonResponse({ subject, html, from: body.from || DEFAULT_FROM });
}

async function handleSend(
  body: BulkEmailRequest,
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<Response> {
  if (!RESEND_API_KEY) {
    return jsonResponse({ error: 'RESEND_API_KEY not configured' }, 500);
  }

  const recipients = body.to;
  if (!recipients || recipients.length === 0) {
    return jsonResponse({ error: 'No recipients (to) provided' }, 400);
  }

  // Resolve content
  let html = body.html || '';
  let subject = body.subject || '';

  if (body.template) {
    const tpl = getTemplate(body.template, body.template_data || {});
    if (!tpl) {
      return jsonResponse({ error: `Unknown template: ${body.template}` }, 400);
    }
    html = tpl.html;
    subject = subject || tpl.subject;
  }

  if (!html || !subject) {
    return jsonResponse({ error: 'Missing subject or html/template' }, 400);
  }

  const from = body.from || DEFAULT_FROM;
  const campaignName = body.campaign_name || `Bulk ${new Date().toISOString().slice(0, 16)}`;

  // Create campaign record
  const { data: campaign, error: campError } = await supabase
    .from('email_campaigns')
    .insert({
      name: campaignName,
      subject,
      from_email: from,
      template: body.template || null,
      html,
      status: 'sending',
      total_recipients: recipients.length,
      created_by: userId,
    })
    .select('id')
    .single();

  if (campError || !campaign) {
    console.error('[SendBulkEmail] Campaign create error:', campError);
    return jsonResponse({ error: 'Failed to create campaign record' }, 500);
  }

  const campaignId = campaign.id;

  // Insert recipient records
  const recipientRows = recipients.map(email => ({
    campaign_id: campaignId,
    email,
    status: 'pending',
  }));

  await supabase.from('email_campaign_recipients').insert(recipientRows);

  // Send in batches of 100
  let totalSent = 0;
  let totalFailed = 0;
  const errors: Array<{ email: string; error: string }> = [];

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);

    // Build Resend batch payload — each recipient gets their own email
    const emails: ResendBatchEmail[] = batch.map(email => ({
      from,
      to: [email],
      subject,
      html: html.replace(/\{\{email\}\}/g, email),
    }));

    try {
      const response = await fetch(RESEND_BATCH_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emails),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(`[SendBulkEmail] Batch ${i / BATCH_SIZE + 1} failed:`, result);
        // Mark all in this batch as failed
        for (const email of batch) {
          totalFailed++;
          errors.push({ email, error: result.message || 'Batch send failed' });
          await supabase
            .from('email_campaign_recipients')
            .update({ status: 'failed', error: result.message || 'Batch failed' })
            .eq('campaign_id', campaignId)
            .eq('email', email);
        }
        continue;
      }

      // result.data is array of { id } for each email
      const sentIds = result.data || [];
      for (let j = 0; j < batch.length; j++) {
        const resendId = sentIds[j]?.id || null;
        totalSent++;
        await supabase
          .from('email_campaign_recipients')
          .update({
            status: 'sent',
            resend_id: resendId,
            sent_at: new Date().toISOString(),
          })
          .eq('campaign_id', campaignId)
          .eq('email', batch[j]);
      }

      console.log(`[SendBulkEmail] Batch ${i / BATCH_SIZE + 1}: sent ${batch.length} emails`);
    } catch (err) {
      console.error(`[SendBulkEmail] Batch ${i / BATCH_SIZE + 1} exception:`, err);
      for (const email of batch) {
        totalFailed++;
        errors.push({ email, error: err.message });
      }
    }
  }

  // Update campaign status
  await supabase
    .from('email_campaigns')
    .update({
      status: totalFailed === recipients.length ? 'failed' : 'completed',
      sent_count: totalSent,
      failed_count: totalFailed,
      completed_at: new Date().toISOString(),
    })
    .eq('id', campaignId);

  console.log(`[SendBulkEmail] Campaign ${campaignId}: ${totalSent} sent, ${totalFailed} failed`);

  return jsonResponse({
    success: true,
    campaign_id: campaignId,
    total: recipients.length,
    sent: totalSent,
    failed: totalFailed,
    errors: errors.length > 0 ? errors : undefined,
  });
}

async function handleListCampaigns(supabase: ReturnType<typeof createClient>): Promise<Response> {
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('id, name, subject, from_email, status, total_recipients, sent_count, failed_count, created_at, completed_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({ campaigns: data });
}

async function handleCampaignStatus(body: BulkEmailRequest, supabase: ReturnType<typeof createClient>): Promise<Response> {
  if (!body.campaign_id) {
    return jsonResponse({ error: 'campaign_id required' }, 400);
  }

  const { data: campaign, error: campError } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('id', body.campaign_id)
    .single();

  if (campError || !campaign) {
    return jsonResponse({ error: 'Campaign not found' }, 404);
  }

  const { data: recipients } = await supabase
    .from('email_campaign_recipients')
    .select('email, status, resend_id, error, sent_at')
    .eq('campaign_id', body.campaign_id)
    .order('sent_at', { ascending: false });

  return jsonResponse({
    campaign: {
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      from_email: campaign.from_email,
      status: campaign.status,
      total_recipients: campaign.total_recipients,
      sent_count: campaign.sent_count,
      failed_count: campaign.failed_count,
      created_at: campaign.created_at,
      completed_at: campaign.completed_at,
    },
    recipients: recipients || [],
  });
}

// ── Helpers ────────────────────────────────────────────────────────

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
