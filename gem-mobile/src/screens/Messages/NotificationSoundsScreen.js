/**
 * NotificationSoundsScreen
 * Screen for selecting notification sound for a conversation
 *
 * Features:
 * - List of built-in sounds
 * - Play preview
 * - Gem-themed sounds highlighted
 * - Silent option
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';

// Constants
import { NOTIFICATION_SOUNDS, getSound } from '../../constants/notificationSounds';

// Services
import messagingService from '../../services/messagingService';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
} from '../../utils/tokens';

export default function NotificationSoundsScreen({ route, navigation }) {
  const { conversationId, currentSound = 'default' } = route.params || {};
  const insets = useSafeAreaInsets();

  // State
  const [selectedSound, setSelectedSound] = useState(currentSound);
  const [playingSound, setPlayingSound] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Refs
  const soundRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Handle play sound preview
  const handlePlaySound = useCallback(async (sound) => {
    try {
      // Stop current sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Silent or no file
      if (!sound.file || sound.isSilent) {
        setPlayingSound(null);
        return;
      }

      setPlayingSound(sound.id);

      const { sound: audioSound } = await Audio.Sound.createAsync(sound.file);
      soundRef.current = audioSound;

      audioSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingSound(null);
        }
      });

      await audioSound.playAsync();
    } catch (err) {
      console.error('[NotificationSounds] Play error:', err);
      setPlayingSound(null);
    }
  }, []);

  // Handle select sound
  const handleSelectSound = useCallback((soundId) => {
    setSelectedSound(soundId);
    const sound = getSound(soundId);
    if (sound && sound.file) {
      handlePlaySound(sound);
    }
  }, [handlePlaySound]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!conversationId) {
      navigation.goBack();
      return;
    }

    setIsSaving(true);
    try {
      await messagingService.updateConversationSound(conversationId, selectedSound);
      navigation.goBack();
    } catch (err) {
      console.error('[NotificationSounds] Save error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [conversationId, selectedSound, navigation]);

  // Render sound item
  const renderSoundItem = useCallback(({ item }) => {
    const isSelected = selectedSound === item.id;
    const isPlaying = playingSound === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.soundItem,
          isSelected && styles.soundItemSelected,
        ]}
        onPress={() => handleSelectSound(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.soundInfo}>
          <Text style={styles.soundEmoji}>{item.emoji}</Text>
          <View style={styles.soundTextContainer}>
            <Text style={styles.soundName}>{item.name}</Text>
            {item.isGemTheme && (
              <View style={styles.gemBadge}>
                <Ionicons name="sparkles" size={10} color={COLORS.purple} />
                <Text style={styles.gemBadgeText}>Gem Theme</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.soundActions}>
          {/* Play button - only if has sound file */}
          {item.file && !item.isSilent && (
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => handlePlaySound(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isPlaying ? (
                <ActivityIndicator size="small" color={COLORS.cyan} />
              ) : (
                <Ionicons name="play" size={16} color={COLORS.cyan} />
              )}
            </TouchableOpacity>
          )}

          {/* Selected checkmark */}
          {isSelected && (
            <View style={styles.checkmark}>
              <Ionicons name="checkmark" size={16} color={COLORS.bgDarkest} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [selectedSound, playingSound, handleSelectSound, handlePlaySound]);

  // List header - Gem themes section
  const ListHeaderComponent = useCallback(() => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Chọn âm báo</Text>
      <Text style={styles.sectionSubtitle}>
        Âm báo sẽ được phát khi bạn nhận tin nhắn mới trong cuộc trò chuyện này
      </Text>
    </View>
  ), []);

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Âm báo tin nhắn</Text>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={COLORS.gold} />
          ) : (
            <Text style={styles.saveButtonText}>Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Sounds List */}
      <FlatList
        data={NOTIFICATION_SOUNDS}
        renderItem={renderSoundItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Safe area bottom */}
      <View style={{ height: insets.bottom }} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  saveButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  // List
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // Section header
  sectionHeader: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    lineHeight: 20,
  },

  // Sound item
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  soundItemSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.08)',
  },
  soundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  soundEmoji: {
    fontSize: 28,
  },
  soundTextContainer: {
    flex: 1,
  },
  soundName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  gemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  gemBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.purple,
  },
  soundActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
