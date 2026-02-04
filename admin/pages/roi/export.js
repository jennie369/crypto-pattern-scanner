/**
 * ROI Export Page
 * Phase E - Admin ROI Dashboard
 * Export ROI proof data as HTML for marketing
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { roiAnalyticsService } from '../../services/roiAnalyticsApi';

// Date picker helper
function DateInput({ label, value, onChange, max }) {
  return (
    <div>
      <label className="block text-gray-400 text-sm mb-1">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        max={max}
        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
      />
    </div>
  );
}

// Export history item
function ExportItem({ item }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <p className="text-white font-medium">{item.file_name || 'ROI Report'}</p>
            <p className="text-gray-400 text-sm">
              {item.date_range_start && item.date_range_end
                ? `${item.date_range_start} → ${item.date_range_end}`
                : item.export_date}
            </p>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-gray-400 text-sm">
          {new Date(item.created_at).toLocaleString('vi-VN')}
        </p>
        {item.file_size_bytes && (
          <p className="text-gray-500 text-xs">
            {(item.file_size_bytes / 1024).toFixed(1)} KB
          </p>
        )}
      </div>
      {item.file_url && (
        <a
          href={item.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Tải xuống
        </a>
      )}
    </div>
  );
}

export default function ExportPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  // Fetch export history
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const result = await roiAnalyticsService.getExportHistory({ limit: 10 });
      if (result.success) {
        setExports(result.exports);
      }
    } catch (err) {
      console.error('Error fetching export history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handle export
  const handleExport = async () => {
    if (!startDate || !endDate) {
      setError('Vui lòng chọn khoảng thời gian');
      return;
    }

    try {
      setExporting(true);
      setError(null);

      const result = await roiAnalyticsService.exportHtml({
        startDate,
        endDate,
      });

      if (result.success && result.file_url) {
        setPreviewUrl(result.file_url);
        fetchHistory(); // Refresh history
      } else {
        setError(result.error || 'Xuất HTML thất bại');
      }
    } catch (err) {
      console.error('Error exporting:', err);
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  // Quick preset buttons
  const setPreset = (days) => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - days);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <Link href="/roi" className="hover:text-white">ROI Dashboard</Link>
          <span>/</span>
          <span>Xuất HTML</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Xuất báo cáo ROI</h1>
        <p className="text-gray-400 mt-1">Tạo trang HTML đẹp để sử dụng cho marketing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Form */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Tạo báo cáo mới</h2>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <DateInput
              label="Từ ngày"
              value={startDate}
              onChange={setStartDate}
              max={endDate || todayStr}
            />
            <DateInput
              label="Đến ngày"
              value={endDate}
              onChange={setEndDate}
              max={todayStr}
            />
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setPreset(7)}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600"
            >
              7 ngày
            </button>
            <button
              onClick={() => setPreset(30)}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600"
            >
              30 ngày
            </button>
            <button
              onClick={() => setPreset(90)}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600"
            >
              90 ngày
            </button>
            <button
              onClick={() => setPreset(180)}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600"
            >
              6 tháng
            </button>
            <button
              onClick={() => setPreset(365)}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600"
            >
              1 năm
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting || !startDate || !endDate}
            className="w-full px-4 py-3 bg-amber-500 text-gray-900 rounded-lg font-medium hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Đang xuất...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Xuất HTML
              </>
            )}
          </button>

          {/* Preview Link */}
          {previewUrl && (
            <div className="mt-4 p-4 bg-green-900/30 border border-green-500 rounded-lg">
              <p className="text-green-300 text-sm mb-2">Xuất thành công!</p>
              <div className="flex gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-center hover:bg-green-500"
                >
                  Xem trước
                </a>
                <a
                  href={previewUrl}
                  download
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Tải xuống
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Xem trước</h2>
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 hover:text-amber-400 text-sm flex items-center gap-1"
              >
                Mở tab mới
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
          <div className="h-[500px] bg-gray-900">
            {previewUrl ? (
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title="ROI Report Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Chưa có báo cáo để xem</p>
                  <p className="text-sm mt-1">Chọn khoảng thời gian và bấm "Xuất HTML"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export History */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Lịch sử xuất</h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : exports.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-xl border border-gray-700">
            Chưa có lịch sử xuất
          </div>
        ) : (
          <div className="space-y-3">
            {exports.map((item) => (
              <ExportItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
