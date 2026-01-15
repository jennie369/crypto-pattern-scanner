/**
 * RITUALS SCREEN
 * Ritual and habit tracking with gamification
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  Check,
  Clock,
  Flame,
  ChevronLeft,
  Calendar,
  Star,
  Trash2,
  Edit3,
  Sun,
  Moon,
  Heart,
  Cloud,
  Sparkles,
  Book,
  Activity,
  Eye,
  Wind,
  X,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { ritualTrackingService, RITUAL_TYPES, MOOD_OPTIONS } from '../../services/ritualTrackingService';
import { streakService } from '../../services/streakService';
import StreakDisplay from '../../components/GemMaster/StreakDisplay';

// Ritual type icons
const RITUAL_ICONS = {
  meditation: Cloud,
  affirmation: Sparkles,
  gratitude: Heart,
  journaling: Book,
  exercise: Activity,
  reading: Book,
  breathing: Wind,
  visualization: Eye,
  custom: Star,
};

const RitualsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayStatus, setTodayStatus] = useState(null);
  const [rituals, setRituals] = useState([]);
  const [gamificationSummary, setGamificationSummary] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedRitual, setSelectedRitual] = useState(null);

  // New ritual form state
  const [newRitual, setNewRitual] = useState({
    name: '',
    description: '',
    ritual_type: RITUAL_TYPES.CUSTOM,
    scheduled_time: '08:00',
    duration_minutes: 10,
  });

  // Completion form state
  const [completionData, setCompletionData] = useState({
    mood_before: null,
    mood_after: null,
    quality_rating: 3,
    notes: '',
  });

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [status, allRituals, gamification] = await Promise.all([
        ritualTrackingService.getTodayStatus(user.id),
        ritualTrackingService.getUserRituals(user.id),
        streakService.getGamificationSummary(user.id),
      ]);

      setTodayStatus(status);
      setRituals(allRituals);
      setGamificationSummary(gamification);
    } catch (error) {
      console.error('[RitualsScreen] loadData error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [user?.id]);

  const handleCreateRitual = async () => {
    if (!newRitual.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên ritual');
      return;
    }

    const created = await ritualTrackingService.createRitual(user.id, newRitual);
    if (created) {
      setShowCreateModal(false);
      setNewRitual({
        name: '',
        description: '',
        ritual_type: RITUAL_TYPES.CUSTOM,
        scheduled_time: '08:00',
        duration_minutes: 10,
      });
      loadData();
    } else {
      Alert.alert('Lỗi', 'Không thể tạo ritual');
    }
  };

  const handleCompleteRitual = async () => {
    if (!selectedRitual) return;

    const result = await ritualTrackingService.completeRitual(
      user.id,
      selectedRitual.ritual_id || selectedRitual.id,
      completionData
    );

    if (result.success) {
      setShowCompleteModal(false);
      setSelectedRitual(null);
      setCompletionData({
        mood_before: null,
        mood_after: null,
        quality_rating: 3,
        notes: '',
      });

      // Show celebration if new badges
      if (result.newBadges?.length > 0) {
        Alert.alert(
          'Chúc mừng!',
          `Bạn đã nhận được huy hiệu: ${result.newBadges.map(b => b.name).join(', ')}`
        );
      }

      loadData();
    }
  };

  const handleDeleteRitual = async (ritual) => {
    Alert.alert(
      'Xóa Ritual',
      `Bạn có chắc muốn xóa "${ritual.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await ritualTrackingService.deleteRitual(ritual.id, user.id);
            loadData();
          },
        },
      ]
    );
  };

  const openCompleteModal = (ritual) => {
    setSelectedRitual(ritual);
    setShowCompleteModal(true);
  };

  const renderRitualIcon = (type, color = '#FFBD59', size = 24) => {
    const IconComponent = RITUAL_ICONS[type] || Star;
    return <IconComponent size={size} color={color} />;
  };

  const renderRitualCard = (ritual, isToday = false) => {
    const isCompleted = isToday ? ritual.is_completed : false;

    return (
      <TouchableOpacity
        key={ritual.ritual_id || ritual.id}
        style={[
          styles.ritualCard,
          isCompleted && styles.ritualCardCompleted,
        ]}
        onPress={() => !isCompleted && openCompleteModal(ritual)}
        onLongPress={() => handleDeleteRitual(ritual)}
      >
        <View style={[styles.ritualIcon, { backgroundColor: `${ritual.color || '#FFBD59'}20` }]}>
          {renderRitualIcon(ritual.ritual_type, ritual.color || '#FFBD59')}
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Check size={12} color="#FFFFFF" />
            </View>
          )}
        </View>

        <View style={styles.ritualInfo}>
          <Text style={[styles.ritualName, isCompleted && styles.completedText]}>
            {ritual.ritual_name || ritual.name}
          </Text>
          <View style={styles.ritualMeta}>
            <Clock size={12} color="#808080" />
            <Text style={styles.ritualTime}>
              {ritual.scheduled_time} - {ritual.duration_minutes || 10} phút
            </Text>
          </View>
        </View>

        {!isCompleted && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => openCompleteModal(ritual)}
          >
            <Check size={20} color="#4CAF50" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rituals</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={24} color="#FFBD59" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFBD59"
          />
        }
      >
        {/* Gamification Summary */}
        {gamificationSummary && (
          <StreakDisplay
            currentStreak={gamificationSummary.currentStreak}
            longestStreak={gamificationSummary.longestStreak}
            level={gamificationSummary.level}
            levelName={gamificationSummary.levelName}
            totalPoints={gamificationSummary.totalPoints}
            progressPercent={gamificationSummary.progressPercent}
            onPress={() => navigation.navigate('Gamification')}
            style={styles.streakCard}
          />
        )}

        {/* Today's Progress */}
        {todayStatus && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={18} color="#FFBD59" />
              <Text style={styles.sectionTitle}>Hôm nay</Text>
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>
                  {todayStatus.completedCount}/{todayStatus.totalCount}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${todayStatus.completionRate}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressPercent}>
                {todayStatus.completionRate}%
              </Text>
            </View>

            {/* Today's Rituals */}
            {todayStatus.rituals?.map((ritual) => renderRitualCard(ritual, true))}

            {todayStatus.rituals?.length === 0 && (
              <Text style={styles.emptyText}>Không có ritual nào hôm nay</Text>
            )}
          </View>
        )}

        {/* All Rituals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sparkles size={18} color="#FFBD59" />
            <Text style={styles.sectionTitle}>Tất cả Rituals</Text>
          </View>

          {rituals.map((ritual) => renderRitualCard(ritual, false))}

          {rituals.length === 0 && (
            <TouchableOpacity
              style={styles.emptyCard}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={32} color="#808080" />
              <Text style={styles.emptyCardText}>Tạo ritual đầu tiên</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo Ritual Mới</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.inputLabel}>Tên Ritual</Text>
              <TextInput
                style={styles.input}
                value={newRitual.name}
                onChangeText={(text) => setNewRitual({ ...newRitual, name: text })}
                placeholder="VD: Thiền buổi sáng"
                placeholderTextColor="#808080"
              />

              <Text style={styles.inputLabel}>Mô tả (tùy chọn)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={newRitual.description}
                onChangeText={(text) => setNewRitual({ ...newRitual, description: text })}
                placeholder="Mô tả ngắn về ritual này"
                placeholderTextColor="#808080"
                multiline
              />

              <Text style={styles.inputLabel}>Loại</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Object.entries(RITUAL_TYPES).map(([key, value]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.typeButton,
                      newRitual.ritual_type === value && styles.typeButtonActive,
                    ]}
                    onPress={() => setNewRitual({ ...newRitual, ritual_type: value })}
                  >
                    {renderRitualIcon(value, newRitual.ritual_type === value ? '#FFBD59' : '#808080', 20)}
                    <Text
                      style={[
                        styles.typeButtonText,
                        newRitual.ritual_type === value && styles.typeButtonTextActive,
                      ]}
                    >
                      {ritualTrackingService.getRitualTypeInfo(value).label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Thời gian</Text>
                  <TextInput
                    style={styles.input}
                    value={newRitual.scheduled_time}
                    onChangeText={(text) => setNewRitual({ ...newRitual, scheduled_time: text })}
                    placeholder="08:00"
                    placeholderTextColor="#808080"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Thời lượng (phút)</Text>
                  <TextInput
                    style={styles.input}
                    value={String(newRitual.duration_minutes)}
                    onChangeText={(text) => setNewRitual({ ...newRitual, duration_minutes: parseInt(text) || 10 })}
                    keyboardType="numeric"
                    placeholderTextColor="#808080"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateRitual}
              >
                <Text style={styles.createButtonText}>Tạo Ritual</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Complete Modal */}
      <Modal
        visible={showCompleteModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCompleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Hoàn thành {selectedRitual?.ritual_name || selectedRitual?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowCompleteModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.inputLabel}>Tâm trạng trước</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {MOOD_OPTIONS.slice(0, 5).map((mood) => (
                  <TouchableOpacity
                    key={mood.value}
                    style={[
                      styles.moodButton,
                      completionData.mood_before === mood.value && styles.moodButtonActive,
                    ]}
                    onPress={() => setCompletionData({ ...completionData, mood_before: mood.value })}
                  >
                    <Text style={styles.moodEmoji}>
                      {mood.value === 'anxious' ? '😰' :
                       mood.value === 'tired' ? '😴' :
                       mood.value === 'neutral' ? '😐' :
                       mood.value === 'focused' ? '🎯' : '😌'}
                    </Text>
                    <Text style={styles.moodLabel}>{mood.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Tâm trạng sau</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {MOOD_OPTIONS.slice(4).map((mood) => (
                  <TouchableOpacity
                    key={mood.value}
                    style={[
                      styles.moodButton,
                      completionData.mood_after === mood.value && styles.moodButtonActive,
                    ]}
                    onPress={() => setCompletionData({ ...completionData, mood_after: mood.value })}
                  >
                    <Text style={styles.moodEmoji}>
                      {mood.value === 'calm' ? '😌' :
                       mood.value === 'energized' ? '⚡' :
                       mood.value === 'peaceful' ? '🕊️' :
                       mood.value === 'grateful' ? '🙏' : '😊'}
                    </Text>
                    <Text style={styles.moodLabel}>{mood.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Đánh giá chất lượng</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setCompletionData({ ...completionData, quality_rating: star })}
                  >
                    <Star
                      size={32}
                      color={star <= completionData.quality_rating ? '#FFD700' : '#404040'}
                      fill={star <= completionData.quality_rating ? '#FFD700' : 'transparent'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Ghi chú (tùy chọn)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={completionData.notes}
                onChangeText={(text) => setCompletionData({ ...completionData, notes: text })}
                placeholder="Cảm nhận của bạn..."
                placeholderTextColor="#808080"
                multiline
              />

              <TouchableOpacity
                style={styles.completeActionButton}
                onPress={handleCompleteRitual}
              >
                <Check size={20} color="#FFFFFF" />
                <Text style={styles.completeActionText}>Hoàn thành</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  streakCard: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  progressBadge: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    color: '#FFBD59',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressPercent: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  ritualCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  ritualCardCompleted: {
    opacity: 0.7,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  ritualIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  completedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ritualInfo: {
    flex: 1,
    marginLeft: 12,
  },
  ritualName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#808080',
  },
  ritualMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ritualTime: {
    color: '#808080',
    fontSize: 12,
    marginLeft: 4,
  },
  completeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#808080',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
  },
  emptyCardText: {
    color: '#808080',
    fontSize: 14,
    marginTop: 8,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  inputLabel: {
    color: '#A0A0A0',
    fontSize: 13,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  typeButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
  },
  typeButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  typeButtonText: {
    color: '#808080',
    fontSize: 11,
    marginTop: 4,
  },
  typeButtonTextActive: {
    color: '#FFBD59',
  },
  moodButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
  },
  moodButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderColor: '#FFBD59',
    borderWidth: 1,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  createButton: {
    backgroundColor: '#FFBD59',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  createButtonText: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: '600',
  },
  completeActionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  completeActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default RitualsScreen;
