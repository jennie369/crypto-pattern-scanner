/**
 * useReadReceipts Hook
 * Manages read receipts for group messages
 *
 * Features:
 * - Fetch read receipts for messages
 * - Real-time updates
 * - Track who read when
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';

/**
 * useReadReceipts - Hook for message read receipts
 *
 * @param {string} conversationId - Conversation ID
 * @param {string} currentUserId - Current user ID
 * @returns {object} { receipts, getReceiptsForMessage, markAsRead, subscribeToReceipts }
 */
export default function useReadReceipts(conversationId, currentUserId) {
  // State: Map of messageId -> array of receipts
  const [receipts, setReceipts] = useState({});
  const [loading, setLoading] = useState(false);

  // Subscription ref
  const subscriptionRef = useRef(null);

  /**
   * Fetch read receipts for a specific message
   */
  const fetchReceiptsForMessage = useCallback(async (messageId) => {
    try {
      const { data, error } = await supabase
        .from('message_read_receipts')
        .select(`
          id,
          user_id,
          read_at,
          users:user_id(
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('message_id', messageId)
        .order('read_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('[useReadReceipts] fetchReceiptsForMessage error:', err);
      return [];
    }
  }, []);

  /**
   * Fetch receipts for multiple messages (batch)
   */
  const fetchReceiptsForMessages = useCallback(async (messageIds) => {
    if (!messageIds || messageIds.length === 0) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('message_read_receipts')
        .select(`
          id,
          message_id,
          user_id,
          read_at,
          users:user_id(
            id,
            display_name,
            avatar_url
          )
        `)
        .in('message_id', messageIds)
        .order('read_at', { ascending: true });

      if (error) throw error;

      // Group by message_id
      const grouped = {};
      data?.forEach(receipt => {
        if (!grouped[receipt.message_id]) {
          grouped[receipt.message_id] = [];
        }
        grouped[receipt.message_id].push(receipt);
      });

      setReceipts(prev => ({ ...prev, ...grouped }));
    } catch (err) {
      console.error('[useReadReceipts] fetchReceiptsForMessages error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get receipts for a message (from state)
   */
  const getReceiptsForMessage = useCallback((messageId) => {
    return receipts[messageId] || [];
  }, [receipts]);

  /**
   * Mark message as read
   */
  const markAsRead = useCallback(async (messageId) => {
    if (!currentUserId || !messageId) return;

    try {
      // Check if already read
      const existing = receipts[messageId]?.find(r => r.user_id === currentUserId);
      if (existing) return;

      const { error } = await supabase
        .from('message_read_receipts')
        .upsert({
          message_id: messageId,
          user_id: currentUserId,
          conversation_id: conversationId,
          read_at: new Date().toISOString(),
        }, {
          onConflict: 'message_id,user_id',
          ignoreDuplicates: true,
        });

      if (error) throw error;
    } catch (err) {
      // Ignore duplicate key errors
      if (!err.message?.includes('duplicate')) {
        console.error('[useReadReceipts] markAsRead error:', err);
      }
    }
  }, [currentUserId, conversationId, receipts]);

  /**
   * Mark multiple messages as read
   */
  const markMultipleAsRead = useCallback(async (messageIds) => {
    if (!currentUserId || !messageIds || messageIds.length === 0) return;

    try {
      // Filter out already read messages
      const unreadIds = messageIds.filter(id => {
        const existing = receipts[id]?.find(r => r.user_id === currentUserId);
        return !existing;
      });

      if (unreadIds.length === 0) return;

      const records = unreadIds.map(messageId => ({
        message_id: messageId,
        user_id: currentUserId,
        conversation_id: conversationId,
        read_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('message_read_receipts')
        .upsert(records, {
          onConflict: 'message_id,user_id',
          ignoreDuplicates: true,
        });

      if (error) throw error;
    } catch (err) {
      if (!err.message?.includes('duplicate')) {
        console.error('[useReadReceipts] markMultipleAsRead error:', err);
      }
    }
  }, [currentUserId, conversationId, receipts]);

  /**
   * Subscribe to real-time receipt updates
   */
  const subscribeToReceipts = useCallback(() => {
    if (!conversationId) return () => {};

    // Unsubscribe from previous subscription
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    const channel = supabase
      .channel(`receipts:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_read_receipts',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newReceipt = payload.new;

          // Fetch user details
          const { data: userData } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .eq('id', newReceipt.user_id)
            .single();

          const receiptWithUser = {
            ...newReceipt,
            users: userData,
          };

          setReceipts(prev => {
            const existing = prev[newReceipt.message_id] || [];
            // Check if already exists
            if (existing.find(r => r.user_id === newReceipt.user_id)) {
              return prev;
            }
            return {
              ...prev,
              [newReceipt.message_id]: [...existing, receiptWithUser],
            };
          });
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [conversationId]);

  /**
   * Get read status summary for a message
   * Returns: { count, allRead, readers }
   */
  const getReadStatus = useCallback((messageId, totalParticipants) => {
    const messageReceipts = receipts[messageId] || [];
    const count = messageReceipts.length;
    const allRead = count >= totalParticipants - 1; // Exclude sender

    return {
      count,
      allRead,
      readers: messageReceipts.map(r => ({
        userId: r.user_id,
        displayName: r.users?.display_name,
        avatarUrl: r.users?.avatar_url,
        readAt: r.read_at,
      })),
    };
  }, [receipts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, []);

  return {
    receipts,
    loading,
    fetchReceiptsForMessage,
    fetchReceiptsForMessages,
    getReceiptsForMessage,
    markAsRead,
    markMultipleAsRead,
    subscribeToReceipts,
    getReadStatus,
  };
}
