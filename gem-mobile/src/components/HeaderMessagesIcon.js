/**
 * Gemral - Header Messages Icon Component
 * TikTok-style messages icon with unread badge
 *
 * Features:
 * - Unread count badge with animation
 * - Real-time badge updates via Supabase subscription
 * - Polling fallback (30s) in case realtime fails
 * - Refresh on screen focus (useFocusEffect)
 * - Navigate to Messages screen
 */

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  AppState,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MessageCircle } from 'lucide-react-native';

// Services
import messagingService from '../services/messagingService';

// Auth
import { useAuth } from '../contexts/AuthContext';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../utils/tokens';

const POLL_INTERVAL = 30000; // 30 seconds fallback polling

const HeaderMessagesIcon = memo(({ size = 22, color = COLORS.textPrimary }) => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // State
  const [unreadCount, setUnreadCount] = useState(0);

  // Animation
  const badgeScale = useRef(new Animated.Value(1)).current;

  // Refs
  const subscription = useRef(null);
  const pollInterval = useRef(null);
  const mountedRef = useRef(true);

  // Fetch unread count
  const fetchUnread = useCallback(async () => {
    if (!user?.id || !mountedRef.current) return;

    try {
      const count = await messagingService.getTotalUnreadCount();
      if (mountedRef.current) {
        setUnreadCount(prev => {
          if (count > prev && count > 0) {
            animateBadge();
          }
          return count;
        });
      }
    } catch (error) {
      console.error('[HeaderMessagesIcon] Error fetching unread count:', error);
    }
  }, [user?.id]);

  // Setup subscription + polling on mount
  useEffect(() => {
    mountedRef.current = true;

    if (!user?.id) return;

    // Initial fetch
    fetchUnread();

    // Subscribe to conversation_participants changes (realtime)
    subscription.current = messagingService.subscribeToUnreadCount(
      user.id,
      (count) => {
        if (mountedRef.current) {
          setUnreadCount(prev => {
            if (count > prev && count > 0) {
              animateBadge();
            }
            return count;
          });
        }
      }
    );

    // Polling fallback in case realtime subscription doesn't fire
    pollInterval.current = setInterval(fetchUnread, POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      if (subscription.current) {
        messagingService.unsubscribe(subscription.current);
        subscription.current = null;
      }
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    };
  }, [user?.id, fetchUnread]);

  // Refresh count when screen gains focus (e.g., returning from Messages)
  useFocusEffect(
    useCallback(() => {
      fetchUnread();
    }, [fetchUnread])
  );

  // Refresh count when app returns from background
  useEffect(() => {
    const handleAppState = (nextState) => {
      if (nextState === 'active') {
        fetchUnread();
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub?.remove();
  }, [fetchUnread]);

  // Badge animation
  const animateBadge = () => {
    Animated.sequence([
      Animated.timing(badgeScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(badgeScale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Navigate to messages - uses Home tab's ConversationsList so bottom tab stays visible
  const handlePress = () => {
    navigation.navigate('Home', { screen: 'ConversationsList' });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <MessageCircle size={size} color={color} strokeWidth={2} />

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <Animated.View
          style={[
            styles.badge,
            { transform: [{ scale: badgeScale }] },
          ]}
        >
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
});

HeaderMessagesIcon.displayName = 'HeaderMessagesIcon';

export default HeaderMessagesIcon;

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.bgDarkest,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
});
