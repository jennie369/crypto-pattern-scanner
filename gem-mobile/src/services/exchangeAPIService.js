/**
 * =====================================================
 * GEM - Exchange API Service
 * =====================================================
 *
 * Service for connecting to exchange APIs (TIER 2+)
 * - Connect/disconnect API
 * - Fetch balance with caching
 * - Test API connection
 * - Validate API key format
 * - Encrypt/decrypt keys
 *
 * Security:
 * - API keys encrypted before storage
 * - REJECT keys with withdrawal permission
 * - 5-minute balance cache
 *
 * Access: TIER 2+
 *
 * =====================================================
 */

import { supabase } from './supabase';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';

// Import constants
import {
  API_CONNECTION_CONFIG,
  API_TEST_STATUS,
  AFFILIATE_EVENT_TYPES,
  validateAPIKeyFormat,
  canConnectAPI,
  getAPIFeatures,
} from '../constants/exchangeConfig';

// ========================================
// CONSTANTS
// ========================================

// Encryption key (should be from secure storage in production)
const ENCRYPTION_KEY = 'gem_exchange_api_v1_2025'; // TODO: Move to secure storage

// Binance API endpoints
const BINANCE_API = {
  BASE_URL: 'https://api.binance.com',
  ENDPOINTS: {
    ACCOUNT: '/api/v3/account',
    API_PERMISSIONS: '/sapi/v1/account/apiRestrictions',
  },
};

// OKX API endpoints
const OKX_API = {
  BASE_URL: 'https://www.okx.com',
  ENDPOINTS: {
    ACCOUNT: '/api/v5/account/balance',
  },
};

// Bybit API endpoints
const BYBIT_API = {
  BASE_URL: 'https://api.bybit.com',
  ENDPOINTS: {
    WALLET: '/v5/account/wallet-balance',
  },
};

// ========================================
// CRYPTO HELPERS
// ========================================

/**
 * Simple XOR encryption with Base64 encoding
 * NOTE: For production, use expo-secure-store for sensitive data
 * @param {string} data - Data to encrypt
 * @returns {string} Encrypted data (Base64)
 */
export function encryptKey(data) {
  if (!data) return '';
  try {
    // XOR each character with the encryption key
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    // Encode to Base64
    return Buffer.from(result, 'binary').toString('base64');
  } catch (error) {
    console.error('[ExchangeAPI] Encrypt error:', error);
    return '';
  }
}

/**
 * Simple XOR decryption from Base64
 * @param {string} encrypted - Encrypted data (Base64)
 * @returns {string} Decrypted data
 */
export function decryptKey(encrypted) {
  if (!encrypted) return '';
  try {
    // Decode from Base64
    const decoded = Buffer.from(encrypted, 'base64').toString('binary');
    // XOR each character with the encryption key
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (error) {
    console.error('[ExchangeAPI] Decrypt error:', error);
    return '';
  }
}

/**
 * Create HMAC-SHA256 signature for API request
 * Using pure JavaScript implementation for React Native compatibility
 * @param {string} secretKey - Secret key
 * @param {string} message - Message to sign
 * @returns {string} Hex signature
 */
function createSignature(secretKey, message) {
  // Simple HMAC-SHA256 implementation using expo-crypto workaround
  // For Binance, we need HMAC-SHA256 which expo-crypto doesn't directly support
  // Using a pure JS implementation
  return hmacSHA256(message, secretKey);
}

/**
 * Pure JavaScript HMAC-SHA256 implementation
 * Based on standard HMAC algorithm
 */
function hmacSHA256(message, key) {
  // Convert strings to byte arrays
  const msgBytes = stringToBytes(message);
  const keyBytes = stringToBytes(key);

  // SHA-256 constants
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function sha256(bytes) {
    let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

    // Pre-processing: adding padding bits
    const l = bytes.length * 8;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) bytes.push(0);

    // Append length
    for (let i = 7; i >= 0; i--) bytes.push((l >>> (i * 8)) & 0xff);

    // Process each 512-bit chunk
    for (let i = 0; i < bytes.length; i += 64) {
      const W = [];
      for (let j = 0; j < 16; j++) {
        W[j] = (bytes[i + j * 4] << 24) | (bytes[i + j * 4 + 1] << 16) | (bytes[i + j * 4 + 2] << 8) | bytes[i + j * 4 + 3];
      }
      for (let j = 16; j < 64; j++) {
        const s0 = rotr(W[j-15], 7) ^ rotr(W[j-15], 18) ^ (W[j-15] >>> 3);
        const s1 = rotr(W[j-2], 17) ^ rotr(W[j-2], 19) ^ (W[j-2] >>> 10);
        W[j] = (W[j-16] + s0 + W[j-7] + s1) >>> 0;
      }

      let [a, b, c, d, e, f, g, h] = H;

      for (let j = 0; j < 64; j++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + K[j] + W[j]) >>> 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) >>> 0;

        h = g; g = f; f = e; e = (d + temp1) >>> 0;
        d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
      }

      H = H.map((v, i) => (v + [a, b, c, d, e, f, g, h][i]) >>> 0);
    }

    return H;
  }

  function rotr(n, b) { return ((n >>> b) | (n << (32 - b))) >>> 0; }

  function stringToBytes(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) bytes.push(str.charCodeAt(i) & 0xff);
    return bytes;
  }

  // HMAC: hash(key XOR opad || hash(key XOR ipad || message))
  const blockSize = 64;
  let keyPadded = keyBytes.length > blockSize ? sha256([...keyBytes]).flatMap(w => [(w>>>24)&0xff,(w>>>16)&0xff,(w>>>8)&0xff,w&0xff]) : [...keyBytes];
  while (keyPadded.length < blockSize) keyPadded.push(0);

  const ipad = keyPadded.map(b => b ^ 0x36);
  const opad = keyPadded.map(b => b ^ 0x5c);

  const innerHash = sha256([...ipad, ...msgBytes]);
  const innerBytes = innerHash.flatMap(w => [(w>>>24)&0xff,(w>>>16)&0xff,(w>>>8)&0xff,w&0xff]);
  const outerHash = sha256([...opad, ...innerBytes]);

  return outerHash.map(w => w.toString(16).padStart(8, '0')).join('');
}

// ========================================
// API VALIDATION
// ========================================

/**
 * Validate API key format
 * @param {string} exchange - Exchange ID
 * @param {string} apiKey - API key
 * @param {string} secretKey - Secret key
 * @param {string} [passphrase] - Passphrase (OKX only)
 * @returns {Object} { valid, errors }
 */
export function validateAPIKeys(exchange, apiKey, secretKey, passphrase) {
  return validateAPIKeyFormat(exchange, apiKey, secretKey, passphrase);
}

/**
 * Check if tier can connect API
 * @param {number} userTier - User's tier
 * @returns {boolean}
 */
export function checkTierAccess(userTier) {
  return canConnectAPI(userTier);
}

// ========================================
// BINANCE API
// ========================================

/**
 * Test Binance API connection
 * @param {string} apiKey - API key
 * @param {string} secretKey - Secret key
 * @returns {Promise<Object>} Test result
 */
export async function testBinanceAPI(apiKey, secretKey) {
  try {
    // First check API permissions
    const permissions = await getBinanceAPIPermissions(apiKey, secretKey);

    if (permissions.error) {
      return {
        success: false,
        error: permissions.error,
        status: API_TEST_STATUS.FAILED,
      };
    }

    // CRITICAL: Reject if withdrawal is enabled
    if (permissions.enableWithdrawals) {
      return {
        success: false,
        error: 'API key co quyen RUT TIEN! Vui long tao API key moi KHONG co quyen withdraw.',
        status: API_TEST_STATUS.FAILED,
        securityWarning: true,
      };
    }

    // Test account endpoint
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = createSignature(secretKey, queryString);

    const response = await fetch(
      `${BINANCE_API.BASE_URL}${BINANCE_API.ENDPOINTS.ACCOUNT}?${queryString}&signature=${signature}`,
      {
        headers: {
          'X-MBX-APIKEY': apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.msg || 'API test failed',
        code: error.code,
        status: API_TEST_STATUS.FAILED,
      };
    }

    const data = await response.json();

    return {
      success: true,
      status: API_TEST_STATUS.SUCCESS,
      permissions: {
        enableReading: permissions.enableReading,
        enableSpotAndMarginTrading: permissions.enableSpotAndMarginTrading,
        enableFutures: permissions.enableFutures,
      },
      accountType: data.accountType,
    };
  } catch (error) {
    console.error('[ExchangeAPI] Binance test error:', error);
    return {
      success: false,
      error: error.message || 'Connection failed',
      status: API_TEST_STATUS.FAILED,
    };
  }
}

/**
 * Get Binance API permissions
 * @param {string} apiKey - API key
 * @param {string} secretKey - Secret key
 * @returns {Promise<Object>} Permissions
 */
async function getBinanceAPIPermissions(apiKey, secretKey) {
  try {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = createSignature(secretKey, queryString);

    const response = await fetch(
      `${BINANCE_API.BASE_URL}${BINANCE_API.ENDPOINTS.API_PERMISSIONS}?${queryString}&signature=${signature}`,
      {
        headers: {
          'X-MBX-APIKEY': apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { error: error.msg || 'Failed to get permissions' };
    }

    return await response.json();
  } catch (error) {
    console.error('[ExchangeAPI] Permissions error:', error);
    return { error: error.message };
  }
}

/**
 * Fetch Binance balance
 * @param {string} apiKey - API key
 * @param {string} secretKey - Secret key
 * @returns {Promise<Object>} Balance data
 */
export async function fetchBinanceBalance(apiKey, secretKey) {
  try {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = createSignature(secretKey, queryString);

    const response = await fetch(
      `${BINANCE_API.BASE_URL}${BINANCE_API.ENDPOINTS.ACCOUNT}?${queryString}&signature=${signature}`,
      {
        headers: {
          'X-MBX-APIKEY': apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to fetch balance');
    }

    const data = await response.json();

    // Parse balances
    const balances = data.balances || [];
    const nonZeroBalances = balances.filter(
      b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0
    );

    // Calculate total in USDT (simplified - would need price conversion in production)
    let spotTotal = 0;
    const usdtBalance = balances.find(b => b.asset === 'USDT');
    if (usdtBalance) {
      spotTotal = parseFloat(usdtBalance.free) + parseFloat(usdtBalance.locked);
    }

    return {
      success: true,
      balance: {
        total: spotTotal,
        spot: spotTotal,
        futures: 0, // Would need separate futures API call
        assets: nonZeroBalances.map(b => ({
          asset: b.asset,
          free: parseFloat(b.free),
          locked: parseFloat(b.locked),
        })),
      },
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[ExchangeAPI] Fetch balance error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ========================================
// OKX API (Placeholder - needs implementation)
// ========================================

/**
 * Test OKX API connection
 * @param {string} apiKey - API key
 * @param {string} secretKey - Secret key
 * @param {string} passphrase - Passphrase
 * @returns {Promise<Object>} Test result
 */
export async function testOKXAPI(apiKey, secretKey, passphrase) {
  // TODO: Implement OKX API testing
  return {
    success: false,
    error: 'OKX API connection coming soon',
    status: API_TEST_STATUS.PENDING,
  };
}

/**
 * Fetch OKX balance
 */
export async function fetchOKXBalance(apiKey, secretKey, passphrase) {
  // TODO: Implement OKX balance fetching
  return {
    success: false,
    error: 'OKX API connection coming soon',
  };
}

// ========================================
// BYBIT API (Placeholder - needs implementation)
// ========================================

/**
 * Test Bybit API connection
 */
export async function testBybitAPI(apiKey, secretKey) {
  // TODO: Implement Bybit API testing
  return {
    success: false,
    error: 'Bybit API connection coming soon',
    status: API_TEST_STATUS.PENDING,
  };
}

/**
 * Fetch Bybit balance
 */
export async function fetchBybitBalance(apiKey, secretKey) {
  // TODO: Implement Bybit balance fetching
  return {
    success: false,
    error: 'Bybit API connection coming soon',
  };
}

// ========================================
// NAMI API (Placeholder - needs implementation)
// ========================================

/**
 * Test Nami API connection
 */
export async function testNamiAPI(apiKey, secretKey) {
  // TODO: Implement Nami API testing
  return {
    success: false,
    error: 'Nami API connection coming soon',
    status: API_TEST_STATUS.PENDING,
  };
}

/**
 * Fetch Nami balance
 */
export async function fetchNamiBalance(apiKey, secretKey) {
  // TODO: Implement Nami balance fetching
  return {
    success: false,
    error: 'Nami API connection coming soon',
  };
}

// ========================================
// UNIFIED API FUNCTIONS
// ========================================

/**
 * Test API connection for any exchange
 * @param {string} exchange - Exchange ID
 * @param {string} apiKey - API key
 * @param {string} secretKey - Secret key
 * @param {string} [passphrase] - Passphrase (OKX only)
 * @returns {Promise<Object>} Test result
 */
export async function testExchangeAPI(exchange, apiKey, secretKey, passphrase) {
  // Validate format first
  const validation = validateAPIKeys(exchange, apiKey, secretKey, passphrase);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors.join(', '),
      status: API_TEST_STATUS.FAILED,
    };
  }

  switch (exchange) {
    case 'binance':
      return testBinanceAPI(apiKey, secretKey);
    case 'okx':
      return testOKXAPI(apiKey, secretKey, passphrase);
    case 'bybit':
      return testBybitAPI(apiKey, secretKey);
    case 'nami':
      return testNamiAPI(apiKey, secretKey);
    default:
      return {
        success: false,
        error: 'Exchange not supported',
        status: API_TEST_STATUS.FAILED,
      };
  }
}

/**
 * Fetch balance for any exchange
 * @param {string} exchange - Exchange ID
 * @param {string} apiKey - API key (decrypted)
 * @param {string} secretKey - Secret key (decrypted)
 * @param {string} [passphrase] - Passphrase (OKX only)
 * @returns {Promise<Object>} Balance data
 */
export async function fetchExchangeBalance(exchange, apiKey, secretKey, passphrase) {
  switch (exchange) {
    case 'binance':
      return fetchBinanceBalance(apiKey, secretKey);
    case 'okx':
      return fetchOKXBalance(apiKey, secretKey, passphrase);
    case 'bybit':
      return fetchBybitBalance(apiKey, secretKey);
    case 'nami':
      return fetchNamiBalance(apiKey, secretKey);
    default:
      return {
        success: false,
        error: 'Exchange not supported',
      };
  }
}

// ========================================
// DATABASE FUNCTIONS
// ========================================

/**
 * Connect exchange API (save encrypted keys)
 * @param {string} exchangeId - Exchange ID
 * @param {string} apiKey - API key
 * @param {string} secretKey - Secret key
 * @param {string} [passphrase] - Passphrase (OKX only)
 * @param {number} userTier - User's tier
 * @returns {Promise<Object>} Result
 */
export async function connectExchangeAPI(exchangeId, apiKey, secretKey, passphrase, userTier) {
  try {
    // Check tier access
    if (!checkTierAccess(userTier)) {
      return {
        success: false,
        error: 'Nang cap len TIER 2 de ket noi API',
        requiresUpgrade: true,
      };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Test API first
    const testResult = await testExchangeAPI(exchangeId, apiKey, secretKey, passphrase);
    if (!testResult.success) {
      return {
        success: false,
        error: testResult.error,
        securityWarning: testResult.securityWarning,
      };
    }

    // Encrypt keys
    const encryptedApiKey = encryptKey(apiKey);
    const encryptedSecretKey = encryptKey(secretKey);
    const encryptedPassphrase = passphrase ? encryptKey(passphrase) : null;

    // Get permissions array
    const permissions = [];
    if (testResult.permissions?.enableReading) permissions.push('read');
    if (testResult.permissions?.enableSpotAndMarginTrading) permissions.push('spot_trade');
    if (testResult.permissions?.enableFutures) permissions.push('futures_trade');

    // Update account
    const { error } = await supabase
      .from('user_exchange_accounts')
      .update({
        api_key_encrypted: encryptedApiKey,
        api_secret_encrypted: encryptedSecretKey,
        api_permissions: permissions,
        api_connected_at: new Date().toISOString(),
        api_last_tested_at: new Date().toISOString(),
        api_test_status: 'success',
        api_error_message: null,
        metadata: {
          ...(passphrase && { passphrase_encrypted: encryptedPassphrase }),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('exchange', exchangeId);

    if (error) {
      console.error('[ExchangeAPI] Error saving keys:', error);
      return { success: false, error: error.message };
    }

    // Track event
    await trackAPIEvent(user.id, exchangeId, AFFILIATE_EVENT_TYPES.API_CONNECTED);

    return {
      success: true,
      permissions,
      features: getAPIFeatures(userTier),
    };
  } catch (error) {
    console.error('[ExchangeAPI] Connect error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Disconnect exchange API
 * @param {string} exchangeId - Exchange ID
 * @returns {Promise<Object>} Result
 */
export async function disconnectExchangeAPI(exchangeId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('user_exchange_accounts')
      .update({
        api_key_encrypted: null,
        api_secret_encrypted: null,
        api_permissions: [],
        api_connected_at: null,
        api_test_status: null,
        cached_balance: null,
        balance_last_synced_at: null,
        metadata: {},
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('exchange', exchangeId);

    if (error) {
      console.error('[ExchangeAPI] Error disconnecting:', error);
      return { success: false, error: error.message };
    }

    // Track event
    await trackAPIEvent(user.id, exchangeId, AFFILIATE_EVENT_TYPES.API_DISCONNECTED);

    return { success: true };
  } catch (error) {
    console.error('[ExchangeAPI] Disconnect error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get exchange balance with caching
 * @param {string} exchangeId - Exchange ID
 * @param {boolean} forceRefresh - Force refresh (bypass cache)
 * @returns {Promise<Object>} Balance data
 */
export async function getExchangeBalance(exchangeId, forceRefresh = false) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get account with encrypted keys
    const { data: account, error } = await supabase
      .from('user_exchange_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('exchange', exchangeId)
      .single();

    if (error || !account) {
      return { success: false, error: 'Account not found' };
    }

    if (!account.api_key_encrypted) {
      return { success: false, error: 'API not connected' };
    }

    // Check cache
    if (!forceRefresh && account.cached_balance && account.balance_last_synced_at) {
      const cacheAge = Date.now() - new Date(account.balance_last_synced_at).getTime();
      if (cacheAge < API_CONNECTION_CONFIG.BALANCE_CACHE_DURATION_MS) {
        return {
          success: true,
          balance: account.cached_balance,
          cached: true,
          syncedAt: account.balance_last_synced_at,
        };
      }
    }

    // Decrypt keys
    const apiKey = decryptKey(account.api_key_encrypted);
    const secretKey = decryptKey(account.api_secret_encrypted);
    const passphrase = account.metadata?.passphrase_encrypted
      ? decryptKey(account.metadata.passphrase_encrypted)
      : null;

    // Fetch fresh balance
    const balanceResult = await fetchExchangeBalance(exchangeId, apiKey, secretKey, passphrase);

    if (!balanceResult.success) {
      return balanceResult;
    }

    // Update cache
    await supabase
      .from('user_exchange_accounts')
      .update({
        cached_balance: balanceResult.balance,
        balance_last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', account.id);

    return {
      success: true,
      balance: balanceResult.balance,
      cached: false,
      syncedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[ExchangeAPI] Get balance error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Track API event
 */
async function trackAPIEvent(userId, exchangeId, eventType) {
  try {
    await supabase
      .from('exchange_affiliate_events')
      .insert({
        user_id: userId,
        exchange: exchangeId,
        event_type: eventType,
        device_info: {
          platform: Platform.OS,
          version: Platform.Version,
        },
      });
  } catch (error) {
    console.error('[ExchangeAPI] Error tracking event:', error);
  }
}

// ========================================
// EXPORT
// ========================================

export default {
  // Crypto helpers
  encryptKey,
  decryptKey,

  // Validation
  validateAPIKeys,
  checkTierAccess,

  // Exchange-specific
  testBinanceAPI,
  fetchBinanceBalance,
  testOKXAPI,
  fetchOKXBalance,
  testBybitAPI,
  fetchBybitBalance,
  testNamiAPI,
  fetchNamiBalance,

  // Unified
  testExchangeAPI,
  fetchExchangeBalance,

  // Database
  connectExchangeAPI,
  disconnectExchangeAPI,
  getExchangeBalance,
};
