/**
 * Livestream List Screen
 * Displays available and scheduled livestream sessions
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/tokens';

const LivestreamListScreen = () => {
  const navigation = useNavigation();
  const { user, isAdmin } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, live, scheduled, ended

  // Fetch livestream sessions
  const fetchSessions = useCallback(async () => {
    try {
      let query = supabase
        .from('livestream_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSessions();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel('livestream_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'livestream_sessions',
        },
        (payload) => {
          console.log('Session change:', payload);
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchSessions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  const handleJoinSession = (session) => {
    navigation.navigate('LivestreamViewer', { sessionId: session.id });
  };

  const handleAdminPress = () => {
    navigation.navigate('AdminLivestream');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live':
        return COLORS.error;
      case 'scheduled':
        return COLORS.warning;
      case 'ended':
        return COLORS.textMuted;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'live':
        return 'LIVE';
      case 'scheduled':
        return 'Sắp diễn ra';
      case 'ended':
        return 'Đã kết thúc';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderSessionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => handleJoinSession(item)}
      disabled={item.status === 'ended'}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {item.thumbnail_url ? (
          <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} />
        ) : (
          <LinearGradient
            colors={[COLORS.navy, COLORS.purple]}
            style={styles.thumbnailPlaceholder}
          >
            <Ionicons name="videocam" size={32} color={COLORS.gold} />
          </LinearGradient>
        )}

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          {item.status === 'live' && (
            <View style={styles.liveDot} />
          )}
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>

        {/* Viewer Count (if live) */}
        {item.status === 'live' && item.stats?.peak_viewers > 0 && (
          <View style={styles.viewerBadge}>
            <Ionicons name="eye" size={12} color={COLORS.white} />
            <Text style={styles.viewerText}>{item.stats.peak_viewers}</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle} numberOfLines={2}>
          {item.title || 'GEMRAL AI Livestream'}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="person-circle" size={14} color={COLORS.gold} />
          <Text style={styles.metaText}>{item.persona || 'SuPhu'}</Text>
        </View>

        {item.scheduled_start && (
          <View style={styles.metaRow}>
            <Ionicons name="calendar" size={14} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{formatDate(item.scheduled_start)}</Text>
          </View>
        )}

        {item.stats && item.status === 'live' && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble" size={12} color={COLORS.textMuted} />
              <Text style={styles.statText}>{item.stats.total_comments || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="gift" size={12} color={COLORS.textMuted} />
              <Text style={styles.statText}>{item.stats.total_gifts || 0}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Join Button */}
      {item.status === 'live' && (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => handleJoinSession(item)}
        >
          <Ionicons name="play" size={20} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="videocam-off" size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Không có livestream</Text>
      <Text style={styles.emptyText}>
        {filter === 'live'
          ? 'Hiện không có livestream nào đang diễn ra'
          : 'Chưa có lịch livestream nào được tạo'}
      </Text>
    </View>
  );

  const renderFilterButton = (value, label) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Livestream</Text>
        {isAdmin && (
          <TouchableOpacity onPress={handleAdminPress} style={styles.adminButton}>
            <Ionicons name="settings" size={24} color={COLORS.gold} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'Tất cả')}
        {renderFilterButton('live', 'Đang live')}
        {renderFilterButton('scheduled', 'Sắp diễn ra')}
        {renderFilterButton('ended', 'Đã kết thúc')}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSessionItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.gold]}
              tintColor={COLORS.gold}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
    marginLeft: SPACING.md,
  },
  adminButton: {
    padding: SPACING.xs,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    backgroundColor: COLORS.glassBg,
  },
  filterButtonActive: {
    backgroundColor: COLORS.gold,
  },
  filterText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.navy,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  sessionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: 120,
    height: 90,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  viewerBadge: {
    position: 'absolute',
    bottom: SPACING.xs,
    left: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  viewerText: {
    fontSize: 10,
    color: COLORS.white,
  },
  sessionInfo: {
    flex: 1,
    padding: SPACING.sm,
  },
  sessionTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  joinButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.error,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.white,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});

export default LivestreamListScreen;
