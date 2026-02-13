/**
 * Gemral - Quiz Service
 * Handles quiz operations: fetch questions, submit attempts, track progress
 * Uses Supabase with AsyncStorage fallback for offline support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// Storage keys for offline support
const QUIZ_ATTEMPTS_KEY = '@gem_quiz_attempts';

/**
 * Quiz Service Class
 */
class QuizService {
  constructor() {
    this._cache = {};
  }

  // ==================== QUIZ FETCHING ====================

  /**
   * Get quiz by lesson ID
   * @param {string} lessonId - The lesson ID
   * @returns {Promise<Object|null>} Quiz with questions
   */
  async getQuizByLessonId(lessonId) {
    try {
      const { data: quiz, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          questions:quiz_questions(*)
        `)
        .eq('lesson_id', lessonId)
        .single();

      if (error) {
        console.warn('[QuizService] Supabase error:', error.message);
        return null;
      }

      // Sort questions by order_index
      if (quiz?.questions) {
        quiz.questions.sort((a, b) => a.order_index - b.order_index);
      }

      return quiz;
    } catch (error) {
      console.error('[QuizService] getQuizByLessonId error:', error);
      return null;
    }
  }

  /**
   * Get quiz by ID
   * @param {string} quizId - The quiz ID
   * @returns {Promise<Object|null>} Quiz with questions
   */
  async getQuizById(quizId) {
    try {
      const { data: quiz, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          questions:quiz_questions(*)
        `)
        .eq('id', quizId)
        .single();

      if (error) {
        console.warn('[QuizService] Supabase error:', error.message);
        return null;
      }

      // Sort questions by order_index
      if (quiz?.questions) {
        quiz.questions.sort((a, b) => a.order_index - b.order_index);
      }

      return quiz;
    } catch (error) {
      console.error('[QuizService] getQuizById error:', error);
      return null;
    }
  }

  // ==================== QUIZ ATTEMPTS ====================

  /**
   * Get user's quiz attempts
   * @param {string} userId - User ID
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Array>} List of attempts
   */
  async getQuizAttempts(userId, quizId) {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .eq('quiz_id', quizId)
        .order('started_at', { ascending: false });

      if (error) {
        console.warn('[QuizService] Error fetching attempts:', error.message);
        // Fallback to local storage
        return this._getLocalAttempts(userId, quizId);
      }

      return data || [];
    } catch (error) {
      console.error('[QuizService] getQuizAttempts error:', error);
      return this._getLocalAttempts(userId, quizId);
    }
  }

  /**
   * Get user's best quiz score
   * @param {string} userId - User ID
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Object|null>} Best attempt or null
   */
  async getBestAttempt(userId, quizId) {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .eq('quiz_id', quizId)
        .not('completed_at', 'is', null)
        .order('score_percentage', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.warn('[QuizService] Error fetching best attempt:', error.message);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[QuizService] getBestAttempt error:', error);
      return null;
    }
  }

  /**
   * Check if user can retake quiz
   * @param {string} userId - User ID
   * @param {string} quizId - Quiz ID
   * @returns {Promise<{canRetake: boolean, attemptsUsed: number, maxAttempts: number|null}>}
   */
  async canRetakeQuiz(userId, quizId) {
    try {
      // Get quiz max_attempts
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('max_attempts')
        .eq('id', quizId)
        .single();

      if (quizError) {
        console.warn('[QuizService] Error fetching quiz:', quizError.message);
        return { canRetake: true, attemptsUsed: 0, maxAttempts: null };
      }

      // If no limit, always can retake
      if (!quiz.max_attempts) {
        return { canRetake: true, attemptsUsed: 0, maxAttempts: null };
      }

      // Count completed attempts
      const { count, error: countError } = await supabase
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('quiz_id', quizId)
        .not('completed_at', 'is', null);

      if (countError) {
        console.warn('[QuizService] Error counting attempts:', countError.message);
        return { canRetake: true, attemptsUsed: 0, maxAttempts: quiz.max_attempts };
      }

      const attemptsUsed = count || 0;
      return {
        canRetake: attemptsUsed < quiz.max_attempts,
        attemptsUsed,
        maxAttempts: quiz.max_attempts,
      };
    } catch (error) {
      console.error('[QuizService] canRetakeQuiz error:', error);
      return { canRetake: true, attemptsUsed: 0, maxAttempts: null };
    }
  }

  /**
   * Start a new quiz attempt
   * @param {string} userId - User ID
   * @param {Object} quizData - Quiz data { quizId, lessonId, courseId, maxScore }
   * @returns {Promise<Object|null>} Created attempt
   */
  async startAttempt(userId, quizData) {
    try {
      const { quizId, lessonId, courseId, maxScore } = quizData;

      // Get current attempt number
      const { count } = await supabase
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('quiz_id', quizId);

      const attemptNumber = (count || 0) + 1;

      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: userId,
          quiz_id: quizId,
          lesson_id: lessonId,
          course_id: courseId,
          attempt_number: attemptNumber,
          max_score: maxScore,
          answers: {},
          graded_answers: [],
        })
        .select()
        .single();

      if (error) {
        console.error('[QuizService] Error starting attempt:', error.message);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[QuizService] startAttempt error:', error);
      return null;
    }
  }

  /**
   * Submit quiz attempt
   * @param {string} attemptId - Attempt ID
   * @param {Object} submitData - { answers, timeSpentSeconds }
   * @param {Array} questions - Quiz questions for grading
   * @returns {Promise<Object>} Graded result
   */
  async submitAttempt(attemptId, submitData, questions) {
    try {
      const { answers, timeSpentSeconds } = submitData;

      // Grade the answers
      const gradedResult = this._gradeAnswers(answers, questions);

      // Update attempt in database
      const { data, error } = await supabase
        .from('quiz_attempts')
        .update({
          answers,
          score: gradedResult.score,
          score_percentage: gradedResult.percentage,
          passed: gradedResult.passed,
          time_spent_seconds: timeSpentSeconds,
          completed_at: new Date().toISOString(),
          graded_answers: gradedResult.gradedAnswers,
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (error) {
        console.error('[QuizService] Error submitting attempt:', error.message);
        // Save to local storage as backup
        await this._saveLocalAttempt(attemptId, { ...submitData, ...gradedResult });
        return { success: false, error: error.message, ...gradedResult };
      }

      return { success: true, attempt: data, ...gradedResult };
    } catch (error) {
      console.error('[QuizService] submitAttempt error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if user passed quiz for a lesson
   * @param {string} userId - User ID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<boolean>}
   */
  async isQuizPassed(userId, lessonId) {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('passed')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .eq('passed', true)
        .limit(1);

      if (error) {
        console.warn('[QuizService] Error checking quiz passed:', error.message);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('[QuizService] isQuizPassed error:', error);
      return false;
    }
  }

  // ==================== GRADING LOGIC ====================

  /**
   * Grade quiz answers
   * @private
   * @param {Object} answers - User answers { questionId: answer }
   * @param {Array} questions - Quiz questions
   * @returns {Object} Graded result
   */
  _gradeAnswers(answers, questions) {
    let score = 0;
    let maxScore = 0;
    const gradedAnswers = [];

    questions.forEach((question) => {
      const userAnswer = answers[question.id];
      const points = question.points || 1;
      maxScore += points;

      let isCorrect = false;

      switch (question.question_type) {
        case 'multiple_choice':
        case 'true_false':
          // Find correct option
          const correctOption = question.options?.find(opt => opt.is_correct);
          isCorrect = correctOption && userAnswer === correctOption.id;
          break;

        case 'multiple_select':
          // All correct options must be selected, no incorrect ones
          const correctIds = question.options
            ?.filter(opt => opt.is_correct)
            .map(opt => opt.id) || [];
          const selectedIds = Array.isArray(userAnswer) ? userAnswer : [];

          isCorrect =
            correctIds.length === selectedIds.length &&
            correctIds.every(id => selectedIds.includes(id));
          break;

        case 'fill_blank':
          // Check if answer matches any accepted answer (case-insensitive)
          const correctAnswers = question.correct_answers || [];
          const userText = (userAnswer || '').trim().toLowerCase();
          isCorrect = correctAnswers.some(
            ans => ans.toLowerCase() === userText
          );
          break;

        default:
          isCorrect = false;
      }

      if (isCorrect) {
        score += points;
      }

      gradedAnswers.push({
        questionId: question.id,
        selected: userAnswer,
        isCorrect,
        correctAnswer: this._getCorrectAnswer(question),
        explanation: question.explanation,
      });
    });

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    return {
      score,
      maxScore,
      percentage,
      passed: percentage >= 70, // Default passing score
      gradedAnswers,
      correctCount: gradedAnswers.filter(a => a.isCorrect).length,
      totalQuestions: questions.length,
    };
  }

  /**
   * Get correct answer for a question
   * @private
   */
  _getCorrectAnswer(question) {
    switch (question.question_type) {
      case 'multiple_choice':
      case 'true_false':
        return question.options?.find(opt => opt.is_correct)?.id;

      case 'multiple_select':
        return question.options?.filter(opt => opt.is_correct).map(opt => opt.id);

      case 'fill_blank':
        return question.correct_answers?.[0];

      default:
        return null;
    }
  }

  // ==================== LOCAL STORAGE FALLBACK ====================

  /**
   * Get local attempts (offline fallback)
   * @private
   */
  async _getLocalAttempts(userId, quizId) {
    try {
      const data = await AsyncStorage.getItem(QUIZ_ATTEMPTS_KEY);
      const allAttempts = data ? JSON.parse(data) : {};
      const key = `${userId}_${quizId}`;
      return allAttempts[key] || [];
    } catch (error) {
      console.error('[QuizService] Error reading local attempts:', error);
      return [];
    }
  }

  /**
   * Save attempt locally (offline backup)
   * @private
   */
  async _saveLocalAttempt(attemptId, attemptData) {
    try {
      const data = await AsyncStorage.getItem(QUIZ_ATTEMPTS_KEY);
      const allAttempts = data ? JSON.parse(data) : {};

      if (!allAttempts.pending) {
        allAttempts.pending = [];
      }

      allAttempts.pending.push({
        id: attemptId,
        ...attemptData,
        savedAt: new Date().toISOString(),
      });

      await AsyncStorage.setItem(QUIZ_ATTEMPTS_KEY, JSON.stringify(allAttempts));
    } catch (error) {
      console.error('[QuizService] Error saving local attempt:', error);
    }
  }

  // ==================== UTILITY ====================

  /**
   * Shuffle array (for randomizing questions/options)
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled copy
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Format time in MM:SS
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

export const quizService = new QuizService();
export default quizService;
