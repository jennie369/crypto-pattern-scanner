/**
 * Gemral - Swipeable Conversation Item Component
 * Conversation item with swipe actions (archive, delete, mute)
 *
 * Features:
 * - Swipe left for actions
 * - Animated action buttons
 * - Haptic feedback
 * - Smooth spring animations
 */

import React, { useRef, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../../utils/haptics';

// Components
import ConversationItem from './ConversationItem';

// Tokens
import {
  COLORS,
  SPACING,
} from '../../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACTION_WIDTH = 80;
const ACTIONS_WIDTH = ACTION_WIDTH * 3; // 3 actions

const SwipeableConversationItem = memo(({
  conversation,
  currentUserId,
  onPress,
  onArchive,
  onDelete,
  onMute,
  index,
}) => {
  // Animation refs
  const translateX = useRef(new Animated.Value(0)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;

  // Swipe state
  const isSwipeOpen = useRef(false);

  // Pan responder
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(translateX._value);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow left swipe (negative dx)
        const newValue = Math.min(0, Math.max(-ACTIONS_WIDTH, gestureState.dx));
        translateX.setValue(newValue);

        // Update actions opacity based on swipe progress
        const progress = Math.min(Math.abs(newValue) / ACTIONS_WIDTH, 1);
        actionsOpacity.setValue(progress);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();

        const shouldOpen = gestureState.dx < -ACTIONS_WIDTH / 2 || gestureState.vx < -0.5;

        if (shouldOpen && !isSwipeOpen.current) {
          // Open actions
          openActions();
        } else {
          // Close actions
          closeActions();
        }
      },
    })
  ).current;

  // Open actions
  const openActions = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    isSwipeOpen.current = true;

    Animated.parallel([
      Animated.spring(translateX, {
        toValue: -ACTIONS_WIDTH,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.timing(actionsOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, actionsOpacity]);

  // Close actions
  const closeActions = useCallback(() => {
    isSwipeOpen.current = false;

    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.timing(actionsOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, actionsOpacity]);

  // Handle actions
  const handleMute = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    closeActions();
    onMute?.(conversation.id);
  }, [conversation.id, onMute, closeActions]);

  const handleArchive = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    closeActions();
    onArchive?.(conversation.id);
  }, [conversation.id, onArchive, closeActions]);

  const handleDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel', onPress: closeActions },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            closeActions();
            onDelete?.(conversation.id);
          },
        },
      ]
    );
  }, [conversation.id, onDelete, closeActions]);

  // Handle press (close if open, otherwise navigate)
  const handlePress = useCallback(() => {
    if (isSwipeOpen.current) {
      closeActions();
    } else {
      onPress();
    }
  }, [onPress, closeActions]);

  return (
    <View style={styles.container}>
      {/* Action buttons (behind the item) */}
      <Animated.View
        style={[
          styles.actionsContainer,
          { opacity: actionsOpacity },
        ]}
      >
        {/* Mute */}
        <TouchableOpacity
          style={[styles.actionButton, styles.muteButton]}
          onPress={handleMute}
        >
          <Ionicons
            name={conversation.is_muted ? 'notifications' : 'notifications-off'}
            size={22}
            color={COLORS.textPrimary}
          />
          <Text style={styles.actionText}>
            {conversation.is_muted ? 'Unmute' : 'Mute'}
          </Text>
        </TouchableOpacity>

        {/* Archive */}
        <TouchableOpacity
          style={[styles.actionButton, styles.archiveButton]}
          onPress={handleArchive}
        >
          <Ionicons name="archive" size={22} color={COLORS.textPrimary} />
          <Text style={styles.actionText}>Archive</Text>
        </TouchableOpacity>

        {/* Delete */}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Ionicons name="trash" size={22} color={COLORS.textPrimary} />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Swipeable content */}
      <Animated.View
        style={[
          styles.itemContainer,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <ConversationItem
          conversation={conversation}
          currentUserId={currentUserId}
          onPress={handlePress}
          index={index}
        />
      </Animated.View>
    </View>
  );
});

SwipeableConversationItem.displayName = 'SwipeableConversationItem';

export default SwipeableConversationItem;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },

  // Actions container
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: SPACING.lg,
  },

  // Action buttons
  actionButton: {
    width: ACTION_WIDTH,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 11,
    color: COLORS.textPrimary,
    marginTop: 4,
  },

  muteButton: {
    backgroundColor: COLORS.purple,
  },
  archiveButton: {
    backgroundColor: COLORS.gold,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },

  // Item container
  itemContainer: {
    backgroundColor: COLORS.bgDarkest,
  },
});
