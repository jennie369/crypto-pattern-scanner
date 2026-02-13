/**
 * QuickActions Component
 * Heart, Gift, and Share action buttons for livestream
 *
 * Features:
 * - Heart button with animation
 * - Gift button (opens gift modal)
 * - Share button
 * - Floating hearts animation
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import tokens, { COLORS } from '../../utils/tokens';

// Floating heart component
const FloatingHeart = ({ onComplete }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  React.useEffect(() => {
    const randomX = (Math.random() - 0.5) * 80;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: randomX,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 1300,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start(onComplete);
  }, []);

  return (
    <Animated.View
      style={[
        styles.floatingHeart,
        {
          transform: [
            { translateY },
            { translateX },
            { scale },
          ],
          opacity,
        },
      ]}
    >
      <Ionicons name="heart" size={28} color={COLORS.error} />
    </Animated.View>
  );
};

const QuickActions = ({
  onHeartPress,
  onGiftPress,
  onSharePress,
  heartCount = 0,
  disabled = false,
  style,
}) => {
  const [floatingHearts, setFloatingHearts] = useState([]);
  const heartScale = useRef(new Animated.Value(1)).current;
  const heartIdCounter = useRef(0);

  // Handle heart press with animation
  const handleHeartPress = useCallback(() => {
    if (disabled) return;

    // Animate button
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Add floating heart
    const heartId = heartIdCounter.current++;
    setFloatingHearts((prev) => [...prev, heartId]);

    // Callback
    if (onHeartPress) onHeartPress();
  }, [disabled, onHeartPress]);

  // Remove floating heart after animation
  const removeHeart = useCallback((heartId) => {
    setFloatingHearts((prev) => prev.filter((id) => id !== heartId));
  }, []);

  // Format heart count
  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  return (
    <View style={[styles.container, style]}>
      {/* Floating hearts container */}
      <View style={styles.floatingContainer}>
        {floatingHearts.map((heartId) => (
          <FloatingHeart
            key={heartId}
            onComplete={() => removeHeart(heartId)}
          />
        ))}
      </View>

      {/* Action buttons */}
      <View style={styles.buttonsContainer}>
        {/* Share button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onSharePress}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <View style={styles.iconCircle}>
            <Ionicons
              name="share-social"
              size={22}
              color={disabled ? tokens.colors.textDisabled : tokens.colors.white}
            />
          </View>
          <Text style={styles.buttonLabel}>Chia s\u1EBB</Text>
        </TouchableOpacity>

        {/* Gift button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onGiftPress}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <View style={[styles.iconCircle, styles.giftCircle]}>
            <Ionicons
              name="gift"
              size={22}
              color={disabled ? tokens.colors.textDisabled : tokens.colors.white}
            />
          </View>
          <Text style={styles.buttonLabel}>Qu\xe0 t\u1EB7ng</Text>
        </TouchableOpacity>

        {/* Heart button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleHeartPress}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.iconCircle,
              styles.heartCircle,
              { transform: [{ scale: heartScale }] },
            ]}
          >
            <Ionicons
              name="heart"
              size={24}
              color={disabled ? tokens.colors.textDisabled : COLORS.error}
            />
          </Animated.View>
          {heartCount > 0 && (
            <Text style={styles.heartCount}>{formatCount(heartCount)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    width: 60,
    height: 200,
    alignItems: 'center',
  },
  floatingHeart: {
    position: 'absolute',
    bottom: 0,
  },
  buttonsContainer: {
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftCircle: {
    backgroundColor: COLORS.warning + '30',
  },
  heartCircle: {
    backgroundColor: COLORS.error + '20',
  },
  buttonLabel: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.white,
    fontWeight: '500',
  },
  heartCount: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.white,
    fontWeight: '600',
  },
});

export default QuickActions;
