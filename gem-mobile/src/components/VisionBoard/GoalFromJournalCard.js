/**
 * GoalFromJournalCard.js
 * Card showing source journal info with navigation link
 * Displays in GoalDetailScreen when goal was created from a journal
 *
 * Created: 2026-02-02
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  BookOpen,
  ChevronRight,
  Calendar,
  FileText,
  Link2,
} from 'lucide-react-native';
import {
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
  COSMIC_TYPOGRAPHY,
} from '../../theme/cosmicTokens';
import { TEMPLATES } from '../../services/templates/journalTemplates';

/**
 * GoalFromJournalCard Component
 * @param {Object} sourceJournal - Source journal entry data
 * @param {string} sourceJournal.id - Journal ID
 * @param {string} sourceJournal.template_id - Template used
 * @param {string} sourceJournal.created_at - Creation date
 * @param {Object} sourceJournal.template_data - Template form data
 * @param {function} onPress - Press callback (optional, defaults to navigate)
 */
const GoalFromJournalCard = ({ sourceJournal, onPress }) => {
  const navigation = useNavigation();

  if (!sourceJournal) return null;

  // Get template info
  const template = TEMPLATES[sourceJournal.template_id];
  const templateName = template?.name || 'Nhat ky';

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Handle press
  const handlePress = () => {
    if (onPress) {
      onPress(sourceJournal);
    } else {
      // Navigate to journal detail
      navigation.navigate('JournalDetail', { journalId: sourceJournal.id });
    }
  };

  // Get excerpt from template data
  const getExcerpt = () => {
    const data = sourceJournal.template_data;
    if (!data) return null;

    // Try to get the first text field value
    if (data.title) return data.title;
    if (data.fear_target) return data.fear_target;
    if (data.main_area) return data.main_area;
    if (data.what_grateful) return data.what_grateful;

    return null;
  };

  const excerpt = getExcerpt();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Link2 size={16} color={COSMIC_COLORS.glow.cyan} />
          </View>
          <Text style={styles.headerTitle}>Tu nhat ky</Text>
        </View>
        <ChevronRight size={18} color={COSMIC_COLORS.text.muted} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Template info */}
        <View style={styles.templateRow}>
          <View style={styles.templateBadge}>
            <FileText size={12} color={COSMIC_COLORS.glow.purple} />
            <Text style={styles.templateName}>{templateName}</Text>
          </View>
        </View>

        {/* Date */}
        <View style={styles.dateRow}>
          <Calendar size={14} color={COSMIC_COLORS.text.muted} />
          <Text style={styles.dateText}>
            {formatDate(sourceJournal.created_at)}
          </Text>
        </View>

        {/* Excerpt */}
        {excerpt && (
          <Text style={styles.excerpt} numberOfLines={2}>
            "{excerpt}"
          </Text>
        )}
      </View>

      {/* Tap hint */}
      <Text style={styles.tapHint}>Nhan de xem nhat ky goc</Text>
    </TouchableOpacity>
  );
};

/**
 * Compact version for lists
 */
export const GoalFromJournalCardCompact = ({ sourceJournal, onPress }) => {
  const navigation = useNavigation();

  if (!sourceJournal) return null;

  const template = TEMPLATES[sourceJournal.template_id];
  const templateName = template?.name || 'Nhat ky';

  const handlePress = () => {
    if (onPress) {
      onPress(sourceJournal);
    } else {
      navigation.navigate('JournalDetail', { journalId: sourceJournal.id });
    }
  };

  return (
    <TouchableOpacity
      style={styles.compactContainer}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.compactIcon}>
        <Link2 size={14} color={COSMIC_COLORS.glow.cyan} />
      </View>
      <Text style={styles.compactText}>
        Tu {templateName}
      </Text>
      <ChevronRight size={14} color={COSMIC_COLORS.text.hint} />
    </TouchableOpacity>
  );
};

/**
 * Journal link badge (inline)
 */
export const JournalLinkBadge = ({ journalId, onPress }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress(journalId);
    } else if (journalId) {
      navigation.navigate('JournalDetail', { journalId });
    }
  };

  return (
    <TouchableOpacity
      style={styles.badge}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <BookOpen size={12} color={COSMIC_COLORS.glow.cyan} />
      <Text style={styles.badgeText}>Xem nhat ky</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: COSMIC_RADIUS.lg,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glow.cyan + '30',
    padding: COSMIC_SPACING.md,
    marginBottom: COSMIC_SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: COSMIC_SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: COSMIC_RADIUS.sm,
    backgroundColor: COSMIC_COLORS.glow.cyan + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
    color: COSMIC_COLORS.glow.cyan,
  },
  content: {
    gap: COSMIC_SPACING.sm,
  },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.xxs,
    backgroundColor: COSMIC_COLORS.glow.purple + '15',
    paddingHorizontal: COSMIC_SPACING.sm,
    paddingVertical: COSMIC_SPACING.xxs,
    borderRadius: COSMIC_RADIUS.sm,
  },
  templateName: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs,
    color: COSMIC_COLORS.glow.purple,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.xs,
  },
  dateText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.text.muted,
  },
  excerpt: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.text.secondary,
    fontStyle: 'italic',
    lineHeight: COSMIC_TYPOGRAPHY.fontSize.sm * 1.5,
  },
  tapHint: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs,
    color: COSMIC_COLORS.text.hint,
    marginTop: COSMIC_SPACING.sm,
    textAlign: 'center',
  },

  // Compact version
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.xs,
    backgroundColor: COSMIC_COLORS.glow.cyan + '10',
    paddingHorizontal: COSMIC_SPACING.sm,
    paddingVertical: COSMIC_SPACING.xs,
    borderRadius: COSMIC_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  compactIcon: {
    opacity: 0.8,
  },
  compactText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs,
    color: COSMIC_COLORS.glow.cyan,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.xxs,
    paddingHorizontal: COSMIC_SPACING.sm,
    paddingVertical: COSMIC_SPACING.xxs,
    backgroundColor: COSMIC_COLORS.glow.cyan + '15',
    borderRadius: COSMIC_RADIUS.round,
  },
  badgeText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs,
    color: COSMIC_COLORS.glow.cyan,
  },
});

export default GoalFromJournalCard;
