/**
 * View Service
 * API service for view tracking
 * Phase 4: View Count & Algorithm (30/12/2024)
 */

import { supabase } from './supabase';
import * as Device from 'expo-device';
import * as Application from 'expo-application';

class ViewService {
  constructor() {
    this._fingerprint = null;
  }

  /**
   * Generate device fingerprint (cached)
   */
  async getDeviceFingerprint() {
    if (this._fingerprint) {
      return this._fingerprint;
    }

    try {
      const parts = [
        Device.brand,
        Device.modelName,
        Device.osName,
        Device.osVersion,
        Application.applicationId,
      ].filter(Boolean);

      // Simple hash
      const str = parts.join('-');
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }

      this._fingerprint = Math.abs(hash).toString(16).padStart(16, '0');
      return this._fingerprint;
    } catch (error) {
      console.warn('[ViewService] Could not generate fingerprint:', error?.message);
      return null;
    }
  }

  /**
   * Record a view
   * @param {string} postId - Post ID to track
   * @param {string} userId - User ID (optional, for logged in users)
   * @returns {Promise<boolean>} true if new view, false if duplicate
   */
  async recordView(postId, userId = null) {
    if (!postId) {
      console.warn('[ViewService] recordView called without postId');
      return false;
    }

    try {
      const fingerprint = await this.getDeviceFingerprint();

      const { data, error } = await supabase.rpc('record_post_view', {
        p_post_id: postId,
        p_user_id: userId,
        p_ip_address: null, // IP is captured server-side if needed
        p_device_fingerprint: fingerprint,
        p_user_agent: null,
        p_referrer: null,
      });

      if (error) {
        // Don't throw on duplicate or missing function - just log
        if (error.code === '42883') {
          // Function doesn't exist - migration not run
          console.log('[ViewService] record_post_view function not found');
          return false;
        }
        console.warn('[ViewService] recordView error:', error?.message);
        return false;
      }

      return data === true;
    } catch (error) {
      console.warn('[ViewService] recordView failed:', error?.message);
      return false;
    }
  }

  /**
   * Get view count for a post
   * @param {string} postId - Post ID
   * @returns {Promise<{views: number, uniqueViewers: number}>}
   */
  async getViewCount(postId) {
    if (!postId) return { views: 0, uniqueViewers: 0 };

    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('views_count, unique_viewers')
        .eq('id', postId)
        .single();

      if (error) {
        console.warn('[ViewService] getViewCount error:', error?.message);
        return { views: 0, uniqueViewers: 0 };
      }

      return {
        views: data?.views_count || 0,
        uniqueViewers: data?.unique_viewers || 0,
      };
    } catch (error) {
      console.warn('[ViewService] getViewCount failed:', error?.message);
      return { views: 0, uniqueViewers: 0 };
    }
  }

  /**
   * Get view statistics for a post (grouped by day)
   * @param {string} postId - Post ID
   * @param {number} days - Number of days to include
   * @returns {Promise<Object>} Views grouped by day
   */
  async getViewStats(postId, days = 7) {
    if (!postId) return {};

    try {
      const { data, error } = await supabase
        .from('post_views')
        .select('viewed_at')
        .eq('post_id', postId)
        .gte('viewed_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('viewed_at', { ascending: true });

      if (error) {
        console.warn('[ViewService] getViewStats error:', error?.message);
        return {};
      }

      // Group by day
      const byDay = {};
      (data || []).forEach((view) => {
        const day = view.viewed_at?.split('T')[0];
        if (day) {
          byDay[day] = (byDay[day] || 0) + 1;
        }
      });

      return byDay;
    } catch (error) {
      console.warn('[ViewService] getViewStats failed:', error?.message);
      return {};
    }
  }

  /**
   * Get post scores
   * @param {string} postId - Post ID
   * @returns {Promise<{hotScore: number, trendingScore: number, qualityScore: number}>}
   */
  async getPostScores(postId) {
    if (!postId) return { hotScore: 0, trendingScore: 0, qualityScore: 0 };

    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('hot_score, trending_score, quality_score')
        .eq('id', postId)
        .single();

      if (error) {
        console.warn('[ViewService] getPostScores error:', error?.message);
        return { hotScore: 0, trendingScore: 0, qualityScore: 0 };
      }

      return {
        hotScore: data?.hot_score || 0,
        trendingScore: data?.trending_score || 0,
        qualityScore: data?.quality_score || 0,
      };
    } catch (error) {
      console.warn('[ViewService] getPostScores failed:', error?.message);
      return { hotScore: 0, trendingScore: 0, qualityScore: 0 };
    }
  }
}

export const viewService = new ViewService();
export default viewService;
