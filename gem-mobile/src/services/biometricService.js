/**
 * Gemral - Biometric Authentication Service
 * Xử lý Face ID / Touch ID / Fingerprint authentication
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Lazy load native modules to prevent crash on Expo Go
let LocalAuthentication = null;
let SecureStore = null;

try {
  LocalAuthentication = require('expo-local-authentication');
  SecureStore = require('expo-secure-store');
} catch (e) {
  console.warn('[BiometricService] Native modules not available (running in Expo Go?)');
}

// ============================================
// CONSTANTS
// ============================================
const STORAGE_KEYS = {
  BIOMETRIC_ENABLED: 'biometric_enabled',
  BIOMETRIC_TYPE: 'biometric_type',
  USER_EMAIL: 'biometric_user_email',
  USER_TOKEN: 'biometric_user_token',
};

// ============================================
// BIOMETRIC SERVICE
// ============================================
const biometricService = {
  /**
   * Check if device supports biometric authentication
   * @returns {Promise<{supported: boolean, types: number[], typeName: string, message: string}>}
   */
  async checkSupport() {
    try {
      // Check if native module is available
      if (!LocalAuthentication) {
        return {
          supported: false,
          types: [],
          typeName: 'none',
          message: 'Sinh trắc học không khả dụng trong môi trường này',
        };
      }

      // Check if hardware supports biometric
      const compatible = await LocalAuthentication.hasHardwareAsync();

      if (!compatible) {
        return {
          supported: false,
          types: [],
          typeName: 'none',
          message: 'Thiết bị không hỗ trợ sinh trắc học',
        };
      }

      // Check if biometric is enrolled
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!enrolled) {
        return {
          supported: false,
          types: [],
          typeName: 'none',
          message: 'Chưa thiết lập Face ID/Touch ID trên thiết bị',
        };
      }

      // Get supported types
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      // Determine type name for display
      let typeName = 'Sinh trắc học';
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        typeName = Platform.OS === 'ios' ? 'Face ID' : 'Nhận diện khuôn mặt';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        typeName = Platform.OS === 'ios' ? 'Touch ID' : 'Vân tay';
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        typeName = 'Quét mống mắt';
      }

      return {
        supported: true,
        types,
        typeName,
        message: `${typeName} khả dụng`,
      };
    } catch (error) {
      console.error('[BiometricService] checkSupport error:', error);
      return {
        supported: false,
        types: [],
        typeName: 'none',
        message: 'Lỗi kiểm tra sinh trắc học',
      };
    }
  },

  /**
   * Authenticate user with biometric
   * @param {string} promptMessage - Message to show in biometric prompt
   * @returns {Promise<{success: boolean, error?: string, errorType?: string}>}
   */
  async authenticate(promptMessage = 'Xác thực để đăng nhập') {
    try {
      if (!LocalAuthentication) {
        return { success: false, error: 'Sinh trắc học không khả dụng' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Huỷ',
        fallbackLabel: 'Dùng mật khẩu',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      }

      // Handle different error types
      let errorMessage = 'Xác thực thất bại';

      switch (result.error) {
        case 'user_cancel':
          errorMessage = 'Đã huỷ xác thực';
          break;
        case 'user_fallback':
          errorMessage = 'Chuyển sang mật khẩu';
          break;
        case 'system_cancel':
          errorMessage = 'Hệ thống đã huỷ';
          break;
        case 'not_enrolled':
          errorMessage = 'Chưa thiết lập sinh trắc học';
          break;
        case 'lockout':
          errorMessage = 'Quá nhiều lần thử, vui lòng đợi';
          break;
        case 'lockout_permanent':
          errorMessage = 'Bị khoá, vui lòng dùng mật khẩu thiết bị';
          break;
        default:
          errorMessage = result.error || 'Xác thực thất bại';
      }

      return { success: false, error: errorMessage, errorType: result.error };
    } catch (error) {
      console.error('[BiometricService] authenticate error:', error);
      return { success: false, error: 'Lỗi xác thực sinh trắc học' };
    }
  },

  /**
   * Check if biometric is enabled by user
   * @returns {Promise<boolean>}
   */
  async isEnabled() {
    try {
      const enabled = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('[BiometricService] isEnabled error:', error);
      return false;
    }
  },

  /**
   * Get stored biometric type name
   * @returns {Promise<string>}
   */
  async getTypeName() {
    try {
      const typeName = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_TYPE);
      return typeName || 'Sinh trắc học';
    } catch (error) {
      return 'Sinh trắc học';
    }
  },

  /**
   * Enable biometric and save credentials securely
   * @param {string} email - User email
   * @param {string} refreshToken - Supabase refresh token
   * @returns {Promise<{success: boolean, error?: string, typeName?: string}>}
   */
  async enable(email, refreshToken) {
    try {
      // First, verify biometric works
      const authResult = await this.authenticate('Xác nhận để bật đăng nhập nhanh');

      if (!authResult.success) {
        return authResult;
      }

      // Get biometric type name
      const support = await this.checkSupport();

      // Save credentials securely
      if (!SecureStore) {
        return { success: false, error: 'SecureStore không khả dụng' };
      }
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_EMAIL, email);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_TOKEN, refreshToken);

      // Save preferences
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_TYPE, support.typeName);

      return { success: true, typeName: support.typeName };
    } catch (error) {
      console.error('[BiometricService] enable error:', error);
      return { success: false, error: 'Không thể bật sinh trắc học' };
    }
  },

  /**
   * Auto-enable biometric silently without prompting (for auto-setup on login)
   * @param {string} email - User email
   * @param {string} refreshToken - Supabase refresh token
   * @param {string} typeName - Biometric type name
   * @returns {Promise<{success: boolean, error?: string, typeName?: string}>}
   */
  async autoEnable(email, refreshToken, typeName = 'Sinh trắc học') {
    try {
      // Save credentials securely without authentication prompt
      if (!SecureStore) {
        return { success: false, error: 'SecureStore không khả dụng' };
      }
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_EMAIL, email);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_TOKEN, refreshToken);

      // Save preferences
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_TYPE, typeName);

      console.log('[BiometricService] Auto-enabled for:', email);
      return { success: true, typeName };
    } catch (error) {
      console.error('[BiometricService] autoEnable error:', error);
      return { success: false, error: 'Không thể tự động bật sinh trắc học' };
    }
  },

  /**
   * Disable biometric and clear stored credentials
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async disable() {
    try {
      // Clear secure storage
      if (SecureStore) {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_EMAIL);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_TOKEN);
      }

      // Clear preferences
      await AsyncStorage.removeItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
      await AsyncStorage.removeItem(STORAGE_KEYS.BIOMETRIC_TYPE);

      return { success: true };
    } catch (error) {
      console.error('[BiometricService] disable error:', error);
      return { success: false, error: 'Không thể tắt sinh trắc học' };
    }
  },

  /**
   * Get stored credentials after biometric authentication
   * @returns {Promise<{email: string, token: string} | null>}
   */
  async getStoredCredentials() {
    try {
      if (!SecureStore) {
        return null;
      }
      const email = await SecureStore.getItemAsync(STORAGE_KEYS.USER_EMAIL);
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.USER_TOKEN);

      if (!email || !token) {
        return null;
      }

      return { email, token };
    } catch (error) {
      console.error('[BiometricService] getStoredCredentials error:', error);
      return null;
    }
  },

  /**
   * Update stored refresh token (call after token refresh)
   * @param {string} newToken - New refresh token
   */
  async updateToken(newToken) {
    try {
      if (!SecureStore) return;
      const enabled = await this.isEnabled();
      if (enabled && newToken) {
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_TOKEN, newToken);
        console.log('[BiometricService] Token updated successfully');
      }
    } catch (error) {
      console.error('[BiometricService] updateToken error:', error);
    }
  },

  /**
   * Full login flow with biometric
   * @param {Function} signInCallback - Function to call with refresh token
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async loginWithBiometric(signInCallback) {
    try {
      // Check if enabled
      const enabled = await this.isEnabled();
      if (!enabled) {
        return { success: false, error: 'Sinh trắc học chưa được bật' };
      }

      // Authenticate
      const authResult = await this.authenticate('Đăng nhập vào Gemral');
      if (!authResult.success) {
        return authResult;
      }

      // Get stored credentials
      const credentials = await this.getStoredCredentials();
      if (!credentials) {
        // Credentials not found, disable biometric
        await this.disable();
        return { success: false, error: 'Không tìm thấy thông tin đăng nhập' };
      }

      // Call sign in callback with refresh token
      if (signInCallback) {
        const result = await signInCallback(credentials.token);
        if (result?.error) {
          // Token might be expired, disable biometric
          await this.disable();
          return { success: false, error: 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại' };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('[BiometricService] loginWithBiometric error:', error);
      return { success: false, error: 'Đăng nhập thất bại' };
    }
  },
};

export default biometricService;
