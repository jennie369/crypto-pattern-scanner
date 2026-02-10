/**
 * GEM Mobile - Ad Reactions Bar Component
 * Facebook-style reactions picker (long-press popup)
 */

import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
} from 'react-native';
import { useSettings } from '../contexts/SettingsContext';

// All available reactions
const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Thích', color: '#1877F2' },
  { type: 'love', emoji: '❤️', label: 'Yêu thích', color: '#F33E58' },
  { type: 'haha', emoji: '😆', label: 'Haha', color: '#F7B125' },
  { type: 'wow', emoji: '😮', label: 'Wow', color: '#F7B125' },
  { type: 'sad', emoji: '😢', label: 'Buồn', color: '#F7B125' },
  { type: 'angry', emoji: '😡', label: 'Phẫn nộ', color: '#E9710F' },
];

/**
 * AdReactionsBar - Reactions picker popup
 * @param {boolean} visible - Whether the popup is visible
 * @param {function} onClose - Callback to close the popup
 * @param {function} onReactionSelect - Callback when a reaction is selected
 * @param {string|null} currentReaction - Currently selected reaction type
 * @param {object} position - Position of the popup { x, y }
 */
export default function AdReactionsBar({
  visible,
  onClose,
  onReactionSelect,
  currentReaction,
  position = { x: 0, y: 0 },
}) {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'flex-end',
    },
    container: {
      position: 'absolute',
      left: 16,
      right: 16,
      alignItems: 'center',
    },
    reactionsRow: {
      flexDirection: 'row',
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 28,
      paddingVertical: 8,
      paddingHorizontal: 12,
      gap: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
    },
    reactionContainer: {
      alignItems: 'center',
    },
    reactionButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    reactionButtonActive: {
      transform: [{ scale: 1.2 }],
    },
    reactionEmoji: {
      fontSize: 28,
    },
    labelContainer: {
      position: 'absolute',
      top: -24,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
    },
    labelText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // Animation refs for each reaction
  const scaleAnims = useRef(
    REACTIONS.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (visible) {
      // Animate reactions in sequence
      const animations = scaleAnims.map((anim, index) =>
        Animated.spring(anim, {
          toValue: 1,
          delay: index * 50,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        })
      );
      Animated.stagger(30, animations).start();
    } else {
      // Reset animations
      scaleAnims.forEach(anim => anim.setValue(0));
    }
  }, [visible]);

  const handleReactionPress = (reactionType) => {
    onReactionSelect?.(reactionType);
    onClose?.();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.container, { bottom: 100 }]}>
          <View style={styles.reactionsRow}>
            {REACTIONS.map((reaction, index) => (
              <Animated.View
                key={reaction.type}
                style={[
                  styles.reactionContainer,
                  {
                    transform: [
                      { scale: scaleAnims[index] },
                      {
                        translateY: scaleAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.reactionButton,
                    currentReaction === reaction.type && styles.reactionButtonActive,
                  ]}
                  onPress={() => handleReactionPress(reaction.type)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                </TouchableOpacity>
                {currentReaction === reaction.type && (
                  <View style={[styles.labelContainer, { backgroundColor: reaction.color }]}>
                    <Text style={styles.labelText}>{reaction.label}</Text>
                  </View>
                )}
              </Animated.View>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
