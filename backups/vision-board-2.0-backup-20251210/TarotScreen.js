/**
 * Gemral - Tarot Screen
 * Interactive tarot card reading
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
  Dimensions,
  Share,
  ActivityIndicator,
  Image,
} from 'react-native';
import alertService from '../../services/alertService';
import * as Clipboard from 'expo-clipboard';
import { Asset } from 'expo-asset';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RefreshCw, Share2, Layers, Star, Moon, Sun, Lock, Briefcase, DollarSign, Heart, Activity, Sparkles, ChevronDown, ChevronUp, ShoppingBag, RotateCcw, Copy } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS, LAYOUT } from '../../utils/tokens';

// Bottom padding to avoid tab bar overlap (increased for buttons)
const BOTTOM_PADDING = 140;
import { useTabBar } from '../../contexts/TabBarContext';

// Services for tier/quota checking
import TierService from '../../services/tierService';
import QuotaService from '../../services/quotaService';
import { supabase } from '../../services/supabase';
import { shopifyService } from '../../services/shopifyService';

// Crystal tag mapping for Shopify
import { getCrystalTagsForList } from '../../utils/crystalTagMapping';

// Tarot card images
import { getCardImage } from '../../assets/tarot';

// Import Tarot data from new data files
import { FULL_DECK, MAJOR_ARCANA, getMajorArcanaCard } from '../../data/tarot';
import { getMinorArcanaCard } from '../../data/tarot/minorArcana';

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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.md * 4) / 3;

// Transform new data format to screen format
const transformCardData = (card) => {
  if (!card) return null;

  // Check if it's from Major Arcana (has numeric id) or Minor Arcana (has string id)
  const isMajor = typeof card.id === 'number';

  return {
    ...card,
    vietnamese: card.vietnameseName,
    meaning: card.keywords?.join(', ') || '',
    arcana: isMajor ? 'major' : (card.suit?.toLowerCase() || 'minor'),
    icon: Star, // Default icon
  };
};

// Create TAROT_CARDS array from new data
const TAROT_CARDS = FULL_DECK.map(transformCardData);

// Spread positions
const SPREAD_POSITIONS = ['Quá khứ', 'Hiện tại', 'Tương lai'];

/**
 * Fisher-Yates shuffle algorithm for true randomness
 * Ensures each card has equal probability of being in any position
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Use crypto-quality randomness with timestamp seed
    const seed = Date.now() + Math.random() * 1000000;
    const j = Math.floor((seed % (i + 1)));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const TarotScreen = ({ navigation, route }) => {
  const [selectedCards, setSelectedCards] = useState([null, null, null]);
  const [isRevealed, setIsRevealed] = useState([false, false, false]);
  const [isReading, setIsReading] = useState(false);
  const [interpretation, setInterpretation] = useState(null);
  const [isReversed, setIsReversed] = useState([false, false, false]); // Track reversed cards
  const [selectedCardIndex, setSelectedCardIndex] = useState(null); // For detailed view
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

  // NEW: Crystal recommendation context from tarot reading
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
          console.log('[TarotScreen] User tier:', tier, 'Quota:', quotaData);
        } else {
          setUserTier('FREE');
          setQuota(QuotaService.getDefaultQuota());
        }
      } catch (error) {
        console.error('[TarotScreen] Error loading quota:', error);
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
      console.error('[TarotScreen] Error refreshing quota:', error);
    }
  }, [user, userTier]);

  // Animation refs
  const cardFlips = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Fetch crystal products from Shopify
  const fetchCrystalProducts = useCallback(async (crystals) => {
    try {
      setIsLoadingProducts(true);
      console.log('[TarotScreen] Fetching crystal products for:', crystals.map(c => c.name));

      // Get Shopify tags from crystal data
      const tags = getCrystalTagsForList(crystals);
      console.log('[TarotScreen] Searching Shopify with tags:', tags);

      // Fetch products from Shopify
      const products = await shopifyService.getProductsByTags(tags, 4, true);
      console.log('[TarotScreen] Found', products.length, 'Shopify products');

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
      console.error('[TarotScreen] Error fetching crystal products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // Draw cards
  const drawCards = useCallback(async () => {
    // CHECK QUOTA FIRST
    if (!canDivine()) {
      alertService.warning(
        'Hết lượt hôm nay',
        `Bạn đã sử dụng hết ${quota?.limit || 5} lượt hỏi trong ngày.\n\nNâng cấp lên tier cao hơn để có thêm lượt:\n• TIER1/PRO: 15 lượt/ngày\n• TIER2/PREMIUM: 50 lượt/ngày\n• TIER3/VIP: Không giới hạn`,
        [{ text: 'Đóng' }]
      );
      return;
    }

    setIsReading(true);
    setSelectedCards([null, null, null]);
    setIsRevealed([false, false, false]);
    setIsReversed([false, false, false]);
    setInterpretation(null);
    setSelectedCardIndex(null);
    setShowCrystals(false);
    setShowAffirmations(false);

    // Reset animations
    cardFlips.forEach((anim) => anim.setValue(0));

    // DECREMENT QUOTA (uses same quota as chat)
    if (user) {
      await QuotaService.decrementQuota(user.id);
      await refreshQuota();
    }

    // True random shuffle using Fisher-Yates algorithm
    const shuffled = shuffleArray(TAROT_CARDS);
    // Add extra randomness - pick from different positions
    const extraSeed = Math.floor(Date.now() % 100);
    const drawn = [
      shuffled[extraSeed % 78],
      shuffled[(extraSeed + 17) % 78], // Prime offset for better distribution
      shuffled[(extraSeed + 41) % 78], // Another prime offset
    ];

    // Randomly determine if each card is reversed (30% chance)
    const reversedCards = [
      Math.random() < 0.3,
      Math.random() < 0.3,
      Math.random() < 0.3,
    ];
    setIsReversed(reversedCards);

    // Reveal cards one by one with animation
    for (let i = 0; i < 3; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSelectedCards((prev) => {
        const newCards = [...prev];
        newCards[i] = drawn[i];
        return newCards;
      });

      Animated.spring(cardFlips[i], {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();

      setIsRevealed((prev) => {
        const newRevealed = [...prev];
        newRevealed[i] = true;
        return newRevealed;
      });
    }

    // Generate interpretation
    await new Promise((resolve) => setTimeout(resolve, 300));
    const interp = generateInterpretation(drawn, reversedCards);
    setInterpretation(interp);
    setIsReading(false);

    // Fetch real crystal products from Shopify
    if (interp.crystals && interp.crystals.length > 0) {
      fetchCrystalProducts(interp.crystals);
    }

    // NEW: Build crystal context for CrystalRecommendationNew
    const crystalNames = interp.crystals?.map(c => c.vietnameseName || c.name).join(', ') || '';
    const tarotContext = `Tarot reading: ${drawn.map(c => c.vietnamese).join(', ')}. Đá năng lượng: ${crystalNames}. Tâm linh, năng lượng, phong thủy.`;
    setCrystalContext(tarotContext);

    // Detect widget trigger for "Add to Dashboard" suggestion
    const trigger = detectWidgetTrigger({
      type: 'tarot',
      cards: drawn.map((c, idx) => ({
        name: c.name,
        vietnamese: c.vietnamese,
        position: SPREAD_POSITIONS[idx],
        isReversed: reversedCards[idx],
      })),
      spreadType: 'three-card',
      interpretation: interp.summary,
      crystals: interp.crystals,
      affirmations: interp.affirmations,
    });
    setWidgetTrigger(trigger);
  }, [cardFlips, canDivine, quota, user, refreshQuota]);

  // Generate interpretation from new data structure
  const generateInterpretation = (cards, reversedArr) => {
    // Get detailed card data for each position
    const getCardDetails = (card, index) => {
      const isRev = reversedArr[index];
      const isMajor = typeof card.id === 'number';

      // Get full card data
      let fullCard = null;
      if (isMajor) {
        fullCard = getMajorArcanaCard(card.id);
      } else if (card.id) {
        fullCard = getMinorArcanaCard(card.id);
      }

      if (fullCard) {
        const reading = isRev ? fullCard.reversed : fullCard.upright;
        return {
          name: fullCard.vietnameseName || card.vietnamese,
          isReversed: isRev,
          keywords: fullCard.keywords || [],
          overview: reading?.overview || '',
          career: reading?.career,
          finance: reading?.finance,
          love: reading?.love,
          health: reading?.health,
          spiritual: reading?.spiritual,
          warning: fullCard.reversed?.warning,
          advice: fullCard.reversed?.advice || reading?.overview,
          crystals: fullCard.crystals || [],
          affirmations: fullCard.affirmations || [],
        };
      }

      // Fallback
      return {
        name: card.vietnamese,
        isReversed: isRev,
        keywords: card.meaning?.split(', ') || [],
        overview: card.meaning || '',
        crystals: [],
        affirmations: [],
      };
    };

    const pastCard = getCardDetails(cards[0], 0);
    const presentCard = getCardDetails(cards[1], 1);
    const futureCard = getCardDetails(cards[2], 2);

    return {
      summary: `Trải bài của bạn cho thấy một hành trình từ ${pastCard.name}${pastCard.isReversed ? ' (ngược)' : ''} đến ${futureCard.name}${futureCard.isReversed ? ' (ngược)' : ''}. Đây là thông điệp quan trọng cho giai đoạn này.`,
      cards: [pastCard, presentCard, futureCard],
      past: {
        title: pastCard.name + (pastCard.isReversed ? ' (Ngược)' : ''),
        overview: pastCard.overview,
        keywords: pastCard.keywords,
      },
      present: {
        title: presentCard.name + (presentCard.isReversed ? ' (Ngược)' : ''),
        overview: presentCard.overview,
        keywords: presentCard.keywords,
      },
      future: {
        title: futureCard.name + (futureCard.isReversed ? ' (Ngược)' : ''),
        overview: futureCard.overview,
        keywords: futureCard.keywords,
      },
      // Combine crystals from all cards
      crystals: [...pastCard.crystals, ...presentCard.crystals, ...futureCard.crystals]
        .filter((c, i, arr) => arr.findIndex(x => x.name === c.name) === i).slice(0, 5),
      // Combine affirmations
      affirmations: [...pastCard.affirmations, ...presentCard.affirmations, ...futureCard.affirmations]
        .filter((a, i, arr) => arr.indexOf(a) === i).slice(0, 4),
      advice: 'Hãy tin tưởng vào trực giác và không ngừng tiến về phía trước. Mỗi lá bài đều mang thông điệp riêng, hãy lắng nghe và áp dụng vào cuộc sống.',
    };
  };

  // Render card with real tarot images
  const renderCard = (index) => {
    const card = selectedCards[index];
    const revealed = isRevealed[index];

    const frontAnimatedStyle = {
      transform: [
        {
          rotateY: cardFlips[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['180deg', '360deg'],
          }),
        },
      ],
    };

    const backAnimatedStyle = {
      transform: [
        {
          rotateY: cardFlips[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
          }),
        },
      ],
    };

    // Get real card image - debug logging
    const cardImage = card ? getCardImage(card.id) : null;
    if (card) {
      console.log('[TarotScreen] renderCard:', {
        index,
        cardId: card.id,
        cardIdType: typeof card.id,
        cardName: card.vietnamese || card.name,
        hasImage: !!cardImage,
        imageValue: cardImage,
      });
    }

    return (
      <View key={index} style={styles.cardSlot}>
        <Text style={styles.positionLabel}>{SPREAD_POSITIONS[index]}</Text>

        <View style={styles.cardContainer}>
          {/* Card Back */}
          <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
            <LinearGradient
              colors={['#2A1F5C', '#1A1438']}
              style={styles.cardBackGradient}
            >
              <View style={styles.cardBackPattern}>
                <Star size={24} color={COLORS.gold} strokeWidth={1} />
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Card Front - Real Tarot Image */}
          <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
            {card && cardImage ? (
              <Image
                source={cardImage}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['rgba(255, 189, 89, 0.3)', 'rgba(106, 91, 255, 0.2)']}
                style={styles.cardFrontGradient}
              >
                <Star size={28} color={COLORS.gold} />
              </LinearGradient>
            )}
            {/* Card name overlay */}
            {card && (
              <View style={styles.cardNameOverlay}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {card.vietnamese}
                </Text>
              </View>
            )}
          </Animated.View>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>Tarot</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Cards Section */}
        <View style={styles.cardsSection}>
          <View style={styles.spreadIcon}>
            <Layers size={32} color={COLORS.cyan} />
          </View>
          <Text style={styles.spreadTitle}>Trải bài 3 lá</Text>
          <Text style={styles.spreadSubtitle}>Quá khứ - Hiện tại - Tương lai</Text>

          {/* Cards Row */}
          <View style={styles.cardsRow}>
            {[0, 1, 2].map((index) => renderCard(index))}
          </View>
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

        {/* Draw Button - Using Pressable for better touch handling */}
        <Pressable
          style={({ pressed }) => [
            styles.drawButton,
            (isReading || isLoadingQuota) && styles.drawButtonDisabled,
            !canDivine() && styles.drawButtonLocked,
            pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
          ]}
          onPress={() => {
            console.log('[TarotScreen] Draw button pressed');
            drawCards();
          }}
          disabled={isReading || isLoadingQuota}
        >
          <LinearGradient
            colors={!canDivine() ? ['#555', '#444'] : GRADIENTS.glassBorder}
            style={styles.drawButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isLoadingQuota ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : !canDivine() ? (
              <>
                <Lock size={20} color="#999" />
                <Text style={[styles.drawButtonText, styles.drawButtonTextLocked]}>
                  Hết lượt hôm nay
                </Text>
              </>
            ) : (
              <>
                <RefreshCw size={20} color="#FFFFFF" />
                <Text style={styles.drawButtonText}>
                  {isReading ? 'Đang bốc bài...' : selectedCards[0] ? 'Bốc lại' : 'Bốc bài'}
                </Text>
              </>
            )}
          </LinearGradient>
        </Pressable>

        {/* Interpretation */}
        {interpretation && (
          <View style={styles.interpretationSection}>
            <Text style={styles.sectionTitle}>Giải bài</Text>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{interpretation.summary}</Text>
            </View>

            {/* Past */}
            <View style={styles.interpretCard}>
              <View style={styles.interpretHeader}>
                <Text style={styles.interpretLabel}>Quá khứ</Text>
                {isReversed[0] && (
                  <View style={styles.reversedBadge}>
                    <RotateCcw size={12} color={COLORS.warning} />
                    <Text style={styles.reversedText}>Ngược</Text>
                  </View>
                )}
              </View>
              <Text style={styles.interpretTitle}>{interpretation.past?.title}</Text>
              {interpretation.past?.keywords && interpretation.past.keywords.length > 0 && (
                <View style={styles.keywordsRow}>
                  {interpretation.past.keywords.slice(0, 3).map((kw, idx) => (
                    <View key={idx} style={styles.keywordTag}>
                      <Text style={styles.keywordText}>{kw}</Text>
                    </View>
                  ))}
                </View>
              )}
              <Text style={styles.interpretText}>{interpretation.past?.overview}</Text>
            </View>

            {/* Present */}
            <View style={[styles.interpretCard, styles.presentCard]}>
              <View style={styles.interpretHeader}>
                <Text style={[styles.interpretLabel, styles.presentLabel]}>Hiện tại</Text>
                {isReversed[1] && (
                  <View style={styles.reversedBadge}>
                    <RotateCcw size={12} color={COLORS.warning} />
                    <Text style={styles.reversedText}>Ngược</Text>
                  </View>
                )}
              </View>
              <Text style={styles.interpretTitle}>{interpretation.present?.title}</Text>
              {interpretation.present?.keywords && interpretation.present.keywords.length > 0 && (
                <View style={styles.keywordsRow}>
                  {interpretation.present.keywords.slice(0, 3).map((kw, idx) => (
                    <View key={idx} style={[styles.keywordTag, styles.keywordTagCyan]}>
                      <Text style={[styles.keywordText, styles.keywordTextCyan]}>{kw}</Text>
                    </View>
                  ))}
                </View>
              )}
              <Text style={styles.interpretText}>{interpretation.present?.overview}</Text>
            </View>

            {/* Future */}
            <View style={[styles.interpretCard, styles.futureCard]}>
              <View style={styles.interpretHeader}>
                <Text style={[styles.interpretLabel, styles.futureLabel]}>Tương lai</Text>
                {isReversed[2] && (
                  <View style={styles.reversedBadge}>
                    <RotateCcw size={12} color={COLORS.warning} />
                    <Text style={styles.reversedText}>Ngược</Text>
                  </View>
                )}
              </View>
              <Text style={styles.interpretTitle}>{interpretation.future?.title}</Text>
              {interpretation.future?.keywords && interpretation.future.keywords.length > 0 && (
                <View style={styles.keywordsRow}>
                  {interpretation.future.keywords.slice(0, 3).map((kw, idx) => (
                    <View key={idx} style={[styles.keywordTag, styles.keywordTagGreen]}>
                      <Text style={[styles.keywordText, styles.keywordTextGreen]}>{kw}</Text>
                    </View>
                  ))}
                </View>
              )}
              <Text style={styles.interpretText}>{interpretation.future?.overview}</Text>
            </View>

            {/* Crystals Section */}
            {interpretation.crystals && interpretation.crystals.length > 0 && (
              <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => setShowCrystals(!showCrystals)}
              >
                <View style={styles.collapsibleHeaderLeft}>
                  <ShoppingBag size={18} color={COLORS.gold} />
                  <Text style={styles.collapsibleTitle}>Đá năng lượng gợi ý</Text>
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
                        title: 'Affirmations từ Tarot',
                        affirmations: interpretation.affirmations,
                        source: 'tarot',
                        cards: selectedCards?.map(c => c?.vietnamese).join(', '),
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
              context={`${interpretation.summary || ''} ${interpretation.advice || ''} tâm linh năng lượng tần số`}
            />

            {/* Advice */}
            <View style={styles.adviceCard}>
              <Text style={styles.adviceLabel}>Lời khuyên</Text>
              <Text style={styles.adviceText}>{interpretation.advice}</Text>
            </View>

            {/* Send to Chat Button */}
            <Pressable
              style={({ pressed }) => [
                styles.sendToChatButton,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
              onPress={async () => {
                console.log('[TarotScreen] Send to chat pressed');

                const cards = selectedCards;

                // Get image URIs for all 3 cards
                const cardImages = await Promise.all(
                  cards.map(async (card) => {
                    try {
                      const cardImageAsset = getCardImage(card.id);
                      if (cardImageAsset) {
                        const asset = Asset.fromModule(cardImageAsset);
                        await asset.downloadAsync();
                        return {
                          uri: asset.localUri || asset.uri,
                          source: cardImageAsset,
                        };
                      }
                    } catch (error) {
                      console.error('[TarotScreen] Error getting card image:', error);
                    }
                    return null;
                  })
                );

                console.log('[TarotScreen] Card images:', cardImages);

                // Format result for chat with visual data AND images
                const resultData = {
                  type: 'tarot',
                  text: `🃏 **Kết quả Tarot - Trải 3 lá**\n\n**Quá khứ:** ${cards[0].vietnamese} - ${cards[0].meaning}\n\n**Hiện tại:** ${cards[1].vietnamese} - ${cards[1].meaning}\n\n**Tương lai:** ${cards[2].vietnamese} - ${cards[2].meaning}\n\n📖 ${interpretation.summary}\n\n💡 **Lời khuyên:** ${interpretation.advice}`,
                  cards: cards.map((card, idx) => ({
                    id: card.id,
                    name: card.name,
                    vietnamese: card.vietnamese,
                    meaning: card.meaning,
                    icon: card.icon?.name || 'Star',
                    arcana: card.arcana,
                    isReversed: isReversed[idx],
                    position: SPREAD_POSITIONS[idx],
                    // Include image data
                    imageUri: cardImages[idx]?.uri,
                    imageSource: cardImages[idx]?.source,
                  })),
                  interpretation: interpretation,
                  // Include array of images for easy access
                  images: cardImages.filter(Boolean).map(img => img.uri),
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
                  const cards = selectedCards;
                  const shareContent = `🃏 Kết quả Tarot - Gemral\n\n` +
                    `Trải bài 3 lá:\n` +
                    `• Quá khứ: ${cards[0].vietnamese} - ${cards[0].meaning}\n` +
                    `• Hiện tại: ${cards[1].vietnamese} - ${cards[1].meaning}\n` +
                    `• Tương lai: ${cards[2].vietnamese} - ${cards[2].meaning}\n\n` +
                    `${interpretation.summary}\n\n` +
                    `💡 Lời khuyên: ${interpretation.advice}\n\n` +
                    `📲 Tải app Gemral để bốc bài của bạn!\nhttps://gemral.com`;

                  await Share.share({
                    message: shareContent,
                    title: 'Kết quả Tarot - Gemral',
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
          widgetType={widgetTrigger?.type || WIDGET_TYPES.TAROT}
          initialData={{
            cards: selectedCards?.map((c, idx) => ({
              id: c?.id, // Card ID for image lookup
              name: c?.name,
              vietnamese: c?.vietnamese,
              position: SPREAD_POSITIONS[idx],
              isReversed: isReversed[idx],
            })),
            spread: 'three-card',
            interpretation: interpretation?.summary,
            crystals: interpretation?.crystals,
            affirmations: interpretation?.affirmations,
          }}
          onSave={(widgetData) => {
            console.log('[TarotScreen] Widget saved:', widgetData);
            setShowWidgetForm(false);
            setWidgetTrigger(null);
            alertService.success('Đã lưu!', 'Trải bài đã được thêm vào Dashboard của bạn.');
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
  cardsSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  spreadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  spreadTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  spreadSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  cardSlot: {
    alignItems: 'center',
  },
  positionLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.5,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
  },
  cardBack: {
    zIndex: 1,
  },
  cardFront: {
    zIndex: 0,
  },
  cardBackGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
    borderRadius: 12,
  },
  cardBackPattern: {
    opacity: 0.5,
  },
  cardFrontGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.5)',
    borderRadius: 12,
  },
  // Real tarot card image
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  // Name overlay at bottom of card
  cardNameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  cardName: {
    fontSize: 10,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
  },
  // Quota display
  quotaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  quotaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  tierText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.cyan,
  },
  drawButton: {
    marginBottom: SPACING.xl,
  },
  drawButtonDisabled: {
    opacity: 0.6,
  },
  drawButtonLocked: {
    opacity: 0.8,
  },
  drawButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: 24,
  },
  drawButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
  },
  drawButtonTextLocked: {
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
  summaryCard: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    padding: SPACING.md,
  },
  summaryText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  interpretCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.md,
  },
  presentCard: {
    borderColor: 'rgba(0, 240, 255, 0.3)',
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  futureCard: {
    borderColor: 'rgba(58, 247, 166, 0.3)',
    backgroundColor: 'rgba(58, 247, 166, 0.05)',
  },
  interpretLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  presentLabel: {
    color: COLORS.cyan,
  },
  futureLabel: {
    color: COLORS.success,
  },
  interpretText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  adviceCard: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    padding: SPACING.md,
  },
  adviceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  adviceText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
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
  // New styles for enhanced interpretation
  interpretHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  interpretTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  reversedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reversedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.warning,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  keywordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  keywordTag: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderRadius: 10,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  keywordText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  keywordTagCyan: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  keywordTextCyan: {
    color: COLORS.cyan,
  },
  keywordTagGreen: {
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
    borderColor: 'rgba(58, 247, 166, 0.3)',
  },
  keywordTextGreen: {
    color: COLORS.success,
  },
  // Collapsible sections
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
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.cyan,
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

export default TarotScreen;
