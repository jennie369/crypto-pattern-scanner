/**
 * User Detail Page
 * View detailed user information and activity
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import StatusBadge from '../../components/common/StatusBadge';
import * as userService from '../../services/userService';

const TIER_COLORS = {
  free: 'bg-gray-500/20 text-gray-400 border-gray-500',
  tier_1: 'bg-blue-500/20 text-blue-400 border-blue-500',
  tier_2: 'bg-purple-500/20 text-purple-400 border-purple-500',
  tier_3: 'bg-amber-500/20 text-amber-500 border-amber-500',
};

export default function UserDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [activity, setActivity] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const [userResult, activityResult, logsResult] = await Promise.all([
        userService.getUserById(id),
        userService.getUserActivity(id),
        userService.getUserLogs(id),
      ]);

      if (userResult.success) {
        setUser(userResult.data);
      }
      if (activityResult.success) {
        setActivity(activityResult.data);
      }
      if (logsResult.success) {
        setLogs(logsResult.data);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-700 rounded w-1/4"></div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gray-700"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-700 rounded w-48"></div>
              <div className="h-4 bg-gray-700 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">User not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">User Details</h1>
          <p className="text-gray-400">ID: {user.id}</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-gray-400 font-medium">
                  {(user.display_name || user.email || '?')[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{user.display_name || 'No name'}</h2>
              <p className="text-gray-400">{user.email}</p>
              {user.phone && <p className="text-gray-500 text-sm">{user.phone}</p>}
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${TIER_COLORS[user.subscription_tier] || TIER_COLORS.free}`}>
                  {user.subscription_tier === 'free' ? 'Free' : user.subscription_tier?.replace('tier_', 'Tier ')}
                </span>
                <StatusBadge status={user.is_banned ? 'banned' : 'active'} customLabel={user.is_banned ? 'Banned' : 'Active'} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push(`/users?action=tier&id=${user.id}`)}
              className="px-4 py-2 bg-amber-500/20 text-amber-500 rounded-lg hover:bg-amber-500/30 transition-colors"
            >
              Change Tier
            </button>
            <button
              onClick={() => router.push(`/users?action=ban&id=${user.id}`)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                user.is_banned
                  ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                  : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
              }`}
            >
              {user.is_banned ? 'Unban' : 'Ban'} User
            </button>
          </div>
        </div>

        {user.is_banned && user.ban_reason && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">
              <strong>Ban Reason:</strong> {user.ban_reason}
            </p>
            {user.banned_at && (
              <p className="text-red-400/70 text-xs mt-1">
                Banned on {formatDate(user.banned_at)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-xl">
        {['overview', 'activity', 'admin_logs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab
                ? 'bg-amber-500 text-gray-900'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab === 'overview' ? 'Overview' : tab === 'activity' ? 'Activity' : 'Admin Logs'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-400">Email</dt>
                <dd className="text-white">{user.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Phone</dt>
                <dd className="text-white">{user.phone || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Created</dt>
                <dd className="text-white">{formatDate(user.created_at)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Last Updated</dt>
                <dd className="text-white">{formatDate(user.updated_at)}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Subscription</h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-400">Current Tier</dt>
                <dd className={`px-2 py-1 rounded text-sm ${TIER_COLORS[user.subscription_tier] || TIER_COLORS.free}`}>
                  {user.subscription_tier === 'free' ? 'Free' : user.subscription_tier?.replace('tier_', 'Tier ')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Expires</dt>
                <dd className="text-white">
                  {user.subscription_tier === 'free' ? 'N/A' : formatDate(user.subscription_expires_at)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Auto Renew</dt>
                <dd className="text-white">{user.auto_renew ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          {activity.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No activity recorded</div>
          ) : (
            <div className="divide-y divide-gray-700">
              {activity.map((item, index) => (
                <div key={index} className="p-4 hover:bg-gray-750">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white">{item.action}</p>
                      {item.details && (
                        <p className="text-sm text-gray-400 mt-1">{JSON.stringify(item.details)}</p>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(item.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'admin_logs' && (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No admin actions recorded</div>
          ) : (
            <div className="divide-y divide-gray-700">
              {logs.map((log, index) => (
                <div key={index} className="p-4 hover:bg-gray-750">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.action === 'ban' ? 'bg-red-500/20 text-red-400' :
                        log.action === 'unban' ? 'bg-green-500/20 text-green-400' :
                        log.action === 'tier_change' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {log.action}
                      </span>
                      {log.details && (
                        <p className="text-sm text-gray-400 mt-2">{JSON.stringify(log.details)}</p>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(log.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
