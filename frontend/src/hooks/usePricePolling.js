/**
 * Price Polling Hook
 * Fetch real-time prices from Binance and update portfolio
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Fetch current prices from Binance for multiple symbols
 * @param {Array<string>} symbols - Array of trading pairs (e.g., ['BTCUSDT', 'ETHUSDT'])
 * @returns {Object} - { symbol: price }
 */
async function fetchBinancePrices(symbols) {
  if (!symbols || symbols.length === 0) return {};

  try {
    // Use Futures API (fapi.binance.com) for better CORS support
    const response = await fetch('https://fapi.binance.com/fapi/v1/ticker/price');
    const allPrices = await response.json();

    // Filter only the symbols we need
    const priceMap = {};
    symbols.forEach(symbol => {
      const ticker = allPrices.find(t => t.symbol === symbol);
      if (ticker) {
        priceMap[symbol] = parseFloat(ticker.price);
      }
    });

    return priceMap;
  } catch (error) {
    console.error('Error fetching Binance Futures prices, trying spot API:', error);
    // Fallback to spot API
    try {
      const spotResponse = await fetch('https://api.binance.com/api/v3/ticker/price');
      const spotPrices = await spotResponse.json();
      const priceMap = {};
      symbols.forEach(symbol => {
        const ticker = spotPrices.find(t => t.symbol === symbol);
        if (ticker) {
          priceMap[symbol] = parseFloat(ticker.price);
        }
      });
      return priceMap;
    } catch (spotError) {
      console.error('Error fetching spot prices:', spotError);
      return {};
    }
  }
}

/**
 * Hook to poll prices at regular intervals
 * @param {Array} holdings - Portfolio holdings with symbols
 * @param {Function} onPriceUpdate - Callback when prices are updated
 * @param {number} interval - Polling interval in ms (default: 30000 = 30s)
 */
export function usePricePolling(holdings = [], onPriceUpdate, interval = 30000) {
  const [prices, setPrices] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef(null);

  // Extract unique symbols from holdings
  const symbols = holdings
    .map(h => h.symbol?.replace('/', '')) // Convert BTC/USDT to BTCUSDT
    .filter(Boolean);

  // Fetch prices
  const fetchPrices = useCallback(async () => {
    if (symbols.length === 0) return;

    try {
      setIsPolling(true);
      const newPrices = await fetchBinancePrices(symbols);

      if (Object.keys(newPrices).length > 0) {
        setPrices(newPrices);
        setLastUpdate(new Date());

        // Call callback with price updates
        if (onPriceUpdate) {
          // Transform to format: { symbol: 'BTC/USDT', price: 42000 }
          const priceUpdates = Object.entries(newPrices).map(([symbol, price]) => ({
            symbol: symbol.replace('USDT', '/USDT'), // Convert BTCUSDT back to BTC/USDT
            price,
          }));
          onPriceUpdate(priceUpdates);
        }
      }
    } catch (error) {
      console.error('Error in price polling:', error);
    } finally {
      setIsPolling(false);
    }
  }, [symbols.join(','), onPriceUpdate]);

  // Start polling
  useEffect(() => {
    // Fetch immediately on mount
    fetchPrices();

    // Set up interval
    intervalRef.current = setInterval(fetchPrices, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchPrices, interval]);

  // Manual refresh
  const refreshPrices = useCallback(() => {
    fetchPrices();
  }, [fetchPrices]);

  return {
    prices,
    lastUpdate,
    isPolling,
    refreshPrices,
  };
}
