/**
 * newsApi.js
 *
 * Service for crypto news and events calendar
 *
 * Event categories:
 * - HALVING: Bitcoin/crypto halvings
 * - CONFERENCE: Crypto conferences and summits
 * - UPGRADE: Protocol upgrades and hard forks
 * - ECONOMIC: Macroeconomic events (Fed, CPI, etc.)
 * - EARNINGS: Company earnings reports
 * - LISTING: Exchange listings
 * - AIRDROP: Token airdrops
 * - OTHER: Other events
 *
 * Impact levels: high, medium, low
 */

/**
 * Get all upcoming events
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} Events array
 */
export async function getUpcomingEvents(filters = {}) {
  try {
    let events = getMockEvents();

    // Apply filters
    if (filters.category) {
      events = events.filter(e => e.category === filters.category);
    }

    if (filters.impact) {
      events = events.filter(e => e.impact === filters.impact);
    }

    if (filters.startDate) {
      events = events.filter(e => new Date(e.date) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      events = events.filter(e => new Date(e.date) <= new Date(filters.endDate));
    }

    // Sort by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      data: events,
      error: null
    };

  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      data: [],
      error: error.message
    };
  }
}

/**
 * Get events for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Promise<Object>} Events array
 */
export async function getEventsForMonth(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return getUpcomingEvents({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });
}

/**
 * Get events grouped by date
 * @returns {Promise<Object>} Events grouped by date
 */
export async function getGroupedEvents() {
  try {
    const { data: events } = await getUpcomingEvents();

    const grouped = events.reduce((acc, event) => {
      const dateKey = new Date(event.date).toISOString().split('T')[0];

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }

      acc[dateKey].push(event);

      return acc;
    }, {});

    return {
      data: grouped,
      error: null
    };

  } catch (error) {
    console.error('Error grouping events:', error);
    return {
      data: {},
      error: error.message
    };
  }
}

/**
 * Get high-impact events only
 * @returns {Promise<Object>} High-impact events
 */
export async function getHighImpactEvents() {
  return getUpcomingEvents({ impact: 'high' });
}

/**
 * Search events by keyword
 * @param {string} keyword - Search keyword
 * @returns {Promise<Object>} Matching events
 */
export async function searchEvents(keyword) {
  try {
    let events = getMockEvents();

    const searchTerm = keyword.toLowerCase();

    events = events.filter(event =>
      event.title.toLowerCase().includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm) ||
      event.coin?.toLowerCase().includes(searchTerm)
    );

    return {
      data: events,
      error: null
    };

  } catch (error) {
    console.error('Error searching events:', error);
    return {
      data: [],
      error: error.message
    };
  }
}

// ==================== MOCK EVENT DATA ====================

function getMockEvents() {
  const now = new Date();

  return [
    // THIS WEEK
    {
      id: 1,
      title: 'Bitcoin Halving 2028',
      description: 'Fourth Bitcoin halving event. Block reward reduces from 3.125 to 1.5625 BTC',
      date: new Date(2028, 3, 20).toISOString(),
      category: 'HALVING',
      impact: 'high',
      coin: 'BTC',
      source: 'Bitcoin Protocol'
    },
    {
      id: 2,
      title: 'Federal Reserve FOMC Meeting',
      description: 'Fed interest rate decision and economic projections release',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).toISOString(),
      category: 'ECONOMIC',
      impact: 'high',
      coin: null,
      source: 'US Federal Reserve'
    },
    {
      id: 3,
      title: 'Ethereum Dencun Upgrade',
      description: 'Major Ethereum upgrade introducing EIP-4844 (proto-danksharding)',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5).toISOString(),
      category: 'UPGRADE',
      impact: 'high',
      coin: 'ETH',
      source: 'Ethereum Foundation'
    },

    // NEXT WEEK
    {
      id: 4,
      title: 'Consensus 2025 Conference',
      description: 'Annual crypto conference by CoinDesk in Austin, Texas',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 8).toISOString(),
      category: 'CONFERENCE',
      impact: 'medium',
      coin: null,
      source: 'CoinDesk'
    },
    {
      id: 5,
      title: 'Solana Token Unlock',
      description: '14M SOL tokens to be unlocked (valued at ~$1.5B)',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10).toISOString(),
      category: 'OTHER',
      impact: 'medium',
      coin: 'SOL',
      source: 'Token Unlocks'
    },
    {
      id: 6,
      title: 'US CPI Data Release',
      description: 'Consumer Price Index report - inflation indicator',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 12).toISOString(),
      category: 'ECONOMIC',
      impact: 'high',
      coin: null,
      source: 'US Bureau of Labor Statistics'
    },

    // THIS MONTH
    {
      id: 7,
      title: 'Coinbase Q1 Earnings Report',
      description: 'Quarterly earnings report for major crypto exchange',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15).toISOString(),
      category: 'EARNINGS',
      impact: 'medium',
      coin: 'COIN',
      source: 'Coinbase'
    },
    {
      id: 8,
      title: 'Arbitrum Airdrop Round 2',
      description: 'Second round of ARB token airdrop to eligible wallets',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 18).toISOString(),
      category: 'AIRDROP',
      impact: 'medium',
      coin: 'ARB',
      source: 'Arbitrum Foundation'
    },
    {
      id: 9,
      title: 'Cardano Chang Hard Fork',
      description: 'Major Cardano upgrade introducing on-chain governance',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 22).toISOString(),
      category: 'UPGRADE',
      impact: 'high',
      coin: 'ADA',
      source: 'IOHK'
    },
    {
      id: 10,
      title: 'Kraken Listing: Pepe Coin',
      description: 'Major exchange listing for PEPE token',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 25).toISOString(),
      category: 'LISTING',
      impact: 'low',
      coin: 'PEPE',
      source: 'Kraken'
    },

    // NEXT MONTH
    {
      id: 11,
      title: 'Bitcoin Conference Miami 2025',
      description: 'Largest Bitcoin conference in the world',
      date: new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString(),
      category: 'CONFERENCE',
      impact: 'medium',
      coin: 'BTC',
      source: 'Bitcoin Magazine'
    },
    {
      id: 12,
      title: 'Polygon zkEVM Mainnet Launch',
      description: 'Official mainnet launch of Polygon zkEVM scaling solution',
      date: new Date(now.getFullYear(), now.getMonth() + 1, 20).toISOString(),
      category: 'UPGRADE',
      impact: 'high',
      coin: 'MATIC',
      source: 'Polygon Labs'
    },
    {
      id: 13,
      title: 'ECB Interest Rate Decision',
      description: 'European Central Bank monetary policy announcement',
      date: new Date(now.getFullYear(), now.getMonth() + 1, 10).toISOString(),
      category: 'ECONOMIC',
      impact: 'high',
      coin: null,
      source: 'European Central Bank'
    },
    {
      id: 14,
      title: 'Binance Listing: New Gaming Tokens',
      description: 'Multiple gaming token listings announced',
      date: new Date(now.getFullYear(), now.getMonth() + 1, 5).toISOString(),
      category: 'LISTING',
      impact: 'low',
      coin: null,
      source: 'Binance'
    },
    {
      id: 15,
      title: 'Uniswap V4 Launch',
      description: 'Next generation of Uniswap decentralized exchange',
      date: new Date(now.getFullYear(), now.getMonth() + 1, 25).toISOString(),
      category: 'UPGRADE',
      impact: 'high',
      coin: 'UNI',
      source: 'Uniswap Labs'
    },

    // FUTURE EVENTS
    {
      id: 16,
      title: 'MicroStrategy Bitcoin Purchase Announcement',
      description: 'Expected quarterly BTC acquisition announcement',
      date: new Date(now.getFullYear(), now.getMonth() + 2, 1).toISOString(),
      category: 'OTHER',
      impact: 'medium',
      coin: 'BTC',
      source: 'MicroStrategy'
    },
    {
      id: 17,
      title: 'NFT Paris Conference',
      description: 'Europe\'s largest NFT and Web3 event',
      date: new Date(now.getFullYear(), now.getMonth() + 2, 12).toISOString(),
      category: 'CONFERENCE',
      impact: 'low',
      coin: null,
      source: 'NFT Paris'
    },
    {
      id: 18,
      title: 'Bitcoin ETF Options Trading Launch',
      description: 'Options trading begins for spot Bitcoin ETFs',
      date: new Date(now.getFullYear(), now.getMonth() + 2, 20).toISOString(),
      category: 'OTHER',
      impact: 'high',
      coin: 'BTC',
      source: 'CBOE'
    },
    {
      id: 19,
      title: 'Litecoin Halving 2027',
      description: 'Third Litecoin halving event reducing block reward',
      date: new Date(2027, 7, 6).toISOString(),
      category: 'HALVING',
      impact: 'high',
      coin: 'LTC',
      source: 'Litecoin Protocol'
    },
    {
      id: 20,
      title: 'US Presidential Election',
      description: 'Potential impact on crypto regulation and policy',
      date: new Date(now.getFullYear(), 10, 5).toISOString(),
      category: 'ECONOMIC',
      impact: 'high',
      coin: null,
      source: 'US Government'
    }
  ];
}

/**
 * Get event categories with metadata
 * @returns {Object} Categories configuration
 */
export function getEventCategories() {
  return {
    HALVING: { label: 'Halving', icon: '⛏️', color: '#f59e0b' },
    CONFERENCE: { label: 'Conference', icon: '🎤', color: '#8b5cf6' },
    UPGRADE: { label: 'Upgrade', icon: '⚡', color: '#3b82f6' },
    ECONOMIC: { label: 'Economic', icon: '📊', color: '#ef4444' },
    EARNINGS: { label: 'Earnings', icon: '💼', color: '#10b981' },
    LISTING: { label: 'Listing', icon: '📈', color: '#06b6d4' },
    AIRDROP: { label: 'Airdrop', icon: '🎁', color: '#ec4899' },
    OTHER: { label: 'Other', icon: '📌', color: '#94a3b8' }
  };
}

/**
 * Get impact level metadata
 * @returns {Object} Impact levels configuration
 */
export function getImpactLevels() {
  return {
    high: { label: 'High Impact', color: '#ef4444', icon: '🔴' },
    medium: { label: 'Medium Impact', color: '#f59e0b', icon: '🟡' },
    low: { label: 'Low Impact', color: '#10b981', icon: '🟢' }
  };
}
