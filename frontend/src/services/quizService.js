/**
 * GEM Web App - Quiz Service
 * Handles quiz operations: fetch questions, submit attempts, track progress
 * Mirrors mobile quizService.js
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Quiz Service Class
 */
class QuizService {
  constructor() {
    this._cache = {};
  }

  // =====================
  // QUIZ FETCHING
  // =====================

  /**
   * Get quiz by lesson ID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object|null>} Quiz with questions
   */
  async getQuizByLesson(lessonId) {
    return this.getQuizByLessonId(lessonId);
  }

  /**
   * Get quiz by lesson ID (alias)
   * @param {string} lessonId - Lesson ID
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
        console.warn('[QuizService] Quiz not found for lesson:', lessonId);
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
   * @param {string} quizId - Quiz ID
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

      if (error) throw error;

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

  // =====================
  // QUIZ ATTEMPTS
  // =====================

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

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[QuizService] getQuizAttempts error:', error);
      return [];
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
        // No attempts found
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
   * @returns {Promise<Object>} { canRetake, attemptsUsed, maxAttempts }
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
   * @param {Object} quizData - { quizId, lessonId, courseId, maxScore }
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

      if (error) throw error;
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

      if (error) throw error;

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

      if (error) return false;
      return data && data.length > 0;
    } catch (error) {
      console.error('[QuizService] isQuizPassed error:', error);
      return false;
    }
  }

  // =====================
  // ADMIN METHODS
  // =====================

  /**
   * Create a new quiz
   * @param {Object} quizData - Quiz data
   * @returns {Promise<Object>} Result
   */
  async createQuiz(quizData) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert(quizData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[QuizService] createQuiz error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update quiz
   * @param {string} quizId - Quiz ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Result
   */
  async updateQuiz(quizId, updates) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .update(updates)
        .eq('id', quizId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[QuizService] updateQuiz error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete quiz
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Object>} Result
   */
  async deleteQuiz(quizId) {
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[QuizService] deleteQuiz error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new question
   * @param {Object} questionData - Question data
   * @returns {Promise<Object>} Result
   */
  async createQuestion(questionData) {
    try {
      // Get max order_index
      const { data: existing } = await supabase
        .from('quiz_questions')
        .select('order_index')
        .eq('quiz_id', questionData.quiz_id)
        .order('order_index', { ascending: false })
        .limit(1);

      const newOrder = (existing?.[0]?.order_index || 0) + 1;

      const { data, error } = await supabase
        .from('quiz_questions')
        .insert({
          ...questionData,
          order_index: newOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[QuizService] createQuestion error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update question
   * @param {string} questionId - Question ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Result
   */
  async updateQuestion(questionId, updates) {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .update(updates)
        .eq('id', questionId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[QuizService] updateQuestion error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete question
   * @param {string} questionId - Question ID
   * @returns {Promise<Object>} Result
   */
  async deleteQuestion(questionId) {
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[QuizService] deleteQuestion error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reorder questions
   * @param {string} quizId - Quiz ID
   * @param {Array} questionIds - Ordered array of question IDs
   * @returns {Promise<Object>} Result
   */
  async reorderQuestions(quizId, questionIds) {
    try {
      for (let i = 0; i < questionIds.length; i++) {
        await supabase
          .from('quiz_questions')
          .update({ order_index: i + 1 })
          .eq('id', questionIds[i]);
      }
      return { success: true };
    } catch (error) {
      console.error('[QuizService] reorderQuestions error:', error);
      return { success: false, error: error.message };
    }
  }

  // =====================
  // GRADING LOGIC
  // =====================

  /**
   * Grade quiz answers
   * @private
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

  // =====================
  // UTILITY METHODS
  // =====================

  /**
   * Shuffle array (for randomizing questions/options)
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
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get question types
   */
  getQuestionTypes() {
    return [
      { id: 'multiple_choice', name: 'Trắc nghiệm', icon: 'CircleDot' },
      { id: 'true_false', name: 'Đúng/Sai', icon: 'Check' },
      { id: 'multiple_select', name: 'Chọn nhiều', icon: 'CheckSquare' },
      { id: 'fill_blank', name: 'Điền vào chỗ trống', icon: 'Edit3' },
    ];
  }
}

export const quizService = new QuizService();
export default quizService;
