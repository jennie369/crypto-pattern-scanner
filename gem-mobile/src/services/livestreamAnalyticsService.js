/**
 * Livestream Analytics Service
 * Phase 4: Intelligence Layer
 *
 * Extended analytics service for livestream-specific events:
 * - Viewer tracking (join, leave, watch duration)
 * - Comment tracking with intent/emotion
 * - Product interactions
 * - Gift events
 * - Recommendation events
 * - Proactive engagement events
 * - A/B test events
 */

import { supabase } from './supabase';

class LivestreamAnalyticsService {
  constructor() {
    this.sessionId = null;
    this.userId = null;
    this.livestreamSessionId = null;
    this.eventQueue = [];
    this.flushInterval = 10000; // 10 seconds
    this.maxQueueSize = 50;
    this.joinTime = null;

    // Start auto-flush
    this.startAutoFlush();
  }

  // ============================================================================
  // BASE METHODS
  // ============================================================================

  setUser(userId) {
    this.userId = userId;
  }

  setSession(sessionId) {
    this.sessionId = sessionId;
  }

  setLivestreamSession(livestreamSessionId) {
    this.livestreamSessionId = livestreamSessionId;
  }

  async track(eventName, properties = {}) {
    const event = {
      event_name: eventName,
      user_id: this.userId,
      session_id: this.sessionId,
      livestream_session_id: this.livestreamSessionId,
      properties,
      timestamp: new Date().toISOString(),
      platform: 'mobile',
    };

    this.eventQueue.push(event);

    // Auto flush if queue is full
    if (this.eventQueue.length >= this.maxQueueSize) {
      await this.flush();
    }
  }

  async flush() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await supabase.from('analytics_events').insert(events);
    } catch (error) {
      console.error('[LivestreamAnalytics] Flush error:', error);
      // Re-add failed events
      this.eventQueue = [...events, ...this.eventQueue];
    }
  }

  startAutoFlush() {
    this.flushIntervalId = setInterval(() => this.flush(), this.flushInterval);
  }

  stopAutoFlush() {
    if (this.flushIntervalId) {
      clearInterval(this.flushIntervalId);
    }
  }

  // ============================================================================
  // LIVESTREAM VIEWER EVENTS
  // ============================================================================

  async trackLivestreamJoin(livestreamSessionId, platform = 'gemral') {
    this.livestreamSessionId = livestreamSessionId;
    this.joinTime = Date.now();

    await this.track('livestream_join', {
      livestream_session_id: livestreamSessionId,
      platform,
      join_time: new Date().toISOString(),
    });
  }

  async trackLivestreamLeave(livestreamSessionId) {
    const watchDurationSeconds = this.joinTime
      ? Math.floor((Date.now() - this.joinTime) / 1000)
      : 0;

    await this.track('livestream_leave', {
      livestream_session_id: livestreamSessionId,
      watch_duration_seconds: watchDurationSeconds,
      leave_time: new Date().toISOString(),
    });

    // Flush immediately on leave
    await this.flush();
  }

  // ============================================================================
  // COMMENT EVENTS
  // ============================================================================

  async trackComment(livestreamSessionId, commentId, intent, emotion) {
    await this.track('livestream_comment', {
      livestream_session_id: livestreamSessionId,
      comment_id: commentId,
      intent,
      emotion,
    });
  }

  // ============================================================================
  // PRODUCT INTERACTION EVENTS
  // ============================================================================

  async trackProductView(livestreamSessionId, productId, source) {
    await this.track('product_view', {
      livestream_session_id: livestreamSessionId,
      product_id: productId,
      source, // 'overlay', 'recommendation', 'mention', 'carousel'
      view_time: new Date().toISOString(),
    });
  }

  async trackProductClick(livestreamSessionId, productId, source) {
    await this.track('product_click', {
      livestream_session_id: livestreamSessionId,
      product_id: productId,
      source,
    });
  }

  async trackAddToCart(livestreamSessionId, productId, variantId, quantity, source) {
    await this.track('add_to_cart', {
      livestream_session_id: livestreamSessionId,
      product_id: productId,
      variant_id: variantId,
      quantity,
      source,
    });
  }

  async trackCheckoutStart(livestreamSessionId, cartValue) {
    await this.track('checkout_start', {
      livestream_session_id: livestreamSessionId,
      cart_value: cartValue,
    });
  }

  async trackPurchase(livestreamSessionId, orderId, orderValue, productIds) {
    await this.track('purchase', {
      livestream_session_id: livestreamSessionId,
      order_id: orderId,
      order_value: orderValue,
      product_ids: productIds,
    });
  }

  // ============================================================================
  // GIFT EVENTS
  // ============================================================================

  async trackGiftSent(livestreamSessionId, giftId, giftValue, platform = 'gemral') {
    await this.track('gift_sent', {
      livestream_session_id: livestreamSessionId,
      gift_id: giftId,
      gift_value: giftValue,
      platform,
    });
  }

  async trackGiftReceived(livestreamSessionId, giftId, giftValue, senderId) {
    await this.track('gift_received', {
      livestream_session_id: livestreamSessionId,
      gift_id: giftId,
      gift_value: giftValue,
      sender_id: senderId,
    });
  }

  // ============================================================================
  // RECOMMENDATION EVENTS
  // ============================================================================

  async trackRecommendationView(livestreamSessionId, strategy, productIds) {
    await this.track('recommendation_view', {
      livestream_session_id: livestreamSessionId,
      strategy,
      product_ids: productIds,
    });
  }

  async trackRecommendationClick(livestreamSessionId, strategy, productId, position) {
    await this.track('recommendation_click', {
      livestream_session_id: livestreamSessionId,
      strategy,
      product_id: productId,
      position,
    });
  }

  // ============================================================================
  // PROACTIVE ENGAGEMENT EVENTS
  // ============================================================================

  async trackProactiveEngagement(livestreamSessionId, triggerType, action) {
    await this.track('proactive_engagement', {
      livestream_session_id: livestreamSessionId,
      trigger_type: triggerType,
      action, // 'shown', 'clicked', 'dismissed', 'converted'
    });
  }

  // ============================================================================
  // A/B TEST EVENTS
  // ============================================================================

  async trackExperimentAssignment(experimentId, variantId) {
    await this.track('experiment_assignment', {
      experiment_id: experimentId,
      variant_id: variantId,
    });
  }

  async trackExperimentConversion(experimentId, variantId, conversionType, value) {
    await this.track('experiment_conversion', {
      experiment_id: experimentId,
      variant_id: variantId,
      conversion_type: conversionType,
      value,
    });
  }

  // ============================================================================
  // USER BEHAVIOR AGGREGATION
  // ============================================================================

  async updateUserBehavior(userId) {
    try {
      // Get events from last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('event_name, properties')
        .eq('user_id', userId)
        .gte('timestamp', thirtyDaysAgo);

      if (error || !events || events.length === 0) return null;

      // Aggregate metrics
      const behavior = {
        total_sessions: new Set(
          events
            .filter((e) => e.event_name === 'livestream_join')
            .map((e) => e.properties?.livestream_session_id)
        ).size,
        total_comments: events.filter((e) => e.event_name === 'livestream_comment').length,
        total_purchases: events.filter((e) => e.event_name === 'purchase').length,
        total_spent: events
          .filter((e) => e.event_name === 'purchase')
          .reduce((sum, e) => sum + (e.properties?.order_value || 0), 0),
        products_viewed: [
          ...new Set(
            events
              .filter((e) => e.event_name === 'product_view')
              .map((e) => e.properties?.product_id)
          ),
        ],
        products_purchased: [
          ...new Set(
            events
              .filter((e) => e.event_name === 'purchase')
              .flatMap((e) => e.properties?.product_ids || [])
          ),
        ],
        active_hours: this.calculateActiveHours(events),
        topics_engaged: this.extractTopics(events),
        last_activity: new Date().toISOString(),
      };

      // Update or insert user behavior
      const { error: upsertError } = await supabase.from('user_behavior').upsert({
        user_id: userId,
        ...behavior,
        updated_at: new Date().toISOString(),
      });

      if (upsertError) {
        console.error('[LivestreamAnalytics] Update behavior error:', upsertError);
      }

      return behavior;
    } catch (error) {
      console.error('[LivestreamAnalytics] updateUserBehavior error:', error);
      return null;
    }
  }

  calculateActiveHours(events) {
    const hourCounts = {};
    events.forEach((e) => {
      if (e.properties?.join_time) {
        const hour = new Date(e.properties.join_time).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    // Return top 4 active hours
    return Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([hour]) => parseInt(hour));
  }

  extractTopics(events) {
    const topics = events.filter((e) => e.properties?.intent).map((e) => e.properties.intent);

    const topicCounts = {};
    topics.forEach((t) => {
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    });

    return Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  cleanup() {
    this.stopAutoFlush();
    this.flush();
  }
}

export const livestreamAnalyticsService = new LivestreamAnalyticsService();
export default livestreamAnalyticsService;
