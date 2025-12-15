/**
 * QuizBuilder - Create/Edit Quiz Questions
 * Supports: multiple_choice, true_false, multiple_select, fill_blank
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Check,
  X,
  Circle,
  CheckCircle2,
  Square,
  CheckSquare,
  Type,
  Loader2,
  AlertCircle,
  GripVertical,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { quizService } from '../../services/quizService';
import { lessonService } from '../../services/lessonService';
import './QuizBuilder.css';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Trắc nghiệm', icon: Circle, description: 'Một đáp án đúng' },
  { value: 'true_false', label: 'Đúng/Sai', icon: CheckCircle2, description: 'Đúng hoặc Sai' },
  { value: 'multiple_select', label: 'Chọn nhiều', icon: CheckSquare, description: 'Nhiều đáp án đúng' },
  { value: 'fill_blank', label: 'Điền vào chỗ trống', icon: Type, description: 'Nhập câu trả lời' },
];

// Question Card Component
function QuestionCard({ question, index, onUpdate, onDelete, isExpanded, onToggle }) {
  const [localQuestion, setLocalQuestion] = useState(question);

  useEffect(() => {
    setLocalQuestion(question);
  }, [question]);

  const handleFieldChange = (field, value) => {
    const updated = { ...localQuestion, [field]: value };
    setLocalQuestion(updated);
    onUpdate(updated);
  };

  const handleOptionChange = (optionIndex, value) => {
    const newOptions = [...(localQuestion.options || [])];
    newOptions[optionIndex] = value;
    handleFieldChange('options', newOptions);
  };

  const addOption = () => {
    const newOptions = [...(localQuestion.options || []), ''];
    handleFieldChange('options', newOptions);
  };

  const removeOption = (optionIndex) => {
    const newOptions = localQuestion.options.filter((_, i) => i !== optionIndex);
    // Also update correct_answer if needed
    let newCorrectAnswer = localQuestion.correct_answer;
    if (localQuestion.question_type === 'multiple_choice') {
      if (parseInt(newCorrectAnswer) === optionIndex) {
        newCorrectAnswer = '0';
      } else if (parseInt(newCorrectAnswer) > optionIndex) {
        newCorrectAnswer = String(parseInt(newCorrectAnswer) - 1);
      }
    } else if (localQuestion.question_type === 'multiple_select') {
      const selectedIndices = newCorrectAnswer.split(',').map(Number);
      const newSelected = selectedIndices
        .filter(i => i !== optionIndex)
        .map(i => i > optionIndex ? i - 1 : i);
      newCorrectAnswer = newSelected.join(',');
    }

    const updated = { ...localQuestion, options: newOptions, correct_answer: newCorrectAnswer };
    setLocalQuestion(updated);
    onUpdate(updated);
  };

  const handleCorrectAnswerChange = (optionIndex) => {
    if (localQuestion.question_type === 'multiple_choice') {
      handleFieldChange('correct_answer', String(optionIndex));
    } else if (localQuestion.question_type === 'multiple_select') {
      const currentSelected = localQuestion.correct_answer
        ? localQuestion.correct_answer.split(',').map(Number)
        : [];

      let newSelected;
      if (currentSelected.includes(optionIndex)) {
        newSelected = currentSelected.filter(i => i !== optionIndex);
      } else {
        newSelected = [...currentSelected, optionIndex].sort((a, b) => a - b);
      }
      handleFieldChange('correct_answer', newSelected.join(','));
    }
  };

  const isOptionCorrect = (optionIndex) => {
    if (localQuestion.question_type === 'multiple_choice') {
      return String(optionIndex) === localQuestion.correct_answer;
    } else if (localQuestion.question_type === 'multiple_select') {
      const selectedIndices = localQuestion.correct_answer
        ? localQuestion.correct_answer.split(',').map(Number)
        : [];
      return selectedIndices.includes(optionIndex);
    }
    return false;
  };

  const questionType = QUESTION_TYPES.find(t => t.value === localQuestion.question_type);

  return (
    <div className={`question-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="question-header" onClick={onToggle}>
        <div className="question-drag-handle">
          <GripVertical size={20} />
        </div>
        <div className="question-info">
          <span className="question-number">Câu {index + 1}</span>
          <span className="question-type-badge">
            {questionType && <questionType.icon size={14} />}
            {questionType?.label}
          </span>
        </div>
        <div className="question-preview">
          {localQuestion.question_text?.slice(0, 50) || 'Chưa có câu hỏi'}
          {(localQuestion.question_text?.length || 0) > 50 && '...'}
        </div>
        <div className="question-actions-header">
          <button
            className="btn-delete-question"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 size={16} />
          </button>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div className="question-body">
          {/* Question Type */}
          <div className="form-group">
            <label className="form-label">Loại câu hỏi</label>
            <div className="question-type-selector">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  className={`type-btn ${localQuestion.question_type === type.value ? 'selected' : ''}`}
                  onClick={() => {
                    const updated = {
                      ...localQuestion,
                      question_type: type.value,
                      options: type.value === 'true_false'
                        ? ['Đúng', 'Sai']
                        : type.value === 'fill_blank'
                          ? []
                          : localQuestion.options?.length > 0
                            ? localQuestion.options
                            : ['', '', '', ''],
                      correct_answer: type.value === 'true_false' ? '0' : '',
                    };
                    setLocalQuestion(updated);
                    onUpdate(updated);
                  }}
                >
                  <type.icon size={18} />
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div className="form-group">
            <label className="form-label">
              Câu hỏi <span className="required">*</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="Nhập câu hỏi..."
              value={localQuestion.question_text || ''}
              onChange={(e) => handleFieldChange('question_text', e.target.value)}
              rows={3}
            />
          </div>

          {/* Options (for multiple_choice, true_false, multiple_select) */}
          {['multiple_choice', 'true_false', 'multiple_select'].includes(localQuestion.question_type) && (
            <div className="form-group">
              <label className="form-label">
                Các đáp án
                {localQuestion.question_type === 'multiple_select' && (
                  <span className="label-hint">(Chọn nhiều đáp án đúng)</span>
                )}
              </label>
              <div className="options-list">
                {(localQuestion.options || []).map((option, optionIndex) => (
                  <div key={optionIndex} className="option-row">
                    <button
                      type="button"
                      className={`option-marker ${isOptionCorrect(optionIndex) ? 'correct' : ''}`}
                      onClick={() => handleCorrectAnswerChange(optionIndex)}
                      disabled={localQuestion.question_type === 'true_false'}
                    >
                      {localQuestion.question_type === 'multiple_select' ? (
                        isOptionCorrect(optionIndex) ? <CheckSquare size={20} /> : <Square size={20} />
                      ) : (
                        isOptionCorrect(optionIndex) ? <CheckCircle2 size={20} /> : <Circle size={20} />
                      )}
                    </button>
                    <input
                      type="text"
                      className="option-input"
                      placeholder={`Đáp án ${String.fromCharCode(65 + optionIndex)}`}
                      value={option}
                      onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                      disabled={localQuestion.question_type === 'true_false'}
                    />
                    {localQuestion.question_type !== 'true_false' && localQuestion.options.length > 2 && (
                      <button
                        type="button"
                        className="btn-remove-option"
                        onClick={() => removeOption(optionIndex)}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {localQuestion.question_type !== 'true_false' && (
                <button type="button" className="btn-add-option" onClick={addOption}>
                  <Plus size={16} />
                  Thêm đáp án
                </button>
              )}
            </div>
          )}

          {/* Fill in the blank answer */}
          {localQuestion.question_type === 'fill_blank' && (
            <div className="form-group">
              <label className="form-label">
                Đáp án đúng <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Nhập đáp án đúng..."
                value={localQuestion.correct_answer || ''}
                onChange={(e) => handleFieldChange('correct_answer', e.target.value)}
              />
              <span className="form-hint">Người học cần nhập chính xác đáp án này</span>
            </div>
          )}

          {/* Explanation */}
          <div className="form-group">
            <label className="form-label">Giải thích (tùy chọn)</label>
            <textarea
              className="form-textarea"
              placeholder="Giải thích tại sao đáp án này đúng..."
              value={localQuestion.explanation || ''}
              onChange={(e) => handleFieldChange('explanation', e.target.value)}
              rows={2}
            />
          </div>

          {/* Points */}
          <div className="form-group">
            <label className="form-label">Điểm</label>
            <input
              type="number"
              className="form-input points-input"
              value={localQuestion.points || 1}
              onChange={(e) => handleFieldChange('points', parseInt(e.target.value) || 1)}
              min={1}
              max={100}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizBuilder() {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  // Fetch quiz data
  const fetchQuizData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch lesson info
      const lessonData = await lessonService.getLesson(lessonId);
      setLesson(lessonData);

      // Fetch or create quiz
      let quizData = await quizService.getQuizByLesson(lessonId);

      if (!quizData) {
        // Create new quiz for this lesson
        quizData = await quizService.createQuiz({
          lesson_id: lessonId,
          title: `Quiz - ${lessonData.title}`,
          passing_score: 70,
          time_limit_minutes: null,
        });
      }

      setQuiz(quizData);

      // Fetch questions
      const questionsData = await quizService.getQuestions(quizData.id);
      setQuestions(questionsData || []);

      // Expand first question
      if (questionsData?.length > 0) {
        setExpandedQuestions({ [questionsData[0].id]: true });
      }
    } catch (err) {
      console.error('[QuizBuilder] Error:', err);
      setError('Không thể tải dữ liệu quiz');
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchQuizData();
  }, [fetchQuizData]);

  // Add new question
  const handleAddQuestion = () => {
    const newQuestion = {
      id: `temp_${Date.now()}`,
      quiz_id: quiz?.id,
      question_type: 'multiple_choice',
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: '0',
      explanation: '',
      points: 1,
      order_index: questions.length,
      isNew: true,
    };
    setQuestions(prev => [...prev, newQuestion]);
    setExpandedQuestions(prev => ({ ...prev, [newQuestion.id]: true }));
  };

  // Update question
  const handleUpdateQuestion = (index, updatedQuestion) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...updatedQuestion, isModified: true } : q));
  };

  // Delete question
  const handleDeleteQuestion = async (index) => {
    const question = questions[index];

    if (!confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;

    // If it's a saved question, delete from database
    if (!question.isNew && question.id) {
      try {
        await quizService.deleteQuestion(question.id);
      } catch (err) {
        console.error('[QuizBuilder] Delete error:', err);
        setError('Không thể xóa câu hỏi');
        return;
      }
    }

    setQuestions(prev => prev.filter((_, i) => i !== index));
    showSuccess('Đã xóa câu hỏi');
  };

  // Toggle question expansion
  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Save all questions
  const handleSave = async () => {
    // Validate questions
    const invalidQuestions = questions.filter(q =>
      !q.question_text?.trim() ||
      (q.question_type !== 'fill_blank' && (!q.options || q.options.some(o => !o.trim()))) ||
      (q.question_type === 'fill_blank' && !q.correct_answer?.trim())
    );

    if (invalidQuestions.length > 0) {
      setError('Vui lòng điền đầy đủ thông tin cho tất cả câu hỏi');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionData = {
          quiz_id: quiz.id,
          question_type: question.question_type,
          question_text: question.question_text,
          options: question.question_type === 'fill_blank' ? [] : question.options,
          correct_answer: question.correct_answer,
          explanation: question.explanation || null,
          points: question.points || 1,
          order_index: i,
        };

        if (question.isNew) {
          const savedQuestion = await quizService.createQuestion(questionData);
          // Update the question with the saved id
          setQuestions(prev => prev.map((q, idx) =>
            idx === i ? { ...savedQuestion, isNew: false, isModified: false } : q
          ));
        } else if (question.isModified) {
          await quizService.updateQuestion(question.id, questionData);
          setQuestions(prev => prev.map((q, idx) =>
            idx === i ? { ...q, isModified: false } : q
          ));
        }
      }

      showSuccess('Đã lưu tất cả câu hỏi');
    } catch (err) {
      console.error('[QuizBuilder] Save error:', err);
      setError(err.message || 'Không thể lưu câu hỏi');
    } finally {
      setIsSaving(false);
    }
  };

  // Show success message
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="quiz-builder-page">
        <div className="builder-loading">
          <Loader2 size={48} className="loading-spinner-icon" />
          <p>Đang tải quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-builder-page">
      {/* Header */}
      <div className="builder-header">
        <button
          className="btn-back"
          onClick={() => navigate(`/courses/admin/edit/${courseId}/modules/${moduleId}/lessons/${lessonId}`)}
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>

        <div className="header-title">
          <h1 className="builder-title">
            <HelpCircle size={24} />
            Quản lý câu hỏi Quiz
          </h1>
          {lesson && (
            <span className="lesson-name">Bài học: {lesson.title}</span>
          )}
        </div>

        <div className="builder-actions">
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 size={18} className="loading-spinner-icon" /> : <Save size={18} />}
            {isSaving ? 'Đang lưu...' : 'Lưu tất cả'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="message-success">
          <Check size={18} />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="message-error">
          <AlertCircle size={18} />
          {error}
          <button onClick={() => setError(null)}><X size={16} /></button>
        </div>
      )}

      {/* Quiz Settings */}
      {quiz && (
        <div className="quiz-settings">
          <div className="setting-item">
            <label className="setting-label">Điểm đậu (%)</label>
            <input
              type="number"
              className="setting-input"
              value={quiz.passing_score || 70}
              onChange={async (e) => {
                const newScore = parseInt(e.target.value) || 70;
                setQuiz(prev => ({ ...prev, passing_score: newScore }));
                await quizService.updateQuiz(quiz.id, { passing_score: newScore });
              }}
              min={0}
              max={100}
            />
          </div>
          <div className="setting-item">
            <label className="setting-label">Giới hạn thời gian (phút)</label>
            <input
              type="number"
              className="setting-input"
              value={quiz.time_limit_minutes || ''}
              placeholder="Không giới hạn"
              onChange={async (e) => {
                const newLimit = e.target.value ? parseInt(e.target.value) : null;
                setQuiz(prev => ({ ...prev, time_limit_minutes: newLimit }));
                await quizService.updateQuiz(quiz.id, { time_limit_minutes: newLimit });
              }}
              min={1}
            />
          </div>
          <div className="setting-item">
            <span className="setting-label">Tổng số câu hỏi</span>
            <span className="setting-value">{questions.length}</span>
          </div>
          <div className="setting-item">
            <span className="setting-label">Tổng điểm</span>
            <span className="setting-value">{questions.reduce((sum, q) => sum + (q.points || 1), 0)}</span>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="questions-container">
        {questions.length === 0 ? (
          <div className="questions-empty">
            <HelpCircle size={64} />
            <h3>Chưa có câu hỏi nào</h3>
            <p>Thêm câu hỏi đầu tiên cho quiz</p>
          </div>
        ) : (
          questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              onUpdate={(updated) => handleUpdateQuestion(index, updated)}
              onDelete={() => handleDeleteQuestion(index)}
              isExpanded={expandedQuestions[question.id]}
              onToggle={() => toggleQuestion(question.id)}
            />
          ))
        )}

        {/* Add Question Button */}
        <button className="btn-add-question" onClick={handleAddQuestion}>
          <Plus size={20} />
          Thêm câu hỏi
        </button>
      </div>
    </div>
  );
}
