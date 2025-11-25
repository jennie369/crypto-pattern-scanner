/**
 * GEM Platform - AuthGate Component
 * Wrap interactive elements to require authentication
 *
 * Usage:
 * <AuthGate action="thích bài viết">
 *   <TouchableOpacity onPress={handleLike}>
 *     <Heart />
 *   </TouchableOpacity>
 * </AuthGate>
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LogIn, UserPlus, X } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../utils/tokens';

/**
 * AuthGate - Wrap interactive elements to require authentication
 *
 * @param {ReactNode} children - The element to wrap (must have onPress prop)
 * @param {string} action - Description of the action (e.g., "thích bài viết này")
 * @param {Function} onAuthRequired - Optional callback when auth is required
 */
const AuthGate = ({
  children,
  action = 'thực hiện hành động này',
  onAuthRequired,
}) => {
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);

  // If authenticated, render children normally
  if (isAuthenticated) {
    return children;
  }

  // Intercept onPress when not authenticated
  const handlePress = () => {
    if (onAuthRequired) {
      onAuthRequired();
    }
    setShowModal(true);
  };

  // Clone children and intercept onPress
  const childWithInterceptedPress = React.cloneElement(
    React.Children.only(children),
    {
      onPress: handlePress,
    }
  );

  return (
    <>
      {childWithInterceptedPress}

      {/* Login Required Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <LogIn size={48} color={COLORS.gold} />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>
              Đăng Nhập Cần Thiết
            </Text>

            {/* Message */}
            <Text style={styles.modalText}>
              Bạn cần đăng nhập để {action}
            </Text>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, styles.loginButton]}
              onPress={() => {
                setShowModal(false);
                navigation.navigate('Auth', { screen: 'Login' });
              }}
            >
              <LogIn size={20} color="#FFFFFF" />
              <Text style={styles.loginButtonText}>Đăng Nhập</Text>
            </TouchableOpacity>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.button, styles.signupButton]}
              onPress={() => {
                setShowModal(false);
                navigation.navigate('Auth', { screen: 'SignUp' });
              }}
            >
              <UserPlus size={20} color={COLORS.gold} />
              <Text style={styles.signupButtonText}>Tạo Tài Khoản Mới</Text>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelText}>Để sau</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxl,
  },

  modalContent: {
    width: '100%',
    backgroundColor: COLORS.bgMid,
    borderRadius: 24,
    padding: SPACING.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },

  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.xs,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },

  modalTitle: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  modalText: {
    fontFamily: 'System',
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxxl,
    lineHeight: 22,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
    gap: 10,
  },

  loginButton: {
    backgroundColor: COLORS.burgundy,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },

  loginButtonText: {
    fontFamily: 'System',
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
  },

  signupButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },

  signupButtonText: {
    fontFamily: 'System',
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },

  cancelButton: {
    paddingVertical: SPACING.md,
  },

  cancelText: {
    fontFamily: 'System',
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
});

export default AuthGate;
