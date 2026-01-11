/**
 * Beta Feedback Service
 * Phase 5: Production
 *
 * User feedback collection features:
 * - Submit feedback (bug, feature, improvement, praise)
 * - Screenshot capture & upload
 * - Session data collection
 * - Feedback management
 * - Admin feedback review
 */

import { supabase } from './supabase';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// FEEDBACK TYPES
// ============================================================================

const FEEDBACK_TYPES = {
  BUG: 'bug',
  FEATURE: 'feature',
  IMPROVEMENT: 'improvement',
  PRAISE: 'praise',
  OTHER: 'other',
};

const FEEDBACK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

const FEEDBACK_STATUS = {
  NEW: 'new',
  REVIEWING: 'reviewing',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  WONT_FIX: 'wont_fix',
};

// ============================================================================
// BETA FEEDBACK SERVICE
// ============================================================================

class BetaFeedbackService {
  constructor() {
    this.sessionId = null;
    this.sessionStartTime = null;
    this.screenHistory = [];
    this.lastActions = [];
    this.maxActions = 50;
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessionStartTime = new Date().toISOString();
    this.screenHistory = [];
    this.lastActions = [];
  }

  // ============================================================================
  // SESSION TRACKING
  // ============================================================================

  trackScreen(screenName) {
    this.screenHistory.push({
      screen: screenName,
      timestamp: new Date().toISOString(),
    });

    // Keep last 20 screens
    if (this.screenHistory.length > 20) {
      this.screenHistory.shift();
    }
  }

  trackAction(actionName, details = {}) {
    this.lastActions.push({
      action: actionName,
      details,
      timestamp: new Date().toISOString(),
    });

    // Keep last N actions
    if (this.lastActions.length > this.maxActions) {
      this.lastActions.shift();
    }
  }

  // ============================================================================
  // SESSION DATA COLLECTION
  // ============================================================================

  async collectSessionData() {
    try {
      const deviceInfo = {
        brand: Device?.brand || 'unknown',
        modelName: Device?.modelName || 'unknown',
        osName: Device?.osName || Platform.OS,
        osVersion: Device?.osVersion || Platform.Version?.toString() || 'unknown',
        platformApiLevel: Device?.platformApiLevel || null,
        isDevice: Device?.isDevice ?? true,
      };

      const appInfo = {
        nativeApplicationVersion: Application?.nativeApplicationVersion || '1.0.0',
        nativeBuildVersion: Application?.nativeBuildVersion || '1',
        applicationId: Application?.applicationId || 'com.gem.mobile',
      };

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Get user profile tier
      let userTier = null;
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('tier')
          .eq('id', user.id)
          .single();
        userTier = profile?.tier;
      }

      return {
        sessionId: this.sessionId,
        sessionStartTime: this.sessionStartTime,
        sessionDuration: Date.now() - new Date(this.sessionStartTime).getTime(),
        platform: Platform.OS,
        device: deviceInfo,
        app: appInfo,
        userId: user?.id,
        userTier,
        screenHistory: this.screenHistory,
        lastActions: this.lastActions.slice(-20), // Last 20 actions
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.warn('[BetaFeedback] Collect session data error:', error);
      return {
        sessionId: this.sessionId,
        error: error.message,
      };
    }
  }

  // ============================================================================
  // SUBMIT FEEDBACK
  // ============================================================================

  async submitFeedback(options) {
    const {
      type = FEEDBACK_TYPES.OTHER,
      title,
      description,
      priority = FEEDBACK_PRIORITY.MEDIUM,
      screenshots = [],
      includeSessionData = true,
    } = options;

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Collect session data if requested
      let sessionData = null;
      if (includeSessionData) {
        sessionData = await this.collectSessionData();
      }

      // Upload screenshots if provided
      const uploadedScreenshots = [];
      for (const screenshot of screenshots) {
        const uploadedUrl = await this.uploadScreenshot(screenshot);
        if (uploadedUrl) {
          uploadedScreenshots.push(uploadedUrl);
        }
      }

      // Submit feedback
      const { data, error } = await supabase.from('beta_feedback').insert({
        user_id: user?.id,
        feedback_type: type,
        title,
        description,
        priority,
        screenshots: uploadedScreenshots,
        session_data: sessionData,
        status: FEEDBACK_STATUS.NEW,
        created_at: new Date().toISOString(),
      }).select().single();

      if (error) throw error;

      // Track feedback submission
      this.trackAction('feedback_submitted', { feedbackId: data.id, type });

      return { success: true, feedbackId: data.id };
    } catch (error) {
      console.error('[BetaFeedback] Submit error:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // SCREENSHOT HANDLING
  // ============================================================================

  async uploadScreenshot(imageUri) {
    try {
      // Generate unique filename
      const filename = `feedback/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;

      // Read file as blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('feedback-screenshots')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('feedback-screenshots')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.warn('[BetaFeedback] Screenshot upload error:', error);
      return null;
    }
  }

  // ============================================================================
  // QUICK FEEDBACK SHORTCUTS
  // ============================================================================

  async reportBug(title, description, screenshots = []) {
    return this.submitFeedback({
      type: FEEDBACK_TYPES.BUG,
      title,
      description,
      priority: FEEDBACK_PRIORITY.HIGH,
      screenshots,
      includeSessionData: true,
    });
  }

  async requestFeature(title, description) {
    return this.submitFeedback({
      type: FEEDBACK_TYPES.FEATURE,
      title,
      description,
      priority: FEEDBACK_PRIORITY.MEDIUM,
      includeSessionData: false,
    });
  }

  async suggestImprovement(title, description) {
    return this.submitFeedback({
      type: FEEDBACK_TYPES.IMPROVEMENT,
      title,
      description,
      priority: FEEDBACK_PRIORITY.LOW,
      includeSessionData: false,
    });
  }

  async sendPraise(message) {
    return this.submitFeedback({
      type: FEEDBACK_TYPES.PRAISE,
      title: 'User Praise',
      description: message,
      priority: FEEDBACK_PRIORITY.LOW,
      includeSessionData: false,
    });
  }

  // ============================================================================
  // USER FEEDBACK HISTORY
  // ============================================================================

  async getMyFeedback(limit = 20) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('beta_feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[BetaFeedback] Get my feedback error:', error);
      return [];
    }
  }

  // ============================================================================
  // ADMIN FUNCTIONS
  // ============================================================================

  async getAllFeedback(filters = {}) {
    try {
      let query = supabase
        .from('beta_feedback')
        .select('*, user_profiles!inner(username, avatar_url)')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.type) {
        query = query.eq('feedback_type', filters.type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[BetaFeedback] Get all feedback error:', error);
      return [];
    }
  }

  async updateFeedbackStatus(feedbackId, status, notes = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const updateData = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === FEEDBACK_STATUS.RESOLVED) {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = user?.id;
        updateData.resolution_notes = notes;
      }

      const { error } = await supabase
        .from('beta_feedback')
        .update(updateData)
        .eq('id', feedbackId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[BetaFeedback] Update status error:', error);
      return { success: false, error: error.message };
    }
  }

  async getFeedbackStats() {
    try {
      const { data, error } = await supabase
        .from('beta_feedback')
        .select('feedback_type, status, priority');

      if (error) throw error;

      // Calculate stats
      const stats = {
        total: data?.length || 0,
        byType: {},
        byStatus: {},
        byPriority: {},
      };

      data?.forEach((item) => {
        // By type
        stats.byType[item.feedback_type] = (stats.byType[item.feedback_type] || 0) + 1;
        // By status
        stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
        // By priority
        stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('[BetaFeedback] Get stats error:', error);
      return { total: 0, byType: {}, byStatus: {}, byPriority: {} };
    }
  }

  // ============================================================================
  // LOCAL DRAFTS
  // ============================================================================

  async saveDraft(feedbackData) {
    try {
      const drafts = await this.getDrafts();
      const draftId = `draft_${Date.now()}`;
      drafts.push({
        id: draftId,
        ...feedbackData,
        savedAt: new Date().toISOString(),
      });

      await AsyncStorage.setItem('feedback_drafts', JSON.stringify(drafts));
      return draftId;
    } catch (error) {
      console.warn('[BetaFeedback] Save draft error:', error);
      return null;
    }
  }

  async getDrafts() {
    try {
      const draftsJson = await AsyncStorage.getItem('feedback_drafts');
      return draftsJson ? JSON.parse(draftsJson) : [];
    } catch (error) {
      return [];
    }
  }

  async deleteDraft(draftId) {
    try {
      const drafts = await this.getDrafts();
      const filtered = drafts.filter((d) => d.id !== draftId);
      await AsyncStorage.setItem('feedback_drafts', JSON.stringify(filtered));
    } catch (error) {
      console.warn('[BetaFeedback] Delete draft error:', error);
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  cleanup() {
    this.screenHistory = [];
    this.lastActions = [];
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const betaFeedbackService = new BetaFeedbackService();
export const FEEDBACK_TYPES_ENUM = FEEDBACK_TYPES;
export const FEEDBACK_PRIORITY_ENUM = FEEDBACK_PRIORITY;
export const FEEDBACK_STATUS_ENUM = FEEDBACK_STATUS;

export default betaFeedbackService;
