/**
 * Restricted Users Screen
 * TikTok-style silent blocking management
 *
 * Features:
 * - List restricted users (silent block)
 * - View restricted messages from each user
 * - Unrestrict user action
 * - Pull-to-refresh
 * - Animated entrance
 * - Empty state
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Services
import restrictedUsersService from '../../services/restrictedUsersService';

// Auth
import { useAuth } from '../../contexts/AuthContext';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
  TOUCH,
} from '../../utils/tokens';

export default function RestrictedUsersScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // State
  const [restrictedUsers, setRestrictedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchRestrictedUsers = useCallback(async () => {
    try {
      const data = await restrictedUsersService.getRestrictedUsers();
      setRestrictedUsers(data || []);
    } catch (error) {
      console.error('Error fetching restricted users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRestrictedUsers();
  }, [fetchRestrictedUsers]);

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRestrictedUsers();
  }, [fetchRestrictedUsers]);

  const handleUnrestrict = useCallback(async (restrictedUser) => {
    Alert.alert(
      'B\u1ecf h\u1ea1n ch\u1ebf',
      `B\u1ea1n c\u00f3 ch\u1eafc ch\u1eafn mu\u1ed1n b\u1ecf h\u1ea1n ch\u1ebf ${restrictedUser.restricted_user?.display_name || 'ng\u01b0\u1eddi d\u00f9ng n\u00e0y'}? H\u1ecd s\u1ebd c\u00f3 th\u1ec3 nh\u1eafn tin b\u00ecnh th\u01b0\u1eddng cho b\u1ea1n.`,
      [
        { text: 'H\u1ee7y', style: 'cancel' },
        {
          text: 'B\u1ecf h\u1ea1n ch\u1ebf',
          onPress: async () => {
            setProcessingId(restrictedUser.restricted_user_id);
            try {
              await restrictedUsersService.unrestrictUser(restrictedUser.restricted_user_id);
              // Remove from local state
              setRestrictedUsers(prev =>
                prev.filter(u => u.restricted_user_id !== restrictedUser.restricted_user_id)
              );
            } catch (error) {
              console.error('Error unrestricting user:', error);
              Alert.alert('L\u1ed7i', 'Kh\u00f4ng th\u1ec3 b\u1ecf h\u1ea1n ch\u1ebf ng\u01b0\u1eddi d\u00f9ng. Vui l\u00f2ng th\u1eed l\u1ea1i.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  }, []);

  const handleViewMessages = useCallback((restrictedUser) => {
    navigation.navigate('Chat', {
      conversationId: restrictedUser.conversation_id,
      isRestricted: true,
    });
  }, [navigation]);

  const handleViewProfile = useCallback((userId) => {
    navigation.navigate('UserProfile', { userId });
  }, [navigation]);

  // =====================================================
  // RENDER
  // =====================================================

  const renderRestrictedUser = ({ item, index }) => (
    <RestrictedUserItem
      item={item}
      index={index}
      onUnrestrict={() => handleUnrestrict(item)}
      onViewMessages={() => handleViewMessages(item)}
      onViewProfile={() => handleViewProfile(item.restricted_user_id)}
      isProcessing={processingId === item.restricted_user_id}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <LinearGradient
          colors={GRADIENTS.glassBorder}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyIconGradient}
        >
          <Ionicons name="eye-off-outline" size={48} color={COLORS.textPrimary} />
        </LinearGradient>
      </View>
      <Text style={styles.emptyTitle}>Kh\u00f4ng c\u00f3 ng\u01b0\u1eddi b\u1ecb h\u1ea1n ch\u1ebf</Text>
      <Text style={styles.emptySubtitle}>
        Khi b\u1ea1n h\u1ea1n ch\u1ebf ai \u0111\u00f3, h\u1ecd s\u1ebd kh\u00f4ng bi\u1ebft \u0111i\u1ec1u \u0111\u00f3.{'\n'}
        Tin nh\u1eafn c\u1ee7a h\u1ecd s\u1ebd \u0111\u01b0\u1ee3c chuy\u1ec3n v\u00e0o th\u01b0 m\u1ee5c h\u1ea1n ch\u1ebf.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.container}
      >
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ng\u01b0\u1eddi b\u1ecb h\u1ea1n ch\u1ebf</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ng\u01b0\u1eddi b\u1ecb h\u1ea1n ch\u1ebf</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color={COLORS.cyan} />
        <Text style={styles.infoBannerText}>
          Ng\u01b0\u1eddi b\u1ecb h\u1ea1n ch\u1ebf s\u1ebd kh\u00f4ng bi\u1ebft h\u1ecd b\u1ecb h\u1ea1n ch\u1ebf. Tin nh\u1eafn c\u1ee7a h\u1ecd v\u1eabn \u0111\u1ebfn nh\u01b0ng s\u1ebd \u0111\u01b0\u1ee3c l\u1ecdc ri\u00eang.
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={restrictedUsers}
        renderItem={renderRestrictedUser}
        keyExtractor={(item) => item.restricted_user_id}
        contentContainerStyle={[
          styles.listContent,
          restrictedUsers.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.gold}
            colors={[COLORS.gold]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

// =====================================================
// RESTRICTED USER ITEM
// =====================================================

function RestrictedUserItem({
  item,
  index,
  onUnrestrict,
  onViewMessages,
  onViewProfile,
  isProcessing,
}) {
  const { restricted_user, restricted_at, unread_count } = item;

  // Animation
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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

  return (
    <Animated.View
      style={[
        styles.itemContainer,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.itemContent}>
        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={onViewProfile}
          activeOpacity={0.8}
        >
          {restricted_user?.avatar_url ? (
            <Image
              source={{ uri: restricted_user.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <LinearGradient
              colors={GRADIENTS.avatar || [COLORS.purple, COLORS.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarFallback}
            >
              <Text style={styles.avatarInitials}>
                {getInitials(restricted_user?.display_name)}
              </Text>
            </LinearGradient>
          )}
          {/* Restricted indicator */}
          <View style={styles.restrictedIndicator}>
            <Ionicons name="eye-off" size={10} color={COLORS.textPrimary} />
          </View>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {restricted_user?.display_name || 'Ng\u01b0\u1eddi d\u00f9ng'}
          </Text>
          <Text style={styles.restrictedDate}>
            H\u1ea1n ch\u1ebf t\u1eeb: {formatDate(restricted_at)}
          </Text>
          {unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unread_count} tin nh\u1eafn ch\u01b0a \u0111\u1ecdc
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {isProcessing ? (
            <ActivityIndicator size="small" color={COLORS.gold} />
          ) : (
            <>
              {/* View Messages */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onViewMessages}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>

              {/* Unrestrict */}
              <TouchableOpacity
                style={styles.unrestrictButton}
                onPress={onUnrestrict}
                activeOpacity={0.7}
              >
                <Ionicons name="eye-outline" size={20} color={COLORS.success} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Animated.View>
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: 'rgba(5, 4, 11, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerPlaceholder: {
    width: 40,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.2)',
    gap: SPACING.sm,
  },
  infoBannerText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // List
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.huge,
  },
  listContentEmpty: {
    flex: 1,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyIconContainer: {
    marginBottom: SPACING.xl,
  },
  emptyIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Item
  itemContainer: {
    marginBottom: SPACING.md,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },

  // Avatar
  avatarContainer: {
    marginRight: SPACING.md,
    position: 'relative',
  },
  avatar: {
    width: TOUCH.avatarMd,
    height: TOUCH.avatarMd,
    borderRadius: TOUCH.avatarMd / 2,
    backgroundColor: COLORS.glassBg,
  },
  avatarFallback: {
    width: TOUCH.avatarMd,
    height: TOUCH.avatarMd,
    borderRadius: TOUCH.avatarMd / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  restrictedIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.warning,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(15, 16, 48, 0.9)',
  },

  // Info
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  restrictedDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  unreadBadge: {
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderRadius: 10,
  },
  unreadBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.purple,
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unrestrictButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
