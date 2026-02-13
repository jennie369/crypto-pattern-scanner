// src/components/Chat/QuizResponse.js
// ============================================================
// QUIZ RESPONSE COMPONENT
// Interactive quiz for learning
// ============================================================

import React, { memo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const QuizResponse = memo(({
  question,
  options = [],
  correctIndex,
  explanation,
  onAnswer,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = useCallback((index) => {
    if (showResult) return;

    setSelectedIndex(index);
    setShowResult(true);
    onAnswer?.(index);
  }, [showResult, onAnswer]);

  const isCorrect = selectedIndex === correctIndex;

  return (
    <View style={styles.container}>
      {/* Question */}
      <View style={styles.questionContainer}>
        <HelpCircle size={20} color={COLORS.gold} />
        <Text style={styles.question}>{question || ''}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {(options || []).map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrectOption = index === correctIndex;

          let optionStyle = styles.option;
          let iconComponent = null;

          if (showResult) {
            if (isCorrectOption) {
              optionStyle = [styles.option, styles.optionCorrect];
              iconComponent = <CheckCircle size={20} color={COLORS.success} />;
            } else if (isSelected && !isCorrectOption) {
              optionStyle = [styles.option, styles.optionWrong];
              iconComponent = <XCircle size={20} color={COLORS.error} />;
            }
          }

          return (
            <TouchableOpacity
              key={index}
              style={optionStyle}
              onPress={() => handleSelect(index)}
              disabled={showResult}
              activeOpacity={0.7}
            >
              <Text style={styles.optionLetter}>
                {String.fromCharCode(65 + index)}.
              </Text>
              <Text style={styles.optionText}>{option || ''}</Text>
              {iconComponent}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Explanation */}
      {showResult && explanation && (
        <View style={[
          styles.explanation,
          isCorrect ? styles.explanationCorrect : styles.explanationWrong
        ]}>
          <Text style={styles.explanationTitle}>
            {isCorrect ? '✅ Chính xác!' : '❌ Chưa đúng'}
          </Text>
          <Text style={styles.explanationText}>{explanation}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  question: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  optionsContainer: {
    gap: SPACING.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionCorrect: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(58,247,166,0.1)',
  },
  optionWrong: {
    borderColor: COLORS.error,
    backgroundColor: 'rgba(255,107,107,0.1)',
  },
  optionLetter: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginRight: SPACING.sm,
    minWidth: 24,
  },
  optionText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    flex: 1,
  },
  explanation: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
  },
  explanationCorrect: {
    backgroundColor: 'rgba(58,247,166,0.1)',
  },
  explanationWrong: {
    backgroundColor: 'rgba(255,189,89,0.1)',
  },
  explanationTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  explanationText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },
});

QuizResponse.displayName = 'QuizResponse';

export default QuizResponse;
