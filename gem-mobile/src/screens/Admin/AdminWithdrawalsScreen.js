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
  TextInput,
  Modal,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
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
import { processWithdrawal, getPendingWithdrawRequests, getAllWithdrawRequests } from '../../services/withdrawService';

const AdminWithdrawalsScreen = ({ navigation }) => {
  const { user, isAdmin } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();
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
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tải danh sách yêu cầu rút tiền',
        buttons: [{ text: 'OK' }],
      });
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
    alert({
      type: 'warning',
      title: 'Xác nhận duyệt',
      message: `Duyệt yêu cầu rút ${formatCurrency(withdrawal.amount)}?`,
      buttons: [
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
                alert({
                  type: 'success',
                  title: 'Thành công',
                  message: 'Đã duyệt yêu cầu rút tiền',
                  buttons: [{ text: 'OK', onPress: () => loadWithdrawals() }],
                });
              } else {
                alert({
                  type: 'error',
                  title: 'Lỗi',
                  message: data?.error || 'Không thể duyệt yêu cầu',
                  buttons: [{ text: 'OK' }],
                });
              }
            } catch (error) {
              console.error('[AdminWithdrawals] Approve error:', error);
              alert({
                type: 'error',
                title: 'Lỗi',
                message: 'Không thể duyệt yêu cầu rút tiền',
                buttons: [{ text: 'OK' }],
              });
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    });
  };

  const handleComplete = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setTransactionRef('');
    setShowCompleteModal(true);
  };

  const confirmComplete = async () => {
    if (!transactionRef.trim()) {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Vui lòng nhập mã giao dịch ngân hàng',
        buttons: [{ text: 'OK' }],
      });
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
        alert({
          type: 'success',
          title: 'Thành công',
          message: 'Đã hoàn tất chuyển tiền!',
          buttons: [{ text: 'OK', onPress: () => loadWithdrawals() }],
        });
      } else {
        alert({
          type: 'error',
          title: 'Lỗi',
          message: data?.error || 'Không thể hoàn tất',
          buttons: [{ text: 'OK' }],
        });
      }
    } catch (error) {
      console.error('[AdminWithdrawals] Complete error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể hoàn tất yêu cầu',
        buttons: [{ text: 'OK' }],
      });
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
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Vui lòng nhập lý do từ chối',
        buttons: [{ text: 'OK' }],
      });
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
        alert({
          type: 'success',
          title: 'Thành công',
          message: 'Đã từ chối yêu cầu. Số tiền đã được hoàn lại.',
          buttons: [{ text: 'OK', onPress: () => loadWithdrawals() }],
        });
      } else {
        alert({
          type: 'error',
          title: 'Lỗi',
          message: data?.error || 'Không thể từ chối',
          buttons: [{ text: 'OK' }],
        });
      }
    } catch (error) {
      console.error('[AdminWithdrawals] Reject error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể từ chối yêu cầu',
        buttons: [{ text: 'OK' }],
      });
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

        {AlertComponent}
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.gold,
  },
  filterScroll: {
    maxHeight: 44,
  },
  filterTabs: {
    paddingHorizontal: SPACING.md,
    gap: 6,
  },
  filterTab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterTabActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderColor: COLORS.purple,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  filterTabTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
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
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.huge,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessDeniedText: {
    fontSize: 16,
    color: COLORS.error,
  },

  // Withdrawal Card
  withdrawalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    marginBottom: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gold,
  },
  partnerName: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Card Details
  cardDetails: {
    padding: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gold,
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#FFF',
  },
  refCard: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  refLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  refValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
  },
  rejectionCard: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
  },
  rejectionLabel: {
    fontSize: 10,
    color: '#FF5252',
    marginBottom: 2,
  },
  rejectionText: {
    fontSize: 12,
    color: '#FF8A80',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  rejectBtn: {
    backgroundColor: COLORS.burgundy,
  },
  approveBtn: {
    backgroundColor: 'rgba(106, 91, 255, 0.3)',
  },
  completeBtn: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.gold,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: SPACING.sm,
    color: '#FFF',
    fontSize: 13,
    minHeight: 80,
  },
  bankInfoModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  bankLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bankValue: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: SPACING.md,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalRejectBtn: {
    backgroundColor: COLORS.burgundy,
  },
  modalCompleteBtn: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default AdminWithdrawalsScreen;
