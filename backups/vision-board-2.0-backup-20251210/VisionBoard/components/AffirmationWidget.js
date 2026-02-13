/**
 * AffirmationWidget - Affirmation carousel với Read Aloud & Done
 *
 * Features:
 * - Carousel navigation (prev/next)
 * - Read Aloud (expo-speech)
 * - Mark as Done
 * - Stats: completed today, streak
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  SlideInRight,
} from 'react-native-reanimated';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { supabase } from '../../../services/supabase';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Default affirmations (Vietnamese)
const DEFAULT_AFFIRMATIONS = [
  'Tiền đến với tôi dễ dàng',
  'Tôi xứng đáng được giàu có',
  'Tôi thu hút sự thịnh vượng',
  'Mỗi ngày tôi càng thành công hơn',
  'Tôi biết ơn tất cả những gì tôi có',
  'Vũ trụ luôn ủng hộ tôi',
  'Tôi là nam châm hút tiền',
  'Cơ hội đến với tôi mỗi ngày',
  'Tôi tự tin và mạnh mẽ',
  'Tình yêu bao quanh tôi',
];

const AffirmationWidget = ({ completedToday = 0, streak = 0, onComplete }) => {
  const [affirmations, setAffirmations] = useState(DEFAULT_AFFIRMATIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentAffirmation = affirmations[currentIndex];

  // Navigate affirmations
  const goNext = () => {
    if (currentIndex < affirmations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Loop back to first
      setCurrentIndex(0);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      // Loop to last
      setCurrentIndex(affirmations.length - 1);
    }
  };

  // Read aloud
  const handleReadAloud = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      await Speech.speak(currentAffirmation, {
        language: 'vi-VN',
        pitch: 1,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // Mark as done
  const handleDone = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Upsert completion
      await supabase
        .from('affirmation_completions')
        .upsert({
          user_id: user.id,
          completed_date: today,
          count: completedToday + 1,
        }, {
          onConflict: 'user_id,completed_date',
        });

      // Update streak (call RPC if exists)
      try {
        await supabase.rpc('update_affirmation_streak', { p_user_id: user.id });
      } catch (rpcError) {
        // RPC might not exist, ignore
        console.log('[AffirmationWidget] RPC not available');
      }

      onComplete?.();

      // Move to next affirmation
      goNext();
    } catch (error) {
      console.error('[AffirmationWidget] Mark done error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Sparkles size={20} color={COLORS.gold} />
        <Text style={styles.headerTitle}>Today's Affirmation</Text>
      </View>

      {/* Affirmation Card */}
      <Animated.View
        key={currentIndex}
        entering={SlideInRight.duration(300)}
        style={styles.affirmationCard}
      >
        <Text style={styles.affirmationLabel}>Affirmation:</Text>
        <Text style={styles.affirmationText}>"{currentAffirmation}"</Text>
      </Animated.View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.readAloudButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => {
            console.log('[AffirmationWidget] Read aloud pressed');
            handleReadAloud();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isSpeaking ? (
            <VolumeX size={18} color={COLORS.burgundy} />
          ) : (
            <Volume2 size={18} color={COLORS.burgundy} />
          )}
          <Text style={styles.readAloudText}>
            {isSpeaking ? 'Dừng' : 'Read Aloud'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.doneButton,
            pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
          ]}
          onPress={() => {
            console.log('[AffirmationWidget] Done pressed');
            handleDone();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Check size={18} color="#1a1a1a" />
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <Pressable
          style={({ pressed }) => [
            styles.navButton,
            pressed && { opacity: 0.6 },
          ]}
          onPress={() => {
            console.log('[AffirmationWidget] Prev pressed');
            goPrev();
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </Pressable>

        <Text style={styles.pageIndicator}>
          {currentIndex + 1} / {affirmations.length}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.navButton,
            pressed && { opacity: 0.6 },
          ]}
          onPress={() => {
            console.log('[AffirmationWidget] Next pressed');
            goNext();
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ChevronRight size={24} color={COLORS.textPrimary} />
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Check size={16} color={COLORS.success} />
          <Text style={styles.statText}>
            Completed {completedToday}x today
          </Text>
        </View>

        <View style={styles.statItem}>
          <Flame size={16} color={COLORS.gold} />
          <Text style={[styles.statText, { color: COLORS.gold }]}>
            {streak}-day streak
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(156, 6, 18, 0.15)',
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(156, 6, 18, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gold,
  },
  affirmationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  affirmationLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  affirmationText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  readAloudButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.burgundy,
  },
  readAloudText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.burgundy,
  },
  doneButton: {
    backgroundColor: COLORS.gold,
  },
  doneText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  navButton: {
    padding: SPACING.sm,
  },
  pageIndicator: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    fontSize: 13,
    color: COLORS.success,
  },
});

export default AffirmationWidget;
