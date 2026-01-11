/**
 * GEM Mobile - Why This Ad Modal Component
 * Facebook-style "Why am I seeing this?" transparency modal
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import {
  X,
  Target,
  Users,
  MapPin,
  Tag,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react-native';
import { COLORS, SPACING } from '../utils/tokens';

// Tier labels in Vietnamese
const TIER_LABELS = {
  FREE: 'Người dùng miễn phí',
  TIER1: 'Thành viên Tier 1',
  TIER2: 'Thành viên Tier 2',
  TIER3: 'Thành viên Tier 3',
  ADMIN: 'Quản trị viên',
};

// Advertiser tier labels
const ADVERTISER_TIER_LABELS = {
  OFFICIAL: 'Đối tác chính thức của Gemral',
  PARTNER: 'Đối tác được xác minh',
  AFFILIATE: 'Sản phẩm liên kết',
};

/**
 * WhyThisAdModal - Ad transparency modal
 * @param {boolean} visible - Whether the modal is visible
 * @param {function} onClose - Callback to close the modal
 * @param {object} ad - Ad/Banner data object
 * @param {string} userTier - Current user's tier
 */
export default function WhyThisAdModal({ visible, onClose, ad, userTier }) {
  const targetTiers = ad?.target_tiers || [];
  const targetScreens = ad?.target_screens || [];
  const advertiserName = ad?.advertiser_name || 'Nhà quảng cáo';
  const advertiserTier = ad?.advertiser_tier || 'PARTNER';
  const isVerified = ad?.advertiser_verified || false;

  const renderInfoItem = (icon, title, description) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoDescription}>{description}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tại sao tôi thấy quảng cáo này?</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Advertiser Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Về nhà quảng cáo</Text>
              {renderInfoItem(
                <ShieldCheck
                  size={20}
                  color={isVerified ? COLORS.success : COLORS.textMuted}
                />,
                advertiserName,
                isVerified
                  ? ADVERTISER_TIER_LABELS[advertiserTier] || 'Đối tác'
                  : 'Chưa được xác minh'
              )}
            </View>

            {/* Targeting Reasons */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lý do bạn thấy quảng cáo này</Text>

              {/* User Tier */}
              {targetTiers.length > 0 && (
                renderInfoItem(
                  <Users size={20} color={COLORS.gold} />,
                  'Cấp thành viên của bạn',
                  `Quảng cáo này nhắm đến ${targetTiers.map(t => TIER_LABELS[t] || t).join(', ')}`
                )
              )}

              {/* Target Screens */}
              {targetScreens.length > 0 && (
                renderInfoItem(
                  <Target size={20} color={COLORS.secondary} />,
                  'Vị trí hiển thị',
                  `Quảng cáo được đặt tại: ${targetScreens.join(', ')}`
                )
              )}

              {/* General Targeting */}
              {renderInfoItem(
                <Tag size={20} color={COLORS.accent} />,
                'Nhắm mục tiêu chung',
                'Dựa trên sở thích và hoạt động của bạn trong ứng dụng Gemral'
              )}
            </View>

            {/* Ad Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tùy chọn quảng cáo</Text>

              <TouchableOpacity style={styles.linkItem} activeOpacity={0.7}>
                <Text style={styles.linkText}>Quản lý tùy chọn quảng cáo</Text>
                <ExternalLink size={16} color={COLORS.gold} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.linkItem} activeOpacity={0.7}>
                <Text style={styles.linkText}>Tìm hiểu về quảng cáo trên Gemral</Text>
                <ExternalLink size={16} color={COLORS.gold} />
              </TouchableOpacity>
            </View>

            {/* Disclaimer */}
            <Text style={styles.disclaimer}>
              Gemral chọn quảng cáo dựa trên hoạt động của bạn trong ứng dụng.
              Chúng tôi không bán thông tin cá nhân của bạn cho nhà quảng cáo.
            </Text>
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.doneButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>Đã hiểu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1C1B23',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 34, // Safe area
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  infoDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  linkText: {
    fontSize: 15,
    color: COLORS.gold,
  },
  disclaimer: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
  },
  doneButton: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});
