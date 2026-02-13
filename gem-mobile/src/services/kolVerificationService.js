/**
 * KOL Verification Service
 * Handles KOL registration, KYC uploads, and verification
 * Reference: GEM_PARTNERSHIP_IMPLEMENTATION_PHASE2.md
 */

import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import {
  KOL_CONFIG,
  calculateTotalFollowers,
  checkKOLEligibility,
} from '../constants/partnershipConstants';

// KOL verification bucket - uses same as forum-images but dedicated path
const VERIFICATION_BUCKET = 'forum-images';

const kolVerificationService = {
  /**
   * Check if user is currently a CTV
   * @param {string} userId
   * @returns {Object} { isCTV, tier, isActive }
   */
  async checkIsCTV(userId) {
    try {
      const { data, error } = await supabase
        .from('affiliate_profiles')
        .select('role, ctv_tier, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) {
        return { isCTV: false, tier: null, isActive: false };
      }

      return {
        isCTV: data.role === 'ctv',
        tier: data.ctv_tier,
        isActive: data.is_active,
      };
    } catch (err) {
      console.error('[KOLVerificationService] checkIsCTV error:', err);
      return { isCTV: false, tier: null, isActive: false };
    }
  },

  /**
   * Upload verification image (CCCD or portrait)
   * @param {string} userId
   * @param {string} imageUri - Local image URI
   * @param {string} type - 'id_front' | 'id_back' | 'portrait'
   * @returns {Object} { success, url, path, error }
   */
  async uploadVerificationImage(userId, imageUri, type) {
    try {
      if (!imageUri) {
        throw new Error('No image URI provided');
      }

      console.log('[KOLVerificationService] Uploading:', type, imageUri.substring(0, 50));

      // Compress image first
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert to ArrayBuffer
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const arrayBuffer = bytes.buffer;

      // Generate file path
      const timestamp = Date.now();
      const fileName = `kol_verification/${userId}/${type}_${timestamp}.jpg`;

      console.log('[KOLVerificationService] Uploading to:', VERIFICATION_BUCKET, fileName);

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(VERIFICATION_BUCKET)
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true, // Allow overwrite in case of retry
        });

      if (error) {
        console.error('[KOLVerificationService] Storage error:', error);
        throw new Error(error.message || 'Storage upload failed');
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(VERIFICATION_BUCKET)
        .getPublicUrl(data.path);

      console.log('[KOLVerificationService] Upload success:', urlData.publicUrl);

      return {
        success: true,
        url: urlData.publicUrl,
        path: fileName,
      };
    } catch (err) {
      console.error('[KOLVerificationService] uploadVerificationImage error:', err);
      return {
        success: false,
        error: err.message || 'Upload thất bại. Vui lòng thử lại.',
      };
    }
  },

  /**
   * Create KOL verification and application
   * @param {Object} data - Verification data
   * @returns {Object} { success, verification, application, eligibility, error }
   */
  async createVerification(data) {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      const userId = authUser?.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Calculate total followers
      const socialPlatforms = {
        youtube: parseInt(data.youtube_followers) || 0,
        facebook: parseInt(data.facebook_followers) || 0,
        instagram: parseInt(data.instagram_followers) || 0,
        tiktok: parseInt(data.tiktok_followers) || 0,
        twitter: parseInt(data.twitter_followers) || 0,
        discord: parseInt(data.discord_members) || 0,
        telegram: parseInt(data.telegram_members) || 0,
      };

      const totalFollowers = calculateTotalFollowers(socialPlatforms);

      // Check eligibility - CHI DUA VAO FOLLOWERS
      // Khong co ngoai le cho CTV
      const eligibility = checkKOLEligibility(totalFollowers);

      if (!eligibility.eligible) {
        throw new Error(eligibility.reason);
      }

      // Check if already CTV (for reference only, not for eligibility)
      const { isCTV, tier } = await this.checkIsCTV(userId);

      // Check if already has pending KOL application
      const { data: existingApp } = await supabase
        .from('partnership_applications')
        .select('id, status')
        .eq('user_id', userId)
        .eq('application_type', 'kol')
        .eq('status', 'pending')
        .maybeSingle();

      if (existingApp) {
        throw new Error('Ban da co don dang ky KOL dang cho duyet');
      }

      // Create verification record
      const verificationData = {
        user_id: userId,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        id_type: data.id_type || 'cccd',
        id_number: data.id_number,
        id_front_image_url: data.id_front_image_url,
        id_back_image_url: data.id_back_image_url,
        portrait_image_url: data.portrait_image_url,
        youtube_url: data.youtube_url,
        youtube_followers: socialPlatforms.youtube,
        facebook_url: data.facebook_url,
        facebook_followers: socialPlatforms.facebook,
        instagram_url: data.instagram_url,
        instagram_followers: socialPlatforms.instagram,
        tiktok_url: data.tiktok_url,
        tiktok_followers: socialPlatforms.tiktok,
        twitter_url: data.twitter_url,
        twitter_followers: socialPlatforms.twitter,
        discord_url: data.discord_url,
        discord_members: socialPlatforms.discord,
        telegram_url: data.telegram_url,
        telegram_members: socialPlatforms.telegram,
        verification_status: 'pending',
      };

      const { data: verification, error: verError } = await supabase
        .from('kol_verification')
        .insert(verificationData)
        .select()
        .single();

      if (verError) {
        console.error('[KOLVerificationService] kol_verification insert error:', verError);
        // Continue without verification record if table doesn't exist
      }

      // Create partnership application
      const applicationData = {
        user_id: userId,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        application_type: 'kol',
        social_platforms: socialPlatforms,
        total_followers: totalFollowers,
        social_proof_urls: [
          data.youtube_url,
          data.facebook_url,
          data.instagram_url,
          data.tiktok_url,
          data.twitter_url,
          data.discord_url,
          data.telegram_url,
        ].filter(Boolean),
        referred_by_code: data.referral_code || null,
        is_ctv_member: isCTV,
        ctv_tier_at_application: tier,
        status: 'pending',
      };

      const { data: application, error: appError } = await supabase
        .from('partnership_applications')
        .insert(applicationData)
        .select()
        .single();

      if (appError) throw appError;

      // Update verification with application_id if verification was created
      if (verification?.id) {
        await supabase
          .from('kol_verification')
          .update({ application_id: application.id })
          .eq('id', verification.id);
      }

      // Notify admins (in-app + push)
      await this.notifyAdminsNewKOLApplication({
        applicationId: application.id,
        fullName: data.full_name,
        totalFollowers,
        userId,
        email: data.email,
      });

      return {
        success: true,
        verification,
        application,
        eligibility,
      };
    } catch (err) {
      console.error('[KOLVerificationService] createVerification error:', err);
      return {
        success: false,
        error: err.message || 'Verification creation failed',
      };
    }
  },

  /**
   * Notify admins about new KOL application
   * Creates in-app notifications AND sends push notifications via Edge Function
   */
  async notifyAdminsNewKOLApplication({ applicationId, fullName, totalFollowers, userId, email }) {
    try {
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .or('role.eq.admin,is_admin.eq.true');

      if (!admins || admins.length === 0) {
        console.log('[KOLVerificationService] No admins found');
        return;
      }

      // Create in-app notifications for each admin
      const notifications = admins.map((admin) => ({
        user_id: admin.id,
        type: 'admin_kol_application',
        title: '🌟 Đơn đăng ký KOL mới!',
        message: `${fullName} (${totalFollowers.toLocaleString()} followers) đã đăng ký KOL. Vui lòng xem xét.`,
        data: JSON.stringify({
          application_id: applicationId,
          applicant_id: userId,
          screen: 'AdminApplications',
        }),
        read: false,
      }));

      await supabase.from('forum_notifications').insert(notifications);
      console.log('[KOLVerificationService] Admin in-app notifications sent:', admins.length);

      // ========== SEND PUSH NOTIFICATIONS VIA EDGE FUNCTION ==========
      try {
        const { data: pushResult, error: pushError } = await supabase.functions.invoke(
          'notify-admins-partnership',
          {
            body: {
              event_type: 'new_application',
              data: {
                application_id: applicationId,
                application_type: 'kol',
                user_id: userId,
                full_name: fullName,
                email: email,
                total_followers: totalFollowers,
              },
            },
          }
        );

        if (pushError) {
          console.error('[KOLVerificationService] Push notification error:', pushError);
        } else {
          console.log('[KOLVerificationService] Push notifications sent:', pushResult);
        }
      } catch (pushErr) {
        console.error('[KOLVerificationService] Edge function error:', pushErr);
        // Don't fail the whole operation if push fails
      }
      // ================================================================

    } catch (err) {
      console.error('[KOLVerificationService] notifyAdminsNewKOLApplication error:', err);
    }
  },

  /**
   * Get verification status for user
   * @param {string} userId
   * @returns {Object} { exists, verification, applicationStatus, rejectionReason }
   */
  async getVerificationStatus(userId) {
    try {
      // First try kol_verification table
      const { data: verification, error: verError } = await supabase
        .from('kol_verification')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Then get application status
      const { data: application, error: appError } = await supabase
        .from('partnership_applications')
        .select('id, status, rejection_reason, reviewed_at')
        .eq('user_id', userId)
        .eq('application_type', 'kol')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!verification && !application) {
        return { exists: false };
      }

      return {
        exists: true,
        verification,
        applicationStatus: application?.status,
        rejectionReason: application?.rejection_reason,
        reviewedAt: application?.reviewed_at,
      };
    } catch (err) {
      console.error('[KOLVerificationService] getVerificationStatus error:', err);
      return { exists: false, error: err.message };
    }
  },

  /**
   * Admin: Approve KOL application
   * @param {string} applicationId
   * @param {string} adminId
   * @param {string} notes
   */
  async approveKOL(applicationId, adminId, notes = '') {
    try {
      // Update application
      const { data: app, error: appError } = await supabase
        .from('partnership_applications')
        .update({
          status: 'approved',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          admin_notes: notes,
        })
        .eq('id', applicationId)
        .select('user_id, is_ctv_member, ctv_tier_at_application, referred_by_code')
        .single();

      if (appError) throw appError;

      // Update verification status
      await supabase
        .from('kol_verification')
        .update({
          verification_status: 'verified',
          verified_by: adminId,
          verified_at: new Date().toISOString(),
        })
        .eq('application_id', applicationId);

      // Find referrer if exists
      let referrerId = null;
      if (app.referred_by_code) {
        const { data: referrer } = await supabase
          .from('affiliate_profiles')
          .select('user_id')
          .eq('referral_code', app.referred_by_code)
          .maybeSingle();
        referrerId = referrer?.user_id;
      }

      // Check if user already has affiliate profile
      const { data: existingProfile } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('user_id', app.user_id)
        .maybeSingle();

      if (existingProfile) {
        // User already CTV -> Add KOL role
        await supabase
          .from('affiliate_profiles')
          .update({
            role: 'kol',
            kol_approved_at: new Date().toISOString(),
            resource_access_level: 'kol',
            payment_schedule: 'biweekly',
          })
          .eq('user_id', app.user_id);
      } else {
        // New user -> Create as KOL
        const referralCode = 'KOL' + Math.random().toString(36).substring(2, 10).toUpperCase();
        await supabase.from('affiliate_profiles').insert({
          user_id: app.user_id,
          referral_code: referralCode,
          role: 'kol',
          ctv_tier: 'bronze',
          kol_approved_at: new Date().toISOString(),
          payment_schedule: 'biweekly',
          resource_access_level: 'kol',
          referred_by: referrerId,
          is_active: true,
        });
      }

      // Create notification
      await supabase.from('partner_notifications').insert({
        user_id: app.user_id,
        notification_type: 'application_approved',
        title: '🎉 Chuc mung! Ban da tro thanh KOL Affiliate',
        message: 'Don dang ky KOL da duoc duyet. Ban co the bat dau nhan hoa hong 20% + 3.5% sub-affiliate!',
        related_id: applicationId,
        related_type: 'application',
        metadata: { role: 'kol' },
      });

      return { success: true };
    } catch (err) {
      console.error('[KOLVerificationService] approveKOL error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Admin: Reject KOL application
   * @param {string} applicationId
   * @param {string} adminId
   * @param {string} reason
   */
  async rejectKOL(applicationId, adminId, reason) {
    try {
      const { data: app, error } = await supabase
        .from('partnership_applications')
        .update({
          status: 'rejected',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', applicationId)
        .select('user_id')
        .single();

      if (error) throw error;

      // Update verification status
      await supabase
        .from('kol_verification')
        .update({
          verification_status: 'rejected',
          rejection_reason: reason,
        })
        .eq('application_id', applicationId);

      // Create notification
      await supabase.from('partner_notifications').insert({
        user_id: app.user_id,
        notification_type: 'application_rejected',
        title: 'Don dang ky KOL chua duoc duyet',
        message: `Ly do: ${reason}. Ban co the dang ky lai sau 30 ngay.`,
        related_id: applicationId,
        related_type: 'application',
      });

      return { success: true };
    } catch (err) {
      console.error('[KOLVerificationService] rejectKOL error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Get pending KOL applications (Admin)
   * @param {number} limit
   * @returns {Object} { success, applications }
   */
  async getPendingKOLApplications(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('partnership_applications')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('application_type', 'kol')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return { success: true, applications: data || [] };
    } catch (err) {
      console.error('[KOLVerificationService] getPendingKOLApplications error:', err);
      return { success: false, applications: [] };
    }
  },
};

export default kolVerificationService;
