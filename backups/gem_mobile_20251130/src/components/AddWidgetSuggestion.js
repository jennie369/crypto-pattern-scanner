/**
 * ADD WIDGET SUGGESTION
 * Banner/button component hiển thị suggestion add widget to dashboard
 *
 * Appears when widgetTriggerDetector detects content that can be saved
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Plus,
  X,
  ListChecks,
  Gem,
  Heart,
  Target,
  Hexagon,
  Sparkles,
  Bell,
  Quote,
  LayoutDashboard,
} from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../utils/tokens';
import { WIDGET_TYPES, getWidgetIcon, getWidgetColor } from '../utils/widgetTriggerDetector';

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const AddWidgetSuggestion = ({
  visible,
  trigger,
  onAccept,
  onDismiss,
  position = 'bottom', // 'bottom' | 'top' | 'inline'
  autoHide = true,
  autoHideDelay = 8000,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(position === 'top' ? -50 : 50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && !dismissed) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation for icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Auto hide
      if (autoHide) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoHideDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, dismissed]);

  useEffect(() => {
    // Reset dismissed state when trigger changes
    setDismissed(false);
  }, [trigger?.type, trigger?.data?.timestamp]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -50 : 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDismissed(true);
      onDismiss?.();
    });
  };

  const handleAccept = () => {
    onAccept?.(trigger);
    handleDismiss();
  };

  if (!visible || dismissed || !trigger) return null;

  const getIcon = () => {
    const iconName = getWidgetIcon(trigger.type);
    const iconColor = COLORS.textPrimary;
    const iconProps = { size: 20, color: iconColor };

    switch (iconName) {
      case 'ListChecks': return <ListChecks {...iconProps} />;
      case 'Gem': return <Gem {...iconProps} />;
      case 'Heart': return <Heart {...iconProps} />;
      case 'Target': return <Target {...iconProps} />;
      case 'Hexagon': return <Hexagon {...iconProps} />;
      case 'Sparkles': return <Sparkles {...iconProps} />;
      case 'Bell': return <Bell {...iconProps} />;
      case 'Quote': return <Quote {...iconProps} />;
      default: return <Plus {...iconProps} />;
    }
  };

  const widgetColor = getWidgetColor(trigger.type);

  const positionStyle = {
    top: { top: SPACING.lg },
    bottom: { bottom: SPACING.lg },
    inline: {},
  };

  return (
    <Animated.View
      style={[
        styles.container,
        position !== 'inline' && styles.absoluteContainer,
        position !== 'inline' && positionStyle[position],
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(15, 16, 48, 0.95)', 'rgba(15, 16, 48, 0.85)']}
        style={styles.card}
      >
        {/* Left: Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            { backgroundColor: widgetColor + '30', transform: [{ scale: pulseAnim }] },
          ]}
        >
          {getIcon()}
        </Animated.View>

        {/* Middle: Text */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{trigger.title}</Text>
          <Text style={styles.description} numberOfLines={1}>
            {trigger.description}
          </Text>
        </View>

        {/* Right: Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
          >
            <X size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.acceptButton, { backgroundColor: widgetColor }]}
            onPress={handleAccept}
          >
            <Plus size={16} color={COLORS.textPrimary} />
            <Text style={styles.acceptButtonText}>Thêm</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPACT VARIANT (for inside cards)
// ═══════════════════════════════════════════════════════════

export const AddWidgetButton = ({
  trigger,
  onPress,
  size = 'medium',
  label = 'Thêm vào Dashboard',
}) => {
  if (!trigger) return null;

  const widgetColor = getWidgetColor(trigger.type);

  const sizeStyles = {
    small: {
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      fontSize: TYPOGRAPHY.fontSize.sm,
      iconSize: 14,
    },
    medium: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      fontSize: TYPOGRAPHY.fontSize.base,
      iconSize: 16,
    },
    large: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      fontSize: TYPOGRAPHY.fontSize.lg,
      iconSize: 18,
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  return (
    <TouchableOpacity
      style={[
        styles.widgetButton,
        {
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          borderColor: widgetColor + '50',
          backgroundColor: widgetColor + '15',
        },
      ]}
      onPress={() => onPress?.(trigger)}
      activeOpacity={0.7}
    >
      <LayoutDashboard
        size={currentSize.iconSize}
        color={widgetColor}
        style={{ marginRight: SPACING.xs }}
      />
      <Text
        style={[
          styles.widgetButtonText,
          { fontSize: currentSize.fontSize, color: widgetColor },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════
// FLOATING ACTION BUTTON VARIANT
// ═══════════════════════════════════════════════════════════

export const AddWidgetFAB = ({
  visible,
  trigger,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && trigger) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, trigger]);

  if (!visible || !trigger) return null;

  const widgetColor = getWidgetColor(trigger.type);
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Animated.View
      style={[
        styles.fab,
        {
          backgroundColor: widgetColor,
          transform: [
            { scale: scaleAnim },
            { rotate: spin },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.fabTouchable}
        onPress={() => onPress?.(trigger)}
        activeOpacity={0.8}
      >
        <Plus size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
  },

  absoluteContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    padding: SPACING.md,
    gap: SPACING.md,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  dismissButton: {
    padding: SPACING.xs,
  },

  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    gap: 4,
  },

  acceptButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  // Widget button styles
  widgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },

  widgetButtonText: {
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // FAB styles
  fab: {
    position: 'absolute',
    right: SPACING.xl,
    bottom: SPACING.xl + 70, // Above tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 100,
  },

  fabTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AddWidgetSuggestion;
