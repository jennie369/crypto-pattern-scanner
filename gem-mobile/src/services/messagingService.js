/**
 * Messaging Service for GEM Mobile
 * Direct messaging and group chat functionality
 *
 * CRITICAL: This service MUST use identical channel names and patterns
 * as the web app (frontend/src/services/messaging.js) to ensure
 * real-time sync between web and mobile users.
 *
 * Sync Requirements:
 * - Message channel: `messages:${conversationId}`
 * - Presence channel: `presence:${conversationId}`
 * - Presence key: user.id
 * - Typing timeout: 2000ms
 * - Optimistic ID: `temp-${Date.now()}`
 */

import { supabase } from './supabase';

class MessagingService {
  // Expose supabase instance for presence channels (same as web)
  supabase = supabase;

  // =====================================================
  // CONVERSATIONS
  // =====================================================

  /**
   * Get conversations for the current user
   * @returns {Promise<Array>} List of conversations with latest message
   */
  async getConversations() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants!inner(
            unread_count,
            last_read_at,
            user_id,
            users:user_id(
              id,
              display_name,
              avatar_url,
              online_status
            )
          ),
          messages(
            id,
            content,
            created_at,
            sender_id,
            is_deleted
          )
        `)
        .contains('participant_ids', [user.id])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get latest non-deleted message for each conversation
      const conversationsWithLatest = data.map(conv => {
        const sortedMessages = conv.messages
          .filter(m => !m.is_deleted)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Get the other participant for 1-1 conversations
        const otherParticipant = conv.conversation_participants
          .find(p => p.user_id !== user.id)?.users;

        return {
          ...conv,
          latest_message: sortedMessages[0] || null,
          other_participant: otherParticipant,
          my_unread_count: conv.conversation_participants
            .find(p => p.user_id === user.id)?.unread_count || 0,
          messages: undefined
        };
      });

      return conversationsWithLatest;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  /**
   * Get messages for a specific conversation with cursor-based pagination
   * @param {string} conversationId - Conversation ID
   * @param {string} cursor - Message ID to fetch before (for pagination)
   * @param {number} limit - Number of messages to fetch
   * @returns {Promise<Object>} { messages, hasMore, nextCursor }
   */
  async getMessages(conversationId, cursor = null, limit = 50) {
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          users:sender_id(
            id,
            display_name,
            avatar_url
          ),
          message_reactions(
            id,
            emoji,
            user_id
          )
        `)
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit + 1); // Fetch one extra to check if there are more

      // If cursor provided, fetch messages before that
      if (cursor) {
        const { data: cursorMessage } = await supabase
          .from('messages')
          .select('created_at')
          .eq('id', cursor)
          .single();

        if (cursorMessage) {
          query = query.lt('created_at', cursorMessage.created_at);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      const hasMore = data.length > limit;
      const messages = hasMore ? data.slice(0, limit) : data;
      const nextCursor = hasMore ? messages[messages.length - 1]?.id : null;

      return {
        messages: messages.reverse(), // Reverse to show oldest first
        hasMore,
        nextCursor
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Send a message with optimistic update support
   * @param {string} conversationId - Conversation ID
   * @param {string} content - Message content
   * @param {object} attachment - Attachment object {url, name, type, size}
   * @returns {Promise<Object>} Created message
   */
  async sendMessage(conversationId, content, attachment = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create optimistic message ID (same pattern as web)
      const tempId = `temp-${Date.now()}`;

      const messageData = {
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        message_type: attachment ? (attachment.type?.startsWith('image') ? 'image' : 'file') : 'text'
      };

      // Add attachment fields if present
      if (attachment) {
        messageData.attachment_url = attachment.url;
        messageData.attachment_name = attachment.name;
        messageData.attachment_type = attachment.type;
        messageData.attachment_size = attachment.size;
      }

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select(`
          *,
          users:sender_id(
            id,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return { ...data, tempId };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation
   * @param {Array<string>} participantIds - Array of user IDs
   * @param {boolean} isGroup - Is this a group chat?
   * @param {string} name - Group name (optional, required for groups)
   * @returns {Promise<Object>} Created conversation
   */
  async createConversation(participantIds, isGroup = false, name = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Ensure current user is in the participant list
      if (!participantIds.includes(user.id)) {
        participantIds.push(user.id);
      }

      // Check if 1-1 conversation already exists
      if (!isGroup && participantIds.length === 2) {
        const { data: existing } = await supabase
          .from('conversations')
          .select(`
            *,
            conversation_participants(
              unread_count,
              last_read_at,
              user_id,
              users:user_id(
                id,
                display_name,
                avatar_url,
                online_status
              )
            )
          `)
          .contains('participant_ids', participantIds)
          .eq('is_group', false)
          .maybeSingle();

        if (existing) {
          console.log('✅ Found existing conversation:', existing.id);
          return existing;
        }
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant_ids: participantIds,
          is_group: isGroup,
          name: isGroup ? name : null,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Create participant records
      const participantRecords = participantIds.map(userId => ({
        conversation_id: data.id,
        user_id: userId,
        unread_count: 0
      }));

      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert(participantRecords);

      if (participantError) throw participantError;

      // Fetch full conversation with participant details
      const { data: fullConversation, error: fetchError } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants(
            id,
            unread_count,
            last_read_at,
            user_id,
            users:user_id(
              id,
              display_name,
              avatar_url,
              online_status
            )
          )
        `)
        .eq('id', data.id)
        .single();

      if (fetchError) throw fetchError;

      console.log('✅ Created new conversation:', fullConversation.id);
      return fullConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // =====================================================
  // MESSAGES - READ & DELETE
  // =====================================================

  /**
   * Mark conversation as read
   * CRITICAL: Uses same RPC as web for sync
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<void>}
   */
  async markAsRead(conversationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update conversation participant unread count
      const { error } = await supabase
        .from('conversation_participants')
        .update({
          last_read_at: new Date().toISOString(),
          unread_count: 0
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Mark individual messages as read using SQL function (same as web)
      await supabase.rpc('mark_messages_as_read', {
        p_conversation_id: conversationId,
        p_user_id: user.id
      });
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  }

  /**
   * Delete a message (soft delete - same as web)
   * @param {string} messageId - Message ID
   * @returns {Promise<void>}
   */
  async deleteMessage(messageId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id); // Only allow deleting own messages

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS
  // CRITICAL: Channel names MUST match web exactly for sync
  // =====================================================

  /**
   * Subscribe to new messages in a conversation
   * CRITICAL: Channel name MUST be `messages:${conversationId}` to sync with web
   * @param {string} conversationId - Conversation ID
   * @param {Function} callback - Callback function when new message arrives
   * @returns {Object} Subscription object
   */
  subscribeToMessages(conversationId, callback) {
    // CRITICAL: Use EXACT same channel name as web
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // Handle message updates (reactions, soft deletes)
          callback(payload.new, 'update');
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Subscribe to typing indicators in a conversation
   * CRITICAL: Channel name MUST be `presence:${conversationId}` to sync with web
   * CRITICAL: Presence key MUST be userId
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - Current user ID
   * @param {Function} onTypingChange - Callback when typing status changes
   * @returns {Object} { channel, broadcastTyping }
   */
  subscribeToTyping(conversationId, userId, onTypingChange) {
    // CRITICAL: Use EXACT same channel name and key as web
    const channel = supabase.channel(`presence:${conversationId}`, {
      config: {
        presence: {
          key: userId // MUST use userId as key (same as web)
        }
      }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Find users who are typing (excluding current user)
        const typingUsers = Object.values(state)
          .flat()
          .filter(presence => presence.user_id !== userId && presence.typing === true);

        onTypingChange(typingUsers);
      })
      .subscribe();

    // Return channel and helper function to broadcast typing
    return {
      channel,
      /**
       * Broadcast typing status
       * CRITICAL: Timeout MUST be 2000ms to match web
       */
      broadcastTyping: (isTyping, displayName) => {
        channel.track({
          user_id: userId,
          typing: isTyping,
          display_name: displayName
        });
      }
    };
  }

  /**
   * Unsubscribe from a channel
   * @param {Object} channel - Supabase channel
   */
  unsubscribe(channel) {
    if (channel) {
      supabase.removeChannel(channel);
    }
  }

  // =====================================================
  // REACTIONS
  // =====================================================

  /**
   * Add reaction to a message
   * @param {string} messageId - Message ID
   * @param {string} emoji - Emoji to react with
   * @returns {Promise<Object>} Created reaction
   */
  async addReaction(messageId, emoji) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  /**
   * Remove reaction from a message
   * @param {string} messageId - Message ID
   * @param {string} emoji - Emoji to remove
   * @returns {Promise<void>}
   */
  async removeReaction(messageId, emoji) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  }

  /**
   * Toggle reaction (add if not exists, remove if exists)
   * @param {string} messageId - Message ID
   * @param {string} emoji - Emoji to toggle
   * @returns {Promise<boolean>} True if added, false if removed
   */
  async toggleReaction(messageId, emoji) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if reaction exists
      const { data: existing } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .maybeSingle();

      if (existing) {
        await this.removeReaction(messageId, emoji);
        return false;
      } else {
        await this.addReaction(messageId, emoji);
        return true;
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      throw error;
    }
  }

  // =====================================================
  // USER SEARCH
  // =====================================================

  /**
   * Search users by display name or email
   * @param {string} query - Search query
   * @returns {Promise<Array>} List of users
   */
  async searchUsers(query) {
    try {
      if (!query || query.length < 2) return [];

      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, email, online_status')
        .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
        .neq('id', user?.id) // Exclude current user
        .limit(10);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // =====================================================
  // ONLINE STATUS (Match web patterns)
  // =====================================================

  /**
   * Update user's online status
   * CRITICAL: Updates same fields as web for sync
   * @param {string} status - 'online', 'offline', or 'away'
   * @returns {Promise<void>}
   */
  async updateOnlineStatus(status) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          online_status: status,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating online status:', error);
      // Don't throw - online status is non-critical
    }
  }

  // =====================================================
  // BLOCK & REPORT (Match web implementation)
  // =====================================================

  /**
   * Block a user
   * @param {string} blockedUserId - User ID to block
   * @param {string} reason - Optional reason for blocking
   * @returns {Promise<Object>} Block record
   */
  async blockUser(blockedUserId, reason = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: blockedUserId,
          reason
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  }

  /**
   * Unblock a user
   * @param {string} blockedUserId - User ID to unblock
   * @returns {Promise<void>}
   */
  async unblockUser(blockedUserId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedUserId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  }

  /**
   * Get list of blocked users
   * @returns {Promise<Array>} List of blocked users with details
   */
  async getBlockedUsers() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          *,
          blocked_user:users!blocked_users_blocked_id_fkey(
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('blocker_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      throw error;
    }
  }

  /**
   * Check if a user is blocked (either direction)
   * @param {string} userId - User ID to check
   * @returns {Promise<boolean>} True if blocked
   */
  async isUserBlocked(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data } = await supabase
        .from('blocked_users')
        .select('id')
        .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${userId}),and(blocker_id.eq.${userId},blocked_id.eq.${user.id})`)
        .maybeSingle();

      return !!data;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      return false;
    }
  }

  /**
   * Report a user
   * @param {Object} reportData - Report data
   * @returns {Promise<Object>} Report record
   */
  async reportUser({ reportedUserId, reportType, description }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: user.id,
          reported_user_id: reportedUserId,
          report_type: reportType,
          description
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error reporting user:', error);
      throw error;
    }
  }

  // =====================================================
  // ATTACHMENTS
  // CRITICAL: Use same storage bucket as web
  // =====================================================

  /**
   * Upload attachment to message-attachments bucket
   * @param {Object} file - File object with uri, type, name
   * @param {string} conversationId - Conversation ID for path
   * @returns {Promise<Object>} { url, name, type, size }
   */
  async uploadAttachment(file, conversationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate unique file path (same pattern as web)
      const fileExt = file.name?.split('.').pop() || 'file';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${conversationId}/${user.id}/${fileName}`;

      // Convert URI to blob for upload
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // Upload to message-attachments bucket (same as web)
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, blob, {
          contentType: file.type,
          cacheControl: '3600'
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(data.path);

      return {
        url: publicUrl,
        name: file.name || fileName,
        type: file.type,
        size: file.size || blob.size
      };
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }

  // =====================================================
  // SEARCH
  // =====================================================

  /**
   * Search messages in a conversation
   * @param {string} query - Search query
   * @param {string} conversationId - Optional conversation ID to search within
   * @returns {Promise<Array>} List of matching messages
   */
  async searchMessages(query, conversationId = null) {
    try {
      if (!query || query.length < 2) return [];

      let queryBuilder = supabase
        .from('messages')
        .select(`
          *,
          users:sender_id(
            id,
            display_name,
            avatar_url
          ),
          conversations(
            id,
            name,
            is_group
          )
        `)
        .ilike('content', `%${query}%`)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (conversationId) {
        queryBuilder = queryBuilder.eq('conversation_id', conversationId);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }

  // =====================================================
  // PINNED MESSAGES
  // =====================================================

  /**
   * Get pinned messages in a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Array>} List of pinned messages
   */
  async getPinnedMessages(conversationId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .eq('is_pinned', true)
        .eq('is_deleted', false)
        .order('pinned_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching pinned messages:', error);
      return [];
    }
  }

  /**
   * Pin a message
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Updated message
   */
  async pinMessage(messageId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({
          is_pinned: true,
          pinned_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error pinning message:', error);
      throw error;
    }
  }

  /**
   * Unpin a message
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Updated message
   */
  async unpinMessage(messageId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({
          is_pinned: false,
          pinned_at: null
        })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error unpinning message:', error);
      throw error;
    }
  }

  /**
   * Get total unread count across all conversations
   * @returns {Promise<number>} Total unread count
   */
  async getTotalUnreadCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data, error } = await supabase
        .from('conversation_participants')
        .select('unread_count')
        .eq('user_id', user.id);

      if (error) throw error;

      return data.reduce((total, p) => total + (p.unread_count || 0), 0);
    } catch (error) {
      console.error('Error getting total unread count:', error);
      return 0;
    }
  }

  /**
   * Subscribe to unread count changes
   * @param {Function} callback - Callback with new total unread count
   * @returns {Object} Subscription channel
   */
  subscribeToUnreadCount(userId, callback) {
    const channel = supabase
      .channel(`unread:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_participants',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          const count = await this.getTotalUnreadCount();
          callback(count);
        }
      )
      .subscribe();

    return channel;
  }
}

// Export singleton instance (same as web)
export default new MessagingService();
