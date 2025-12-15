/**
 * Gemral - Quiz Result Component
 * Displays quiz results with score, pass/fail status, and actions
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import {
  Trophy,
  XCircle,
  CheckCircle,
  RotateCcw,
  Eye,
  ChevronRight,
  Clock,
  Target,
  Award,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const QuizResult = ({
  score,
  maxScore,
  percentage,
  passed,
  correctCount,
  totalQuestions,
  timeSpent, // in seconds
  passingScore = 70,
  attemptsUsed,
  maxAttempts,
  canRetake,
  onRetry,
  onReview,
  onContinue,
  onViewCertificate,
  isCourseComplete = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Format time spent
  const formatTime = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get score color
  const getScoreColor = () => {
    if (percentage >= 90) return COLORS.success;
    if (percentage >= passingScore) return COLORS.gold;
    return COLORS.error;
  };

  // Get grade text
  const getGrade = () => {
    if (percentage >= 90) return 'Xuất sắc!';
    if (percentage >= 80) return 'Giỏi!';
    if (percentage >= 70) return 'Khá!';
    if (percentage >= 50) return 'Trung bình';
    return 'Cần cố gắng';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Result Icon */}
      <Animated.View
        style={[
          styles.iconContainer,
          passed ? styles.iconContainerPass : styles.iconContainerFail,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {passed ? (
          <Trophy size={64} color={COLORS.gold} />
        ) : (
          <XCircle size={64} color={COLORS.error} />
        )}
      </Animated.View>

      {/* Pass/Fail Status */}
      <Text style={[styles.statusText, passed ? styles.statusPass : styles.statusFail]}>
        {passed ? 'Chúc mừng!' : 'Chưa đạt'}
      </Text>

      {/* Grade */}
      <Text style={styles.gradeText}>{getGrade()}</Text>

      {/* Score Circle */}
      <Animated.View style={[styles.scoreContainer, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={passed ? ['rgba(255, 189, 89, 0.2)', 'rgba(255, 189, 89, 0.05)'] : ['rgba(255, 107, 107, 0.2)', 'rgba(255, 107, 107, 0.05)']}
          style={styles.scoreCircle}
        >
          <Text style={[styles.scorePercentage, { color: getScoreColor() }]}>
            {percentage}%
          </Text>
          <Text style={styles.scoreLabel}>Điểm số</Text>
        </LinearGradient>
      </Animated.View>

      {/* Stats Grid */}
      <Animated.View style={[styles.statsGrid, { opacity: fadeAnim }]}>
        <View style={styles.statItem}>
          <View style={styles.statIconWrapper}>
            <Target size={18} color={COLORS.cyan} />
          </View>
          <Text style={styles.statValue}>{correctCount}/{totalQuestions}</Text>
          <Text style={styles.statLabel}>Câu đúng</Text>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statIconWrapper}>
            <Clock size={18} color={COLORS.gold} />
          </View>
          <Text style={styles.statValue}>{formatTime(timeSpent)}</Text>
          <Text style={styles.statLabel}>Thời gian</Text>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statIconWrapper}>
            <CheckCircle size={18} color={COLORS.success} />
          </View>
          <Text style={styles.statValue}>{passingScore}%</Text>
          <Text style={styles.statLabel}>Điểm chuẩn</Text>
        </View>
      </Animated.View>

      {/* Attempts Info */}
      {maxAttempts && (
        <View style={styles.attemptsInfo}>
          <Text style={styles.attemptsText}>
            Lượt thử: {attemptsUsed}/{maxAttempts}
          </Text>
          {!canRetake && !passed && (
            <Text style={styles.noMoreAttempts}>
              Bạn đã hết lượt thử
            </Text>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <Animated.View style={[styles.actionsContainer, { opacity: fadeAnim }]}>
        {/* Review Answers */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onReview}
          activeOpacity={0.7}
        >
          <Eye size={20} color={COLORS.textPrimary} />
          <Text style={styles.actionBtnText}>Xem đáp án</Text>
          <ChevronRight size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Retry Quiz */}
        {canRetake && !passed && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnRetry]}
            onPress={onRetry}
            activeOpacity={0.7}
          >
            <RotateCcw size={20} color={COLORS.gold} />
            <Text style={[styles.actionBtnText, styles.actionBtnTextRetry]}>
              Làm lại Quiz
            </Text>
            <ChevronRight size={18} color={COLORS.gold} />
          </TouchableOpacity>
        )}

        {/* View Certificate (if course complete) */}
        {isCourseComplete && passed && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnCertificate]}
            onPress={onViewCertificate}
            activeOpacity={0.7}
          >
            <Award size={20} color="#000" />
            <Text style={[styles.actionBtnText, styles.actionBtnTextCertificate]}>
              Xem Chứng chỉ
            </Text>
            <ChevronRight size={18} color="#000" />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[
          styles.continueBtn,
          passed && styles.continueBtnPass,
        ]}
        onPress={onContinue}
        activeOpacity={0.8}
      >
        <Text style={[styles.continueBtnText, passed && styles.continueBtnTextPass]}>
          {passed ? 'Tiếp tục học' : 'Quay lại bài học'}
        </Text>
      </TouchableOpacity>

      {/* Encouragement Message */}
      {!passed && (
        <Text style={styles.encouragementText}>
          Đừng nản lòng! Xem lại bài học và thử lại nhé.
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    paddingBottom: SPACING.xl * 2,
  },

  // Icon
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconContainerPass: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
  },
  iconContainerFail: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
  },

  // Status
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.xs,
  },
  statusPass: {
    color: COLORS.gold,
  },
  statusFail: {
    color: COLORS.error,
  },
  gradeText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },

  // Score Circle
  scoreContainer: {
    marginBottom: SPACING.xl,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  scorePercentage: {
    fontSize: 42,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  scoreLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Attempts
  attemptsInfo: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  attemptsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  noMoreAttempts: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },

  // Actions
  actionsContainer: {
    width: '100%',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  actionBtnRetry: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  actionBtnCertificate: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  actionBtnText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  actionBtnTextRetry: {
    color: COLORS.gold,
  },
  actionBtnTextCertificate: {
    color: '#000',
  },

  // Continue Button
  continueBtn: {
    width: '100%',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  continueBtnPass: {
    backgroundColor: COLORS.gold,
  },
  continueBtnText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  continueBtnTextPass: {
    color: '#000',
  },

  // Encouragement
  encouragementText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default QuizResult;
