/**
 * MediaPreviewScreen
 * Full-screen preview for media with caption input before sending
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Video } from 'expo-av';
import { X, Send } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MediaCaptionInput from '../../components/Messages/MediaCaptionInput';
import { COLORS, SPACING } from '../../utils/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * MediaPreviewScreen - Preview and add caption before sending media
 *
 * Route params:
 * @param {Object} media - { uri, type: 'image' | 'video', width, height }
 * @param {string} conversationId - Conversation to send to
 * @param {Function} onSend - Callback to handle sending (passed via route.params)
 */
export default function MediaPreviewScreen({ route, navigation }) {
  const { media, conversationId, onSendMedia } = route.params || {};

  // ========== STATE ==========
  const [caption, setCaption] = useState('');
  const [sending, setSending] = useState(false);

  // ========== HANDLERS ==========
  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSend = useCallback(async () => {
    if (sending) return;

    try {
      setSending(true);

      // Call the onSendMedia callback with media and caption
      if (onSendMedia) {
        await onSendMedia({
          ...media,
          caption: caption.trim(),
        });
      }

      // Navigate back
      navigation.goBack();
    } catch (err) {
      console.error('[MediaPreviewScreen] Send error:', err);
      setSending(false);
    }
  }, [media, caption, onSendMedia, navigation, sending]);

  // ========== RENDER ==========
  if (!media?.uri) {
    navigation.goBack();
    return null;
  }

  const isVideo = media.type === 'video' || media.type?.startsWith('video');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            disabled={sending}
            activeOpacity={0.7}
          >
            <X size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={sending}
            activeOpacity={0.7}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#0F1030" />
            ) : (
              <Send size={22} color="#0F1030" />
            )}
          </TouchableOpacity>
        </View>

        {/* Media Preview */}
        <View style={styles.mediaContainer}>
          {isVideo ? (
            <Video
              source={{ uri: media.uri }}
              style={styles.media}
              resizeMode="contain"
              shouldPlay
              isLooping
              useNativeControls
              isMuted={false}
            />
          ) : (
            <Image
              source={{ uri: media.uri }}
              style={styles.media}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Caption Input */}
        <View style={styles.captionContainer}>
          <MediaCaptionInput
            value={caption}
            onChangeText={setCaption}
            onSubmit={handleSend}
            placeholder="Them chu thich..."
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1030',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  sendButton: {
    backgroundColor: COLORS.gold,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
  },
  captionContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
});
