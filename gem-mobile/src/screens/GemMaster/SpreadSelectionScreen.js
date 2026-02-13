/**
 * SpreadSelectionScreen
 * Screen for selecting tarot spread type before reading
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Grid3X3,
  Sparkles,
  Heart,
  Briefcase,
  TrendingUp,
  Crown,
  History,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import tarotSpreadService from '../../services/tarotSpreadService';
import { SPREAD_CATEGORIES } from '../../data/tarotSpreads';
import SpreadCard from '../../components/GemMaster/SpreadCard';
import SpreadInfoModal from '../../components/GemMaster/SpreadInfoModal';
import UpgradeModal from '../../components/GemMaster/UpgradeModal';

const CATEGORY_ICONS = {
  all: Grid3X3,
  general: Sparkles,
  love: Heart,
  career: Briefcase,
  trading: TrendingUp,
  advanced: Crown,
};

const SpreadSelectionScreen = () => {
  const navigation = useNavigation();
  const { user, profile } = useAuth();

  // State
  const [spreads, setSpreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [infoModalSpread, setInfoModalSpread] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Get user tier
  const userTier = profile?.chatbot_tier || profile?.scanner_tier || 'FREE';

  // ========== DATA FETCHING ==========
  const fetchSpreads = useCallback(async () => {
    try {
      const { data, error } = await tarotSpreadService.getSpreadsByCategory(
        selectedCategory,
        userTier
      );

      if (error) {
        console.error('[SpreadSelectionScreen] Error fetching spreads:', error);
      }

      setSpreads(data || []);
    } catch (err) {
      console.error('[SpreadSelectionScreen] Exception:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, userTier]);

  useEffect(() => {
    fetchSpreads();
  }, [fetchSpreads]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    tarotSpreadService.clearCache();
    fetchSpreads();
  }, [fetchSpreads]);

  // ========== HANDLERS ==========
  const handleCategorySelect = (categoryId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryId);
    setLoading(true);
  };

  const handleSpreadPress = (spread) => {
    if (spread.isLocked) {
      // Show upgrade modal
      setShowUpgradeModal(true);
    } else {
      // Navigate to reading screen
      navigation.navigate('TarotReading', { spread });
    }
  };

  const handleInfoPress = (spread) => {
    setInfoModalSpread(spread);
  };

  const handleStartReading = (spread) => {
    navigation.navigate('TarotReading', { spread });
  };

  const handleUpgrade = () => {
    setInfoModalSpread(null);
    setShowUpgradeModal(true);
  };

  const handleHistoryPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ReadingHistory');
  };

  // ========== RENDER ==========
  const renderCategoryTab = (category) => {
    const isSelected = selectedCategory === category.id;
    const IconComponent = CATEGORY_ICONS[category.id] || Sparkles;

    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryTab, isSelected && styles.categoryTabSelected]}
        onPress={() => handleCategorySelect(category.id)}
        activeOpacity={0.7}
      >
        <IconComponent
          size={16}
          color={isSelected ? COLORS.gold : COLORS.textMuted}
        />
        <Text
          style={[
            styles.categoryTabText,
            isSelected && styles.categoryTabTextSelected,
          ]}
        >
          {category.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSpreadItem = ({ item, index }) => (
    <SpreadCard
      spread={item}
      isLocked={item.isLocked}
      onPress={handleSpreadPress}
      onInfoPress={handleInfoPress}
      style={{ width: '48%' }}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Sparkles size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyText}>Không có trải bài nào</Text>
      <Text style={styles.emptySubtext}>
        Thử chọn danh mục khác hoặc kéo để làm mới
      </Text>
    </View>
  );

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

          <Text style={styles.headerTitle}>Chọn Trải Bài</Text>

          <TouchableOpacity
            style={styles.historyButton}
            onPress={handleHistoryPress}
          >
            <History size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Category Tabs */}
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {SPREAD_CATEGORIES.map(renderCategoryTab)}
          </ScrollView>
        </View>

        {/* Spreads Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.purple} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <FlatList
            data={spreads}
            renderItem={renderSpreadItem}
            keyExtractor={(item) => item.spread_id || item.id}
            numColumns={2}
            contentContainerStyle={styles.gridContent}
            columnWrapperStyle={styles.gridRow}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.purple}
                colors={[COLORS.purple]}
              />
            }
          />
        )}
      </SafeAreaView>

      {/* Info Modal */}
      <SpreadInfoModal
        visible={!!infoModalSpread}
        spread={infoModalSpread}
        isLocked={infoModalSpread?.isLocked}
        onClose={() => setInfoModalSpread(null)}
        onStartReading={handleStartReading}
        onUpgrade={handleUpgrade}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="tarot_spreads"
        currentTier={userTier}
      />
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
  },
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    paddingVertical: SPACING.sm,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  categoryTabSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  categoryTabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  categoryTabTextSelected: {
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
  gridContent: {
    padding: SPACING.md,
    paddingBottom: 120, // Extra padding for bottom tab bar
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.huge,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});

export default SpreadSelectionScreen;
