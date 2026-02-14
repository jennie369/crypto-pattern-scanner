/**
 * Gemral - I Ching Screen
 * Interactive hexagram casting and interpretation
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
  ImageBackground,
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
import { useAuth } from '../../contexts/AuthContext';
import { getHexagramImage, getCardBack, ICHING_BACKGROUND } from '../../assets/iching';

// Services for tier/quota checking
import TierService from '../../services/tierService';
import QuotaService from '../../services/quotaService';
import { supabase } from '../../services/supabase';
import { shopifyService } from '../../services/shopifyService';

// Vision Board 2.0 - I Ching history service
import { saveReading as saveIChingReading } from '../../services/ichingService';

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
import SmartFormCardNew from '../../components/GemMaster/SmartFormCardNew';
// NEW: Crystal recommendation component with proper Shopify tags
import CrystalRecommendationNew from '../../components/GemMaster/CrystalRecommendationNew';
// NEW: Product recommendations (courses, scanner, affiliate)
import ProductRecommendations from '../../components/GemMaster/ProductRecommendations';
// NEW: Upgrade modal with Shopify checkout flow
import ChatbotPricingModal from '../../components/GemMaster/ChatbotPricingModal';
// NEW: Quick Buy & Upsell Modals for crystal purchase flow
import QuickBuyModal from '../../components/GemMaster/QuickBuyModal';
import UpsellModal from '../../components/GemMaster/UpsellModal';

// NEW: Enhanced interactive components
import CoinCastAnimation from '../../components/GemMaster/CoinCastAnimation';
import HexagramBuilder from '../../components/GemMaster/HexagramBuilder';

// Casting modes
const CASTING_MODE = {
  QUICK: 'quick',      // Instant random hexagram
  TRADITIONAL: 'traditional', // Interactive coin toss (6 times)
};

// Casting phases for traditional mode
const CASTING_PHASE = {
  SELECT_MODE: 'select_mode',
  CASTING: 'casting',
  RESULT: 'result',
};

const IChingScreen = ({ navigation, route }) => {
  const [hexagram, setHexagram] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [interpretation, setInterpretation] = useState(null);
  const [selectedArea, setSelectedArea] = useState('career'); // career, finance, love, health, spiritual
  const [showCrystals, setShowCrystals] = useState(false);
  const [showGuidanceSection, setShowGuidanceSection] = useState(true); // Merged section: Affirmations + Actions + Rituals
  const { hideTabBar, showTabBar } = useTabBar();

  // NEW: Enhanced casting mode state
  const [castingMode, setCastingMode] = useState(null); // null = show mode selection
  const [castingPhase, setCastingPhase] = useState(CASTING_PHASE.SELECT_MODE);
  const [currentLineNumber, setCurrentLineNumber] = useState(1); // 1-6
  const [hexagramLines, setHexagramLines] = useState([]); // Array of line results

  // Widget suggestion state
  const [widgetTrigger, setWidgetTrigger] = useState(null);
  const [showWidgetForm, setShowWidgetForm] = useState(false);

  // Copy feedback state - shows "Đã copy" text instead of popup
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Inline Vision Board form state (shows below guidance section)
  const [showInlineVBForm, setShowInlineVBForm] = useState(false);

  // User & Tier from AuthContext — reactive to profile changes + app resume
  const { user, userTier, isAdmin } = useAuth();

  // Quota state
  const [quota, setQuota] = useState(null);
  const [isLoadingQuota, setIsLoadingQuota] = useState(true);

  // NEW: Quick Buy & Upsell Modal state for crystal purchase flow
  const [quickBuyModal, setQuickBuyModal] = useState({
    visible: false,
    product: null,
  });
  const [upsellModal, setUpsellModal] = useState({
    visible: false,
    upsellData: null,
  });

  // Shopify crystal products state
  const [shopifyProducts, setShopifyProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // NEW: Crystal recommendation context from I Ching reading
  const [crystalContext, setCrystalContext] = useState('');

  // NEW: Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Callback to send result back to chat
  const onSendToChat = route?.params?.onSendToChat;

  // Hide tab bar when screen is focused
  useEffect(() => {
    hideTabBar();
    return () => showTabBar();
  }, [hideTabBar, showTabBar]);

  // Load quota reactively when user/tier changes (tier from AuthContext)
  useEffect(() => {
    const loadUserQuota = async () => {
      if (!user?.id) {
        setQuota(QuotaService.getDefaultQuota());
        setIsLoadingQuota(false);
        return;
      }

      try {
        setIsLoadingQuota(true);
        QuotaService.clearCache();
        const quotaData = await QuotaService.checkQuota(user.id, userTier);
        setQuota(quotaData);
        console.log('[IChingScreen] Tier (from AuthContext):', userTier, 'Quota:', quotaData);
      } catch (error) {
        console.error('[IChingScreen] Error loading quota:', error);
        setQuota(QuotaService.getDefaultQuota());
      } finally {
        setIsLoadingQuota(false);
      }
    };

    loadUserQuota();
  }, [user?.id, userTier]);

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
      // Debug: console.error('[IChingScreen] Error refreshing quota:', error);
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
      // Debug: console.log('[IChingScreen] Fetching crystal products for:', crystals.map(c => c.name));

      // Get Shopify tags from crystal data
      const tags = getCrystalTagsForList(crystals);
      // Debug: console.log('[IChingScreen] Searching Shopify with tags:', tags);

      // Fetch products from Shopify
      const products = await shopifyService.getProductsByTags(tags, 4, true);
      // Debug: console.log('[IChingScreen] Found', products.length, 'Shopify products');

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
      // Debug: console.error('[IChingScreen] Error fetching crystal products:', error);
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
    // CHECK QUOTA FIRST - show upgrade modal instead of alert
    if (!canDivine()) {
      setShowUpgradeModal(true);
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

    // Animate lines appearing one by one - FAST animation
    for (let i = 0; i < 6; i++) {
      await new Promise((resolve) => setTimeout(resolve, 60)); // 60ms delay (was 200ms)
      Animated.spring(lineAnimations[i], {
        toValue: 1,
        friction: 8,   // Faster spring
        tension: 150,  // More responsive
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
    const ichingContext = `I Ching quẻ: ${selected.name} (${selected.chineseName}). Đá năng lượng: ${crystalNames}. Tâm thức, năng lượng, phong thủy.`;
    setCrystalContext(ichingContext);

    // Detect widget trigger for "Add to Dashboard" suggestion
    const trigger = detectWidgetTrigger({
      type: 'iching',
      hexagramNumber: selected.id,
      hexagramName: selected.name,
      chineseName: selected.chineseName,
      interpretation: interp.general,
      selectedArea: selectedArea,
      crystals: interp.crystals,
      affirmations: interp.affirmations,
    });
    setWidgetTrigger(trigger);

    // Vision Board 2.0: Save reading to database for history
    if (user?.id) {
      try {
        await saveIChingReading(user.id, {
          question: route?.params?.question || 'Xin một quẻ',
          hexagram: {
            primaryHexagram: {
              number: selected.id,
              name: selected.name,
              nameVi: selected.name,
              chineseName: selected.chineseName,
              meaningVi: selected.overview?.meaning || selected.meaning || '',
            },
            lines: selected.lines || [],
            changingLines: [],
            relatingHexagram: null,
          },
          interpretation: interp.general,
          advice: interp.advice,
          affirmations: interp.affirmations,
          crystals: interp.crystals,
          area: selectedArea,
        });
        // Debug: console.log('[IChingScreen] Reading saved to history');
      } catch (err) {
        // Debug: console.error('[IChingScreen] Failed to save reading:', err);
      }
    }
  }, [lineAnimations, canDivine, quota, user, refreshQuota, selectedArea]);

  // Generate interpretation from new data structure
  const generateInterpretation = (hex) => {
    // Get full hexagram data from new data file
    const fullHex = getHexagram(hex.id);

    // Default rituals based on hexagram element
    const getDefaultRituals = (hexData) => {
      const baseRituals = [
        {
          name: 'Thiền Quẻ Buổi Sáng',
          description: `Mỗi sáng thiền 5-10 phút với quẻ ${hexData?.name || 'này'}. Hình dung năng lượng của quẻ bao quanh bạn.`,
        },
        {
          name: 'Ghi Chép Insight',
          description: 'Viết nhật ký về những insight từ quẻ. Ghi lại các dấu hiệu, đồng bộ hóa bạn nhận thấy trong ngày.',
        },
        {
          name: 'Tẩy Tịnh Không Gian',
          description: 'Đốt xô đuổi tà hoặc thắp nến trắng, đặt intention theo lời khuyên của quẻ.',
        },
      ];
      return baseRituals;
    };

    if (fullHex && fullHex.overview) {
      return {
        general: fullHex.overview.meaning,
        keywords: fullHex.overview.keywords || [],
        advice: fullHex.overview.overallAdvice,
        interpretations: fullHex.interpretations || {},
        crystals: fullHex.crystals || [],
        affirmations: fullHex.affirmations || [],
        rituals: fullHex.rituals || getDefaultRituals(fullHex),
        lineInterpretations: fullHex.lineInterpretations || {},
        fortune: Math.floor(Math.random() * 5) + 1, // 1-5 stars
      };
    }

    // Fallback for basic data
    return {
      general: `Quẻ ${hex.name} (${hex.chineseName || hex.image}) mang ý nghĩa ${hex.overview?.meaning || 'quan trọng'}. Đây là thời điểm thuận lợi để bạn suy ngẫm về những quyết định quan trọng.`,
      keywords: [],
      advice: 'Hãy kiên nhẫn và tin tưởng vào quá trình. Mọi thứ đều có thời điểm của nó.',
      interpretations: {},
      crystals: [],
      affirmations: [],
      rituals: getDefaultRituals(hex),
      lineInterpretations: {},
      fortune: Math.floor(Math.random() * 5) + 1,
    };
  };

  // ========== TRADITIONAL CASTING MODE HANDLERS ==========

  /**
   * Start traditional casting mode (interactive coin toss)
   */
  const startTraditionalCasting = useCallback(async () => {
    // CHECK QUOTA FIRST
    if (!canDivine()) {
      setShowUpgradeModal(true);
      return;
    }

    // Reset state
    setHexagram(null);
    setInterpretation(null);
    setHexagramLines([]);
    setCurrentLineNumber(1);
    setCastingPhase(CASTING_PHASE.CASTING);
    setCastingMode(CASTING_MODE.TRADITIONAL);

    // DECREMENT QUOTA
    if (user) {
      await QuotaService.decrementQuota(user.id);
      await refreshQuota();
    }
  }, [canDivine, user, refreshQuota]);

  /**
   * Handle line completion from CoinCastAnimation
   */
  const handleLineComplete = useCallback(async (lineResult) => {
    // Debug: console.log('[IChingScreen] Line complete:', lineResult);

    // Add line to hexagram
    const newLines = [...hexagramLines, {
      lineType: lineResult.lineType,
      isChanging: lineResult.isChanging,
    }];
    setHexagramLines(newLines);

    // Check if all 6 lines are complete
    if (newLines.length >= 6) {
      // Build hexagram from lines
      const binaryLines = newLines.map(l => l.lineType === 'yang' ? 1 : 0);

      // Find matching hexagram from our data
      const hexagramId = findHexagramByLines(binaryLines);
      const selected = hexagramId ? getHexagram(hexagramId) : getRandomHexagram();

      setHexagram(selected);
      setCastingPhase(CASTING_PHASE.RESULT);

      // Generate interpretation
      const interp = generateInterpretation(selected);
      setInterpretation(interp);

      // Fetch crystals and set context
      if (interp.crystals?.length > 0) {
        fetchCrystalProducts(interp.crystals);
      }

      const crystalNames = interp.crystals?.map(c => c.vietnameseName || c.name).join(', ') || '';
      const ichingContext = `I Ching quẻ: ${selected.name} (${selected.chineseName}). Đá năng lượng: ${crystalNames}. Tâm thức, năng lượng, phong thủy.`;
      setCrystalContext(ichingContext);

      // Save to history
      if (user?.id) {
        try {
          await saveIChingReading(user.id, {
            question: route?.params?.question || 'Gieo quẻ truyền thống',
            hexagram: {
              primaryHexagram: {
                number: selected.id,
                name: selected.name,
                nameVi: selected.name,
                chineseName: selected.chineseName,
                meaningVi: selected.overview?.meaning || selected.meaning || '',
              },
              lines: newLines,
              changingLines: newLines.filter(l => l.isChanging).map((l, i) => i + 1),
              relatingHexagram: null,
            },
            interpretation: interp.general,
            advice: interp.advice,
            affirmations: interp.affirmations,
            crystals: interp.crystals,
            area: selectedArea,
          });
          // Debug: console.log('[IChingScreen] Traditional reading saved');
        } catch (err) {
          // Debug: console.error('[IChingScreen] Failed to save traditional reading:', err);
        }
      }
    } else {
      // Move to next line
      setCurrentLineNumber(prev => prev + 1);
    }
  }, [hexagramLines, user, route?.params?.question, fetchCrystalProducts]);

  /**
   * Find hexagram ID by line pattern
   * Lines: array of 6 values (0=yin, 1=yang), bottom to top
   * Searches HEXAGRAMS data to find matching pattern
   */
  const findHexagramByLines = (lines) => {
    // Convert input lines to string for comparison
    const inputPattern = lines.join('');

    // Search through all hexagrams to find matching pattern
    for (const [id, hexagram] of Object.entries(HEXAGRAMS)) {
      if (hexagram.lines) {
        const hexPattern = hexagram.lines.join('');
        if (hexPattern === inputPattern) {
          // Debug: console.log(`[IChingScreen] Found matching hexagram: ${id} - ${hexagram.name}`);
          return parseInt(id);
        }
      }
    }

    // If no exact match, log warning and return random
    // Debug: console.warn(`[IChingScreen] No matching hexagram found for pattern: ${inputPattern}`);
    return Math.floor(Math.random() * 64) + 1;
  };

  /**
   * Reset to mode selection
   */
  const resetCasting = useCallback(() => {
    setCastingMode(null);
    setCastingPhase(CASTING_PHASE.SELECT_MODE);
    setHexagram(null);
    setInterpretation(null);
    setHexagramLines([]);
    setCurrentLineNumber(1);
    lineAnimations.forEach(anim => anim.setValue(0));
  }, [lineAnimations]);

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
    spiritual: 'Tâm thức',
  };

  // NEW: Handler for quick buy from crystal recommendations
  const handleQuickBuy = useCallback((product) => {
    // Debug: console.log('[IChingScreen] Quick buy product:', product?.title);
    setQuickBuyModal({
      visible: true,
      product,
    });
  }, []);

  // NEW: Handler for showing upsell modal after adding to cart
  const handleShowUpsell = useCallback((upsellData) => {
    // Debug: console.log('[IChingScreen] Show upsell:', upsellData?.upsells?.length, 'products');
    setUpsellModal({
      visible: true,
      upsellData,
    });
  }, []);

  // NEW: Handler for buy now (opens checkout after quick buy)
  const handleBuyNow = useCallback(async (purchaseData) => {
    // Debug: console.log('[IChingScreen] Buy now:', purchaseData?.product?.title);
    if (purchaseData?.upsells && purchaseData.upsells.length > 0) {
      setUpsellModal({
        visible: true,
        upsellData: {
          primaryProduct: purchaseData.product,
          upsells: purchaseData.upsells,
        },
      });
    } else {
      navigation.navigate('Shop', { screen: 'Checkout' });
    }
  }, [navigation]);

  // NEW: Handler for checkout from upsell modal
  const handleCheckout = useCallback((checkoutUrl) => {
    navigation.navigate('Shop', {
      screen: 'Checkout',
      params: { checkoutUrl },
    });
  }, [navigation]);

  // NEW: Handler for continue shopping
  const handleContinueShopping = useCallback(() => {
    // Just close the modal - user can continue browsing
  }, []);

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
    <ImageBackground
      source={ICHING_BACKGROUND}
      style={styles.gradientContainer}
      resizeMode="cover"
      fadeDuration={0}
      cachePolicy="memory-disk"
    >
      <LinearGradient
        colors={['rgba(10, 15, 28, 0.7)', 'rgba(10, 15, 28, 0.5)', 'rgba(10, 15, 28, 0.75)']}
        locations={[0, 0.4, 1]}
        style={styles.gradientOverlay}
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
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        decelerationRate="fast"
        overScrollMode="never"
      >
        {/* MODE SELECTION - Show when no mode selected and no hexagram */}
        {!castingMode && !hexagram && (
          <View style={styles.modeSelectionSection}>
            <Text style={styles.modeSelectionTitle}>Chọn cách gieo quẻ</Text>
            <Text style={styles.modeSelectionSubtitle}>
              Bạn muốn gieo quẻ theo cách nào?
            </Text>

            {/* Quick Mode */}
            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => {
                setCastingMode(CASTING_MODE.QUICK);
                castHexagram();
              }}
              activeOpacity={0.8}
            >
              <View style={styles.modeCardInner}>
                <View style={styles.modeCardIconWrapper}>
                  <RefreshCw size={24} color={COLORS.gold} />
                </View>
                <View style={styles.modeCardContent}>
                  <Text style={styles.modeCardTitle}>Gieo Nhanh</Text>
                  <Text style={styles.modeCardDesc}>
                    Nhận quẻ ngay lập tức
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Traditional Mode */}
            <TouchableOpacity
              style={styles.modeCard}
              onPress={startTraditionalCasting}
              activeOpacity={0.8}
            >
              <View style={styles.modeCardInner}>
                <View style={styles.modeCardIconWrapper}>
                  <Hexagon size={24} color={COLORS.gold} />
                </View>
                <View style={styles.modeCardContent}>
                  <Text style={styles.modeCardTitle}>Gieo Truyền Thống</Text>
                  <Text style={styles.modeCardDesc}>
                    Tung 3 xu 6 lần, trải nghiệm tâm linh
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* TRADITIONAL CASTING MODE - Interactive coin toss */}
        {castingMode === CASTING_MODE.TRADITIONAL && castingPhase === CASTING_PHASE.CASTING && (
          <View style={styles.traditionalCastingSection}>
            <Text style={styles.traditionalTitle}>Gieo Quẻ Truyền Thống</Text>
            <Text style={styles.traditionalSubtitle}>
              Tung 3 đồng xu để tạo hào thứ {currentLineNumber}/6
            </Text>

            {/* Hexagram Builder - Shows lines being built */}
            <View style={styles.hexagramBuilderWrapper}>
              <HexagramBuilder
                lines={hexagramLines}
                showLabels={true}
                animated={true}
                size="normal"
              />
            </View>

            {/* Coin Cast Animation - key forces reset for each new line */}
            <View style={styles.coinCastWrapper}>
              <CoinCastAnimation
                key={`coin-cast-line-${currentLineNumber}`}
                lineNumber={currentLineNumber}
                onLineComplete={handleLineComplete}
                disabled={hexagramLines.length >= 6}
              />
            </View>

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <View
                  key={num}
                  style={[
                    styles.progressDot,
                    num <= hexagramLines.length && styles.progressDotComplete,
                    num === currentLineNumber && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>

            {/* Cancel button to go back to mode selection */}
            <TouchableOpacity
              style={styles.cancelCastingButton}
              onPress={resetCasting}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelCastingText}>Hủy bỏ</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* HEXAGRAM DISPLAY - After casting complete */}
        {(hexagram || (castingMode === CASTING_MODE.QUICK && isLoading)) && (
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
                  <Text style={styles.hexagramName}>
                    Quẻ {hexagram.name}{hexagram.image ? ` - ${hexagram.image}` : ''}
                  </Text>
                  <Text style={styles.hexagramVietnamese}>{hexagram.chineseName || hexagram.unicode}</Text>
                </View>

                {/* Show HexagramBuilder for traditional mode result */}
                {castingMode === CASTING_MODE.TRADITIONAL && hexagramLines.length > 0 && (
                  <View style={styles.traditionalResultLines}>
                    <Text style={styles.linesLabel}>Các hào đã gieo:</Text>
                    <HexagramBuilder
                      lines={hexagramLines}
                      showLabels={true}
                      animated={false}
                      size="small"
                    />
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.hexagramCardContainer}>
                {/* Loading state */}
                <View style={styles.hexagramImageWrapper}>
                  <ActivityIndicator size="large" color={COLORS.gold} />
                </View>
                <View style={styles.emptyHexagram}>
                  <Text style={styles.emptyText}>Đang gieo quẻ...</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Quota Display - HIDE during traditional casting */}
        {!isLoadingQuota && !(castingMode === CASTING_MODE.TRADITIONAL && castingPhase === CASTING_PHASE.CASTING) && (
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

        {/* Cast Button - HIDE during traditional casting mode OR when we have result (Gieo lại is at bottom) */}
        {!(castingMode === CASTING_MODE.TRADITIONAL && castingPhase === CASTING_PHASE.CASTING) && !hexagram && (
          <Pressable
            style={({ pressed }) => [
              styles.castButton,
              (isLoading || isLoadingQuota) && styles.castButtonDisabled,
              !canDivine() && styles.castButtonLocked,
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
            ]}
            onPress={() => {
              // Debug: console.log('[IChingScreen] Cast button pressed');
              // If in traditional mode result, reset to mode selection
              if (castingMode === CASTING_MODE.TRADITIONAL && castingPhase === CASTING_PHASE.RESULT) {
                resetCasting();
              } else {
                castHexagram();
              }
            }}
            disabled={isLoading || isLoadingQuota}
          >
            <LinearGradient
              colors={!canDivine() ? ['#505050', '#3C3C3C'] : ['#D4AF37', '#FFBD59']}
              style={styles.castButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isLoadingQuota ? (
                <ActivityIndicator size="small" color={COLORS.textPrimary} />
              ) : !canDivine() ? (
                <>
                  <Lock size={18} color="#999" />
                  <Text style={[styles.castButtonText, styles.castButtonTextLocked]}>
                    Hết lượt hôm nay
                  </Text>
                </>
              ) : (
                <>
                  <RefreshCw size={18} color="#0A0F1C" />
                  <Text style={styles.castButtonText}>
                    {isLoading ? 'Đang gieo...' : hexagram ? 'Gieo lại' : 'Gieo quẻ'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        )}

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
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.areaTabs}
                  scrollEventThrottle={16}
                  decelerationRate="fast"
                  overScrollMode="never"
                >
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
                    onQuickBuy={handleQuickBuy}
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

            {/* MERGED: Guidance Section (Affirmations + Action Plan + Rituals) */}
            {(interpretation.affirmations?.length > 0 ||
              interpretation.interpretations?.[selectedArea]?.actionSteps?.length > 0 ||
              interpretation.rituals?.length > 0) && (
              <View style={styles.guidanceSectionWrapper}>
                {/* Header */}
                <TouchableOpacity
                  style={styles.collapsibleHeader}
                  onPress={() => setShowGuidanceSection(!showGuidanceSection)}
                >
                  <View style={styles.collapsibleHeaderLeft}>
                    <Sparkles size={18} color={COLORS.gold} />
                    <Text style={styles.collapsibleTitle}>Hướng Dẫn Thực Hành</Text>
                  </View>
                  {showGuidanceSection ? (
                    <ChevronUp size={20} color={COLORS.textMuted} />
                  ) : (
                    <ChevronDown size={20} color={COLORS.textMuted} />
                  )}
                </TouchableOpacity>

                {showGuidanceSection && (
                  <View style={styles.guidanceSectionContent}>
                    {/* Affirmations Sub-section */}
                    {interpretation.affirmations?.length > 0 && (
                      <View style={styles.guidanceSubSection}>
                        <Text style={styles.guidanceSubTitle}>
                          <Text style={{ color: COLORS.gold }}>✨</Text> Câu Khẳng Định
                        </Text>
                        <View style={styles.affirmationsContainer}>
                          {interpretation.affirmations.map((aff, idx) => (
                            <View key={idx} style={styles.affirmationCard}>
                              <View style={styles.affirmationContent}>
                                <Text style={styles.affirmationText}>"{aff}"</Text>
                                <TouchableOpacity
                                  style={styles.copyButton}
                                  onPress={async () => {
                                    await Clipboard.setStringAsync(aff);
                                    setCopiedIndex(idx);
                                    setTimeout(() => setCopiedIndex(null), 2000);
                                  }}
                                  activeOpacity={0.7}
                                >
                                  {copiedIndex === idx ? (
                                    <Text style={styles.copiedText}>Đã copy</Text>
                                  ) : (
                                    <Copy size={16} color={COLORS.cyan} />
                                  )}
                                </TouchableOpacity>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Action Plan Sub-section */}
                    {interpretation.interpretations?.[selectedArea]?.actionSteps?.length > 0 && (
                      <View style={styles.guidanceSubSection}>
                        <Text style={styles.guidanceSubTitle}>
                          <Text style={{ color: COLORS.cyan }}>📋</Text> Kế Hoạch Hành Động
                        </Text>
                        <View style={styles.actionPlanContainer}>
                          {interpretation.interpretations[selectedArea].actionSteps.map((step, idx) => (
                            <View key={idx} style={styles.actionPlanItem}>
                              <View style={styles.actionPlanNumber}>
                                <Text style={styles.actionPlanNumberText}>{idx + 1}</Text>
                              </View>
                              <Text style={styles.actionPlanText}>{step}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Rituals Sub-section */}
                    {interpretation.rituals?.length > 0 && (
                      <View style={styles.guidanceSubSection}>
                        <Text style={styles.guidanceSubTitle}>
                          <Text style={{ color: COLORS.purple }}>💎</Text> Nghi Thức Tâm Linh
                        </Text>
                        <View style={styles.ritualsContainer}>
                          {interpretation.rituals.map((ritual, idx) => (
                            <View key={idx} style={styles.ritualCard}>
                              <Text style={styles.ritualTitle}>{ritual.name || `Nghi thức ${idx + 1}`}</Text>
                              <Text style={styles.ritualDesc}>{ritual.description || ritual}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* SINGLE Button to save ALL to VisionBoard */}
                    <TouchableOpacity
                      style={styles.saveAllToVBButton}
                      onPress={() => {
                        setShowInlineVBForm(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Sparkles size={16} color={COLORS.gold} />
                      <Text style={styles.saveAllToVBText}>Lưu vào Vision Board</Text>
                    </TouchableOpacity>

                    {/* INLINE Vision Board Form (shows right here, not at bottom) */}
                    {showInlineVBForm && (
                      <SmartFormCardNew
                        widget={{
                          type: 'goal', // Changed from 'iching_guidance' to create proper Goal Widget
                          title: `Mục tiêu từ ${hexagram?.name || 'Kinh Dịch'}`,
                          icon: '🎯',
                          explanation: 'Lưu câu khẳng định, kế hoạch hành động và nghi thức tâm linh vào Vision Board để theo dõi và thực hiện mỗi ngày.',
                          hexagramNumber: hexagram?.id,
                          hexagramName: hexagram?.name,
                          chineseName: hexagram?.chineseName,
                          affirmations: interpretation.affirmations || [],
                          actionSteps: interpretation.interpretations?.[selectedArea]?.actionSteps || [],
                          rituals: interpretation.rituals || [],
                          crystals: interpretation.crystals || [],
                          lifeArea: selectedArea || 'personal', // Add lifeArea for grouping
                          goalText: `Thực hành thông điệp từ quẻ ${hexagram?.name || 'Kinh Dịch'}`, // Add goalText
                          area: selectedArea,
                          advice: interpretation?.advice,
                          source: 'iching',
                        }}
                        onDismiss={() => setShowInlineVBForm(false)}
                      />
                    )}
                  </View>
                )}
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

            {/* Bottom Action Buttons Row */}
            <View style={styles.bottomActionsRow}>
              {/* Claim Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.claimButton,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                ]}
                onPress={async () => {
                  // Debug: console.log('[IChingScreen] Claim pressed');

                  // Get the hexagram image asset for sending to chat
                  const hexagramImageAsset = getHexagramImage(hexagram.id);
                  let imageUri = null;

                  try {
                    if (hexagramImageAsset) {
                      const asset = Asset.fromModule(hexagramImageAsset);
                      await asset.downloadAsync();
                      imageUri = asset.localUri || asset.uri;
                    }
                  } catch (error) {
                    // Debug: console.error('[IChingScreen] Error getting image URI:', error);
                  }

                  // Format result for chat
                  const fullHexagramName = `Quẻ ${hexagram.name}${hexagram.image ? ` - ${hexagram.image}` : ''}`;
                  const resultData = {
                    type: 'iching',
                    text: `🔮 **Kết quả Kinh Dịch**\n\n**${fullHexagramName}** (${hexagram.chineseName})\n\n${interpretation.general}\n\n**Lời khuyên:** ${interpretation.advice}`,
                    hexagram: {
                      id: hexagram.id,
                      name: hexagram.name,
                      chineseName: hexagram.chineseName,
                      meaning: hexagram.meaning,
                      lines: hexagram.lines,
                    },
                    interpretation: interpretation,
                    imageUri: imageUri,
                    imageSource: hexagramImageAsset,
                  };

                  navigation.goBack();
                  if (onSendToChat) {
                    setTimeout(() => onSendToChat(resultData), 100);
                  }
                }}
              >
                <LinearGradient
                  colors={['rgba(180, 145, 45, 0.9)', 'rgba(212, 175, 55, 0.95)']}
                  style={styles.claimButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.claimButtonText}>✨ Claim</Text>
                  <Text style={styles.claimButtonSubtext}>Nhận thông điệp</Text>
                </LinearGradient>
              </Pressable>

              {/* Gieo lại Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.recastButton,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => {
                  if (castingMode === CASTING_MODE.TRADITIONAL) {
                    resetCasting();
                  } else {
                    castHexagram();
                  }
                }}
                disabled={isLoading || !canDivine()}
              >
                <RefreshCw size={20} color={COLORS.textPrimary} />
                <Text style={styles.recastButtonText}>Gieo lại</Text>
              </Pressable>
            </View>

            {/* Share Button */}
            <TouchableOpacity
              style={styles.shareButton}
              activeOpacity={0.7}
              onPress={async () => {
                try {
                  const shareHexagramName = `Quẻ ${hexagram.name}${hexagram.image ? ` - ${hexagram.image}` : ''}`;
                  const shareContent = `🔮 Kết quả Kinh Dịch - Gemral\n\n` +
                    `${shareHexagramName} (${hexagram.chineseName})\n\n` +
                    `${interpretation.general}\n\n` +
                    `💡 Lời khuyên: ${interpretation.advice}\n\n` +
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

          </View>
        )}
      </ScrollView>

        {/* Upgrade Modal - with Shopify checkout flow */}
        <ChatbotPricingModal
          visible={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          quota={quota}
          currentTier={userTier}
        />

        {/* NEW: Quick Buy Modal for crystal purchase from recommendations */}
        <QuickBuyModal
          visible={quickBuyModal.visible}
          product={quickBuyModal.product}
          onClose={() => setQuickBuyModal({ visible: false, product: null })}
          onShowUpsell={handleShowUpsell}
          onBuyNow={handleBuyNow}
        />

        {/* NEW: Upsell Modal - shows after adding to cart */}
        <UpsellModal
          visible={upsellModal.visible}
          upsellData={upsellModal.upsellData}
          onClose={() => setUpsellModal({ visible: false, upsellData: null })}
          onCheckout={handleCheckout}
          onContinueShopping={handleContinueShopping}
        />
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  gradientOverlay: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
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
    color: COLORS.gold,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  quotaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
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
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
  },
  castButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
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
    color: COLORS.gold,
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  interpretCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: SPACING.md,
  },
  fortuneLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    fontSize: 22,
    color: 'rgba(255, 255, 255, 0.15)',
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
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  sendToChatText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0A0F1C',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginTop: SPACING.md,
  },
  shareButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  // Keywords
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  keywordTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  areaTabActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  areaTabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  areaTabTextActive: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  // Area Interpretation Card
  areaInterpretCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: SPACING.sm,
  },
  actionStepsLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  actionStep: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    paddingLeft: SPACING.xs,
  },
  // Collapsible Header
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
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
    color: COLORS.gold,
  },
  // Crystals
  crystalsContainer: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  crystalCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 10,
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
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 10,
    padding: SPACING.md,
    borderLeftWidth: 2,
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
    color: 'rgba(255, 255, 255, 0.75)',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  // Save affirmations button
  saveAffirmationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  saveAffirmationsText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  // ========== MERGED GUIDANCE SECTION STYLES ==========
  guidanceSectionWrapper: {
    marginTop: SPACING.md,
  },
  guidanceSectionContent: {
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.25)',
    padding: SPACING.md,
    marginTop: SPACING.xs,
  },
  guidanceSubSection: {
    marginBottom: SPACING.lg,
  },
  guidanceSubTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  saveAllToVBButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  saveAllToVBText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0F1030',
  },

  // ========== MODE SELECTION STYLES ==========
  modeSelectionSection: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  modeSelectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modeSelectionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: SPACING.xl,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modeCard: {
    width: '100%',
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  modeCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  modeCardIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeCardContent: {
    flex: 1,
  },
  modeCardTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginBottom: 2,
  },
  modeCardDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },

  // ========== TRADITIONAL CASTING STYLES ==========
  traditionalCastingSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  traditionalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  traditionalSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  hexagramBuilderWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  coinCastWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },

  // ========== PROGRESS INDICATOR ==========
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressDotComplete: {
    backgroundColor: 'rgba(255, 189, 89, 0.6)',
    borderColor: 'rgba(255, 189, 89, 0.8)',
  },
  progressDotActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
    transform: [{ scale: 1.15 }],
  },

  // ========== TRADITIONAL RESULT LINES ==========
  traditionalResultLines: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    width: '100%',
  },
  linesLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ========== HEXAGRAM LINE STYLES ==========
  lineContainer: {
    width: '100%',
    height: 16,
    marginVertical: 4,
    justifyContent: 'center',
  },
  yangLine: {
    height: 10,
    backgroundColor: COLORS.gold,
    borderRadius: 4,
  },
  yinLineContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yinLine: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 4,
  },
  yinGap: {
    width: 20,
  },

  // ========== CANCEL CASTING BUTTON ==========
  cancelCastingButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.5)',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  cancelCastingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
    textAlign: 'center',
  },

  // ========== COPY FEEDBACK TEXT ==========
  copiedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.green,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // ========== BOTTOM ACTIONS ROW ==========
  bottomActionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  claimButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  claimButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  claimButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0A0F1C',
  },
  claimButtonSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: 'rgba(10, 15, 28, 0.7)',
    marginTop: 2,
  },
  recastButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  recastButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  // ========== ACTION PLAN SECTION ==========
  actionPlanContainer: {
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(0, 15, 20, 0.85)',
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  actionPlanItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  actionPlanNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.cyan,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionPlanNumberText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.cyan,
  },
  actionPlanText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  addToVisionBoardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    marginTop: SPACING.xs,
  },
  addToVisionBoardText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.cyan,
  },

  // ========== RITUAL SECTION ==========
  ritualsContainer: {
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(10, 5, 25, 0.85)',
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  ritualCard: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.15)',
  },
  ritualTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.purple,
    marginBottom: SPACING.xs,
  },
  ritualDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default IChingScreen;
