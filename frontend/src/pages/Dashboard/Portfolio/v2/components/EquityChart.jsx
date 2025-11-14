import React, { useState } from 'react';
import { Card } from '../../../../../components-v2/Card';
import './EquityChart.css';

/**
 * Equity Curve Chart
 * Shows portfolio value over time
 *
 * NOTE: Use Chart.js or Recharts for implementation
 * npm install chart.js react-chartjs-2
 * OR
 * npm install recharts
 */
export const EquityChart = () => {
  const [timeframe, setTimeframe] = useState('1M');

  const timeframes = ['1M', '3M', '6M', '1Y', 'ALL'];

  // Mock data - replace with real data
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [100000, 115000, 125000, 135000, 145000, 165000],
  };

  return (
    <Card variant="default" className="equity-chart-card">
      <div className="chart-header">
        <h3 className="heading-sm">Equity Curve</h3>

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
        {/* Chart placeholder - integrate Chart.js or Recharts here */}
        <div className="chart-placeholder">
          <p>📈 Equity Curve Chart</p>
          <p>Integrate Chart.js or Recharts</p>
          <p>Data: {chartData.labels.join(' → ')}</p>
          <p>Values: ${chartData.values[0].toLocaleString()} → ${chartData.values[chartData.values.length - 1].toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );
};

export default EquityChart;
