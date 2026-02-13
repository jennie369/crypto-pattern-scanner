/**
 * Gemral - Header Messages Icon Component
 * TikTok-style messages icon with unread badge
 *
 * Features:
 * - Unread count badge with animation
 * - Real-time badge updates
 * - Navigate to Messages screen
 */

import React, { useState, useEffect, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

const HeaderMessagesIcon = memo(({ size = 22, color = COLORS.textPrimary }) => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // State
  const [unreadCount, setUnreadCount] = useState(0);

  // Animation
  const badgeScale = useRef(new Animated.Value(1)).current;

  // Subscription ref
  const subscription = useRef(null);

  // Fetch initial unread count and subscribe to updates
  useEffect(() => {
    const fetchUnread = async () => {
      if (!user?.id) return;

      try {
        const count = await messagingService.getTotalUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnread();

    // Subscribe to unread count changes
    if (user?.id) {
      subscription.current = messagingService.subscribeToUnreadCount(
        user.id,
        (count) => {
          setUnreadCount(prev => {
            // Animate badge when count increases
            if (count > prev) {
              animateBadge();
            }
            return count;
          });
        }
      );
    }

    return () => {
      if (subscription.current) {
        messagingService.unsubscribe(subscription.current);
      }
    };
  }, [user?.id]);

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

  // Navigate to messages
  const handlePress = () => {
    navigation.navigate('Messages');
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
