/**
 * FAQ Panel Component
 * Shows a list of FAQ questions when a topic is selected
 * Slides up from bottom like Binance chatbot
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { X, ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { getTopicById, getQuestionsForTopic } from './FAQPanelData';

// Theme blue color for consistent styling
const THEME_COLOR = COLORS.primary || '#8B5CF6';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.5; // 50% of screen height

/**
 * FAQPanel Component
 * @param {Object} props
 * @param {boolean} props.visible - Whether the panel is visible
 * @param {string} props.topicId - Selected topic ID
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.onSelectQuestion - Question selection callback
 */
const FAQPanel = ({
  visible,
  topicId,
  onClose,
  onSelectQuestion,
}) => {
  const slideAnim = useRef(new Animated.Value(PANEL_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const topic = getTopicById(topicId);
  const questions = getQuestionsForTopic(topicId);

  useEffect(() => {
    if (visible) {
      // Slide up and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down and fade out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: PANEL_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleQuestionPress = (question) => {
    onSelectQuestion?.(question);
    onClose?.();
  };

  if (!visible || !topic) return null;

  const IconComponent = topic.icon;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.backdropInner, { opacity: fadeAnim }]} />
      </Pressable>

      {/* Panel */}
      <Animated.View
        style={[
          styles.panel,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <IconComponent size={20} color={THEME_COLOR} strokeWidth={2} />
            </View>
            <Text style={styles.headerTitle}>
              {topic.label}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={22} color={COLORS.textMuted || '#718096'} />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Questions List */}
        <ScrollView
          style={styles.questionsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.questionsContent}
          keyboardShouldPersistTaps="always"
        >
          {questions.map((question, index) => (
            <React.Fragment key={question.id}>
              <TouchableOpacity
                style={styles.questionItem}
                onPress={() => handleQuestionPress(question)}
                activeOpacity={0.6}
              >
                <Text style={styles.questionText} numberOfLines={2}>
                  {question.text}
                </Text>
                <ChevronRight
                  size={18}
                  color={THEME_COLOR}
                  style={styles.chevron}
                />
              </TouchableOpacity>
              {index < questions.length - 1 && (
                <View style={styles.questionDivider} />
              )}
            </React.Fragment>
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker backdrop for better focus
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: PANEL_HEIGHT,
    backgroundColor: '#0D1117', // Solid dark background for better readability
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: SPACING.md,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1.5,
    borderColor: COLORS.primary || '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary || '#8B5CF6',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  questionsList: {
    flex: 1,
  },
  questionsContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl + 40, // Extra padding for safe area
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  questionDivider: {
    height: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    marginHorizontal: SPACING.sm,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary || '#FFFFFF',
    lineHeight: 22,
    marginRight: SPACING.sm,
  },
  chevron: {
    opacity: 0.7,
  },
});

export default FAQPanel;
