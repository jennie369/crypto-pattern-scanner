/**
 * Scanner Analytics Page
 * Track scanner usage, pattern detection, and user engagement
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

const COLORS = ['#FFBD59', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

const PATTERN_COLORS = {
  'Double Bottom': '#10B981',
  'Double Top': '#EF4444',
  'Head & Shoulders': '#3B82F6',
  'Inv Head & Shoulders': '#8B5CF6',
  'Triangle': '#FFBD59',
  'Wedge': '#F59E0B',
  'Channel': '#EC4899',
  'Flag': '#06B6D4',
};

export default function ScannerAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [trendData, setTrendData] = useState([]);
  const [patternData, setPatternData] = useState([]);
  const [timeframeData, setTimeframeData] = useState([]);
  const [topPatterns, setTopPatterns] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;

      const [statsResult, trendResult, patternResult] = await Promise.all([
        analyticsService.getScannerStats(days),
        analyticsService.getScannerTrend(days),
        analyticsService.getPatternDistribution(days),
      ]);

      if (statsResult.success) {
        setStats(statsResult.data);
      }

      if (trendResult.success && trendResult.data.length > 0) {
        setTrendData(trendResult.data);
      } else {
        // Generate mock data for demo
        setTrendData(generateMockTrendData(days));
      }

      if (patternResult.success && patternResult.data.length > 0) {
        setPatternData(patternResult.data);
      } else {
        // Generate mock pattern data
        setPatternData([
          { name: 'Double Bottom', value: 245 },
          { name: 'Double Top', value: 198 },
          { name: 'Head & Shoulders', value: 156 },
          { name: 'Triangle', value: 289 },
          { name: 'Wedge', value: 134 },
          { name: 'Channel', value: 178 },
          { name: 'Flag', value: 98 },
        ]);
      }

      // Mock timeframe data
      setTimeframeData([
        { name: '1m', scans: 320, patterns: 85 },
        { name: '5m', scans: 580, patterns: 142 },
        { name: '15m', scans: 890, patterns: 234 },
        { name: '1h', scans: 1250, patterns: 456 },
        { name: '4h', scans: 780, patterns: 289 },
        { name: '1D', scans: 450, patterns: 178 },
      ]);

      // Mock top patterns
      setTopPatterns([
        { pattern: 'Ascending Triangle', symbol: 'BTC/USDT', accuracy: 78, count: 45 },
        { pattern: 'Double Bottom', symbol: 'ETH/USDT', accuracy: 82, count: 38 },
        { pattern: 'Bull Flag', symbol: 'SOL/USDT', accuracy: 75, count: 32 },
        { pattern: 'Head & Shoulders', symbol: 'BNB/USDT', accuracy: 71, count: 28 },
        { pattern: 'Wedge Breakout', symbol: 'XRP/USDT', accuracy: 68, count: 25 },
      ]);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockTrendData = (days) => {
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
        scans: Math.floor(Math.random() * 200) + 100,
        patterns: Math.floor(Math.random() * 80) + 20,
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
          <h1 className="text-2xl font-bold text-white">Scanner Analytics</h1>
          <p className="text-gray-400 mt-1">Pattern detection and scanner usage metrics</p>
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
          title="Total Scans"
          value={stats.totalScans?.toLocaleString() || '4,270'}
          change="+18%"
          changeType="positive"
          icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          loading={loading}
        />
        <StatsCard
          title="Patterns Detected"
          value={stats.totalPatterns?.toLocaleString() || '1,298'}
          change="+24%"
          changeType="positive"
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          loading={loading}
        />
        <StatsCard
          title="Active Users"
          value={stats.uniqueUsers?.toLocaleString() || '856'}
          change="+12%"
          changeType="positive"
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          loading={loading}
        />
        <StatsCard
          title="Avg Patterns/Scan"
          value={stats.avgPatternsPerScan || '2.4'}
          change="Stable"
          changeType="neutral"
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          loading={loading}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scan Trends */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Scan Activity Trend</h3>
          {loading ? (
            <div className="h-80 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="scans" stroke="#FFBD59" strokeWidth={2} dot={false} name="Scans" />
                <Line type="monotone" dataKey="patterns" stroke="#10B981" strokeWidth={2} dot={false} name="Patterns Found" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pattern Distribution */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Pattern Distribution</h3>
          {loading ? (
            <div className="h-80 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={patternData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {patternData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PATTERN_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeframe Analysis */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Usage by Timeframe</h3>
          {loading ? (
            <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={timeframeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="scans" fill="#3B82F6" name="Scans" radius={[4, 4, 0, 0]} />
                <Bar dataKey="patterns" fill="#FFBD59" name="Patterns" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Patterns */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Detected Patterns</h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {topPatterns.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-750 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full text-amber-500 font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-white font-medium">{item.pattern}</p>
                      <p className="text-gray-400 text-sm">{item.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-500 font-medium">{item.accuracy}%</p>
                    <p className="text-gray-400 text-sm">{item.count} detections</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pattern Performance Grid */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Pattern Performance Overview</h3>
        {loading ? (
          <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {patternData.slice(0, 8).map((pattern, index) => {
              const accuracy = 65 + Math.floor(Math.random() * 25);
              return (
                <div key={index} className="p-4 bg-gray-750 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: PATTERN_COLORS[pattern.name] || COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-white font-medium text-sm">{pattern.name}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Detections</span>
                      <span className="text-white">{pattern.value}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Accuracy</span>
                      <span className="text-green-500">{accuracy}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
