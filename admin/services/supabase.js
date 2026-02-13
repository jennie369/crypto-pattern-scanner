/**
 * Supabase Client for Admin Dashboard
 * Direct database access for real-time updates
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzc1MzYsImV4cCI6MjA3Nzc1MzUzNn0.1De0-m3GhFHUrKl-ViqX_r6bydVFoWDaW8DsxhhbjEc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============ Partnership Service ============

export const partnershipService = {
  /**
   * Get dashboard stats
   */
  async getDashboardStats() {
    try {
      // Get total partners
      const { count: totalPartners } = await supabase
        .from('affiliate_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get total KOLs
      const { count: totalKOLs } = await supabase
        .from('affiliate_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'kol')
        .eq('is_active', true);

      // Get pending CTV applications
      const { count: pendingCTV } = await supabase
        .from('partnership_applications')
        .select('*', { count: 'exact', head: true })
        .eq('application_type', 'ctv')
        .eq('status', 'pending');

      // Get pending KOL applications
      const { count: pendingKOL } = await supabase
        .from('partnership_applications')
        .select('*', { count: 'exact', head: true })
        .eq('application_type', 'kol')
        .eq('status', 'pending');

      // Get tier distribution
      const { data: tierData } = await supabase
        .from('affiliate_profiles')
        .select('ctv_tier')
        .eq('is_active', true);

      const tierDistribution = {
        bronze: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
        diamond: 0,
      };

      (tierData || []).forEach((p) => {
        const tier = p.ctv_tier || 'bronze';
        if (tierDistribution.hasOwnProperty(tier)) {
          tierDistribution[tier]++;
        }
      });

      // Get monthly commissions
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: commissionData } = await supabase
        .from('affiliate_sales')
        .select('commission_amount')
        .gte('created_at', startOfMonth.toISOString());

      const monthlyCommissions = (commissionData || []).reduce(
        (sum, s) => sum + (parseFloat(s.commission_amount) || 0),
        0
      );

      // Get today's applications
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: todayApplications } = await supabase
        .from('partnership_applications')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      return {
        totalPartners: totalPartners || 0,
        totalKOLs: totalKOLs || 0,
        totalCTVs: (totalPartners || 0) - (totalKOLs || 0),
        pendingApplications: (pendingCTV || 0) + (pendingKOL || 0),
        pendingCTV: pendingCTV || 0,
        pendingKOL: pendingKOL || 0,
        tierDistribution,
        monthlyCommissions,
        todayApplications: todayApplications || 0,
      };
    } catch (error) {
      console.error('[Partnership] getDashboardStats error:', error);
      return {
        totalPartners: 0,
        totalKOLs: 0,
        totalCTVs: 0,
        pendingApplications: 0,
        pendingCTV: 0,
        pendingKOL: 0,
        tierDistribution: { bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0 },
        monthlyCommissions: 0,
        todayApplications: 0,
      };
    }
  },

  /**
   * Get applications with filters
   */
  async getApplications({ status = 'all', type = 'all', search = '', page = 1, limit = 50 }) {
    try {
      let query = supabase
        .from('partnership_applications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      if (type !== 'all') {
        query = query.eq('application_type', type);
      }

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      return {
        applications: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('[Partnership] getApplications error:', error);
      return { applications: [], total: 0 };
    }
  },

  /**
   * Approve application
   */
  async approveApplication(applicationId) {
    try {
      // Get application details
      const { data: app, error: fetchError } = await supabase
        .from('partnership_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (fetchError) throw fetchError;

      // Update application status
      const { error: updateError } = await supabase
        .from('partnership_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Create affiliate profile
      const referralCode = (app.application_type === 'kol' ? 'KOL' : 'CTV') +
        Math.random().toString(36).substring(2, 8).toUpperCase();

      const { error: profileError } = await supabase
        .from('affiliate_profiles')
        .upsert({
          user_id: app.user_id || applicationId, // Use application ID if no user_id
          referral_code: referralCode,
          role: app.application_type,
          ctv_tier: 'bronze',
          payment_schedule: app.application_type === 'kol' ? 'biweekly' : 'monthly',
          resource_access_level: app.application_type === 'kol' ? 'kol' : 'basic',
          is_active: true,
          email: app.email,
          full_name: app.full_name,
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      return { success: true, referralCode };
    } catch (error) {
      console.error('[Partnership] approveApplication error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Reject application
   */
  async rejectApplication(applicationId, reason) {
    try {
      const { error } = await supabase
        .from('partnership_applications')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[Partnership] rejectApplication error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all partners
   */
  async getPartners({ role = 'all', tier = 'all', search = '', page = 1, limit = 50 }) {
    try {
      let query = supabase
        .from('affiliate_profiles')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (role !== 'all') {
        query = query.eq('role', role);
      }

      if (tier !== 'all') {
        query = query.eq('ctv_tier', tier);
      }

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,referral_code.ilike.%${search}%`);
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      return {
        partners: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('[Partnership] getPartners error:', error);
      return { partners: [], total: 0 };
    }
  },

  /**
   * Update partner tier
   */
  async updatePartnerTier(partnerId, newTier) {
    try {
      const { error } = await supabase
        .from('affiliate_profiles')
        .update({
          ctv_tier: newTier,
          updated_at: new Date().toISOString(),
        })
        .eq('id', partnerId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[Partnership] updatePartnerTier error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Subscribe to real-time updates
   */
  subscribeToApplications(callback) {
    return supabase
      .channel('partnership_applications_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'partnership_applications' },
        callback
      )
      .subscribe();
  },

  subscribeToPartners(callback) {
    return supabase
      .channel('affiliate_profiles_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'affiliate_profiles' },
        callback
      )
      .subscribe();
  },

  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  },
};

export default supabase;
