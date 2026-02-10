/**
 * Content Hub Dashboard
 * Overview of push notifications, templates, and content calendar
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StatsCard from '../../components/StatsCard';
import * as contentService from '../../services/contentService';

const QUICK_ACTIONS = [
  {
    title: 'Create Push',
    description: 'Send a new push notification',
    href: '/content/push',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    color: 'amber',
  },
  {
    title: 'Browse Templates',
    description: 'View and manage templates',
    href: '/content/templates',
    icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
    color: 'blue',
  },
  {
    title: 'Content Calendar',
    description: 'Plan your content schedule',
    href: '/content/calendar',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    color: 'purple',
  },
];

export default function ContentHubPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsResult, notificationsResult, eventsResult] = await Promise.all([
        contentService.getContentStats(),
        contentService.getPushNotifications({ limit: 5 }),
        contentService.getCalendarEvents({
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }),
      ]);

      if (statsResult.success) {
        setStats(statsResult.data);
      } else {
        // Mock stats
        setStats({
          push: {
            total: 145,
            sent: 120,
            scheduled: 15,
            draft: 10,
            totalOpens: 45000,
            totalClicks: 12500,
            avgOpenRate: 37.5,
            avgClickRate: 27.8,
          },
          templates: 24,
          upcomingEvents: 8,
        });
      }

      if (notificationsResult.success) {
        setRecentNotifications(notificationsResult.data);
      } else {
        // Mock recent notifications
        setRecentNotifications([
          { id: 1, title: 'New Pattern Alert: BTC Double Bottom', status: 'sent', sent_at: new Date(Date.now() - 3600000).toISOString(), opens: 2450 },
          { id: 2, title: 'Flash Sale: 30% Off Tier 3', status: 'sent', sent_at: new Date(Date.now() - 86400000).toISOString(), opens: 3200 },
          { id: 3, title: 'Weekly Market Update', status: 'scheduled', scheduled_at: new Date(Date.now() + 86400000).toISOString() },
          { id: 4, title: 'Course Launch Announcement', status: 'draft', created_at: new Date().toISOString() },
        ]);
      }

      if (eventsResult.success) {
        setUpcomingEvents(eventsResult.data);
      } else {
        // Mock upcoming events
        setUpcomingEvents([
          { id: 1, title: 'Weekly Newsletter', type: 'email', scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], scheduled_time: '09:00' },
          { id: 2, title: 'Market Analysis Push', type: 'push', scheduled_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], scheduled_time: '08:00' },
          { id: 3, title: 'Feature Spotlight', type: 'push', scheduled_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], scheduled_time: '10:00' },
        ]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('vi-VN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    const styles = {
      sent: 'bg-green-500/20 text-green-400',
      scheduled: 'bg-blue-500/20 text-blue-400',
      draft: 'bg-gray-500/20 text-gray-400',
      planned: 'bg-purple-500/20 text-purple-400',
    };
    return styles[status] || styles.draft;
  };

  const getTypeIcon = (type) => {
    const icons = {
      push: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      email: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      banner: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    };
    return icons[type] || icons.push;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Hub</h1>
          <p className="text-gray-400 mt-1">Manage push notifications, templates, and content schedule</p>
        </div>
        <Link
          href="/content/push"
          className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Push</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Notifications"
          value={stats.push?.total?.toLocaleString() || '0'}
          change={`${stats.push?.sent || 0} sent`}
          changeType="neutral"
          icon="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          loading={loading}
        />
        <StatsCard
          title="Avg Open Rate"
          value={`${stats.push?.avgOpenRate || 0}%`}
          change="Industry avg: 25%"
          changeType={parseFloat(stats.push?.avgOpenRate) > 25 ? 'positive' : 'neutral'}
          icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          loading={loading}
        />
        <StatsCard
          title="Templates"
          value={stats.templates?.toLocaleString() || '0'}
          change="Ready to use"
          changeType="neutral"
          icon="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z"
          loading={loading}
        />
        <StatsCard
          title="Upcoming"
          value={stats.upcomingEvents?.toLocaleString() || '0'}
          change="This week"
          changeType="neutral"
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="p-6 bg-gray-800 rounded-xl hover:bg-gray-750 transition-colors group"
          >
            <div className={`w-12 h-12 rounded-xl bg-${action.color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <svg className={`w-6 h-6 text-${action.color}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{action.title}</h3>
            <p className="text-gray-400 text-sm">{action.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Notifications</h3>
            <Link href="/content/push" className="text-amber-500 hover:text-amber-400 text-sm">
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((notification) => (
                <div key={notification.id} className="p-4 bg-gray-750 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium truncate max-w-[200px]">{notification.title}</p>
                      <p className="text-gray-400 text-sm">
                        {notification.status === 'sent' && `Sent ${formatDate(notification.sent_at)}`}
                        {notification.status === 'scheduled' && `Scheduled ${formatDate(notification.scheduled_at)}`}
                        {notification.status === 'draft' && 'Draft'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(notification.status)}`}>
                      {notification.status}
                    </span>
                    {notification.opens && (
                      <p className="text-gray-400 text-xs mt-1">{notification.opens.toLocaleString()} opens</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Calendar */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Upcoming Schedule</h3>
            <Link href="/content/calendar" className="text-amber-500 hover:text-amber-400 text-sm">
              View Calendar →
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No upcoming events</p>
              <Link href="/content/calendar" className="text-amber-500 hover:text-amber-400 text-sm mt-2 inline-block">
                Schedule Content →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 bg-gray-750 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getTypeIcon(event.type)} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">{event.title}</p>
                      <p className="text-gray-400 text-sm">{event.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{new Date(event.scheduled_date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}</p>
                    <p className="text-gray-400 text-sm">{event.scheduled_time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-500">{stats.push?.totalOpens?.toLocaleString() || 0}</p>
            <p className="text-gray-400 text-sm">Total Opens</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-500">{stats.push?.totalClicks?.toLocaleString() || 0}</p>
            <p className="text-gray-400 text-sm">Total Clicks</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-500">{stats.push?.avgClickRate || 0}%</p>
            <p className="text-gray-400 text-sm">Click-through Rate</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-500">{stats.push?.scheduled || 0}</p>
            <p className="text-gray-400 text-sm">Scheduled</p>
          </div>
        </div>
      </div>
    </div>
  );
}
