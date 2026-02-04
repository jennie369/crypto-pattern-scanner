/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROI AI REPORT - Edge Function
 * ROI Proof System - Phase E
 * Generates AI-powered daily reports using Gemini 2.5 Flash
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get date from request body or use today
    const body = await req.json().catch(() => ({}));
    const targetDate = body.date || new Date().toISOString().split('T')[0];

    console.log(`[ROI AI Report] Starting report generation for: ${targetDate}`);

    // ═══════════════════════════════════════════════════
    // Update report status to processing
    // ═══════════════════════════════════════════════════
    await supabase
      .from('admin_ai_daily_reports')
      .update({
        status: 'processing',
        processing_started_at: new Date().toISOString(),
      })
      .eq('report_date', targetDate);

    // ═══════════════════════════════════════════════════
    // Fetch ROI Summary Data
    // ═══════════════════════════════════════════════════
    console.log('[ROI AI Report] Fetching ROI summary...');
    const { data: roiSummary, error: summaryError } = await supabase.rpc(
      'get_admin_roi_summary',
      { p_days: 30 }
    );

    if (summaryError) {
      throw new Error(`Failed to fetch ROI summary: ${summaryError.message}`);
    }

    // ═══════════════════════════════════════════════════
    // Generate AI Report with Gemini
    // ═══════════════════════════════════════════════════
    console.log('[ROI AI Report] Calling Gemini API...');

    const prompt = buildGeminiPrompt(roiSummary, targetDate);
    const geminiResponse = await callGeminiAPI(geminiApiKey, prompt);

    if (!geminiResponse.success) {
      throw new Error(`Gemini API failed: ${geminiResponse.error}`);
    }

    const aiContent = parseGeminiResponse(geminiResponse.content);

    // ═══════════════════════════════════════════════════
    // Extract KPIs from summary
    // ═══════════════════════════════════════════════════
    const kpis = extractKPIs(roiSummary);

    // ═══════════════════════════════════════════════════
    // Save Report to Database
    // ═══════════════════════════════════════════════════
    const processingDuration = Date.now() - startTime;

    const { error: updateError } = await supabase
      .from('admin_ai_daily_reports')
      .update({
        status: 'completed',
        raw_data: roiSummary,
        ai_summary: aiContent.summary,
        ai_insights: aiContent.insights,
        ai_recommendations: aiContent.recommendations,
        ai_warnings: aiContent.warnings,
        ...kpis,
        processing_completed_at: new Date().toISOString(),
        processing_duration_ms: processingDuration,
        ai_model_used: 'gemini-2.5-flash',
        ai_tokens_used: geminiResponse.tokensUsed || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('report_date', targetDate);

    if (updateError) {
      throw new Error(`Failed to save report: ${updateError.message}`);
    }

    // ═══════════════════════════════════════════════════
    // Send Admin Notification
    // ═══════════════════════════════════════════════════
    try {
      const { data: admins } = await supabase
        .from('profiles')
        .select('expo_push_token')
        .in('role', ['admin', 'super_admin'])
        .not('expo_push_token', 'is', null);

      if (admins && admins.length > 0) {
        const pushTokens = admins
          .map((a) => a.expo_push_token)
          .filter((t) => t && t.startsWith('ExponentPushToken'));

        if (pushTokens.length > 0) {
          await sendAdminNotification(
            pushTokens,
            'Báo cáo ROI hàng ngày',
            `Báo cáo ngày ${targetDate} đã sẵn sàng. ${aiContent.insights?.length || 0} insights mới.`
          );

          // Mark notification sent
          await supabase
            .from('admin_ai_daily_reports')
            .update({
              admin_notified: true,
              admin_notified_at: new Date().toISOString(),
            })
            .eq('report_date', targetDate);
        }
      }
    } catch (notifError) {
      console.error('[ROI AI Report] Notification error:', notifError);
    }

    console.log(`[ROI AI Report] Completed in ${processingDuration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        date: targetDate,
        duration_ms: processingDuration,
        insights_count: aiContent.insights?.length || 0,
        recommendations_count: aiContent.recommendations?.length || 0,
        warnings_count: aiContent.warnings?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[ROI AI Report] Fatal error:', error);

    // Try to mark report as failed
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const body = await req.json().catch(() => ({}));
      const targetDate = body.date || new Date().toISOString().split('T')[0];

      await supabase
        .from('admin_ai_daily_reports')
        .update({
          status: 'failed',
          error_message: String(error),
          retry_count: supabase.sql`retry_count + 1`,
          updated_at: new Date().toISOString(),
        })
        .eq('report_date', targetDate);
    } catch (e) {
      console.error('[ROI AI Report] Failed to update error status:', e);
    }

    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Build Gemini prompt from ROI summary
 */
function buildGeminiPrompt(summary: any, date: string): string {
  return `Bạn là chuyên gia phân tích dữ liệu trading cho ứng dụng GEM Trading.
Hãy phân tích dữ liệu ROI sau và tạo báo cáo bằng tiếng Việt có dấu đầy đủ.

NGÀY BÁO CÁO: ${date}

DỮ LIỆU TỔNG HỢP 30 NGÀY:
${JSON.stringify(summary, null, 2)}

YÊU CẦU:
Trả về JSON với format sau (không có markdown code block):
{
  "summary": "2-3 đoạn văn tóm tắt tình hình chung của nền tảng",
  "insights": [
    {"type": "positive|warning|neutral", "icon": "tên_icon", "text": "Nội dung insight"}
  ],
  "recommendations": [
    {"priority": "high|medium|low", "text": "Khuyến nghị hành động"}
  ],
  "warnings": [
    {"severity": "critical|high|medium", "text": "Cảnh báo cần chú ý"}
  ]
}

HƯỚNG DẪN PHÂN TÍCH:
1. SUMMARY: Tóm tắt tổng quan về:
   - Số lượng và tình trạng users
   - Hiệu quả trading (win rate, PnL)
   - Sức khỏe tài khoản (burn rate)
   - Hiệu quả Scanner vs Manual
   - Tương quan Ritual/Discipline với kết quả

2. INSIGHTS (3-5 mục):
   - So sánh Scanner users vs Manual traders
   - Tương quan Karma level với burn rate
   - Hiệu quả của Morning Ritual
   - Điểm kỷ luật và hiệu suất
   - Xu hướng đáng chú ý

3. RECOMMENDATIONS (2-4 mục):
   - Hành động cụ thể để cải thiện metrics
   - Chiến lược giữ chân users
   - Cách giảm burn rate

4. WARNINGS (0-3 mục, chỉ khi cần):
   - Burn rate cao bất thường
   - Giảm users hoạt động
   - Vấn đề nghiêm trọng cần can thiệp

ICONS cho insights: TrendingUp, TrendingDown, Users, Target, Shield, AlertTriangle, CheckCircle, Activity, Award, Zap

Trả về JSON hợp lệ, không có text khác.`;
}

/**
 * Call Gemini API
 */
async function callGeminiAPI(
  apiKey: string,
  prompt: string
): Promise<{ success: boolean; content?: string; error?: string; tokensUsed?: number }> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `API error ${response.status}: ${errorText}` };
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      return { success: false, error: 'Invalid response structure' };
    }

    const content = data.candidates[0].content.parts[0].text;
    const tokensUsed = data.usageMetadata?.totalTokenCount || 0;

    return { success: true, content, tokensUsed };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Parse Gemini response into structured data
 */
function parseGeminiResponse(content: string): {
  summary: string;
  insights: any[];
  recommendations: any[];
  warnings: any[];
} {
  const defaultResponse = {
    summary: 'Không thể tạo báo cáo. Vui lòng thử lại sau.',
    insights: [],
    recommendations: [],
    warnings: [],
  };

  try {
    // Remove markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.slice(7);
    }
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(0, -3);
    }

    const parsed = JSON.parse(cleanContent.trim());

    return {
      summary: parsed.summary || defaultResponse.summary,
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
    };
  } catch (e) {
    console.error('[ROI AI Report] Failed to parse Gemini response:', e);
    // Return the raw content as summary if JSON parsing fails
    return {
      ...defaultResponse,
      summary: content.substring(0, 2000),
    };
  }
}

/**
 * Extract KPIs from ROI summary
 */
function extractKPIs(summary: any): Record<string, any> {
  const users = summary?.users || {};
  const health = summary?.health || {};
  const trading = summary?.trading || {};
  const wellness = summary?.wellness || {};
  const ai = summary?.ai || {};
  const healthDist = health?.distribution || {};

  return {
    kpi_total_users: users?.total || 0,
    kpi_active_users: users?.active_30d || 0,
    kpi_new_users_today: users?.new_today || 0,
    kpi_total_trades: trading?.total_trades || 0,
    kpi_avg_win_rate: trading?.avg_win_rate || null,
    kpi_total_pnl: trading?.total_pnl || 0,
    kpi_accounts_healthy: healthDist?.healthy || 0,
    kpi_accounts_warning: healthDist?.warning || 0,
    kpi_accounts_danger: healthDist?.danger || 0,
    kpi_accounts_burned: healthDist?.burned || 0,
    kpi_accounts_wiped: healthDist?.wiped || 0,
    kpi_burn_rate_pct: health?.burn_rate_pct || null,
    kpi_ritual_completion_rate: wellness?.morning_ritual_rate || null,
    kpi_scanner_usage_pct: trading?.scanner_usage_pct || null,
    kpi_ai_blocks_today: ai?.blocks_triggered || 0,
    kpi_ai_conversations: ai?.total_conversations || 0,
  };
}

/**
 * Send notification to admins
 */
async function sendAdminNotification(
  pushTokens: string[],
  title: string,
  body: string
) {
  const messages = pushTokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data: { type: 'admin_daily_report' },
  }));

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    throw new Error(`Expo push failed: ${response.status}`);
  }

  return response.json();
}
