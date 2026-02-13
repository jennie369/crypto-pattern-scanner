/**
 * GlassPopup Component
 * Glassmorphism popup with frosted glass effect and blur background
 * Reference: matte translucent glass with visible blurred background
 */

import React, { memo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Alert types with icons
const ALERT_TYPES = {
  success: {
    icon: CheckCircle,
    iconColor: '#4ADE80',
    iconBg: 'rgba(74, 222, 128, 0.15)',
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
};

const GlassPopup = memo(({
  visible,
  title,
  message,
  type = 'info',
  buttons = [{ text: 'OK', onPress: () => {} }],
  onClose,
  showIcon = true,
}) => {
  const alertConfig = ALERT_TYPES[type] || ALERT_TYPES.info;
  const IconComponent = alertConfig.icon;

  // Animation
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleButtonPress = (button) => {
    button.onPress?.();
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
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
              {showIcon && (
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
              )}

              {/* Title */}
              <Text style={styles.title}>{title}</Text>

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
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH - 80,
    maxWidth: 280,
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
    padding: 20,
    paddingTop: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 4,
  },
  buttonContainerSingle: {
    justifyContent: 'center',
  },
  buttonContainerVertical: {
    flexDirection: 'column',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  buttonFullWidth: {
    flex: 0,
    width: '100%',
  },
  buttonSingle: {
    flex: 0,
    minWidth: 120,
    paddingHorizontal: 28,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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

export default GlassPopup;
