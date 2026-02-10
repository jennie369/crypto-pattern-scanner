/**
 * Gemral - Biometric Login Button
 * Nút đăng nhập bằng sinh trắc học (Face ID / Touch ID / Fingerprint)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Scan, Fingerprint, AlertCircle } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import biometricService from '../../services/biometricService';

/**
 * BiometricButton - Nút đăng nhập sinh trắc học
 *
 * @param {Function} onSuccess - Callback khi đăng nhập thành công
 * @param {Function} onError - Callback khi có lỗi
 * @param {Function} signInWithToken - Function để đăng nhập với refresh token
 * @param {boolean} disabled - Disable button
 */
const BiometricButton = ({
  onSuccess,
  onError,
  signInWithToken,
  disabled = false,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // ========== STATE ==========
  const [loading, setLoading] = useState(false);
  const [biometricInfo, setBiometricInfo] = useState({
    supported: false,
    enabled: false,
    typeName: 'Sinh trắc học',
  });
  const [error, setError] = useState(null);
  const [scaleAnim] = useState(new Animated.Value(1));

  // ========== EFFECTS ==========
  useEffect(() => {
    checkBiometricStatus();
  }, []);

  // ========== CHECK STATUS ==========
  const checkBiometricStatus = useCallback(async () => {
    try {
      const support = await biometricService.checkSupport();
      const enabled = await biometricService.isEnabled();
      const typeName = await biometricService.getTypeName();

      setBiometricInfo({
        supported: support.supported,
        enabled,
        typeName: typeName || support.typeName,
      });
    } catch (err) {
      console.error('[BiometricButton] checkStatus error:', err);
    }
  }, []);

  // ========== HANDLERS ==========
  const handlePress = useCallback(async () => {
    if (loading || disabled) return;

    setLoading(true);
    setError(null);

    // Animate button
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const result = await biometricService.loginWithBiometric(signInWithToken);

      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error);
        onError?.(result.error);
      }
    } catch (err) {
      const errorMsg = 'Đăng nhập thất bại';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [loading, disabled, signInWithToken, onSuccess, onError, scaleAnim]);

  // ========== STYLES ==========
  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: SPACING.lg,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.md,
      paddingVertical: 14,
      paddingHorizontal: SPACING.xxl,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: 'rgba(255, 189, 89, 0.3)',
    },
    buttonLoading: {
      opacity: 0.7,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonError: {
      borderColor: 'rgba(255, 107, 107, 0.3)',
    },
    buttonText: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.gold,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      marginTop: SPACING.sm,
    },
    errorText: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: colors.error,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING.xxl,
      marginBottom: SPACING.xs,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    dividerText: {
      marginHorizontal: SPACING.lg,
      fontSize: TYPOGRAPHY.fontSize.base,
      color: colors.textMuted,
    },
    setupHint: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      marginBottom: SPACING.lg,
    },
    setupHintText: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      lineHeight: 18,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // ========== RENDER ==========

  // Don't show if device doesn't support biometric
  // But DO show if supported even if not enabled (so user knows the feature exists)
  if (!biometricInfo.supported) {
    return null;
  }

  // If supported but not enabled, show setup prompt
  if (!biometricInfo.enabled) {
    return (
      <View style={styles.container}>
        <View style={styles.setupHint}>
          <Fingerprint size={20} color={colors.textMuted} />
          <Text style={styles.setupHintText}>
            Đăng nhập rồi bật {biometricInfo.typeName} trong Cài đặt để đăng nhập nhanh hơn
          </Text>
        </View>
      </View>
    );
  }

  // Get icon based on type
  const IconComponent = biometricInfo.typeName.includes('Face') ||
                        biometricInfo.typeName.includes('khuôn mặt')
    ? Scan
    : Fingerprint;

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.buttonLoading,
            disabled && styles.buttonDisabled,
            error && styles.buttonError,
          ]}
          onPress={handlePress}
          disabled={loading || disabled}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.gold} />
          ) : (
            <IconComponent size={24} color={colors.gold} />
          )}

          <Text style={styles.buttonText}>
            {loading
              ? 'Đang xác thực...'
              : `Đăng nhập bằng ${biometricInfo.typeName}`}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={14} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>hoặc</Text>
        <View style={styles.dividerLine} />
      </View>
    </View>
  );
};

export default BiometricButton;
