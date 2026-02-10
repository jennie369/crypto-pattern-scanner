/**
 * Withdrawals Management Page
 * Manage partner withdrawal requests
 */

import React, { useState, useEffect, useCallback } from 'react';
import StatsCard from '../../components/StatsCard';
import DataTable from '../../components/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import StatusBadge from '../../components/common/StatusBadge';
import * as withdrawalService from '../../services/withdrawalService';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400' },
  approved: { label: 'Approved', color: 'bg-blue-500/20 text-blue-400' },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-400' },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400' },
};

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'all' });
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  // Modals
  const [actionModal, setActionModal] = useState({ open: false, withdrawal: null, action: '' });
  const [actionInput, setActionInput] = useState('');

  const loadWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const result = await withdrawalService.getWithdrawals({
        status: filter.status,
        search,
        page: pagination.page,
        limit: 50,
      });

      if (result.success) {
        setWithdrawals(result.data);
        setPagination(prev => ({
          ...prev,
          total: result.total,
          totalPages: result.totalPages,
        }));
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, search, pagination.page]);

  const loadStats = useCallback(async () => {
    const result = await withdrawalService.getWithdrawalStats();
    if (result.success) {
      setStats(result.data);
    }
  }, []);

  useEffect(() => {
    loadWithdrawals();
  }, [loadWithdrawals]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleAction = async () => {
    if (!actionModal.withdrawal) return;

    setLoading(true);
    try {
      let result;

      switch (actionModal.action) {
        case 'approve':
          result = await withdrawalService.approveWithdrawal(actionModal.withdrawal.id, actionInput);
          break;
        case 'complete':
          result = await withdrawalService.completeWithdrawal(actionModal.withdrawal.id, actionInput);
          break;
        case 'reject':
          result = await withdrawalService.rejectWithdrawal(actionModal.withdrawal.id, actionInput);
          break;
      }

      if (result?.success) {
        setActionModal({ open: false, withdrawal: null, action: '' });
        setActionInput('');
        loadWithdrawals();
        loadStats();
      } else {
        alert(result?.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error:', error);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString('vi-VN') + ' VND';
  };

  const columns = [
    {
      key: 'partner',
      title: 'Partner',
      render: (value) => (
        <div>
          <div className="font-medium text-white">{value?.full_name || 'Unknown'}</div>
          <div className="text-sm text-gray-400">{value?.email}</div>
          {value?.referral_code && (
            <code className="text-xs text-amber-500">{value.referral_code}</code>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      render: (value) => (
        <span className="text-lg font-semibold text-white">{formatAmount(value)}</span>
      ),
    },
    {
      key: 'bank_info',
      title: 'Bank',
      render: (_, row) => (
        <div className="text-sm">
          <div className="text-white">{row.bank_name || '-'}</div>
          <div className="text-gray-400">{row.account_number}</div>
          <div className="text-gray-500 text-xs">{row.account_holder}</div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => {
        const config = STATUS_CONFIG[value] || STATUS_CONFIG.pending;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'created_at',
      title: 'Requested',
      sortable: true,
      render: (value) => <span className="text-gray-400 text-sm">{formatDate(value)}</span>,
    },
    {
      key: 'actions',
      title: '',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          {row.status === 'pending' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActionModal({ open: true, withdrawal: row, action: 'approve' });
                }}
                className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                title="Approve"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActionModal({ open: true, withdrawal: row, action: 'reject' });
                }}
                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                title="Reject"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </>
          )}
          {row.status === 'approved' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActionModal({ open: true, withdrawal: row, action: 'complete' });
              }}
              className="p-1 text-green-400 hover:text-green-300 transition-colors"
              title="Mark as Paid"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // View details
            }}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="View Details"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
        <h1 className="text-2xl font-bold text-white">Withdrawals</h1>
        <p className="text-gray-400 mt-1">Manage partner withdrawal requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Requests"
          value={stats?.pendingCount || 0}
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={!stats}
        />
        <StatsCard
          title="Pending Amount"
          value={formatAmount(stats?.pendingAmount)}
          changeType="neutral"
          icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          loading={!stats}
        />
        <StatsCard
          title="Paid This Month"
          value={stats?.completedThisMonth || 0}
          changeType="positive"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={!stats}
        />
        <StatsCard
          title="Total Paid (All Time)"
          value={formatAmount(stats?.totalCompleted)}
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={!stats}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-800 rounded-xl">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search partner..."
              className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <select
          value={filter.status}
          onChange={(e) => {
            setFilter(prev => ({ ...prev, status: e.target.value }));
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>

        <button
          onClick={loadWithdrawals}
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
        data={withdrawals}
        loading={loading}
        emptyMessage="No withdrawal requests found"
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          from: (pagination.page - 1) * 50 + 1,
          to: Math.min(pagination.page * 50, pagination.total),
        }}
        onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
      />

      {/* Action Modal */}
      {actionModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                {actionModal.action === 'approve' && 'Approve Withdrawal'}
                {actionModal.action === 'complete' && 'Mark as Paid'}
                {actionModal.action === 'reject' && 'Reject Withdrawal'}
              </h2>
              <p className="text-gray-400 mt-1">
                {actionModal.withdrawal?.partner?.full_name} - {formatAmount(actionModal.withdrawal?.amount)}
              </p>
            </div>
            <div className="p-6 space-y-4">
              {actionModal.action === 'approve' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
                  <textarea
                    value={actionInput}
                    onChange={(e) => setActionInput(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    placeholder="Add notes..."
                  />
                </div>
              )}
              {actionModal.action === 'complete' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Transaction Reference</label>
                  <input
                    type="text"
                    value={actionInput}
                    onChange={(e) => setActionInput(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Bank transaction ID..."
                  />
                </div>
              )}
              {actionModal.action === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rejection Reason *</label>
                  <textarea
                    value={actionInput}
                    onChange={(e) => setActionInput(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    placeholder="Explain why this withdrawal is being rejected..."
                    required
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t border-gray-700">
              <button
                onClick={() => {
                  setActionModal({ open: false, withdrawal: null, action: '' });
                  setActionInput('');
                }}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={loading || (actionModal.action === 'reject' && !actionInput)}
                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  actionModal.action === 'reject'
                    ? 'bg-red-500 text-white hover:bg-red-400'
                    : 'bg-amber-500 text-gray-900 hover:bg-amber-400'
                }`}
              >
                {actionModal.action === 'approve' && 'Approve'}
                {actionModal.action === 'complete' && 'Mark as Paid'}
                {actionModal.action === 'reject' && 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
