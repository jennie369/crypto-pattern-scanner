/**
 * 💎 COIN SERVICE - BINANCE FUTURES INTEGRATION
 * Fetches all available coins from Binance Futures API
 * Implements caching and tier-based access control
 */

const BINANCE_FUTURES_API = 'https://fapi.binance.com/fapi/v1/exchangeInfo';
const CACHE_KEY = 'gem_binance_coins';
const CACHE_EXPIRY_KEY = 'gem_binance_coins_expiry';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Tier Configuration
 * FREE: 20 top coins (by volume)
 * TIER2: 100 top coins
 * TIER3: All 300+ coins
 */
export const TIER_LIMITS = {
  FREE: 20,
  TIER2: 100,
  TIER3: Infinity, // All coins
};

/**
 * Fetch all coins from Binance Futures API
 * @returns {Promise<Array>} Array of coin objects
 */
export const fetchBinanceCoins = async () => {
  try {
    // Check cache first
    const cachedCoins = getCachedCoins();
    if (cachedCoins) {
      console.log('✅ Using cached Binance coins');
      return cachedCoins;
    }

    console.log('🔄 Fetching fresh data from Binance API...');

    const response = await fetch(BINANCE_FUTURES_API);

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();

    // Filter for USDT pairs only and active trading status
    const usdtPairs = data.symbols
      .filter(symbol =>
        symbol.quoteAsset === 'USDT' &&
        symbol.status === 'TRADING' &&
        symbol.contractType === 'PERPETUAL'
      )
      .map(symbol => ({
        symbol: symbol.symbol.replace('USDT', ''), // BTC, ETH, etc.
        fullSymbol: symbol.symbol, // BTCUSDT, ETHUSDT, etc.
        baseAsset: symbol.baseAsset,
        quoteAsset: symbol.quoteAsset,
        pricePrecision: symbol.pricePrecision,
        quantityPrecision: symbol.quantityPrecision,
      }));

    console.log(`✅ Fetched ${usdtPairs.length} coins from Binance`);

    // Cache the results
    setCachedCoins(usdtPairs);

    return usdtPairs;
  } catch (error) {
    console.error('❌ Error fetching Binance coins:', error);

    // Fallback to cached data even if expired
    const expiredCache = localStorage.getItem(CACHE_KEY);
    if (expiredCache) {
      console.warn('⚠️ Using expired cache as fallback');
      return JSON.parse(expiredCache);
    }

    // Ultimate fallback to hardcoded top 20
    return getFallbackCoins();
  }
};

/**
 * Get coins with tier-based filtering
 * @param {string} userTier - User's subscription tier (FREE, TIER2, TIER3)
 * @param {Array} allCoins - All available coins
 * @returns {Array} Filtered coins based on tier
 */
export const getCoinsForTier = (userTier = 'FREE', allCoins = []) => {
  const limit = TIER_LIMITS[userTier] || TIER_LIMITS.FREE;

  if (limit === Infinity) {
    return allCoins;
  }

  // Return top N coins (assuming they're already sorted by volume/popularity)
  return allCoins.slice(0, limit);
};

/**
 * Fetch real-time prices for coins
 * @param {Array} coins - Array of coin symbols
 * @returns {Promise<Object>} Object with symbol as key and price data as value
 */
export const fetchCoinPrices = async (coins) => {
  try {
    const response = await fetch('https://fapi.binance.com/fapi/v1/ticker/24hr');

    if (!response.ok) {
      throw new Error(`Binance price API error: ${response.status}`);
    }

    const data = await response.json();

    const priceMap = {};

    data.forEach(ticker => {
      const symbol = ticker.symbol.replace('USDT', '');
      if (coins.includes(symbol)) {
        priceMap[symbol] = {
          price: parseFloat(ticker.lastPrice),
          change24h: parseFloat(ticker.priceChangePercent),
          volume24h: parseFloat(ticker.quoteVolume),
          high24h: parseFloat(ticker.highPrice),
          low24h: parseFloat(ticker.lowPrice),
        };
      }
    });

    return priceMap;
  } catch (error) {
    console.error('❌ Error fetching coin prices:', error);
    return {};
  }
};

/**
 * Search coins by name or symbol
 * @param {Array} coins - Array of coins to search
 * @param {string} query - Search query
 * @returns {Array} Filtered coins
 */
export const searchCoins = (coins, query) => {
  if (!query || query.trim() === '') {
    return coins;
  }

  const lowerQuery = query.toLowerCase().trim();

  return coins.filter(coin =>
    coin.symbol.toLowerCase().includes(lowerQuery) ||
    coin.baseAsset.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Sort coins by various criteria
 * @param {Array} coins - Array of coins
 * @param {Object} priceData - Price data object
 * @param {string} sortBy - Sort criteria (volume, change, price, alphabetical)
 * @returns {Array} Sorted coins
 */
export const sortCoins = (coins, priceData, sortBy = 'volume') => {
  const sorted = [...coins];

  switch (sortBy) {
    case 'volume':
      return sorted.sort((a, b) => {
        const volA = priceData[a.symbol]?.volume24h || 0;
        const volB = priceData[b.symbol]?.volume24h || 0;
        return volB - volA;
      });

    case 'change':
      return sorted.sort((a, b) => {
        const changeA = Math.abs(priceData[a.symbol]?.change24h || 0);
        const changeB = Math.abs(priceData[b.symbol]?.change24h || 0);
        return changeB - changeA;
      });

    case 'price':
      return sorted.sort((a, b) => {
        const priceA = priceData[a.symbol]?.price || 0;
        const priceB = priceData[b.symbol]?.price || 0;
        return priceB - priceA;
      });

    case 'alphabetical':
      return sorted.sort((a, b) => a.symbol.localeCompare(b.symbol));

    case 'gainers':
      return sorted
        .filter(coin => (priceData[coin.symbol]?.change24h || 0) > 0)
        .sort((a, b) => {
          const changeA = priceData[a.symbol]?.change24h || 0;
          const changeB = priceData[b.symbol]?.change24h || 0;
          return changeB - changeA;
        });

    case 'losers':
      return sorted
        .filter(coin => (priceData[coin.symbol]?.change24h || 0) < 0)
        .sort((a, b) => {
          const changeA = priceData[a.symbol]?.change24h || 0;
          const changeB = priceData[b.symbol]?.change24h || 0;
          return changeA - changeB;
        });

    default:
      return sorted;
  }
};

/**
 * Filter coins by category
 * @param {Array} coins - Array of coins
 * @param {string} category - Category filter
 * @returns {Array} Filtered coins
 */
export const filterByCategory = (coins, category) => {
  if (category === 'all') {
    return coins;
  }

  const categories = {
    defi: ['UNI', 'AAVE', 'COMP', 'MKR', 'SNX', 'CRV', 'SUSHI', 'YFI', 'BAL', 'REN'],
    layer1: ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'AVAX', 'ATOM', 'NEAR', 'FTM', 'ALGO'],
    layer2: ['MATIC', 'OP', 'ARB', 'IMX', 'LRC', 'METIS'],
    meme: ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK'],
    gaming: ['AXS', 'SAND', 'MANA', 'ENJ', 'GALA', 'ILV', 'GMT'],
    ai: ['FET', 'AGIX', 'RNDR', 'OCEAN', 'GRT'],
  };

  const categoryCoins = categories[category] || [];

  return coins.filter(coin => categoryCoins.includes(coin.symbol));
};

/**
 * Get cached coins from localStorage
 * @returns {Array|null} Cached coins or null if expired/not found
 */
const getCachedCoins = () => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const expiryTime = localStorage.getItem(CACHE_EXPIRY_KEY);

    if (!cachedData || !expiryTime) {
      return null;
    }

    const now = Date.now();
    if (now > parseInt(expiryTime, 10)) {
      console.log('⏰ Cache expired, will fetch fresh data');
      return null;
    }

    return JSON.parse(cachedData);
  } catch (error) {
    console.error('❌ Error reading cache:', error);
    return null;
  }
};

/**
 * Save coins to localStorage cache
 * @param {Array} coins - Coins to cache
 */
const setCachedCoins = (coins) => {
  try {
    const expiryTime = Date.now() + CACHE_DURATION;
    localStorage.setItem(CACHE_KEY, JSON.stringify(coins));
    localStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString());
    console.log('💾 Cached coins for 1 hour');
  } catch (error) {
    console.error('❌ Error setting cache:', error);
  }
};

/**
 * Clear coin cache
 */
export const clearCoinCache = () => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_EXPIRY_KEY);
  console.log('🗑️ Coin cache cleared');
};

/**
 * Fallback hardcoded top 20 coins
 * Used when API is unavailable
 */
const getFallbackCoins = () => {
  console.warn('⚠️ Using fallback hardcoded coins');
  return [
    { symbol: 'BTC', fullSymbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT' },
    { symbol: 'ETH', fullSymbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT' },
    { symbol: 'BNB', fullSymbol: 'BNBUSDT', baseAsset: 'BNB', quoteAsset: 'USDT' },
    { symbol: 'SOL', fullSymbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT' },
    { symbol: 'XRP', fullSymbol: 'XRPUSDT', baseAsset: 'XRP', quoteAsset: 'USDT' },
    { symbol: 'ADA', fullSymbol: 'ADAUSDT', baseAsset: 'ADA', quoteAsset: 'USDT' },
    { symbol: 'DOGE', fullSymbol: 'DOGEUSDT', baseAsset: 'DOGE', quoteAsset: 'USDT' },
    { symbol: 'AVAX', fullSymbol: 'AVAXUSDT', baseAsset: 'AVAX', quoteAsset: 'USDT' },
    { symbol: 'DOT', fullSymbol: 'DOTUSDT', baseAsset: 'DOT', quoteAsset: 'USDT' },
    { symbol: 'MATIC', fullSymbol: 'MATICUSDT', baseAsset: 'MATIC', quoteAsset: 'USDT' },
    { symbol: 'LINK', fullSymbol: 'LINKUSDT', baseAsset: 'LINK', quoteAsset: 'USDT' },
    { symbol: 'UNI', fullSymbol: 'UNIUSDT', baseAsset: 'UNI', quoteAsset: 'USDT' },
    { symbol: 'ATOM', fullSymbol: 'ATOMUSDT', baseAsset: 'ATOM', quoteAsset: 'USDT' },
    { symbol: 'LTC', fullSymbol: 'LTCUSDT', baseAsset: 'LTC', quoteAsset: 'USDT' },
    { symbol: 'NEAR', fullSymbol: 'NEARUSDT', baseAsset: 'NEAR', quoteAsset: 'USDT' },
    { symbol: 'FTM', fullSymbol: 'FTMUSDT', baseAsset: 'FTM', quoteAsset: 'USDT' },
    { symbol: 'SAND', fullSymbol: 'SANDUSDT', baseAsset: 'SAND', quoteAsset: 'USDT' },
    { symbol: 'MANA', fullSymbol: 'MANAUSDT', baseAsset: 'MANA', quoteAsset: 'USDT' },
    { symbol: 'AAVE', fullSymbol: 'AAVEUSDT', baseAsset: 'AAVE', quoteAsset: 'USDT' },
    { symbol: 'GRT', fullSymbol: 'GRTUSDT', baseAsset: 'GRT', quoteAsset: 'USDT' },
  ];
};

export default {
  fetchBinanceCoins,
  getCoinsForTier,
  fetchCoinPrices,
  searchCoins,
  sortCoins,
  filterByCategory,
  clearCoinCache,
  TIER_LIMITS,
};
