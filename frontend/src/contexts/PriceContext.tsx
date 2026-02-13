import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { binanceService } from '../services/binanceService';
import { useAuth } from './AuthContext';

/** Price data from WebSocket */
interface PriceData {
  symbol: string;
  price: number;
  priceChange?: number;
  priceChangePercent?: number;
  high24h?: number;
  low24h?: number;
  volume24h?: number;
}

/** Price context value interface */
interface PriceContextValue {
  prices: Record<string, PriceData>;
  connected: boolean;
  error: string | null;
  symbols: string[];
}

const PriceContext = createContext<PriceContextValue>({} as PriceContextValue);

export const usePrice = (): PriceContextValue => useContext(PriceContext);

// FREE Tier: 10 coins
const FREE_TIER_SYMBOLS: string[] = [
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
];

// TIER 1+: 20 coins (FREE + 10 more)
const TIER1_SYMBOLS: string[] = [
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
];

interface PriceProviderProps {
  children: ReactNode;
}

export const PriceProvider: React.FC<PriceProviderProps> = ({ children }) => {
  const { user, profile } = useAuth();
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get symbols based on user tier
  const getSymbols = (): string[] => {
    if (!user || !profile) {
      return FREE_TIER_SYMBOLS;
    }

    const userTier = profile.tier ?? 'free';

    if (userTier === 'tier1' || userTier === 'tier2' || userTier === 'tier3' ||
        userTier === 'TIER1' || userTier === 'TIER2' || userTier === 'TIER3' ||
        profile.role === 'admin') {
      console.log(`PriceProvider: Using TIER 1+ symbols (${TIER1_SYMBOLS.length} coins)`);
      return TIER1_SYMBOLS;
    }

    console.log(`PriceProvider: Using FREE tier symbols (${FREE_TIER_SYMBOLS.length} coins)`);
    return FREE_TIER_SYMBOLS;
  };

  useEffect(() => {
    const symbols = getSymbols();
    console.log(`PriceProvider: Initializing Binance WebSocket connection for ${symbols.length} coins`);

    try {
      binanceService.connect(symbols);
      setConnected(true);

      // Subscribe to all symbols
      const unsubscribers = symbols.map(symbol => {
        return binanceService.subscribe(symbol, (priceData: PriceData) => {
          setPrices(prev => ({
            ...prev,
            [symbol]: priceData
          }));
        });
      });

      // Cleanup on unmount
      return () => {
        console.log('PriceProvider: Cleaning up WebSocket connections');
        unsubscribers.forEach(unsub => unsub());
        binanceService.disconnect();
        setConnected(false);
      };
    } catch (err) {
      console.error('Error connecting to Binance:', err);
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMessage);
      setConnected(false);
    }
  }, [user, profile]);

  const value: PriceContextValue = {
    prices,
    connected,
    error,
    symbols: getSymbols()
  };

  return (
    <PriceContext.Provider value={value}>
      {children}
    </PriceContext.Provider>
  );
};
