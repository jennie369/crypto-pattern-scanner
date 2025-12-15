/**
 * Gemral - Close Friends Screen
 * Manage your close friends list
 * Dark glass theme
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, UserCheck, Search, Plus, X, Star } from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';

export default function CloseFriendsScreen({ navigation }) {
  const { user } = useAuth();
  const [closeFriends, setCloseFriends] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadCloseFriends = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const result = await closeFriendsService.getCloseFriends(user.id);
      // setCloseFriends(result.data || []);

      // Mock data for now
      setCloseFriends([
        { id: '1', full_name: 'Nguyen Van A', avatar_url: null },
        { id: '2', full_name: 'Tran Thi B', avatar_url: null },
      ]);
    } catch (error) {
      console.error('[CloseFriends] Load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCloseFriends();
  }, [loadCloseFriends]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCloseFriends();
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      // TODO: Replace with actual API call
      // await closeFriendsService.removeCloseFriend(friendId);
      setCloseFriends(prev => prev.filter(f => f.id !== friendId));
    } catch (error) {
      console.error('[CloseFriends] Remove error:', error);
    }
  };

  const handleAddFriend = async (friend) => {
    try {
      // TODO: Replace with actual API call
      // await closeFriendsService.addCloseFriend(friend.id);
      setCloseFriends(prev => [...prev, friend]);
    } catch (error) {
      console.error('[CloseFriends] Add error:', error);
    }
  };

  const filteredFriends = closeFriends.filter(f =>
    f.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFriendItem = ({ item }) => (
    <View style={styles.friendItem}>
      <Image
        source={{
          uri: item.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.full_name || 'U')}&background=6A5BFF&color=fff`,
        }}
        style={styles.friendAvatar}
      />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.full_name || 'User'}</Text>
        <View style={styles.closeFriendBadge}>
          <Star size={12} color={COLORS.gold} fill={COLORS.gold} />
          <Text style={styles.closeFriendText}>Bạn thân</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => handleRemoveFriend(item.id)}
      >
        <X size={18} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <UserCheck size={64} color={COLORS.textMuted} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>Chưa có bạn thân</Text>
      <Text style={styles.emptySubtitle}>
        Thêm bạn bè vào danh sách để chia sẻ nội dung riêng tư
      </Text>
      <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
        <Plus size={18} color="#112250" />
        <Text style={styles.addBtnText}>Thêm bạn thân</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bạn Thân</Text>
          <TouchableOpacity style={styles.addHeaderBtn} onPress={() => setShowAddModal(true)}>
            <Plus size={24} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bạn thân..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Star size={20} color={COLORS.gold} fill={COLORS.gold} />
          <Text style={styles.infoText}>
            Bạn thân có thể xem các bài viết riêng tư của bạn
          </Text>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
          </View>
        ) : (
          <FlatList
            data={filteredFriends}
            keyExtractor={(item) => item.id}
            renderItem={renderFriendItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.gold}
              />
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  addHeaderBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SPACING.md,
    backgroundColor: COLORS.glassBg,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  closeFriendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  closeFriendText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.huge,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 20,
  },
  addBtnText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#112250',
  },
});
