import React, { useState } from 'react'
import './SRPanel.css'

/**
 * SRPanel Component
 * Displays list of Support/Resistance levels with strength indicators
 */
export default function SRPanel({ srData, currentPrice, userTier, onLevelClick }) {
  const [activeTab, setActiveTab] = useState('all') // 'all', 'support', 'resistance'

  if (!srData || (!srData.supports.length && !srData.resistances.length)) {
    return (
      <div className="sr-panel">
        <div className="sr-panel-header">
          <h3>📊 Hỗ Trợ / Kháng Cự</h3>
          <span className="tier-badge">{userTier?.toUpperCase() || 'FREE'}</span>
        </div>
        <div className="sr-empty">
          <p>⏳ Đang phân tích dữ liệu...</p>
          <small>Cần ít nhất 20 nến để phát hiện S/R</small>
        </div>
      </div>
    )
  }

  const allLevels = [
    ...srData.supports.map(s => ({ ...s, type: 'support' })),
    ...srData.resistances.map(r => ({ ...r, type: 'resistance' }))
  ].sort((a, b) => b.strength - a.strength)

  const filteredLevels = activeTab === 'all'
    ? allLevels
    : activeTab === 'support'
    ? srData.supports.map(s => ({ ...s, type: 'support' }))
    : srData.resistances.map(r => ({ ...r, type: 'resistance' }))

  const isFree = userTier === 'free'

  return (
    <div className="sr-panel">
      <div className="sr-panel-header">
        <h3>📊 Hỗ Trợ / Kháng Cự</h3>
        <span className="tier-badge">{userTier?.toUpperCase() || 'FREE'}</span>
      </div>

      {isFree && (
        <div className="sr-free-notice">
          <span className="lock-icon">🔒</span>
          <span>FREE: Chỉ hiển thị 3 levels gần nhất</span>
        </div>
      )}

      {/* Tabs */}
      <div className="sr-tabs">
        <button
          className={`sr-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tất Cả ({allLevels.length})
        </button>
        <button
          className={`sr-tab ${activeTab === 'support' ? 'active' : ''}`}
          onClick={() => setActiveTab('support')}
        >
          Hỗ Trợ ({srData.supports.length})
        </button>
        <button
          className={`sr-tab ${activeTab === 'resistance' ? 'active' : ''}`}
          onClick={() => setActiveTab('resistance')}
        >
          Kháng Cự ({srData.resistances.length})
        </button>
      </div>

      {/* Key Levels Summary */}
      {srData.keyLevels && srData.keyLevels.length > 0 && (
        <div className="sr-key-levels">
          <div className="key-levels-title">
            <span>⭐</span>
            <strong>Vùng Quan Trọng</strong>
          </div>
          {srData.keyLevels.map((level, index) => (
            <div key={index} className={`key-level ${level.type}`}>
              <div className="key-level-type">
                {level.type === 'support' ? '🟢 HỖ TRỢ' : '🔴 KHÁNG CỰ'}
              </div>
              <div className="key-level-price">
                ${level.price.toFixed(2)}
              </div>
              <div className="key-level-distance">
                {level.distance} từ giá hiện tại
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Levels List */}
      <div className="sr-levels-list">
        {filteredLevels.length === 0 ? (
          <div className="sr-empty">
            <p>Không tìm thấy level nào</p>
          </div>
        ) : (
          filteredLevels.map((level, index) => {
            const distance = currentPrice
              ? ((Math.abs(level.price - currentPrice) / currentPrice) * 100).toFixed(2)
              : 0
            const direction = level.price > currentPrice ? 'above' : 'below'

            return (
              <div
                key={`${level.type}-${index}`}
                className={`sr-level-item ${level.type}`}
                onClick={() => onLevelClick && onLevelClick(level)}
              >
                <div className="sr-level-header">
                  <div className="sr-level-type-icon">
                    {level.type === 'support' ? '🟢' : '🔴'}
                  </div>
                  <div className="sr-level-info">
                    <div className="sr-level-price">
                      ${level.price.toFixed(2)}
                    </div>
                    <div className="sr-level-meta">
                      <span className="sr-touches">{level.touches}x chạm</span>
                      <span className="sr-distance">
                        {distance}% {direction === 'above' ? '↑' : '↓'}
                      </span>
                    </div>
                  </div>
                  <div className="sr-level-strength-badge">
                    {level.strength}%
                  </div>
                </div>

                {/* Strength Bar */}
                <div className="sr-strength-container">
                  <div className="sr-strength-label">
                    <span>Độ Mạnh</span>
                    <span>{getStrengthLabel(level.strength)}</span>
                  </div>
                  <div className="sr-strength-bar-bg">
                    <div
                      className={`sr-strength-bar ${level.type} strength-${getStrengthClass(level.strength)}`}
                      style={{ width: `${level.strength}%` }}
                    />
                  </div>
                </div>

                {/* Last Tested */}
                <div className="sr-level-footer">
                  <span className="sr-last-tested">
                    ⏱️ Lần cuối: {formatTime(level.lastTested)}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function getStrengthLabel(strength) {
  if (strength >= 80) return 'Rất Mạnh'
  if (strength >= 60) return 'Mạnh'
  if (strength >= 40) return 'Trung Bình'
  return 'Yếu'
}

function getStrengthClass(strength) {
  if (strength >= 80) return 'very-strong'
  if (strength >= 60) return 'strong'
  if (strength >= 40) return 'medium'
  return 'weak'
}

function formatTime(timestamp) {
  if (!timestamp) return 'N/A'

  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diffMs = now - date
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 7) {
    return `${Math.floor(diffDays / 7)} tuần trước`
  }
  if (diffDays > 0) {
    return `${diffDays} ngày trước`
  }
  if (diffHours > 0) {
    return `${diffHours} giờ trước`
  }
  return 'Vừa xong'
}
