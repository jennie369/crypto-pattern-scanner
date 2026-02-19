/**
 * useChatTheme Hook
 * Manages chat theme state and persistence
 *
 * Features:
 * - Fetch theme from database
 * - Real-time theme sync
 * - Optimistic updates
 * - Fallback to default theme
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { getTheme, DEFAULT_THEME } from '../constants/chatThemes';

/**
 * useChatTheme - Hook quản lý chat theme
 *
 * @param {string} conversationId - Conversation ID
 * @returns {object} Theme state and methods
 */
const useChatTheme = (conversationId) => {
  const [currentThemeId, setCurrentThemeId] = useState(DEFAULT_THEME);
  const [customBackground, setCustomBackground] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch theme settings
  useEffect(() => {
    if (!conversationId) {
      setIsLoading(false);
      return;
    }

    const fetchTheme = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('conversation_settings')
          .select('theme_id, custom_background_url')
          .eq('conversation_id', conversationId)
          .eq('user_id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // Not found is OK
          throw fetchError;
        }

        if (data) {
          setCurrentThemeId(data.theme_id || DEFAULT_THEME);
          setCustomBackground(data.custom_background_url);
        }
      } catch (err) {
        console.error('[useChatTheme] Fetch error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheme();

    // Subscribe to changes
    const channel = supabase
      .channel(`theme:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_settings',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (payload.new) {
            setCurrentThemeId(payload.new.theme_id || DEFAULT_THEME);
            setCustomBackground(payload.new.custom_background_url);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Set theme
  const setTheme = useCallback(async (themeId) => {
    if (!conversationId) return { success: false, error: 'No conversation' };

    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) throw new Error('Not authenticated');

      // Optimistic update
      const previousTheme = currentThemeId;
      setCurrentThemeId(themeId);

      const { error: updateError } = await supabase
        .from('conversation_settings')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          theme_id: themeId,
        }, {
          onConflict: 'conversation_id,user_id',
        });

      if (updateError) {
        // Rollback
        setCurrentThemeId(previousTheme);
        throw updateError;
      }

      return { success: true };
    } catch (err) {
      console.error('[useChatTheme] setTheme error:', err);
      return { success: false, error: err.message };
    }
  }, [conversationId, currentThemeId]);

  // Set custom background
  const setBackground = useCallback(async (imageUrl) => {
    if (!conversationId) return { success: false, error: 'No conversation' };

    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) throw new Error('Not authenticated');

      // Optimistic update
      const previousBackground = customBackground;
      setCustomBackground(imageUrl);

      const { error: updateError } = await supabase
        .from('conversation_settings')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          custom_background_url: imageUrl,
        }, {
          onConflict: 'conversation_id,user_id',
        });

      if (updateError) {
        // Rollback
        setCustomBackground(previousBackground);
        throw updateError;
      }

      return { success: true };
    } catch (err) {
      console.error('[useChatTheme] setBackground error:', err);
      return { success: false, error: err.message };
    }
  }, [conversationId, customBackground]);

  // Reset to default theme
  const resetTheme = useCallback(async () => {
    return setTheme(DEFAULT_THEME);
  }, [setTheme]);

  // Get current theme object
  const theme = getTheme(currentThemeId);

  return {
    theme,
    themeId: currentThemeId,
    customBackground,
    isLoading,
    error,
    setTheme,
    setBackground,
    resetTheme,
  };
};

export default useChatTheme;
