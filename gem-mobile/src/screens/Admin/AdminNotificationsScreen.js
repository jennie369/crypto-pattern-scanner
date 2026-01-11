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
  ActivityIndicator,
  FlatList,
} from 'react-native';
import CustomAlert from '../../components/CustomAlert';
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
import { notificationService } from '../../services/notificationService';
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

  // Custom Alert state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [{ text: 'OK' }],
    type: 'default',
  });

  const showAlert = (title, message, buttons = [{ text: 'OK' }], type = 'default') => {
    setAlertConfig({ visible: true, title, message, buttons, type });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  // Check admin access
  useEffect(() => {
    if (!isAdmin) {
      showAlert('Không có quyền', 'Chỉ Admin mới có thể truy cập trang này', [{ text: 'OK', onPress: () => navigation.goBack() }], 'error');
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
      showAlert('Lỗi', 'Vui lòng nhập tiêu đề thông báo', [{ text: 'OK' }], 'error');
      return;
    }
    if (!body.trim()) {
      showAlert('Lỗi', 'Vui lòng nhập nội dung thông báo', [{ text: 'OK' }], 'error');
      return;
    }

    showAlert(
      'Xác nhận gửi thông báo',
      `Bạn sắp gửi thông báo đến ${getAudienceLabel(targetAudience)}. Tiếp tục?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Gửi ngay', onPress: sendNotification },
      ],
      'warning'
    );
  };

  const sendNotification = async () => {
    setSending(true);
    let debugInfo = [];

    try {
      debugInfo.push('Starting broadcast...');

      // Try the new admin_send_broadcast RPC first (from 20251130_fix_notifications_system.sql)
      console.log('[AdminNotifications] Calling admin_send_broadcast RPC...');
      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        'admin_send_broadcast',
        {
          p_title: title.trim(),
          p_body: body.trim(),
          p_admin_id: user.id,
        }
      );

      console.log('[AdminNotifications] RPC Result:', rpcResult, 'Error:', rpcError);

      if (!rpcError && rpcResult?.success) {
        debugInfo.push(`RPC success: ${rpcResult.sent_count} users`);

        // Also try Edge Function for push notifications
        await sendPushViaEdgeFunction(null, title.trim(), body.trim(), debugInfo);

        // RPC worked - show success
        showAlert(
          'Thành công',
          `${rpcResult.message || `Đã gửi thông báo đến ${rpcResult.sent_count} người dùng`}\n\n[Debug: ${debugInfo.join(' → ')}]`,
          [{ text: 'OK' }],
          'success'
        );

        // Clear form
        setTitle('');
        setBody('');

        // Refresh history
        loadHistory();
        loadStats();
        setSending(false);
        return;
      }

      // If RPC failed, fall back to old method
      const rpcErrorMsg = rpcError?.message || rpcResult?.error || 'Unknown error';
      debugInfo.push(`RPC failed: ${rpcErrorMsg}`);
      console.warn('[AdminNotifications] New RPC failed, using fallback:', rpcError);

      // 1. Save to system_notifications
      console.log('[AdminNotifications] Fallback: inserting to system_notifications...');
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
        debugInfo.push(`system_notifications error: ${saveError.code}`);
        console.error('[AdminNotifications] Save error:', saveError);

        // If table doesn't exist or RLS blocks, try direct forum_notifications insert
        if (saveError.code === 'PGRST205' || saveError.code === '42P01' || saveError.code === '42501') {
          console.warn('[AdminNotifications] system_notifications not found or blocked, using forum_notifications');
          debugInfo.push('Using forum_notifications fallback');

          const broadcastCount = await manualBroadcast(null);
          await sendPushViaEdgeFunction(null, title.trim(), body.trim(), debugInfo);

          showAlert(
            'Thành công',
            `Đã gửi thông báo đến ${broadcastCount || 'tất cả'} người dùng\n\n[Debug: ${debugInfo.join(' → ')}]`,
            [{ text: 'OK' }],
            'success'
          );
          setTitle('');
          setBody('');
          loadHistory();
          loadStats();
          setSending(false);
          return;
        }
        throw saveError;
      }

      debugInfo.push(`Saved to system_notifications: ${notif.id}`);

      // 2. Insert notification to all target users (old RPC)
      console.log('[AdminNotifications] Calling broadcast_notification_to_users...');
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
        debugInfo.push(`broadcast_notification_to_users failed: ${broadcastError.message}`);
        console.error('[AdminNotifications] Broadcast RPC error:', broadcastError);
        // Fallback: manual insert
        await manualBroadcast(notif.id);
        debugInfo.push('Manual insert done');
      } else {
        debugInfo.push(`Broadcast RPC: ${insertCount} users`);
      }

      // 3. Call Edge Function to send push notifications
      await sendPushViaEdgeFunction(notif.id, title.trim(), body.trim(), debugInfo);

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
      showAlert(
        'Thành công',
        `Đã gửi thông báo đến ${insertCount || 'tất cả'} người dùng\n\n[Debug: ${debugInfo.join(' → ')}]`,
        [{ text: 'OK' }],
        'success'
      );

      // Clear form
      setTitle('');
      setBody('');

      // Refresh history
      loadHistory();
      loadStats();

    } catch (error) {
      debugInfo.push(`Error: ${error.message}`);
      console.error('[AdminNotifications] Send error:', error);
      showAlert(
        'Lỗi',
        `Không thể gửi thông báo: ${error.message}\n\n[Debug: ${debugInfo.join(' → ')}]`,
        [{ text: 'OK' }],
        'error'
      );
    } finally {
      setSending(false);
    }
  };

  // Helper: Send push via Edge Function
  const sendPushViaEdgeFunction = async (notificationId, notifTitle, notifBody, debugInfo) => {
    try {
      console.log('[AdminNotifications] Calling broadcast-notification Edge Function...');
      const { data: pushResult, error: pushError } = await supabase.functions.invoke(
        'broadcast-notification',
        {
          body: {
            notification_id: notificationId,
            title: notifTitle,
            body: notifBody,
            target_audience: targetAudience,
          },
        }
      );

      if (pushError) {
        debugInfo.push(`Edge Function error: ${pushError.message}`);
        console.warn('[AdminNotifications] Push notification error:', pushError);
      } else if (pushResult?.success) {
        debugInfo.push(`Push sent: ${pushResult.sent || 0} devices`);
        console.log('[AdminNotifications] Push sent:', pushResult);
      } else {
        debugInfo.push(`Push result: ${JSON.stringify(pushResult)}`);
        console.log('[AdminNotifications] Push result:', pushResult);
      }
    } catch (pushErr) {
      debugInfo.push(`Edge Function unavailable: ${pushErr.message}`);
      console.warn('[AdminNotifications] Edge function not available:', pushErr);
    }
  };

  // Fallback manual broadcast (if RPC doesn't exist)
  const manualBroadcast = async (notificationId) => {
    try {
      // Try notificationService.sendBroadcastNotification first (uses 'notifications' table with user_id = NULL)
      console.log('[AdminNotifications] Trying notificationService.sendBroadcastNotification...');
      const result = await notificationService.sendBroadcastNotification({
        title: title.trim(),
        message: body.trim(),
        type: 'system',
        data: { notification_id: notificationId, type: 'system_broadcast' },
      });

      if (result.success) {
        console.log('[AdminNotifications] Broadcast via notificationService success');
        return 1; // At least 1 broadcast record created
      }

      // If that fails, fall back to manual insert into forum_notifications
      console.warn('[AdminNotifications] notificationService broadcast failed:', result.error);
      console.log('[AdminNotifications] Falling back to manual insert into forum_notifications...');

      // Get all user IDs
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id');

      if (usersError) {
        console.error('[AdminNotifications] Failed to get users:', usersError);
        return 0;
      }

      if (!users || users.length === 0) {
        console.warn('[AdminNotifications] No users found');
        return 0;
      }

      // Insert notifications in batches into forum_notifications with is_broadcast flag
      const notifications = users.map(u => ({
        user_id: u.id,
        type: 'system',
        title: title.trim(),
        message: body.trim(),
        is_broadcast: true,
        read: false,
      }));

      // Insert in chunks of 100
      const chunkSize = 100;
      let insertedCount = 0;
      for (let i = 0; i < notifications.length; i += chunkSize) {
        const chunk = notifications.slice(i, i + chunkSize);
        const { error: insertError } = await supabase.from('forum_notifications').insert(chunk);
        if (!insertError) {
          insertedCount += chunk.length;
        } else {
          console.warn('[AdminNotifications] Chunk insert error:', insertError);
        }
      }

      console.log('[AdminNotifications] Manual broadcast complete:', insertedCount, 'of', users.length);
      return insertedCount;
    } catch (error) {
      console.error('[AdminNotifications] Manual broadcast error:', error);
      return 0;
    }
  };

  // Get audience label
  const getAudienceLabel = (id) => {
    const option = AUDIENCE_OPTIONS.find(o => o.id === id);
    return option?.label || 'Tất cả';
  };

  // Delete notification from history
  const handleDelete = async (id) => {
    showAlert(
      'Xóa thông báo',
      'Bạn có chắc muốn xóa thông báo này khỏi lịch sử?',
      [
        { text: 'Huỷ', style: 'cancel' },
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
      ],
      'warning'
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
            <Users size={18} color={COLORS.gold} />
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={styles.statCard}>
            <Bell size={18} color={COLORS.gold} />
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

        {/* Custom Alert */}
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          type={alertConfig.type}
          onClose={closeAlert}
        />
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
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.gold,
  },
  headerRight: { width: 36 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.xs,
  },
  tabActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderColor: COLORS.purple,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },

  // Content
  content: {
    flex: 1,
    padding: SPACING.md,
  },

  // Input Group
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 10,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: SPACING.sm,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },

  // Audience Selector
  audienceSelector: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  audienceSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  audienceSelectorText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  audienceDropdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    marginTop: SPACING.xs,
    overflow: 'hidden',
  },
  audienceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  audienceOptionActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
  },
  audienceOptionInfo: {
    flex: 1,
  },
  audienceOptionLabel: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  audienceOptionLabelActive: {
    color: COLORS.gold,
  },
  audienceOptionDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },

  // Preview
  previewCard: {
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  previewLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  previewText: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  previewBody: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Send Button
  sendButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#112250',
  },

  // History
  historyList: {
    padding: SPACING.sm,
  },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  historyBody: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  historySentCount: {
    fontSize: 10,
    color: COLORS.textMuted,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
});
