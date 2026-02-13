import React, { createContext, useContext, useState, useEffect } from 'react'
import { binanceService } from '../services/binanceService'
import { useAuth } from './AuthContext'

const PriceContext = createContext({})

export const usePrice = () => useContext(PriceContext)

// FREE Tier: 10 coins
const FREE_TIER_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'MATICUSDT',
  'AVAXUSDT',
  'DOTUSDT'
]

// TIER 1+: 20 coins (FREE + 10 more)
const TIER1_SYMBOLS = [
  ...FREE_TIER_SYMBOLS,
  'LINKUSDT',
  'LTCUSDT',
  'UNIUSDT',
  'ATOMUSDT',
  'FILUSDT',
  'ETCUSDT',
  'XLMUSDT',
  'ALGOUSDT',
  'VETUSDT',
  'ICPUSDT'
]

export const PriceProvider = ({ children }) => {
  const { user, profile } = useAuth()
  const [prices, setPrices] = useState({})
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)

  // Get symbols based on user tier
  const getSymbols = () => {
    if (!user || !profile) {
      return FREE_TIER_SYMBOLS // Default to FREE tier if not logged in
    }

    // Check user tier from profile
    const userTier = profile.tier || 'free'

    // TIER 1+ gets 20 coins
    if (userTier === 'tier1' || userTier === 'tier2' || userTier === 'tier3' || userTier === 'admin') {
      console.log(`📊 PriceProvider: Using TIER 1+ symbols (${TIER1_SYMBOLS.length} coins)`)
      return TIER1_SYMBOLS
    }

    // FREE tier gets 10 coins
    console.log(`📊 PriceProvider: Using FREE tier symbols (${FREE_TIER_SYMBOLS.length} coins)`)
    return FREE_TIER_SYMBOLS
  }

  useEffect(() => {
    const symbols = getSymbols()
    console.log(`🚀 PriceProvider: Initializing Binance WebSocket connection for ${symbols.length} coins`)

    // Connect to Binance WebSocket
    try {
      binanceService.connect(symbols)
      setConnected(true)

      // Subscribe to all symbols
      const unsubscribers = symbols.map(symbol => {
        return binanceService.subscribe(symbol, (priceData) => {
          setPrices(prev => ({
            ...prev,
            [symbol]: priceData
          }))
        })
      })

      // Cleanup on unmount
      return () => {
        console.log('🧹 PriceProvider: Cleaning up WebSocket connections')
        unsubscribers.forEach(unsub => unsub())
        binanceService.disconnect()
        setConnected(false)
      }
    } catch (err) {
      console.error('❌ Error connecting to Binance:', err)
      setError(err.message)
      setConnected(false)
    }
  }, [user, profile]) // Re-connect when user/profile changes

  const value = {
    prices,
    connected,
    error,
    symbols: getSymbols()
  }

  return (
    <PriceContext.Provider value={value}>
      {children}
    </PriceContext.Provider>
  )
}
