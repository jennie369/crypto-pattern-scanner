/**
 * Trading Leads Service
 * Check and activate Pro Scanner benefits for trading course leads
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCANNER_BENEFIT_KEY = '@trading_scanner_benefit';
const SCANNER_CHECKED_KEY = '@trading_scanner_checked';

class TradingLeadsService {
  /**
   * Check if user's email is eligible for Pro Scanner benefit
   * @param {string} email - User's email
   * @returns {Promise<Object|null>} - Benefit info or null
   */
  async checkEligibility(email) {
    try {
      if (!email) return null;

      const normalizedEmail = email.toLowerCase().trim();

      // Check trading_leads table
      const { data, error } = await supabase
        .from('trading_leads')
        .select('id, queue_number, scanner_activated_at, scanner_expires_at, scanner_days, benefits_status')
        .eq('email', normalizedEmail)
        .single();

      if (error || !data) {
        console.log('[TradingLeads] No record found for:', normalizedEmail);
        return null;
      }

      // Check if in first 50
      if (data.queue_number > 50) {
        console.log('[TradingLeads] Not in first 50, queue:', data.queue_number);
        return null;
      }

      // Check if already activated
      if (data.scanner_activated_at) {
        const expiresAt = new Date(data.scanner_expires_at);
        const now = new Date();

        if (expiresAt > now) {
          // Still active
          return {
            eligible: true,
            activated: true,
            expiresAt: data.scanner_expires_at,
            daysRemaining: Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)),
            queueNumber: data.queue_number,
          };
        } else {
          // Expired
          return {
            eligible: false,
            activated: true,
            expired: true,
            queueNumber: data.queue_number,
          };
        }
      }

      // Eligible but not activated yet
      return {
        eligible: true,
        activated: false,
        scannerDays: data.scanner_days || 30,
        queueNumber: data.queue_number,
        leadId: data.id,
      };

    } catch (error) {
      console.error('[TradingLeads] Check eligibility error:', error);
      return null;
    }
  }

  /**
   * Activate Pro Scanner for user
   * @param {string} email - User's email
   * @param {string} userId - User's auth ID
   * @returns {Promise<Object>} - Activation result
   */
  async activateProScanner(email, userId) {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      // Call the database function
      const { data, error } = await supabase.rpc('activate_pro_scanner', {
        p_email: normalizedEmail,
      });

      if (error) {
        console.error('[TradingLeads] Activate error:', error);
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Activation failed' };
      }

      // Link user_id if provided
      if (userId) {
        await supabase
          .from('trading_leads')
          .update({ user_id: userId })
          .eq('email', normalizedEmail);
      }

      // Store locally
      await AsyncStorage.setItem(SCANNER_BENEFIT_KEY, JSON.stringify({
        activatedAt: data.activated_at || new Date().toISOString(),
        expiresAt: data.expires_at,
        days: data.days,
      }));

      return {
        success: true,
        expiresAt: data.expires_at,
        days: data.days,
        alreadyActivated: data.already_activated,
      };

    } catch (error) {
      console.error('[TradingLeads] Activate scanner error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if user has active Pro Scanner from trading lead
   * @param {string} email - User's email
   * @returns {Promise<boolean>}
   */
  async hasActiveProScanner(email) {
    const benefit = await this.checkEligibility(email);
    return benefit?.eligible && benefit?.activated && !benefit?.expired;
  }

  /**
   * Get Pro Scanner expiry date
   * @param {string} email - User's email
   * @returns {Promise<Date|null>}
   */
  async getProScannerExpiry(email) {
    const benefit = await this.checkEligibility(email);
    if (benefit?.expiresAt) {
      return new Date(benefit.expiresAt);
    }
    return null;
  }

  /**
   * Mark that we've checked for benefits (don't show modal again)
   */
  async markBenefitChecked() {
    await AsyncStorage.setItem(SCANNER_CHECKED_KEY, 'true');
  }

  /**
   * Check if we've already shown the benefit modal
   */
  async hasBenefitBeenChecked() {
    const checked = await AsyncStorage.getItem(SCANNER_CHECKED_KEY);
    return checked === 'true';
  }

  /**
   * Reset benefit check (for testing or logout)
   */
  async resetBenefitCheck() {
    await AsyncStorage.removeItem(SCANNER_CHECKED_KEY);
    await AsyncStorage.removeItem(SCANNER_BENEFIT_KEY);
  }

  /**
   * Get locally stored benefit info
   */
  async getStoredBenefit() {
    try {
      const stored = await AsyncStorage.getItem(SCANNER_BENEFIT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}

export const tradingLeadsService = new TradingLeadsService();
export default tradingLeadsService;
