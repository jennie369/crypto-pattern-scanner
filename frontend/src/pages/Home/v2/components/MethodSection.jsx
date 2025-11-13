import React from 'react';
import './MethodSection.css';

export const MethodSection = () => {
  const patterns = [
    {
      icon: '🔴📉⏸️📉',
      code: 'DPD',
      name: 'Down-Pause-Down',
      description: 'Pattern tiếp diễn xu hướng giảm với độ tin cậy cao',
      winRate: '68%',
      category: 'Continuation',
      color: '#F6465D'
    },
    {
      icon: '🟢📈⏸️📈',
      code: 'UPU',
      name: 'Up-Pause-Up',
      description: 'Pattern tiếp diễn xu hướng tăng mạnh mẽ',
      winRate: '71%',
      category: 'Continuation',
      color: '#00FF88'
    },
    {
      icon: '🔺🔴',
      code: 'HFZ',
      name: 'High Frequency Zone',
      description: 'Vùng kháng cự chính với tần suất chạm cao',
      winRate: '65%',
      category: 'Zone',
      color: '#FFBD59'
    }
  ];

  return (
    <section className="method-section" id="method">
      <div className="container">
        <div className="section-header">
          <h2>GEM Frequency Method</h2>
          <p>Phương pháp giao dịch độc quyền với 24 patterns được backtest</p>
        </div>

        <div className="patterns-grid">
          {patterns.map((pattern, index) => (
            <div key={index} className="pattern-card" style={{ '--pattern-color': pattern.color }}>
              <div className="pattern-icon">{pattern.icon}</div>

              <div className="pattern-header">
                <div className="pattern-code">{pattern.code}</div>
                <div className="pattern-badge" style={{ borderColor: pattern.color }}>
                  {pattern.category}
                </div>
              </div>

              <h3 className="pattern-name">{pattern.name}</h3>
              <p className="pattern-description">{pattern.description}</p>

              <div className="pattern-stats">
                <div className="pattern-stat">
                  <div className="stat-label">Win Rate</div>
                  <div className="stat-value" style={{ color: pattern.color }}>
                    {pattern.winRate}
                  </div>
                </div>
              </div>

              <button className="btn-outline btn-sm pattern-cta">
                Xem Chi Tiết
              </button>
            </div>
          ))}
        </div>

        <div className="method-cta">
          <button className="btn-primary btn-lg">
            <span>📥</span>
            Download Pattern Guide (PDF)
          </button>
        </div>
      </div>
    </section>
  );
};

export default MethodSection;
