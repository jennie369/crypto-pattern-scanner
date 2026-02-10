/**
 * GEM Mobile - Affirmation Card Widget
 * Day 17-19: AI Chat → Dashboard Integration
 *
 * Displays daily affirmations with text-to-speech and streak tracking.
 * Uses design tokens for consistent styling.
 */

import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Volume2, Check, ChevronLeft, ChevronRight, Flame, Sparkles } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import widgetManagementService from '../../services/widgetManagementService';
import CustomAlert, { useCustomAlert } from '../CustomAlert';

const AffirmationCard = ({ widget, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(widget.data.currentIndex || 0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { alert, AlertComponent } = useCustomAlert();

  // Ref to hold the primer sound that keeps audio session in playback mode (iOS silent mode fix)
  const primerSoundRef = useRef(null);

  const { affirmations, completedToday, streak } = widget.data;
  const currentAffirmation = affirmations[currentIndex] || 'No affirmations available';

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < affirmations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Cleanup primer sound helper
  const cleanupPrimerSound = async () => {
    if (primerSoundRef.current) {
      await primerSoundRef.current.stopAsync().catch(() => {});
      await primerSoundRef.current.unloadAsync().catch(() => {});
      primerSoundRef.current = null;
    }
  };

  const handleReadAloud = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      await cleanupPrimerSound();
      return;
    }

    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      setIsSpeaking(true);

      // CRITICAL FIX: expo-speech (AVSpeechSynthesizer) on iOS respects mute switch
      // Audio.setAudioModeAsync does NOT affect it. Workaround: play a nearly-silent
      // sound via expo-av to force iOS audio session to playback mode.
      try {
        await cleanupPrimerSound();
        const { sound: primer } = await Audio.Sound.createAsync(
          require('../../../assets/sounds/Ritual_sounds/chime.mp3'),
          { shouldPlay: true, isLooping: true, volume: 0.01 }
        );
        primerSoundRef.current = primer;
      } catch (e) {
        console.log('[AffirmationCard] Primer sound error (non-critical):', e.message);
      }

      await Speech.speak(currentAffirmation, {
        language: 'vi-VN',
        pitch: 1.0,
        rate: 0.8,
        onDone: async () => {
          setIsSpeaking(false);
          await cleanupPrimerSound();
        },
        onStopped: async () => {
          setIsSpeaking(false);
          await cleanupPrimerSound();
        },
        onError: async () => {
          setIsSpeaking(false);
          await cleanupPrimerSound();
        },
      });
    } catch (error) {
      console.error('[AffirmationCard] Error reading aloud:', error);
      setIsSpeaking(false);
      await cleanupPrimerSound();
    }
  };

  const handleMarkDone = async () => {
    try {
      const result = await widgetManagementService.completeAffirmation(
        widget.id,
        currentIndex
      );

      // Move to next affirmation
      setCurrentIndex(result.nextIndex);

      if (onComplete) {
        onComplete();
      }

      // Show encouragement at milestones
      if (result.completedToday === 3) {
        alert({ type: 'success', title: 'Amazing!', message: 'Bạn đã hoàn thành 3 affirmations hôm nay!' });
      } else if (result.streak === 7) {
        alert({ type: 'success', title: 'Streak!', message: 'Bạn đã duy trì streak 7 ngày liên tục!' });
      }
    } catch (error) {
      console.error('[AffirmationCard] Error marking done:', error);
      alert({ type: 'error', title: 'Lỗi', message: 'Không thể cập nhật' });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Sparkles size={SPACING.xl} color={COLORS.gold} />
        <Text style={styles.headerText}>Today's Affirmation</Text>
      </View>

      {/* Affirmation Text */}
      <View style={styles.affirmationContainer}>
        <Text style={styles.affirmationText}>{currentAffirmation}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleReadAloud}
        >
          <Volume2 size={SPACING.xl} color={isSpeaking ? COLORS.error : COLORS.gold} />
          <Text style={[styles.actionText, isSpeaking && styles.actionTextActive]}>
            {isSpeaking ? 'Stop' : 'Read Aloud'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.doneButton]}
          onPress={handleMarkDone}
        >
          <Check size={SPACING.xl} color={COLORS.bgMid} />
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft
            size={SPACING.xxl}
            color={currentIndex === 0 ? COLORS.textDisabled : COLORS.gold}
          />
        </TouchableOpacity>

        <Text style={styles.navText}>
          {currentIndex + 1} / {affirmations.length}
        </Text>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentIndex === affirmations.length - 1 && styles.navButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={currentIndex === affirmations.length - 1}
        >
          <ChevronRight
            size={SPACING.xxl}
            color={currentIndex === affirmations.length - 1 ? COLORS.textDisabled : COLORS.gold}
          />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Check size={TYPOGRAPHY.fontSize.lg} color={COLORS.success} />
          <Text style={styles.statsText}>
            Completed {completedToday || 0}x today
          </Text>
        </View>
        <View style={styles.streakContainer}>
          <Flame size={TYPOGRAPHY.fontSize.lg} color={COLORS.error} />
          <Text style={styles.streakText}>{streak || 0}-day streak</Text>
        </View>
      </View>
      {AlertComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(156, 6, 18, 0.15)',
    borderRadius: GLASS.borderRadius,
    padding: SPACING.xxl,
    marginBottom: SPACING.md,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  headerText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    textAlign: 'center',
  },
  affirmationContainer: {
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    marginBottom: SPACING.lg,
  },
  affirmationText: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  actionTextActive: {
    color: COLORS.error,
  },
  doneButton: {
    backgroundColor: COLORS.gold,
  },
  doneText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgMid,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  navButton: {
    padding: SPACING.sm,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statsText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  streakText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.error,
  },
});

export default AffirmationCard;
