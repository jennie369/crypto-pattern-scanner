/**
 * TranscriptionDisplay Component
 * Shows voice-to-text transcription below voice messages
 *
 * Features:
 * - Collapsible transcription text
 * - Processing indicator
 * - Retry button for failed transcriptions
 * - Vietnamese UI text
 */

import React, { memo, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';
import * as transcriptionService from '../../services/transcriptionService';

/**
 * TranscriptionDisplay - Hiển thị transcription cho voice message
 *
 * @param {string} messageId - Message ID
 * @param {string} transcription - Transcription text
 * @param {string} status - 'pending' | 'processing' | 'completed' | 'failed' | 'skipped'
 * @param {function} onRetry - Callback after retry
 * @param {function} onTranscriptionUpdate - Callback when transcription updates
 */
const TranscriptionDisplay = memo(({
  messageId,
  transcription,
  status,
  onRetry,
  onTranscriptionUpdate,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // ========== STYLES ==========
  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginTop: SPACING.xs,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.xxs,
    },
    statusText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.cyan,
    },
    retryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.xs,
    },
    retryText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.gold,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.xs,
    },
    toggleText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.cyan,
      flex: 1,
    },
    transcriptionContainer: {
      backgroundColor: 'rgba(0, 240, 255, 0.05)',
      borderRadius: 8,
      padding: SPACING.sm,
      marginTop: SPACING.xs,
      borderLeftWidth: 2,
      borderLeftColor: colors.cyan,
    },
    transcriptionText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
      lineHeight: 20,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const handleRetry = useCallback(async () => {
    if (!messageId) return;

    setIsRetrying(true);
    try {
      const result = await transcriptionService.retryTranscription(messageId);
      if (result?.success) {
        onTranscriptionUpdate?.({
          transcription: result.transcription,
          status: 'completed',
        });
      }
      onRetry?.();
    } catch (err) {
      console.error('[TranscriptionDisplay] Retry error:', err);
    } finally {
      setIsRetrying(false);
    }
  }, [messageId, onRetry, onTranscriptionUpdate]);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Processing state
  if (status === 'processing') {
    return (
      <View style={styles.container}>
        <View style={styles.statusRow}>
          <ActivityIndicator size="small" color={colors.cyan} />
          <Text style={styles.statusText}>Đang chuyển đổi giọng nói...</Text>
        </View>
      </View>
    );
  }

  // Failed state
  if (status === 'failed') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.retryRow}
          onPress={handleRetry}
          disabled={isRetrying}
          activeOpacity={0.7}
        >
          {isRetrying ? (
            <ActivityIndicator size="small" color={colors.gold} />
          ) : (
            <Ionicons name="refresh-outline" size={14} color={colors.gold} />
          )}
          <Text style={styles.retryText}>
            Không thể chuyển đổi. Nhấn để thử lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Skipped state (audio too short)
  if (status === 'skipped') {
    return null;
  }

  // Pending or no transcription
  if (status === 'pending' || !transcription) {
    return null;
  }

  // Completed - show transcription
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.toggleRow}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Ionicons
          name="document-text-outline"
          size={14}
          color={colors.cyan}
        />
        <Text style={styles.toggleText}>
          {isExpanded ? 'Ẩn bản ghi' : 'Xem bản ghi'}
        </Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.cyan}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionText}>{transcription}</Text>
        </View>
      )}
    </View>
  );
});

TranscriptionDisplay.displayName = 'TranscriptionDisplay';

export default TranscriptionDisplay;
