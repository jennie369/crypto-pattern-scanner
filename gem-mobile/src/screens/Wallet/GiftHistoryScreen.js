/**
 * Gemral - Gift History Screen
 * View sent and received gifts history
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Gem,
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  User,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import giftService from '../../services/giftService';
import walletService from '../../services/walletService';
import { useTabBar } from '../../contexts/TabBarContext';

const GiftHistoryScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
  const [receivedGifts, setReceivedGifts] = useState([]);
  const [sentGifts, setSentGifts] = useState([]);
  const [stats, setStats] = useState({ totalSent: 0, totalReceived: 0, gemsSent: 0, gemsReceived: 0 });
  const { hideTabBar, showTabBar } = useTabBar();

  useEffect(() => {
    hideTabBar();
    return () => showTabBar();
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [received, sent, giftStats] = await Promise.all([
      giftService.getReceivedGifts(50),
      giftService.getSentGifts(50),
      giftService.getGiftStats(),
    ]);
    setReceivedGifts(received);
    setSentGifts(sent);
    setStats(giftStats);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderGiftItem = ({ item }) => {
    const isReceived = activeTab === 'received';
    const person = isReceived ? item.sender : item.recipient;
    const personName = item.is_anonymous && isReceived ? 'Ẩn danh' : (person?.full_name || 'Người dùng');
    const giftImage = item.gift?.image_url;

    return (
      <TouchableOpacity
        style={styles.giftItem}
        onPress={() => {
          if (item.post?.id) {
            navigation.navigate('PostDetail', { postId: item.post.id });
          }
        }}
        activeOpacity={0.7}
      >
        {/* Gift Image */}
        <View style={styles.giftImageContainer}>
          {giftImage ? (
            <Image source={{ uri: giftImage }} style={styles.giftImage} />
          ) : (
            <Gift size={32} color={COLORS.gold} />
          )}
        </View>

        {/* Gift Info */}
        <View style={styles.giftInfo}>
          <View style={styles.giftHeader}>
            <Text style={styles.giftName}>{item.gift?.name || 'Quà tặng'}</Text>
            <View style={[styles.directionBadge, isReceived ? styles.receivedBadge : styles.sentBadge]}>
              {isReceived ? (
                <ArrowDownLeft size={12} color={COLORS.success} />
              ) : (
                <ArrowUpRight size={12} color={COLORS.error} />
              )}
              <Text style={[styles.directionText, isReceived ? styles.receivedText : styles.sentText]}>
                {isReceived ? 'Nhận' : 'Gửi'}
              </Text>
            </View>
          </View>

          <View style={styles.personRow}>
            {!item.is_anonymous && person?.avatar_url ? (
              <Image source={{ uri: person.avatar_url }} style={styles.personAvatar} />
            ) : (
              <View style={styles.personAvatarPlaceholder}>
                <User size={12} color={COLORS.textMuted} />
              </View>
            )}
            <Text style={styles.personName}>
              {isReceived ? 'Từ: ' : 'Đến: '}{personName}
            </Text>
          </View>

          {item.message && (
            <Text style={styles.giftMessage} numberOfLines={2}>
              "{item.message}"
            </Text>
          )}

          <View style={styles.giftFooter}>
            <View style={styles.gemAmount}>
              <Gem size={14} color={COLORS.purple} />
              <Text style={styles.gemText}>{item.gem_amount}</Text>
            </View>
            <Text style={styles.giftDate}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Gift size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyText}>
        {activeTab === 'received' ? 'Chưa nhận quà nào' : 'Chưa gửi quà nào'}
      </Text>
      <Text style={styles.emptySubtext}>
        {activeTab === 'received'
          ? 'Khi ai đó tặng quà cho bạn, quà sẽ xuất hiện ở đây'
          : 'Gửi quà cho bạn bè để thể hiện sự quan tâm'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử quà tặng</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <ArrowDownLeft size={20} color={COLORS.success} />
            <Text style={styles.statValue}>{stats.totalReceived}</Text>
            <Text style={styles.statLabel}>Đã nhận</Text>
            <View style={styles.statGems}>
              <Gem size={12} color={COLORS.purple} />
              <Text style={styles.statGemsText}>{walletService.formatGems(stats.gemsReceived)}</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <ArrowUpRight size={20} color={COLORS.gold} />
            <Text style={styles.statValue}>{stats.totalSent}</Text>
            <Text style={styles.statLabel}>Đã gửi</Text>
            <View style={styles.statGems}>
              <Gem size={12} color={COLORS.purple} />
              <Text style={styles.statGemsText}>{walletService.formatGems(stats.gemsSent)}</Text>
            </View>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'received' && styles.activeTab]}
            onPress={() => setActiveTab('received')}
          >
            <ArrowDownLeft size={16} color={activeTab === 'received' ? COLORS.success : COLORS.textMuted} />
            <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
              Đã nhận ({receivedGifts.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
            onPress={() => setActiveTab('sent')}
          >
            <ArrowUpRight size={16} color={activeTab === 'sent' ? COLORS.gold : COLORS.textMuted} />
            <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
              Đã gửi ({sentGifts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Gift List */}
        <FlatList
          data={activeTab === 'received' ? receivedGifts : sentGifts}
          renderItem={renderGiftItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: CONTENT_BOTTOM_PADDING },
          ]}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.purple}
            />
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GLASS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statGems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statGemsText: {
    fontSize: 11,
    color: COLORS.purple,
    fontWeight: '600',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    gap: SPACING.xs,
  },
  activeTab: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  activeTabText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  // List
  listContent: {
    paddingHorizontal: SPACING.md,
  },
  giftItem: {
    flexDirection: 'row',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  giftImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  giftImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  giftInfo: {
    flex: 1,
  },
  giftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  giftName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  receivedBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
  },
  sentBadge: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
  },
  directionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  receivedText: {
    color: COLORS.success,
  },
  sentText: {
    color: COLORS.gold,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  personAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: SPACING.xs,
  },
  personAvatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  personName: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  giftMessage: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: SPACING.xs,
  },
  giftFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gemAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gemText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.purple,
  },
  giftDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.huge,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.xxl,
  },
});

export default GiftHistoryScreen;
