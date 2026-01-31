/**
 * TradingJournalScreen.js
 * Screen for creating/editing trading journal entries
 *
 * Created: January 28, 2026
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Save,
  Trash2,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Camera,
  AlertTriangle,
} from 'lucide-react-native';

import { COLORS, TYPOGRAPHY, SPACING, GRADIENTS, BORDER_RADIUS } from '../../utils/tokens';
import { supabase } from '../../services/supabase';
import {
  createTradingEntry,
  updateTradingEntry,
  deleteTradingEntry,
  calculateTradeMetrics,
  TRADE_DIRECTIONS,
  TRADE_RESULTS,
  PATTERN_TYPES,
  PATTERN_GRADES,
  TIMEFRAMES,
  TRADE_EMOTIONS,
  DISCIPLINE_CHECKLIST_ITEMS,
} from '../../services/tradingJournalService';
import { checkCalendarAccess, getTradingDailyLimit } from '../../config/calendarAccessControl';
import DisciplineChecklist from '../../components/VisionBoard/DisciplineChecklist';

const TradingJournalScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Route params
  const {
    entryId,
    mode = 'create',
    date,
    // Pre-fill from scanner
    prefillSymbol,
    prefillDirection,
    prefillPattern,
    prefillGrade,
    prefillTimeframe,
  } = route.params || {};

  // State
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userTier, setUserTier] = useState('FREE');
  const [userRole, setUserRole] = useState(null);

  // Trade data
  const [symbol, setSymbol] = useState(prefillSymbol?.toUpperCase() || '');
  const [direction, setDirection] = useState(prefillDirection || TRADE_DIRECTIONS.LONG);
  const [patternType, setPatternType] = useState(prefillPattern || '');
  const [patternGrade, setPatternGrade] = useState(prefillGrade || '');
  const [timeframe, setTimeframe] = useState(prefillTimeframe || '');

  // Prices
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit1, setTakeProfit1] = useState('');
  const [takeProfit2, setTakeProfit2] = useState('');
  const [takeProfit3, setTakeProfit3] = useState('');

  // Position
  const [positionSize, setPositionSize] = useState('');
  const [leverage, setLeverage] = useState('1');

  // Discipline
  const [disciplineChecklist, setDisciplineChecklist] = useState({});

  // Emotions
  const [emotionPre, setEmotionPre] = useState('');
  const [emotionDuring, setEmotionDuring] = useState('');
  const [emotionPost, setEmotionPost] = useState('');

  // Notes
  const [entryReason, setEntryReason] = useState('');
  const [exitReason, setExitReason] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');

  // Ratings
  const [setupRating, setSetupRating] = useState(3);
  const [executionRating, setExecutionRating] = useState(3);
  const [managementRating, setManagementRating] = useState(3);

  // Result
  const [tradeResult, setTradeResult] = useState(TRADE_RESULTS.OPEN);

  // UI state
  const [showPatternSelector, setShowPatternSelector] = useState(false);
  const [showGradeSelector, setShowGradeSelector] = useState(false);
  const [showTimeframeSelector, setShowTimeframeSelector] = useState(false);
  const [showEmotionSelector, setShowEmotionSelector] = useState(null);

  // Access check
  const access = checkCalendarAccess('trading_journal', userTier, userRole);

  // Calculate metrics
  const metrics = useMemo(() => {
    return calculateTradeMetrics({
      entry_price: parseFloat(entryPrice) || 0,
      exit_price: parseFloat(exitPrice) || null,
      stop_loss: parseFloat(stopLoss) || null,
      take_profit_1: parseFloat(takeProfit1) || null,
      position_size: parseFloat(positionSize) || 0,
      leverage: parseFloat(leverage) || 1,
      direction,
      trade_result: tradeResult,
      discipline_checklist: disciplineChecklist,
    });
  }, [entryPrice, exitPrice, stopLoss, takeProfit1, positionSize, leverage, direction, tradeResult, disciplineChecklist]);

  // Initialize
  useEffect(() => {
    const init = async () => {
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
      setLoading(false);
    };

    init();
  }, [mode, entryId]);

  // Load existing entry
  const loadEntry = async (uid, eid) => {
    try {
      const { data, error } = await supabase
        .from('trading_journal_entries')
        .select('*')
        .eq('id', eid)
        .eq('user_id', uid)
        .single();

      if (error) throw error;

      if (data) {
        setSymbol(data.symbol || '');
        setDirection(data.direction || TRADE_DIRECTIONS.LONG);
        setPatternType(data.pattern_type || '');
        setPatternGrade(data.pattern_grade || '');
        setTimeframe(data.timeframe || '');
        setEntryPrice(data.entry_price?.toString() || '');
        setExitPrice(data.exit_price?.toString() || '');
        setStopLoss(data.stop_loss?.toString() || '');
        setTakeProfit1(data.take_profit_1?.toString() || '');
        setTakeProfit2(data.take_profit_2?.toString() || '');
        setTakeProfit3(data.take_profit_3?.toString() || '');
        setPositionSize(data.position_size?.toString() || '');
        setLeverage(data.leverage?.toString() || '1');
        setDisciplineChecklist(data.discipline_checklist || {});
        setEmotionPre(data.emotion_pre_trade || '');
        setEmotionDuring(data.emotion_during_trade || '');
        setEmotionPost(data.emotion_post_trade || '');
        setEntryReason(data.entry_reason || '');
        setExitReason(data.exit_reason || '');
        setLessonsLearned(data.lessons_learned || '');
        setSetupRating(data.setup_rating || 3);
        setExecutionRating(data.execution_rating || 3);
        setManagementRating(data.management_rating || 3);
        setTradeResult(data.trade_result || TRADE_RESULTS.OPEN);
      }
    } catch (error) {
      console.error('[TradingJournal] Load error:', error);
      Alert.alert('Loi', 'Khong the tai giao dich');
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!symbol.trim()) {
      Alert.alert('Loi', 'Vui long nhap ma coin/symbol');
      return;
    }

    if (!access.allowed) {
      Alert.alert('Han che', access.reason);
      return;
    }

    setSaving(true);

    try {
      const entryData = {
        symbol: symbol.toUpperCase().trim(),
        direction,
        pattern_type: patternType || null,
        pattern_grade: patternGrade || null,
        timeframe: timeframe || null,
        entry_price: parseFloat(entryPrice) || null,
        exit_price: parseFloat(exitPrice) || null,
        stop_loss: parseFloat(stopLoss) || null,
        take_profit_1: parseFloat(takeProfit1) || null,
        take_profit_2: parseFloat(takeProfit2) || null,
        take_profit_3: parseFloat(takeProfit3) || null,
        position_size: parseFloat(positionSize) || null,
        leverage: parseFloat(leverage) || 1,
        discipline_checklist: disciplineChecklist,
        discipline_score: metrics.disciplineScore,
        emotion_pre_trade: emotionPre || null,
        emotion_during_trade: emotionDuring || null,
        emotion_post_trade: emotionPost || null,
        entry_reason: entryReason.trim() || null,
        exit_reason: exitReason.trim() || null,
        lessons_learned: lessonsLearned.trim() || null,
        setup_rating: setupRating,
        execution_rating: executionRating,
        management_rating: managementRating,
        trade_result: tradeResult,
        pnl_percent: metrics.pnlPercent,
        pnl_amount: metrics.pnlAmount,
        risk_reward_ratio: metrics.riskRewardRatio,
        trade_date: date || new Date().toISOString().split('T')[0],
      };

      let result;
      if (mode === 'edit' && entryId) {
        result = await updateTradingEntry(userId, entryId, entryData, userTier);
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
      'Xoa giao dich',
      'Ban co chac muon xoa giao dich nay?',
      [
        { text: 'Huy', style: 'cancel' },
        {
          text: 'Xoa',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteTradingEntry(userId, entryId);
              if (result.success) {
                navigation.goBack();
              } else {
                Alert.alert('Loi', result.error);
              }
            } catch (error) {
              Alert.alert('Loi', 'Khong the xoa');
            }
          },
        },
      ]
    );
  };

  // Get discipline color
  const getDisciplineColor = (score) => {
    if (score >= 90) return COLORS.success;
    if (score >= 70) return COLORS.gold;
    if (score >= 50) return COLORS.warning;
    return COLORS.error;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient colors={GRADIENTS.darkPurple} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={COLORS.purple} />
      </SafeAreaView>
    );
  }

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
          {mode === 'edit' ? 'Chinh sua' : 'Ghi lenh'}
        </Text>

        <View style={styles.headerActions}>
          {mode === 'edit' && (
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <Trash2 size={20} color={COLORS.error} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            disabled={saving || !symbol.trim()}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.bgDarkest} />
            ) : (
              <>
                <Save size={18} color={COLORS.bgDarkest} />
                <Text style={styles.saveButtonText}>Luu</Text>
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
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Symbol Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Symbol</Text>
            <TextInput
              style={styles.symbolInput}
              placeholder="VD: BTCUSDT"
              placeholderTextColor={COLORS.textMuted}
              value={symbol}
              onChangeText={(text) => setSymbol(text.toUpperCase())}
              autoCapitalize="characters"
            />
          </View>

          {/* Direction */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Huong giao dich</Text>
            <View style={styles.directionRow}>
              <TouchableOpacity
                style={[
                  styles.directionButton,
                  direction === TRADE_DIRECTIONS.LONG && styles.directionButtonLong,
                ]}
                onPress={() => setDirection(TRADE_DIRECTIONS.LONG)}
              >
                <TrendingUp
                  size={20}
                  color={direction === TRADE_DIRECTIONS.LONG ? COLORS.success : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.directionText,
                    direction === TRADE_DIRECTIONS.LONG && styles.directionTextLong,
                  ]}
                >
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
                  size={20}
                  color={direction === TRADE_DIRECTIONS.SHORT ? COLORS.error : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.directionText,
                    direction === TRADE_DIRECTIONS.SHORT && styles.directionTextShort,
                  ]}
                >
                  SHORT
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pattern & Grade & Timeframe */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pattern</Text>
            <View style={styles.patternRow}>
              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setShowPatternSelector(!showPatternSelector)}
              >
                <Text style={styles.selectorText}>
                  {patternType || 'Chon pattern'}
                </Text>
                <ChevronDown size={18} color={COLORS.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.selectorButton, styles.selectorSmall]}
                onPress={() => setShowGradeSelector(!showGradeSelector)}
              >
                <Text style={[styles.selectorText, patternGrade && { color: COLORS.gold }]}>
                  {patternGrade || 'Grade'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.selectorButton, styles.selectorSmall]}
                onPress={() => setShowTimeframeSelector(!showTimeframeSelector)}
              >
                <Text style={styles.selectorText}>
                  {timeframe || 'TF'}
                </Text>
              </TouchableOpacity>
            </View>

            {showPatternSelector && (
              <View style={styles.optionsGrid}>
                {Object.values(PATTERN_TYPES).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionChip,
                      patternType === type && styles.optionChipSelected,
                    ]}
                    onPress={() => {
                      setPatternType(patternType === type ? '' : type);
                      setShowPatternSelector(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        patternType === type && styles.optionChipTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {showGradeSelector && (
              <View style={styles.optionsRow}>
                {Object.values(PATTERN_GRADES).map((grade) => (
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
                    <Text
                      style={[
                        styles.gradeChipText,
                        patternGrade === grade && styles.gradeChipTextSelected,
                      ]}
                    >
                      {grade}
                    </Text>
                  )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {showTimeframeSelector && (
              <View style={styles.optionsRow}>
                {Object.values(TIMEFRAMES).map((tf) => (
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
                    <Text
                      style={[
                        styles.tfChipText,
                        timeframe === tf && styles.tfChipTextSelected,
                      ]}
                    >
                      {tf}
                    </Text>
                  )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Prices */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gia</Text>
            <View style={styles.priceGrid}>
              <View style={styles.priceInput}>
                <Text style={styles.priceLabel}>Entry</Text>
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
                  style={[styles.priceField, { borderColor: COLORS.error + '30' }]}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  value={stopLoss}
                  onChangeText={setStopLoss}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.priceInput}>
                <Text style={[styles.priceLabel, { color: COLORS.success }]}>TP1</Text>
                <TextInput
                  style={[styles.priceField, { borderColor: COLORS.success + '30' }]}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  value={takeProfit1}
                  onChangeText={setTakeProfit1}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          {/* P/L Display */}
          {metrics.pnlPercent !== null && (
            <View style={[
              styles.pnlDisplay,
              { borderColor: metrics.pnlPercent >= 0 ? COLORS.success + '50' : COLORS.error + '50' },
            ]}>
              <Text style={styles.pnlLabel}>P/L</Text>
            )}
              <Text style={[
                styles.pnlValue,
                { color: metrics.pnlPercent >= 0 ? COLORS.success : COLORS.error },
              ]}>
                {metrics.pnlPercent >= 0 ? '+' : ''}{metrics.pnlPercent?.toFixed(2)}%
              </Text>
              {metrics.riskRewardRatio && (
                <Text style={styles.rrValue}>R:R 1:{metrics.riskRewardRatio.toFixed(1)}</Text>
              )}
            </View>
          )}

          {/* Result */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ket qua</Text>
            <View style={styles.resultRow}>
              {Object.values(TRADE_RESULTS).map((result) => (
                <TouchableOpacity
                  key={result}
                  style={[
                    styles.resultChip,
                    tradeResult === result && styles.resultChipSelected,
                    tradeResult === result && result === TRADE_RESULTS.WIN && { backgroundColor: COLORS.success + '20', borderColor: COLORS.success },
                    tradeResult === result && result === TRADE_RESULTS.LOSS && { backgroundColor: COLORS.error + '20', borderColor: COLORS.error },
                  ]}
                  onPress={() => setTradeResult(result)}
                >
                  <Text
                    style={[
                      styles.resultChipText,
                      tradeResult === result && result === TRADE_RESULTS.WIN && { color: COLORS.success },
                      tradeResult === result && result === TRADE_RESULTS.LOSS && { color: COLORS.error },
                      tradeResult === result && result === TRADE_RESULTS.OPEN && { color: COLORS.cyan },
                    ]}
                  >
                    {result.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
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

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ly do vao lenh</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Tai sao ban vao lenh nay?"
              placeholderTextColor={COLORS.textMuted}
              value={entryReason}
              onChangeText={setEntryReason}
              multiline
              maxLength={500}
            />
          </View>

          {tradeResult !== TRADE_RESULTS.OPEN && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ly do thoat lenh</Text>
              )}
                <TextInput
                  style={styles.notesInput}
                  placeholder="Tai sao ban thoat lenh?"
                  placeholderTextColor={COLORS.textMuted}
                  value={exitReason}
                  onChangeText={setExitReason}
                  multiline
                  maxLength={500}
                />
              )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bai hoc rut ra</Text>
              )}
                <TextInput
                  style={styles.notesInput}
                  placeholder="Ban hoc duoc gi tu lenh nay?"
                  placeholderTextColor={COLORS.textMuted}
                  value={lessonsLearned}
                  onChangeText={setLessonsLearned}
                  multiline
                  maxLength={500}
                />
              )}
              </View>
            </>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: COLORS.bgDarkest,
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
  symbolInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  directionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  directionButton: {
    flex: 1,
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
  directionButtonLong: {
    backgroundColor: COLORS.success + '15',
    borderColor: COLORS.success + '50',
  },
  directionButtonShort: {
    backgroundColor: COLORS.error + '15',
    borderColor: COLORS.error + '50',
  },
  directionText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textMuted,
  },
  directionTextLong: {
    color: COLORS.success,
  },
  directionTextShort: {
    color: COLORS.error,
  },
  patternRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  selectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectorSmall: {
    flex: 0,
    minWidth: 70,
    justifyContent: 'center',
  },
  selectorText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
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
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textMuted,
  },
  gradeChipTextSelected: {
    color: COLORS.gold,
  },
  tfChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.xs,
  },
  tfChipSelected: {
    backgroundColor: COLORS.cyan + '20',
  },
  tfChipText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  tfChipTextSelected: {
    color: COLORS.cyan,
  },
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
  resultChipSelected: {
    backgroundColor: COLORS.cyan + '15',
    borderColor: COLORS.cyan,
  },
  resultChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textMuted,
  },
  notesInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
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
