/**
 * GEM Mobile - Alert Card Component
 * Phase 3C: Individual alert card for display in alert panel
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Star,
  Target,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Layers,
  Award,
  Clock,
  X,
  ChevronRight,
  Zap,
  Bell,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../utils/tokens';
import { ALERT_TYPES, getAlertConfig } from '../../constants/alertConfig';

/**
 * Icon mapping for alert types
 */
const ICON_MAP = {
  Star,
  Target,
  CheckCircle,
  Check: CheckCircle,
  AlertTriangle,
  DollarSign,
  Layers,
  Award,
  Zap,
  Bell,
};

/**
 * Format relative time
 */
const formatTime = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ trước`;
  return date.toLocaleDateString('vi-VN');
};

/**
 * Main AlertCard component
 */
const AlertCard = memo(({
  alert,
  onPress,
  onDismiss,
  showActions = true,
  compact = false,
}) => {
  if (!alert) return null;

  const config = getAlertConfig(alert.type);
  const IconComponent = ICON_MAP[config.icon] || Bell;

  // Compact mode for list display
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { borderLeftColor: config.color }]}
        onPress={() => onPress?.(alert)}
        activeOpacity={0.7}
      >
        <IconComponent size={16} color={config.color} />
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {alert.title || alert.titleVi}
          </Text>
          <Text style={styles.compactTime}>
            {formatTime(alert.created_at || alert.createdAt)}
          </Text>
        </View>
        {alert.actionRequired && (
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>Action</Text>
          </View>
        )}
        <ChevronRight size={16} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  }

  // Full card mode
  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: config.color }]}
      onPress={() => onPress?.(alert)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
          <IconComponent size={20} color={config.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {alert.title || alert.titleVi}
          </Text>
          <View style={styles.metaRow}>
            <Clock size={12} color={COLORS.textMuted} />
            <Text style={styles.time}>
              {formatTime(alert.created_at || alert.createdAt)}
            </Text>
          </View>
        </View>
        {showActions && onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => onDismiss(alert)}
          >
            <X size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Message */}
      <Text style={styles.message}>{alert.message}</Text>

      {/* Action Required indicator */}
      {alert.actionRequired && (
        <View style={[styles.actionContainer, { backgroundColor: config.color + '10' }]}>
          <Text style={[styles.actionLabel, { color: config.color }]}>
            {alert.suggestedAction === 'BUY' ? 'SUGGEST: BUY' :
             alert.suggestedAction === 'SELL' ? 'SUGGEST: SELL' :
             alert.suggestedAction === 'CANCEL_ORDERS' ? 'CANCEL ORDERS' :
             'Action Required'}
          </Text>
          <ChevronRight size={16} color={config.color} />
        </View>
      )}

      {/* Zone Info */}
      {alert.zone && (
        <View style={styles.zoneInfo}>
          <View style={[
            styles.zoneTypeBadge,
            { backgroundColor: alert.zone.zoneType === 'LFZ' ? COLORS.success + '20' : COLORS.error + '20' }
          ]}>
            <Text style={[
              styles.zoneTypeText,
              { color: alert.zone.zoneType === 'LFZ' ? COLORS.success : COLORS.error }
            ]}>
              {alert.zone.zoneType}
            </Text>
          </View>
          <Text style={styles.zonePrice}>
            Entry: {alert.zone.entryPrice?.toFixed(4)}
          </Text>
          <Text style={styles.zonePrice}>
            Stop: {alert.zone.stopPrice?.toFixed(4)}
          </Text>
        </View>
      )}

      {/* Additional info for specific alert types */}
      {alert.type === 'confirmation' && alert.patterns && (
        <View style={styles.patternInfo}>
          <Text style={styles.patternLabel}>Patterns:</Text>
          <Text style={styles.patternValue}>
            {alert.patterns.map(p => p.pattern?.nameVi || p.patternId).join(', ')}
          </Text>
        </View>
      )}

      {alert.type === 'pin_engulf_combo' && alert.combo && (
        <View style={styles.comboInfo}>
          <Zap size={14} color={COLORS.gold} />
          <Text style={styles.comboText}>
            {alert.combo.comboTypeVi} - {alert.combo.reliability}% reliability
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

/**
 * Alert list item for history view
 */
export const AlertListItem = memo(({ alert, onPress, isRead = false }) => {
  const config = getAlertConfig(alert.alert_type || alert.type);
  const IconComponent = ICON_MAP[config.icon] || Bell;

  return (
    <TouchableOpacity
      style={[
        styles.listItem,
        { borderLeftColor: config.color },
        !isRead && styles.listItemUnread,
      ]}
      onPress={() => onPress?.(alert)}
      activeOpacity={0.7}
    >
      <View style={[styles.listIconContainer, { backgroundColor: config.color + '20' }]}>
        <IconComponent size={18} color={config.color} />
      </View>
      <View style={styles.listContent}>
        <Text style={[styles.listTitle, !isRead && styles.listTitleUnread]} numberOfLines={1}>
          {alert.title}
        </Text>
        <Text style={styles.listMessage} numberOfLines={2}>
          {alert.message}
        </Text>
        <Text style={styles.listTime}>
          {formatTime(alert.created_at)}
        </Text>
      </View>
      {!isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
});

/**
 * Alert type badge
 */
export const AlertTypeBadge = memo(({ type, size = 'md' }) => {
  const config = getAlertConfig(type);
  const IconComponent = ICON_MAP[config.icon] || Bell;

  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
  const fontSize = size === 'sm' ? 10 : size === 'lg' ? 13 : 11;

  return (
    <View style={[styles.typeBadge, { backgroundColor: config.color + '20' }]}>
      <IconComponent size={iconSize} color={config.color} />
      <Text style={[styles.typeBadgeText, { color: config.color, fontSize }]}>
        {config.nameVi}
      </Text>
    </View>
  );
});

/**
 * Alert priority indicator
 */
export const AlertPriorityIndicator = memo(({ priority }) => {
  const colors = {
    1: COLORS.gold,    // Highest
    2: COLORS.warning, // High
    3: COLORS.primary, // Medium
    4: COLORS.textSecondary, // Low
  };

  const labels = {
    1: 'Cao nhất',
    2: 'Cao',
    3: 'Trung bình',
    4: 'Thấp',
  };

  const color = colors[priority] || COLORS.textMuted;
  const label = labels[priority] || 'Không xác định';

  return (
    <View style={[styles.priorityIndicator, { backgroundColor: color + '20' }]}>
      <View style={[styles.priorityDot, { backgroundColor: color }]} />
      <Text style={[styles.priorityText, { color }]}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  // Main container
  container: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
  },

  // Compact mode
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.sm,
    borderLeftWidth: 3,
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  compactTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  dismissButton: {
    padding: SPACING.xs,
  },

  // Message
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    lineHeight: 20,
  },

  // Action
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  actionBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
  },

  // Zone info
  zoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  zoneTypeBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  zoneTypeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  zonePrice: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },

  // Pattern info
  patternInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  patternLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  patternValue: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },

  // Combo info
  comboInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.gold + '10',
    borderRadius: BORDER_RADIUS.sm,
  },
  comboText: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: '500',
  },

  // List item
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  listItemUnread: {
    backgroundColor: COLORS.bgDarkest,
  },
  listIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  listTitleUnread: {
    fontWeight: '700',
  },
  listMessage: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  listTime: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },

  // Type badge
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  typeBadgeText: {
    fontWeight: '600',
  },

  // Priority indicator
  priorityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

AlertCard.displayName = 'AlertCard';
AlertListItem.displayName = 'AlertListItem';
AlertTypeBadge.displayName = 'AlertTypeBadge';
AlertPriorityIndicator.displayName = 'AlertPriorityIndicator';

export default AlertCard;
