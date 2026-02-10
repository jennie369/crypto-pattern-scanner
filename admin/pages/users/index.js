/**
 * Users Management Page
 * View and manage all app users
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import StatsCard from '../../components/StatsCard';
import DataTable from '../../components/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import StatusBadge from '../../components/common/StatusBadge';
import * as userService from '../../services/userService';

const TIERS = [
  { value: 'all', label: 'All Tiers' },
  { value: 'free', label: 'Free' },
  { value: 'tier_1', label: 'Tier 1' },
  { value: 'tier_2', label: 'Tier 2' },
  { value: 'tier_3', label: 'Tier 3' },
];

const TIER_COLORS = {
  free: 'bg-gray-500/20 text-gray-400',
  tier_1: 'bg-blue-500/20 text-blue-400',
  tier_2: 'bg-purple-500/20 text-purple-400',
  tier_3: 'bg-amber-500/20 text-amber-500',
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ tier: 'all', status: 'all' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [banModal, setBanModal] = useState({ open: false, user: null, isBanning: true });
  const [banReason, setBanReason] = useState('');
  const [tierModal, setTierModal] = useState({ open: false, user: null });
  const [selectedTier, setSelectedTier] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await userService.getUsers({
        search,
        tier: filters.tier,
        status: filters.status,
        page: pagination.page,
        limit: 50,
      });

      if (result.success) {
        setUsers(result.data);
        setPagination(prev => ({
          ...prev,
          total: result.total,
          totalPages: result.totalPages,
        }));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, [search, filters, pagination.page]);

  const loadStats = useCallback(async () => {
    const result = await userService.getUserStats();
    if (result.success) {
      setStats(result.data);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadUsers();
  };

  const handleBanUser = async () => {
    if (!banModal.user) return;

    setLoading(true);
    try {
      const result = await userService.toggleUserBan(
        banModal.user.id,
        banModal.isBanning,
        banReason
      );

      if (result.success) {
        setBanModal({ open: false, user: null, isBanning: true });
        setBanReason('');
        loadUsers();
        loadStats();
      } else {
        alert(result.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error banning user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTier = async () => {
    if (!tierModal.user || !selectedTier) return;

    setLoading(true);
    try {
      const result = await userService.updateUserTier(tierModal.user.id, selectedTier);

      if (result.success) {
        setTierModal({ open: false, user: null });
        setSelectedTier('');
        loadUsers();
        loadStats();
      } else {
        alert(result.error || 'Failed to update tier');
      }
    } catch (error) {
      console.error('Error changing tier:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const columns = [
    {
      key: 'avatar_url',
      title: '',
      render: (value, row) => (
        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 font-medium">
              {(row.display_name || row.email || '?')[0].toUpperCase()}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'display_name',
      title: 'User',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-white">{value || 'No name'}</div>
          <div className="text-sm text-gray-400">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'subscription_tier',
      title: 'Tier',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${TIER_COLORS[value] || TIER_COLORS.free}`}>
          {value === 'free' ? 'Free' : value?.replace('tier_', 'Tier ')}
        </span>
      ),
    },
    {
      key: 'is_banned',
      title: 'Status',
      render: (value) => (
        <StatusBadge status={value ? 'banned' : 'active'} customLabel={value ? 'Banned' : 'Active'} />
      ),
    },
    {
      key: 'created_at',
      title: 'Joined',
      sortable: true,
      render: (value) => <span className="text-gray-400">{formatDate(value)}</span>,
    },
    {
      key: 'subscription_expires_at',
      title: 'Expires',
      render: (value, row) => (
        row.subscription_tier === 'free' ? (
          <span className="text-gray-500">-</span>
        ) : (
          <span className="text-gray-400">{formatDate(value)}</span>
        )
      ),
    },
    {
      key: 'actions',
      title: '',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/users/${row.id}`);
            }}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="View Details"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTierModal({ open: true, user: row });
              setSelectedTier(row.subscription_tier || 'free');
            }}
            className="p-1 text-gray-400 hover:text-amber-500 transition-colors"
            title="Change Tier"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setBanModal({ open: true, user: row, isBanning: !row.is_banned });
            }}
            className={`p-1 transition-colors ${row.is_banned ? 'text-green-500 hover:text-green-400' : 'text-gray-400 hover:text-red-500'}`}
            title={row.is_banned ? 'Unban User' : 'Ban User'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={row.is_banned ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'} />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 mt-1">View and manage all app users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || 0}
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          loading={!stats}
        />
        <StatsCard
          title="Active"
          value={stats?.activeUsers?.toLocaleString() || 0}
          changeType="positive"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={!stats}
        />
        <StatsCard
          title="Paid Users"
          value={((stats?.tierDistribution?.tier_1 || 0) + (stats?.tierDistribution?.tier_2 || 0) + (stats?.tierDistribution?.tier_3 || 0)).toLocaleString()}
          icon="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
          loading={!stats}
        />
        <StatsCard
          title="New Today"
          value={stats?.newToday || 0}
          changeType="positive"
          icon="M12 6v6m0 0v6m0-6h6m-6 0H6"
          loading={!stats}
        />
        <StatsCard
          title="New This Month"
          value={stats?.newThisMonth || 0}
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          loading={!stats}
        />
      </div>

      {/* Tier Distribution */}
      {stats?.tierDistribution && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Tier Distribution</h3>
          <div className="flex items-center space-x-4">
            {Object.entries(stats.tierDistribution).map(([tier, count]) => (
              <div key={tier} className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${TIER_COLORS[tier]}`}>
                  {tier === 'free' ? 'Free' : tier.replace('tier_', 'T')}
                </span>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-800 rounded-xl">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        <select
          value={filters.tier}
          onChange={(e) => {
            setFilters(prev => ({ ...prev, tier: e.target.value }));
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {TIERS.map(tier => (
            <option key={tier.value} value={tier.value}>{tier.label}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => {
            setFilters(prev => ({ ...prev, status: e.target.value }));
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>

        <button
          onClick={loadUsers}
          className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        onRowClick={(row) => router.push(`/users/${row.id}`)}
        emptyMessage="No users found"
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          from: (pagination.page - 1) * 50 + 1,
          to: Math.min(pagination.page * 50, pagination.total),
        }}
        onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
      />

      {/* Ban Modal */}
      <ConfirmModal
        isOpen={banModal.open}
        onClose={() => {
          setBanModal({ open: false, user: null, isBanning: true });
          setBanReason('');
        }}
        onConfirm={handleBanUser}
        title={banModal.isBanning ? 'Ban User' : 'Unban User'}
        message={
          banModal.isBanning ? (
            <div className="space-y-4">
              <p>Are you sure you want to ban {banModal.user?.display_name || banModal.user?.email}?</p>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reason (optional)</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Enter reason for ban..."
                />
              </div>
            </div>
          ) : (
            `Are you sure you want to unban ${banModal.user?.display_name || banModal.user?.email}?`
          )
        }
        confirmText={banModal.isBanning ? 'Ban User' : 'Unban User'}
        variant={banModal.isBanning ? 'danger' : 'info'}
        loading={loading}
      />

      {/* Change Tier Modal */}
      {tierModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Change User Tier</h2>
              <p className="text-gray-400 mt-1">{tierModal.user?.display_name || tierModal.user?.email}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Tier</label>
                <div className="space-y-2">
                  {TIERS.filter(t => t.value !== 'all').map(tier => (
                    <label
                      key={tier.value}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedTier === tier.value ? 'bg-amber-500/20 border border-amber-500' : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tier"
                        value={tier.value}
                        checked={selectedTier === tier.value}
                        onChange={(e) => setSelectedTier(e.target.value)}
                        className="hidden"
                      />
                      <span className={`px-2 py-1 rounded text-xs font-medium mr-3 ${TIER_COLORS[tier.value]}`}>
                        {tier.label}
                      </span>
                      <span className="text-white">{tier.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t border-gray-700">
              <button
                onClick={() => {
                  setTierModal({ open: false, user: null });
                  setSelectedTier('');
                }}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeTier}
                disabled={loading || selectedTier === tierModal.user?.subscription_tier}
                className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
