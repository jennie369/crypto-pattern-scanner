/**
 * ReadingHistoryScreen
 * View past tarot and I-Ching readings
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Search,
  Layers,
  BookOpen,
  Star,
  Filter,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import readingHistoryService from '../../services/readingHistoryService';
import ReadingHistoryItem from '../../components/GemMaster/ReadingHistoryItem';

const FILTER_TABS = [
  { id: 'all', label: 'Tất cả', icon: null },
  { id: 'tarot', label: 'Tarot', icon: Layers },
  { id: 'iching', label: 'Kinh Dịch', icon: BookOpen },
  { id: 'starred', label: 'Đã lưu', icon: Star },
];

const ReadingHistoryScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // State
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 20;

  // ========== DATA FETCHING ==========
  const fetchReadings = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      if (pageNum === 1) {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
      } else {
        setLoadingMore(true);
      }

      // Map filter options to service parameters
      const options = {
        page: pageNum - 1, // Service uses 0-based page index
        limit: PAGE_SIZE,
        type: activeFilter === 'starred' ? 'all' : activeFilter, // 'all', 'tarot', 'iching'
        starredOnly: activeFilter === 'starred', // Boolean for starred filter
        lifeArea: null, // Can be extended later
      };

      const { data, hasMore: moreData, error } = await readingHistoryService.getReadings(user.id, options);

      if (error) {
        console.error('[ReadingHistoryScreen] Error:', error);
        if (pageNum === 1) {
          setReadings([]);
        }
        setHasMore(false);
      } else {
        if (pageNum === 1) {
          setReadings(data || []);
        } else {
          setReadings((prev) => [...prev, ...(data || [])]);
        }
        // Use hasMore from service response
        setHasMore(moreData);
      }

      setPage(pageNum);
    } catch (err) {
      console.error('[ReadingHistoryScreen] Exception:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [user?.id, activeFilter, searchQuery]);

  useEffect(() => {
    fetchReadings(1);
  }, [fetchReadings]);

  const handleRefresh = useCallback(() => {
    fetchReadings(1, true);
  }, [fetchReadings]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchReadings(page + 1);
    }
  }, [loadingMore, hasMore, loading, page, fetchReadings]);

  // ========== HANDLERS ==========
  const handleFilterChange = (filterId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(filterId);
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
    fetchReadings(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSearch(false);
    setPage(1);
    fetchReadings(1);
  };

  const handleReadingPress = (reading) => {
    const type = reading?.spread_type ? 'tarot' : 'iching';
    navigation.navigate('ReadingDetail', { reading, type });
  };

  const handleStarToggle = async (reading) => {
    const type = reading?.spread_type ? 'tarot' : 'iching';
    const id = reading?.id;

    try {
      const { error } = await readingHistoryService.toggleStar(id, type);
      if (!error) {
        // Update local state
        setReadings((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, starred: !r.starred } : r
          )
        );
      }
    } catch (err) {
      console.error('[ReadingHistoryScreen] Star toggle error:', err);
    }
  };

  const handleDeleteReading = async (reading) => {
    const type = reading?.spread_type ? 'tarot' : 'iching';
    const id = reading?.id;

    Alert.alert(
      'Xóa bài đọc',
      'Bạn có chắc muốn xóa bài đọc này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const deleteFunc = type === 'tarot'
                ? readingHistoryService.deleteTarotReading
                : readingHistoryService.deleteIChingReading;

              const { error } = await deleteFunc(id);
              if (!error) {
                setReadings((prev) => prev.filter((r) => r.id !== id));
                Alert.alert('Đã xóa', 'Bài đọc đã được xóa.');
              }
            } catch (err) {
              console.error('[ReadingHistoryScreen] Delete error:', err);
              Alert.alert('Lỗi', 'Không thể xóa bài đọc.');
            }
          },
        },
      ]
    );
  };

  // ========== RENDER ==========
  const renderFilterTab = (tab) => {
    const isActive = activeFilter === tab.id;
    const IconComponent = tab.icon;

    return (
      <TouchableOpacity
        key={tab.id}
        style={[styles.filterTab, isActive && styles.filterTabActive]}
        onPress={() => handleFilterChange(tab.id)}
        activeOpacity={0.7}
      >
        {IconComponent && (
          <IconComponent
            size={16}
            color={isActive ? COLORS.gold : COLORS.textMuted}
          />
        )}
        <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    const type = item?.spread_type ? 'tarot' : 'iching';
    return (
      <ReadingHistoryItem
        reading={item}
        type={type}
        onPress={handleReadingPress}
        onStar={handleStarToggle}
        onDelete={handleDeleteReading}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Layers size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có bài đọc nào'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'Thử tìm kiếm với từ khóa khác'
          : 'Các bài đọc Tarot và Kinh Dịch sẽ xuất hiện ở đây'}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.purple} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.background}
        style={styles.background}
        locations={GRADIENTS.backgroundLocations}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {showSearch ? (
            <View style={styles.searchContainer}>
              <Search size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm câu hỏi..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                autoFocus
              />
              <TouchableOpacity onPress={handleClearSearch}>
                <X size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.headerTitle}>Lịch sử bài đọc</Text>
          )}

          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Search size={22} color={showSearch ? COLORS.cyan : COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {FILTER_TABS.map(renderFilterTab)}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.purple} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <FlatList
            data={readings}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.id}-${item.spread_type || 'iching'}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.purple}
                colors={[COLORS.purple]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.sm,
    height: 40,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    padding: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
  },
  filterTabActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  filterTabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  filterTabTextActive: {
    color: COLORS.gold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },
  listContent: {
    paddingVertical: SPACING.sm,
    paddingBottom: SPACING.huge,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.huge,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  footerLoader: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
});

export default ReadingHistoryScreen;
