/**
 * Analytics Dashboard Page
 * Comprehensive chatbot performance analytics
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import StatsCard from '../../components/StatsCard';
import api from '../../services/api';

const COLORS = ['#FFBD59', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [conversationData, setConversationData] = useState([]);
  const [platformData, setPlatformData] = useState([]);
  const [faqData, setFaqData] = useState([]);
  const [emotionData, setEmotionData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;

      const [convStats, cartStats, gamStats] = await Promise.all([
        api.getConversationStats(days).catch(() => ({})),
        api.getCartRecoveryStats(days).catch(() => ({})),
        api.getGamificationStats(days).catch(() => ({})),
      ]);

      setStats({
        totalConversations: convStats.total_conversations || 0,
        activeUsers: convStats.active_users || 0,
        faqAutomation: convStats.faq_automation_rate || 0,
        avgResponseTime: convStats.avg_response_time || 0,
        handoffRate: convStats.handoff_rate || 0,
        resolutionRate: convStats.resolution_rate || 0,
        avgCSAT: convStats.avg_csat || 0,
        cartRecoveryRate: cartStats.recovery_rate || 0,
        totalRecovered: cartStats.total_recovered || 0,
        gamificationEngagement: gamStats.engagement_rate || 0,
      });

      // Mock chart data
      setConversationData(generateConversationData(days));
      setPlatformData([
        { name: 'Zalo', value: 45, color: '#3B82F6' },
        { name: 'Messenger', value: 35, color: '#8B5CF6' },
        { name: 'Web', value: 20, color: '#FFBD59' },
      ]);
      setFaqData([
        { category: 'Order', matches: 320, helpful: 92 },
        { category: 'Payment', matches: 280, helpful: 88 },
        { category: 'Shipping', matches: 250, helpful: 95 },
        { category: 'Trading', matches: 420, helpful: 90 },
        { category: 'Courses', matches: 180, helpful: 85 },
        { category: 'Account', matches: 150, helpful: 91 },
      ]);
      setEmotionData([
        { name: 'Happy', value: 40 },
        { name: 'Neutral', value: 35 },
        { name: 'Confused', value: 12 },
        { name: 'Anxious', value: 8 },
        { name: 'Angry', value: 5 },
      ]);
      setHourlyData(generateHourlyData());
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateConversationData = (days) => {
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
        conversations: Math.floor(Math.random() * 100) + 50,
        faqResolved: Math.floor(Math.random() * 60) + 30,
        handoffs: Math.floor(Math.random() * 10) + 2,
      });
    }
    return data;
  };

  const generateHourlyData = () => {
    const data = [];
    for (let i = 0; i < 24; i++) {
      data.push({
        hour: `${i.toString().padStart(2, '0')}:00`,
        volume: Math.floor(Math.random() * 50) + (i >= 9 && i <= 21 ? 30 : 5),
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
              {entry.name}: {entry.value}
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
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">Detailed performance insights</p>
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Conversations"
          value={stats.totalConversations?.toLocaleString() || '0'}
          change="+12% from last period"
          changeType="positive"
          icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          loading={loading}
        />
        <StatsCard
          title="FAQ Automation"
          value={`${stats.faqAutomation || 0}%`}
          change={`Target: 70% ${stats.faqAutomation >= 70 ? '(Achieved)' : ''}`}
          changeType={stats.faqAutomation >= 70 ? 'positive' : 'neutral'}
          icon="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={loading}
        />
        <StatsCard
          title="Avg Response Time"
          value={`${stats.avgResponseTime || 0}s`}
          change="< 5s is optimal"
          changeType={stats.avgResponseTime <= 5 ? 'positive' : 'neutral'}
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={loading}
        />
        <StatsCard
          title="CSAT Score"
          value={stats.avgCSAT?.toFixed(1) || '0.0'}
          change="Out of 5.0"
          changeType={stats.avgCSAT >= 4.0 ? 'positive' : 'neutral'}
          icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          loading={loading}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation Trends */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Conversation Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conversationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="conversations"
                stroke="#FFBD59"
                strokeWidth={2}
                dot={false}
                name="Total"
              />
              <Line
                type="monotone"
                dataKey="faqResolved"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                name="FAQ Resolved"
              />
              <Line
                type="monotone"
                dataKey="handoffs"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
                name="Handoffs"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Distribution */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Platform Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQ Performance */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">FAQ Performance by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={faqData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
              <YAxis dataKey="category" type="category" stroke="#9CA3AF" fontSize={12} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="matches" fill="#FFBD59" name="Matches" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Emotion Distribution */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">User Emotions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={emotionData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {emotionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Volume */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Hourly Conversation Volume</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={10} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="volume" fill="#3B82F6" name="Volume" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-400 mt-2 text-center">
          Peak hours: 9:00 - 21:00 (Vietnam Time)
        </p>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Resolution Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Resolution Rate</span>
              <span className="text-green-500 font-medium">{stats.resolutionRate || 85}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${stats.resolutionRate || 85}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Handoff Rate</span>
              <span className="text-yellow-500 font-medium">{stats.handoffRate || 8}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500"
                style={{ width: `${stats.handoffRate || 8}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cart Recovery</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-500 mb-2">
              {stats.cartRecoveryRate || 15}%
            </div>
            <div className="text-gray-400 mb-4">Recovery Rate</div>
            <div className="text-2xl font-semibold text-green-500">
              {(stats.totalRecovered || 45000000).toLocaleString()} VND
            </div>
            <div className="text-gray-400">Total Recovered</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Gamification</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Engagement Rate</span>
              <span className="text-purple-500 font-medium">{stats.gamificationEngagement || 42}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500"
                style={{ width: `${stats.gamificationEngagement || 42}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-gray-750 rounded-lg">
                <div className="text-xl font-bold text-amber-500">1,250</div>
                <div className="text-xs text-gray-400">Games Played</div>
              </div>
              <div className="text-center p-3 bg-gray-750 rounded-lg">
                <div className="text-xl font-bold text-green-500">85,000</div>
                <div className="text-xs text-gray-400">Gems Earned</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
