import React from 'react';
import './PortfolioChart.css';

/**
 * PortfolioChart Component
 *
 * Visual chart showing portfolio allocation
 *
 * Features:
 * - Pie chart showing holdings distribution by value
 * - Color-coded segments
 * - Legend with percentages
 * - Top 5 holdings emphasis
 */
export default function PortfolioChart({ holdings }) {
  // Calculate total portfolio value
  const totalValue = holdings.reduce((sum, h) => sum + (h.current_value || 0), 0);

  // Prepare chart data - sort by value and take top 5
  const sortedHoldings = [...holdings]
    .sort((a, b) => b.current_value - a.current_value)
    .slice(0, 5);

  // Calculate "Others" if more than 5 holdings
  const othersValue = holdings.length > 5
    ? holdings.slice(5).reduce((sum, h) => sum + (h.current_value || 0), 0)
    : 0;

  // Color palette for chart segments
  const colors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Orange
    '#8b5cf6', // Purple
    '#ef4444', // Red
    '#6b7280'  // Gray for Others
  ];

  // Prepare chart segments
  const chartData = sortedHoldings.map((holding, index) => ({
    symbol: holding.symbol,
    value: holding.current_value || 0,
    percent: ((holding.current_value || 0) / totalValue) * 100,
    color: colors[index],
    pnl: holding.unrealized_pnl || 0,
    pnlPercent: holding.unrealized_pnl_percent || 0
  }));

  if (othersValue > 0) {
    chartData.push({
      symbol: 'Others',
      value: othersValue,
      percent: (othersValue / totalValue) * 100,
      color: colors[5],
      pnl: 0,
      pnlPercent: 0
    });
  }

  // Calculate cumulative percentages for pie chart segments
  let cumulativePercent = 0;
  const segments = chartData.map(item => {
    const startPercent = cumulativePercent;
    cumulativePercent += item.percent;
    return {
      ...item,
      startPercent,
      endPercent: cumulativePercent
    };
  });

  // Empty state
  if (holdings.length === 0) {
    return (
      <div className="portfolio-chart">
        <div className="chart-empty">
          <div className="empty-icon">📊</div>
          <p>No holdings to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-chart">

      {/* Chart Header */}
      <div className="chart-header">
        <h3>📊 Portfolio Allocation</h3>
        <div className="chart-total">
          Total: <strong>${totalValue.toLocaleString()}</strong>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="chart-container">
        <svg className="pie-chart" viewBox="0 0 200 200">
          {segments.map((segment, index) => {
            const startAngle = (segment.startPercent / 100) * 360 - 90;
            const endAngle = (segment.endPercent / 100) * 360 - 90;

            const startX = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
            const startY = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);

            const endX = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
            const endY = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);

            const largeArc = segment.percent > 50 ? 1 : 0;

            const pathData = [
              `M 100 100`,
              `L ${startX} ${startY}`,
              `A 80 80 0 ${largeArc} 1 ${endX} ${endY}`,
              'Z'
            ].join(' ');

            return (
              <path
                key={index}
                d={pathData}
                fill={segment.color}
                stroke="#1a1a2e"
                strokeWidth="2"
                className="chart-segment"
              />
            );
          })}

          {/* Center circle for donut effect */}
          <circle cx="100" cy="100" r="50" fill="#1a1a2e" />

          {/* Center text */}
          <text x="100" y="95" textAnchor="middle" className="chart-center-label">
            Holdings
          </text>
          <text x="100" y="110" textAnchor="middle" className="chart-center-value">
            {holdings.length}
          </text>
        </svg>
      </div>

      {/* Chart Legend */}
      <div className="chart-legend">
        {chartData.map((item, index) => (
          <div key={index} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: item.color }}></div>
            <div className="legend-content">
              <div className="legend-symbol">{item.symbol}</div>
              <div className="legend-stats">
                <span className="legend-percent">{item.percent.toFixed(1)}%</span>
                <span className="legend-value">${item.value.toLocaleString()}</span>
                {item.symbol !== 'Others' && (
                  <span className={`legend-pnl ${item.pnl >= 0 ? 'positive' : 'negative'}`}>
                    {item.pnl >= 0 ? '+' : ''}{item.pnlPercent.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
