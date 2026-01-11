/**
 * ReadingHistoryItem Component
 * Preview card for reading history list
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Star,
  Layers,
  BookOpen,
  Calendar,
  ChevronRight,
  Trash2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const ReadingHistoryItem = ({
  reading,
  type = 'tarot', // 'tarot' | 'iching'
  onPress,
  onStar,
  onDelete,
  style,
}) => {
  // Parse date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };

  // Get spread name or hexagram name
  const getTitle = () => {
    if (type === 'tarot') {
      return reading?.spread_type || reading?.spreadType || 'Trải bài Tarot';
    }
    return reading?.present_hexagram?.name_vi || 'Quẻ Kinh Dịch';
  };

  // Get question preview
  const getQuestion = () => {
    const question = reading?.question || '';
    if (question.length > 60) {
      return question.substring(0, 60) + '...';
    }
    return question || 'Không có câu hỏi';
  };

  // Get card count or line info
  const getMetaInfo = () => {
    if (type === 'tarot') {
      const cards = reading?.cards;
      if (Array.isArray(cards)) {
        return `${cards.length} lá bài`;
      }
      return '';
    }
    // I-Ching
    const changingLines = reading?.changing_lines;
    if (Array.isArray(changingLines) && changingLines.length > 0) {
      return `${changingLines.length} hào động`;
    }
    return 'Không có hào động';
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(reading);
  };

  const handleStar = (e) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStar?.(reading);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete?.(reading);
  };

  const isStarred = reading?.starred;
  const IconComponent = type === 'tarot' ? Layers : BookOpen;
  const iconColor = type === 'tarot' ? COLORS.purple : COLORS.cyan;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        <LinearGradient
          colors={[COLORS.glassBg, COLORS.bgDarkest]}
          style={styles.background}
        />

        {/* Left side - Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
          <IconComponent size={24} color={iconColor} />
        </View>

        {/* Center - Content */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {getTitle()}
            </Text>
            {isStarred && (
              <Star size={14} color={COLORS.gold} fill={COLORS.gold} />
            )}
          </View>

          <Text style={styles.question} numberOfLines={2}>
            {getQuestion()}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Calendar size={12} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{formatDate(reading?.created_at)}</Text>
            </View>

            {getMetaInfo() && (
              <Text style={styles.metaText}>• {getMetaInfo()}</Text>
            )}
          </View>
        </View>

        {/* Right side - Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStar}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Star
              size={18}
              color={isStarred ? COLORS.gold : COLORS.textMuted}
              fill={isStarred ? COLORS.gold : 'transparent'}
            />
          </TouchableOpacity>

          <ChevronRight size={20} color={COLORS.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  question: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  actionButton: {
    padding: 4,
  },
});

export default ReadingHistoryItem;
