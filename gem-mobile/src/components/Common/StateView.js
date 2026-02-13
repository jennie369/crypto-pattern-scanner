/**
 * StateView - Reusable Error/Empty State Component
 * C9 FIX: Provides consistent error and empty state UI across all screens
 *
 * Usage:
 *   <StateView type="error" message={error} onRetry={loadData} />
 *   <StateView type="empty" title="Chua co du lieu" />
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, RefreshCw, Inbox, WifiOff, Search } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const STATE_CONFIGS = {
  error: {
    Icon: AlertTriangle,
    iconColor: COLORS.error || '#EF4444',
    iconBg: 'rgba(239, 68, 68, 0.12)',
    defaultTitle: 'Không thể tải dữ liệu',
    defaultMessage: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
    defaultAction: 'Thử lại',
  },
  empty: {
    Icon: Inbox,
    iconColor: COLORS.textMuted,
    iconBg: 'rgba(106, 91, 255, 0.1)',
    defaultTitle: 'Chưa có dữ liệu',
    defaultMessage: 'Dữ liệu sẽ xuất hiện khi có hoạt động.',
    defaultAction: null,
  },
  offline: {
    Icon: WifiOff,
    iconColor: COLORS.warning || '#F59E0B',
    iconBg: 'rgba(245, 158, 11, 0.12)',
    defaultTitle: 'Mất kết nối',
    defaultMessage: 'Vui lòng kiểm tra kết nối mạng và thử lại.',
    defaultAction: 'Thử lại',
  },
  noResults: {
    Icon: Search,
    iconColor: COLORS.textMuted,
    iconBg: 'rgba(106, 91, 255, 0.1)',
    defaultTitle: 'Không tìm thấy kết quả',
    defaultMessage: 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.',
    defaultAction: null,
  },
};

const StateView = ({
  type = 'error',
  icon: CustomIcon,
  title,
  message,
  actionLabel,
  onRetry,
  compact = false,
  style,
}) => {
  const config = STATE_CONFIGS[type] || STATE_CONFIGS.error;
  const Icon = CustomIcon || config.Icon;
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;
  const displayAction = actionLabel || config.defaultAction;

  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      <View style={[
        styles.iconContainer,
        compact && styles.iconContainerCompact,
        { backgroundColor: config.iconBg },
      ]}>
        <Icon
          size={compact ? 28 : 40}
          color={config.iconColor}
        />
      </View>

      <Text style={[styles.title, compact && styles.titleCompact]}>
        {displayTitle}
      </Text>

      <Text style={[styles.message, compact && styles.messageCompact]}>
        {displayMessage}
      </Text>

      {displayAction && onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, compact && styles.retryButtonCompact]}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <RefreshCw size={compact ? 14 : 16} color="#FFFFFF" />
          <Text style={styles.retryText}>{displayAction}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl || 32,
    paddingHorizontal: SPACING.lg,
  },
  containerCompact: {
    flex: 0,
    paddingVertical: SPACING.xl || 24,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  iconContainerCompact: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY?.fontSize?.lg || 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  titleCompact: {
    fontSize: TYPOGRAPHY?.fontSize?.md || 15,
  },
  message: {
    fontSize: TYPOGRAPHY?.fontSize?.md || 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: SPACING.md,
  },
  messageCompact: {
    fontSize: TYPOGRAPHY?.fontSize?.sm || 12,
    maxWidth: 240,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  retryButtonCompact: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default StateView;
