/**
 * DarkAlertModal Component
 * Theme-aware replacement for React Native Alert.alert
 * Supports Light/Dark theme design system
 */

import React, { memo, useMemo } from 'react';
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
import { useSettings } from '../../contexts/SettingsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DarkAlertModal = memo(({
  visible,
  onClose,
  title,
  message,
  type = 'success', // 'success' | 'error' | 'warning' | 'info'
  buttons = [{ text: 'OK', onPress: null }],
  showCloseButton = false,
}) => {
  const { colors, settings, glass, SPACING, TYPOGRAPHY } = useSettings();

  // Theme-aware icon map
  const ICON_MAP = useMemo(() => ({
    success: { icon: CheckCircle, color: colors.success || colors.successText },
    error: { icon: AlertCircle, color: colors.error || colors.errorText },
    warning: { icon: AlertCircle, color: colors.warning || colors.warningText },
    info: { icon: Info, color: colors.info || colors.infoText },
  }), [colors]);

  const { icon: IconComponent, color: iconColor } = ICON_MAP[type] || ICON_MAP.info;

  const handleButtonPress = (button) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  // Theme-aware styles
  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.6)',
    },
    container: {
      width: SCREEN_WIDTH * 0.85,
      maxWidth: 340,
      borderRadius: glass.borderRadius || 18,
      borderWidth: glass.borderWidth || 1,
      borderColor: settings.theme === 'light' ? colors.border : 'rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : undefined,
    },
    gradient: {
      padding: SPACING.xl,
      alignItems: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: SPACING.sm,
      right: SPACING.sm,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: SPACING.sm,
      textAlign: 'center',
    },
    message: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: SPACING.lg,
      lineHeight: 22,
    },
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
      backgroundColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
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
      backgroundColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)',
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
      color: colors.textPrimary,
      paddingVertical: SPACING.md,
    },
    primaryButtonText: {
      color: settings.theme === 'light' ? '#FFFFFF' : colors.bgDarkest,
      paddingVertical: 0,
    },
    destructiveButtonText: {
      color: colors.error || colors.errorText,
    },
    cancelButtonText: {
      color: colors.textMuted,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // Gradient colors based on theme
  const gradientColors = settings.theme === 'light'
    ? [colors.bgDarkest, colors.bgDarkest]
    : ['rgba(15, 16, 48, 0.98)', 'rgba(15, 16, 48, 0.95)'];

  const renderContent = () => (
    <>
      {showCloseButton && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={20} color={colors.textMuted} />
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
                  colors={[colors.gold, '#C9A026']}
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
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView
        intensity={settings.theme === 'light' ? 20 : 40}
        tint={settings.theme === 'light' ? 'light' : 'dark'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={showCloseButton ? onClose : undefined}
        />

        <View style={styles.container}>
          {settings.theme === 'light' ? (
            <View style={styles.gradient}>
              {renderContent()}
            </View>
          ) : (
            <LinearGradient colors={gradientColors} style={styles.gradient}>
              {renderContent()}
            </LinearGradient>
          )}
        </View>
      </BlurView>
    </Modal>
  );
});

export default DarkAlertModal;
