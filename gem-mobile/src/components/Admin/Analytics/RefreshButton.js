/**
 * RefreshButton Component
 * Admin Analytics Dashboard - GEM Platform
 *
 * Manual refresh button with loading state
 *
 * Created: January 30, 2026
 */

import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  Text,
} from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { COLORS, SPACING, GLASS } from '../../../utils/tokens';

const RefreshButton = ({
  onRefresh,
  loading = false,
  disabled = false,
  showLabel = false,
  label = 'Làm mới',
  compact = false,
  style,
}) => {
  const spinValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [loading, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      style={[
        styles.button,
        compact && styles.buttonCompact,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
      onPress={onRefresh}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <RefreshCw
          size={compact ? 14 : 16}
          color={(disabled || loading) ? COLORS.textMuted : COLORS.textPrimary}
        />
      </Animated.View>
      {showLabel && !compact && (
        <Text style={[styles.label, (disabled || loading) && styles.labelDisabled]}>
          {loading ? 'Đang tải...' : label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    gap: 6,
  },
  buttonCompact: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  label: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  labelDisabled: {
    color: COLORS.textMuted,
  },
});

export default RefreshButton;
