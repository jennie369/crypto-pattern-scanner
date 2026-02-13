/**
 * Gemral - Close Friends Manager Component
 * Feature #13: Privacy & Audience Settings
 * Manage close friends list
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  X,
  Search,
  Star,
  UserPlus,
  UserMinus,
  Check,
  Users,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../utils/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import privacyService from '../services/privacyService';
import CustomAlert, { useCustomAlert } from './CustomAlert';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CloseFriendsManager = ({
  visible,
  onClose,
}) => {
  const [closeFriends, setCloseFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'add'
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const { alert, AlertComponent } = useCustomAlert();

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
      loadCloseFriends();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (activeTab === 'add') {
      searchFollowers();
    }
  }, [activeTab, searchQuery]);

  const loadCloseFriends = async () => {
    setLoading(true);
    const friends = await privacyService.getCloseFriends();
    setCloseFriends(friends);
    setLoading(false);
  };

  const searchFollowers = async () => {
    setSearching(true);
    const results = await privacyService.searchFollowersForCloseFriends(searchQuery);
    setSearchResults(results);
    setSearching(false);
  };

  const handleAddFriend = async (userId) => {
    const result = await privacyService.addCloseFriend(userId);
    if (result.success) {
      // Update lists
      setSearchResults(prev => prev.filter(u => u.id !== userId));
      loadCloseFriends();
    } else {
      alert({ type: 'error', title: 'Lỗi', message: result.error });
    }
  };

  const handleRemoveFriend = async (userId) => {
    alert({
      type: 'warning',
      title: 'Xác nhận',
      message: 'Bỏ người này khỏi danh sách bạn thân?',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Bỏ',
          style: 'destructive',
          onPress: async () => {
            const result = await privacyService.removeCloseFriend(userId);
            if (result.success) {
              setCloseFriends(prev => prev.filter(f => f.id !== userId));
            } else {
              alert({ type: 'error', title: 'Lỗi', message: result.error });
            }
          },
        },
      ],
    });
  };

  const renderCloseFriend = ({ item }) => (
    <View style={styles.friendRow}>
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>
            {item.full_name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
      )}
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.full_name}</Text>
        <View style={styles.closeFriendBadge}>
          <Star size={10} color={COLORS.gold} />
          <Text style={styles.closeFriendText}>Bạn thân</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFriend(item.id)}
      >
        <UserMinus size={18} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  const renderSearchResult = ({ item }) => (
    <View style={styles.friendRow}>
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>
            {item.full_name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
      )}
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.full_name}</Text>
        <Text style={styles.friendSubtext}>Người theo dõi</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddFriend(item.id)}
      >
        <UserPlus size={18} color={COLORS.success} />
      </TouchableOpacity>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <Animated.View
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Bạn thân</Text>
              <Text style={styles.headerSubtitle}>
                {closeFriends.length} người trong danh sách
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'list' && styles.tabActive]}
              onPress={() => setActiveTab('list')}
            >
              <Star size={16} color={activeTab === 'list' ? COLORS.textPrimary : COLORS.textMuted} />
              <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>
                Danh sách
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'add' && styles.tabActive]}
              onPress={() => setActiveTab('add')}
            >
              <UserPlus size={16} color={activeTab === 'add' ? COLORS.textPrimary : COLORS.textMuted} />
              <Text style={[styles.tabText, activeTab === 'add' && styles.tabTextActive]}>
                Thêm mới
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search (only in add tab) */}
          {activeTab === 'add' && (
            <View style={styles.searchContainer}>
              <View style={styles.searchInputWrapper}>
                <Search size={18} color={COLORS.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm người theo dõi..."
                  placeholderTextColor={COLORS.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>
          )}

          {/* List */}
          {activeTab === 'list' ? (
            <FlatList
              data={closeFriends}
              keyExtractor={(item) => item.id}
              renderItem={renderCloseFriend}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Star size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>Chưa có bạn thân nào</Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => setActiveTab('add')}
                  >
                    <UserPlus size={16} color={COLORS.textPrimary} />
                    <Text style={styles.emptyButtonText}>Thêm bạn thân</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderSearchResult}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Users size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>
                    {searching ? 'Đang tìm kiếm...' :
                     searchQuery ? 'Không tìm thấy người theo dõi' :
                     'Tìm người theo dõi để thêm vào bạn thân'}
                  </Text>
                </View>
              }
            />
          )}

          {/* Info */}
          <View style={styles.infoBox}>
            <Star size={16} color={COLORS.gold} />
            <Text style={styles.infoText}>
              Chỉ bạn thân mới xem được bài viết có quyền riêng tư "Bạn thân"
            </Text>
          </View>
        </Animated.View>
        {AlertComponent}
      </View>
    </Modal>
  );
};

/**
 * Close Friends Toggle Button (for profile/settings)
 */
export const CloseFriendToggle = ({ userId, initialState = false, onChange }) => {
  const [isCloseFriend, setIsCloseFriend] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialState) {
      checkStatus();
    }
  }, [userId]);

  const checkStatus = async () => {
    const status = await privacyService.isCloseFriend(userId);
    setIsCloseFriend(status);
  };

  const handleToggle = async () => {
    setLoading(true);
    if (isCloseFriend) {
      const result = await privacyService.removeCloseFriend(userId);
      if (result.success) {
        setIsCloseFriend(false);
        onChange?.(false);
      }
    } else {
      const result = await privacyService.addCloseFriend(userId);
      if (result.success) {
        setIsCloseFriend(true);
        onChange?.(true);
      }
    }
    setLoading(false);
  };

  return (
    <TouchableOpacity
      style={[styles.toggleButton, isCloseFriend && styles.toggleButtonActive]}
      onPress={handleToggle}
      disabled={loading}
    >
      <Star
        size={16}
        color={isCloseFriend ? COLORS.gold : COLORS.textMuted}
        fill={isCloseFriend ? COLORS.gold : 'none'}
      />
      <Text style={[styles.toggleText, isCloseFriend && styles.toggleTextActive]}>
        {isCloseFriend ? 'Bạn thân' : 'Thêm bạn thân'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: GLASS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.8,
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    gap: SPACING.xs,
  },
  tabActive: {
    backgroundColor: COLORS.purple,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  tabTextActive: {
    color: COLORS.textPrimary,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
    marginLeft: SPACING.sm,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SPACING.md,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  friendSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeFriendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  closeFriendText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
  },
  removeButton: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderRadius: 8,
  },
  addButton: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  emptyButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xxl,
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    lineHeight: 18,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderColor: COLORS.gold,
  },
  toggleText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  toggleTextActive: {
    color: COLORS.gold,
  },
});

export default CloseFriendsManager;
