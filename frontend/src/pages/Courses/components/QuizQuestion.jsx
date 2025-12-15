/**
 * QuizQuestion - Match Mobile Design
 * Single question with options
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { COLORS } from '../../../shared/design-tokens';
import './QuizQuestion.css';

export function QuizQuestion({
  question,
  selectedAnswer,
  onSelectAnswer,
  showResult = false,
  disabled = false,
}) {
  if (!question) return null;

  const { id, question_text, question_type, options, correct_answer, explanation } = question;

  // Check if answer is correct
  const isCorrect = selectedAnswer === correct_answer;

  // Get option style based on state
  const getOptionStyle = (optionIndex) => {
    if (!showResult) {
      // During quiz
      if (selectedAnswer === optionIndex) {
        return {
          borderColor: COLORS.primary,
          backgroundColor: `${COLORS.primary}15`,
        };
      }
      return {};
    }

    // After submission
    if (optionIndex === correct_answer) {
      return {
        borderColor: COLORS.success,
        backgroundColor: `${COLORS.success}15`,
      };
    }
    if (selectedAnswer === optionIndex && !isCorrect) {
      return {
        borderColor: COLORS.error,
        backgroundColor: `${COLORS.error}15`,
      };
    }
    return {
      opacity: 0.5,
    };
  };

  return (
    <div className="quiz-question">
      {/* Question Text */}
      <div className="question-header">
        <p className="question-text">{question_text}</p>
      </div>

      {/* Options */}
      <div className="options-list">
        {options?.map((option, index) => (
          <motion.button
            key={index}
            className={`option-item ${selectedAnswer === index ? 'selected' : ''} ${
              showResult ? 'show-result' : ''
            }`}
            style={getOptionStyle(index)}
            onClick={() => !disabled && !showResult && onSelectAnswer(index)}
            disabled={disabled || showResult}
            whileHover={!disabled && !showResult ? { scale: 1.01 } : {}}
            whileTap={!disabled && !showResult ? { scale: 0.99 } : {}}
          >
            {/* Option Letter */}
            <div
              className="option-letter"
              style={{
                backgroundColor:
                  showResult && index === correct_answer
                    ? COLORS.success
                    : showResult && selectedAnswer === index && !isCorrect
                    ? COLORS.error
                    : selectedAnswer === index
                    ? COLORS.primary
                    : 'rgba(255, 255, 255, 0.1)',
                color:
                  selectedAnswer === index || (showResult && index === correct_answer)
                    ? '#000'
                    : COLORS.textSecondary,
              }}
            >
              {String.fromCharCode(65 + index)}
            </div>

            {/* Option Text */}
            <span className="option-text">{option}</span>

            {/* Result Icon */}
            {showResult && index === correct_answer && (
              <div className="result-icon correct">
                <Check size={18} color="#000" />
              </div>
            )}
            {showResult && selectedAnswer === index && !isCorrect && (
              <div className="result-icon incorrect">
                <X size={18} color="#000" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Explanation (shown after submit) */}
      {showResult && explanation && (
        <motion.div
          className="explanation"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            borderColor: isCorrect ? COLORS.success : COLORS.error,
            backgroundColor: isCorrect ? `${COLORS.success}10` : `${COLORS.error}10`,
          }}
        >
          <p className="explanation-label">
            {isCorrect ? 'Chính xác!' : 'Giải thích:'}
          </p>
          <p className="explanation-text">{explanation}</p>
        </motion.div>
      )}
    </div>
  );
}

export default QuizQuestion;
