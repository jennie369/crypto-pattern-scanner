/**
 * Gemral - CustomAlert Component
 * A styled modal alert component
 * Theme-aware with i18n support
 */

import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  InteractionManager,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';

const { width } = Dimensions.get('window');

const CustomAlert = ({
  visible = false,
  title, // Will use i18n default
  message = '',
  type = 'info', // 'success', 'error', 'warning', 'info', 'confirm'
  buttons = [],
  onClose,
  icon,
}) => {
  const { colors, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // i18n defaults
  const alertTitle = title || t('common.notification', 'Thông báo');

  // Default buttons if none provided
  const defaultButtons = [
    {
      text: 'OK',
      onPress: onClose,
      style: 'primary',
    },
  ];

  const alertButtons = buttons.length > 0 ? buttons : defaultButtons;

  // Get icon based on type - theme-aware colors
  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: colors.success || colors.successText || '#10B981' };
      case 'error':
        return { name: 'close-circle', color: colors.error || colors.errorText || '#FF6B6B' };
      case 'warning':
        return { name: 'warning', color: colors.warning || colors.warningText || '#FFB347' };
      case 'confirm':
        return { name: 'help-circle', color: colors.purple || '#9D5CFF' };
      default:
        return { name: 'information-circle', color: colors.info || colors.infoText || '#00D9FF' };
    }
  };

  const iconConfig = getIcon();

  // Theme-aware styles
  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.5)',
    },
    alertContainer: {
      width: width * 0.85,
      maxWidth: 340,
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: settings.theme === 'light' ? colors.border : 'rgba(255, 189, 89, 0.3)',
    },
    gradientBackground: {
      padding: 24,
      alignItems: 'center',
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : undefined,
    },
    iconContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.gold,
      textAlign: 'center',
      marginBottom: SPACING.sm,
    },
    message: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: SPACING.xl,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: SPACING.md,
      width: '100%',
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
    },
    singleButton: {
      flex: 1,
    },
    primaryButton: {
      backgroundColor: colors.gold,
    },
    destructiveButton: {
      backgroundColor: settings.theme === 'light' ? colors.error : 'rgba(255, 107, 107, 0.2)',
      borderWidth: 1,
      borderColor: settings.theme === 'light' ? 'rgba(114, 28, 36, 0.3)' : 'rgba(255, 107, 107, 0.3)',
    },
    cancelButton: {
      backgroundColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: settings.theme === 'light' ? colors.border : 'rgba(255, 255, 255, 0.1)',
    },
    buttonText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
    },
    primaryText: {
      color: colors.bgDarkest,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    destructiveText: {
      color: colors.error || colors.errorText,
    },
    cancelText: {
      color: colors.textMuted,
    },
  }), [colors, settings.theme, SPACING, TYPOGRAPHY]);

  // Theme-aware gradient colors
  const gradientColors = settings.theme === 'light'
    ? [colors.bgDarkest, colors.bgDarkest]
    : ['rgba(30, 30, 50, 0.95)', 'rgba(20, 20, 35, 0.98)'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView
          intensity={settings.theme === 'light' ? 20 : 40}
          style={StyleSheet.absoluteFill}
          tint={settings.theme === 'light' ? 'light' : 'dark'}
        />

        <View style={styles.alertContainer}>
          {settings.theme === 'light' ? (
            <View style={styles.gradientBackground}>
              {/* Icon */}
              <View style={[styles.iconContainer, { backgroundColor: `${iconConfig.color}20` }]}>
                <Ionicons
                  name={iconConfig.name}
                  size={40}
                  color={iconConfig.color}
                />
              </View>

              {/* Title */}
              {alertTitle && <Text style={styles.title}>{alertTitle}</Text>}

              {/* Message */}
              {message && <Text style={styles.message}>{message}</Text>}

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {alertButtons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      button.style === 'destructive' && styles.destructiveButton,
                      button.style === 'cancel' && styles.cancelButton,
                      button.style === 'primary' && styles.primaryButton,
                      alertButtons.length === 1 && styles.singleButton,
                    ]}
                    onPress={() => {
                      if (!button.preventClose) {
                        onClose?.();
                      }
                      if (button.onPress) {
                        if (Platform.OS === 'ios') {
                          InteractionManager.runAfterInteractions(() => {
                            setTimeout(() => button.onPress(), 100);
                          });
                        } else {
                          setTimeout(() => button.onPress(), 50);
                        }
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        button.style === 'destructive' && styles.destructiveText,
                        button.style === 'cancel' && styles.cancelText,
                        button.style === 'primary' && styles.primaryText,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <LinearGradient
              colors={gradientColors}
              style={styles.gradientBackground}
            >
              {/* Icon */}
              <View style={[styles.iconContainer, { backgroundColor: `${iconConfig.color}20` }]}>
                <Ionicons
                  name={iconConfig.name}
                  size={40}
                  color={iconConfig.color}
                />
              </View>

              {/* Title */}
              {alertTitle && <Text style={styles.title}>{alertTitle}</Text>}

              {/* Message */}
              {message && <Text style={styles.message}>{message}</Text>}

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {alertButtons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      button.style === 'destructive' && styles.destructiveButton,
                      button.style === 'cancel' && styles.cancelButton,
                      button.style === 'primary' && styles.primaryButton,
                      alertButtons.length === 1 && styles.singleButton,
                    ]}
                    onPress={() => {
                      if (!button.preventClose) {
                        onClose?.();
                      }
                      if (button.onPress) {
                        if (Platform.OS === 'ios') {
                          InteractionManager.runAfterInteractions(() => {
                            setTimeout(() => button.onPress(), 100);
                          });
                        } else {
                          setTimeout(() => button.onPress(), 50);
                        }
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        button.style === 'destructive' && styles.destructiveText,
                        button.style === 'cancel' && styles.cancelText,
                        button.style === 'primary' && styles.primaryText,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
