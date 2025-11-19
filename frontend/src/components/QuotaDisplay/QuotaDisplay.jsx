import React from 'react';
import { AlertTriangle, Gem, RefreshCw, Target, CheckCircle, Rocket, Sparkles } from 'lucide-react';
import { useQuota } from '../../hooks/useQuota';
import './QuotaDisplay.css';

export default function QuotaDisplay() {
  const { quota } = useQuota();

  if (quota.loading) {
    return (
      <div className="quota-display loading">
        <div className="quota-skeleton"></div>
      </div>
    );
  }

  if (quota.error) {
    // User-friendly error message without technical details
    return (
      <div className="quota-display error">
        <div className="error-content">
          <span className="error-icon"><AlertTriangle size={24} /></span>
          <div className="error-text">
            <h4>Không thể tải thông tin quota</h4>
            <p>Có thể bạn đã hết lượt scan hôm nay hoặc cần nâng cấp tài khoản.</p>
          </div>
        </div>
        <div className="error-actions">
          <button className="btn-upgrade" onClick={() => window.location.href = '/settings'}>
            <Gem size={18} /> Nâng cấp Premium
          </button>
          <button className="btn-retry" onClick={() => window.location.reload()}>
            <RefreshCw size={18} /> Thử lại
          </button>
        </div>
        {/* Technical error for debugging (hidden by default) */}
        <details className="error-details">
          <summary>Chi tiết lỗi (dành cho dev)</summary>
          <code>{quota.error}</code>
        </details>
      </div>
    );
  }

  const percentage = (quota.remaining / quota.maxScans) * 100;

  // Calculate time until reset
  const getTimeUntilReset = () => {
    if (!quota.resetAt) return '';

    const now = new Date();
    const reset = new Date(quota.resetAt);
    const diff = reset - now;

    if (diff < 0) return '0h 0m';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="quota-display">
      <div className="quota-header">
        <span className="quota-icon"><Target size={24} /></span>
        <div className="quota-text">
          <h4>Lượt Scan Hôm Nay</h4>
          <p className="quota-subtitle">FREE Tier - Nâng cấp để unlimited</p>
        </div>
      </div>

      <div className="quota-stats">
        <div className="quota-number">
          <span className={`remaining ${quota.remaining === 0 ? 'depleted' : ''}`}>
            {quota.remaining}
          </span>
          <span className="separator">/</span>
          <span className="total">{quota.maxScans}</span>
        </div>

        <div className="quota-bar">
          <div
            className="quota-fill"
            style={{
              width: `${percentage}%`,
              backgroundColor: percentage > 40 ? '#4CAF50' : percentage > 20 ? '#FF9800' : '#F44336'
            }}
          />
        </div>

        <div className="quota-info">
          {quota.canScan ? (
            <span className="quota-status available">
              <CheckCircle size={16} /> Còn {quota.remaining} lượt scan
            </span>
          ) : (
            <span className="quota-status depleted">
              <AlertTriangle size={16} /> Đã hết lượt scan hôm nay
            </span>
          )}
          <span className="quota-reset">
            Reset sau: {getTimeUntilReset()}
          </span>
        </div>
      </div>

      {!quota.canScan && (
        <div className="quota-upgrade">
          <p><Rocket size={18} /> Đã hết lượt scan miễn phí hôm nay!</p>
          <button className="btn-upgrade">
            Nâng cấp lên Tier 1
          </button>
          <span className="upgrade-benefit">
            <Sparkles size={16} /> Unlimited scans + 7 patterns chỉ 10M VND
          </span>
        </div>
      )}
    </div>
  );
}
