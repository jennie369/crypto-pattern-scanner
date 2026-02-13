/**
 * =====================================================
 * APIConnectionScreen
 * =====================================================
 *
 * Kết nối API sàn giao dịch (TIER 2+):
 * - Tier access check
 * - Exchange selection
 * - API Key & Secret inputs
 * - Permission warnings
 * - Test connection button
 * - Save & success feedback
 *
 * Access: TIER 2+
 *
 * =====================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  ExternalLink,
  Info,
  Lock,
  Trash2,
  RefreshCw,
} from 'lucide-react-native';

// Theme
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../theme';

// Components
import { BalanceWidget } from '../../components/Exchange';

// Services
import {
  connectExchangeAPI,
  disconnectExchangeAPI,
  getExchangeBalance,
  testExchangeAPI,
  validateAPIKeys,
  checkTierAccess,
} from '../../services/exchangeAPIService';
import { exchangeAffiliateService } from '../../services/exchangeAffiliateService';

// Constants
import {
  getExchangeConfig,
  EXCHANGE_TOOLTIPS,
} from '../../constants/exchangeConfig';

// Context
import { useAuth } from '../../contexts/AuthContext';

/**
 * Tier Upgrade Prompt Component
 */
const TierUpgradePrompt = ({ onUpgrade }) => (
  <View style={styles.upgradeContainer}>
    <Lock size={48} color={COLORS.textMuted} />
    <Text style={styles.upgradeTitle}>Yêu cầu TIER 2</Text>
    <Text style={styles.upgradeDescription}>
      Kết nối API sàn giao dịch yêu cầu TIER 2 trở lên.
      Nâng cấp để xem số dư và lịch sử giao dịch trực tiếp trên GEM.
    </Text>
    <TouchableOpacity
      style={styles.upgradeButton}
      onPress={onUpgrade}
      activeOpacity={0.8}
    >
      <Text style={styles.upgradeButtonText}>Nâng cấp ngay</Text>
    </TouchableOpacity>
  </View>
);

/**
 * API Guide Modal Content
 */
const APIGuideSection = ({ exchange }) => {
  const guides = {
    binance: {
      url: 'https://www.binance.com/en/my/settings/api-management',
      steps: [
        'Đăng nhập Binance → Account → API Management',
        'Bấm "Create API" → Chọn "System generated"',
        'Đặt tên API (vd: GEM App)',
        'Xác nhận 2FA',
        'QUAN TRỌNG: CHỈ tick "Enable Reading" và "Enable Spot & Margin Trading"',
        'KHÔNG tick "Enable Withdrawals"!',
        'Copy API Key và Secret Key',
      ],
    },
    okx: {
      url: 'https://www.okx.com/account/my-api',
      steps: [
        'Đăng nhập OKX → Account → API',
        'Bấm "Create API key"',
        'Chọn permissions: Read + Trade',
        'Tạo passphrase (6-32 ký tự)',
        'Xác nhận 2FA',
        'Lưu API Key, Secret Key và Passphrase',
      ],
    },
    bybit: {
      url: 'https://www.bybit.com/app/user/api-management',
      steps: [
        'Đăng nhập Bybit → Account → API',
        'Bấm "Create New Key"',
        'Chọn "System-generated API Keys"',
        'Permissions: Read-Only + Contract Trading',
        'Xác nhận email/2FA',
        'Lưu API Key và Secret Key',
      ],
    },
    nami: {
      url: 'https://nami.exchange/user/api-keys',
      steps: [
        'Đăng nhập Nami → Cài đặt → API',
        'Tạo API key mới',
        'Chọn quyền: Đọc + Giao dịch',
        'Xác nhận OTP',
        'Lưu API Key và Secret Key',
      ],
    },
  };

  const guide = guides[exchange] || guides.binance;

  return (
    <View style={styles.guideSection}>
      <Text style={styles.guideSectionTitle}>Hướng dẫn tạo API Key</Text>
      {guide.steps.map((step, index) => (
        <View key={index} style={styles.guideStep}>
          <Text style={styles.guideStepNumber}>{index + 1}</Text>
          <Text style={styles.guideStepText}>{step}</Text>
        </View>
      ))}
      <TouchableOpacity
        style={styles.guideLink}
        onPress={() => Linking.openURL(guide.url)}
      >
        <ExternalLink size={14} color={COLORS.primary} />
        <Text style={styles.guideLinkText}>Mở trang API Management</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Main APIConnectionScreen
 */
const APIConnectionScreen = ({ navigation, route }) => {
  const { profile } = useAuth();
  const { exchangeId, mode = 'connect' } = route.params || {};

  const [exchange, setExchange] = useState(exchangeId || 'binance');
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [passphrase, setPassphrase] = useState(''); // OKX only
  const [showSecret, setShowSecret] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState(null);
  const [balanceSyncedAt, setBalanceSyncedAt] = useState(null);
  const [errors, setErrors] = useState({});

  const userTier = profile?.scanner_tier || 0;
  const canConnect = checkTierAccess(userTier);
  const exchangeConfig = getExchangeConfig(exchange);
  const needsPassphrase = exchange === 'okx';

  // Load existing connection
  useEffect(() => {
    if (mode === 'view' && exchangeId) {
      loadExistingConnection();
    }
  }, [mode, exchangeId]);

  const loadExistingConnection = async () => {
    try {
      const accounts = await exchangeAffiliateService.getUserExchangeAccounts();
      const account = accounts.find(a => a.exchange === exchangeId);
      if (account?.api_key_encrypted) {
        setConnected(true);
        // Load balance
        const balanceResult = await getExchangeBalance(exchangeId);
        if (balanceResult.success) {
          setBalance(balanceResult.balance);
          setBalanceSyncedAt(balanceResult.syncedAt);
        }
      }
    } catch (error) {
      console.error('[APIConnection] Error loading:', error);
    }
  };

  // Validate inputs
  const validateInputs = useCallback(() => {
    const newErrors = {};
    const validation = validateAPIKeys(exchange, apiKey, secretKey, passphrase);

    if (!validation.valid) {
      validation.errors.forEach(err => {
        if (err.includes('API Key')) newErrors.apiKey = err;
        else if (err.includes('Secret')) newErrors.secretKey = err;
        else if (err.includes('Passphrase')) newErrors.passphrase = err;
      });
    }

    setErrors(newErrors);
    return validation.valid;
  }, [exchange, apiKey, secretKey, passphrase]);

  // Test connection
  const handleTestConnection = async () => {
    if (!validateInputs()) return;

    setTesting(true);
    setTestResult(null);

    try {
      const result = await testExchangeAPI(exchange, apiKey, secretKey, passphrase);
      setTestResult(result);

      if (result.securityWarning) {
        Alert.alert(
          'Cảnh báo bảo mật!',
          result.error,
          [{ text: 'Đã hiểu', style: 'cancel' }]
        );
      }
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setTesting(false);
    }
  };

  // Connect API
  const handleConnect = async () => {
    if (!testResult?.success) {
      Alert.alert('Lỗi', 'Vui lòng test kết nối trước khi lưu');
      return;
    }

    setLoading(true);

    try {
      const result = await connectExchangeAPI(
        exchange, apiKey, secretKey, passphrase, userTier
      );

      if (result.success) {
        setConnected(true);
        Alert.alert(
          'Thành công!',
          'API đã được kết nối. Bạn có thể xem số dư trên GEM.',
          [{ text: 'OK', onPress: () => loadExistingConnection() }]
        );
      } else {
        Alert.alert('Lỗi', result.error);
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Disconnect API
  const handleDisconnect = async () => {
    Alert.alert(
      'Ngắt kết nối API?',
      'API key sẽ bị xóa. Bạn sẽ không thể xem số dư trên GEM cho đến khi kết nối lại.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Ngắt kết nối',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await disconnectExchangeAPI(exchange);
              if (result.success) {
                setConnected(false);
                setBalance(null);
                setApiKey('');
                setSecretKey('');
                setPassphrase('');
                setTestResult(null);
              }
            } catch (error) {
              Alert.alert('Lỗi', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Refresh balance
  const handleRefreshBalance = async () => {
    const result = await getExchangeBalance(exchange, true);
    if (result.success) {
      setBalance(result.balance);
      setBalanceSyncedAt(result.syncedAt);
    }
  };

  // Tier check
  if (!canConnect) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kết nối API</Text>
          <View style={styles.headerRight} />
        </View>
        <TierUpgradePrompt onUpgrade={() => navigation.navigate('Upgrade')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {connected ? 'Quản lý API' : 'Kết nối API'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Exchange Info */}
        <View style={styles.exchangeInfo}>
          <View style={[
            styles.exchangeLogo,
            { backgroundColor: exchangeConfig?.bgColor || 'rgba(255,255,255,0.1)' }
          ]}>
            <Text style={[styles.exchangeLogoText, { color: exchangeConfig?.color }]}>
              {exchangeConfig?.displayName?.charAt(0) || 'E'}
            </Text>
          </View>
          <Text style={styles.exchangeName}>
            {exchangeConfig?.displayName || exchange}
          </Text>
        </View>

        {/* Connected State - Show Balance */}
        {connected && (
          <View style={styles.connectedSection}>
            <BalanceWidget
              exchangeId={exchange}
              balance={balance}
              syncedAt={balanceSyncedAt}
              connected={true}
              onRefresh={handleRefreshBalance}
              variant="detailed"
              onDisconnect={handleDisconnect}
            />
          </View>
        )}

        {/* Not Connected - Show Form */}
        {!connected && (
          <>
            {/* Security Warning */}
            <View style={styles.securityWarning}>
              <AlertTriangle size={20} color={COLORS.warning} />
              <View style={styles.securityContent}>
                <Text style={styles.securityTitle}>Bảo mật API</Text>
                <Text style={styles.securityText}>
                  • Chỉ tạo API với quyền READ và TRADE{'\n'}
                  • TUYỆT ĐỐI không cho quyền WITHDRAW{'\n'}
                  • GEM mã hóa API key trước khi lưu{'\n'}
                  • API chỉ dùng để xem số dư và lịch sử
                </Text>
              </View>
            </View>

            {/* API Guide */}
            <APIGuideSection exchange={exchange} />

            {/* Input Form */}
            <View style={styles.formSection}>
              {/* API Key */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>API Key</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.textInput, errors.apiKey && styles.textInputError]}
                    value={apiKey}
                    onChangeText={setApiKey}
                    placeholder="Nhập API Key"
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.apiKey && <Text style={styles.errorText}>{errors.apiKey}</Text>}
                <Text style={styles.inputHint}>
                  {EXCHANGE_TOOLTIPS.api.apiKey.replace('{{exchange}}', exchangeConfig?.displayName)}
                </Text>
              </View>

              {/* Secret Key */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Secret Key</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.textInput, styles.textInputWithIcon, errors.secretKey && styles.textInputError]}
                    value={secretKey}
                    onChangeText={setSecretKey}
                    placeholder="Nhập Secret Key"
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry={!showSecret}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? (
                      <EyeOff size={20} color={COLORS.textSecondary} />
                    ) : (
                      <Eye size={20} color={COLORS.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.secretKey && <Text style={styles.errorText}>{errors.secretKey}</Text>}
                <Text style={styles.inputHint}>{EXCHANGE_TOOLTIPS.api.secretKey}</Text>
              </View>

              {/* Passphrase (OKX only) */}
              {needsPassphrase && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Passphrase</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[styles.textInput, styles.textInputWithIcon, errors.passphrase && styles.textInputError]}
                      value={passphrase}
                      onChangeText={setPassphrase}
                      placeholder="Nhập Passphrase"
                      placeholderTextColor={COLORS.textMuted}
                      secureTextEntry={!showPassphrase}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassphrase(!showPassphrase)}
                    >
                      {showPassphrase ? (
                        <EyeOff size={20} color={COLORS.textSecondary} />
                      ) : (
                        <Eye size={20} color={COLORS.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.passphrase && <Text style={styles.errorText}>{errors.passphrase}</Text>}
                  <Text style={styles.inputHint}>Passphrase bạn tạo khi tạo API key trên OKX</Text>
                </View>
              )}

              {/* Test Result */}
              {testResult && (
                <View style={[
                  styles.testResult,
                  testResult.success ? styles.testResultSuccess : styles.testResultError
                ]}>
                  {testResult.success ? (
                    <>
                      <Check size={20} color={COLORS.success} />
                      <Text style={styles.testResultText}>
                        Kết nối thành công! Permissions: {testResult.permissions?.enableReading ? 'Read' : ''} {testResult.permissions?.enableSpotAndMarginTrading ? '+ Trade' : ''}
                      </Text>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={20} color="#EF4444" />
                      <Text style={[styles.testResultText, { color: '#EF4444' }]}>
                        {testResult.error}
                      </Text>
                    </>
                  )}
                </View>
              )}

              {/* Test Button */}
              <TouchableOpacity
                style={[styles.testButton, testing && styles.buttonDisabled]}
                onPress={handleTestConnection}
                disabled={testing || !apiKey || !secretKey}
                activeOpacity={0.8}
              >
                {testing ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <>
                    <RefreshCw size={18} color={COLORS.primary} />
                    <Text style={styles.testButtonText}>Test kết nối</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Save Button */}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!testResult?.success || loading) && styles.buttonDisabled
                ]}
                onPress={handleConnect}
                disabled={!testResult?.success || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.textPrimary} />
                ) : (
                  <>
                    <Shield size={18} color={COLORS.textPrimary} />
                    <Text style={styles.saveButtonText}>Lưu và kết nối</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  // Upgrade prompt
  upgradeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  upgradeTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  upgradeDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  upgradeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
  },
  upgradeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  // Exchange info
  exchangeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  exchangeLogo: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  exchangeLogoText: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  exchangeName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  connectedSection: {
    marginBottom: SPACING.lg,
  },
  // Security warning
  securityWarning: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  securityContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  securityTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.warning,
    marginBottom: 4,
  },
  securityText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  // Guide section
  guideSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  guideSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  guideStep: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  guideStepNumber: {
    width: 20,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
  },
  guideStepText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  guideLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: 4,
  },
  guideLinkText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
  },
  // Form
  formSection: {
    gap: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    position: 'relative',
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textInputWithIcon: {
    paddingRight: 50,
  },
  textInputError: {
    borderColor: '#EF4444',
  },
  eyeButton: {
    position: 'absolute',
    right: SPACING.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  inputHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#EF4444',
    marginTop: 4,
  },
  // Test result
  testResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  testResultSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  testResultError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  testResultText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
  },
  // Buttons
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: SPACING.xs,
  },
  testButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.primary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default APIConnectionScreen;
