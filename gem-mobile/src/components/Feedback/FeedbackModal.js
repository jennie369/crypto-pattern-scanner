/**
 * Gemral - Feedback Modal (NPS)
 *
 * Modal for collecting user feedback and ratings
 * Shows star rating, optional comment, and prompts App Store review for high ratings
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Star, MessageSquare, ThumbsUp, Send } from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import feedbackService from '../../services/feedbackService';

const FeedbackModal = ({
  visible,
  onClose,
  onSubmit,
  title = 'Bạn thấy Gemral thế nào?',
  subtitle = 'Đánh giá của bạn giúp chúng tôi cải thiện!',
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [step, setStep] = useState('rating'); // 'rating', 'comment', 'thanks'
  const [submitting, setSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      feedbackService.markNPSShown();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset state when closing
      setRating(0);
      setComment('');
      setStep('rating');
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const handleStarPress = (starValue) => {
    setRating(starValue);
  };

  const handleNext = async () => {
    if (rating === 0) return;

    if (rating >= 4) {
      // High rating - ask for App Store review
      setStep('thanks');
      await handleSubmit();
      // Prompt App Store review after a brief delay
      setTimeout(async () => {
        await feedbackService.promptAppStoreReview(rating);
      }, 1000);
    } else {
      // Low rating - ask for feedback
      setStep('comment');
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const result = await feedbackService.submitFeedback(rating, comment || null, 'NPS Modal');

      if (result.success) {
        if (step !== 'thanks') {
          setStep('thanks');
        }
        onSubmit?.(rating, comment);
      }
    } catch (error) {
      console.error('[FeedbackModal] Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (rating === 0) {
      feedbackService.dismissNPS();
    }
    onClose();
  };

  const handleLater = async () => {
    await feedbackService.dismissNPS();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose}>
            <Animated.View
              style={[
                styles.container,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                {/* Close button */}
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <X size={20} color={COLORS.textMuted} />
                </TouchableOpacity>

                {/* Rating Step */}
                {step === 'rating' && (
                  <View style={styles.content}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>

                    {/* Star Rating */}
                    <View style={styles.starsContainer}>
                      {[1, 2, 3, 4, 5].map((starValue) => (
                        <TouchableOpacity
                          key={starValue}
                          onPress={() => handleStarPress(starValue)}
                          style={styles.starButton}
                          activeOpacity={0.7}
                        >
                          <Star
                            size={40}
                            color={starValue <= rating ? COLORS.gold : COLORS.textMuted}
                            fill={starValue <= rating ? COLORS.gold : 'transparent'}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Rating Labels */}
                    <View style={styles.labelsContainer}>
                      <Text style={styles.ratingLabel}>Rất tệ</Text>
                      <Text style={styles.ratingLabel}>Tuyệt vời</Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                      <TouchableOpacity style={styles.laterButton} onPress={handleLater}>
                        <Text style={styles.laterText}>Để sau</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
                        onPress={handleNext}
                        disabled={rating === 0}
                      >
                        <Text style={styles.submitText}>Tiếp tục</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Comment Step (for low ratings) */}
                {step === 'comment' && (
                  <View style={styles.content}>
                    <View style={styles.iconContainer}>
                      <MessageSquare size={32} color={COLORS.gold} />
                    </View>
                    <Text style={styles.title}>Giúp chúng tôi cải thiện</Text>
                    <Text style={styles.subtitle}>
                      Bạn có thể chia sẻ thêm về trải nghiệm của mình không?
                    </Text>

                    <TextInput
                      style={styles.textInput}
                      placeholder="Bạn muốn chúng tôi cải thiện điều gì?..."
                      placeholderTextColor={COLORS.textMuted}
                      value={comment}
                      onChangeText={setComment}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />

                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.skipButton}
                        onPress={handleSubmit}
                        disabled={submitting}
                      >
                        <Text style={styles.skipText}>Bỏ qua</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={submitting}
                      >
                        <Send size={18} color={COLORS.bgDarkest} />
                        <Text style={styles.submitText}>Gửi</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Thanks Step */}
                {step === 'thanks' && (
                  <View style={styles.content}>
                    <View style={styles.iconContainer}>
                      <ThumbsUp size={32} color={COLORS.gold} />
                    </View>
                    <Text style={styles.title}>Cảm ơn bạn!</Text>
                    <Text style={styles.subtitle}>
                      {rating >= 4
                        ? 'Đánh giá của bạn giúp chúng tôi rất nhiều. Nếu bạn có thời gian, hãy đánh giá chúng tôi trên App Store nhé!'
                        : 'Phản hồi của bạn rất quan trọng. Chúng tôi sẽ cố gắng cải thiện!'}
                    </Text>

                    <TouchableOpacity style={styles.doneButton} onPress={onClose}>
                      <Text style={styles.doneText}>Hoàn tất</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  keyboardView: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    backgroundColor: COLORS.bgMid,
    borderRadius: 24,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 360,
    ...GLASS,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    padding: 8,
    zIndex: 10,
  },
  content: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  starButton: {
    padding: 4,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  ratingLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  textInput: {
    width: '100%',
    minHeight: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    width: '100%',
  },
  laterButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  laterText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  skipButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    flex: 1,
    maxWidth: 160,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },
  doneButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.huge,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
  },
  doneText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },
});

export default FeedbackModal;
