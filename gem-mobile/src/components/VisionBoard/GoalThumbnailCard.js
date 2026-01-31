/**
 * GoalThumbnailCard - Thumbnail card cho grid display
 *
 * Component hiển thị mục tiêu dạng card trong grid 2 cột
 * - Hình ảnh chiếm phần lớn card
 * - Icon nhỏ bên cạnh title
 *
 * Created: January 30, 2026
 * Updated: January 30, 2026 - Icon nhỏ bên cạnh title
 */

import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, Wallet, Briefcase, Heart, User, Sparkles, TrendingUp } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import OptimizedImage from '../Common/OptimizedImage';

// ========== CONSTANTS ==========
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12; // Gap between columns
const HORIZONTAL_PADDING = 12; // Parent ScrollView padding (SPACING.md = 12)
// Calculate card width: (screen - padding*2 - gap) / 2
const AVAILABLE_WIDTH = SCREEN_WIDTH - (HORIZONTAL_PADDING * 2);
const CARD_WIDTH = Math.floor((AVAILABLE_WIDTH - CARD_GAP) / 2);
// FIXED: Changed from 1.3 to 1.0 for 1:1 square ratio
const CARD_HEIGHT = CARD_WIDTH;

// Life area config - icon và label
const LIFE_AREA_CONFIG = {
  finance: { label: 'Tài chính', icon: Wallet },
  career: { label: 'Sự nghiệp', icon: Briefcase },
  health: { label: 'Sức khỏe', icon: Heart },
  relationships: { label: 'Tình yêu', icon: Heart },
  personal: { label: 'Cá nhân', icon: User },
  spiritual: { label: 'Tâm thức', icon: Sparkles },
  general: { label: 'Chung', icon: Target },
  crypto: { label: 'Crypto', icon: TrendingUp },
};

/**
 * GoalThumbnailCard Component
 * @param {Object} goal - Goal data
 * @param {Function} onPress - Press handler
 * @param {Function} onLongPress - Long press handler (for reorder mode)
 * @param {number} index - Index in grid
 * @param {Object} style - Additional styles
 */
const GoalThumbnailCard = ({ goal, onPress, onLongPress, index = 0, style }) => {
  if (!goal?.id) return null;

  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Extract data
  const goalData = useMemo(() => {
    // Parse content if it's a JSON string (from database)
    let content = goal.content || goal._content || {};
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (e) {
        console.warn('[GoalThumbnailCard] Failed to parse content JSON:', e.message);
        content = {};
      }
    }

    const title = goal.title
      || content.title
      || content.goalText
      || content.text
      || content.goals?.[0]?.title
      || content.goals?.[0]?.text
      || 'Mục tiêu';

    const coverImage = goal.cover_image
      || content.cover_image
      || content.coverImage
      || content.image_url
      || content.imageUrl
      || null;

    const lifeArea = (goal.life_area
      || content.lifeArea
      || content.life_area
      || 'personal'
    ).toLowerCase();

    const progress = goal.progress_percent
      || content.progress
      || content.progress_percent
      || 0;

    const actionsCompleted = goal.actions_completed || 0;
    const actionsTotal = goal.actions_total || 0;

    return {
      id: goal.id,
      title,
      coverImage,
      lifeArea,
      progress: Math.min(100, Math.max(0, progress)),
      actionsCompleted,
      actionsTotal,
    };
  }, [goal]);

  const areaConfig = LIFE_AREA_CONFIG[goalData.lifeArea] || LIFE_AREA_CONFIG.personal;
  const AreaIcon = areaConfig.icon || Target;

  const calculatedProgress = useMemo(() => {
    if (goalData.actionsTotal > 0) {
      return Math.min(100, Math.round((goalData.actionsCompleted / goalData.actionsTotal) * 100));
    }
    return Math.min(100, Math.max(0, goalData.progress));
  }, [goalData.actionsCompleted, goalData.actionsTotal, goalData.progress]);

  const imageCacheKey = useMemo(() =>
    goal.updated_at ? new Date(goal.updated_at).getTime() : goal.id,
    [goal.updated_at, goal.id]
  );

  const handlePress = useCallback(() => {
    if (onPress && goal) onPress(goal);
  }, [onPress, goal]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const hasImage = goalData.coverImage && !imageError;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      onLongPress={onLongPress ? () => onLongPress(goal) : undefined}
      delayLongPress={500}
      activeOpacity={0.7}
    >
      {/* Image Area */}
      <View style={styles.imageArea}>
        {hasImage ? (
          <>
            <OptimizedImage
              uri={goalData.coverImage}
              style={styles.image}
              resizeMode="cover"
              cacheKey={imageCacheKey}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            {imageLoading && (
              <View style={styles.imageLoading}>
                <ActivityIndicator size="small" color={COLORS.gold} />
              </View>
            )}
          </>
        ) : (
          <View style={styles.placeholder}>
            <Target size={32} color={COLORS.textMuted} />
            <Text style={styles.placeholderText}>Chưa có hình</Text>
          </View>
        )}

        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
      </View>

      {/* Content overlay at bottom */}
      <View style={styles.content}>
        {/* Title row with small icon */}
        <View style={styles.titleRow}>
          <View style={styles.iconBadge}>
            <AreaIcon size={12} color={COLORS.gold} />
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {goalData.title}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${calculatedProgress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{calculatedProgress}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: CARD_GAP,
    backgroundColor: 'rgba(30, 35, 60, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },

  imageArea: {
    flex: 1,
    position: 'relative',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  imageLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },

  placeholderText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },

  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },

  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.sm,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },

  iconBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },

  title: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },

  progressText: {
    color: COLORS.textMuted,
    fontSize: 10,
    minWidth: 26,
    textAlign: 'right',
  },
});

export default memo(GoalThumbnailCard);
