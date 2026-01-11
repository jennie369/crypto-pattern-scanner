/**
 * ReadingDetailScreen
 * Full view of a saved tarot or I-Ching reading
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  Star,
  Share2,
  Edit3,
  Save,
  Trash2,
  Calendar,
  Layers,
  BookOpen,
  MessageSquare,
  RotateCcw,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS } from '../../utils/tokens';
import readingHistoryService from '../../services/readingHistoryService';
import { getCardImage } from '../../assets/tarot';

const ReadingDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { reading: initialReading, type = 'tarot' } = route.params || {};

  // State
  const [reading, setReading] = useState(initialReading);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(reading?.notes || '');

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('vi-VN', options);
  };

  // Get spread name
  const getSpreadName = () => {
    if (type === 'tarot') {
      return reading?.spread_type || 'Trải bài Tarot';
    }
    return 'Quẻ Kinh Dịch';
  };

  // ========== HANDLERS ==========
  const handleToggleStar = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const { error } = await readingHistoryService.toggleStar(reading?.id, type);
      if (!error) {
        setReading((prev) => ({ ...prev, starred: !prev.starred }));
      }
    } catch (err) {
      console.error('[ReadingDetailScreen] Star error:', err);
    }
  };

  const handleSaveNotes = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const updateFunc = type === 'tarot'
        ? readingHistoryService.updateTarotNotes
        : readingHistoryService.updateIChingNotes;

      const { error } = await updateFunc(reading?.id, notes);
      if (!error) {
        setReading((prev) => ({ ...prev, notes }));
        setIsEditingNotes(false);
        Alert.alert('Đã lưu', 'Ghi chú đã được cập nhật.');
      }
    } catch (err) {
      console.error('[ReadingDetailScreen] Save notes error:', err);
      Alert.alert('Lỗi', 'Không thể lưu ghi chú.');
    }
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      let shareText = '';

      if (type === 'tarot') {
        const cards = reading?.cards || [];
        shareText = `Kết quả Tarot - ${getSpreadName()}\n\n`;
        shareText += `Câu hỏi: ${reading?.question || 'Không có'}\n\n`;
        shareText += `Các lá bài:\n`;
        cards.forEach((card, idx) => {
          const cardName = card?.name_vi || card?.nameVi || card?.name || 'Unknown';
          const isReversed = card?.is_reversed || card?.isReversed;
          shareText += `${idx + 1}. ${cardName}${isReversed ? ' (Ngược)' : ''}\n`;
        });
        if (reading?.interpretations?.summary) {
          shareText += `\nGiải bài:\n${reading.interpretations.summary}\n`;
        }
      } else {
        const hexagram = reading?.present_hexagram;
        shareText = `Kết quả Kinh Dịch\n\n`;
        shareText += `Câu hỏi: ${reading?.question || 'Không có'}\n\n`;
        shareText += `Quẻ: ${hexagram?.name_vi || 'Unknown'}\n`;
        if (reading?.interpretations?.summary) {
          shareText += `\nGiải quẻ:\n${reading.interpretations.summary}\n`;
        }
      }

      shareText += `\n📲 Gemral App`;

      await Share.share({
        message: shareText,
        title: `Kết quả ${type === 'tarot' ? 'Tarot' : 'Kinh Dịch'} - Gemral`,
      });
    } catch (err) {
      console.error('[ReadingDetailScreen] Share error:', err);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa bài đọc',
      'Bạn có chắc muốn xóa bài đọc này? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const deleteFunc = type === 'tarot'
                ? readingHistoryService.deleteTarotReading
                : readingHistoryService.deleteIChingReading;

              const { error } = await deleteFunc(reading?.id);
              if (!error) {
                Alert.alert('Đã xóa', 'Bài đọc đã được xóa.');
                navigation.goBack();
              }
            } catch (err) {
              console.error('[ReadingDetailScreen] Delete error:', err);
              Alert.alert('Lỗi', 'Không thể xóa bài đọc.');
            }
          },
        },
      ]
    );
  };

  // ========== RENDER ==========
  const renderTarotContent = () => {
    const cards = reading?.cards || [];
    const interpretations = reading?.interpretations || {};

    return (
      <>
        {/* Cards Display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Các lá bài</Text>
          <View style={styles.cardsGrid}>
            {cards.map((card, index) => {
              const cardName = card?.name_vi || card?.nameVi || card?.name || 'Unknown';
              const isReversed = card?.is_reversed || card?.isReversed;
              const cardId = card?.card_id || card?.id;
              const cardImage = cardId ? getCardImage(cardId) : null;

              return (
                <View key={index} style={styles.cardItem}>
                  {cardImage ? (
                    <Image
                      source={cardImage}
                      style={[
                        styles.cardImage,
                        isReversed && styles.cardImageReversed,
                      ]}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.cardPlaceholder}>
                      <Layers size={24} color={COLORS.purple} />
                    </View>
                  )}
                  <Text style={styles.cardName} numberOfLines={2}>
                    {cardName}
                  </Text>
                  {isReversed && (
                    <View style={styles.reversedBadge}>
                      <RotateCcw size={10} color={COLORS.warning} />
                      <Text style={styles.reversedText}>Ngược</Text>
                    </View>
                  )}
                  {card?.position && (
                    <Text style={styles.cardPosition}>{card.position}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Interpretation */}
        {interpretations?.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giải bài</Text>
            <View style={styles.interpretationCard}>
              <Text style={styles.interpretationText}>
                {interpretations.summary}
              </Text>
            </View>
          </View>
        )}

        {/* Card Details */}
        {interpretations?.cardReadings && interpretations.cardReadings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết từng lá</Text>
            {interpretations.cardReadings.map((cardReading, idx) => (
              <View key={idx} style={styles.cardReadingItem}>
                <Text style={styles.cardReadingTitle}>
                  {cardReading.position || `Lá ${idx + 1}`}: {cardReading.cardName}
                </Text>
                <Text style={styles.cardReadingText}>
                  {cardReading.interpretation}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Advice */}
        {interpretations?.advice && (
          <View style={styles.section}>
            <View style={styles.adviceCard}>
              <Text style={styles.adviceLabel}>Lời khuyên</Text>
              <Text style={styles.adviceText}>{interpretations.advice}</Text>
            </View>
          </View>
        )}
      </>
    );
  };

  const renderIChingContent = () => {
    const hexagram = reading?.present_hexagram;
    const changingLines = reading?.changing_lines || [];
    const interpretations = reading?.interpretations || {};

    return (
      <>
        {/* Hexagram Display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quẻ hiện tại</Text>
          <View style={styles.hexagramCard}>
            <View style={styles.hexagramSymbol}>
              <BookOpen size={48} color={COLORS.cyan} />
            </View>
            <Text style={styles.hexagramName}>
              {hexagram?.name_vi || hexagram?.name_en || 'Unknown'}
            </Text>
            {hexagram?.chinese_name && (
              <Text style={styles.hexagramChinese}>{hexagram.chinese_name}</Text>
            )}
            {hexagram?.description_vi && (
              <Text style={styles.hexagramDesc}>{hexagram.description_vi}</Text>
            )}
          </View>
        </View>

        {/* Changing Lines */}
        {changingLines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hào động</Text>
            <View style={styles.linesContainer}>
              {changingLines.map((line, idx) => (
                <View key={idx} style={styles.lineItem}>
                  <Text style={styles.lineNumber}>Hào {line.position || idx + 1}</Text>
                  <Text style={styles.lineText}>{line.interpretation || 'Đang chuyển đổi'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Interpretation */}
        {interpretations?.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giải quẻ</Text>
            <View style={styles.interpretationCard}>
              <Text style={styles.interpretationText}>
                {interpretations.summary}
              </Text>
            </View>
          </View>
        )}

        {/* Advice */}
        {interpretations?.advice && (
          <View style={styles.section}>
            <View style={styles.adviceCard}>
              <Text style={styles.adviceLabel}>Lời khuyên</Text>
              <Text style={styles.adviceText}>{interpretations.advice}</Text>
            </View>
          </View>
        )}
      </>
    );
  };

  const IconComponent = type === 'tarot' ? Layers : BookOpen;
  const iconColor = type === 'tarot' ? COLORS.purple : COLORS.cyan;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.background}
        style={styles.background}
        locations={GRADIENTS.backgroundLocations}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {getSpreadName()}
          </Text>

          <TouchableOpacity
            style={styles.starButton}
            onPress={handleToggleStar}
          >
            <Star
              size={24}
              color={reading?.starred ? COLORS.gold : COLORS.textMuted}
              fill={reading?.starred ? COLORS.gold : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Meta Info */}
          <View style={styles.metaContainer}>
            <View style={[styles.typeBadge, { backgroundColor: `${iconColor}20` }]}>
              <IconComponent size={16} color={iconColor} />
              <Text style={[styles.typeBadgeText, { color: iconColor }]}>
                {type === 'tarot' ? 'Tarot' : 'Kinh Dịch'}
              </Text>
            </View>

            <View style={styles.dateContainer}>
              <Calendar size={14} color={COLORS.textMuted} />
              <Text style={styles.dateText}>{formatDate(reading?.created_at)}</Text>
            </View>
          </View>

          {/* Question */}
          {reading?.question && (
            <View style={styles.section}>
              <View style={styles.questionCard}>
                <MessageSquare size={18} color={COLORS.cyan} />
                <Text style={styles.questionText}>{reading.question}</Text>
              </View>
            </View>
          )}

          {/* Type-specific content */}
          {type === 'tarot' ? renderTarotContent() : renderIChingContent()}

          {/* Notes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ghi chú cá nhân</Text>
              {!isEditingNotes && (
                <TouchableOpacity onPress={() => setIsEditingNotes(true)}>
                  <Edit3 size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {isEditingNotes ? (
              <View style={styles.notesEditContainer}>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Thêm ghi chú của bạn..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                <View style={styles.notesActions}>
                  <TouchableOpacity
                    style={styles.notesCancelButton}
                    onPress={() => {
                      setNotes(reading?.notes || '');
                      setIsEditingNotes(false);
                    }}
                  >
                    <Text style={styles.notesCancelText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.notesSaveButton}
                    onPress={handleSaveNotes}
                  >
                    <Save size={16} color={COLORS.textPrimary} />
                    <Text style={styles.notesSaveText}>Lưu</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>
                  {reading?.notes || 'Chưa có ghi chú. Nhấn để thêm.'}
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Share2 size={20} color={COLORS.textPrimary} />
              <Text style={styles.shareButtonText}>Chia sẻ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Trash2 size={20} color={COLORS.error} />
              <Text style={styles.deleteButtonText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  starButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.huge,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  typeBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  questionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: GLASS.borderRadius,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  questionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  cardItem: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    padding: SPACING.sm,
  },
  cardImage: {
    width: 60,
    height: 90,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  cardImageReversed: {
    transform: [{ rotate: '180deg' }],
  },
  cardPlaceholder: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  cardName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  cardPosition: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  reversedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  reversedText: {
    fontSize: 10,
    color: COLORS.warning,
  },
  interpretationCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  interpretationText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  cardReadingItem: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardReadingTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  cardReadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  adviceCard: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: GLASS.borderRadius,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  adviceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },
  adviceText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  hexagramCard: {
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
  },
  hexagramSymbol: {
    marginBottom: SPACING.md,
  },
  hexagramName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  hexagramChinese: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.cyan,
    marginBottom: SPACING.sm,
  },
  hexagramDesc: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  linesContainer: {
    gap: SPACING.sm,
  },
  lineItem: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.cyan,
  },
  lineNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.cyan,
    marginBottom: 4,
  },
  lineText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  notesEditContainer: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.md,
  },
  notesInput: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    minHeight: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  notesActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  notesCancelButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  notesCancelText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },
  notesSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  notesSaveText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  notesCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.md,
  },
  notesText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.glassBg,
    paddingVertical: SPACING.md,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  shareButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255, 75, 75, 0.1)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 75, 0.3)',
  },
  deleteButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.error,
  },
});

export default ReadingDetailScreen;
