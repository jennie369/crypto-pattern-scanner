/**
 * Gemral - Grant Access Screen
 * Admin tool to grant course access to users
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Search,
  User,
  BookOpen,
  Check,
  X,
  Clock,
  Gift,
  ShoppingBag,
  Shield,
} from 'lucide-react-native';

import { supabase } from '../../../services/supabase';
import { courseAccessService } from '../../../services/courseAccessService';
import { useAuth } from '../../../contexts/AuthContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const ACCESS_TYPES = [
  { value: 'admin_grant', label: 'Admin cấp', icon: Shield, color: COLORS.gold },
  { value: 'gift', label: 'Quà tặng', icon: Gift, color: COLORS.success },
  { value: 'purchase', label: 'Mua hàng', icon: ShoppingBag, color: '#6A5BFF' },
];

const GrantAccessScreen = ({ navigation, route }) => {
  const { courseId: preselectedCourseId } = route.params || {};
  const { user, isAdmin } = useAuth();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(preselectedCourseId || null);
  const [accessType, setAccessType] = useState('admin_grant');
  const [durationDays, setDurationDays] = useState('');
  const [isLifetime, setIsLifetime] = useState(true);

  // UI state
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [granting, setGranting] = useState(false);

  // Load courses
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, thumbnail_url, tier_required, price')
        .order('title', { ascending: true });

      if (error) throw error;
      setCourses(data || []);

      if (preselectedCourseId) {
        setSelectedCourse(preselectedCourseId);
      }
    } catch (error) {
      console.error('[GrantAccessScreen] loadCourses error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  // Search users
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);

    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await courseAccessService.searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('[GrantAccessScreen] search error:', error);
    } finally {
      setSearching(false);
    }
  }, []);

  // Toggle user selection
  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  // Grant access
  const handleGrantAccess = async () => {
    if (!selectedCourse) {
      Alert.alert('Lỗi', 'Vui lòng chọn khóa học');
      return;
    }

    if (selectedUsers.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một người dùng');
      return;
    }

    const duration = isLifetime ? null : parseInt(durationDays) || null;

    Alert.alert(
      'Xác nhận',
      `Cấp quyền truy cập khóa học cho ${selectedUsers.length} người dùng?\n\nThời hạn: ${isLifetime ? 'Vĩnh viễn' : `${duration} ngày`}`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Cấp quyền',
          onPress: async () => {
            try {
              setGranting(true);

              const userIds = selectedUsers.map(u => u.id);
              const results = await courseAccessService.batchGrantAccess(
                userIds,
                selectedCourse,
                {
                  accessType,
                  durationDays: duration,
                  grantedBy: user?.id,
                }
              );

              const successCount = results.filter(r => r.success).length;
              const failCount = results.length - successCount;

              if (failCount > 0) {
                Alert.alert(
                  'Kết quả',
                  `Thành công: ${successCount}\nThất bại: ${failCount}`
                );
              } else {
                Alert.alert('Thành công', `Đã cấp quyền cho ${successCount} người dùng`);
              }

              // Clear selection
              setSelectedUsers([]);
              setSearchQuery('');
              setSearchResults([]);
            } catch (error) {
              console.error('[GrantAccessScreen] grantAccess error:', error);
              Alert.alert('Lỗi', 'Không thể cấp quyền truy cập');
            } finally {
              setGranting(false);
            }
          }
        }
      ]
    );
  };

  // Render course selector
  const renderCourseSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Chọn khóa học</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.coursesList}
      >
        {courses.map(course => (
          <TouchableOpacity
            key={course.id}
            style={[
              styles.courseCard,
              selectedCourse === course.id && styles.courseCardSelected
            ]}
            onPress={() => setSelectedCourse(course.id)}
          >
            <BookOpen
              size={20}
              color={selectedCourse === course.id ? COLORS.gold : COLORS.textMuted}
            />
            <Text
              style={[
                styles.courseCardTitle,
                selectedCourse === course.id && styles.courseCardTitleSelected
              ]}
              numberOfLines={2}
            >
              {course.title}
            </Text>
            {selectedCourse === course.id && (
              <View style={styles.selectedBadge}>
                <Check size={14} color="#000" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render access type selector
  const renderAccessTypeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Loại truy cập</Text>
      <View style={styles.accessTypeRow}>
        {ACCESS_TYPES.map(type => {
          const TypeIcon = type.icon;
          const isSelected = accessType === type.value;
          return (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.accessTypeBtn,
                isSelected && { borderColor: type.color }
              ]}
              onPress={() => setAccessType(type.value)}
            >
              <TypeIcon size={20} color={isSelected ? type.color : COLORS.textMuted} />
              <Text style={[
                styles.accessTypeText,
                isSelected && { color: type.color }
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // Render duration selector
  const renderDurationSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Thời hạn</Text>
      <View style={styles.durationRow}>
        <TouchableOpacity
          style={[
            styles.durationOption,
            isLifetime && styles.durationOptionSelected
          ]}
          onPress={() => setIsLifetime(true)}
        >
          <Text style={[
            styles.durationOptionText,
            isLifetime && styles.durationOptionTextSelected
          ]}>
            Vĩnh viễn
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.durationOption,
            !isLifetime && styles.durationOptionSelected
          ]}
          onPress={() => setIsLifetime(false)}
        >
          <Text style={[
            styles.durationOptionText,
            !isLifetime && styles.durationOptionTextSelected
          ]}>
            Có thời hạn
          </Text>
        </TouchableOpacity>
      </View>

      {!isLifetime && (
        <View style={styles.durationInputRow}>
          <Clock size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.durationInput}
            value={durationDays}
            onChangeText={setDurationDays}
            placeholder="Số ngày"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
          />
          <Text style={styles.durationLabel}>ngày</Text>
        </View>
      )}
    </View>
  );

  // Render user search
  const renderUserSearch = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tìm người dùng</Text>

      {/* Search Input */}
      <View style={styles.searchInputWrapper}>
        <Search size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Tìm theo email hoặc tên..."
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
        />
        {searching && <ActivityIndicator size="small" color={COLORS.gold} />}
      </View>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          {searchResults.map(user => {
            const isSelected = selectedUsers.some(u => u.id === user.id);
            return (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.userItem,
                  isSelected && styles.userItemSelected
                ]}
                onPress={() => toggleUserSelection(user)}
              >
                <View style={styles.userAvatar}>
                  <User size={20} color={COLORS.textMuted} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {user.full_name || user.username || 'Chưa đặt tên'}
                  </Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                {isSelected ? (
                  <View style={styles.userSelectedIcon}>
                    <Check size={16} color="#000" />
                  </View>
                ) : (
                  <View style={styles.userSelectIcon} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <View style={styles.selectedUsersSection}>
          <Text style={styles.selectedUsersTitle}>
            Đã chọn ({selectedUsers.length})
          </Text>
          <View style={styles.selectedUsersList}>
            {selectedUsers.map(user => (
              <View key={user.id} style={styles.selectedUserChip}>
                <Text style={styles.selectedUserChipText}>
                  {user.full_name || user.email}
                </Text>
                <TouchableOpacity onPress={() => toggleUserSelection(user)}>
                  <X size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cấp quyền truy cập</Text>
            <View style={{ width: 44 }} />
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderCourseSelector()}
            {renderAccessTypeSelector()}
            {renderDurationSelector()}
            {renderUserSearch()}

            {/* Grant Button */}
            <TouchableOpacity
              style={[
                styles.grantBtn,
                (!selectedCourse || selectedUsers.length === 0) && styles.grantBtnDisabled
              ]}
              onPress={handleGrantAccess}
              disabled={!selectedCourse || selectedUsers.length === 0 || granting}
            >
              {granting ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Shield size={20} color="#000" />
                  <Text style={styles.grantBtnText}>
                    Cấp quyền cho {selectedUsers.length} người
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Bottom Spacer */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
  },

  // Sections
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  // Course Selector
  coursesList: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  courseCard: {
    width: 120,
    padding: SPACING.md,
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 12,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  courseCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  courseCardTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  courseCardTitleSelected: {
    color: COLORS.textPrimary,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Access Type
  accessTypeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  accessTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 12,
  },
  accessTypeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Duration
  durationRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  durationOption: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 12,
    alignItems: 'center',
  },
  durationOptionSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  durationOptionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  durationOptionTextSelected: {
    color: COLORS.gold,
  },
  durationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 12,
    padding: SPACING.md,
  },
  durationInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  durationLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },

  // Search
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  searchResults: {
    marginTop: SPACING.sm,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GLASS.border,
    overflow: 'hidden',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: GLASS.border,
  },
  userItemSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  userSelectIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
  },
  userSelectedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Selected Users
  selectedUsersSection: {
    marginTop: SPACING.md,
  },
  selectedUsersTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  selectedUsersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  selectedUserChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
  },

  // Grant Button
  grantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.md,
  },
  grantBtnDisabled: {
    opacity: 0.5,
  },
  grantBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: '#000',
  },
});

export default GrantAccessScreen;
