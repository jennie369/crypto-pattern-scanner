/**
 * Waitlist Management Page
 * Danh sach va quan ly waitlist entries
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import DataTable from '../../components/DataTable';
import StatsCard from '../../components/StatsCard';
import api from '../../services/api';

const statusColors = {
  pending: 'bg-yellow-500',
  verified: 'bg-blue-500',
  nurturing: 'bg-purple-500',
  completed: 'bg-green-500',
  converted: 'bg-amber-500',
  unsubscribed: 'bg-gray-500',
  invalid: 'bg-red-500',
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

export default function WaitlistPage() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all',
    hasZalo: 'all',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
  });
  const [actionLoading, setActionLoading] = useState(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
      };
      if (filter.status !== 'all') params.status = filter.status;
      if (filter.hasZalo === 'yes') params.has_zalo = 'true';
      if (filter.hasZalo === 'no') params.has_zalo = 'false';
      if (filter.search) params.search = filter.search;

      const response = await api.getWaitlistEntries(params);
      setEntries(response.entries || []);
      setPagination((prev) => ({
        ...prev,
        total: response.total || 0,
      }));
    } catch (error) {
      console.error('Error loading entries:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [filter, pagination.page, pagination.limit]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await api.getWaitlistStats();
      setStats(response);
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleResendWelcome = async (entryId, e) => {
    e.stopPropagation();
    setActionLoading(entryId);
    try {
      await api.resendWelcome(entryId);
      alert('Tin chào mừng đã được gửi lại');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTriggerLaunch = async () => {
    if (!confirm('Bạn có chắc muốn gửi thông báo ra mắt cho 100 người đầu tiên?')) return;

    try {
      const result = await api.triggerLaunch(100);
      alert(`Đã queue thông báo cho ${result.count} người`);
      loadEntries();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const handleProcessNurturing = async () => {
    try {
      await api.processNurturingNow();
      alert('Đã trigger xử lý nurturing queue');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const columns = [
    {
      key: 'queue_number',
      title: 'STT',
      render: (value) => (
        <span className="text-amber-500 font-mono font-bold">#{value}</span>
      ),
    },
    {
      key: 'name',
      title: 'Tên',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-white">
            {value || row.zalo_display_name || 'Chưa có tên'}
          </div>
          {row.referral_code && (
            <div className="text-xs text-gray-500 font-mono">{row.referral_code}</div>
          )}
        </div>
      ),
    },
    {
      key: 'phone',
      title: 'Số điện thoại',
      render: (value) => (
        <span className="text-gray-300 font-mono">{value || '—'}</span>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (value) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[value]
          }/20`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusColors[value]} mr-1.5`}></span>
          {statusLabels[value] || value}
        </span>
      ),
    },
    {
      key: 'zalo_user_id',
      title: 'Zalo',
      render: (value) => (
        <span className={`text-sm ${value ? 'text-green-400' : 'text-gray-500'}`}>
          {value ? 'Đã kết nối' : 'Chưa kết nối'}
        </span>
      ),
    },
    {
      key: 'nurturing_stage',
      title: 'Nurturing',
      render: (value) => (
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((stage) => (
            <div
              key={stage}
              className={`w-2 h-2 rounded-full ${
                value >= stage ? 'bg-purple-500' : 'bg-gray-600'
              }`}
              title={`Stage ${stage}`}
            />
          ))}
          <span className="text-gray-400 text-xs ml-2">{value}/5</span>
        </div>
      ),
    },
    {
      key: 'referral_count',
      title: 'Giới thiệu',
      render: (value) => (
        <span className={`${value > 0 ? 'text-amber-400' : 'text-gray-500'}`}>
          {value || 0}
        </span>
      ),
    },
    {
      key: 'created_at',
      title: 'Ngày đăng ký',
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        return (
          <span className="text-gray-400 text-sm">
            {date.toLocaleDateString('vi-VN')}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: '',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          {row.zalo_user_id && (
            <button
              onClick={(e) => handleResendWelcome(row.id, e)}
              disabled={actionLoading === row.id}
              className="p-1 text-gray-400 hover:text-amber-500 transition-colors"
              title="Gửi lại welcome"
            >
              {actionLoading === row.id ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Waitlist</h1>
          <p className="text-gray-400 mt-1">Quản lý danh sách chờ đăng ký</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/waitlist/stats"
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Thống kê
          </Link>
          <button
            onClick={handleProcessNurturing}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Xử lý Nurturing
          </button>
          <button
            onClick={handleTriggerLaunch}
            className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors font-medium"
          >
            Gửi thông báo Launch
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Tổng đăng ký"
          value={stats?.total_entries?.toLocaleString() || '0'}
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          loading={statsLoading}
        />
        <StatsCard
          title="Đã kết nối Zalo"
          value={stats?.zalo_connected?.toLocaleString() || '0'}
          change={stats?.connection_rate ? `${stats.connection_rate}%` : undefined}
          changeType={stats?.connection_rate >= 50 ? 'positive' : 'neutral'}
          icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          loading={statsLoading}
        />
        <StatsCard
          title="Đăng ký hôm nay"
          value={stats?.today_signups?.toLocaleString() || '0'}
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={statsLoading}
        />
        <StatsCard
          title="Đang nurturing"
          value={stats?.nurturing?.toLocaleString() || '0'}
          icon="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          loading={statsLoading}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-800 rounded-xl">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Tìm theo SĐT hoặc tên..."
            value={filter.search}
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filter.status}
          onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
          className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xác minh</option>
          <option value="verified">Đã kết nối</option>
          <option value="nurturing">Đang nurturing</option>
          <option value="completed">Hoàn thành</option>
          <option value="converted">Đã convert</option>
          <option value="unsubscribed">Đã hủy</option>
        </select>

        {/* Zalo Filter */}
        <select
          value={filter.hasZalo}
          onChange={(e) => setFilter((prev) => ({ ...prev, hasZalo: e.target.value }))}
          className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">Tất cả Zalo</option>
          <option value="yes">Đã kết nối Zalo</option>
          <option value="no">Chưa kết nối Zalo</option>
        </select>

        {/* Refresh */}
        <button
          onClick={loadEntries}
          className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={entries}
        loading={loading}
        onRowClick={(row) => router.push(`/waitlist/${row.id}`)}
        pagination={{
          page: pagination.page,
          totalPages: Math.ceil(pagination.total / pagination.limit),
          from: (pagination.page - 1) * pagination.limit + 1,
          to: Math.min(pagination.page * pagination.limit, pagination.total),
          total: pagination.total,
        }}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        emptyMessage="Không có đăng ký nào"
      />
    </div>
  );
}
