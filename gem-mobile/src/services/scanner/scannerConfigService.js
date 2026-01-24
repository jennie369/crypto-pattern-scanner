/**
 * =====================================================
 * File: src/services/scanner/scannerConfigService.js
 * Description: Scanner configuration management service
 * Database: scanner_config table
 * Access: All tiers (with tier-specific settings)
 * =====================================================
 */

import { supabase } from '../supabase';
import { DEFAULT_USER_CONFIG } from '../../constants/scannerDefaults';
import { getAccessConfig, hasAccess } from '../../constants/scannerAccess';

/**
 * Get scanner config for current user
 * Creates default config if not exists
 *
 * @returns {Promise<Object>} Scanner config
 */
export async function getScannerConfig() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('[scannerConfigService] No user logged in, using defaults');
      return { ...DEFAULT_USER_CONFIG, isDefault: true };
    }

    console.log('[scannerConfigService] Fetching config for user:', user.id);

    // Try to get existing config
    const { data, error } = await supabase
      .from('scanner_config')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No config found, create one
        console.log('[scannerConfigService] No config found, creating default');
        return await createScannerConfig(user.id);
      }
      console.error('[scannerConfigService] Error fetching config:', error);
      return { ...DEFAULT_USER_CONFIG, isDefault: true };
    }

    console.log('[scannerConfigService] Config loaded successfully');
    return {
      ...DEFAULT_USER_CONFIG,
      ...data,
      isDefault: false,
    };
  } catch (error) {
    console.error('[scannerConfigService] Error:', error);
    return { ...DEFAULT_USER_CONFIG, isDefault: true };
  }
}

/**
 * Create scanner config for user (uses upsert to handle duplicates)
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created config
 */
export async function createScannerConfig(userId) {
  try {
    // Use upsert to handle race conditions and duplicate key errors
    const { data, error } = await supabase
      .from('scanner_config')
      .upsert({
        user_id: userId,
        ...DEFAULT_USER_CONFIG,
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      // If upsert fails, try to fetch existing config
      if (error.code === '23505') {
        console.log('[scannerConfigService] Config already exists, fetching...');
        const { data: existing } = await supabase
          .from('scanner_config')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (existing) {
          return { ...DEFAULT_USER_CONFIG, ...existing, isDefault: false };
        }
      }
      console.error('[scannerConfigService] Error creating config:', error);
      return { ...DEFAULT_USER_CONFIG, isDefault: true };
    }

    console.log('[scannerConfigService] Config created successfully');
    return { ...data, isDefault: false };
  } catch (error) {
    console.error('[scannerConfigService] Error:', error);
    return { ...DEFAULT_USER_CONFIG, isDefault: true };
  }
}

/**
 * Update scanner config
 * Only TIER 3 can update custom thresholds
 *
 * @param {Object} updates - Config updates
 * @param {number} userTier - User's tier level
 * @returns {Promise<Object>} Updated config
 */
export async function updateScannerConfig(updates, userTier = 0) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check access for custom thresholds
    if (!hasAccess(userTier, 'customThresholds')) {
      // Filter out threshold updates for non-TIER3 users
      const allowedUpdates = {};
      const nonThresholdFields = [
        'alerts_enabled',
        'alert_on_zone_approach',
        'alert_on_retest',
        'alert_on_breakout',
        'mtf_enabled',
        'zone_retest_required',
      ];

      Object.keys(updates).forEach(key => {
        if (nonThresholdFields.includes(key)) {
          allowedUpdates[key] = updates[key];
        }
      });

      if (Object.keys(allowedUpdates).length === 0) {
        console.warn('[scannerConfigService] No allowed updates for tier', userTier);
        return { error: 'Upgrade to TIER 3 to customize thresholds' };
      }

      updates = allowedUpdates;
    }

    console.log('[scannerConfigService] Updating config:', updates);

    const { data, error } = await supabase
      .from('scanner_config')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('[scannerConfigService] Error updating config:', error);
      throw error;
    }

    console.log('[scannerConfigService] Config updated successfully');
    return { ...data, isDefault: false };
  } catch (error) {
    console.error('[scannerConfigService] Error:', error);
    return { error: error.message };
  }
}

/**
 * Reset scanner config to defaults
 *
 * @returns {Promise<Object>} Reset config
 */
export async function resetScannerConfig() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('[scannerConfigService] Resetting config to defaults');

    const { data, error } = await supabase
      .from('scanner_config')
      .update(DEFAULT_USER_CONFIG)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('[scannerConfigService] Error resetting config:', error);
      throw error;
    }

    console.log('[scannerConfigService] Config reset successfully');
    return { ...data, isDefault: false };
  } catch (error) {
    console.error('[scannerConfigService] Error:', error);
    return { error: error.message };
  }
}

/**
 * Get merged config (user config + tier access)
 *
 * @param {number} userTier - User's tier level
 * @returns {Promise<Object>} Merged config with access info
 */
export async function getMergedConfig(userTier = 0) {
  const userConfig = await getScannerConfig();
  const accessConfig = getAccessConfig(userTier);

  return {
    ...userConfig,
    access: accessConfig,
    tier: userTier,
    features: accessConfig.features,
    limits: accessConfig.limits,
    patterns: accessConfig.patterns,
    timeframes: accessConfig.timeframes,
  };
}

/**
 * Check if a feature is enabled for user
 *
 * @param {Object} config - Merged config
 * @param {string} feature - Feature name
 * @returns {boolean}
 */
export function isFeatureEnabled(config, feature) {
  // Check if feature is available for tier
  if (!config?.features?.[feature]) {
    return false;
  }

  // Check user-specific settings
  switch (feature) {
    case 'mtfAnalysis':
      return config.mtf_enabled !== false;
    case 'zoneRetest':
      return config.zone_retest_required !== false;
    case 'alerts':
      return config.alerts_enabled !== false;
    default:
      return true;
  }
}

/**
 * Get volume thresholds from config
 *
 * @param {Object} config - Scanner config
 * @returns {Object} Volume thresholds
 */
export function getVolumeThresholds(config) {
  return {
    STRONG: config?.volume_strong || DEFAULT_USER_CONFIG.volume_strong,
    GOOD: config?.volume_good || DEFAULT_USER_CONFIG.volume_good,
    ACCEPTABLE: config?.volume_acceptable || DEFAULT_USER_CONFIG.volume_acceptable,
    MINIMUM: config?.volume_minimum || DEFAULT_USER_CONFIG.volume_minimum,
    REJECT: config?.volume_reject || DEFAULT_USER_CONFIG.volume_reject,
  };
}

/**
 * Get confidence thresholds from config
 *
 * @param {Object} config - Scanner config
 * @returns {Object} Confidence thresholds
 */
export function getConfidenceThresholds(config) {
  return {
    BASE: config?.confidence_base || DEFAULT_USER_CONFIG.confidence_base,
    MIN: config?.confidence_min || DEFAULT_USER_CONFIG.confidence_min,
    STRONG: config?.confidence_strong || DEFAULT_USER_CONFIG.confidence_strong,
    GOOD: config?.confidence_good || DEFAULT_USER_CONFIG.confidence_good,
  };
}

/**
 * Validate config values
 *
 * @param {Object} config - Config to validate
 * @returns {Object} Validation result { valid, errors }
 */
export function validateConfig(config) {
  const errors = [];

  // Volume thresholds should be in descending order
  if (config.volume_strong <= config.volume_good) {
    errors.push('volume_strong should be greater than volume_good');
  }
  if (config.volume_good <= config.volume_acceptable) {
    errors.push('volume_good should be greater than volume_acceptable');
  }
  if (config.volume_acceptable <= config.volume_minimum) {
    errors.push('volume_acceptable should be greater than volume_minimum');
  }
  if (config.volume_minimum <= config.volume_reject) {
    errors.push('volume_minimum should be greater than volume_reject');
  }

  // Confidence thresholds
  if (config.confidence_min > config.confidence_good) {
    errors.push('confidence_min should be less than confidence_good');
  }
  if (config.confidence_good > config.confidence_strong) {
    errors.push('confidence_good should be less than confidence_strong');
  }

  // Range validations
  if (config.volume_reject < 0 || config.volume_reject > 1) {
    errors.push('volume_reject should be between 0 and 1');
  }
  if (config.volume_strong < 1 || config.volume_strong > 10) {
    errors.push('volume_strong should be between 1 and 10');
  }
  if (config.confidence_base < 20 || config.confidence_base > 60) {
    errors.push('confidence_base should be between 20 and 60');
  }
  if (config.confidence_min < 40 || config.confidence_min > 80) {
    errors.push('confidence_min should be between 40 and 80');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  getScannerConfig,
  createScannerConfig,
  updateScannerConfig,
  resetScannerConfig,
  getMergedConfig,
  isFeatureEnabled,
  getVolumeThresholds,
  getConfidenceThresholds,
  validateConfig,
  DEFAULT_USER_CONFIG,
};
