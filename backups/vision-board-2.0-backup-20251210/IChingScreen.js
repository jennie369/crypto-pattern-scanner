/**
 * Gemral - I Ching Screen
 * Interactive hexagram casting and interpretation
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Share,
  ActivityIndicator,
  Image,
} from 'react-native';
import alertService from '../../services/alertService';
import * as Clipboard from 'expo-clipboard';
import { Asset } from 'expo-asset';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RefreshCw, Share2, Hexagon, Lock, Briefcase, DollarSign, Heart, Activity, Sparkles, ChevronDown, ChevronUp, ShoppingBag, Gem, Copy } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS, LAYOUT } from '../../utils/tokens';

// Bottom padding to avoid tab bar overlap (increased for buttons)
const BOTTOM_PADDING = 140;

import { useTabBar } from '../../contexts/TabBarContext';
import { getHexagramImage, getCardBack } from '../../assets/iching';

// Services for tier/quota checking
import TierService from '../../services/tierService';
import QuotaService from '../../services/quotaService';
import { supabase } from '../../services/supabase';
import { shopifyService } from '../../services/shopifyService';

// Crystal tag mapping for Shopify
import { getCrystalTagsForList } from '../../utils/crystalTagMapping';

// Import complete 64 hexagrams data from new data file
import { HEXAGRAMS, getHexagram, getRandomHexagram } from '../../data/iching/hexagrams';

// Import CrystalLink component
import CrystalLink, { CrystalList } from '../../components/CrystalLink';

// Import widget detection for "Add to Dashboard"
import { detectWidgetTrigger, WIDGET_TYPES } from '../../utils/widgetTriggerDetector';
import AddWidgetSuggestion from '../../components/AddWidgetSuggestion';
import SmartFormCard from '../../components/SmartFormCard';
// NEW: Crystal recommendation component with proper Shopify tags
import CrystalRecommendationNew from '../../components/GemMaster/CrystalRecommendationNew';
// NEW: Product recommendations (courses, scanner, affiliate)
import ProductRecommendations from '../../components/GemMaster/ProductRecommendations';

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

  // Shopify crystal products state
  const [shopifyProducts, setShopifyProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // NEW: Crystal recommendation context from I Ching reading
  const [crystalContext, setCrystalContext] = useState('');

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

  // Fetch crystal products from Shopify
  const fetchCrystalProducts = useCallback(async (crystals) => {
    try {
      setIsLoadingProducts(true);
      console.log('[IChingScreen] Fetching crystal products for:', crystals.map(c => c.name));

      // Get Shopify tags from crystal data
      const tags = getCrystalTagsForList(crystals);
      console.log('[IChingScreen] Searching Shopify with tags:', tags);

      // Fetch products from Shopify
      const products = await shopifyService.getProductsByTags(tags, 4, true);
      console.log('[IChingScreen] Found', products.length, 'Shopify products');

      if (products && products.length > 0) {
        // Merge static crystal data with Shopify product data
        const mergedCrystals = crystals.map((crystal) => {
          // Find matching product by name/tag
          const matchedProduct = products.find((p) => {
            const productTitle = (p.title || '').toLowerCase();
            const productTags = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : (p.tags || '').toLowerCase();
            const crystalName = (crystal.name || '').toLowerCase();
            const crystalVnName = (crystal.vietnameseName || '').toLowerCase();

            return productTitle.includes(crystalName) ||
                   productTitle.includes(crystalVnName) ||
                   productTags.includes(crystalName) ||
                   productTags.includes(crystalVnName);
          });

          if (matchedProduct) {
            return {
              ...crystal,
              imageUrl: matchedProduct.images?.[0]?.url || matchedProduct.featuredImage?.url,
              price: matchedProduct.variants?.[0]?.price?.amount || matchedProduct.priceRange?.minVariantPrice?.amount,
              shopHandle: matchedProduct.handle || crystal.shopHandle,
              available: matchedProduct.availableForSale !== false,
            };
          }
          return crystal;
        });

        // Also add any unmatched products as extra recommendations
        const unmatchedProducts = products.filter((p) => {
          return !crystals.some((c) => {
            const productTitle = (p.title || '').toLowerCase();
            return productTitle.includes((c.name || '').toLowerCase());
          });
        });

        const extraCrystals = unmatchedProducts.slice(0, 2).map((p) => ({
          name: p.title,
          vietnameseName: p.title,
          reason: 'Sản phẩm liên quan từ Shop',
          shopHandle: p.handle,
          imageUrl: p.images?.[0]?.url || p.featuredImage?.url,
          price: p.variants?.[0]?.price?.amount || p.priceRange?.minVariantPrice?.amount,
          available: p.availableForSale !== false,
        }));

        setShopifyProducts([...mergedCrystals, ...extraCrystals]);
      }
    } catch (error) {
      console.error('[IChingScreen] Error fetching crystal products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  /**
   * Get a truly random hexagram using enhanced entropy
   * Uses timestamp + Math.random for better randomness
   */
  const getEnhancedRandomHexagram = () => {
    const hexagramIds = Object.keys(HEXAGRAMS);
    // Use timestamp + Math.random for better entropy
    const seed = Date.now() + Math.random() * 1000000;
    const randomIndex = Math.floor(seed % hexagramIds.length);
    const selectedId = hexagramIds[randomIndex];
    return HEXAGRAMS[selectedId];
  };

  // Cast hexagram
  const castHexagram = useCallback(async () => {
    // CHECK QUOTA FIRST
    if (!canDivine()) {
      alertService.warning(
        'Hết lượt hôm nay',
        `Bạn đã sử dụng hết ${quota?.limit || 5} lượt hỏi trong ngày.\n\nNâng cấp lên tier cao hơn để có thêm lượt:\n• TIER1/PRO: 15 lượt/ngày\n• TIER2/PREMIUM: 50 lượt/ngày\n• TIER3/VIP: Không giới hạn`,
        [{ text: 'Đóng' }]
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

    // Get random hexagram using enhanced entropy
    const selected = getEnhancedRandomHexagram();

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

    // Fetch real crystal products from Shopify
    if (interp.crystals && interp.crystals.length > 0) {
      fetchCrystalProducts(interp.crystals);
    }

    // NEW: Build crystal context for CrystalRecommendationNew
    const crystalNames = interp.crystals?.map(c => c.vietnameseName || c.name).join(', ') || '';
    const ichingContext = `I Ching quẻ: ${selected.vietnamese || selected.name}. Đá năng lượng: ${crystalNames}. Tâm linh, năng lượng, phong thủy.`;
    setCrystalContext(ichingContext);

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

        {/* Cast Button - Using Pressable for better touch handling */}
        <Pressable
          style={({ pressed }) => [
            styles.castButton,
            (isLoading || isLoadingQuota) && styles.castButtonDisabled,
            !canDivine() && styles.castButtonLocked,
            pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
          ]}
          onPress={() => {
            console.log('[IChingScreen] Cast button pressed');
            castHexagram();
          }}
          disabled={isLoading || isLoadingQuota}
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
        </Pressable>

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
                {interpretation?.interpretations?.[selectedArea] && (
                  <View style={styles.areaInterpretCard}>
                    <Text style={styles.areaInterpretTitle}>
                      {interpretation.interpretations[selectedArea]?.title || AREA_LABELS[selectedArea]}
                    </Text>
                    <Text style={styles.areaInterpretReading}>
                      {interpretation.interpretations[selectedArea]?.reading || 'Đang phân tích...'}
                    </Text>
                    {interpretation.interpretations[selectedArea]?.actionSteps?.length > 0 && (
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

            {showCrystals && (
              <>
                {/* ONLY use CrystalRecommendationNew - it fetches real Shopify products */}
                {crystalContext ? (
                  <CrystalRecommendationNew
                    context={crystalContext}
                    limit={4}
                  />
                ) : (
                  <View style={{ padding: SPACING.md, alignItems: 'center' }}>
                    <Text style={{ color: COLORS.textMuted }}>
                      Đang tải sản phẩm từ Shop...
                    </Text>
                  </View>
                )}
              </>
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
                    <View style={styles.affirmationContent}>
                      <Text style={styles.affirmationText}>"{aff}"</Text>
                      <TouchableOpacity
                        style={styles.copyButton}
                        onPress={async () => {
                          await Clipboard.setStringAsync(aff);
                          alertService.success('Đã copy!', 'Affirmation đã được copy vào clipboard.');
                        }}
                        activeOpacity={0.7}
                      >
                        <Copy size={16} color={COLORS.cyan} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                {/* Button to save affirmations to VisionBoard */}
                <TouchableOpacity
                  style={styles.saveAffirmationsButton}
                  onPress={() => {
                    // Set widget trigger for affirmation type
                    setWidgetTrigger({
                      type: WIDGET_TYPES.AFFIRMATION,
                      data: {
                        title: 'Affirmations từ Kinh Dịch',
                        affirmations: interpretation.affirmations,
                        source: 'iching',
                        hexagram: hexagram?.vietnamese || hexagram?.name,
                      },
                    });
                    setShowWidgetForm(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Sparkles size={16} color={COLORS.gold} />
                  <Text style={styles.saveAffirmationsText}>Lưu vào VisionBoard</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Product Recommendations (Courses, Scanner, Affiliate) */}
            <ProductRecommendations
              context={`${selectedArea} ${interpretation.general || ''} ${interpretation.advice || ''}`}
            />

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
            <Pressable
              style={({ pressed }) => [
                styles.sendToChatButton,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
              onPress={async () => {
                console.log('[IChingScreen] Send to chat pressed');

                // Get the hexagram image asset for sending to chat
                const hexagramImageAsset = getHexagramImage(hexagram.id);
                let imageUri = null;

                try {
                  // Resolve the image asset to get local URI
                  if (hexagramImageAsset) {
                    const asset = Asset.fromModule(hexagramImageAsset);
                    await asset.downloadAsync();
                    imageUri = asset.localUri || asset.uri;
                    console.log('[IChingScreen] Image URI:', imageUri);
                  }
                } catch (error) {
                  console.error('[IChingScreen] Error getting image URI:', error);
                }

                // Format result for chat with visual data AND image
                const resultData = {
                  type: 'iching',
                  text: `🔮 **Kết quả Kinh Dịch**\n\n**Quẻ ${hexagram.name}** (${hexagram.vietnamese})\n\n${interpretation.general}\n\n**Lời khuyên:** ${interpretation.advice}`,
                  hexagram: {
                    id: hexagram.id,
                    name: hexagram.name,
                    vietnamese: hexagram.vietnamese,
                    meaning: hexagram.meaning,
                    lines: hexagram.lines,
                  },
                  interpretation: interpretation,
                  // Include image data for chat display
                  imageUri: imageUri,
                  imageSource: hexagramImageAsset, // Fallback to require() source
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
            </Pressable>

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
                  alertService.error('Lỗi', 'Không thể chia sẻ. Vui lòng thử lại.');
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
            alertService.success('Đã lưu!', 'Quẻ đã được thêm vào Dashboard của bạn.');
          }}
          onCancel={() => {
            setShowWidgetForm(false);
          }}
          onNavigateToShop={(shopHandle) => {
            navigation.navigate('Shop', {
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
    paddingBottom: BOTTOM_PADDING,
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
  affirmationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  affirmationText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  // Save affirmations button
  saveAffirmationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.4)',
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  saveAffirmationsText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
});

export default IChingScreen;
