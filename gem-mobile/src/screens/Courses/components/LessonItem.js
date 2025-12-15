/**
 * Gemral - Lesson Item Component
 * Individual lesson row in curriculum list
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  Play,
  CheckCircle,
  Lock,
  Clock,
  FileText,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const LessonItem = ({
  lesson,
  index,
  isCompleted = false,
  isLocked = false,
  isCurrent = false,
  onPress,
}) => {
  const getLessonIcon = () => {
    if (isLocked) {
      return <Lock size={20} color={COLORS.textMuted} />;
    }
    if (isCompleted) {
      return <CheckCircle size={20} color={COLORS.success} />;
    }
    if (lesson.type === 'video') {
      return <Play size={20} color={isCurrent ? COLORS.gold : COLORS.textPrimary} />;
    }
    return <FileText size={20} color={isCurrent ? COLORS.gold : COLORS.textPrimary} />;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isCurrent && styles.currentContainer,
        isLocked && styles.lockedContainer,
      ]}
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={0.7}
    >
      {/* Index Number */}
      <View style={[
        styles.indexContainer,
        isCompleted && styles.indexCompleted,
        isCurrent && styles.indexCurrent,
      ]}>
        <Text style={[
          styles.indexText,
          isCompleted && styles.indexTextCompleted,
          isCurrent && styles.indexTextCurrent,
        ]}>
          {index}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            isCompleted && styles.titleCompleted,
            isLocked && styles.titleLocked,
            isCurrent && styles.titleCurrent,
          ]}
          numberOfLines={2}
        >
          {lesson.title}
        </Text>

        {/* Duration */}
        <View style={styles.meta}>
          <Clock size={12} color={COLORS.textMuted} />
          <Text style={styles.duration}>{lesson.duration_minutes} phút</Text>
          {lesson.type && (
            <Text style={styles.type}>
              • {lesson.type === 'video' ? 'Video' : 'Bài đọc'}
            </Text>
          )}
        </View>
      </View>

      {/* Icon */}
      <View style={styles.iconContainer}>
        {getLessonIcon()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  currentContainer: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  lockedContainer: {
    opacity: 0.6,
  },
  indexContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  indexCompleted: {
    backgroundColor: 'rgba(0, 255, 100, 0.2)',
  },
  indexCurrent: {
    backgroundColor: COLORS.gold,
  },
  indexText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textMuted,
  },
  indexTextCompleted: {
    color: COLORS.success,
  },
  indexTextCurrent: {
    color: '#112250',
  },
  content: {
    flex: 1,
    marginRight: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  titleCompleted: {
    color: COLORS.textMuted,
  },
  titleLocked: {
    color: COLORS.textMuted,
  },
  titleCurrent: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  type: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LessonItem;
