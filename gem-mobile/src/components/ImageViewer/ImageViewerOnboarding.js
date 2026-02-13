/**
 * Image Viewer Onboarding Component
 * First-time user tips for image viewer gestures
 * Phase 2: Image Viewer Enhancement (30/12/2024)
 */

import React, { useState, useEffect, memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hand, ZoomIn, Move, ArrowDown } from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';

const STORAGE_KEY = '@gem:image_viewer_onboarding_seen';

/**
 * ImageViewerOnboarding - Gesture tips for first-time users
 *
 * @param {Object} props
 * @param {Function} props.onComplete - Callback when onboarding completes
 */
const ImageViewerOnboarding = ({ onComplete }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const seen = await AsyncStorage.getItem(STORAGE_KEY);
      if (!seen) {
        // Delay show to let user see the image first
        setTimeout(() => setVisible(true), 500);
      }
    } catch (err) {
      console.error('[ImageViewerOnboarding] Check status error:', err);
    }
  };

  const handleDismiss = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
      setVisible(false);
      onComplete?.();
    } catch (err) {
      console.error('[ImageViewerOnboarding] Dismiss error:', err);
      setVisible(false);
      onComplete?.();
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.overlay}
    >
      <View style={styles.content}>
        {/* Tip 1: Double tap */}
        <View style={styles.tipRow}>
          <View style={styles.iconContainer}>
            <Hand size={24} color={COLORS.gold} />
            <Hand size={24} color={COLORS.gold} style={styles.secondHand} />
          </View>
          <View style={styles.tipText}>
            <Text style={styles.tipTitle}>Chạm 2 lần để phóng to</Text>
            <Text style={styles.tipDescription}>
              Chạm đúp vào điểm bạn muốn xem chi tiết
            </Text>
          </View>
        </View>

        {/* Tip 2: Pinch */}
        <View style={styles.tipRow}>
          <View style={styles.iconContainer}>
            <ZoomIn size={24} color={COLORS.gold} />
          </View>
          <View style={styles.tipText}>
            <Text style={styles.tipTitle}>Véo để zoom</Text>
            <Text style={styles.tipDescription}>
              Dùng 2 ngón tay để phóng to/thu nhỏ
            </Text>
          </View>
        </View>

        {/* Tip 3: Pan */}
        <View style={styles.tipRow}>
          <View style={styles.iconContainer}>
            <Move size={24} color={COLORS.gold} />
          </View>
          <View style={styles.tipText}>
            <Text style={styles.tipTitle}>Kéo để di chuyển</Text>
            <Text style={styles.tipDescription}>
              Khi đang zoom, kéo để xem các phần khác
            </Text>
          </View>
        </View>

        {/* Tip 4: Dismiss */}
        <View style={styles.tipRow}>
          <View style={styles.iconContainer}>
            <ArrowDown size={24} color={COLORS.gold} />
          </View>
          <View style={styles.tipText}>
            <Text style={styles.tipTitle}>Vuốt xuống để đóng</Text>
            <Text style={styles.tipDescription}>
              Vuốt xuống để thoát khỏi chế độ xem ảnh
            </Text>
          </View>
        </View>

        {/* Dismiss button */}
        <Pressable style={styles.dismissButton} onPress={handleDismiss}>
          <Text style={styles.dismissText}>Đã hiểu</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  content: {
    backgroundColor: COLORS.bgCard || 'rgba(30, 30, 60, 0.95)',
    borderRadius: 20,
    padding: SPACING.lg,
    maxWidth: 320,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  secondHand: {
    marginLeft: -10,
  },
  tipText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  tipDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  dismissButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.md,
  },
  dismissText: {
    color: COLORS.bgDark || '#0F0F30',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 15,
  },
});

export default memo(ImageViewerOnboarding);
