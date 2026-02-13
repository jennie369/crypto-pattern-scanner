/**
 * HTML Lesson Preview Component
 * Renders parsed lesson content for teacher preview
 * Shows how students will see the content
 */

import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import DOMPurify from 'dompurify';
import './HTMLLessonPreview.css';

export default function HTMLLessonPreview({ content }) {
  if (!content) {
    return (
      <div className="preview-placeholder">
        Chưa có nội dung để xem trước
      </div>
    );
  }

  return (
    <div className="html-lesson-preview">
      {/* Title */}
      {content.metadata?.title && (
        <h1 className="lesson-title">{content.metadata.title}</h1>
      )}

      {/* Content Blocks */}
      {content.blocks?.map((block) => (
        <ContentBlock key={block.id} block={block} />
      ))}

      {/* Embedded Quizzes */}
      {content.quizzes?.map((quiz) => (
        <QuizBlock key={quiz.id} quiz={quiz} />
      ))}
    </div>
  );
}

/**
 * Render a single content block
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
    case 'section':
      return <SectionBlock block={block} />;
    default:
      return null;
  }
}

function HeadingBlock({ block }) {
  const Tag = `h${block.level}`;
  return <Tag className={`preview-heading preview-h${block.level}`}>{block.content}</Tag>;
}

function ParagraphBlock({ block }) {
  return (
    <p
      className="preview-paragraph"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(block.html || block.content),
      }}
    />
  );
}

function ListBlock({ block }) {
  const Tag = block.ordered ? 'ol' : 'ul';
  return (
    <Tag className={`preview-list ${block.ordered ? 'ordered' : 'unordered'}`}>
      {block.items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </Tag>
  );
}

function ImageBlock({ block }) {
  return (
    <figure className="preview-figure">
      <img src={block.src} alt={block.alt || ''} className="preview-image" />
      {block.caption && (
        <figcaption className="preview-caption">{block.caption}</figcaption>
      )}
    </figure>
  );
}

function CalloutBlock({ block }) {
  const icons = {
    quote: null,
    tip: <Lightbulb size={18} />,
    warning: <AlertCircle size={18} />,
    info: <Info size={18} />,
    success: <CheckCircle size={18} />,
  };

  return (
    <blockquote className={`preview-callout callout-${block.style}`}>
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
}

function CodeBlock({ block }) {
  return (
    <pre className="preview-code">
      <code className={`language-${block.language}`}>{block.content}</code>
    </pre>
  );
}

function SectionBlock({ block }) {
  return (
    <section
      className={`preview-section ${block.className || ''}`}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(block.html),
      }}
    />
  );
}

/**
 * Interactive Quiz Block (Preview Mode)
 */
function QuizBlock({ quiz }) {
  const [expanded, setExpanded] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const handleOptionSelect = (questionId, optionId, isMultiple) => {
    setSelectedAnswers((prev) => {
      if (isMultiple) {
        const current = prev[questionId] || [];
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
        }
        return { ...prev, [questionId]: [...current, optionId] };
      }
      return { ...prev, [questionId]: optionId };
    });
  };

  const handleCheckAnswer = (questionId) => {
    setShowResults((prev) => ({ ...prev, [questionId]: true }));
  };

  const getOptionState = (question, option) => {
    const questionId = question.id;
    const isMultiple = question.type === 'multiple';
    const selected = isMultiple
      ? (selectedAnswers[questionId] || []).includes(option.id)
      : selectedAnswers[questionId] === option.id;
    const revealed = showResults[questionId];

    if (!revealed) {
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

  return (
    <div className="preview-quiz">
      <div className="quiz-header" onClick={() => setExpanded(!expanded)}>
        <div className="quiz-title-row">
          <span className="quiz-badge">Quiz</span>
          <h3 className="quiz-title">{quiz.title}</h3>
        </div>
        <div className="quiz-meta">
          <span className="quiz-info">
            {quiz.questions?.length || 0} câu hỏi | Điểm đạt: {quiz.passingScore}%
          </span>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {expanded && (
        <div className="quiz-content">
          {quiz.questions?.map((question, qIndex) => (
            <div key={question.id} className="quiz-question">
              <div className="question-header">
                <span className="question-number">Câu {qIndex + 1}</span>
                <span className="question-points">{question.points} điểm</span>
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
                      disabled={showResults[question.id]}
                    >
                      <span className="option-indicator">
                        {state === 'correct' && <CheckCircle size={16} />}
                        {state === 'incorrect' && <XCircle size={16} />}
                        {state === 'selected' && <span className="dot" />}
                        {state === 'default' && <span className="circle" />}
                      </span>
                      <span className="option-text">{option.text}</span>
                    </button>
                  );
                })}
              </div>

              {!showResults[question.id] && (
                <button
                  className="check-answer-btn"
                  onClick={() => handleCheckAnswer(question.id)}
                  disabled={!selectedAnswers[question.id]}
                >
                  Kiểm tra đáp án
                </button>
              )}

              {showResults[question.id] && question.explanation && (
                <div className="question-explanation">
                  <Info size={16} />
                  <span>{question.explanation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
