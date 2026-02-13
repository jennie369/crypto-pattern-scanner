/**
 * GEM Mobile - Terms & Privacy Screen
 * Tab view with Terms of Service and Privacy Policy
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  FileText,
  Shield,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, GLASS } from '../../utils/tokens';

const TABS = [
  { key: 'terms', label: 'Điều Khoản', icon: FileText },
  { key: 'privacy', label: 'Chính Sách', icon: Shield },
];

const TERMS_CONTENT = {
  lastUpdated: '25/11/2025',
  sections: [
    {
      title: '1. Giới Thiệu',
      content: `Chào mừng bạn đến với GEM - nền tảng phân tích kỹ thuật và giao dịch tiền điện tử. Bằng việc sử dụng ứng dụng này, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây.

GEM cung cấp các công cụ phân tích kỹ thuật, phát hiện mô hình giá, và tính năng giao dịch giả lập (Paper Trading) để hỗ trợ người dùng trong việc nghiên cứu thị trường.`,
    },
    {
      title: '2. Tài Khoản Người Dùng',
      content: `• Bạn phải từ 18 tuổi trở lên để sử dụng dịch vụ.
• Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình.
• Mỗi người chỉ được phép sở hữu một tài khoản.
• GEM có quyền khóa tài khoản vi phạm quy định mà không cần thông báo trước.`,
    },
    {
      title: '3. Dịch Vụ & Tính Năng',
      content: `GEM cung cấp các dịch vụ sau:

Pattern Scanner: Công cụ AI phát hiện mô hình giá tự động.

Paper Trading: Giao dịch giả lập với tiền ảo, không có rủi ro tài chính thực.

Portfolio Tracking: Theo dõi danh mục đầu tư cá nhân.

Affiliate Program: Chương trình giới thiệu người dùng để nhận hoa hồng.

Các tính năng có thể được cập nhật hoặc thay đổi mà không cần thông báo trước.`,
    },
    {
      title: '4. Gói Dịch Vụ & Thanh Toán',
      content: `• GEM cung cấp nhiều gói dịch vụ với các tính năng khác nhau.
• Thanh toán được xử lý qua các cổng thanh toán được ủy quyền.
• Tất cả các giao dịch đã thanh toán không được hoàn tiền trừ trường hợp đặc biệt.
• Giá dịch vụ có thể thay đổi, nhưng sẽ không ảnh hưởng đến các gói đã mua.`,
    },
    {
      title: '5. Giới Hạn Trách Nhiệm',
      content: `QUAN TRỌNG: GEM KHÔNG phải là cố vấn tài chính.

• Mọi thông tin, phân tích, và tín hiệu trên GEM chỉ mang tính chất tham khảo.
• Chúng tôi KHÔNG chịu trách nhiệm về bất kỳ quyết định đầu tư nào của bạn.
• Giao dịch tiền điện tử có rủi ro cao, bạn có thể mất toàn bộ vốn đầu tư.
• Hãy luôn tự nghiên cứu (DYOR) trước khi đưa ra quyết định.`,
    },
    {
      title: '6. Hành Vi Bị Cấm',
      content: `Người dùng không được:

• Sử dụng dịch vụ cho mục đích bất hợp pháp.
• Cố gắng truy cập trái phép vào hệ thống.
• Spam, lừa đảo, hoặc quấy rối người dùng khác.
• Sao chép, phân phối lại nội dung mà không có sự cho phép.
• Sử dụng bot hoặc công cụ tự động để can thiệp hệ thống.`,
    },
    {
      title: '7. Chấm Dứt Dịch Vụ',
      content: `GEM có quyền chấm dứt hoặc tạm ngừng tài khoản của bạn nếu:

• Bạn vi phạm các điều khoản sử dụng.
• Có hoạt động đáng ngờ hoặc gian lận.
• Theo yêu cầu của cơ quan pháp luật.

Bạn cũng có thể tự xóa tài khoản bất cứ lúc nào trong phần Cài đặt.`,
    },
    {
      title: '8. Liên Hệ',
      content: `Nếu có câu hỏi về Điều khoản Sử dụng, vui lòng liên hệ:

Email: support@gemral.com
Telegram: @GemralSupport
Hotline: 1900 123 456`,
    },
  ],
};

const PRIVACY_CONTENT = {
  lastUpdated: '25/11/2025',
  sections: [
    {
      title: '1. Thông Tin Thu Thập',
      content: `GEM thu thập các loại thông tin sau:

Thông tin cá nhân:
• Email và mật khẩu đăng ký
• Họ tên, số điện thoại (tùy chọn)
• Ảnh đại diện (tùy chọn)

Thông tin sử dụng:
• Lịch sử giao dịch Paper Trade
• Danh mục đầu tư
• Cài đặt ứng dụng

Thông tin kỹ thuật:
• Loại thiết bị, phiên bản hệ điều hành
• Địa chỉ IP, thời gian truy cập`,
    },
    {
      title: '2. Mục Đích Sử Dụng',
      content: `Chúng tôi sử dụng thông tin để:

• Cung cấp và cải thiện dịch vụ
• Xác thực người dùng và bảo mật tài khoản
• Gửi thông báo quan trọng về dịch vụ
• Phân tích và cải thiện trải nghiệm người dùng
• Hỗ trợ khách hàng khi cần thiết
• Tuân thủ các yêu cầu pháp lý`,
    },
    {
      title: '3. Bảo Mật Dữ Liệu',
      content: `GEM cam kết bảo vệ dữ liệu của bạn:

• Sử dụng mã hóa SSL/TLS cho mọi kết nối
• Mật khẩu được băm (hash) và không lưu dạng văn bản
• Dữ liệu được lưu trữ trên máy chủ bảo mật
• Giới hạn quyền truy cập dữ liệu nội bộ
• Thực hiện kiểm tra bảo mật định kỳ`,
    },
    {
      title: '4. Chia Sẻ Thông Tin',
      content: `GEM KHÔNG bán hoặc cho thuê thông tin cá nhân của bạn.

Chúng tôi chỉ chia sẻ thông tin trong các trường hợp:

• Khi bạn đồng ý rõ ràng
• Với đối tác cung cấp dịch vụ (thanh toán, hosting)
• Khi pháp luật yêu cầu
• Để bảo vệ quyền lợi hợp pháp của GEM`,
    },
    {
      title: '5. Cookie & Tracking',
      content: `Ứng dụng di động GEM sử dụng:

• Local Storage để lưu cài đặt và phiên đăng nhập
• Analytics để phân tích hành vi sử dụng (ẩn danh)
• Push notification tokens để gửi thông báo

Bạn có thể kiểm soát thông báo trong phần Cài đặt.`,
    },
    {
      title: '6. Quyền Của Người Dùng',
      content: `Bạn có quyền:

• Truy cập và xem thông tin cá nhân của mình
• Yêu cầu chỉnh sửa thông tin không chính xác
• Yêu cầu xóa tài khoản và dữ liệu
• Từ chối nhận email marketing
• Xuất dữ liệu cá nhân (data portability)

Để thực hiện các quyền này, vui lòng liên hệ support@gemral.com`,
    },
    {
      title: '7. Lưu Trữ Dữ Liệu',
      content: `• Dữ liệu tài khoản được lưu trong suốt thời gian sử dụng dịch vụ.
• Sau khi xóa tài khoản, dữ liệu sẽ được xóa trong vòng 30 ngày.
• Một số dữ liệu có thể được giữ lại theo yêu cầu pháp lý.
• Lịch sử giao dịch Paper Trade được lưu tối đa 2 năm.`,
    },
    {
      title: '8. Trẻ Em',
      content: `GEM không dành cho người dưới 18 tuổi. Chúng tôi không cố ý thu thập thông tin từ trẻ em. Nếu phát hiện tài khoản của người dưới 18 tuổi, chúng tôi sẽ xóa tài khoản đó.`,
    },
    {
      title: '9. Thay Đổi Chính Sách',
      content: `Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian. Khi có thay đổi quan trọng, chúng tôi sẽ:

• Thông báo qua email hoặc push notification
• Hiển thị thông báo trong ứng dụng
• Cập nhật ngày "Cập nhật lần cuối"

Việc tiếp tục sử dụng dịch vụ sau khi thay đổi đồng nghĩa với việc bạn chấp nhận chính sách mới.`,
    },
    {
      title: '10. Liên Hệ',
      content: `Nếu có câu hỏi về Chính sách Bảo mật, vui lòng liên hệ:

Email: privacy@gemral.com
Telegram: @GemralSupport

Chúng tôi sẽ phản hồi trong vòng 48 giờ làm việc.`,
    },
  ],
};

export default function TermsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('terms');

  const content = activeTab === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT;

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Điều Khoản & Chính Sách</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Icon
                  size={18}
                  color={isActive ? COLORS.gold : COLORS.textMuted}
                />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Last Updated */}
          <View style={styles.lastUpdatedContainer}>
            <Text style={styles.lastUpdatedText}>
              Cập nhật lần cuối: {content.lastUpdated}
            </Text>
          </View>

          {/* Content Sections */}
          {content.sections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionContent}>{section.content}</Text>
            </View>
          ))}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Bằng việc sử dụng GEM, bạn đồng ý với{' '}
              {activeTab === 'terms' ? 'các Điều khoản' : 'Chính sách Bảo mật'} này.
            </Text>
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

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.gold,
  },

  // Last Updated
  lastUpdatedContainer: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: COLORS.gold,
  },

  // Sections
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  sectionContent: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // Footer
  footer: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
