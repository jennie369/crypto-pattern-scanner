/**
 * Presence Service for GEM Mobile
 * Handles online/offline status and last seen tracking
 *
 * CRITICAL: This service MUST update the same fields as the web app
 * to ensure real-time sync between web and mobile users.
 *
 * Web implementation reference: frontend/src/services/messaging.js
 *
 * Sync Requirements:
 * - Update `users.online_status` field ('online', 'offline', 'away')
 * - Update `users.last_seen` timestamp
 * - Debounced updates (30s intervals for periodic status)
 */

import { AppState } from 'react-native';
import { supabase } from './supabase';

class PresenceService {
  constructor() {
    this.currentStatus = 'offline';
    this.lastUpdateTime = 0;
    this.updateInterval = null;
    this.appStateSubscription = null;
    this.isInitialized = false;
    this.userId = null;

    // Debounce interval for periodic updates (30 seconds)
    this.DEBOUNCE_INTERVAL = 30000;
  }

  /**
   * Initialize presence tracking
   * Call this when user logs in
   */
  async initialize() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('PresenceService: No user logged in');
        return;
      }

      this.userId = user.id;
      this.isInitialized = true;

      // Set initial online status
      await this.setOnline();

      // Listen to app state changes
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

      // Start periodic status updates
      this.startPeriodicUpdates();

      console.log('PresenceService: Initialized for user', user.id);
    } catch (error) {
      console.error('PresenceService: Error initializing:', error);
    }
  }

  /**
   * Cleanup presence tracking
   * Call this when user logs out
   */
  async cleanup() {
    try {
      // Set offline before cleanup
      if (this.userId) {
        await this.setOffline();
      }

      // Remove app state listener
      if (this.appStateSubscription) {
        this.appStateSubscription.remove();
        this.appStateSubscription = null;
      }

      // Stop periodic updates
      this.stopPeriodicUpdates();

      this.isInitialized = false;
      this.userId = null;
      this.currentStatus = 'offline';

      console.log('PresenceService: Cleaned up');
    } catch (error) {
      console.error('PresenceService: Error cleaning up:', error);
    }
  }

  /**
   * Handle app state changes (foreground/background)
   */
  handleAppStateChange = async (nextAppState) => {
    if (!this.isInitialized) return;

    console.log('PresenceService: App state changed to', nextAppState);

    if (nextAppState === 'active') {
      // App came to foreground
      await this.setOnline();
      this.startPeriodicUpdates();
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App went to background
      await this.setAway();
      this.stopPeriodicUpdates();
    }
  };

  /**
   * Start periodic status updates (every 30 seconds)
   */
  startPeriodicUpdates() {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(() => {
      if (this.currentStatus === 'online') {
        this.updateLastSeen();
      }
    }, this.DEBOUNCE_INTERVAL);
  }

  /**
   * Stop periodic status updates
   */
  stopPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Set user as online
   * CRITICAL: Updates same fields as web
   */
  async setOnline() {
    return this.updateStatus('online');
  }

  /**
   * Set user as offline
   * CRITICAL: Updates same fields as web
   */
  async setOffline() {
    return this.updateStatus('offline');
  }

  /**
   * Set user as away (background)
   * CRITICAL: Updates same fields as web
   */
  async setAway() {
    return this.updateStatus('away');
  }

  /**
   * Update user's online status
   * CRITICAL: Updates same fields as web for sync
   * @param {string} status - 'online', 'offline', or 'away'
   */
  async updateStatus(status) {
    try {
      if (!this.userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        this.userId = user.id;
      }

      // Debounce: don't update if same status within debounce interval
      const now = Date.now();
      if (
        status === this.currentStatus &&
        now - this.lastUpdateTime < this.DEBOUNCE_INTERVAL
      ) {
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          online_status: status,
          last_seen: new Date().toISOString()
        })
        .eq('id', this.userId);

      if (error) {
        console.error('PresenceService: Error updating status:', error);
        return;
      }

      this.currentStatus = status;
      this.lastUpdateTime = now;

      console.log('PresenceService: Status updated to', status);
    } catch (error) {
      console.error('PresenceService: Error updating status:', error);
    }
  }

  /**
   * Update only last_seen timestamp (for periodic updates)
   */
  async updateLastSeen() {
    try {
      if (!this.userId) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          last_seen: new Date().toISOString()
        })
        .eq('id', this.userId);

      if (error) {
        console.error('PresenceService: Error updating last_seen:', error);
      }

      this.lastUpdateTime = Date.now();
    } catch (error) {
      console.error('PresenceService: Error updating last_seen:', error);
    }
  }

  /**
   * Get current status
   * @returns {string} Current status
   */
  getStatus() {
    return this.currentStatus;
  }

  /**
   * Check if user is online
   * @param {string} status - Status to check
   * @returns {boolean} True if online or away
   */
  isOnline(status) {
    return status === 'online' || status === 'away';
  }

  /**
   * Format last seen time for display
   * @param {string} lastSeen - ISO timestamp
   * @returns {string} Formatted string like "Active 5m ago"
   */
  formatLastSeen(lastSeen) {
    if (!lastSeen) return 'Unknown';

    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now - lastSeenDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Active now';
    if (diffMins < 60) return `Active ${diffMins}m ago`;
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    if (diffDays < 7) return `Active ${diffDays}d ago`;

    return lastSeenDate.toLocaleDateString();
  }

  /**
   * Subscribe to a user's presence changes
   * @param {string} userId - User ID to watch
   * @param {Function} callback - Callback with { online_status, last_seen }
   * @returns {Object} Subscription channel
   */
  subscribeToUser(userId, callback) {
    const channel = supabase
      .channel(`presence:user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          callback({
            online_status: payload.new.online_status,
            last_seen: payload.new.last_seen
          });
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Get online status for multiple users
   * @param {Array<string>} userIds - Array of user IDs
   * @returns {Promise<Object>} Map of userId -> { online_status, last_seen }
   */
  async getOnlineStatuses(userIds) {
    try {
      if (!userIds || userIds.length === 0) return {};

      const { data, error } = await supabase
        .from('profiles')
        .select('id, online_status, last_seen')
        .in('id', userIds);

      if (error) throw error;

      return data.reduce((acc, user) => {
        acc[user.id] = {
          online_status: user.online_status,
          last_seen: user.last_seen
        };
        return acc;
      }, {});
    } catch (error) {
      console.error('PresenceService: Error getting online statuses:', error);
      return {};
    }
  }
}

// Export singleton instance
export default new PresenceService();
