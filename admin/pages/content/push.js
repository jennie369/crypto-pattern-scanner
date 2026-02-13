/**
 * Push Notification Editor Page
 * Create, manage, and send push notifications
 */

import React, { useState, useEffect, useCallback } from 'react';
import StatsCard from '../../components/StatsCard';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import ImageUploader from '../../components/media/ImageUploader';
import DeepLinkPicker from '../../components/media/DeepLinkPicker';
import * as contentService from '../../services/contentService';

const TARGET_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'tier_1', label: 'Tier 1 Only' },
  { value: 'tier_2', label: 'Tier 2 Only' },
  { value: 'tier_3', label: 'Tier 3 Only' },
  { value: 'paid', label: 'All Paid Users' },
  { value: 'free', label: 'Free Users' },
  { value: 'inactive', label: 'Inactive (30+ days)' },
];

export default function PushEditorPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    image_url: '',
    deep_link: '',
    target_audience: 'all',
    scheduled_at: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsResult, notificationsResult] = await Promise.all([
        contentService.getPushStats(),
        contentService.getPushNotifications({ status: selectedStatus }),
      ]);

      if (statsResult.success) {
        setStats(statsResult.data);
      }

      if (notificationsResult.success) {
        setNotifications(notificationsResult.data);
      } else {
        // Mock data
        setNotifications([
          { id: 1, title: 'New Pattern Alert: BTC Double Bottom', body: 'A bullish pattern has been detected on BTC/USDT 4H chart', status: 'sent', sent_at: new Date(Date.now() - 3600000).toISOString(), opens: 2450, clicks: 680, target_audience: 'all' },
          { id: 2, title: 'Flash Sale: 30% Off Tier 3', body: 'Limited time offer - upgrade now and save!', status: 'sent', sent_at: new Date(Date.now() - 86400000).toISOString(), opens: 3200, clicks: 890, target_audience: 'paid' },
          { id: 3, title: 'Weekly Market Update', body: 'Check out this week\'s top trading opportunities', status: 'scheduled', scheduled_at: new Date(Date.now() + 86400000).toISOString(), target_audience: 'all' },
          { id: 4, title: 'Course Launch Announcement', body: 'New advanced trading course now available', status: 'draft', created_at: new Date().toISOString(), target_audience: 'tier_3' },
        ]);
        setStats({
          total: 145,
          sent: 120,
          scheduled: 15,
          draft: 10,
          avgOpenRate: 37.5,
          avgClickRate: 27.8,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setEditingNotification(null);
    setFormData({
      title: '',
      body: '',
      image_url: '',
      deep_link: '',
      target_audience: 'all',
      scheduled_at: '',
    });
    setShowModal(true);
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title || '',
      body: notification.body || '',
      image_url: notification.image_url || '',
      deep_link: notification.deep_link || '',
      target_audience: notification.target_audience || 'all',
      scheduled_at: notification.scheduled_at ? new Date(notification.scheduled_at).toISOString().slice(0, 16) : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingNotification) {
        await contentService.updatePushNotification(editingNotification.id, formData);
      } else {
        await contentService.createPushNotification(formData);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  };

  const handleSend = async (id) => {
    try {
      await contentService.sendPushNotification(id);
      loadData();
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await contentService.deletePushNotification(deletingId);
      setShowDeleteConfirm(false);
      loadData();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  const columns = [
    {
      key: 'title',
      label: 'Notification',
      render: (row) => (
        <div>
          <p className="text-white font-medium">{row.title}</p>
          <p className="text-gray-400 text-sm truncate max-w-xs">{row.body}</p>
        </div>
      ),
    },
    {
      key: 'target_audience',
      label: 'Target',
      render: (row) => (
        <span className="text-gray-300">
          {TARGET_OPTIONS.find(t => t.value === row.target_audience)?.label || row.target_audience}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'timing',
      label: 'Timing',
      render: (row) => (
        <div className="text-sm">
          {row.status === 'sent' && <span className="text-gray-400">Sent {formatDate(row.sent_at)}</span>}
          {row.status === 'scheduled' && <span className="text-blue-400">Scheduled {formatDate(row.scheduled_at)}</span>}
          {row.status === 'draft' && <span className="text-gray-500">Draft</span>}
        </div>
      ),
    },
    {
      key: 'performance',
      label: 'Performance',
      render: (row) => (
        row.status === 'sent' ? (
          <div className="text-sm">
            <span className="text-green-500">{row.opens?.toLocaleString() || 0} opens</span>
            <span className="text-gray-500 mx-1">·</span>
            <span className="text-amber-500">{row.clicks?.toLocaleString() || 0} clicks</span>
          </div>
        ) : (
          <span className="text-gray-500">-</span>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          {row.status === 'draft' && (
            <button
              onClick={() => handleSend(row.id)}
              className="px-3 py-1 bg-green-500/20 text-green-500 rounded hover:bg-green-500/30 text-sm"
            >
              Send
            </button>
          )}
          <button
            onClick={() => handleEdit(row)}
            className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500/30 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="px-3 py-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Push Notifications</h1>
          <p className="text-gray-400 mt-1">Create and manage push notifications</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Notification</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Sent"
          value={stats.sent?.toLocaleString() || '0'}
          icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          loading={loading}
        />
        <StatsCard
          title="Scheduled"
          value={stats.scheduled?.toLocaleString() || '0'}
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={loading}
        />
        <StatsCard
          title="Avg Open Rate"
          value={`${stats.avgOpenRate || 0}%`}
          change={stats.avgOpenRate > 25 ? 'Above average' : 'Below average'}
          changeType={stats.avgOpenRate > 25 ? 'positive' : 'neutral'}
          icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          loading={loading}
        />
        <StatsCard
          title="Avg Click Rate"
          value={`${stats.avgClickRate || 0}%`}
          icon="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
          loading={loading}
        />
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <span className="text-gray-400">Filter:</span>
        {['all', 'sent', 'scheduled', 'draft'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedStatus === status
                ? 'bg-amber-500 text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={notifications}
        loading={loading}
        emptyMessage="No notifications found"
      />

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingNotification ? 'Edit Notification' : 'Create Notification'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Notification title"
                  maxLength={65}
                />
                <p className="text-gray-500 text-xs mt-1">{formData.title.length}/65 characters</p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Body *</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Notification message"
                  rows={3}
                  maxLength={240}
                />
                <p className="text-gray-500 text-xs mt-1">{formData.body.length}/240 characters</p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Image (Optional)</label>
                <ImageUploader
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  bucket="push-images"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Deep Link (Optional)</label>
                <DeepLinkPicker
                  value={formData.deep_link}
                  onChange={(link) => setFormData({ ...formData, deep_link: link })}
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Target Audience</label>
                <select
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {TARGET_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Schedule (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-gray-500 text-xs mt-1">Leave empty to save as draft</p>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Preview</label>
                <div className="bg-gray-900 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-900 font-bold">G</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{formData.title || 'Notification Title'}</p>
                      <p className="text-gray-400 text-sm">{formData.body || 'Notification body text...'}</p>
                    </div>
                    {formData.image_url && (
                      <img src={formData.image_url} alt="" className="w-16 h-16 rounded object-cover" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.title || !formData.body}
                className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formData.scheduled_at ? 'Schedule' : 'Save Draft'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
