/**
 * ConnectBinanceScreen - Connect Binance API for Shadow Mode
 * IMPORTANT: Only READ-ONLY API keys accepted
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Key,
  Lock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  ExternalLink,
  Info,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../utils/tokens';
import binanceApiService from '../../services/binanceApiService';
import alertService from '../../services/alertService';

const STEPS = [
  {
    number: 1,
    title: 'Đăng nhập Binance',
    desc: 'Truy cập binance.com và đăng nhập tài khoản',
  },
  {
    number: 2,
    title: 'Tạo API Key',
    desc: 'Vào API Management > Create API',
  },
  {
    number: 3,
    title: 'Chọn Read Only',
    desc: 'BẮT BUỘC: Chỉ tick "Enable Reading"',
  },
  {
    number: 4,
    title: 'Copy API Key & Secret',
    desc: 'Dán vào form bên dưới',
  },
];

const ConnectBinanceScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // Form state
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle connect
  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setError('Vui lòng nhập API Key');
      return;
    }
    if (!apiSecret.trim()) {
      setError('Vui lòng nhập API Secret');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await binanceApiService.addConnection(
        user?.id,
        apiKey.trim(),
        apiSecret.trim()
      );

      if (result.success) {
        alertService.success(
          'Kết nối thành công',
          'API Binance đã được kết nối. Dữ liệu sẽ được đồng bộ tự động.'
        );
        navigation.goBack();
      }
    } catch (err) {
      console.error('[ConnectBinance] Error:', err);
      setError(err.message || 'Không thể kết nối. Vui lòng kiểm tra API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#0F1030', '#1A1B4B', '#0F1030']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={COLORS.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kết nối Binance</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Security Banner */}
          <View style={styles.securityBanner}>
            <Shield size={24} color={COLORS.success} strokeWidth={2} />
            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>An toàn & Bảo mật</Text>
              <Text style={styles.securityDesc}>
                Chỉ chấp nhận API READ-ONLY. Không thể thực hiện giao dịch, rút tiền hay thay đổi tài khoản.
              </Text>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Hướng dẫn tạo API Key</Text>
            {STEPS.map((step) => (
              <View key={step.number} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.number}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}

            {/* Warning */}
            <View style={styles.warningBox}>
              <AlertTriangle size={16} color={COLORS.warning} strokeWidth={2} />
              <Text style={styles.warningText}>
                QUAN TRỌNG: KHÔNG bật "Enable Trading" hoặc "Enable Withdrawals"
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            {/* API Key Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>API Key</Text>
              <View style={styles.inputWrapper}>
                <Key size={18} color={COLORS.textMuted} strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="Nhập API Key"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* API Secret Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>API Secret</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={COLORS.textMuted} strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  value={apiSecret}
                  onChangeText={setApiSecret}
                  placeholder="Nhập API Secret"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={!showSecret}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? (
                    <EyeOff size={18} color={COLORS.textMuted} strokeWidth={2} />
                  ) : (
                    <Eye size={18} color={COLORS.textMuted} strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {error && (
              <View style={styles.errorBox}>
                <AlertTriangle size={16} color={COLORS.error} strokeWidth={2} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Connect Button */}
            <TouchableOpacity
              style={[styles.connectBtn, loading && styles.connectBtnDisabled]}
              onPress={handleConnect}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? ['#666', '#555'] : [COLORS.purple, COLORS.cyan]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.connectBtnGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.textPrimary} />
                ) : (
                  <>
                    <CheckCircle size={20} color={COLORS.textPrimary} strokeWidth={2} />
                    <Text style={styles.connectBtnText}>Kết nối</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Info Note */}
          <View style={styles.infoNote}>
            <Info size={16} color={COLORS.textMuted} strokeWidth={2} />
            <Text style={styles.infoText}>
              API Key được mã hóa và lưu trữ an toàn. Bạn có thể ngắt kết nối bất cứ lúc nào.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1030',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },

  // Security Banner
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: 'rgba(58, 247, 166, 0.1)',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(58, 247, 166, 0.3)',
    marginBottom: SPACING.xl,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    color: COLORS.success,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  securityDesc: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },

  // Instructions
  instructionsCard: {
    backgroundColor: 'rgba(15, 16, 48, 0.8)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionsTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  stepDesc: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.md,
  },
  warningText: {
    color: COLORS.warning,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    flex: 1,
  },

  // Form
  formCard: {
    backgroundColor: 'rgba(15, 16, 48, 0.8)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    paddingVertical: SPACING.md,
    marginLeft: SPACING.sm,
  },
  eyeBtn: {
    padding: SPACING.xs,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },
  connectBtn: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  connectBtnDisabled: {
    opacity: 0.7,
  },
  connectBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  connectBtnText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },

  // Info Note
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  infoText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    flex: 1,
    lineHeight: 18,
  },
});

export default ConnectBinanceScreen;
