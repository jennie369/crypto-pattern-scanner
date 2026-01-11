/**
 * Gemral - Message Action Sheet Component
 * Bottom sheet with message actions (reply, copy, delete, etc.)
 *
 * Features:
 * - Animated slide up from bottom
 * - Backdrop tap to close
 * - Multiple action options
 * - Haptic feedback
 * - Glass-morphism styling
 */

import React, { useEffect, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../../utils/haptics';
import * as Clipboard from 'expo-clipboard';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = 420;

const MessageActionSheet = memo(({
  visible,
  message,
  isOwn,
  isPinned,
  isStarred,
  canRecall, // Can this message be recalled
  onClose,
  onReply,
  onCopy,
  onForward,
  onDelete,
  onReact,
  onReport,
  onPin,
  onEdit,
  onStar,
  onTranslate,
  onRecall, // Recall message handler
}) => {
  // Animation refs
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Pan responder for swipe down to close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Open animation
  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  // Close animation
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Handle copy
  const handleCopy = async () => {
    if (message?.content) {
      await Clipboard.setStringAsync(message.content);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    handleClose();
    onCopy?.();
  };

  // Handle reply
  const handleReply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleClose();
    onReply?.();
  };

  // Handle forward
  const handleForward = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleClose();
    onForward?.();
  };

  // Handle delete
  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    handleClose();
    onDelete?.();
  };

  // Handle react
  const handleReact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleClose();
    onReact?.();
  };

  // Handle report
  const handleReport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleClose();
    onReport?.();
  };

  // Handle pin
  const handlePin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleClose();
    onPin?.();
  };

  // Handle edit
  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleClose();
    onEdit?.();
  };

  // Handle star
  const handleStar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleClose();
    onStar?.();
  };

  // Handle translate
  const handleTranslate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleClose();
    onTranslate?.();
  };

  // Handle recall
  const handleRecall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleClose();
    onRecall?.();
  };

  // Actions list
  const actions = [
    {
      id: 'reply',
      icon: 'arrow-undo',
      label: 'Reply',
      onPress: handleReply,
      show: true,
    },
    {
      id: 'react',
      icon: 'heart-outline',
      label: 'Add Reaction',
      onPress: handleReact,
      show: true,
    },
    {
      id: 'copy',
      icon: 'copy-outline',
      label: 'Copy Text',
      onPress: handleCopy,
      show: !!message?.content,
    },
    {
      id: 'star',
      icon: isStarred ? 'star' : 'star-outline',
      label: isStarred ? 'Unstar' : 'Star',
      onPress: handleStar,
      show: true,
      color: COLORS.gold,
    },
    {
      id: 'pin',
      icon: isPinned ? 'pin-outline' : 'pin',
      label: isPinned ? 'Unpin' : 'Pin',
      onPress: handlePin,
      show: true,
    },
    {
      id: 'edit',
      icon: 'pencil',
      label: 'Edit',
      onPress: handleEdit,
      show: isOwn && message?.message_type === 'text',
    },
    {
      id: 'recall',
      icon: 'refresh-outline',
      label: 'Thu hồi',
      onPress: handleRecall,
      show: isOwn && canRecall,
      color: COLORS.gold,
    },
    {
      id: 'translate',
      icon: 'language',
      label: 'Translate',
      onPress: handleTranslate,
      show: !!message?.content,
    },
    {
      id: 'forward',
      icon: 'arrow-redo',
      label: 'Forward',
      onPress: handleForward,
      show: true,
    },
    {
      id: 'delete',
      icon: 'trash-outline',
      label: 'Delete',
      onPress: handleDelete,
      show: isOwn,
      destructive: true,
    },
    {
      id: 'report',
      icon: 'flag-outline',
      label: 'Report',
      onPress: handleReport,
      show: !isOwn,
      destructive: true,
    },
  ].filter(action => action.show);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheetContainer,
          { transform: [{ translateY }] },
        ]}
        {...panResponder.panHandlers}
      >
        <BlurView intensity={40} style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Message Preview */}
          {message?.content && (
            <View style={styles.preview}>
              <Text style={styles.previewText} numberOfLines={2}>
                {message.content}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionItem}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.actionIcon,
                  action.destructive && styles.actionIconDestructive,
                  action.color && { backgroundColor: `${action.color}20` },
                ]}>
                  <Ionicons
                    name={action.icon}
                    size={22}
                    color={action.destructive ? COLORS.error : action.color || COLORS.textPrimary}
                  />
                </View>
                <Text style={[
                  styles.actionLabel,
                  action.destructive && styles.actionLabelDestructive,
                  action.color && { color: action.color },
                ]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    </Modal>
  );
});

MessageActionSheet.displayName = 'MessageActionSheet';

export default MessageActionSheet;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouch: {
    flex: 1,
  },

  // Sheet
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
  },
  sheet: {
    flex: 1,
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },

  // Handle
  handleContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Preview
  preview: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.purple,
  },
  previewText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Actions
  actions: {
    paddingHorizontal: SPACING.lg,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  actionIconDestructive: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },
  actionLabelDestructive: {
    color: COLORS.error,
  },

  // Cancel
  cancelButton: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
});
