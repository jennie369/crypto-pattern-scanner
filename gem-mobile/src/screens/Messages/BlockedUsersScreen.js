/**
 * Gemral - Blocked Users Screen
 * Quản lý danh sách người dùng bị chặn
 *
 * Tính năng:
 * - Xem người dùng bị chặn
 * - Bỏ chặn người dùng
 * - Trạng thái trống
 * - Giao diện Glass-morphism
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';

// Services
import messagingService from '../../services/messagingService';

// Auth
import { useAuth } from '../../contexts/AuthContext';

// Alert
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
  TOUCH,
} from '../../utils/tokens';

export default function BlockedUsersScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  // State
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState(null);

  // Fetch blocked users
  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const data = await messagingService.getBlockedUsers();
        setBlockedUsers(data);
      } catch (error) {
        console.error('Lỗi khi tải danh sách người bị chặn:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedUsers();
  }, []);

  // Unblock user
  const handleUnblock = useCallback((blockedUser) => {
    alert({
      type: 'warning',
      title: 'Bỏ chặn người dùng',
      message: `Bạn có chắc muốn bỏ chặn ${blockedUser.display_name || 'người dùng này'}?`,
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Bỏ chặn',
          onPress: async () => {
            try {
              setUnblocking(blockedUser.id);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

              await messagingService.unblockUser(blockedUser.id);

              // Remove from list
              setBlockedUsers(prev => prev.filter(u => u.id !== blockedUser.id));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Lỗi khi bỏ chặn:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              alert({ type: 'error', title: 'Lỗi', message: 'Không thể bỏ chặn người dùng' });
            } finally {
              setUnblocking(null);
            }
          },
        },
      ]
    });
  }, [alert]);

  // Get initials
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Format blocked date
  const formatBlockedDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Render blocked user item
  const renderBlockedUser = ({ item }) => {
    const isUnblocking = unblocking === item.id;

    return (
      <View style={styles.userItem}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={GRADIENTS.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarFallback}
            >
              <Text style={styles.avatarInitials}>{getInitials(item.display_name)}</Text>
            </LinearGradient>
          )}
        </View>

        {/* Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.display_name || 'Người dùng ẩn danh'}</Text>
          <Text style={styles.blockedDate}>
            Đã chặn {formatBlockedDate(item.blocked_at)}
          </Text>
        </View>

        {/* Unblock Button */}
        <TouchableOpacity
          style={styles.unblockButton}
          onPress={() => handleUnblock(item)}
          disabled={isUnblocking}
          activeOpacity={0.7}
        >
          {isUnblocking ? (
            <ActivityIndicator size="small" color={COLORS.gold} />
          ) : (
            <Text style={styles.unblockText}>Bỏ chặn</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="shield-checkmark-outline" size={64} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>Không có người bị chặn</Text>
      <Text style={styles.emptySubtitle}>
        Những người bạn chặn sẽ không thể nhắn tin cho bạn hoặc xem trạng thái trực tuyến của bạn
      </Text>
    </View>
  );

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

        <Text style={styles.title}>Người dùng bị chặn</Text>

        <View style={styles.placeholder} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color={COLORS.purple} />
        <Text style={styles.infoText}>
          Người bị chặn không thể gửi tin nhắn cho bạn hoặc xem khi bạn đang trực tuyến.
        </Text>
      </View>

      {/* Blocked Users List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          renderItem={renderBlockedUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            blockedUsers.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
      {AlertComponent}
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
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 12,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // List
  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.huge,
  },
  listContentEmpty: {
    flex: 1,
  },

  // User Item
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  avatarContainer: {
    marginRight: SPACING.md,
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  blockedDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  unblockButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  unblockText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.purple,
  },

  // Loading & Empty
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
});
