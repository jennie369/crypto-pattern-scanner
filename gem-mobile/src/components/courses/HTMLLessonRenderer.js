/**
 * HTML Lesson Renderer Component (Mobile Student View)
 * Renders parsed lesson content for students with interactive quizzes
 * React Native version using native components
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';
import { supabase } from '../../services/supabase';

export default function HTMLLessonRenderer({
  lessonId,
  content,
  onComplete,
  onQuizSubmit,
}) {
  const { colors, glass, settings, SPACING, TYPOGRAPHY } = useSettings();

  const [quizResults, setQuizResults] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [realtimeContent, setRealtimeContent] = useState(content);

  const displayContent = realtimeContent || content;

  // Themed styles - note: this component uses a different token structure
  const themedColors = useMemo(() => ({
    accent: { primary: colors.gold || colors.accent?.primary },
    text: {
      primary: colors.textPrimary || colors.text?.primary,
      secondary: colors.textSecondary || colors.text?.secondary,
      muted: colors.textMuted || colors.text?.muted,
      inverse: colors.bgDarkest || colors.text?.inverse,
    },
    bg: {
      primary: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      secondary: 'rgba(255, 255, 255, 0.05)',
      tertiary: 'rgba(255, 255, 255, 0.08)',
    },
    border: {
      primary: 'rgba(255, 255, 255, 0.1)',
      secondary: 'rgba(255, 255, 255, 0.2)',
    },
    success: {
      text: colors.success,
      bg: 'rgba(0, 200, 150, 0.1)',
      border: 'rgba(0, 200, 150, 0.3)',
    },
    error: {
      text: colors.error,
      bg: 'rgba(255, 82, 82, 0.1)',
      border: 'rgba(255, 82, 82, 0.3)',
    },
    warning: {
      text: colors.gold,
      bg: 'rgba(255, 189, 89, 0.1)',
      border: 'rgba(255, 189, 89, 0.3)',
    },
    info: {
      text: colors.cyan || '#00F0FF',
      bg: 'rgba(0, 240, 255, 0.1)',
      border: 'rgba(0, 240, 255, 0.3)',
    },
  }), [colors, settings.theme, glass]);

  const radius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themedColors.bg.primary,
      padding: SPACING.lg,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: SPACING.md,
    },
    loadingText: {
      color: themedColors.text.muted,
      fontSize: TYPOGRAPHY.fontSize.md,
    },

    // Progress Bar
    progressBar: {
      backgroundColor: themedColors.bg.secondary,
      borderRadius: radius.md,
      padding: SPACING.md,
      marginBottom: SPACING.xl,
      borderWidth: 1,
      borderColor: themedColors.border.primary,
    },
    progressInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING.sm,
    },
    progressLabel: {
      color: themedColors.text.secondary,
      fontSize: TYPOGRAPHY.fontSize.sm,
    },
    progressPercent: {
      color: themedColors.accent.primary,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    progressTrack: {
      height: 8,
      backgroundColor: themedColors.bg.tertiary,
      borderRadius: radius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: themedColors.accent.primary,
      borderRadius: radius.full,
    },

    // Title
    lessonTitle: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: themedColors.text.primary,
      marginBottom: SPACING.xl,
      paddingBottom: SPACING.md,
      borderBottomWidth: 2,
      borderBottomColor: themedColors.accent.primary,
    },

    // Headings
    heading: {
      color: themedColors.text.primary,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      marginTop: SPACING.lg,
      marginBottom: SPACING.md,
    },
    h1: { fontSize: TYPOGRAPHY.fontSize.xxl },
    h2: { fontSize: TYPOGRAPHY.fontSize.xl },
    h3: { fontSize: TYPOGRAPHY.fontSize.lg },
    h4: { fontSize: TYPOGRAPHY.fontSize.md },
    h5: { fontSize: TYPOGRAPHY.fontSize.sm },
    h6: { fontSize: TYPOGRAPHY.fontSize.sm, color: themedColors.text.secondary },

    // Paragraph
    paragraph: {
      fontSize: TYPOGRAPHY.fontSize.md,
      lineHeight: 28,
      color: themedColors.text.secondary,
      marginBottom: SPACING.md,
    },

    // List
    list: {
      marginBottom: SPACING.md,
    },
    listItem: {
      flexDirection: 'row',
      marginBottom: SPACING.sm,
    },
    listBullet: {
      width: 24,
      color: themedColors.accent.primary,
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    listText: {
      flex: 1,
      color: themedColors.text.secondary,
      fontSize: TYPOGRAPHY.fontSize.md,
      lineHeight: 26,
    },

    // Image
    figure: {
      marginVertical: SPACING.xl,
      alignItems: 'center',
    },
    image: {
      width: '100%',
      height: 200,
      borderRadius: radius.lg,
    },
    caption: {
      marginTop: SPACING.sm,
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: themedColors.text.muted,
      fontStyle: 'italic',
      textAlign: 'center',
    },

    // Callout
    callout: {
      flexDirection: 'row',
      padding: SPACING.lg,
      borderRadius: radius.lg,
      borderLeftWidth: 4,
      marginVertical: SPACING.lg,
      gap: SPACING.md,
    },
    calloutIcon: {
      marginTop: 2,
    },
    calloutText: {
      flex: 1,
      color: themedColors.text.secondary,
      fontSize: TYPOGRAPHY.fontSize.md,
      lineHeight: 26,
    },

    // Code
    codeBlock: {
      backgroundColor: themedColors.bg.tertiary,
      borderRadius: radius.lg,
      padding: SPACING.lg,
      marginVertical: SPACING.lg,
      borderWidth: 1,
      borderColor: themedColors.border.primary,
    },
    codeText: {
      fontFamily: 'monospace',
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: themedColors.text.primary,
      lineHeight: 22,
    },

    // Quiz
    quizContainer: {
      backgroundColor: themedColors.bg.secondary,
      borderRadius: radius.xl,
      marginVertical: SPACING.xxl || SPACING.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: themedColors.border.primary,
    },
    quizHeader: {
      backgroundColor: themedColors.bg.tertiary,
      padding: SPACING.lg,
    },
    quizTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    quizBadge: {
      backgroundColor: themedColors.accent.primary,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: radius.sm,
    },
    quizBadgeText: {
      color: themedColors.text.inverse,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    quizTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: themedColors.text.primary,
      flex: 1,
    },
    resultBadge: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: radius.sm,
    },
    resultPassed: {
      backgroundColor: themedColors.success.bg,
    },
    resultFailed: {
      backgroundColor: themedColors.error.bg,
    },
    resultBadgeText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    resultPassedText: {
      color: themedColors.success.text,
    },
    resultFailedText: {
      color: themedColors.error.text,
    },
    quizMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    quizInfo: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: themedColors.text.muted,
    },
    quizContent: {
      padding: SPACING.xl,
    },

    // Result Summary
    resultSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.lg,
      borderRadius: radius.lg,
      marginBottom: SPACING.xl,
      gap: SPACING.lg,
    },
    resultSummaryPassed: {
      backgroundColor: themedColors.success.bg,
      borderWidth: 1,
      borderColor: themedColors.success.border,
    },
    resultSummaryFailed: {
      backgroundColor: themedColors.error.bg,
      borderWidth: 1,
      borderColor: themedColors.error.border,
    },
    resultInfo: {
      flex: 1,
    },
    resultScore: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: themedColors.text.primary,
      marginBottom: SPACING.xs,
    },
    resultStatus: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: themedColors.text.secondary,
    },
    retryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      borderWidth: 1,
      borderColor: themedColors.error.border,
      borderRadius: radius.md,
    },
    retryBtnText: {
      color: themedColors.error.text,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },

    // Question
    questionContainer: {
      backgroundColor: themedColors.bg.primary,
      borderRadius: radius.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.lg,
      borderWidth: 1,
      borderColor: themedColors.border.primary,
    },
    questionCorrect: {
      borderColor: themedColors.success.border,
    },
    questionIncorrect: {
      borderColor: themedColors.error.border,
    },
    questionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      marginBottom: SPACING.md,
    },
    questionNumber: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: themedColors.accent.primary,
    },
    questionPoints: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: themedColors.text.muted,
      backgroundColor: themedColors.bg.tertiary,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: radius.sm,
    },
    questionStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginLeft: 'auto',
    },
    questionStatusText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    statusCorrect: {
      color: themedColors.success.text,
    },
    statusIncorrect: {
      color: themedColors.error.text,
    },
    questionPrompt: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: themedColors.text.primary,
      lineHeight: 26,
      marginBottom: SPACING.lg,
    },

    // Options
    optionsContainer: {
      gap: SPACING.sm,
    },
    optionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      padding: SPACING.md,
      backgroundColor: themedColors.bg.secondary,
      borderWidth: 2,
      borderColor: themedColors.border.primary,
      borderRadius: radius.lg,
    },
    optionSelected: {
      backgroundColor: 'rgba(255, 189, 89, 0.1)',
      borderColor: themedColors.accent.primary,
    },
    optionCorrect: {
      backgroundColor: themedColors.success.bg,
      borderColor: themedColors.success.border,
    },
    optionIncorrect: {
      backgroundColor: themedColors.error.bg,
      borderColor: themedColors.error.border,
    },
    optionIndicator: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionCircle: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: themedColors.border.secondary,
      borderRadius: 10,
    },
    optionCheckbox: {
      borderRadius: radius.sm,
    },
    optionDot: {
      width: 20,
      height: 20,
      backgroundColor: themedColors.accent.primary,
      borderRadius: 10,
    },
    optionText: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.md,
      color: themedColors.text.secondary,
      lineHeight: 24,
    },
    optionTextSelected: {
      color: themedColors.text.primary,
    },
    optionTextCorrect: {
      color: themedColors.success.text,
    },
    optionTextIncorrect: {
      color: themedColors.error.text,
    },

    // Explanation
    explanation: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginTop: SPACING.lg,
      padding: SPACING.md,
      backgroundColor: themedColors.info.bg,
      borderRadius: radius.lg,
    },
    explanationText: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: themedColors.info.text,
      lineHeight: 22,
    },

    // Submit Button
    submitBtn: {
      backgroundColor: themedColors.accent.primary,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      borderRadius: radius.lg,
      alignItems: 'center',
      marginTop: SPACING.xl,
    },
    submitBtnDisabled: {
      opacity: 0.5,
    },
    submitBtnText: {
      color: themedColors.text.inverse,
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },

    // Complete Banner
    completeBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.lg,
      marginTop: SPACING.xxl || SPACING.xl,
      padding: SPACING.xl,
      backgroundColor: themedColors.success.bg,
      borderWidth: 1,
      borderColor: themedColors.success.border,
      borderRadius: radius.xl,
    },
    completeMessage: {
      flex: 1,
    },
    completeTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: themedColors.text.primary,
      marginBottom: SPACING.xs,
    },
    completeSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: themedColors.text.secondary,
    },

    bottomSpacer: {
      height: 40,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY, themedColors]);

  // Load user progress
  useEffect(() => {
    if (lessonId) {
      loadProgress();
    }
  }, [lessonId]);

  // Setup realtime subscription
  useEffect(() => {
    if (!lessonId) return;

    const channel = supabase
      .channel(`lesson-${lessonId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'course_lessons',
          filter: `id=eq.${lessonId}`,
        },
        (payload) => {
          if (payload.new?.parsed_content) {
            setRealtimeContent(payload.new.parsed_content);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lessonId]);

  // Calculate progress
  useEffect(() => {
    if (!displayContent?.quizzes?.length) {
      setLessonProgress(100);
      return;
    }

    const totalQuizzes = displayContent.quizzes.length;
    const completed = completedQuizzes.length;
    const progress = Math.round((completed / totalQuizzes) * 100);
    setLessonProgress(progress);

    if (progress === 100 && onComplete) {
      onComplete(lessonId);
    }
  }, [completedQuizzes, displayContent]);

  const loadProgress = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return;

      const { data } = await supabase
        .from('lesson_progress')
        .select('quiz_results, completed_quizzes')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.user.id)
        .single();

      if (data) {
        setQuizResults(data.quiz_results || {});
        setCompletedQuizzes(data.completed_quizzes || []);
      }
    } catch (err) {
      // No progress yet
    }
  };

  const saveProgress = async (newQuizResults, newCompletedQuizzes) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return;

      await supabase.from('lesson_progress').upsert({
        lesson_id: lessonId,
        user_id: user.user.id,
        quiz_results: newQuizResults,
        completed_quizzes: newCompletedQuizzes,
        progress_percent: Math.round(
          (newCompletedQuizzes.length / (displayContent?.quizzes?.length || 1)) * 100
        ),
        last_accessed_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[HTMLLessonRenderer] Save progress error:', err);
    }
  };

  const handleQuizComplete = useCallback(
    (quizId, result) => {
      const newQuizResults = { ...quizResults, [quizId]: result };
      const newCompletedQuizzes = completedQuizzes.includes(quizId)
        ? completedQuizzes
        : [...completedQuizzes, quizId];

      setQuizResults(newQuizResults);
      setCompletedQuizzes(newCompletedQuizzes);
      saveProgress(newQuizResults, newCompletedQuizzes);

      onQuizSubmit?.(quizId, result);
    },
    [quizResults, completedQuizzes, lessonId]
  );

  if (!displayContent) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themedColors.accent.primary} />
        <Text style={styles.loadingText}>Đang tải nội dung bài học...</Text>
      </View>
    );
  }

  // Content Block Renderer
  const ContentBlock = ({ block }) => {
    switch (block.type) {
      case 'heading':
        return <HeadingBlock block={block} />;
      case 'paragraph':
        return <ParagraphBlock block={block} />;
      case 'list':
        return <ListBlock block={block} />;
      case 'image':
        return <ImageBlock block={block} />;
      case 'callout':
        return <CalloutBlock block={block} />;
      case 'code':
        return <CodeBlock block={block} />;
      default:
        return null;
    }
  };

  const HeadingBlock = ({ block }) => {
    const headingStyles = {
      1: styles.h1,
      2: styles.h2,
      3: styles.h3,
      4: styles.h4,
      5: styles.h5,
      6: styles.h6,
    };
    return <Text style={[styles.heading, headingStyles[block.level]]}>{block.content}</Text>;
  };

  const ParagraphBlock = ({ block }) => {
    return <Text style={styles.paragraph}>{block.content}</Text>;
  };

  const ListBlock = ({ block }) => {
    return (
      <View style={styles.list}>
        {block.items.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listBullet}>
              {block.ordered ? `${index + 1}.` : '•'}
            </Text>
            <Text style={styles.listText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  };

  const ImageBlock = ({ block }) => {
    return (
      <View style={styles.figure}>
        <Image
          source={{ uri: block.src }}
          style={styles.image}
          resizeMode="contain"
        />
        {block.caption && (
          <Text style={styles.caption}>{block.caption}</Text>
        )}
      </View>
    );
  };

  const CalloutBlock = ({ block }) => {
    const calloutStyles = {
      tip: { bg: themedColors.success.bg, border: themedColors.success.border, icon: 'zap' },
      warning: { bg: themedColors.warning.bg, border: themedColors.warning.border, icon: 'alert-circle' },
      info: { bg: themedColors.info.bg, border: themedColors.info.border, icon: 'info' },
      success: { bg: themedColors.success.bg, border: themedColors.success.border, icon: 'check-circle' },
      quote: { bg: themedColors.bg.tertiary, border: themedColors.border.secondary, icon: null },
    };

    const style = calloutStyles[block.style] || calloutStyles.quote;

    return (
      <View style={[styles.callout, { backgroundColor: style.bg, borderLeftColor: style.border }]}>
        {style.icon && (
          <Feather name={style.icon} size={18} color={style.border} style={styles.calloutIcon} />
        )}
        <Text style={styles.calloutText}>{block.content}</Text>
      </View>
    );
  };

  const CodeBlock = ({ block }) => {
    return (
      <View style={styles.codeBlock}>
        <Text style={styles.codeText}>{block.content}</Text>
      </View>
    );
  };

  // Interactive Quiz Component
  const InteractiveQuiz = ({
    quiz,
    savedAnswers,
    savedResult,
    isCompleted,
    onComplete,
    onAnswersChange,
  }) => {
    const [expanded, setExpanded] = useState(!isCompleted);
    const [answers, setAnswers] = useState(savedAnswers || {});
    const [submitted, setSubmitted] = useState(isCompleted);
    const [result, setResult] = useState(savedResult || null);
    const [showExplanations, setShowExplanations] = useState({});

    const totalPoints = quiz.questions?.reduce((sum, q) => sum + (q.points || 10), 0) || 0;

    const handleOptionSelect = (questionId, optionId, isMultiple) => {
      if (submitted) return;

      const newAnswers = { ...answers };

      if (isMultiple) {
        const current = newAnswers[questionId] || [];
        if (current.includes(optionId)) {
          newAnswers[questionId] = current.filter((id) => id !== optionId);
        } else {
          newAnswers[questionId] = [...current, optionId];
        }
      } else {
        newAnswers[questionId] = optionId;
      }

      setAnswers(newAnswers);
      onAnswersChange?.(newAnswers);
    };

    const handleSubmit = () => {
      if (submitted) return;

      let earnedPoints = 0;
      const questionResults = {};

      quiz.questions?.forEach((question) => {
        const userAnswer = answers[question.id];
        const correctOptions = question.options
          .filter((opt) => opt.isCorrect)
          .map((opt) => opt.id);

        let isCorrect = false;

        if (question.type === 'multiple') {
          const userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [];
          isCorrect =
            correctOptions.length === userAnswerArray.length &&
            correctOptions.every((id) => userAnswerArray.includes(id));
        } else {
          isCorrect = correctOptions.includes(userAnswer);
        }

        if (isCorrect) {
          earnedPoints += question.points || 10;
        }

        questionResults[question.id] = {
          isCorrect,
          userAnswer,
          correctAnswer: correctOptions,
        };
      });

      const score = Math.round((earnedPoints / totalPoints) * 100);
      const passed = score >= quiz.passingScore;

      const quizResult = {
        score,
        earnedPoints,
        totalPoints,
        passed,
        questionResults,
        completedAt: new Date().toISOString(),
      };

      setResult(quizResult);
      setSubmitted(true);
      setShowExplanations(
        Object.fromEntries(quiz.questions.map((q) => [q.id, true]))
      );
      onComplete(quizResult);
    };

    const handleRetry = () => {
      setAnswers({});
      setSubmitted(false);
      setResult(null);
      setShowExplanations({});
      onAnswersChange?.({});
    };

    const getOptionState = (question, option) => {
      const isMultiple = question.type === 'multiple';
      const userAnswer = answers[question.id];
      const selected = isMultiple
        ? (userAnswer || []).includes(option.id)
        : userAnswer === option.id;

      if (!submitted) {
        return selected ? 'selected' : 'default';
      }

      if (option.isCorrect) return 'correct';
      if (selected && !option.isCorrect) return 'incorrect';
      return 'default';
    };

    const allQuestionsAnswered = quiz.questions?.every((q) => {
      const answer = answers[q.id];
      if (q.type === 'multiple') {
        return Array.isArray(answer) && answer.length > 0;
      }
      return answer !== undefined;
    });

    return (
      <View style={styles.quizContainer}>
        <TouchableOpacity
          style={styles.quizHeader}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          <View style={styles.quizTitleRow}>
            <View style={styles.quizBadge}>
              <Text style={styles.quizBadgeText}>QUIZ</Text>
            </View>
            <Text style={styles.quizTitle}>{quiz.title}</Text>
            {submitted && result && (
              <View style={[styles.resultBadge, result.passed ? styles.resultPassed : styles.resultFailed]}>
                <Text style={[styles.resultBadgeText, result.passed ? styles.resultPassedText : styles.resultFailedText]}>
                  {result.passed ? 'Đạt' : 'Chưa đạt'} - {result.score}%
                </Text>
              </View>
            )}
          </View>
          <View style={styles.quizMeta}>
            <Text style={styles.quizInfo}>
              {quiz.questions?.length || 0} câu | Điểm đạt: {quiz.passingScore}%
            </Text>
            <Feather
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={themedColors.text.muted}
            />
          </View>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.quizContent}>
            {/* Result Summary */}
            {submitted && result && (
              <View style={[styles.resultSummary, result.passed ? styles.resultSummaryPassed : styles.resultSummaryFailed]}>
                <Feather
                  name={result.passed ? 'award' : 'alert-circle'}
                  size={32}
                  color={result.passed ? themedColors.success.text : themedColors.error.text}
                />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultScore}>
                    Điểm số: {result.score}% ({result.earnedPoints}/{result.totalPoints} điểm)
                  </Text>
                  <Text style={styles.resultStatus}>
                    {result.passed
                      ? 'Chúc mừng! Bạn đã vượt qua bài kiểm tra.'
                      : `Cần đạt ${quiz.passingScore}% để hoàn thành.`}
                  </Text>
                </View>
                {!result.passed && (
                  <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
                    <Feather name="refresh-cw" size={16} color={themedColors.error.text} />
                    <Text style={styles.retryBtnText}>Làm lại</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Questions */}
            {quiz.questions?.map((question, qIndex) => (
              <View
                key={question.id}
                style={[
                  styles.questionContainer,
                  submitted && result?.questionResults[question.id]?.isCorrect && styles.questionCorrect,
                  submitted && !result?.questionResults[question.id]?.isCorrect && styles.questionIncorrect,
                ]}
              >
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>Câu {qIndex + 1}</Text>
                  <Text style={styles.questionPoints}>{question.points} điểm</Text>
                  {submitted && (
                    <View style={styles.questionStatus}>
                      <Feather
                        name={result?.questionResults[question.id]?.isCorrect ? 'check-circle' : 'x-circle'}
                        size={14}
                        color={result?.questionResults[question.id]?.isCorrect ? themedColors.success.text : themedColors.error.text}
                      />
                      <Text style={[
                        styles.questionStatusText,
                        result?.questionResults[question.id]?.isCorrect ? styles.statusCorrect : styles.statusIncorrect
                      ]}>
                        {result?.questionResults[question.id]?.isCorrect ? 'Đúng' : 'Sai'}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.questionPrompt}>{question.prompt}</Text>

                <View style={styles.optionsContainer}>
                  {question.options?.map((option) => {
                    const state = getOptionState(question, option);
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.optionBtn,
                          state === 'selected' && styles.optionSelected,
                          state === 'correct' && styles.optionCorrect,
                          state === 'incorrect' && styles.optionIncorrect,
                        ]}
                        onPress={() => handleOptionSelect(question.id, option.id, question.type === 'multiple')}
                        disabled={submitted}
                        activeOpacity={0.7}
                      >
                        <View style={styles.optionIndicator}>
                          {state === 'correct' && <Feather name="check-circle" size={18} color={themedColors.success.text} />}
                          {state === 'incorrect' && <Feather name="x-circle" size={18} color={themedColors.error.text} />}
                          {state === 'selected' && <View style={styles.optionDot} />}
                          {state === 'default' && (
                            <View style={[styles.optionCircle, question.type === 'multiple' && styles.optionCheckbox]} />
                          )}
                        </View>
                        <Text style={[
                          styles.optionText,
                          state === 'selected' && styles.optionTextSelected,
                          state === 'correct' && styles.optionTextCorrect,
                          state === 'incorrect' && styles.optionTextIncorrect,
                        ]}>
                          {option.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {showExplanations[question.id] && question.explanation && (
                  <View style={styles.explanation}>
                    <Feather name="info" size={16} color={themedColors.info.text} />
                    <Text style={styles.explanationText}>{question.explanation}</Text>
                  </View>
                )}
              </View>
            ))}

            {/* Submit Button */}
            {!submitted && (
              <TouchableOpacity
                style={[styles.submitBtn, !allQuestionsAnswered && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!allQuestionsAnswered}
                activeOpacity={0.8}
              >
                <Text style={styles.submitBtnText}>Nộp bài kiểm tra</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Progress Bar */}
      {displayContent.quizzes?.length > 0 && (
        <View style={styles.progressBar}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Tiến độ bài học</Text>
            <Text style={styles.progressPercent}>{lessonProgress}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${lessonProgress}%` }]} />
          </View>
        </View>
      )}

      {/* Title */}
      {displayContent.metadata?.title && (
        <Text style={styles.lessonTitle}>{displayContent.metadata.title}</Text>
      )}

      {/* Content Blocks */}
      {displayContent.blocks?.map((block) => (
        <ContentBlock key={block.id} block={block} />
      ))}

      {/* Quizzes */}
      {displayContent.quizzes?.map((quiz) => (
        <InteractiveQuiz
          key={quiz.id}
          quiz={quiz}
          savedAnswers={quizAnswers[quiz.id]}
          savedResult={quizResults[quiz.id]}
          isCompleted={completedQuizzes.includes(quiz.id)}
          onComplete={(result) => handleQuizComplete(quiz.id, result)}
          onAnswersChange={(answers) =>
            setQuizAnswers((prev) => ({ ...prev, [quiz.id]: answers }))
          }
        />
      ))}

      {/* Completion Banner */}
      {lessonProgress === 100 && displayContent.quizzes?.length > 0 && (
        <View style={styles.completeBanner}>
          <Feather name="award" size={32} color={themedColors.success.text} />
          <View style={styles.completeMessage}>
            <Text style={styles.completeTitle}>Chúc mừng!</Text>
            <Text style={styles.completeSubtitle}>
              Bạn đã hoàn thành bài học này.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}
