/**
 * Gemral - Message Bubble Component
 * TikTok-style message bubble with reactions and animations
 *
 * Features:
 * - Double-tap to react with heart animation
 * - Long-press for action menu
 * - Swipe to reply
 * - Media preview (images, videos, files)
 * - Reaction emoji row
 * - Reply quote display
 * - Glass-morphism styling
 */

import React, { useRef, useState, memo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

// Components
import ImageViewer from './ImageViewer';
import VideoPlayer from './VideoPlayer';
import MessageContextMenu from './MessageContextMenu';
import ReadReceiptIndicator, { MESSAGE_STATUS } from './ReadReceiptIndicator';
import LinkPreview, { extractUrls } from './LinkPreview';
import GroupReadReceipts from './GroupReadReceipts';
import CallMessageBubble from './CallMessageBubble';
import { StickerMessage } from '../../../components/Stickers';
import VoicePlayerEnhanced from '../../../components/Messages/VoicePlayerEnhanced';
import MentionHighlight from '../../../components/Messages/MentionHighlight';
import QuotedMessageBubble from '../../../components/Messages/QuotedMessageBubble';
import RecalledMessagePlaceholder from '../../../components/Messages/RecalledMessagePlaceholder';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
  TOUCH,
} from '../../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_BUBBLE_WIDTH = SCREEN_WIDTH * 0.75;

const MessageBubble = memo(({
  message,
  isOwn,
  showAvatar,
  onDoubleTap,
  onReply,
  onDelete,
  onReaction,
  onCopy,
  onForward,
  onPin,
  onStar,
  onEdit,
  onTranslate,
  onRecall,
  onReport,
  isPinned = false,
  isStarred = false,
  canRecall = false,
  currentUserId,
  isGroupChat,
  totalParticipants,
  onScrollToMessage, // Scroll to original quoted message
  isHighlighted = false, // Highlight when scrolled to
  onCallBack, // Callback to initiate a return call
}) => {
  // Animation refs
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const highlightOpacity = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(0);

  // Highlight animation when scrolled to
  useEffect(() => {
    if (isHighlighted) {
      // Flash highlight effect
      Animated.sequence([
        Animated.timing(highlightOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(highlightOpacity, {
          toValue: 0,
          duration: 1500,
          delay: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isHighlighted, highlightOpacity]);

  // State
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const soundRef = useRef(null);
  const bubbleRef = useRef(null);

  // Double-tap detection
  const handlePress = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected - show heart animation
      triggerHeartAnimation();
      onDoubleTap?.();
    }

    lastTap.current = now;
  }, [onDoubleTap]);

  // Heart animation (like TikTok/Instagram)
  const triggerHeartAnimation = useCallback(() => {
    heartScale.setValue(0);
    heartOpacity.setValue(1);

    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.5,
        tension: 65,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(heartOpacity, {
        toValue: 0,
        duration: 300,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [heartScale, heartOpacity]);

  // Swipe to reply (PanResponder)
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Swipe right to reply (for incoming messages)
        if (!isOwn && gestureState.dx > 0) {
          translateX.setValue(Math.min(gestureState.dx, 80));
        }
        // Swipe left for own messages
        if (isOwn && gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -80));
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Threshold for reply action
        if (Math.abs(gestureState.dx) > 60) {
          onReply?.();
        }
        // Snap back
        Animated.spring(translateX, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  // Get sender info
  const sender = message.users;

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get initials
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Group reactions by emoji
  const reactionGroups = (message.message_reactions || []).reduce((acc, r) => {
    if (!acc[r.emoji]) {
      acc[r.emoji] = { emoji: r.emoji, count: 0, hasOwn: false };
    }
    acc[r.emoji].count++;
    if (r.user_id === currentUserId) {
      acc[r.emoji].hasOwn = true;
    }
    return acc;
  }, {});

  // Check if message has media
  const hasImage = message.message_type === 'image' && message.attachment_url;
  const hasVideo = message.message_type === 'video' && message.attachment_url;
  const hasAudio = message.message_type === 'audio' && message.attachment_url;
  const hasFile = message.message_type === 'file' && message.attachment_url;
  const hasSticker = message.message_type === 'sticker' && (message.sticker_id || message.attachment_url);
  const hasGif = message.message_type === 'gif' && (message.giphy_url || message.attachment_url);

  // Extract URLs from message content for link preview
  const urls = message.content ? extractUrls(message.content) : [];
  const hasLink = urls.length > 0 && !hasImage && !hasVideo;

  // Optimistic message styling
  const isOptimistic = message._isOptimistic;

  // Handle long press to show context menu (Facebook style)
  const handleLongPress = useCallback(() => {
    setShowContextMenu(true);
  }, []);

  // Handle reaction selection from context menu
  const handleReactionSelect = useCallback((emoji) => {
    setShowContextMenu(false);
    onReaction?.(emoji);
  }, [onReaction]);

  // Handle image press
  const handleImagePress = useCallback(() => {
    setShowImageViewer(true);
  }, []);

  // Handle audio playback
  const handleAudioPlay = useCallback(async () => {
    try {
      if (isPlayingAudio && soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setIsPlayingAudio(false);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: message.attachment_url },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setIsPlayingAudio(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlayingAudio(false);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlayingAudio(false);
    }
  }, [isPlayingAudio, message.attachment_url]);

  // Format audio duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If message is recalled, show placeholder
  if (message?.is_recalled) {
    return (
      <View style={[
        styles.container,
        isOwn ? styles.containerOwn : styles.containerOther,
      ]}>
        <RecalledMessagePlaceholder
          isOwnMessage={isOwn}
          senderName={sender?.display_name}
        />
      </View>
    );
  }

  // If message is a call event, render CallMessageBubble (centered, not left/right aligned)
  if (message?.message_type === 'call') {
    return (
      <CallMessageBubble
        message={message}
        isOwn={isOwn}
        currentUserId={currentUserId}
        onCallBack={onCallBack}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.containerOwn : styles.containerOther,
      ]}
    >
      {/* Avatar (for incoming messages) */}
      {!isOwn && (
        <View style={styles.avatarContainer}>
          {showAvatar ? (
            sender?.avatar_url ? (
              <Image source={{ uri: sender.avatar_url }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={GRADIENTS.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarFallback}
              >
                <Text style={styles.avatarInitials}>
                  {getInitials(sender?.display_name)}
                </Text>
              </LinearGradient>
            )
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </View>
      )}

      {/* Message Bubble */}
      <Animated.View
        style={[
          styles.bubbleWrapper,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[
            styles.bubble,
            isOwn ? styles.bubbleOwn : styles.bubbleOther,
            isOptimistic && styles.bubbleOptimistic,
          ]}
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.9}
        >
          {/* Reply Quote - Enhanced with QuotedMessageBubble */}
          {message.reply_to && (
            <QuotedMessageBubble
              originalMessage={message.reply_to}
              isOwnReply={isOwn}
              onPress={() => onScrollToMessage?.(message.reply_to?.id)}
            />
          )}

          {/* Image Attachment */}
          {hasImage && (
            <TouchableOpacity onPress={handleImagePress} activeOpacity={0.9}>
              <Image
                source={{ uri: message.attachment_url }}
                style={styles.imageAttachment}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          {/* Video Attachment */}
          {hasVideo && (
            <VideoPlayer
              videoUrl={message.attachment_url}
              thumbnailUrl={message.thumbnail_url}
              duration={message.attachment_duration}
              style={styles.videoAttachment}
            />
          )}

          {/* Caption for Media (Phase 1C) */}
          {(hasImage || hasVideo) && message.caption && (
            <Text style={styles.mediaCaption}>{message.caption}</Text>
          )}

          {/* Audio Message - Enhanced with Speed Control */}
          {hasAudio && (
            <VoicePlayerEnhanced
              uri={message.attachment_url}
              duration={message.attachment_duration}
              waveform={message.waveform}
              isCurrentUser={isOwn}
            />
          )}

          {/* File Attachment */}
          {hasFile && (
            <View style={styles.fileAttachment}>
              <Ionicons name="document" size={24} color={COLORS.gold} />
              <Text style={styles.fileName} numberOfLines={1}>
                {message.attachment_name || 'File'}
              </Text>
            </View>
          )}

          {/* Sticker */}
          {hasSticker && (
            <StickerMessage
              stickerId={message.sticker_id}
              url={message.attachment_url || message.sticker?.image_url}
              format={message.sticker?.format}
              lottieUrl={message.sticker?.lottie_url}
              onLongPress={handleLongPress}
            />
          )}

          {/* GIF */}
          {hasGif && (
            <StickerMessage
              giphyId={message.giphy_id}
              url={message.giphy_url || message.attachment_url}
              format="gif"
              onLongPress={handleLongPress}
            />
          )}

          {/* Message Text with Mention Highlighting */}
          {message.content ? (
            <MentionHighlight
              text={message.content}
              mentions={message.mentions || []}
              isCurrentUser={isOwn}
              textStyle={isOwn ? styles.textOwn : styles.textOther}
            />
          ) : null}

          {/* Link Preview */}
          {hasLink && (
            <LinkPreview url={urls[0]} style={styles.linkPreview} />
          )}

          {/* Time and Read Receipt */}
          <View style={[styles.timeRow, isOwn && styles.timeRowOwn]}>
            <Text style={[styles.time, isOwn ? styles.timeOwn : styles.timeOther]}>
              {formatTime(message.created_at)}
            </Text>
            {isOwn && !isGroupChat && (
              <ReadReceiptIndicator
                status={
                  isOptimistic ? MESSAGE_STATUS.SENDING :
                  message.read_at ? MESSAGE_STATUS.READ :
                  message.delivered_at ? MESSAGE_STATUS.DELIVERED :
                  MESSAGE_STATUS.SENT
                }
                readAt={message.read_at}
                size="sm"
              />
            )}
          </View>

          {/* Group Read Receipts (for group chats) */}
          {isOwn && isGroupChat && (
            <GroupReadReceipts
              readBy={message.read_receipts || []}
              deliveredTo={message.delivered_receipts || []}
              totalParticipants={totalParticipants}
              isOwn={isOwn}
            />
          )}
        </TouchableOpacity>

        {/* Reactions */}
        {Object.keys(reactionGroups).length > 0 && (
          <View style={[styles.reactions, isOwn ? styles.reactionsOwn : styles.reactionsOther]}>
            {Object.values(reactionGroups).map((reaction, index) => (
              <View
                key={`${reaction.emoji}-${index}`}
                style={[styles.reactionBadge, reaction.hasOwn && styles.reactionBadgeOwn]}
              >
                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                {reaction.count > 1 && (
                  <Text style={styles.reactionCount}>{reaction.count}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Heart Animation Overlay */}
        <Animated.View
          style={[
            styles.heartOverlay,
            {
              opacity: heartOpacity,
              transform: [{ scale: heartScale }],
            },
          ]}
          pointerEvents="none"
        >
          <Ionicons name="heart" size={60} color={COLORS.burgundy} />
        </Animated.View>

        {/* Highlight Overlay (when scrolled to from quote) */}
        <Animated.View
          style={[
            styles.highlightOverlay,
            {
              opacity: highlightOpacity,
            },
          ]}
          pointerEvents="none"
        />
      </Animated.View>

      {/* Reply indicator (when swiping) */}
      <View style={styles.swipeIndicator}>
        <Ionicons name="arrow-undo" size={20} color={COLORS.textMuted} />
      </View>

      {/* Image Viewer Modal */}
      {hasImage && (
        <ImageViewer
          visible={showImageViewer}
          imageUrl={message.attachment_url}
          onClose={() => setShowImageViewer(false)}
        />
      )}

      {/* Facebook-style Context Menu */}
      <MessageContextMenu
        visible={showContextMenu}
        message={message}
        isOwn={isOwn}
        isPinned={isPinned}
        isStarred={isStarred}
        canRecall={canRecall}
        senderName={sender?.display_name}
        senderAvatar={sender?.avatar_url}
        onClose={() => setShowContextMenu(false)}
        onReply={onReply}
        onCopy={onCopy}
        onForward={onForward}
        onDelete={onDelete}
        onReaction={handleReactionSelect}
        onReport={onReport}
        onPin={onPin}
        onEdit={onEdit}
        onStar={onStar}
        onTranslate={onTranslate}
        onRecall={onRecall}
      />
    </View>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: SPACING.xxs,
    paddingHorizontal: SPACING.xs,
  },
  containerOwn: {
    justifyContent: 'flex-end',
  },
  containerOther: {
    justifyContent: 'flex-start',
  },

  // Avatar
  avatarContainer: {
    width: 32,
    marginRight: SPACING.xs,
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.glassBg,
  },
  avatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
  },

  // Bubble
  bubbleWrapper: {
    maxWidth: MAX_BUBBLE_WIDTH,
    position: 'relative',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minWidth: 60,
  },
  bubbleOwn: {
    backgroundColor: COLORS.purple,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: 'rgba(15, 16, 48, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    borderBottomLeftRadius: 4,
  },
  bubbleOptimistic: {
    opacity: 0.7,
  },

  // Text
  text: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    lineHeight: 22,
  },
  textOwn: {
    color: COLORS.textPrimary,
  },
  textOther: {
    color: COLORS.textPrimary,
  },

  // Time
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xxs,
    gap: SPACING.xs,
  },
  timeRowOwn: {
    justifyContent: 'flex-end',
  },
  time: {
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  timeOwn: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  timeOther: {
    color: COLORS.textMuted,
  },

  // Reply Quote
  replyQuote: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  replyBar: {
    width: 3,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    marginRight: SPACING.sm,
  },
  replyContent: {
    flex: 1,
  },
  replyAuthor: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: 2,
  },
  replyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Attachments
  imageAttachment: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.glassBg,
  },
  videoAttachment: {
    marginBottom: SPACING.xs,
  },
  audioAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    minWidth: 180,
  },
  audioPlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  audioWaveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    gap: 2,
  },
  audioBar: {
    width: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  audioBarActive: {
    backgroundColor: COLORS.gold,
  },
  audioDuration: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
    minWidth: 35,
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  fileName: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },
  linkPreview: {
    marginTop: SPACING.xs,
    maxWidth: 200,
  },
  // Media Caption (Phase 1C)
  mediaCaption: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },

  // Reactions
  reactions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -SPACING.xs,
    gap: SPACING.xxs,
  },
  reactionsOwn: {
    justifyContent: 'flex-end',
  },
  reactionsOther: {
    justifyContent: 'flex-start',
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.8)',
    borderRadius: 12,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  reactionBadgeOwn: {
    borderColor: COLORS.gold,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginLeft: 2,
  },

  // Heart Animation
  heartOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
  },

  // Highlight Overlay (when scrolled to)
  highlightOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(254, 199, 78, 0.25)',
    borderRadius: 18,
  },

  // Swipe Indicator
  swipeIndicator: {
    position: 'absolute',
    left: -30,
    top: '50%',
    marginTop: -10,
    opacity: 0.3,
  },
});
