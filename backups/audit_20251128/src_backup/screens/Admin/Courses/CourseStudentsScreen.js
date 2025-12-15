/**
 * Gemral - Course Students Screen
 * View enrolled students with progress analytics
 * Sprint 4: Progress & Analytics
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../../utils/tokens';
import courseAccessService from '../../../services/courseAccessService';
import progressService from '../../../services/progressService';

const CourseStudentsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId, courseTitle } = route.params || {};

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('enrolled_at'); // enrolled_at, progress, name
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, expired, completed
  const [courseStats, setCourseStats] = useState(null);

  // Load students and stats
  const loadData = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);

      // Load students with progress
      const studentsData = await courseAccessService.getCourseStudents(courseId);

      // Enhance with progress data
      const studentsWithProgress = await Promise.all(
        studentsData.map(async (student) => {
          try {
            const progress = await progressService.getCourseProgressSummary(
              student.user_id,
              courseId
            );
            return {
              ...student,
              progress: progress?.progress_percent || 0,
              completedLessons: progress?.completed_lessons || 0,
              totalLessons: progress?.total_lessons || 0,
              lastActivity: progress?.last_activity || student.enrolled_at,
            };
          } catch (err) {
            return {
              ...student,
              progress: 0,
              completedLessons: 0,
              totalLessons: 0,
              lastActivity: student.enrolled_at,
            };
          }
        })
      );

      setStudents(studentsWithProgress);
      setFilteredStudents(studentsWithProgress);

      // Load course stats
      const stats = await courseAccessService.getCourseStats(courseId);
      setCourseStats(stats);

    } catch (error) {
      console.error('Error loading students:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách học viên');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter and sort students
  useEffect(() => {
    let result = [...students];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.user_email?.toLowerCase().includes(query) ||
          s.user_name?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      const now = new Date();
      switch (filterStatus) {
        case 'active':
          result = result.filter(
            (s) => !s.expires_at || new Date(s.expires_at) > now
          );
          break;
        case 'expired':
          result = result.filter(
            (s) => s.expires_at && new Date(s.expires_at) <= now
          );
          break;
        case 'completed':
          result = result.filter((s) => s.progress >= 100);
          break;
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case 'progress':
          valueA = a.progress || 0;
          valueB = b.progress || 0;
          break;
        case 'name':
          valueA = a.user_name || a.user_email || '';
          valueB = b.user_name || b.user_email || '';
          return sortOrder === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        case 'enrolled_at':
        default:
          valueA = new Date(a.enrolled_at || 0).getTime();
          valueB = new Date(b.enrolled_at || 0).getTime();
          break;
      }

      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });

    setFilteredStudents(result);
  }, [students, searchQuery, sortBy, sortOrder, filterStatus]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRevokeAccess = (student) => {
    Alert.alert(
      'Thu hồi quyền truy cập',
      `Bạn có chắc muốn thu hồi quyền truy cập khóa học của ${student.user_name || student.user_email}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thu hồi',
          style: 'destructive',
          onPress: async () => {
            try {
              await courseAccessService.revokeAccess(student.user_id, courseId);
              Alert.alert('Thành công', 'Đã thu hồi quyền truy cập');
              loadData();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể thu hồi quyền truy cập');
            }
          },
        },
      ]
    );
  };

  const handleExtendAccess = (student) => {
    Alert.alert(
      'Gia hạn quyền truy cập',
      'Chọn thời gian gia hạn:',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: '30 ngày',
          onPress: () => extendAccess(student, 30),
        },
        {
          text: '90 ngày',
          onPress: () => extendAccess(student, 90),
        },
        {
          text: 'Vĩnh viễn',
          onPress: () => extendAccess(student, null),
        },
      ]
    );
  };

  const extendAccess = async (student, days) => {
    try {
      const expiresAt = days
        ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      await courseAccessService.updateEnrollment(student.user_id, courseId, {
        expires_at: expiresAt,
      });

      Alert.alert('Thành công', 'Đã gia hạn quyền truy cập');
      loadData();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gia hạn quyền truy cập');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getAccessTypeLabel = (type) => {
    const labels = {
      purchase: 'Mua',
      admin_grant: 'Admin cấp',
      gift: 'Tặng',
      trial: 'Dùng thử',
    };
    return labels[type] || type;
  };

  const getAccessTypeColor = (type) => {
    const colors = {
      purchase: '#10B981',
      admin_grant: '#8B5CF6',
      gift: '#F59E0B',
      trial: '#6B7280',
    };
    return colors[type] || '#6B7280';
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) <= new Date();
  };

  const renderStudentCard = ({ item: student }) => {
    const expired = isExpired(student.expires_at);
    const progressPercent = student.progress || 0;

    return (
      <View style={[styles.studentCard, expired && styles.expiredCard]}>
        {/* Header */}
        <View style={styles.studentHeader}>
          <View style={styles.studentInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {(student.user_name || student.user_email || '?')[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.studentDetails}>
              <Text style={styles.studentName}>
                {student.user_name || 'Chưa có tên'}
              </Text>
              <Text style={styles.studentEmail}>{student.user_email}</Text>
            </View>
          </View>

          {/* Access Type Badge */}
          <View
            style={[
              styles.accessTypeBadge,
              { backgroundColor: getAccessTypeColor(student.access_type) + '20' },
            ]}
          >
            <Text
              style={[
                styles.accessTypeText,
                { color: getAccessTypeColor(student.access_type) },
              ]}
            >
              {getAccessTypeLabel(student.access_type)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Tiến độ học</Text>
            <Text style={styles.progressValue}>
              {student.completedLessons}/{student.totalLessons} bài ({progressPercent}%)
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={
                progressPercent >= 100
                  ? ['#10B981', '#059669']
                  : progressPercent >= 50
                  ? ['#F59E0B', '#D97706']
                  : ['#6366F1', '#4F46E5']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBar, { width: `${progressPercent}%` }]}
            />
          </View>
        </View>

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
            <Text style={styles.infoText}>
              Đăng ký: {formatDate(student.enrolled_at)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons
              name={expired ? 'alert-circle' : 'time-outline'}
              size={14}
              color={expired ? '#EF4444' : '#9CA3AF'}
            />
            <Text style={[styles.infoText, expired && styles.expiredText]}>
              {student.expires_at
                ? `Hết hạn: ${formatDate(student.expires_at)}`
                : 'Vĩnh viễn'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleExtendAccess(student)}
          >
            <Ionicons name="add-circle-outline" size={18} color="#10B981" />
            <Text style={[styles.actionText, { color: '#10B981' }]}>Gia hạn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate('StudentProgress', {
                userId: student.user_id,
                courseId,
                userName: student.user_name || student.user_email,
              })
            }
          >
            <Ionicons name="analytics-outline" size={18} color="#6366F1" />
            <Text style={[styles.actionText, { color: '#6366F1' }]}>Chi tiết</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleRevokeAccess(student)}
          >
            <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
            <Text style={[styles.actionText, { color: '#EF4444' }]}>Thu hồi</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Stats Cards */}
      {courseStats && (
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#6366F120' }]}>
            <Ionicons name="people" size={24} color="#6366F1" />
            <Text style={styles.statValue}>{courseStats.total_students || 0}</Text>
            <Text style={styles.statLabel}>Tổng học viên</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#10B98120' }]}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.statValue}>{courseStats.active_students || 0}</Text>
            <Text style={styles.statLabel}>Đang học</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#F59E0B20' }]}>
            <Ionicons name="trophy" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{courseStats.completed_students || 0}</Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm học viên..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {/* Status Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'active', label: 'Còn hạn' },
            { key: 'expired', label: 'Hết hạn' },
            { key: 'completed', label: 'Hoàn thành' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                filterStatus === filter.key && styles.filterChipActive,
              ]}
              onPress={() => setFilterStatus(filter.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterStatus === filter.key && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sắp xếp:</Text>
        <TouchableOpacity
          style={[styles.sortOption, sortBy === 'enrolled_at' && styles.sortOptionActive]}
          onPress={() => {
            if (sortBy === 'enrolled_at') {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('enrolled_at');
              setSortOrder('desc');
            }
          }}
        >
          <Text
            style={[
              styles.sortOptionText,
              sortBy === 'enrolled_at' && styles.sortOptionTextActive,
            ]}
          >
            Ngày đăng ký
          </Text>
          {sortBy === 'enrolled_at' && (
            <Ionicons
              name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
              size={14}
              color="#6366F1"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sortOption, sortBy === 'progress' && styles.sortOptionActive]}
          onPress={() => {
            if (sortBy === 'progress') {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('progress');
              setSortOrder('desc');
            }
          }}
        >
          <Text
            style={[
              styles.sortOptionText,
              sortBy === 'progress' && styles.sortOptionTextActive,
            ]}
          >
            Tiến độ
          </Text>
          {sortBy === 'progress' && (
            <Ionicons
              name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
              size={14}
              color="#6366F1"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sortOption, sortBy === 'name' && styles.sortOptionActive]}
          onPress={() => {
            if (sortBy === 'name') {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('name');
              setSortOrder('asc');
            }
          }}
        >
          <Text
            style={[
              styles.sortOptionText,
              sortBy === 'name' && styles.sortOptionTextActive,
            ]}
          >
            Tên
          </Text>
          {sortBy === 'name' && (
            <Ionicons
              name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
              size={14}
              color="#6366F1"
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Results Count */}
      <Text style={styles.resultsCount}>
        {filteredStudents.length} học viên
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#4B5563" />
      <Text style={styles.emptyTitle}>Chưa có học viên</Text>
      <Text style={styles.emptyText}>
        Khóa học này chưa có học viên nào đăng ký
      </Text>
      <TouchableOpacity
        style={styles.grantButton}
        onPress={() => navigation.navigate('GrantAccess', { courseId, courseTitle })}
      >
        <Ionicons name="person-add" size={20} color="#fff" />
        <Text style={styles.grantButtonText}>Cấp quyền truy cập</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Học viên</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {courseTitle || 'Khóa học'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('GrantAccess', { courseId, courseTitle })}
        >
          <Ionicons name="person-add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentCard}
        keyExtractor={(item) => item.user_id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#9CA3AF',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 20,
  },
  listContent: {
    padding: 16,
  },
  listHeader: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  filtersContainer: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  filterChipText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  filterChipTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sortLabel: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 4,
  },
  sortOptionActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  sortOptionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sortOptionTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  studentCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  expiredCard: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  studentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  studentEmail: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  accessTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accessTypeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  progressValue: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  expiredText: {
    color: '#EF4444',
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  grantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  grantButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default CourseStudentsScreen;
