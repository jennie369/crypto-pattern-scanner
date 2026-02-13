/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROI EXPORT HTML - Edge Function
 * ROI Proof System - Phase E
 * Generates beautiful HTML exports for marketing purposes
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const {
      start_date,
      end_date,
      user_id,
      config = {},
    } = body;

    const exportDate = new Date().toISOString().split('T')[0];
    console.log(`[ROI Export HTML] Starting export for: ${start_date} to ${end_date}`);

    // Validate admin access
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      // Check admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Admin access required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
    }

    // ═══════════════════════════════════════════════════
    // Fetch ROI Summary Data
    // ═══════════════════════════════════════════════════
    const days = start_date && end_date
      ? Math.ceil((new Date(end_date).getTime() - new Date(start_date).getTime()) / (1000 * 60 * 60 * 24))
      : 30;

    const { data: roiSummary, error: summaryError } = await supabase.rpc(
      'get_admin_roi_summary',
      { p_days: days }
    );

    if (summaryError) {
      throw new Error(`Failed to fetch ROI summary: ${summaryError.message}`);
    }

    // ═══════════════════════════════════════════════════
    // Generate HTML
    // ═══════════════════════════════════════════════════
    const html = generateHTML(roiSummary, {
      startDate: start_date || new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: end_date || exportDate,
      config,
    });

    // ═══════════════════════════════════════════════════
    // Upload to Storage
    // ═══════════════════════════════════════════════════
    const fileName = `roi-report-${exportDate}-${Date.now()}.html`;
    const filePath = `exports/roi/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(filePath, html, {
        contentType: 'text/html',
        upsert: true,
      });

    if (uploadError) {
      console.error('[ROI Export HTML] Upload error:', uploadError);
      // Return HTML directly if upload fails
      return new Response(html, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
        status: 200,
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('reports')
      .getPublicUrl(filePath);

    // ═══════════════════════════════════════════════════
    // Record Export History
    // ═══════════════════════════════════════════════════
    await supabase.from('proof_export_history').insert({
      exported_by: user_id,
      export_date: exportDate,
      export_type: 'html',
      date_range_start: start_date,
      date_range_end: end_date,
      file_url: publicUrl,
      file_size_bytes: new TextEncoder().encode(html).length,
      file_name: fileName,
      kpi_snapshot: {
        total_users: roiSummary?.users?.total,
        active_users: roiSummary?.users?.active_30d,
        avg_win_rate: roiSummary?.trading?.avg_win_rate,
        burn_rate: roiSummary?.health?.burn_rate_pct,
      },
      config,
      status: 'completed',
    });

    console.log(`[ROI Export HTML] Export completed: ${publicUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        file_url: publicUrl,
        file_name: fileName,
        file_size_bytes: new TextEncoder().encode(html).length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[ROI Export HTML] Fatal error:', error);
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
 * Generate beautiful HTML report
 */
function generateHTML(
  summary: any,
  options: { startDate: string; endDate: string; config: any }
): string {
  const { startDate, endDate } = options;
  const users = summary?.users || {};
  const health = summary?.health || {};
  const trading = summary?.trading || {};
  const wellness = summary?.wellness || {};
  const cohorts = summary?.cohorts || [];
  const healthDist = health?.distribution || {};

  const formatNumber = (n: any) => {
    if (n === null || n === undefined) return '—';
    return Number(n).toLocaleString('vi-VN');
  };

  const formatPercent = (n: any) => {
    if (n === null || n === undefined) return '—';
    return `${Number(n).toFixed(1)}%`;
  };

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GEM Trading - Báo cáo ROI</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      color: #e4e4e4;
      min-height: 100vh;
      padding: 40px 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding: 30px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }

    .header h1 {
      font-size: 2.5rem;
      background: linear-gradient(90deg, #FFD700, #FFA500);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
    }

    .header .date-range {
      color: #888;
      font-size: 1.1rem;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .kpi-card {
      background: rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: transform 0.3s ease;
    }

    .kpi-card:hover {
      transform: translateY(-5px);
    }

    .kpi-card .label {
      font-size: 0.9rem;
      color: #888;
      margin-bottom: 8px;
    }

    .kpi-card .value {
      font-size: 2rem;
      font-weight: bold;
    }

    .kpi-card .value.gold { color: #FFD700; }
    .kpi-card .value.green { color: #4CAF50; }
    .kpi-card .value.red { color: #f44336; }
    .kpi-card .value.blue { color: #2196F3; }

    .section {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 30px;
    }

    .section h2 {
      font-size: 1.5rem;
      margin-bottom: 20px;
      color: #FFD700;
    }

    .comparison-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .comparison-row:last-child {
      border-bottom: none;
    }

    .comparison-label {
      color: #888;
    }

    .comparison-values {
      display: flex;
      gap: 30px;
    }

    .comparison-value {
      text-align: center;
    }

    .comparison-value .title {
      font-size: 0.8rem;
      color: #666;
      margin-bottom: 5px;
    }

    .comparison-value .number {
      font-size: 1.3rem;
      font-weight: bold;
    }

    .health-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 15px;
      margin-top: 20px;
    }

    .health-item {
      text-align: center;
      padding: 20px;
      border-radius: 12px;
    }

    .health-item.healthy { background: rgba(76, 175, 80, 0.2); }
    .health-item.warning { background: rgba(255, 193, 7, 0.2); }
    .health-item.danger { background: rgba(255, 152, 0, 0.2); }
    .health-item.burned { background: rgba(244, 67, 54, 0.2); }
    .health-item.wiped { background: rgba(156, 39, 176, 0.2); }

    .health-item .count {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .health-item .label {
      font-size: 0.9rem;
      color: #888;
    }

    .cohort-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    .cohort-table th,
    .cohort-table td {
      padding: 15px;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .cohort-table th {
      color: #FFD700;
      font-weight: 600;
    }

    .cohort-table tr:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .badge.devoted { background: #FFD700; color: #000; }
    .badge.committed { background: #4CAF50; color: #fff; }
    .badge.regular { background: #2196F3; color: #fff; }
    .badge.casual { background: #9E9E9E; color: #fff; }
    .badge.inactive { background: #424242; color: #fff; }

    .footer {
      text-align: center;
      padding: 30px;
      color: #666;
      font-size: 0.9rem;
    }

    .footer .brand {
      color: #FFD700;
      font-weight: bold;
    }

    .highlight-box {
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1));
      border: 1px solid rgba(255, 215, 0, 0.3);
      border-radius: 12px;
      padding: 20px;
      margin-top: 20px;
    }

    .highlight-box h3 {
      color: #FFD700;
      margin-bottom: 10px;
    }

    @media print {
      body {
        background: #fff;
        color: #333;
        padding: 20px;
      }

      .kpi-card, .section {
        background: #f5f5f5;
        border: 1px solid #ddd;
      }

      .kpi-card .value.gold,
      .section h2,
      .highlight-box h3 {
        color: #B8860B;
      }
    }

    @media (max-width: 768px) {
      .header h1 {
        font-size: 1.8rem;
      }

      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .health-grid {
        grid-template-columns: repeat(3, 1fr);
      }

      .comparison-values {
        flex-direction: column;
        gap: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>GEM Trading - Báo cáo ROI</h1>
      <p class="date-range">Từ ${startDate} đến ${endDate}</p>
    </header>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="label">Tổng người dùng</div>
        <div class="value blue">${formatNumber(users.total)}</div>
      </div>
      <div class="kpi-card">
        <div class="label">Người dùng hoạt động (30 ngày)</div>
        <div class="value green">${formatNumber(users.active_30d)}</div>
      </div>
      <div class="kpi-card">
        <div class="label">Tỷ lệ thắng trung bình</div>
        <div class="value gold">${formatPercent(trading.avg_win_rate)}</div>
      </div>
      <div class="kpi-card">
        <div class="label">Tỷ lệ cháy tài khoản</div>
        <div class="value red">${formatPercent(health.burn_rate_pct)}</div>
      </div>
    </div>

    <section class="section">
      <h2>Hiệu quả Scanner vs Giao dịch thủ công</h2>
      <div class="comparison-row">
        <span class="comparison-label">Tỷ lệ thắng</span>
        <div class="comparison-values">
          <div class="comparison-value">
            <div class="title">Dùng Scanner</div>
            <div class="number" style="color: #4CAF50">${formatPercent(trading.scanner_vs_manual?.scanner_win_rate)}</div>
          </div>
          <div class="comparison-value">
            <div class="title">Giao dịch thủ công</div>
            <div class="number" style="color: #f44336">${formatPercent(trading.scanner_vs_manual?.manual_win_rate)}</div>
          </div>
        </div>
      </div>

      <div class="highlight-box">
        <h3>Lợi thế Scanner</h3>
        <p>Người dùng Scanner có tỷ lệ thắng cao hơn <strong style="color: #4CAF50">${formatPercent(trading.scanner_vs_manual?.advantage)}</strong> so với giao dịch thủ công.</p>
      </div>
    </section>

    <section class="section">
      <h2>Tác động của Nghi thức buổi sáng</h2>
      <div class="comparison-row">
        <span class="comparison-label">Tỷ lệ thắng</span>
        <div class="comparison-values">
          <div class="comparison-value">
            <div class="title">Có làm Nghi thức</div>
            <div class="number" style="color: #4CAF50">${formatPercent(wellness.ritual_boost?.with_ritual_win_rate)}</div>
          </div>
          <div class="comparison-value">
            <div class="title">Không làm Nghi thức</div>
            <div class="number" style="color: #888">${formatPercent(wellness.ritual_boost?.without_ritual_win_rate)}</div>
          </div>
        </div>
      </div>

      <div class="comparison-row">
        <span class="comparison-label">Tỷ lệ hoàn thành Nghi thức buổi sáng</span>
        <div class="comparison-values">
          <div class="comparison-value">
            <div class="number" style="color: #FFD700">${formatPercent(wellness.morning_ritual_rate)}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>Phân bổ sức khỏe tài khoản</h2>
      <div class="health-grid">
        <div class="health-item healthy">
          <div class="count" style="color: #4CAF50">${formatNumber(healthDist.healthy)}</div>
          <div class="label">Khỏe mạnh</div>
        </div>
        <div class="health-item warning">
          <div class="count" style="color: #FFC107">${formatNumber(healthDist.warning)}</div>
          <div class="label">Cảnh báo</div>
        </div>
        <div class="health-item danger">
          <div class="count" style="color: #FF9800">${formatNumber(healthDist.danger)}</div>
          <div class="label">Nguy hiểm</div>
        </div>
        <div class="health-item burned">
          <div class="count" style="color: #f44336">${formatNumber(healthDist.burned)}</div>
          <div class="label">Cháy</div>
        </div>
        <div class="health-item wiped">
          <div class="count" style="color: #9C27B0">${formatNumber(healthDist.wiped)}</div>
          <div class="label">Mất trắng</div>
        </div>
      </div>
    </section>

    ${cohorts && cohorts.length > 0 ? `
    <section class="section">
      <h2>So sánh theo mức độ thực hành</h2>
      <table class="cohort-table">
        <thead>
          <tr>
            <th>Mức độ</th>
            <th>Số người</th>
            <th>Tỷ lệ thắng TB</th>
            <th>Tỷ lệ cháy</th>
          </tr>
        </thead>
        <tbody>
          ${cohorts.map((c: any) => `
          <tr>
            <td><span class="badge ${c.practice_level}">${getPracticeLevelLabel(c.practice_level)}</span></td>
            <td>${formatNumber(c.users)}</td>
            <td>${formatPercent(c.avg_win_rate)}</td>
            <td>${formatPercent(c.burn_rate)}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
    ` : ''}

    <section class="section">
      <h2>Thống kê tổng hợp</h2>
      <div class="comparison-row">
        <span class="comparison-label">Tổng số giao dịch</span>
        <div class="number" style="color: #2196F3">${formatNumber(trading.total_trades)}</div>
      </div>
      <div class="comparison-row">
        <span class="comparison-label">Tổng PnL</span>
        <div class="number" style="color: ${trading.total_pnl >= 0 ? '#4CAF50' : '#f44336'}">${formatNumber(trading.total_pnl)} USD</div>
      </div>
      <div class="comparison-row">
        <span class="comparison-label">Tỷ lệ sử dụng Scanner</span>
        <div class="number" style="color: #FFD700">${formatPercent(trading.scanner_usage_pct)}</div>
      </div>
      <div class="comparison-row">
        <span class="comparison-label">Tổng Nghi thức hoàn thành</span>
        <div class="number" style="color: #9C27B0">${formatNumber(wellness.total_rituals)}</div>
      </div>
    </section>

    <footer class="footer">
      <p>Báo cáo được tạo tự động bởi <span class="brand">GEM Trading</span></p>
      <p>Ngày xuất: ${new Date().toLocaleString('vi-VN')}</p>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Get practice level label in Vietnamese
 */
function getPracticeLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    devoted: 'Tận tâm',
    committed: 'Cam kết',
    regular: 'Thường xuyên',
    casual: 'Thỉnh thoảng',
    inactive: 'Không hoạt động',
  };
  return labels[level] || level;
}
