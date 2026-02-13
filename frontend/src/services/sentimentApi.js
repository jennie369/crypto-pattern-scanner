/**
 * sentimentApi.js
 *
 * Service for fetching crypto market sentiment data
 *
 * Data sources:
 * - Alternative.me Crypto Fear & Greed Index
 * - CoinGecko Trending Coins
 * - Mock sentiment analysis data
 *
 * Functions:
 * - getFearGreedIndex() - Current market sentiment (0-100)
 * - getFearGreedHistory() - Historical sentiment data (30 days)
 * - getTrendingCoins() - Top trending coins by search volume
 * - getMarketOverview() - Overall market stats
 * - getSentimentNews() - Sentiment-driving news articles
 */

// Alternative.me Fear & Greed Index API
const FEAR_GREED_API = 'https://api.alternative.me/fng/';

// CoinGecko API
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

/**
 * Get current Fear & Greed Index
 * @returns {Promise<Object>} Current sentiment data
 */
export async function getFearGreedIndex() {
  try {
    const response = await fetch(`${FEAR_GREED_API}?limit=1`);

    if (!response.ok) {
      throw new Error('Failed to fetch Fear & Greed Index');
    }

    const result = await response.json();

    if (result.data && result.data.length > 0) {
      const data = result.data[0];

      return {
        data: {
          value: parseInt(data.value),
          classification: data.value_classification,
          timestamp: new Date(parseInt(data.timestamp) * 1000).toISOString(),
          timeUntilUpdate: data.time_until_update
        },
        error: null
      };
    }

    throw new Error('No data received');

  } catch (error) {
    console.error('Error fetching Fear & Greed Index:', error);

    // Return mock data on error
    return {
      data: getMockFearGreedIndex(),
      error: error.message
    };
  }
}

/**
 * Get Fear & Greed Index history (last 30 days)
 * @returns {Promise<Object>} Historical sentiment data
 */
export async function getFearGreedHistory() {
  try {
    const response = await fetch(`${FEAR_GREED_API}?limit=30`);

    if (!response.ok) {
      throw new Error('Failed to fetch Fear & Greed history');
    }

    const result = await response.json();

    if (result.data && result.data.length > 0) {
      const history = result.data.map(item => ({
        value: parseInt(item.value),
        classification: item.value_classification,
        timestamp: new Date(parseInt(item.timestamp) * 1000).toISOString()
      }));

      return {
        data: history,
        error: null
      };
    }

    throw new Error('No data received');

  } catch (error) {
    console.error('Error fetching Fear & Greed history:', error);

    // Return mock data on error
    return {
      data: getMockFearGreedHistory(),
      error: error.message
    };
  }
}

/**
 * Get trending coins from CoinGecko
 * @returns {Promise<Object>} Top trending coins
 */
export async function getTrendingCoins() {
  try {
    const response = await fetch(`${COINGECKO_API}/search/trending`);

    if (!response.ok) {
      throw new Error('Failed to fetch trending coins');
    }

    const result = await response.json();

    if (result.coins && result.coins.length > 0) {
      const trending = result.coins.slice(0, 10).map(item => ({
        id: item.item.id,
        symbol: item.item.symbol.toUpperCase(),
        name: item.item.name,
        rank: item.item.market_cap_rank || 0,
        price_btc: item.item.price_btc || 0,
        thumb: item.item.thumb,
        score: item.item.score || 0
      }));

      return {
        data: trending,
        error: null
      };
    }

    throw new Error('No data received');

  } catch (error) {
    console.error('Error fetching trending coins:', error);

    // Return mock data on error
    return {
      data: getMockTrendingCoins(),
      error: error.message
    };
  }
}

/**
 * Get market overview stats
 * @returns {Promise<Object>} Market statistics
 */
export async function getMarketOverview() {
  try {
    const response = await fetch(`${COINGECKO_API}/global`);

    if (!response.ok) {
      throw new Error('Failed to fetch market overview');
    }

    const result = await response.json();

    if (result.data) {
      const data = result.data;

      return {
        data: {
          totalMarketCap: data.total_market_cap?.usd || 0,
          totalVolume: data.total_volume?.usd || 0,
          btcDominance: data.market_cap_percentage?.btc || 0,
          ethDominance: data.market_cap_percentage?.eth || 0,
          marketCapChange24h: data.market_cap_change_percentage_24h_usd || 0,
          activeCryptocurrencies: data.active_cryptocurrencies || 0,
          markets: data.markets || 0
        },
        error: null
      };
    }

    throw new Error('No data received');

  } catch (error) {
    console.error('Error fetching market overview:', error);

    // Return mock data on error
    return {
      data: getMockMarketOverview(),
      error: error.message
    };
  }
}

/**
 * Get sentiment-driving news articles (mock data)
 * @returns {Promise<Object>} News articles array
 */
export async function getSentimentNews() {
  // Mock news data for demonstration
  return {
    data: getMockSentimentNews(),
    error: null
  };
}

/**
 * Analyze overall market sentiment based on multiple indicators
 * @returns {Promise<Object>} Comprehensive sentiment analysis
 */
export async function getComprehensiveSentiment() {
  try {
    const [fgIndex, trending, market] = await Promise.all([
      getFearGreedIndex(),
      getTrendingCoins(),
      getMarketOverview()
    ]);

    // Calculate composite sentiment score
    const fgValue = fgIndex.data?.value || 50;
    const marketChange = market.data?.marketCapChange24h || 0;

    // Weighted sentiment calculation
    const compositeSentiment = (fgValue * 0.6) + ((marketChange + 10) * 2.5);
    const sentimentScore = Math.max(0, Math.min(100, compositeSentiment));

    // Determine sentiment classification
    let classification = 'Neutral';
    if (sentimentScore >= 75) classification = 'Extreme Greed';
    else if (sentimentScore >= 55) classification = 'Greed';
    else if (sentimentScore >= 45) classification = 'Neutral';
    else if (sentimentScore >= 25) classification = 'Fear';
    else classification = 'Extreme Fear';

    // Trading recommendation
    let recommendation = 'HOLD - Market is balanced';
    if (sentimentScore >= 75) {
      recommendation = '⚠️ Consider SELLING - Extreme greed, potential reversal';
    } else if (sentimentScore >= 60) {
      recommendation = '📊 MONITOR - High greed, be cautious with new positions';
    } else if (sentimentScore <= 25) {
      recommendation = '✅ Consider BUYING - Extreme fear, potential opportunity';
    } else if (sentimentScore <= 40) {
      recommendation = '👀 WATCH - Fear present, look for RETEST entries';
    }

    return {
      data: {
        score: Math.round(sentimentScore),
        classification,
        recommendation,
        fearGreed: fgIndex.data,
        marketStats: market.data,
        trendingCoins: trending.data?.slice(0, 5) || []
      },
      error: null
    };

  } catch (error) {
    console.error('Error getting comprehensive sentiment:', error);

    return {
      data: null,
      error: error.message
    };
  }
}

// ==================== MOCK DATA FUNCTIONS ====================

function getMockFearGreedIndex() {
  const value = Math.floor(Math.random() * 100);
  let classification = 'Neutral';

  if (value >= 75) classification = 'Extreme Greed';
  else if (value >= 55) classification = 'Greed';
  else if (value >= 45) classification = 'Neutral';
  else if (value >= 25) classification = 'Fear';
  else classification = 'Extreme Fear';

  return {
    value,
    classification,
    timestamp: new Date().toISOString(),
    timeUntilUpdate: null
  };
}

function getMockFearGreedHistory() {
  const history = [];
  const now = Date.now();

  for (let i = 0; i < 30; i++) {
    const value = 40 + Math.floor(Math.random() * 40); // 40-80 range
    let classification = 'Neutral';

    if (value >= 75) classification = 'Extreme Greed';
    else if (value >= 55) classification = 'Greed';
    else if (value >= 45) classification = 'Neutral';
    else if (value >= 25) classification = 'Fear';
    else classification = 'Extreme Fear';

    history.push({
      value,
      classification,
      timestamp: new Date(now - (i * 24 * 60 * 60 * 1000)).toISOString()
    });
  }

  return history.reverse();
}

function getMockTrendingCoins() {
  return [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', rank: 1, price_btc: 1.0, thumb: '', score: 10 },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', rank: 2, price_btc: 0.053, thumb: '', score: 9 },
    { id: 'solana', symbol: 'SOL', name: 'Solana', rank: 5, price_btc: 0.0024, thumb: '', score: 8 },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', rank: 8, price_btc: 0.000015, thumb: '', score: 7 },
    { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', rank: 12, price_btc: 0.00018, thumb: '', score: 6 },
    { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', rank: 14, price_btc: 0.00032, thumb: '', score: 5 },
    { id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', rank: 10, price_btc: 0.00078, thumb: '', score: 4 },
    { id: 'polygon', symbol: 'MATIC', name: 'Polygon', rank: 13, price_btc: 0.000021, thumb: '', score: 3 },
    { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', rank: 16, price_btc: 0.00019, thumb: '', score: 2 },
    { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', rank: 15, price_btc: 0.0019, thumb: '', score: 1 }
  ];
}

function getMockMarketOverview() {
  return {
    totalMarketCap: 2100000000000, // $2.1T
    totalVolume: 95000000000, // $95B
    btcDominance: 48.5,
    ethDominance: 18.2,
    marketCapChange24h: 2.3,
    activeCryptocurrencies: 11500,
    markets: 850
  };
}

function getMockSentimentNews() {
  return [
    {
      id: 1,
      title: 'Bitcoin ETF Approval Drives Market Rally',
      sentiment: 'positive',
      impact: 'high',
      source: 'CoinDesk',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      summary: 'Major institutional investment expected following SEC approval'
    },
    {
      id: 2,
      title: 'Fed Signals Potential Rate Cuts in 2025',
      sentiment: 'positive',
      impact: 'high',
      source: 'Bloomberg',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      summary: 'Lower interest rates historically bullish for crypto markets'
    },
    {
      id: 3,
      title: 'Ethereum L2 Solutions See Record Adoption',
      sentiment: 'positive',
      impact: 'medium',
      source: 'The Block',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      summary: 'Scaling solutions driving increased network usage'
    },
    {
      id: 4,
      title: 'Regulatory Concerns in Asia Pacific Region',
      sentiment: 'negative',
      impact: 'medium',
      source: 'Reuters',
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      summary: 'New regulations could impact crypto trading in several countries'
    },
    {
      id: 5,
      title: 'DeFi TVL Reaches New All-Time High',
      sentiment: 'positive',
      impact: 'medium',
      source: 'DeFi Llama',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      summary: 'Total value locked in DeFi protocols exceeds $150B'
    }
  ];
}
