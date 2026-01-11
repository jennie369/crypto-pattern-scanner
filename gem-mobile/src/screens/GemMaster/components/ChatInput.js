/**
 * Gemral - Chat Input Component
 * Input bar with send button and voice input for Gemral chat
 *
 * Day 11-12: Voice Input Integration
 * - VoiceInputButton for recording
 * - RecordingIndicator for visual feedback
 * - VoiceQuotaBadge for quota display
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Mic, MicOff, Square, WifiOff, CloudOff } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, INPUT, TOUCH } from '../../../utils/tokens';
import { INPUT_AREA_BACKGROUND } from '../../../constants/gemMasterLayout';

// Voice components
import VoiceInputButton from '../../../components/GemMaster/VoiceInputButton';
import RecordingIndicator from '../../../components/GemMaster/RecordingIndicator';
import { VoiceQuotaBadge } from '../../../components/GemMaster/VoiceQuotaDisplay';

// Voice services
import voiceService from '../../../services/voiceService';

const ChatInput = ({
  onSend,
  disabled = false,
  placeholder = 'Hỏi Gemral...',
  showBottomPadding = true,
  // Voice props
  voiceEnabled = true,
  voiceQuota = { canUse: true, remaining: -1, limit: -1 },
  onVoiceRecordingStart,
  onVoiceRecordingStop,
  onVoiceQuotaPress,
  onVoiceError,
  // Offline props (PHASE 1C)
  isOffline = false,
  queueSize = 0,
}) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState('');

  const inputRef = useRef(null);
  const insets = useSafeAreaInsets();
  const timerRef = useRef(null);

  // Minimal bottom padding - tab bar handles its own space
  const bottomPadding = showBottomPadding ? SPACING.sm : SPACING.sm;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setText('');
      Keyboard.dismiss();
    }
  };

  // Voice recording handlers
  const handleRecordingStart = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    setInterimTranscript('');

    // Start duration timer
    timerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    if (onVoiceRecordingStart) {
      onVoiceRecordingStart();
    }
  };

  const handleRecordingStop = async (audioUri, duration) => {
    setIsRecording(false);

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (onVoiceRecordingStop) {
      onVoiceRecordingStop(audioUri, duration);
    }

    // Increment voice quota count
    // This is handled in the parent component (GemMasterScreen)
  };

  const handleTranscription = (transcribedText) => {
    if (transcribedText) {
      // Set text in input and auto-send
      setText(transcribedText);

      // Auto-send after short delay
      setTimeout(() => {
        if (transcribedText.trim() && !disabled) {
          onSend(transcribedText.trim());
          setText('');
        }
      }, 500);
    }
  };

  const handleVoiceError = (error) => {
    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (onVoiceError) {
      onVoiceError(error);
    }
  };

  const handleCancelRecording = async () => {
    await voiceService.cancelRecording();
    setIsRecording(false);
    setRecordingDuration(0);
    setInterimTranscript('');

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const hasText = text.trim().length > 0;
  const showVoiceButton = voiceEnabled && !hasText && !isRecording;
  const showSendButton = hasText || isRecording;

  // Dynamic placeholder based on offline state
  const displayPlaceholder = isOffline
    ? 'Tin nhắn sẽ gửi khi có mạng...'
    : isRecording
    ? 'Đang nghe...'
    : placeholder;

  return (
    <View>
      {/* Offline Indicator (PHASE 1C) */}
      {isOffline && (
        <View style={styles.offlineIndicator}>
          <WifiOff size={14} color="#FF6B6B" />
          <Text style={styles.offlineText}>
            Ngoại tuyến{queueSize > 0 ? ` (${queueSize} tin nhắn chờ)` : ''}
          </Text>
        </View>
      )}

      {/* Recording Indicator (above input) */}
      <RecordingIndicator
        isRecording={isRecording}
        duration={recordingDuration}
        onCancel={handleCancelRecording}
        interimText={interimTranscript}
      />

      <View style={[styles.container, { paddingBottom: bottomPadding }, isOffline && styles.containerOffline]}>
        {/* Voice Quota Badge */}
        {voiceEnabled && !isRecording && (
          <VoiceQuotaBadge
            quotaInfo={voiceQuota}
            onPress={onVoiceQuotaPress}
          />
        )}

        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={displayPlaceholder}
            placeholderTextColor={isOffline ? '#FF6B6B' : COLORS.textMuted}
            multiline
            maxLength={2000}
            editable={!disabled && !isRecording}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
          />
        </View>

        {/* Voice Input Button (when no text) */}
        {showVoiceButton && (
          <VoiceInputButton
            disabled={disabled}
            voiceQuota={voiceQuota}
            onRecordingStart={handleRecordingStart}
            onRecordingStop={handleRecordingStop}
            onTranscription={handleTranscription}
            onError={handleVoiceError}
            size="medium"
          />
        )}

        {/* Send Button (when has text or recording) */}
        {showSendButton && (
          <TouchableOpacity
            style={[
              styles.sendButton,
              isRecording
                ? styles.sendButtonRecording
                : hasText && !disabled
                ? styles.sendButtonActive
                : styles.sendButtonDisabled,
            ]}
            onPress={isRecording ? handleCancelRecording : handleSend}
            disabled={!hasText && !isRecording || disabled}
            activeOpacity={0.7}
          >
            {isRecording ? (
              <Square size={18} color={COLORS.error} fill={COLORS.error} />
            ) : (
              <Send
                size={20}
                color={hasText && !disabled ? '#0F1030' : COLORS.textMuted}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    backgroundColor: INPUT_AREA_BACKGROUND, // Xem constants/gemMasterLayout.js
    gap: SPACING.sm,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: INPUT.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: GLASS.borderWidth,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: TOUCH.minimum,
    maxHeight: 120,
  },
  input: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    lineHeight: 22,
    padding: 0,
    margin: 0,
  },
  sendButton: {
    width: TOUCH.minimum,
    height: TOUCH.minimum,
    borderRadius: TOUCH.minimum / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.gold,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.glassBg,
  },
  sendButtonRecording: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1.5,
    borderColor: COLORS.error,
  },
  // Offline indicator styles (PHASE 1C)
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    gap: 6,
  },
  offlineText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '500',
  },
  containerOffline: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 107, 107, 0.3)',
  },
});

export default ChatInput;
