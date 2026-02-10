/**
 * Image Viewer Controls Component
 * UI controls overlay for image viewer
 * Phase 2: Image Viewer Enhancement (30/12/2024)
 */

import React, { memo, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import {
  X,
  Share2,
  Download,
  MoreHorizontal,
} from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

/**
 * ImageViewerControls - UI controls for image viewer
 *
 * @param {Object} props
 * @param {boolean} props.visible - Show/hide controls
 * @param {number} props.currentIndex - Current image index
 * @param {number} props.totalCount - Total images
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.onShare - Share callback
 * @param {Function} props.onDownload - Download callback
 * @param {Function} props.onMore - More options callback
 */
const ImageViewerControls = ({
  visible,
  currentIndex,
  totalCount,
  onClose,
  onShare,
  onDownload,
  onMore,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'space-between',
    },
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
    },
    topBarContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
    bottomBarContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
    },
    iconButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    counter: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
    },
    actionText: {
      marginLeft: SPACING.xs,
      fontSize: 14,
      color: colors.textPrimary,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
      pointerEvents="box-none"
    >
      {/* Top Bar */}
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <View style={styles.topBarContent}>
          {/* Close Button */}
          <Pressable
            style={styles.iconButton}
            onPress={onClose}
            hitSlop={10}
          >
            <X size={24} color={colors.textPrimary} />
          </Pressable>

          {/* Counter */}
          <Text style={styles.counter}>
            {currentIndex + 1} / {totalCount}
          </Text>

          {/* More Button */}
          <Pressable
            style={styles.iconButton}
            onPress={onMore}
            hitSlop={10}
          >
            <MoreHorizontal size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Bottom Bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          {/* Share Button */}
          <Pressable
            style={styles.actionButton}
            onPress={onShare}
          >
            <Share2 size={22} color={colors.textPrimary} />
            <Text style={styles.actionText}>Chia sẻ</Text>
          </Pressable>

          {/* Download Button */}
          <Pressable
            style={styles.actionButton}
            onPress={onDownload}
          >
            <Download size={22} color={colors.textPrimary} />
            <Text style={styles.actionText}>Tải về</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

export default memo(ImageViewerControls);
