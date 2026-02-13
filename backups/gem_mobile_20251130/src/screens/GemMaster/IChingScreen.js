/**
 * Gemral - I Ching Screen
 * Interactive hexagram casting and interpretation
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Share,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RefreshCw, Share2, Hexagon, Lock, Briefcase, DollarSign, Heart, Activity, Sparkles, ChevronDown, ChevronUp, ShoppingBag, Gem } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS, LAYOUT } from '../../utils/tokens';
import { useTabBar } from '../../contexts/TabBarContext';
import { getHexagramImage, getCardBack } from '../../assets/iching';

// Services for tier/quota checking
import TierService from '../../services/tierService';
import QuotaService from '../../services/quotaService';
import { supabase } from '../../services/supabase';

// Import complete 64 hexagrams data from new data file
import { HEXAGRAMS, getHexagram } from '../../data/iching/hexagrams';

// Import CrystalLink component
import CrystalLink, { CrystalList } from '../../components/CrystalLink';

// Import widget detection for "Add to Dashboard"
import { detectWidgetTrigger, WIDGET_TYPES } from '../../utils/widgetTriggerDetector';
import AddWidgetSuggestion from '../../components/AddWidgetSuggestion';
import SmartFormCard from '../../components/SmartFormCard';

const IChingScreen = ({ navigation, route }) => {
  const [hexagram, setHexagram] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [interpretation, setInterpretation] = useState(null);
  const [selectedArea, setSelectedArea] = useState('career'); // career, finance, love, health, spiritual
  const [showCrystals, setShowCrystals] = useState(false);
  const [showAffirmations, setShowAffirmations] = useState(false);
  const { hideTabBar, showTabBar } = useTabBar();

  // Widget suggestion state
  const [widgetTrigger, setWidgetTrigger] = useState(null);
  const [showWidgetForm, setShowWidgetForm] = useState(false);

  // Quota state
  const [user, setUser] = useState(null);
  const [userTier, setUserTier] = useState('FREE');
  const [quota, setQuota] = useState(null);
  const [isLoadingQuota, setIsLoadingQuota] = useState(true);

  // Callback to send result back to chat
  const onSendToChat = route?.params?.onSendToChat;

  // Hide tab bar when screen is focused
  useEffect(() => {
    hideTabBar();
    return () => showTabBar();
  }, [hideTabBar, showTabBar]);

  // Load user tier and quota on mount
  useEffect(() => {
    const loadUserQuota = async () => {
      try {
        setIsLoadingQuota(true);
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const tier = await TierService.getUserTier(currentUser.id);
          setUserTier(tier);
          const quotaData = await QuotaService.checkQuota(currentUser.id, tier);
          setQuota(quotaData);
          console.log('[IChingScreen] User tier:', tier, 'Quota:', quotaData);
        } else {
          setUserTier('FREE');
          setQuota(QuotaService.getDefaultQuota());
        }
      } catch (error) {
        console.error('[IChingScreen] Error loading quota:', error);
        setQuota(QuotaService.getDefaultQuota());
      } finally {
        setIsLoadingQuota(false);
      }
    };

    loadUserQuota();
  }, []);

  // Check if user can perform divination (has quota remaining)
  const canDivine = useCallback(() => {
    if (!quota) return false;
    return quota.unlimited || quota.remaining > 0;
  }, [quota]);

  // Refresh quota after using
  const refreshQuota = useCallback(async () => {
    if (!user) return;
    try {
      const quotaData = await QuotaService.checkQuota(user.id, userTier);
      setQuota(quotaData);
    } catch (error) {
      console.error('[IChingScreen] Error refreshing quota:', error);
    }
  }, [user, userTier]);

  // Animation refs
  const lineAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  /**
   * Fisher-Yates shuffle algorithm for true randomness
   * Ensures each hexagram has equal probability of being selected
   */
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Use timestamp + Math.random for better entropy
      const seed = Date.now() + Math.random() * 1000000;
      const j = Math.floor(seed % (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Cast hexagram
  const castHexagram = useCallback(async () => {
    // CHECK QUOTA FIRST
    if (!canDivine()) {
      Alert.alert(
        'Hết lượt hôm nay',
        `Bạn đã sử dụng hết ${quota?.limit || 5} lượt hỏi trong ngày.\n\nNâng cấp lên tier cao hơn để có thêm lượt:\n• TIER1/PRO: 15 lượt/ngày\n• TIER2/PREMIUM: 50 lượt/ngày\n• TIER3/VIP: Không giới hạn`,
        [{ text: 'Đóng', style: 'cancel' }]
      );
      return;
    }

    setIsLoading(true);
    setHexagram(null);
    setInterpretation(null);

    // Reset animations
    lineAnimations.forEach((anim) => anim.setValue(0));

    // DECREMENT QUOTA (uses same quota as chat)
    if (user) {
      await QuotaService.decrementQuota(user.id);
      await refreshQuota();
    }

    // True random hexagram using Fisher-Yates shuffle
    const shuffled = shuffleArray(HEXAGRAMS);
    // Add extra randomness with timestamp-based seed
    const extraRandom = Math.floor((Date.now() % 1000) * Math.random());
    const randomIndex = (extraRandom + Math.floor(Math.random() * 64)) % 64;
    const selected = shuffled[randomIndex];

    // Animate lines appearing one by one
    for (let i = 0; i < 6; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      Animated.spring(lineAnimations[i], {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }

    setHexagram(selected);

    // Generate interpretation after a delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    const interp = generateInterpretation(selected);
    setInterpretation(interp);
    setIsLoading(false);

    // Detect widget trigger for "Add to Dashboard" suggestion
    const trigger = detectWidgetTrigger({
      type: 'iching',
      hexagramNumber: selected.id,
      hexagramName: selected.name,
      vietnameseName: selected.vietnamese,
      interpretation: interp.general,
      selectedArea: selectedArea,
      crystals: interp.crystals,
      affirmations: interp.affirmations,
    });
    setWidgetTrigger(trigger);
  }, [lineAnimations, canDivine, quota, user, refreshQuota, selectedArea]);

  // Generate interpretation from new data structure
  const generateInterpretation = (hex) => {
    // Get full hexagram data from new data file
    const fullHex = getHexagram(hex.id);

    if (fullHex && fullHex.overview) {
      return {
        general: fullHex.overview.meaning,
        keywords: fullHex.overview.keywords || [],
        advice: fullHex.overview.overallAdvice,
        interpretations: fullHex.interpretations || {},
        crystals: fullHex.crystals || [],
        affirmations: fullHex.affirmations || [],
        lineInterpretations: fullHex.lineInterpretations || {},
        fortune: Math.floor(Math.random() * 5) + 1, // 1-5 stars
      };
    }

    // Fallback for basic data
    return {
      general: `Quẻ ${hex.name} (${hex.image || hex.vietnamese}) mang ý nghĩa ${hex.overview?.meaning || 'quan trọng'}. Đây là thời điểm thuận lợi để bạn suy ngẫm về những quyết định quan trọng.`,
      keywords: [],
      advice: 'Hãy kiên nhẫn và tin tưởng vào quá trình. Mọi thứ đều có thời điểm của nó.',
      interpretations: {},
      crystals: [],
      affirmations: [],
      lineInterpretations: {},
      fortune: Math.floor(Math.random() * 5) + 1,
    };
  };

  // Area icons mapping
  const AREA_ICONS = {
    career: Briefcase,
    finance: DollarSign,
    love: Heart,
    health: Activity,
    spiritual: Sparkles,
  };

  const AREA_LABELS = {
    career: 'Sự nghiệp',
    finance: 'Tài chính',
    love: 'Tình yêu',
    health: 'Sức khỏe',
    spiritual: 'Tâm linh',
  };

  // Render hexagram line
  const renderLine = (value, index) => {
    const isYang = value === 1;
    return (
      <Animated.View
        key={index}
        style={[
          styles.lineContainer,
          {
            opacity: lineAnimations[5 - index],
            transform: [
              {
                scaleX: lineAnimations[5 - index],
              },
            ],
          },
        ]}
      >
        {isYang ? (
          // Yang line (solid)
          <View style={styles.yangLine} />
        ) : (
          // Yin line (broken)
          <View style={styles.yinLineContainer}>
            <View style={styles.yinLine} />
            <View style={styles.yinGap} />
            <View style={styles.yinLine} />
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kinh Dịch</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hexagram Display */}
        <View style={styles.hexagramSection}>
          {hexagram ? (
            <View style={styles.hexagramCardContainer}>
              {/* Real Hexagram Card Image */}
              <View style={styles.hexagramImageWrapper}>
                <Image
                  source={getHexagramImage(hexagram.id)}
                  style={styles.hexagramImage}
                  resizeMode="contain"
                />
              </View>
              {/* Card name overlay */}
              <View style={styles.hexagramNameOverlay}>
                <Text style={styles.hexagramName}>{hexagram.name}</Text>
                <Text style={styles.hexagramVietnamese}>{hexagram.vietnamese}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.hexagramCardContainer}>
              {/* Card Back (before casting) */}
              <View style={styles.hexagramImageWrapper}>
                <Image
                  source={getCardBack()}
                  style={styles.hexagramImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.emptyHexagram}>
                <Text style={styles.emptyText}>Nhấn để gieo quẻ</Text>
              </View>
            </View>
          )}
        </View>

        {/* Quota Display */}
        {!isLoadingQuota && (
          <View style={styles.quotaContainer}>
            <Text style={styles.quotaText}>
              {quota?.unlimited
                ? '✨ Không giới hạn'
                : `📊 Còn ${quota?.remaining || 0}/${quota?.limit || 5} lượt hôm nay`}
            </Text>
            <Text style={styles.tierText}>
              {TierService.getTierDisplayName(userTier)}
            </Text>
          </View>
        )}

        {/* Cast Button */}
        <TouchableOpacity
          style={[
            styles.castButton,
            (isLoading || isLoadingQuota) && styles.castButtonDisabled,
            !canDivine() && styles.castButtonLocked
          ]}
          onPress={castHexagram}
          disabled={isLoading || isLoadingQuota}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={!canDivine() ? ['#555', '#444'] : GRADIENTS.gold}
            style={styles.castButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isLoadingQuota ? (
              <ActivityIndicator size="small" color="#0F1030" />
            ) : !canDivine() ? (
              <>
                <Lock size={20} color="#999" />
                <Text style={[styles.castButtonText, styles.castButtonTextLocked]}>
                  Hết lượt hôm nay
                </Text>
              </>
            ) : (
              <>
                <RefreshCw size={20} color="#0F1030" />
                <Text style={styles.castButtonText}>
                  {isLoading ? 'Đang gieo quẻ...' : hexagram ? 'Gieo lại' : 'Gieo quẻ'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Interpretation */}
        {interpretation && (
          <View style={styles.interpretationSection}>
            <Text style={styles.sectionTitle}>Giải quẻ</Text>

            {/* Keywords */}
            {interpretation.keywords && interpretation.keywords.length > 0 && (
              <View style={styles.keywordsContainer}>
                {interpretation.keywords.map((kw, idx) => (
                  <View key={idx} style={styles.keywordTag}>
                    <Text style={styles.keywordText}>{kw}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* General */}
            <View style={styles.interpretCard}>
              <Text style={styles.interpretLabel}>Tổng quan</Text>
              <Text style={styles.interpretText}>{interpretation.general}</Text>
            </View>

            {/* Advice */}
            <View style={styles.interpretCard}>
              <Text style={styles.interpretLabel}>Lời khuyên</Text>
              <Text style={styles.interpretText}>{interpretation.advice}</Text>
            </View>

            {/* Area Selector Tabs */}
            {interpretation.interpretations && Object.keys(interpretation.interpretations).length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Theo lĩnh vực</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.areaTabs}>
                  {Object.keys(AREA_LABELS).map((area) => {
                    const AreaIcon = AREA_ICONS[area];
                    const isActive = selectedArea === area;
                    return (
                      <TouchableOpacity
                        key={area}
                        style={[styles.areaTab, isActive && styles.areaTabActive]}
                        onPress={() => setSelectedArea(area)}
                      >
                        <AreaIcon size={16} color={isActive ? COLORS.gold : COLORS.textMuted} />
                        <Text style={[styles.areaTabText, isActive && styles.areaTabTextActive]}>
                          {AREA_LABELS[area]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Selected Area Interpretation */}
                {interpretation.interpretations[selectedArea] && (
                  <View style={styles.areaInterpretCard}>
                    <Text style={styles.areaInterpretTitle}>
                      {interpretation.interpretations[selectedArea].title || AREA_LABELS[selectedArea]}
                    </Text>
                    <Text style={styles.areaInterpretReading}>
                      {interpretation.interpretations[selectedArea].reading}
                    </Text>
                    {interpretation.interpretations[selectedArea].actionSteps && (
                      <View style={styles.actionStepsContainer}>
                        <Text style={styles.actionStepsLabel}>Hành động cụ thể:</Text>
                        {interpretation.interpretations[selectedArea].actionSteps.map((step, idx) => (
                          <Text key={idx} style={styles.actionStep}>• {step}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </>
            )}

            {/* Crystals Section */}
            {interpretation.crystals && interpretation.crystals.length > 0 && (
              <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => setShowCrystals(!showCrystals)}
              >
                <View style={styles.collapsibleHeaderLeft}>
                  <ShoppingBag size={18} color={COLORS.gold} />
                  <Text style={styles.collapsibleTitle}>Đá năng lượng phù hợp</Text>
                </View>
                {showCrystals ? (
                  <ChevronUp size={20} color={COLORS.textMuted} />
                ) : (
                  <ChevronDown size={20} color={COLORS.textMuted} />
                )}
              </TouchableOpacity>
            )}

            {showCrystals && interpretation.crystals && (
              <CrystalList
                crystals={interpretation.crystals}
                onCrystalPress={(crystal) => {
                  navigation.navigate('ShopStack', {
                    screen: 'ProductDetail',
                    params: { handle: crystal.shopHandle || crystal.name.toLowerCase().replace(/\s+/g, '-') }
                  });
                }}
                compact={false}
                style={{ marginTop: SPACING.sm }}
              />
            )}

            {/* Affirmations Section */}
            {interpretation.affirmations && interpretation.affirmations.length > 0 && (
              <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => setShowAffirmations(!showAffirmations)}
              >
                <View style={styles.collapsibleHeaderLeft}>
                  <Sparkles size={18} color={COLORS.gold} />
                  <Text style={styles.collapsibleTitle}>Affirmations</Text>
                </View>
                {showAffirmations ? (
                  <ChevronUp size={20} color={COLORS.textMuted} />
                ) : (
                  <ChevronDown size={20} color={COLORS.textMuted} />
                )}
              </TouchableOpacity>
            )}

            {showAffirmations && interpretation.affirmations && (
              <View style={styles.affirmationsContainer}>
                {interpretation.affirmations.map((aff, idx) => (
                  <View key={idx} style={styles.affirmationCard}>
                    <Text style={styles.affirmationText}>"{aff}"</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Fortune */}
            <View style={styles.fortuneSection}>
              <Text style={styles.fortuneLabel}>Độ may mắn</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text
                    key={star}
                    style={[
                      styles.star,
                      star <= interpretation.fortune && styles.starActive,
                    ]}
                  >
                    ★
                  </Text>
                ))}
              </View>
            </View>

            {/* Send to Chat Button */}
            <TouchableOpacity
              style={styles.sendToChatButton}
              activeOpacity={0.7}
              onPress={() => {
                // Format result for chat with visual data
                const resultData = {
                  type: 'iching',
                  text: `🔮 **Kết quả Kinh Dịch**\n\n**Quẻ ${hexagram.name}** (${hexagram.vietnamese})\n\n${interpretation.general}\n\n**Lời khuyên:** ${interpretation.advice}\n\n**Cảnh báo:** ${interpretation.warning}`,
                  hexagram: {
                    id: hexagram.id,
                    name: hexagram.name,
                    vietnamese: hexagram.vietnamese,
                    meaning: hexagram.meaning,
                    lines: hexagram.lines,
                  },
                  interpretation: interpretation,
                };

                // Go back and send to chat
                navigation.goBack();
                if (onSendToChat) {
                  setTimeout(() => {
                    onSendToChat(resultData);
                  }, 100);
                }
              }}
            >
              <LinearGradient
                colors={GRADIENTS.gold}
                style={styles.sendToChatGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.sendToChatText}>📨 Gửi vào Chat</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity
              style={styles.shareButton}
              activeOpacity={0.7}
              onPress={async () => {
                try {
                  const shareContent = `🔮 Kết quả Kinh Dịch - Gemral\n\n` +
                    `Quẻ: ${hexagram.name} (${hexagram.vietnamese})\n` +
                    `Ý nghĩa: ${hexagram.meaning}\n\n` +
                    `${interpretation.general}\n\n` +
                    `💡 Lời khuyên: ${interpretation.advice}\n\n` +
                    `⚠️ Cảnh báo: ${interpretation.warning}\n\n` +
                    `⭐ Độ may mắn: ${'★'.repeat(interpretation.fortune)}${'☆'.repeat(5 - interpretation.fortune)}\n\n` +
                    `📲 Tải app Gemral để xem quẻ của bạn!\nhttps://gemral.com`;

                  await Share.share({
                    message: shareContent,
                    title: 'Kết quả Kinh Dịch - Gemral',
                  });
                } catch (error) {
                  Alert.alert('Lỗi', 'Không thể chia sẻ. Vui lòng thử lại.');
                }
              }}
            >
              <Share2 size={18} color={COLORS.textPrimary} />
              <Text style={styles.shareButtonText}>Chia sẻ kết quả</Text>
            </TouchableOpacity>

            {/* Widget Suggestion - Add to Dashboard */}
            <AddWidgetSuggestion
              visible={!!widgetTrigger && !showWidgetForm}
              trigger={widgetTrigger}
              onAccept={(trigger) => {
                setShowWidgetForm(true);
              }}
              onDismiss={() => setWidgetTrigger(null)}
              position="inline"
              autoHide={false}
            />
          </View>
        )}

        {/* Smart Form Modal for saving widget */}
        <SmartFormCard
          visible={showWidgetForm}
          widgetType={widgetTrigger?.type || WIDGET_TYPES.ICHING}
          initialData={{
            hexagramNumber: hexagram?.id,
            hexagramName: hexagram?.name,
            vietnameseName: hexagram?.vietnamese,
            interpretation: interpretation?.general,
            area: selectedArea,
            crystals: interpretation?.crystals,
            affirmations: interpretation?.affirmations,
          }}
          onSave={(widgetData) => {
            console.log('[IChingScreen] Widget saved:', widgetData);
            setShowWidgetForm(false);
            setWidgetTrigger(null);
            Alert.alert('Đã lưu!', 'Quẻ đã được thêm vào Dashboard của bạn.');
          }}
          onCancel={() => {
            setShowWidgetForm(false);
          }}
          onNavigateToShop={(shopHandle) => {
            navigation.navigate('ShopStack', {
              screen: 'ProductDetail',
              params: { handle: shopHandle }
            });
          }}
        />
      </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  hexagramSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  hexagramCardContainer: {
    alignItems: 'center',
    width: '100%',
  },
  hexagramImageWrapper: {
    width: 220,
    height: 340,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(15, 16, 48, 0.8)',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  hexagramImage: {
    width: '100%',
    height: '100%',
  },
  hexagramNameOverlay: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  hexagramName: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    textAlign: 'center',
  },
  hexagramVietnamese: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  emptyHexagram: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  // Quota display
  quotaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  quotaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  tierText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  castButton: {
    marginBottom: SPACING.xl,
  },
  castButtonDisabled: {
    opacity: 0.6,
  },
  castButtonLocked: {
    opacity: 0.8,
  },
  castButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: 24,
  },
  castButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0F1030',
  },
  castButtonTextLocked: {
    color: '#999',
  },
  interpretationSection: {
    gap: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  interpretCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.md,
  },
  warningCard: {
    borderColor: 'rgba(255, 107, 107, 0.3)',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  interpretLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  warningLabel: {
    color: COLORS.error,
  },
  interpretText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  fortuneSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.md,
  },
  fortuneLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.2)',
  },
  starActive: {
    color: COLORS.gold,
  },
  sendToChatButton: {
    marginTop: SPACING.md,
  },
  sendToChatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 24,
  },
  sendToChatText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0F1030',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    marginTop: SPACING.md,
  },
  shareButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  // Keywords
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  keywordTag: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  keywordText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  // Area Tabs
  areaTabs: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  areaTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  areaTabActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: COLORS.gold,
  },
  areaTabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  areaTabTextActive: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  // Area Interpretation Card
  areaInterpretCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  areaInterpretTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginBottom: SPACING.sm,
  },
  areaInterpretReading: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  actionStepsContainer: {
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.sm,
  },
  actionStepsLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  actionStep: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
    paddingLeft: SPACING.xs,
  },
  // Collapsible Header
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  collapsibleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  collapsibleTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  // Crystals
  crystalsContainer: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  crystalCard: {
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  crystalName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  crystalNameEn: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  crystalReason: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  crystalUsage: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: SPACING.xs,
  },
  crystalShopLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginTop: SPACING.xs,
  },
  // Affirmations
  affirmationsContainer: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  affirmationCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  affirmationText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
});

export default IChingScreen;
