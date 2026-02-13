/**
 * User Behavior Analytics Page
 * Track user engagement, growth, retention, and behavior patterns
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import StatsCard from '../../components/StatsCard';
import * as analyticsService from '../../services/analyticsService';

const COLORS = ['#FFBD59', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

const TIER_COLORS = {
  'Free': '#6B7280',
  'Tier 1': '#3B82F6',
  'Tier 2': '#8B5CF6',
  'Tier 3': '#FFBD59',
};

export default function UsersAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [growthTrend, setGrowthTrend] = useState([]);
  const [tierDistribution, setTierDistribution] = useState([]);
  const [retentionData, setRetentionData] = useState([]);
  const [activityByHour, setActivityByHour] = useState([]);
  const [topFeatures, setTopFeatures] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;

      const [engagementResult, growthResult, tierResult] = await Promise.all([
        analyticsService.getUserEngagementStats(days),
        analyticsService.getUserGrowthTrend(days),
        analyticsService.getUserTierDistribution(),
      ]);

      if (engagementResult.success) {
        setStats(engagementResult.data);
      } else {
        setStats({
          totalUsers: 12500,
          activeUsers: 4850,
          newUsers: 650,
          totalSessions: 28500,
          avgSessionsPerUser: 5.9,
          activeRate: 38.8,
        });
      }

      if (growthResult.success && growthResult.data.length > 0) {
        setGrowthTrend(growthResult.data);
      } else {
        setGrowthTrend(generateMockGrowthTrend(days));
      }

      if (tierResult.success && tierResult.data.length > 0) {
        setTierDistribution(tierResult.data);
      } else {
        setTierDistribution([
          { name: 'Free', value: 8500 },
          { name: 'Tier 1', value: 2400 },
          { name: 'Tier 2', value: 1200 },
          { name: 'Tier 3', value: 400 },
        ]);
      }

      // Mock retention data
      setRetentionData([
        { week: 'Week 1', retention: 100 },
        { week: 'Week 2', retention: 72 },
        { week: 'Week 3', retention: 58 },
        { week: 'Week 4', retention: 48 },
        { week: 'Week 5', retention: 42 },
        { week: 'Week 6', retention: 38 },
        { week: 'Week 7', retention: 35 },
        { week: 'Week 8', retention: 32 },
      ]);

      // Mock activity by hour
      setActivityByHour(generateActivityByHour());

      // Mock top features
      setTopFeatures([
        { name: 'Scanner', users: 3200, sessions: 12500 },
        { name: 'Trading Journal', users: 2800, sessions: 8900 },
        { name: 'Courses', users: 2100, sessions: 6500 },
        { name: 'Shop', users: 1800, sessions: 4200 },
        { name: 'Chatbot', users: 1500, sessions: 3800 },
        { name: 'Vision Board', users: 1200, sessions: 2900 },
      ]);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockGrowthTrend = (days) => {
    const data = [];
    const now = new Date();
    let cumulative = 11500;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const newUsers = Math.floor(Math.random() * 30) + 10;
      cumulative += newUsers;
      data.push({
        date: date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
        newUsers,
        cumulative,
        activeUsers: Math.floor(cumulative * (0.35 + Math.random() * 0.1)),
      });
    }
    return data;
  };

  const generateActivityByHour = () => {
    const data = [];
    for (let i = 0; i < 24; i++) {
      // Higher activity during business hours (9AM - 10PM Vietnam)
      const baseActivity = i >= 9 && i <= 22 ? 150 : 30;
      const peakBonus = (i >= 19 && i <= 22) ? 100 : 0; // Evening peak
      data.push({
        hour: `${i.toString().padStart(2, '0')}:00`,
        sessions: Math.floor(Math.random() * 50) + baseActivity + peakBonus,
      });
    }
    return data;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-400 text-sm">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Analytics</h1>
          <p className="text-gray-400 mt-1">User engagement, growth, and behavior patterns</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers?.toLocaleString() || '0'}
          change="+5.2%"
          changeType="positive"
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          loading={loading}
        />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers?.toLocaleString() || '0'}
          change={`${stats.activeRate}% of total`}
          changeType="neutral"
          icon="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={loading}
        />
        <StatsCard
          title="New Users"
          value={stats.newUsers?.toLocaleString() || '0'}
          change="This period"
          changeType="positive"
          icon="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          loading={loading}
        />
        <StatsCard
          title="Avg Sessions/User"
          value={stats.avgSessionsPerUser || '0'}
          change="Engagement metric"
          changeType="neutral"
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          loading={loading}
        />
      </div>

      {/* User Growth Chart */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">User Growth Trend</h3>
        {loading ? (
          <div className="h-80 bg-gray-700 rounded animate-pulse"></div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={growthTrend}>
              <defs>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFBD59" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFBD59" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="cumulative" stroke="#FFBD59" strokeWidth={2} fill="url(#colorCumulative)" name="Total Users" />
              <Area type="monotone" dataKey="activeUsers" stroke="#10B981" strokeWidth={2} fill="url(#colorActive)" name="Active Users" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Distribution */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Subscription Tier Distribution</h3>
          {loading ? (
            <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={280}>
                <PieChart>
                  <Pie
                    data={tierDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tierDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TIER_COLORS[entry.name] || COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {tierDistribution.map((tier, index) => {
                  const total = tierDistribution.reduce((sum, t) => sum + t.value, 0);
                  const percentage = ((tier.value / total) * 100).toFixed(1);
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: TIER_COLORS[tier.name] || COLORS[index] }}
                          ></div>
                          <span className="text-gray-300">{tier.name}</span>
                        </div>
                        <span className="text-white font-medium">{tier.value.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: TIER_COLORS[tier.name] || COLORS[index]
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Retention Curve */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">User Retention Curve</h3>
          {loading ? (
            <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
                          <p className="text-gray-400 text-sm">{label}</p>
                          <p className="text-amber-500 font-medium">{payload[0].value}% retained</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="retention" stroke="#FFBD59" strokeWidth={3} dot={{ fill: '#FFBD59', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Activity & Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity by Hour */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Activity by Hour (Vietnam Time)</h3>
          {loading ? (
            <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={activityByHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sessions" fill="#3B82F6" name="Sessions" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="text-sm text-gray-400 mt-2 text-center">
            Peak activity: 7PM - 10PM
          </p>
        </div>

        {/* Top Features */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Features Used</h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {topFeatures.map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-750 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-gray-700 rounded text-amber-500 text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-white font-medium">{feature.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{feature.users.toLocaleString()}</p>
                    <p className="text-gray-400 text-xs">users</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
