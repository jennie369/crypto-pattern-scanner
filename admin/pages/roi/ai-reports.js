/**
 * AI Reports History Page
 * Phase E - Admin ROI Dashboard
 * View and manage AI-generated daily reports
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { roiAnalyticsService } from '../../services/roiAnalyticsApi';

// Status badge component
function StatusBadge({ status }) {
  const statusConfig = {
    completed: { label: 'Hoàn thành', bg: 'bg-green-500/20', text: 'text-green-400' },
    processing: { label: 'Đang xử lý', bg: 'bg-blue-500/20', text: 'text-blue-400' },
    pending: { label: 'Chờ xử lý', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    failed: { label: 'Thất bại', bg: 'bg-red-500/20', text: 'text-red-400' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

// Report detail modal
function ReportDetailModal({ report, onClose }) {
  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">
              Báo cáo ngày {report.report_date}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={report.status} />
              {report.ai_model_used && (
                <span className="text-gray-400 text-sm">{report.ai_model_used}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KPIs */}
          <div>
            <h3 className="text-amber-500 font-semibold mb-3">KPIs</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Tổng users</p>
                <p className="text-white text-xl font-bold">{report.kpi_total_users || 0}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Users hoạt động</p>
                <p className="text-white text-xl font-bold">{report.kpi_active_users || 0}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Tỷ lệ thắng TB</p>
                <p className="text-green-400 text-xl font-bold">{report.kpi_avg_win_rate?.toFixed(1) || 0}%</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Tỷ lệ cháy</p>
                <p className="text-red-400 text-xl font-bold">{report.kpi_burn_rate_pct?.toFixed(1) || 0}%</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          {report.ai_summary && (
            <div>
              <h3 className="text-amber-500 font-semibold mb-3">Tóm tắt AI</h3>
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                  {report.ai_summary}
                </p>
              </div>
            </div>
          )}

          {/* Insights */}
          {report.ai_insights?.length > 0 && (
            <div>
              <h3 className="text-amber-500 font-semibold mb-3">Insights</h3>
              <div className="space-y-2">
                {report.ai_insights.map((insight, i) => (
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
          {report.ai_recommendations?.length > 0 && (
            <div>
              <h3 className="text-blue-400 font-semibold mb-3">Khuyến nghị</h3>
              <div className="space-y-2">
                {report.ai_recommendations.map((rec, i) => (
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
          {report.ai_warnings?.length > 0 && (
            <div>
              <h3 className="text-red-400 font-semibold mb-3">Cảnh báo</h3>
              <div className="space-y-2">
                {report.ai_warnings.map((warning, i) => (
                  <div key={i} className="p-3 bg-red-900/30 rounded-lg text-red-300">
                    {warning.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error if failed */}
          {report.status === 'failed' && report.error_message && (
            <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg">
              <h3 className="text-red-400 font-semibold mb-2">Lỗi</h3>
              <p className="text-red-300 text-sm font-mono">{report.error_message}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="text-gray-500 text-sm space-y-1">
            <p>Tạo lúc: {new Date(report.created_at).toLocaleString('vi-VN')}</p>
            {report.processing_duration_ms && (
              <p>Thời gian xử lý: {(report.processing_duration_ms / 1000).toFixed(2)}s</p>
            )}
            {report.ai_tokens_used && (
              <p>Tokens sử dụng: {report.ai_tokens_used.toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIReportsPage() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [triggering, setTriggering] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const result = await roiAnalyticsService.getAiReports({
        status: statusFilter,
        page,
        limit: 20,
      });

      if (result.success) {
        setReports(result.reports);
        setTotal(result.total);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleTriggerReport = async () => {
    try {
      setTriggering(true);
      const result = await roiAnalyticsService.triggerAiReport();
      if (result.success) {
        // Refresh after a short delay
        setTimeout(fetchReports, 2000);
      }
    } catch (err) {
      console.error('Error triggering report:', err);
    } finally {
      setTriggering(false);
    }
  };

  const handleRetry = async (date) => {
    try {
      await roiAnalyticsService.retryAiReport(date);
      setTimeout(fetchReports, 2000);
    } catch (err) {
      console.error('Error retrying report:', err);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Link href="/roi" className="hover:text-white">ROI Dashboard</Link>
            <span>/</span>
            <span>AI Reports</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Lịch sử báo cáo AI</h1>
        </div>
        <button
          onClick={handleTriggerReport}
          disabled={triggering}
          className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg font-medium hover:bg-amber-400 disabled:opacity-50 flex items-center gap-2"
        >
          {triggering ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Đang tạo...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo báo cáo mới
            </>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="completed">Hoàn thành</option>
          <option value="processing">Đang xử lý</option>
          <option value="pending">Chờ xử lý</option>
          <option value="failed">Thất bại</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Chưa có báo cáo nào</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="px-6 py-4 font-medium">Ngày</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium">Model</th>
                <th className="px-6 py-4 font-medium">Insights</th>
                <th className="px-6 py-4 font-medium">Thời gian</th>
                <th className="px-6 py-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  <td className="px-6 py-4 text-white font-medium">
                    {report.report_date}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {report.ai_model_used || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {report.ai_insights?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {report.processing_duration_ms
                      ? `${(report.processing_duration_ms / 1000).toFixed(1)}s`
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {report.status === 'failed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRetry(report.report_date);
                        }}
                        className="text-amber-500 hover:text-amber-400 text-sm"
                      >
                        Thử lại
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-gray-400 text-sm">
            Hiển thị {reports.length} / {total} báo cáo
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-4 py-2 text-gray-400">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </Layout>
  );
}
