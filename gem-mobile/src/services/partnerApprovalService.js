/**
 * Partner Approval Service
 * Handles all post-approval actions for CTV and KOL
 * Reference: GEM_PARTNERSHIP_IMPLEMENTATION_PHASE5.md
 */

import { supabase } from './supabase';
import PARTNER_NOTIFICATION_SERVICE from './partnerNotificationService';
import {
  CTV_TIER_CONFIG,
  KOL_CONFIG,
  NOTIFICATION_TYPES,
  formatTierDisplay,
} from '../constants/partnershipConstants';

const PARTNER_APPROVAL_SERVICE = {
  /**
   * Handle CTV approval (called by auto-approve or admin)
   * @param {string} applicationId - ID of the partnership application
   * @param {string|null} adminId - Admin user ID (null for auto-approve)
   */
  async handleCTVApproval(applicationId, adminId = null) {
    try {
      // 1. Get application
      const { data: app, error: appError } = await supabase
        .from('partnership_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (appError) throw appError;
      if (!app) throw new Error('Application not found');

      // Check if already approved
      if (app.status === 'approved') {
        console.log('[PartnerApprovalService] Application already approved');
        return { success: true, message: 'Already approved' };
      }

      // 2. Update application status
      await supabase
        .from('partnership_applications')
        .update({
          status: 'approved',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminId ? 'Duyệt bởi Admin' : 'Tự động duyệt sau 3 ngày',
        })
        .eq('id', applicationId);

      // 3. Generate referral code
      const referralCode = await this.generateUniqueReferralCode('CTV');

      // 4. Get referrer if exists
      let referrerId = null;
      if (app.referred_by_code) {
        const { data: referrer } = await supabase
          .from('affiliate_profiles')
          .select('user_id')
          .eq('referral_code', app.referred_by_code)
          .single();
        referrerId = referrer?.user_id;
      }

      // 5. Create/Update affiliate profile
      const profileData = {
        user_id: app.user_id,
        referral_code: referralCode,
        role: 'ctv',
        ctv_tier: 'bronze',
        referred_by: referrerId,
        payment_schedule: 'monthly',
        resource_access_level: 'basic',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from('affiliate_profiles')
        .upsert(profileData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (profileError) {
        console.error('[PartnerApprovalService] Profile upsert error:', profileError);
      }

      // 6. Send push + email notifications via Phase 5 service
      await PARTNER_NOTIFICATION_SERVICE.notifyApplicationApproved(
        app.user_id,
        app.email,
        app.full_name,
        'ctv',
        referralCode
      );

      // 7. Mark for onboarding
      await this.markForOnboarding(app.user_id, 'ctv');

      // 10. If has referrer, notify them
      if (referrerId) {
        await this.notifyReferrer(referrerId, app.full_name, 'ctv');
      }

      console.log('[PartnerApprovalService] CTV approval completed:', {
        applicationId,
        userId: app.user_id,
        referralCode,
      });

      return { success: true, referralCode };
    } catch (err) {
      console.error('[PartnerApprovalService] handleCTVApproval error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Handle KOL approval (admin only)
   * @param {string} applicationId - ID of the partnership application
   * @param {string} adminId - Admin user ID
   * @param {string} notes - Admin notes
   */
  async handleKOLApproval(applicationId, adminId, notes = '') {
    try {
      // 1. Get application
      const { data: app, error: appError } = await supabase
        .from('partnership_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (appError) throw appError;
      if (!app) throw new Error('Application not found');

      // Check if already approved
      if (app.status === 'approved') {
        console.log('[PartnerApprovalService] Application already approved');
        return { success: true, message: 'Already approved' };
      }

      // 2. Update application status
      await supabase
        .from('partnership_applications')
        .update({
          status: 'approved',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          admin_notes: notes || 'KOL approved by admin',
        })
        .eq('id', applicationId);

      // 3. Update KOL verification (table may not exist yet)
      try {
        await supabase
          .from('kol_verification')
          .update({
            verification_status: 'verified',
            verified_by: adminId,
            verified_at: new Date().toISOString(),
          })
          .eq('application_id', applicationId);
      } catch (_) {
        // kol_verification table may not exist — non-critical
      }

      // 4. Check if already CTV
      const { data: existingProfile } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('user_id', app.user_id)
        .single();

      // 5. Generate KOL referral code if needed
      const referralCode = existingProfile?.referral_code || await this.generateUniqueReferralCode('KOL');

      // 6. Update affiliate profile
      if (existingProfile) {
        // Already CTV -> Add KOL flag (keep existing tier)
        await supabase
          .from('affiliate_profiles')
          .update({
            is_kol: true,
            kol_approved_at: new Date().toISOString(),
            resource_access_level: 'kol',
            payment_schedule: 'biweekly',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', app.user_id);
      } else {
        // New -> Create as KOL
        await supabase
          .from('affiliate_profiles')
          .insert({
            user_id: app.user_id,
            referral_code: referralCode,
            role: 'kol',
            ctv_tier: 'bronze',
            is_kol: true,
            kol_approved_at: new Date().toISOString(),
            payment_schedule: 'biweekly',
            resource_access_level: 'kol',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
      }

      // 7. Send push + email notifications via Phase 5 service
      await PARTNER_NOTIFICATION_SERVICE.notifyApplicationApproved(
        app.user_id,
        app.email,
        app.full_name,
        'kol',
        referralCode
      );

      // 8. Mark for KOL onboarding
      await this.markForOnboarding(app.user_id, 'kol');

      console.log('[PartnerApprovalService] KOL approval completed:', {
        applicationId,
        userId: app.user_id,
        referralCode,
        wasCTV: !!existingProfile,
      });

      return { success: true, referralCode };
    } catch (err) {
      console.error('[PartnerApprovalService] handleKOLApproval error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Handle application rejection
   * @param {string} applicationId - Application ID
   * @param {string} adminId - Admin user ID
   * @param {string} reason - Rejection reason
   */
  async handleRejection(applicationId, adminId, reason = '') {
    try {
      const { data: app, error: appError } = await supabase
        .from('partnership_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (appError) throw appError;

      // Update application status
      await supabase
        .from('partnership_applications')
        .update({
          status: 'rejected',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          admin_notes: reason,
        })
        .eq('id', applicationId);

      // Send push + email notifications via Phase 5 service
      await PARTNER_NOTIFICATION_SERVICE.notifyApplicationRejected(
        app.user_id,
        app.email,
        app.full_name,
        app.application_type,
        reason || 'Hồ sơ chưa đáp ứng yêu cầu tại thời điểm này.'
      );

      return { success: true };
    } catch (err) {
      console.error('[PartnerApprovalService] handleRejection error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Generate unique referral code
   * @param {string} prefix - Prefix (CTV, KOL, GEM)
   * @returns {Promise<string>} Unique referral code
   */
  async generateUniqueReferralCode(prefix = 'GEM') {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      let code = prefix;
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Check if code already exists
      const { data: existing } = await supabase
        .from('affiliate_profiles')
        .select('id')
        .eq('referral_code', code)
        .single();

      if (!existing) {
        return code;
      }

      attempts++;
    }

    // Fallback with timestamp
    return `${prefix}${Date.now().toString(36).toUpperCase()}`;
  },

  /**
   * Create in-app notification
   * @param {string} userId - User ID
   * @param {Object} options - Notification options
   */
  async createNotification(userId, { type, title, message, metadata = {} }) {
    try {
      await supabase
        .from('partner_notifications')
        .insert({
          user_id: userId,
          notification_type: type,
          title,
          message,
          metadata,
          is_read: false,
          created_at: new Date().toISOString(),
        });
    } catch (err) {
      console.error('[PartnerApprovalService] createNotification error:', err);
    }
  },

  /**
   * Mark user for onboarding on next login
   * @param {string} userId - User ID
   * @param {string} type - 'ctv' or 'kol'
   */
  async markForOnboarding(userId, type) {
    try {
      await supabase
        .from('profiles')
        .update({
          pending_onboarding: type === 'kol' ? 'kol_partner' : 'ctv_partner',
        })
        .eq('id', userId);
    } catch (err) {
      console.error('[PartnerApprovalService] markForOnboarding error:', err);
    }
  },

  /**
   * Notify referrer about new sub-affiliate
   * @param {string} referrerId - Referrer user ID
   * @param {string} newPartnerName - New partner's name
   * @param {string} type - 'ctv' or 'kol'
   */
  async notifyReferrer(referrerId, newPartnerName, type) {
    try {
      // Send push notification via Phase 5 service
      await PARTNER_NOTIFICATION_SERVICE.sendPush({
        userId: referrerId,
        notificationType: 'sub_affiliate_joined',
        title: '👥 Đối tác mới từ giới thiệu của bạn!',
        body: `${newPartnerName} đã trở thành ${type === 'kol' ? 'KOL' : 'CTV'} thành công.`,
        data: { partner_name: newPartnerName, partner_type: type },
        channelId: 'partnership',
      });
    } catch (err) {
      console.error('[PartnerApprovalService] notifyReferrer error:', err);
    }
  },

  /**
   * Process all pending auto-approve CTV applications
   * Called by scheduled job
   * @returns {Promise<Object>} { approved: number, errors: number }
   */
  async processAutoApproves() {
    try {
      const now = new Date().toISOString();

      // Get pending CTV applications past auto-approve time
      const { data: pendingApps, error } = await supabase
        .from('partnership_applications')
        .select('*')
        .eq('application_type', 'ctv')
        .eq('status', 'pending')
        .lte('auto_approve_at', now);

      if (error) throw error;

      let approved = 0;
      let errors = 0;

      for (const app of (pendingApps || [])) {
        const result = await this.handleCTVApproval(app.id, null);
        if (result.success) {
          approved++;
        } else {
          errors++;
        }
      }

      console.log('[PartnerApprovalService] Auto-approve completed:', { approved, errors });
      return { approved, errors };
    } catch (err) {
      console.error('[PartnerApprovalService] processAutoApproves error:', err);
      return { approved: 0, errors: 1, error: err.message };
    }
  },
};

export default PARTNER_APPROVAL_SERVICE;
