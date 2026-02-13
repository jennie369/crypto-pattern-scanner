/**
 * Partnership Dashboard
 * Overview of CTV/KOL partners, applications, and commissions
 * With real-time updates via Supabase
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import StatsCard from '../../components/StatsCard';
import DataTable from '../../components/DataTable';
import { partnershipService, supabase } from '../../services/supabase';

const statusColors = {
  pending: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  cancelled: 'bg-gray-500',
};

const statusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  cancelled: 'Đã hủy',
};

const tierColors = {
  bronze: 'bg-amber-600',
  silver: 'bg-gray-400',
  gold: 'bg-yellow-500',
  platinum: 'bg-blue-400',
  diamond: 'bg-purple-500',
};

const tierLabels = {
  bronze: '🥉 Bronze',
  silver: '🥈 Silver',
  gold: '🥇 Gold',
  platinum: '💎 Platinum',
  diamond: '👑 Diamond',
};

export default function PartnershipDashboard() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState({
    status: 'pending',
    type: 'all',
  });

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, appsData, partnersData] = await Promise.all([
        partnershipService.getDashboardStats(),
        partnershipService.getApplications({ status: filter.status, type: filter.type, limit: 10 }),
        partnershipService.getPartners({ limit: 10 }),
      ]);

      setStats(statsData);
      setApplications(appsData.applications);
      setPartners(partnersData.partners);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time subscriptions
  useEffect(() => {
    const appsSub = partnershipService.subscribeToApplications((payload) => {
      console.log('[Realtime] Applications change:', payload);
      loadData(); // Refresh data on change
    });

    const partnersSub = partnershipService.subscribeToPartners((payload) => {
      console.log('[Realtime] Partners change:', payload);
      loadData();
    });

    return () => {
      partnershipService.unsubscribe(appsSub);
      partnershipService.unsubscribe(partnersSub);
    };
  }, [loadData]);

  // Handle approve
  const handleApprove = async (appId, e) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc muốn duyệt đơn đăng ký này?')) return;

    setActionLoading(appId);
    try {
      const result = await partnershipService.approveApplication(appId);
      if (result.success) {
        alert(`Đã duyệt! Mã affiliate: ${result.referralCode}`);
        loadData();
      } else {
        alert('Lỗi: ' + result.error);
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle reject
  const handleReject = async (appId, e) => {
    e.stopPropagation();
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;

    setActionLoading(appId);
    try {
      const result = await partnershipService.rejectApplication(appId, reason);
      if (result.success) {
        alert('Đã từ chối đơn đăng ký');
        loadData();
      } else {
        alert('Lỗi: ' + result.error);
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Application columns
  const applicationColumns = [
    {
      key: 'full_name',
      title: 'Họ tên',
      render: (value, row) => (
        <div>
          <div className="font-medium text-white">{value || 'N/A'}</div>
          <div className="text-xs text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'application_type',
      title: 'Loại',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value === 'kol' ? 'bg-purple-500/20 text-purple-400' : 'bg-amber-500/20 text-amber-400'
        }`}>
          {value === 'kol' ? '⭐ KOL' : '🥉 CTV'}
        </span>
      ),
    },
    {
      key: 'total_followers',
      title: 'Followers',
      render: (value, row) => (
        <span className="text-gray-300">
          {row.application_type === 'kol' ? (value?.toLocaleString() || '0') : '—'}
        </span>
      ),
    },
    {
      key: 'source',
      title: 'Nguồn',
      render: (value) => (
        <span className={`text-xs ${value === 'landing_page' ? 'text-blue-400' : 'text-gray-400'}`}>
          {value === 'landing_page' ? '🌐 Landing' : '📱 App'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[value]}/20`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusColors[value]} mr-1.5`}></span>
          {statusLabels[value] || value}
        </span>
      ),
    },
    {
      key: 'created_at',
      title: 'Ngày đăng ký',
      render: (value) => <span className="text-gray-400 text-sm">{formatDate(value)}</span>,
    },
    {
      key: 'actions',
      title: '',
      render: (_, row) => row.status === 'pending' && (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => handleApprove(row.id, e)}
            disabled={actionLoading === row.id}
            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
          >
            {actionLoading === row.id ? '...' : 'Duyệt'}
          </button>
          <button
            onClick={(e) => handleReject(row.id, e)}
            disabled={actionLoading === row.id}
            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
          >
            Từ chối
          </button>
        </div>
      ),
    },
  ];

  // Partner columns
  const partnerColumns = [
    {
      key: 'full_name',
      title: 'Tên',
      render: (value, row) => (
        <div>
          <div className="font-medium text-white">{value || row.email || 'N/A'}</div>
          <div className="text-xs text-amber-500 font-mono">{row.referral_code}</div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Vai trò',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value === 'kol' ? 'bg-purple-500/20 text-purple-400' : 'bg-amber-500/20 text-amber-400'
        }`}>
          {value === 'kol' ? '⭐ KOL' : '🥉 CTV'}
        </span>
      ),
    },
    {
      key: 'ctv_tier',
      title: 'Tier',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${tierColors[value] || tierColors.bronze}/20`}>
          {tierLabels[value] || tierLabels.bronze}
        </span>
      ),
    },
    {
      key: 'total_commission',
      title: 'Hoa hồng',
      render: (value) => (
        <span className="text-green-400 font-medium">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'total_sales',
      title: 'Doanh số',
      render: (value) => (
        <span className="text-gray-300">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'created_at',
      title: 'Ngày tham gia',
      render: (value) => <span className="text-gray-400 text-sm">{formatDate(value)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Partnership</h1>
          <p className="text-gray-400 mt-1">Quản lý CTV & KOL Affiliate</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
          <div className="flex items-center space-x-2 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-green-400">Real-time</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Tổng Partners"
          value={stats?.totalPartners?.toLocaleString() || '0'}
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          loading={statsLoading}
        />
        <StatsCard
          title="Đơn chờ duyệt"
          value={stats?.pendingApplications?.toLocaleString() || '0'}
          change={stats?.pendingCTV ? `CTV: ${stats.pendingCTV}, KOL: ${stats.pendingKOL}` : undefined}
          changeType="neutral"
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          loading={statsLoading}
        />
        <StatsCard
          title="Hoa hồng tháng này"
          value={formatCurrency(stats?.monthlyCommissions)}
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={statsLoading}
        />
        <StatsCard
          title="Đăng ký hôm nay"
          value={stats?.todayApplications?.toLocaleString() || '0'}
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={statsLoading}
        />
      </div>

      {/* Tier Distribution */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Phân bố Tier</h2>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(tierLabels).map(([tier, label]) => (
            <div key={tier} className="text-center">
              <div className={`w-full h-2 rounded-full ${tierColors[tier]}/30 mb-2`}>
                <div
                  className={`h-full rounded-full ${tierColors[tier]}`}
                  style={{
                    width: stats?.totalPartners
                      ? `${((stats.tierDistribution?.[tier] || 0) / stats.totalPartners) * 100}%`
                      : '0%',
                  }}
                />
              </div>
              <div className="text-2xl font-bold text-white">
                {stats?.tierDistribution?.[tier] || 0}
              </div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Applications */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Đơn đăng ký gần đây</h2>
          <div className="flex items-center space-x-3">
            <select
              value={filter.status}
              onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
              className="bg-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
            <select
              value={filter.type}
              onChange={(e) => setFilter((prev) => ({ ...prev, type: e.target.value }))}
              className="bg-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">CTV + KOL</option>
              <option value="ctv">CTV</option>
              <option value="kol">KOL</option>
            </select>
            <Link
              href="/partnership/applications"
              className="text-amber-500 hover:text-amber-400 text-sm"
            >
              Xem tất cả →
            </Link>
          </div>
        </div>
        <DataTable
          columns={applicationColumns}
          data={applications}
          loading={loading}
          emptyMessage="Không có đơn đăng ký nào"
        />
      </div>

      {/* Partners */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Partners</h2>
          <Link
            href="/partnership/partners"
            className="text-amber-500 hover:text-amber-400 text-sm"
          >
            Xem tất cả →
          </Link>
        </div>
        <DataTable
          columns={partnerColumns}
          data={partners}
          loading={loading}
          emptyMessage="Chưa có partner nào"
        />
      </div>
    </div>
  );
}
