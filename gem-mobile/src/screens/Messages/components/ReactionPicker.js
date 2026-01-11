/**
 * Gemral - Reaction Picker Component
 * TikTok-style emoji reaction selector popup
 *
 * Features:
 * - Quick emoji reactions row
 * - Animated popup appearance
 * - Long-press to open full picker
 * - Glass-morphism styling
 */

import React, { useRef, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

// Import reaction constants
import { QUICK_REACTIONS, EMOJI_CATEGORIES } from '../../../constants/reactions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ReactionPicker = memo(({
  visible,
  onClose,
  onSelectReaction,
  onOpenFullPicker,
  position = { x: 0, y: 0 },
  showFullPicker = false,
}) => {
  // Animation
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
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

  const handleSelect = (emoji) => {
    onSelectReaction(emoji);
    onClose();
  };

  if (!visible) return null;

  // Quick reactions bar (inline)
  if (!showFullPicker) {
    return (
      <Animated.View
        style={[
          styles.quickPickerContainer,
          {
            left: Math.max(10, Math.min(position.x - 140, SCREEN_WIDTH - 320)),
            top: position.y - 60,
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <BlurView intensity={40} style={styles.quickPickerBlur}>
          {QUICK_REACTIONS.map((emoji, index) => (
            <TouchableOpacity
              key={`${emoji}-${index}`}
              style={styles.quickEmojiButton}
              onPress={() => handleSelect(emoji)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
          {/* Plus button to open full picker */}
          <TouchableOpacity
            style={styles.plusButton}
            onPress={() => {
              onClose();
              onOpenFullPicker?.();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.plusButtonText}>+</Text>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    );
  }

  // Full emoji picker (modal)
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.fullPickerContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <BlurView intensity={60} style={styles.fullPickerBlur}>
              {/* Header */}
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Reactions</Text>
                <TouchableOpacity onPress={onClose}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Quick Reactions */}
              <View style={styles.quickSection}>
                {QUICK_REACTIONS.map((emoji, index) => (
                  <TouchableOpacity
                    key={`quick-${emoji}-${index}`}
                    style={styles.quickEmojiButtonLarge}
                    onPress={() => handleSelect(emoji)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickEmojiLarge}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Categories */}
              {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                <View key={key} style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>
                    {category.title}
                  </Text>
                  <View style={styles.emojiGrid}>
                    {category.emojis.map((emoji, index) => (
                      <TouchableOpacity
                        key={`${key}-${emoji}-${index}`}
                        style={styles.emojiButton}
                        onPress={() => handleSelect(emoji)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.emoji}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </BlurView>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
});

ReactionPicker.displayName = 'ReactionPicker';

export default ReactionPicker;

const styles = StyleSheet.create({
  // Quick Picker (inline)
  quickPickerContainer: {
    position: 'absolute',
    zIndex: 1000,
  },
  quickPickerBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.9)',
    borderRadius: 24,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  quickEmojiButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickEmoji: {
    fontSize: 22,
  },
  plusButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderRadius: 18,
    marginLeft: 4,
  },
  plusButtonText: {
    fontSize: 20,
    color: COLORS.gold,
    fontWeight: 'bold',
  },

  // Full Picker (modal)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  fullPickerContainer: {
    maxHeight: '70%',
  },
  fullPickerBlur: {
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: SPACING.huge,
  },

  // Header
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  pickerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    fontSize: 20,
    color: COLORS.textMuted,
    padding: SPACING.sm,
  },

  // Quick Section
  quickSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  quickEmojiButtonLarge: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 24,
  },
  quickEmojiLarge: {
    fontSize: 28,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    marginHorizontal: SPACING.lg,
  },

  // Categories
  categorySection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emojiButton: {
    width: '12.5%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
});
