/**
 * Gemral - Quiz Screen
 * Full quiz experience with timer, navigation, and result display
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  HelpCircle,
} from 'lucide-react-native';

import { useCourse } from '../../contexts/CourseContext';
import { useAuth } from '../../contexts/AuthContext';
import { quizService } from '../../services/quizService';
import QuizQuestion from './components/QuizQuestion';
import QuizTimer from './components/QuizTimer';
import QuizResult from './components/QuizResult';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS } from '../../utils/tokens';

const QuizScreen = ({ navigation, route }) => {
  const { courseId, lessonId, lesson, courseTitle } = route.params;
  const { user } = useAuth();
  const { completeLesson, getProgress } = useCourse();

  // State
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [retakeInfo, setRetakeInfo] = useState({ canRetake: true, attemptsUsed: 0, maxAttempts: null });
  const startTimeRef = useRef(Date.now());

  const userId = user?.id;

  // Fetch quiz data on mount
  useEffect(() => {
    loadQuiz();
  }, [lessonId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);

      // Get quiz by lesson ID
      const quizData = await quizService.getQuizByLessonId(lessonId);

      if (!quizData) {
        Alert.alert('Lỗi', 'Không tìm thấy quiz cho bài học này');
        navigation.goBack();
        return;
      }

      setQuiz(quizData);

      // Shuffle questions if enabled
      let orderedQuestions = quizData.questions || [];
      if (quizData.shuffle_questions) {
        orderedQuestions = quizService.shuffleArray(orderedQuestions);
      }

      // Shuffle options within each question if enabled
      if (quizData.shuffle_options) {
        orderedQuestions = orderedQuestions.map(q => ({
          ...q,
          options: q.options ? quizService.shuffleArray(q.options) : [],
        }));
      }

      setQuestions(orderedQuestions);

      // Check retake status
      if (userId) {
        const canRetakeResult = await quizService.canRetakeQuiz(userId, quizData.id);
        setRetakeInfo(canRetakeResult);

        if (!canRetakeResult.canRetake) {
          // User has no more attempts, show best result
          const bestAttempt = await quizService.getBestAttempt(userId, quizData.id);
          if (bestAttempt) {
            setResult({
              score: bestAttempt.score,
              maxScore: bestAttempt.max_score,
              percentage: bestAttempt.score_percentage,
              passed: bestAttempt.passed,
              gradedAnswers: bestAttempt.graded_answers || [],
              timeSpent: bestAttempt.time_spent_seconds,
              correctCount: bestAttempt.graded_answers?.filter(a => a.isCorrect).length || 0,
              totalQuestions: orderedQuestions.length,
            });
            setSubmitted(true);
          }
        } else {
          // Start a new attempt
          const attempt = await quizService.startAttempt(userId, {
            quizId: quizData.id,
            lessonId,
            courseId,
            maxScore: orderedQuestions.reduce((sum, q) => sum + (q.points || 1), 0),
          });
          if (attempt) {
            setAttemptId(attempt.id);
          }
        }
      }

      startTimeRef.current = Date.now();
    } catch (error) {
      console.error('[QuizScreen] loadQuiz error:', error);
      Alert.alert('Lỗi', 'Không thể tải quiz');
    } finally {
      setLoading(false);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (answer) => {
    if (submitted) return;
    const questionId = questions[currentIndex].id;
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Navigate to next question
  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Navigate to previous question
  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Submit quiz
  const handleSubmit = () => {
    // Check if all questions answered
    const unanswered = questions.filter(q => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      Alert.alert(
        'Chưa hoàn thành',
        `Còn ${unanswered.length} câu chưa trả lời. Bạn có muốn nộp bài không?`,
        [
          { text: 'Tiếp tục làm', style: 'cancel' },
          { text: 'Nộp bài', style: 'destructive', onPress: submitQuiz },
        ]
      );
    } else {
      Alert.alert(
        'Xác nhận nộp bài',
        'Bạn có chắc muốn nộp bài không?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Nộp bài', onPress: submitQuiz },
        ]
      );
    }
  };

  const submitQuiz = async () => {
    try {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

      const submitResult = await quizService.submitAttempt(
        attemptId,
        { answers, timeSpentSeconds: timeSpent },
        questions
      );

      setResult({
        ...submitResult,
        timeSpent,
      });
      setSubmitted(true);

      // If passed, mark lesson as complete
      if (submitResult.passed) {
        await completeLesson(courseId, lessonId);
      }

      // Update retake info
      setRetakeInfo(prev => ({
        ...prev,
        attemptsUsed: prev.attemptsUsed + 1,
        canRetake: prev.maxAttempts ? (prev.attemptsUsed + 1) < prev.maxAttempts : true,
      }));
    } catch (error) {
      console.error('[QuizScreen] submitQuiz error:', error);
      Alert.alert('Lỗi', 'Không thể nộp bài');
    }
  };

  // Handle time up
  const handleTimeUp = () => {
    Alert.alert('Hết giờ!', 'Thời gian làm bài đã kết thúc.', [
      { text: 'OK', onPress: submitQuiz },
    ]);
  };

  // Retry quiz
  const handleRetry = async () => {
    setSubmitted(false);
    setResult(null);
    setShowReview(false);
    setAnswers({});
    setCurrentIndex(0);
    await loadQuiz();
  };

  // Review answers
  const handleReview = () => {
    setShowReview(true);
    setCurrentIndex(0);
  };

  // Continue to next lesson
  const handleContinue = () => {
    navigation.goBack();
  };

  // Close quiz
  const handleClose = () => {
    if (!submitted && Object.keys(answers).length > 0) {
      Alert.alert(
        'Thoát Quiz?',
        'Bài làm của bạn sẽ không được lưu.',
        [
          { text: 'Tiếp tục làm', style: 'cancel' },
          { text: 'Thoát', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // Render loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={GRADIENTS.background}
          locations={GRADIENTS.backgroundLocations}
          style={styles.gradient}
        >
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải quiz...</Text>
        </LinearGradient>
      </View>
    );
  }

  // Render result
  if (submitted && result && !showReview) {
    const progress = getProgress(courseId);
    const isCourseComplete = progress?.percentComplete >= 100;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={GRADIENTS.background}
          locations={GRADIENTS.backgroundLocations}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeBtn} onPress={handleContinue}>
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Kết quả Quiz
              </Text>
              <View style={styles.headerRight} />
            </View>

            {/* Result Component */}
            <QuizResult
              score={result.score}
              maxScore={result.maxScore}
              percentage={result.percentage}
              passed={result.passed}
              correctCount={result.correctCount}
              totalQuestions={result.totalQuestions}
              timeSpent={result.timeSpent}
              passingScore={quiz?.passing_score || 70}
              attemptsUsed={retakeInfo.attemptsUsed}
              maxAttempts={retakeInfo.maxAttempts}
              canRetake={retakeInfo.canRetake && !result.passed}
              onRetry={handleRetry}
              onReview={handleReview}
              onContinue={handleContinue}
              onViewCertificate={() => navigation.navigate('Certificate', { courseId })}
              isCourseComplete={isCourseComplete}
            />
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  // Get current question
  const currentQuestion = questions[currentIndex];
  const isAnswered = answers[currentQuestion?.id] !== undefined;
  const isLastQuestion = currentIndex === questions.length - 1;

  // Get graded answer for review mode
  const gradedAnswer = showReview && result?.gradedAnswers?.find(
    ga => ga.questionId === currentQuestion?.id
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>

            {/* Timer (if quiz has time limit) */}
            {quiz?.time_limit_minutes && !submitted && (
              <QuizTimer
                totalMinutes={quiz.time_limit_minutes}
                onTimeUp={handleTimeUp}
              />
            )}

            {/* Quiz Title */}
            {!quiz?.time_limit_minutes && (
              <Text style={styles.headerTitle} numberOfLines={1}>
                {quiz?.title || 'Quiz'}
              </Text>
            )}

            <View style={styles.headerRight}>
              {showReview && (
                <Text style={styles.reviewBadge}>Xem lại</Text>
              )}
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <HelpCircle size={16} color={COLORS.textMuted} />
              <Text style={styles.progressText}>
                Câu {currentIndex + 1}/{questions.length}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentIndex + 1) / questions.length) * 100}%` },
                ]}
              />
            </View>
          </View>

          {/* Question */}
          <ScrollView
            style={styles.questionScroll}
            contentContainerStyle={styles.questionContainer}
            showsVerticalScrollIndicator={false}
          >
            {currentQuestion && (
              <QuizQuestion
                question={currentQuestion}
                selectedAnswer={answers[currentQuestion.id]}
                onAnswerSelect={handleAnswerSelect}
                showResult={showReview}
                isCorrect={gradedAnswer?.isCorrect}
                correctAnswer={gradedAnswer?.correctAnswer}
              />
            )}
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.navContainer}>
            {/* Previous */}
            <TouchableOpacity
              style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
              onPress={goToPrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={24} color={currentIndex === 0 ? COLORS.textMuted : COLORS.textPrimary} />
              <Text style={[styles.navBtnText, currentIndex === 0 && styles.navBtnTextDisabled]}>
                Trước
              </Text>
            </TouchableOpacity>

            {/* Question Dots */}
            <View style={styles.dotsContainer}>
              {questions.slice(
                Math.max(0, currentIndex - 2),
                Math.min(questions.length, currentIndex + 3)
              ).map((q, i) => {
                const actualIndex = Math.max(0, currentIndex - 2) + i;
                const isCurrentDot = actualIndex === currentIndex;
                const isDotAnswered = answers[q.id] !== undefined;
                const dotGraded = showReview && result?.gradedAnswers?.find(ga => ga.questionId === q.id);

                return (
                  <TouchableOpacity
                    key={q.id}
                    style={[
                      styles.dot,
                      isCurrentDot && styles.dotCurrent,
                      isDotAnswered && !showReview && styles.dotAnswered,
                      showReview && dotGraded?.isCorrect && styles.dotCorrect,
                      showReview && dotGraded && !dotGraded.isCorrect && styles.dotWrong,
                    ]}
                    onPress={() => setCurrentIndex(actualIndex)}
                  >
                    <Text style={styles.dotText}>{actualIndex + 1}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Next / Submit */}
            {!showReview && !submitted ? (
              isLastQuestion ? (
                <TouchableOpacity
                  style={[styles.navBtn, styles.submitBtn]}
                  onPress={handleSubmit}
                >
                  <Check size={24} color="#000" />
                  <Text style={[styles.navBtnText, styles.submitBtnText]}>Nộp bài</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.navBtn} onPress={goToNext}>
                  <Text style={styles.navBtnText}>Tiếp</Text>
                  <ChevronRight size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              )
            ) : (
              // In review mode
              isLastQuestion ? (
                <TouchableOpacity
                  style={[styles.navBtn, styles.doneBtn]}
                  onPress={() => setShowReview(false)}
                >
                  <Text style={styles.navBtnText}>Xong</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.navBtn} onPress={goToNext}>
                  <Text style={styles.navBtnText}>Tiếp</Text>
                  <ChevronRight size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              )
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  headerRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  reviewBadge: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.cyan,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },

  // Progress
  progressSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },

  // Question
  questionScroll: {
    flex: 1,
  },
  questionContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  // Navigation
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
  },
  navBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  navBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  navBtnTextDisabled: {
    color: COLORS.textMuted,
  },
  submitBtn: {
    backgroundColor: COLORS.gold,
  },
  submitBtnText: {
    color: '#000',
  },
  doneBtn: {
    backgroundColor: COLORS.success,
  },

  // Dots
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotCurrent: {
    backgroundColor: COLORS.gold,
  },
  dotAnswered: {
    backgroundColor: 'rgba(106, 91, 255, 0.4)',
  },
  dotCorrect: {
    backgroundColor: COLORS.success,
  },
  dotWrong: {
    backgroundColor: COLORS.error,
  },
  dotText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
});

export default QuizScreen;
