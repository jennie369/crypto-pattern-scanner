/**
 * WishlistButton.js - Wishlist Heart Button Component
 * Animated heart button for adding/removing products from wishlist
 * Includes haptic feedback and visual feedback
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { isInWishlist, toggleWishlist } from '../../services/wishlistService';
import { COLORS, SPACING } from '../../utils/tokens';

const WishlistButton = ({
  product,
  size = 24,
  style,
  onToggle,
  showBackground = true,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Get product ID
  const productId = product?.id?.toString() || product?.product_id;

  // Check wishlist status on mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (productId) {
        const status = await isInWishlist(productId);
        setIsWishlisted(status);
      }
    };
    checkWishlistStatus();
  }, [productId]);

  // Animate heart on toggle
  const animateHeart = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
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
    if (loading || !product) return;

    setLoading(true);

    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.selectionAsync();
    }

    // Animate
    animateHeart();

    try {
      const result = await toggleWishlist(product);

      if (result.success) {
        setIsWishlisted(result.isInWishlist);
        onToggle?.(result.isInWishlist, result.message);

        // Extra haptic for adding
        if (result.isInWishlist && Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (err) {
      console.error('[WishlistButton] Toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.7}
      style={[
        styles.container,
        showBackground && styles.withBackground,
        style,
      ]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Heart
          size={size}
          color={isWishlisted ? COLORS.burgundy : COLORS.textMuted}
          fill={isWishlisted ? COLORS.burgundy : 'transparent'}
          strokeWidth={2}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xs,
  },
  withBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
});

export default WishlistButton;
