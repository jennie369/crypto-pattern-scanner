/**
 * Gemral - Quiz Question Component
 * Renders different question types: multiple_choice, multiple_select, true_false, fill_blank
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import {
  CheckCircle,
  XCircle,
  Circle,
  Square,
  CheckSquare,
} from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const QuizQuestion = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  showResult = false,
  isCorrect = null,
  correctAnswer = null,
}) => {
  const {
    question_text,
    question_image,
    question_type,
    options = [],
    explanation,
  } = question;

  // Render multiple choice (single answer)
  const renderMultipleChoice = () => (
    <View style={styles.optionsContainer}>
      {options.map((option, index) => {
        const isSelected = selectedAnswer === option.id;
        const isOptionCorrect = showResult && option.is_correct;
        const isOptionWrong = showResult && isSelected && !option.is_correct;

        return (
          <TouchableOpacity
            key={option.id || index}
            style={[
              styles.optionBtn,
              isSelected && !showResult && styles.optionSelected,
              isOptionCorrect && styles.optionCorrect,
              isOptionWrong && styles.optionWrong,
            ]}
            onPress={() => !showResult && onAnswerSelect(option.id)}
            disabled={showResult}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconWrapper}>
              {showResult ? (
                isOptionCorrect ? (
                  <CheckCircle size={22} color={COLORS.success} />
                ) : isOptionWrong ? (
                  <XCircle size={22} color={COLORS.error} />
                ) : (
                  <Circle size={22} color={COLORS.textMuted} />
                )
              ) : isSelected ? (
                <View style={styles.selectedDot} />
              ) : (
                <Circle size={22} color={COLORS.textMuted} />
              )}
            </View>
            <Text
              style={[
                styles.optionText,
                isSelected && !showResult && styles.optionTextSelected,
                isOptionCorrect && styles.optionTextCorrect,
                isOptionWrong && styles.optionTextWrong,
              ]}
            >
              {option.text}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // Render true/false
  const renderTrueFalse = () => (
    <View style={styles.trueFalseContainer}>
      {options.map((option, index) => {
        const isSelected = selectedAnswer === option.id;
        const isOptionCorrect = showResult && option.is_correct;
        const isOptionWrong = showResult && isSelected && !option.is_correct;

        return (
          <TouchableOpacity
            key={option.id || index}
            style={[
              styles.trueFalseBtn,
              isSelected && !showResult && styles.trueFalseSelected,
              isOptionCorrect && styles.trueFalseCorrect,
              isOptionWrong && styles.trueFalseWrong,
            ]}
            onPress={() => !showResult && onAnswerSelect(option.id)}
            disabled={showResult}
            activeOpacity={0.7}
          >
            {showResult && isOptionCorrect && (
              <CheckCircle size={24} color={COLORS.success} style={styles.trueFalseIcon} />
            )}
            {showResult && isOptionWrong && (
              <XCircle size={24} color={COLORS.error} style={styles.trueFalseIcon} />
            )}
            <Text
              style={[
                styles.trueFalseText,
                isSelected && !showResult && styles.trueFalseTextSelected,
                isOptionCorrect && styles.trueFalseTextCorrect,
                isOptionWrong && styles.trueFalseTextWrong,
              ]}
            >
              {option.text}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // Render multiple select (multiple answers)
  const renderMultipleSelect = () => {
    const selectedIds = Array.isArray(selectedAnswer) ? selectedAnswer : [];

    return (
      <View style={styles.optionsContainer}>
        <Text style={styles.multiSelectHint}>Chọn tất cả đáp án đúng</Text>
        {options.map((option, index) => {
          const isSelected = selectedIds.includes(option.id);
          const isOptionCorrect = showResult && option.is_correct;
          const isOptionWrong = showResult && isSelected && !option.is_correct;
          const isMissed = showResult && option.is_correct && !isSelected;

          return (
            <TouchableOpacity
              key={option.id || index}
              style={[
                styles.optionBtn,
                isSelected && !showResult && styles.optionSelected,
                isOptionCorrect && styles.optionCorrect,
                isOptionWrong && styles.optionWrong,
                isMissed && styles.optionMissed,
              ]}
              onPress={() => {
                if (showResult) return;
                const newSelection = isSelected
                  ? selectedIds.filter(id => id !== option.id)
                  : [...selectedIds, option.id];
                onAnswerSelect(newSelection);
              }}
              disabled={showResult}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconWrapper}>
                {showResult ? (
                  isOptionCorrect ? (
                    <CheckSquare size={22} color={COLORS.success} />
                  ) : isOptionWrong ? (
                    <XCircle size={22} color={COLORS.error} />
                  ) : (
                    <Square size={22} color={COLORS.textMuted} />
                  )
                ) : isSelected ? (
                  <CheckSquare size={22} color={COLORS.gold} />
                ) : (
                  <Square size={22} color={COLORS.textMuted} />
                )}
              </View>
              <Text
                style={[
                  styles.optionText,
                  isSelected && !showResult && styles.optionTextSelected,
                  isOptionCorrect && styles.optionTextCorrect,
                  isOptionWrong && styles.optionTextWrong,
                ]}
              >
                {option.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Render fill in blank
  const renderFillBlank = () => (
    <View style={styles.fillBlankContainer}>
      <TextInput
        style={[
          styles.fillBlankInput,
          showResult && isCorrect && styles.fillBlankCorrect,
          showResult && !isCorrect && styles.fillBlankWrong,
        ]}
        placeholder="Nhập câu trả lời..."
        placeholderTextColor={COLORS.textMuted}
        value={selectedAnswer || ''}
        onChangeText={onAnswerSelect}
        editable={!showResult}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {showResult && (
        <View style={styles.fillBlankResult}>
          {isCorrect ? (
            <CheckCircle size={20} color={COLORS.success} />
          ) : (
            <>
              <XCircle size={20} color={COLORS.error} />
              <Text style={styles.correctAnswerText}>
                Đáp án đúng: {correctAnswer}
              </Text>
            </>
          )}
        </View>
      )}
    </View>
  );

  // Render based on question type
  const renderAnswerSection = () => {
    switch (question_type) {
      case 'true_false':
        return renderTrueFalse();
      case 'multiple_select':
        return renderMultipleSelect();
      case 'fill_blank':
        return renderFillBlank();
      case 'multiple_choice':
      default:
        return renderMultipleChoice();
    }
  };

  return (
    <View style={styles.container}>
      {/* Question Image */}
      {question_image && (
        <Image
          source={{ uri: question_image }}
          style={styles.questionImage}
          resizeMode="contain"
        />
      )}

      {/* Question Text */}
      <Text style={styles.questionText}>{question_text}</Text>

      {/* Answer Options */}
      {renderAnswerSection()}

      {/* Explanation (shown after answering) */}
      {showResult && explanation && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Giải thích:</Text>
          <Text style={styles.explanationText}>{explanation}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  questionImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    backgroundColor: GLASS.background,
  },
  questionText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textPrimary,
    lineHeight: 28,
    marginBottom: SPACING.xl,
  },

  // Options (Multiple Choice)
  optionsContainer: {
    gap: SPACING.sm,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  optionSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  optionCorrect: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(58, 247, 166, 0.1)',
  },
  optionWrong: {
    borderColor: COLORS.error,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  optionMissed: {
    borderColor: COLORS.gold,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
  },
  optionIconWrapper: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  selectedDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.gold,
  },
  optionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  optionTextSelected: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  optionTextCorrect: {
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  optionTextWrong: {
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // True/False
  trueFalseContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  trueFalseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  trueFalseSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
  },
  trueFalseCorrect: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
  },
  trueFalseWrong: {
    borderColor: COLORS.error,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
  },
  trueFalseIcon: {
    marginRight: SPACING.xs,
  },
  trueFalseText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  trueFalseTextSelected: {
    color: COLORS.gold,
  },
  trueFalseTextCorrect: {
    color: COLORS.success,
  },
  trueFalseTextWrong: {
    color: COLORS.error,
  },

  // Multiple Select
  multiSelectHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },

  // Fill in Blank
  fillBlankContainer: {
    gap: SPACING.sm,
  },
  fillBlankInput: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  fillBlankCorrect: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(58, 247, 166, 0.1)',
  },
  fillBlankWrong: {
    borderColor: COLORS.error,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  fillBlankResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  correctAnswerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Explanation
  explanationContainer: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.cyan,
  },
  explanationTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.cyan,
    marginBottom: SPACING.xs,
  },
  explanationText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});

export default QuizQuestion;
