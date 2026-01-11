/**
 * Gemral - User Detail Screen (Admin)
 *
 * Detailed view of a user with admin actions
 * Features: Profile info, stats, tier management, ban/unban, activity logs
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
  SafeAreaView,
  Image,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  ArrowLeft,
  Mail,
  Shield,
  ShieldOff,
  Crown,
  Gem,
  FileText,
  ShoppingBag,
  Calendar,
  Clock,
  Send,
  X,
  ChevronDown,
  History,
  AlertTriangle,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import adminUserService from '../../services/adminUserService';
import { showAlert } from '../../components/CustomAlert';

const TIER_OPTIONS = [
  { value: 'free', label: 'Free', color: COLORS.textMuted },
  { value: 'basic', label: 'Basic', color: '#00D9FF' },
  { value: 'premium', label: 'Premium', color: COLORS.gold },
  { value: 'vip', label: 'VIP', color: '#8B5CF6' },
];

const ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'creator', label: 'Creator' },
  { value: 'affiliate', label: 'Affiliate' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
];

const UserDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, user: initialUser } = route.params;

  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [showGemsModal, setShowGemsModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [selectedTierType, setSelectedTierType] = useState('scanner_tier');
  const [selectedTier, setSelectedTier] = useState('free');
  const [gemsAmount, setGemsAmount] = useState('');
  const [gemsReason, setGemsReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadUserDetails();
    loadActivityLogs();
  }, [userId]);

  const loadUserDetails = async () => {
    setLoading(true);
    try {
      const data = await adminUserService.getUserById(userId);
      if (data.error) {
        showAlert('Lỗi', data.error);
        return;
      }
      setUser(data);
    } catch (error) {
      console.error('[UserDetail] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    const { data } = await adminUserService.getUserActivity(userId, 1, 20);
    setActivityLogs(data);
  };

  const handleBan = async () => {
    if (!banReason.trim()) {
      showAlert('Lỗi', 'Vui lòng nhập lý do ban');
      return;
    }

    setActionLoading(true);
    try {
      const result = await adminUserService.banUser(userId, banReason);
      if (result.success) {
        showAlert('Thành công', 'User đã bị ban');
        setShowBanModal(false);
        setBanReason('');
        loadUserDetails();
      } else {
        showAlert('Lỗi', result.error);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async () => {
    setActionLoading(true);
    try {
      const result = await adminUserService.unbanUser(userId);
      if (result.success) {
        showAlert('Thành công', 'User đã được unban');
        loadUserDetails();
      } else {
        showAlert('Lỗi', result.error);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleGrantTier = async () => {
    setActionLoading(true);
    try {
      const result = await adminUserService.grantTier(
        userId,
        selectedTierType,
        selectedTier,
        'Admin grant'
      );
      if (result.success) {
        showAlert('Thành công', 'Tier đã được cập nhật');
        setShowTierModal(false);
        loadUserDetails();
      } else {
        showAlert('Lỗi', result.error);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddGems = async () => {
    const amount = parseInt(gemsAmount, 10);
    if (!amount || amount <= 0) {
      showAlert('Lỗi', 'Vui lòng nhập số gems hợp lệ');
      return;
    }

    setActionLoading(true);
    try {
      const result = await adminUserService.addGems(
        userId,
        amount,
        gemsReason || 'Admin grant'
      );
      if (result.success) {
        showAlert('Thành công', `Đã thêm ${amount} gems`);
        setShowGemsModal(false);
        setGemsAmount('');
        setGemsReason('');
        loadUserDetails();
      } else {
        showAlert('Lỗi', result.error);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendResetPassword = async () => {
    setActionLoading(true);
    try {
      const result = await adminUserService.sendPasswordReset(user.email);
      if (result.success) {
        showAlert('Thành công', 'Email reset password đã được gửi');
      } else {
        showAlert('Lỗi', result.error);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <ArrowLeft size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Chi tiết User</Text>
      <View style={{ width: 32 }} />
    </View>
  );

  const renderProfile = () => (
    <View style={styles.profileSection}>
      <Image
        source={{
          uri: user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'U')}&background=random`,
        }}
        style={styles.avatar}
      />

      <Text style={styles.userName}>{user?.full_name || 'Chưa đặt tên'}</Text>
      <Text style={styles.userEmail}>{user?.email}</Text>

      {user?.is_banned && (
        <View style={styles.bannedAlert}>
          <AlertTriangle size={16} color={COLORS.error} />
          <Text style={styles.bannedText}>User đã bị ban</Text>
        </View>
      )}

      <View style={styles.tierRow}>
        <View style={[styles.tierBadge, { backgroundColor: `${TIER_OPTIONS.find(t => t.value === user?.scanner_tier)?.color || COLORS.textMuted}20` }]}>
          <Text style={[styles.tierText, { color: TIER_OPTIONS.find(t => t.value === user?.scanner_tier)?.color }]}>
            Scanner: {(user?.scanner_tier || 'free').toUpperCase()}
          </Text>
        </View>
        <View style={[styles.tierBadge, { backgroundColor: `${TIER_OPTIONS.find(t => t.value === user?.chatbot_tier)?.color || COLORS.textMuted}20` }]}>
          <Text style={[styles.tierText, { color: TIER_OPTIONS.find(t => t.value === user?.chatbot_tier)?.color }]}>
            Chatbot: {(user?.chatbot_tier || 'free').toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <Gem size={20} color={COLORS.gold} />
        <Text style={styles.statValue}>{user?.gems || 0}</Text>
        <Text style={styles.statLabel}>Gems</Text>
      </View>
      <View style={styles.statCard}>
        <FileText size={20} color="#00D9FF" />
        <Text style={styles.statValue}>{user?.stats?.totalPosts || 0}</Text>
        <Text style={styles.statLabel}>Bài viết</Text>
      </View>
      <View style={styles.statCard}>
        <ShoppingBag size={20} color="#8B5CF6" />
        <Text style={styles.statValue}>{user?.stats?.totalOrders || 0}</Text>
        <Text style={styles.statLabel}>Đơn hàng</Text>
      </View>
      <View style={styles.statCard}>
        <Calendar size={20} color={COLORS.success} />
        <Text style={styles.statValue}>
          {user?.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'N/A'}
        </Text>
        <Text style={styles.statLabel}>Ngày tham gia</Text>
      </View>
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsSection}>
      <Text style={styles.sectionTitle}>Hành động</Text>

      <View style={styles.actionsGrid}>
        {user?.is_banned ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionSuccess]}
            onPress={handleUnban}
            disabled={actionLoading}
          >
            <Shield size={20} color={COLORS.success} />
            <Text style={[styles.actionText, { color: COLORS.success }]}>Unban</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionDanger]}
            onPress={() => setShowBanModal(true)}
            disabled={actionLoading}
          >
            <ShieldOff size={20} color={COLORS.error} />
            <Text style={[styles.actionText, { color: COLORS.error }]}>Ban User</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSelectedTier(user?.scanner_tier || 'free');
            setShowTierModal(true);
          }}
          disabled={actionLoading}
        >
          <Crown size={20} color={COLORS.gold} />
          <Text style={styles.actionText}>Đổi Tier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowGemsModal(true)}
          disabled={actionLoading}
        >
          <Gem size={20} color={COLORS.gold} />
          <Text style={styles.actionText}>Thêm Gems</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSendResetPassword}
          disabled={actionLoading}
        >
          <Send size={20} color="#00D9FF" />
          <Text style={styles.actionText}>Reset Password</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActivityLogs = () => (
    <View style={styles.logsSection}>
      <View style={styles.sectionHeader}>
        <History size={18} color={COLORS.textMuted} />
        <Text style={styles.sectionTitle}>Lịch sử hoạt động</Text>
      </View>

      {activityLogs.length === 0 ? (
        <Text style={styles.noLogsText}>Chưa có hoạt động nào</Text>
      ) : (
        activityLogs.slice(0, 10).map((log, index) => (
          <View key={log.id || index} style={styles.logItem}>
            <View style={styles.logDot} />
            <View style={styles.logContent}>
              <Text style={styles.logAction}>{log.action_type}</Text>
              <Text style={styles.logTime}>{formatDate(log.created_at)}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderBanModal = () => (
    <Modal visible={showBanModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ban User</Text>
            <TouchableOpacity onPress={() => setShowBanModal(false)}>
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalLabel}>Lý do ban:</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Nhập lý do..."
            placeholderTextColor={COLORS.textMuted}
            value={banReason}
            onChangeText={setBanReason}
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowBanModal(false)}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalSubmitButton, styles.modalDangerButton]}
              onPress={handleBan}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color={COLORS.textPrimary} />
              ) : (
                <Text style={styles.modalSubmitText}>Ban User</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderTierModal = () => (
    <Modal visible={showTierModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Đổi Tier</Text>
            <TouchableOpacity onPress={() => setShowTierModal(false)}>
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalLabel}>Loại tier:</Text>
          <View style={styles.tierTypeRow}>
            <TouchableOpacity
              style={[
                styles.tierTypeButton,
                selectedTierType === 'scanner_tier' && styles.tierTypeButtonActive,
              ]}
              onPress={() => setSelectedTierType('scanner_tier')}
            >
              <Text style={styles.tierTypeText}>Scanner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tierTypeButton,
                selectedTierType === 'chatbot_tier' && styles.tierTypeButtonActive,
              ]}
              onPress={() => setSelectedTierType('chatbot_tier')}
            >
              <Text style={styles.tierTypeText}>Chatbot</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalLabel}>Tier mới:</Text>
          <View style={styles.tierOptionsGrid}>
            {TIER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.tierOption,
                  selectedTier === option.value && styles.tierOptionActive,
                ]}
                onPress={() => setSelectedTier(option.value)}
              >
                <Text style={[styles.tierOptionText, { color: option.color }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowTierModal(false)}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSubmitButton}
              onPress={handleGrantTier}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color={COLORS.bgDarkest} />
              ) : (
                <Text style={styles.modalSubmitText}>Cập nhật</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderGemsModal = () => (
    <Modal visible={showGemsModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thêm Gems</Text>
            <TouchableOpacity onPress={() => setShowGemsModal(false)}>
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalLabel}>Số lượng gems:</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Nhập số gems..."
            placeholderTextColor={COLORS.textMuted}
            value={gemsAmount}
            onChangeText={setGemsAmount}
            keyboardType="number-pad"
          />

          <Text style={styles.modalLabel}>Lý do (tùy chọn):</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Ví dụ: Bonus event..."
            placeholderTextColor={COLORS.textMuted}
            value={gemsReason}
            onChangeText={setGemsReason}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowGemsModal(false)}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSubmitButton}
              onPress={handleAddGems}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color={COLORS.bgDarkest} />
              ) : (
                <Text style={styles.modalSubmitText}>Thêm Gems</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

      {renderHeader()}

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {renderProfile()}
        {renderStats()}
        {renderActions()}
        {renderActivityLogs()}
      </ScrollView>

      {renderBanModal()}
      {renderTierModal()}
      {renderGemsModal()}
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.huge,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: SPACING.md,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  bannedAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  bannedText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  tierRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tierBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tierText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
    ...GLASS,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  actionsSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    ...GLASS,
  },
  actionDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  logsSection: {
    backgroundColor: COLORS.bgMid,
    borderRadius: 16,
    padding: SPACING.md,
    ...GLASS,
  },
  noLogsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
    marginTop: 4,
  },
  logContent: {
    flex: 1,
  },
  logAction: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },
  logTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.bgMid,
    borderRadius: 20,
    padding: SPACING.xl,
    ...GLASS,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  modalLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    minHeight: 48,
  },
  tierTypeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tierTypeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  tierTypeButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  tierTypeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },
  tierOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  tierOption: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tierOptionActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  tierOptionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  modalCancelText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    borderRadius: 12,
  },
  modalDangerButton: {
    backgroundColor: COLORS.error,
  },
  modalSubmitText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },
});

export default UserDetailScreen;
