import React, { useState } from 'react';
import { useScanHistory } from '../hooks/useScanHistory';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart3,
  Search,
  TrendingUp,
  Clock,
  Target,
  Trash2,
  AlertTriangle,
  XCircle,
  Lock,
  Mail,
  Lightbulb
} from 'lucide-react';
import './ScanHistory.css';

/**
 * Scan History Page
 * Shows user's pattern scanning history
 */
function ScanHistory() {
  const { user, profile } = useAuth();
  const { history, loading, error, deleteScan, clearHistory, getStats } = useScanHistory();
  const [filter, setFilter] = useState('all'); // all, has-patterns, no-patterns
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get statistics
  const stats = getStats();

  // Filter history
  const filteredHistory = history.filter(scan => {
    if (filter === 'all') return true;
    if (filter === 'has-patterns') {
      return scan.patterns_found && Object.keys(scan.patterns_found).length > 0;
    }
    if (filter === 'no-patterns') {
      return !scan.patterns_found || Object.keys(scan.patterns_found).length === 0;
    }
    return true;
  });

  const handleDeleteScan = async (scanId) => {
    if (window.confirm('Xóa scan này khỏi lịch sử?')) {
      try {
        await deleteScan(scanId);
      } catch (err) {
        alert('Lỗi khi xóa: ' + err.message);
      }
    }
  };

  const handleClearAll = async () => {
    if (showDeleteConfirm) {
      try {
        await clearHistory();
        setShowDeleteConfirm(false);
        alert('Đã xóa toàn bộ lịch sử!');
      } catch (err) {
        alert('Lỗi khi xóa: ' + err.message);
      }
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 5000); // Reset after 5s
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get pattern count from patterns_found
  const getPatternCount = (patternsFound) => {
    if (!patternsFound || typeof patternsFound !== 'object') return 0;
    if (Array.isArray(patternsFound)) return patternsFound.length;
    return Object.keys(patternsFound).length;
  };

  if (!user) {
    return (
      <div className="scan-history-page">
        <div className="auth-required">
          <h2><Lock size={32} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />Đăng nhập để xem lịch sử</h2>
          <p>Vui lòng đăng nhập để xem lịch sử quét pattern của bạn</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="scan-history-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải lịch sử...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scan-history-page">
        <div className="error-state">
          <h2><XCircle size={32} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />Lỗi</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scan-history-page">
      <div className="history-header">
        <h1><BarChart3 size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />Lịch Sử Quét Pattern</h1>
        <p className="subtitle">Theo dõi các lần quét và patterns đã tìm thấy</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Search size={32} /></div>
          <div className="stat-content">
            <div className="stat-label">Tổng Số Lần Quét</div>
            <div className="stat-value">{stats.totalScans}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><TrendingUp size={32} /></div>
          <div className="stat-content">
            <div className="stat-label">Patterns Tìm Thấy</div>
            <div className="stat-value">{stats.totalPatterns}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><Clock size={32} /></div>
          <div className="stat-content">
            <div className="stat-label">Timeframe Thường Dùng</div>
            <div className="stat-value">{stats.mostCommonTimeframe || 'N/A'}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><Target size={32} /></div>
          <div className="stat-content">
            <div className="stat-label">Coin Hay Quét</div>
            <div className="stat-value">{stats.mostScannedSymbol || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất Cả ({history.length})
          </button>
          <button
            className={`filter-btn ${filter === 'has-patterns' ? 'active' : ''}`}
            onClick={() => setFilter('has-patterns')}
          >
            <Target size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Có Patterns
          </button>
          <button
            className={`filter-btn ${filter === 'no-patterns' ? 'active' : ''}`}
            onClick={() => setFilter('no-patterns')}
          >
            Không Pattern
          </button>
        </div>

        {history.length > 0 && (
          <button
            className={`clear-all-btn ${showDeleteConfirm ? 'confirm' : ''}`}
            onClick={handleClearAll}
          >
            {showDeleteConfirm ? <><AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Click lại để xác nhận xóa</> : <><Trash2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Xóa Tất Cả</>}
          </button>
        )}
      </div>

      {/* History List */}
      <div className="history-list">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((scan) => {
            const patternCount = getPatternCount(scan.patterns_found);
            const hasPatterns = patternCount > 0;

            return (
              <div key={scan.id} className={`history-item ${hasPatterns ? 'has-patterns' : 'no-patterns'}`}>
                <div className="history-item-header">
                  <div className="scan-info">
                    <span className="scan-date">{formatDate(scan.created_at)}</span>
                    <span className="scan-tier">{scan.tier_at_scan?.toUpperCase() || 'FREE'}</span>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteScan(scan.id)}
                    title="Xóa scan này"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="history-item-body">
                  <div className="scan-details">
                    <div className="detail-item">
                      <span className="detail-label">Symbols:</span>
                      <span className="detail-value">
                        {Array.isArray(scan.symbols)
                          ? scan.symbols.join(', ').substring(0, 50) + (scan.symbols.join(', ').length > 50 ? '...' : '')
                          : 'N/A'}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Timeframe:</span>
                      <span className="detail-value">{scan.timeframe}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Patterns Found:</span>
                      <span className={`detail-value ${hasPatterns ? 'has-patterns' : 'no-patterns'}`}>
                        {patternCount > 0 ? `${patternCount} pattern${patternCount > 1 ? 's' : ''}` : 'Không tìm thấy'}
                      </span>
                    </div>
                  </div>

                  {hasPatterns && (
                    <div className="patterns-found">
                      <div className="patterns-label">Patterns:</div>
                      <div className="patterns-list">
                        {Array.isArray(scan.patterns_found) ? (
                          scan.patterns_found.map((pattern, idx) => (
                            <div key={idx} className="pattern-chip">
                              {pattern.symbol}: {pattern.pattern}
                            </div>
                          ))
                        ) : (
                          <div className="pattern-chip">
                            {patternCount} pattern{patternCount > 1 ? 's' : ''} detected
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <div className="empty-icon"><Mail size={48} /></div>
            <h3>Chưa Có Lịch Sử</h3>
            <p>
              {filter === 'all'
                ? 'Bạn chưa thực hiện scan nào. Hãy quét patterns để xem lịch sử!'
                : 'Không có scan nào phù hợp với filter này.'}
            </p>
          </div>
        )}
      </div>

      {/* Tier Notice */}
      {profile?.tier === 'free' && (
        <div className="tier-notice">
          <div className="notice-icon"><Lightbulb size={32} /></div>
          <div className="notice-content">
            <h4>Ghi Chú FREE Tier</h4>
            <p>Lịch sử quét được lưu trong 30 ngày. Nâng cấp lên TIER 1+ để lưu vô thời hạn!</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScanHistory;
