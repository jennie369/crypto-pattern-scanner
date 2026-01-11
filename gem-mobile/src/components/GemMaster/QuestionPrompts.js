/**
 * QuestionPrompts Component
 * Horizontal scrolling question suggestion chips
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Sparkles,
  Heart,
  Briefcase,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Target,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { QUESTION_PROMPTS, LIFE_AREAS } from '../../data/tarotSpreads';

const AREA_ICONS = {
  general: Sparkles,
  love: Heart,
  career: Briefcase,
  finance: TrendingUp,
  relationships: Users,
  energy: Zap,
  protection: Shield,
  goals: Target,
};

const QuestionPrompts = ({
  lifeArea = null, // Filter by life area or show all
  onSelect,
  selectedQuestion = '',
  maxPrompts = 8,
  style,
}) => {
  // Get prompts based on life area
  const prompts = useMemo(() => {
    if (lifeArea && QUESTION_PROMPTS[lifeArea]) {
      return QUESTION_PROMPTS[lifeArea].slice(0, maxPrompts);
    }

    // Combine prompts from all areas
    const allPrompts = [];
    Object.entries(QUESTION_PROMPTS).forEach(([area, questions]) => {
      questions.forEach((q) => {
        allPrompts.push({ ...q, area });
      });
    });

    // Shuffle and take max
    return allPrompts
      .sort(() => Math.random() - 0.5)
      .slice(0, maxPrompts);
  }, [lifeArea, maxPrompts]);

  const handleSelect = (prompt) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect?.(prompt.text_vi || prompt.text);
  };

  const getAreaColor = (area) => {
    const areaData = LIFE_AREAS.find((a) => a.id === area);
    return areaData?.color || COLORS.purple;
  };

  const renderPrompt = (prompt, index) => {
    const IconComponent = AREA_ICONS[prompt.area] || Sparkles;
    const areaColor = getAreaColor(prompt.area);
    const isSelected = selectedQuestion === (prompt.text_vi || prompt.text);

    return (
      <TouchableOpacity
        key={`${prompt.area}-${index}`}
        style={[
          styles.promptChip,
          { borderColor: isSelected ? areaColor : `${areaColor}50` },
          isSelected && { backgroundColor: `${areaColor}20` },
        ]}
        onPress={() => handleSelect(prompt)}
        activeOpacity={0.7}
      >
        <IconComponent size={14} color={areaColor} />
        <Text
          style={[
            styles.promptText,
            isSelected && { color: areaColor },
          ]}
          numberOfLines={1}
        >
          {prompt.text_vi || prompt.text}
        </Text>
      </TouchableOpacity>
    );
  };

  if (prompts.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>Gợi ý câu hỏi</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {prompts.map((prompt, index) => renderPrompt(prompt, index))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    maxWidth: 250,
  },
  promptText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    flexShrink: 1,
  },
});

export default QuestionPrompts;
