/**
 * Revenue Dashboard Page
 * Track revenue, sales, and financial metrics
 */

import React, { useState, useEffect } from 'react';
import StatsCard from '../../components/StatsCard';

export default function RevenuePage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    // Simulated data loading
    setTimeout(() => {
      setStats({
        totalRevenue: 125000000,
        subscriptionRevenue: 85000000,
        shopRevenue: 40000000,
        commissionsPaid: 15000000,
        netRevenue: 110000000,
        transactions: 1250,
        avgOrderValue: 100000,
        conversionRate: 3.2,
        revenueByTier: {
          tier_1: 25000000,
          tier_2: 35000000,
          tier_3: 25000000,
        },
        revenueByDay: [
          { date: '01/02', amount: 4200000 },
          { date: '02/02', amount: 3800000 },
          { date: '03/02', amount: 5100000 },
          { date: '04/02', amount: 4500000 },
          { date: '05/02', amount: 6200000 },
          { date: '06/02', amount: 5800000 },
          { date: '07/02', amount: 4900000 },
        ],
        topProducts: [
          { name: 'Tier 3 Subscription', revenue: 25000000, count: 25 },
          { name: 'Tier 2 Subscription', revenue: 35000000, count: 70 },
          { name: 'Trading Course Pro', revenue: 22000000, count: 44 },
          { name: 'Tier 1 Subscription', revenue: 25000000, count: 250 },
          { name: 'Scanner Tool', revenue: 18000000, count: 180 },
        ],
      });
      setLoading(false);
    }, 500);
  }, [period]);

  const formatAmount = (amount) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M VND';
    }
    return Number(amount || 0).toLocaleString('vi-VN') + ' VND';
  };

  const formatFullAmount = (amount) => {
    return Number(amount || 0).toLocaleString('vi-VN') + ' VND';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Revenue Dashboard</h1>
          <p className="text-gray-400 mt-1">Track revenue, sales, and financial metrics</p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatAmount(stats?.totalRevenue)}
          change="+12.5%"
          changeType="positive"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={loading}
        />
        <StatsCard
          title="Subscriptions"
          value={formatAmount(stats?.subscriptionRevenue)}
          change="+8.3%"
          changeType="positive"
          icon="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
          loading={loading}
        />
        <StatsCard
          title="Shop Sales"
          value={formatAmount(stats?.shopRevenue)}
          change="+22.1%"
          changeType="positive"
          icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          loading={loading}
        />
        <StatsCard
          title="Net Revenue"
          value={formatAmount(stats?.netRevenue)}
          change="+10.2%"
          changeType="positive"
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          loading={loading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Transactions"
          value={stats?.transactions?.toLocaleString() || 0}
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          loading={loading}
        />
        <StatsCard
          title="Avg Order Value"
          value={formatAmount(stats?.avgOrderValue)}
          icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          loading={loading}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${stats?.conversionRate || 0}%`}
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          loading={loading}
        />
        <StatsCard
          title="Commissions Paid"
          value={formatAmount(stats?.commissionsPaid)}
          changeType="negative"
          icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
          {loading ? (
            <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <div className="h-64 flex items-end space-x-2">
              {stats?.revenueByDay?.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t transition-all hover:from-amber-400 hover:to-amber-300"
                    style={{
                      height: `${(day.amount / 7000000) * 100}%`,
                      minHeight: '20px',
                    }}
                  ></div>
                  <span className="text-xs text-gray-400 mt-2">{day.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue by Tier */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Tier</h3>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(stats?.revenueByTier || {}).map(([tier, amount]) => {
                const total = Object.values(stats?.revenueByTier || {}).reduce((a, b) => a + b, 0);
                const percentage = ((amount / total) * 100).toFixed(1);
                const colors = {
                  tier_1: 'bg-blue-500',
                  tier_2: 'bg-purple-500',
                  tier_3: 'bg-amber-500',
                };
                return (
                  <div key={tier}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{tier.replace('tier_', 'Tier ')}</span>
                      <span className="text-white font-medium">{formatFullAmount(amount)}</span>
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[tier]} transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{percentage}% of subscription revenue</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Products by Revenue</h3>
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
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Sales</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats?.topProducts?.map((product, index) => (
                  <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-750">
                    <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                    <td className="py-3 px-4 text-white font-medium">{product.name}</td>
                    <td className="py-3 px-4 text-right text-gray-300">{product.count}</td>
                    <td className="py-3 px-4 text-right text-amber-500 font-medium">
                      {formatFullAmount(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
