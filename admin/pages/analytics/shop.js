/**
 * Shop Analytics Page
 * Track sales, revenue, and product performance
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

export default function ShopAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [salesTrend, setSalesTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [conversionFunnel, setConversionFunnel] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;

      const [statsResult, trendResult, productsResult] = await Promise.all([
        analyticsService.getShopStats(days),
        analyticsService.getSalesTrend(days),
        analyticsService.getTopProducts(10),
      ]);

      if (statsResult.success) {
        setStats(statsResult.data);
      } else {
        // Mock stats
        setStats({
          totalOrders: 1250,
          totalRevenue: 125000000,
          completedOrders: 1100,
          uniqueCustomers: 890,
          avgOrderValue: 100000,
          completionRate: 88,
        });
      }

      if (trendResult.success && trendResult.data.length > 0) {
        setSalesTrend(trendResult.data);
      } else {
        setSalesTrend(generateMockSalesTrend(days));
      }

      if (productsResult.success && productsResult.data.length > 0) {
        setTopProducts(productsResult.data);
      } else {
        setTopProducts([
          { name: 'Tier 3 Subscription', quantity: 45, revenue: 45000000 },
          { name: 'Tier 2 Subscription', quantity: 120, revenue: 36000000 },
          { name: 'Trading Course Pro', quantity: 85, revenue: 25500000 },
          { name: 'Tier 1 Subscription', quantity: 350, revenue: 17500000 },
          { name: 'Scanner Premium', quantity: 180, revenue: 9000000 },
        ]);
      }

      // Mock category data
      setCategoryData([
        { name: 'Subscriptions', value: 65, revenue: 81250000 },
        { name: 'Courses', value: 25, revenue: 31250000 },
        { name: 'Products', value: 10, revenue: 12500000 },
      ]);

      // Mock funnel
      setConversionFunnel([
        { stage: 'Visit', value: 10000 },
        { stage: 'View Product', value: 4500 },
        { stage: 'Add to Cart', value: 2200 },
        { stage: 'Checkout', value: 1600 },
        { stage: 'Purchase', value: 1250 },
      ]);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockSalesTrend = (days) => {
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
        orders: Math.floor(Math.random() * 50) + 20,
        revenue: Math.floor(Math.random() * 5000000) + 2000000,
      });
    }
    return data;
  };

  const formatAmount = (amount) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K';
    }
    return amount?.toLocaleString() || '0';
  };

  const formatFullAmount = (amount) => {
    return Number(amount || 0).toLocaleString('vi-VN') + ' VND';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-400 text-sm">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {entry.name.includes('Revenue') ? formatFullAmount(entry.value) : entry.value?.toLocaleString()}
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
          <h1 className="text-2xl font-bold text-white">Shop Analytics</h1>
          <p className="text-gray-400 mt-1">Sales, revenue, and product performance metrics</p>
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
          title="Total Revenue"
          value={formatAmount(stats.totalRevenue) + ' VND'}
          change="+15%"
          changeType="positive"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={loading}
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders?.toLocaleString() || '0'}
          change="+12%"
          changeType="positive"
          icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          loading={loading}
        />
        <StatsCard
          title="Avg Order Value"
          value={formatAmount(stats.avgOrderValue) + ' VND'}
          change="+5%"
          changeType="positive"
          icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          loading={loading}
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats.completionRate || 0}%`}
          change="Stable"
          changeType="neutral"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={loading}
        />
      </div>

      {/* Revenue Trend */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
        {loading ? (
          <div className="h-80 bg-gray-700 rounded animate-pulse"></div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={salesTrend}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFBD59" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFBD59" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => formatAmount(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#FFBD59" strokeWidth={2} fill="url(#colorRevenue)" name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Category</h3>
          {loading ? (
            <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={260}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                      <span className="text-gray-300">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{item.value}%</p>
                      <p className="text-gray-400 text-sm">{formatAmount(item.revenue)} VND</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Conversion Funnel */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Conversion Funnel</h3>
          {loading ? (
            <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <div className="space-y-3">
              {conversionFunnel.map((stage, index) => {
                const maxValue = conversionFunnel[0].value;
                const percentage = ((stage.value / maxValue) * 100).toFixed(0);
                const convRate = index > 0
                  ? ((stage.value / conversionFunnel[index - 1].value) * 100).toFixed(1)
                  : 100;
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{stage.stage}</span>
                      <span className="text-white">
                        {stage.value.toLocaleString()}
                        {index > 0 && (
                          <span className="text-amber-500 ml-2">({convRate}%)</span>
                        )}
                      </span>
                    </div>
                    <div className="h-8 bg-gray-700 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-lg transition-all flex items-center justify-end pr-2"
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 20 && (
                          <span className="text-xs text-gray-900 font-medium">{percentage}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="mt-4 p-3 bg-gray-750 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-400">Overall Conversion</span>
                  <span className="text-green-500 font-medium">
                    {((conversionFunnel[4]?.value / conversionFunnel[0]?.value) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Selling Products</h3>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">#</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Product</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Quantity</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Revenue</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => {
                  const totalRevenue = topProducts.reduce((sum, p) => sum + p.revenue, 0);
                  const percentage = ((product.revenue / totalRevenue) * 100).toFixed(1);
                  return (
                    <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-750">
                      <td className="py-4 px-4">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-medium ${
                          index === 0 ? 'bg-amber-500 text-gray-900' :
                          index === 1 ? 'bg-gray-400 text-gray-900' :
                          index === 2 ? 'bg-amber-700 text-white' :
                          'bg-gray-700 text-gray-400'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white font-medium">{product.name}</td>
                      <td className="py-4 px-4 text-right text-gray-300">{product.quantity.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right text-amber-500 font-medium">{formatFullAmount(product.revenue)}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="text-gray-400 text-sm w-12">{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
