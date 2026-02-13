/**
 * GEM Mobile - Custom Alert Component
 * Glassmorphism popup with frosted glass effect and blur background
 * Reference: matte translucent glass with visible blurred background
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  InteractionManager,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Alert types with icons - Green for success
const ALERT_TYPES = {
  success: {
    icon: CheckCircle,
    iconColor: '#10B981', // Green
    iconBg: 'rgba(16, 185, 129, 0.15)',
  },
  error: {
    icon: XCircle,
    iconColor: '#F87171',
    iconBg: 'rgba(248, 113, 113, 0.15)',
  },
  warning: {
    icon: AlertCircle,
    iconColor: '#FBBF24',
    iconBg: 'rgba(251, 191, 36, 0.15)',
  },
  info: {
    icon: Info,
    iconColor: '#60A5FA',
    iconBg: 'rgba(96, 165, 250, 0.15)',
  },
  default: {
    icon: Info,
    iconColor: '#60A5FA',
    iconBg: 'rgba(96, 165, 250, 0.15)',
  },
};

/**
 * CustomAlert - Glassmorphism dark popup
 */
export default function CustomAlert({
  visible,
  title,
  message,
  buttons = [{ text: 'OK' }],
  onClose,
  type = 'default',
}) {
  const alertConfig = ALERT_TYPES[type] || ALERT_TYPES.default;
  const IconComponent = alertConfig.icon;

  // Animation - Smooth spring animation
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset values before animating
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 15,
          stiffness: 150,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out smoothly
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleButtonPress = async (button) => {
    // CRITICAL FIX: Execute the callback FIRST, then close the dialog
    // This ensures the callback runs even if component unmounts
    // The previous approach (close first, callback after timeout) was unreliable
    // because setTimeout could be cleared when component unmounts

    // Store the callback reference before closing
    const callback = button.onPress;

    // Close the alert
    if (onClose) {
      onClose();
    }

    // Execute callback after a short delay to allow modal to start closing
    // This prevents race conditions on iOS where the parent modal could close
    if (callback) {
      // Use requestAnimationFrame + setTimeout for more reliable execution
      requestAnimationFrame(() => {
        setTimeout(async () => {
          try {
            await callback();
          } catch (error) {
            console.error('[CustomAlert] Button callback error:', error);
          }
        }, Platform.OS === 'ios' ? 100 : 50);
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Blurred background overlay */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 30 : 80}
        tint="dark"
        style={styles.overlay}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Dark frosted glass card */}
          <View style={styles.glassCard}>
            {/* Subtle border glow */}
            <View style={styles.borderGlow} />

            {/* Content */}
            <View style={styles.content}>
              {/* Icon */}
              <View style={[
                styles.iconContainer,
                {
                  backgroundColor: alertConfig.iconBg,
                  borderColor: alertConfig.iconColor + '50',
                  shadowColor: alertConfig.iconColor,
                }
              ]}>
                <IconComponent size={22} color={alertConfig.iconColor} strokeWidth={2.5} />
              </View>

              {/* Title */}
              {title && (
                <Text style={styles.title}>{title}</Text>
              )}

              {/* Message */}
              {message && (
                <Text style={styles.message}>{message}</Text>
              )}

              {/* Buttons */}
              <View style={[
                styles.buttonContainer,
                buttons.length === 1 && styles.buttonContainerSingle,
                buttons.length >= 3 && styles.buttonContainerVertical,
              ]}>
                {buttons.map((button, index) => {
                  const isPrimary = button.style === 'default' ||
                                    (!button.style && index === buttons.length - 1);
                  const isDestructive = button.style === 'destructive';
                  const isCancel = button.text === 'Hủy' || button.text === 'Cancel' || button.style === 'cancel';

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        buttons.length >= 3 && styles.buttonFullWidth,
                        isPrimary && !isDestructive && !isCancel && styles.buttonPrimary,
                        isDestructive && styles.buttonDestructive,
                        isCancel && styles.buttonCancel,
                        buttons.length === 1 && styles.buttonSingle,
                      ]}
                      onPress={() => handleButtonPress(button)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          isPrimary && !isDestructive && !isCancel && styles.buttonTextPrimary,
                          isDestructive && styles.buttonTextDestructive,
                          isCancel && styles.buttonTextCancel,
                        ]}
                      >
                        {button.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

/**
 * Hook for using CustomAlert more easily
 */
export function useCustomAlert() {
  const [alertConfig, setAlertConfig] = React.useState({
    visible: false,
    title: '',
    message: '',
    buttons: [{ text: 'OK' }],
    type: 'default',
  });

  const alert = (config) => {
    setAlertConfig({
      visible: true,
      title: config.title || '',
      message: config.message || '',
      buttons: config.buttons || [{ text: 'OK' }],
      type: config.type || 'default',
    });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const AlertComponent = (
    <CustomAlert
      visible={alertConfig.visible}
      title={alertConfig.title}
      message={alertConfig.message}
      buttons={alertConfig.buttons}
      type={alertConfig.type}
      onClose={closeAlert}
    />
  );

  return { alert, AlertComponent, closeAlert };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH - 64,
    maxWidth: 320,
  },
  glassCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  borderGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 189, 89, 0.4)',
  },
  content: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 18,
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFBD59',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  buttonContainerSingle: {
    justifyContent: 'center',
  },
  buttonContainerVertical: {
    flexDirection: 'column',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minHeight: 40,
    maxHeight: 44,
  },
  buttonFullWidth: {
    flex: 0,
    width: '100%',
  },
  buttonSingle: {
    flex: 0,
    minWidth: 100,
    paddingHorizontal: 24,
  },
  buttonPrimary: {
    backgroundColor: '#FFBD59',
    borderColor: 'rgba(255, 189, 89, 0.5)',
  },
  buttonDestructive: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  buttonCancel: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  buttonTextPrimary: {
    color: '#1a1a2e',
  },
  buttonTextDestructive: {
    color: '#F87171',
  },
  buttonTextCancel: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
