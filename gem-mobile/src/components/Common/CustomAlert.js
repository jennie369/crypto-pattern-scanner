/**
 * Gemral - CustomAlert Component
 * A styled modal alert component with dark theme
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CustomAlert = ({
  visible = false,
  title = 'Thông báo',
  message = '',
  type = 'info', // 'success', 'error', 'warning', 'info', 'confirm'
  buttons = [],
  onClose,
  icon,
}) => {
  // Default buttons if none provided
  const defaultButtons = [
    {
      text: 'OK',
      onPress: onClose,
      style: 'primary',
    },
  ];

  const alertButtons = buttons.length > 0 ? buttons : defaultButtons;

  // Get icon based on type
  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: '#00D9A5' };
      case 'error':
        return { name: 'close-circle', color: '#FF6B6B' };
      case 'warning':
        return { name: 'warning', color: '#FFB347' };
      case 'confirm':
        return { name: 'help-circle', color: '#9D5CFF' };
      default:
        return { name: 'information-circle', color: '#00D9FF' };
    }
  };

  const iconConfig = getIcon();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />

        <View style={styles.alertContainer}>
          <LinearGradient
            colors={['rgba(30, 30, 50, 0.95)', 'rgba(20, 20, 35, 0.98)']}
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
            {title && <Text style={styles.title}>{title}</Text>}

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
                    button.onPress?.();
                    if (!button.preventClose) {
                      onClose?.();
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertContainer: {
    width: width * 0.85,
    maxWidth: 340,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gradientBackground: {
    padding: 24,
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  singleButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#9D5CFF',
  },
  destructiveButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  destructiveText: {
    color: '#FF6B6B',
  },
  cancelText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default CustomAlert;
