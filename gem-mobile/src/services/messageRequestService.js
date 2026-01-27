/**
 * Message Request Service
 * Handles message requests from strangers (TikTok-style inbox)
 *
 * Features:
 * - Get pending/accepted/declined message requests
 * - Accept/Decline message requests
 * - Real-time subscription to new requests
 * - Check if conversation is a message request
 *
 * @module messageRequestService
 */

import { supabase } from './supabase';

class MessageRequestService {
  constructor() {
    this.requestsSubscription = null;
  }

  // =====================================================
  // GET MESSAGE REQUESTS
  // =====================================================

  /**
   * Get message requests for current user
   * @param {string} status - Filter by status: 'pending', 'accepted', 'declined', 'blocked', or 'all'
   * @returns {Promise<Array>} List of message requests with requester info
   */
  async getMessageRequests(status = 'pending') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      let query = supabase
        .from('message_requests')
        .select('*')
        .eq('recipient_id', user.id)
        .order('updated_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Fetch requester profiles
      const requesterIds = [...new Set(data.map(r => r.requester_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, username, avatar_url, online_status')
        .in('id', requesterIds);

      if (profilesError) {
        console.error('[MessageRequestService] Error fetching profiles:', profilesError);
      }

      // Create profile map
      const profileMap = {};
      if (profiles) {
        profiles.forEach(p => {
          p.display_name = p.full_name || p.display_name || p.username || 'User';
          profileMap[p.id] = p;
        });
      }

      // Attach profiles to requests
      return data.map(request => ({
        ...request,
        requester: profileMap[request.requester_id] || null,
      }));

    } catch (error) {
      console.error('[MessageRequestService] getMessageRequests error:', error);
      throw error;
    }
  }

  /**
   * Get count of pending message requests
   * @returns {Promise<number>} Count of pending requests
   */
  async getMessageRequestsCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data, error } = await supabase.rpc('get_message_requests_count', {
        p_user_id: user.id,
      });

      if (error) throw error;
      return data || 0;

    } catch (error) {
      console.error('[MessageRequestService] getMessageRequestsCount error:', error);
      return 0;
    }
  }

  /**
   * Get a single message request by ID
   * @param {string} requestId - Request ID
   * @returns {Promise<Object|null>} Message request with details
   */
  async getMessageRequest(requestId) {
    try {
      const { data, error } = await supabase
        .from('message_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Fetch requester profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, username, avatar_url, online_status')
        .eq('id', data.requester_id)
        .single();

      if (profile) {
        profile.display_name = profile.full_name || profile.display_name || profile.username || 'User';
      }

      return {
        ...data,
        requester: profile,
      };

    } catch (error) {
      console.error('[MessageRequestService] getMessageRequest error:', error);
      return null;
    }
  }

  // =====================================================
  // ACCEPT / DECLINE
  // =====================================================

  /**
   * Accept a message request
   * Creates contact relationship and moves messages to inbox
   * @param {string} requestId - Request ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async acceptMessageRequest(requestId) {
    try {
      const { error } = await supabase.rpc('accept_message_request', {
        p_request_id: requestId,
      });

      if (error) throw error;

      // Send push notification to requester
      const request = await this.getMessageRequest(requestId);
      if (request) {
        await this._sendAcceptedNotification(request);
      }

      console.log('[MessageRequestService] Message request accepted:', requestId);
      return { success: true };

    } catch (error) {
      console.error('[MessageRequestService] acceptMessageRequest error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Decline a message request
   * Optionally blocks the user
   * @param {string} requestId - Request ID
   * @param {boolean} blockUser - Whether to also block the user
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async declineMessageRequest(requestId, blockUser = false) {
    try {
      const { error } = await supabase.rpc('decline_message_request', {
        p_request_id: requestId,
        p_block_user: blockUser,
      });

      if (error) throw error;

      console.log('[MessageRequestService] Message request declined:', requestId, 'blocked:', blockUser);
      return { success: true };

    } catch (error) {
      console.error('[MessageRequestService] declineMessageRequest error:', error);
      return { success: false, error: error.message };
    }
  }

  // =====================================================
  // CHECK CONVERSATION STATUS
  // =====================================================

  /**
   * Check if a conversation is a pending message request
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<{isRequest: boolean, request?: Object}>}
   */
  async isConversationMessageRequest(conversationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isRequest: false };

      const { data, error } = await supabase
        .from('message_requests')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Fetch requester profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, username, avatar_url')
          .eq('id', data.requester_id)
          .single();

        if (profile) {
          profile.display_name = profile.full_name || profile.display_name || profile.username || 'User';
        }

        return {
          isRequest: true,
          request: { ...data, requester: profile },
        };
      }

      return { isRequest: false };

    } catch (error) {
      console.error('[MessageRequestService] isConversationMessageRequest error:', error);
      return { isRequest: false };
    }
  }

  /**
   * Check if should create message request for a new message
   * @param {string} recipientId - Recipient user ID
   * @returns {Promise<{needsRequest: boolean, reason: string}>}
   */
  async shouldCreateMessageRequest(recipientId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { needsRequest: false, reason: 'not_authenticated' };

      const { data, error } = await supabase.rpc('should_create_message_request', {
        sender_id: user.id,
        recipient_id: recipientId,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        return {
          needsRequest: data[0].needs_request,
          reason: data[0].reason,
        };
      }

      return { needsRequest: false, reason: 'unknown' };

    } catch (error) {
      console.error('[MessageRequestService] shouldCreateMessageRequest error:', error);
      return { needsRequest: false, reason: 'error' };
    }
  }

  /**
   * Create or update message request when sending to stranger
   * @param {string} conversationId - Conversation ID
   * @param {string} recipientId - Recipient user ID
   * @param {string} messagePreview - Preview of the message
   * @returns {Promise<{success: boolean, requestId?: string, error?: string}>}
   */
  async handleMessageRequest(conversationId, recipientId, messagePreview) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const { data, error } = await supabase.rpc('handle_message_request', {
        p_conversation_id: conversationId,
        p_sender_id: user.id,
        p_recipient_id: recipientId,
        p_message_preview: messagePreview,
      });

      if (error) throw error;

      return { success: true, requestId: data };

    } catch (error) {
      console.error('[MessageRequestService] handleMessageRequest error:', error);
      return { success: false, error: error.message };
    }
  }

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================================

  /**
   * Subscribe to new message requests
   * @param {string} userId - User ID to subscribe for
   * @param {Function} onNewRequest - Callback when new request arrives
   * @param {Function} onCountChange - Callback when count changes
   * @returns {Function} Unsubscribe function
   */
  subscribeToMessageRequests(userId, onNewRequest, onCountChange = null) {
    console.log('[MessageRequestService] Subscribing to message requests for:', userId);

    const channel = supabase
      .channel(`message-requests:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_requests',
          filter: `recipient_id=eq.${userId}`,
        },
        async (payload) => {
          console.log('[MessageRequestService] New message request:', payload.new.id);

          // Fetch full request with profile
          const request = await this.getMessageRequest(payload.new.id);
          if (request && onNewRequest) {
            onNewRequest(request);
          }

          // Update count
          if (onCountChange) {
            const count = await this.getMessageRequestsCount();
            onCountChange(count);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'message_requests',
          filter: `recipient_id=eq.${userId}`,
        },
        async (payload) => {
          console.log('[MessageRequestService] Message request updated:', payload.new.id, payload.new.status);

          // Update count on status change
          if (onCountChange) {
            const count = await this.getMessageRequestsCount();
            onCountChange(count);
          }
        }
      )
      .subscribe((status) => {
        console.log('[MessageRequestService] Subscription status:', status);
      });

    this.requestsSubscription = channel;

    // Return unsubscribe function
    return () => {
      console.log('[MessageRequestService] Unsubscribing from message requests');
      supabase.removeChannel(channel);
      this.requestsSubscription = null;
    };
  }

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  /**
   * Send push notification when request is accepted
   * @private
   */
  async _sendAcceptedNotification(request) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, full_name, username')
        .eq('id', user.id)
        .single();

      const senderName = profile?.full_name || profile?.display_name || profile?.username || 'Ai đó';

      await supabase.functions.invoke('send-push', {
        body: {
          user_id: request.requester_id,
          notification_type: 'message_request_accepted',
          title: '✅ Tin nhắn được chấp nhận',
          body: `${senderName} đã chấp nhận tin nhắn của bạn`,
          data: {
            type: 'message_request_accepted',
            conversationId: request.conversation_id,
            acceptedBy: user.id,
          },
          channel_id: 'messages',
        },
      });

      console.log('[MessageRequestService] Accepted notification sent to:', request.requester_id);

    } catch (error) {
      console.error('[MessageRequestService] _sendAcceptedNotification error:', error);
    }
  }

  // =====================================================
  // CLEANUP
  // =====================================================

  /**
   * Cleanup subscriptions
   */
  cleanup() {
    if (this.requestsSubscription) {
      supabase.removeChannel(this.requestsSubscription);
      this.requestsSubscription = null;
    }
  }
}

// Export singleton instance
export const messageRequestService = new MessageRequestService();
export default messageRequestService;
