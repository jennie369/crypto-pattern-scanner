/**
 * HTML Lesson Renderer Component (Student View)
 * Renders parsed lesson content for students with interactive quizzes
 * Features: Progress tracking, quiz completion, realtime updates
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Award,
  RefreshCw,
  Loader,
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { supabase } from '../../../lib/supabaseClient';
import './HTMLLessonRenderer.css';

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

  // Use realtime content if available
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
          console.log('[HTMLLessonRenderer] Realtime update:', payload);
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

  // Calculate progress when quizzes complete
  useEffect(() => {
    if (!displayContent?.quizzes?.length) {
      setLessonProgress(100);
      return;
    }

    const totalQuizzes = displayContent.quizzes.length;
    const completed = completedQuizzes.length;
    const progress = Math.round((completed / totalQuizzes) * 100);
    setLessonProgress(progress);

    // Mark lesson complete when all quizzes done
    if (progress === 100 && onComplete) {
      onComplete(lessonId);
    }
  }, [completedQuizzes, displayContent]);

  const loadProgress = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return;

      const { data, error } = await supabase
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
      // No progress yet - that's fine
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
      <div className="lesson-renderer-empty">
        <Loader size={24} className="spin" />
        <span>Đang tải nội dung bài học...</span>
      </div>
    );
  }

  return (
    <div className="html-lesson-renderer">
      {/* Progress Bar */}
      {displayContent.quizzes?.length > 0 && (
        <div className="lesson-progress-bar">
          <div className="progress-info">
            <span>Tiến độ bài học</span>
            <span className="progress-percent">{lessonProgress}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${lessonProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Title */}
      {displayContent.metadata?.title && (
        <h1 className="lesson-title">{displayContent.metadata.title}</h1>
      )}

      {/* Content Blocks */}
      {displayContent.blocks?.map((block) => (
        <ContentBlock key={block.id} block={block} />
      ))}

      {/* Embedded Quizzes */}
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

      {/* Completion Message */}
      {lessonProgress === 100 && displayContent.quizzes?.length > 0 && (
        <div className="lesson-complete-banner">
          <Award size={24} />
          <div className="complete-message">
            <strong>Chúc mừng!</strong>
            <span>Bạn đã hoàn thành bài học này.</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Content Block Renderer
 */
function ContentBlock({ block }) {
  switch (block.type) {
    case 'heading':
      const HeadingTag = `h${block.level}`;
      return (
        <HeadingTag className={`render-heading render-h${block.level}`}>
          {block.content}
        </HeadingTag>
      );

    case 'paragraph':
      return (
        <p
          className="render-paragraph"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(block.html || block.content),
          }}
        />
      );

    case 'list':
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag className={`render-list ${block.ordered ? 'ordered' : 'unordered'}`}>
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ListTag>
      );

    case 'image':
      return (
        <figure className="render-figure">
          <img
            src={block.src}
            alt={block.alt || ''}
            className="render-image"
            loading="lazy"
          />
          {block.caption && (
            <figcaption className="render-caption">{block.caption}</figcaption>
          )}
        </figure>
      );

    case 'callout':
      const icons = {
        quote: null,
        tip: <Lightbulb size={18} />,
        warning: <AlertCircle size={18} />,
        info: <Info size={18} />,
        success: <CheckCircle size={18} />,
      };
      return (
        <blockquote className={`render-callout callout-${block.style}`}>
          {icons[block.style] && (
            <span className="callout-icon">{icons[block.style]}</span>
          )}
          <span
            className="callout-content"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(block.html || block.content),
            }}
          />
        </blockquote>
      );

    case 'code':
      return (
        <pre className="render-code">
          <code className={`language-${block.language}`}>{block.content}</code>
        </pre>
      );

    case 'section':
      return (
        <section
          className={`render-section ${block.className || ''}`}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(block.html),
          }}
        />
      );

    default:
      return null;
  }
}

/**
 * Interactive Quiz Component with grading
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

  // Calculate total possible points
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

    // Grade the quiz
    let earnedPoints = 0;
    const questionResults = {};

    quiz.questions?.forEach((question) => {
      const userAnswer = answers[question.id];
      const correctOptions = question.options
        .filter((opt) => opt.isCorrect)
        .map((opt) => opt.id);

      let isCorrect = false;

      if (question.type === 'multiple') {
        // Multiple choice - all correct must be selected, no incorrect
        const userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [];
        isCorrect =
          correctOptions.length === userAnswerArray.length &&
          correctOptions.every((id) => userAnswerArray.includes(id));
      } else {
        // Single choice
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

    if (option.isCorrect) {
      return 'correct';
    }
    if (selected && !option.isCorrect) {
      return 'incorrect';
    }
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
    <div className={`interactive-quiz ${submitted ? 'submitted' : ''}`}>
      <div className="quiz-header" onClick={() => setExpanded(!expanded)}>
        <div className="quiz-title-row">
          <span className="quiz-badge">Quiz</span>
          <h3 className="quiz-title">{quiz.title}</h3>
          {submitted && result && (
            <span className={`quiz-result-badge ${result.passed ? 'passed' : 'failed'}`}>
              {result.passed ? 'Đạt' : 'Chưa đạt'} - {result.score}%
            </span>
          )}
        </div>
        <div className="quiz-meta">
          <span className="quiz-info">
            {quiz.questions?.length || 0} câu | Điểm đạt: {quiz.passingScore}%
          </span>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {expanded && (
        <div className="quiz-content">
          {/* Result Summary */}
          {submitted && result && (
            <div className={`quiz-result-summary ${result.passed ? 'passed' : 'failed'}`}>
              <div className="result-icon">
                {result.passed ? <Award size={32} /> : <AlertCircle size={32} />}
              </div>
              <div className="result-info">
                <div className="result-score">
                  Điểm số: <strong>{result.score}%</strong> ({result.earnedPoints}/
                  {result.totalPoints} điểm)
                </div>
                <div className="result-status">
                  {result.passed
                    ? 'Chúc mừng! Bạn đã vượt qua bài kiểm tra.'
                    : `Cần đạt ${quiz.passingScore}% để hoàn thành.`}
                </div>
              </div>
              {!result.passed && (
                <button className="retry-btn" onClick={handleRetry}>
                  <RefreshCw size={16} />
                  Làm lại
                </button>
              )}
            </div>
          )}

          {/* Questions */}
          {quiz.questions?.map((question, qIndex) => (
            <div
              key={question.id}
              className={`quiz-question ${
                submitted
                  ? result?.questionResults[question.id]?.isCorrect
                    ? 'correct'
                    : 'incorrect'
                  : ''
              }`}
            >
              <div className="question-header">
                <span className="question-number">Câu {qIndex + 1}</span>
                <span className="question-points">{question.points} điểm</span>
                {submitted && (
                  <span
                    className={`question-status ${
                      result?.questionResults[question.id]?.isCorrect
                        ? 'correct'
                        : 'incorrect'
                    }`}
                  >
                    {result?.questionResults[question.id]?.isCorrect ? (
                      <>
                        <CheckCircle size={14} /> Đúng
                      </>
                    ) : (
                      <>
                        <XCircle size={14} /> Sai
                      </>
                    )}
                  </span>
                )}
              </div>

              <p className="question-prompt">{question.prompt}</p>

              <div className="question-options">
                {question.options?.map((option) => {
                  const state = getOptionState(question, option);
                  return (
                    <button
                      key={option.id}
                      className={`option-btn option-${state}`}
                      onClick={() =>
                        handleOptionSelect(
                          question.id,
                          option.id,
                          question.type === 'multiple'
                        )
                      }
                      disabled={submitted}
                    >
                      <span className="option-indicator">
                        {state === 'correct' && <CheckCircle size={16} />}
                        {state === 'incorrect' && <XCircle size={16} />}
                        {state === 'selected' && <span className="dot" />}
                        {state === 'default' && (
                          <span className={question.type === 'multiple' ? 'checkbox' : 'circle'} />
                        )}
                      </span>
                      <span className="option-text">{option.text}</span>
                    </button>
                  );
                })}
              </div>

              {showExplanations[question.id] && question.explanation && (
                <div className="question-explanation">
                  <Info size={16} />
                  <span>{question.explanation}</span>
                </div>
              )}
            </div>
          ))}

          {/* Submit Button */}
          {!submitted && (
            <button
              className="submit-quiz-btn"
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered}
            >
              Nộp bài kiểm tra
            </button>
          )}
        </div>
      )}
    </div>
  );
}
