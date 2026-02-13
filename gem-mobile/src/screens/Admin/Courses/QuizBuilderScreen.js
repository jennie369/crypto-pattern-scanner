/**
 * Gemral - Quiz Builder Screen
 * Create and edit quiz questions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  Clock,
  Target,
  RefreshCw,
  GripVertical,
} from 'lucide-react-native';

import { supabase } from '../../../services/supabase';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Trắc nghiệm (1 đáp án)' },
  { value: 'multiple_select', label: 'Trắc nghiệm (nhiều đáp án)' },
  { value: 'true_false', label: 'Đúng/Sai' },
  { value: 'fill_blank', label: 'Điền vào chỗ trống' },
];

const QuizBuilderScreen = ({ navigation, route }) => {
  const { lessonId, courseId, lessonTitle } = route.params || {};
  const { alert, AlertComponent } = useCustomAlert();

  // Quiz settings
  const [quizId, setQuizId] = useState(null);
  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState('70');
  const [timeLimit, setTimeLimit] = useState('');
  const [maxAttempts, setMaxAttempts] = useState('3');
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [showAnswersAfter, setShowAnswersAfter] = useState(true);

  // Questions
  const [questions, setQuestions] = useState([]);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load quiz data
  useEffect(() => {
    loadQuizData();
  }, [lessonId]);

  const loadQuizData = async () => {
    try {
      setLoading(true);

      // Check if quiz exists for this lesson
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .single();

      if (quizError && quizError.code !== 'PGRST116') throw quizError;

      if (quiz) {
        setQuizId(quiz.id);
        setTitle(quiz.title || '');
        setPassingScore(quiz.passing_score?.toString() || '70');
        setTimeLimit(quiz.time_limit_minutes?.toString() || '');
        setMaxAttempts(quiz.max_attempts?.toString() || '3');
        setShuffleQuestions(quiz.shuffle_questions ?? true);
        setShowAnswersAfter(quiz.show_answers_after ?? true);

        // Load questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', quiz.id)
          .order('order_index', { ascending: true });

        if (questionsError) throw questionsError;

        setQuestions(questionsData || []);
      } else {
        // Create new quiz
        setTitle(`Quiz: ${lessonTitle || 'Bài học'}`);
      }
    } catch (error) {
      console.error('[QuizBuilderScreen] loadQuizData error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tải dữ liệu quiz',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setLoading(false);
    }
  };

  // Save quiz
  const handleSave = async () => {
    if (!title.trim()) {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Vui lòng nhập tên quiz',
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    try {
      setSaving(true);

      const quizData = {
        lesson_id: lessonId,
        course_id: courseId,
        title: title.trim(),
        passing_score: parseInt(passingScore) || 70,
        time_limit_minutes: timeLimit ? parseInt(timeLimit) : null,
        max_attempts: parseInt(maxAttempts) || 3,
        shuffle_questions: shuffleQuestions,
        show_answers_after: showAnswersAfter,
      };

      let savedQuizId = quizId;

      if (quizId) {
        // Update existing quiz
        const { error } = await supabase
          .from('quizzes')
          .update(quizData)
          .eq('id', quizId);

        if (error) throw error;
      } else {
        // Create new quiz
        const { data, error } = await supabase
          .from('quizzes')
          .insert(quizData)
          .select()
          .single();

        if (error) throw error;
        savedQuizId = data.id;
        setQuizId(data.id);
      }

      // Save questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionData = {
          quiz_id: savedQuizId,
          question_text: question.question_text,
          question_type: question.question_type,
          options: question.options,
          explanation: question.explanation,
          points: question.points || 1,
          order_index: i,
        };

        if (question.id && !question.id.startsWith('temp-')) {
          // Update existing question
          const { error } = await supabase
            .from('quiz_questions')
            .update(questionData)
            .eq('id', question.id);

          if (error) throw error;
        } else {
          // Create new question
          const { data, error } = await supabase
            .from('quiz_questions')
            .insert(questionData)
            .select()
            .single();

          if (error) throw error;

          // Update local state with real ID
          setQuestions(prev =>
            prev.map((q, idx) =>
              idx === i ? { ...q, id: data.id } : q
            )
          );
        }
      }

      alert({
        type: 'success',
        title: 'Thành công',
        message: 'Đã lưu quiz',
        buttons: [{ text: 'OK' }],
      });
    } catch (error) {
      console.error('[QuizBuilderScreen] save error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể lưu quiz',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setSaving(false);
    }
  };

  // Add question
  const handleAddQuestion = (type = 'multiple_choice') => {
    const newQuestion = {
      id: `temp-${Date.now()}`,
      question_text: '',
      question_type: type,
      options: type === 'true_false'
        ? [
            { text: 'Đúng', isCorrect: false },
            { text: 'Sai', isCorrect: false },
          ]
        : [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ],
      explanation: '',
      points: 1,
      order_index: questions.length,
    };

    setQuestions(prev => [...prev, newQuestion]);
    setExpandedQuestion(newQuestion.id);
  };

  // Show add question options
  const showAddQuestionOptions = () => {
    alert({
      type: 'info',
      title: 'Thêm câu hỏi',
      message: 'Chọn loại câu hỏi:',
      buttons: [
        { text: 'Trắc nghiệm (1 đáp án)', onPress: () => handleAddQuestion('multiple_choice') },
        { text: 'Đúng/Sai', onPress: () => handleAddQuestion('true_false') },
        { text: 'Hủy', style: 'cancel' },
      ],
    });
  };

  // Update question
  const updateQuestion = (questionId, updates) => {
    setQuestions(prev =>
      prev.map(q => q.id === questionId ? { ...q, ...updates } : q)
    );
  };

  // Delete question
  const handleDeleteQuestion = async (question) => {
    alert({
      type: 'warning',
      title: 'Xóa câu hỏi',
      message: 'Bạn có chắc muốn xóa câu hỏi này?',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              if (question.id && !question.id.startsWith('temp-')) {
                const { error } = await supabase
                  .from('quiz_questions')
                  .delete()
                  .eq('id', question.id);

                if (error) throw error;
              }

              setQuestions(prev => prev.filter(q => q.id !== question.id));
            } catch (error) {
              console.error('[QuizBuilderScreen] deleteQuestion error:', error);
              alert({
                type: 'error',
                title: 'Lỗi',
                message: 'Không thể xóa câu hỏi',
                buttons: [{ text: 'OK' }],
              });
            }
          }
        }
      ],
    });
  };

  // Update option
  const updateOption = (questionId, optionIndex, updates) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q;

        const newOptions = [...q.options];
        newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates };

        // For single choice, uncheck others when one is selected
        if (updates.isCorrect && q.question_type === 'multiple_choice') {
          newOptions.forEach((opt, idx) => {
            if (idx !== optionIndex) opt.isCorrect = false;
          });
        }

        return { ...q, options: newOptions };
      })
    );
  };

  // Add option
  const addOption = (questionId) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          options: [...q.options, { text: '', isCorrect: false }]
        };
      })
    );
  };

  // Remove option
  const removeOption = (questionId, optionIndex) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q;
        if (q.options.length <= 2) return q; // Minimum 2 options
        return {
          ...q,
          options: q.options.filter((_, idx) => idx !== optionIndex)
        };
      })
    );
  };

  // Render question editor
  const renderQuestionEditor = (question, index) => {
    const isExpanded = expandedQuestion === question.id;
    const typeInfo = QUESTION_TYPES.find(t => t.value === question.question_type);

    return (
      <View key={question.id} style={styles.questionCard}>
        {/* Question Header */}
        <TouchableOpacity
          style={styles.questionHeader}
          onPress={() => setExpandedQuestion(isExpanded ? null : question.id)}
        >
          <View style={styles.questionHeaderLeft}>
            <GripVertical size={18} color={COLORS.textMuted} />
            <Text style={styles.questionNumber}>Q{index + 1}</Text>
            <Text style={styles.questionPreview} numberOfLines={1}>
              {question.question_text || 'Câu hỏi mới...'}
            </Text>
          </View>
          <View style={styles.questionHeaderRight}>
            <TouchableOpacity
              style={styles.deleteQuestionBtn}
              onPress={() => handleDeleteQuestion(question)}
            >
              <Trash2 size={16} color={COLORS.error} />
            </TouchableOpacity>
            {isExpanded ? (
              <ChevronUp size={20} color={COLORS.textMuted} />
            ) : (
              <ChevronDown size={20} color={COLORS.textMuted} />
            )}
          </View>
        </TouchableOpacity>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.questionContent}>
            {/* Question Text */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Câu hỏi *</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={question.question_text}
                onChangeText={(text) => updateQuestion(question.id, { question_text: text })}
                placeholder="Nhập câu hỏi..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Question Type Badge */}
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{typeInfo?.label}</Text>
            </View>

            {/* Options */}
            {question.question_type !== 'fill_blank' && (
              <View style={styles.optionsSection}>
                <Text style={styles.inputLabel}>Đáp án</Text>
                {question.options.map((option, optIdx) => (
                  <View key={optIdx} style={styles.optionRow}>
                    <TouchableOpacity
                      style={styles.optionCheckbox}
                      onPress={() => updateOption(question.id, optIdx, { isCorrect: !option.isCorrect })}
                    >
                      {option.isCorrect ? (
                        <CheckCircle size={20} color={COLORS.success} />
                      ) : (
                        <Circle size={20} color={COLORS.textMuted} />
                      )}
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.input, styles.optionInput]}
                      value={option.text}
                      onChangeText={(text) => updateOption(question.id, optIdx, { text })}
                      placeholder={`Đáp án ${optIdx + 1}`}
                      placeholderTextColor={COLORS.textMuted}
                      editable={question.question_type !== 'true_false'}
                    />
                    {question.question_type !== 'true_false' && question.options.length > 2 && (
                      <TouchableOpacity
                        style={styles.removeOptionBtn}
                        onPress={() => removeOption(question.id, optIdx)}
                      >
                        <Trash2 size={16} color={COLORS.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {question.question_type !== 'true_false' && (
                  <TouchableOpacity
                    style={styles.addOptionBtn}
                    onPress={() => addOption(question.id)}
                  >
                    <Plus size={16} color={COLORS.gold} />
                    <Text style={styles.addOptionText}>Thêm đáp án</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Fill Blank Answer */}
            {question.question_type === 'fill_blank' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Đáp án đúng</Text>
                <TextInput
                  style={styles.input}
                  value={question.options[0]?.text || ''}
                  onChangeText={(text) => updateQuestion(question.id, {
                    options: [{ text, isCorrect: true }]
                  })}
                  placeholder="Nhập đáp án đúng..."
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            )}

            {/* Explanation */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Giải thích (hiện sau khi trả lời)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={question.explanation}
                onChangeText={(text) => updateQuestion(question.id, { explanation: text })}
                placeholder="Giải thích đáp án..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Points */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Điểm</Text>
              <TextInput
                style={[styles.input, { width: 80 }]}
                value={question.points?.toString() || '1'}
                onChangeText={(text) => updateQuestion(question.id, { points: parseInt(text) || 1 })}
                keyboardType="numeric"
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Quiz Builder</Text>
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Save size={20} color="#000" />
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Quiz Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cài đặt Quiz</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên quiz</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="VD: Quiz cuối bài"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <View style={styles.settingsRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <View style={styles.settingLabel}>
                    <Target size={16} color={COLORS.textMuted} />
                    <Text style={styles.inputLabel}>Điểm đạt (%)</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={passingScore}
                    onChangeText={setPassingScore}
                    keyboardType="numeric"
                    placeholder="70"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <View style={styles.settingLabel}>
                    <Clock size={16} color={COLORS.textMuted} />
                    <Text style={styles.inputLabel}>Thời gian (phút)</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={timeLimit}
                    onChangeText={setTimeLimit}
                    keyboardType="numeric"
                    placeholder="Không giới hạn"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <View style={styles.settingLabel}>
                    <RefreshCw size={16} color={COLORS.textMuted} />
                    <Text style={styles.inputLabel}>Số lần làm</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={maxAttempts}
                    onChangeText={setMaxAttempts}
                    keyboardType="numeric"
                    placeholder="3"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>

              {/* Toggles */}
              <View style={styles.togglesContainer}>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Xáo trộn câu hỏi</Text>
                  <Switch
                    value={shuffleQuestions}
                    onValueChange={setShuffleQuestions}
                    trackColor={{ false: GLASS.border, true: COLORS.gold }}
                    thumbColor="#fff"
                  />
                </View>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Hiển thị đáp án sau khi nộp</Text>
                  <Switch
                    value={showAnswersAfter}
                    onValueChange={setShowAnswersAfter}
                    trackColor={{ false: GLASS.border, true: COLORS.gold }}
                    thumbColor="#fff"
                  />
                </View>
              </View>
            </View>

            {/* Questions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Câu hỏi ({questions.length})
                </Text>
                <TouchableOpacity
                  style={styles.addQuestionBtn}
                  onPress={showAddQuestionOptions}
                >
                  <Plus size={18} color="#000" />
                  <Text style={styles.addQuestionBtnText}>Thêm</Text>
                </TouchableOpacity>
              </View>

              {questions.length === 0 ? (
                <View style={styles.emptyQuestions}>
                  <Text style={styles.emptyQuestionsText}>Chưa có câu hỏi nào</Text>
                  <Text style={styles.emptyQuestionsHint}>
                    Nhấn "Thêm" để tạo câu hỏi mới
                  </Text>
                </View>
              ) : (
                <View style={styles.questionsList}>
                  {questions.map((question, index) =>
                    renderQuestionEditor(question, index)
                  )}
                </View>
              )}
            </View>

            {/* Bottom Spacer */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {AlertComponent}
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
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  saveBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    borderRadius: 12,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
  },

  // Sections
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textPrimary,
  },

  // Input
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Settings
  settingsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  togglesContainer: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GLASS.border,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: GLASS.border,
  },
  toggleLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },

  // Questions
  addQuestionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  addQuestionBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: '#000',
  },
  emptyQuestions: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderStyle: 'dashed',
  },
  emptyQuestionsText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  emptyQuestionsHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  questionsList: {
    gap: SPACING.sm,
  },
  questionCard: {
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  questionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  questionNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  questionPreview: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    flex: 1,
  },
  questionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  deleteQuestionBtn: {
    padding: 4,
  },
  questionContent: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: GLASS.border,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: SPACING.md,
  },
  typeBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#6A5BFF',
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },

  // Options
  optionsSection: {
    marginBottom: SPACING.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  optionCheckbox: {
    padding: 4,
  },
  optionInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeOptionBtn: {
    padding: 8,
  },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: SPACING.sm,
  },
  addOptionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
  },
});

export default QuizBuilderScreen;
