/**
 * DarkAlertModal Component
 * Dark theme replacement for React Native Alert.alert
 * Matches app's dark/glass design system
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ICON_MAP = {
  success: { icon: CheckCircle, color: COLORS.success },
  error: { icon: AlertCircle, color: COLORS.error },
  warning: { icon: AlertCircle, color: COLORS.warning },
  info: { icon: Info, color: COLORS.info },
};

const DarkAlertModal = memo(({
  visible,
  onClose,
  title,
  message,
  type = 'success', // 'success' | 'error' | 'warning' | 'info'
  buttons = [{ text: 'OK', onPress: null }],
  showCloseButton = false,
}) => {
  const { icon: IconComponent, color: iconColor } = ICON_MAP[type] || ICON_MAP.info;

  const handleButtonPress = (button) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={40} tint="dark" style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={showCloseButton ? onClose : undefined}
        />

        <View style={styles.container}>
          <LinearGradient
            colors={['rgba(15, 16, 48, 0.98)', 'rgba(15, 16, 48, 0.95)']}
            style={styles.gradient}
          >
            {showCloseButton && (
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}

            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
              <IconComponent size={32} color={iconColor} />
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            {message && <Text style={styles.message}>{message}</Text>}

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              {buttons.map((button, index) => {
                const isDestructive = button.style === 'destructive';
                const isCancel = button.style === 'cancel';
                const isPrimary = index === buttons.length - 1 && !isDestructive && !isCancel;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      isPrimary && styles.primaryButton,
                      isDestructive && styles.destructiveButton,
                      isCancel && styles.cancelButton,
                      buttons.length === 1 && styles.singleButton,
                    ]}
                    onPress={() => handleButtonPress(button)}
                    activeOpacity={0.8}
                  >
                    {isPrimary ? (
                      <LinearGradient
                        colors={[COLORS.gold, '#C9A026']}
                        style={styles.buttonGradient}
                      >
                        <Text style={[styles.buttonText, styles.primaryButtonText]}>
                          {button.text}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <Text
                        style={[
                          styles.buttonText,
                          isDestructive && styles.destructiveButtonText,
                          isCancel && styles.cancelButtonText,
                        ]}
                      >
                        {button.text}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </LinearGradient>
        </View>
      </BlurView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 340,
    borderRadius: GLASS.borderRadius,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  gradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },

  // Close button
  closeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Icon
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  // Text
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },

  // Buttons
  buttonsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  singleButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: 'transparent',
  },
  destructiveButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  buttonGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },
  primaryButtonText: {
    color: COLORS.bgDark,
    paddingVertical: 0,
  },
  destructiveButtonText: {
    color: COLORS.error,
  },
  cancelButtonText: {
    color: COLORS.textMuted,
  },
});

export default DarkAlertModal;
