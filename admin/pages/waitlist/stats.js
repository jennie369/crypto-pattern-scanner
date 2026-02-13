/**
 * Waitlist Statistics Page
 * Thong ke va bieu do waitlist
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import StatsCard from '../../components/StatsCard';
import api from '../../services/api';

const statusColors = {
  pending: '#eab308',     // yellow
  verified: '#3b82f6',    // blue
  nurturing: '#a855f7',   // purple
  completed: '#22c55e',   // green
  converted: '#f59e0b',   // amber
  unsubscribed: '#6b7280', // gray
  invalid: '#ef4444',     // red
};

const statusLabels = {
  pending: 'Chờ xác minh',
  verified: 'Đã kết nối',
  nurturing: 'Đang nurturing',
  completed: 'Hoàn thành',
  converted: 'Đã convert',
  unsubscribed: 'Đã hủy',
  invalid: 'Không hợp lệ',
};

export default function WaitlistStatsPage() {
  const [stats, setStats] = useState(null);
  const [nurturingStatus, setNurturingStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, nurturingRes] = await Promise.all([
        api.getWaitlistStats(),
        api.getNurturingStatus(),
      ]);
      setStats(statsRes);
      setNurturingStatus(nurturingRes);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const result = await api.exportWaitlist(format);

      if (format === 'csv' && result.content) {
        // Download CSV
        const blob = new Blob([result.content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename || 'waitlist_export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Download JSON
        const blob = new Blob([JSON.stringify(result.entries, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'waitlist_export.json';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      alert('Lỗi export: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const statusData = stats ? [
    { status: 'pending', count: stats.pending || 0 },
    { status: 'verified', count: 0 },  // Not in stats, calculate from zalo_connected - nurturing
    { status: 'nurturing', count: stats.nurturing || 0 },
    { status: 'completed', count: stats.completed || 0 },
    { status: 'converted', count: stats.converted || 0 },
    { status: 'unsubscribed', count: stats.unsubscribed || 0 },
  ].filter(d => d.count > 0) : [];

  const totalForPie = statusData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Thống kê Waitlist</h1>
          <p className="text-gray-400 mt-1">Phân tích và báo cáo waitlist</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/waitlist"
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Danh sách
          </Link>
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {exporting ? 'Đang xuất...' : 'Xuất CSV'}
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Xuất JSON
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Tổng đăng ký"
          value={stats?.total_entries?.toLocaleString() || '0'}
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          loading={loading}
        />
        <StatsCard
          title="Kết nối Zalo"
          value={stats?.zalo_connected?.toLocaleString() || '0'}
          change={stats?.connection_rate ? `${stats.connection_rate}% tỷ lệ` : undefined}
          changeType={stats?.connection_rate >= 70 ? 'positive' : stats?.connection_rate >= 50 ? 'neutral' : 'negative'}
          icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          loading={loading}
        />
        <StatsCard
          title="Hôm nay"
          value={stats?.today_signups?.toLocaleString() || '0'}
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={loading}
        />
        <StatsCard
          title="Đã convert"
          value={stats?.converted?.toLocaleString() || '0'}
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Phân bố trạng thái</h3>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-8 bg-gray-700 rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {statusData.map(item => (
                <div key={item.status} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{statusLabels[item.status]}</span>
                    <span className="text-white font-medium">
                      {item.count.toLocaleString()} ({totalForPie > 0 ? Math.round(item.count / totalForPie * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${totalForPie > 0 ? (item.count / totalForPie * 100) : 0}%`,
                        backgroundColor: statusColors[item.status],
                      }}
                    />
                  </div>
                </div>
              ))}

              {statusData.length === 0 && (
                <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
              )}
            </div>
          )}
        </div>

        {/* Nurturing Funnel */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Nurturing Funnel</h3>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-gray-700 rounded" />
              ))}
            </div>
          ) : nurturingStatus?.stages ? (
            <div className="space-y-3">
              {[
                { stage: 0, label: 'Chưa bắt đầu', color: '#6b7280' },
                { stage: 1, label: 'Day 0 - Welcome', color: '#3b82f6' },
                { stage: 2, label: 'Day 3 - Value', color: '#8b5cf6' },
                { stage: 3, label: 'Day 7 - Feature', color: '#a855f7' },
                { stage: 4, label: 'Day 10 - Social Proof', color: '#d946ef' },
                { stage: 5, label: 'Day 14 - Urgency', color: '#22c55e' },
              ].map((item, index) => {
                const count = nurturingStatus.stages[`stage_${item.stage}`] || 0;
                const maxCount = Math.max(...Object.values(nurturingStatus.stages || {}), 1);

                return (
                  <div key={item.stage} className="flex items-center space-x-4">
                    <div className="w-32 text-sm text-gray-400">{item.label}</div>
                    <div className="flex-1 h-8 bg-gray-700 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                        style={{
                          width: `${(count / maxCount) * 100}%`,
                          backgroundColor: item.color,
                          minWidth: count > 0 ? '40px' : '0',
                        }}
                      >
                        <span className="text-white text-sm font-medium">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Chưa có dữ liệu nurturing</p>
          )}
        </div>
      </div>

      {/* Worker Status */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Nurturing Worker Status</h3>

        {loading ? (
          <div className="animate-pulse h-20 bg-gray-700 rounded" />
        ) : nurturingStatus ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-400 text-sm">Trạng thái</p>
              <p className={`text-lg font-semibold ${nurturingStatus.running ? 'text-green-400' : 'text-red-400'}`}>
                {nurturingStatus.running ? 'Đang chạy' : 'Dừng'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Đang xử lý</p>
              <p className="text-lg font-semibold text-white">
                {nurturingStatus.processing ? 'Có' : 'Không'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Chờ nurturing</p>
              <p className="text-lg font-semibold text-amber-400">
                {nurturingStatus.pending_nurturing?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Tin nhắn hôm nay</p>
              <p className="text-lg font-semibold text-purple-400">
                {nurturingStatus.messages_today?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Không thể tải trạng thái worker</p>
        )}
      </div>

      {/* Quick Stats Table */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Chi tiết theo trạng thái</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                <th className="pb-3 font-medium">Trạng thái</th>
                <th className="pb-3 font-medium text-right">Số lượng</th>
                <th className="pb-3 font-medium text-right">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <tr>
                <td className="py-3 text-gray-300">Chờ xác minh</td>
                <td className="py-3 text-right text-white">{stats?.pending?.toLocaleString() || 0}</td>
                <td className="py-3 text-right text-gray-400">
                  {stats?.total_entries ? Math.round((stats.pending || 0) / stats.total_entries * 100) : 0}%
                </td>
              </tr>
              <tr>
                <td className="py-3 text-gray-300">Đang nurturing</td>
                <td className="py-3 text-right text-white">{stats?.nurturing?.toLocaleString() || 0}</td>
                <td className="py-3 text-right text-gray-400">
                  {stats?.total_entries ? Math.round((stats.nurturing || 0) / stats.total_entries * 100) : 0}%
                </td>
              </tr>
              <tr>
                <td className="py-3 text-gray-300">Hoàn thành nurturing</td>
                <td className="py-3 text-right text-white">{stats?.completed?.toLocaleString() || 0}</td>
                <td className="py-3 text-right text-gray-400">
                  {stats?.total_entries ? Math.round((stats.completed || 0) / stats.total_entries * 100) : 0}%
                </td>
              </tr>
              <tr>
                <td className="py-3 text-gray-300">Đã convert</td>
                <td className="py-3 text-right text-green-400 font-medium">{stats?.converted?.toLocaleString() || 0}</td>
                <td className="py-3 text-right text-gray-400">
                  {stats?.total_entries ? Math.round((stats.converted || 0) / stats.total_entries * 100) : 0}%
                </td>
              </tr>
              <tr>
                <td className="py-3 text-gray-300">Đã hủy đăng ký</td>
                <td className="py-3 text-right text-red-400">{stats?.unsubscribed?.toLocaleString() || 0}</td>
                <td className="py-3 text-right text-gray-400">
                  {stats?.total_entries ? Math.round((stats.unsubscribed || 0) / stats.total_entries * 100) : 0}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
