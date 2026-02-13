/**
 * Gemral - Story Viewer Screen
 * Feature #21: Full-screen story viewing with gestures
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Send,
  Heart,
  MoreVertical,
  Trash2,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { storyService } from '../../services/storyService';
import { useAuth } from '../../contexts/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per story

const StoryViewerScreen = ({ navigation, route }) => {
  const { storyGroups, initialGroupIndex = 0, initialStoryIndex = 0 } = route.params;
  const { user } = useAuth();

  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(null);

  const currentGroup = storyGroups[currentGroupIndex];
  const currentStory = currentGroup?.stories?.[currentStoryIndex];
  const isOwnStory = currentGroup?.user?.id === user?.id;

  // Start progress animation
  useEffect(() => {
    if (!currentStory || isPaused) return;

    progressAnim.setValue(0);

    progressAnimation.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });

    progressAnimation.current.start(({ finished }) => {
      if (finished) {
        goToNextStory();
      }
    });

    // Mark as viewed
    if (!currentStory.viewed && !isOwnStory) {
      storyService.viewStory(currentStory.id);
    }

    return () => {
      if (progressAnimation.current) {
        progressAnimation.current.stop();
      }
    };
  }, [currentGroupIndex, currentStoryIndex, isPaused]);

  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else if (currentGroupIndex > 0) {
      const prevGroup = storyGroups[currentGroupIndex - 1];
      setCurrentGroupIndex(currentGroupIndex - 1);
      setCurrentStoryIndex(prevGroup.stories.length - 1);
    }
  };

  const goToNextStory = () => {
    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else if (currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
      setCurrentStoryIndex(0);
    } else {
      navigation.goBack();
    }
  };

  const handleTap = (side) => {
    if (side === 'left') {
      goToPreviousStory();
    } else {
      goToNextStory();
    }
  };

  const handleLongPress = (pressed) => {
    setIsPaused(pressed);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;

    const result = await storyService.replyToStory(currentStory.id, replyText);
    if (result.success) {
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  const handleReaction = async (reaction) => {
    await storyService.reactToStory(currentStory.id, reaction);
  };

  const handleDeleteStory = async () => {
    const result = await storyService.deleteStory(currentStory.id);
    if (result.success) {
      goToNextStory();
    }
    setShowMenu(false);
  };

  const getAvatarUrl = (userData) => {
    if (userData?.avatar_url) return userData.avatar_url;
    const name = userData?.full_name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6A5BFF&color=fff`;
  };

  const formatTime = (isoDate) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diff = now - date;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m`;
    }
    return `${hours}h`;
  };

  if (!currentStory) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Story Image */}
      <Image
        source={{ uri: currentStory.media_url }}
        style={styles.storyImage}
        resizeMode="cover"
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent', 'rgba(0,0,0,0.6)']}
        locations={[0, 0.2, 0.8, 1]}
        style={styles.overlay}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          {currentGroup.stories.map((_, index) => (
            <View key={index} style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width:
                      index < currentStoryIndex
                        ? '100%'
                        : index === currentStoryIndex
                        ? progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          })
                        : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: getAvatarUrl(currentGroup.user) }}
              style={styles.userAvatar}
            />
            <View style={styles.userTextInfo}>
              <Text style={styles.userName}>{currentGroup.user.full_name}</Text>
              <Text style={styles.storyTime}>
                {formatTime(currentStory.created_at)}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {isOwnStory && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowMenu(!showMenu)}
              >
                <MoreVertical size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Dropdown */}
        {showMenu && isOwnStory && (
          <View style={styles.menuDropdown}>
            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteStory}>
              <Trash2 size={18} color={COLORS.error} />
              <Text style={styles.menuItemTextDanger}>Xoa story</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Touch Areas */}
        <View style={styles.touchAreas}>
          <TouchableOpacity
            style={styles.touchAreaLeft}
            onPress={() => handleTap('left')}
            onLongPress={() => handleLongPress(true)}
            onPressOut={() => handleLongPress(false)}
            activeOpacity={1}
          />
          <TouchableOpacity
            style={styles.touchAreaRight}
            onPress={() => handleTap('right')}
            onLongPress={() => handleLongPress(true)}
            onPressOut={() => handleLongPress(false)}
            activeOpacity={1}
          />
        </View>

        {/* Caption */}
        {currentStory.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>{currentStory.caption}</Text>
          </View>
        )}

        {/* Footer */}
        {isOwnStory ? (
          // Own story - show viewers
          <View style={styles.footer}>
            <TouchableOpacity style={styles.viewersButton}>
              <Eye size={20} color={COLORS.textPrimary} />
              <Text style={styles.viewersText}>
                {currentStory.views_count || 0}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Others' story - show reply
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.footer}
          >
            <View style={styles.replyContainer}>
              <View style={styles.reactionButtons}>
                <TouchableOpacity
                  style={styles.reactionButton}
                  onPress={() => handleReaction('heart')}
                >
                  <Heart size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.replyInputContainer}>
                <TextInput
                  style={styles.replyInput}
                  placeholder="Tra loi..."
                  placeholderTextColor={COLORS.textMuted}
                  value={replyText}
                  onChangeText={setReplyText}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                />
                {replyText.trim() && (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleReply}
                  >
                    <Send size={20} color={COLORS.cyan} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        )}

        {/* Navigation Arrows (for desktop/web) */}
        {currentGroupIndex > 0 && (
          <TouchableOpacity
            style={[styles.navArrow, styles.navArrowLeft]}
            onPress={goToPreviousStory}
          >
            <ChevronLeft size={32} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
        {currentGroupIndex < storyGroups.length - 1 && (
          <TouchableOpacity
            style={[styles.navArrow, styles.navArrowRight]}
            onPress={goToNextStory}
          >
            <ChevronRight size={32} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  storyImage: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  // Progress
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    gap: 4,
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.textPrimary,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.textPrimary,
  },
  userTextInfo: {
    gap: 2,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  storyTime: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerButton: {
    padding: SPACING.xs,
  },
  // Menu
  menuDropdown: {
    position: 'absolute',
    top: 100,
    right: SPACING.md,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
  },
  menuItemTextDanger: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
  },
  // Touch Areas
  touchAreas: {
    flex: 1,
    flexDirection: 'row',
  },
  touchAreaLeft: {
    flex: 1,
  },
  touchAreaRight: {
    flex: 2,
  },
  // Caption
  captionContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  captionText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Footer
  footer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  viewersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    alignSelf: 'flex-start',
    padding: SPACING.sm,
  },
  viewersText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  reactionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  reactionButton: {
    padding: SPACING.sm,
  },
  replyInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  replyInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  sendButton: {
    padding: SPACING.xs,
  },
  // Nav Arrows
  navArrow: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    padding: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  navArrowLeft: {
    left: SPACING.sm,
  },
  navArrowRight: {
    right: SPACING.sm,
  },
});

export default StoryViewerScreen;
