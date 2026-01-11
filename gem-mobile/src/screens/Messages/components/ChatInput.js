/**
 * Gemral - Chat Input Component
 * TikTok-style input bar with media picker and voice recording
 *
 * Features:
 * - Text input with auto-resize
 * - Media picker (gallery, camera, files)
 * - Voice message recording
 * - Reply preview bar (animated)
 * - Attachment preview row
 * - Send button animation
 * - Message scheduling
 * - Glass-morphism styling
 * - @Mentions with autocomplete
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Image,
  Platform,
} from 'react-native';
import alertService from '../../../services/alertService';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from '../../../utils/haptics';

// Components
import VoiceRecorder from './VoiceRecorder';
import MessageReplyPreview from './MessageReplyPreview';
import { StickerEmojiSheet } from '../../../components/Stickers';
import MentionSuggestionList from '../../../components/Messages/MentionSuggestionList';

// Services
import messagingService from '../../../services/messagingService';
import stickerService from '../../../services/stickerService';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

const MAX_INPUT_HEIGHT = 120;

export default function ChatInput({
  onSend,
  onTyping,
  replyTo,
  onClearReply,
  disabled,
  conversationId,
  onOpenSchedule,
  currentUserId,
  participants = [], // For @mentions
}) {
  // State
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [inputHeight, setInputHeight] = useState(44);
  const [isRecording, setIsRecording] = useState(false);
  const [stickerSheetVisible, setStickerSheetVisible] = useState(false);

  // Mentions state
  const [mentions, setMentions] = useState([]); // Collected mentions with positions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  // Refs
  const inputRef = useRef(null);

  // Animation refs
  const sendButtonScale = useRef(new Animated.Value(1)).current;

  // Can send message
  const canSend = (text.trim() || attachment) && !disabled && !uploading;

  // Show mic button when no text (TikTok-style)
  const showMicButton = !text.trim() && !attachment;

  // Filter participants for mention suggestions (exclude current user)
  const filteredSuggestions = useMemo(() => {
    if (!showSuggestions || !mentionSearch) return [];

    const searchLower = mentionSearch.toLowerCase();
    return participants
      .filter(p => p.id !== currentUserId)
      .filter(p =>
        p.display_name?.toLowerCase().includes(searchLower) ||
        p.username?.toLowerCase().includes(searchLower)
      )
      .slice(0, 5);
  }, [participants, mentionSearch, showSuggestions, currentUserId]);

  // =====================================================
  // MENTIONS DETECTION
  // =====================================================

  const detectMentionTrigger = useCallback((value, selectionStart) => {
    // Find the @ symbol before cursor
    const textBeforeCursor = value.substring(0, selectionStart);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex === -1) {
      setShowSuggestions(false);
      setMentionSearch('');
      return;
    }

    // Check if @ is at start or after a space
    const charBeforeAt = textBeforeCursor[lastAtIndex - 1];
    if (lastAtIndex > 0 && charBeforeAt !== ' ' && charBeforeAt !== '\n') {
      setShowSuggestions(false);
      setMentionSearch('');
      return;
    }

    // Get text after @ until cursor
    const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);

    // Check if there's a space in the search (completed mention)
    if (textAfterAt.includes(' ')) {
      setShowSuggestions(false);
      setMentionSearch('');
      return;
    }

    // Show suggestions with search text
    setMentionSearch(textAfterAt);
    setShowSuggestions(true);
  }, []);

  // =====================================================
  // TEXT INPUT
  // =====================================================

  const handleTextChange = useCallback((value) => {
    setText(value);
    onTyping?.();

    // Detect mention trigger
    detectMentionTrigger(value, cursorPosition);
  }, [onTyping, detectMentionTrigger, cursorPosition]);

  const handleSelectionChange = useCallback((event) => {
    const { selection } = event.nativeEvent;
    setCursorPosition(selection.start);

    // Re-check mention trigger on cursor move
    detectMentionTrigger(text, selection.start);
  }, [text, detectMentionTrigger]);

  const handleContentSizeChange = useCallback((event) => {
    const height = Math.min(event.nativeEvent.contentSize.height, MAX_INPUT_HEIGHT);
    setInputHeight(Math.max(44, height));
  }, []);

  // =====================================================
  // MENTION SELECTION
  // =====================================================

  const handleSelectMention = useCallback((user) => {
    // Find where the @ started
    const textBeforeCursor = text.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex === -1) return;

    // Build new text with mention
    const beforeAt = text.substring(0, lastAtIndex);
    const afterCursor = text.substring(cursorPosition);
    const mentionText = `@${user.display_name} `;
    const newText = beforeAt + mentionText + afterCursor;

    // Calculate new cursor position
    const newCursorPosition = lastAtIndex + mentionText.length;

    // Add to mentions array
    const newMention = {
      userId: user.id,
      displayName: user.display_name,
      startIndex: lastAtIndex,
      endIndex: lastAtIndex + mentionText.trim().length,
    };

    setMentions(prev => [...prev, newMention]);
    setText(newText);
    setShowSuggestions(false);
    setMentionSearch('');

    // Set cursor position after mention
    setTimeout(() => {
      inputRef.current?.setNativeProps({
        selection: { start: newCursorPosition, end: newCursorPosition },
      });
      setCursorPosition(newCursorPosition);
    }, 50);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [text, cursorPosition]);

  const handleDismissSuggestions = useCallback(() => {
    setShowSuggestions(false);
    setMentionSearch('');
  }, []);

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSend = useCallback(async () => {
    if (!canSend) return;

    // Animate send button
    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(sendButtonScale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // Capture current mentions before clearing
    const currentMentions = [...mentions];

    // Send message with mentions
    await onSend(text, attachment, null, currentMentions);

    // Clear input
    setText('');
    setAttachment(null);
    setMentions([]);
    setShowSuggestions(false);
    setMentionSearch('');
  }, [canSend, text, attachment, mentions, onSend, sendButtonScale]);

  // =====================================================
  // MEDIA PICKER
  // =====================================================

  const handleMediaPicker = useCallback(() => {
    alertService.info(
      'Thêm tệp đính kèm',
      'Chọn nội dung muốn gửi',
      [
        {
          text: 'Thư viện ảnh',
          onPress: pickImage,
        },
        {
          text: 'Camera',
          onPress: takePhoto,
        },
        {
          text: 'Tài liệu',
          onPress: pickDocument,
        },
        {
          text: 'Huỷ',
          style: 'cancel',
        },
      ]
    );
  }, []);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alertService.warning('Cần cấp quyền', 'Vui lòng cho phép truy cập thư viện ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAttachment(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alertService.error('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        alertService.warning('Cần cấp quyền', 'Vui lòng cho phép truy cập camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAttachment(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      alertService.error('Lỗi', 'Không thể chụp ảnh');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        await uploadAttachment(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      alertService.error('Lỗi', 'Không thể chọn tệp');
    }
  };

  const uploadAttachment = async (file) => {
    try {
      setUploading(true);

      const uploadedFile = await messagingService.uploadAttachment(
        {
          uri: file.uri,
          type: file.mimeType || file.type || 'application/octet-stream',
          name: file.fileName || file.name || `file-${Date.now()}`,
          size: file.fileSize || file.size,
        },
        conversationId
      );

      setAttachment({
        ...uploadedFile,
        localUri: file.uri, // Keep local URI for preview
      });
    } catch (error) {
      console.error('Error uploading attachment:', error);
      alertService.error('Lỗi', 'Không thể tải lên tệp đính kèm');
    } finally {
      setUploading(false);
    }
  };

  const clearAttachment = useCallback(() => {
    setAttachment(null);
  }, []);

  // =====================================================
  // VOICE RECORDING
  // =====================================================

  const handleVoiceRecordingStart = useCallback(() => {
    setIsRecording(true);
  }, []);

  const handleVoiceRecordingEnd = useCallback(async (audioData) => {
    setIsRecording(false);

    if (!audioData) return;

    try {
      setUploading(true);

      // Upload audio file
      const uploadedFile = await messagingService.uploadAttachment(
        {
          uri: audioData.uri,
          type: 'audio/m4a',
          name: `voice-${Date.now()}.m4a`,
          size: audioData.size || 0,
        },
        conversationId
      );

      // Send voice message immediately
      await onSend('', {
        ...uploadedFile,
        type: 'audio/m4a',
        duration: audioData.duration,
        messageType: 'audio',
      });
    } catch (error) {
      console.error('Error sending voice message:', error);
      alertService.error('Lỗi', 'Không thể gửi tin nhắn thoại');
    } finally {
      setUploading(false);
    }
  }, [conversationId, onSend]);

  const handleVoiceRecordingCancel = useCallback(() => {
    setIsRecording(false);
  }, []);

  // =====================================================
  // STICKER / EMOJI / GIF
  // =====================================================

  const handleStickerSelect = useCallback(async (item) => {
    setStickerSheetVisible(false);

    // Handle emoji - insert as text
    if (item.type === 'emoji') {
      setText(prev => prev + item.emoji);
      return;
    }

    // Handle sticker or GIF - send as message
    try {
      // Track usage for recent items
      await stickerService.trackUsage({
        stickerId: item.stickerId,
        giphyId: item.giphyId,
        giphyUrl: item.url,
        type: item.type,
      });

      // Send sticker/GIF message
      await onSend('', null, {
        type: item.type,
        stickerId: item.stickerId,
        giphyId: item.giphyId,
        url: item.url,
        format: item.format,
      });
    } catch (error) {
      console.error('Error sending sticker/GIF:', error);
      alertService.error('Loi', 'Khong the gui sticker');
    }
  }, [onSend]);

  const handleOpenStickerSheet = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStickerSheetVisible(true);
  }, []);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <View style={styles.container}>
      {/* Reply Preview (animated component) */}
      {replyTo && (
        <MessageReplyPreview
          message={replyTo}
          isOwnMessage={replyTo.user_id === currentUserId}
          senderName={replyTo.users?.display_name}
          onDismiss={onClearReply}
        />
      )}

      {/* Attachment Preview */}
      {attachment && (
        <View style={styles.attachmentPreview}>
          {attachment.type?.startsWith('image') ? (
            <Image
              source={{ uri: attachment.localUri || attachment.url }}
              style={styles.attachmentImage}
            />
          ) : (
            <View style={styles.attachmentFile}>
              <Ionicons name="document" size={24} color={COLORS.gold} />
              <Text style={styles.attachmentName} numberOfLines={1}>
                {attachment.name}
              </Text>
            </View>
          )}
          <TouchableOpacity onPress={clearAttachment} style={styles.attachmentClose}>
            <Ionicons name="close-circle" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Bar */}
      <BlurView intensity={30} style={styles.inputBar}>
        {/* Media Button */}
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={handleMediaPicker}
          disabled={uploading}
        >
          {uploading ? (
            <Ionicons name="hourglass" size={22} color={COLORS.gold} />
          ) : (
            <Ionicons name="add-circle" size={26} color={COLORS.purple} />
          )}
        </TouchableOpacity>

        {/* Schedule Button */}
        {onOpenSchedule && (
          <TouchableOpacity
            style={styles.scheduleButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onOpenSchedule();
            }}
            disabled={uploading}
          >
            <Ionicons name="time-outline" size={22} color={COLORS.cyan} />
          </TouchableOpacity>
        )}

        {/* Sticker/Emoji Button */}
        <TouchableOpacity
          style={styles.stickerButton}
          onPress={handleOpenStickerSheet}
          disabled={uploading}
        >
          <Ionicons name="happy-outline" size={24} color={COLORS.gold} />
        </TouchableOpacity>

        {/* Text Input with Mention Suggestions */}
        <View style={[styles.inputWrapper, { height: inputHeight }]}>
          {/* Mention Suggestions */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <MentionSuggestionList
              suggestions={filteredSuggestions}
              onSelect={handleSelectMention}
              onDismiss={handleDismissSuggestions}
            />
          )}

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Message..."
              placeholderTextColor={COLORS.textMuted}
              value={text}
              onChangeText={handleTextChange}
              onContentSizeChange={handleContentSizeChange}
              onSelectionChange={handleSelectionChange}
              multiline
              maxLength={2000}
              editable={!disabled}
            />
          </View>
        </View>

        {/* Send Button or Mic Button */}
        {showMicButton ? (
          <VoiceRecorder
            onRecordingStart={handleVoiceRecordingStart}
            onRecordingEnd={handleVoiceRecordingEnd}
            onRecordingCancel={handleVoiceRecordingCancel}
            disabled={disabled || uploading}
          />
        ) : (
          <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
            <TouchableOpacity
              style={[styles.sendButton, canSend && styles.sendButtonActive]}
              onPress={handleSend}
              disabled={!canSend}
            >
              {canSend ? (
                <LinearGradient
                  colors={GRADIENTS.primaryButton}
                  style={styles.sendButtonGradient}
                >
                  <Ionicons name="send" size={18} color={COLORS.textPrimary} />
                </LinearGradient>
              ) : (
                <Ionicons name="send" size={18} color={COLORS.textMuted} />
              )}
            </TouchableOpacity>
          </Animated.View>
        )}
      </BlurView>

      {/* Recording Overlay */}
      {isRecording && (
        <View style={styles.recordingOverlay}>
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording...</Text>
          </View>
          <Text style={styles.recordingHint}>Release to send, slide left to cancel</Text>
        </View>
      )}

      {/* Sticker/Emoji/GIF Sheet */}
      <StickerEmojiSheet
        visible={stickerSheetVisible}
        onClose={() => setStickerSheetVisible(false)}
        onSelect={handleStickerSelect}
        context="chat"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(5, 4, 11, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.2)',
  },

  // Attachment Preview
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(15, 16, 48, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  attachmentImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.glassBg,
  },
  attachmentFile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
  },
  attachmentName: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },
  attachmentClose: {
    marginLeft: SPACING.sm,
  },

  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
  },

  // Media Button
  mediaButton: {
    width: 36,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Schedule Button
  scheduleButton: {
    width: 36,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
  },

  // Sticker Button
  stickerButton: {
    width: 36,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Input
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
  },
  input: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    maxHeight: MAX_INPUT_HEIGHT,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : SPACING.xs,
  },

  // Send Button
  sendButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
  sendButtonActive: {},
  sendButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Recording Overlay
  recordingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 4, 11, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.error,
    marginRight: SPACING.sm,
  },
  recordingText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  recordingHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
});
