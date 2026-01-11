/**
 * Alert Provider
 * React Context-based alert system for dark themed alerts
 * Provides useAlert hook for components to show alerts
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  Platform,
  InteractionManager,
} from 'react-native';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../utils/tokens';

const AlertContext = createContext(null);

/**
 * Alert type configurations - Green for success
 */
const ALERT_TYPES = {
  success: {
    icon: CheckCircle,
    color: '#10B981', // Green
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  error: {
    icon: AlertCircle,
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  warning: {
    icon: AlertTriangle,
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  info: {
    icon: Info,
    color: COLORS.gold || '#FFBD59',
    bgColor: 'rgba(255, 189, 89, 0.15)',
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
};

/**
 * AlertProvider Component
 * Wrap your app with this to enable useAlert hook
 */
export const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = useCallback((config) => {
    const {
      type = 'info',
      title = '',
      message = '',
      buttons = [{ text: 'OK' }],
    } = config;

    setAlertState({
      visible: true,
      type,
      title,
      message,
      buttons,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, visible: false }));
  }, []);

  const handleButtonPress = useCallback((button) => {
    // CRITICAL: Close alert FIRST, then call button callback
    // On iOS, calling button.onPress first can close the parent modal
    // while this alert is still mounted, causing a race condition crash
    hideAlert();
    if (button.onPress) {
      // Delay button callback to ensure alert is fully closed
      // Use InteractionManager on iOS to wait for animations to complete
      if (Platform.OS === 'ios') {
        InteractionManager.runAfterInteractions(() => {
          setTimeout(() => button.onPress(), 100);
        });
      } else {
        setTimeout(() => button.onPress(), 50);
      }
    }
  }, [hideAlert]);

  const typeConfig = ALERT_TYPES[alertState.type] || ALERT_TYPES.info;
  const IconComponent = typeConfig.icon;

  return (
    <AlertContext.Provider value={showAlert}>
      {children}

      <Modal
        visible={alertState.visible}
        transparent
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <Pressable style={styles.overlay} onPress={hideAlert}>
          <Pressable style={styles.container} onPress={e => e.stopPropagation()}>
            <View style={[styles.content, { borderColor: typeConfig.borderColor }]}>
              {/* Close button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={hideAlert}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={COLORS.textMuted || '#718096'} />
              </TouchableOpacity>

              {/* Icon */}
              <View style={[styles.iconContainer, { backgroundColor: typeConfig.bgColor }]}>
                <IconComponent size={32} color={typeConfig.color} />
              </View>

              {/* Title */}
              {alertState.title ? (
                <Text style={[styles.title, { color: typeConfig.color }]}>
                  {alertState.title}
                </Text>
              ) : null}

              {/* Message */}
              {alertState.message ? (
                <Text style={styles.message}>{alertState.message}</Text>
              ) : null}

              {/* Buttons */}
              <View style={styles.buttons}>
                {alertState.buttons.map((button, index) => {
                  const isDestructive = button.style === 'destructive';
                  const isCancel = button.style === 'cancel';
                  const isPrimary = index === alertState.buttons.length - 1 && !isCancel && !isDestructive;

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        isPrimary && { backgroundColor: typeConfig.color },
                        isDestructive && styles.buttonDestructive,
                        isCancel && styles.buttonCancel,
                      ]}
                      onPress={() => handleButtonPress(button)}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          isPrimary && styles.buttonTextPrimary,
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
          </Pressable>
        </Pressable>
      </Modal>
    </AlertContext.Provider>
  );
};

/**
 * useAlert hook
 * Returns a function to show alerts
 * Usage: const alert = useAlert(); alert({ type: 'success', title: 'Done!', message: 'Task completed' });
 */
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    // Fallback to console warning if not wrapped in provider
    console.warn('[AlertProvider] useAlert must be used within AlertProvider');
    return (config) => {
      console.log('[Alert]', config.type, config.title, config.message);
    };
  }
  return context;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 340,
  },
  content: {
    backgroundColor: COLORS.glassBg || '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary || '#A0AEC0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  buttonDestructive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  buttonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary || '#A0AEC0',
  },
  buttonTextPrimary: {
    color: '#0A0F1C',
    fontWeight: '700',
  },
  buttonTextDestructive: {
    color: '#EF4444',
  },
  buttonTextCancel: {
    color: COLORS.textMuted || '#718096',
  },
});

export default AlertProvider;
