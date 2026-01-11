/**
 * Broadcasts Management Page
 * Create and manage broadcast messages
 */

import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import api from '../../services/api';

const statusColors = {
  draft: 'bg-gray-500',
  scheduled: 'bg-blue-500',
  sending: 'bg-yellow-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

const platformIcons = {
  zalo: 'Z',
  messenger: 'M',
  web: 'W',
  all: 'All',
};

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingBroadcast, setEditingBroadcast] = useState(null);
  const [filter, setFilter] = useState({
    status: 'all',
    platform: 'all',
  });
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    platform: 'all',
    audience: 'all',
    schedule_type: 'now',
    scheduled_at: '',
  });

  useEffect(() => {
    loadBroadcasts();
  }, [filter]);

  const loadBroadcasts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.status !== 'all') params.status = filter.status;
      if (filter.platform !== 'all') params.platform = filter.platform;

      const response = await api.getBroadcasts(params);
      setBroadcasts(response.broadcasts || []);
    } catch (error) {
      console.error('Error loading broadcasts:', error);
      // Mock data
      setBroadcasts([
        {
          id: '1',
          title: 'Flash Sale - 50% Off',
          message: 'Don\'t miss our biggest sale! 50% off all courses today only.',
          platform: 'all',
          audience: 'all',
          status: 'completed',
          total_recipients: 1500,
          delivered_count: 1450,
          opened_count: 890,
          clicked_count: 320,
          created_at: '2024-12-25T10:00:00Z',
          scheduled_at: '2024-12-25T10:00:00Z',
          completed_at: '2024-12-25T10:15:00Z',
        },
        {
          id: '2',
          title: 'New Year Promotion',
          message: 'Happy New Year! Start 2025 with our exclusive trading course.',
          platform: 'zalo',
          audience: 'tier_1',
          status: 'scheduled',
          total_recipients: 850,
          delivered_count: 0,
          opened_count: 0,
          clicked_count: 0,
          created_at: '2024-12-27T08:00:00Z',
          scheduled_at: '2025-01-01T00:00:00Z',
        },
        {
          id: '3',
          title: 'Weekly Newsletter',
          message: 'Check out this week\'s market analysis and trading tips.',
          platform: 'messenger',
          audience: 'all',
          status: 'draft',
          total_recipients: 0,
          delivered_count: 0,
          opened_count: 0,
          clicked_count: 0,
          created_at: '2024-12-27T12:00:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBroadcast = () => {
    setEditingBroadcast(null);
    setFormData({
      title: '',
      message: '',
      platform: 'all',
      audience: 'all',
      schedule_type: 'now',
      scheduled_at: '',
    });
    setShowEditor(true);
  };

  const handleEditBroadcast = (broadcast) => {
    setEditingBroadcast(broadcast);
    setFormData({
      title: broadcast.title,
      message: broadcast.message,
      platform: broadcast.platform,
      audience: broadcast.audience,
      schedule_type: broadcast.scheduled_at ? 'scheduled' : 'now',
      scheduled_at: broadcast.scheduled_at || '',
    });
    setShowEditor(true);
  };

  const handleSaveBroadcast = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        scheduled_at: formData.schedule_type === 'scheduled' ? formData.scheduled_at : null,
        status: formData.schedule_type === 'scheduled' ? 'scheduled' : 'draft',
      };

      if (editingBroadcast) {
        await api.updateBroadcast(editingBroadcast.id, data);
      } else {
        await api.createBroadcast(data);
      }
      setShowEditor(false);
      loadBroadcasts();
    } catch (error) {
      console.error('Error saving broadcast:', error);
      alert('Error saving broadcast');
    }
  };

  const handleSendNow = async (broadcastId) => {
    if (!confirm('Send this broadcast now to all recipients?')) return;

    try {
      await api.sendBroadcast(broadcastId);
      loadBroadcasts();
    } catch (error) {
      console.error('Error sending broadcast:', error);
      alert('Error sending broadcast');
    }
  };

  const handleDeleteBroadcast = async (broadcastId) => {
    if (!confirm('Are you sure you want to delete this broadcast?')) return;

    try {
      await api.deleteBroadcast(broadcastId);
      loadBroadcasts();
    } catch (error) {
      console.error('Error deleting broadcast:', error);
      alert('Error deleting broadcast');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns = [
    {
      key: 'title',
      title: 'Campaign',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-white">{value}</div>
          <div className="text-sm text-gray-400 truncate max-w-xs">{row.message}</div>
        </div>
      ),
    },
    {
      key: 'platform',
      title: 'Platform',
      render: (value) => (
        <div className="flex items-center space-x-2">
          {value === 'all' ? (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-sm rounded">All</span>
          ) : (
            <span
              className={`px-2 py-1 rounded text-sm ${
                value === 'zalo'
                  ? 'bg-blue-500/20 text-blue-400'
                  : value === 'messenger'
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {value?.charAt(0).toUpperCase() + value?.slice(1)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[value]
          }/20 text-white`}
        >
          <span className={`w-2 h-2 rounded-full ${statusColors[value]} mr-1.5`}></span>
          {value?.charAt(0).toUpperCase() + value?.slice(1)}
        </span>
      ),
    },
    {
      key: 'total_recipients',
      title: 'Recipients',
      sortable: true,
      render: (value) => <span className="text-gray-300">{value?.toLocaleString() || 0}</span>,
    },
    {
      key: 'delivery_rate',
      title: 'Delivery',
      render: (_, row) => {
        if (!row.total_recipients || row.status === 'draft') {
          return <span className="text-gray-500">-</span>;
        }
        const rate = ((row.delivered_count / row.total_recipients) * 100).toFixed(1);
        return (
          <div className="flex items-center space-x-2">
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${rate}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-400">{rate}%</span>
          </div>
        );
      },
    },
    {
      key: 'open_rate',
      title: 'Opens',
      render: (_, row) => {
        if (!row.delivered_count || row.status === 'draft') {
          return <span className="text-gray-500">-</span>;
        }
        const rate = ((row.opened_count / row.delivered_count) * 100).toFixed(1);
        return (
          <div className="flex items-center space-x-2">
            <span className="text-gray-300">{row.opened_count?.toLocaleString()}</span>
            <span className="text-sm text-gray-500">({rate}%)</span>
          </div>
        );
      },
    },
    {
      key: 'scheduled_at',
      title: 'Scheduled',
      sortable: true,
      render: (value, row) => (
        <span className="text-gray-400 text-sm">
          {row.status === 'draft' ? 'Not scheduled' : formatDate(value)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          {(row.status === 'draft' || row.status === 'scheduled') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSendNow(row.id);
              }}
              className="p-1 text-green-400 hover:text-green-300 transition-colors"
              title="Send Now"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditBroadcast(row);
            }}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteBroadcast(row.id);
            }}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  // Calculate summary stats
  const totalSent = broadcasts.filter((b) => b.status === 'completed').reduce((sum, b) => sum + (b.delivered_count || 0), 0);
  const totalOpened = broadcasts.filter((b) => b.status === 'completed').reduce((sum, b) => sum + (b.opened_count || 0), 0);
  const avgOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0;
  const scheduledCount = broadcasts.filter((b) => b.status === 'scheduled').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Broadcasts</h1>
          <p className="text-gray-400 mt-1">Send targeted messages to your users</p>
        </div>
        <button
          onClick={handleCreateBroadcast}
          className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Broadcast</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{broadcasts.length}</div>
              <div className="text-sm text-gray-400">Total Campaigns</div>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-500">{totalSent.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Messages Sent</div>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-500">{avgOpenRate}%</div>
              <div className="text-sm text-gray-400">Avg Open Rate</div>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-amber-500">{scheduledCount}</div>
              <div className="text-sm text-gray-400">Scheduled</div>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-800 rounded-xl">
        {/* Status Filter */}
        <select
          value={filter.status}
          onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
          className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="sending">Sending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>

        {/* Platform Filter */}
        <select
          value={filter.platform}
          onChange={(e) => setFilter((prev) => ({ ...prev, platform: e.target.value }))}
          className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Platforms</option>
          <option value="zalo">Zalo</option>
          <option value="messenger">Messenger</option>
          <option value="web">Web</option>
        </select>

        {/* Refresh */}
        <button
          onClick={loadBroadcasts}
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
        data={broadcasts}
        loading={loading}
        onRowClick={(row) => handleEditBroadcast(row)}
        emptyMessage="No broadcasts found"
      />

      {/* Broadcast Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingBroadcast ? 'Edit Broadcast' : 'Create Broadcast'}
              </h2>
              <button
                onClick={() => setShowEditor(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveBroadcast} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Campaign title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Type your message..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData((prev) => ({ ...prev, platform: e.target.value }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">All Platforms</option>
                    <option value="zalo">Zalo Only</option>
                    <option value="messenger">Messenger Only</option>
                    <option value="web">Web Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Audience</label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData((prev) => ({ ...prev, audience: e.target.value }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">All Users</option>
                    <option value="free">Free Tier Only</option>
                    <option value="tier_1">Tier 1+</option>
                    <option value="tier_2">Tier 2+</option>
                    <option value="tier_3">Tier 3 Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Schedule</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="now"
                      checked={formData.schedule_type === 'now'}
                      onChange={(e) => setFormData((prev) => ({ ...prev, schedule_type: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-gray-300">Send immediately</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="scheduled"
                      checked={formData.schedule_type === 'scheduled'}
                      onChange={(e) => setFormData((prev) => ({ ...prev, schedule_type: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-gray-300">Schedule for later</span>
                  </label>
                </div>
              </div>

              {formData.schedule_type === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData((prev) => ({ ...prev, scheduled_at: e.target.value }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors"
                >
                  {editingBroadcast ? 'Save Changes' : 'Create Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
