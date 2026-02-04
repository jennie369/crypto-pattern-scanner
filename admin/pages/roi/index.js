/**
 * ROI Dashboard - Main Page
 * Phase E - Admin ROI Dashboard
 * Comprehensive ROI analytics and AI insights
 */

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { roiAnalyticsService } from '../../services/roiAnalyticsApi';

// ============ KPI Card Component ============
function KPICard({ label, value, icon, color = 'gold', tooltip, trend }) {
  const colorClasses = {
    gold: 'text-amber-500',
    green: 'text-green-500',
    red: 'text-red-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{label}</p>
          <p className={`text-3xl font-bold ${colorClasses[color]}`}>
            {value ?? '—'}
          </p>
          {trend !== undefined && (
            <p className={`text-sm mt-1 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend >= 0 ? '+' : ''}{trend}% so với hôm qua
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg bg-gray-700 ${colorClasses[color]}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
        )}
      </div>
      {tooltip && (
        <p className="text-gray-500 text-xs mt-3">{tooltip}</p>
      )}
    </div>
  );
}

// ============ Health Distribution Component ============
function HealthDistribution({ data }) {
  const statuses = [
    { key: 'healthy', label: 'Khỏe mạnh', color: 'bg-green-500' },
    { key: 'warning', label: 'Cảnh báo', color: 'bg-yellow-500' },
    { key: 'danger', label: 'Nguy hiểm', color: 'bg-orange-500' },
    { key: 'burned', label: 'Cháy', color: 'bg-red-500' },
    { key: 'wiped', label: 'Mất trắng', color: 'bg-purple-500' },
  ];

  const total = statuses.reduce((sum, s) => sum + (data?.[s.key] || 0), 0);

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Phân bổ sức khỏe tài khoản</h3>

      {/* Progress bar */}
      <div className="h-4 rounded-full bg-gray-700 flex overflow-hidden mb-4">
        {statuses.map((status) => {
          const count = data?.[status.key] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return pct > 0 ? (
            <div
              key={status.key}
              className={`${status.color} transition-all`}
              style={{ width: `${pct}%` }}
              title={`${status.label}: ${count}`}
            />
          ) : null;
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-5 gap-2">
        {statuses.map((status) => (
          <div key={status.key} className="text-center">
            <div className={`w-3 h-3 rounded-full ${status.color} mx-auto mb-1`} />
            <p className="text-white font-bold text-lg">{data?.[status.key] || 0}</p>
            <p className="text-gray-400 text-xs">{status.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ Scanner Impact Component ============
function ScannerImpact({ data }) {
  const scannerWinRate = data?.scanner_win_rate ?? 0;
  const manualWinRate = data?.manual_win_rate ?? 0;
  const advantage = data?.advantage ?? 0;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Hiệu quả Scanner vs Thủ công</h3>

      <div className="grid grid-cols-2 gap-6">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Dùng Scanner</p>
          <p className="text-4xl font-bold text-green-500">{scannerWinRate?.toFixed(1)}%</p>
          <p className="text-gray-500 text-xs mt-1">Tỷ lệ thắng</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Giao dịch thủ công</p>
          <p className="text-4xl font-bold text-red-500">{manualWinRate?.toFixed(1)}%</p>
          <p className="text-gray-500 text-xs mt-1">Tỷ lệ thắng</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-700 rounded-lg text-center">
        <p className="text-gray-300 text-sm">Lợi thế Scanner</p>
        <p className={`text-2xl font-bold ${advantage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {advantage >= 0 ? '+' : ''}{advantage?.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}

// ============ AI Report Panel ============
function AIReportPanel({ report, onRefresh, loading }) {
  if (!report) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="text-center py-8">
          <p className="text-gray-400">Chưa có báo cáo AI</p>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-amber-500 text-gray-900 rounded-lg font-medium hover:bg-amber-400 disabled:opacity-50"
          >
            {loading ? 'Đang tạo...' : 'Tạo báo cáo'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Báo cáo AI hàng ngày</h3>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">
            {report.report_date}
          </span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-white"
            title="Tạo lại báo cáo"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Summary */}
      {report.summary && (
        <div className="mb-6">
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">
            {report.summary}
          </p>
        </div>
      )}

      {/* Insights */}
      {report.insights?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-amber-500 font-medium mb-3">Insights</h4>
          <div className="space-y-2">
            {report.insights.map((insight, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg flex items-start gap-3 ${
                  insight.type === 'positive' ? 'bg-green-900/30 text-green-300' :
                  insight.type === 'warning' ? 'bg-orange-900/30 text-orange-300' :
                  'bg-gray-700 text-gray-300'
                }`}
              >
                <span className="text-lg">
                  {insight.type === 'positive' ? '✓' : insight.type === 'warning' ? '!' : '•'}
                </span>
                <span>{insight.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-blue-400 font-medium mb-3">Khuyến nghị</h4>
          <div className="space-y-2">
            {report.recommendations.map((rec, i) => (
              <div key={i} className="p-3 bg-blue-900/20 rounded-lg text-blue-300 flex items-start gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  rec.priority === 'high' ? 'bg-red-500 text-white' :
                  rec.priority === 'medium' ? 'bg-yellow-500 text-gray-900' :
                  'bg-gray-600 text-white'
                }`}>
                  {rec.priority === 'high' ? 'Cao' : rec.priority === 'medium' ? 'TB' : 'Thấp'}
                </span>
                <span>{rec.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {report.warnings?.length > 0 && (
        <div>
          <h4 className="text-red-400 font-medium mb-3">Cảnh báo</h4>
          <div className="space-y-2">
            {report.warnings.map((warning, i) => (
              <div key={i} className="p-3 bg-red-900/30 rounded-lg text-red-300 flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{warning.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ Cohort Table Component ============
function CohortTable({ cohorts }) {
  const levelLabels = {
    devoted: 'Tận tâm',
    committed: 'Cam kết',
    regular: 'Thường xuyên',
    casual: 'Thỉnh thoảng',
    inactive: 'Không hoạt động',
  };

  const levelColors = {
    devoted: 'bg-amber-500 text-gray-900',
    committed: 'bg-green-500 text-white',
    regular: 'bg-blue-500 text-white',
    casual: 'bg-gray-500 text-white',
    inactive: 'bg-gray-700 text-gray-400',
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">So sánh theo mức độ thực hành</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="pb-3 font-medium">Mức độ</th>
              <th className="pb-3 font-medium text-right">Số người</th>
              <th className="pb-3 font-medium text-right">Tỷ lệ thắng TB</th>
              <th className="pb-3 font-medium text-right">Tỷ lệ cháy</th>
            </tr>
          </thead>
          <tbody>
            {(cohorts || []).map((cohort, i) => (
              <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                <td className="py-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${levelColors[cohort.practice_level] || 'bg-gray-600'}`}>
                    {levelLabels[cohort.practice_level] || cohort.practice_level}
                  </span>
                </td>
                <td className="py-3 text-right text-white">{cohort.users || 0}</td>
                <td className="py-3 text-right">
                  <span className={cohort.avg_win_rate >= 50 ? 'text-green-400' : 'text-red-400'}>
                    {cohort.avg_win_rate?.toFixed(1) ?? '—'}%
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className={cohort.burn_rate <= 10 ? 'text-green-400' : cohort.burn_rate <= 30 ? 'text-yellow-400' : 'text-red-400'}>
                    {cohort.burn_rate?.toFixed(1) ?? '—'}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ Main Page Component ============
export default function ROIDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryResult, reportResult] = await Promise.all([
        roiAnalyticsService.getRoiSummary(30),
        roiAnalyticsService.getLatestAiReport(),
      ]);

      if (summaryResult.success) {
        setSummary(summaryResult.data);
      }

      if (reportResult.success && reportResult.report) {
        setAiReport(reportResult.report);
      }
    } catch (err) {
      console.error('Error fetching ROI data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTriggerReport = async () => {
    try {
      setRefreshing(true);
      const result = await roiAnalyticsService.triggerAiReport();
      if (result.success) {
        // Wait a bit and refresh
        setTimeout(fetchData, 3000);
      }
    } catch (err) {
      console.error('Error triggering report:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      const result = await roiAnalyticsService.exportHtml({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      });

      if (result.success && result.file_url) {
        window.open(result.file_url, '_blank');
      }
    } catch (err) {
      console.error('Error exporting:', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </Layout>
    );
  }

  const users = summary?.users || {};
  const health = summary?.health || {};
  const trading = summary?.trading || {};
  const wellness = summary?.wellness || {};
  const cohorts = summary?.cohorts || [];

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">ROI Dashboard</h1>
          <p className="text-gray-400">Phân tích và chứng minh ROI với dữ liệu thực</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Xuất HTML
          </button>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg font-medium hover:bg-amber-400 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Tỷ lệ tài khoản không cháy"
          value={`${(100 - (health?.burn_rate_pct || 0)).toFixed(1)}%`}
          icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          color="green"
          tooltip="% tài khoản giữ được >10% vốn ban đầu"
        />
        <KPICard
          label="Tỷ lệ thắng với Scanner"
          value={`${trading?.scanner_vs_manual?.scanner_win_rate?.toFixed(1) || 0}%`}
          icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          color="gold"
          tooltip="Tỷ lệ thắng TB khi sử dụng Scanner"
        />
        <KPICard
          label="Hoàn thành Nghi thức"
          value={`${wellness?.morning_ritual_rate?.toFixed(1) || 0}%`}
          icon="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          color="purple"
          tooltip="% users hoàn thành nghi thức buổi sáng"
        />
        <KPICard
          label="Người dùng hoạt động"
          value={users?.active_30d?.toLocaleString() || 0}
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          color="blue"
          tooltip="Users hoạt động trong 30 ngày qua"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Health Distribution */}
        <HealthDistribution data={health?.distribution} />

        {/* Scanner Impact */}
        <ScannerImpact data={trading?.scanner_vs_manual} />
      </div>

      {/* AI Report */}
      <div className="mb-6">
        <AIReportPanel
          report={aiReport}
          onRefresh={handleTriggerReport}
          loading={refreshing}
        />
      </div>

      {/* Cohort Table */}
      <CohortTable cohorts={cohorts} />
    </Layout>
  );
}
