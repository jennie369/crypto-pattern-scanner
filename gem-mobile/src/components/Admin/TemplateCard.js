/**
 * Gemral - Template Card Component
 * Card hien thi template push/post
 * @description Card component cho template library
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  Bell,
  FileText,
  Star,
  TrendingUp,
  BarChart2,
  Clock,
  Edit3,
  Trash2,
  Copy,
  ChevronRight,
} from 'lucide-react-native';

import { useSettings } from '../../contexts/SettingsContext';

// Category icons
const CATEGORY_ICONS = {
  spiritual: Star,
  trading: TrendingUp,
  promo: Bell,
  engagement: BarChart2,
  education: FileText,
  reminder: Clock,
  default: FileText,
};

// Category labels (Vietnamese)
const CATEGORY_LABELS = {
  spiritual: 'Tam linh',
  trading: 'Trading',
  promo: 'Khuyen mai',
  engagement: 'Tuong tac',
  education: 'Giao duc',
  reminder: 'Nhac nho',
  default: 'Khac',
};

// ========== MAIN COMPONENT ==========
const TemplateCard = ({
  template,
  type = 'push', // 'push' or 'post'
  onUse,
  onEdit,
  onDelete,
  onDuplicate,
  showActions = true,
  showStats = true,
  compact = false,
  style,
}) => {
  const { colors, glass, settings, SPACING, TYPOGRAPHY } = useSettings();

  const {
    id,
    name,
    description,
    category = 'default',
    title_template,
    body_template,
    content_template,
    usage_count = 0,
    avg_open_rate = 0,
    avg_click_rate = 0,
    is_active = true,
    is_system = false,
  } = template || {};

  const CategoryIcon = CATEGORY_ICONS[category] || CATEGORY_ICONS.default;
  const categoryLabel = CATEGORY_LABELS[category] || CATEGORY_LABELS.default;

  // Preview content
  const previewContent = type === 'push'
    ? body_template || title_template
    : content_template?.substring(0, 100) || description;

  // Format stats
  const formatRate = (rate) => {
    const num = parseFloat(rate) || 0;
    return num > 0 ? `${num.toFixed(1)}%` : '-';
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: glass.borderRadius,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.06)',
      padding: SPACING.lg,
      overflow: 'hidden',
    },
    containerInactive: {
      opacity: 0.6,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.sm,
    },
    categoryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xxs,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xxs,
      borderRadius: SPACING.xs,
      backgroundColor: 'rgba(255,189,89,0.1)',
    },
    categoryText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.gold,
    },
    name: {
      fontSize: TYPOGRAPHY.fontSize.xxxl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: SPACING.xxs,
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textMuted,
      lineHeight: 18,
      marginBottom: SPACING.md,
    },
    previewBox: {
      backgroundColor: 'rgba(0,0,0,0.15)',
      borderRadius: SPACING.sm,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.04)',
    },
    previewLabel: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textMuted,
      marginBottom: SPACING.xxs,
      textTransform: 'uppercase',
      letterSpacing: TYPOGRAPHY.letterSpacing.wider,
    },
    previewText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.06)',
      marginBottom: SPACING.md,
    },
    statsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xxs,
    },
    statsValue: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    statsLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
    },
    systemBadge: {
      position: 'absolute',
      top: SPACING.sm,
      right: SPACING.sm,
      backgroundColor: colors.info,
      paddingHorizontal: SPACING.xs,
      paddingVertical: 2,
      borderRadius: 4,
    },
    systemText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
    },
    inactiveBadge: {
      position: 'absolute',
      top: SPACING.sm,
      right: SPACING.sm,
      backgroundColor: colors.error,
      paddingHorizontal: SPACING.xs,
      paddingVertical: 2,
      borderRadius: 4,
    },
    inactiveText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.06)',
      paddingTop: SPACING.md,
    },
    useButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      backgroundColor: colors.gold,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderRadius: SPACING.sm,
    },
    useButtonText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.bgDarkest,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    actionButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: SPACING.sm,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
    },

    // Compact styles
    compactContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: SPACING.md,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.06)',
      padding: SPACING.md,
      gap: SPACING.md,
    },
    compactIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,189,89,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255,189,89,0.15)',
    },
    compactContent: {
      flex: 1,
    },
    compactName: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    compactPreview: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textMuted,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // ========== STATS ITEM ==========
  const StatsItem = ({ icon: Icon, value, label, color = colors.textMuted }) => (
    <View style={styles.statsItem}>
      <Icon size={14} color={color} />
      <Text style={[styles.statsValue, { color }]}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </View>
  );

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={() => onUse?.(template)}
        activeOpacity={0.7}
      >
        <View style={styles.compactIcon}>
          <CategoryIcon size={18} color={colors.gold} />
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.compactPreview} numberOfLines={1}>
            {previewContent}
          </Text>
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, !is_active && styles.containerInactive, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <CategoryIcon size={14} color={colors.gold} />
          <Text style={styles.categoryText}>
            {categoryLabel}
          </Text>
        </View>

        {type === 'push' ? (
          <Bell size={16} color={colors.gold} />
        ) : (
          <FileText size={16} color={colors.gold} />
        )}
      </View>

      {/* Name & Description */}
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      {description && (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      )}

      {/* Preview */}
      {previewContent && (
        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Xem truoc:</Text>
          <Text style={styles.previewText} numberOfLines={3}>
            {previewContent}
          </Text>
        </View>
      )}

      {/* Stats */}
      {showStats && (
        <View style={styles.statsRow}>
          <StatsItem
            icon={BarChart2}
            value={usage_count}
            label="lan dung"
            color={colors.gold}
          />
          <StatsItem
            icon={TrendingUp}
            value={formatRate(avg_open_rate)}
            label="open rate"
            color={colors.gold}
          />
          {type === 'push' && (
            <StatsItem
              icon={Star}
              value={formatRate(avg_click_rate)}
              label="click rate"
              color={colors.gold}
            />
          )}
        </View>
      )}

      {/* System badge */}
      {is_system && (
        <View style={styles.systemBadge}>
          <Text style={styles.systemText}>Mac dinh</Text>
        </View>
      )}

      {/* Inactive overlay */}
      {!is_active && (
        <View style={styles.inactiveBadge}>
          <Text style={styles.inactiveText}>Tat</Text>
        </View>
      )}

      {/* Actions */}
      {showActions && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.useButton}
            onPress={() => onUse?.(template)}
          >
            <Copy size={16} color={colors.bgDarkest} />
            <Text style={styles.useButtonText}>Su dung</Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            {!is_system && onEdit && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEdit?.(template)}
              >
                <Edit3 size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}

            {onDuplicate && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onDuplicate?.(template)}
              >
                <Copy size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}

            {!is_system && onDelete && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onDelete?.(template)}
              >
                <Trash2 size={18} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default TemplateCard;
