/**
 * Gemral - Export Button Component
 *
 * Button to trigger export to image flow
 */

import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Download } from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';

const ExportButton = ({ onPress, disabled = false, size = 18 }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    if (disabled) return;
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 100);
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        isPressed && styles.buttonPressed,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      {disabled ? (
        <ActivityIndicator size="small" color={COLORS.gold} />
      ) : (
        <Download size={size} color={COLORS.gold} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    transform: [{ scale: 0.95 }],
  },
});

export default ExportButton;
