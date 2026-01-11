/**
 * LivestreamViewerScreen
 * Main screen for watching AI Livestream
 *
 * Phase 1: Basic viewer functionality
 * Phase 3: Multi-platform integration
 *   - ProductOverlay for e-commerce
 *   - QuickPurchaseSheet for buy/add to cart
 *   - Multi-platform viewer counts
 *   - Platform badges in comments
 *   - Gift panel
 *
 * Layout:
 * ┌─────────────────────────┐
 * │ Header (Back, Title)    │
 * ├─────────────────────────┤
 * │                         │
 * │     Video Player        │
 * │     (Avatar stream)     │
 * │   [ProductOverlay]      │
 * ├─────────────────────────┤
 * │   Comments Feed         │
 * │   (Real-time scroll)    │
 * ├─────────────────────────┤
 * │ [Input] [Send] [❤️] [🎁] │
 * └─────────────────────────┘
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Components
import {
  LivestreamPlayer,
  CommentFeed,
  ChatInput,
  LiveBadge,
  ViewerCount,
  QuickActions,
  ProductOverlay,
  QuickPurchaseSheet,
} from '../../components/Livestream';

// Context & Services
import { useLivestream } from '../../contexts/LivestreamContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import tokens, { COLORS } from '../../utils/tokens';

// Phase 3 Services
import { commentAggregatorService, AGGREGATOR_EVENTS } from '../../services/commentAggregatorService';
import { livestreamGiftService, GEMRAL_GIFTS, GIFT_CATEGORIES } from '../../services/livestreamGiftService';

const LivestreamViewerScreen = ({ navigation, route }) => {
  const { sessionId } = route.params || {};
  const { user } = useAuth();
  const { addToCart } = useCart() || {};
  const {
    currentSession,
    isConnected,
    isLoading,
    error,
    comments,
    isLoadingComments,
    viewerCount,
    heartCount,
    joinSession,
    leaveSession,
    sendComment,
    sendHeart,
    loadMoreComments,
  } = useLivestream();

  const [isSending, setIsSending] = useState(false);

  // Phase 3: Multi-platform state
  const [platformViewers, setPlatformViewers] = useState({
    gemral: 0,
    tiktok: 0,
    facebook: 0,
    total: 0,
  });
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);

  // Phase 3: Product overlay state
  const [showcaseProduct, setShowcaseProduct] = useState(null);
  const [isProductVisible, setIsProductVisible] = useState(false);

  // Phase 3: Quick purchase sheet
  const [purchaseProduct, setPurchaseProduct] = useState(null);
  const [isPurchaseSheetVisible, setIsPurchaseSheetVisible] = useState(false);

  // Phase 3: Gift panel state
  const [isGiftPanelVisible, setIsGiftPanelVisible] = useState(false);
  const [isSendingGift, setIsSendingGift] = useState(false);
  const [giftLeaderboard, setGiftLeaderboard] = useState([]);

  // Join session on mount
  useEffect(() => {
    if (sessionId) {
      joinSession(sessionId);

      // Phase 3: Initialize comment aggregator
      commentAggregatorService.initialize(sessionId);
      commentAggregatorService.connectGemral().catch(console.error);
    }

    return () => {
      leaveSession();
      commentAggregatorService.disconnectAll();
    };
  }, [sessionId]);

  // Phase 3: Subscribe to aggregator events
  useEffect(() => {
    const unsubViewers = commentAggregatorService.on(
      AGGREGATOR_EVENTS.VIEWER_COUNT,
      (data) => {
        setPlatformViewers({
          gemral: data.breakdown?.gemral || 0,
          tiktok: data.breakdown?.tiktok || 0,
          facebook: data.breakdown?.facebook || 0,
          total: data.total || 0,
        });
      }
    );

    const unsubPlatformConnected = commentAggregatorService.on(
      AGGREGATOR_EVENTS.PLATFORM_CONNECTED,
      (data) => {
        setConnectedPlatforms((prev) => [...new Set([...prev, data.platform])]);
      }
    );

    const unsubPlatformDisconnected = commentAggregatorService.on(
      AGGREGATOR_EVENTS.PLATFORM_DISCONNECTED,
      (data) => {
        setConnectedPlatforms((prev) => prev.filter((p) => p !== data.platform));
      }
    );

    return () => {
      unsubViewers();
      unsubPlatformConnected();
      unsubPlatformDisconnected();
    };
  }, []);

  // Phase 3: Check for product showcase from session
  useEffect(() => {
    if (currentSession?.product_showcase?.current_product_id) {
      // In production, fetch product from shop service
      // For now, just set visibility
      setIsProductVisible(true);
    }
  }, [currentSession?.product_showcase?.current_product_id]);

  // Phase 3: Load gift leaderboard
  useEffect(() => {
    if (sessionId) {
      livestreamGiftService.getLeaderboard(sessionId, 5).then(setGiftLeaderboard);
    }
  }, [sessionId]);

  // Handle back press
  const handleBack = useCallback(() => {
    Alert.alert(
      'Rời khỏi livestream?',
      'Bạn có chắc muốn rời khỏi livestream này?',
      [
        { text: 'Ở lại', style: 'cancel' },
        {
          text: 'Rời đi',
          style: 'destructive',
          onPress: () => {
            leaveSession();
            navigation.goBack();
          },
        },
      ]
    );
  }, [leaveSession, navigation]);

  // Handle send comment
  const handleSendComment = useCallback(async (text) => {
    if (!user) {
      Alert.alert('Đăng nhập', 'Vui lòng đăng nhập để bình luận');
      return;
    }

    setIsSending(true);
    try {
      const result = await sendComment(text);
      if (!result.success) {
        Alert.alert('Lỗi', result.error || 'Không thể gửi bình luận');
      }
    } finally {
      setIsSending(false);
    }
  }, [user, sendComment]);

  // Handle share
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Đang xem livestream "${currentSession?.title || 'AI Livestream'}" trên Gemral! 🎥✨`,
        url: `gemral://livestream/${sessionId}`,
      });
    } catch (err) {
      console.error('[LivestreamViewer] Share error:', err);
    }
  }, [currentSession, sessionId]);

  // Phase 3: Handle gift panel
  const handleGift = useCallback(() => {
    if (!user) {
      Alert.alert('Đăng nhập', 'Vui lòng đăng nhập để gửi quà tặng');
      return;
    }
    setIsGiftPanelVisible(true);
  }, [user]);

  // Phase 3: Send gift
  const handleSendGift = useCallback(async (giftId, count = 1) => {
    if (!user || !sessionId) return;

    setIsSendingGift(true);
    try {
      const result = await livestreamGiftService.sendGift(sessionId, giftId, count);
      if (result.success) {
        // Refresh leaderboard
        const newLeaderboard = await livestreamGiftService.getLeaderboard(sessionId, 5);
        setGiftLeaderboard(newLeaderboard);
        setIsGiftPanelVisible(false);
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi quà tặng');
    } finally {
      setIsSendingGift(false);
    }
  }, [user, sessionId]);

  // Phase 3: Handle product press (show quick purchase)
  const handleProductPress = useCallback((product) => {
    setPurchaseProduct(product);
    setIsPurchaseSheetVisible(true);
  }, []);

  // Phase 3: Handle add to cart from overlay
  const handleAddToCart = useCallback(async (product) => {
    if (!user) {
      Alert.alert('Đăng nhập', 'Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    try {
      if (addToCart) {
        await addToCart({ product, quantity: 1 });
        Alert.alert('Thành công', 'Đã thêm vào giỏ hàng!');
      }
    } catch (error) {
      console.error('[LivestreamViewer] Add to cart error:', error);
    }
  }, [user, addToCart]);

  // Phase 3: Handle buy now
  const handleBuyNow = useCallback((orderItem) => {
    setIsPurchaseSheetVisible(false);
    // Navigate to checkout with this item
    navigation.navigate('Checkout', {
      items: [orderItem],
      source: 'livestream',
      sessionId,
    });
  }, [navigation, sessionId]);

  // Phase 3: Handle view product details
  const handleViewProductDetails = useCallback((product) => {
    setIsPurchaseSheetVisible(false);
    setIsProductVisible(false);
    navigation.navigate('ProductDetail', { productId: product.id });
  }, [navigation]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={tokens.colors.primary} />
        <Text style={styles.loadingText}>Đang kết nối livestream...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" />
        <Ionicons name="alert-circle" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => joinSession(sessionId)}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Session ended state
  if (currentSession?.status === 'ended') {
    return (
      <View style={styles.endedContainer}>
        <StatusBar barStyle="light-content" />
        <Ionicons name="videocam-off" size={64} color={tokens.colors.textSecondary} />
        <Text style={styles.endedTitle}>Livestream đã kết thúc</Text>
        <Text style={styles.endedSubtitle}>
          Cảm ơn bạn đã theo dõi!
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Video Section */}
        <View style={styles.videoSection}>
          <LivestreamPlayer
            videoUrl={currentSession?.current_video_url}
            audioUrl={currentSession?.current_audio_url}
            avatarId={currentSession?.persona?.toLowerCase() || 'sufu'}
            isLive={currentSession?.status === 'live'}
            style={styles.player}
          />

          {/* Header Overlay */}
          <SafeAreaView style={styles.headerOverlay}>
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'transparent']}
              style={styles.headerGradient}
            >
              <View style={styles.header}>
                {/* Back button */}
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleBack}
                >
                  <Ionicons name="arrow-back" size={24} color={tokens.colors.white} />
                </TouchableOpacity>

                {/* Title & Live badge */}
                <View style={styles.headerCenter}>
                  <LiveBadge
                    status={currentSession?.status || 'live'}
                    variant="compact"
                  />
                  <Text style={styles.headerTitle} numberOfLines={1}>
                    {currentSession?.title || 'AI Livestream'}
                  </Text>
                </View>

                {/* Viewer count */}
                <ViewerCount count={viewerCount} variant="compact" />
              </View>
            </LinearGradient>
          </SafeAreaView>

          {/* Quick Actions (right side) */}
          <View style={styles.quickActionsOverlay}>
            <QuickActions
              onHeartPress={sendHeart}
              onGiftPress={handleGift}
              onSharePress={handleShare}
              heartCount={heartCount}
              disabled={!isConnected}
            />
          </View>

          {/* Phase 3: Product Overlay */}
          {showcaseProduct && (
            <ProductOverlay
              product={showcaseProduct}
              isVisible={isProductVisible}
              position="bottom-right"
              size="medium"
              onPress={handleProductPress}
              onAddToCart={handleAddToCart}
              onDismiss={() => setIsProductVisible(false)}
              showLiveLabel={true}
            />
          )}

          {/* Phase 3: Platform indicators */}
          {connectedPlatforms.length > 1 && (
            <View style={styles.platformIndicators}>
              {connectedPlatforms.map((platform) => (
                <View key={platform} style={styles.platformBadge}>
                  <Ionicons
                    name={
                      platform === 'tiktok' ? 'musical-notes' :
                      platform === 'facebook' ? 'logo-facebook' :
                      'radio'
                    }
                    size={12}
                    color={tokens.colors.textLight}
                  />
                  <Text style={styles.platformViewerText}>
                    {platformViewers[platform] || 0}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <CommentFeed
            comments={comments}
            onLoadMore={loadMoreComments}
            isLoading={isLoadingComments}
          />
        </View>

        {/* Input Section */}
        <ChatInput
          onSend={handleSendComment}
          placeholder={user ? 'Nhập bình luận...' : 'Đăng nhập để bình luận'}
          disabled={!user || !isConnected}
          isLoading={isSending}
        />
      </KeyboardAvoidingView>

      {/* Phase 3: Quick Purchase Sheet */}
      <QuickPurchaseSheet
        product={purchaseProduct}
        isVisible={isPurchaseSheetVisible}
        onClose={() => setIsPurchaseSheetVisible(false)}
        onAddToCart={(item) => {
          handleAddToCart(item.product);
          setIsPurchaseSheetVisible(false);
        }}
        onBuyNow={handleBuyNow}
        onViewDetails={handleViewProductDetails}
      />

      {/* Phase 3: Gift Panel Modal */}
      <Modal
        visible={isGiftPanelVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsGiftPanelVisible(false)}
      >
        <View style={styles.giftModalOverlay}>
          <TouchableOpacity
            style={styles.giftModalBackdrop}
            onPress={() => setIsGiftPanelVisible(false)}
            activeOpacity={1}
          />
          <LinearGradient
            colors={['rgba(30, 30, 40, 0.98)', 'rgba(20, 20, 30, 1)']}
            style={styles.giftPanel}
          >
            {/* Header */}
            <View style={styles.giftPanelHeader}>
              <Text style={styles.giftPanelTitle}>Gửi quà tặng</Text>
              <TouchableOpacity
                onPress={() => setIsGiftPanelVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={tokens.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Gift Grid */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.giftGrid}
              contentContainerStyle={styles.giftGridContent}
            >
              {GEMRAL_GIFTS.map((gift) => (
                <TouchableOpacity
                  key={gift.id}
                  style={styles.giftItem}
                  onPress={() => handleSendGift(gift.id, 1)}
                  disabled={isSendingGift}
                >
                  <View style={[
                    styles.giftIconContainer,
                    gift.category === 'legendary' && styles.giftIconLegendary,
                    gift.category === 'luxury' && styles.giftIconLuxury,
                  ]}>
                    <Text style={styles.giftIcon}>{gift.icon}</Text>
                  </View>
                  <Text style={styles.giftName}>{gift.name}</Text>
                  <View style={styles.giftCostContainer}>
                    <Text style={styles.giftCost}>{gift.gemCost}</Text>
                    <Text style={styles.giftCurrency}>GEM</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Top Gifters Leaderboard */}
            {giftLeaderboard.length > 0 && (
              <View style={styles.leaderboardSection}>
                <Text style={styles.leaderboardTitle}>Top người tặng quà</Text>
                <View style={styles.leaderboardList}>
                  {giftLeaderboard.slice(0, 3).map((entry, index) => (
                    <View key={entry.userId} style={styles.leaderboardItem}>
                      <Text style={styles.leaderboardRank}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </Text>
                      <Text style={styles.leaderboardName} numberOfLines={1}>
                        {entry.username}
                      </Text>
                      <Text style={styles.leaderboardValue}>
                        {entry.totalGem} GEM
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Loading overlay */}
            {isSendingGift && (
              <View style={styles.giftLoadingOverlay}>
                <ActivityIndicator size="large" color={tokens.colors.gold} />
              </View>
            )}
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.background,
  },
  loadingText: {
    marginTop: tokens.spacing.md,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.background,
    padding: tokens.spacing.xl,
  },
  errorText: {
    marginTop: tokens.spacing.md,
    fontSize: tokens.fontSize.md,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.xl,
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radius.md,
  },
  retryButtonText: {
    fontSize: tokens.fontSize.md,
    color: tokens.colors.white,
    fontWeight: '600',
  },
  backButton: {
    marginTop: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.xl,
  },
  backButtonText: {
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textSecondary,
  },
  endedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.background,
    padding: tokens.spacing.xl,
  },
  endedTitle: {
    marginTop: tokens.spacing.md,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.textPrimary,
    fontWeight: '600',
  },
  endedSubtitle: {
    marginTop: tokens.spacing.sm,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textSecondary,
  },
  videoSection: {
    width: '100%',
    aspectRatio: 9 / 12, // Taller for livestream
    backgroundColor: tokens.colors.surfaceDark,
  },
  player: {
    flex: 1,
    borderRadius: 0,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  headerTitle: {
    fontSize: tokens.fontSize.md,
    color: tokens.colors.white,
    fontWeight: '600',
  },
  quickActionsOverlay: {
    position: 'absolute',
    right: tokens.spacing.md,
    bottom: tokens.spacing.xl,
    zIndex: 10,
  },
  commentsSection: {
    flex: 1,
    backgroundColor: tokens.colors.surface,
  },

  // Phase 3: Platform indicators
  platformIndicators: {
    position: 'absolute',
    left: tokens.spacing.md,
    bottom: tokens.spacing.xl,
    flexDirection: 'column',
    gap: 6,
    zIndex: 10,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  platformViewerText: {
    color: tokens.colors.textLight,
    fontSize: 11,
    fontWeight: '600',
  },

  // Phase 3: Gift Modal
  giftModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  giftModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  giftPanel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  giftPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  giftPanelTitle: {
    color: tokens.colors.textLight,
    fontSize: 18,
    fontWeight: '600',
  },
  giftGrid: {
    marginBottom: 16,
  },
  giftGridContent: {
    paddingRight: 16,
    gap: 12,
  },
  giftItem: {
    alignItems: 'center',
    width: 80,
  },
  giftIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  giftIconLegendary: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 1,
    borderColor: tokens.colors.gold,
  },
  giftIconLuxury: {
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
    borderWidth: 1,
    borderColor: '#8A2BE2',
  },
  giftIcon: {
    fontSize: 28,
  },
  giftName: {
    color: tokens.colors.textLight,
    fontSize: 12,
    marginBottom: 2,
  },
  giftCostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  giftCost: {
    color: tokens.colors.gold,
    fontSize: 12,
    fontWeight: '600',
  },
  giftCurrency: {
    color: tokens.colors.textMuted,
    fontSize: 10,
  },
  leaderboardSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  leaderboardTitle: {
    color: tokens.colors.textMuted,
    fontSize: 13,
    marginBottom: 12,
  },
  leaderboardList: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leaderboardRank: {
    fontSize: 16,
    width: 24,
  },
  leaderboardName: {
    flex: 1,
    color: tokens.colors.textLight,
    fontSize: 14,
  },
  leaderboardValue: {
    color: tokens.colors.gold,
    fontSize: 13,
    fontWeight: '600',
  },
  giftLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
});

export default LivestreamViewerScreen;
