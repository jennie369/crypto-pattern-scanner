/**
 * useReactions Hook
 * Manages message reactions with real-time sync via Supabase
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to manage reactions for a conversation
 * @param {string} conversationId - ID of the conversation
 * @returns {Object} Reaction state and methods
 */
export const useReactions = (conversationId) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========== FETCH REACTIONS ==========
  const fetchReactions = useCallback(async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('message_reactions')
        .select(`
          id,
          message_id,
          user_id,
          emoji,
          created_at,
          users:user_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId);

      if (fetchError) throw fetchError;

      // Group reactions by message_id
      const grouped = {};
      (data || []).forEach((reaction) => {
        const msgId = reaction.message_id;
        if (!grouped[msgId]) {
          grouped[msgId] = [];
        }
        grouped[msgId].push({
          id: reaction.id,
          emoji: reaction.emoji,
          user_id: reaction.user_id,
          user: reaction.users,
          created_at: reaction.created_at,
        });
      });

      setReactions(grouped);
    } catch (err) {
      console.error('[useReactions] Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // ========== REALTIME SUBSCRIPTION ==========
  useEffect(() => {
    if (!conversationId) return;

    fetchReactions();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`reactions:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reactions',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch user data for the new reaction
          const { data: userData } = await supabase
            .from('users')
            .select('id, display_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          const newReaction = {
            id: payload.new.id,
            emoji: payload.new.emoji,
            user_id: payload.new.user_id,
            user: userData,
            created_at: payload.new.created_at,
          };

          setReactions((prev) => {
            const msgId = payload.new.message_id;
            return {
              ...prev,
              [msgId]: [...(prev[msgId] || []), newReaction],
            };
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'message_reactions',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setReactions((prev) => {
            const msgId = payload.old.message_id;
            return {
              ...prev,
              [msgId]: (prev[msgId] || []).filter(
                (r) => r.id !== payload.old.id
              ),
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchReactions]);

  // ========== ADD REACTION ==========
  const addReaction = useCallback(
    async (messageId, emoji) => {
      if (!user?.id || !messageId || !emoji) return { success: false };

      try {
        const { data, error: insertError } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            conversation_id: conversationId,
            emoji,
          })
          .select()
          .single();

        if (insertError) {
          // Check if it's a duplicate error
          if (insertError.message?.includes('duplicate')) {
            return { success: false, error: 'Already reacted' };
          }
          throw insertError;
        }

        return { success: true, data };
      } catch (err) {
        console.error('[useReactions] Add error:', err);
        return { success: false, error: err.message };
      }
    },
    [user?.id, conversationId]
  );

  // ========== REMOVE REACTION ==========
  const removeReaction = useCallback(
    async (messageId, emoji) => {
      if (!user?.id || !messageId || !emoji) return { success: false };

      try {
        const { error: deleteError } = await supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', user.id)
          .eq('emoji', emoji);

        if (deleteError) throw deleteError;

        return { success: true };
      } catch (err) {
        console.error('[useReactions] Remove error:', err);
        return { success: false, error: err.message };
      }
    },
    [user?.id]
  );

  // ========== TOGGLE REACTION ==========
  const toggleReaction = useCallback(
    async (messageId, emoji) => {
      if (!user?.id) return { success: false };

      // Check if user already reacted with this emoji
      const messageReactions = reactions[messageId] || [];
      const existingReaction = messageReactions.find(
        (r) => r.user_id === user.id && r.emoji === emoji
      );

      if (existingReaction) {
        return await removeReaction(messageId, emoji);
      } else {
        return await addReaction(messageId, emoji);
      }
    },
    [user?.id, reactions, addReaction, removeReaction]
  );

  // ========== GET REACTIONS FOR MESSAGE ==========
  const getReactionsForMessage = useCallback(
    (messageId) => {
      return reactions[messageId] || [];
    },
    [reactions]
  );

  // ========== GET USER REACTIONS FOR MESSAGE ==========
  const getUserReactionsForMessage = useCallback(
    (messageId) => {
      if (!user?.id) return [];
      return (reactions[messageId] || [])
        .filter((r) => r.user_id === user.id)
        .map((r) => r.emoji);
    },
    [reactions, user?.id]
  );

  // ========== GET GROUPED REACTIONS ==========
  const getGroupedReactions = useCallback(
    (messageId) => {
      const messageReactions = reactions[messageId] || [];
      if (messageReactions.length === 0) return [];

      // Group by emoji
      const groups = {};
      messageReactions.forEach((r) => {
        if (!groups[r.emoji]) {
          groups[r.emoji] = {
            emoji: r.emoji,
            count: 0,
            users: [],
            hasOwn: false,
          };
        }
        groups[r.emoji].count++;
        groups[r.emoji].users.push(r.user);
        if (r.user_id === user?.id) {
          groups[r.emoji].hasOwn = true;
        }
      });

      // Sort by count descending
      return Object.values(groups).sort((a, b) => b.count - a.count);
    },
    [reactions, user?.id]
  );

  return {
    reactions,
    loading,
    error,
    addReaction,
    removeReaction,
    toggleReaction,
    getReactionsForMessage,
    getUserReactionsForMessage,
    getGroupedReactions,
    refetch: fetchReactions,
  };
};

export default useReactions;
