/**
 * Email Service
 * GEM Partnership System v3.0 - Phase 5
 * Calls send-email Edge Function
 */

import { supabase } from './supabase';

const EMAIL_TEMPLATES = {
  WELCOME_CTV: 'welcome_ctv',
  WELCOME_KOL: 'welcome_kol',
  APPLICATION_REJECTED: 'application_rejected',
  TIER_UPGRADE: 'tier_upgrade',
  TIER_DOWNGRADE: 'tier_downgrade',
  COMMISSION_SUMMARY: 'commission_summary',
  WITHDRAWAL_APPROVED: 'withdrawal_approved',
  WITHDRAWAL_REJECTED: 'withdrawal_rejected',
};

const EMAIL_SERVICE = {
  /**
   * Send email via Edge Function
   * @param {string} to - Recipient email
   * @param {string} template - Email template name
   * @param {Object} data - Template data
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async sendEmail(to, template, data = {}) {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: { to, template, data },
      });

      if (error) {
        console.error('[EmailService] Error:', error);
        return { success: false, error: error.message };
      }

      console.log(`[EmailService] Sent ${template} email to ${to}`);
      return { success: true, id: result?.id };
    } catch (err) {
      console.error('[EmailService] Error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Send welcome email for CTV
   * @param {string} email - User email
   * @param {string} name - User name
   * @param {string} referralCode - Assigned referral code
   */
  async sendWelcomeCTV(email, name, referralCode) {
    return this.sendEmail(email, EMAIL_TEMPLATES.WELCOME_CTV, {
      name,
      referral_code: referralCode,
    });
  },

  /**
   * Send welcome email for KOL
   * @param {string} email - User email
   * @param {string} name - User name
   * @param {string} referralCode - Assigned referral code
   */
  async sendWelcomeKOL(email, name, referralCode) {
    return this.sendEmail(email, EMAIL_TEMPLATES.WELCOME_KOL, {
      name,
      referral_code: referralCode,
    });
  },

  /**
   * Send application rejected email
   * @param {string} email - User email
   * @param {string} name - User name
   * @param {string} applicationType - 'ctv' or 'kol'
   * @param {string} reason - Rejection reason
   */
  async sendApplicationRejected(email, name, applicationType, reason) {
    return this.sendEmail(email, EMAIL_TEMPLATES.APPLICATION_REJECTED, {
      name,
      application_type: applicationType,
      reason,
    });
  },

  /**
   * Send tier upgrade notification
   * @param {string} email - User email
   * @param {string} name - User name
   * @param {string} oldTier - Previous tier
   * @param {string} newTier - New tier
   */
  async sendTierUpgrade(email, name, oldTier, newTier) {
    return this.sendEmail(email, EMAIL_TEMPLATES.TIER_UPGRADE, {
      name,
      old_tier: oldTier,
      new_tier: newTier,
    });
  },

  /**
   * Send tier downgrade notification
   * @param {string} email - User email
   * @param {string} name - User name
   * @param {string} newTier - New tier after downgrade
   */
  async sendTierDowngrade(email, name, newTier) {
    return this.sendEmail(email, EMAIL_TEMPLATES.TIER_DOWNGRADE, {
      name,
      new_tier: newTier,
    });
  },

  /**
   * Send commission summary email
   * @param {string} email - User email
   * @param {Object} summaryData - Commission summary data
   */
  async sendCommissionSummary(email, summaryData) {
    return this.sendEmail(email, EMAIL_TEMPLATES.COMMISSION_SUMMARY, {
      name: summaryData.name,
      period: summaryData.period,
      total_commission: summaryData.totalCommission,
      direct_commission: summaryData.directCommission,
      sub_affiliate_commission: summaryData.subAffiliateCommission,
      order_count: summaryData.orderCount,
    });
  },

  /**
   * Send withdrawal approved email
   * @param {string} email - User email
   * @param {string} name - User name
   * @param {number} amount - Withdrawal amount
   * @param {string} bankName - Bank name
   * @param {string} accountNumber - Account number
   */
  async sendWithdrawalApproved(email, name, amount, bankName, accountNumber) {
    return this.sendEmail(email, EMAIL_TEMPLATES.WITHDRAWAL_APPROVED, {
      name,
      amount,
      bank_name: bankName,
      account_number: accountNumber,
    });
  },

  /**
   * Send withdrawal rejected email
   * @param {string} email - User email
   * @param {string} name - User name
   * @param {number} amount - Withdrawal amount
   * @param {string} reason - Rejection reason
   */
  async sendWithdrawalRejected(email, name, amount, reason) {
    return this.sendEmail(email, EMAIL_TEMPLATES.WITHDRAWAL_REJECTED, {
      name,
      amount,
      reason,
    });
  },
};

export default EMAIL_SERVICE;
export { EMAIL_TEMPLATES };
