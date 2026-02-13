import React from 'react'
import { usePrice } from '../../contexts/PriceContext'
import { XCircle, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import './PriceTicker.css'

export default function PriceTicker() {
  const { prices, connected, error, symbols } = usePrice()

  if (error) {
    return (
      <div className="price-ticker error">
        <span><XCircle size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Lỗi kết nối: {error}</span>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="price-ticker connecting">
        <span><RefreshCw size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Đang kết nối Binance...</span>
      </div>
    )
  }

  return (
    <div className="price-ticker">
      <div className="price-ticker-scroll">
        {symbols.map(symbol => {
          const priceData = prices[symbol]

          if (!priceData) {
            return (
              <div key={symbol} className="price-item loading">
                <span className="symbol">{symbol}</span>
                <span>...</span>
              </div>
            )
          }

          const isPositive = priceData.priceChangePercent >= 0

          return (
            <div key={symbol} className="price-item">
              <span className="symbol">{symbol.replace('USDT', '')}</span>
              <span className="price">${priceData.price.toLocaleString()}</span>
              <span className={`change ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? <TrendingUp size={14} style={{ verticalAlign: 'middle' }} /> : <TrendingDown size={14} style={{ verticalAlign: 'middle' }} />} {Math.abs(priceData.priceChangePercent).toFixed(2)}%
              </span>
            </div>
          )
        })}
        {/* Duplicate for seamless scroll */}
        {symbols.map(symbol => {
          const priceData = prices[symbol]

          if (!priceData) {
            return (
              <div key={`${symbol}-dup`} className="price-item loading">
                <span className="symbol">{symbol}</span>
                <span>...</span>
              </div>
            )
          }

          const isPositive = priceData.priceChangePercent >= 0

          return (
            <div key={`${symbol}-dup`} className="price-item">
              <span className="symbol">{symbol.replace('USDT', '')}</span>
              <span className="price">${priceData.price.toLocaleString()}</span>
              <span className={`change ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? <TrendingUp size={14} style={{ verticalAlign: 'middle' }} /> : <TrendingDown size={14} style={{ verticalAlign: 'middle' }} />} {Math.abs(priceData.priceChangePercent).toFixed(2)}%
              </span>
            </div>
          )
        })}
      </div>
      <div className="ticker-status">
        <span className="live-dot"></span>
        <span>LIVE</span>
      </div>
    </div>
  )
}
