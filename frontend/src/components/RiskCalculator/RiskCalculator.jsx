import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import {
  BarChart3,
  AlertTriangle,
  XCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Star,
  Gem,
  Calculator,
  Save,
  LineChart,
  Lock,
  Download,
  Trash2,
  ClipboardList,
  Lightbulb
} from 'lucide-react'
import './RiskCalculator.css'

/**
 * Enhanced RiskCalculator Component - TIER 2
 *
 * New Features:
 * - Zone-based Stop Loss calculation
 * - Multiple Take Profit targets (1:2, 1:3, 1:5 R:R)
 * - Pattern integration
 * - Advanced position sizing
 *
 * @param {Object} pattern - Optional pattern data with zone info
 */
export default function RiskCalculator({ pattern = null }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [userTier, setUserTier] = useState('free')

  // 🆕 TIER 2: Advanced Mode Toggle
  const [useZoneSL, setUseZoneSL] = useState(false)
  const [useMultipleTP, setUseMultipleTP] = useState(false)

  const [formData, setFormData] = useState({
    accountBalance: '',
    riskPercent: '1',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    positionType: 'LONG'
  })
  const [results, setResults] = useState(null)
  const [savedCalculations, setSavedCalculations] = useState([])
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationType, setNotificationType] = useState('success')

  useEffect(() => {
    if (user) {
      fetchUserTier()
    }
  }, [user])

  useEffect(() => {
    if (user && userTier !== 'free') {
      fetchSavedCalculations()
    }
  }, [user, userTier])

  // 🆕 Auto-populate from pattern data
  useEffect(() => {
    if (pattern && pattern.zone) {
      const zone = pattern.zone
      const direction = pattern.direction || 'bullish'

      setFormData(prev => ({
        ...prev,
        entryPrice: pattern.entry ? pattern.entry.toString() : zone.mid.toString(),
        positionType: direction === 'bullish' ? 'LONG' : 'SHORT'
      }))

      // Auto-enable zone SL if pattern has zone data
      if (zone.top && zone.bottom) {
        setUseZoneSL(true)
        setUseMultipleTP(true) // Enable multiple TPs for advanced analysis
      }
    }
  }, [pattern])

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

  const fetchSavedCalculations = async () => {
    try {
      const { data, error } = await supabase
        .from('risk_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setSavedCalculations(data || [])
    } catch (error) {
      console.error('Error fetching calculations:', error)
    }
  }

  const showNotificationModal = (message, type = 'success') => {
    setNotificationMessage(message)
    setNotificationType(type)
    setShowNotification(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Smart number formatting - remove trailing zeros
  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined) return null
    const fixed = parseFloat(num).toFixed(decimals)
    return parseFloat(fixed).toString()
  }

  // Format position size based on value
  const formatPositionSize = (size) => {
    if (size < 0.001) return formatNumber(size, 8)
    if (size < 1) return formatNumber(size, 6)
    if (size < 100) return formatNumber(size, 4)
    return formatNumber(size, 2)
  }

  // 🆕 Calculate Zone-based Stop Loss
  const calculateZoneSL = () => {
    if (!pattern || !pattern.zone) return null

    const zone = pattern.zone
    const entry = parseFloat(formData.entryPrice) || zone.mid

    if (formData.positionType === 'LONG') {
      // LONG: SL at zone bottom (support break)
      return zone.bottom * 0.995 // 0.5% below zone bottom
    } else {
      // SHORT: SL at zone top (resistance break)
      return zone.top * 1.005 // 0.5% above zone top
    }
  }

  const calculateRisk = () => {
    if (!formData.accountBalance || !formData.entryPrice) {
      showNotificationModal('Vui lòng điền đầy đủ thông tin!', 'warning')
      return
    }

    const balance = parseFloat(formData.accountBalance)
    const risk = parseFloat(formData.riskPercent)
    const entry = parseFloat(formData.entryPrice)

    // 🆕 Use zone SL if enabled
    let sl
    if (useZoneSL && pattern && pattern.zone) {
      sl = calculateZoneSL()
    } else {
      if (!formData.stopLoss) {
        showNotificationModal('Vui lòng điền Stop Loss!', 'warning')
        return
      }
      sl = parseFloat(formData.stopLoss)
    }

    const riskAmount = (balance * risk) / 100

    let slDistance
    if (formData.positionType === 'LONG') {
      slDistance = entry - sl
      if (slDistance <= 0) {
        showNotificationModal('LONG position: Stop Loss phải thấp hơn Entry!', 'error')
        return
      }
    } else {
      slDistance = sl - entry
      if (slDistance <= 0) {
        showNotificationModal('SHORT position: Stop Loss phải cao hơn Entry!', 'error')
        return
      }
    }

    const positionSize = riskAmount / slDistance
    const positionValue = positionSize * entry

    // 🆕 Calculate Multiple TPs (1:2, 1:3, 1:5 R:R)
    let multipleTPs = null
    if (useMultipleTP) {
      const tp1Distance = slDistance * 2  // 1:2 R:R
      const tp2Distance = slDistance * 3  // 1:3 R:R
      const tp3Distance = slDistance * 5  // 1:5 R:R

      let tp1Price, tp2Price, tp3Price
      if (formData.positionType === 'LONG') {
        tp1Price = entry + tp1Distance
        tp2Price = entry + tp2Distance
        tp3Price = entry + tp3Distance
      } else {
        tp1Price = entry - tp1Distance
        tp2Price = entry - tp2Distance
        tp3Price = entry - tp3Distance
      }

      // Position sizing strategy: 50% at TP1, 30% at TP2, 20% at TP3
      const tp1Profit = (positionSize * 0.5) * tp1Distance
      const tp2Profit = (positionSize * 0.3) * tp2Distance
      const tp3Profit = (positionSize * 0.2) * tp3Distance
      const totalProfit = tp1Profit + tp2Profit + tp3Profit

      multipleTPs = {
        tp1: {
          price: formatNumber(tp1Price, 2),
          distance: formatNumber(tp1Distance, 2),
          percent: formatNumber((tp1Distance / entry) * 100, 2),
          rr: '1:2',
          size: formatPositionSize(positionSize * 0.5),
          profit: formatNumber(tp1Profit, 2)
        },
        tp2: {
          price: formatNumber(tp2Price, 2),
          distance: formatNumber(tp2Distance, 2),
          percent: formatNumber((tp2Distance / entry) * 100, 2),
          rr: '1:3',
          size: formatPositionSize(positionSize * 0.3),
          profit: formatNumber(tp2Profit, 2)
        },
        tp3: {
          price: formatNumber(tp3Price, 2),
          distance: formatNumber(tp3Distance, 2),
          percent: formatNumber((tp3Distance / entry) * 100, 2),
          rr: '1:5',
          size: formatPositionSize(positionSize * 0.2),
          profit: formatNumber(tp3Profit, 2)
        },
        totalProfit: formatNumber(totalProfit, 2),
        avgRR: formatNumber(((2 * 0.5) + (3 * 0.3) + (5 * 0.2)), 2) // Weighted average = 2.9
      }
    }

    // Legacy single TP calculation
    let tpDistance = null
    let riskReward = null
    let potentialProfit = null

    const tp = formData.takeProfit ? parseFloat(formData.takeProfit) : null
    if (tp && !useMultipleTP) {
      if (formData.positionType === 'LONG') {
        tpDistance = tp - entry
        if (tpDistance <= 0) {
          showNotificationModal('LONG position: Take Profit phải cao hơn Entry!', 'warning')
        }
      } else {
        tpDistance = entry - tp
        if (tpDistance <= 0) {
          showNotificationModal('SHORT position: Take Profit phải thấp hơn Entry!', 'warning')
        }
      }

      if (tpDistance > 0) {
        riskReward = tpDistance / slDistance
        potentialProfit = positionSize * tpDistance
      }
    }

    const calculatedResults = {
      riskAmount: formatNumber(riskAmount, 2),
      positionSize: formatPositionSize(positionSize),
      positionValue: formatNumber(positionValue, 2),
      stopLoss: formatNumber(sl, 2),
      slDistance: formatNumber(slDistance, 2),
      slPercentage: formatNumber((slDistance / entry) * 100, 2),
      // Legacy single TP
      tpDistance: tpDistance ? formatNumber(tpDistance, 2) : null,
      riskReward: riskReward ? formatNumber(riskReward, 2) : null,
      potentialProfit: potentialProfit ? formatNumber(potentialProfit, 2) : null,
      tpPercentage: tpDistance ? formatNumber((tpDistance / entry) * 100, 2) : null,
      // 🆕 Multiple TPs
      multipleTPs,
      useZoneSL,
      useMultipleTP
    }

    setResults(calculatedResults)
  }

  const saveCalculation = async () => {
    if (userTier === 'free') {
      showNotificationModal('FREE tier không thể lưu calculations. Upgrade để unlock!', 'warning')
      return
    }

    if (!results) {
      showNotificationModal('Vui lòng tính toán trước khi lưu!', 'warning')
      return
    }

    try {
      const { error } = await supabase
        .from('risk_calculations')
        .insert([{
          user_id: user.id,
          account_balance: parseFloat(formData.accountBalance),
          risk_percent: parseFloat(formData.riskPercent),
          entry_price: parseFloat(formData.entryPrice),
          stop_loss: parseFloat(formData.stopLoss),
          take_profit: formData.takeProfit ? parseFloat(formData.takeProfit) : null,
          position_type: formData.positionType,
          position_size: parseFloat(results.positionSize),
          risk_amount: parseFloat(results.riskAmount),
          risk_reward: results.riskReward ? parseFloat(results.riskReward) : null
        }])

      if (error) throw error

      showNotificationModal('Đã lưu calculation!', 'success')
      fetchSavedCalculations()
    } catch (error) {
      console.error('Error saving calculation:', error)
      showNotificationModal('Lỗi khi lưu: ' + error.message, 'error')
    }
  }

  const handleUpgrade = () => {
    navigate('/pricing')
  }

  const deleteCalculation = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa calculation này?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('risk_calculations')
        .delete()
        .eq('id', id)

      if (error) throw error

      showNotificationModal('Đã xóa calculation!', 'success')
      fetchSavedCalculations()
    } catch (error) {
      console.error('Error deleting calculation:', error)
      showNotificationModal('Lỗi khi xóa: ' + error.message, 'error')
    }
  }

  const loadCalculation = (calc) => {
    setFormData({
      accountBalance: calc.account_balance.toString(),
      riskPercent: calc.risk_percent.toString(),
      entryPrice: calc.entry_price.toString(),
      stopLoss: calc.stop_loss.toString(),
      takeProfit: calc.take_profit ? calc.take_profit.toString() : '',
      positionType: calc.position_type
    })
    showNotificationModal('Đã load calculation!', 'success')
  }

  return (
    <div className="risk-calculator">
      <div className="calculator-container">
        <div className="calculator-header">
          <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} /> Máy Tính Rủi Ro
          </h2>
          <span className="tier-badge">{userTier.toUpperCase()}</span>
        </div>

        <div className="calculator-form">
          <div className="form-group">
            <label>Số Dư Tài Khoản (USDT)</label>
            <input
              type="number"
              name="accountBalance"
              value={formData.accountBalance}
              onChange={handleInputChange}
              placeholder="10000"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Rủi Ro Mỗi Lệnh (%)</label>
            <input
              type="number"
              name="riskPercent"
              value={formData.riskPercent}
              onChange={handleInputChange}
              placeholder="1"
              step="0.1"
              min="0.1"
              max="10"
            />
            <small className="form-hint">Khuyến nghị: 1-2%</small>
          </div>

          <div className="form-group">
            <label>Loại Lệnh</label>
            <div className="position-type-selector">
              <button
                type="button"
                className={`type-btn ${formData.positionType === 'LONG' ? 'active long' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, positionType: 'LONG' }))}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <TrendingUp size={16} /> LONG
              </button>
              <button
                type="button"
                className={`type-btn ${formData.positionType === 'SHORT' ? 'active short' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, positionType: 'SHORT' }))}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <TrendingDown size={16} /> SHORT
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Giá Vào</label>
              <input
                type="number"
                name="entryPrice"
                value={formData.entryPrice}
                onChange={handleInputChange}
                placeholder="50000"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Cắt Lỗ</label>

              {/* 🆕 Zone SL Toggle (if pattern available) */}
              {pattern && pattern.zone && (
                <div className="zone-sl-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={useZoneSL}
                      onChange={(e) => setUseZoneSL(e.target.checked)}
                    />
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <Star size={16} /> Use Zone SL (Auto)
                    </span>
                  </label>
                  {useZoneSL && (
                    <div className="zone-sl-preview">
                      SL = ${calculateZoneSL()?.toFixed(2)} (Zone {formData.positionType === 'LONG' ? 'Bottom' : 'Top'} - 0.5%)
                    </div>
                  )}
                </div>
              )}

              {!useZoneSL && (
                <input
                  type="number"
                  name="stopLoss"
                  value={formData.stopLoss}
                  onChange={handleInputChange}
                  placeholder="49000"
                  step="0.01"
                />
              )}
            </div>
          </div>

          {/* 🆕 Multiple TP Toggle */}
          <div className="form-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={useMultipleTP}
                onChange={(e) => setUseMultipleTP(e.target.checked)}
              />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Gem size={16} /> Multiple TPs (1:2, 1:3, 1:5)
              </span>
            </label>
            {useMultipleTP && (
              <small className="form-hint">Auto-calculated: 50% @ TP1, 30% @ TP2, 20% @ TP3</small>
            )}
          </div>

          {!useMultipleTP && (
            <div className="form-group">
              <label>Chốt Lời (Tùy chọn)</label>
              <input
                type="number"
                name="takeProfit"
                value={formData.takeProfit}
                onChange={handleInputChange}
                placeholder="52000"
                step="0.01"
              />
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-calculate" onClick={calculateRisk} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={16} /> Tính Toán
            </button>
            {userTier !== 'free' && results && (
              <button type="button" className="btn-save" onClick={saveCalculation} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Save size={16} /> Lưu
              </button>
            )}
          </div>
        </div>

        {results && (
          <div className="calculation-results">
            <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <LineChart size={20} /> Kết Quả
            </h3>

            <div className="results-grid">
              <div className="result-card primary">
                <div className="result-label">Khối Lượng</div>
                <div className="result-value">{results.positionSize}</div>
                <div className="result-unit">Đơn Vị</div>
              </div>

              <div className="result-card">
                <div className="result-label">Số Tiền Rủi Ro</div>
                <div className="result-value negative">${results.riskAmount}</div>
              </div>

              <div className="result-card">
                <div className="result-label">Giá Trị Vị Thế</div>
                <div className="result-value">${results.positionValue}</div>
              </div>

              <div className="result-card">
                <div className="result-label">Khoảng Cách SL</div>
                <div className="result-value">${results.slDistance}</div>
                <div className="result-percent">({results.slPercentage}%)</div>
              </div>

              {/* Show Zone SL if used */}
              {results.useZoneSL && (
                <div className="result-card highlight">
                  <div className="result-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Star size={16} /> Zone SL (Auto)
                  </div>
                  <div className="result-value">${results.stopLoss}</div>
                </div>
              )}

              {/* Legacy single TP */}
              {results.tpDistance && !results.useMultipleTP && (
                <>
                  <div className="result-card">
                    <div className="result-label">Khoảng Cách TP</div>
                    <div className="result-value">${results.tpDistance}</div>
                    <div className="result-percent">({results.tpPercentage}%)</div>
                  </div>

                  <div className="result-card highlight">
                    <div className="result-label">Tỷ Lệ R:R</div>
                    <div className="result-value">1:{results.riskReward}</div>
                  </div>

                  <div className="result-card positive">
                    <div className="result-label">Lợi Nhuận Tiềm Năng</div>
                    <div className="result-value positive">${results.potentialProfit}</div>
                  </div>
                </>
              )}
            </div>

            {/* 🆕 Multiple TPs Display */}
            {results.multipleTPs && (
              <div className="multiple-tps-section">
                <h4 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Gem size={20} /> Multiple Take Profit Targets
                </h4>

                <div className="tps-grid">
                  {/* TP1 - 1:2 R:R - 50% */}
                  <div className="tp-card tp1">
                    <div className="tp-header">
                      <span className="tp-label">TP1</span>
                      <span className="tp-rr">{results.multipleTPs.tp1.rr}</span>
                    </div>
                    <div className="tp-price">${results.multipleTPs.tp1.price}</div>
                    <div className="tp-allocation">50% @ {results.multipleTPs.tp1.size} units</div>
                    <div className="tp-profit">Profit: ${results.multipleTPs.tp1.profit}</div>
                    <div className="tp-percent">{results.multipleTPs.tp1.percent}%</div>
                  </div>

                  {/* TP2 - 1:3 R:R - 30% */}
                  <div className="tp-card tp2">
                    <div className="tp-header">
                      <span className="tp-label">TP2</span>
                      <span className="tp-rr">{results.multipleTPs.tp2.rr}</span>
                    </div>
                    <div className="tp-price">${results.multipleTPs.tp2.price}</div>
                    <div className="tp-allocation">30% @ {results.multipleTPs.tp2.size} units</div>
                    <div className="tp-profit">Profit: ${results.multipleTPs.tp2.profit}</div>
                    <div className="tp-percent">{results.multipleTPs.tp2.percent}%</div>
                  </div>

                  {/* TP3 - 1:5 R:R - 20% */}
                  <div className="tp-card tp3">
                    <div className="tp-header">
                      <span className="tp-label">TP3</span>
                      <span className="tp-rr">{results.multipleTPs.tp3.rr}</span>
                    </div>
                    <div className="tp-price">${results.multipleTPs.tp3.price}</div>
                    <div className="tp-allocation">20% @ {results.multipleTPs.tp3.size} units</div>
                    <div className="tp-profit">Profit: ${results.multipleTPs.tp3.profit}</div>
                    <div className="tp-percent">{results.multipleTPs.tp3.percent}%</div>
                  </div>
                </div>

                <div className="multiple-tps-summary">
                  <div className="summary-row">
                    <span className="summary-label">Total Potential Profit:</span>
                    <span className="summary-value profit">${results.multipleTPs.totalProfit}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Average R:R:</span>
                    <span className="summary-value">1:{results.multipleTPs.avgRR}</span>
                  </div>
                </div>

                <div className="trading-plan">
                  <h5 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardList size={20} /> Trading Plan:
                  </h5>
                  <ol>
                    <li>Close <strong>50%</strong> at TP1 (${results.multipleTPs.tp1.price}) = +${results.multipleTPs.tp1.profit}</li>
                    <li>Close <strong>30%</strong> at TP2 (${results.multipleTPs.tp2.price}) = +${results.multipleTPs.tp2.profit}</li>
                    <li>Close <strong>20%</strong> at TP3 (${results.multipleTPs.tp3.price}) = +${results.multipleTPs.tp3.profit}</li>
                    <li>Move SL to breakeven after TP1 hits</li>
                  </ol>
                </div>
              </div>
            )}

            <div className="results-summary">
              <p style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Lightbulb size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Tóm Tắt:</strong> Với tài khoản ${formData.accountBalance},
                  rủi ro {formData.riskPercent}% = ${results.riskAmount}.
                  Bạn nên mua {results.positionSize} đơn vị tại ${formData.entryPrice}.
                  {results.riskReward && ` Tỷ lệ R:R là 1:${results.riskReward}.`}
                </span>
              </p>
            </div>
          </div>
        )}

        {userTier === 'free' && (
          <div className="upgrade-prompt">
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} /> Nâng cấp lên <strong>GÓI 1</strong> để lưu tính toán!
            </p>
            <button type="button" className="btn-upgrade" onClick={handleUpgrade}>
              Nâng Cấp Ngay
            </button>
          </div>
        )}

        {/* Saved Calculations History - TIER 1+ Only */}
        {userTier !== 'free' && savedCalculations.length > 0 && (
          <div className="saved-calculations">
            <div className="saved-header">
              <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Save size={20} /> Lịch Sử Tính Toán ({savedCalculations.length})
              </h3>
              <small>10 tính toán gần nhất</small>
            </div>

            <div className="saved-list">
              {savedCalculations.map((calc) => (
                <div key={calc.id} className="saved-item">
                  <div className="saved-item-header">
                    <span className={`position-badge ${calc.position_type.toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      {calc.position_type === 'LONG' ? <TrendingUp size={16} /> : <TrendingDown size={16} />} {calc.position_type}
                    </span>
                    <span className="saved-date">
                      {new Date(calc.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="saved-item-details">
                    <div className="detail-row">
                      <span className="detail-label">Entry:</span>
                      <span className="detail-value">${calc.entry_price}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">SL:</span>
                      <span className="detail-value">${calc.stop_loss}</span>
                    </div>
                    {calc.take_profit && (
                      <div className="detail-row">
                        <span className="detail-label">TP:</span>
                        <span className="detail-value">${calc.take_profit}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">Position Size:</span>
                      <span className="detail-value highlight">{calc.position_size}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Risk:</span>
                      <span className="detail-value">${calc.risk_amount}</span>
                    </div>
                    {calc.risk_reward && (
                      <div className="detail-row">
                        <span className="detail-label">R:R:</span>
                        <span className="detail-value positive">1:{calc.risk_reward}</span>
                      </div>
                    )}
                  </div>

                  <div className="saved-item-actions">
                    <button
                      type="button"
                      className="btn-load"
                      onClick={() => loadCalculation(calc)}
                      title="Load vào form"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Download size={16} /> Load
                    </button>
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => deleteCalculation(calc.id)}
                      title="Xóa"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Trash2 size={16} /> Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notification Modal */}
      {showNotification && (
        <div className="notification-modal-overlay" onClick={() => setShowNotification(false)}>
          <div className={`notification-modal ${notificationType}`} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowNotification(false)}>✕</button>
            <div className="notification-icon">
              {notificationType === 'success' && <CheckCircle size={48} />}
              {notificationType === 'error' && <XCircle size={48} />}
              {notificationType === 'warning' && <AlertTriangle size={48} />}
            </div>
            <p className="notification-message">{notificationMessage}</p>
            <button className="notification-ok-btn" onClick={() => setShowNotification(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
