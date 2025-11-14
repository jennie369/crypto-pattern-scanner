import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../../../../../components-v2/Card';
import './EquityChart.css';

/**
 * Equity Curve Chart
 * Shows portfolio value over time using Recharts
 */
export const EquityChart = ({ data }) => {
  const [timeframe, setTimeframe] = useState('1M');

  const timeframes = ['1M', '3M', '6M', '1Y', 'ALL'];

  // Mock data - replace with real API data
  const generateMockData = (period) => {
    const dataPoints = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      'ALL': 500,
    };

    const points = dataPoints[period];
    const mockData = [];
    let value = 100000;

    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.45) * 2000; // Slight upward bias
      value = Math.max(50000, value + change);

      const date = new Date();
      date.setDate(date.getDate() - (points - i));

      mockData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.round(value),
        timestamp: date.getTime(),
      });
    }

    return mockData;
  };

  const chartData = useMemo(() => {
    if (data) return data;
    return generateMockData(timeframe);
  }, [data, timeframe]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const change = chartData.length > 1
        ? data.value - chartData[0].value
        : 0;
      const changePercent = chartData.length > 1
        ? ((change / chartData[0].value) * 100).toFixed(2)
        : 0;

      return (
        <div className="equity-tooltip">
          <div className="tooltip-date">{data.date}</div>
          <div className="tooltip-value">${data.value.toLocaleString()}</div>
          <div className={`tooltip-change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change >= 0 ? '+' : ''}${change.toLocaleString()} ({changePercent}%)
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate stats
  const stats = useMemo(() => {
    if (!chartData.length) return { start: 0, current: 0, change: 0, changePercent: 0 };

    const start = chartData[0].value;
    const current = chartData[chartData.length - 1].value;
    const change = current - start;
    const changePercent = ((change / start) * 100).toFixed(2);

    return { start, current, change, changePercent };
  }, [chartData]);

  return (
    <Card variant="default" className="equity-chart-card">
      <div className="chart-header">
        <div className="chart-title-section">
          <h3 className="heading-sm">Equity Curve</h3>
          <div className="chart-stats">
            <span className="stat-current">${stats.current.toLocaleString()}</span>
            <span className={`stat-change ${stats.change >= 0 ? 'positive' : 'negative'}`}>
              {stats.change >= 0 ? '+' : ''}${Math.abs(stats.change).toLocaleString()} ({stats.changePercent}%)
            </span>
          </div>
        </div>

        <div className="timeframe-selector">
          {timeframes.map(tf => (
            <button
              key={tf}
              className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFBD59" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#FFBD59" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.3)"
              style={{ fontSize: '12px' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              style={{ fontSize: '12px' }}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#FFBD59', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#FFBD59"
              strokeWidth={2}
              fill="url(#equityGradient)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default EquityChart;
