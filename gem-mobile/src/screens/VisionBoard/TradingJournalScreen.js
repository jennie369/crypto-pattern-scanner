/**
 * TradingJournalScreen.js
 * Enhanced Trading Journal Screen for Paper Trades
 * Supports create/edit modes with comprehensive trade logging
 *
 * Created: January 28, 2026
 * Updated: February 01, 2026 - Enhanced paper trade features
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ExpoImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Save,
  Trash2,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Camera,
  Image as ImageIcon,
  AlertTriangle,
  X,
  Search,
  Check,
  FileText,
  BarChart3,
  Clock,
  Target,
  Shield,
  Award,
  Smile,
  Frown,
  Meh,
  Zap,
  Heart,
  AlertCircle,
  DollarSign,
  Flame,
} from 'lucide-react-native';

import { COLORS, TYPOGRAPHY, SPACING, GRADIENTS, BORDER_RADIUS, GLASS } from '../../utils/tokens';
import { supabase } from '../../services/supabase';
import {
  createTradingEntry,
  updateTradingEntry,
  deleteTradingEntry,
  getEntryById,
  calculateTradeMetrics,
  TRADE_DIRECTIONS,
  TRADE_RESULTS,
  PATTERN_TYPES,
  PATTERN_GRADES,
  TIMEFRAMES,
  TRADE_EMOTIONS,
  DISCIPLINE_CHECKLIST_ITEMS,
} from '../../services/tradingJournalService';
import { checkCalendarAccess } from '../../config/calendarAccessControl';
import DisciplineChecklist from '../../components/VisionBoard/DisciplineChecklist';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==================== CONSTANTS ====================

// Common crypto trading pairs for autocomplete
const COMMON_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'SOLUSDT',
  'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT',
  'LINKUSDT', 'LTCUSDT', 'ATOMUSDT', 'UNIUSDT', 'APTUSDT',
  'ARBUSDT', 'OPUSDT', 'NEARUSDT', 'FTMUSDT', 'SANDUSDT',
  'MANAUSDT', 'AXSUSDT', 'AAVEUSDT', 'MKRUSDT', 'SNXUSDT',
  'SUIUSDT', 'INJUSDT', 'SEIUSDT', 'TIAUSDT', 'WLDUSDT',
];

// Extended pattern types with additional patterns
const EXTENDED_PATTERN_TYPES = [
  { id: 'DPD', name: 'DPD (Down-Push-Down)', category: 'frequency' },
  { id: 'UPU', name: 'UPU (Up-Push-Up)', category: 'frequency' },
  { id: 'UPD', name: 'UPD (Up-Push-Down)', category: 'frequency' },
  { id: 'DPU', name: 'DPU (Down-Push-Up)', category: 'frequency' },
  { id: 'Flag', name: 'Flag Pattern', category: 'classic' },
  { id: 'Pennant', name: 'Pennant', category: 'classic' },
  { id: 'Triangle', name: 'Triangle', category: 'classic' },
  { id: 'Wedge', name: 'Wedge', category: 'classic' },
  { id: 'HeadShoulders', name: 'Head & Shoulders', category: 'reversal' },
  { id: 'DoubleTop', name: 'Double Top', category: 'reversal' },
  { id: 'DoubleBottom', name: 'Double Bottom', category: 'reversal' },
  { id: 'TripleTop', name: 'Triple Top', category: 'reversal' },
  { id: 'TripleBottom', name: 'Triple Bottom', category: 'reversal' },
  { id: 'Channel', name: 'Channel Breakout', category: 'momentum' },
  { id: 'Other', name: 'Khac', category: 'other' },
];

// Extended timeframes
const EXTENDED_TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W'];

// Emotion emojis for picker
const EMOTION_EMOJIS = [
  { id: 'calm', emoji: '😌', label: 'Bình tĩnh', color: COLORS.success },
  { id: 'confident', emoji: '💪', label: 'Tự tin', color: COLORS.gold },
  { id: 'focused', emoji: '🎯', label: 'Tập trung', color: COLORS.cyan },
  { id: 'anxious', emoji: '😰', label: 'Lo lắng', color: COLORS.warning },
  { id: 'greedy', emoji: '🤑', label: 'Tham lam', color: COLORS.error },
  { id: 'fomo', emoji: '😱', label: 'FOMO', color: COLORS.error },
  { id: 'fearful', emoji: '😨', label: 'Sợ hãi', color: COLORS.textMuted },
  { id: 'revenge', emoji: '😤', label: 'Trả thù', color: COLORS.burgundy },
  { id: 'frustrated', emoji: '😤', label: 'Bực bội', color: COLORS.error },
  { id: 'hopeful', emoji: '🙏', label: 'Hy vọng', color: COLORS.purple },
  { id: 'excited', emoji: '🚀', label: 'Phấn khích', color: COLORS.gold },
  { id: 'neutral', emoji: '😐', label: 'Trung tính', color: COLORS.textSecondary },
];

// ==================== MAIN COMPONENT ====================

const TradingJournalScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Route params
  const {
    entryId,
    mode = 'create',
    date,
    // Pre-fill from scanner or paper trade
    prefillSymbol,
    prefillDirection,
    prefillPattern,
    prefillGrade,
    prefillTimeframe,
    prefillEntryPrice,
    prefillExitPrice,
    prefillStopLoss,
    prefillTakeProfit,
    prefillPnl,
    prefillResult,
    isPaperTrade = true,
  } = route.params || {};

  // State - Loading & User
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userTier, setUserTier] = useState('FREE');
  const [userRole, setUserRole] = useState(null);

  // State - Trade Data (Basic)
  const [symbol, setSymbol] = useState(prefillSymbol?.toUpperCase() || '');
  const [direction, setDirection] = useState(prefillDirection || TRADE_DIRECTIONS.LONG);
  const [patternType, setPatternType] = useState(prefillPattern || '');
  const [patternGrade, setPatternGrade] = useState(prefillGrade || '');
  const [timeframe, setTimeframe] = useState(prefillTimeframe || '');

  // State - Prices
  const [entryPrice, setEntryPrice] = useState(prefillEntryPrice?.toString() || '');
  const [exitPrice, setExitPrice] = useState(prefillExitPrice?.toString() || '');
  const [stopLoss, setStopLoss] = useState(prefillStopLoss?.toString() || '');
  const [takeProfit1, setTakeProfit1] = useState(prefillTakeProfit?.toString() || '');

  // State - Position
  const [positionSize, setPositionSize] = useState('');

  // State - Result
  const [tradeResult, setTradeResult] = useState(prefillResult || '');
  const [pnlAmount, setPnlAmount] = useState(prefillPnl?.toString() || '');
  const [pnlPercent, setPnlPercent] = useState('');

  // State - Discipline
  const [disciplineChecklist, setDisciplineChecklist] = useState({});

  // State - Emotions
  const [emotionBefore, setEmotionBefore] = useState('');
  const [emotionAfter, setEmotionAfter] = useState('');

  // State - Notes
  const [lessonsLearned, setLessonsLearned] = useState('');

  // State - Screenshot
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [screenshotAsset, setScreenshotAsset] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // State - Paper Trade Flag
  const [isPaperTradeEntry, setIsPaperTradeEntry] = useState(isPaperTrade);

  // State - UI
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);
  const [showPatternSelector, setShowPatternSelector] = useState(false);
  const [showGradeSelector, setShowGradeSelector] = useState(false);
  const [showTimeframeSelector, setShowTimeframeSelector] = useState(false);
  const [showResultSelector, setShowResultSelector] = useState(false);
  const [showEmotionPicker, setShowEmotionPicker] = useState(null); // 'before' | 'after' | null

  // Refs
  const scrollViewRef = useRef(null);

  // Filtered symbols for autocomplete
  const filteredSymbols = useMemo(() => {
    if (!symbol || symbol.length < 1) return COMMON_SYMBOLS.slice(0, 8);
    const upper = symbol.toUpperCase();
    return COMMON_SYMBOLS.filter(s => s.includes(upper)).slice(0, 8);
  }, [symbol]);

  // Access check
  const access = checkCalendarAccess('trading_journal', userTier, userRole);

  // Calculate metrics
  const calculatedMetrics = useMemo(() => {
    const entry = parseFloat(entryPrice) || 0;
    const exit = parseFloat(exitPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(takeProfit1) || 0;
    const size = parseFloat(positionSize) || 0;

    let pnl_percent = null;
    let pnl_amount = null;
    let rr_ratio = null;

    if (entry > 0 && exit > 0) {
      if (direction === TRADE_DIRECTIONS.LONG) {
        pnl_percent = ((exit - entry) / entry) * 100;
      } else {
        pnl_percent = ((entry - exit) / entry) * 100;
      }
      if (size > 0) {
        pnl_amount = (pnl_percent / 100) * size * entry;
      }
    }

    if (entry > 0 && sl > 0 && tp > 0) {
      const risk = Math.abs(entry - sl);
      const reward = Math.abs(tp - entry);
      rr_ratio = risk > 0 ? (reward / risk) : null;
    }

    return {
      pnl_percent,
      pnl_amount,
      rr_ratio,
    };
  }, [entryPrice, exitPrice, stopLoss, takeProfit1, positionSize, direction]);

  // Initialize
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);

          // Get user tier
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier, role')
            .eq('id', user.id)
            .single();

          if (profile) {
            setUserTier(profile.subscription_tier || 'FREE');
            setUserRole(profile.role);
          }

          // Load existing entry if editing
          if (mode === 'edit' && entryId) {
            await loadEntry(user.id, entryId);
          }
        }
      } catch (error) {
        console.error('[TradingJournal] Init error:', error);
      }
      setLoading(false);
    };

    init();
  }, [mode, entryId]);

  // Load existing entry
  const loadEntry = async (uid, eid) => {
    try {
      const result = await getEntryById(uid, eid);
      if (result.success && result.data) {
        const data = result.data;
        setSymbol(data.symbol || '');
        setDirection(data.direction || TRADE_DIRECTIONS.LONG);
        setPatternType(data.pattern_type || '');
        setPatternGrade(data.pattern_grade || '');
        setTimeframe(data.timeframe || '');
        setEntryPrice(data.entry_price?.toString() || '');
        setExitPrice(data.exit_price?.toString() || '');
        setStopLoss(data.stop_loss?.toString() || '');
        setTakeProfit1(data.take_profit_1?.toString() || '');
        setPositionSize(data.position_size?.toString() || '');
        setTradeResult(data.result || '');
        setPnlAmount(data.pnl_amount?.toString() || '');
        setPnlPercent(data.pnl_percent?.toString() || '');
        setDisciplineChecklist(data.discipline_checklist || {});
        setEmotionBefore(data.pre_trade_emotion || '');
        setEmotionAfter(data.post_trade_emotion || '');
        setLessonsLearned(data.lessons_learned || '');
        // Handle screenshots array
        if (data.screenshots && data.screenshots.length > 0) {
          setScreenshotUrl(data.screenshots[0]?.url || '');
        }
        // Check if paper trade from source field
        setIsPaperTradeEntry(data.source === 'paper_trade' || data.source === 'manual');
      }
    } catch (error) {
      console.error('[TradingJournal] Load error:', error);
      Alert.alert('Loi', 'Khong the tai giao dich');
    }
  };

  // Handle symbol selection from dropdown
  const handleSymbolSelect = (selectedSymbol) => {
    setSymbol(selectedSymbol);
    setShowSymbolDropdown(false);
  };

  // Handle image picker
  const handlePickImage = async () => {
    try {
      const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Can quyen truy cap', 'Vui long cho phep truy cap thu vien anh');
        return;
      }

      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets?.length > 0) {
        setScreenshotAsset(result.assets[0]);
        setScreenshotUrl(result.assets[0].uri);
      }
    } catch (error) {
      console.error('[TradingJournal] Image picker error:', error);
      Alert.alert('Loi', 'Khong the chon anh');
    }
  };

  // Handle camera
  const handleTakePhoto = async () => {
    try {
      const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Can quyen truy cap', 'Vui long cho phep su dung camera');
        return;
      }

      const result = await ExpoImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets?.length > 0) {
        setScreenshotAsset(result.assets[0]);
        setScreenshotUrl(result.assets[0].uri);
      }
    } catch (error) {
      console.error('[TradingJournal] Camera error:', error);
      Alert.alert('Loi', 'Khong the mo camera');
    }
  };

  // Remove screenshot
  const handleRemoveScreenshot = () => {
    setScreenshotUrl('');
    setScreenshotAsset(null);
  };

  // Upload screenshot to Supabase storage
  const uploadScreenshot = async () => {
    if (!screenshotAsset) return null;

    try {
      setUploadingImage(true);
      const fileExt = screenshotAsset.uri.split('.').pop() || 'jpg';
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Read file and upload
      const response = await fetch(screenshotAsset.uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('trading-screenshots')
        .upload(fileName, blob, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('trading-screenshots')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('[TradingJournal] Upload error:', error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!symbol.trim()) {
      Alert.alert('Loi', 'Vui long nhap ma coin/symbol');
      return;
    }

    if (!entryPrice || parseFloat(entryPrice) <= 0) {
      Alert.alert('Loi', 'Vui long nhap gia entry');
      return;
    }

    if (!access.allowed) {
      Alert.alert('Han che', access.reason);
      return;
    }

    setSaving(true);

    try {
      // Upload screenshot if new
      let finalScreenshotUrl = screenshotUrl;
      if (screenshotAsset && screenshotAsset.uri === screenshotUrl) {
        const uploadedUrl = await uploadScreenshot();
        if (uploadedUrl) {
          finalScreenshotUrl = uploadedUrl;
        }
      }

      // Prepare screenshots array
      const screenshots = finalScreenshotUrl
        ? [{ url: finalScreenshotUrl, type: 'analysis', uploaded_at: new Date().toISOString() }]
        : [];

      // Use calculated or manual P/L
      const finalPnlPercent = pnlPercent ? parseFloat(pnlPercent) : calculatedMetrics.pnl_percent;
      const finalPnlAmount = pnlAmount ? parseFloat(pnlAmount) : calculatedMetrics.pnl_amount;

      // Auto-determine result if not set
      let finalResult = tradeResult;
      if (!finalResult && finalPnlAmount !== null) {
        if (finalPnlAmount > 0) finalResult = TRADE_RESULTS.WIN;
        else if (finalPnlAmount < 0) finalResult = TRADE_RESULTS.LOSS;
        else finalResult = TRADE_RESULTS.BREAKEVEN;
      }

      const entryData = {
        symbol: symbol.toUpperCase().trim(),
        direction,
        pattern_type: patternType || null,
        pattern_grade: patternGrade || null,
        timeframe: timeframe || null,
        entry_price: parseFloat(entryPrice),
        exit_price: exitPrice ? parseFloat(exitPrice) : null,
        stop_loss: stopLoss ? parseFloat(stopLoss) : null,
        take_profit_1: takeProfit1 ? parseFloat(takeProfit1) : null,
        position_size: positionSize ? parseFloat(positionSize) : null,
        risk_reward_ratio: calculatedMetrics.rr_ratio,
        pnl_amount: finalPnlAmount,
        pnl_percent: finalPnlPercent,
        result: finalResult || null,
        discipline_checklist: disciplineChecklist,
        pre_trade_emotion: emotionBefore || null,
        post_trade_emotion: emotionAfter || null,
        lessons_learned: lessonsLearned.trim() || null,
        screenshots,
        source: isPaperTradeEntry ? 'paper_trade' : 'manual',
        trade_date: date || new Date().toISOString().split('T')[0],
      };

      let result;
      if (mode === 'edit' && entryId) {
        result = await updateTradingEntry(userId, entryId, entryData);
      } else {
        result = await createTradingEntry(userId, entryData, userTier, userRole);
      }

      if (result.success) {
        navigation.goBack();
      } else {
        Alert.alert('Loi', result.error || 'Khong the luu');
      }
    } catch (error) {
      console.error('[TradingJournal] Save error:', error);
      Alert.alert('Loi', 'Khong the luu giao dich');
    }

    setSaving(false);
  };

  // Handle delete
  const handleDelete = () => {
    Alert.alert(
      'Xóa giao dịch',
      'Bạn có chắc muốn xóa giao dịch này? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteTradingEntry(userId, entryId);
              if (result.success) {
                navigation.goBack();
              } else {
                Alert.alert('Lỗi', result.error);
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa');
            }
          },
        },
      ]
    );
  };

  // Get emotion display
  const getEmotionDisplay = (emotionId) => {
    const emotion = EMOTION_EMOJIS.find(e => e.id === emotionId);
    return emotion || null;
  };

  // Render Emotion Picker Modal
  const renderEmotionPicker = () => (
    <Modal
      visible={showEmotionPicker !== null}
      transparent
      animationType="fade"
      onRequestClose={() => setShowEmotionPicker(null)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowEmotionPicker(null)}
      >
        <View style={styles.emotionPickerModal}>
          <View style={styles.emotionPickerHeader}>
            <Text style={styles.emotionPickerTitle}>
              {showEmotionPicker === 'before' ? 'Cảm xúc trước giao dịch' : 'Cảm xúc sau giao dịch'}
            </Text>
            <TouchableOpacity onPress={() => setShowEmotionPicker(null)}>
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.emotionGrid}>
            {EMOTION_EMOJIS.map((emotion) => {
              const isSelected = showEmotionPicker === 'before'
                ? emotionBefore === emotion.id
                : emotionAfter === emotion.id;

              return (
                <TouchableOpacity
                  key={emotion.id}
                  style={[
                    styles.emotionItem,
                    isSelected && { backgroundColor: emotion.color + '30', borderColor: emotion.color },
                  ]}
                  onPress={() => {
                    if (showEmotionPicker === 'before') {
                      setEmotionBefore(emotion.id);
                    } else {
                      setEmotionAfter(emotion.id);
                    }
                    setShowEmotionPicker(null);
                  }}
                >
                  <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                  <Text style={[styles.emotionLabel, isSelected && { color: emotion.color }]}>
                    {emotion.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient colors={GRADIENTS.darkPurple} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={COLORS.purple} />
        <Text style={styles.loadingText}>Dang tai...</Text>
      </SafeAreaView>
    );
  }

  // Access denied state
  if (!access.allowed) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={GRADIENTS.darkPurple} style={StyleSheet.absoluteFill} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nhat ky giao dich</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.lockedContainer}>
          <AlertTriangle size={48} color={COLORS.warning} />
          <Text style={styles.lockedTitle}>Tinh nang cao cap</Text>
          <Text style={styles.lockedText}>{access.reason}</Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => navigation.navigate('TierUpgrade')}
          >
            <Text style={styles.upgradeButtonText}>Nang cap</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={GRADIENTS.darkPurple} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {mode === 'edit' ? 'Chinh sua giao dich' : 'Ghi nhat ky'}
        </Text>

        <View style={styles.headerActions}>
          {mode === 'edit' && (
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <Trash2 size={20} color={COLORS.error} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, (saving || uploadingImage) && styles.saveButtonDisabled]}
            disabled={saving || uploadingImage || !symbol.trim() || !entryPrice}
          >
            {saving || uploadingImage ? (
              <ActivityIndicator size="small" color={COLORS.bgDarkest} />
            ) : (
              <>
                <Save size={18} color={COLORS.bgDarkest} />
                <Text style={styles.saveButtonText}>Lưu</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Paper Trade Toggle */}
          <View style={styles.paperTradeToggle}>
            <TouchableOpacity
              style={[
                styles.paperTradeButton,
                isPaperTradeEntry && styles.paperTradeButtonActive,
              ]}
              onPress={() => setIsPaperTradeEntry(true)}
            >
              <FileText size={18} color={isPaperTradeEntry ? COLORS.bgDarkest : COLORS.textMuted} />
              <Text style={[
                styles.paperTradeText,
                isPaperTradeEntry && styles.paperTradeTextActive,
              ]}>
                Paper Trade
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paperTradeButton,
                !isPaperTradeEntry && styles.paperTradeButtonActive,
              ]}
              onPress={() => setIsPaperTradeEntry(false)}
            >
              <BarChart3 size={18} color={!isPaperTradeEntry ? COLORS.bgDarkest : COLORS.textMuted} />
              <Text style={[
                styles.paperTradeText,
                !isPaperTradeEntry && styles.paperTradeTextActive,
              ]}>
                Real Trade
              </Text>
            </TouchableOpacity>
          </View>

          {/* Symbol Input with Autocomplete */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Symbol *</Text>
            <View style={styles.symbolInputContainer}>
              <Search size={20} color={COLORS.textMuted} style={styles.symbolSearchIcon} />
              <TextInput
                style={styles.symbolInput}
                placeholder="VD: BTCUSDT"
                placeholderTextColor={COLORS.textMuted}
                value={symbol}
                onChangeText={(text) => {
                  setSymbol(text.toUpperCase());
                  setShowSymbolDropdown(true);
                }}
                onFocus={() => setShowSymbolDropdown(true)}
                autoCapitalize="characters"
              />
              {symbol.length > 0 && (
                <TouchableOpacity onPress={() => setSymbol('')} style={styles.symbolClearButton}>
                  <X size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Symbol Dropdown */}
            {showSymbolDropdown && filteredSymbols.length > 0 && (
              <View style={styles.symbolDropdown}>
                {filteredSymbols.map((s, index) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.symbolDropdownItem,
                      index === filteredSymbols.length - 1 && { borderBottomWidth: 0 },
                    ]}
                    onPress={() => handleSymbolSelect(s)}
                  >
                    <Text style={styles.symbolDropdownText}>{s}</Text>
                    {symbol === s && <Check size={16} color={COLORS.success} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Direction Toggle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Huong giao dich *</Text>
            <View style={styles.directionRow}>
              <TouchableOpacity
                style={[
                  styles.directionButton,
                  direction === TRADE_DIRECTIONS.LONG && styles.directionButtonLong,
                ]}
                onPress={() => setDirection(TRADE_DIRECTIONS.LONG)}
              >
                <TrendingUp
                  size={22}
                  color={direction === TRADE_DIRECTIONS.LONG ? COLORS.success : COLORS.textMuted}
                />
                <Text style={[
                  styles.directionText,
                  direction === TRADE_DIRECTIONS.LONG && styles.directionTextLong,
                ]}>
                  LONG
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.directionButton,
                  direction === TRADE_DIRECTIONS.SHORT && styles.directionButtonShort,
                ]}
                onPress={() => setDirection(TRADE_DIRECTIONS.SHORT)}
              >
                <TrendingDown
                  size={22}
                  color={direction === TRADE_DIRECTIONS.SHORT ? COLORS.error : COLORS.textMuted}
                />
                <Text style={[
                  styles.directionText,
                  direction === TRADE_DIRECTIONS.SHORT && styles.directionTextShort,
                ]}>
                  SHORT
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pattern, Grade, Timeframe Row */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pattern & Setup</Text>

            {/* Pattern Selector */}
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowPatternSelector(!showPatternSelector)}
            >
              <Text style={[styles.selectorText, patternType && { color: COLORS.purple }]}>
                {patternType || 'Chọn pattern...'}
              </Text>
              <ChevronDown size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            {showPatternSelector && (
              <View style={styles.optionsGrid}>
                {EXTENDED_PATTERN_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.optionChip,
                      patternType === type.id && styles.optionChipSelected,
                    ]}
                    onPress={() => {
                      setPatternType(patternType === type.id ? '' : type.id);
                      setShowPatternSelector(false);
                    }}
                  >
                    <Text style={[
                      styles.optionChipText,
                      patternType === type.id && styles.optionChipTextSelected,
                    ]}>
                      {type.id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Grade & Timeframe Row */}
            <View style={styles.gradeTimeframeRow}>
              {/* Grade Selector */}
              <View style={styles.gradeContainer}>
                <Text style={styles.subLabel}>Grade</Text>
                <TouchableOpacity
                  style={styles.smallSelector}
                  onPress={() => setShowGradeSelector(!showGradeSelector)}
                >
                  <Text style={[styles.smallSelectorText, patternGrade && { color: COLORS.gold }]}>
                    {patternGrade || 'Grade'}
                  </Text>
                </TouchableOpacity>

                {showGradeSelector && (
                  <View style={styles.gradeOptions}>
                    {['A', 'B', 'C', 'D'].map((grade) => (
                      <TouchableOpacity
                        key={grade}
                        style={[
                          styles.gradeChip,
                          patternGrade === grade && styles.gradeChipSelected,
                        ]}
                        onPress={() => {
                          setPatternGrade(patternGrade === grade ? '' : grade);
                          setShowGradeSelector(false);
                        }}
                      >
                        <Text style={[
                          styles.gradeChipText,
                          patternGrade === grade && styles.gradeChipTextSelected,
                        ]}>
                          {grade}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Timeframe Selector */}
              <View style={styles.timeframeContainer}>
                <Text style={styles.subLabel}>Khung gio</Text>
                <TouchableOpacity
                  style={styles.smallSelector}
                  onPress={() => setShowTimeframeSelector(!showTimeframeSelector)}
                >
                  <Clock size={14} color={COLORS.textMuted} />
                  <Text style={[styles.smallSelectorText, timeframe && { color: COLORS.cyan }]}>
                    {timeframe || 'TF'}
                  </Text>
                </TouchableOpacity>

                {showTimeframeSelector && (
                  <View style={styles.timeframeOptions}>
                    {EXTENDED_TIMEFRAMES.map((tf) => (
                      <TouchableOpacity
                        key={tf}
                        style={[
                          styles.tfChip,
                          timeframe === tf && styles.tfChipSelected,
                        ]}
                        onPress={() => {
                          setTimeframe(timeframe === tf ? '' : tf);
                          setShowTimeframeSelector(false);
                        }}
                      >
                        <Text style={[
                          styles.tfChipText,
                          timeframe === tf && styles.tfChipTextSelected,
                        ]}>
                          {tf}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Prices Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gia & Vi the</Text>

            <View style={styles.priceGrid}>
              <View style={styles.priceInput}>
                <Text style={styles.priceLabel}>Entry *</Text>
                <TextInput
                  style={styles.priceField}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  value={entryPrice}
                  onChangeText={setEntryPrice}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.priceInput}>
                <Text style={styles.priceLabel}>Exit</Text>
                <TextInput
                  style={styles.priceField}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  value={exitPrice}
                  onChangeText={setExitPrice}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.priceInput}>
                <Text style={[styles.priceLabel, { color: COLORS.error }]}>Stop Loss</Text>
                <TextInput
                  style={[styles.priceField, styles.priceFieldSL]}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  value={stopLoss}
                  onChangeText={setStopLoss}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.priceInput}>
                <Text style={[styles.priceLabel, { color: COLORS.success }]}>Take Profit</Text>
                <TextInput
                  style={[styles.priceField, styles.priceFieldTP]}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  value={takeProfit1}
                  onChangeText={setTakeProfit1}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.priceInput}>
                <Text style={styles.priceLabel}>Position Size</Text>
                <TextInput
                  style={styles.priceField}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  value={positionSize}
                  onChangeText={setPositionSize}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          {/* P/L Display */}
          {(calculatedMetrics.pnl_percent !== null || pnlPercent) && (
            <View style={[
              styles.pnlDisplay,
              {
                borderColor: (parseFloat(pnlPercent) || calculatedMetrics.pnl_percent || 0) >= 0
                  ? COLORS.success + '50'
                  : COLORS.error + '50'
              },
            ]}>
              <Text style={styles.pnlLabel}>P/L</Text>
              <Text style={[
                styles.pnlValue,
                {
                  color: (parseFloat(pnlPercent) || calculatedMetrics.pnl_percent || 0) >= 0
                    ? COLORS.success
                    : COLORS.error
                },
              ]}>
                {(parseFloat(pnlPercent) || calculatedMetrics.pnl_percent || 0) >= 0 ? '+' : ''}
                {(parseFloat(pnlPercent) || calculatedMetrics.pnl_percent || 0).toFixed(2)}%
              </Text>
              {calculatedMetrics.rr_ratio && (
                <Text style={styles.rrValue}>R:R 1:{calculatedMetrics.rr_ratio.toFixed(1)}</Text>
              )}
            </View>
          )}

          {/* Manual P/L Override */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>P/L (Thu cong)</Text>
            <View style={styles.pnlInputRow}>
              <View style={styles.pnlInputContainer}>
                <Text style={styles.pnlInputLabel}>So tien (USDT)</Text>
                <TextInput
                  style={styles.pnlInput}
                  placeholder="+100 hoac -50"
                  placeholderTextColor={COLORS.textMuted}
                  value={pnlAmount}
                  onChangeText={setPnlAmount}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.pnlInputContainer}>
                <Text style={styles.pnlInputLabel}>Phan tram (%)</Text>
                <TextInput
                  style={styles.pnlInput}
                  placeholder="+5.2 hoac -2.1"
                  placeholderTextColor={COLORS.textMuted}
                  value={pnlPercent}
                  onChangeText={setPnlPercent}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Result Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ket qua</Text>
            <View style={styles.resultRow}>
              {[
                { id: TRADE_RESULTS.WIN, label: 'WIN', color: COLORS.success },
                { id: TRADE_RESULTS.LOSS, label: 'LOSS', color: COLORS.error },
                { id: TRADE_RESULTS.BREAKEVEN, label: 'BE', color: COLORS.textMuted },
              ].map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={[
                    styles.resultChip,
                    tradeResult === result.id && {
                      backgroundColor: result.color + '20',
                      borderColor: result.color,
                    },
                  ]}
                  onPress={() => setTradeResult(tradeResult === result.id ? '' : result.id)}
                >
                  <Text style={[
                    styles.resultChipText,
                    tradeResult === result.id && { color: result.color },
                  ]}>
                    {result.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Emotions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tam ly giao dich</Text>

            <View style={styles.emotionsRow}>
              {/* Emotion Before */}
              <View style={styles.emotionContainer}>
                <Text style={styles.emotionTitle}>Truoc khi vao lenh</Text>
                <TouchableOpacity
                  style={styles.emotionSelector}
                  onPress={() => setShowEmotionPicker('before')}
                >
                  {emotionBefore ? (
                    <>
                      <Text style={styles.selectedEmoji}>
                        {getEmotionDisplay(emotionBefore)?.emoji}
                      </Text>
                      <Text style={[
                        styles.selectedEmotionLabel,
                        { color: getEmotionDisplay(emotionBefore)?.color },
                      ]}>
                        {getEmotionDisplay(emotionBefore)?.label}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Smile size={24} color={COLORS.textMuted} />
                      <Text style={styles.emotionPlaceholder}>Chọn...</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Emotion After */}
              <View style={styles.emotionContainer}>
                <Text style={styles.emotionTitle}>Sau khi dong lenh</Text>
                <TouchableOpacity
                  style={styles.emotionSelector}
                  onPress={() => setShowEmotionPicker('after')}
                >
                  {emotionAfter ? (
                    <>
                      <Text style={styles.selectedEmoji}>
                        {getEmotionDisplay(emotionAfter)?.emoji}
                      </Text>
                      <Text style={[
                        styles.selectedEmotionLabel,
                        { color: getEmotionDisplay(emotionAfter)?.color },
                      ]}>
                        {getEmotionDisplay(emotionAfter)?.label}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Smile size={24} color={COLORS.textMuted} />
                      <Text style={styles.emotionPlaceholder}>Chọn...</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Discipline Checklist */}
          <View style={styles.section}>
            <DisciplineChecklist
              checklist={disciplineChecklist}
              onChange={setDisciplineChecklist}
              showScore
            />
          </View>

          {/* Lessons Learned */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bai hoc rut ra</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Ban hoc duoc gi tu lenh nay? Dieu gi lam tot, dieu gi can cai thien?"
              placeholderTextColor={COLORS.textMuted}
              value={lessonsLearned}
              onChangeText={setLessonsLearned}
              multiline
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{lessonsLearned.length}/1000</Text>
          </View>

          {/* Screenshot Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Screenshot (tuy chon)</Text>

            {screenshotUrl ? (
              <View style={styles.screenshotPreview}>
                <Image
                  source={{ uri: screenshotUrl }}
                  style={styles.screenshotImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeScreenshotButton}
                  onPress={handleRemoveScreenshot}
                >
                  <X size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.screenshotButtons}>
                <TouchableOpacity
                  style={styles.screenshotButton}
                  onPress={handlePickImage}
                >
                  <ImageIcon size={24} color={COLORS.purple} />
                  <Text style={styles.screenshotButtonText}>Thu vien</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.screenshotButton}
                  onPress={handleTakePhoto}
                >
                  <Camera size={24} color={COLORS.purple} />
                  <Text style={styles.screenshotButtonText}>Camera</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Emotion Picker Modal */}
      {renderEmotionPicker()}
    </SafeAreaView>
  );
};

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgDarkest,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerButton: {
    padding: SPACING.xs,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },

  // Paper Trade Toggle
  paperTradeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  paperTradeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  paperTradeButtonActive: {
    backgroundColor: COLORS.gold,
  },
  paperTradeText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
  paperTradeTextActive: {
    color: COLORS.bgDarkest,
  },

  // Section
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Symbol Input
  symbolInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    paddingHorizontal: SPACING.md,
  },
  symbolSearchIcon: {
    marginRight: SPACING.sm,
  },
  symbolInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  symbolClearButton: {
    padding: SPACING.xs,
  },
  symbolDropdown: {
    backgroundColor: COLORS.bgMid,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: SPACING.xs,
    maxHeight: 250,
  },
  symbolDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  symbolDropdownText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Direction
  directionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  directionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.sm,
  },
  directionButtonLong: {
    backgroundColor: COLORS.success + '15',
    borderColor: COLORS.success + '50',
  },
  directionButtonShort: {
    backgroundColor: COLORS.error + '15',
    borderColor: COLORS.error + '50',
  },
  directionText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textMuted,
  },
  directionTextLong: {
    color: COLORS.success,
  },
  directionTextShort: {
    color: COLORS.error,
  },

  // Selectors
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: SPACING.sm,
  },
  selectorText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },

  // Options Grid
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  optionChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionChipSelected: {
    backgroundColor: COLORS.purple + '20',
    borderColor: COLORS.purple,
  },
  optionChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  optionChipTextSelected: {
    color: COLORS.purple,
  },

  // Grade & Timeframe Row
  gradeTimeframeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  gradeContainer: {
    flex: 1,
  },
  timeframeContainer: {
    flex: 1,
  },
  subLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  smallSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  smallSelectorText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  gradeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  gradeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gradeChipSelected: {
    backgroundColor: COLORS.gold + '20',
    borderColor: COLORS.gold,
  },
  gradeChipText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textMuted,
  },
  gradeChipTextSelected: {
    color: COLORS.gold,
  },
  timeframeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  tfChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.sm,
  },
  tfChipSelected: {
    backgroundColor: COLORS.cyan + '20',
  },
  tfChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  tfChipTextSelected: {
    color: COLORS.cyan,
  },

  // Prices
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  priceInput: {
    width: '48%',
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xxs,
  },
  priceField: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    padding: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  priceFieldSL: {
    borderColor: COLORS.error + '30',
  },
  priceFieldTP: {
    borderColor: COLORS.success + '30',
  },

  // P/L Display
  pnlDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  pnlLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  pnlValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  rrValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Manual P/L
  pnlInputRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  pnlInputContainer: {
    flex: 1,
  },
  pnlInputLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  pnlInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    padding: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },

  // Result
  resultRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  resultChip: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultChipText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textMuted,
  },

  // Emotions
  emotionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  emotionContainer: {
    flex: 1,
  },
  emotionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  emotionSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.sm,
  },
  selectedEmoji: {
    fontSize: 24,
  },
  selectedEmotionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  emotionPlaceholder: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Emotion Picker Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emotionPickerModal: {
    backgroundColor: COLORS.bgMid,
    borderRadius: BORDER_RADIUS.xl,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emotionPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  emotionPickerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  emotionItem: {
    width: (SCREEN_WIDTH - SPACING.lg * 4 - SPACING.sm * 3) / 4,
    aspectRatio: 0.85,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.xs,
  },
  emotionEmoji: {
    fontSize: 28,
  },
  emotionLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Notes
  notesInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },

  // Screenshot
  screenshotButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  screenshotButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.sm,
  },
  screenshotButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  screenshotPreview: {
    position: 'relative',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  screenshotImage: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.md,
  },
  removeScreenshotButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: BORDER_RADIUS.full,
    padding: SPACING.sm,
  },

  bottomSpacing: {
    height: 100,
  },

  // Locked state
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  lockedTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  lockedText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  upgradeButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  upgradeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },
});

export default TradingJournalScreen;
