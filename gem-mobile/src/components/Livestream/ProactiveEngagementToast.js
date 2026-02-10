/**
 * ProactiveEngagementToast Component
 * Phase 4: Intelligence Layer
 *
 * Toast UI for displaying proactive engagement messages:
 * - Slide-in animation from top
 * - Progress bar for auto-dismiss
 * - Icon based on message type
 * - Product preview for product-related messages
 * - CTA button
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
} from 'react-native';
import {
  X,
  ShoppingCart,
  Sparkles,
  AlertTriangle,
  Gift,
  Clock,
  Bell,
  Heart,
} from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

const TOAST_DURATION = 8000; // 8 seconds
const ANIMATION_DURATION = 300;

const ProactiveEngagementToast = ({
  engagement,
  onAction,
  onDismiss,
  autoHide = true,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // ========== STATE & REFS ==========
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const hideTimeout = useRef(null);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      borderWidth: 1,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
      zIndex: 1000,
    },
    bgDefault: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
    },
    bgUrgency: {
      backgroundColor: 'rgba(156, 6, 18, 0.95)',
    },
    bgAlert: {
      backgroundColor: 'rgba(60, 40, 10, 0.95)',
    },
    bgWelcome: {
      backgroundColor: 'rgba(40, 20, 60, 0.95)',
    },
    progressContainer: {
      height: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    progressBar: {
      height: '100%',
      backgroundColor: colors.gold || '#FFBD59',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING?.md || 12,
      paddingTop: 40, // Account for status bar
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING?.sm || 8,
    },
    messageContainer: {
      flex: 1,
      marginRight: SPACING?.sm || 8,
    },
    message: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textLight || '#FFFFFF',
      lineHeight: 18,
    },
    productPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING?.xs || 4,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 8,
      padding: 6,
    },
    productImage: {
      width: 28,
      height: 28,
      borderRadius: 4,
      marginRight: 6,
    },
    productTitle: {
      fontSize: 11,
      color: colors.textSecondary || '#CCCCCC',
      flex: 1,
    },
    actions: {
      alignItems: 'flex-end',
      gap: 8,
    },
    dismissButton: {
      padding: 4,
    },
    ctaButton: {
      backgroundColor: colors.gold || '#FFBD59',
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 14,
    },
    ctaText: {
      fontSize: 12,
      color: colors.bgDarkest || '#1A1A2E',
      fontWeight: '600',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // ========== EFFECTS ==========
  useEffect(() => {
    if (engagement) {
      showToast();
    }

    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, [engagement]);

  // ========== ANIMATION ==========
  const showToast = useCallback(() => {
    setVisible(true);

    // Reset animations
    slideAnim.setValue(-150);
    opacityAnim.setValue(0);
    progressAnim.setValue(1);

    // Slide in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide progress
    if (autoHide) {
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: TOAST_DURATION,
        useNativeDriver: false,
      }).start();

      hideTimeout.current = setTimeout(() => {
        hideToast();
      }, TOAST_DURATION);
    }
  }, [slideAnim, opacityAnim, progressAnim, autoHide]);

  const hideToast = useCallback(() => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      onDismiss?.();
    });
  }, [slideAnim, opacityAnim, onDismiss]);

  // ========== HANDLERS ==========
  const handleAction = useCallback(() => {
    hideToast();
    onAction?.(engagement);
  }, [engagement, hideToast, onAction]);

  const handleDismiss = useCallback(() => {
    hideToast();
  }, [hideToast]);

  // ========== RENDER HELPERS ==========
  const getIcon = () => {
    const iconProps = { size: 22, color: colors.gold || '#FFBD59' };

    switch (engagement?.subtype) {
      case 'cart_abandonment':
        return <ShoppingCart {...iconProps} />;
      case 'low_stock':
        return <AlertTriangle {...iconProps} color={colors.error || '#FF6B6B'} />;
      case 'price_drop':
        return <Gift {...iconProps} color="#4ECDC4" />;
      case 'idle_viewer':
        return <Clock {...iconProps} />;
      case 'new_viewer':
        return <Heart {...iconProps} color="#FF6B9D" />;
      case 'product_highlight':
        return <Sparkles {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  const getBackgroundStyle = () => {
    switch (engagement?.type) {
      case 'urgency':
        return styles.bgUrgency;
      case 'alert':
        return styles.bgAlert;
      case 'welcome':
        return styles.bgWelcome;
      default:
        return styles.bgDefault;
    }
  };

  const getBorderColor = () => {
    switch (engagement?.type) {
      case 'urgency':
        return colors.error || '#FF6B6B';
      case 'alert':
        return colors.gold || '#FFBD59';
      case 'welcome':
        return '#FF6B9D';
      default:
        return 'rgba(255, 189, 89, 0.3)';
    }
  };

  // ========== RENDER ==========
  if (!visible || !engagement) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        getBackgroundStyle(),
        {
          borderColor: getBorderColor(),
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {/* Progress Bar */}
      {autoHide && (
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>{getIcon()}</View>

        {/* Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.message} numberOfLines={2}>
            {engagement.message}
          </Text>

          {/* Product Preview (if any) */}
          {engagement.product && (
            <View style={styles.productPreview}>
              {(engagement.product.images?.[0]?.src || engagement.product.image) && (
                <Image
                  source={{
                    uri: engagement.product.images?.[0]?.src || engagement.product.image,
                  }}
                  style={styles.productImage}
                />
              )}
              <Text style={styles.productTitle} numberOfLines={1}>
                {engagement.product.title}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {/* Dismiss Button */}
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={16} color={colors.textMuted || '#888888'} />
          </TouchableOpacity>

          {/* CTA Button */}
          {engagement.cta && (
            <TouchableOpacity style={styles.ctaButton} onPress={handleAction}>
              <Text style={styles.ctaText}>{engagement.cta}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

export default ProactiveEngagementToast;
