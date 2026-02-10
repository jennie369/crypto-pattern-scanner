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
import { formatError } from '../utils/errorUtils';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key for storing deleted conversation IDs permanently
const DELETED_CONVERSATIONS_KEY = '@gem_deleted_conversations';

class MessagingService {
  // Expose supabase instance for presence channels (same as web)
  supabase = supabase;

  // =====================================================
  // DELETED CONVERSATIONS MANAGEMENT (Local Storage)
  // =====================================================

  /**
   * Get list of locally deleted conversation IDs
   * @param {string} userId - User ID
   * @returns {Promise<string[]>} Array of deleted conversation IDs
   */
  async getDeletedConversationIds(userId) {
    try {
      const key = `${DELETED_CONVERSATIONS_KEY}_${userId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[messagingService] Error getting deleted IDs:', error);
      return [];
    }
  }

  /**
   * Add a conversation ID to the deleted list
   * @param {string} userId - User ID
   * @param {string} conversationId - Conversation ID to mark as deleted
   */
  async addDeletedConversationId(userId, conversationId) {
    try {
      const key = `${DELETED_CONVERSATIONS_KEY}_${userId}`;
      const existing = await this.getDeletedConversationIds(userId);
      if (!existing.includes(conversationId)) {
        existing.push(conversationId);
        await AsyncStorage.setItem(key, JSON.stringify(existing));
        console.log('[messagingService] Added to deleted list:', conversationId);
      }
    } catch (error) {
      console.error('[messagingService] Error adding deleted ID:', error);
    }
  }

  /**
   * Remove a conversation ID from the deleted list (for undo)
   * @param {string} userId - User ID
   * @param {string} conversationId - Conversation ID to restore
   */
  async removeDeletedConversationId(userId, conversationId) {
    try {
      const key = `${DELETED_CONVERSATIONS_KEY}_${userId}`;
      const existing = await this.getDeletedConversationIds(userId);
      const filtered = existing.filter(id => id !== conversationId);
      await AsyncStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.error('[messagingService] Error removing deleted ID:', error);
    }
  }

  /**
   * Get server-side deleted conversation IDs from conversation_settings
   * @returns {Promise<string[]>} Array of deleted conversation IDs
   */
  async getServerDeletedConversationIds() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversation_settings')
        .select('conversation_id')
        .eq('user_id', user.id)
        .eq('is_deleted', true);

      if (error) {
        console.error('[messagingService] Error fetching server deleted IDs:', error);
        return [];
      }

      return data?.map(d => d.conversation_id) || [];
    } catch (error) {
      console.error('[messagingService] Error in getServerDeletedConversationIds:', error);
      return [];
    }
  }

  /**
   * Get combined deleted conversation IDs (local + server)
   * @param {string} userId - User ID
   * @returns {Promise<Set<string>>} Set of all deleted conversation IDs
   */
  async getAllDeletedConversationIds(userId) {
    try {
      // Fetch both local and server deleted IDs in parallel
      const [localIds, serverIds] = await Promise.all([
        this.getDeletedConversationIds(userId),
        this.getServerDeletedConversationIds(),
      ]);

      // Merge into a Set for deduplication
      const allDeletedIds = new Set([...localIds, ...serverIds]);

      // Sync server IDs to local storage for offline access
      if (serverIds.length > 0) {
        for (const id of serverIds) {
          if (!localIds.includes(id)) {
            await this.addDeletedConversationId(userId, id);
          }
        }
      }

      return allDeletedIds;
    } catch (error) {
      console.error('[messagingService] Error in getAllDeletedConversationIds:', error);
      // Fall back to local only
      const localIds = await this.getDeletedConversationIds(userId);
      return new Set(localIds);
    }
  }

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

      // Step 1: Get conversation IDs where current user is a participant
      // This query uses conversation_participants table as the source of truth
      const { data: myParticipantRecords, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, unread_count, last_read_at')
        .eq('user_id', user.id);

      if (participantError) throw participantError;
      if (!myParticipantRecords || myParticipantRecords.length === 0) {
        return [];
      }

      // Get ALL deleted conversation IDs (merged: local + server for cross-device sync)
      const deletedSet = await this.getAllDeletedConversationIds(user.id);

      // Filter out deleted conversations
      const filteredRecords = myParticipantRecords.filter(r => !deletedSet.has(r.conversation_id));
      if (filteredRecords.length === 0) {
        return [];
      }

      const conversationIds = filteredRecords.map(r => r.conversation_id);
      const myUnreadMap = {};
      filteredRecords.forEach(r => {
        myUnreadMap[r.conversation_id] = r.unread_count || 0;
      });

      // Step 2: Fetch full conversation details for those IDs
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants(
            unread_count,
            last_read_at,
            user_id
          ),
          messages(
            id,
            content,
            created_at,
            sender_id,
            is_deleted
          )
        `)
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Step 3: Collect all unique participant user_ids (excluding current user)
      const otherUserIds = new Set();
      data.forEach(conv => {
        conv.conversation_participants.forEach(p => {
          if (p.user_id !== user.id) {
            otherUserIds.add(p.user_id);
          }
        });
      });

      // Step 4: Fetch profiles for all other participants
      let profilesMap = {};
      if (otherUserIds.size > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, username, avatar_url, online_status')
          .in('id', Array.from(otherUserIds));

        if (!profilesError && profiles) {
          profiles.forEach(profile => {
            // Create normalized display_name with fallback: full_name > username > display_name
            profile.display_name = profile.full_name || profile.display_name || profile.username || 'User';
            profilesMap[profile.id] = profile;
          });
        }
      }

      // Step 5: Map conversations with profile data
      const conversationsWithLatest = data.map(conv => {
        const sortedMessages = conv.messages
          .filter(m => !m.is_deleted)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Get the other participant for 1-1 conversations
        const otherParticipantRecord = conv.conversation_participants
          .find(p => p.user_id !== user.id);
        const otherParticipant = otherParticipantRecord
          ? profilesMap[otherParticipantRecord.user_id]
          : null;

        return {
          ...conv,
          latest_message: sortedMessages[0] || null,
          other_participant: otherParticipant,
          // Use the pre-fetched unread count from Step 1
          my_unread_count: myUnreadMap[conv.id] || 0,
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
   * Get a single conversation by ID with full participant details
   * Used when navigating to chat from notification (no conversation object available)
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object>} Conversation with participants and profiles
   */
  async getConversationById(conversationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch conversation with participants
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants(
            unread_count,
            last_read_at,
            user_id,
            profiles(
              id,
              display_name,
              full_name,
              username,
              avatar_url,
              online_status
            )
          )
        `)
        .eq('id', conversationId)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Find other participant for 1-1 conversations
      const otherParticipantRecord = data.conversation_participants
        ?.find(p => p.user_id !== user.id);

      const otherProfile = otherParticipantRecord?.profiles;
      if (otherProfile) {
        // Normalize display_name with fallback
        otherProfile.display_name = otherProfile.full_name || otherProfile.display_name || otherProfile.username || 'User';
      }

      return {
        ...data,
        other_participant: otherProfile || null,
        my_unread_count: data.conversation_participants
          ?.find(p => p.user_id === user.id)?.unread_count || 0,
      };
    } catch (error) {
      console.error('[MessagingService] getConversationById error:', error);
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
      // Step 1: Fetch messages with reactions
      let query = supabase
        .from('messages')
        .select(`
          *,
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

      // Step 2: Collect unique sender_ids and fetch profiles
      const senderIds = [...new Set(messages.map(m => m.sender_id).filter(Boolean))];
      let profilesMap = {};

      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, username, avatar_url')
          .in('id', senderIds);

        if (profiles) {
          profiles.forEach(profile => {
            profile.display_name = profile.full_name || profile.display_name || profile.username || 'User';
            profilesMap[profile.id] = profile;
          });
        }
      }

      // Step 3: Attach profiles to messages
      const messagesWithProfiles = messages.map(msg => ({
        ...msg,
        sender: profilesMap[msg.sender_id] || null,
        users: profilesMap[msg.sender_id] || null // Keep for backward compatibility
      }));

      return {
        messages: messagesWithProfiles.reverse(), // Reverse to show oldest first
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
   * @param {object} attachment - Attachment object {url, name, type, size} or sticker/gif object
   * @returns {Promise<Object>} Created message
   */
  async sendMessage(conversationId, content, attachment = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create optimistic message ID (same pattern as web)
      const tempId = `temp-${Date.now()}`;

      // Determine message type
      let messageType = 'text';
      if (attachment) {
        if (attachment.type === 'sticker') {
          messageType = 'sticker';
        } else if (attachment.type === 'gif') {
          messageType = 'gif';
        } else if (attachment.type?.startsWith('image')) {
          messageType = 'image';
        } else if (attachment.type?.startsWith('video')) {
          messageType = 'video';
        } else if (attachment.type?.startsWith('audio') || attachment.messageType === 'audio') {
          messageType = 'audio';
        } else {
          messageType = 'file';
        }
      }

      const messageData = {
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        message_type: messageType
      };

      // Add sticker fields
      if (attachment?.type === 'sticker') {
        messageData.sticker_id = attachment.stickerId;
        if (attachment.url) {
          messageData.attachment_url = attachment.url;
        }
      }

      // Add GIF fields
      if (attachment?.type === 'gif') {
        messageData.giphy_id = attachment.giphyId;
        messageData.giphy_url = attachment.url;
      }

      // Add regular attachment fields if present
      if (attachment && !['sticker', 'gif'].includes(attachment.type)) {
        messageData.attachment_url = attachment.url;
        messageData.attachment_name = attachment.name;
        messageData.attachment_type = attachment.type;
        messageData.attachment_size = attachment.size;
        if (attachment.duration) {
          messageData.attachment_duration = attachment.duration;
        }
        // Add caption for media messages (Phase 1C)
        if (attachment.caption) {
          messageData.caption = attachment.caption.substring(0, 1000); // Max 1000 chars
        }
      }

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select('*')
        .single();

      if (error) throw error;

      // Fetch sender profile separately
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, username, avatar_url')
        .eq('id', data.sender_id)
        .single();

      if (profile) {
        profile.display_name = profile.full_name || profile.display_name || profile.username || 'User';
      }

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Send push notification to other participants
      this._sendMessagePushNotification(conversationId, user.id, profile, content, messageType);

      return { ...data, sender: profile, users: profile, tempId };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Create a call event message to display in chat timeline
   * This creates a message record with message_type='call' so calls appear inline with messages
   * @param {string} conversationId - Conversation ID
   * @param {Object} callData - Call data object
   * @param {string} callData.callId - Call ID
   * @param {string} callData.callType - 'audio' or 'video'
   * @param {string} callData.callStatus - 'ended', 'missed', 'declined', 'cancelled'
   * @param {string} callData.callerId - User who initiated the call
   * @param {number} callData.duration - Call duration in seconds (0 for missed/declined)
   * @param {string} callData.endReason - Reason call ended
   * @returns {Promise<Object>} Created message
   */
  async createCallEventMessage(conversationId, callData) {
    try {
      const { callId, callType, callStatus, callerId, duration = 0, endReason = null } = callData;

      // Store call info as JSON in content
      const callContent = JSON.stringify({
        call_id: callId,
        call_type: callType,
        call_status: callStatus,
        duration: duration,
        end_reason: endReason,
      });

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: callerId,
          content: callContent,
          message_type: 'call',
        })
        .select('*')
        .single();

      if (error) {
        console.error('[messagingService] createCallEventMessage error:', error);
        throw error;
      }

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      console.log('[messagingService] Call event message created:', data.id, 'status:', callStatus);
      return data;
    } catch (error) {
      console.error('[messagingService] createCallEventMessage error:', error);
      // Don't throw - call event message is non-critical
      return null;
    }
  }

  /**
   * Send push notification for a new message
   * @private
   */
  async _sendMessagePushNotification(conversationId, senderId, senderProfile, content, messageType) {
    try {
      // Get conversation participants
      const { data: conversation } = await supabase
        .from('conversations')
        .select('participant_ids, is_group, name')
        .eq('id', conversationId)
        .single();

      if (!conversation?.participant_ids) return;

      // Get recipient IDs (exclude sender)
      const recipientIds = conversation.participant_ids.filter(id => id !== senderId);
      if (recipientIds.length === 0) return;

      // Create message preview
      let preview = content;
      if (messageType === 'image') {
        preview = '📷 Đã gửi hình ảnh';
      } else if (messageType === 'video') {
        preview = '🎬 Đã gửi video';
      } else if (messageType === 'audio') {
        preview = '🎵 Đã gửi tin nhắn thoại';
      } else if (messageType === 'file') {
        preview = '📎 Đã gửi tệp đính kèm';
      } else if (messageType === 'sticker') {
        preview = '🎯 Đã gửi sticker';
      } else if (messageType === 'gif') {
        preview = '🎞️ Đã gửi GIF';
      } else if (content && content.length > 50) {
        preview = content.substring(0, 50) + '...';
      }

      const senderName = senderProfile?.display_name || senderProfile?.full_name || 'Ai đó';
      const title = conversation.is_group && conversation.name
        ? `${senderName} trong ${conversation.name}`
        : senderName;

      // Send push notification
      await supabase.functions.invoke('send-push', {
        body: {
          user_ids: recipientIds,
          notification_type: 'new_message',
          title: `💬 ${title}`,
          body: preview,
          data: {
            type: 'new_message',
            conversationId,
            senderId,
            senderName,
            senderAvatar: senderProfile?.avatar_url,
            isGroup: conversation.is_group,
            preview,
          },
          channel_id: 'messages',
        },
      });

      console.log('[MessagingService] Push notification sent to', recipientIds.length, 'recipients');
    } catch (err) {
      // Don't throw - push notification failure shouldn't break message sending
      console.log('[MessagingService] Push notification error:', err.message);
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
              user_id
            )
          `)
          .contains('participant_ids', participantIds)
          .eq('is_group', false)
          .maybeSingle();

        if (existing) {
          // Fetch profiles for participants
          const otherUserId = participantIds.find(id => id !== user.id);
          if (otherUserId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, display_name, full_name, username, avatar_url, online_status')
              .eq('id', otherUserId)
              .single();
            if (profile) {
              profile.display_name = profile.full_name || profile.display_name || profile.username || 'User';
            }
            existing.other_participant = profile;
          }
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
            user_id
          )
        `)
        .eq('id', data.id)
        .single();

      if (fetchError) throw fetchError;

      // Fetch profile for other participant
      const otherUserId = participantIds.find(id => id !== user.id);
      if (otherUserId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, username, avatar_url, online_status')
          .eq('id', otherUserId)
          .single();
        if (profile) {
          profile.display_name = profile.full_name || profile.display_name || profile.username || 'User';
        }
        fullConversation.other_participant = profile;
      }

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
        async (payload) => {
          // Fetch full message with user data for proper display
          try {
            // Step 1: Fetch message with reactions
            const { data: message, error } = await supabase
              .from('messages')
              .select(`
                *,
                message_reactions(
                  id,
                  emoji,
                  user_id
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('[messagingService] Error fetching message:', error);
              callback(payload.new);
              return;
            }

            // Step 2: Fetch sender profile separately
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, display_name, full_name, username, avatar_url')
              .eq('id', message.sender_id)
              .single();

            // Normalize display_name
            if (profile) {
              profile.display_name = profile.full_name || profile.display_name || profile.username || 'User';
            }

            // Attach profile as 'sender' for compatibility
            message.sender = profile;
            message.users = profile; // Keep for backward compatibility

            callback(message);
          } catch (err) {
            console.error('[messagingService] subscribeToMessages error:', err);
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
          // Handle message updates (reactions, soft deletes, recalls)
          try {
            // Step 1: Fetch message with reactions
            const { data: message, error } = await supabase
              .from('messages')
              .select(`
                *,
                message_reactions(
                  id,
                  emoji,
                  user_id
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('[messagingService] Error fetching updated message:', error);
              callback(payload.new, 'update');
              return;
            }

            // Step 2: Fetch sender profile separately
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, display_name, full_name, username, avatar_url')
              .eq('id', message.sender_id)
              .single();

            // Normalize display_name
            if (profile) {
              profile.display_name = profile.full_name || profile.display_name || profile.username || 'User';
            }

            // Attach profile as 'sender' for compatibility
            message.sender = profile;
            message.users = profile; // Keep for backward compatibility

            callback(message, 'update');
          } catch (err) {
            console.error('[messagingService] subscribeToMessages update error:', err);
            callback(payload.new, 'update');
          }
        }
      )
      .subscribe((status) => {
        console.log(`[messagingService] Message subscription status for ${conversationId}:`, status);
      });

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

    // Track if channel is subscribed
    let isSubscribed = false;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Find users who are typing (excluding current user)
        const typingUsers = Object.values(state)
          .flat()
          .filter(presence => presence.user_id !== userId && presence.typing === true);

        onTypingChange(typingUsers);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log(`[messagingService] Presence join: ${key}`, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log(`[messagingService] Presence leave: ${key}`, leftPresences);
        // When a user leaves, they are no longer typing
        onTypingChange([]);
      })
      .subscribe(async (status) => {
        console.log(`[messagingService] Typing subscription status for ${conversationId}:`, status);
        if (status === 'SUBSCRIBED') {
          isSubscribed = true;
          // Track initial presence (not typing)
          await channel.track({
            user_id: userId,
            typing: false,
            display_name: '',
            online_at: new Date().toISOString()
          });
        }
      });

    // Return channel and helper function to broadcast typing
    return {
      channel,
      /**
       * Broadcast typing status
       * CRITICAL: Timeout MUST be 2000ms to match web
       */
      broadcastTyping: async (isTyping, displayName = '') => {
        if (!isSubscribed) {
          console.warn('[messagingService] Channel not subscribed yet, cannot broadcast typing');
          return;
        }
        try {
          await channel.track({
            user_id: userId,
            typing: isTyping,
            display_name: displayName,
            online_at: new Date().toISOString()
          });
        } catch (err) {
          console.error('[messagingService] Error broadcasting typing:', err);
        }
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
   * Search users by display name or username
   * PRIVACY: Does NOT expose email - only returns sanitized profile data
   * @param {string} query - Search query
   * @returns {Promise<Array>} List of users
   */
  async searchUsers(query) {
    try {
      if (!query || query.length < 2) return [];

      const { data: { user } } = await supabase.auth.getUser();

      // PRIVACY: Only select whitelisted fields - NEVER include email
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, full_name, avatar_url, online_status')
        .or(`display_name.ilike.%${query}%,full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .neq('id', user?.id) // Exclude current user
        .limit(10);

      if (error) throw error;

      return (data || []).map(profile => ({
        ...profile,
        display_name: profile.full_name || profile.display_name || profile.username || 'User'
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Search users who mutually follow the current user
   * Only returns users where both parties follow each other
   * @param {string} query - Search query (min 2 chars)
   * @param {number} limit - Max results (default 10)
   * @returns {Promise<Array>} Mutual follow users matching query
   */
  async searchMutualFollowUsers(query, limit = 10) {
    if (!query || query.length < 2) return [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Step 1: Get users current user follows
      const { data: following } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (!following || following.length === 0) return [];
      const followingIds = following.map(f => f.following_id);

      // Step 2: Filter to only those who follow back (mutual)
      const { data: mutualFollows } = await supabase
        .from('user_follows')
        .select('follower_id')
        .eq('following_id', user.id)
        .in('follower_id', followingIds);

      if (!mutualFollows || mutualFollows.length === 0) return [];
      const mutualIds = mutualFollows.map(f => f.follower_id);

      // Step 3: Search profiles within mutual follows
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, username, avatar_url, online_status')
        .in('id', mutualIds)
        .or(`display_name.ilike.%${query}%,full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return (data || []).map(profile => ({
        ...profile,
        display_name: profile.full_name || profile.display_name || profile.username || 'User'
      }));
    } catch (error) {
      console.error('Error searching mutual follow users:', error);
      return [];
    }
  }

  /**
   * Search users eligible for group chat
   * - Normal users: contacts (messaged before) OR mutual follows
   * - Admins: can search anyone (but still NO email exposed)
   * @param {string} query - Search query
   * @param {number} limit - Max results (default 10)
   * @param {boolean} isAdmin - If true, bypass contact/follow restrictions
   * @returns {Promise<Array>} Eligible users
   */
  async searchGroupChatEligibleUsers(query, limit = 10, isAdmin = false) {
    if (!query || query.length < 2) return [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // ADMIN: Can search anyone (but still NO EMAIL)
      if (isAdmin) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, username, avatar_url, online_status')
          .neq('id', user.id)
          .or(`display_name.ilike.%${query}%,full_name.ilike.%${query}%,username.ilike.%${query}%`)
          .limit(limit);

        if (error) throw error;

        return (data || []).map(profile => ({
          ...profile,
          display_name: profile.full_name || profile.display_name || profile.username || 'User'
        }));
      }

      // NON-ADMIN: Only contacts OR mutual follows
      // Get contacts (users we've messaged before)
      const { data: contacts } = await supabase
        .from('user_contacts')
        .select('contact_id')
        .eq('user_id', user.id)
        .eq('status', 'active');

      const contactIds = contacts?.map(c => c.contact_id) || [];

      // Get mutual follows
      const { data: following } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = following?.map(f => f.following_id) || [];

      let mutualIds = [];
      if (followingIds.length > 0) {
        const { data: mutualFollows } = await supabase
          .from('user_follows')
          .select('follower_id')
          .eq('following_id', user.id)
          .in('follower_id', followingIds);

        mutualIds = mutualFollows?.map(f => f.follower_id) || [];
      }

      // Combine: contacts + mutual follows (unique)
      const eligibleIds = [...new Set([...contactIds, ...mutualIds])];

      if (eligibleIds.length === 0) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, username, avatar_url, online_status')
        .in('id', eligibleIds)
        .or(`display_name.ilike.%${query}%,full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return (data || []).map(profile => ({
        ...profile,
        display_name: profile.full_name || profile.display_name || profile.username || 'User'
      }));
    } catch (error) {
      console.error('Error searching group chat eligible users:', error);
      return [];
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

      // Step 1: Get blocked user IDs
      const { data, error } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('blocker_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Step 2: Fetch profiles for blocked users
      const blockedIds = data.map(b => b.blocked_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, username, avatar_url')
        .in('id', blockedIds);

      const profilesMap = {};
      profiles?.forEach(p => {
        p.display_name = p.full_name || p.display_name || p.username || 'User';
        profilesMap[p.id] = p;
      });

      // Step 3: Attach profiles to blocked users
      return data.map(item => ({
        ...item,
        blocked_user: profilesMap[item.blocked_id] || null,
        profiles: profilesMap[item.blocked_id] || null,
      }));
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

      console.log('[messagingService] Uploading attachment:', {
        name: file.name,
        type: file.type,
        uri: file.uri?.substring(0, 50),
        path: filePath,
      });

      // Read file - different methods for different platforms
      let fileData;
      let fileSize = file.size || 0;

      try {
        if (Platform.OS === 'web') {
          // Web: Use fetch to get blob
          const response = await fetch(file.uri);
          fileData = await response.blob();
          fileSize = fileData.size;
        } else {
          // Native (iOS/Android): Read as base64 first
          const base64 = await FileSystem.readAsStringAsync(file.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Convert base64 to ArrayBuffer
          const binaryStr = atob(base64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          fileData = bytes.buffer;
          fileSize = bytes.length;
        }
      } catch (readError) {
        console.warn('[messagingService] Base64 read failed, trying fetch:', readError.message);

        // Fallback to fetch method - only works on web
        if (Platform.OS === 'web') {
          try {
            const response = await fetch(file.uri);
            fileData = await response.blob();
            fileSize = fileData.size;
          } catch (fetchError) {
            console.error('[messagingService] Fetch also failed:', fetchError);
            throw new Error('Không thể đọc file. Vui lòng thử lại.');
          }
        } else {
          // On native, if FileSystem failed, there's no fallback
          console.error('[messagingService] FileSystem read failed on native:', readError);
          throw new Error('Không thể đọc file. Vui lòng thử lại.');
        }
      }

      // Upload to message-attachments bucket (same as web)
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, fileData, {
          contentType: file.type || 'application/octet-stream',
          cacheControl: '3600'
        });

      if (error) {
        console.error('[messagingService] Upload error:', error);

        // Provide specific error messages
        if (error.message?.includes('Bucket not found') ||
            error.message?.includes('not found')) {
          throw new Error(
            'Storage bucket "message-attachments" chưa được tạo.\n\n' +
            'Vui lòng tạo bucket trong Supabase Dashboard → Storage → New bucket\n' +
            'Tên: message-attachments, Public: Yes'
          );
        }
        if (error.message?.includes('row-level security') ||
            error.message?.includes('policy') ||
            error.message?.includes('403')) {
          throw new Error(
            'Không có quyền upload.\n\n' +
            'Vui lòng thêm Storage Policies cho bucket "message-attachments".'
          );
        }
        if (error.message?.includes('Payload too large') ||
            error.message?.includes('413')) {
          throw new Error('File quá lớn. Giới hạn 50MB.');
        }
        throw error;
      }

      console.log('[messagingService] Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(data.path);

      return {
        url: publicUrl,
        name: file.name || fileName,
        type: file.type,
        size: fileSize
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

      if (!data || data.length === 0) return [];

      // Fetch sender profiles
      const senderIds = [...new Set(data.map(m => m.sender_id).filter(Boolean))];
      let profilesMap = {};

      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, username, avatar_url')
          .in('id', senderIds);

        if (profiles) {
          profiles.forEach(profile => {
            profile.display_name = profile.full_name || profile.display_name || profile.username || 'User';
            profilesMap[profile.id] = profile;
          });
        }
      }

      // Attach profiles to messages
      return data.map(msg => ({
        ...msg,
        sender: profilesMap[msg.sender_id] || null,
        users: profilesMap[msg.sender_id] || null
      }));
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
      // Step 1: Get pinned messages
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_pinned', true)
        .eq('is_deleted', false)
        .order('pinned_at', { ascending: false });

      // Handle case where column doesn't exist yet (migration not run)
      if (error) {
        if (error.code === '42703' || error.message?.includes('does not exist')) {
          console.log('[messagingService] is_pinned column not found, feature not available yet');
          return [];
        }
        throw error;
      }

      if (!data || data.length === 0) return [];

      // Step 2: Fetch sender profiles
      const senderIds = [...new Set(data.map(m => m.sender_id).filter(Boolean))];
      let profilesMap = {};

      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, username, avatar_url')
          .in('id', senderIds);

        profiles?.forEach(p => {
          p.display_name = p.full_name || p.display_name || p.username || 'User';
          profilesMap[p.id] = p;
        });
      }

      // Step 3: Attach sender profiles to messages
      return data.map(msg => ({
        ...msg,
        sender: profilesMap[msg.sender_id] || null,
        users: profilesMap[msg.sender_id] || null,
      }));
    } catch (error) {
      console.warn('[messagingService] getPinnedMessages:', error?.message);
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

      // Handle missing column
      if (error) {
        if (error.code === '42703' || error.message?.includes('does not exist')) {
          console.warn('[messagingService] pinMessage: column not found');
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.warn('[messagingService] pinMessage:', error?.message);
      return null;
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

      // Handle missing column
      if (error) {
        if (error.code === '42703' || error.message?.includes('does not exist')) {
          console.warn('[messagingService] unpinMessage: column not found');
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.warn('[messagingService] unpinMessage:', error?.message);
      return null;
    }
  }

  // =====================================================
  // STARRED MESSAGES
  // =====================================================

  /**
   * Star a message for current user
   * @param {string} messageId - Message ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async starMessage(messageId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      // Check if starred_messages table exists by trying to insert
      const { data, error } = await supabase
        .from('starred_messages')
        .upsert({
          message_id: messageId,
          user_id: user.id,
          starred_at: new Date().toISOString(),
        }, {
          onConflict: 'message_id,user_id',
        })
        .select()
        .single();

      // Handle missing table
      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('[messagingService] starMessage: starred_messages table not found');
          return { success: false, error: 'Feature not available yet' };
        }
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.warn('[messagingService] starMessage error:', error?.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unstar a message for current user
   * @param {string} messageId - Message ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async unstarMessage(messageId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const { error } = await supabase
        .from('starred_messages')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id);

      // Handle missing table
      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('[messagingService] unstarMessage: starred_messages table not found');
          return { success: false, error: 'Feature not available yet' };
        }
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.warn('[messagingService] unstarMessage error:', error?.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle star status for a message
   * @param {string} messageId - Message ID
   * @returns {Promise<{success: boolean, isStarred: boolean, error?: string}>}
   */
  async toggleStarMessage(messageId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      // Check if already starred
      const { data: existing, error: checkError } = await supabase
        .from('starred_messages')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .maybeSingle();

      // Handle missing table
      if (checkError) {
        if (checkError.code === '42P01' || checkError.message?.includes('does not exist')) {
          console.warn('[messagingService] toggleStarMessage: starred_messages table not found');
          return { success: false, isStarred: false, error: 'Feature not available yet' };
        }
        throw checkError;
      }

      if (existing) {
        // Unstar
        const result = await this.unstarMessage(messageId);
        return { ...result, isStarred: false };
      } else {
        // Star
        const result = await this.starMessage(messageId);
        return { ...result, isStarred: true };
      }
    } catch (error) {
      console.warn('[messagingService] toggleStarMessage error:', error?.message);
      return { success: false, isStarred: false, error: error.message };
    }
  }

  /**
   * Get starred messages for a conversation or all conversations
   * @param {string} conversationId - Optional conversation ID
   * @returns {Promise<Array>} List of starred messages
   */
  async getStarredMessages(conversationId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First get starred message IDs
      const { data: starredData, error: starredError } = await supabase
        .from('starred_messages')
        .select('message_id, starred_at')
        .eq('user_id', user.id)
        .order('starred_at', { ascending: false });

      // Handle missing table
      if (starredError) {
        if (starredError.code === '42P01' || starredError.message?.includes('does not exist')) {
          console.warn('[messagingService] getStarredMessages: starred_messages table not found');
          return [];
        }
        throw starredError;
      }

      if (!starredData || starredData.length === 0) {
        return [];
      }

      const messageIds = starredData.map(s => s.message_id);

      // Step 1: Fetch messages with conversations
      let query = supabase
        .from('messages')
        .select(`
          *,
          conversations(
            id,
            name,
            is_group
          )
        `)
        .in('id', messageIds)
        .eq('is_deleted', false);

      if (conversationId) {
        query = query.eq('conversation_id', conversationId);
      }

      const { data: messages, error: messagesError } = await query;

      if (messagesError) throw messagesError;
      if (!messages || messages.length === 0) return [];

      // Step 2: Fetch sender profiles
      const senderIds = [...new Set(messages.map(m => m.sender_id).filter(Boolean))];
      let profilesMap = {};

      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, username, avatar_url')
          .in('id', senderIds);

        profiles?.forEach(p => {
          p.display_name = p.full_name || p.display_name || p.username || 'User';
          profilesMap[p.id] = p;
        });
      }

      // Step 3: Attach sender profiles and starred_at to messages
      const messagesWithStarred = messages.map(msg => ({
        ...msg,
        sender: profilesMap[msg.sender_id] || null,
        users: profilesMap[msg.sender_id] || null,
        starred_at: starredData.find(s => s.message_id === msg.id)?.starred_at,
      }));

      // Sort by starred_at desc
      messagesWithStarred.sort((a, b) =>
        new Date(b.starred_at) - new Date(a.starred_at)
      );

      return messagesWithStarred;
    } catch (error) {
      console.warn('[messagingService] getStarredMessages error:', error?.message);
      return [];
    }
  }

  /**
   * Check if a message is starred by current user
   * @param {string} messageId - Message ID
   * @returns {Promise<boolean>}
   */
  async isMessageStarred(messageId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('starred_messages')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .maybeSingle();

      // Handle missing table
      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          return false;
        }
        throw error;
      }

      return !!data;
    } catch (error) {
      console.warn('[messagingService] isMessageStarred error:', error?.message);
      return false;
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
      console.error('Error getting total unread count:', formatError(error));
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

  // =====================================================
  // MESSAGE RECALL
  // =====================================================

  /**
   * Recall (thu hồi) a message
   * @param {string} messageId - Message ID to recall
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async recallMessage(messageId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      // Fetch message
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (fetchError || !message) {
        return { success: false, error: 'Tin nhắn không tồn tại' };
      }

      // Check ownership
      if (message.sender_id !== user.id) {
        return { success: false, error: 'Bạn chỉ có thể thu hồi tin nhắn của mình' };
      }

      // Check already recalled
      if (message.is_recalled) {
        return { success: false, error: 'Tin nhắn đã được thu hồi' };
      }

      // Check time limit
      const createdAt = new Date(message.created_at);
      const now = new Date();
      const diffHours = (now - createdAt) / (1000 * 60 * 60);

      const isMediaMessage = ['image', 'video', 'audio', 'file'].includes(message.message_type);
      const timeLimit = isMediaMessage ? 1 : 24; // hours

      if (diffHours > timeLimit) {
        return { success: false, error: `Đã quá thời gian thu hồi (${timeLimit} giờ)` };
      }

      // Update message - try with all columns first, fallback if column doesn't exist
      let updateError;

      // First try with all recall columns
      const { error: err1 } = await supabase
        .from('messages')
        .update({
          is_recalled: true,
          recalled_at: new Date().toISOString(),
          content: null,
          caption: null,
        })
        .eq('id', messageId);

      updateError = err1;

      // If column doesn't exist, try simpler update
      if (updateError?.code === '42703' || updateError?.message?.includes('does not exist')) {
        const { error: err2 } = await supabase
          .from('messages')
          .update({
            content: '[Tin nhắn đã bị thu hồi]',
            is_deleted: true,
          })
          .eq('id', messageId);
        updateError = err2;
      }

      if (updateError) throw updateError;

      // Delete reactions
      await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId);

      // Delete media from storage if applicable
      if (isMediaMessage && message.attachment_url) {
        try {
          const path = this._extractPathFromUrl(message.attachment_url);
          if (path) {
            await supabase.storage
              .from('message-attachments')
              .remove([path]);
          }
        } catch (e) {
          console.warn('[recallMessage] Failed to delete media:', e);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('[messagingService] recallMessage error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if message can be recalled
   * @param {object} message - Message object
   * @param {string} currentUserId - Current user ID
   * @returns {{ canRecall: boolean, reason?: string, remainingTime?: number }}
   */
  canRecallMessage(message, currentUserId) {
    if (!message || !currentUserId) {
      return { canRecall: false, reason: 'Invalid data' };
    }

    if (message.sender_id !== currentUserId) {
      return { canRecall: false, reason: 'Không phải tin nhắn của bạn' };
    }

    if (message.is_recalled) {
      return { canRecall: false, reason: 'Đã thu hồi' };
    }

    const createdAt = new Date(message.created_at);
    const now = new Date();
    const diffMs = now - createdAt;
    const diffHours = diffMs / (1000 * 60 * 60);

    const isMediaMessage = ['image', 'video', 'audio', 'file'].includes(message.message_type);
    const timeLimitHours = isMediaMessage ? 1 : 24;
    const timeLimitMs = timeLimitHours * 60 * 60 * 1000;

    if (diffHours > timeLimitHours) {
      return { canRecall: false, reason: 'Đã hết thời gian thu hồi' };
    }

    const remainingTime = timeLimitMs - diffMs;

    return {
      canRecall: true,
      remainingTime, // in ms
    };
  }

  /**
   * Helper to extract path from storage URL
   * @private
   */
  _extractPathFromUrl(url) {
    if (!url) return null;
    const match = url.match(/\/message-attachments\/(.+)$/);
    return match ? match[1] : null;
  }

  // =====================================================
  // PINNED CONVERSATIONS (per-user)
  // =====================================================

  /**
   * Pin a conversation for current user
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async pinConversation(conversationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      // Check current pinned count
      const { data: pinnedData, error: countError } = await supabase
        .from('conversation_settings')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_pinned', true);

      if (countError) throw countError;

      if (pinnedData?.length >= 5) {
        return { success: false, error: 'Chỉ có thể ghim tối đa 5 cuộc trò chuyện' };
      }

      // Get max pin order
      const { data: maxOrderData } = await supabase
        .from('conversation_settings')
        .select('pin_order')
        .eq('user_id', user.id)
        .eq('is_pinned', true)
        .order('pin_order', { ascending: false })
        .limit(1)
        .single();

      const nextOrder = (maxOrderData?.pin_order || 0) + 1;

      // Upsert settings
      const { error } = await supabase
        .from('conversation_settings')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_pinned: true,
          pin_order: nextOrder,
        }, {
          onConflict: 'conversation_id,user_id',
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[messagingService] pinConversation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unpin a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async unpinConversation(conversationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const { error } = await supabase
        .from('conversation_settings')
        .update({
          is_pinned: false,
          pin_order: null,
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[messagingService] unpinConversation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get pinned conversation IDs for current user
   * @returns {Promise<{success: boolean, data?: string[], error?: string}>}
   */
  async getPinnedConversationIds() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const { data, error } = await supabase
        .from('conversation_settings')
        .select('conversation_id, pin_order')
        .eq('user_id', user.id)
        .eq('is_pinned', true)
        .order('pin_order', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data?.map(d => d.conversation_id) || []
      };
    } catch (error) {
      console.error('[messagingService] getPinnedConversationIds error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // =====================================================
  // CHAT THEMES
  // =====================================================

  /**
   * Get chat theme for a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<{themeId: string, customBackground?: string}>}
   */
  async getChatTheme(conversationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { themeId: 'crystal' };

      const { data, error } = await supabase
        .from('conversation_settings')
        .select('theme_id, custom_background_url')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return {
        themeId: data?.theme_id || 'crystal',
        customBackground: data?.custom_background_url,
      };
    } catch (error) {
      console.error('[messagingService] getChatTheme error:', error);
      return { themeId: 'crystal' };
    }
  }

  /**
   * Set chat theme for a conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} themeId - Theme ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async setChatTheme(conversationId, themeId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const { error } = await supabase
        .from('conversation_settings')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          theme_id: themeId,
        }, {
          onConflict: 'conversation_id,user_id',
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[messagingService] setChatTheme error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Set custom background for a conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} imageUrl - Background image URL
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async setCustomBackground(conversationId, imageUrl) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const { error } = await supabase
        .from('conversation_settings')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          custom_background_url: imageUrl,
        }, {
          onConflict: 'conversation_id,user_id',
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[messagingService] setCustomBackground error:', error);
      return { success: false, error: error.message };
    }
  }

  // =====================================================
  // ARCHIVE CONVERSATIONS
  // =====================================================

  /**
   * Archive a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async archiveConversation(conversationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const { error } = await supabase
        .from('conversation_settings')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_archived: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'conversation_id,user_id',
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[messagingService] archiveConversation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unarchive a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async unarchiveConversation(conversationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const { error } = await supabase
        .from('conversation_settings')
        .update({
          is_archived: false,
          updated_at: new Date().toISOString(),
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[messagingService] unarchiveConversation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get archived conversations
   * @returns {Promise<Array>} List of archived conversations
   */
  async getArchivedConversations() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      // Get archived conversation IDs
      const { data: archivedSettings, error: settingsError } = await supabase
        .from('conversation_settings')
        .select('conversation_id, updated_at')
        .eq('user_id', user.id)
        .eq('is_archived', true)
        .order('updated_at', { ascending: false });

      if (settingsError) throw settingsError;

      if (!archivedSettings || archivedSettings.length === 0) {
        return [];
      }

      const archivedIds = archivedSettings.map(s => s.conversation_id);

      // Fetch full conversation details
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants!inner(
            unread_count,
            last_read_at,
            user_id
          ),
          messages(
            id,
            content,
            created_at,
            sender_id,
            is_deleted
          )
        `)
        .in('id', archivedIds)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Collect all unique participant user_ids (excluding current user)
      const otherUserIds = new Set();
      data.forEach(conv => {
        conv.conversation_participants.forEach(p => {
          if (p.user_id !== user.id) {
            otherUserIds.add(p.user_id);
          }
        });
      });

      // Fetch profiles for all other participants
      let profilesMap = {};
      if (otherUserIds.size > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, username, avatar_url, online_status')
          .in('id', Array.from(otherUserIds));

        if (!profilesError && profiles) {
          profiles.forEach(profile => {
            // Create normalized display_name with fallback: full_name > username > display_name
            profile.display_name = profile.full_name || profile.display_name || profile.username || 'User';
            profilesMap[profile.id] = profile;
          });
        }
      }

      // Process conversations similar to getConversations
      const conversationsWithLatest = data.map(conv => {
        const sortedMessages = conv.messages
          .filter(m => !m.is_deleted)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const otherParticipantRecord = conv.conversation_participants
          .find(p => p.user_id !== user.id);
        const otherParticipant = otherParticipantRecord
          ? profilesMap[otherParticipantRecord.user_id]
          : null;

        const archivedInfo = archivedSettings.find(s => s.conversation_id === conv.id);

        return {
          ...conv,
          latest_message: sortedMessages[0] || null,
          other_participant: otherParticipant,
          my_unread_count: conv.conversation_participants
            .find(p => p.user_id === user.id)?.unread_count || 0,
          archived_at: archivedInfo?.updated_at,
          messages: undefined
        };
      });

      return conversationsWithLatest;
    } catch (error) {
      console.error('[messagingService] getArchivedConversations error:', error);
      throw error;
    }
  }

  /**
   * Get archived conversation IDs for current user
   * @returns {Promise<string[]>} List of archived conversation IDs
   */
  async getArchivedConversationIds() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversation_settings')
        .select('conversation_id')
        .eq('user_id', user.id)
        .eq('is_archived', true);

      if (error) throw error;

      return data?.map(d => d.conversation_id) || [];
    } catch (error) {
      console.error('[messagingService] getArchivedConversationIds error:', error);
      return [];
    }
  }

  /**
   * Bulk unarchive conversations
   * @param {string[]} conversationIds - Array of conversation IDs
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async bulkUnarchive(conversationIds) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const { error } = await supabase
        .from('conversation_settings')
        .update({
          is_archived: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .in('conversation_id', conversationIds);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[messagingService] bulkUnarchive error:', error);
      return { success: false, error: error.message };
    }
  }

  // =====================================================
  // MUTE CONVERSATIONS
  // =====================================================

  /**
   * Mute a conversation until specified time
   * @param {string} conversationId - Conversation ID
   * @param {Date} muteUntil - Mute until this date
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async muteConversation(conversationId, muteUntil) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const { error } = await supabase
        .from('conversation_settings')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          mute_until: muteUntil.toISOString(),
        }, {
          onConflict: 'conversation_id,user_id',
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[messagingService] muteConversation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unmute a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async unmuteConversation(conversationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const { error } = await supabase
        .from('conversation_settings')
        .update({
          mute_until: null,
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[messagingService] unmuteConversation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get mute status for a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<{isMuted: boolean, muteUntil?: string}>}
   */
  async getMuteStatus(conversationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isMuted: false };

      const { data, error } = await supabase
        .from('conversation_settings')
        .select('mute_until')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const muteUntil = data?.mute_until;
      const isMuted = muteUntil && new Date(muteUntil) > new Date();

      return {
        isMuted,
        muteUntil: isMuted ? muteUntil : null,
      };
    } catch (error) {
      console.error('[messagingService] getMuteStatus error:', error);
      return { isMuted: false };
    }
  }

  /**
   * Update conversation notification sound
   * @param {string} conversationId - Conversation ID
   * @param {string} soundId - Sound ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async updateConversationSound(conversationId, soundId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const { error } = await supabase
        .from('conversation_settings')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          notification_sound: soundId,
        }, {
          onConflict: 'conversation_id,user_id',
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[messagingService] updateConversationSound error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a conversation (leave for current user)
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteConversation(conversationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      console.log('[messagingService] Deleting conversation:', conversationId, 'for user:', user.id);

      // STEP 1: Save to local deleted list FIRST (immediate UX)
      // This ensures the conversation stays hidden even if server delete fails
      await this.addDeletedConversationId(user.id, conversationId);

      // STEP 2: Persist to server via conversation_settings (cross-device sync)
      // Use upsert with is_deleted flag - this table has full RLS access for users
      const { error: settingsError } = await supabase
        .from('conversation_settings')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'conversation_id,user_id',
        });

      if (settingsError) {
        console.error('[messagingService] Error setting is_deleted in conversation_settings:', settingsError);
        // Non-critical - local delete still works
      } else {
        console.log('[messagingService] Server-side soft delete succeeded (conversation_settings.is_deleted = true)');
      }

      // STEP 3: Try to delete from conversation_participants (may fail due to RLS, that's OK)
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (participantError) {
        console.warn('[messagingService] conversation_participants delete failed (expected - no RLS policy):', participantError.message);
        // Expected to fail - conversation_participants has no DELETE RLS policy
      }

      console.log('[messagingService] Conversation deleted successfully:', conversationId);
      return { success: true };
    } catch (error) {
      console.error('[messagingService] deleteConversation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle mute for a conversation (legacy support)
   * @param {string} conversationId - Conversation ID
   * @param {boolean} mute - True to mute, false to unmute
   * @returns {Promise<void>}
   */
  async toggleMute(conversationId, mute) {
    if (mute) {
      // Default mute: forever
      const muteUntil = new Date('2099-12-31T23:59:59.999Z');
      await this.muteConversation(conversationId, muteUntil);
    } else {
      await this.unmuteConversation(conversationId);
    }
  }
}

// Export singleton instance (same as web)
export default new MessagingService();
