/**
 * JournalEntryCard.js
 * Journal entry card display component for Calendar Smart Journal
 *
 * Created: January 28, 2026
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
  BookOpen,
  Heart,
  Target,
  FileText,
  Pin,
  Star,
  Calendar,
  Clock,
  ChevronRight,
  Image as ImageIcon,
  Mic,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, GLASS } from '../../theme';
import { ENTRY_TYPES, MOODS, LIFE_AREAS } from '../../services/calendarJournalService';
import { TagDisplay } from './TagInput';

// Entry type configurations
const ENTRY_TYPE_CONFIG = {
  [ENTRY_TYPES.REFLECTION]: {
    icon: BookOpen,
    color: COLORS.purple,
    label: 'Suy ngẫm',
  },
  [ENTRY_TYPES.GRATITUDE]: {
    icon: Heart,
    color: COLORS.error,
    label: 'Biết ơn',
  },
  [ENTRY_TYPES.GOAL_NOTE]: {
    icon: Target,
    color: COLORS.info,
    label: 'Ghi chú mục tiêu',
  },
  [ENTRY_TYPES.QUICK_NOTE]: {
    icon: FileText,
    color: COLORS.textSecondary,
    label: 'Ghi nhanh',
  },
};

/**
 * Format date to Vietnamese
 */
const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Format time
 */
const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * JournalEntryCard Component
 */
const JournalEntryCard = ({
  entry,
  onPress,
  onPinToggle,
  onFavoriteToggle,
  compact = false,
  showDate = false,
  showActions = true,
}) => {
  if (!entry) return null;

  const typeConfig = ENTRY_TYPE_CONFIG[entry.entry_type] || ENTRY_TYPE_CONFIG[ENTRY_TYPES.REFLECTION];
  const IconComponent = typeConfig.icon;
  const moodData = entry.mood ? MOODS[entry.mood.toUpperCase()] : null;
  const lifeAreaData = entry.life_area ? LIFE_AREAS.find((la) => la.id === entry.life_area) : null;

  // Check for attachments
  const hasImages = entry.attachments?.images?.length > 0;
  const hasVoice = entry.attachments?.voice?.length > 0;

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={() => onPress?.(entry)}
        activeOpacity={0.7}
      >
        {/* Type icon */}
        <View style={[styles.compactIcon, { backgroundColor: typeConfig.color + '20' }]}>
          <IconComponent size={14} color={typeConfig.color} />
        </View>

        {/* Content */}
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {entry.title || typeConfig.label}
          </Text>
          {entry.content && (
            <Text style={styles.compactPreview} numberOfLines={1}>
              {entry.content}
            </Text>
          )}
        </View>

        {/* Indicators */}
        <View style={styles.compactIndicators}>
          {entry.is_pinned && <Pin size={12} color={COLORS.gold} />}
          {entry.is_favorite && <Star size={12} color={COLORS.gold} fill={COLORS.gold} />}
        </View>

        <ChevronRight size={16} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(entry)}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '20' }]}>
            <IconComponent size={14} color={typeConfig.color} />
            <Text style={[styles.typeBadgeText, { color: typeConfig.color }]}>
              {typeConfig.label}
            </Text>
          </View>

          {lifeAreaData && (
            <View style={[styles.areaBadge, { backgroundColor: lifeAreaData.color + '20' }]}>
              <Text style={[styles.areaBadgeText, { color: lifeAreaData.color }]}>
                {lifeAreaData.label}
              </Text>
            )}
            </View>
          )}
        </View>

        {/* Actions */}
        {showActions && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => onPinToggle?.(entry)}
              style={styles.actionButton}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Pin
                size={16}
                color={entry.is_pinned ? COLORS.gold : COLORS.textMuted}
                fill={entry.is_pinned ? COLORS.gold : 'transparent'}
              />
            )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onFavoriteToggle?.(entry)}
              style={styles.actionButton}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Star
                size={16}
                color={entry.is_favorite ? COLORS.gold : COLORS.textMuted}
                fill={entry.is_favorite ? COLORS.gold : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Title */}
      {entry.title && (
        <Text style={styles.title} numberOfLines={2}>
          {entry.title}
        </Text>
      )}

      {/* Content preview */}
      {entry.content && (
        <Text style={styles.content} numberOfLines={3}>
          {entry.content}
        </Text>
      )}

      {/* Image preview */}
      {hasImages && (
        <View style={styles.imagePreview}>
          {entry.attachments.images.slice(0, 3).map((img, index) => (
            <View key={index} style={styles.imageThumb}>
              {img.url ? (
                <Image source={{ uri: img.url }} style={styles.thumbImage} />
              ) : (
                <ImageIcon size={16} color={COLORS.textMuted} />
              )}
            </View>
          ))}
          {entry.attachments.images.length > 3 && (
            <View style={styles.moreImages}>
              <Text style={styles.moreImagesText}>
                +{entry.attachments.images.length - 3}
              </Text>
            )}
            </View>
          )}
        </View>
      )}

      {/* Tags */}
      {entry.tags?.length > 0 && (
        <View style={styles.tagsContainer}>
          <TagDisplay tags={entry.tags} compact />
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        {/* Date/time */}
        <View style={styles.footerLeft}>
          {showDate && (
            <View style={styles.footerItem}>
              <Calendar size={12} color={COLORS.textMuted} />
              <Text style={styles.footerText}>{formatDate(entry.entry_date)}</Text>
            )}
            </View>
          )}
          <View style={styles.footerItem}>
            <Clock size={12} color={COLORS.textMuted} />
            <Text style={styles.footerText}>{formatTime(entry.created_at)}</Text>
          </View>
        </View>

        {/* Indicators */}
        <View style={styles.footerRight}>
          {hasVoice && <Mic size={12} color={COLORS.purple} />}
          {moodData && (
            <View style={[styles.moodIndicator, { backgroundColor: moodData.color + '20' }]}>
              <Text style={[styles.moodIndicatorText, { color: moodData.color }]}>
                {moodData.label}
              </Text>
            )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * JournalEntryListItem - List view variant
 */
export const JournalEntryListItem = ({
  entry,
  onPress,
  showDate = false,
}) => {
  if (!entry) return null;

  const typeConfig = ENTRY_TYPE_CONFIG[entry.entry_type] || ENTRY_TYPE_CONFIG[ENTRY_TYPES.REFLECTION];
  const IconComponent = typeConfig.icon;

  return (
    <TouchableOpacity
      style={styles.listContainer}
      onPress={() => onPress?.(entry)}
      activeOpacity={0.7}
    >
      <View style={[styles.listIcon, { backgroundColor: typeConfig.color + '15' }]}>
        <IconComponent size={18} color={typeConfig.color} />
      </View>

      <View style={styles.listContent}>
        <Text style={styles.listTitle} numberOfLines={1}>
          {entry.title || typeConfig.label}
        </Text>
        {entry.content && (
          <Text style={styles.listPreview} numberOfLines={1}>
            {entry.content}
          </Text>
        )}
        <View style={styles.listMeta}>
          <Text style={styles.listTime}>{formatTime(entry.created_at)}</Text>
          {entry.tags?.length > 0 && (
            <Text style={styles.listTags}>
              #{entry.tags[0]}{entry.tags.length > 1 ? ` +${entry.tags.length - 1}` : ''}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.listIndicators}>
        {entry.is_pinned && <Pin size={14} color={COLORS.gold} />}
        {entry.is_favorite && <Star size={14} color={COLORS.gold} fill={COLORS.gold} />}
      </View>
    </TouchableOpacity>
  );
};

/**
 * GratitudeCard - Special card for gratitude entries
 */
export const GratitudeCard = ({ entry, onPress }) => {
  if (!entry) return null;

  return (
    <TouchableOpacity
      style={styles.gratitudeContainer}
      onPress={() => onPress?.(entry)}
      activeOpacity={0.8}
    >
      <View style={styles.gratitudeIcon}>
        <Heart size={20} color={COLORS.error} fill={COLORS.error} />
      </View>

      <Text style={styles.gratitudeContent} numberOfLines={3}>
        {entry.content}
      </Text>

      <Text style={styles.gratitudeDate}>
        {formatDate(entry.entry_date)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLASS.backgroundColor,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xxs,
  },
  typeBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  areaBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDER_RADIUS.full,
  },
  areaBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionButton: {
    padding: SPACING.xxs,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  content: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.fontSize.md * 1.5,
    marginBottom: SPACING.sm,
  },
  imagePreview: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  imageThumb: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  moreImages: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreImagesText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  tagsContainer: {
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  moodIndicator: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  moodIndicatorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  compactPreview: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  compactIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  // List styles
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  listPreview: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xxs,
  },
  listTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  listTags: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.purple,
  },
  listIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  // Gratitude styles
  gratitudeContainer: {
    backgroundColor: COLORS.error + '10',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
    alignItems: 'center',
  },
  gratitudeIcon: {
    marginBottom: SPACING.sm,
  },
  gratitudeContent: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: TYPOGRAPHY.fontSize.md * 1.6,
  },
  gratitudeDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
});

export default JournalEntryCard;
