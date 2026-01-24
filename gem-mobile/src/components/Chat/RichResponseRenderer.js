// src/components/Chat/RichResponseRenderer.js
// ============================================================
// RICH RESPONSE RENDERER
// Render different response types from chatbot
// ============================================================

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import ChecklistResponse from './ChecklistResponse';
import QuizResponse from './QuizResponse';
import ComparisonResponse from './ComparisonResponse';
import ChartHintResponse from './ChartHintResponse';
import AffirmationResponse from './AffirmationResponse';
import TextResponse from './TextResponse';

const COMPONENT_NAME = '[RichResponseRenderer]';

// ============================================================
// RESPONSE TYPES
// ============================================================

export const RESPONSE_TYPES = {
  TEXT: 'text',
  CHECKLIST: 'checklist',
  COMPARISON: 'comparison',
  CHART_HINT: 'chart_hint',
  QUIZ: 'quiz',
  AFFIRMATION: 'affirmation',
};

// ============================================================
// COMPONENT
// ============================================================

const RichResponseRenderer = memo(({ response, onAction }) => {
  // Validate response
  if (!response) {
    console.warn(COMPONENT_NAME, 'No response provided');
    return null;
  }

  const responseType = response?.type || RESPONSE_TYPES.TEXT;

  console.log(COMPONENT_NAME, 'Rendering:', responseType);

  // Render based on type
  switch (responseType) {
    case RESPONSE_TYPES.CHECKLIST:
      return (
        <ChecklistResponse
          title={response.title || 'Bài tập'}
          items={response.items || []}
          duration={response.duration}
          onItemToggle={(index) => onAction?.('checklist_toggle', { index })}
          onComplete={() => onAction?.('checklist_complete')}
        />
      );

    case RESPONSE_TYPES.QUIZ:
      return (
        <QuizResponse
          question={response.question || ''}
          options={response.options || []}
          correctIndex={response.correctIndex}
          explanation={response.explanation}
          onAnswer={(index) => onAction?.('quiz_answer', { index })}
        />
      );

    case RESPONSE_TYPES.COMPARISON:
      return (
        <ComparisonResponse
          title={response.title || 'So sánh'}
          items={response.items || []}
          highlightIndex={response.highlightIndex}
          onItemSelect={(index) => onAction?.('comparison_select', { index })}
        />
      );

    case RESPONSE_TYPES.CHART_HINT:
      return (
        <ChartHintResponse
          symbol={response.symbol || 'BTCUSDT'}
          pattern={response.pattern}
          message={response.message || ''}
          onViewChart={() => onAction?.('view_chart', { symbol: response.symbol })}
        />
      );

    case RESPONSE_TYPES.AFFIRMATION:
      return (
        <AffirmationResponse
          text={response.text || ''}
          frequency={response.frequency}
          backgroundColor={response.backgroundColor}
          onRepeat={() => onAction?.('affirmation_repeat')}
          onSave={() => onAction?.('affirmation_save', { text: response.text })}
        />
      );

    case RESPONSE_TYPES.TEXT:
    default:
      return (
        <TextResponse
          text={response.text || response.content || ''}
          isAI={true}
        />
      );
  }
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

RichResponseRenderer.displayName = 'RichResponseRenderer';

export default RichResponseRenderer;
