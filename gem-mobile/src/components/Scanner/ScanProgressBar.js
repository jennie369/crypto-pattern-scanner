/**
 * ScanProgressBar - Visual progress indicator for multi-coin scanning
 *
 * FEATURES:
 * - Animated percentage progress
 * - Current symbol being scanned
 * - Patterns found counter
 * - Estimated time remaining
 * - Cancel button
 * - Pulse animation when active
 *
 * USAGE:
 * import ScanProgressBar from '../components/Scanner/ScanProgressBar';
 *
 * <ScanProgressBar
 *   progress={45}
 *   total={100}
 *   currentSymbol="BTCUSDT"
 *   patternsFound={12}
 *   isScanning={true}
 *   onCancel={() => cancelScan()}
 * />
 */

import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Easing,
} from 'react-native';

// Theme colors
const COLORS = {
  background: '#1a1a2e',
  backgroundDark: '#0d1421',
  accent: '#00d4aa',
  accentDim: 'rgba(0, 212, 170, 0.3)',
  text: '#ffffff',
  textMuted: '#888888',
  textDim: '#666666',
  danger: '#dc3545',
  warning: '#ffc107',
};

const ScanProgressBar = ({
  progress = 0,
  total = 100,
  currentSymbol = '',
  patternsFound = 0,
  isScanning = false,
  startTime = null,
  onCancel = null,
  showEstimate = true,
  compact = false,
}) => {
  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Calculate percentage
  const progressPercent = useMemo(() => {
    return total > 0 ? Math.min((progress / total) * 100, 100) : 0;
  }, [progress, total]);

  // Calculate estimated time remaining
  const estimatedTimeRemaining = useMemo(() => {
    if (!startTime || progress <= 0 || !showEstimate) return null;

    const elapsed = Date.now() - startTime;
    const avgTimePerItem = elapsed / progress;
    const remaining = (total - progress) * avgTimePerItem;

    if (remaining < 1000) return 'Almost done...';
    if (remaining < 60000) return `~${Math.ceil(remaining / 1000)}s remaining`;
    return `~${Math.ceil(remaining / 60000)}m remaining`;
  }, [progress, total, startTime, showEstimate]);

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progressPercent, progressAnim]);

  // Pulse animation when scanning
  useEffect(() => {
    if (isScanning) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Start pulse
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
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
      );
      pulse.start();

      return () => pulse.stop();
    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isScanning, pulseAnim, fadeAnim]);

  // Don't render if not scanning and progress is 0
  if (!isScanning && progress === 0) {
    return null;
  }

  // Compact version
  if (compact) {
    return (
      <Animated.View style={[styles.compactContainer, { opacity: fadeAnim }]}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactTitle}>
            Scanning {currentSymbol || '...'}
          </Text>
          <Text style={styles.compactPercent}>{Math.round(progressPercent)}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </Animated.View>
    );
  }

  // Full version
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: pulseAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.scanningIndicator}>
            <Animated.View
              style={[
                styles.scanningDot,
                {
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.02],
                    outputRange: [0.5, 1],
                  }),
                },
              ]}
            />
            <Text style={styles.title}>Scanning</Text>
          </View>
        </View>
        <Text style={styles.percentage}>{Math.round(progressPercent)}%</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
        {/* Shimmer effect */}
        {isScanning && (
          <Animated.View
            style={[
              styles.progressShimmer,
              {
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.02],
                  outputRange: [0, 0.3],
                }),
              },
            ]}
          />
        )}
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <Text style={styles.currentSymbol} numberOfLines={1}>
          {currentSymbol ? currentSymbol : 'Initializing...'}
        </Text>
        <Text style={styles.stats}>
          {progress}/{total}
        </Text>
      </View>

      {/* Footer row */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {patternsFound > 0 && (
            <View style={styles.patternsBadge}>
              <Text style={styles.patternsText}>
                {patternsFound} pattern{patternsFound !== 1 ? 's' : ''} found
              </Text>
            )}
            </View>
          )}
          {estimatedTimeRemaining && (
            <Text style={styles.estimate}>{estimatedTimeRemaining}</Text>
          )}
        </View>

        {/* Cancel button */}
        {onCancel && isScanning && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          )}
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginRight: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  percentage: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Progress bar
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
  progressShimmer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 50,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  currentSymbol: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
  },
  stats: {
    color: COLORS.textDim,
    fontSize: 12,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patternsBadge: {
    backgroundColor: COLORS.accentDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 10,
  },
  patternsText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  estimate: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
  },
  cancelText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
  },

  // Compact version
  compactContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 12,
    marginVertical: 4,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  compactTitle: {
    color: COLORS.text,
    fontSize: 12,
  },
  compactPercent: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default React.memo(ScanProgressBar);
