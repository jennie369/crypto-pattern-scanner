/**
 * QuickAddButton.js - Quick Add to Cart Button Component
 * Enhanced add to cart button with loading state and haptic feedback
 * Used in ProductCard for quick purchase flow
 */

import React, { useState, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Plus, Check, ShoppingCart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useCart } from '../../contexts/CartContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';

const QuickAddButton = ({
  product,
  variant,
  size = 'medium',
  style,
  onSuccess,
  onError,
  showLabel = false,
}) => {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Size configurations
  const sizeConfig = {
    small: {
      buttonSize: 28,
      iconSize: 14,
      fontSize: TYPOGRAPHY.fontSize.xs,
    },
    medium: {
      buttonSize: 36,
      iconSize: 18,
      fontSize: TYPOGRAPHY.fontSize.sm,
    },
    large: {
      buttonSize: 44,
      iconSize: 22,
      fontSize: TYPOGRAPHY.fontSize.md,
    },
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  // Animate button on press
  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = async () => {
    if (loading || success) return;

    setLoading(true);
    animatePress();

    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.selectionAsync();
    }

    try {
      // Get variant to add
      const variantToAdd = variant || product?.variants?.[0];

      if (!variantToAdd?.id) {
        throw new Error('Không tìm thấy variant');
      }

      await addToCart({
        variantId: variantToAdd.id,
        quantity: 1,
        product,
      });

      // Show success state
      setSuccess(true);

      // Success haptic
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      onSuccess?.();

      // Reset after 2 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 2000);

    } catch (err) {
      console.error('[QuickAddButton] Add to cart error:', err);
      onError?.(err.message);

      // Error haptic
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={COLORS.textPrimary}
        />
      );
    }

    if (success) {
      return (
        <>
          <Check size={config.iconSize} color={COLORS.textPrimary} strokeWidth={2.5} />
          {showLabel && <Text style={[styles.label, { fontSize: config.fontSize }]}>Đã thêm</Text>}
        </>
      );
    }

    if (showLabel) {
      return (
        <>
          <ShoppingCart size={config.iconSize} color={COLORS.textPrimary} />
          <Text style={[styles.label, { fontSize: config.fontSize }]}>Thêm</Text>
        </>
      );
    }

    return (
      <Plus size={config.iconSize} color={COLORS.textPrimary} strokeWidth={2.5} />
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={loading}
        activeOpacity={0.8}
        style={[
          styles.button,
          {
            width: showLabel ? 'auto' : config.buttonSize,
            height: config.buttonSize,
            paddingHorizontal: showLabel ? SPACING.md : 0,
            backgroundColor: success ? COLORS.success : COLORS.burgundy,
          },
          style,
        ]}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  label: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

export default QuickAddButton;
