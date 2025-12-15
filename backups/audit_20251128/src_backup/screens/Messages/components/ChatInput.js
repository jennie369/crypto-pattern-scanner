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
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from '../../../utils/haptics';

// Components
import VoiceRecorder from './VoiceRecorder';
import MessageReplyPreview from './MessageReplyPreview';

// Services
import messagingService from '../../../services/messagingService';

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
}) {
  // State
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [inputHeight, setInputHeight] = useState(44);
  const [isRecording, setIsRecording] = useState(false);

  // Animation refs
  const sendButtonScale = useRef(new Animated.Value(1)).current;

  // Can send message
  const canSend = (text.trim() || attachment) && !disabled && !uploading;

  // Show mic button when no text (TikTok-style)
  const showMicButton = !text.trim() && !attachment;

  // =====================================================
  // TEXT INPUT
  // =====================================================

  const handleTextChange = useCallback((value) => {
    setText(value);
    onTyping?.();
  }, [onTyping]);

  const handleContentSizeChange = useCallback((event) => {
    const height = Math.min(event.nativeEvent.contentSize.height, MAX_INPUT_HEIGHT);
    setInputHeight(Math.max(44, height));
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

    // Send message
    await onSend(text, attachment);

    // Clear input
    setText('');
    setAttachment(null);
  }, [canSend, text, attachment, onSend, sendButtonScale]);

  // =====================================================
  // MEDIA PICKER
  // =====================================================

  const handleMediaPicker = useCallback(() => {
    Alert.alert(
      'Add Attachment',
      'Choose what to send',
      [
        {
          text: 'Photo Library',
          onPress: pickImage,
        },
        {
          text: 'Camera',
          onPress: takePhoto,
        },
        {
          text: 'File',
          onPress: pickDocument,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  }, []);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
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
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow access to your camera');
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
      Alert.alert('Error', 'Failed to take photo');
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
      Alert.alert('Error', 'Failed to pick file');
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
      Alert.alert('Error', 'Failed to upload attachment');
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
      Alert.alert('Error', 'Failed to send voice message');
    } finally {
      setUploading(false);
    }
  }, [conversationId, onSend]);

  const handleVoiceRecordingCancel = useCallback(() => {
    setIsRecording(false);
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

        {/* Text Input */}
        <View style={[styles.inputContainer, { height: inputHeight }]}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor={COLORS.textMuted}
            value={text}
            onChangeText={handleTextChange}
            onContentSizeChange={handleContentSizeChange}
            multiline
            maxLength={2000}
            editable={!disabled}
          />
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

  // Input
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
