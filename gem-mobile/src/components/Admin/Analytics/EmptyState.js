/**
 * EmptyState Component
 * Admin Analytics Dashboard - GEM Platform
 *
 * Empty state display with icon and action
 *
 * Created: January 30, 2026
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  BarChart2,
  FileX,
  Search,
  RefreshCw,
} from 'lucide-react-native';
import { COLORS, SPACING, GLASS } from '../../../utils/tokens';

const EMPTY_TYPES = {
  noData: {
    icon: BarChart2,
    title: 'Chưa có dữ liệu',
    message: 'Dữ liệu sẽ xuất hiện khi có hoạt động',
  },
  noResults: {
    icon: Search,
    title: 'Không tìm thấy kết quả',
    message: 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm',
  },
  error: {
    icon: FileX,
    title: 'Không thể tải dữ liệu',
    message: 'Đã có lỗi xảy ra. Vui lòng thử lại',
  },
};

const EmptyState = ({
  type = 'noData',
  icon: CustomIcon,
  title,
  message,
  actionLabel,
  onAction,
  compact = false,
  style,
}) => {
  const config = EMPTY_TYPES[type] || EMPTY_TYPES.noData;
  const Icon = CustomIcon || config.icon;
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      <View style={[styles.iconContainer, compact && styles.iconContainerCompact]}>
        <Icon
          size={compact ? 32 : 48}
          color={COLORS.textMuted}
        />
      </View>

      <Text style={[styles.title, compact && styles.titleCompact]}>
        {displayTitle}
      </Text>

      <Text style={[styles.message, compact && styles.messageCompact]}>
        {displayMessage}
      </Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, compact && styles.actionButtonCompact]}
          onPress={onAction}
          activeOpacity={0.7}
        >
          {type === 'error' && <RefreshCw size={14} color="#FFF" />}
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  containerCompact: {
    paddingVertical: SPACING.lg,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  iconContainerCompact: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: SPACING.md,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  titleCompact: {
    fontSize: 15,
  },

  message: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  messageCompact: {
    fontSize: 12,
    maxWidth: 220,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  actionButtonCompact: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default EmptyState;
