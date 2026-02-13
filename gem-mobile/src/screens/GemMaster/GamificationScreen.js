/**
 * GAMIFICATION SCREEN
 * Level, XP, badges, and achievements display
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Flame,
  Trophy,
  Star,
  Award,
  Crown,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  Shield,
  Heart,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { streakService, LEVELS, BADGES } from '../../services/streakService';
import { emotionDetectionService } from '../../services/emotionDetectionService';

// Level icons mapping
const LEVEL_ICONS = {
  seedling: Star,
  sprout: Star,
  leaf: Star,
  tree: Shield,
  mountain: Shield,
  sunrise: Crown,
  sun: Crown,
  star: Crown,
};

const GamificationScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gamificationData, setGamificationData] = useState(null);
  const [frequencyTrend, setFrequencyTrend] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gamification, trend] = await Promise.all([
        streakService.getGamificationSummary(user.id),
        emotionDetectionService.getFrequencyTrend(user.id, 14),
      ]);

      setGamificationData(gamification);
      setFrequencyTrend(trend);
    } catch (error) {
      console.error('[GamificationScreen] loadData error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [user?.id]);

  const renderLevelCard = () => {
    if (!gamificationData) return null;

    const { level, levelName, levelColor, totalPoints, progressPercent, pointsToNext, isMaxLevel } = gamificationData;
    const LevelIcon = LEVEL_ICONS[LEVELS.find(l => l.level === level)?.icon] || Star;

    return (
      <View style={styles.levelCard}>
        <View style={[styles.levelIconContainer, { backgroundColor: `${levelColor}20` }]}>
          <LevelIcon size={48} color={levelColor} />
        </View>

        <View style={styles.levelInfo}>
          <Text style={styles.levelLabel}>Level {level}</Text>
          <Text style={[styles.levelName, { color: levelColor }]}>{levelName}</Text>

          <View style={styles.xpContainer}>
            <TrendingUp size={14} color="#4CAF50" />
            <Text style={styles.xpText}>{totalPoints} XP</Text>
          </View>
        </View>

        {!isMaxLevel && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, progressPercent)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {pointsToNext} XP để lên level tiếp
            </Text>
          </View>
        )}

        {isMaxLevel && (
          <View style={styles.maxLevelBadge}>
            <Crown size={16} color="#FFD700" />
            <Text style={styles.maxLevelText}>Level tối đa!</Text>
          </View>
        )}
      </View>
    );
  };

  const renderStreakSection = () => {
    if (!gamificationData) return null;

    const { currentStreak, longestStreak, streakStartDate } = gamificationData;

    const getStreakDaysText = () => {
      if (!streakStartDate) return 'Chưa bắt đầu';
      const start = new Date(streakStartDate);
      return `Từ ${start.toLocaleDateString('vi-VN')}`;
    };

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Flame size={20} color="#FF6347" />
          <Text style={styles.sectionTitle}>Streak</Text>
        </View>

        <View style={styles.streakCards}>
          <View style={styles.streakCard}>
            <Flame size={32} color="#FF6347" />
            <Text style={styles.streakNumber}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>Hiện tại</Text>
          </View>

          <View style={styles.streakCard}>
            <Trophy size={32} color="#FFD700" />
            <Text style={styles.streakNumber}>{longestStreak}</Text>
            <Text style={styles.streakLabel}>Kỷ lục</Text>
          </View>

          <View style={styles.streakCard}>
            <Calendar size={32} color="#4169E1" />
            <Text style={styles.streakDate}>{getStreakDaysText()}</Text>
            <Text style={styles.streakLabel}>Bắt đầu</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderBadgesSection = () => {
    if (!gamificationData?.badges) return null;

    const { badges, earnedBadgesCount, totalBadges } = gamificationData;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Award size={20} color="#9370DB" />
          <Text style={styles.sectionTitle}>Huy hiệu</Text>
          <View style={styles.badgeCount}>
            <Text style={styles.badgeCountText}>
              {earnedBadgesCount}/{totalBadges}
            </Text>
          </View>
        </View>

        <View style={styles.badgesGrid}>
          {badges.map((badge) => (
            <TouchableOpacity
              key={badge.id}
              style={[
                styles.badgeItem,
                !badge.earned && styles.badgeItemLocked,
              ]}
            >
              <View
                style={[
                  styles.badgeIcon,
                  { backgroundColor: badge.earned ? `${badge.color}20` : '#33333350' },
                  badge.earned && { borderColor: badge.color, borderWidth: 2 },
                ]}
              >
                {badge.icon === 'trophy' ? (
                  <Trophy size={28} color={badge.earned ? badge.color : '#555555'} />
                ) : badge.icon === 'crown' ? (
                  <Crown size={28} color={badge.earned ? badge.color : '#555555'} />
                ) : (
                  <Award size={28} color={badge.earned ? badge.color : '#555555'} />
                )}
              </View>
              <Text
                style={[
                  styles.badgeName,
                  !badge.earned && styles.badgeNameLocked,
                ]}
                numberOfLines={2}
              >
                {badge.name}
              </Text>
              <Text style={styles.badgeRequirement}>
                {badge.requirement} ngày
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderFrequencySection = () => {
    if (!frequencyTrend || frequencyTrend.trend === 'insufficient_data') return null;

    const getTrendIcon = () => {
      switch (frequencyTrend.trend) {
        case 'rising':
          return <TrendingUp size={20} color="#4CAF50" />;
        case 'falling':
          return <TrendingUp size={20} color="#FF9800" style={{ transform: [{ rotate: '180deg' }] }} />;
        default:
          return <Target size={20} color="#2196F3" />;
      }
    };

    const getTrendColor = () => {
      switch (frequencyTrend.trend) {
        case 'rising':
          return '#4CAF50';
        case 'falling':
          return '#FF9800';
        default:
          return '#2196F3';
      }
    };

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Zap size={20} color="#FFBD59" />
          <Text style={styles.sectionTitle}>Tần số cảm xúc</Text>
        </View>

        <View style={styles.frequencyCard}>
          <View style={styles.frequencyMain}>
            <Text style={styles.frequencyValue}>{frequencyTrend.avgFrequency}</Text>
            <Text style={styles.frequencyUnit}>Hz</Text>
            {getTrendIcon()}
          </View>

          <Text style={[styles.frequencyTrend, { color: getTrendColor() }]}>
            {frequencyTrend.message}
          </Text>

          <View style={styles.frequencyStats}>
            <View style={styles.frequencyStat}>
              <Text style={styles.frequencyStatLabel}>7 ngày gần nhất</Text>
              <Text style={styles.frequencyStatValue}>{frequencyTrend.recentAvg} Hz</Text>
            </View>
            <View style={styles.frequencyStat}>
              <Text style={styles.frequencyStatLabel}>Trước đó</Text>
              <Text style={styles.frequencyStatValue}>{frequencyTrend.olderAvg} Hz</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderLevelsPreview = () => {
    const currentLevel = gamificationData?.level || 1;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Star size={20} color="#FFD700" />
          <Text style={styles.sectionTitle}>Các cấp độ</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {LEVELS.map((levelInfo) => {
            const isCurrentLevel = levelInfo.level === currentLevel;
            const isLocked = levelInfo.level > currentLevel;
            const LevelIcon = LEVEL_ICONS[levelInfo.icon] || Star;

            return (
              <View
                key={levelInfo.level}
                style={[
                  styles.levelPreviewCard,
                  isCurrentLevel && styles.levelPreviewActive,
                  isLocked && styles.levelPreviewLocked,
                ]}
              >
                <LevelIcon
                  size={24}
                  color={isLocked ? '#555555' : levelInfo.color}
                />
                <Text
                  style={[
                    styles.levelPreviewNumber,
                    isLocked && styles.levelPreviewTextLocked,
                  ]}
                >
                  {levelInfo.level}
                </Text>
                <Text
                  style={[
                    styles.levelPreviewName,
                    isLocked && styles.levelPreviewTextLocked,
                  ]}
                  numberOfLines={1}
                >
                  {levelInfo.name}
                </Text>
                <Text style={styles.levelPreviewXP}>
                  {levelInfo.minPoints}+ XP
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gamification</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFBD59"
          />
        }
      >
        {/* Level Card */}
        {renderLevelCard()}

        {/* Streak Section */}
        {renderStreakSection()}

        {/* Badges Section */}
        {renderBadgesSection()}

        {/* Frequency Section */}
        {renderFrequencySection()}

        {/* Levels Preview */}
        {renderLevelsPreview()}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },

  // Level Card
  levelCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  levelIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  levelInfo: {
    alignItems: 'center',
  },
  levelLabel: {
    color: '#808080',
    fontSize: 14,
  },
  levelName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  xpText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  progressContainer: {
    marginTop: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    color: '#808080',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  maxLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
  },
  maxLevelText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },

  // Streak
  streakCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  streakNumber: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  streakDate: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  streakLabel: {
    color: '#808080',
    fontSize: 12,
    marginTop: 4,
  },

  // Badges
  badgeCount: {
    backgroundColor: 'rgba(147, 112, 219, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeCountText: {
    color: '#9370DB',
    fontSize: 12,
    fontWeight: '600',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeItemLocked: {
    opacity: 0.5,
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: '#808080',
  },
  badgeRequirement: {
    color: '#808080',
    fontSize: 10,
    marginTop: 2,
  },

  // Frequency
  frequencyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  frequencyMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  frequencyValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '700',
  },
  frequencyUnit: {
    color: '#808080',
    fontSize: 18,
    marginLeft: 4,
    marginRight: 12,
  },
  frequencyTrend: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  frequencyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  frequencyStat: {
    alignItems: 'center',
  },
  frequencyStatLabel: {
    color: '#808080',
    fontSize: 12,
  },
  frequencyStatValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },

  // Levels Preview
  levelPreviewCard: {
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  levelPreviewActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderColor: '#FFBD59',
    borderWidth: 1,
  },
  levelPreviewLocked: {
    opacity: 0.5,
  },
  levelPreviewNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  levelPreviewName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  levelPreviewTextLocked: {
    color: '#808080',
  },
  levelPreviewXP: {
    color: '#808080',
    fontSize: 10,
    marginTop: 4,
  },
});

export default GamificationScreen;
