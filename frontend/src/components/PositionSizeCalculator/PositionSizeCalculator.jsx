import React, { useState } from 'react'
import { Calculator, TrendingUp, TrendingDown, DollarSign, Target, BarChart3 } from 'lucide-react'
import './PositionSizeCalculator.css'

/**
 * Position Size Calculator - TIER 1 Tool
 * Simplified calculator focusing on position sizing for specific target price
 */
export default function PositionSizeCalculator() {
  const [formData, setFormData] = useState({
    accountSize: '',
    riskPercent: '2',
    entryPrice: '',
    targetPrice: '',
    positionType: 'LONG'
  })

  const [results, setResults] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const calculatePosition = () => {
    const account = parseFloat(formData.accountSize)
    const risk = parseFloat(formData.riskPercent)
    const entry = parseFloat(formData.entryPrice)
    const target = parseFloat(formData.targetPrice)

    if (!account || !entry || !target) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    // Calculate based on position type
    let priceMove, riskReward
    if (formData.positionType === 'LONG') {
      if (target <= entry) {
        alert('LONG: Target phải cao hơn Entry!')
        return
      }
      priceMove = target - entry
    } else {
      if (target >= entry) {
        alert('SHORT: Target phải thấp hơn Entry!')
        return
      }
      priceMove = entry - target
    }

    // Calculate position size
    const riskAmount = (account * risk) / 100
    const positionValue = account // Simple: use full account balance
    const positionSize = positionValue / entry
    const potentialProfit = positionSize * priceMove
    riskReward = potentialProfit / riskAmount

    setResults({
      positionSize: positionSize.toFixed(4),
      positionValue: positionValue.toFixed(2),
      potentialProfit: potentialProfit.toFixed(2),
      riskReward: riskReward.toFixed(2),
      riskAmount: riskAmount.toFixed(2),
      priceMove: priceMove.toFixed(2),
      movePercent: ((priceMove / entry) * 100).toFixed(2)
    })
  }

  return (
    <div className="position-size-calculator">
      <div className="calculator-container">
        <div className="calculator-header">
          <h2>
            <BarChart3 size={24} /> Position Size Calculator
          </h2>
          <p>Tính toán vị thế dựa trên mục tiêu giá</p>
        </div>

        <div className="calculator-form">
          <div className="form-group">
            <label>Account Size (USDT)</label>
            <input
              type="number"
              name="accountSize"
              value={formData.accountSize}
              onChange={handleInputChange}
              placeholder="10000"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Risk Per Trade (%)</label>
            <input
              type="number"
              name="riskPercent"
              value={formData.riskPercent}
              onChange={handleInputChange}
              placeholder="2"
              step="0.1"
              min="0.1"
              max="10"
            />
            <small>Khuyến nghị: 1-2%</small>
          </div>

          <div className="form-group">
            <label>Position Type</label>
            <div className="position-type-buttons">
              <button
                type="button"
                className={`type-btn ${formData.positionType === 'LONG' ? 'active long' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, positionType: 'LONG' }))}
              >
                <TrendingUp size={16} /> LONG
              </button>
              <button
                type="button"
                className={`type-btn ${formData.positionType === 'SHORT' ? 'active short' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, positionType: 'SHORT' }))}
              >
                <TrendingDown size={16} /> SHORT
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Entry Price</label>
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
              <label>Target Price (Take Profit)</label>
              <input
                type="number"
                name="targetPrice"
                value={formData.targetPrice}
                onChange={handleInputChange}
                placeholder="55000"
                step="0.01"
              />
            </div>
          </div>

          <button
            type="button"
            className="btn-calculate"
            onClick={calculatePosition}
          >
            <Calculator size={16} /> Tính Toán
          </button>
        </div>

        {results && (
          <div className="calculation-results">
            <h3>Kết Quả</h3>

            <div className="results-grid">
              <div className="result-card primary">
                <div className="result-icon">
                  <BarChart3 size={24} />
                </div>
                <div className="result-label">Position Size</div>
                <div className="result-value">{results.positionSize}</div>
                <div className="result-unit">units</div>
              </div>

              <div className="result-card">
                <div className="result-icon">
                  <DollarSign size={24} />
                </div>
                <div className="result-label">Position Value</div>
                <div className="result-value">${results.positionValue}</div>
              </div>

              <div className="result-card positive">
                <div className="result-icon">
                  <Target size={24} />
                </div>
                <div className="result-label">Potential Profit</div>
                <div className="result-value profit">${results.potentialProfit}</div>
              </div>

              <div className="result-card highlight">
                <div className="result-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="result-label">Risk/Reward Ratio</div>
                <div className="result-value">1:{results.riskReward}</div>
              </div>

              <div className="result-card">
                <div className="result-label">Price Move</div>
                <div className="result-value">${results.priceMove}</div>
                <div className="result-percent">({results.movePercent}%)</div>
              </div>

              <div className="result-card">
                <div className="result-label">Risk Amount</div>
                <div className="result-value negative">${results.riskAmount}</div>
              </div>
            </div>

            <div className="results-summary">
              <p>
                <strong>Tóm tắt:</strong> Với tài khoản ${formData.accountSize},
                bạn nên {formData.positionType === 'LONG' ? 'mua' : 'bán'} {results.positionSize} đơn vị
                tại giá ${formData.entryPrice}. Mục tiêu ${formData.targetPrice} sẽ cho lợi nhuận ${results.potentialProfit}
                với R:R là 1:{results.riskReward}.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
