/**
 * DivinationSection - Trải bài & Gieo quẻ
 * Vision Board 2.0 - Redesign theo wireframe mới
 *
 * Features:
 * - Collapsed/Expanded mode với animation
 * - 2-column grid cards (Full-bleed + Glassmorphism)
 * - Filter chips (Tarot/Kinh Dịch/All)
 * - Detail Modal với swipe navigation
 * - Real data từ Supabase
 *
 * Created: December 10, 2025
 */

import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  Image,
  ScrollView,
  PanResponder,
  ActivityIndicator,
  LayoutAnimation,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Sparkles,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
  Flame,
  X,
  ChevronLeft,
  MoreVertical,
  Share2,
  Calendar,
  BookOpen,
  ArrowLeft,
  Check,
  CheckSquare,
  Square,
} from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING, TYPOGRAPHY, GLASS, SHADOWS } from '../../utils/tokens';
import { getCardImage, getCardImageByName } from '../../assets/tarot';
import { getHexagramImage } from '../../assets/iching';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// 2-column grid: subtract container padding (SPACING.lg * 2) + expandedContent padding (SPACING.md * 2) and gap between cards
const GRID_GAP = 12;
const CONTAINER_PADDING = SPACING.lg * 2 + SPACING.md * 2; // 16*2 + 12*2 = 56
const CARD_WIDTH = (SCREEN_WIDTH - CONTAINER_PADDING - GRID_GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.4; // Aspect ratio

// Spiritual Icon for I Ching
const SpiritualIcon = ({ size = 28, color = '#8B5CF6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="4" fill={color} />
    <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Filter types
const FILTER_TYPES = [
  { key: 'all', label: 'Tất cả' },
  { key: 'tarot', label: 'Tarot' },
  { key: 'iching', label: 'Kinh Dịch' },
];

// =========== DIVINATION CARD COMPONENT ===========
const DivinationCard = memo(({
  reading,
  onPress,
  onDelete,
  onLongPress,
  index,
  selectionMode = false,
  isSelected = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Entry animation
  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [index, opacityAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.(reading);
  };

  const handlePress = () => {
    if (selectionMode) {
      // In selection mode, tap toggles selection
      onLongPress?.(reading);
    } else {
      onPress?.(reading);
    }
  };

  // Get display info based on reading type
  const getReadingDisplay = () => {
    const content = reading?.content || {};

    if (reading?.type === 'tarot') {
      // Get first card image
      const firstCard = content?.cards?.[0];
      const cardImage = firstCard?.id
        ? getCardImage(firstCard.id)
        : firstCard?.vietnamese
          ? getCardImageByName(firstCard.vietnamese)
          : null;

      return {
        type: 'tarot',
        label: 'Tarot',
        color: '#E91E63',
        gradient: ['#E91E63', '#9C27B0'],
        icon: <Sparkles size={14} color="#FFFFFF" />,
        image: cardImage,
        title: content?.spreadName || 'Trải bài Tarot',
        subtitle: firstCard?.vietnamese || firstCard?.name || 'Xem chi tiết',
      };
    } else {
      // I Ching
      const hexagramImage = content?.hexagramNumber
        ? getHexagramImage(content.hexagramNumber)
        : null;

      return {
        type: 'iching',
        label: 'Kinh Dịch',
        color: '#8B5CF6',
        gradient: ['#8B5CF6', '#6366F1'],
        icon: <SpiritualIcon size={14} color="#FFFFFF" />,
        image: hexagramImage,
        title: content?.hexagramName || content?.vietnameseName || 'Quẻ Kinh Dịch',
        subtitle: content?.chineseName || `Quẻ #${content?.hexagramNumber || '?'}`,
      };
    }
  };

  const display = getReadingDisplay();

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={400}
        style={styles.cardTouchable}
      >
        {/* Card Container with Glassmorphism */}
        <View style={[
          styles.card,
          { borderColor: `${display.color}30` },
          isSelected && styles.cardSelected,
        ]}>
          {/* Full-bleed Image Area */}
          <View style={styles.cardImageArea}>
            {display.image ? (
              <Image
                source={display.image}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={display.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardImagePlaceholder}
              >
                {display.type === 'tarot' ? (
                  <Sparkles size={40} color="rgba(255,255,255,0.7)" />
                ) : (
                  <SpiritualIcon size={40} color="rgba(255,255,255,0.7)" />
                )}
              </LinearGradient>
            )}

            {/* Gradient overlay for text readability */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.cardGradientOverlay}
            />
          </View>

          {/* Info overlay at bottom */}
          <View style={styles.cardInfoOverlay}>
            {/* Type badge */}
            <View style={[styles.typeBadge, { backgroundColor: `${display.color}40` }]}>
              {display.icon}
              <Text style={[styles.typeBadgeText, { color: display.color }]}>
                {display.label}
              </Text>
            </View>

            {/* Title & Date */}
            <Text style={styles.cardTitle} numberOfLines={1}>
              {display.title}
            </Text>
            <View style={styles.cardDateRow}>
              <Clock size={10} color="rgba(255,255,255,0.6)" />
              <Text style={styles.cardDate}>
                {formatDate(reading?.created_at)}
              </Text>
            </View>
          </View>

          {/* Selection checkbox OR Delete button (corner) */}
          {selectionMode ? (
            <View style={[styles.selectionCheckbox, isSelected && styles.selectionCheckboxSelected]}>
              {isSelected ? (
                <Check size={14} color="#FFFFFF" />
              ) : (
                <View style={styles.selectionCheckboxEmpty} />
              )}
            </View>
          ) : (
            onDelete && (
              <TouchableOpacity
                style={styles.cardDeleteBtn}
                onPress={() => onDelete(reading)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={14} color="#E74C3C" />
              </TouchableOpacity>
            )
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// =========== DIVINATION DETAIL MODAL ===========
const DivinationDetailModal = memo(({
  visible,
  reading,
  readings,
  currentIndex,
  onClose,
  onNavigateToReading,
  onDelete,
  onCreateRitual,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Swipe handling
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
      onPanResponderMove: (_, gesture) => {
        translateX.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 80 && currentIndex > 0) {
          // Swipe right - previous
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 260,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            onNavigateToReading?.(currentIndex - 1);
          });
        } else if (gesture.dx < -80 && currentIndex < readings.length - 1) {
          // Swipe left - next
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 260,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            onNavigateToReading?.(currentIndex + 1);
          });
        } else if (gesture.dy > 100) {
          // Swipe down - close
          onClose?.();
        } else {
          // Reset
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    });
  }, [currentIndex, readings.length, onNavigateToReading, onClose, translateX]);

  if (!visible || !reading) return null;

  const content = reading?.content || {};
  const isTarot = reading?.type === 'tarot';

  // Get interpretation
  const getInterpretation = () => {
    if (isTarot) {
      return content?.interpretation || content?.overallMeaning || '';
    }
    return content?.interpretation || content?.meaning || content?.judgement || content?.description || '';
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.modalOverlay,
          { opacity: opacityAnim },
        ]}
      >
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.modalContent,
            {
              transform: [
                { scale: scaleAnim },
                { translateX },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalHeaderBtn}
              onPress={onClose}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.modalHeaderCenter}>
              <Text style={styles.modalTitle}>
                {isTarot ? 'Trải bài Tarot' : 'Quẻ Kinh Dịch'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {currentIndex + 1} / {readings.length}
              </Text>
            </View>

            <TouchableOpacity style={styles.modalHeaderBtn}>
              <MoreVertical size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Spread Preview (Tarot) or Hexagram (I Ching) */}
            {isTarot && content?.cards?.length > 0 && (
              <View style={styles.spreadPreview}>
                <Text style={styles.spreadPreviewLabel}>
                  {content?.spreadName || 'Các lá bài'}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.spreadCardsRow}
                >
                  {content.cards.map((card, idx) => {
                    const cardImage = card.id
                      ? getCardImage(card.id)
                      : getCardImageByName(card.vietnamese || card.name);

                    return (
                      <View key={idx} style={styles.spreadCardItem}>
                        {cardImage ? (
                          <Image
                            source={cardImage}
                            style={[
                              styles.spreadCardImage,
                              card.isReversed && styles.spreadCardReversed,
                            ]}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.spreadCardPlaceholder}>
                            <Sparkles size={20} color="#E91E63" />
                          </View>
                        )}
                        <Text style={styles.spreadCardPosition}>
                          {card.position || ''}
                        </Text>
                        <Text style={styles.spreadCardName} numberOfLines={1}>
                          {card.vietnamese || card.name}
                        </Text>
                        {card.isReversed && (
                          <Text style={styles.spreadCardReversedLabel}>
                            (Ngược)
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* I Ching Hexagram */}
            {!isTarot && (
              <View style={styles.hexagramPreview}>
                <View style={styles.hexagramImageContainer}>
                  {content?.hexagramNumber && getHexagramImage(content.hexagramNumber) ? (
                    <Image
                      source={getHexagramImage(content.hexagramNumber)}
                      style={styles.hexagramImageLarge}
                      resizeMode="contain"
                    />
                  ) : (
                    <SpiritualIcon size={80} color="#8B5CF6" />
                  )}
                </View>
                <View style={styles.hexagramTextInfo}>
                  <Text style={styles.hexagramNumber}>
                    Quẻ #{content?.hexagramNumber || '?'}
                  </Text>
                  <Text style={styles.hexagramName}>
                    {content?.hexagramName || content?.vietnameseName || 'Quẻ'}
                  </Text>
                  {content?.chineseName && (
                    <Text style={styles.hexagramChinese}>
                      {content.chineseName}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Interpretation */}
            {getInterpretation() && (
              <View style={styles.interpretationSection}>
                <View style={styles.interpretationHeader}>
                  <BookOpen size={18} color="#FFD700" />
                  <Text style={styles.interpretationLabel}>Luận giải</Text>
                </View>
                <Text style={styles.interpretationText}>
                  {getInterpretation()}
                </Text>
              </View>
            )}

            {/* Notes */}
            {content?.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Ghi chú của bạn:</Text>
                <Text style={styles.notesText}>{content.notes}</Text>
              </View>
            )}

            {/* Date */}
            <View style={styles.dateSection}>
              <Calendar size={16} color="rgba(255,255,255,0.6)" />
              <Text style={styles.dateText}>
                {formatDate(reading?.created_at)}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionBtn}>
                <Share2 size={18} color="#4ECDC4" />
                <Text style={styles.actionBtnText}>Chia sẻ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnDanger]}
                onPress={() => {
                  onDelete?.(reading);
                  onClose?.();
                }}
              >
                <Trash2 size={18} color="#E74C3C" />
                <Text style={[styles.actionBtnText, { color: '#E74C3C' }]}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Navigation arrows */}
          {currentIndex > 0 && (
            <TouchableOpacity
              style={[styles.navArrow, styles.navArrowLeft]}
              onPress={() => onNavigateToReading?.(currentIndex - 1)}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          {currentIndex < readings.length - 1 && (
            <TouchableOpacity
              style={[styles.navArrow, styles.navArrowRight]}
              onPress={() => onNavigateToReading?.(currentIndex + 1)}
            >
              <ChevronRight size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
});


// =========== MAIN DIVINATION SECTION ===========
const DivinationSection = memo(({
  readings = [],
  onNavigateToTarot,
  onNavigateToIChing,
  onDelete,
  onDeleteMultiple,
  onCreateRitual,
  loading = false,
}) => {
  // States
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedReading, setSelectedReading] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Multi-select state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Animation
  const expandAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Toggle expand/collapse
  const toggleExpand = useCallback(() => {
    const toValue = isExpanded ? 0 : 1;

    Animated.parallel([
      Animated.spring(expandAnim, {
        toValue,
        useNativeDriver: false,
        tension: 50,
        friction: 10,
      }),
      Animated.timing(rotateAnim, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setIsExpanded(!isExpanded);
  }, [isExpanded, expandAnim, rotateAnim]);

  // Filter readings
  const filteredReadings = useMemo(() => {
    if (activeFilter === 'all') return readings;
    return readings.filter(r => r?.type === activeFilter);
  }, [readings, activeFilter]);

  // Get counts by type
  const counts = useMemo(() => {
    const tarotCount = readings.filter(r => r?.type === 'tarot').length;
    const ichingCount = readings.filter(r => r?.type === 'iching').length;
    return { tarot: tarotCount, iching: ichingCount, all: readings.length };
  }, [readings]);

  // Handle card press
  const handleCardPress = useCallback((reading) => {
    const index = filteredReadings.findIndex(r => r?.id === reading?.id);
    setSelectedReading(reading);
    setSelectedIndex(index >= 0 ? index : 0);
    setShowDetailModal(true);
  }, [filteredReadings]);

  // Handle navigate to reading in modal
  const handleNavigateToReading = useCallback((index) => {
    if (index >= 0 && index < filteredReadings.length) {
      setSelectedReading(filteredReadings[index]);
      setSelectedIndex(index);
    }
  }, [filteredReadings]);

  // Handle long press to enter selection mode or toggle selection
  const handleLongPress = useCallback((reading) => {
    if (!selectionMode) {
      // Enter selection mode and select this item
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSelectionMode(true);
      setSelectedItems(new Set([reading.id]));
    } else {
      // Toggle selection
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(reading.id)) {
          newSet.delete(reading.id);
          // Exit selection mode if no items selected
          if (newSet.size === 0) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setSelectionMode(false);
          }
        } else {
          newSet.add(reading.id);
        }
        return newSet;
      });
    }
  }, [selectionMode]);

  // Cancel selection mode
  const handleCancelSelection = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectionMode(false);
    setSelectedItems(new Set());
  }, []);

  // Delete selected items
  const handleDeleteSelected = useCallback(() => {
    if (selectedItems.size === 0) return;

    // Get full reading objects for selected IDs
    const selectedReadings = filteredReadings.filter(r => selectedItems.has(r.id));

    if (onDeleteMultiple) {
      onDeleteMultiple(selectedReadings);
    }

    // Reset selection mode
    handleCancelSelection();
  }, [selectedItems, filteredReadings, onDeleteMultiple, handleCancelSelection]);

  // Select all visible items
  const handleSelectAll = useCallback(() => {
    const allIds = new Set(filteredReadings.map(r => r.id));
    setSelectedItems(allIds);
  }, [filteredReadings]);

  // Rotate chevron
  const chevronRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  // Summary text for collapsed mode
  const summaryText = useMemo(() => {
    const parts = [];
    if (counts.tarot > 0) parts.push('Tarot');
    if (counts.iching > 0) parts.push('Kinh dịch');
    return parts.join(' • ') || 'Chưa có trải bài';
  }, [counts]);

  if (readings.length === 0 && !loading) {
    return (
      <View style={styles.container}>
        {/* Empty state with CTA */}
        <TouchableOpacity
          style={styles.emptyContainer}
          onPress={onNavigateToTarot}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(233, 30, 99, 0.1)', 'rgba(139, 92, 246, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyGradient}
          >
            <Sparkles size={32} color="#E91E63" />
            <Text style={styles.emptyTitle}>Lịch sử trải bài & Gieo quẻ</Text>
            <Text style={styles.emptySubtitle}>
              Chạm vào đây để bắt đầu trải bài Tarot hoặc gieo quẻ Kinh Dịch
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Collapsed Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.headerIconContainer}>
            <Sparkles size={20} color="#E91E63" />
          </View>
          <View style={styles.headerTextContainer}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>Lịch sử trải bài & Gieo quẻ</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{readings.length}</Text>
              </View>
            </View>
            {!isExpanded && (
              <Text style={styles.headerSummary}>{summaryText}</Text>
            )}
          </View>
        </View>

        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <ChevronRight size={20} color={COLORS.textMuted} />
        </Animated.View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <Animated.View style={styles.expandedContent}>
          {/* Selection Mode Bar */}
          {selectionMode && (
            <View style={styles.selectionBar}>
              <View style={styles.selectionBarLeft}>
                <TouchableOpacity
                  style={styles.selectionBarBtn}
                  onPress={handleCancelSelection}
                >
                  <X size={18} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.selectionBarText}>
                  {selectedItems.size} đã chọn
                </Text>
              </View>
              <View style={styles.selectionBarRight}>
                <TouchableOpacity
                  style={styles.selectionBarBtn}
                  onPress={handleSelectAll}
                >
                  <CheckSquare size={18} color="#FFFFFF" />
                  <Text style={styles.selectionBarBtnText}>Chọn tất cả</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.selectionBarBtn, styles.selectionBarDeleteBtn]}
                  onPress={handleDeleteSelected}
                >
                  <Trash2 size={18} color="#E74C3C" />
                  <Text style={[styles.selectionBarBtnText, { color: '#E74C3C' }]}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Filter Chips */}
          <View style={styles.filterRow}>
            {FILTER_TYPES.map((filter) => {
              const isActive = activeFilter === filter.key;
              const count = counts[filter.key];

              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                  onPress={() => setActiveFilter(filter.key)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                  {count > 0 && (
                    <View
                      style={[
                        styles.filterChipCount,
                        isActive && styles.filterChipCountActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipCountText,
                          isActive && styles.filterChipCountTextActive,
                        ]}
                      >
                        {count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Grid of Cards */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E91E63" />
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredReadings.map((reading, index) => (
                <DivinationCard
                  key={reading?.id || index}
                  reading={reading}
                  index={index}
                  onPress={handleCardPress}
                  onDelete={onDelete}
                  onLongPress={handleLongPress}
                  selectionMode={selectionMode}
                  isSelected={selectedItems.has(reading?.id)}
                />
              ))}

              {/* Add New Card */}
              <TouchableOpacity
                style={styles.addNewCard}
                onPress={() => {
                  if (activeFilter === 'iching') {
                    onNavigateToIChing?.();
                  } else {
                    onNavigateToTarot?.();
                  }
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(233, 30, 99, 0.15)', 'rgba(139, 92, 246, 0.15)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addNewCardGradient}
                >
                  <Plus size={32} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.addNewCardText}>
                    {activeFilter === 'iching' ? 'Gieo quẻ mới' : 'Trải bài mới'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Links */}
          <View style={styles.quickLinks}>
            <TouchableOpacity
              style={styles.quickLinkBtn}
              onPress={onNavigateToTarot}
            >
              <Sparkles size={16} color="#E91E63" />
              <Text style={[styles.quickLinkText, { color: '#E91E63' }]}>
                Xem Tarot
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickLinkBtn}
              onPress={onNavigateToIChing}
            >
              <SpiritualIcon size={16} color="#8B5CF6" />
              <Text style={[styles.quickLinkText, { color: '#8B5CF6' }]}>
                Gieo quẻ
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Detail Modal */}
      <DivinationDetailModal
        visible={showDetailModal}
        reading={selectedReading}
        readings={filteredReadings}
        currentIndex={selectedIndex}
        onClose={() => setShowDetailModal(false)}
        onNavigateToReading={handleNavigateToReading}
        onDelete={onDelete}
        onCreateRitual={onCreateRitual}
      />
    </View>
  );
});

// =========== STYLES ===========
const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },

  // Empty State
  emptyContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  emptyGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(233, 30, 99, 0.3)',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },

  // Header (Collapsed)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(233, 30, 99, 0.08)',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(233, 30, 99, 0.25)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(233, 30, 99, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  countBadge: {
    backgroundColor: 'rgba(233, 30, 99, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  countBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#E91E63',
  },
  headerSummary: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Expanded Content
  expandedContent: {
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(233, 30, 99, 0.15)',
  },

  // Filter Row
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(233, 30, 99, 0.2)',
    borderColor: '#E91E63',
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  filterChipTextActive: {
    color: '#E91E63',
  },
  filterChipCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  filterChipCountActive: {
    backgroundColor: 'rgba(233, 30, 99, 0.3)',
  },
  filterChipCountText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textMuted,
  },
  filterChipCountTextActive: {
    color: '#E91E63',
  },

  // Grid - 2 column layout
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Card
  cardWrapper: {
    width: CARD_WIDTH,
  },
  cardTouchable: {
    borderRadius: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: 'rgba(15, 16, 48, 0.8)',
  },
  cardImageArea: {
    flex: 1,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardGradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  cardInfoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#FFFFFF',
  },
  cardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cardDate: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  cardDeleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSelected: {
    borderColor: '#E91E63',
    borderWidth: 2,
  },
  selectionCheckbox: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionCheckboxSelected: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },
  selectionCheckboxEmpty: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },

  // Selection Bar
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(233, 30, 99, 0.2)',
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(233, 30, 99, 0.4)',
  },
  selectionBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  selectionBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  selectionBarText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#FFFFFF',
  },
  selectionBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectionBarBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: '#FFFFFF',
  },
  selectionBarDeleteBtn: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
  },

  // Add New Card
  addNewCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderStyle: 'dashed',
  },
  addNewCardGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  addNewCardText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Quick Links
  quickLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickLinkText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeaderBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeaderCenter: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  modalBody: {
    flex: 1,
    padding: SPACING.lg,
  },

  // Spread Preview (Tarot)
  spreadPreview: {
    marginBottom: SPACING.lg,
  },
  spreadPreviewLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  spreadCardsRow: {
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  spreadCardItem: {
    alignItems: 'center',
    width: 80,
  },
  spreadCardImage: {
    width: 70,
    height: 105,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(233, 30, 99, 0.3)',
  },
  spreadCardReversed: {
    transform: [{ rotate: '180deg' }],
  },
  spreadCardPlaceholder: {
    width: 70,
    height: 105,
    borderRadius: 8,
    backgroundColor: 'rgba(233, 30, 99, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(233, 30, 99, 0.3)',
  },
  spreadCardPosition: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  spreadCardName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#E91E63',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textAlign: 'center',
    marginTop: 2,
  },
  spreadCardReversedLabel: {
    fontSize: 9,
    color: '#FF6B6B',
    fontStyle: 'italic',
  },

  // Hexagram Preview (I Ching)
  hexagramPreview: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
  },
  hexagramImageContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  hexagramImageLarge: {
    width: 100,
    height: 100,
  },
  hexagramTextInfo: {
    alignItems: 'center',
  },
  hexagramNumber: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#8B5CF6',
  },
  hexagramName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  hexagramChinese: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Interpretation
  interpretationSection: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  interpretationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  interpretationLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#FFD700',
  },
  interpretationText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: 24,
    color: COLORS.textSecondary,
  },

  // Notes
  notesSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  notesLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  notesText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },

  // Date
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.lg,
  },
  dateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionBtnDanger: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  actionBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Navigation Arrows
  navArrow: {
    position: 'absolute',
    top: '50%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowLeft: {
    left: 10,
  },
  navArrowRight: {
    right: 10,
  },
});

export default DivinationSection;
