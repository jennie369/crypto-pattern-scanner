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
import { sha256 } from 'js-sha256';

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
 * Using js-sha256 library for reliable signing
 * @param {string} secretKey - Secret key
 * @param {string} message - Message to sign
 * @returns {string} Hex signature
 */
function createSignature(secretKey, message) {
  // Use js-sha256 library's HMAC implementation
  return sha256.hmac(secretKey, message);
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

    const controller = new AbortController();
    const fetchTimeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(
        `${BINANCE_API.BASE_URL}${BINANCE_API.ENDPOINTS.ACCOUNT}?${queryString}&signature=${signature}`,
        {
          headers: {
            'X-MBX-APIKEY': apiKey,
          },
          signal: controller.signal,
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
    } finally {
      clearTimeout(fetchTimeout);
    }
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
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
        signal: controller.signal,
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
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch Binance balance
 * @param {string} apiKey - API key
 * @param {string} secretKey - Secret key
 * @returns {Promise<Object>} Balance data
 */
export async function fetchBinanceBalance(apiKey, secretKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
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
        signal: controller.signal,
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
  } finally {
    clearTimeout(timeout);
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
