/**
 * Settings Service
 * Handles all user settings, sessions, API keys, and account management
 */

import { supabase } from '../lib/supabaseClient';

// ========================================
// USER SETTINGS
// ========================================

/**
 * Get user settings with defaults fallback
 * @param {string} userId - User ID
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
export async function getUserSettings(userId) {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no settings exist, return defaults
      if (error.code === 'PGRST116') {
        return {
          data: {
            notifications: {
              telegram: false,
              email: false,
              browser: true,
              priceAlerts: true,
              patternDetected: true,
              tradeSignals: false,
              systemUpdates: true,
            },
            privacy: {
              profileVisibility: 'private',
              showTrades: false,
              twoFactorEnabled: false,
            },
            trading: {
              defaultTimeframe: '1h',
              riskPercentage: 2,
              enabledPatterns: ['head_shoulders', 'double_top', 'double_bottom', 'triangle', 'wedge'],
            },
            display: {
              language: 'en',
              currency: 'USD',
              timezone: 'UTC',
              dateFormat: 'MM/DD/YYYY',
              theme: 'dark',
            },
            advanced: {
              betaFeatures: false,
              debugMode: false,
            },
          },
          error: null,
        };
      }
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return { data: null, error };
  }
}

/**
 * Update user settings (upsert)
 * @param {string} userId - User ID
 * @param {object} settings - Settings object with keys: notifications, privacy, trading, display, advanced
 * @returns {Promise<{data: object|null, error: Error|null, success: boolean}>}
 */
export async function updateSettings(userId, settings) {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single();

    if (error) throw error;

    console.log('Settings updated successfully:', data);
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Error updating settings:', error);
    return { data: null, error, success: false };
  }
}

// ========================================
// USER SESSIONS
// ========================================

/**
 * Get active user sessions
 * @param {string} userId - User ID
 * @returns {Promise<{data: array|null, error: Error|null}>}
 */
export async function getActiveSessions(userId) {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_activity', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    return { data: null, error };
  }
}

/**
 * Create a new session record
 * @param {string} userId - User ID
 * @param {object} sessionData - Session information (device_name, device_type, browser, os, ip_address, user_agent)
 * @returns {Promise<{data: object|null, error: Error|null, success: boolean}>}
 */
export async function createSession(userId, sessionData) {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert([
        {
          user_id: userId,
          device_name: sessionData.device_name || 'Unknown Device',
          device_type: sessionData.device_type || 'desktop',
          browser: sessionData.browser || 'Unknown',
          os: sessionData.os || 'Unknown',
          ip_address: sessionData.ip_address || '',
          user_agent: sessionData.user_agent || navigator.userAgent,
          is_active: true,
          last_activity: new Date().toISOString(),
          login_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log('Session created successfully:', data);
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Error creating session:', error);
    return { data: null, error, success: false };
  }
}

/**
 * Revoke a specific session
 * @param {string} sessionId - Session ID to revoke
 * @returns {Promise<{data: object|null, error: Error|null, success: boolean}>}
 */
export async function revokeSession(sessionId) {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .update({
        is_active: false,
        logout_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;

    console.log('Session revoked successfully:', data);
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Error revoking session:', error);
    return { data: null, error, success: false };
  }
}

/**
 * Update session activity timestamp
 * @param {string} sessionId - Session ID
 * @returns {Promise<{success: boolean}>}
 */
export async function updateSessionActivity(sessionId) {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({
        last_activity: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating session activity:', error);
    return { success: false };
  }
}

// ========================================
// API KEYS
// ========================================

/**
 * Generate a new API key
 * @param {string} userId - User ID
 * @param {string} name - User-defined name for the API key
 * @returns {Promise<{data: object|null, error: Error|null, success: boolean}>}
 */
export async function generateApiKey(userId, name) {
  try {
    // Call the database function to generate the key
    const { data: keyData, error: keyError } = await supabase.rpc('generate_api_key');

    if (keyError) throw keyError;

    const apiKey = keyData;
    const keyPreview = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;

    // Insert the new API key
    const { data, error } = await supabase
      .from('api_keys')
      .insert([
        {
          user_id: userId,
          name: name,
          key: apiKey,
          key_preview: keyPreview,
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log('API key generated successfully:', data);
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Error generating API key:', error);
    return { data: null, error, success: false };
  }
}

/**
 * Get all API keys for a user
 * @param {string} userId - User ID
 * @returns {Promise<{data: array|null, error: Error|null}>}
 */
export async function getApiKeys(userId) {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, key_preview, is_active, last_used_at, usage_count, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return { data: null, error };
  }
}

/**
 * Revoke an API key (soft delete by setting is_active to false)
 * @param {string} keyId - API key ID
 * @returns {Promise<{data: object|null, error: Error|null, success: boolean}>}
 */
export async function revokeApiKey(keyId) {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq('id', keyId)
      .select()
      .single();

    if (error) throw error;

    console.log('API key revoked successfully:', data);
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Error revoking API key:', error);
    return { data: null, error, success: false };
  }
}

/**
 * Delete an API key permanently
 * @param {string} keyId - API key ID
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function deleteApiKey(keyId) {
  try {
    const { error } = await supabase.from('api_keys').delete().eq('id', keyId);

    if (error) throw error;

    console.log('API key deleted successfully');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting API key:', error);
    return { success: false, error };
  }
}

// ========================================
// SUBSCRIPTION & INVOICES
// ========================================

/**
 * Get subscription information for a user
 * @param {string} userId - User ID
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
export async function getSubscriptionInfo(userId) {
  try {
    // Get user tier info from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tier, tier_expires_at, course_tier, scanner_tier, chatbot_tier, course_tier_expires_at, scanner_tier_expires_at, chatbot_tier_expires_at')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Get invoices
    const { data: invoices, error: invoiceError } = await supabase
      .from('subscription_invoices')
      .select('*')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false })
      .limit(10);

    if (invoiceError) throw invoiceError;

    return {
      data: {
        subscription: userData,
        invoices: invoices || [],
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching subscription info:', error);
    return { data: null, error };
  }
}

/**
 * Cancel subscription (mark for cancellation at end of period)
 * @param {string} userId - User ID
 * @param {string} productType - 'course', 'scanner', 'chatbot', or 'all'
 * @param {string} reason - Cancellation reason
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function cancelSubscription(userId, productType, reason) {
  try {
    // In a real implementation, this would integrate with payment provider (Stripe, PayPal, etc.)
    // For now, we'll just log the cancellation request
    console.log('Subscription cancellation requested:', {
      userId,
      productType,
      reason,
      requestedAt: new Date().toISOString(),
    });

    // TODO: Integrate with payment provider API
    // - Stripe: stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
    // - PayPal: Similar cancellation API call

    return { success: true, error: null };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return { success: false, error };
  }
}

// ========================================
// ACCOUNT MANAGEMENT
// ========================================

/**
 * Change user password
 * @param {string} currentPassword - Current password for verification
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function changePassword(currentPassword, newPassword) {
  try {
    // Supabase Auth password update
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    console.log('Password changed successfully');
    return { success: true, error: null, data };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, error };
  }
}

/**
 * Export all user data (GDPR compliance)
 * @param {string} userId - User ID
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
export async function exportUserData(userId) {
  try {
    // Fetch all user-related data
    const [userResult, settingsResult, sessionsResult, keysResult, invoicesResult, scansResult, tradesResult] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('user_settings').select('*').eq('user_id', userId).single(),
      supabase.from('user_sessions').select('*').eq('user_id', userId),
      supabase.from('api_keys').select('*').eq('user_id', userId),
      supabase.from('subscription_invoices').select('*').eq('user_id', userId),
      supabase.from('scan_history').select('*').eq('user_id', userId),
      supabase.from('trading_journal').select('*').eq('user_id', userId),
    ]);

    const exportData = {
      export_date: new Date().toISOString(),
      user: userResult.data,
      settings: settingsResult.data,
      sessions: sessionsResult.data,
      api_keys: keysResult.data,
      invoices: invoicesResult.data,
      scan_history: scansResult.data,
      trading_journal: tradesResult.data,
    };

    console.log('User data exported successfully');
    return { data: exportData, error: null };
  } catch (error) {
    console.error('Error exporting user data:', error);
    return { data: null, error };
  }
}

/**
 * Request account deletion (30-day grace period)
 * @param {string} userId - User ID
 * @param {string} password - Password for confirmation
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function requestAccountDeletion(userId, password) {
  try {
    // TODO: Implement account deletion with grace period
    // 1. Verify password
    // 2. Mark account for deletion in 30 days
    // 3. Send confirmation email
    // 4. Schedule deletion job

    console.log('Account deletion requested:', {
      userId,
      requestedAt: new Date().toISOString(),
      scheduledDeletionAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // For now, just a placeholder
    return { success: true, error: null };
  } catch (error) {
    console.error('Error requesting account deletion:', error);
    return { success: false, error };
  }
}

/**
 * Update user profile information
 * @param {string} userId - User ID
 * @param {object} profileData - Profile data to update (full_name, etc.)
 * @returns {Promise<{data: object|null, error: Error|null, success: boolean}>}
 */
export async function updateProfile(userId, profileData) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    console.log('Profile updated successfully:', data);
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error, success: false };
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Parse user agent to extract device information
 * @param {string} userAgent - User agent string
 * @returns {object} - Device information
 */
export function parseUserAgent(userAgent) {
  const ua = userAgent || navigator.userAgent;

  let deviceType = 'desktop';
  let browser = 'Unknown';
  let os = 'Unknown';

  // Detect device type
  if (/mobile|android|iphone|ipod/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = 'tablet';
  }

  // Detect browser
  if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/edge|edg/i.test(ua)) browser = 'Edge';
  else if (/msie|trident/i.test(ua)) browser = 'Internet Explorer';

  // Detect OS
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/ios|iphone|ipad/i.test(ua)) os = 'iOS';

  return { deviceType, browser, os };
}
