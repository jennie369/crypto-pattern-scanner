/**
 * Message Request Service
 * Handles message requests from strangers (TikTok-style inbox)
 */

import { supabase } from './supabase';

class MessageRequestService {
  constructor() {
    this.subscription = null;
  }

  /**
   * Get message requests for current user
   * @param {string} status - 'pending', 'accepted', 'declined', 'blocked' or 'all'
   */
  async getMessageRequests(status = 'pending') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated', requests: [] };
      }

      let query = supabase
        .from('message_requests')
        .select(`
          id,
          conversation_id,
          requester_id,
          recipient_id,
          status,
          message_preview,
          messages_count,
          created_at,
          updated_at,
          requester:profiles!message_requests_requester_id_fkey (
            id,
            display_name,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('recipient_id', user.id)
        .order('updated_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[MessageRequest] Error fetching requests:', error);
        return { success: false, error: error.message, requests: [] };
      }

      console.log('[MessageRequest] Fetched requests:', data?.length || 0);
      return { success: true, requests: data || [] };
    } catch (error) {
      console.error('[MessageRequest] Exception:', error);
      return { success: false, error: error.message, requests: [] };
    }
  }

  /**
   * Get count of pending message requests
   */
  async getMessageRequestsCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('message_requests')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('status', 'pending');

      if (error) {
        console.error('[MessageRequest] Error counting:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('[MessageRequest] Count exception:', error);
      return 0;
    }
  }

  /**
   * Accept a message request
   */
  async acceptMessageRequest(requestId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      console.log('[MessageRequest] Accepting request:', requestId);

      // Get the request first
      const { data: request, error: fetchError } = await supabase
        .from('message_requests')
        .select('*')
        .eq('id', requestId)
        .eq('recipient_id', user.id)
        .single();

      if (fetchError || !request) {
        return { success: false, error: 'Request not found' };
      }

      // Update status to accepted
      const { error: updateError } = await supabase
        .from('message_requests')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('[MessageRequest] Error accepting:', updateError);
        return { success: false, error: updateError.message };
      }

      // Add to contacts (both ways)
      await this._addContacts(user.id, request.requester_id);

      // Update messages to not be message_request anymore
      await supabase
        .from('messages')
        .update({ is_message_request: false })
        .eq('conversation_id', request.conversation_id);

      console.log('[MessageRequest] Request accepted successfully');
      return { success: true, conversationId: request.conversation_id };
    } catch (error) {
      console.error('[MessageRequest] Accept exception:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Decline a message request
   * @param {string} requestId
   * @param {boolean} blockUser - Also block the user
   */
  async declineMessageRequest(requestId, blockUser = false) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      console.log('[MessageRequest] Declining request:', requestId, 'block:', blockUser);

      // Get the request first
      const { data: request, error: fetchError } = await supabase
        .from('message_requests')
        .select('*')
        .eq('id', requestId)
        .eq('recipient_id', user.id)
        .single();

      if (fetchError || !request) {
        return { success: false, error: 'Request not found' };
      }

      // Update status
      const newStatus = blockUser ? 'blocked' : 'declined';
      const { error: updateError } = await supabase
        .from('message_requests')
        .update({
          status: newStatus,
          declined_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('[MessageRequest] Error declining:', updateError);
        return { success: false, error: updateError.message };
      }

      // Block user if requested
      if (blockUser) {
        await supabase
          .from('blocked_users')
          .upsert({
            blocker_id: user.id,
            blocked_id: request.requester_id,
            reason: 'Blocked from message request',
          }, {
            onConflict: 'blocker_id,blocked_id',
          });
      }

      // Delete the conversation and messages
      await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', request.conversation_id);

      await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', request.conversation_id);

      await supabase
        .from('conversations')
        .delete()
        .eq('id', request.conversation_id);

      console.log('[MessageRequest] Request declined successfully');
      return { success: true };
    } catch (error) {
      console.error('[MessageRequest] Decline exception:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if a conversation is a message request
   */
  async isConversationMessageRequest(conversationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('message_requests')
        .select('id, status')
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .single();

      if (error && error.code !== 'PGRST116') {
        return false;
      }

      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get message request for a conversation
   */
  async getMessageRequestForConversation(conversationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('message_requests')
        .select(`
          id,
          status,
          requester_id,
          message_preview,
          messages_count,
          created_at,
          requester:profiles!message_requests_requester_id_fkey (
            id,
            display_name,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Subscribe to message request updates
   */
  subscribeToMessageRequests(callback) {
    const unsubscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (this.subscription) {
        supabase.removeChannel(this.subscription);
      }

      this.subscription = supabase
        .channel('message_requests_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'message_requests',
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('[MessageRequest] Realtime update:', payload.eventType);
            callback(payload);
          }
        )
        .subscribe();
    };

    unsubscribe();

    return () => {
      if (this.subscription) {
        supabase.removeChannel(this.subscription);
        this.subscription = null;
      }
    };
  }

  /**
   * Create a message request (called when sending to stranger)
   */
  async createMessageRequest(conversationId, recipientId, messagePreview) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('message_requests')
        .upsert({
          conversation_id: conversationId,
          requester_id: user.id,
          recipient_id: recipientId,
          message_preview: messagePreview?.substring(0, 100) || '',
          messages_count: 1,
          status: 'pending',
        }, {
          onConflict: 'conversation_id,requester_id,recipient_id',
        })
        .select()
        .single();

      if (error) {
        console.error('[MessageRequest] Error creating request:', error);
        return { success: false, error: error.message };
      }

      return { success: true, request: data };
    } catch (error) {
      console.error('[MessageRequest] Create exception:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add users as contacts
   */
  async _addContacts(userId1, userId2) {
    try {
      await supabase
        .from('user_contacts')
        .upsert([
          { user_id: userId1, contact_id: userId2, status: 'active' },
          { user_id: userId2, contact_id: userId1, status: 'active' },
        ], {
          onConflict: 'user_id,contact_id',
        });
    } catch (error) {
      console.error('[MessageRequest] Error adding contacts:', error);
    }
  }
}

export const messageRequestService = new MessageRequestService();
export default messageRequestService;
