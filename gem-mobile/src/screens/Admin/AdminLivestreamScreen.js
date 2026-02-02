/**
 * Admin Livestream Screen
 * Phase 5: Production
 *
 * Livestream management features:
 * - View all sessions
 * - Start/Stop sessions
 * - View real-time stats
 * - Configure session settings
 * - View session history
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import tokens from '../../utils/tokens';

// ============================================================================
// SESSION CARD COMPONENT
// ============================================================================

const SessionCard = ({ session, onPress, onAction }) => {
  const isLive = session.status === 'live';
  const isScheduled = session.status === 'scheduled';

  const getStatusColor = () => {
    switch (session.status) {
      case 'live':
        return '#4CAF50';
      case 'scheduled':
        return '#FF9800';
      case 'ended':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity style={styles.sessionCard} onPress={onPress}>
      <View style={styles.sessionHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{session.status?.toUpperCase()}</Text>
        </View>
        <Text style={styles.sessionDate}>{formatDate(session.created_at)}</Text>
      </View>

      <Text style={styles.sessionTitle} numberOfLines={2}>
        {session.title || 'Untitled Session'}
      </Text>

      <View style={styles.sessionStats}>
        <View style={styles.statItem}>
          <Ionicons name="eye-outline" size={16} color={tokens.colors.textSecondary} />
          <Text style={styles.statText}>{session.stats?.peak_viewers || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="chatbubble-outline" size={16} color={tokens.colors.textSecondary} />
          <Text style={styles.statText}>{session.stats?.total_comments || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="cart-outline" size={16} color={tokens.colors.textSecondary} />
          <Text style={styles.statText}>{session.stats?.total_orders || 0}</Text>
        </View>
      </View>

      {(isLive || isScheduled) && (
        <View style={styles.sessionActions}>
          {isLive ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.stopBtn]}
              onPress={() => onAction('stop', session)}
            >
              <Ionicons name="stop-circle" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Kết thúc</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, styles.startBtn]}
              onPress={() => onAction('start', session)}
            >
              <Ionicons name="play-circle" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Bắt đầu</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// ============================================================================
// STATS OVERVIEW COMPONENT
// ============================================================================

const StatsOverview = ({ stats }) => {
  return (
    <View style={styles.statsOverview}>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>{stats.totalSessions || 0}</Text>
          <Text style={styles.statBoxLabel}>Tổng Sessions</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>{stats.liveSessions || 0}</Text>
          <Text style={styles.statBoxLabel}>Đang Live</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>{stats.totalViewers || 0}</Text>
          <Text style={styles.statBoxLabel}>Viewers Hôm nay</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>{stats.totalComments || 0}</Text>
          <Text style={styles.statBoxLabel}>Comments</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>{stats.totalOrders || 0}</Text>
          <Text style={styles.statBoxLabel}>Orders</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>
            {(stats.totalRevenue || 0).toLocaleString('vi-VN')}
          </Text>
          <Text style={styles.statBoxLabel}>Doanh thu (VND)</Text>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

const AdminLivestreamScreen = ({ navigation }) => {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, live, scheduled, ended

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchData = useCallback(async () => {
    try {
      // Fetch sessions
      let query = supabase
        .from('livestream_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }

      const { data: sessionsData, error: sessionsError } = await query;

      if (sessionsError) throw sessionsError;
      setSessions(sessionsData || []);

      // Fetch stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayStats } = await supabase
        .from('livestream_sessions')
        .select('id, status, stats')
        .gte('created_at', today.toISOString());

      // Calculate aggregate stats
      const aggregatedStats = {
        totalSessions: sessionsData?.length || 0,
        liveSessions: sessionsData?.filter((s) => s.status === 'live').length || 0,
        totalViewers: 0,
        totalComments: 0,
        totalOrders: 0,
        totalRevenue: 0,
      };

      todayStats?.forEach((session) => {
        if (session.stats) {
          aggregatedStats.totalViewers += session.stats.peak_viewers || 0;
          aggregatedStats.totalComments += session.stats.total_comments || 0;
          aggregatedStats.totalOrders += session.stats.total_orders || 0;
          aggregatedStats.totalRevenue += session.stats.total_revenue || 0;
        }
      });

      setStats(aggregatedStats);
    } catch (error) {
      console.error('[AdminLivestream] Fetch error:', error);
      Alert.alert('Loi', 'Khong the tai du lieu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const handleSessionAction = async (action, session) => {
    if (action === 'start') {
      Alert.alert(
        'Bat dau Livestream',
        `Ban co chac muon bat dau session "${session.title}"?`,
        [
          { text: 'Huy', style: 'cancel' },
          {
            text: 'Bat dau',
            onPress: async () => {
              try {
                await supabase
                  .from('livestream_sessions')
                  .update({
                    status: 'live',
                    started_at: new Date().toISOString(),
                  })
                  .eq('id', session.id);

                fetchData();
              } catch (error) {
                Alert.alert('Loi', 'Khong the bat dau session');
              }
            },
          },
        ]
      );
    } else if (action === 'stop') {
      Alert.alert(
        'Ket thuc Livestream',
        `Ban co chac muon ket thuc session "${session.title}"?`,
        [
          { text: 'Huy', style: 'cancel' },
          {
            text: 'Ket thuc',
            style: 'destructive',
            onPress: async () => {
              try {
                await supabase
                  .from('livestream_sessions')
                  .update({
                    status: 'ended',
                    ended_at: new Date().toISOString(),
                  })
                  .eq('id', session.id);

                fetchData();
              } catch (error) {
                Alert.alert('Loi', 'Khong the ket thuc session');
              }
            },
          },
        ]
      );
    }
  };

  const handleCreateSession = () => {
    Alert.alert(
      'Tính năng đang phát triển',
      'Chức năng tạo phiên livestream mới sẽ sớm ra mắt.',
      [{ text: 'OK' }]
    );
  };

  const handleSessionPress = (session) => {
    // Navigate to viewer screen with session details
    navigation.navigate('LivestreamViewer', { sessionId: session.id });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.colors.primary} />
          <Text style={styles.loadingText}>Dang tai...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={tokens.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quan ly Livestream</Text>
        <TouchableOpacity onPress={handleCreateSession} style={styles.addBtn}>
          <Ionicons name="add-circle" size={28} color={tokens.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Tabs */}
        <View style={styles.tabs}>
          {['all', 'live', 'scheduled', 'ended'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab === 'all'
                  ? 'Tất cả'
                  : tab === 'live'
                  ? 'Đang live'
                  : tab === 'scheduled'
                  ? 'Đã lên lịch'
                  : 'Đã kết thúc'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sessions List */}
        <View style={styles.sessionsList}>
          {sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="videocam-off-outline"
                size={48}
                color={tokens.colors.textSecondary}
              />
              <Text style={styles.emptyText}>Chua co session nao</Text>
              <TouchableOpacity
                style={styles.createBtn}
                onPress={handleCreateSession}
              >
                <Text style={styles.createBtnText}>Tao session moi</Text>
              </TouchableOpacity>
            </View>
          ) : (
            sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onPress={() => handleSessionPress(session)}
                onAction={handleSessionAction}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: tokens.colors.textSecondary,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.text,
  },
  addBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
  },

  // Stats Overview
  statsOverview: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: tokens.colors.card,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: '700',
    color: tokens.colors.text,
  },
  statBoxLabel: {
    fontSize: 11,
    color: tokens.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: tokens.colors.primary,
  },
  tabText: {
    fontSize: 13,
    color: tokens.colors.textSecondary,
  },
  tabTextActive: {
    color: tokens.colors.primary,
    fontWeight: '600',
  },

  // Sessions List
  sessionsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sessionCard: {
    backgroundColor: tokens.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  sessionDate: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text,
    marginBottom: 12,
  },
  sessionStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: tokens.colors.textSecondary,
  },
  sessionActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  startBtn: {
    backgroundColor: '#4CAF50',
  },
  stopBtn: {
    backgroundColor: '#F44336',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: tokens.colors.textSecondary,
    marginTop: 12,
    marginBottom: 16,
  },
  createBtn: {
    backgroundColor: tokens.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminLivestreamScreen;
