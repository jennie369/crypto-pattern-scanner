/**
 * CallButton Component
 * Phone/Video call buttons for chat header
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Phone, Video } from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';

/**
 * CallButton - Button to initiate audio/video calls
 * @param {Object} props
 * @param {'audio' | 'video'} props.type - Call type
 * @param {Function} props.onPress - Press handler
 * @param {boolean} props.disabled - Disabled state
 * @param {number} props.size - Icon size
 * @param {Object} props.style - Additional styles
 */
const CallButton = ({
  type = 'audio',
  onPress,
  disabled = false,
  size = 24,
  style,
}) => {
  const Icon = type === 'video' ? Video : Phone;

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Icon
        size={size}
        color={disabled ? COLORS.textDisabled : COLORS.textPrimary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default CallButton;
