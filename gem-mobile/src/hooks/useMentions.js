/**
 * useMentions Hook
 * Manages @mentions for messages with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to manage mentions for a conversation
 *
 * @param {string} conversationId - ID of the conversation
 * @returns {Object} Mention state and methods
 */
export const useMentions = (conversationId) => {
  const { user } = useAuth();
  const [mentions, setMentions] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ========== FETCH MENTIONS ==========
  const fetchMentions = useCallback(async () => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Simple query without join - more compatible if table doesn't exist yet
      const { data, error } = await supabase
        .from('message_mentions')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false });

      // If table doesn't exist or other error, just return empty data
      if (error) {
        // PGRST200 = table doesn't exist, 42P01 = relation doesn't exist
        if (error.code === 'PGRST200' || error.code === '42P01' || error.message?.includes('does not exist')) {
          console.log('[useMentions] Table not found, returning empty data');
          setMentions([]);
          setUnreadCount(0);
          return;
        }
        throw error;
      }

      setMentions(data || []);

      // Count unread mentions for current user
      const unread = (data || []).filter(
        (m) => m.mentioned_user_id === user?.id && !m.is_read
      ).length;
      setUnreadCount(unread);
    } catch (err) {
      // Gracefully handle errors - don't crash the app
      console.warn('[useMentions] Fetch error (non-critical):', err?.message || err);
      setMentions([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [conversationId, user?.id]);

  // ========== REALTIME SUBSCRIPTION ==========
  useEffect(() => {
    if (!conversationId) return;

    fetchMentions();

    // Only subscribe if we successfully fetched (table exists)
    let channel = null;
    try {
      channel = supabase
        .channel(`mentions:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'message_mentions',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            setMentions((prev) => [payload.new, ...prev]);
            if (payload.new.mentioned_user_id === user?.id) {
              setUnreadCount((prev) => prev + 1);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'message_mentions',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            setMentions((prev) =>
              prev.map((m) => (m.id === payload.new.id ? payload.new : m))
            );
            if (
              payload.new.mentioned_user_id === user?.id &&
              payload.new.is_read
            ) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('[useMentions] Realtime subscription error:', err?.message);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [conversationId, fetchMentions, user?.id]);

  // ========== SAVE MENTIONS ==========
  const saveMentions = useCallback(
    async (messageId, mentionData) => {
      if (!messageId || !mentionData || mentionData.length === 0) return;

      try {
        const mentionsToInsert = mentionData.map((m) => ({
          message_id: messageId,
          mentioned_user_id: m.userId,
          conversation_id: conversationId,
          start_index: m.startIndex,
          end_index: m.endIndex,
        }));

        const { error } = await supabase
          .from('message_mentions')
          .insert(mentionsToInsert);

        // Silently fail if table doesn't exist
        if (error) {
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            console.log('[useMentions] Table not found, skipping save');
            return;
          }
          throw error;
        }
      } catch (err) {
        console.warn('[useMentions] Save error (non-critical):', err?.message);
        // Don't throw - mentions are non-critical feature
      }
    },
    [conversationId]
  );

  // ========== MARK AS READ ==========
  const markAsRead = useCallback(async () => {
    if (!user?.id || !conversationId) return;

    try {
      const { error } = await supabase
        .from('message_mentions')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('mentioned_user_id', user.id)
        .eq('is_read', false);

      // Silently fail if table doesn't exist
      if (error && !error.message?.includes('does not exist')) {
        console.warn('[useMentions] Mark read error:', error?.message);
      }
      setUnreadCount(0);
    } catch (err) {
      console.warn('[useMentions] Mark read error (non-critical):', err?.message);
    }
  }, [user?.id, conversationId]);

  // ========== GET MENTIONS FOR MESSAGE ==========
  const getMentionsForMessage = useCallback(
    (messageId) => {
      return mentions.filter((m) => m.message_id === messageId);
    },
    [mentions]
  );

  // ========== PARSE MENTIONS FROM TEXT ==========
  const parseMentionsFromText = useCallback(
    (text, participants) => {
      if (!text || !participants || participants.length === 0) return [];

      const mentionRegex = /@(\w+[\w\s]*)/g;
      const foundMentions = [];
      let match;

      while ((match = mentionRegex.exec(text)) !== null) {
        const mentionText = match[1].trim();

        // Find matching participant
        const participant = participants.find(
          (p) =>
            p.display_name?.toLowerCase().startsWith(mentionText.toLowerCase()) ||
            p.username?.toLowerCase() === mentionText.toLowerCase()
        );

        if (participant) {
          foundMentions.push({
            userId: participant.id,
            displayName: participant.display_name,
            startIndex: match.index,
            endIndex: match.index + match[0].length,
          });
        }
      }

      return foundMentions;
    },
    []
  );

  return {
    mentions,
    loading,
    unreadCount,
    saveMentions,
    markAsRead,
    getMentionsForMessage,
    parseMentionsFromText,
    refetch: fetchMentions,
  };
};

export default useMentions;
