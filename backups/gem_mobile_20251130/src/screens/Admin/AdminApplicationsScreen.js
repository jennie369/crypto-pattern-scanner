/**
 * Gemral - Admin Applications Screen
 * Review and manage partnership applications (Affiliate & CTV)
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

const AdminApplicationsScreen = ({ navigation }) => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [expandedId, setExpandedId] = useState(null);

  // Rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingApp, setRejectingApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadApplications();
    }
  }, [isAdmin, filter]);

  const loadApplications = async () => {
    try {
      setLoading(true);

      // Query applications first
      let query = supabase
        .from('partnership_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: applications, error } = await query;

      if (error) throw error;

      // Get unique user IDs and fetch profiles separately
      const userIds = [...new Set((applications || []).map(a => a.user_id).filter(Boolean))];

      let profilesMap = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('id', userIds);

        profilesMap = (profiles || []).reduce((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {});
      }

      // Merge profile data into applications
      const enrichedApplications = (applications || []).map(app => ({
        ...app,
        profiles: profilesMap[app.user_id] || null,
      }));

      setApplications(enrichedApplications);
    } catch (error) {
      console.error('[AdminApplications] Error loading:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn đăng ký');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadApplications();
  };

  const handleApprove = async (application) => {
    Alert.alert(
      'Xác nhận duyệt',
      `Duyệt đơn đăng ký ${application.application_type.toUpperCase()} của ${application.full_name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Duyệt',
          style: 'default',
          onPress: async () => {
            try {
              setProcessing(true);

              // Call approve function
              const { data, error } = await supabase.rpc('approve_partnership_application', {
                application_id_param: application.id,
                admin_id_param: user.id,
                admin_notes_param: null,
              });

              if (error) throw error;

              if (data?.success) {
                // Gửi notification cho user
                try {
                  await supabase.functions.invoke('partnership-notifications', {
                    body: {
                      event_type: 'partnership_approved',
                      user_id: application.user_id,
                      data: {
                        partner_type: application.application_type,
                        ctv_tier: application.application_type === 'ctv' ? 'beginner' : null,
                        affiliate_code: data.affiliate_code,
                      },
                    },
                  });
                  console.log('[AdminApplications] Notification sent');
                } catch (notifError) {
                  console.error('[AdminApplications] Notification error:', notifError);
                  // Không throw lỗi vì approve đã thành công
                }

                Alert.alert(
                  'Thành công',
                  `Đã duyệt đơn đăng ký!\nMã Affiliate: ${data.affiliate_code}`,
                  [{ text: 'OK', onPress: () => loadApplications() }]
                );
              } else {
                Alert.alert('Lỗi', data?.error || 'Không thể duyệt đơn');
              }
            } catch (error) {
              console.error('[AdminApplications] Approve error:', error);
              Alert.alert('Lỗi', 'Không thể duyệt đơn đăng ký');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = (application) => {
    setRejectingApp(application);
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

      const { data, error } = await supabase.rpc('reject_partnership_application', {
        application_id_param: rejectingApp.id,
        admin_id_param: user.id,
        rejection_reason_param: rejectionReason.trim(),
      });

      if (error) throw error;

      if (data?.success) {
        setShowRejectModal(false);
        Alert.alert('Thành công', 'Đã từ chối đơn đăng ký', [
          { text: 'OK', onPress: () => loadApplications() },
        ]);
      } else {
        Alert.alert('Lỗi', data?.error || 'Không thể từ chối đơn');
      }
    } catch (error) {
      console.error('[AdminApplications] Reject error:', error);
      Alert.alert('Lỗi', 'Không thể từ chối đơn đăng ký');
    } finally {
      setProcessing(false);
    }
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
      case 'rejected':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  const renderApplication = (app) => {
    const isExpanded = expandedId === app.id;

    return (
      <View key={app.id} style={styles.applicationCard}>
        {/* Header */}
        <TouchableOpacity
          style={styles.appHeader}
          onPress={() => setExpandedId(isExpanded ? null : app.id)}
          activeOpacity={0.7}
        >
          <View style={styles.appHeaderLeft}>
            <View
              style={[
                styles.appTypeBadge,
                {
                  backgroundColor:
                    app.application_type === 'ctv'
                      ? 'rgba(156, 39, 176, 0.2)'
                      : 'rgba(33, 150, 243, 0.2)',
                },
              ]}
            >
              <Text
                style={[
                  styles.appTypeText,
                  {
                    color: app.application_type === 'ctv' ? '#9C27B0' : '#2196F3',
                  },
                ]}
              >
                {app.application_type.toUpperCase()}
              </Text>
            </View>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>{app.full_name}</Text>
              <Text style={styles.appEmail}>{app.email}</Text>
            </View>
          </View>
          <View style={styles.appHeaderRight}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(app.status)}20` },
              ]}
            >
              <Text style={[styles.statusText, { color: getStatusColor(app.status) }]}>
                {getStatusText(app.status)}
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
          <View style={styles.appDetails}>
            <View style={styles.detailRow}>
              <Mail size={16} color={COLORS.textMuted} />
              <Text style={styles.detailText}>{app.email}</Text>
            </View>
            {app.phone && (
              <View style={styles.detailRow}>
                <Phone size={16} color={COLORS.textMuted} />
                <Text style={styles.detailText}>{app.phone}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Calendar size={16} color={COLORS.textMuted} />
              <Text style={styles.detailText}>Ngày gửi: {formatDate(app.created_at)}</Text>
            </View>

            {/* CTV specific fields */}
            {app.application_type === 'ctv' && (
              <>
                {app.courses_owned && app.courses_owned.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Khóa học đã mua:</Text>
                    <Text style={styles.detailValue}>
                      {app.courses_owned.join(', ')}
                    </Text>
                  </View>
                )}
                {app.reason_for_joining && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Lý do tham gia:</Text>
                    <Text style={styles.detailValue}>{app.reason_for_joining}</Text>
                  </View>
                )}
                {app.marketing_channels && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Kênh marketing:</Text>
                    <Text style={styles.detailValue}>{app.marketing_channels}</Text>
                  </View>
                )}
                {app.estimated_monthly_sales && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Dự kiến doanh số/tháng:</Text>
                    <Text style={styles.detailValue}>{app.estimated_monthly_sales}</Text>
                  </View>
                )}
              </>
            )}

            {/* Rejection reason */}
            {app.status === 'rejected' && app.rejection_reason && (
              <View style={[styles.detailSection, styles.rejectionSection]}>
                <Text style={styles.rejectionLabel}>Lý do từ chối:</Text>
                <Text style={styles.rejectionText}>{app.rejection_reason}</Text>
              </View>
            )}

            {/* Actions for pending applications */}
            {app.status === 'pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => handleReject(app)}
                  disabled={processing}
                >
                  <X size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>Từ chối</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={() => handleApprove(app)}
                  disabled={processing}
                >
                  <Check size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>Duyệt</Text>
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
          <Text style={styles.headerTitle}>Duyệt Đơn Đăng Ký</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {['pending', 'approved', 'rejected', 'all'].map((f) => (
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
                  : f === 'rejected'
                  ? 'Từ chối'
                  : 'Tất cả'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
            {applications.length === 0 ? (
              <View style={styles.emptyState}>
                <FileText size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Không có đơn đăng ký nào</Text>
              </View>
            ) : (
              applications.map(renderApplication)
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}

        {/* Rejection Modal */}
        <Modal
          visible={showRejectModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowRejectModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Từ chối đơn đăng ký</Text>
              <Text style={styles.modalSubtitle}>
                Từ chối đơn của: {rejectingApp?.full_name}
              </Text>

              <TextInput
                style={styles.reasonInput}
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
                  style={[styles.modalBtn, styles.modalConfirmBtn]}
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
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
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

  // Application Card
  applicationCard: {
    backgroundColor: GLASS.background,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  appHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: SPACING.sm,
  },
  appTypeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  appEmail: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  appHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Details
  appDetails: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailSection: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#FFF',
  },
  rejectionSection: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
  },
  rejectionLabel: {
    color: '#FF5252',
  },
  rejectionText: {
    color: '#FF8A80',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: SPACING.md,
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
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  reasonInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    color: '#FFF',
    fontSize: 15,
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  modalConfirmBtn: {
    backgroundColor: '#FF5252',
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

export default AdminApplicationsScreen;
