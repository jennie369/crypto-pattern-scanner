/**
 * Gemral - Link Order Screen (V3)
 * Liên kết đơn hàng thủ công theo số đơn hoặc email
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Link as LinkIcon,
  Mail,
  Hash,
  Info,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { linkOrderByNumber, linkEmailToAccount } from '../../services/orderService';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const LinkOrderScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  // ========== STATE ==========
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkType, setLinkType] = useState('order'); // 'order' or 'email'

  // ========== HANDLERS ==========
  const handleBack = () => navigation.goBack();

  const handleLinkOrder = async () => {
    if (!orderNumber.trim()) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập số đơn hàng' });
      return;
    }
    if (!email.trim()) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập email đặt hàng' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      alert({ type: 'error', title: 'Lỗi', message: 'Email không hợp lệ' });
      return;
    }

    setLoading(true);
    try {
      const result = await linkOrderByNumber(
        user.id,
        orderNumber.trim(),
        email.trim().toLowerCase()
      );

      if (result.success) {
        alert({
          type: 'success',
          title: 'Thành công',
          message: result.message,
          buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
        });
      } else {
        alert({ type: 'error', title: 'Lỗi', message: result.message });
      }
    } catch (error) {
      alert({ type: 'error', title: 'Lỗi', message: error.message || 'Không thể liên kết đơn hàng' });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkEmail = async () => {
    if (!email.trim()) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập email' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      alert({ type: 'error', title: 'Lỗi', message: 'Email không hợp lệ' });
      return;
    }

    setLoading(true);
    try {
      const result = await linkEmailToAccount(user.id, email.trim().toLowerCase());

      alert({
        type: 'success',
        title: 'Thành công',
        message: result.message,
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
      });
    } catch (error) {
      alert({ type: 'error', title: 'Lỗi', message: error.message || 'Không thể liên kết email' });
    } finally {
      setLoading(false);
    }
  };

  // ========== MAIN RENDER ==========
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liên kết đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, linkType === 'order' && styles.tabActive]}
              onPress={() => setLinkType('order')}
            >
              <Hash
                size={18}
                color={linkType === 'order' ? COLORS.bgDarkest : COLORS.textMuted}
              />
              <Text
                style={[styles.tabText, linkType === 'order' && styles.tabTextActive]}
              >
                Theo số đơn
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, linkType === 'email' && styles.tabActive]}
              onPress={() => setLinkType('email')}
            >
              <Mail
                size={18}
                color={linkType === 'email' ? COLORS.bgDarkest : COLORS.textMuted}
              />
              <Text
                style={[styles.tabText, linkType === 'email' && styles.tabTextActive]}
              >
                Theo email
              </Text>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Info size={20} color={COLORS.gold} />
            <Text style={styles.instructionText}>
              {linkType === 'order'
                ? 'Nhập số đơn hàng và email đã dùng khi đặt hàng để liên kết đơn hàng với tài khoản của bạn.'
                : 'Liên kết email để tự động hiển thị tất cả đơn hàng đã mua bằng email đó.'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {linkType === 'order' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Số đơn hàng <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Hash size={20} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={orderNumber}
                    onChangeText={setOrderNumber}
                    placeholder="VD: 1001"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="default"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <Text style={styles.inputHint}>
                  Tìm số đơn hàng trong email xác nhận từ Shopify
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email đặt hàng <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <Text style={styles.inputHint}>
                Email bạn đã dùng khi mua hàng trên Shopify
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={linkType === 'order' ? handleLinkOrder : handleLinkEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.bgDarkest} />
            ) : (
              <>
                <LinkIcon size={20} color={COLORS.bgDarkest} />
                <Text style={styles.submitText}>
                  {linkType === 'order' ? 'Liên kết đơn hàng' : 'Liên kết email'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Câu hỏi thường gặp</Text>

            <View style={styles.helpItem}>
              <Text style={styles.helpQuestion}>Tại sao cần liên kết đơn hàng?</Text>
              <Text style={styles.helpAnswer}>
                Khi bạn đặt hàng với email khác, đơn hàng sẽ không tự động hiển
                thị. Liên kết giúp bạn quản lý tất cả đơn hàng tại một nơi.
              </Text>
            </View>

            <View style={styles.helpItem}>
              <Text style={styles.helpQuestion}>Tìm số đơn hàng ở đâu?</Text>
              <Text style={styles.helpAnswer}>
                Kiểm tra email xác nhận đơn hàng từ Shopify. Số đơn hàng thường
                bắt đầu bằng # (ví dụ: #1001).
              </Text>
            </View>

            <View style={styles.helpItem}>
              <Text style={styles.helpQuestion}>
                Tại sao nên liên kết email?
              </Text>
              <Text style={styles.helpAnswer}>
                Liên kết email sẽ tự động hiển thị tất cả đơn hàng trong tương
                lai mua bằng email đó, không cần liên kết thủ công từng đơn.
              </Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      {AlertComponent}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.glassBg,
    borderRadius: 8,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: COLORS.gold,
  },
  tabText: {
    marginLeft: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.bgDarkest,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  instructions: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.glassBg,
    borderRadius: 8,
    marginBottom: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  instructionText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  form: {
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
  },
  inputHint: {
    marginTop: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },
  helpSection: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.glassBg,
    borderRadius: 8,
  },
  helpTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  helpItem: {
    marginBottom: SPACING.md,
  },
  helpQuestion: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gold,
    marginBottom: 4,
  },
  helpAnswer: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
});

export default LinkOrderScreen;
