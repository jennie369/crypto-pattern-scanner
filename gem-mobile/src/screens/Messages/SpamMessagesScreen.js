/**
 * Spam Messages Screen
 * View and manage spam-detected messages
 *
 * Features:
 * - List spam messages with confidence score
 * - Mark as not spam (restore)
 * - Delete spam permanently
 * - Pull-to-refresh
 * - Animated entrance
 * - Empty state
 * - Filter by spam type
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
import spamDetectionService from '../../services/spamDetectionService';

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

// Spam type labels
const SPAM_TYPE_LABELS = {
  auto_detected: 'T\u1ef1 \u0111\u1ed9ng ph\u00e1t hi\u1ec7n',
  user_reported: 'Ng\u01b0\u1eddi d\u00f9ng b\u00e1o c\u00e1o',
  pattern_match: 'Kh\u1edbp m\u1eabu',
  link_spam: 'Spam li\u00ean k\u1ebft',
  repeat_spam: 'L\u1eb7p l\u1ea1i nhi\u1ec1u l\u1ea7n',
};

export default function SpamMessagesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // State
  const [spamMessages, setSpamMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchSpamMessages = useCallback(async () => {
    try {
      const data = await spamDetectionService.getSpamMessages();
      setSpamMessages(data || []);
    } catch (error) {
      console.error('Error fetching spam messages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSpamMessages();
  }, [fetchSpamMessages]);

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSpamMessages();
  }, [fetchSpamMessages]);

  const handleMarkNotSpam = useCallback(async (spamItem) => {
    Alert.alert(
      'Kh\u00f4ng ph\u1ea3i spam',
      '\u0110\u00e1nh d\u1ea5u tin nh\u1eafn n\u00e0y kh\u00f4ng ph\u1ea3i spam? Tin nh\u1eafn s\u1ebd \u0111\u01b0\u1ee3c kh\u00f4i ph\u1ee5c v\u00e0o h\u1ed9p th\u01b0 ch\u00ednh.',
      [
        { text: 'H\u1ee7y', style: 'cancel' },
        {
          text: 'Kh\u00f4i ph\u1ee5c',
          onPress: async () => {
            setProcessingId(spamItem.id);
            try {
              await spamDetectionService.markNotSpam(spamItem.id);
              // Remove from local state
              setSpamMessages(prev => prev.filter(m => m.id !== spamItem.id));
            } catch (error) {
              console.error('Error marking as not spam:', error);
              Alert.alert('L\u1ed7i', 'Kh\u00f4ng th\u1ec3 kh\u00f4i ph\u1ee5c tin nh\u1eafn. Vui l\u00f2ng th\u1eed l\u1ea1i.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  }, []);

  const handleDelete = useCallback(async (spamItem) => {
    Alert.alert(
      'X\u00f3a v\u0129nh vi\u1ec5n',
      'B\u1ea1n c\u00f3 ch\u1eafc ch\u1eafn mu\u1ed1n x\u00f3a tin nh\u1eafn spam n\u00e0y? H\u00e0nh \u0111\u1ed9ng n\u00e0y kh\u00f4ng th\u1ec3 ho\u00e0n t\u00e1c.',
      [
        { text: 'H\u1ee7y', style: 'cancel' },
        {
          text: 'X\u00f3a',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(spamItem.id);
            try {
              await spamDetectionService.deleteSpamMessage(spamItem.id);
              // Remove from local state
              setSpamMessages(prev => prev.filter(m => m.id !== spamItem.id));
            } catch (error) {
              console.error('Error deleting spam:', error);
              Alert.alert('L\u1ed7i', 'Kh\u00f4ng th\u1ec3 x\u00f3a tin nh\u1eafn. Vui l\u00f2ng th\u1eed l\u1ea1i.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  }, []);

  const handleDeleteAll = useCallback(async () => {
    if (spamMessages.length === 0) return;

    Alert.alert(
      'X\u00f3a t\u1ea5t c\u1ea3 spam',
      `B\u1ea1n c\u00f3 ch\u1eafc ch\u1eafn mu\u1ed1n x\u00f3a t\u1ea5t c\u1ea3 ${spamMessages.length} tin nh\u1eafn spam? H\u00e0nh \u0111\u1ed9ng n\u00e0y kh\u00f4ng th\u1ec3 ho\u00e0n t\u00e1c.`,
      [
        { text: 'H\u1ee7y', style: 'cancel' },
        {
          text: 'X\u00f3a t\u1ea5t c\u1ea3',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await spamDetectionService.deleteAllSpam();
              setSpamMessages([]);
            } catch (error) {
              console.error('Error deleting all spam:', error);
              Alert.alert('L\u1ed7i', 'Kh\u00f4ng th\u1ec3 x\u00f3a spam. Vui l\u00f2ng th\u1eed l\u1ea1i.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [spamMessages.length]);

  // =====================================================
  // FILTERED DATA
  // =====================================================

  const filteredMessages = spamMessages.filter((msg) => {
    if (activeFilter === 'all') return true;
    return msg.spam_type === activeFilter;
  });

  // Get unique spam types for filters
  const spamTypes = ['all', ...new Set(spamMessages.map(m => m.spam_type).filter(Boolean))];

  // =====================================================
  // RENDER
  // =====================================================

  const renderSpamMessage = ({ item, index }) => (
    <SpamMessageItem
      item={item}
      index={index}
      onMarkNotSpam={() => handleMarkNotSpam(item)}
      onDelete={() => handleDelete(item)}
      isProcessing={processingId === item.id}
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
          <Ionicons name="shield-checkmark-outline" size={48} color={COLORS.success} />
        </LinearGradient>
      </View>
      <Text style={styles.emptyTitle}>Kh\u00f4ng c\u00f3 spam</Text>
      <Text style={styles.emptySubtitle}>
        H\u1ed9p th\u01b0 c\u1ee7a b\u1ea1n s\u1ea1ch s\u1ebd! {'\n'}
        Ch\u00fang t\u00f4i s\u1ebd t\u1ef1 \u0111\u1ed9ng l\u1ecdc tin nh\u1eafn r\u00e1c cho b\u1ea1n.
      </Text>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <FlatList
        data={spamTypes}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filtersList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === item && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(item)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === item && styles.filterChipTextActive,
              ]}
            >
              {item === 'all' ? 'T\u1ea5t c\u1ea3' : (SPAM_TYPE_LABELS[item] || item)}
            </Text>
          </TouchableOpacity>
        )}
      />
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
          <Text style={styles.headerTitle}>Spam</Text>
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
        <Text style={styles.headerTitle}>Spam ({spamMessages.length})</Text>
        {spamMessages.length > 0 ? (
          <TouchableOpacity
            onPress={handleDeleteAll}
            style={styles.headerAction}
          >
            <Ionicons name="trash-outline" size={22} color={COLORS.error} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerPlaceholder} />
        )}
      </View>

      {/* Filters */}
      {spamMessages.length > 0 && renderFilters()}

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color={COLORS.purple} />
        <Text style={styles.infoBannerText}>
          Tin nh\u1eafn spam s\u1ebd \u0111\u01b0\u1ee3c t\u1ef1 \u0111\u1ed9ng x\u00f3a sau 30 ng\u00e0y. B\u1ea1n c\u00f3 th\u1ec3 kh\u00f4i ph\u1ee5c tin nh\u1eafn kh\u00f4ng ph\u1ea3i spam.
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={filteredMessages}
        renderItem={renderSpamMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredMessages.length === 0 && styles.listContentEmpty,
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
// SPAM MESSAGE ITEM
// =====================================================

function SpamMessageItem({
  item,
  index,
  onMarkNotSpam,
  onDelete,
  isProcessing,
}) {
  const { sender, content, spam_type, confidence_score, detected_at } = item;

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
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'V\u1eeba xong';
    if (diffHours < 24) return `${diffHours}h tr\u01b0\u1edbc`;
    if (diffDays < 7) return `${diffDays} ng\u00e0y tr\u01b0\u1edbc`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
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

  // Get confidence color
  const getConfidenceColor = (score) => {
    if (score >= 0.8) return COLORS.error;
    if (score >= 0.5) return COLORS.warning;
    return COLORS.textMuted;
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
        <View style={styles.avatarContainer}>
          {sender?.avatar_url ? (
            <Image
              source={{ uri: sender.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <LinearGradient
              colors={[COLORS.error, COLORS.warning]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarFallback}
            >
              <Text style={styles.avatarInitials}>
                {getInitials(sender?.display_name)}
              </Text>
            </LinearGradient>
          )}
          {/* Spam indicator */}
          <View style={styles.spamIndicator}>
            <Ionicons name="alert" size={10} color={COLORS.textPrimary} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={styles.senderName} numberOfLines={1}>
              {sender?.display_name || 'Kh\u00f4ng r\u00f5'}
            </Text>
            <Text style={styles.time}>{formatDate(detected_at)}</Text>
          </View>

          {/* Spam Type Badge */}
          <View style={styles.badgesRow}>
            <View style={styles.spamTypeBadge}>
              <Text style={styles.spamTypeBadgeText}>
                {SPAM_TYPE_LABELS[spam_type] || spam_type}
              </Text>
            </View>
            {confidence_score && (
              <View style={[styles.confidenceBadge, { borderColor: getConfidenceColor(confidence_score) }]}>
                <Text style={[styles.confidenceText, { color: getConfidenceColor(confidence_score) }]}>
                  {Math.round(confidence_score * 100)}% ch\u1eafc ch\u1eafn
                </Text>
              </View>
            )}
          </View>

          {/* Message preview */}
          <Text style={styles.messagePreview} numberOfLines={2}>
            {content || 'N\u1ed9i dung \u0111\u00e3 b\u1ecb \u1ea9n'}
          </Text>

          {/* Actions */}
          <View style={styles.actionsRow}>
            {isProcessing ? (
              <ActivityIndicator size="small" color={COLORS.gold} />
            ) : (
              <>
                {/* Not Spam Button */}
                <TouchableOpacity
                  style={styles.notSpamButton}
                  onPress={onMarkNotSpam}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} />
                  <Text style={styles.notSpamButtonText}>Kh\u00f4ng ph\u1ea3i spam</Text>
                </TouchableOpacity>

                {/* Delete Button */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={onDelete}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                  <Text style={styles.deleteButtonText}>X\u00f3a</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
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
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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

  // Filters
  filtersContainer: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  filtersList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.purple,
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
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
    padding: SPACING.md,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
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
  spamIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(15, 16, 48, 0.9)',
  },

  // Content
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  senderName: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  time: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Badges
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  spamTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 10,
  },
  spamTypeBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.error,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 10,
  },
  confidenceText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Message Preview
  messagePreview: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  notSpamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: 16,
    gap: 4,
  },
  notSpamButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.success,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 16,
    gap: 4,
  },
  deleteButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.error,
  },
});
