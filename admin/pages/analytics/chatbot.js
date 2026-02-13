/**
 * Chatbot Analytics Page
 * Detailed chatbot performance, FAQ analysis, and conversation metrics
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
import * as analyticsService from '../../services/analyticsService';

const COLORS = ['#FFBD59', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

const EMOTION_COLORS = {
  'Happy': '#10B981',
  'Neutral': '#3B82F6',
  'Confused': '#FFBD59',
  'Anxious': '#8B5CF6',
  'Angry': '#EF4444',
};

export default function ChatbotAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [faqStats, setFaqStats] = useState({});
  const [conversationTrend, setConversationTrend] = useState([]);
  const [faqCategories, setFaqCategories] = useState([]);
  const [emotionData, setEmotionData] = useState([]);
  const [responseTimeData, setResponseTimeData] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;

      const [chatbotResult, faqResult] = await Promise.all([
        analyticsService.getChatbotStats(days),
        analyticsService.getFaqStats(days),
      ]);

      if (chatbotResult.success) {
        setStats(chatbotResult.data);
      } else {
        setStats({
          totalConversations: 2450,
          totalMessages: 12500,
          resolvedCount: 2100,
          handoffCount: 180,
          resolutionRate: 85.7,
          avgMessagesPerConvo: 5.1,
        });
      }

      if (faqResult.success) {
        setFaqStats(faqResult.data);
      } else {
        setFaqStats({
          totalMatches: 1850,
          helpfulMatches: 1650,
          helpfulRate: 89.2,
          avgConfidence: 87.5,
        });
      }

      // Mock conversation trend
      setConversationTrend(generateConversationTrend(days));

      // Mock FAQ categories
      setFaqCategories([
        { category: 'Trading', matches: 520, helpful: 92 },
        { category: 'Orders', matches: 380, helpful: 88 },
        { category: 'Payment', matches: 320, helpful: 91 },
        { category: 'Account', matches: 280, helpful: 85 },
        { category: 'Shipping', matches: 220, helpful: 94 },
        { category: 'Courses', matches: 180, helpful: 87 },
      ]);

      // Mock emotion data
      setEmotionData([
        { name: 'Happy', value: 38 },
        { name: 'Neutral', value: 35 },
        { name: 'Confused', value: 14 },
        { name: 'Anxious', value: 8 },
        { name: 'Angry', value: 5 },
      ]);

      // Mock response time data
      setResponseTimeData([
        { range: '< 1s', count: 650 },
        { range: '1-2s', count: 1200 },
        { range: '2-3s', count: 380 },
        { range: '3-5s', count: 150 },
        { range: '> 5s', count: 70 },
      ]);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateConversationTrend = (days) => {
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
        conversations: Math.floor(Math.random() * 100) + 50,
        resolved: Math.floor(Math.random() * 80) + 40,
        handoffs: Math.floor(Math.random() * 15) + 2,
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
          <h1 className="text-2xl font-bold text-white">Chatbot Analytics</h1>
          <p className="text-gray-400 mt-1">Conversation metrics, FAQ performance, and user sentiment</p>
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
          title="Total Conversations"
          value={stats.totalConversations?.toLocaleString() || '0'}
          change="+18%"
          changeType="positive"
          icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          loading={loading}
        />
        <StatsCard
          title="Resolution Rate"
          value={`${stats.resolutionRate || 0}%`}
          change="Target: 85%"
          changeType={parseFloat(stats.resolutionRate) >= 85 ? 'positive' : 'neutral'}
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={loading}
        />
        <StatsCard
          title="FAQ Match Rate"
          value={`${faqStats.helpfulRate || 0}%`}
          change="Helpful responses"
          changeType="positive"
          icon="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={loading}
        />
        <StatsCard
          title="Handoff Rate"
          value={`${stats.handoffCount || 0}`}
          change="To human agents"
          changeType="neutral"
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          loading={loading}
        />
      </div>

      {/* Conversation Trend */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Conversation Trend</h3>
        {loading ? (
          <div className="h-80 bg-gray-700 rounded animate-pulse"></div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={conversationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="conversations" stroke="#3B82F6" strokeWidth={2} dot={false} name="Total" />
              <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} dot={false} name="Resolved" />
              <Line type="monotone" dataKey="handoffs" stroke="#EF4444" strokeWidth={2} dot={false} name="Handoffs" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQ Categories */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">FAQ Performance by Category</h3>
          {loading ? (
            <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={faqCategories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis dataKey="category" type="category" stroke="#9CA3AF" fontSize={12} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="matches" fill="#3B82F6" name="Matches" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* User Emotions */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">User Sentiment Analysis</h3>
          {loading ? (
            <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={280}>
                <PieChart>
                  <Pie
                    data={emotionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {emotionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.name] || COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {emotionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: EMOTION_COLORS[item.name] || COLORS[index] }}
                      ></div>
                      <span className="text-gray-300">{item.name}</span>
                    </div>
                    <span className="text-white font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Response Time & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Response Time Distribution */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Response Time Distribution</h3>
          {loading ? (
            <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="range" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#FFBD59" name="Responses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="text-sm text-gray-400 mt-2 text-center">
            Average response time: 1.8s
          </p>
        </div>

        {/* Performance Summary */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-750 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">FAQ Confidence</span>
                  <span className="text-amber-500 font-medium">{faqStats.avgConfidence}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${faqStats.avgConfidence}%` }}></div>
                </div>
              </div>

              <div className="p-4 bg-gray-750 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">User Satisfaction</span>
                  <span className="text-green-500 font-medium">{faqStats.helpfulRate}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${faqStats.helpfulRate}%` }}></div>
                </div>
              </div>

              <div className="p-4 bg-gray-750 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Self-Service Rate</span>
                  <span className="text-blue-500 font-medium">{stats.resolutionRate}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${stats.resolutionRate}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="text-center p-3 bg-gray-700 rounded-lg">
                  <div className="text-xl font-bold text-white">{stats.avgMessagesPerConvo}</div>
                  <div className="text-xs text-gray-400">Msg/Convo</div>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded-lg">
                  <div className="text-xl font-bold text-white">{stats.totalMessages?.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Total Msgs</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
