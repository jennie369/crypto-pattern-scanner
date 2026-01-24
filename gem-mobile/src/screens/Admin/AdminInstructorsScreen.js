/**
 * AdminInstructorsScreen
 * Manage instructor applications and approved instructors
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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  Users,
  Calendar,
  Star,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING } from '../../utils/tokens';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_CONFIG = {
  pending: { label: 'Chờ duyệt', color: '#F59E0B', icon: Clock },
  reviewing: { label: 'Đang xem', color: '#3B82F6', icon: Clock },
  interview_scheduled: { label: 'Lịch phỏng vấn', color: '#8B5CF6', icon: Calendar },
  approved: { label: 'Đã duyệt', color: '#10B981', icon: CheckCircle },
  rejected: { label: 'Từ chối', color: '#EF4444', icon: XCircle },
};

const FILTER_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'rejected', label: 'Từ chối' },
];

const AdminInstructorsScreen = ({ navigation }) => {
  const { isAdmin, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [processing, setProcessing] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (isAdmin) {
        loadApplications();
      }
    }, [isAdmin, filter])
  );

  const loadApplications = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('instructor_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('[AdminInstructors] Load error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách giảng viên');
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
      'Phê duyệt Giảng viên',
      `Xác nhận phê duyệt ${application.full_name} làm Giảng viên?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Phê duyệt',
          onPress: async () => {
            try {
              setProcessing(application.id);
              const { error } = await supabase
                .from('instructor_applications')
                .update({
                  status: 'approved',
                  reviewed_by: user?.id,
                  reviewed_at: new Date().toISOString(),
                  approved_tier: 'standard',
                  approved_revenue_share: 50,
                })
                .eq('id', application.id);

              if (error) throw error;
              Alert.alert('Thành công', 'Đã phê duyệt Giảng viên');
              loadApplications();
            } catch (error) {
              console.error('[AdminInstructors] Approve error:', error);
              Alert.alert('Lỗi', 'Không thể phê duyệt');
            } finally {
              setProcessing(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (application) => {
    Alert.alert(
      'Từ chối Giảng viên',
      `Từ chối đơn đăng ký của ${application.full_name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(application.id);
              const { error } = await supabase
                .from('instructor_applications')
                .update({
                  status: 'rejected',
                  reviewed_by: user?.id,
                  reviewed_at: new Date().toISOString(),
                })
                .eq('id', application.id);

              if (error) throw error;
              Alert.alert('Đã từ chối', 'Đơn đăng ký đã bị từ chối');
              loadApplications();
            } catch (error) {
              console.error('[AdminInstructors] Reject error:', error);
              Alert.alert('Lỗi', 'Không thể từ chối');
            } finally {
              setProcessing(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatFollowers = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const renderApplication = (app) => {
    const isExpanded = expandedId === app.id;
    const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
    const StatusIcon = statusConfig.icon;
    const isProcessingThis = processing === app.id;

    return (
      <View key={app.id} style={styles.applicationCard}>
        <TouchableOpacity
          style={styles.applicationHeader}
          onPress={() => setExpandedId(isExpanded ? null : app.id)}
          activeOpacity={0.7}
        >
          <View style={styles.applicationInfo}>
            <View style={styles.avatarCircle}>
              <GraduationCap size={24} color="#10B981" />
            </View>
            <View style={styles.applicationMeta}>
              <Text style={styles.applicationName}>{app.full_name}</Text>
              <Text style={styles.applicationEmail}>{app.email}</Text>
              <View style={styles.tagsRow}>
                {app.expertise_areas?.slice(0, 2).map((area, idx) => (
                  <View key={idx} style={styles.expertiseTag}>
                    <Text style={styles.expertiseTagText}>{area}</Text>
                  </View>
                ))}
                {app.expertise_areas?.length > 2 && (
                  <Text style={styles.moreText}>+{app.expertise_areas.length - 2}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.applicationRight}>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
              <StatusIcon size={12} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
            {isExpanded ? (
              <ChevronUp size={20} color={COLORS.textMuted} />
            ) : (
              <ChevronDown size={20} color={COLORS.textMuted} />
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Contact Info */}
            <View style={styles.detailRow}>
              <Phone size={16} color={COLORS.textMuted} />
              <Text style={styles.detailText}>{app.phone || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Mail size={16} color={COLORS.textMuted} />
              <Text style={styles.detailText}>{app.email}</Text>
            </View>

            {/* Experience */}
            <View style={styles.detailRow}>
              <Star size={16} color={COLORS.textMuted} />
              <Text style={styles.detailText}>{app.years_experience || 0} năm kinh nghiệm</Text>
            </View>

            {/* Followers */}
            <View style={styles.detailRow}>
              <Users size={16} color={COLORS.textMuted} />
              <Text style={styles.detailText}>
                {formatFollowers(app.total_followers)} followers
              </Text>
            </View>

            {/* CV Link */}
            {app.cv_url && (
              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => Linking.openURL(app.cv_url)}
              >
                <FileText size={16} color={COLORS.gold} />
                <Text style={styles.linkText}>Xem CV</Text>
                <ExternalLink size={14} color={COLORS.gold} />
              </TouchableOpacity>
            )}

            {/* Proposed Course */}
            {app.proposed_course_title && (
              <View style={styles.proposedCourse}>
                <Text style={styles.proposedLabel}>Khóa học đề xuất:</Text>
                <Text style={styles.proposedTitle}>{app.proposed_course_title}</Text>
                {app.proposed_course_description && (
                  <Text style={styles.proposedDesc} numberOfLines={3}>
                    {app.proposed_course_description}
                  </Text>
                )}
              </View>
            )}

            {/* Bio */}
            {app.bio && (
              <View style={styles.bioSection}>
                <Text style={styles.bioLabel}>Giới thiệu:</Text>
                <Text style={styles.bioText} numberOfLines={4}>{app.bio}</Text>
              </View>
            )}

            {/* Application Date */}
            <View style={styles.dateRow}>
              <Calendar size={14} color={COLORS.textMuted} />
              <Text style={styles.dateText}>Đăng ký: {formatDate(app.created_at)}</Text>
            </View>

            {/* Action Buttons */}
            {app.status === 'pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleReject(app)}
                  disabled={isProcessingThis}
                >
                  {isProcessingThis ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <XCircle size={18} color="#FFF" />
                      <Text style={styles.actionButtonText}>Từ chối</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApprove(app)}
                  disabled={isProcessingThis}
                >
                  {isProcessingThis ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <CheckCircle size={18} color="#FFF" />
                      <Text style={styles.actionButtonText}>Phê duyệt</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (!isAdmin) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <View style={styles.accessDenied}>
            <GraduationCap size={64} color={COLORS.error} />
            <Text style={styles.accessDeniedTitle}>Truy cập bị từ chối</Text>
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerTitleRow}>
              <GraduationCap size={24} color="#10B981" />
              <Text style={styles.headerTitle}>Giảng Viên</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              Quản lý đơn đăng ký giảng viên
            </Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterTab, filter === tab.key && styles.filterTabActive]}
              onPress={() => setFilter(tab.key)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === tab.key && styles.filterTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.gold}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {applications.length === 0 ? (
              <View style={styles.emptyState}>
                <GraduationCap size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Không có đơn đăng ký nào</Text>
              </View>
            ) : (
              applications.map(renderApplication)
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.huge,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.error,
    marginTop: SPACING.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Filter Tabs
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterTabActive: {
    backgroundColor: COLORS.gold,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  filterTabTextActive: {
    color: '#000',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: CONTENT_BOTTOM_PADDING,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 16,
  },

  // Application Card
  applicationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  applicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  applicationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  applicationMeta: {
    flex: 1,
  },
  applicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  applicationEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  expertiseTag: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  expertiseTagText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.gold,
  },
  moreText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  applicationRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Expanded Content
  expandedContent: {
    padding: SPACING.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 10,
    borderRadius: 8,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.gold,
    flex: 1,
  },
  proposedCourse: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  proposedLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  proposedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  proposedDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  bioSection: {
    marginBottom: 12,
  },
  bioLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  bioText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default AdminInstructorsScreen;
