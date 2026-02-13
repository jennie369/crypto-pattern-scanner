/**
 * Gemral - Follow Button Component
 * Instagram/TikTok style Follow/Following button
 * With loading state, confirm dialog, and suggestions dropdown
 *
 * Uses DESIGN_TOKENS v3.0
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserPlus, UserCheck, ChevronDown, Users } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS } from '../../utils/tokens';
import { followService } from '../../services/followService';
import CustomAlert, { useCustomAlert } from '../CustomAlert';

/**
 * FollowButton - Main follow/unfollow button
 *
 * @param {Object} props
 * @param {string} props.userId - User ID to follow/unfollow
 * @param {boolean} props.initialIsFollowing - Initial follow status
 * @param {Function} props.onFollowChange - Callback when follow status changes
 * @param {Function} props.onShowSuggestions - Callback to show suggestions dropdown
 * @param {string} props.size - 'small' | 'medium' | 'large'
 * @param {boolean} props.showDropdownIcon - Show chevron for suggestions
 * @param {Object} props.style - Custom container style
 */
const FollowButton = ({
  userId,
  initialIsFollowing = false,
  onFollowChange,
  onShowSuggestions,
  size = 'medium',
  showDropdownIcon = true,
  style,
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const { alert, AlertComponent } = useCustomAlert();

  // Check initial follow status
  useEffect(() => {
    const checkStatus = async () => {
      if (!userId) {
        setCheckingStatus(false);
        return;
      }

      try {
        const status = await followService.checkFollowStatus(userId);
        setIsFollowing(status);
      } catch (error) {
        console.error('[FollowButton] Check status error:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkStatus();
  }, [userId]);

  const handlePress = async () => {
    if (loading || !userId) return;

    if (isFollowing) {
      // Confirm unfollow
      alert({
        type: 'warning',
        title: 'Bỏ theo dõi?',
        message: 'Bạn có chắc muốn bỏ theo dõi người dùng này?',
        buttons: [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Bỏ theo dõi',
            style: 'destructive',
            onPress: handleUnfollow,
          },
        ],
      });
    } else {
      await handleFollow();
    }
  };

  const handleFollow = async () => {
    setLoading(true);
    try {
      const result = await followService.followUser(userId);

      if (result.success) {
        setIsFollowing(true);
        if (onFollowChange) {
          onFollowChange(true, userId);
        }
        // Show suggestions after follow
        if (onShowSuggestions) {
          onShowSuggestions(userId);
        }
      } else {
        alert({ type: 'error', title: 'Lỗi', message: 'Không thể theo dõi. Vui lòng thử lại.' });
      }
    } catch (error) {
      console.error('[FollowButton] Follow error:', error);
      alert({ type: 'error', title: 'Lỗi', message: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setLoading(true);
    try {
      const result = await followService.unfollowUser(userId);

      if (result.success) {
        setIsFollowing(false);
        if (onFollowChange) {
          onFollowChange(false, userId);
        }
      } else {
        alert({ type: 'error', title: 'Lỗi', message: 'Không thể bỏ theo dõi. Vui lòng thử lại.' });
      }
    } catch (error) {
      console.error('[FollowButton] Unfollow error:', error);
      alert({ type: 'error', title: 'Lỗi', message: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  // Get size-specific styles
  const sizeStyles = {
    small: {
      container: styles.containerSmall,
      text: styles.textSmall,
      icon: 14,
    },
    medium: {
      container: styles.containerMedium,
      text: styles.textMedium,
      icon: 16,
    },
    large: {
      container: styles.containerLarge,
      text: styles.textLarge,
      icon: 18,
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  if (checkingStatus) {
    return (
      <>
        <View style={[styles.container, currentSize.container, styles.loadingContainer, style]}>
          <ActivityIndicator size="small" color={COLORS.textPrimary} />
        </View>
        {AlertComponent}
      </>
    );
  }

  if (isFollowing) {
    // Following state - secondary style
    return (
      <>
        <TouchableOpacity
          style={[styles.container, currentSize.container, styles.followingContainer, style]}
          onPress={handlePress}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.textPrimary} />
          ) : (
            <>
              <UserCheck size={currentSize.icon} color={COLORS.textPrimary} />
              <Text style={[styles.text, currentSize.text]}>Đang theo dõi</Text>
              {showDropdownIcon && (
                <ChevronDown size={14} color={COLORS.textMuted} />
              )}
            </>
          )}
        </TouchableOpacity>
        {AlertComponent}
      </>
    );
  }

  // Not following - primary style
  return (
    <TouchableOpacity
      style={[style]}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={GRADIENTS.primaryButton}
        style={[styles.container, currentSize.container, styles.followContainer]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.textPrimary} />
        ) : (
          <>
            <UserPlus size={currentSize.icon} color={COLORS.textPrimary} />
            <Text style={[styles.text, currentSize.text, styles.followText]}>
              Theo dõi
            </Text>
          </>
        )}
      </LinearGradient>
      {AlertComponent}
    </TouchableOpacity>
  );
};

/**
 * FollowButtonMini - Compact version for lists
 */
export const FollowButtonMini = ({
  userId,
  initialIsFollowing = false,
  onFollowChange,
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading || !userId) return;

    setLoading(true);
    try {
      if (isFollowing) {
        const result = await followService.unfollowUser(userId);
        if (result.success) {
          setIsFollowing(false);
          onFollowChange?.(false, userId);
        }
      } else {
        const result = await followService.followUser(userId);
        if (result.success) {
          setIsFollowing(true);
          onFollowChange?.(true, userId);
        }
      }
    } catch (error) {
      console.error('[FollowButtonMini] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.miniContainer,
        isFollowing ? styles.miniFollowing : styles.miniFollow,
      ]}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isFollowing ? COLORS.textPrimary : COLORS.textPrimary}
        />
      ) : (
        <Text style={[
          styles.miniText,
          isFollowing ? styles.miniFollowingText : styles.miniFollowText,
        ]}>
          {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

/**
 * MutualFollowersIndicator - Shows mutual followers count
 */
export const MutualFollowersIndicator = ({
  count = 0,
  names = [],
  onPress,
}) => {
  if (count === 0) return null;

  const displayText = names.length > 0
    ? `${names[0]}${names.length > 1 ? ` và ${count - 1} người khác` : ''} đã theo dõi`
    : `${count} người bạn đã theo dõi`;

  return (
    <TouchableOpacity
      style={styles.mutualContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Users size={12} color={COLORS.textMuted} />
      <Text style={styles.mutualText} numberOfLines={1}>
        {displayText}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Main Container
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },

  // Size variants
  containerSmall: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    minWidth: 80,
  },
  containerMedium: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 10,
    minWidth: 100,
  },
  containerLarge: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    minWidth: 120,
  },

  // Follow state (primary)
  followContainer: {
    borderWidth: 1,
    borderColor: COLORS.gold,
  },

  // Following state (secondary)
  followingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Loading container
  loadingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Text styles
  text: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  textSmall: {
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  textMedium: {
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  textLarge: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  followText: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Mini button
  miniContainer: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 6,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniFollow: {
    backgroundColor: COLORS.purple,
  },
  miniFollowing: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  miniText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  miniFollowText: {
    color: COLORS.textPrimary,
  },
  miniFollowingText: {
    color: COLORS.textSecondary,
  },

  // Mutual followers
  mutualContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  mutualText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    flex: 1,
  },
});

export default FollowButton;
