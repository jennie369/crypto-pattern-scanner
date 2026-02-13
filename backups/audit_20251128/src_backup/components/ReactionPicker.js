/**
 * Gemral - Reaction Picker Component
 * Long-press to show reaction selector (like Facebook)
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Pressable,
} from 'react-native';
import { Heart, ThumbsUp, Laugh, Frown, AlertCircle } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../utils/tokens';

// Reaction types with icons and colors
export const REACTION_TYPES = [
  { id: 'like', icon: ThumbsUp, color: '#3B82F6', label: 'Thich', emoji: '👍' },
  { id: 'love', icon: Heart, color: '#FF6B6B', label: 'Yeu thich', emoji: '❤️' },
  { id: 'haha', icon: Laugh, color: '#FFBD59', label: 'Haha', emoji: '😂' },
  { id: 'wow', icon: AlertCircle, color: '#FFBD59', label: 'Wow', emoji: '😮' },
  { id: 'sad', icon: Frown, color: '#FFBD59', label: 'Buon', emoji: '😢' },
];

const ReactionPicker = ({
  currentReaction = null, // Current reaction type or null
  onReactionSelect,
  disabled = false,
  size = 22,
  showLabel = false,
  count = 0,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  // Animation values for each reaction
  const reactionAnims = useRef(
    REACTION_TYPES.map(() => new Animated.Value(0))
  ).current;

  // Animate reactions when picker opens
  useEffect(() => {
    if (showPicker) {
      // Stagger animation for each reaction
      const animations = reactionAnims.map((anim, index) =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          delay: index * 50,
          useNativeDriver: true,
        })
      );
      Animated.stagger(50, animations).start();
    } else {
      // Reset animations
      reactionAnims.forEach(anim => anim.setValue(0));
    }
  }, [showPicker]);

  // Get current reaction config
  const getCurrentReaction = () => {
    if (!currentReaction) return null;
    return REACTION_TYPES.find(r => r.id === currentReaction);
  };

  const handleLongPress = () => {
    if (disabled) return;

    // Get button position
    if (buttonRef.current) {
      buttonRef.current.measureInWindow((x, y, width, height) => {
        setPickerPosition({ x, y: y - 60 });
        setShowPicker(true);
      });
    }
  };

  const handlePress = () => {
    if (disabled) return;

    // Quick tap toggles like
    if (currentReaction) {
      onReactionSelect?.(null); // Remove reaction
    } else {
      onReactionSelect?.('like'); // Default to like
    }
  };

  const handleReactionSelect = (reactionId) => {
    setShowPicker(false);
    onReactionSelect?.(reactionId);
  };

  const current = getCurrentReaction();
  const Icon = current?.icon || Heart;
  const iconColor = current?.color || COLORS.textMuted;

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
        style={styles.button}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={300}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Icon
          size={size}
          color={iconColor}
          fill={current ? iconColor : 'transparent'}
        />
        {count > 0 && (
          <Text style={[styles.countText, current && { color: iconColor }]}>
            {count}
          </Text>
        )}
        {showLabel && current && (
          <Text style={[styles.labelText, { color: iconColor }]}>
            {current.label}
          </Text>
        )}
      </TouchableOpacity>

      {/* Reaction Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setShowPicker(false)}
        >
          <View
            style={[
              styles.pickerContainer,
              {
                top: Math.max(50, pickerPosition.y),
                left: Math.max(10, Math.min(pickerPosition.x - 80, 200)),
              },
            ]}
          >
            {REACTION_TYPES.map((reaction, index) => {
              const scale = reactionAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              });
              const opacity = reactionAnims[index];

              return (
                <Animated.View
                  key={reaction.id}
                  style={[
                    styles.reactionItem,
                    {
                      transform: [{ scale }],
                      opacity,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.reactionButton,
                      currentReaction === reaction.id && styles.reactionButtonActive,
                    ]}
                    onPress={() => handleReactionSelect(reaction.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

// Reaction Summary Component - Shows counts by type
export const ReactionSummary = ({ reactions = {}, onPress, maxDisplay = 3 }) => {
  // Get top reactions sorted by count
  const sortedReactions = Object.entries(reactions)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxDisplay);

  const totalCount = Object.values(reactions).reduce((sum, count) => sum + count, 0);

  if (totalCount === 0) return null;

  return (
    <TouchableOpacity
      style={styles.summaryContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.summaryIcons}>
        {sortedReactions.map(([type], index) => {
          const reaction = REACTION_TYPES.find(r => r.id === type);
          if (!reaction) return null;

          return (
            <View
              key={type}
              style={[
                styles.summaryIcon,
                { zIndex: maxDisplay - index, marginLeft: index > 0 ? -6 : 0 },
              ]}
            >
              <Text style={styles.summaryEmoji}>{reaction.emoji}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.summaryCount}>{totalCount}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    gap: 6,
  },
  countText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
  labelText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginLeft: 2,
  },
  // Overlay
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  // Picker
  pickerContainer: {
    position: 'absolute',
    flexDirection: 'row',
    backgroundColor: GLASS.background,
    borderRadius: 30,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  reactionItem: {
    marginHorizontal: 2,
  },
  reactionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  reactionButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  reactionEmoji: {
    fontSize: 28,
  },
  // Summary
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  summaryIcons: {
    flexDirection: 'row',
  },
  summaryIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: GLASS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.bgDarkest,
  },
  summaryEmoji: {
    fontSize: 12,
  },
  summaryCount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
});

export default ReactionPicker;
