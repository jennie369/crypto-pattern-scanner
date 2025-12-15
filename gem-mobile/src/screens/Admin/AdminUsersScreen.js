/**
 * Gemral - Admin Users Management Screen
 * View and manage all users
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  Crown,
  Shield,
  Edit3,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Mail,
  Calendar,
  Star,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

const TIER_OPTIONS = ['FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN'];
const ROLE_OPTIONS = ['user', 'admin'];

const AdminUsersScreen = ({ navigation }) => {
  const { isAdmin } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [expandedUser, setExpandedUser] = useState(null);
  const [editModal, setEditModal] = useState({ visible: false, user: null });
  const [saving, setSaving] = useState(false);

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error('[AdminUsers] Error loading users:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tải danh sách người dùng',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Filter users
  useEffect(() => {
    let result = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          (user.email && user.email.toLowerCase().includes(query)) ||
          (user.full_name && user.full_name.toLowerCase().includes(query)) ||
          (user.display_name && user.display_name.toLowerCase().includes(query))
      );
    }

    // Tier filter
    if (filterTier !== 'all') {
      result = result.filter(
        (user) =>
          user.scanner_tier === filterTier ||
          user.chatbot_tier === filterTier ||
          (filterTier === 'ADMIN' && user.role === 'admin')
      );
    }

    setFilteredUsers(result);
  }, [users, searchQuery, filterTier]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsers();
  }, [loadUsers]);

  // Update user
  const handleUpdateUser = async (userId, updates) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      alert({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật thông tin người dùng',
        buttons: [{ text: 'OK' }],
      });
      setEditModal({ visible: false, user: null });
      loadUsers();
    } catch (error) {
      console.error('[AdminUsers] Error updating user:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể cập nhật người dùng',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setSaving(false);
    }
  };

  // Get tier color - sáng hơn để đọc được trên nền tối
  const getTierColor = (tier) => {
    const colors = {
      FREE: COLORS.gold,
      TIER1: '#7DD3FC',
      TIER2: '#A78BFA',
      TIER3: '#FCD34D',
      ADMIN: '#F472B6',
    };
    return colors[tier] || COLORS.gold;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Render user card
  const renderUserCard = ({ item }) => {
    const isExpanded = expandedUser === item.id;
    const isUserAdmin = item.role === 'admin' || item.scanner_tier === 'ADMIN';

    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => setExpandedUser(isExpanded ? null : item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.userHeader}>
          <View style={styles.userAvatar}>
            {isUserAdmin ? (
              <Shield size={20} color={COLORS.gold} />
            ) : (
              <Users size={20} color={COLORS.gold} />
            )}
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {item.full_name || item.display_name || 'Unnamed User'}
            </Text>
            <Text style={styles.userEmail}>{item.email || 'No email'}</Text>
          </View>

          <View style={styles.userTiers}>
            <View style={[styles.tierBadge, { backgroundColor: getTierColor(item.scanner_tier) + '30' }]}>
              <Text style={[styles.tierText, { color: getTierColor(item.scanner_tier) }]}>
                {item.scanner_tier || 'FREE'}
              </Text>
            </View>
          </View>

          {isExpanded ? (
            <ChevronUp size={20} color={COLORS.textMuted} />
          ) : (
            <ChevronDown size={20} color={COLORS.textMuted} />
          )}
        </View>

        {isExpanded && (
          <View style={styles.userDetails}>
            <View style={styles.detailRow}>
              <Mail size={14} color={COLORS.gold} />
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{item.email || 'N/A'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Star size={14} color={COLORS.gold} />
              <Text style={styles.detailLabel}>Scanner Tier:</Text>
              <Text style={[styles.detailValue, { color: getTierColor(item.scanner_tier) }]}>
                {item.scanner_tier || 'FREE'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Star size={14} color={COLORS.gold} />
              <Text style={styles.detailLabel}>Chatbot Tier:</Text>
              <Text style={[styles.detailValue, { color: getTierColor(item.chatbot_tier) }]}>
                {item.chatbot_tier || 'FREE'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Shield size={14} color={COLORS.gold} />
              <Text style={styles.detailLabel}>Role:</Text>
              <Text style={[styles.detailValue, { color: item.role === 'admin' ? '#F472B6' : COLORS.textPrimary }]}>
                {item.role || 'user'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Calendar size={14} color={COLORS.gold} />
              <Text style={styles.detailLabel}>Ngày tham gia:</Text>
              <Text style={styles.detailValue}>{formatDate(item.created_at)}</Text>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditModal({ visible: true, user: item })}
            >
              <Edit3 size={14} color={COLORS.gold} />
              <Text style={styles.editButtonText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Edit Modal
  const EditUserModal = () => {
    const [formData, setFormData] = useState({
      scanner_tier: editModal.user?.scanner_tier || 'FREE',
      chatbot_tier: editModal.user?.chatbot_tier || 'FREE',
      role: editModal.user?.role || 'user',
    });

    return (
      <Modal
        visible={editModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModal({ visible: false, user: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa người dùng</Text>
              <TouchableOpacity onPress={() => setEditModal({ visible: false, user: null })}>
                <X size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalUserEmail}>{editModal.user?.email}</Text>

            {/* Scanner Tier */}
            <Text style={styles.fieldLabel}>Scanner Tier</Text>
            <View style={styles.optionsRow}>
              {TIER_OPTIONS.map((tier) => (
                <TouchableOpacity
                  key={tier}
                  style={[
                    styles.optionButton,
                    formData.scanner_tier === tier && styles.optionButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, scanner_tier: tier })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.scanner_tier === tier && styles.optionTextActive,
                    ]}
                  >
                    {tier}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Chatbot Tier */}
            <Text style={styles.fieldLabel}>Chatbot Tier</Text>
            <View style={styles.optionsRow}>
              {TIER_OPTIONS.map((tier) => (
                <TouchableOpacity
                  key={tier}
                  style={[
                    styles.optionButton,
                    formData.chatbot_tier === tier && styles.optionButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, chatbot_tier: tier })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.chatbot_tier === tier && styles.optionTextActive,
                    ]}
                  >
                    {tier}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Role */}
            <Text style={styles.fieldLabel}>Role</Text>
            <View style={styles.optionsRow}>
              {ROLE_OPTIONS.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.optionButton,
                    formData.role === role && styles.optionButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, role: role })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.role === role && styles.optionTextActive,
                    ]}
                  >
                    {role.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModal({ visible: false, user: null })}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => handleUpdateUser(editModal.user.id, formData)}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Check size={16} color="#FFF" />
                    <Text style={styles.saveButtonText}>Lưu</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Access denied
  if (!isAdmin) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.accessDenied}>
            <Shield size={64} color={COLORS.error} />
            <Text style={styles.accessDeniedTitle}>Truy cập bị từ chối</Text>
            <Text style={styles.accessDeniedText}>
              Bạn không có quyền truy cập trang này
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý Users</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search & Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm theo email hoặc tên..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {['all', 'FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN'].map((tier) => (
            <TouchableOpacity
              key={tier}
              style={[styles.filterTab, filterTier === tier && styles.filterTabActive]}
              onPress={() => setFilterTier(tier)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filterTier === tier && styles.filterTabTextActive,
                ]}
              >
                {tier === 'all' ? 'Tất cả' : tier}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            Hiển thị {filteredUsers.length} / {users.length} người dùng
          </Text>
        </View>

        {/* Users List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Users size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
              </View>
            }
          />
        )}

        {/* Edit Modal */}
        {editModal.visible && <EditUserModal />}

        {AlertComponent}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.gold,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
    gap: 6,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterTabActive: {
    backgroundColor: COLORS.gold,
  },
  filterTabText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  filterTabTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  statsRow: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  statsText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: 8,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 1,
  },
  userEmail: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  userTiers: {
    marginRight: SPACING.xs,
  },
  tierBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '700',
  },
  userDetails: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
    width: 90,
  },
  detailValue: {
    fontSize: 12,
    color: COLORS.textPrimary,
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  editButtonText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1A1B2E',
    borderRadius: 14,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gold,
  },
  modalUserEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.md,
  },
  optionButton: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionButtonActive: {
    backgroundColor: COLORS.gold,
  },
  optionText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  optionTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  cancelButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButtonText: {
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  accessDeniedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.error,
    marginTop: SPACING.md,
  },
  accessDeniedText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});

export default AdminUsersScreen;
