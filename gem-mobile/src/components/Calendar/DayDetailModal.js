/**
 * Day Detail Modal Component
 * Modal showing events for a selected date
 *
 * Created: December 9, 2025
 * Part of Vision Board 2.0 Redesign
 * Updated: January 2026 - Cosmic theme redesign
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, GLASS } from '../../utils/tokens';
import { COSMIC_COLORS, COSMIC_GRADIENTS, COSMIC_SHADOWS, COSMIC_SPACING } from '../../theme/cosmicTokens';
import { CalendarEventItem } from './MonthCalendar';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Vietnamese day names
const DAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

// Ritual name mapping
const RITUAL_NAMES = {
  'heart-expansion': 'Mở Rộng Trái Tim',
  'gratitude-flow': 'Dòng Chảy Biết Ơn',
  'cleansing-breath': 'Hơi Thở Thanh Lọc',
  'water-manifest': 'Hiện Thực Hóa Bằng Nước',
  'letter-to-universe': 'Thư Gửi Vũ Trụ',
  'burn-release': 'Đốt & Buông Bỏ',
  'star-wish': 'Ước Nguyện Sao Băng',
  'crystal-healing': 'Chữa Lành Pha Lê',
};

// Reading type mapping - Cosmic colors
const READING_TYPES = {
  tarot: { name: 'Tarot', icon: 'Sparkles', color: COSMIC_COLORS.glow.purple },
  iching: { name: 'I Ching', icon: 'BookOpen', color: COSMIC_COLORS.glow.cyan },
  numerology: { name: 'Số Học', icon: 'Hash', color: COSMIC_COLORS.glow.gold },
  angel: { name: 'Thiên Thần', icon: 'Feather', color: COSMIC_COLORS.glow.pink },
};

// Ritual icon colors - Cosmic vibrant
const RITUAL_COLORS = {
  'heart-expansion': COSMIC_COLORS.ritualThemes.heart.primary,
  'gratitude-flow': COSMIC_COLORS.ritualThemes.gratitude.primary,
  'cleansing-breath': COSMIC_COLORS.ritualThemes.breath.primary,
  'water-manifest': COSMIC_COLORS.ritualThemes.water.primary,
  'letter-to-universe': COSMIC_COLORS.ritualThemes.letter.primary,
  'burn-release': COSMIC_COLORS.ritualThemes.burn.primary,
  'star-wish': COSMIC_COLORS.ritualThemes.star.gold,
  'crystal-healing': COSMIC_COLORS.ritualThemes.crystal.primary,
};

const DayDetailModal = ({
  visible,
  date,
  events = [],
  rituals = [],
  readings = [],
  paperTrades = [],
  tradingJournal = [],
  actions = [],
  onClose,
  onEventPress,
  onEventComplete,
  onAddEvent,
  onRitualPress,
  onReadingPress,
  onTradePress,
  onActionPress,
}) => {
  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const dayName = DAY_NAMES[d.getDay()];
    const day = d.getDate();
    const month = d.getMonth() + 1;
    return { dayName, day, month, full: `${day}/${month}` };
  };

  const dateInfo = formatDate(date);

  // Group events by source type
  const groupedEvents = events.reduce((acc, event) => {
    const type = event.source_type || 'manual';
    if (!acc[type]) acc[type] = [];
    acc[type].push(event);
    return acc;
  }, {});

  // Source type labels
  const sourceTypeLabels = {
    goal_deadline: 'Deadline Mục Tiêu',
    action_due: 'Hành Động',
    habit_daily: 'Thói Quen',
    divination: 'Bói Toán',
    manual: 'Sự Kiện',
  };

  const isToday = date === new Date().toISOString().split('T')[0];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
          <TouchableOpacity
            style={styles.dismissArea}
            activeOpacity={1}
            onPress={onClose}
          />

          <View style={styles.modalContainer}>
            <LinearGradient
              colors={[COSMIC_COLORS.bgMystic, COSMIC_COLORS.bgCosmic, COSMIC_COLORS.bgDeepSpace]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />

            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.dateContainer}>
                <Text style={styles.dayName}>{dateInfo.dayName}</Text>
                <Text style={styles.dateNumber}>{dateInfo.day}</Text>
                {isToday && (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayText}>Hôm nay</Text>
                  </View>
                )}
              </View>

              <View style={styles.headerActions}>
                {onAddEvent && (
                  <TouchableOpacity
                    onPress={() => onAddEvent(date)}
                    style={styles.addButton}
                  >
                    <Icons.Plus size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Icons.X size={24} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Events list */}
            <ScrollView
              style={styles.eventsList}
              showsVerticalScrollIndicator={false}
            >
              {events.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icons.CalendarX size={48} color={COSMIC_COLORS.text.muted} />
                  <Text style={styles.emptyText}>Không có sự kiện nào</Text>
                  {onAddEvent && (
                    <TouchableOpacity
                      onPress={() => onAddEvent(date)}
                      style={styles.emptyAddButton}
                    >
                      <Icons.Plus size={16} color={COLORS.purple} />
                      <Text style={styles.emptyAddText}>Thêm sự kiện</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                Object.entries(groupedEvents).map(([type, typeEvents]) => (
                  <View key={type} style={styles.eventGroup}>
                    <Text style={styles.groupTitle}>
                      {sourceTypeLabels[type] || type}
                    </Text>
                    {typeEvents.map((event) => (
                      <CalendarEventItem
                        key={event.id}
                        event={event}
                        onPress={onEventPress}
                        onComplete={onEventComplete}
                      />
                    ))}
                  </View>
                ))
              )}

              {/* Summary stats */}
              {events.length > 0 && (
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {events.filter(e => e.is_completed).length}
                    </Text>
                    <Text style={styles.summaryLabel}>Hoàn thành</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {events.filter(e => !e.is_completed).length}
                    </Text>
                    <Text style={styles.summaryLabel}>Còn lại</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {events.length}
                    </Text>
                    <Text style={styles.summaryLabel}>Tổng</Text>
                  </View>
                </View>
              )}

              {/* Journal Section - Rituals */}
              {rituals.length > 0 && (
                <View style={styles.journalSection}>
                  <View style={styles.journalHeader}>
                    <Icons.Sparkles size={18} color={COSMIC_COLORS.glow.purple} />
                    <Text style={styles.journalTitle}>Nghi thức đã hoàn thành</Text>
                  </View>
                  {rituals.map((ritual, index) => {
                    const time = ritual.completed_at
                      ? new Date(ritual.completed_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : '';
                    const ritualColor = RITUAL_COLORS[ritual.ritual_slug] || COSMIC_COLORS.glow.purple;
                    return (
                      <TouchableOpacity
                        key={ritual.id || index}
                        style={[styles.journalItem, { borderColor: `${ritualColor}30` }]}
                        onPress={() => onRitualPress?.(ritual)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.journalIcon, { backgroundColor: `${ritualColor}25` }]}>
                          <Icons.Heart size={16} color={ritualColor} />
                        </View>
                        <View style={styles.journalContent}>
                          <Text style={styles.journalItemTitle}>
                            {RITUAL_NAMES[ritual.ritual_slug] || ritual.ritual_slug}
                          </Text>
                          {ritual.content?.reflection && (
                            <Text style={styles.journalReflection} numberOfLines={2}>
                              "{ritual.content.reflection}"
                            </Text>
                          )}
                          <Text style={styles.journalTime}>{time}</Text>
                        </View>
                        <View style={[styles.journalXP, { backgroundColor: `${COSMIC_COLORS.functional.success}20`, borderColor: `${COSMIC_COLORS.functional.success}40` }]}>
                          <Text style={styles.journalXPText}>+{ritual.xp_earned || 0} XP</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Journal Section - Readings */}
              {readings.length > 0 && (
                <View style={styles.journalSection}>
                  <View style={styles.journalHeader}>
                    <Icons.BookOpen size={18} color={COSMIC_COLORS.glow.cyan} />
                    <Text style={styles.journalTitle}>Bói toán đã thực hiện</Text>
                  </View>
                  {readings.map((reading, index) => {
                    const readingType = READING_TYPES[reading.reading_type] || { name: reading.reading_type, icon: 'Sparkles', color: COSMIC_COLORS.glow.purple };
                    const ReadingIcon = Icons[readingType.icon] || Icons.Sparkles;
                    const time = reading.created_at
                      ? new Date(reading.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : '';
                    return (
                      <TouchableOpacity
                        key={reading.id || index}
                        style={styles.journalItem}
                        onPress={() => onReadingPress?.(reading)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.journalIcon, { backgroundColor: `${readingType.color}20` }]}>
                          <ReadingIcon size={16} color={readingType.color} />
                        </View>
                        <View style={styles.journalContent}>
                          <Text style={styles.journalItemTitle}>{readingType.name}</Text>
                          {reading.question && (
                            <Text style={styles.journalReflection} numberOfLines={2}>
                              {reading.question}
                            </Text>
                          )}
                          <Text style={styles.journalTime}>{time}</Text>
                        </View>
                        <Icons.ChevronRight size={16} color={COSMIC_COLORS.text.muted} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Journal Section - Paper Trades */}
              {paperTrades.length > 0 && (
                <View style={styles.journalSection}>
                  <View style={styles.journalHeader}>
                    <Icons.LineChart size={18} color="#3AF7A6" />
                    <Text style={styles.journalTitle}>Paper Trades</Text>
                  </View>
                  {paperTrades.map((trade, index) => {
                    const isProfit = trade.pnl_percent > 0;
                    const time = trade.created_at
                      ? new Date(trade.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : '';
                    return (
                      <TouchableOpacity
                        key={trade.id || index}
                        style={styles.journalItem}
                        onPress={() => onTradePress?.(trade)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.journalIcon, { backgroundColor: isProfit ? 'rgba(58, 247, 166, 0.2)' : 'rgba(255, 107, 107, 0.2)' }]}>
                          {isProfit ? (
                            <Icons.TrendingUp size={16} color="#3AF7A6" />
                          ) : (
                            <Icons.TrendingDown size={16} color="#FF6B6B" />
                          )}
                        </View>
                        <View style={styles.journalContent}>
                          <Text style={styles.journalItemTitle}>
                            {trade.symbol} • {trade.direction?.toUpperCase()}
                          </Text>
                          <Text style={styles.journalReflection}>
                            {trade.pattern_type || 'Manual'} • {trade.timeframe || ''}
                          </Text>
                          <Text style={styles.journalTime}>{time}</Text>
                        </View>
                        <View style={styles.tradePnL}>
                          <Text style={[styles.tradePnLText, { color: isProfit ? '#3AF7A6' : '#FF6B6B' }]}>
                            {isProfit ? '+' : ''}{trade.pnl_percent?.toFixed(2)}%
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Journal Section - Trading Journal */}
              {tradingJournal.length > 0 && (
                <View style={styles.journalSection}>
                  <View style={styles.journalHeader}>
                    <Icons.FileText size={18} color="#FFBD59" />
                    <Text style={styles.journalTitle}>Nhật ký giao dịch</Text>
                  </View>
                  {tradingJournal.map((entry, index) => {
                    const isWin = entry.result === 'win';
                    const time = entry.created_at
                      ? new Date(entry.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : '';
                    return (
                      <TouchableOpacity
                        key={entry.id || index}
                        style={styles.journalItem}
                        onPress={() => onTradePress?.(entry)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.journalIcon, { backgroundColor: 'rgba(255, 189, 89, 0.2)' }]}>
                          <Icons.FileText size={16} color="#FFBD59" />
                        </View>
                        <View style={styles.journalContent}>
                          <Text style={styles.journalItemTitle}>
                            {entry.symbol} • {entry.direction?.toUpperCase()}
                          </Text>
                          {entry.lessons_learned && (
                            <Text style={styles.journalReflection} numberOfLines={2}>
                              "{entry.lessons_learned}"
                            </Text>
                          )}
                          <Text style={styles.journalTime}>{time}</Text>
                        </View>
                        <View style={[styles.resultBadge, { backgroundColor: isWin ? 'rgba(58, 247, 166, 0.2)' : 'rgba(255, 107, 107, 0.2)' }]}>
                          <Text style={[styles.resultText, { color: isWin ? '#3AF7A6' : '#FF6B6B' }]}>
                            {entry.result === 'win' ? 'WIN' : entry.result === 'loss' ? 'LOSS' : entry.result?.toUpperCase()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Journal Section - Completed Actions */}
              {actions.length > 0 && (
                <View style={styles.journalSection}>
                  <View style={styles.journalHeader}>
                    <Icons.CheckCircle size={18} color="#6A5BFF" />
                    <Text style={styles.journalTitle}>Hành động hoàn thành</Text>
                  </View>
                  {actions.map((action, index) => {
                    const time = action.completed_at
                      ? new Date(action.completed_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : '';
                    return (
                      <TouchableOpacity
                        key={action.id || index}
                        style={styles.journalItem}
                        onPress={() => onActionPress?.(action)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.journalIcon, { backgroundColor: 'rgba(106, 91, 255, 0.2)' }]}>
                          <Icons.CheckCircle size={16} color="#6A5BFF" />
                        </View>
                        <View style={styles.journalContent}>
                          <Text style={styles.journalItemTitle}>{action.title}</Text>
                          {action.goal_title && (
                            <Text style={styles.journalReflection} numberOfLines={1}>
                              Mục tiêu: {action.goal_title}
                            </Text>
                          )}
                          <Text style={styles.journalTime}>{time}</Text>
                        </View>
                        <Icons.Check size={16} color="#3AF7A6" />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Empty state for journal when no events but has activities */}
              {events.length === 0 && (rituals.length > 0 || readings.length > 0 || paperTrades.length > 0 || tradingJournal.length > 0 || actions.length > 0) && (
                <View style={styles.journalSummary}>
                  <Text style={styles.journalSummaryText}>
                    {rituals.length > 0 && `${rituals.length} nghi thức`}
                    {rituals.length > 0 && readings.length > 0 && ' • '}
                    {readings.length > 0 && `${readings.length} bói toán`}
                    {(rituals.length > 0 || readings.length > 0) && paperTrades.length > 0 && ' • '}
                    {paperTrades.length > 0 && `${paperTrades.length} trades`}
                    {(rituals.length > 0 || readings.length > 0 || paperTrades.length > 0) && actions.length > 0 && ' • '}
                    {actions.length > 0 && `${actions.length} hành động`}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

// Quick add event button (floating)
export const AddEventFAB = ({ onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icons.Plus size={24} color={COLORS.bgDarkest} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center', // Changed from flex-end to center for higher position
    paddingTop: SCREEN_HEIGHT * 0.08, // Move modal up
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-start', // Changed for higher position
    paddingTop: SCREEN_HEIGHT * 0.05,
  },
  dismissArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    borderRadius: 24,
    marginHorizontal: 16,
    maxHeight: SCREEN_HEIGHT * 0.8,
    paddingBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.borderGlow,
    ...COSMIC_SHADOWS.glowMedium,
    shadowColor: COSMIC_COLORS.glow.purple,
  },
  handleBar: {
    width: 48,
    height: 5,
    backgroundColor: 'rgba(168, 85, 247, 0.5)',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: COSMIC_SPACING.lg,
    marginBottom: COSMIC_SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: COSMIC_SPACING.xl,
    paddingVertical: COSMIC_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COSMIC_COLORS.glass.borderGlow,
  },
  dateContainer: {
    flex: 1,
  },
  dayName: {
    color: COSMIC_COLORS.glow.cyan,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dateNumber: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
    textShadowColor: COSMIC_COLORS.glow.purple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  todayBadge: {
    backgroundColor: COSMIC_COLORS.glow.gold,
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.xs,
    borderRadius: COSMIC_SPACING.sm,
    alignSelf: 'flex-start',
    marginTop: COSMIC_SPACING.sm,
    shadowColor: COSMIC_COLORS.glow.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  todayText: {
    color: '#0D0D2B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.md,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COSMIC_COLORS.glow.purple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COSMIC_COLORS.glow.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventsList: {
    padding: COSMIC_SPACING.xl,
  },
  eventGroup: {
    marginBottom: COSMIC_SPACING.xl,
  },
  groupTitle: {
    color: COSMIC_COLORS.glow.cyan,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: COSMIC_SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: COSMIC_SPACING.huge,
  },
  emptyText: {
    color: COSMIC_COLORS.text.muted,
    fontSize: 16,
    marginTop: COSMIC_SPACING.lg,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: COSMIC_SPACING.xl,
    paddingVertical: COSMIC_SPACING.md,
    paddingHorizontal: COSMIC_SPACING.xl,
    borderRadius: COSMIC_SPACING.lg,
    borderWidth: 1.5,
    borderColor: COSMIC_COLORS.glow.purple,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  emptyAddText: {
    color: COSMIC_COLORS.glow.purple,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: COSMIC_SPACING.sm,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: 16,
    padding: COSMIC_SPACING.xl,
    marginTop: COSMIC_SPACING.lg,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
  },
  summaryItem: {
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.xxl,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  summaryLabel: {
    color: COSMIC_COLORS.text.muted,
    fontSize: 12,
    marginTop: COSMIC_SPACING.xs,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: COSMIC_COLORS.glass.borderGlow,
  },

  // FAB styles
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COSMIC_COLORS.glow.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COSMIC_COLORS.glow.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },

  // Journal styles - Cosmic redesign
  journalSection: {
    marginTop: COSMIC_SPACING.xl,
    paddingTop: COSMIC_SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COSMIC_COLORS.glass.borderGlow,
  },
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: COSMIC_SPACING.lg,
    gap: COSMIC_SPACING.sm,
  },
  journalTitle: {
    color: COSMIC_COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  journalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: 16,
    padding: COSMIC_SPACING.lg,
    marginBottom: COSMIC_SPACING.md,
    gap: COSMIC_SPACING.lg,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
  },
  journalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalContent: {
    flex: 1,
  },
  journalItemTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  journalReflection: {
    color: COSMIC_COLORS.text.muted,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },
  journalTime: {
    color: COSMIC_COLORS.text.hint,
    fontSize: 11,
    marginTop: 6,
  },
  journalXP: {
    backgroundColor: 'rgba(58, 247, 166, 0.2)',
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.xs,
    borderRadius: COSMIC_SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(58, 247, 166, 0.3)',
  },
  journalXPText: {
    color: COSMIC_COLORS.functional.success,
    fontSize: 12,
    fontWeight: '700',
  },
  journalSummary: {
    alignItems: 'center',
    paddingVertical: COSMIC_SPACING.lg,
  },
  journalSummaryText: {
    color: COSMIC_COLORS.text.muted,
    fontSize: 14,
  },
  // Trading styles
  tradePnL: {
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.xs,
    borderRadius: COSMIC_SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  tradePnLText: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultBadge: {
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.xs,
    borderRadius: COSMIC_SPACING.sm,
  },
  resultText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default DayDetailModal;
