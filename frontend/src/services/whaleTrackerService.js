/**
 * Whale Tracker Service
 * Track large cryptocurrency transactions using FREE APIs
 *
 * Data Sources:
 * - Etherscan API (FREE tier: 5 calls/second)
 * - Blockchain.info API (FREE, no key required)
 *
 * Limitations:
 * - ETH only from Etherscan
 * - BTC only from Blockchain.info
 * - No real-time alerts (manual refresh)
 * - Limited to public data
 */

import { supabase } from '../lib/supabaseClient';

// Free API keys - you can get your own at etherscan.io/apis
const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY || 'YourFreeEtherscanKey';

class WhaleTrackerService {
  constructor() {
    this.etherscanUrl = 'https://api.etherscan.io/api';
    this.blockchainInfoUrl = 'https://blockchain.info';

    // Known exchange addresses for classification
    this.exchangeAddresses = {
      // Binance
      '0x28c6c06298d514db089934071355e5743bf21d60': 'Binance 14',
      '0x21a31ee1afc51d94c2efccaa2092ad1028285549': 'Binance 15',
      '0xdfd5293d8e347dfe59e90efd55b2956a1343963d': 'Binance 16',

      // Coinbase
      '0x71660c4005ba85c37ccec55d0c4493e66fe775d3': 'Coinbase 1',
      '0x503828976d22510aad0201ac7ec88293211d23da': 'Coinbase 2',

      // Kraken
      '0x2910543af39aba0cd09dbb2d50200b3e800a63d2': 'Kraken 1',
      '0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13': 'Kraken 2',

      // Huobi
      '0x18916e1a2933cb349145a280473a5de8eb6630cb': 'Huobi 1',

      // Bitfinex
      '0x1151314c646ce4e0efd76d1af4760ae66a9fe30f': 'Bitfinex 1',
      '0x876eabf441b2ee5b5b0554fd502a8e0600950cfa': 'Bitfinex 2'
    };
  }

  /**
   * Fetch recent large ETH transactions
   * Uses Etherscan API (FREE tier)
   */
  async fetchEthTransactions(minAmountUsd = 500000) {
    try {
      console.log('🔍 Fetching ETH whale transactions...');

      // Get ETH price first
      const ethPrice = await this.getEthPrice();

      // Calculate minimum ETH amount
      const minEthAmount = minAmountUsd / ethPrice;

      // Fetch recent blocks (Etherscan FREE API)
      const blockResponse = await fetch(
        `${this.etherscanUrl}?module=proxy&action=eth_blockNumber&apikey=${ETHERSCAN_API_KEY}`
      );

      const blockData = await blockResponse.json();
      const latestBlock = parseInt(blockData.result, 16);

      console.log(`Latest block: ${latestBlock}`);

      // Fetch transactions from recent blocks
      // Note: This is limited with FREE API, just demo data
      const transactions = await this.scanRecentBlocks(latestBlock, minEthAmount, ethPrice);

      // Save to database
      if (transactions.length > 0) {
        await this.saveTransactions(transactions);
      }

      return transactions;

    } catch (error) {
      console.error('Error fetching ETH transactions:', error);
      return [];
    }
  }

  /**
   * Scan recent blocks for large transactions
   */
  async scanRecentBlocks(latestBlock, minEthAmount, ethPrice) {
    const transactions = [];
    const blocksToScan = 10; // Scan last 10 blocks

    for (let i = 0; i < blocksToScan; i++) {
      const blockNumber = latestBlock - i;

      try {
        // Get block transactions
        const response = await fetch(
          `${this.etherscanUrl}?module=proxy&action=eth_getBlockByNumber&tag=0x${blockNumber.toString(16)}&boolean=true&apikey=${ETHERSCAN_API_KEY}`
        );

        const data = await response.json();

        if (data.result && data.result.transactions) {
          for (const tx of data.result.transactions) {
            const ethAmount = parseInt(tx.value, 16) / 1e18;

            if (ethAmount >= minEthAmount) {
              // Large transaction found!
              const transaction = {
                tx_hash: tx.hash,
                blockchain: 'ETH',
                from_address: tx.from.toLowerCase(),
                to_address: tx.to ? tx.to.toLowerCase() : 'Contract Creation',
                from_label: this.getAddressLabel(tx.from.toLowerCase()),
                to_label: tx.to ? this.getAddressLabel(tx.to.toLowerCase()) : 'Contract',
                amount: ethAmount,
                amount_usd: ethAmount * ethPrice,
                symbol: 'ETH',
                transaction_type: this.classifyTransaction(tx.from.toLowerCase(), tx.to ? tx.to.toLowerCase() : ''),
                market_impact: this.calculateMarketImpact(ethAmount * ethPrice),
                block_timestamp: new Date(parseInt(tx.timestamp || Date.now() / 1000) * 1000),
                block_number: blockNumber
              };

              transactions.push(transaction);
            }
          }
        }

        // Rate limiting (FREE tier: 5 calls/second)
        await this.delay(200);

      } catch (error) {
        console.error(`Error scanning block ${blockNumber}:`, error);
      }
    }

    return transactions;
  }

  /**
   * Get ETH price
   */
  async getEthPrice() {
    try {
      const response = await fetch(
        `${this.etherscanUrl}?module=stats&action=ethprice&apikey=${ETHERSCAN_API_KEY}`
      );

      const data = await response.json();
      return parseFloat(data.result.ethusd);
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      return 3000; // Fallback price
    }
  }

  /**
   * Get BTC price
   */
  async getBtcPrice() {
    try {
      const response = await fetch('https://blockchain.info/ticker');
      const data = await response.json();
      return data.USD.last;
    } catch (error) {
      console.error('Error fetching BTC price:', error);
      return 45000; // Fallback price
    }
  }

  /**
   * Fetch recent large BTC transactions
   * Uses Blockchain.info API (FREE, no key)
   */
  async fetchBtcTransactions(minAmountUsd = 500000) {
    try {
      console.log('🔍 Fetching BTC whale transactions...');

      // Get BTC price
      const btcPrice = await this.getBtcPrice();

      // Calculate minimum BTC amount
      const minBtcAmount = minAmountUsd / btcPrice;

      // Fetch latest blocks (FREE API)
      const response = await fetch('https://blockchain.info/latestblock');
      const latestBlock = await response.json();

      console.log(`Latest BTC block: ${latestBlock.height}`);

      // Fetch recent transactions
      const txResponse = await fetch('https://blockchain.info/unconfirmed-transactions?format=json');
      const txData = await txResponse.json();

      const transactions = [];

      for (const tx of txData.txs.slice(0, 50)) { // Last 50 unconfirmed
        const btcAmount = tx.out.reduce((sum, output) => sum + output.value, 0) / 1e8;

        if (btcAmount >= minBtcAmount) {
          const transaction = {
            tx_hash: tx.hash,
            blockchain: 'BTC',
            from_address: tx.inputs[0]?.prev_out?.addr || 'Unknown',
            to_address: tx.out[0]?.addr || 'Unknown',
            from_label: 'Unknown',
            to_label: 'Unknown',
            amount: btcAmount,
            amount_usd: btcAmount * btcPrice,
            symbol: 'BTC',
            transaction_type: 'transfer',
            market_impact: this.calculateMarketImpact(btcAmount * btcPrice),
            block_timestamp: new Date(tx.time * 1000),
            block_number: tx.block_height || null
          };

          transactions.push(transaction);
        }
      }

      // Save to database
      if (transactions.length > 0) {
        await this.saveTransactions(transactions);
      }

      return transactions;

    } catch (error) {
      console.error('Error fetching BTC transactions:', error);
      return [];
    }
  }

  /**
   * Get address label (exchange or unknown)
   */
  getAddressLabel(address) {
    return this.exchangeAddresses[address.toLowerCase()] || 'Unknown';
  }

  /**
   * Classify transaction type
   */
  classifyTransaction(fromAddress, toAddress) {
    const fromLabel = this.getAddressLabel(fromAddress);
    const toLabel = this.getAddressLabel(toAddress);

    if (fromLabel !== 'Unknown' && toLabel === 'Unknown') {
      return 'withdrawal'; // From exchange to unknown
    } else if (fromLabel === 'Unknown' && toLabel !== 'Unknown') {
      return 'deposit'; // From unknown to exchange
    } else if (fromLabel !== 'Unknown' && toLabel !== 'Unknown') {
      return 'transfer'; // Between exchanges
    } else {
      return 'transfer'; // Between unknowns
    }
  }

  /**
   * Calculate market impact
   */
  calculateMarketImpact(amountUsd) {
    if (amountUsd >= 10000000) return 'HIGH'; // $10M+
    if (amountUsd >= 5000000) return 'MEDIUM'; // $5M+
    return 'LOW';
  }

  /**
   * Save transactions to database
   */
  async saveTransactions(transactions) {
    try {
      const { error } = await supabase
        .from('whale_transactions')
        .upsert(transactions, { onConflict: 'tx_hash' });

      if (error) {
        console.error('Error saving transactions:', error);
      } else {
        console.log(`✅ Saved ${transactions.length} whale transactions`);
      }
    } catch (error) {
      console.error('Error in saveTransactions:', error);
    }
  }

  /**
   * Get recent whale transactions from database
   */
  async getRecentTransactions(filters = {}) {
    try {
      let query = supabase
        .from('whale_transactions')
        .select('*')
        .order('block_timestamp', { ascending: false })
        .limit(50);

      // Apply filters
      if (filters.symbol && filters.symbol !== 'ALL') {
        query = query.eq('symbol', filters.symbol);
      }

      if (filters.type && filters.type !== 'ALL') {
        query = query.eq('transaction_type', filters.type);
      }

      if (filters.minAmount) {
        query = query.gte('amount_usd', filters.minAmount);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  /**
   * Get top whale wallets from database
   */
  async getTopWhales(limit = 100) {
    try {
      const { data, error } = await supabase
        .from('whale_wallets')
        .select('*')
        .order('balance_usd', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('Error fetching whale wallets:', error);
      return [];
    }
  }

  /**
   * Get exchange flow summary (mock data for FREE tier)
   */
  async getExchangeFlows() {
    // Note: This would require paid API (CryptoQuant/Glassnode)
    // Returning mock data for UI demonstration

    return [
      {
        exchange: 'Binance',
        symbol: 'BTC',
        inflow_24h: 1250.5,
        outflow_24h: 890.3,
        netflow_24h: -360.2
      },
      {
        exchange: 'Binance',
        symbol: 'ETH',
        inflow_24h: 15000,
        outflow_24h: 18500,
        netflow_24h: 3500
      },
      {
        exchange: 'Coinbase',
        symbol: 'BTC',
        inflow_24h: 800.2,
        outflow_24h: 1100.5,
        netflow_24h: 300.3
      },
      {
        exchange: 'Coinbase',
        symbol: 'ETH',
        inflow_24h: 10000,
        outflow_24h: 8500,
        netflow_24h: -1500
      }
    ];
  }

  /**
   * Check user alerts
   */
  async checkWhaleAlerts(userId) {
    try {
      // Get user alert settings
      const { data: alertSettings } = await supabase
        .from('whale_alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (!alertSettings) {
        return [];
      }

      // Get recent transactions matching criteria
      const { data: recentTxs } = await supabase
        .from('whale_transactions')
        .select('*')
        .gte('amount_usd', alertSettings.min_amount_usd)
        .in('symbol', alertSettings.symbols)
        .in('transaction_type', alertSettings.transaction_types)
        .gte('block_timestamp', new Date(Date.now() - 3600000)) // Last 1 hour
        .order('block_timestamp', { ascending: false });

      return recentTxs || [];

    } catch (error) {
      console.error('Error checking whale alerts:', error);
      return [];
    }
  }

  /**
   * Helper: delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const whaleTrackerService = new WhaleTrackerService();
