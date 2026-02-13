// src/components/Feedback/FeedbackButtons.js
// Feedback Buttons Component for Continuous Learning
// GEMRAL AI BRAIN - Phase 5

import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { ThumbsUp, ThumbsDown, X, Send } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

const FEEDBACK_TYPES = [
  { id: 'incorrect', label: 'Thông tin sai' },
  { id: 'unhelpful', label: 'Không hữu ích' },
  { id: 'incomplete', label: 'Thiếu thông tin' },
  { id: 'other', label: 'Lý do khác' },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const FeedbackButtons = ({
  feature = 'chatbot',      // 'chatbot', 'scanner', 'tarot', 'iching'
  query,                     // The user's question/input
  response,                  // The AI's response
  sessionId,
  ragUsed = false,
  sourcesUsed = [],
  onFeedbackSubmitted,       // Callback when feedback is submitted
  size = 'small',            // 'small' | 'medium'
  showLabels = false,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(null); // 'positive' | 'negative' | null
  const [showModal, setShowModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [sourcesHelpful, setSourcesHelpful] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Submit feedback
  const submitFeedback = useCallback(async (ratingValue, type = null, text = null) => {
    if (!user?.id || !query || !response) {
      console.warn('[Feedback] Missing required data');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('submit_ai_feedback', {
        p_user_id: user.id,
        p_feature: feature,
        p_query: query.substring(0, 1000),
        p_response: response.substring(0, 2000),
        p_rating: ratingValue,
        p_feedback_type: type,
        p_feedback_text: text,
        p_rag_used: ragUsed,
        p_sources_used: sourcesUsed,
        p_sources_helpful: sourcesHelpful,
        p_session_id: sessionId,
        p_metadata: {},
      });

      if (error) {
        console.error('[Feedback] Submit error:', error);
        return;
      }

      console.log('[Feedback] Submitted successfully:', data);
      setSubmitted(true);
      onFeedbackSubmitted?.(ratingValue, type, text);
    } catch (err) {
      console.error('[Feedback] Submit failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, query, response, feature, sessionId, ragUsed, sourcesUsed, sourcesHelpful, onFeedbackSubmitted]);

  // Handle positive feedback (immediate submit)
  const handlePositive = useCallback(() => {
    if (submitted || rating) return;
    setRating('positive');
    submitFeedback('positive');
  }, [submitted, rating, submitFeedback]);

  // Handle negative feedback (show modal)
  const handleNegative = useCallback(() => {
    if (submitted || rating) return;
    setRating('negative');
    setShowModal(true);
  }, [submitted, rating]);

  // Submit negative feedback from modal
  const handleSubmitNegative = useCallback(() => {
    submitFeedback('negative', feedbackType, feedbackText.trim() || null);
    setShowModal(false);
  }, [submitFeedback, feedbackType, feedbackText]);

  // Close modal without submitting
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setRating(null); // Reset if not submitted
    setFeedbackType(null);
    setFeedbackText('');
  }, []);

  // Get icon size based on prop
  const iconSize = size === 'small' ? 16 : 20;

  // Already submitted
  if (submitted) {
    return (
      <View style={styles.container}>
        <Text style={styles.thankYou}>Cảm ơn bạn đã góp ý!</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, size === 'medium' && styles.containerMedium]}>
      {/* Thumbs Up */}
      <TouchableOpacity
        style={[
          styles.button,
          size === 'medium' && styles.buttonMedium,
          rating === 'positive' && styles.buttonActive,
        ]}
        onPress={handlePositive}
        disabled={isSubmitting || submitted}
        activeOpacity={0.7}
      >
        <ThumbsUp
          size={iconSize}
          color={rating === 'positive' ? '#4CAF50' : '#888'}
          fill={rating === 'positive' ? '#4CAF50' : 'transparent'}
        />
        {showLabels && <Text style={styles.buttonLabel}>Hữu ích</Text>}
      </TouchableOpacity>

      {/* Thumbs Down */}
      <TouchableOpacity
        style={[
          styles.button,
          size === 'medium' && styles.buttonMedium,
          rating === 'negative' && styles.buttonActiveNegative,
        ]}
        onPress={handleNegative}
        disabled={isSubmitting || submitted}
        activeOpacity={0.7}
      >
        <ThumbsDown
          size={iconSize}
          color={rating === 'negative' ? '#F44336' : '#888'}
          fill={rating === 'negative' ? '#F44336' : 'transparent'}
        />
        {showLabels && <Text style={styles.buttonLabel}>Chưa tốt</Text>}
      </TouchableOpacity>

      {/* Loading indicator */}
      {isSubmitting && (
        <ActivityIndicator size="small" color="#6366F1" style={styles.loader} />
      )}

      {/* Negative Feedback Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Góp ý cho GEM Master</Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <X size={20} color="#888" />
              </TouchableOpacity>
            </View>

            {/* Feedback type selection */}
            <Text style={styles.sectionLabel}>Vấn đề là gì?</Text>
            <View style={styles.typeContainer}>
              {FEEDBACK_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    feedbackType === type.id && styles.typeButtonActive,
                  ]}
                  onPress={() => setFeedbackType(type.id)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      feedbackType === type.id && styles.typeTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* RAG sources feedback (if applicable) */}
            {ragUsed && sourcesUsed?.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Nguồn tham khảo có hữu ích?</Text>
                <View style={styles.sourcesFeedback}>
                  <TouchableOpacity
                    style={[
                      styles.sourcesButton,
                      sourcesHelpful === true && styles.sourcesButtonActive,
                    ]}
                    onPress={() => setSourcesHelpful(true)}
                  >
                    <Text style={styles.sourcesText}>Có</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sourcesButton,
                      sourcesHelpful === false && styles.sourcesButtonActiveNegative,
                    ]}
                    onPress={() => setSourcesHelpful(false)}
                  >
                    <Text style={styles.sourcesText}>Không</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Additional feedback text */}
            <Text style={styles.sectionLabel}>Chi tiết (tùy chọn)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Chia sẻ thêm để GEM Master cải thiện..."
              placeholderTextColor="#666"
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              numberOfLines={3}
              maxLength={500}
            />

            {/* Submit button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!feedbackType && !feedbackText.trim()) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitNegative}
              disabled={isSubmitting || (!feedbackType && !feedbackText.trim())}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Send size={18} color="#FFF" />
                  <Text style={styles.submitText}>Gửi góp ý</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  containerMedium: {
    gap: 12,
  },
  button: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  buttonMedium: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  buttonActiveNegative: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
  },
  buttonLabel: {
    color: '#888',
    fontSize: 12,
  },
  loader: {
    marginLeft: 8,
  },
  thankYou: {
    color: '#4CAF50',
    fontSize: 12,
    fontStyle: 'italic',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  closeButton: {
    padding: 4,
  },
  sectionLabel: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  typeText: {
    color: '#AAA',
    fontSize: 13,
  },
  typeTextActive: {
    color: '#6366F1',
  },
  sourcesFeedback: {
    flexDirection: 'row',
    gap: 12,
  },
  sourcesButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sourcesButtonActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  sourcesButtonActiveNegative: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  sourcesText: {
    color: '#FFF',
    fontSize: 14,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    color: '#FFF',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#444',
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FeedbackButtons;
