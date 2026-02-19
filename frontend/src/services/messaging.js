/**
 * Messaging Service
 * Direct messaging and group chat functionality
 */

import { supabase } from '../lib/supabaseClient';

class MessagingService {
  // Expose supabase instance for presence channels
  supabase = supabase;

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
            profiles:user_id(
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
            sender_id
          )
        `)
        .contains('participant_ids', [user.id])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get latest message for each conversation
      const conversationsWithLatest = data.map(conv => {
        const sortedMessages = conv.messages.sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        );

        return {
          ...conv,
          latest_message: sortedMessages[0] || null,
          messages: undefined // Remove messages array to keep data clean
        };
      });

      return conversationsWithLatest;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  /**
   * Get messages for a specific conversation
   * @param {string} conversationId - Conversation ID
   * @param {number} limit - Number of messages to fetch
   * @returns {Promise<Array>} List of messages
   */
  async getMessages(conversationId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:sender_id(
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
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.reverse(); // Reverse to show oldest first
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Send a message
   * @param {string} conversationId - Conversation ID
   * @param {string} content - Message content
   * @param {object} attachment - Attachment object {url, name, type, size}
   * @returns {Promise<Object>} Created message
   */
  async sendMessage(conversationId, content, attachment = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const messageData = {
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        message_type: attachment ? 'attachment' : 'text'
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
        .select()
        .single();

      if (error) throw error;

      return data;
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
        const { data: existing, error: existingError } = await supabase
          .from('conversations')
          .select(`
            *,
            conversation_participants(
              unread_count,
              last_read_at,
              user_id,
              profiles:user_id(
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
              sender_id
            )
          `)
          .contains('participant_ids', participantIds)
          .eq('is_group', false)
          .maybeSingle(); // Use maybeSingle to avoid error when not found

        // If existing conversation found, return it
        if (existing && !existingError) {
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

      console.log('📝 Inserting participant records:', participantRecords);

      const { data: insertedParticipants, error: participantError } = await supabase
        .from('conversation_participants')
        .insert(participantRecords)
        .select();

      if (participantError) {
        console.error('❌ Error inserting participants:', participantError);
        throw participantError;
      }

      console.log('✅ Participants inserted:', insertedParticipants);

      // Wait a moment for database to settle
      await new Promise(resolve => setTimeout(resolve, 500));

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
            profiles:user_id(
              id,
              display_name,
              avatar_url,
              email,
              online_status
            )
          ),
          messages(
            id,
            content,
            created_at,
            sender_id
          )
        `)
        .eq('id', data.id)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching full conversation:', fetchError);
        throw fetchError;
      }

      console.log('✅ Created new conversation:', fullConversation.id);
      console.log('✅ Participants fetched:', fullConversation.conversation_participants?.length || 0);
      console.log('✅ Full participants data:', JSON.stringify(fullConversation.conversation_participants, null, 2));

      // Verify participants exist
      if (!fullConversation.conversation_participants || fullConversation.conversation_participants.length === 0) {
        console.error('❌ WARNING: No participants found in conversation!');
        console.error('Conversation ID:', fullConversation.id);
        console.error('Participant IDs:', participantIds);

        // Throw error to trigger fallback
        throw new Error('Participants not found in conversation');
      }

      return fullConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Search users by display name or email
   * @param {string} query - Search query
   * @returns {Promise<Array>} List of users
   */
  async searchUsers(query) {
    try {
      if (!query || query.length < 2) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, email, online_status')
        .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Mark conversation as read
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

      // Mark individual messages as read using SQL function
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
   * Subscribe to new messages in a conversation
   * @param {string} conversationId - Conversation ID
   * @param {Function} callback - Callback function when new message arrives
   * @returns {Object} Subscription object
   */
  subscribeToMessages(conversationId, callback) {
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
        async (payload) => {
          // CRITICAL FIX: payload.new only contains raw message data
          // We need to fetch full message with user data for proper display
          try {
            const { data: fullMessage, error } = await supabase
              .from('messages')
              .select(`
                *,
                profiles:sender_id(
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
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('[MessagingService] Error fetching full message:', error);
              callback(payload.new);
              return;
            }

            callback(fullMessage);
          } catch (err) {
            console.error('[MessagingService] subscribeToMessages error:', err);
            callback(payload.new);
          }
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
        async (payload) => {
          // Handle message updates (reactions, soft deletes)
          try {
            const { data: fullMessage, error } = await supabase
              .from('messages')
              .select(`
                *,
                profiles:sender_id(
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
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('[MessagingService] Error fetching updated message:', error);
              callback(payload.new, 'update');
              return;
            }

            callback(fullMessage, 'update');
          } catch (err) {
            console.error('[MessagingService] subscribeToMessages update error:', err);
            callback(payload.new, 'update');
          }
        }
      )
      .subscribe((status) => {
        console.log(`[MessagingService] Message subscription status for ${conversationId}:`, status);
      });

    return channel;
  }

  /**
   * Update user's online status
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
      throw error;
    }
  }

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
   * @param {string} reactionId - Reaction ID
   * @returns {Promise<void>}
   */
  async removeReaction(reactionId) {
    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('id', reactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  }

  /**
   * Delete a message (soft delete)
   * @param {string} messageId - Message ID
   * @returns {Promise<void>}
   */
  async deleteMessage(messageId) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // =====================================================
  // BLOCK & REPORT FEATURES
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
            avatar_url,
            email
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
   * Check if a user is blocked
   * @param {string} userId - User ID to check
   * @returns {Promise<boolean>} True if user is blocked
   */
  async isUserBlocked(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('blocked_users')
        .select('id')
        .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${userId}),and(blocker_id.eq.${userId},blocked_id.eq.${user.id})`)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      return !!data; // Return true if block exists, false otherwise
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      return false; // Return false on error to prevent blocking UI
    }
  }

  /**
   * Report a user
   * @param {Object} reportData - Report data
   * @param {string} reportData.reportedUserId - User ID being reported
   * @param {string} reportData.reportType - Type of report (spam, harassment, etc.)
   * @param {string} reportData.description - Description of the issue
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
}

export default new MessagingService();
