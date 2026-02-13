/**
 * GEM Mobile - Help & Support Screen
 * FAQ, contact options, and support resources
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  BookOpen,
  ChevronRight,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, GLASS } from '../../utils/tokens';

const FAQS = [
  {
    question: 'Làm sao để nâng cấp tài khoản?',
    answer: 'Bạn có thể nâng cấp tài khoản bằng cách vào Shop và mua gói tier phù hợp. Sau khi thanh toán thành công, tier của bạn sẽ được tự động nâng cấp.',
  },
  {
    question: 'Pattern Scanner hoạt động như thế nào?',
    answer: 'Pattern Scanner sử dụng AI để phân tích biểu đồ và phát hiện các mô hình giá phổ biến như Head & Shoulders, Double Top/Bottom, Triangle... Khi phát hiện pattern, hệ thống sẽ gửi thông báo cho bạn.',
  },
  {
    question: 'Paper Trade là gì?',
    answer: 'Paper Trade là tính năng giao dịch giả lập, cho phép bạn thực hành trading với tiền ảo mà không có rủi ro mất tiền thật. Đây là cách tốt để học và kiểm tra chiến lược.',
  },
  {
    question: 'Làm sao để rút hoa hồng affiliate?',
    answer: 'Khi số dư hoa hồng đạt tối thiểu 500,000 VND, bạn có thể yêu cầu rút tiền trong mục Affiliate Dashboard. Tiền sẽ được chuyển vào tài khoản ngân hàng trong 3-5 ngày làm việc.',
  },
  {
    question: 'Tôi quên mật khẩu, phải làm sao?',
    answer: 'Bạn có thể đặt lại mật khẩu bằng cách nhấn "Quên mật khẩu" ở màn hình đăng nhập. Một email hướng dẫn sẽ được gửi đến địa chỉ email đã đăng ký.',
  },
  {
    question: 'Dữ liệu có được bảo mật không?',
    answer: 'GEM sử dụng mã hóa end-to-end và tuân thủ các tiêu chuẩn bảo mật cao nhất. Dữ liệu cá nhân của bạn được bảo vệ và không bao giờ chia sẻ với bên thứ ba.',
  },
];

export default function HelpSupportScreen({ navigation }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleFaq = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContactTelegram = () => {
    Linking.openURL('https://t.me/GemralSupport');
  };

  const handleContactEmail = () => {
    Linking.openURL('mailto:support@gemral.com?subject=Hỗ trợ Gemral');
  };

  const handleContactHotline = () => {
    Linking.openURL('tel:1900123456');
  };

  const handleOpenDocs = () => {
    Linking.openURL('https://docs.gemral.com');
  };

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trợ Giúp & Hỗ Trợ</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Contact Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Liên Hệ Hỗ Trợ</Text>

            <View style={styles.contactGrid}>
              <TouchableOpacity style={styles.contactCard} onPress={handleContactTelegram}>
                <View style={[styles.contactIcon, { backgroundColor: 'rgba(0, 136, 204, 0.2)' }]}>
                  <MessageCircle size={24} color="#0088CC" />
                </View>
                <Text style={styles.contactLabel}>Telegram</Text>
                <Text style={styles.contactHint}>Phản hồi nhanh</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactCard} onPress={handleContactEmail}>
                <View style={[styles.contactIcon, { backgroundColor: 'rgba(234, 67, 53, 0.2)' }]}>
                  <Mail size={24} color="#EA4335" />
                </View>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactHint}>support@gemral.com</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactCard} onPress={handleContactHotline}>
                <View style={[styles.contactIcon, { backgroundColor: 'rgba(58, 247, 166, 0.2)' }]}>
                  <Phone size={24} color={COLORS.success} />
                </View>
                <Text style={styles.contactLabel}>Hotline</Text>
                <Text style={styles.contactHint}>1900 123 456</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactCard} onPress={handleOpenDocs}>
                <View style={[styles.contactIcon, { backgroundColor: 'rgba(106, 91, 255, 0.2)' }]}>
                  <FileText size={24} color={COLORS.purple} />
                </View>
                <Text style={styles.contactLabel}>Tài liệu</Text>
                <Text style={styles.contactHint}>docs.gemral.com</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Help Center Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trung Tâm Trợ Giúp</Text>
            <TouchableOpacity
              style={styles.helpCenterCard}
              onPress={() => navigation.navigate('HelpCenter')}
              activeOpacity={0.7}
            >
              <View style={styles.helpCenterContent}>
                <View style={styles.helpCenterIcon}>
                  <BookOpen size={28} color={COLORS.gold} />
                </View>
                <View style={styles.helpCenterText}>
                  <Text style={styles.helpCenterTitle}>Khám phá hướng dẫn</Text>
                  <Text style={styles.helpCenterDesc}>
                    Gems, Thu Nhập, Boost, Affiliate, Dashboard và nhiều hơn nữa
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Câu Hỏi Thường Gặp</Text>

            {FAQS.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={styles.faqItem}
                onPress={() => toggleFaq(index)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <HelpCircle size={18} color={COLORS.gold} />
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  {expandedIndex === index ? (
                    <ChevronUp size={18} color={COLORS.textMuted} />
                  ) : (
                    <ChevronDown size={18} color={COLORS.textMuted} />
                  )}
                </View>
                {expandedIndex === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* App Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông Tin Ứng Dụng</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phiên bản</Text>
                <Text style={styles.infoValue}>1.0.0</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Build</Text>
                <Text style={styles.infoValue}>2025.11.25</Text>
              </View>
            </View>
          </View>

          {/* Quick Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Liên Kết Nhanh</Text>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => Linking.openURL('https://gemral.com/community')}
            >
              <ExternalLink size={18} color={COLORS.textMuted} />
              <Text style={styles.linkText}>Cộng đồng Gemral</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => Linking.openURL('https://gemral.com/blog')}
            >
              <ExternalLink size={18} color={COLORS.textMuted} />
              <Text style={styles.linkText}>Blog & Tin tức</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => Linking.openURL('https://gemral.com/tutorials')}
            >
              <ExternalLink size={18} color={COLORS.textMuted} />
              <Text style={styles.linkText}>Video hướng dẫn</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },

  // Section
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
    marginBottom: SPACING.md,
    marginLeft: 4,
  },

  // Contact Grid
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  contactCard: {
    width: '48%',
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  contactHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // FAQ
  faqItem: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  faqAnswer: {
    padding: SPACING.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  faqAnswerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Info Card
  infoCard: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },

  // Links
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.15)',
  },
  linkText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  // Help Center Card
  helpCenterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  helpCenterContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  helpCenterIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpCenterText: {
    flex: 1,
  },
  helpCenterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  helpCenterDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
});
