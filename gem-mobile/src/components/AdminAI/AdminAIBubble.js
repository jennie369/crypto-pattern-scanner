/**
 * GEM AI Trading Brain - Floating Bubble Component
 * Admin-only floating bubble that opens the AI chat modal
 *
 * Features:
 * - Admin-only visibility
 * - Draggable positioning
 * - Pulse animation on alerts
 * - Unread count badge
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Brain } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';

import AdminAIChatModal from './AdminAIChatModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUBBLE_SIZE = 56;
const EDGE_MARGIN = 16;
const INITIAL_POSITION = {
  x: SCREEN_WIDTH - BUBBLE_SIZE - EDGE_MARGIN,
  y: SCREEN_HEIGHT - 200, // Above tab bar
};

const AdminAIBubble = ({
  symbol = 'BTCUSDT',
  timeframe = '4h',
  currentPrice,
  priceChange,
  scanResults = [],
  zones = [],
  patterns = [],
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Auth check - only show for admins
  const { user, isAdmin } = useAuth();

  // State
  const [modalVisible, setModalVisible] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [hasNewAlert, setHasNewAlert] = useState(false);

  // Animation values
  const translateX = useSharedValue(INITIAL_POSITION.x);
  const translateY = useSharedValue(INITIAL_POSITION.y);
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const contextX = useSharedValue(0);
  const contextY = useSharedValue(0);

  // Pulse animation when there are alerts
  useEffect(() => {
    if (hasNewAlert) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1, // infinite
        true
      );
    } else {
      pulseScale.value = withTiming(1);
    }
  }, [hasNewAlert]);

  // Check for alerts based on positions and patterns
  useEffect(() => {
    // TODO: Integrate with adminAIPositionService to check for alerts
    // This would check for:
    // - Positions approaching SL
    // - New high-confidence patterns
    // - Zone retests

    // For now, just set based on pattern count for demo
    const urgentPatterns = patterns.filter((p) => (p.confidence || 0) >= 80);
    if (urgentPatterns.length > 0) {
      setAlertCount(urgentPatterns.length);
      setHasNewAlert(true);
    } else {
      setAlertCount(0);
      setHasNewAlert(false);
    }
  }, [patterns]);

  // Handle tap - MUST be defined before gestures that use it
  const handleTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setHasNewAlert(false); // Clear alert on open
    setModalVisible(true);
  }, []);

  // Gesture handlers - memoized to prevent recreation
  const panGesture = useMemo(() => Gesture.Pan()
    .onStart(() => {
      'worklet';
      contextX.value = translateX.value;
      contextY.value = translateY.value;
      scale.value = withSpring(1.1);
    })
    .onUpdate((event) => {
      'worklet';
      translateX.value = contextX.value + event.translationX;
      translateY.value = contextY.value + event.translationY;
    })
    .onEnd(() => {
      'worklet';
      scale.value = withSpring(1);

      // Snap to nearest edge
      const snapToRight = translateX.value > SCREEN_WIDTH / 2;
      const targetX = snapToRight
        ? SCREEN_WIDTH - BUBBLE_SIZE - EDGE_MARGIN
        : EDGE_MARGIN;

      // Clamp Y position
      const minY = 100; // Below status bar
      const maxY = SCREEN_HEIGHT - BUBBLE_SIZE - 120; // Above tab bar
      const clampedY = Math.max(minY, Math.min(maxY, translateY.value));

      translateX.value = withSpring(targetX, {
        damping: 20,
        stiffness: 200,
      });
      translateY.value = withSpring(clampedY, {
        damping: 20,
        stiffness: 200,
      });
    }), [translateX, translateY, scale, contextX, contextY]);

  // Tap gesture handler
  const tapGesture = useMemo(() => Gesture.Tap()
    .onEnd(() => {
      'worklet';
      runOnJS(handleTap)();
    }), [handleTap]);

  // Combined gestures
  const composedGesture = useMemo(
    () => Gesture.Simultaneous(panGesture, tapGesture),
    [panGesture, tapGesture]
  );

  // Animated styles
  const bubbleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseScale.value > 1 ? 0.7 : 0,
  }));

  // ═══════════════════════════════════════════════════════════
  // STYLES
  // ═══════════════════════════════════════════════════════════

  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 1000,
    },
    pulseRing: {
      position: 'absolute',
      width: BUBBLE_SIZE + 20,
      height: BUBBLE_SIZE + 20,
      borderRadius: (BUBBLE_SIZE + 20) / 2,
      backgroundColor: colors.gold,
      top: -10,
      left: -10,
    },
    bubble: {
      width: BUBBLE_SIZE,
      height: BUBBLE_SIZE,
      borderRadius: BUBBLE_SIZE / 2,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderWidth: 2,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      // Shadow
      shadowColor: colors.gold,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 8,
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.error,
      borderWidth: 2,
      borderColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.textPrimary,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // Don't render if not admin - placed after all hooks to follow React Rules of Hooks
  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.container, bubbleAnimatedStyle]}>
          {/* Pulse ring */}
          {hasNewAlert && (
            <Animated.View style={[styles.pulseRing, pulseAnimatedStyle]} />
          )}

          {/* Main bubble */}
          <View style={styles.bubble}>
            <Brain size={28} color={colors.gold} strokeWidth={2} />
          </View>

          {/* Alert badge */}
          {alertCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {alertCount > 9 ? '9+' : alertCount}
              </Text>
            </View>
          )}
        </Animated.View>
      </GestureDetector>

      {/* Chat Modal */}
      <AdminAIChatModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        symbol={symbol}
        timeframe={timeframe}
        currentPrice={currentPrice}
        priceChange={priceChange}
        patterns={patterns}
        zones={zones}
        scanResults={scanResults}
        userId={user?.id}
      />
    </>
  );
};

export default AdminAIBubble;
