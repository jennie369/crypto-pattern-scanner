/**
 * Gemral - Admin Notifications Screen
 * Compose and broadcast system notifications to all users
 * ADMIN ONLY ACCESS
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Send,
  Bell,
  Users,
  Crown,
  Gift,
  ChevronDown,
  Check,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
} from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

// Target audience options
const AUDIENCE_OPTIONS = [
  { id: 'all', label: 'Tất cả người dùng', icon: Users, description: 'Gửi đến tất cả users' },
  { id: 'premium', label: 'Premium Users', icon: Crown, description: 'Chỉ users có gói PRO/VIP' },
  { id: 'free', label: 'Free Users', icon: Gift, description: 'Chỉ users miễn phí' },
];

// Status badge colors
const STATUS_COLORS = {
  draft: COLORS.textMuted,
  scheduled: COLORS.gold,
  sending: COLORS.cyan,
  sent: COLORS.success,
  failed: COLORS.error,
};

export default function AdminNotificationsScreen({ navigation }) {
  const { user, isAdmin } = useAuth();

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [showAudiencePicker, setShowAudiencePicker] = useState(false);

  // UI state
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('compose'); // 'compose' | 'history'
  const [stats, setStats] = useState({ totalUsers: 0, activeTokens: 0 });

  // Check admin access
  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Không có quyền', 'Chỉ Admin mới có thể truy cập trang này');
      navigation.goBack();
    }
  }, [isAdmin]);

  // Load data on mount
  useEffect(() => {
    loadStats();
    loadHistory();
  }, []);

  // Load user stats
  const loadStats = async () => {
    try {
      // Count total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Count active push tokens
      const { count: activeTokens } = await supabase
        .from('user_push_tokens')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setStats({
        totalUsers: totalUsers || 0,
        activeTokens: activeTokens || 0,
      });
    } catch (error) {
      console.error('[AdminNotifications] Load stats error:', error);
    }
  };

  // Load notification history
  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        // Table might not exist
        if (error.code === 'PGRST205' || error.code === '42P01') {
          console.warn('[AdminNotifications] system_notifications table not found');
          setHistory([]);
          return;
        }
        throw error;
      }

      setHistory(data || []);
    } catch (error) {
      console.error('[AdminNotifications] Load history error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send notification
  const handleSend = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề thông báo');
      return;
    }
    if (!body.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung thông báo');
      return;
    }

    Alert.alert(
      'Xác nhận gửi thông báo',
      `Bạn sắp gửi thông báo đến ${getAudienceLabel(targetAudience)}. Tiếp tục?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Gửi ngay', onPress: sendNotification },
      ]
    );
  };

  const sendNotification = async () => {
    setSending(true);
    try {
      // 1. Save to system_notifications
      const { data: notif, error: saveError } = await supabase
        .from('system_notifications')
        .insert({
          title: title.trim(),
          body: body.trim(),
          target_audience: targetAudience,
          sent_by: user.id,
          status: 'sending',
        })
        .select()
        .single();

      if (saveError) {
        // If table doesn't exist, show migration message
        if (saveError.code === 'PGRST205' || saveError.code === '42P01') {
          Alert.alert(
            'Cần chạy migration',
            'Bảng system_notifications chưa tồn tại. Vui lòng chạy migration 20251128_push_tokens_and_broadcast.sql'
          );
          setSending(false);
          return;
        }
        throw saveError;
      }

      // 2. Insert notification to all target users
      const { data: insertCount, error: broadcastError } = await supabase.rpc(
        'broadcast_notification_to_users',
        {
          p_title: title.trim(),
          p_body: body.trim(),
          p_data: { notification_id: notif.id, type: 'system_broadcast' },
          p_target_audience: targetAudience,
        }
      );

      if (broadcastError) {
        // Function might not exist
        console.error('[AdminNotifications] Broadcast RPC error:', broadcastError);
        // Fallback: manual insert
        await manualBroadcast(notif.id);
      }

      // 3. Call Edge Function to send push notifications
      try {
        const { data: pushResult, error: pushError } = await supabase.functions.invoke(
          'broadcast-notification',
          {
            body: {
              notification_id: notif.id,
              title: title.trim(),
              body: body.trim(),
              target_audience: targetAudience,
            },
          }
        );

        if (pushError) {
          console.warn('[AdminNotifications] Push notification error:', pushError);
        } else {
          console.log('[AdminNotifications] Push sent:', pushResult);
        }
      } catch (pushErr) {
        console.warn('[AdminNotifications] Edge function not available:', pushErr);
      }

      // 4. Update status to sent
      await supabase
        .from('system_notifications')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_count: insertCount || 0,
        })
        .eq('id', notif.id);

      // Success
      Alert.alert('Thành công', `Đã gửi thông báo đến ${insertCount || 'tất cả'} người dùng`);

      // Clear form
      setTitle('');
      setBody('');

      // Refresh history
      loadHistory();
      loadStats();

    } catch (error) {
      console.error('[AdminNotifications] Send error:', error);
      Alert.alert('Lỗi', 'Không thể gửi thông báo. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  };

  // Fallback manual broadcast (if RPC doesn't exist)
  const manualBroadcast = async (notificationId) => {
    try {
      // Get all user IDs
      const { data: users } = await supabase
        .from('profiles')
        .select('id');

      if (!users || users.length === 0) return;

      // Insert notifications in batches
      const notifications = users.map(u => ({
        user_id: u.id,
        type: 'system',
        title: title.trim(),
        body: body.trim(),
        data: { notification_id: notificationId, type: 'system_broadcast' },
      }));

      // Insert in chunks of 100
      const chunkSize = 100;
      for (let i = 0; i < notifications.length; i += chunkSize) {
        const chunk = notifications.slice(i, i + chunkSize);
        await supabase.from('notifications').insert(chunk);
      }

      console.log('[AdminNotifications] Manual broadcast complete:', users.length);
    } catch (error) {
      console.error('[AdminNotifications] Manual broadcast error:', error);
    }
  };

  // Get audience label
  const getAudienceLabel = (id) => {
    const option = AUDIENCE_OPTIONS.find(o => o.id === id);
    return option?.label || 'Tất cả';
  };

  // Delete notification from history
  const handleDelete = async (id) => {
    Alert.alert(
      'Xóa thông báo',
      'Bạn có chắc muốn xóa thông báo này khỏi lịch sử?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('system_notifications')
                .delete()
                .eq('id', id);
              loadHistory();
            } catch (error) {
              console.error('[AdminNotifications] Delete error:', error);
            }
          },
        },
      ]
    );
  };

  // Render history item
  const renderHistoryItem = ({ item }) => {
    const statusColor = STATUS_COLORS[item.status] || COLORS.textMuted;
    const date = new Date(item.created_at).toLocaleString('vi-VN');

    return (
      <View style={styles.historyItem}>
        <View style={styles.historyHeader}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            {item.status === 'sent' && <CheckCircle size={12} color={statusColor} />}
            {item.status === 'sending' && <Clock size={12} color={statusColor} />}
            {item.status === 'failed' && <AlertCircle size={12} color={statusColor} />}
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status === 'sent' ? 'Đã gửi' :
               item.status === 'sending' ? 'Đang gửi' :
               item.status === 'failed' ? 'Lỗi' : 'Nháp'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Trash2 size={16} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        <Text style={styles.historyTitle}>{item.title}</Text>
        <Text style={styles.historyBody} numberOfLines={2}>{item.body}</Text>

        <View style={styles.historyFooter}>
          <Text style={styles.historyDate}>{date}</Text>
          {item.sent_count > 0 && (
            <Text style={styles.historySentCount}>
              <Users size={12} color={COLORS.textMuted} /> {item.sent_count} người
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông Báo Hệ Thống</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Users size={20} color={COLORS.cyan} />
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={styles.statCard}>
            <Bell size={20} color={COLORS.gold} />
            <Text style={styles.statValue}>{stats.activeTokens}</Text>
            <Text style={styles.statLabel}>Push Active</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'compose' && styles.tabActive]}
            onPress={() => setActiveTab('compose')}
          >
            <Send size={16} color={activeTab === 'compose' ? COLORS.gold : COLORS.textMuted} />
            <Text style={[styles.tabText, activeTab === 'compose' && styles.tabTextActive]}>
              Soạn thông báo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Clock size={16} color={activeTab === 'history' ? COLORS.gold : COLORS.textMuted} />
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              Lịch sử ({history.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'compose' ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Target Audience */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ĐỐI TƯỢNG NHẬN</Text>
              <TouchableOpacity
                style={styles.audienceSelector}
                onPress={() => setShowAudiencePicker(!showAudiencePicker)}
              >
                <View style={styles.audienceSelectorContent}>
                  {React.createElement(
                    AUDIENCE_OPTIONS.find(o => o.id === targetAudience)?.icon || Users,
                    { size: 20, color: COLORS.gold }
                  )}
                  <Text style={styles.audienceSelectorText}>
                    {getAudienceLabel(targetAudience)}
                  </Text>
                </View>
                <ChevronDown size={20} color={COLORS.textMuted} />
              </TouchableOpacity>

              {showAudiencePicker && (
                <View style={styles.audienceDropdown}>
                  {AUDIENCE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = targetAudience === option.id;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[styles.audienceOption, isSelected && styles.audienceOptionActive]}
                        onPress={() => {
                          setTargetAudience(option.id);
                          setShowAudiencePicker(false);
                        }}
                      >
                        <Icon size={20} color={isSelected ? COLORS.gold : COLORS.textSecondary} />
                        <View style={styles.audienceOptionInfo}>
                          <Text style={[styles.audienceOptionLabel, isSelected && styles.audienceOptionLabelActive]}>
                            {option.label}
                          </Text>
                          <Text style={styles.audienceOptionDesc}>{option.description}</Text>
                        </View>
                        {isSelected && <Check size={18} color={COLORS.gold} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>TIÊU ĐỀ *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tiêu đề thông báo..."
                placeholderTextColor={COLORS.textMuted}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
              <Text style={styles.charCount}>{title.length}/100</Text>
            </View>

            {/* Body */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>NỘI DUNG *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập nội dung thông báo..."
                placeholderTextColor={COLORS.textMuted}
                value={body}
                onChangeText={setBody}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.charCount}>{body.length}/500</Text>
            </View>

            {/* Preview */}
            {(title || body) && (
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <Eye size={14} color={COLORS.textMuted} />
                  <Text style={styles.previewLabel}>Xem trước</Text>
                </View>
                <View style={styles.previewContent}>
                  <Bell size={20} color={COLORS.gold} />
                  <View style={styles.previewText}>
                    <Text style={styles.previewTitle}>{title || 'Tiêu đề thông báo'}</Text>
                    <Text style={styles.previewBody} numberOfLines={2}>
                      {body || 'Nội dung thông báo...'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Send Button */}
            <TouchableOpacity
              style={[styles.sendButton, (!title || !body || sending) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!title || !body || sending}
            >
              {sending ? (
                <ActivityIndicator color="#112250" />
              ) : (
                <>
                  <Send size={20} color="#112250" />
                  <Text style={styles.sendButtonText}>Gửi thông báo</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={{ height: 100 }} />
          </ScrollView>
        ) : (
          // History Tab
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.historyList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Bell size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Chưa có thông báo nào được gửi</Text>
              </View>
            }
            refreshing={loading}
            onRefresh={loadHistory}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backButton: {
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
  headerRight: { width: 40 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    gap: SPACING.xs,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Content
  content: {
    flex: 1,
    padding: SPACING.lg,
  },

  // Input Group
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },

  // Audience Selector
  audienceSelector: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  audienceSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  audienceSelectorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },
  audienceDropdown: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    overflow: 'hidden',
  },
  audienceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  audienceOptionActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  audienceOptionInfo: {
    flex: 1,
  },
  audienceOptionLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },
  audienceOptionLabelActive: {
    color: COLORS.gold,
  },
  audienceOptionDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Preview
  previewCard: {
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  previewLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  previewText: {
    flex: 1,
  },
  previewTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  previewBody: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Send Button
  sendButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#112250',
  },

  // History
  historyList: {
    padding: SPACING.md,
  },
  historyItem: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  historyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  historyBody: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  historySentCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
});
