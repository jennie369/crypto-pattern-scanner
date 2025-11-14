import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../contexts/AuthContext'
import AddTradeModal from './AddTradeModal'
import './TradingJournal.css'

export default function TradingJournal() {
  const { user } = useAuth()
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTrade, setEditingTrade] = useState(null)
  const [userTier, setUserTier] = useState('free')
  const [stats, setStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalPL: 0,
    winRate: 0,
    avgWin: 0,
    avgLoss: 0
  })

  // Notification modal states
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationType, setNotificationType] = useState('success') // 'success', 'error', 'warning'

  // Confirmation modal states
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const [confirmationAction, setConfirmationAction] = useState(null)

  // Fetch user tier only once on mount
  useEffect(() => {
    if (user) {
      fetchUserTier()
    }
  }, [user])

  // Fetch trades when userTier is loaded (only once)
  useEffect(() => {
    if (user && userTier && trades.length === 0) {
      fetchTrades()
    }
  }, [user, userTier])

  const fetchUserTier = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('tier')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setUserTier(data.tier || 'free')
    } catch (error) {
      console.error('Error fetching tier:', error)
    }
  }

  const fetchTrades = async () => {
    try {
      setLoading(true)

      // Get trades ordered by entry date
      let query = supabase
        .from('trading_journal')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_at', { ascending: false })

      // FREE tier: limit to 50 trades
      if (userTier === 'free') {
        query = query.limit(50)
      }

      const { data, error } = await query

      if (error) throw error

      setTrades(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching trades:', error)
      showNotificationModal('❌ Lỗi khi tải trades: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (tradesData) => {
    if (tradesData.length === 0) {
      setStats({
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalPL: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0
      })
      return
    }

    const closedTrades = tradesData.filter(t => t.exit_price && t.profit_loss)

    const winning = closedTrades.filter(t => t.profit_loss > 0)
    const losing = closedTrades.filter(t => t.profit_loss < 0)

    const totalPL = closedTrades.reduce((sum, t) => sum + (parseFloat(t.profit_loss) || 0), 0)
    const winRate = closedTrades.length > 0
      ? (winning.length / closedTrades.length) * 100
      : 0

    const avgWin = winning.length > 0
      ? winning.reduce((sum, t) => sum + parseFloat(t.profit_loss), 0) / winning.length
      : 0

    const avgLoss = losing.length > 0
      ? losing.reduce((sum, t) => sum + parseFloat(t.profit_loss), 0) / losing.length
      : 0

    setStats({
      totalTrades: tradesData.length,
      winningTrades: winning.length,
      losingTrades: losing.length,
      totalPL,
      winRate,
      avgWin,
      avgLoss
    })
  }

  // Custom notification modal
  const showNotificationModal = (message, type = 'success') => {
    setNotificationMessage(message)
    setNotificationType(type)
    setShowNotification(true)
  }

  // Custom confirmation modal
  const showConfirmationModal = (message, action) => {
    setConfirmationMessage(message)
    setConfirmationAction(() => action)
    setShowConfirmation(true)
  }

  const handleAddTrade = async (tradeData) => {
    try {
      // Check tier limits
      if (userTier === 'free' && trades.length >= 50) {
        showNotificationModal('⚠️ FREE tier chỉ lưu được 50 trades. Nâng cấp để unlimited!', 'warning')
        return
      }

      // Generate UUID for id (temporary fix until DB migration)
      const tradeId = crypto.randomUUID()

      const { error } = await supabase
        .from('trading_journal')
        .insert([{
          id: tradeId,
          user_id: user.id,
          ...tradeData
        }])

      if (error) throw error

      showNotificationModal('✅ Đã thêm trade!', 'success')
      setShowAddModal(false)
      fetchTrades()
    } catch (error) {
      console.error('Error adding trade:', error)
      showNotificationModal('❌ Lỗi khi thêm trade: ' + error.message, 'error')
    }
  }

  const handleEditTrade = async (tradeData) => {
    try {
      const { error } = await supabase
        .from('trading_journal')
        .update(tradeData)
        .eq('id', editingTrade.id)
        .eq('user_id', user.id)

      if (error) throw error

      showNotificationModal('✅ Đã cập nhật trade!', 'success')
      setShowEditModal(false)
      setEditingTrade(null)
      fetchTrades()
    } catch (error) {
      console.error('Error updating trade:', error)
      showNotificationModal('❌ Lỗi khi cập nhật: ' + error.message, 'error')
    }
  }

  const handleDeleteTrade = (tradeId) => {
    showConfirmationModal(
      'Bạn có chắc muốn xóa trade này?\n\nBạn sẽ không thể khôi phục lại.',
      async () => {
        try {
          const { error } = await supabase
            .from('trading_journal')
            .delete()
            .eq('id', tradeId)
            .eq('user_id', user.id)

          if (error) throw error

          showNotificationModal('✅ Đã xóa trade!', 'success')
          fetchTrades()
        } catch (error) {
          console.error('Error deleting trade:', error)
          showNotificationModal('❌ Lỗi khi xóa: ' + error.message, 'error')
        }
      }
    )
  }

  const handleExportCSV = () => {
    if (trades.length === 0) {
      showNotificationModal('⚠️ Không có trades để export', 'warning')
      return
    }

    // Prepare CSV data
    const headers = ['Date', 'Symbol', 'Type', 'Entry', 'Exit', 'Quantity', 'P&L', 'P&L %', 'Pattern', 'Notes']

    const rows = trades.map(t => [
      new Date(t.entry_at).toLocaleDateString('vi-VN'),
      t.symbol,
      t.position_type?.toUpperCase(),
      t.entry_price,
      t.exit_price || 'Open',
      t.quantity,
      t.profit_loss || 'Open',
      t.profit_loss_percent ? `${parseFloat(t.profit_loss_percent).toFixed(2)}%` : 'Open',
      t.pattern_used || '-',
      t.notes || '-'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `trading_journal_${new Date().toISOString().split('T')[0]}.csv`
    link.click()

    showNotificationModal('✅ Đã export CSV thành công!', 'success')
  }

  if (loading) {
    return (
      <div className="journal-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải journal...</p>
      </div>
    )
  }

  return (
    <div className="trading-journal">
      <div className="journal-header">
        <div className="journal-title">
          <h2 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '36px',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFBD59 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 60px rgba(255, 189, 89, 0.4)',
            marginBottom: '8px'
          }}>
            📊 Trading Journal
          </h2>
          <span className="tier-badge">{userTier.toUpperCase()}</span>
        </div>

        <div className="journal-actions">
          <button
            className="btn btn-outline"
            onClick={handleExportCSV}
            disabled={trades.length === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(17, 34, 80, 0.4)',
              border: '1px solid rgba(255, 189, 89, 0.3)',
              borderRadius: '8px',
              color: '#FFBD59',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              cursor: trades.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: 'none',
              opacity: trades.length === 0 ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (trades.length > 0) {
                e.currentTarget.style.background = 'rgba(17, 34, 80, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(255, 189, 89, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (trades.length > 0) {
                e.currentTarget.style.background = 'rgba(17, 34, 80, 0.4)';
                e.currentTarget.style.borderColor = 'rgba(255, 189, 89, 0.3)';
              }
            }}
          >
            📥 Export CSV
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #9C0612 0%, #6B0F1A 100%)',
              border: '2px solid #FFBD59',
              borderRadius: '50px',
              color: '#FFFFFF',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(156, 6, 18, 0.3)',
              visibility: 'visible',
              opacity: 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(156, 6, 18, 0.4), 0 0 20px rgba(255, 189, 89, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(156, 6, 18, 0.3)';
            }}
          >
            ✨ Thêm Trade
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="journal-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-card" style={{
          background: 'linear-gradient(180deg, rgba(74, 26, 79, 0.35) 0%, rgba(107, 15, 26, 0.25) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 189, 89, 0.22)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 0 18px rgba(255, 189, 89, 0.18)',
          transition: 'all 0.3s ease',
          textAlign: 'center',
          minHeight: '140px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '12px'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.borderColor = 'rgba(255, 189, 89, 0.4)';
          e.currentTarget.style.boxShadow = '0 0 28px rgba(255, 189, 89, 0.3)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(255, 189, 89, 0.22)';
          e.currentTarget.style.boxShadow = '0 0 18px rgba(255, 189, 89, 0.18)';
        }}>
          <div className="stat-label" style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Total Trades</div>
          <div className="stat-value" style={{ fontSize: '48px', fontWeight: 900, color: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>{stats.totalTrades}</div>
          {userTier === 'free' && (
            <div className="stat-limit" style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>{stats.totalTrades}/50</div>
          )}
        </div>

        <div className="stat-card win" style={{
          background: 'linear-gradient(180deg, rgba(0, 255, 136, 0.15) 0%, rgba(74, 26, 79, 0.25) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 0 18px rgba(0, 255, 136, 0.18)',
          transition: 'all 0.3s ease',
          textAlign: 'center',
          minHeight: '140px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '12px'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.5)';
          e.currentTarget.style.boxShadow = '0 0 28px rgba(0, 255, 136, 0.3)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.3)';
          e.currentTarget.style.boxShadow = '0 0 18px rgba(0, 255, 136, 0.18)';
        }}>
          <div className="stat-label" style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Win Rate</div>
          <div className="stat-value" style={{ fontSize: '48px', fontWeight: 900, color: '#00FF88', fontFamily: 'Poppins, sans-serif' }}>{stats.winRate.toFixed(1)}%</div>
          <div className="stat-detail" style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>
            {stats.winningTrades}W / {stats.losingTrades}L
          </div>
        </div>

        <div className="stat-card pl" style={{
          background: 'linear-gradient(180deg, rgba(74, 26, 79, 0.35) 0%, rgba(107, 15, 26, 0.25) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 189, 89, 0.22)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 0 18px rgba(255, 189, 89, 0.18)',
          transition: 'all 0.3s ease',
          textAlign: 'center',
          minHeight: '140px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '12px'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.borderColor = 'rgba(255, 189, 89, 0.4)';
          e.currentTarget.style.boxShadow = '0 0 28px rgba(255, 189, 89, 0.3)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(255, 189, 89, 0.22)';
          e.currentTarget.style.boxShadow = '0 0 18px rgba(255, 189, 89, 0.18)';
        }}>
          <div className="stat-label" style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Total P&L</div>
          <div className={`stat-value ${stats.totalPL >= 0 ? 'positive' : 'negative'}`} style={{ fontSize: '48px', fontWeight: 900, color: stats.totalPL >= 0 ? '#00FF88' : '#FF4757', fontFamily: 'Poppins, sans-serif' }}>
            ${stats.totalPL.toFixed(2)}
          </div>
        </div>

        <div className="stat-card" style={{
          background: 'linear-gradient(180deg, rgba(74, 26, 79, 0.35) 0%, rgba(107, 15, 26, 0.25) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 189, 89, 0.22)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 0 18px rgba(255, 189, 89, 0.18)',
          transition: 'all 0.3s ease',
          textAlign: 'center',
          minHeight: '140px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '12px'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.borderColor = 'rgba(255, 189, 89, 0.4)';
          e.currentTarget.style.boxShadow = '0 0 28px rgba(255, 189, 89, 0.3)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(255, 189, 89, 0.22)';
          e.currentTarget.style.boxShadow = '0 0 18px rgba(255, 189, 89, 0.18)';
        }}>
          <div className="stat-label" style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Avg Win / Loss</div>
          <div className="stat-value small" style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'Poppins, sans-serif' }}>
            <span className="positive" style={{ color: '#00FF88' }}>${stats.avgWin.toFixed(2)}</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '24px', margin: '0 4px' }}>/</span>
            <span className="negative" style={{ color: '#FF4757' }}>${Math.abs(stats.avgLoss).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      {trades.length === 0 ? (
        <div className="journal-empty">
          <span className="empty-icon">📝</span>
          <h3>Chưa có trades nào</h3>
          <p>Thêm trade đầu tiên để bắt đầu tracking!</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #9C0612 0%, #6B0F1A 100%)',
              border: '2px solid #FFBD59',
              borderRadius: '50px',
              color: '#FFFFFF',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(156, 6, 18, 0.3)',
              visibility: 'visible',
              opacity: 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(156, 6, 18, 0.4), 0 0 20px rgba(255, 189, 89, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(156, 6, 18, 0.3)';
            }}
          >
            ✨ Thêm Trade Đầu Tiên
          </button>
        </div>
      ) : (
        <div className="trades-table-container">
          <table className="trades-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Symbol</th>
                <th>Type</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>Qty</th>
                <th>P&L</th>
                <th>P&L %</th>
                <th>Pattern</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trades.map(trade => (
                <tr key={trade.id} className={trade.exit_price ? 'closed' : 'open'}>
                  <td>{new Date(trade.entry_at).toLocaleDateString('vi-VN')}</td>
                  <td className="symbol">{trade.symbol}</td>
                  <td>
                    <span className={`type-badge ${trade.position_type}`}>
                      {trade.position_type?.toUpperCase()}
                    </span>
                  </td>
                  <td>${parseFloat(trade.entry_price).toFixed(2)}</td>
                  <td>
                    {trade.exit_price
                      ? `$${parseFloat(trade.exit_price).toFixed(2)}`
                      : <span className="open-badge">OPEN</span>
                    }
                  </td>
                  <td>{parseFloat(trade.quantity)}</td>
                  <td>
                    {trade.profit_loss
                      ? (
                        <span className={parseFloat(trade.profit_loss) >= 0 ? 'pl-positive' : 'pl-negative'}>
                          ${parseFloat(trade.profit_loss).toFixed(2)}
                        </span>
                      )
                      : <span className="open-badge">-</span>
                    }
                  </td>
                  <td>
                    {trade.profit_loss_percent
                      ? (
                        <span className={parseFloat(trade.profit_loss_percent) >= 0 ? 'pl-positive' : 'pl-negative'}>
                          {parseFloat(trade.profit_loss_percent).toFixed(2)}%
                        </span>
                      )
                      : <span className="open-badge">-</span>
                    }
                  </td>
                  <td>
                    {trade.pattern_used && (
                      <span className="pattern-badge">{trade.pattern_used}</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => {
                          setEditingTrade(trade)
                          setShowEditModal(true)
                        }}
                        title="Sửa trade"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteTrade(trade.id)}
                        title="Xóa trade"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tier Limit Warning */}
      {userTier === 'free' && trades.length >= 45 && (
        <div className="tier-warning">
          ⚠️ Bạn đã dùng {trades.length}/50 trades. <a href="#upgrade">Nâng cấp</a> để unlimited!
        </div>
      )}

      {/* Add Trade Modal */}
      {showAddModal && (
        <AddTradeModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddTrade}
        />
      )}

      {/* Edit Trade Modal */}
      {showEditModal && editingTrade && (
        <AddTradeModal
          onClose={() => {
            setShowEditModal(false)
            setEditingTrade(null)
          }}
          onSubmit={handleEditTrade}
          initialData={editingTrade}
          isEdit={true}
        />
      )}

      {/* Notification Modal */}
      {showNotification && (
        <div className="notification-modal-overlay" onClick={() => setShowNotification(false)}>
          <div className={`notification-modal ${notificationType}`} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowNotification(false)}>✕</button>
            <div className="notification-icon">
              {notificationType === 'success' && '✅'}
              {notificationType === 'error' && '❌'}
              {notificationType === 'warning' && '⚠️'}
            </div>
            <p className="notification-message">{notificationMessage}</p>
            <button className="notification-ok-btn" onClick={() => setShowNotification(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="notification-modal-overlay" onClick={() => setShowConfirmation(false)}>
          <div className="notification-modal warning" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowConfirmation(false)}>✕</button>
            <div className="notification-icon">⚠️</div>
            <p className="notification-message">{confirmationMessage}</p>
            <div className="confirmation-buttons">
              <button className="confirmation-cancel-btn" onClick={() => setShowConfirmation(false)}>
                Hủy
              </button>
              <button
                className="confirmation-confirm-btn"
                onClick={() => {
                  setShowConfirmation(false)
                  confirmationAction && confirmationAction()
                }}
              >
                Xác Nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
