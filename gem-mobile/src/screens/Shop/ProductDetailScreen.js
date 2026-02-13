/**
 * Gemral - Product Detail Screen
 * Complete product view with dark theme, image gallery, variants, and sticky CTA
 * Includes: Reviews, Best Sellers, FAQ, Best For You sections
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Animated,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
  Check,
  Truck,
  Shield,
  RotateCcw,
  Package,
  Star,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  MessageCircle,
  HelpCircle,
  Heart,
  X,
  PenLine,
  Send,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../../contexts/CartContext';
import { useTabBar } from '../../contexts/TabBarContext';
import { useAuth } from '../../contexts/AuthContext';
import { shopifyService } from '../../services/shopifyService';
import { reviewService } from '../../services/reviewService';
import affiliateService from '../../services/affiliateService';
import alertService from '../../services/alertService';
import deepLinkHandler from '../../services/deepLinkHandler';
import { ProductAffiliateLinkSheet } from '../../components/Affiliate';
import OptimizedImage from '../../components/Common/OptimizedImage';
import HTMLRenderer from '../../components/Common/HTMLRenderer';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { DARK_THEME } from '../../theme/darkTheme';
import { TrendingUp, Eye, Layers, Grid3X3, Link2 } from 'lucide-react-native';
import { CONTENT_BOTTOM_PADDING, ACTION_BUTTON_BOTTOM_PADDING } from '../../constants/layout';
import { Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Detect product type for commission calculation
 * Digital products: courses, subscriptions, memberships, tiers, scanners
 * Physical products: crystals, jewelry, etc.
 */
const detectProductType = (product) => {
  if (!product) return 'crystal';

  // Normalize text - remove diacritics for Vietnamese
  const normalize = (str) => {
    if (!str) return '';
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd');
  };

  // Get all product text fields
  const productType = normalize(product.product_type);
  const tags = Array.isArray(product.tags)
    ? normalize(product.tags.join(' '))
    : normalize(product.tags);
  const sku = normalize(product.sku || product.variants?.[0]?.sku);
  const title = normalize(product.title || product.name);
  const handle = normalize(product.handle);
  const allText = `${productType} ${tags} ${sku} ${title} ${handle}`;

  // Digital product indicators - based on actual Shopify products
  const digitalIndicators = [
    // Tags from Shopify
    'course', 'digital', 'ebook', 'gem-academy', 'gem academy',
    'khoa-hoc', 'khoa hoc', 'trading', 'trading-course',
    'tier-starter', 'tier 1', 'tier 2', 'tier 3',
    'gem pack', 'gems', 'in-app', 'virtual-currency', 'virtual currency',
    'gem chatbot', 'scanner',
    // Handle patterns
    'gem-trading', 'gem-tier', 'gem-pack', 'gem-scanner', 'gem-chatbot',
    'yinyang-chatbot', 'scanner-dashboard',
    // Title keywords
    'yinyang', 'chatbot', 'ai',
    'vip', 'pro', 'premium', 'popular', 'starter',
    // Vietnamese (normalized - no diacritics)
    'khoa', 'goi', 'tan so', 'khai mo', 'tan so goc',
    'tai tao', 'tu duy', 'trieu phu', 'tinh yeu', 'kich hoat'
  ];

  const isDigital = digitalIndicators.some(indicator => allText.includes(indicator));

  console.log('[detectProductType]', {
    title: title.substring(0, 50),
    isDigital,
    result: isDigital ? 'course (10%)' : 'crystal (6%)'
  });

  return isDigital ? 'course' : 'crystal';
};

// Tab bar height for proper spacing above tab - iOS needs smaller value due to safe area handling
const TAB_BAR_HEIGHT = Platform.select({
  ios: 78,     // iOS: Tab bar sits closer, safe area handled by tab bar itself
  android: 115, // Android: Works correctly with this value
});

const ProductDetailScreen = ({ navigation, route }) => {
  // CRITICAL: Validate route.params and product before destructuring
  const initialProduct = route.params?.product;

  // Deep link params
  const deepLinkProductId = route.params?.productId;
  const deepLinkHandle = route.params?.handle;
  const affiliateCodeFromLink = route.params?.affiliateCode;
  const fromDeepLink = route.params?.fromDeepLink === true;

  // State to hold the full product data (fetched from Shopify if needed)
  const [product, setProduct] = useState(initialProduct);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deepLinkLoading, setDeepLinkLoading] = useState(fromDeepLink && !initialProduct);

  // IMPORTANT: All hooks MUST be called before any conditional returns
  // React hooks must be called in the same order on every render
  const { addItem, itemCount } = useCart();
  const { handleScroll, translateY } = useTabBar();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const imageScrollRef = useRef(null);

  // Additional sections state - Multiple recommendation sections for infinite scroll
  const [bestSellers, setBestSellers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [complementary, setComplementary] = useState([]);
  const [trending, setTrending] = useState([]);
  const [moreToExplore, setMoreToExplore] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // Review image zoom modal state - with swipe support for multiple images
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedReviewImage, setSelectedReviewImage] = useState(null);
  const [reviewImages, setReviewImages] = useState([]); // All images from the review
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageViewerRef = useRef(null);

  // Product image fullscreen viewer state
  const [productImageViewerVisible, setProductImageViewerVisible] = useState(false);
  const [productImageIndex, setProductImageIndex] = useState(0);
  const [imageScale, setImageScale] = useState(new Animated.Value(1));
  const [imageDimensions, setImageDimensions] = useState({}); // Store dimensions for each image
  const productImageViewerRef = useRef(null);

  // Affiliate link state
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [affiliateLinkSheetVisible, setAffiliateLinkSheetVisible] = useState(false);

  // User review state
  const { user } = useAuth();
  const [canWriteReview, setCanWriteReview] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [allReviews, setAllReviews] = useState([]);

  // Set selected variant when product is available
  useEffect(() => {
    if (product?.variants?.[0]) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  // Handle deep link - store affiliate code and fetch product
  useEffect(() => {
    const handleDeepLinkInit = async () => {
      // Store affiliate code for checkout attribution
      if (affiliateCodeFromLink) {
        try {
          await deepLinkHandler.storeCheckoutAffiliate(affiliateCodeFromLink);
          console.log('[ProductDetail] Stored affiliate code:', affiliateCodeFromLink);
        } catch (error) {
          console.error('[ProductDetail] Error storing affiliate code:', error);
        }
      }

      // If we came from deep link without product data, fetch it
      if (fromDeepLink && !initialProduct) {
        setDeepLinkLoading(true);
        try {
          let fetchedProduct = null;

          // Try by handle first
          if (deepLinkHandle) {
            fetchedProduct = await shopifyService.getProductByHandle(deepLinkHandle);
          }

          // Try by ID if handle didn't work
          if (!fetchedProduct && deepLinkProductId) {
            fetchedProduct = await shopifyService.getProductById(deepLinkProductId);
          }

          if (fetchedProduct) {
            setProduct(fetchedProduct);
            console.log('[ProductDetail] Fetched product from deep link:', fetchedProduct.title);
          } else {
            console.warn('[ProductDetail] Could not find product from deep link params');
          }
        } catch (error) {
          console.error('[ProductDetail] Error fetching product from deep link:', error);
        } finally {
          setDeepLinkLoading(false);
        }
      }
    };

    handleDeepLinkInit();
  }, [affiliateCodeFromLink, fromDeepLink, deepLinkHandle, deepLinkProductId, initialProduct]);

  // Log warning if no product data - don't auto-navigate (causes errors)
  useEffect(() => {
    if (!product || (!product.id && !product.handle && !product.title)) {
      // Don't auto-navigate back - let user press back button
      // Auto goBack() causes navigation errors and infinite loops
    }
  }, [product]);

  // Fetch full product data from Shopify if we only have cached/partial data
  // This handles products linked from posts which may have outdated price/images
  // DEFERRED to not block navigation
  useEffect(() => {
    const fetchFullProductData = async () => {
      // Check if we have enough data or need to fetch
      // Products from posts typically only have: id, handle, title, price, image
      // Full Shopify products have: variants array, description_html, multiple images
      const needsFetch = initialProduct && (initialProduct.handle || initialProduct.id) && (
        !initialProduct.variants?.length ||
        !initialProduct.description_html || // Need HTML description for rich formatting
        !initialProduct.description ||
        initialProduct.variants?.[0]?.title === 'Default' || // Placeholder variant from PostCard
        (initialProduct.images?.length || 0) <= 1 // Only has 1 or no images
      );

      if (needsFetch) {
        setIsRefreshing(true);

        try {
          let fullProduct = null;

          // Try by handle first (more reliable), then by ID
          if (initialProduct.handle) {
            fullProduct = await shopifyService.getProductByHandle(initialProduct.handle);
          }

          // If handle fetch failed or no handle, try by ID
          if (!fullProduct && initialProduct.id) {
            fullProduct = await shopifyService.getProductById(initialProduct.id);
          }

          if (fullProduct) {
            setProduct(fullProduct);
          }
        } catch (error) {
          // Silently fail - product data will use initial data
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    // Fetch immediately for faster product loading
    // The fetch runs in background so it won't block the initial render
    fetchFullProductData();
  }, [initialProduct]);

  // Return early if loading from deep link
  if (deepLinkLoading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
            <View style={{ width: 44 }} />
          </View>
          <View style={styles.loadingFullScreen}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingFullScreenText}>Đang tải sản phẩm...</Text>
            {affiliateCodeFromLink && (
              <Text style={styles.loadingAffiliateText}>
                Mã giới thiệu: {affiliateCodeFromLink}
              </Text>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Return early if no product to prevent crash during render
  // All hooks have been called above, so this is safe
  // Check for id OR handle OR title since products from different sources may have different identifiers
  if (!product || (!product.id && !product.handle && !product.title)) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
            <View style={{ width: 44 }} />
          </View>
          <View style={styles.errorContainer}>
            <Package size={48} color={COLORS.textMuted} />
            <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
            <Text style={styles.errorSubtext}>Sản phẩm có thể đã bị xóa hoặc không tồn tại</Text>
            <TouchableOpacity
              style={styles.goBackBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.goBackText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Handle local fallback products from gemKnowledge.json
  const isLocalFallback = product?.isLocalFallback === true;

  // CTA buttons position - SYNC with tab bar animation using transform (not bottom)
  // Native animated module doesn't support 'bottom', use translateY instead
  // When tab bar translateY is 0 (visible) -> CTA stays at base position
  // When tab bar translateY is 120 (hidden) -> CTA moves down by TAB_BAR_HEIGHT
  const ctaTranslateY = translateY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, TAB_BAR_HEIGHT],
    extrapolate: 'clamp',
  });

  // Price handling - support local fallback products with priceDisplay string
  const rawPrice = selectedVariant?.price || product.rawPrice || product.price || 0;
  const price = rawPrice;
  const comparePrice = selectedVariant?.compareAtPrice || product.compareAtPrice;
  const isOnSale = comparePrice && parseFloat(comparePrice) > parseFloat(price);

  // For local fallback products, use the priceDisplay string directly (e.g., "350K - 2.5M")
  const priceDisplayString = isLocalFallback && product.priceDisplay
    ? product.priceDisplay
    : null;

  // Collect all images - handle different image formats from Shopify
  const collectImages = () => {
    const imageSet = new Set(); // Use Set to avoid duplicates

    // Helper to extract image URL from various formats
    const extractImageUrl = (img) => {
      if (!img) return null;
      if (typeof img === 'string') return img;
      // Shopify GraphQL uses 'url', REST API uses 'src'
      return img.url || img.src || null;
    };

    // 1. Main product image
    if (product.image) {
      const mainImg = extractImageUrl(product.image);
      if (mainImg) imageSet.add(mainImg);
    }

    // 2. Images array (can be objects with src/url or strings)
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        const imgSrc = extractImageUrl(img);
        if (imgSrc) imageSet.add(imgSrc);
      });
    }

    // 3. Featured image
    if (product.featuredImage) {
      const featuredSrc = extractImageUrl(product.featuredImage);
      if (featuredSrc) imageSet.add(featuredSrc);
    }

    // 4. Variant images
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach(v => {
        if (v.image) {
          const variantImg = extractImageUrl(v.image);
          if (variantImg) imageSet.add(variantImg);
        }
      });
    }

    return Array.from(imageSet);
  };

  const allImages = collectImages();
  const images = allImages.length > 0 ? allImages : [null];

  // Show affiliate button for all logged-in users
  // The sheet will handle showing "Register Partnership" if not an affiliate
  useEffect(() => {
    setIsAffiliate(!!user);
  }, [user]);

  // Check purchase status and load combined reviews
  useEffect(() => {
    const checkPurchaseAndLoadReviews = async () => {
      if (!product?.handle) return;

      setCheckingPurchase(true);
      try {
        // Check if user can write review (has purchased)
        if (user?.id) {
          const hasPurchased = await reviewService.checkUserPurchasedProduct(user.id, product.handle);
          setCanWriteReview(hasPurchased);
        }

        // Load combined reviews (Shopify + In-app)
        const combined = await reviewService.getCombinedReviews(product);
        setAllReviews(combined);
      } catch (error) {
        console.error('[ProductDetail] Check purchase error:', error);
      } finally {
        setCheckingPurchase(false);
      }
    };

    checkPurchaseAndLoadReviews();
  }, [product?.handle, user?.id]);

  // Load additional sections - DEFERRED to not block initial render
  useEffect(() => {
    // Delay loading sections to allow screen to render first (faster perceived performance)
    const timer = setTimeout(() => {
      loadAdditionalSections().catch(() => {});
    }, 300); // 300ms delay for smooth transition

    return () => clearTimeout(timer);
  }, []);

  const loadAdditionalSections = async () => {
    try {
      setLoadingSections(true);

      // Load ALL products first
      const products = await shopifyService.getProducts({ limit: 100 });

      // Save products for infinite scroll
      if (products && products.length > 0) {
        setAllProducts(products);
      }

      // If no products from API, we can't show recommendations
      if (!products || products.length === 0) {
        setLoadingSections(false);
        return;
      }

      // Get TAG-BASED recommendations using shopifyService
      const [
        bestSellerItems,
        forYouItems,
        similarItems,
        hotItems,
        specialSetItems,
      ] = await Promise.all([
        shopifyService.getBestsellers(6, products),
        shopifyService.getForYouProducts(product, 6, products),
        shopifyService.getSimilarProducts(product, 6, products),
        shopifyService.getHotProducts(6, products),
        shopifyService.getSpecialSets(6, products),
      ]);

      // Filter out current product from all sections
      const currentProductHandle = product.handle;
      const currentProductId = product.id;

      const filterCurrent = (items) => {
        if (!items || items.length === 0) return [];
        // Filter by handle (always available) or id if both exist
        return items.filter(p => {
          // Use handle as primary filter since it's always present
          if (currentProductHandle && p.handle) {
            return p.handle !== currentProductHandle;
          }
          // Fallback to id if handle not available
          if (currentProductId && p.id) {
            return p.id !== currentProductId;
          }
          // If no matching criteria, keep the item
          return true;
        });
      };

      // Set state for all recommendation sections
      const filteredBestSellers = filterCurrent(bestSellerItems);
      const filteredRecommendations = filterCurrent(forYouItems);
      const filteredSimilar = filterCurrent(similarItems);
      const filteredComplementary = filterCurrent(specialSetItems);
      const filteredTrending = filterCurrent(hotItems);

      setBestSellers(filteredBestSellers);
      setRecommendations(filteredRecommendations);
      setSimilarProducts(filteredSimilar);
      setComplementary(filteredComplementary); // Special sets for "Hoàn thiện phong cách"
      setTrending(filteredTrending); // Hot products for "Đang thịnh hành"

      // More to explore - get recommended products based on shared tags
      const recommended = await shopifyService.getRecommendedProducts(product, 10, products);
      const filteredMoreToExplore = filterCurrent(recommended);
      setMoreToExplore(filteredMoreToExplore);

    } catch (error) {
      // Set empty arrays on error
      setBestSellers([]);
      setRecommendations([]);
      setSimilarProducts([]);
      setComplementary([]);
      setTrending([]);
      setMoreToExplore([]);
    } finally {
      setLoadingSections(false);
    }
  };

  // Load more products for infinite scroll
  const loadMoreExploreProducts = async () => {
    if (loadingMore || allProducts.length === 0) return;

    setLoadingMore(true);
    try {
      // Get more random products from the pool (excluding already shown)
      // Use handle instead of id since id is often undefined from Shopify API
      const existingHandles = moreToExplore.map(p => p.handle);
      const currentHandle = product.handle;
      const newItems = allProducts
        .filter(p => !existingHandles.includes(p.handle) && p.handle !== currentHandle)
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
      setMoreToExplore(prev => [...prev, ...newItems]);
    } catch (error) {
      // Silently fail for infinite scroll
    } finally {
      setLoadingMore(false);
    }
  };

  // Scroll handler for both tab bar hide and infinite loading
  const handleMainScroll = (event) => {
    // Call tab bar scroll handler
    handleScroll(event);

    // Check for infinite scroll trigger
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 400; // Start loading when 400px from bottom
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      loadMoreExploreProducts();
    }
  };

  const formatPrice = useCallback((value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  // OPTIMIZED: useCallback prevents re-creation on every render
  const handleAddToCart = useCallback(async () => {
    // Immediate UI feedback
    setAddedToCart(true);

    // Background operation
    const result = await addItem(product, selectedVariant, quantity);
    if (!result.success) {
      setAddedToCart(false);
    } else {
      setTimeout(() => setAddedToCart(false), 2000);
    }
  }, [product, selectedVariant, quantity, addItem]);

  const handleBuyNow = useCallback(async () => {
    // Navigate immediately for perceived speed
    navigation.navigate('Cart');

    // Add item in background (will appear when Cart screen loads)
    addItem(product, selectedVariant, quantity);
  }, [product, selectedVariant, quantity, addItem, navigation]);

  const handleThumbnailPress = useCallback((index) => {
    setSelectedImageIndex(index);
    imageScrollRef.current?.scrollToOffset({
      offset: index * SCREEN_WIDTH,
      animated: true,
    });
  }, []);

  const handleImageScroll = useCallback((event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (newIndex >= 0 && newIndex < images.length) {
      setSelectedImageIndex(newIndex);
    }
  }, [images.length]);

  // Load image dimensions for dynamic aspect ratio
  useEffect(() => {
    if (images && images.length > 0) {
      images.forEach((imageUrl, index) => {
        if (imageUrl && !imageDimensions[imageUrl]) {
          Image.getSize(
            imageUrl,
            (width, height) => {
              setImageDimensions(prev => ({
                ...prev,
                [imageUrl]: { width, height, aspectRatio: width / height }
              }));
            },
            (error) => {
              console.log('[ProductDetail] Error getting image size:', error);
            }
          );
        }
      });
    }
  }, [images]);

  // Handle tap on product image to view fullscreen
  const handleProductImagePress = useCallback((index) => {
    setProductImageIndex(index);
    setProductImageViewerVisible(true);
  }, []);

  // Handle scroll in product image viewer
  const handleProductImageViewerScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (newIndex !== productImageIndex && newIndex >= 0 && newIndex < images.length) {
      setProductImageIndex(newIndex);
    }
  };

  // Get aspect ratio for an image (default 1:1)
  const getImageAspectRatio = (imageUrl) => {
    const dims = imageDimensions[imageUrl];
    if (dims) {
      // Portrait images (9:16 or 3:4) use their ratio, others use 1:1
      if (dims.aspectRatio < 0.9) {
        return dims.aspectRatio; // Portrait
      }
    }
    return 1; // Default square 1:1
  };

  const renderImageItem = useCallback(({ item, index }) => {
    const aspectRatio = getImageAspectRatio(item);
    return item ? (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleProductImagePress(index)}
        style={[styles.productImage, { aspectRatio }]}
      >
        <OptimizedImage uri={item} style={StyleSheet.absoluteFill} resizeMode="cover" />
      </TouchableOpacity>
    ) : (
      <View style={[styles.productImage, styles.imagePlaceholder]}>
        <Package size={48} color={COLORS.textMuted} />
        <Text style={styles.placeholderText}>No Image</Text>
      </View>
    );
  }, [imageDimensions]);

  // FAQ Data — static, memoized to prevent recreation on every render
  const faqData = useMemo(() => [
    {
      id: 1,
      question: 'Làm sao để biết đá phù hợp với tôi?',
      answer: 'Mỗi viên đá mang năng lượng riêng. Hãy tin vào trực giác của bạn - viên đá nào thu hút bạn nhất chính là viên phù hợp. Bạn cũng có thể tham khảo theo cung hoàng đạo hoặc mục đích sử dụng.',
    },
    {
      id: 2,
      question: 'Cách bảo quản và tẩy đá như thế nào?',
      answer: 'Tẩy đá bằng khói trầm hương, ánh trăng, hoặc ngâm trong nước muối biển. Tránh để đá tiếp xúc với ánh nắng trực tiếp quá lâu. Bảo quản đá trong túi vải hoặc hộp riêng.',
    },
    {
      id: 3,
      question: 'Đá có chứng nhận không?',
      answer: 'Tất cả sản phẩm đều là đá tự nhiên 100%, được khai thác có trách nhiệm. Chúng tôi cung cấp giấy chứng nhận nguồn gốc cho các sản phẩm cao cấp.',
    },
    {
      id: 4,
      question: 'Chính sách đổi trả như thế nào?',
      answer: 'Đổi trả trong 7 ngày nếu sản phẩm bị lỗi hoặc không đúng mô tả. Sản phẩm phải còn nguyên tem, chưa qua sử dụng. Phí ship đổi trả do GEM chi trả.',
    },
  ], []);

  // Get REAL reviews from Judge.me data via reviewService - EXACT MATCH ONLY
  // Memoized to prevent re-computation on every render
  const reviewsData = useMemo(() => reviewService.getProductReviews(product), [product]);
  const reviewStats = useMemo(() => reviewService.getReviewStats(product), [product]);

  // Handle tap on review image - now supports swipe through all images
  const handleReviewImagePress = useCallback((imageUrl, allImages, index) => {
    setSelectedReviewImage(imageUrl);
    setReviewImages(allImages || [imageUrl]);
    setCurrentImageIndex(index || 0);
    setImageViewerVisible(true);
  }, []);

  // Handle swipe in image viewer
  const handleImageViewerScroll = useCallback((event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (newIndex >= 0) {
      setCurrentImageIndex(newIndex);
    }
  }, []);

  // Submit review handler
  const handleSubmitReview = async () => {
    if (!user?.id || !product?.handle) {
      alertService.show('Lỗi', 'Vui lòng đăng nhập để đánh giá sản phẩm', 'error');
      return;
    }

    if (reviewBody.trim().length < 10) {
      alertService.show('Nội dung quá ngắn', 'Vui lòng viết ít nhất 10 ký tự', 'warning');
      return;
    }

    setSubmittingReview(true);
    try {
      const result = await reviewService.submitReview({
        userId: user.id,
        productHandle: product.handle,
        rating: reviewRating,
        title: reviewTitle.trim() || null,
        body: reviewBody.trim(),
        images: [],
      });

      if (result.success) {
        alertService.show('Gửi đánh giá thành công', 'Cảm ơn bạn đã chia sẻ trải nghiệm!', 'success');
        setReviewModalVisible(false);
        setReviewRating(5);
        setReviewTitle('');
        setReviewBody('');
        setCanWriteReview(false); // Disable button after submission

        // Reload reviews
        const combined = await reviewService.getCombinedReviews(product);
        setAllReviews(combined);
      } else {
        alertService.show('Không thể gửi đánh giá', result.error || 'Vui lòng thử lại sau', 'error');
      }
    } catch (error) {
      console.error('[ProductDetail] Submit review error:', error);
      alertService.show('Lỗi', 'Đã xảy ra lỗi khi gửi đánh giá', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        size={14}
        color={i < rating ? COLORS.gold : 'rgba(255,255,255,0.2)'}
        fill={i < rating ? COLORS.gold : 'transparent'}
      />
    ));
  };

  // Helper to check if product is out of stock
  const isProductOutOfStock = (item) => {
    if (!item) return false;

    // Check for digital products (never out of stock unless explicitly marked)
    const productType = item.product_type?.toLowerCase() || '';
    const handle = item.handle?.toLowerCase() || '';
    const title = item.title?.toLowerCase() || '';

    const isDigitalProduct =
      productType.includes('digital') ||
      productType.includes('subscription') ||
      productType.includes('course') ||
      productType.includes('ebook') ||
      handle.includes('course') ||
      handle.includes('tier-') ||
      handle.includes('goi-') ||
      handle.includes('gem-pack') ||
      handle.includes('chatbot') ||
      handle.includes('scanner') ||
      title.includes('khóa học') ||
      title.includes('gói');

    const firstVariant = item.variants?.[0];
    const availableForSale = item.availableForSale ?? firstVariant?.availableForSale ?? true;
    const inventoryQuantity = firstVariant?.inventory_quantity ?? item.inventory_quantity ?? null;
    const inventoryPolicy = firstVariant?.inventory_policy || item.inventory_policy || 'deny';
    const inventoryOutOfStock = inventoryQuantity !== null && inventoryQuantity <= 0 && inventoryPolicy === 'deny';

    return isDigitalProduct
      ? (availableForSale === false)
      : (!availableForSale || inventoryOutOfStock);
  };

  const renderProductCard = (item, index, sectionName = 'default') => {
    // Use handle instead of id since id is often undefined from Shopify API
    if (!item || (!item.handle && !item.id)) {
      return null;
    }

    const isOutOfStock = isProductOutOfStock(item);

    return (
      <TouchableOpacity
        key={`${sectionName}-${index}-${item.handle || item.id}`}
        style={[styles.miniProductCard, isOutOfStock && styles.miniProductCardOutOfStock]}
        onPress={() => navigation.push('ProductDetail', { product: item })}
      >
        <View style={styles.miniProductImageContainer}>
          <OptimizedImage
            uri={item.image || item.images?.[0]?.url || item.images?.[0]?.src}
            style={[styles.miniProductImage, isOutOfStock && styles.miniProductImageOutOfStock]}
            resizeMode="cover"
          />
          {isOutOfStock && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Hết hàng</Text>
            </View>
          )}
        </View>
        <View style={styles.miniProductInfo}>
          <Text style={[styles.miniProductTitle, isOutOfStock && styles.textOutOfStock]} numberOfLines={2}>
            {item.title || 'Sản phẩm'}
          </Text>
          <Text style={[styles.miniProductPrice, isOutOfStock && styles.textOutOfStock]}>
            {formatPrice(item.variants?.[0]?.price || item.price || 0)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
          <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
            <ShoppingCart size={22} color={COLORS.textPrimary} />
            {itemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleMainScroll}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          overScrollMode="never"
          decelerationRate="fast"
        >
          {/* Image Gallery */}
          <View style={styles.imageGalleryContainer}>
            <FlatList
              ref={imageScrollRef}
              data={images}
              renderItem={renderImageItem}
              keyExtractor={(item, index) => `image-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleImageScroll}
              style={styles.imageGallery}
              removeClippedSubviews={true}
              initialNumToRender={1}
              maxToRenderPerBatch={2}
              windowSize={3}
              getItemLayout={(data, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
            />
            {images.length > 1 && (
              <View style={styles.dotsContainer}>
                {images.map((_, index) => (
                  <View key={index} style={[styles.dot, selectedImageIndex === index && styles.dotActive]} />
                ))}
              </View>
            )}
          </View>

          {/* Thumbnails with Refresh Button */}
          <View style={styles.thumbnailRow}>
            {images.length > 1 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailScroll} contentContainerStyle={styles.thumbnailContainer}>
                {images.map((img, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.thumbnail, selectedImageIndex === index && styles.thumbnailActive]}
                    onPress={() => handleThumbnailPress(index)}
                  >
                    {img ? (
                      <OptimizedImage uri={img} style={styles.thumbnailImage} resizeMode="cover" />
                    ) : (
                      <View style={[styles.thumbnailImage, styles.thumbnailPlaceholder]}>
                        <Package size={20} color={COLORS.textMuted} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : <View style={{ flex: 1 }} />}

            {/* Manual Refresh Button - always visible */}
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={async () => {
                if (isRefreshing || !product?.handle) return;
                setIsRefreshing(true);
                try {
                  const fullProduct = await shopifyService.getProductByHandle(product.handle);
                  if (fullProduct) {
                    setProduct(fullProduct);
                  }
                } catch (error) {
                  // Silently fail
                } finally {
                  setIsRefreshing(false);
                }
              }}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color={COLORS.gold} />
              ) : (
                <RotateCcw size={18} color={COLORS.gold} />
              )}
            </TouchableOpacity>
          </View>

          {/* Product Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.productTitle}>{product.title}</Text>

            {/* Price - with loading indicator when refreshing */}
            <View style={styles.priceRow}>
              {isRefreshing ? (
                <View style={styles.priceLoadingRow}>
                  <ActivityIndicator size="small" color={COLORS.cyan} />
                  <Text style={styles.priceLoadingText}>Đang cập nhật giá...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.price}>
                    {priceDisplayString ? priceDisplayString : formatPrice(price)}
                  </Text>
                  {isOnSale && !priceDisplayString && (
                    <>
                      <Text style={styles.comparePrice}>{formatPrice(comparePrice)}</Text>
                      <View style={styles.saleBadge}>
                        <Text style={styles.saleBadgeText}>-{Math.round((1 - price / comparePrice) * 100)}%</Text>
                      </View>
                    </>
                  )}
                </>
              )}
            </View>

            {/* Local fallback notice */}
            {isLocalFallback && (
              <View style={styles.localFallbackNotice}>
                <Text style={styles.localFallbackText}>
                  Sản phẩm hiện đang tải từ hệ thống. Vui lòng truy cập tab Shop để xem chi tiết đầy đủ.
                </Text>
              </View>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 1 && (
              <View style={styles.variantsSection}>
                <Text style={styles.sectionTitle}>Tùy chọn</Text>
                <View style={styles.variantsList}>
                  {product.variants.map((variant) => (
                    <TouchableOpacity
                      key={variant.id}
                      style={[styles.variantBtn, selectedVariant?.id === variant.id && styles.variantBtnActive]}
                      onPress={() => setSelectedVariant(variant)}
                    >
                      <Text style={[styles.variantText, selectedVariant?.id === variant.id && styles.variantTextActive]}>
                        {variant.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Quantity */}
            <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>Số lượng</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity style={styles.quantityBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus size={18} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity style={styles.quantityBtn} onPress={() => setQuantity(quantity + 1)}>
                  <Plus size={18} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Description - supports HTML with tables */}
            {(product.description_html || product.body_html || product.descriptionHtml || product.description) && (
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
                <HTMLRenderer
                  html={product.description_html || product.body_html || product.descriptionHtml || product.description}
                />
              </View>
            )}

            {/* Shipping Info - PURPLE icons per design tokens v3.0 */}
            <View style={styles.shippingSection}>
              <Text style={styles.sectionTitle}>Thông tin vận chuyển</Text>

              <View style={styles.shippingItem}>
                <Truck size={20} color="#6A5BFF" />
                <View style={styles.shippingInfo}>
                  <Text style={styles.shippingTitle}>Miễn phí vận chuyển</Text>
                  <Text style={styles.shippingValue}>Cho đơn hàng trên 975.000 VND (Việt Nam và USA)</Text>
                </View>
              </View>

              <View style={styles.shippingItem}>
                <Package size={20} color="#6A5BFF" />
                <View style={styles.shippingInfo}>
                  <Text style={styles.shippingTitle}>Thời gian giao hàng</Text>
                  <Text style={styles.shippingValue}>3-5 ngày làm việc</Text>
                </View>
              </View>

              <View style={styles.shippingItem}>
                <RotateCcw size={20} color="#6A5BFF" />
                <View style={styles.shippingInfo}>
                  <Text style={styles.shippingTitle}>Đổi trả dễ dàng</Text>
                  <Text style={styles.shippingValue}>Trong vòng 7 ngày nếu lỗi sản phẩm</Text>
                </View>
              </View>

              <View style={styles.shippingItem}>
                <Shield size={20} color="#6A5BFF" />
                <View style={styles.shippingInfo}>
                  <Text style={styles.shippingTitle}>Bảo hành chính hãng</Text>
                  <Text style={styles.shippingValue}>Đảm bảo chất lượng 100%</Text>
                </View>
              </View>
            </View>

            {/* Crystal Note */}
            <View style={styles.crystalNoteSection}>
              <View style={styles.crystalNoteHeader}>
                <AlertTriangle size={20} color={COLORS.gold} />
                <Text style={styles.crystalNoteTitle}>LƯU Ý VỀ TINH THỂ TỰ NHIÊN</Text>
              </View>
              <Text style={styles.crystalNoteText}>
                Vì là tinh thể crystal tự nhiên nên mỗi viên đá sẽ có một vẻ đẹp và sự độc đáo khác nhau. Tất cả các viên đá đều sẽ thay đổi size, màu sắc, hình dạng và hoa văn đôi chút so với hình chụp nhưng vẫn đảm bảo được chất lượng và năng lượng của mỗi viên đá.
              </Text>
              <Text style={styles.crystalNoteText}>
                Các tinh thể được khai thác dưới lòng đất và cắt mài bằng tay nên sẽ có vết trầy xước của tự nhiên, không bao giờ "hoàn hảo" tuyệt đối.
              </Text>
            </View>

            {/* Customer Reviews Section */}
            <View style={styles.reviewsSection}>
              <View style={styles.reviewsHeader}>
                <MessageCircle size={20} color={COLORS.gold} />
                <Text style={styles.sectionTitle}>Phản hồi từ khách hàng</Text>
              </View>

              {/* Write Review Button - Only for verified purchasers */}
              {canWriteReview && (
                <TouchableOpacity
                  style={styles.writeReviewBtn}
                  onPress={() => setReviewModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <PenLine size={18} color={COLORS.gold} />
                  <Text style={styles.writeReviewBtnText}>Viết đánh giá</Text>
                  <Text style={styles.verifiedPurchaseBadge}>✓ Đã mua hàng</Text>
                </TouchableOpacity>
              )}

              {allReviews.length > 0 ? (
                <>
                  <View style={styles.reviewsSummary}>
                    <Text style={styles.reviewsRating}>{reviewStats.averageRating || 5}</Text>
                    <View style={styles.reviewsStars}>{renderStars(Math.round(reviewStats.averageRating || 5))}</View>
                    <Text style={styles.reviewsCount}>({allReviews.length} đánh giá)</Text>
                  </View>

                  {allReviews.map((review, reviewIndex) => (
                    <View key={review.id || `review-${reviewIndex}`} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewUser}>
                          <View style={[styles.reviewAvatar, review.source === 'gemral' && styles.reviewAvatarGemral]}>
                            <Text style={styles.reviewAvatarText}>{(review.author || 'K').charAt(0)}</Text>
                          </View>
                          <View>
                            <Text style={styles.reviewName}>
                              {review.author || 'Khách hàng'}
                              {review.verified && <Text style={styles.verifiedBadge}> ✓ Đã mua hàng</Text>}
                            </Text>
                            <Text style={styles.reviewDate}>{review.date || ''}</Text>
                          </View>
                        </View>
                        <View style={styles.reviewStars}>{renderStars(review.rating || 5)}</View>
                      </View>
                      {review.title && <Text style={styles.reviewTitle}>{review.title}</Text>}
                      <Text style={styles.reviewComment}>{review.body || review.comment || ''}</Text>
                      {review.images && review.images.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImagesScroll}>
                          {review.images.map((img, idx) => (
                            <TouchableOpacity
                              key={`${review.id}-img-${idx}`}
                              onPress={() => handleReviewImagePress(img, review.images, idx)}
                              activeOpacity={0.8}
                            >
                              <Image source={{ uri: img }} style={styles.reviewImage} resizeMode="cover" />
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  ))}

                  <TouchableOpacity style={styles.viewAllBtn}>
                    <Text style={styles.viewAllText}>Xem tất cả đánh giá</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.noReviewsContainer}>
                  <Text style={styles.noReviewsText}>
                    Sản phẩm này chưa có đánh giá.
                  </Text>
                  <Text style={styles.noReviewsSubtext}>
                    {canWriteReview ? 'Hãy là người đầu tiên đánh giá!' : 'Mua sản phẩm để có thể đánh giá.'}
                  </Text>
                </View>
              )}
            </View>

            {/* Best Sellers Section - Always show with loading state */}
            <View style={styles.productsSection}>
              <View style={styles.productsSectionHeader}>
                <Sparkles size={20} color={COLORS.gold} />
                <Text style={styles.sectionTitle}>Best Sellers ({bestSellers?.length || 0})</Text>
              </View>

              {loadingSections ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.gold} />
                  <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
                </View>
              ) : bestSellers && bestSellers.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScroll}>
                  {bestSellers.map((item, index) => renderProductCard(item, index, 'bestsellers'))}
                </ScrollView>
              ) : (
                <Text style={styles.emptyText}>Không có sản phẩm (state: {JSON.stringify({ loading: loadingSections, count: bestSellers?.length })})</Text>
              )}
            </View>

            {/* FAQ Section */}
            <View style={styles.faqSection}>
              <View style={styles.faqHeader}>
                <HelpCircle size={20} color={COLORS.gold} />
                <Text style={styles.sectionTitle}>Các câu hỏi thường gặp</Text>
              </View>

              {faqData.map((faq) => (
                <TouchableOpacity
                  key={faq.id}
                  style={styles.faqItem}
                  onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqQuestion}>
                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                    {expandedFAQ === faq.id ? (
                      <ChevronUp size={20} color={COLORS.gold} />
                    ) : (
                      <ChevronDown size={20} color={COLORS.textMuted} />
                    )}
                  </View>
                  {expandedFAQ === faq.id && (
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Best For You Section - Always show */}
            <View style={styles.productsSection}>
              <View style={styles.productsSectionHeader}>
                <Heart size={20} color={COLORS.gold} />
                <Text style={styles.sectionTitle}>Dành cho bạn ({recommendations?.length || 0})</Text>
              </View>

              {loadingSections ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.gold} />
                  <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
                </View>
              ) : recommendations && recommendations.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScroll}>
                  {recommendations.map((item, index) => renderProductCard(item, index, 'recommendations'))}
                </ScrollView>
              ) : (
                <Text style={styles.emptyText}>Không có sản phẩm (state: {JSON.stringify({ loading: loadingSections, count: recommendations?.length })})</Text>
              )}
            </View>

            {/* Similar Products Section - Always show */}
            <View style={styles.productsSection}>
              <View style={styles.productsSectionHeader}>
                <Eye size={20} color={COLORS.gold} />
                <Text style={styles.sectionTitle}>Sản phẩm tương tự ({similarProducts?.length || 0})</Text>
              </View>
              {loadingSections ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.gold} />
                  <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
                </View>
              ) : similarProducts && similarProducts.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScroll}>
                  {similarProducts.map((item, index) => renderProductCard(item, index, 'similar'))}
                </ScrollView>
              ) : (
                <Text style={styles.emptyText}>Không có sản phẩm</Text>
              )}
            </View>

            {/* Complete The Look Section - Always show */}
            <View style={styles.productsSection}>
              <View style={styles.productsSectionHeader}>
                <Layers size={20} color={COLORS.gold} />
                <Text style={styles.sectionTitle}>Hoàn thiện phong cách ({complementary?.length || 0})</Text>
              </View>
              {loadingSections ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.gold} />
                  <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
                </View>
              ) : complementary && complementary.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScroll}>
                  {complementary.map((item, index) => renderProductCard(item, index, 'complementary'))}
                </ScrollView>
              ) : (
                <Text style={styles.emptyText}>Không có sản phẩm</Text>
              )}
            </View>

            {/* Trending Section - Always show */}
            <View style={styles.productsSection}>
              <View style={styles.productsSectionHeader}>
                <TrendingUp size={20} color={COLORS.gold} />
                <Text style={styles.sectionTitle}>Đang thịnh hành ({trending?.length || 0})</Text>
              </View>
              {loadingSections ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.gold} />
                  <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
                </View>
              ) : trending && trending.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScroll}>
                  {trending.map((item, index) => renderProductCard(item, index, 'trending'))}
                </ScrollView>
              ) : (
                <Text style={styles.emptyText}>Không có sản phẩm</Text>
              )}
            </View>

            {/* More To Explore - Infinite Grid - Always show */}
            <View style={styles.productsSection}>
              <View style={styles.productsSectionHeader}>
                <Grid3X3 size={20} color={COLORS.gold} />
                <Text style={styles.sectionTitle}>Khám phá thêm</Text>
              </View>

              {loadingSections ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.gold} />
                  <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
                </View>
              ) : moreToExplore.length > 0 ? (
                <View style={styles.exploreGrid}>
                  {moreToExplore.map((item, idx) => {
                    const isOutOfStock = isProductOutOfStock(item);
                    return (
                      <TouchableOpacity
                        key={`explore-${idx}-${item.handle || item.id}`}
                        style={[styles.exploreGridCard, isOutOfStock && styles.exploreGridCardOutOfStock]}
                        onPress={() => navigation.push('ProductDetail', { product: item })}
                      >
                        <View style={styles.exploreGridImageContainer}>
                          <OptimizedImage
                            uri={item.image || item.images?.[0]?.url || item.images?.[0]?.src}
                            style={[styles.exploreGridImage, isOutOfStock && styles.exploreGridImageOutOfStock]}
                            resizeMode="cover"
                          />
                          {isOutOfStock && (
                            <View style={styles.exploreOutOfStockBadge}>
                              <Text style={styles.exploreOutOfStockText}>Hết hàng</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.exploreGridInfo}>
                          <Text style={[styles.exploreGridTitle, isOutOfStock && styles.textOutOfStock]} numberOfLines={2}>
                            {item.title || 'Sản phẩm'}
                          </Text>
                          <Text style={[styles.exploreGridPrice, isOutOfStock && styles.textOutOfStock]}>
                            {formatPrice(item.variants?.[0]?.price || item.price || 0)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.emptyText}>Không có sản phẩm</Text>
              )}

              {loadingMore && (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color={COLORS.purple} />
                  <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
                </View>
              )}
            </View>

            {/* Bottom Spacer */}
            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>

      </SafeAreaView>

      {/* Sticky Bottom Actions - ANIMATED to sync with tab bar */}
      <Animated.View style={[styles.bottomActions, { transform: [{ translateY: ctaTranslateY }] }]}>
        {/* Affiliate Link Button - Only show for affiliates */}
        {isAffiliate && (
          <TouchableOpacity
            style={styles.affiliateLinkBtn}
            onPress={() => setAffiliateLinkSheetVisible(true)}
            activeOpacity={0.8}
          >
            <Link2 size={18} color={COLORS.gold} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.addToCartBtn, addedToCart && styles.addedBtn]}
          onPress={handleAddToCart}
          activeOpacity={0.7}
          delayPressIn={0}
        >
          {addedToCart ? (
            <>
              <Check size={20} color={COLORS.success} />
              <Text style={styles.addedText}>Đã thêm</Text>
            </>
          ) : (
            <>
              <ShoppingCart size={20} color={COLORS.gold} />
              <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyNowBtn}
          onPress={handleBuyNow}
          activeOpacity={0.7}
          delayPressIn={0}
        >
          <Text style={styles.buyNowText}>Mua ngay</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Product Affiliate Link Sheet */}
      <ProductAffiliateLinkSheet
        visible={affiliateLinkSheetVisible}
        onClose={() => setAffiliateLinkSheetVisible(false)}
        product={product}
        productType={detectProductType(product)}
      />

      {/* Review Image Viewer Modal - Swipe to view multiple images */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.imageViewerOverlay}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.imageViewerCloseBtn}
            onPress={() => setImageViewerVisible(false)}
          >
            <X size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Image Counter */}
          {reviewImages.length > 1 && (
            <View style={styles.imageViewerCounter}>
              <Text style={styles.imageViewerCounterText}>
                {currentImageIndex + 1} / {reviewImages.length}
              </Text>
            </View>
          )}

          {/* Swipeable Image Gallery */}
          {reviewImages.length > 0 ? (
            <FlatList
              ref={imageViewerRef}
              data={reviewImages}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleImageViewerScroll}
              initialScrollIndex={currentImageIndex}
              getItemLayout={(data, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              keyExtractor={(item, index) => `viewer-img-${index}`}
              renderItem={({ item }) => (
                <View style={styles.imageViewerSlide}>
                  <Image
                    source={{ uri: item }}
                    style={styles.imageViewerImage}
                    resizeMode="contain"
                  />
                </View>
              )}
              style={styles.imageViewerList}
            />
          ) : selectedReviewImage && (
            <Image
              source={{ uri: selectedReviewImage }}
              style={styles.imageViewerImage}
              resizeMode="contain"
            />
          )}

          {/* Swipe Indicator Dots */}
          {reviewImages.length > 1 && (
            <View style={styles.imageViewerDots}>
              {reviewImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.imageViewerDot,
                    currentImageIndex === index && styles.imageViewerDotActive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Backdrop for tap to close */}
          <TouchableOpacity
            style={styles.imageViewerBackdrop}
            activeOpacity={1}
            onPress={() => setImageViewerVisible(false)}
          />
        </View>
      </Modal>

      {/* Product Image Fullscreen Viewer with Pinch-to-Zoom */}
      <Modal
        visible={productImageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setProductImageViewerVisible(false)}
      >
        <View style={styles.productImageViewerOverlay}>
          {/* Tap anywhere to close */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setProductImageViewerVisible(false)}
          />

          {/* Close Button */}
          <TouchableOpacity
            style={styles.productImageViewerCloseBtn}
            onPress={() => setProductImageViewerVisible(false)}
          >
            <X size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Image Counter */}
          {images.length > 1 && (
            <View style={styles.productImageViewerCounter}>
              <Text style={styles.imageViewerCounterText}>
                {productImageIndex + 1} / {images.length}
              </Text>
            </View>
          )}

          {/* Swipeable Product Image Gallery with Zoom */}
          <FlatList
            ref={productImageViewerRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleProductImageViewerScroll}
            initialScrollIndex={productImageIndex}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            keyExtractor={(item, index) => `product-viewer-img-${index}`}
            renderItem={({ item }) => {
              // Calculate dimensions based on image aspect ratio
              const dims = imageDimensions[item];
              let imgWidth = SCREEN_WIDTH;
              let imgHeight = SCREEN_WIDTH;

              if (dims) {
                if (dims.aspectRatio < 1) {
                  // Portrait image - use full height
                  imgHeight = SCREEN_WIDTH * 1.5; // Max height
                  imgWidth = imgHeight * dims.aspectRatio;
                  if (imgWidth > SCREEN_WIDTH) {
                    imgWidth = SCREEN_WIDTH;
                    imgHeight = imgWidth / dims.aspectRatio;
                  }
                } else {
                  // Landscape or square - use full width
                  imgWidth = SCREEN_WIDTH;
                  imgHeight = imgWidth / dims.aspectRatio;
                }
              }

              return (
                <View style={styles.productImageViewerSlide}>
                  <ScrollView
                    contentContainerStyle={styles.zoomContainer}
                    maximumZoomScale={5}
                    minimumZoomScale={1}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    centerContent={true}
                    bouncesZoom={true}
                    pinchGestureEnabled={true}
                    decelerationRate="fast"
                  >
                    <Image
                      source={{ uri: item }}
                      style={{
                        width: imgWidth,
                        height: imgHeight,
                      }}
                      resizeMode="contain"
                    />
                  </ScrollView>
                </View>
              );
            }}
            style={styles.imageViewerList}
          />

          {/* Swipe Indicator Dots */}
          {images.length > 1 && (
            <View style={styles.productImageViewerDots}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.imageViewerDot,
                    productImageIndex === index && styles.imageViewerDotActive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Instruction text */}
          <Text style={styles.zoomHintText}>Chạm 2 ngón để zoom • Chạm để đóng</Text>
        </View>
      </Modal>

      {/* Write Review Modal */}
      <Modal
        visible={reviewModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.reviewModalOverlay}>
          <View style={styles.reviewModalContainer}>
            {/* Header */}
            <View style={styles.reviewModalHeader}>
              <Text style={styles.reviewModalTitle}>Viết đánh giá</Text>
              <TouchableOpacity
                style={styles.reviewModalCloseBtn}
                onPress={() => setReviewModalVisible(false)}
              >
                <X size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Product Info */}
            <View style={styles.reviewProductInfo}>
              <OptimizedImage
                uri={images[0]}
                style={styles.reviewProductImage}
                resizeMode="cover"
              />
              <Text style={styles.reviewProductTitle} numberOfLines={2}>
                {product?.title}
              </Text>
            </View>

            <ScrollView style={styles.reviewFormScroll} showsVerticalScrollIndicator={false}>
              {/* Rating Selector */}
              <View style={styles.reviewRatingSection}>
                <Text style={styles.reviewLabel}>Đánh giá của bạn</Text>
                <View style={styles.reviewRatingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setReviewRating(star)}
                      activeOpacity={0.7}
                    >
                      <Star
                        size={36}
                        color={star <= reviewRating ? COLORS.gold : 'rgba(255,255,255,0.2)'}
                        fill={star <= reviewRating ? COLORS.gold : 'transparent'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.reviewRatingText}>
                  {reviewRating === 5 ? 'Xuất sắc' :
                   reviewRating === 4 ? 'Rất tốt' :
                   reviewRating === 3 ? 'Tốt' :
                   reviewRating === 2 ? 'Bình thường' : 'Không hài lòng'}
                </Text>
              </View>

              {/* Title Input */}
              <View style={styles.reviewInputSection}>
                <Text style={styles.reviewLabel}>Tiêu đề (tùy chọn)</Text>
                <TextInput
                  style={styles.reviewInput}
                  value={reviewTitle}
                  onChangeText={setReviewTitle}
                  placeholder="Tóm tắt trải nghiệm của bạn"
                  placeholderTextColor={COLORS.textMuted}
                  maxLength={100}
                />
              </View>

              {/* Body Input */}
              <View style={styles.reviewInputSection}>
                <Text style={styles.reviewLabel}>Nội dung đánh giá *</Text>
                <TextInput
                  style={[styles.reviewInput, styles.reviewInputMultiline]}
                  value={reviewBody}
                  onChangeText={setReviewBody}
                  placeholder="Chia sẻ chi tiết về sản phẩm: chất lượng, năng lượng, trải nghiệm..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  maxLength={1000}
                />
                <Text style={styles.reviewCharCount}>{reviewBody.length}/1000</Text>
              </View>

              {/* Verified Purchase Badge */}
              <View style={styles.reviewVerifiedNotice}>
                <Check size={16} color={COLORS.success} />
                <Text style={styles.reviewVerifiedText}>
                  Đánh giá của bạn sẽ được đánh dấu "Đã mua hàng"
                </Text>
              </View>
            </ScrollView>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.reviewSubmitBtn,
                (submittingReview || reviewBody.trim().length < 10) && styles.reviewSubmitBtnDisabled,
              ]}
              onPress={handleSubmitReview}
              disabled={submittingReview || reviewBody.trim().length < 10}
              activeOpacity={0.8}
            >
              {submittingReview ? (
                <ActivityIndicator size="small" color={COLORS.textPrimary} />
              ) : (
                <>
                  <Send size={18} color={COLORS.textPrimary} />
                  <Text style={styles.reviewSubmitText}>Gửi đánh giá</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

// STYLES - Using DESIGN_TOKENS v3.0 exact values
// Glass: rgba(15, 16, 48, 0.55), Purple borders: rgba(106, 91, 255, 0.3)
const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  // Header - EXACT glass
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.glassBg,                    // rgba(15, 16, 48, 0.55)
    borderBottomWidth: 1.2,
    borderBottomColor: COLORS.inputBorder,              // Purple border
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.textPrimary },
  cartBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  cartBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: COLORS.burgundy, borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { fontSize: 10, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary },

  scrollContent: { paddingBottom: CONTENT_BOTTOM_PADDING + 140 }, // Increased for CTA buttons + tab bar

  // Image Gallery
  imageGalleryContainer: { position: 'relative' },
  imageGallery: { minHeight: SCREEN_WIDTH },
  productImage: { width: SCREEN_WIDTH, minHeight: SCREEN_WIDTH },
  imagePlaceholder: { backgroundColor: COLORS.glassBgHeavy, justifyContent: 'center', alignItems: 'center', height: SCREEN_WIDTH },
  placeholderText: { color: COLORS.textMuted, marginTop: SPACING.sm },

  dotsContainer: { position: 'absolute', bottom: SPACING.md, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.5)' },
  dotActive: { backgroundColor: COLORS.purple, width: 24 },  // Purple active dot

  thumbnailRow: { flexDirection: 'row', alignItems: 'center', paddingRight: SPACING.md },
  thumbnailScroll: { marginTop: SPACING.sm, flex: 1 },
  thumbnailContainer: { paddingHorizontal: SPACING.md, gap: SPACING.sm, flexDirection: 'row' },
  refreshBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 189, 89, 0.15)', justifyContent: 'center', alignItems: 'center', marginTop: SPACING.sm, marginLeft: SPACING.sm, borderWidth: 1, borderColor: 'rgba(255, 189, 89, 0.3)' },
  thumbnail: { width: 64, height: 64, borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  thumbnailActive: { borderColor: COLORS.purple },           // Purple active border
  thumbnailImage: { width: '100%', height: '100%' },
  thumbnailPlaceholder: { backgroundColor: COLORS.glassBgHeavy, justifyContent: 'center', alignItems: 'center' },

  // Info Section
  infoSection: { padding: SPACING.lg },
  productTitle: { fontSize: TYPOGRAPHY.fontSize.xxl, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  priceLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  priceLoadingText: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textMuted },
  price: { fontSize: TYPOGRAPHY.fontSize.xxl, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.cyan },  // Cyan for price
  comparePrice: { fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  saleBadge: { backgroundColor: COLORS.error, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 4 },
  saleBadgeText: { fontSize: 11, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary },

  sectionTitle: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.gold, marginBottom: SPACING.sm },

  // Variants - Purple UI
  variantsSection: { marginBottom: SPACING.lg },
  variantsList: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  variantBtn: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, backgroundColor: COLORS.glassBg, borderRadius: 8, borderWidth: 1, borderColor: COLORS.inputBorder },
  variantBtnActive: { backgroundColor: 'rgba(106, 91, 255, 0.2)', borderColor: COLORS.purple },  // Purple active
  variantText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  variantTextActive: { color: COLORS.purple, fontWeight: TYPOGRAPHY.fontWeight.semibold },

  // Quantity - Purple borders
  quantitySection: { marginBottom: SPACING.lg },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  quantityBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.glassBg, borderRadius: 8, borderWidth: 1, borderColor: COLORS.inputBorder },
  quantityText: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.textPrimary, minWidth: 40, textAlign: 'center' },

  // Description - Glass + Purple border
  descriptionSection: { marginBottom: SPACING.lg, backgroundColor: COLORS.glassBg, borderRadius: 18, padding: SPACING.xl, borderWidth: 1.2, borderColor: COLORS.inputBorder },
  descriptionText: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textPrimary, lineHeight: 22 },

  // Shipping - Glass + Purple border
  shippingSection: { marginBottom: SPACING.lg, backgroundColor: COLORS.glassBg, borderRadius: 18, padding: SPACING.xl, borderWidth: 1.2, borderColor: COLORS.inputBorder },
  shippingItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, marginBottom: SPACING.md },
  shippingInfo: { flex: 1 },
  shippingTitle: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.gold, marginBottom: 2 },
  shippingValue: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },

  // Crystal Note - Gold accent (keep as is)
  crystalNoteSection: { marginBottom: SPACING.lg, backgroundColor: 'rgba(255, 189, 89, 0.1)', borderRadius: 18, padding: SPACING.xl, borderWidth: 1.2, borderColor: 'rgba(255, 189, 89, 0.3)' },
  crystalNoteHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  crystalNoteTitle: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.gold, letterSpacing: 0.5 },
  crystalNoteText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.sm },

  // Reviews - Glass + Purple border
  reviewsSection: { marginBottom: SPACING.lg, backgroundColor: COLORS.glassBg, borderRadius: 18, padding: SPACING.xl, borderWidth: 1.2, borderColor: COLORS.inputBorder },
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  reviewsSummary: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  reviewsRating: { fontSize: TYPOGRAPHY.fontSize.display, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.cyan },  // Cyan for rating number
  reviewsStars: { flexDirection: 'row', gap: 2 },
  reviewsCount: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textMuted },

  reviewCard: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 8, padding: SPACING.md, marginBottom: SPACING.sm },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  reviewUser: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(106, 91, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },  // Purple bg
  reviewAvatarGemral: { backgroundColor: 'rgba(255, 189, 89, 0.2)', borderWidth: 1.5, borderColor: 'rgba(255, 189, 89, 0.5)' },  // Gold bg for Gemral reviews
  reviewAvatarText: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.purple },
  reviewName: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.textPrimary },
  verifiedBadge: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.success },
  reviewDate: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewTitle: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.textPrimary, marginBottom: 4 },
  reviewComment: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, lineHeight: 20 },
  reviewImagesScroll: { marginTop: SPACING.sm },
  reviewImage: { width: 80, height: 80, borderRadius: 8, marginRight: SPACING.sm },

  viewAllBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  viewAllText: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.purple },  // Purple link

  // Products Sections
  productsSection: { marginBottom: SPACING.lg },
  productsSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  productsScroll: { gap: SPACING.sm },

  miniProductCard: { width: 140, backgroundColor: COLORS.glassBg, borderRadius: 18, overflow: 'hidden', borderWidth: 1.2, borderColor: COLORS.inputBorder },
  miniProductCardOutOfStock: { opacity: 0.7 },
  miniProductImageContainer: { position: 'relative' },
  miniProductImage: { width: '100%', height: 140 },
  miniProductImageOutOfStock: { opacity: 0.6 },
  miniProductInfo: { padding: SPACING.sm },
  miniProductTitle: { fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.medium, color: COLORS.textPrimary, marginBottom: 4, lineHeight: 16 },
  miniProductPrice: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.cyan },  // Cyan for price

  // Out of stock badge for mini cards
  outOfStockBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(156, 6, 18, 0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  outOfStockText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase' },
  textOutOfStock: { color: COLORS.textMuted },

  // FAQ - Glass + Purple border
  faqSection: { marginBottom: SPACING.lg, backgroundColor: COLORS.glassBg, borderRadius: 18, padding: SPACING.xl, borderWidth: 1.2, borderColor: COLORS.inputBorder },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  faqItem: { borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)', paddingVertical: SPACING.md },
  faqQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestionText: { flex: 1, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.medium, color: COLORS.textPrimary, marginRight: SPACING.sm },
  faqAnswer: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, lineHeight: 20, marginTop: SPACING.sm },

  bottomSpacer: { height: TAB_BAR_HEIGHT },

  // Empty text placeholder
  emptyText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textMuted, fontStyle: 'italic', paddingVertical: SPACING.md },

  // Loading container for sections
  loadingContainer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg },
  loadingText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textMuted },

  // Explore Grid - 2 column layout
  exploreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'space-between' },
  exploreGridCard: { width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm) / 2, backgroundColor: COLORS.glassBg, borderRadius: 18, overflow: 'hidden', borderWidth: 1.2, borderColor: COLORS.inputBorder, marginBottom: SPACING.sm },
  exploreGridCardOutOfStock: { opacity: 0.7 },
  exploreGridImageContainer: { position: 'relative' },
  exploreGridImage: { width: '100%', aspectRatio: 1 }, // 1:1 ratio for proper fit
  exploreGridImageOutOfStock: { opacity: 0.6 },
  exploreGridInfo: { padding: SPACING.sm },
  exploreGridTitle: { fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.medium, color: COLORS.textPrimary, marginBottom: 4, lineHeight: 16 },
  exploreGridPrice: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.cyan },
  exploreOutOfStockBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(156, 6, 18, 0.9)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  exploreOutOfStockText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase' },

  // Loading more indicator
  loadingMore: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg },
  loadingMoreText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.purple },

  // Bottom Actions - Dark glass (uses transform for animation, fixed bottom position)
  bottomActions: { position: 'absolute', left: 0, right: 0, bottom: TAB_BAR_HEIGHT, flexDirection: 'row', padding: SPACING.md, gap: SPACING.md, backgroundColor: 'rgba(5, 4, 11, 0.98)', borderTopWidth: 1.2, borderTopColor: COLORS.gold, shadowColor: '#000000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
  affiliateLinkBtn: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 189, 89, 0.15)', borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.gold },
  addToCartBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.md, backgroundColor: 'transparent', borderRadius: 12, borderWidth: 2, borderColor: COLORS.gold },
  addedBtn: { borderColor: COLORS.success },
  addToCartText: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.gold },
  addedText: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.success },
  buyNowBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.md, backgroundColor: COLORS.burgundy, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gold },
  buyNowText: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary },

  // Local fallback notice
  localFallbackNotice: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  localFallbackText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.purple,
    textAlign: 'center',
    lineHeight: 20,
  },

  // No Reviews Container
  noReviewsContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 18,
  },
  noReviewsText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  noReviewsSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    opacity: 0.7,
  },

  // Error Container - Product not found
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  goBackBtn: {
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    backgroundColor: COLORS.purple,
    borderRadius: 12,
  },
  goBackText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  // Loading Full Screen - Deep Link loading
  loadingFullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingFullScreenText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  loadingAffiliateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },

  // Image Viewer Modal - Swipe to view multiple images
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerCloseBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerCounter: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  imageViewerCounterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  imageViewerList: {
    flex: 1,
  },
  imageViewerSlide: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerImage: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_WIDTH - 40,
    borderRadius: 12,
  },
  imageViewerDots: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imageViewerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  imageViewerDotActive: {
    width: 24,
    backgroundColor: COLORS.gold,
  },
  imageViewerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },

  // Product Image Viewer with Zoom
  productImageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageViewerCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  productImageViewerCounter: {
    position: 'absolute',
    top: 55,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 100,
  },
  productImageViewerSlide: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: SCREEN_WIDTH,
    minHeight: '100%',
  },
  productImageViewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  productImageViewerDots: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  zoomHintText: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },

  // Write Review Button
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 189, 89, 0.4)',
  },
  writeReviewBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  verifiedPurchaseBadge: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success,
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: SPACING.xs,
  },

  // Write Review Modal
  reviewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  reviewModalContainer: {
    backgroundColor: '#0D0B14',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: COLORS.inputBorder,
  },
  reviewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  reviewModalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  reviewModalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewProductInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  reviewProductImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  reviewProductTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  reviewFormScroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    maxHeight: 400,
  },
  reviewRatingSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  reviewLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  reviewRatingStars: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  reviewRatingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  reviewInputSection: {
    marginBottom: SPACING.lg,
  },
  reviewInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  reviewInputMultiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  reviewCharCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  reviewVerifiedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(58, 247, 166, 0.1)',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  reviewVerifiedText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
  },
  reviewSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.burgundy,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  reviewSubmitBtnDisabled: {
    opacity: 0.5,
  },
  reviewSubmitText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
});

export default ProductDetailScreen;
