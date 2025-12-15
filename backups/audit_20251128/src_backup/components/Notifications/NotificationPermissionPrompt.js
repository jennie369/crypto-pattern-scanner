/**
 * Gemral - Notification Permission Prompt
 *
 * Beautiful modal to request notification permissions
 * Shows benefits of enabling notifications
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Sun, CheckCircle2, Moon, Trophy, X } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, GRADIENTS } from '../../utils/tokens';

const PROMPT_SHOWN_KEY = '@gem_notification_prompt_shown';

const NotificationPermissionPrompt = ({ visible, onClose, onPermissionGranted }) => {
  const [isRequesting, setIsRequesting] = useState(false);

  const benefits = [
    {
      icon: Sun,
      title: 'Morning Affirmations',
      description: 'Start your day with positive energy',
    },
    {
      icon: CheckCircle2,
      title: 'Midday Check-ins',
      description: 'Stay on track with gentle reminders',
    },
    {
      icon: Moon,
      title: 'Evening Visualization',
      description: 'End your day with peaceful reflection',
    },
    {
      icon: Trophy,
      title: 'Milestone Celebrations',
      description: 'Celebrate your achievements',
    },
  ];

  const handleEnableNotifications = async () => {
    setIsRequesting(true);

    try {
      const { status } = await Notifications.requestPermissionsAsync();

      if (status === 'granted') {
        await AsyncStorage.setItem(PROMPT_SHOWN_KEY, 'granted');
        onPermissionGranted?.();
        onClose();
      } else {
        await AsyncStorage.setItem(PROMPT_SHOWN_KEY, 'denied');
        onClose();
      }
    } catch (error) {
      console.error('[NotificationPrompt] Error requesting permissions:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleNotNow = async () => {
    await AsyncStorage.setItem(PROMPT_SHOWN_KEY, 'later');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={GRADIENTS.gold}
                style={styles.iconGradient}
              >
                <Bell size={32} color={COLORS.bgMid} />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Stay Motivated</Text>
            <Text style={styles.subtitle}>
              Get personalized reminders based on your goals and widgets
            </Text>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsList}>
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <View key={index} style={styles.benefitRow}>
                  <View style={styles.benefitIcon}>
                    <IconComponent size={20} color={COLORS.gold} />
                  </View>
                  <View style={styles.benefitText}>
                    <Text style={styles.benefitTitle}>{benefit.title}</Text>
                    <Text style={styles.benefitDescription}>
                      {benefit.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Privacy Note */}
          <Text style={styles.privacyNote}>
            You can customize notification times and types in Settings
          </Text>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.enableButton}
              onPress={handleEnableNotifications}
              disabled={isRequesting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={GRADIENTS.primaryButton}
                style={styles.enableButtonGradient}
              >
                <Bell size={20} color={COLORS.textPrimary} />
                <Text style={styles.enableButtonText}>
                  {isRequesting ? 'Requesting...' : 'Enable Notifications'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.laterButton}
              onPress={handleNotNow}
              activeOpacity={0.7}
            >
              <Text style={styles.laterButtonText}>Not Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Check if prompt should be shown
 */
export const shouldShowNotificationPrompt = async () => {
  try {
    // Check if already shown
    const shown = await AsyncStorage.getItem(PROMPT_SHOWN_KEY);
    if (shown) return false;

    // Check current permission status
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return false;

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Reset prompt (for testing)
 */
export const resetNotificationPrompt = async () => {
  await AsyncStorage.removeItem(PROMPT_SHOWN_KEY);
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    backgroundColor: COLORS.bgMid,
    borderRadius: 24,
    padding: SPACING.xxl,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.sm,
    zIndex: 1,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Benefits
  benefitsList: {
    marginBottom: SPACING.xxl,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },

  // Privacy
  privacyNote: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },

  // Buttons
  buttons: {
    gap: SPACING.md,
  },
  enableButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  enableButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  enableButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  laterButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  laterButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
});

export default NotificationPermissionPrompt;
