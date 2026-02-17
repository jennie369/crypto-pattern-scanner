/**
 * LivestreamContext
 * State management for AI Livestream feature
 *
 * Features:
 * - Session management (join/leave)
 * - Real-time comments subscription
 * - Send comments
 * - Viewer count tracking
 * - Connection state
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { supabase } from '../services/supabase';
import { livestreamService } from '../services/livestreamService';
import { useAuth } from './AuthContext';

// ============================================================================
// CONTEXT
// ============================================================================

const LivestreamContext = createContext(null);

// ============================================================================
// PROVIDER
// ============================================================================

export const LivestreamProvider = ({ children }) => {
  const { user } = useAuth();

  // Session state
  const [currentSession, setCurrentSession] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Comments state
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Viewer state
  const [viewerCount, setViewerCount] = useState(0);
  const [heartCount, setHeartCount] = useState(0);

  // Subscriptions ref
  const subscriptionsRef = useRef([]);

  // ========== SESSION MANAGEMENT ==========

  /**
   * Join a livestream session
   */
  const joinSession = useCallback(async (sessionId) => {
    if (!sessionId) {
      setError('Session ID is required');
      return { success: false, error: 'Session ID is required' };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get session info
      const result = await livestreamService.getSession(sessionId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to get session');
      }

      setCurrentSession(result.session);

      // Load initial comments
      await loadComments(sessionId);

      // Subscribe to real-time updates
      subscribeToSession(sessionId);
      subscribeToComments(sessionId);

      // Update viewer count (increment)
      await incrementViewerCount(sessionId);

      setIsConnected(true);
      setIsLoading(false);

      console.log('[LivestreamContext] Joined session:', sessionId);
      return { success: true, session: result.session };
    } catch (err) {
      console.error('[LivestreamContext] Join session error:', err);
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Leave current session
   */
  const leaveSession = useCallback(async () => {
    if (!currentSession) return;

    try {
      // Decrement viewer count
      await decrementViewerCount(currentSession.id);

      // Cleanup subscriptions
      cleanup();

      setCurrentSession(null);
      setComments([]);
      setViewerCount(0);
      setIsConnected(false);

      console.log('[LivestreamContext] Left session');
    } catch (err) {
      console.error('[LivestreamContext] Leave session error:', err);
    }
  }, [currentSession]);

  // ========== COMMENTS ==========

  /**
   * Load initial comments for session
   */
  const loadComments = async (sessionId, options = {}) => {
    setIsLoadingComments(true);

    try {
      const result = await livestreamService.getComments(sessionId, {
        limit: options.limit || 50,
      });

      if (result.success) {
        setComments(result.comments.reverse()); // Oldest first
      }
    } catch (err) {
      console.error('[LivestreamContext] Load comments error:', err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  /**
   * Load more (older) comments
   */
  const loadMoreComments = useCallback(async () => {
    if (!currentSession || comments.length === 0 || isLoadingComments) return;

    setIsLoadingComments(true);

    try {
      const oldestComment = comments[0];
      const { data, error } = await supabase
        .from('livestream_comments')
        .select('*')
        .eq('session_id', currentSession.id)
        .eq('is_hidden', false)
        .lt('created_at', oldestComment.created_at)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      if (data && data.length > 0) {
        setComments((prev) => [...data.reverse(), ...prev]);
      }
    } catch (err) {
      console.error('[LivestreamContext] Load more comments error:', err);
    } finally {
      setIsLoadingComments(false);
    }
  }, [currentSession, comments, isLoadingComments]);

  /**
   * Send a comment
   */
  const sendComment = useCallback(async (message) => {
    if (!currentSession || !user || !message.trim()) {
      return { success: false, error: 'Cannot send comment' };
    }

    try {
      const result = await livestreamService.sendComment(currentSession.id, {
        userId: user.id,
        platform: 'gemral',
        username: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
        avatar: user.user_metadata?.avatar_url,
        message: message.trim(),
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return { success: true, comment: result.comment };
    } catch (err) {
      console.error('[LivestreamContext] Send comment error:', err);
      return { success: false, error: err.message };
    }
  }, [currentSession, user]);

  // ========== SUBSCRIPTIONS ==========

  /**
   * Subscribe to session updates
   */
  const subscribeToSession = (sessionId) => {
    const unsubscribe = livestreamService.subscribeToSession(
      sessionId,
      (updatedSession) => {
        setCurrentSession(updatedSession);

        // Update stats
        if (updatedSession.stats) {
          setViewerCount(updatedSession.stats.current_viewers || 0);
          setHeartCount(updatedSession.stats.total_hearts || 0);
        }

        // Handle session ended
        if (updatedSession.status === 'ended') {
          console.log('[LivestreamContext] Session ended');
        }
      }
    );

    subscriptionsRef.current.push(unsubscribe);
  };

  /**
   * Subscribe to new comments
   */
  const subscribeToComments = (sessionId) => {
    const unsubscribe = livestreamService.subscribeToComments(
      sessionId,
      (newComment) => {
        setComments((prev) => [...prev, newComment]);
      }
    );

    subscriptionsRef.current.push(unsubscribe);
  };

  // ========== VIEWER COUNT ==========

  /**
   * Increment viewer count
   */
  const incrementViewerCount = async (sessionId) => {
    try {
      const { data, error } = await supabase.rpc('increment_stream_viewers', {
        p_stream_id: sessionId,
      });

      if (error) {
        // Fallback: manual update
        const { data: session } = await supabase
          .from('livestream_sessions')
          .select('stats')
          .eq('id', sessionId)
          .single();

        const currentViewers = session?.stats?.current_viewers || 0;
        await supabase
          .from('livestream_sessions')
          .update({
            stats: {
              ...session?.stats,
              current_viewers: currentViewers + 1,
            },
          })
          .eq('id', sessionId);
      }

      // Get updated count
      const { data: updatedSession } = await supabase
        .from('livestream_sessions')
        .select('stats')
        .eq('id', sessionId)
        .single();

      if (updatedSession?.stats) {
        setViewerCount(updatedSession.stats.current_viewers || 0);
      }
    } catch (err) {
      console.error('[LivestreamContext] Increment viewer error:', err);
    }
  };

  /**
   * Decrement viewer count
   */
  const decrementViewerCount = async (sessionId) => {
    try {
      await supabase.rpc('decrement_stream_viewers', {
        p_stream_id: sessionId,
      });
    } catch (err) {
      console.error('[LivestreamContext] Decrement viewer error:', err);
    }
  };

  // ========== REACTIONS ==========

  /**
   * Send a heart reaction
   */
  const sendHeart = useCallback(async () => {
    if (!currentSession) return;

    try {
      // Increment local count immediately
      setHeartCount((prev) => prev + 1);

      // Update in database
      const { data: session } = await supabase
        .from('livestream_sessions')
        .select('stats')
        .eq('id', currentSession.id)
        .single();

      const totalHearts = (session?.stats?.total_hearts || 0) + 1;

      await supabase
        .from('livestream_sessions')
        .update({
          stats: {
            ...session?.stats,
            total_hearts: totalHearts,
          },
        })
        .eq('id', currentSession.id);
    } catch (err) {
      console.error('[LivestreamContext] Send heart error:', err);
    }
  }, [currentSession]);

  // ========== CLEANUP ==========

  const cleanup = useCallback(() => {
    // Unsubscribe all
    subscriptionsRef.current.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch (e) {
        console.warn('[LivestreamContext] Cleanup error:', e);
      }
    });
    subscriptionsRef.current = [];

    // Cleanup livestream service
    livestreamService.cleanup();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // ========== CONTEXT VALUE ==========

  const value = {
    // Session
    currentSession,
    isConnected,
    isLoading,
    error,

    // Comments
    comments,
    isLoadingComments,

    // Stats
    viewerCount,
    heartCount,

    // Actions
    joinSession,
    leaveSession,
    sendComment,
    sendHeart,
    loadMoreComments,

    // Cleanup
    cleanup,
  };

  return (
    <LivestreamContext.Provider value={value}>
      {children}
    </LivestreamContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useLivestream = () => {
  const context = useContext(LivestreamContext);

  if (!context) {
    throw new Error('useLivestream must be used within a LivestreamProvider');
  }

  return context;
};

export default LivestreamContext;
