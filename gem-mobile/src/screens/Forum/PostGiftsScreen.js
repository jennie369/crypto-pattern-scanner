/**
 * Gemral - Post Gifts Screen
 * Shows all gifts received on a specific post
 * Dark glass theme
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Gift, Gem, User } from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { giftService } from '../../services/giftService';

export default function PostGiftsScreen({ navigation, route }) {
  const { postId } = route.params;
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalGems, setTotalGems] = useState(0);

  const loadGifts = useCallback(async () => {
    try {
      const result = await giftService.getPostGifts(postId);
      if (result.success) {
        setGifts(result.data || []);
        // Calculate total gems
        const total = (result.data || []).reduce((sum, g) => sum + (g.gem_value || 0), 0);
        setTotalGems(total);
      }
    } catch (error) {
      console.error('[PostGifts] Load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [postId]);

  useEffect(() => {
    loadGifts();
  }, [loadGifts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadGifts();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderGiftItem = ({ item }) => (
    <TouchableOpacity
      style={styles.giftItem}
      onPress={() => {
        if (item.sender?.id) {
          navigation.navigate('UserProfile', { userId: item.sender.id });
        }
      }}
    >
      <View style={styles.giftIcon}>
        {item.gift?.image_url ? (
          <Image source={{ uri: item.gift.image_url }} style={styles.giftImage} />
        ) : (
          <Gift size={32} color={COLORS.gold} />
        )}
      </View>

      <View style={styles.giftInfo}>
        <Text style={styles.giftName}>{item.gift?.name || 'Gift'}</Text>
        <View style={styles.senderRow}>
          {item.is_anonymous ? (
            <Text style={styles.senderName}>Anonymous</Text>
          ) : (
            <>
              <User size={14} color={COLORS.textMuted} />
              <Text style={styles.senderName}>
                {item.sender?.full_name || item.sender?.email?.split('@')[0] || 'User'}
              </Text>
            </>
          )}
        </View>
        {item.message && (
          <Text style={styles.giftMessage} numberOfLines={2}>
            "{item.message}"
          </Text>
        )}
        <Text style={styles.giftTimestamp}>{formatTimestamp(item.created_at)}</Text>
      </View>

      <View style={styles.giftValue}>
        <Gem size={16} color={COLORS.gold} />
        <Text style={styles.gemAmount}>{item.gem_value || 0}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Gift size={64} color={COLORS.textMuted} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>Chua co qua tang</Text>
      <Text style={styles.emptySubtitle}>
        Bai viet nay chua nhan duoc qua tang nao
      </Text>
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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Qua Tang</Text>
            {totalGems > 0 && (
              <View style={styles.totalGems}>
                <Gem size={14} color={COLORS.gold} />
                <Text style={styles.totalGemsText}>{totalGems}</Text>
              </View>
            )}
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
          </View>
        ) : (
          <FlatList
            data={gifts}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={renderGiftItem}
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  totalGems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  totalGemsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
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
  giftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  giftIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  giftName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  senderName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  giftMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  giftTimestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  giftValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
  },
  gemAmount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
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
  },
});
