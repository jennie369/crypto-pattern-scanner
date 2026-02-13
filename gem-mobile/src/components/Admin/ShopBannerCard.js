/**
 * GEM Mobile - Shop Banner Card Component
 * Displays a single shop banner in admin list with actions
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  MousePointer2,
  Link,
  Calendar,
  AlertTriangle,
} from 'lucide-react-native';
import { COLORS, SPACING, GLASS } from '../../utils/tokens';

/**
 * Format large numbers with K suffix
 */
const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

/**
 * Check if banner is expired
 */
const isExpired = (endDate) => {
  if (!endDate) return false;
  return new Date(endDate) < new Date();
};

/**
 * Format link type to Vietnamese
 */
const getLinkTypeLabel = (linkType) => {
  switch (linkType) {
    case 'product':
      return 'Sản phẩm';
    case 'collection':
      return 'Bộ sưu tập';
    case 'screen':
      return 'Màn hình';
    case 'url':
      return 'URL';
    default:
      return 'Không có';
  }
};

/**
 * ShopBannerCard - Display single banner in admin list
 * @param {Object} banner - Banner data object
 * @param {function} onEdit - Called when edit button pressed
 * @param {function} onDelete - Called when delete button pressed
 * @param {function} onToggleActive - Called when toggle active button pressed
 */
export default function ShopBannerCard({
  banner,
  onEdit,
  onDelete,
  onToggleActive,
}) {
  const expired = isExpired(banner.end_date);
  const ctr = banner.view_count > 0
    ? ((banner.click_count || 0) / banner.view_count * 100).toFixed(1)
    : '0.0';

  return (
    <View style={styles.card}>
      {/* Banner Preview Image */}
      {banner.image_url ? (
        <Image
          source={{ uri: banner.image_url }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.bannerPreview,
            { backgroundColor: banner.background_color || '#1a0b2e' },
          ]}
        >
          <Text
            style={[
              styles.bannerPreviewTitle,
              { color: banner.text_color || '#FFFFFF' },
            ]}
            numberOfLines={1}
          >
            {banner.title || 'Chưa có tiêu đề'}
          </Text>
        </View>
      )}

      {/* Banner Info */}
      <View style={styles.info}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {banner.title || 'Chưa có tiêu đề'}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: banner.is_active
                  ? `${COLORS.success}20`
                  : `${COLORS.error}20`,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: banner.is_active ? COLORS.success : COLORS.error },
              ]}
            >
              {banner.is_active ? 'Hiển thị' : 'Ẩn'}
            </Text>
          </View>
        </View>

        {/* Subtitle */}
        {banner.subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {banner.subtitle}
          </Text>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Eye size={14} color={COLORS.textMuted} />
            <Text style={styles.statText}>{formatNumber(banner.view_count)}</Text>
          </View>
          <View style={styles.stat}>
            <MousePointer2 size={14} color={COLORS.textMuted} />
            <Text style={styles.statText}>{formatNumber(banner.click_count)}</Text>
          </View>
          <Text style={styles.ctr}>CTR: {ctr}%</Text>
        </View>

        {/* Link Info */}
        <View style={styles.linkRow}>
          <Link size={12} color={COLORS.textMuted} />
          <Text style={styles.linkText}>
            {getLinkTypeLabel(banner.link_type)}
            {banner.link_value ? `: ${banner.link_value}` : ''}
          </Text>
        </View>

        {/* Schedule Info */}
        {(banner.start_date || banner.end_date) && (
          <View style={styles.scheduleRow}>
            <Calendar size={12} color={COLORS.textMuted} />
            <Text style={styles.scheduleText}>
              {banner.start_date
                ? new Date(banner.start_date).toLocaleDateString('vi-VN')
                : 'Không giới hạn'}
              {' - '}
              {banner.end_date
                ? new Date(banner.end_date).toLocaleDateString('vi-VN')
                : 'Không giới hạn'}
            </Text>
            {expired && (
              <View style={styles.expiredBadge}>
                <AlertTriangle size={10} color={COLORS.warning} />
                <Text style={styles.expiredText}>Hết hạn</Text>
              </View>
            )}
          </View>
        )}

        {/* Display Order */}
        <Text style={styles.orderText}>
          Thứ tự: {banner.display_order ?? 0}
        </Text>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onToggleActive?.(banner)}
          >
            {banner.is_active ? (
              <EyeOff size={18} color={COLORS.textMuted} />
            ) : (
              <Eye size={18} color={COLORS.success} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit?.(banner)}
          >
            <Edit2 size={18} color={COLORS.purple} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete?.(banner)}
          >
            <Trash2 size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  bannerImage: {
    width: '100%',
    height: 100,
  },
  bannerPreview: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  bannerPreviewTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  info: {
    padding: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  ctr: {
    fontSize: 12,
    color: COLORS.purple,
    fontWeight: '600',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  linkText: {
    fontSize: 11,
    color: COLORS.textSubtle,
    flex: 1,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  scheduleText: {
    fontSize: 11,
    color: COLORS.textSubtle,
  },
  expiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.warning}20`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
    marginLeft: 8,
  },
  expiredText: {
    fontSize: 9,
    color: COLORS.warning,
    fontWeight: '600',
  },
  orderText: {
    fontSize: 10,
    color: COLORS.textSubtle,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: SPACING.sm,
  },
  actionButton: {
    padding: 8,
  },
});
