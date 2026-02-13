/**
 * HTML Lesson Renderer Component (Mobile Student View)
 * Renders parsed lesson content for students with interactive quizzes
 * React Native version using native components
 */

import React, { useState, useEffect, useCallback } from 'react';
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
import { tokens } from '../../utils/tokens';
import { supabase } from '../../services/supabase';

export default function HTMLLessonRenderer({
  lessonId,
  content,
  onComplete,
  onQuizSubmit,
}) {
  const [quizResults, setQuizResults] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [realtimeContent, setRealtimeContent] = useState(content);

  const displayContent = realtimeContent || content;

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
        <ActivityIndicator size="large" color={tokens.colors.accent.primary} />
        <Text style={styles.loadingText}>Đang tải nội dung bài học...</Text>
      </View>
    );
  }

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
          <Feather name="award" size={32} color={tokens.colors.success.text} />
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

/**
 * Content Block Renderer
 */
function ContentBlock({ block }) {
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
}

function HeadingBlock({ block }) {
  const headingStyles = {
    1: styles.h1,
    2: styles.h2,
    3: styles.h3,
    4: styles.h4,
    5: styles.h5,
    6: styles.h6,
  };
  return <Text style={[styles.heading, headingStyles[block.level]]}>{block.content}</Text>;
}

function ParagraphBlock({ block }) {
  return <Text style={styles.paragraph}>{block.content}</Text>;
}

function ListBlock({ block }) {
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
}

function ImageBlock({ block }) {
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
}

function CalloutBlock({ block }) {
  const calloutStyles = {
    tip: { bg: tokens.colors.success.bg, border: tokens.colors.success.border, icon: 'zap' },
    warning: { bg: tokens.colors.warning.bg, border: tokens.colors.warning.border, icon: 'alert-circle' },
    info: { bg: tokens.colors.info.bg, border: tokens.colors.info.border, icon: 'info' },
    success: { bg: tokens.colors.success.bg, border: tokens.colors.success.border, icon: 'check-circle' },
    quote: { bg: tokens.colors.bg.tertiary, border: tokens.colors.border.secondary, icon: null },
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
}

function CodeBlock({ block }) {
  return (
    <View style={styles.codeBlock}>
      <Text style={styles.codeText}>{block.content}</Text>
    </View>
  );
}

/**
 * Interactive Quiz Component
 */
function InteractiveQuiz({
  quiz,
  savedAnswers,
  savedResult,
  isCompleted,
  onComplete,
  onAnswersChange,
}) {
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
            color={tokens.colors.text.muted}
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
                color={result.passed ? tokens.colors.success.text : tokens.colors.error.text}
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
                  <Feather name="refresh-cw" size={16} color={tokens.colors.error.text} />
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
                      color={result?.questionResults[question.id]?.isCorrect ? tokens.colors.success.text : tokens.colors.error.text}
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
                        {state === 'correct' && <Feather name="check-circle" size={18} color={tokens.colors.success.text} />}
                        {state === 'incorrect' && <Feather name="x-circle" size={18} color={tokens.colors.error.text} />}
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
                  <Feather name="info" size={16} color={tokens.colors.info.text} />
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg.primary,
    padding: tokens.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  loadingText: {
    color: tokens.colors.text.muted,
    fontSize: tokens.fontSize.md,
  },

  // Progress Bar
  progressBar: {
    backgroundColor: tokens.colors.bg.secondary,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.xl,
    borderWidth: 1,
    borderColor: tokens.colors.border.primary,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.sm,
  },
  progressLabel: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.fontSize.sm,
  },
  progressPercent: {
    color: tokens.colors.accent.primary,
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.semibold,
  },
  progressTrack: {
    height: 8,
    backgroundColor: tokens.colors.bg.tertiary,
    borderRadius: tokens.radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.colors.accent.primary,
    borderRadius: tokens.radius.full,
  },

  // Title
  lessonTitle: {
    fontSize: tokens.fontSize['2xl'],
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xl,
    paddingBottom: tokens.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: tokens.colors.accent.primary,
  },

  // Headings
  heading: {
    color: tokens.colors.text.primary,
    fontWeight: tokens.fontWeight.semibold,
    marginTop: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
  },
  h1: { fontSize: tokens.fontSize['2xl'] },
  h2: { fontSize: tokens.fontSize.xl },
  h3: { fontSize: tokens.fontSize.lg },
  h4: { fontSize: tokens.fontSize.md },
  h5: { fontSize: tokens.fontSize.sm },
  h6: { fontSize: tokens.fontSize.sm, color: tokens.colors.text.secondary },

  // Paragraph
  paragraph: {
    fontSize: tokens.fontSize.md,
    lineHeight: 28,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.md,
  },

  // List
  list: {
    marginBottom: tokens.spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: tokens.spacing.sm,
  },
  listBullet: {
    width: 24,
    color: tokens.colors.accent.primary,
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.semibold,
  },
  listText: {
    flex: 1,
    color: tokens.colors.text.secondary,
    fontSize: tokens.fontSize.md,
    lineHeight: 26,
  },

  // Image
  figure: {
    marginVertical: tokens.spacing.xl,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: tokens.radius.lg,
  },
  caption: {
    marginTop: tokens.spacing.sm,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text.muted,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Callout
  callout: {
    flexDirection: 'row',
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    borderLeftWidth: 4,
    marginVertical: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  calloutIcon: {
    marginTop: 2,
  },
  calloutText: {
    flex: 1,
    color: tokens.colors.text.secondary,
    fontSize: tokens.fontSize.md,
    lineHeight: 26,
  },

  // Code
  codeBlock: {
    backgroundColor: tokens.colors.bg.tertiary,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    marginVertical: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border.primary,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text.primary,
    lineHeight: 22,
  },

  // Quiz
  quizContainer: {
    backgroundColor: tokens.colors.bg.secondary,
    borderRadius: tokens.radius.xl,
    marginVertical: tokens.spacing['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: tokens.colors.border.primary,
  },
  quizHeader: {
    backgroundColor: tokens.colors.bg.tertiary,
    padding: tokens.spacing.lg,
  },
  quizTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
  },
  quizBadge: {
    backgroundColor: tokens.colors.accent.primary,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.sm,
  },
  quizBadgeText: {
    color: tokens.colors.text.inverse,
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.bold,
  },
  quizTitle: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.semibold,
    color: tokens.colors.text.primary,
    flex: 1,
  },
  resultBadge: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.sm,
  },
  resultPassed: {
    backgroundColor: tokens.colors.success.bg,
  },
  resultFailed: {
    backgroundColor: tokens.colors.error.bg,
  },
  resultBadgeText: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.semibold,
  },
  resultPassedText: {
    color: tokens.colors.success.text,
  },
  resultFailedText: {
    color: tokens.colors.error.text,
  },
  quizMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizInfo: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text.muted,
  },
  quizContent: {
    padding: tokens.spacing.xl,
  },

  // Result Summary
  resultSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.spacing.xl,
    gap: tokens.spacing.lg,
  },
  resultSummaryPassed: {
    backgroundColor: tokens.colors.success.bg,
    borderWidth: 1,
    borderColor: tokens.colors.success.border,
  },
  resultSummaryFailed: {
    backgroundColor: tokens.colors.error.bg,
    borderWidth: 1,
    borderColor: tokens.colors.error.border,
  },
  resultInfo: {
    flex: 1,
  },
  resultScore: {
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  resultStatus: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text.secondary,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.colors.error.border,
    borderRadius: tokens.radius.md,
  },
  retryBtnText: {
    color: tokens.colors.error.text,
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
  },

  // Question
  questionContainer: {
    backgroundColor: tokens.colors.bg.primary,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border.primary,
  },
  questionCorrect: {
    borderColor: tokens.colors.success.border,
  },
  questionIncorrect: {
    borderColor: tokens.colors.error.border,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
  },
  questionNumber: {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.accent.primary,
  },
  questionPoints: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.text.muted,
    backgroundColor: tokens.colors.bg.tertiary,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.sm,
  },
  questionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  questionStatusText: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.medium,
  },
  statusCorrect: {
    color: tokens.colors.success.text,
  },
  statusIncorrect: {
    color: tokens.colors.error.text,
  },
  questionPrompt: {
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text.primary,
    lineHeight: 26,
    marginBottom: tokens.spacing.lg,
  },

  // Options
  optionsContainer: {
    gap: tokens.spacing.sm,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.bg.secondary,
    borderWidth: 2,
    borderColor: tokens.colors.border.primary,
    borderRadius: tokens.radius.lg,
  },
  optionSelected: {
    backgroundColor: tokens.colors.accent.bg,
    borderColor: tokens.colors.accent.primary,
  },
  optionCorrect: {
    backgroundColor: tokens.colors.success.bg,
    borderColor: tokens.colors.success.border,
  },
  optionIncorrect: {
    backgroundColor: tokens.colors.error.bg,
    borderColor: tokens.colors.error.border,
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
    borderColor: tokens.colors.border.secondary,
    borderRadius: 10,
  },
  optionCheckbox: {
    borderRadius: tokens.radius.sm,
  },
  optionDot: {
    width: 20,
    height: 20,
    backgroundColor: tokens.colors.accent.primary,
    borderRadius: 10,
  },
  optionText: {
    flex: 1,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text.secondary,
    lineHeight: 24,
  },
  optionTextSelected: {
    color: tokens.colors.text.primary,
  },
  optionTextCorrect: {
    color: tokens.colors.success.text,
  },
  optionTextIncorrect: {
    color: tokens.colors.error.text,
  },

  // Explanation
  explanation: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.lg,
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.info.bg,
    borderRadius: tokens.radius.lg,
  },
  explanationText: {
    flex: 1,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.info.text,
    lineHeight: 22,
  },

  // Submit Button
  submitBtn: {
    backgroundColor: tokens.colors.accent.primary,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.xl,
    borderRadius: tokens.radius.lg,
    alignItems: 'center',
    marginTop: tokens.spacing.xl,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: tokens.colors.text.inverse,
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.semibold,
  },

  // Complete Banner
  completeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.lg,
    marginTop: tokens.spacing['2xl'],
    padding: tokens.spacing.xl,
    backgroundColor: tokens.colors.success.bg,
    borderWidth: 1,
    borderColor: tokens.colors.success.border,
    borderRadius: tokens.radius.xl,
  },
  completeMessage: {
    flex: 1,
  },
  completeTitle: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  completeSubtitle: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text.secondary,
  },

  bottomSpacer: {
    height: tokens.spacing['2xl'],
  },
});
