/**
 * Gemral - Message Context Menu Component
 * Facebook Messenger-style unified long-press menu
 *
 * Features:
 * - Full-screen blur background
 * - Message preview centered
 * - Reaction bar at top with quick emojis + expand button
 * - Primary action menu below message
 * - "More" option expands to show additional actions
 * - Smooth animations
 */

import React, { useEffect, useRef, useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Image,
  ScrollView,
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

// Import reaction constants
import { QUICK_REACTIONS, EMOJI_CATEGORIES } from '../../../constants/reactions';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MessageContextMenu = memo(({
  visible,
  message,
  isOwn,
  isPinned = false,
  isStarred = false,
  canRecall = false,
  senderName,
  senderAvatar,
  onClose,
  onReply,
  onCopy,
  onForward,
  onDelete,
  onReaction,
  onReport,
  onPin,
  onEdit,
  onStar,
  onTranslate,
  onRecall,
}) => {
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // State
  const [showMore, setShowMore] = useState(false);
  const [showFullEmojiPicker, setShowFullEmojiPicker] = useState(false);

  // Open animation
  useEffect(() => {
    if (visible) {
      setShowMore(false);
      setShowFullEmojiPicker(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  // Close handler
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Handle reaction select
  const handleReactionSelect = (emoji) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleClose();
    onReaction?.(emoji);
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

  // Handle action
  const handleAction = (action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleClose();
    action?.();
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Primary actions (shown first)
  const primaryActions = [
    {
      id: 'reply',
      icon: 'arrow-undo',
      label: 'Reply',
      onPress: () => handleAction(onReply),
      show: true,
    },
    {
      id: 'copy',
      icon: 'copy-outline',
      label: 'Copy',
      onPress: handleCopy,
      show: !!message?.content,
    },
    {
      id: 'forward',
      icon: 'arrow-redo',
      label: 'Forward',
      onPress: () => handleAction(onForward),
      show: true,
    },
  ].filter(a => a.show);

  // Secondary actions (shown in "More")
  const secondaryActions = [
    {
      id: 'translate',
      icon: 'language',
      label: 'Translate',
      onPress: () => handleAction(onTranslate),
      show: !!message?.content,
    },
    {
      id: 'star',
      icon: isStarred ? 'star' : 'star-outline',
      label: isStarred ? 'Unstar' : 'Star',
      onPress: () => handleAction(onStar),
      show: true,
      color: COLORS.gold,
    },
    {
      id: 'pin',
      icon: isPinned ? 'pin-outline' : 'pin',
      label: isPinned ? 'Unpin' : 'Pin',
      onPress: () => handleAction(onPin),
      show: true,
    },
    {
      id: 'edit',
      icon: 'pencil',
      label: 'Edit',
      onPress: () => handleAction(onEdit),
      show: isOwn && message?.message_type === 'text',
    },
    {
      id: 'recall',
      icon: 'refresh-outline',
      label: 'Thu hồi',
      onPress: () => handleAction(onRecall),
      show: isOwn && canRecall,
      color: COLORS.gold,
    },
    {
      id: 'report',
      icon: 'flag-outline',
      label: 'Report',
      onPress: () => handleAction(onReport),
      show: !isOwn,
      destructive: true,
    },
    {
      id: 'delete',
      icon: 'trash-outline',
      label: 'Delete',
      onPress: () => handleAction(onDelete),
      show: isOwn,
      destructive: true,
    },
  ].filter(a => a.show);

  if (!visible) return null;

  // Full emoji picker view
  if (showFullEmojiPicker) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setShowFullEmojiPicker(false)}
        >
          <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.fullEmojiContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.fullEmojiContent}>
            <View style={styles.fullEmojiHeader}>
              <Text style={styles.fullEmojiTitle}>Reactions</Text>
              <TouchableOpacity
                onPress={() => setShowFullEmojiPicker(false)}
                style={styles.fullEmojiClose}
              >
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.fullEmojiScroll}>
              {/* Quick Reactions */}
              <View style={styles.fullEmojiQuickRow}>
                {QUICK_REACTIONS.map((emoji, index) => (
                  <TouchableOpacity
                    key={`quick-${emoji}-${index}`}
                    style={styles.fullEmojiQuickBtn}
                    onPress={() => handleReactionSelect(emoji)}
                  >
                    <Text style={styles.fullEmojiQuickText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Categories */}
              {Object.entries(EMOJI_CATEGORIES || {}).map(([key, category]) => (
                <View key={key} style={styles.emojiCategory}>
                  <Text style={styles.emojiCategoryTitle}>{category.title}</Text>
                  <View style={styles.emojiGrid}>
                    {category.emojis.map((emoji, index) => (
                      <TouchableOpacity
                        key={`${key}-${index}`}
                        style={styles.emojiGridItem}
                        onPress={() => handleReactionSelect(emoji)}
                      >
                        <Text style={styles.emojiGridText}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </Animated.View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Blur Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
      >
        <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
      </TouchableOpacity>

      {/* Content Container */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        pointerEvents="box-none"
      >
        {/* Reaction Bar */}
        <View style={styles.reactionBar}>
          {QUICK_REACTIONS.slice(0, 6).map((emoji, index) => (
            <TouchableOpacity
              key={`reaction-${index}`}
              style={styles.reactionBtn}
              onPress={() => handleReactionSelect(emoji)}
              activeOpacity={0.7}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
          {/* Plus button for more emojis */}
          <TouchableOpacity
            style={styles.reactionPlusBtn}
            onPress={() => setShowFullEmojiPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionPlusText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Message Preview */}
        <View style={styles.messagePreview}>
          <Text style={styles.messagePreviewText} numberOfLines={3}>
            {message?.content || '[Media]'}
          </Text>
        </View>

        {/* Action Menu */}
        <View style={styles.actionMenu}>
          {/* Primary Actions */}
          {primaryActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionRow}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name={action.icon}
                size={20}
                color={COLORS.textPrimary}
                style={styles.actionIcon}
              />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}

          {/* More Button / Expanded Actions */}
          {!showMore ? (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => setShowMore(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={20}
                color={COLORS.textMuted}
                style={styles.actionIcon}
              />
              <Text style={[styles.actionLabel, { color: COLORS.textMuted }]}>More</Text>
            </TouchableOpacity>
          ) : (
            <>
              {secondaryActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionRow}
                  onPress={action.onPress}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={action.icon}
                    size={20}
                    color={action.destructive ? COLORS.error : action.color || COLORS.textPrimary}
                    style={styles.actionIcon}
                  />
                  <Text style={[
                    styles.actionLabel,
                    action.destructive && styles.actionLabelDestructive,
                    action.color && { color: action.color },
                  ]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
});

MessageContextMenu.displayName = 'MessageContextMenu';

export default MessageContextMenu;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  // Content Container
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },

  // Reaction Bar
  reactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 28,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  reactionBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionEmoji: {
    fontSize: 26,
  },
  reactionPlusBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8E8E8',
    borderRadius: 18,
    marginLeft: SPACING.xs,
  },
  reactionPlusText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
  },

  // Message Preview
  messagePreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 18,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
    maxWidth: SCREEN_WIDTH * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  messagePreviewText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: '#1A1A1A',
    lineHeight: 20,
  },

  // Action Menu
  actionMenu: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 14,
    minWidth: 200,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  actionIcon: {
    marginRight: SPACING.md,
    width: 24,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: '#1A1A1A',
    flex: 1,
  },
  actionLabelDestructive: {
    color: COLORS.error,
  },

  // Full Emoji Picker
  fullEmojiContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  fullEmojiContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  fullEmojiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  fullEmojiTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#1A1A1A',
  },
  fullEmojiClose: {
    padding: SPACING.xs,
  },
  fullEmojiScroll: {
    paddingBottom: SPACING.xxl,
  },
  fullEmojiQuickRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  fullEmojiQuickBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 24,
  },
  fullEmojiQuickText: {
    fontSize: 28,
  },
  emojiCategory: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  emojiCategoryTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#888',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emojiGridItem: {
    width: '12.5%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiGridText: {
    fontSize: 26,
  },
});
