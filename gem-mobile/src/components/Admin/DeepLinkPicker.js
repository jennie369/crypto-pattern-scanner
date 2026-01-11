/**
 * GEM Mobile - DeepLink Picker Component
 * Reusable modal for selecting deep links / screens in admin interfaces
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import {
  X,
  Search,
  Check,
} from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';

// Danh sách các DeepLink có sẵn trong app
export const DEEPLINK_OPTIONS = [
  // Main Tabs
  {
    category: 'Tabs chính',
    items: [
      { label: 'Trang chủ', value: 'Home', description: 'Tab Home' },
      { label: 'Scanner', value: 'Scanner', description: 'Tab Scanner' },
      { label: 'Shop', value: 'Shop', description: 'Tab Shop' },
      { label: 'Cộng đồng', value: 'Forum', description: 'Tab Forum' },
      { label: 'Tài khoản', value: 'Account', description: 'Tab Account' },
    ],
  },
  // Account Stack
  {
    category: 'Tài khoản',
    items: [
      { label: 'Portfolio', value: 'Portfolio', description: 'Quản lý portfolio' },
      { label: 'VisionBoard', value: 'VisionBoard', description: 'Bảng mục tiêu' },
      { label: 'VisionBoard - Goals', value: 'gem://VisionBoard?tab=goals', description: 'Tab mục tiêu' },
      { label: 'VisionBoard - Affirmation', value: 'gem://VisionBoard?tab=affirmation', description: 'Tab khẳng định' },
      { label: 'VisionBoard - I Ching', value: 'gem://VisionBoard?tab=iching', description: 'Tab Kinh Dịch' },
      { label: 'VisionBoard - Tarot', value: 'gem://VisionBoard?tab=tarot', description: 'Tab Tarot' },
      { label: 'Cài đặt', value: 'Settings', description: 'Cài đặt app' },
      { label: 'Thông báo', value: 'Notifications', description: 'Danh sách thông báo' },
    ],
  },
  // Monetization
  {
    category: 'Kiếm tiền',
    items: [
      { label: 'Affiliate Program', value: 'AffiliateProgram', description: 'Chương trình affiliate' },
      { label: 'Affiliate Dashboard', value: 'AffiliateDashboard', description: 'Bảng điều khiển affiliate' },
      { label: 'Ví Gem', value: 'Wallet', description: 'Ví tiền Gem' },
      { label: 'Mua Gem', value: 'BuyGems', description: 'Mua Gem coins' },
      { label: 'Rút tiền', value: 'Withdraw', description: 'Rút tiền' },
      { label: 'Lịch sử giao dịch', value: 'TransactionHistory', description: 'Lịch sử' },
    ],
  },
  // Courses
  {
    category: 'Khóa học',
    items: [
      { label: 'Danh sách khóa học', value: 'Courses', description: 'Tất cả khóa học' },
      { label: 'Khóa học của tôi', value: 'MyCourses', description: 'Khóa học đã đăng ký' },
    ],
  },
  // Shop
  {
    category: 'Shop',
    items: [
      { label: 'Shop - Tất cả', value: 'gem://Shop', description: 'Trang shop chính' },
      { label: 'Danh sách sản phẩm', value: 'ProductList', description: 'Tất cả sản phẩm' },
      { label: 'Flash Sale', value: 'ProductList?collection=flash-sale', description: 'Sản phẩm Flash Sale' },
      { label: 'Đá Quý', value: 'ProductList?collection=crystals', description: 'Bộ sưu tập Đá Quý' },
      { label: 'Khóa Học', value: 'ProductList?collection=courses', description: 'Khóa học' },
      { label: 'Gói VIP', value: 'ProductList?collection=vip', description: 'Gói VIP' },
      { label: 'Giỏ hàng', value: 'Cart', description: 'Giỏ hàng' },
      { label: 'Đơn hàng', value: 'Orders', description: 'Lịch sử đơn hàng' },
      { label: 'Quà tặng', value: 'GiftCatalog', description: 'Danh mục quà tặng' },
    ],
  },
  // Gem Master
  {
    category: 'Gem Master',
    items: [
      { label: 'Tarot', value: 'Tarot', description: 'Bói bài Tarot' },
      { label: 'I Ching', value: 'IChing', description: 'Quẻ Kinh Dịch' },
      { label: 'Vision Board', value: 'VisionBoard', description: 'Bảng tầm nhìn' },
    ],
  },
  // Help & Support
  {
    category: 'Hỗ trợ',
    items: [
      { label: 'Trợ giúp', value: 'Help', description: 'Trung tâm trợ giúp' },
      { label: 'FAQ', value: 'FAQ', description: 'Câu hỏi thường gặp' },
      { label: 'Liên hệ', value: 'Contact', description: 'Liên hệ hỗ trợ' },
    ],
  },
  // Upgrade
  {
    category: 'Khác',
    items: [
      { label: 'Nâng cấp VIP', value: 'Upgrade', description: 'Nâng cấp tài khoản' },
      { label: 'Marketing Kits', value: 'MarketingKits', description: 'Bộ công cụ marketing' },
    ],
  },
];

/**
 * DeepLinkPicker - Modal component for selecting deep links
 * @param {boolean} visible - Whether modal is visible
 * @param {function} onClose - Called when modal closes
 * @param {function} onSelect - Called with selected value
 * @param {string} selectedValue - Currently selected value
 * @param {string} title - Modal title (default: "Chọn màn hình")
 */
export default function DeepLinkPicker({
  visible,
  onClose,
  onSelect,
  selectedValue = '',
  title = 'Chọn màn hình',
}) {
  const [search, setSearch] = useState('');
  const [customValue, setCustomValue] = useState('');

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return DEEPLINK_OPTIONS;

    const searchLower = search.toLowerCase();
    return DEEPLINK_OPTIONS.map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchLower) ||
          item.value.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      ),
    })).filter((category) => category.items.length > 0);
  }, [search]);

  const handleSelect = (value) => {
    onSelect(value);
    onClose();
    setSearch('');
  };

  const handleCustomDone = () => {
    if (customValue.trim()) {
      onSelect(customValue.trim());
    }
    onClose();
    setSearch('');
    setCustomValue('');
  };

  const handleClose = () => {
    onClose();
    setSearch('');
    setCustomValue('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Search size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm kiếm..."
              placeholderTextColor={COLORS.textMuted}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <X size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Options List */}
          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {filteredOptions.map((category) => (
              <View key={category.category} style={styles.category}>
                <Text style={styles.categoryTitle}>{category.category}</Text>
                {category.items.map((item) => {
                  const isSelected = selectedValue === item.value;
                  return (
                    <Pressable
                      key={item.value}
                      style={({ pressed }) => [
                        styles.item,
                        isSelected && styles.itemSelected,
                        pressed && { opacity: 0.7 },
                      ]}
                      onPress={() => handleSelect(item.value)}
                    >
                      <View style={styles.itemContent}>
                        <Text
                          style={[
                            styles.itemLabel,
                            isSelected && styles.itemLabelSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                        <Text style={styles.itemDescription}>
                          {item.description}
                        </Text>
                        <Text style={styles.itemValue}>{item.value}</Text>
                      </View>
                      {isSelected && <Check size={20} color={COLORS.gold} />}
                    </Pressable>
                  );
                })}
              </View>
            ))}

            {/* Empty state */}
            {filteredOptions.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Không tìm thấy kết quả phù hợp
                </Text>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Custom Input Section */}
          <View style={styles.customSection}>
            <Text style={styles.customLabel}>Hoặc nhập thủ công:</Text>
            <View style={styles.customRow}>
              <TextInput
                style={styles.customInput}
                value={customValue || selectedValue}
                onChangeText={setCustomValue}
                placeholder="gem://ScreenName?param=value"
                placeholderTextColor={COLORS.textMuted}
              />
              <TouchableOpacity
                style={styles.customDoneButton}
                onPress={handleCustomDone}
              >
                <Text style={styles.customDoneText}>Xong</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 12,
    marginLeft: 10,
  },
  list: {
    paddingHorizontal: SPACING.lg,
  },
  category: {
    marginBottom: SPACING.md,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  itemSelected: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  itemLabelSelected: {
    color: COLORS.gold,
  },
  itemDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  itemValue: {
    fontSize: 11,
    color: COLORS.purple,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  customSection: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  customLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  customRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  customInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  customDoneButton: {
    backgroundColor: COLORS.burgundy,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  customDoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
