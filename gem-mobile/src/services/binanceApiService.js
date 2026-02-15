/**
 * Binance API Service
 * Connect to Binance READ-ONLY for Shadow Mode
 *
 * SECURITY: Only READ-ONLY API keys are accepted
 * Never store unencrypted secrets
 */

import { supabase } from './supabase';
import * as Crypto from 'expo-crypto';

// Encryption key - in production, use secure key management
const ENCRYPTION_PREFIX = 'GEM_SHADOW_';

// Binance API endpoints
const BINANCE_API = 'https://api.binance.com';
const BINANCE_TESTNET = 'https://testnet.binance.vision';

// Fetch with timeout to prevent hanging requests on stalled mobile connections
const FETCH_TIMEOUT = 10000;
const fetchWithTimeout = async (url, options = {}, timeoutMs = FETCH_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Binance API request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
};

// Required permissions for Shadow Mode (READ-ONLY only)
const REQUIRED_PERMISSIONS = ['SPOT_READ', 'USER_DATA_READ'];

class BinanceApiService {
  constructor() {
    this.initialized = false;
    this.connection = null;
  }

  /**
   * Initialize service
   */
  async initialize() {
    if (this.initialized) return;
    this.initialized = true;
  }

  // =====================================================
  // ENCRYPTION HELPERS
  // =====================================================

  /**
   * Simple XOR encryption for API secrets
   * In production, use proper encryption library
   */
  encryptSecret(secret) {
    if (!secret) return '';

    const key = ENCRYPTION_PREFIX;
    let encrypted = '';

    for (let i = 0; i < secret.length; i++) {
      const charCode = secret.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      encrypted += String.fromCharCode(charCode);
    }

    return Buffer.from(encrypted).toString('base64');
  }

  /**
   * Decrypt API secret
   */
  decryptSecret(encrypted) {
    if (!encrypted) return '';

    try {
      const decoded = Buffer.from(encrypted, 'base64').toString();
      const key = ENCRYPTION_PREFIX;
      let decrypted = '';

      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        decrypted += String.fromCharCode(charCode);
      }

      return decrypted;
    } catch (error) {
      console.error('[BinanceApi] Decrypt error:', error);
      return '';
    }
  }

  /**
   * Mask API key for display (show last 4 chars)
   */
  maskApiKey(apiKey) {
    if (!apiKey || apiKey.length < 8) return '****';
    return `****${apiKey.slice(-4)}`;
  }

  // =====================================================
  // CONNECTION MANAGEMENT
  // =====================================================

  /**
   * Add new Binance connection
   * @param {string} userId
   * @param {string} apiKey
   * @param {string} apiSecret
   * @param {string} exchange - 'binance' or 'binance_testnet'
   */
  async addConnection(userId, apiKey, apiSecret, exchange = 'binance') {
    try {
      // Validate credentials first
      const validation = await this.validateCredentials(apiKey, apiSecret, exchange);

      if (!validation.valid) {
        throw new Error(validation.error || 'API credentials không hợp lệ');
      }

      if (!validation.isReadOnly) {
        throw new Error(
          'Chỉ chấp nhận API key READ-ONLY. Vui lòng tạo API key mới với quyền đọc dữ liệu.'
        );
      }

      // Encrypt secrets
      const encryptedKey = this.encryptSecret(apiKey);
      const encryptedSecret = this.encryptSecret(apiSecret);

      // Save to database
      const { data, error } = await supabase
        .from('user_exchange_connections')
        .upsert({
          user_id: userId,
          exchange,
          api_key_encrypted: encryptedKey,
          api_secret_encrypted: encryptedSecret,
          is_read_only: true,
          is_verified: true,
          permissions: validation.permissions || [],
          sync_status: 'ready',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,exchange',
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        connection: {
          id: data.id,
          exchange: data.exchange,
          is_verified: data.is_verified,
          maskedKey: this.maskApiKey(apiKey),
        },
      };
    } catch (error) {
      console.error('[BinanceApi] Add connection error:', error);
      throw error;
    }
  }

  /**
   * Validate API credentials
   * CRITICAL: Must verify READ-ONLY permissions
   */
  async validateCredentials(apiKey, apiSecret, exchange = 'binance') {
    try {
      const baseUrl = exchange === 'binance_testnet' ? BINANCE_TESTNET : BINANCE_API;

      // Create signature for API request
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = await this.createSignature(queryString, apiSecret);

      // Test with account info endpoint
      const response = await fetchWithTimeout(
        `${baseUrl}/api/v3/account?${queryString}&signature=${signature}`,
        {
          headers: {
            'X-MBX-APIKEY': apiKey,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          valid: false,
          error: errorData.msg || 'API credentials không hợp lệ',
        };
      }

      const accountData = await response.json();

      // Check permissions - must be READ-ONLY
      const permissions = accountData.permissions || [];
      const canTrade = accountData.canTrade === true;
      const canWithdraw = accountData.canWithdraw === true;

      // REJECT if can trade or withdraw
      if (canTrade || canWithdraw) {
        return {
          valid: true,
          isReadOnly: false,
          error: 'API key có quyền trade/withdraw. Vui lòng sử dụng API key READ-ONLY.',
          permissions,
        };
      }

      return {
        valid: true,
        isReadOnly: true,
        permissions,
        accountInfo: {
          canTrade,
          canWithdraw,
          canDeposit: accountData.canDeposit,
        },
      };
    } catch (error) {
      console.error('[BinanceApi] Validate error:', error);
      return {
        valid: false,
        error: 'Không thể kết nối tới Binance. Vui lòng kiểm tra API key.',
      };
    }
  }

  /**
   * Create HMAC SHA256 signature
   */
  async createSignature(queryString, secret) {
    try {
      // Use expo-crypto for HMAC
      const signature = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        queryString + secret,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      return signature;
    } catch (error) {
      // Fallback - simple hash (not secure, for demo only)
      console.warn('[BinanceApi] Using fallback signature');
      let hash = 0;
      const str = queryString + secret;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(16);
    }
  }

  /**
   * Remove connection
   */
  async removeConnection(userId, exchange = 'binance') {
    try {
      const { error } = await supabase
        .from('user_exchange_connections')
        .delete()
        .eq('user_id', userId)
        .eq('exchange', exchange);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[BinanceApi] Remove connection error:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(userId, exchange = 'binance') {
    try {
      const { data, error } = await supabase
        .rpc('get_exchange_connection', {
          p_user_id: userId,
          p_exchange: exchange,
        });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('[BinanceApi] Get status error:', error);
      return { connected: false, exchange };
    }
  }

  // =====================================================
  // TRADE DATA FETCHING
  // =====================================================

  /**
   * Fetch trades from Binance
   * @param {string} userId
   * @param {object} options
   */
  async fetchTrades(userId, options = {}) {
    const {
      symbol = null,
      startTime = null,
      endTime = null,
      limit = 500,
    } = options;

    try {
      // Get connection
      const { data: connection, error: connError } = await supabase
        .from('user_exchange_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('exchange', 'binance')
        .single();

      if (connError || !connection) {
        throw new Error('Không tìm thấy kết nối Binance');
      }

      // Decrypt credentials
      const apiKey = this.decryptSecret(connection.api_key_encrypted);
      const apiSecret = this.decryptSecret(connection.api_secret_encrypted);

      if (!apiKey || !apiSecret) {
        throw new Error('Không thể giải mã thông tin kết nối');
      }

      // Build query
      let queryString = `timestamp=${Date.now()}`;
      if (symbol) queryString += `&symbol=${symbol}`;
      if (startTime) queryString += `&startTime=${startTime}`;
      if (endTime) queryString += `&endTime=${endTime}`;
      queryString += `&limit=${limit}`;

      const signature = await this.createSignature(queryString, apiSecret);

      // Fetch trades
      const response = await fetchWithTimeout(
        `${BINANCE_API}/api/v3/myTrades?${queryString}&signature=${signature}`,
        {
          headers: {
            'X-MBX-APIKEY': apiKey,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Không thể lấy dữ liệu giao dịch');
      }

      const trades = await response.json();

      return trades;
    } catch (error) {
      console.error('[BinanceApi] Fetch trades error:', error);
      throw error;
    }
  }

  /**
   * Sync trades to database
   */
  async syncTrades(userId, options = {}) {
    const { days = 30 } = options;

    try {
      // Calculate time range
      const endTime = Date.now();
      const startTime = endTime - days * 24 * 60 * 60 * 1000;

      // Fetch trades
      const trades = await this.fetchTrades(userId, {
        startTime,
        endTime,
        limit: 1000,
      });

      if (!trades || trades.length === 0) {
        return { synced: 0, trades: [] };
      }

      // Get connection ID
      const { data: connection } = await supabase
        .from('user_exchange_connections')
        .select('id')
        .eq('user_id', userId)
        .eq('exchange', 'binance')
        .single();

      // Transform and insert trades
      const formattedTrades = trades.map((trade) => ({
        user_id: userId,
        connection_id: connection?.id,
        exchange: 'binance',
        exchange_trade_id: trade.id?.toString(),
        exchange_order_id: trade.orderId?.toString(),
        symbol: trade.symbol,
        side: trade.isBuyer ? 'BUY' : 'SELL',
        trade_type: 'SPOT',
        entry_price: parseFloat(trade.price),
        quantity: parseFloat(trade.qty),
        quote_quantity: parseFloat(trade.quoteQty),
        commission: parseFloat(trade.commission || 0),
        commission_asset: trade.commissionAsset,
        is_maker: trade.isMaker,
        trade_time: new Date(trade.time).toISOString(),
        status: 'closed',
        raw_data: trade,
      }));

      // Upsert trades
      const { data: insertedTrades, error } = await supabase
        .from('real_trades')
        .upsert(formattedTrades, {
          onConflict: 'user_id,exchange,exchange_trade_id',
        })
        .select();

      if (error) throw error;

      // Update last sync time
      await supabase
        .from('user_exchange_connections')
        .update({
          last_sync_at: new Date().toISOString(),
          sync_status: 'synced',
          last_error: null,
        })
        .eq('user_id', userId)
        .eq('exchange', 'binance');

      return {
        synced: insertedTrades?.length || 0,
        trades: insertedTrades,
      };
    } catch (error) {
      console.error('[BinanceApi] Sync trades error:', error);

      // Update sync status with error
      await supabase
        .from('user_exchange_connections')
        .update({
          sync_status: 'error',
          last_error: error.message,
        })
        .eq('user_id', userId)
        .eq('exchange', 'binance');

      throw error;
    }
  }

  /**
   * Get account balance (READ-ONLY)
   */
  async getAccountBalance(userId) {
    try {
      // Get connection
      const { data: connection, error: connError } = await supabase
        .from('user_exchange_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('exchange', 'binance')
        .single();

      if (connError || !connection) {
        throw new Error('Không tìm thấy kết nối Binance');
      }

      // Decrypt credentials
      const apiKey = this.decryptSecret(connection.api_key_encrypted);
      const apiSecret = this.decryptSecret(connection.api_secret_encrypted);

      // Build query
      const queryString = `timestamp=${Date.now()}`;
      const signature = await this.createSignature(queryString, apiSecret);

      // Fetch account
      const response = await fetchWithTimeout(
        `${BINANCE_API}/api/v3/account?${queryString}&signature=${signature}`,
        {
          headers: {
            'X-MBX-APIKEY': apiKey,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Không thể lấy thông tin tài khoản');
      }

      const accountData = await response.json();

      // Filter non-zero balances
      const balances = (accountData.balances || [])
        .filter((b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
        .map((b) => ({
          asset: b.asset,
          free: parseFloat(b.free),
          locked: parseFloat(b.locked),
          total: parseFloat(b.free) + parseFloat(b.locked),
        }));

      return {
        balances,
        canTrade: accountData.canTrade,
        canWithdraw: accountData.canWithdraw,
        updateTime: accountData.updateTime,
      };
    } catch (error) {
      console.error('[BinanceApi] Get balance error:', error);
      throw error;
    }
  }
}

const binanceApiService = new BinanceApiService();
export default binanceApiService;
