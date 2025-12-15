/**
 * AssetAllocationChart Component
 * Pie chart showing portfolio allocation by asset
 * Uses design tokens for consistent styling
 */

import React, { useMemo } from 'react';
import { PieChart } from 'lucide-react';
import './AssetAllocationChart.css';

// Color palette for pie chart slices
const CHART_COLORS = [
  '#FFBD59', // Gold
  '#8B5CF6', // Purple
  '#00D9FF', // Cyan
  '#00FF88', // Green
  '#FF6B6B', // Red
  '#FF00FF', // Magenta
  '#A0AEC0', // Gray
  '#F59E0B', // Orange
];

export function AssetAllocationChart({ holdings = [] }) {
  // Calculate allocation percentages
  const allocationData = useMemo(() => {
    if (!holdings || holdings.length === 0) {
      return [];
    }

    // Calculate total value
    const totalValue = holdings.reduce((sum, h) => {
      const value = (h.quantity || 0) * (h.currentPrice || h.current_price || h.avgPrice || h.average_price || 0);
      return sum + value;
    }, 0);

    if (totalValue === 0) return [];

    // Sort by value and take top 7, group rest as "Others"
    const sortedHoldings = [...holdings]
      .map(h => ({
        symbol: h.symbol || h.coin_symbol || 'Unknown',
        value: (h.quantity || 0) * (h.currentPrice || h.current_price || h.avgPrice || h.average_price || 0),
      }))
      .sort((a, b) => b.value - a.value);

    let result = [];
    let othersValue = 0;

    sortedHoldings.forEach((h, index) => {
      if (index < 7) {
        result.push({
          symbol: h.symbol.replace('/USDT', '').replace('USDT', ''),
          value: h.value,
          percentage: ((h.value / totalValue) * 100).toFixed(1),
          color: CHART_COLORS[index],
        });
      } else {
        othersValue += h.value;
      }
    });

    if (othersValue > 0) {
      result.push({
        symbol: 'Khác',
        value: othersValue,
        percentage: ((othersValue / totalValue) * 100).toFixed(1),
        color: CHART_COLORS[7],
      });
    }

    return result;
  }, [holdings]);

  // Generate SVG pie chart path
  const generatePieSlices = useMemo(() => {
    if (allocationData.length === 0) return [];

    const slices = [];
    let cumulativeAngle = -90; // Start from top

    allocationData.forEach((item) => {
      const angle = (parseFloat(item.percentage) / 100) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;

      // Convert to radians
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      // Calculate points
      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);

      // Determine if large arc
      const largeArc = angle > 180 ? 1 : 0;

      // Create path
      const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

      slices.push({
        ...item,
        path,
        startAngle,
        endAngle,
      });

      cumulativeAngle = endAngle;
    });

    return slices;
  }, [allocationData]);

  if (!holdings || holdings.length === 0) {
    return (
      <div className="allocation-chart-container empty">
        <PieChart size={48} className="empty-icon" />
        <p className="empty-text">Chưa có vị thế nào</p>
        <p className="empty-subtext">Thêm holdings để xem phân bổ tài sản</p>
      </div>
    );
  }

  return (
    <div className="allocation-chart-container">
      <div className="chart-header">
        <PieChart size={20} />
        <h3 className="chart-title">Phân Bổ Tài Sản</h3>
      </div>

      <div className="chart-content">
        {/* SVG Pie Chart */}
        <div className="pie-chart-wrapper">
          <svg viewBox="0 0 100 100" className="pie-chart-svg">
            {generatePieSlices.map((slice, index) => (
              <path
                key={slice.symbol}
                d={slice.path}
                fill={slice.color}
                className="pie-slice"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <title>{slice.symbol}: {slice.percentage}%</title>
              </path>
            ))}
            {/* Center hole for donut effect */}
            <circle cx="50" cy="50" r="25" fill="var(--bg-primary, #0A0E27)" />
            {/* Center text */}
            <text x="50" y="48" className="center-text-label" textAnchor="middle" fill="var(--text-muted)">
              Tổng
            </text>
            <text x="50" y="58" className="center-text-value" textAnchor="middle" fill="var(--text-primary)">
              {holdings.length}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="chart-legend">
          {allocationData.map((item) => (
            <div key={item.symbol} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: item.color }} />
              <span className="legend-symbol">{item.symbol}</span>
              <span className="legend-percentage">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AssetAllocationChart;
