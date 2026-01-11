/**
 * GEM Academy - Daily Quests Preview
 * Shows 3 daily quests on the courses home screen
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Calendar, RefreshCw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';
import { getTodayQuests, claimQuestReward, getDailyQuestProgress } from '../../services/learningGamificationService';
import DailyQuestCard from './DailyQuestCard';

const DailyQuestsPreview = ({ userId = null, onXPGained, style = {} }) => {
  const navigation = useNavigation();
  const [quests, setQuests] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState({});
  const [error, setError] = useState(null);

  const loadQuests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get today's quests
      const questsResult = await getTodayQuests();
      if (!questsResult.success) {
        throw new Error(questsResult.error || 'Failed to load quests');
      }

      // questsResult.data is { quests: [...], completedCount, totalCount, ... }
      const todayQuests = questsResult.data?.quests || [];
      setQuests(todayQuests);

      // Get progress for each quest
      const progressResult = await getDailyQuestProgress();
      if (progressResult.success && progressResult.data) {
        const pMap = {};
        progressResult.data.forEach(p => {
          pMap[p.quest_id] = p;
        });
        setProgressMap(pMap);
      }
    } catch (err) {
      console.error('[DailyQuestsPreview] loadQuests error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  const handleClaimQuest = async (questId, xpReward) => {
    try {
      setClaiming(prev => ({ ...prev, [questId]: true }));

      const result = await claimQuestReward(questId);
      if (result.success) {
        // Update local state
        setProgressMap(prev => ({
          ...prev,
          [questId]: {
            ...prev[questId],
            xp_claimed: true,
          },
        }));

        // Notify parent
        if (onXPGained) {
          onXPGained(xpReward, 'quest_complete');
        }
      }
    } catch (err) {
      console.error('[DailyQuestsPreview] handleClaimQuest error:', err);
    } finally {
      setClaiming(prev => ({ ...prev, [questId]: false }));
    }
  };

  const handleViewAll = () => {
    navigation.navigate('DailyQuests');
  };

  // Calculate time remaining until reset
  const getTimeRemaining = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="small" color={COLORS.gold} />
        <Text style={styles.loadingText}>Đang tải nhiệm vụ...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadQuests}>
            <RefreshCw size={16} color={COLORS.gold} />
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!quests || quests.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Calendar size={18} color={COLORS.gold} strokeWidth={2} />
          <Text style={styles.title}>Nhiệm vụ hàng ngày</Text>
        </View>
        <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAll}>
          <Text style={styles.timeRemaining}>{getTimeRemaining()}</Text>
          <ChevronRight size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Quest cards */}
      <View style={styles.questsList}>
        {(quests || []).slice(0, 3).map(quest => {
          const progress = progressMap[quest.id] || {};
          return (
            <DailyQuestCard
              key={quest.id}
              quest={quest}
              progress={progress.current_progress || 0}
              isCompleted={progress.is_completed || false}
              isClaimed={progress.xp_claimed || false}
              claiming={claiming[quest.id] || false}
              onClaim={() => handleClaimQuest(quest.id, quest.xp_reward)}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },
  loadingContainer: {
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.5)',
    borderRadius: BORDER_RADIUS.lg,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  errorContainer: {
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.5)',
    borderRadius: BORDER_RADIUS.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: BORDER_RADIUS.md,
  },
  retryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    marginLeft: SPACING.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeRemaining: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginRight: SPACING.xxs,
  },
  questsList: {
    gap: SPACING.sm,
  },
});

export default DailyQuestsPreview;
