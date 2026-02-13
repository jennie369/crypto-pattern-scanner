/**
 * Gemral - Admin Withdrawals Screen
 * Review and process partner withdrawal requests
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Check,
  X,
  CreditCard,
  User,
  Calendar,
  Building2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

const AdminWithdrawalsScreen = ({ navigation }) => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [filter, setFilter] = useState('pending'); // pending, approved, processing, completed, rejected, all
  const [expandedId, setExpandedId] = useState(null);

  // Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadWithdrawals();
    }
  }, [isAdmin, filter]);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('withdrawal_requests')
        .select(`
          *,
          profiles:partner_id (
            full_name,
            email,
            affiliate_code,
            partnership_role,
            ctv_tier
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setWithdrawals(data || []);
    } catch (error) {
      console.error('[AdminWithdrawals] Error loading:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu cầu rút tiền');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWithdrawals();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'approved':
        return '#2196F3';
      case 'processing':
        return '#9C27B0';
      case 'completed':
        return '#4CAF50';
      case 'rejected':
        return '#FF5252';
      default:
        return COLORS.textMuted;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'processing':
        return 'Đang xử lý';
      case 'completed':
        return 'Hoàn tất';
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} color="#FF9800" />;
      case 'approved':
        return <Check size={16} color="#2196F3" />;
      case 'processing':
        return <Clock size={16} color="#9C27B0" />;
      case 'completed':
        return <CheckCircle2 size={16} color="#4CAF50" />;
      case 'rejected':
        return <XCircle size={16} color="#FF5252" />;
      default:
        return null;
    }
  };

  const handleApprove = async (withdrawal) => {
    Alert.alert(
      'Xác nhận duyệt',
      `Duyệt yêu cầu rút ${formatCurrency(withdrawal.amount)}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Duyệt',
          onPress: async () => {
            try {
              setProcessing(true);

              const { data, error } = await supabase.rpc('admin_approve_withdrawal', {
                withdrawal_id_param: withdrawal.id,
                admin_id_param: user.id,
                admin_notes_param: null,
              });

              if (error) throw error;

              if (data?.success) {
                Alert.alert('Thành công', 'Đã duyệt yêu cầu rút tiền', [
                  { text: 'OK', onPress: () => loadWithdrawals() },
                ]);
              } else {
                Alert.alert('Lỗi', data?.error || 'Không thể duyệt yêu cầu');
              }
            } catch (error) {
              console.error('[AdminWithdrawals] Approve error:', error);
              Alert.alert('Lỗi', 'Không thể duyệt yêu cầu rút tiền');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleComplete = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setTransactionRef('');
    setShowCompleteModal(true);
  };

  const confirmComplete = async () => {
    if (!transactionRef.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã giao dịch ngân hàng');
      return;
    }

    try {
      setProcessing(true);

      const { data, error } = await supabase.rpc('admin_complete_withdrawal', {
        withdrawal_id_param: selectedWithdrawal.id,
        admin_id_param: user.id,
        transaction_ref_param: transactionRef.trim(),
      });

      if (error) throw error;

      if (data?.success) {
        setShowCompleteModal(false);
        Alert.alert('Thành công', 'Đã hoàn tất chuyển tiền!', [
          { text: 'OK', onPress: () => loadWithdrawals() },
        ]);
      } else {
        Alert.alert('Lỗi', data?.error || 'Không thể hoàn tất');
      }
    } catch (error) {
      console.error('[AdminWithdrawals] Complete error:', error);
      Alert.alert('Lỗi', 'Không thể hoàn tất yêu cầu');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setProcessing(true);

      const { data, error } = await supabase.rpc('admin_reject_withdrawal', {
        withdrawal_id_param: selectedWithdrawal.id,
        admin_id_param: user.id,
        rejection_reason_param: rejectionReason.trim(),
      });

      if (error) throw error;

      if (data?.success) {
        setShowRejectModal(false);
        Alert.alert('Thành công', 'Đã từ chối yêu cầu. Số tiền đã được hoàn lại.', [
          { text: 'OK', onPress: () => loadWithdrawals() },
        ]);
      } else {
        Alert.alert('Lỗi', data?.error || 'Không thể từ chối');
      }
    } catch (error) {
      console.error('[AdminWithdrawals] Reject error:', error);
      Alert.alert('Lỗi', 'Không thể từ chối yêu cầu');
    } finally {
      setProcessing(false);
    }
  };

  const renderWithdrawal = (withdrawal) => {
    const isExpanded = expandedId === withdrawal.id;
    const profile = withdrawal.profiles;

    return (
      <View key={withdrawal.id} style={styles.withdrawalCard}>
        {/* Header */}
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setExpandedId(isExpanded ? null : withdrawal.id)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeaderLeft}>
            <View style={styles.amountContainer}>
              <DollarSign size={20} color="#4CAF50" />
              <Text style={styles.amountText}>{formatCurrency(withdrawal.amount)}</Text>
            </View>
            <Text style={styles.partnerName}>
              {profile?.full_name || 'Unknown'}
            </Text>
          </View>
          <View style={styles.cardHeaderRight}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(withdrawal.status)}20` },
              ]}
            >
              {getStatusIcon(withdrawal.status)}
              <Text
                style={[styles.statusText, { color: getStatusColor(withdrawal.status) }]}
              >
                {getStatusText(withdrawal.status)}
              </Text>
            </View>
            {isExpanded ? (
              <ChevronUp size={20} color={COLORS.textMuted} />
            ) : (
              <ChevronDown size={20} color={COLORS.textMuted} />
            )}
          </View>
        </TouchableOpacity>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.cardDetails}>
            {/* Partner Info */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Thông tin Partner</Text>
              <View style={styles.detailRow}>
                <User size={16} color={COLORS.textMuted} />
                <Text style={styles.detailText}>{profile?.full_name}</Text>
              </View>
              <View style={styles.detailRow}>
                <CreditCard size={16} color={COLORS.textMuted} />
                <Text style={styles.detailText}>
                  Mã: {profile?.affiliate_code || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <User size={16} color={COLORS.textMuted} />
                <Text style={styles.detailText}>
                  Loại: {profile?.partnership_role?.toUpperCase() || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Bank Info */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Thông tin ngân hàng</Text>
              <View style={styles.detailRow}>
                <Building2 size={16} color={COLORS.textMuted} />
                <Text style={styles.detailText}>{withdrawal.bank_name}</Text>
              </View>
              <View style={styles.detailRow}>
                <CreditCard size={16} color={COLORS.textMuted} />
                <Text style={styles.detailText}>STK: {withdrawal.account_number}</Text>
              </View>
              <View style={styles.detailRow}>
                <User size={16} color={COLORS.textMuted} />
                <Text style={styles.detailText}>
                  Chủ TK: {withdrawal.account_holder_name}
                </Text>
              </View>
            </View>

            {/* Timeline */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Timeline</Text>
              <View style={styles.detailRow}>
                <Calendar size={16} color={COLORS.textMuted} />
                <Text style={styles.detailText}>
                  Yêu cầu: {formatDate(withdrawal.created_at)}
                </Text>
              </View>
              {withdrawal.approved_at && (
                <View style={styles.detailRow}>
                  <Check size={16} color="#2196F3" />
                  <Text style={styles.detailText}>
                    Duyệt: {formatDate(withdrawal.approved_at)}
                  </Text>
                </View>
              )}
              {withdrawal.completed_at && (
                <View style={styles.detailRow}>
                  <CheckCircle2 size={16} color="#4CAF50" />
                  <Text style={styles.detailText}>
                    Hoàn tất: {formatDate(withdrawal.completed_at)}
                  </Text>
                </View>
              )}
              {withdrawal.rejected_at && (
                <View style={styles.detailRow}>
                  <XCircle size={16} color="#FF5252" />
                  <Text style={styles.detailText}>
                    Từ chối: {formatDate(withdrawal.rejected_at)}
                  </Text>
                </View>
              )}
            </View>

            {/* Transaction Reference */}
            {withdrawal.transaction_reference && (
              <View style={[styles.sectionCard, styles.refCard]}>
                <Text style={styles.refLabel}>Mã giao dịch:</Text>
                <Text style={styles.refValue}>{withdrawal.transaction_reference}</Text>
              </View>
            )}

            {/* Rejection Reason */}
            {withdrawal.status === 'rejected' && withdrawal.rejection_reason && (
              <View style={[styles.sectionCard, styles.rejectionCard]}>
                <Text style={styles.rejectionLabel}>Lý do từ chối:</Text>
                <Text style={styles.rejectionText}>{withdrawal.rejection_reason}</Text>
              </View>
            )}

            {/* Action Buttons */}
            {withdrawal.status === 'pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => handleReject(withdrawal)}
                  disabled={processing}
                >
                  <X size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>Từ chối</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={() => handleApprove(withdrawal)}
                  disabled={processing}
                >
                  <Check size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>Duyệt</Text>
                </TouchableOpacity>
              </View>
            )}

            {(withdrawal.status === 'approved' || withdrawal.status === 'processing') && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => handleReject(withdrawal)}
                  disabled={processing}
                >
                  <X size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>Từ chối</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.completeBtn]}
                  onPress={() => handleComplete(withdrawal)}
                  disabled={processing}
                >
                  <CheckCircle2 size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>Hoàn tất</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <View style={styles.accessDenied}>
            <Text style={styles.accessDeniedText}>Không có quyền truy cập</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xử Lý Rút Tiền</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterTabs}
        >
          {['pending', 'approved', 'processing', 'completed', 'rejected', 'all'].map(
            (f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterTab, filter === f && styles.filterTabActive]}
                onPress={() => setFilter(f)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    filter === f && styles.filterTabTextActive,
                  ]}
                >
                  {f === 'pending'
                    ? 'Chờ duyệt'
                    : f === 'approved'
                    ? 'Đã duyệt'
                    : f === 'processing'
                    ? 'Đang xử lý'
                    : f === 'completed'
                    ? 'Hoàn tất'
                    : f === 'rejected'
                    ? 'Từ chối'
                    : 'Tất cả'}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#FFD700"
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {withdrawals.length === 0 ? (
              <View style={styles.emptyState}>
                <CreditCard size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Không có yêu cầu rút tiền</Text>
              </View>
            ) : (
              withdrawals.map(renderWithdrawal)
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}

        {/* Reject Modal */}
        <Modal
          visible={showRejectModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowRejectModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Từ chối yêu cầu rút tiền</Text>
              <Text style={styles.modalSubtitle}>
                Số tiền: {formatCurrency(selectedWithdrawal?.amount || 0)}
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Nhập lý do từ chối..."
                placeholderTextColor={COLORS.textMuted}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalCancelBtn]}
                  onPress={() => setShowRejectModal(false)}
                  disabled={processing}
                >
                  <Text style={styles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalRejectBtn]}
                  onPress={confirmReject}
                  disabled={processing}
                >
                  {processing ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Xác nhận</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Complete Modal */}
        <Modal
          visible={showCompleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCompleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Hoàn tất chuyển tiền</Text>
              <Text style={styles.modalSubtitle}>
                Số tiền: {formatCurrency(selectedWithdrawal?.amount || 0)}
              </Text>

              <View style={styles.bankInfoModal}>
                <Text style={styles.bankLabel}>Ngân hàng:</Text>
                <Text style={styles.bankValue}>{selectedWithdrawal?.bank_name}</Text>
                <Text style={styles.bankLabel}>Số TK:</Text>
                <Text style={styles.bankValue}>{selectedWithdrawal?.account_number}</Text>
                <Text style={styles.bankLabel}>Chủ TK:</Text>
                <Text style={styles.bankValue}>
                  {selectedWithdrawal?.account_holder_name}
                </Text>
              </View>

              <TextInput
                style={[styles.modalInput, { minHeight: 50 }]}
                placeholder="Nhập mã giao dịch ngân hàng..."
                placeholderTextColor={COLORS.textMuted}
                value={transactionRef}
                onChangeText={setTransactionRef}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalCancelBtn]}
                  onPress={() => setShowCompleteModal(false)}
                  disabled={processing}
                >
                  <Text style={styles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalCompleteBtn]}
                  onPress={confirmComplete}
                  disabled={processing}
                >
                  {processing ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Xác nhận</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD700',
  },
  filterScroll: {
    maxHeight: 50,
  },
  filterTabs: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
  },
  filterTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterTabActive: {
    backgroundColor: '#FFD700',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  filterTabTextActive: {
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.huge,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessDeniedText: {
    fontSize: 18,
    color: COLORS.error,
  },

  // Withdrawal Card
  withdrawalCard: {
    backgroundColor: GLASS.background,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amountText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  partnerName: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Card Details
  cardDetails: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#FFF',
  },
  refCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  refLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  refValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  rejectionCard: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
  },
  rejectionLabel: {
    fontSize: 12,
    color: '#FF5252',
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 14,
    color: '#FF8A80',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  rejectBtn: {
    backgroundColor: '#FF5252',
  },
  approveBtn: {
    backgroundColor: '#2196F3',
  },
  completeBtn: {
    backgroundColor: '#4CAF50',
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    color: '#FFF',
    fontSize: 15,
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bankInfoModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  bankLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  bankValue: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: SPACING.lg,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalRejectBtn: {
    backgroundColor: '#FF5252',
  },
  modalCompleteBtn: {
    backgroundColor: '#4CAF50',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default AdminWithdrawalsScreen;
