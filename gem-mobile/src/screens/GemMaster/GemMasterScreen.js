/**
 * Gemral - Gemral Screen
 * AI Chat Interface with I Ching & Tarot
 *
 * Day 7 Integration:
 * - TierService integration
 * - QuotaService integration
 * - QuickActionBar component
 * - ClearChatButton component
 * - UpgradeModal component
 * - TierBadge & QuotaIndicator
 *
 * Day 11-12 Integration:
 * - Voice Input with quota management
 * - VoiceQuotaDisplay component
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableOpacity,
  Dimensions,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import alertService from '../../services/alertService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, Settings, Plus, Clock, ChevronDown } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
import { LinearGradient } from 'expo-linear-gradient';

// Layout constants - QUAN TRỌNG: Xem file này để hiểu cách keyboard positioning hoạt động
import {
  KEYBOARD_CLOSED_BOTTOM,
  KEYBOARD_OPEN_OFFSET,
  CHAT_CONTENT_BOTTOM_PADDING,
  CHAT_CONTENT_KEYBOARD_PADDING,
  SCROLL_BUTTON_BOTTOM_CLOSED,
  SCROLL_BUTTON_KEYBOARD_OFFSET,
  INPUT_AREA_BACKGROUND,
} from '../../constants/gemMasterLayout';
import { useTabBar } from '../../contexts/TabBarContext';
import { useCart } from '../../contexts/CartContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTooltip } from '../../components/Common/TooltipProvider';

// Components
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';

// GemMaster Components
import {
  TierBadge,
  QuotaIndicator,
  QuotaIndicatorCompact
} from '../../components/GemMaster';
import QuickActionBar from '../../components/GemMaster/QuickActionBar';
import ClearChatButton from '../../components/GemMaster/ClearChatButton';
import ChatbotPricingModal from '../../components/GemMaster/ChatbotPricingModal';
import VoiceQuotaDisplay, { VoiceQuotaWarning } from '../../components/GemMaster/VoiceQuotaDisplay';
import WidgetSuggestionCard from '../../components/GemMaster/WidgetSuggestionCard';
import SmartFormCard from '../../components/SmartFormCard';
// NEW: Updated components
import SmartFormCardNew from '../../components/GemMaster/SmartFormCardNew';
import CrystalRecommendationNew from '../../components/GemMaster/CrystalRecommendationNew';
import CourseRecommendation from '../../components/GemMaster/CourseRecommendation';
import AffiliatePromotion from '../../components/GemMaster/AffiliatePromotion';
import ProductRecommendations from '../../components/GemMaster/ProductRecommendations';
// NEW: Goal Setting Form (interactive form instead of text chat)
import GoalSettingForm from '../../components/GemMaster/GoalSettingForm';
// NEW: Inline Chat Form (replaces modal with inline chat-style form)
import InlineChatForm from '../../components/GemMaster/InlineChatForm';
// NEW: Quick Buy & Upsell Modals for crystal purchase flow
import QuickBuyModal from '../../components/GemMaster/QuickBuyModal';
import UpsellModal from '../../components/GemMaster/UpsellModal';
// NEW: Binance-style FAQ Panel
import FAQPanel from '../../components/GemMaster/FAQPanel';

// NEW: Chatbot Upgrade UI Components (Memory, Emotion, Proactive, Gamification)
import PersonalizedGreeting from '../../components/GemMaster/PersonalizedGreeting';
import { EmotionIndicator, EmotionBadge } from '../../components/GemMaster/EmotionIndicator';
import { StreakDisplay, MiniStreak } from '../../components/GemMaster/StreakDisplay';
import { ProactiveMessageCard, ProactiveMessageList } from '../../components/GemMaster/ProactiveMessageCard';

// NEW: Smart Triggers & Rich Responses (Day 25)
import { SmartSuggestionBanner } from '../../components/Chat';

// NEW: Upgrade Banner for quota exhausted
import { UpgradeBanner } from '../../components/upgrade';
import { useSponsorBanners } from '../../components/SponsorBannerSection';
import SponsorBanner from '../../components/SponsorBanner';

// Services
import TierService from '../../services/tierService';
import QuotaService from '../../services/quotaService';
import voiceService from '../../services/voiceService';
import responseDetector from '../../services/responseDetector';
import gemMasterService from '../../services/gemMasterService';
import widgetFactoryService from '../../services/widgetFactoryService';
import RecommendationEngine from '../../services/recommendationEngine';
import chatHistoryService from '../../services/chatHistoryService';
import { supabase } from '../../services/supabase';

// NEW: Chatbot Upgrade Services (Memory, Emotion, Proactive, etc.)
import userMemoryService from '../../services/userMemoryService';
import emotionDetectionService from '../../services/emotionDetectionService';
import streakService from '../../services/streakService';
import proactiveAIService from '../../services/proactiveAIService';
import accessControlService from '../../services/accessControlService';
import ritualTrackingService from '../../services/ritualTrackingService';
import { isFeatureEnabled, FEATURES } from '../../config/featureFlags';
// NEW: Widget and Crystal services
import { detectWidgetTrigger } from '../../services/widgetDetectionService';
import { shouldShowCrystalRecommendations, extractShopifyTags } from '../../services/crystalTagMappingService';
import shopifyService from '../../services/shopifyService';
// NEW: WebSocket/Hybrid Chat Services (PHASE 1C)
import { useWebSocketChat } from '../../hooks/useWebSocketChat';
import ConnectionStatus from './components/ConnectionStatus';

// NEW: Smart Triggers Hook (Day 25)
import { useSmartTriggers } from '../../hooks/useSmartTriggers';

// NEW: Centralized Templates - Intent Detection
import { detectTemplateIntent, extractContextForAutoFill } from '../../services/templates/intentDetectionService';
import { checkTemplateAccess } from '../../config/templateAccessControl';
import { getTemplate } from '../../services/templates/journalTemplates';
import TemplateInlineForm from '../../components/GemMaster/TemplateInlineForm';

// Simple UUID generator for session tracking
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Karma type icons mapping (lucide-react-native icon names)
const KARMA_ICONS = {
  money: 'Wallet',
  love: 'Heart',
  health: 'Activity',
  career: 'Briefcase',
  family: 'Users',
  frequency: 'Sparkles',
  general: 'Sparkles',
};

// Welcome message - AI Sư Phụ persona
const WELCOME_MESSAGE = {
  id: 'welcome',
  type: 'assistant',
  text: 'Ta là GEM Master.\n\nTa có thể hướng dẫn bạn:\n\n- Phân tích thị trường crypto & trading\n- Xem quẻ Kinh Dịch\n- Đọc bài Tarot\n- Tư vấn năng lượng & tần số\n\nBạn cần điều gì?',
  timestamp: new Date().toISOString(),
};

const GemMasterScreen = ({ navigation, route }) => {
  // Tooltip hook for feature discovery
  const { showTooltipForScreen, initialized: tooltipInitialized } = useTooltip();

  // Sponsor banners - use hook to fetch banners for gemmaster screen
  const { banners: sponsorBanners, dismissBanner, userId: bannerUserId } = useSponsorBanners('gemmaster', null);

  // WebSocket Chat hook (PHASE 1C)
  const {
    isOnline: wsIsOnline,
    isConnected: wsIsConnected,
    isTyping: wsIsTyping,
    queueSize: wsQueueSize,
    queueSyncStatus: wsQueueSyncStatus,
    connect: wsConnect,
    getConnectionStatusText,
    getConnectionStatusColor,
  } = useWebSocketChat({ autoConnect: true });

  // User state (moved up for hook dependencies)
  const [user, setUser] = useState(null);

  // Smart Triggers Hook (Day 25) - proactive AI engagement
  const {
    activeTrigger: smartTrigger,
    dismissTrigger: dismissSmartTrigger,
    handleTriggerAction: handleSmartTriggerAction,
    hasTriggers: hasSmartTriggers,
  } = useSmartTriggers(user?.id, {
    enabled: true,
    checkInterval: 120000, // Check every 2 minutes
  });

  // Chat state
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  // Track if initialPrompt has been processed (to avoid re-triggering)
  const initialPromptProcessed = useRef(false);
  // Pending prompt from initialPrompt param (to be sent when ready)
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const {
    hideTabBar,
    showTabBar,
    // Don't use handleChatScroll - it causes tab bar to flicker
    // handleChatScroll,
    tabBarHeight, // Use tabBarHeight constant (100) instead of animated bottomPadding
    isVisible: isTabBarVisible,
    disableAutoHide,
  } = useTabBar();

  // User & Tier state (user is declared above for hook dependencies)
  const [userTier, setUserTier] = useState('FREE');
  const [quota, setQuota] = useState(null);
  const [isLoadingTier, setIsLoadingTier] = useState(true);

  // Voice quota state (Day 11-12)
  const [voiceQuota, setVoiceQuota] = useState({
    isUnlimited: false,
    used: 0,
    limit: 3,
    remaining: 3,
    canUse: true,
    displayText: '3/3 còn lại'
  });

  // Modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showVoiceQuotaWarning, setShowVoiceQuotaWarning] = useState(false);

  // Widget suggestion state (Day 17-19)
  const [suggestedWidgets, setSuggestedWidgets] = useState(null);
  const [lastUserQuery, setLastUserQuery] = useState('');

  // Chat history state
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // SmartFormCard state - for user input forms (legacy)
  const [showSmartForm, setShowSmartForm] = useState(false);
  const [smartFormType, setSmartFormType] = useState(null);
  const [smartFormData, setSmartFormData] = useState({});

  // NEW: SmartFormCardNew state - for improved widget forms
  const [widgetForm, setWidgetForm] = useState({
    visible: false,
    widgetType: null,
    extractedData: null,
    title: '',
  });

  // NEW: Crystal Recommendation state
  const [crystalRec, setCrystalRec] = useState({
    show: false,
    context: '',
  });

  // NEW V4: Course & Affiliate recommendation state
  const [currentCourseRecommendation, setCurrentCourseRecommendation] = useState(null);
  const [currentAffiliatePromo, setCurrentAffiliatePromo] = useState(null);

  // NEW: Product recommendations state (courses from Shopify for trading/course questions)
  const [productRec, setProductRec] = useState({
    show: false,
    context: '',
  });

  // Keyboard state for bottom padding - use Animated for smooth transitions
  // QUAN TRỌNG: Xem constants/gemMasterLayout.js để hiểu các giá trị này
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardHeightAnim = useRef(new Animated.Value(KEYBOARD_CLOSED_BOTTOM)).current;

  // Scroll state for scroll-to-bottom button
  const [showScrollButton, setShowScrollButton] = useState(false);

  // NEW: Goal Setting Form state (interactive form instead of text chat)
  const [goalFormState, setGoalFormState] = useState({
    visible: false,
    formType: 'goal', // 'goal' or 'affirmation'
  });

  // NEW: Inline Chat Form state (replaces modal with inline chat-style form)
  const [inlineFormState, setInlineFormState] = useState({
    visible: false,
    formType: 'goal',
    preSelectedArea: null,
    userInput: null,
  });

  // NEW: Centralized Templates - Template inline form state
  const [templateFormState, setTemplateFormState] = useState({
    visible: false,
    templateId: null,
    autoFillData: {},
  });

  // NEW: Track when template form has focus (to hide chat input & quick actions)
  const [templateFormFocused, setTemplateFormFocused] = useState(false);

  // NEW: Quick Buy & Upsell Modal state for crystal purchase flow
  const [quickBuyModal, setQuickBuyModal] = useState({
    visible: false,
    product: null,
  });
  const [upsellModal, setUpsellModal] = useState({
    visible: false,
    upsellData: null,
  });

  // NEW: Binance-style FAQ Panel state
  const [faqPanelState, setFaqPanelState] = useState({
    visible: false,
    topicId: null,
  });

  // ===== CHATBOT UPGRADE STATE =====
  // Personalized memory & context
  const [userProfile, setUserProfile] = useState(null);
  const [personalizedContext, setPersonalizedContext] = useState(null);

  // Emotion detection
  const [currentEmotion, setCurrentEmotion] = useState(null);

  // Proactive AI messages
  const [pendingProactiveMessages, setPendingProactiveMessages] = useState([]);

  // Streaks & Gamification
  const [gamificationSummary, setGamificationSummary] = useState(null);

  // Today's ritual status
  const [todayRituals, setTodayRituals] = useState(null);

  // Crisis alert state (for emergency emotion detection)
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [crisisInfo, setCrisisInfo] = useState(null);

  // Fetch user and tier on mount
  useEffect(() => {
    const fetchUserAndTier = async () => {
      try {
        setIsLoadingTier(true);

        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          // Get user tier
          const tier = await TierService.getUserTier(currentUser.id);
          setUserTier(tier);

          // Get quota
          const quotaData = await QuotaService.checkQuota(currentUser.id, tier);
          setQuota(quotaData);

          // Get voice quota (Day 11-12)
          const voiceQuotaData = await voiceService.getVoiceQuotaInfo(currentUser.id, tier);
          setVoiceQuota(voiceQuotaData);

          console.log('[GemMaster] User tier:', tier, 'Quota:', quotaData, 'Voice:', voiceQuotaData);
        } else {
          // Not logged in - use default
          setUserTier('FREE');
          setQuota(QuotaService.getDefaultQuota());
          setVoiceQuota(TierService.getVoiceQuotaInfo('FREE', 0));
        }
      } catch (error) {
        console.error('[GemMaster] Error fetching user/tier:', error);
        setQuota(QuotaService.getDefaultQuota());
      } finally {
        setIsLoadingTier(false);
      }
    };

    fetchUserAndTier();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const tier = await TierService.getUserTier(session.user.id);
        setUserTier(tier);
        const quotaData = await QuotaService.checkQuota(session.user.id, tier);
        setQuota(quotaData);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserTier('FREE');
        setQuota(QuotaService.getDefaultQuota());
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // ===== CHATBOT UPGRADE: Load Personalized Data =====
  useEffect(() => {
    const loadPersonalizedData = async () => {
      if (!user?.id) {
        console.log('[GemMaster] No user ID, skipping personalized data load');
        return;
      }

      console.log('[GemMaster] ========== LOADING PERSONALIZED DATA ==========');
      console.log('[GemMaster] User ID:', user.id);
      console.log('[GemMaster] Feature Flags:', {
        MEMORY: isFeatureEnabled(FEATURES.MEMORY),
        PROACTIVE: isFeatureEnabled(FEATURES.PROACTIVE),
        GAMIFICATION: isFeatureEnabled(FEATURES.GAMIFICATION),
        RITUALS: isFeatureEnabled(FEATURES.RITUALS),
      });

      // Load user profile for personalization
      if (isFeatureEnabled(FEATURES.MEMORY)) {
        try {
          console.log('[GemMaster] Loading user profile...');
          const profile = await userMemoryService.getUserProfile(user.id);
          setUserProfile(profile);
          console.log('[GemMaster] ✓ User profile loaded:', profile?.preferred_name || 'new user');
        } catch (err) {
          console.error('[GemMaster] ✗ Failed to load user profile:', err.message);
        }
      }

      // Load pending proactive messages
      if (isFeatureEnabled(FEATURES.PROACTIVE)) {
        try {
          console.log('[GemMaster] Loading proactive messages...');
          const pending = await proactiveAIService.getPendingMessages(user.id);
          setPendingProactiveMessages(pending || []);
          console.log('[GemMaster] ✓ Proactive messages:', pending?.length || 0);

          // Generate daily insight if needed (once per day)
          proactiveAIService.generateDailyInsight(user.id).catch(err => {
            console.warn('[GemMaster] Daily insight error:', err.message);
          });
        } catch (err) {
          console.error('[GemMaster] ✗ Failed to load proactive messages:', err.message);
        }
      }

      // Load gamification summary
      if (isFeatureEnabled(FEATURES.GAMIFICATION)) {
        try {
          console.log('[GemMaster] Loading gamification summary...');
          const summary = await streakService.getGamificationSummary(user.id);
          setGamificationSummary(summary);
          console.log('[GemMaster] ✓ Gamification:', summary?.level?.name, 'Level', summary?.level?.level, 'Streak:', summary?.currentStreak);

          // Check streak risk and generate alerts
          proactiveAIService.checkStreaksAndAlert(user.id).catch(err => {
            console.warn('[GemMaster] Streak alert error:', err.message);
          });
        } catch (err) {
          console.error('[GemMaster] ✗ Failed to load gamification:', err.message);
        }
      }

      // Load today's ritual status
      if (isFeatureEnabled(FEATURES.RITUALS)) {
        try {
          console.log('[GemMaster] Loading ritual status...');
          const rituals = await ritualTrackingService.getTodayStatus(user.id);
          setTodayRituals(rituals);
          console.log('[GemMaster] ✓ Today rituals:', rituals?.completedCount, '/', rituals?.totalCount);

          // Generate ritual reminders
          proactiveAIService.generateRitualReminders(user.id).catch(err => {
            console.warn('[GemMaster] Ritual reminder error:', err.message);
          });
        } catch (err) {
          console.error('[GemMaster] ✗ Failed to load rituals:', err.message);
        }
      }

      console.log('[GemMaster] ========== PERSONALIZED DATA LOADED ==========');
    };

    loadPersonalizedData();
  }, [user?.id]);

  // Hide tab bar when keyboard shows - INSTANT position change
  useEffect(() => {
    // Use 'Will' events on iOS for faster response, 'Did' events on Android
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    // Track keyboard height for animation
    let currentKeyboardHeight = 0;

    const keyboardShowListener = Keyboard.addListener(showEvent, (e) => {
      const height = e.endCoordinates.height;
      currentKeyboardHeight = height;
      console.log('[GemMaster] Keyboard SHOW - height:', height);
      setKeyboardVisible(true);
      setKeyboardHeight(height);
      hideTabBar();
      // Sử dụng constant từ gemMasterLayout.js
      keyboardHeightAnim.setValue(height + KEYBOARD_OPEN_OFFSET);
    });

    // On Android, also listen to keyboardDidShow for more accurate height
    const keyboardDidShowListener = Platform.OS === 'android'
      ? Keyboard.addListener('keyboardDidShow', (e) => {
          const height = e.endCoordinates.height;
          if (height !== currentKeyboardHeight) {
            currentKeyboardHeight = height;
            keyboardHeightAnim.setValue(height + KEYBOARD_OPEN_OFFSET);
          }
        })
      : null;

    const keyboardHideListener = Keyboard.addListener(hideEvent, () => {
      console.log('[GemMaster] Keyboard HIDE');
      setKeyboardVisible(false);
      setKeyboardHeight(0);
      showTabBar();
      // Sử dụng constant từ gemMasterLayout.js
      keyboardHeightAnim.setValue(KEYBOARD_CLOSED_BOTTOM);
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
      keyboardDidShowListener?.remove();
    };
  }, [hideTabBar, showTabBar, keyboardHeightAnim]);

  // Show tooltips for first-time users
  useEffect(() => {
    if (tooltipInitialized && user?.id) {
      // Delay slightly to allow screen to render
      const timer = setTimeout(() => {
        showTooltipForScreen('gemmaster', { tier: userTier });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tooltipInitialized, user?.id, userTier, showTooltipForScreen]);

  // Reset tab bar visibility when screen gains focus
  // IMPORTANT: Disable auto-hide for GemMaster to prevent flickering
  // With inverted FlatList, newest messages are always at bottom - no scroll needed
  useFocusEffect(
    useCallback(() => {
      // Show tab bar and disable auto-hide when entering screen
      showTabBar();
      disableAutoHide();
      // No scroll needed - inverted FlatList always shows bottom first
    }, [showTabBar, disableAutoHide])
  );

  // Handle initialPrompt from VisionBoard or other screens
  // Use useEffect with route.params dependency to catch new prompts
  useEffect(() => {
    const initialPrompt = route?.params?.initialPrompt;

    if (initialPrompt && initialPrompt !== initialPromptProcessed.current) {
      console.log('[GemMaster] Received NEW initialPrompt:', initialPrompt);
      // Mark this prompt as being processed
      initialPromptProcessed.current = initialPrompt;
      setPendingPrompt(initialPrompt);

      // Clear the param to prevent re-triggering
      navigation.setParams({ initialPrompt: undefined });
    }
  }, [route?.params?.initialPrompt, navigation]);

  // Handle autoShowTemplate from VisionBoard "Tạo từ Journal/Template" option
  useEffect(() => {
    const templateId = route?.params?.autoShowTemplate;
    const entryPoint = route?.params?.entryPoint || 'gemmaster';

    if (templateId) {
      console.log('[GemMaster] Auto-showing template:', templateId, 'from:', entryPoint);

      // Show the template form
      setTemplateFormState({
        visible: true,
        templateId: templateId,
        autoFillData: {},
      });

      // Clear the param to prevent re-triggering
      navigation.setParams({ autoShowTemplate: undefined, entryPoint: undefined });
    }
  }, [route?.params?.autoShowTemplate, navigation]);

  // Reset on screen blur so next navigation can trigger
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Reset processed marker on blur
        initialPromptProcessed.current = null;
      };
    }, [])
  );

  // Load most recent conversation on mount
  useEffect(() => {
    const loadRecentConversation = async () => {
      if (!user) return;

      try {
        const recent = await chatHistoryService.getRecentConversation(user.id);
        if (recent && recent.messages && recent.messages.length > 0) {
          setCurrentConversationId(recent.id);
          setMessages([WELCOME_MESSAGE, ...recent.messages]);
          console.log('[GemMaster] Loaded recent conversation:', recent.id);
          // No scroll needed - inverted FlatList shows newest messages at bottom automatically
        }
      } catch (error) {
        console.error('[GemMaster] Error loading recent conversation:', error);
      }
    };

    loadRecentConversation();
  }, [user]);

  // Check if user can query (has remaining quota)
  const canQuery = useCallback(() => {
    if (!quota) return false;
    return quota.unlimited || quota.remaining > 0;
  }, [quota]);

  // Refresh quota
  const refreshQuota = useCallback(async () => {
    if (!user) return;

    try {
      const quotaData = await QuotaService.checkQuota(user.id, userTier);
      setQuota(quotaData);
    } catch (error) {
      console.error('[GemMaster] Error refreshing quota:', error);
    }
  }, [user, userTier]);

  // Refresh voice quota (Day 11-12)
  const refreshVoiceQuota = useCallback(async () => {
    if (!user) return;

    try {
      const voiceQuotaData = await voiceService.getVoiceQuotaInfo(user.id, userTier);
      setVoiceQuota(voiceQuotaData);
    } catch (error) {
      console.error('[GemMaster] Error refreshing voice quota:', error);
    }
  }, [user, userTier]);

  // Handle voice recording start
  const handleVoiceRecordingStart = useCallback(() => {
    console.log('[GemMaster] Voice recording started');
  }, []);

  // Handle voice recording stop
  const handleVoiceRecordingStop = useCallback(async (audioUri, duration) => {
    console.log('[GemMaster] Voice recording stopped, duration:', duration);

    // Increment voice usage count
    if (user) {
      await voiceService.incrementVoiceCount(user.id);
      await refreshVoiceQuota();
    }
  }, [user, refreshVoiceQuota]);

  // Handle voice error
  const handleVoiceError = useCallback((error) => {
    console.error('[GemMaster] Voice error:', error);

    if (error.code === 'quota_exceeded') {
      setShowVoiceQuotaWarning(true);
    } else if (error.code === 'permission_denied') {
      alertService.warning(
        'Cần quyền truy cập',
        'Vui lòng cấp quyền microphone trong Cài đặt để sử dụng voice input.',
        [{ text: 'OK' }]
      );
    } else {
      alertService.error(
        'Lỗi ghi âm',
        error.message || 'Không thể ghi âm. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  // Handle voice quota press
  const handleVoiceQuotaPress = useCallback(() => {
    if (!voiceQuota.canUse) {
      setShowVoiceQuotaWarning(true);
    }
  }, [voiceQuota]);

  // Build conversation history for Gemini API
  const buildHistory = useCallback(() => {
    return messages
      .filter(msg => msg.id !== 'welcome')
      .map(msg => ({
        role: msg.type === 'user' ? 'user' : 'model',
        content: msg.text,
      }));
  }, [messages]);

  // Generate AI response using GemMasterService (Local + Gemini with Context)
  // ⚠️ CRITICAL: Pass conversation history for context
  const generateResponse = useCallback(async (userMessage, currentMessages) => {
    setIsTyping(true);
    // No scroll needed - inverted FlatList auto-shows new content at bottom

    try {
      // ⚠️ CRITICAL: Use sendMessageEnhanced for intent detection & personalization
      // Falls back to processMessage internally but adds intent instructions
      const response = await gemMasterService.sendMessageEnhanced(
        user?.id,
        userMessage,
        {
          history: currentMessages,
          userTier: userTier,
          sessionId: generateUUID(),
        }
      );

      console.log('[GemMaster] Response:', {
        textLength: response.text?.length,
        hasWidget: !!response.widgetSuggestion,
        hasCourse: !!response.courseRecommendation,
        showCrystals: response.showCrystals,
        showAffiliate: response.showAffiliate,
      });

      // Get product recommendations from response or fetch separately
      // SKIP for questionnaire mode to avoid delay
      let products = response.products || response.recommendedProducts || [];
      const isQuestionnaireResponse = response.mode === 'questionnaire' || response.isQuestionMessage;

      // If no products from response, try RecommendationEngine (but NOT for questionnaire)
      if (products.length === 0 && !isQuestionnaireResponse) {
        try {
          const recommendations = await RecommendationEngine.getRecommendations(
            user?.id,
            userTier,
            userMessage
          );
          if (recommendations?.hasCrystals) {
            products = recommendations.crystals.slice(0, 2);
          }
        } catch (recError) {
          console.warn('[GemMaster] Recommendation error:', recError);
        }
      }

      setIsTyping(false);

      return {
        id: `msg_${Date.now()}`,
        type: 'assistant',
        text: response.text,
        timestamp: new Date().toISOString(),
        source: response.source,
        confidence: response.confidence,
        products: products,
        quickActions: response.quickActions,
        category: response.category,
        // V4: Include new recommendation data
        widgetSuggestion: response.widgetSuggestion,
        courseRecommendation: response.courseRecommendation,
        showCrystals: response.showCrystals,
        crystalTags: response.crystalTags,
        showAffiliate: response.showAffiliate,
        affiliatePromo: response.affiliatePromo,
        // Interactive questionnaire options
        options: response.options,
        questionId: response.questionId,
        questionIndex: response.questionIndex,
        totalQuestions: response.totalQuestions,
        isQuestionMessage: response.isQuestionMessage,
        mode: response.mode,
        // Rich Response Data (Day 25)
        responseType: response.responseType,
        richData: response.richData,
      };
    } catch (error) {
      console.error('[GemMaster] Generate response error:', error);
      setIsTyping(false);

      return {
        id: `msg_${Date.now()}`,
        type: 'assistant',
        text: '😔 Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
        timestamp: new Date().toISOString(),
        source: 'error',
        confidence: 0,
      };
    }
  }, [user, userTier]);

  // Detect if user wants to set goal/affirmation - show form instead of chat
  // Also detect specific life area from user input to pre-select in form
  const detectGoalAffirmationIntent = useCallback((text) => {
    const lowerText = text.toLowerCase();

    // Life area detection mapping
    const lifeAreaMapping = {
      finance: ['tiền', 'tiền bạc', 'tài chính', 'giàu', 'thu nhập', 'lương', 'đầu tư', 'money', 'finance', 'wealth', 'rich'],
      career: ['sự nghiệp', 'công việc', 'nghề nghiệp', 'thăng tiến', 'career', 'job', 'work', 'promotion'],
      health: ['sức khỏe', 'khỏe mạnh', 'giảm cân', 'tập gym', 'health', 'healthy', 'fitness', 'weight'],
      relationships: ['tình yêu', 'người yêu', 'hôn nhân', 'gia đình', 'bạn bè', 'mối quan hệ', 'love', 'relationship', 'marriage', 'partner'],
      personal: ['bản thân', 'phát triển', 'học tập', 'kỹ năng', 'personal', 'growth', 'learning', 'skill'],
      spiritual: ['tâm linh', 'thiền', 'bình an', 'tinh thần', 'spiritual', 'meditation', 'peace', 'mindfulness'],
    };

    // Detect life area from text
    let detectedArea = null;
    for (const [area, keywords] of Object.entries(lifeAreaMapping)) {
      for (const kw of keywords) {
        if (lowerText.includes(kw)) {
          detectedArea = area;
          break;
        }
      }
      if (detectedArea) break;
    }

    // Goal keywords - EXPANDED to catch more patterns
    const goalKeywords = [
      // Vietnamese goal-related (full phrases)
      'đặt mục tiêu', 'mục tiêu mới', 'thiết lập mục tiêu', 'tạo mục tiêu',
      'muốn đặt mục tiêu', 'giúp tôi đặt mục tiêu', 'lập kế hoạch',
      'tôi muốn đạt được', 'mục tiêu của tôi', 'thêm mục tiêu',
      'kế hoạch mục tiêu', 'lập mục tiêu', 'xây dựng mục tiêu',
      'định hướng mục tiêu', 'hoạch định',
      // SIMPLE - trigger form when user types just "mục tiêu"
      'mục tiêu',
      // Manifest/Law of Attraction
      'manifest', 'manifestation', 'thu hút', 'luật hấp dẫn',
      'law of attraction', 'hấp dẫn', 'thu hút điều', 'muốn thu hút',
      // Guidance patterns with desires
      'hướng dẫn tôi', 'giúp tôi có', 'dạy tôi cách', 'chỉ tôi cách',
      // Life area desires
      'muốn có tiền', 'muốn giàu', 'muốn thành công', 'muốn khỏe mạnh',
      'muốn có người yêu', 'muốn hạnh phúc', 'muốn bình an',
      'muốn có', 'tôi muốn', 'ước mơ', 'mong muốn', 'khát khao',
      // English
      'set goal', 'new goal', 'add goal', 'create goal', 'my goal', 'goal',
      'i want to', 'i wish', 'help me achieve',
    ];

    // Simpler keywords that should trigger form when combined with intent
    const simpleGoalKeywords = [
      'mục tiêu', 'kế hoạch', 'tình yêu', 'tiền bạc', 'sức khỏe',
      'sự nghiệp', 'công việc', 'hạnh phúc', 'thành công',
    ];

    // Affirmation keywords - EXPANDED
    const affirmationKeywords = [
      'tạo affirmation', 'affirmation mới', 'câu khẳng định', 'lời khẳng định',
      'muốn tạo affirmation', 'thêm affirmation', 'create affirmation',
      'positive affirmation', 'daily affirmation',
      'affirmation', 'khẳng định', 'tự nhủ', 'câu tự nhủ',
      'mantra', 'positive thinking', 'suy nghĩ tích cực',
    ];

    // Check goal keywords first (full phrases)
    for (const kw of goalKeywords) {
      if (lowerText.includes(kw)) {
        return { shouldShowForm: true, formType: 'goal', preSelectedArea: detectedArea, userInput: text };
      }
    }

    // Check simple keywords with intent verbs
    const intentVerbs = ['muốn', 'cần', 'hướng dẫn', 'giúp', 'dạy', 'chỉ', 'làm sao', 'làm thế nào'];
    const hasIntentVerb = intentVerbs.some(verb => lowerText.includes(verb));
    if (hasIntentVerb) {
      for (const kw of simpleGoalKeywords) {
        if (lowerText.includes(kw)) {
          return { shouldShowForm: true, formType: 'goal', preSelectedArea: detectedArea, userInput: text };
        }
      }
    }

    // Check affirmation keywords
    for (const kw of affirmationKeywords) {
      if (lowerText.includes(kw)) {
        return { shouldShowForm: true, formType: 'affirmation', preSelectedArea: detectedArea, userInput: text };
      }
    }

    return { shouldShowForm: false, formType: null, preSelectedArea: null, userInput: null };
  }, []);

  // Handle send message
  const handleSend = useCallback(
    async (text) => {
      // Check quota first
      if (!canQuery()) {
        setShowUpgradeModal(true);
        return;
      }

      // AUTO-CLOSE inline form if user sends a new message (ignoring the form)
      if (inlineFormState.visible) {
        console.log('[GemMaster] Auto-closing inline form - user sent new message');
        setInlineFormState({
          visible: false,
          formType: 'goal',
          preSelectedArea: null,
          userInput: null,
        });
      }

      // ===== CHATBOT UPGRADE: Emotion Detection & Crisis Check =====
      let emotionData = null;
      let personalizedCtx = null;

      if (isFeatureEnabled(FEATURES.EMOTION) && user?.id) {
        try {
          // Detect emotions BEFORE processing message
          emotionData = await emotionDetectionService.detectEmotions(text, user.id);
          console.log('[GemMaster] Emotion detected:', emotionData?.primary, 'Frequency:', emotionData?.frequency?.hz);
          setCurrentEmotion(emotionData);

          // Check for crisis keywords - show immediate support
          if (emotionData?.crisis) {
            setCrisisInfo(emotionData.crisis);
            setShowCrisisAlert(true);
            // Don't block the message, but show crisis support modal
          }
        } catch (emotionError) {
          console.warn('[GemMaster] Emotion detection error:', emotionError);
        }
      }

      // ===== CHATBOT UPGRADE: Build Personalized Context =====
      if (isFeatureEnabled(FEATURES.MEMORY_PERSONALIZATION) && user?.id) {
        try {
          personalizedCtx = await userMemoryService.buildPersonalizedContext(user.id, text);
          setPersonalizedContext(personalizedCtx);
          console.log('[GemMaster] Personalized context built:', {
            hasProfile: !!personalizedCtx?.profile,
            memoriesCount: personalizedCtx?.relevantMemories?.length || 0,
            hasGoals: !!personalizedCtx?.goals?.length,
          });
        } catch (ctxError) {
          console.warn('[GemMaster] Context building error:', ctxError);
        }
      }

      // ========== CENTRALIZED TEMPLATES: Intent Detection ==========
      // Check for template-specific intents FIRST (fear_setting, think_day, gratitude, etc.)
      let templateIntent = null;
      try {
        console.log('[GemMaster] === TEMPLATE DETECTION START ===');
        console.log('[GemMaster] Input text:', text);
        console.log('[GemMaster] detectTemplateIntent function:', typeof detectTemplateIntent);
        templateIntent = detectTemplateIntent(text);
        console.log('[GemMaster] Template intent result:', JSON.stringify(templateIntent));
      } catch (templateError) {
        console.error('[GemMaster] Template detection error:', templateError);
      }
      if (templateIntent && templateIntent.confidence > 0.6) {
        console.log('[GemMaster] Detected template intent:', templateIntent.templateId, 'confidence:', templateIntent.confidence);

        // Check access control
        const access = checkTemplateAccess(templateIntent.templateId, userTier);
        console.log('[GemMaster] Template access check:', templateIntent.templateId, 'userTier:', userTier, 'result:', access);
        if (access.allowed) {
          // Add user message first
          const userMessage = {
            id: `user_${Date.now()}`,
            type: 'user',
            text,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, userMessage]);

          // Template-specific intro messages
          const templateIntroMessages = {
            fear_setting: '😰 Tôi hiểu bạn đang lo lắng về điều gì đó. Hãy dùng Fear-Setting để phân tích nỗi sợ và tìm giải pháp.',
            think_day: '🤔 Thời điểm tuyệt vời để review cuộc sống! Think Day giúp bạn nhìn lại và điều chỉnh hướng đi.',
            gratitude: '🙏 Ghi nhận sự biết ơn là cách tuyệt vời để nâng cao tần số. Hãy viết nhật ký biết ơn.',
            daily_wins: '🏆 Ghi nhận thành tựu trong ngày giúp bạn duy trì động lực và năng lượng tích cực.',
            weekly_planning: '📅 Lên kế hoạch tuần giúp bạn có định hướng rõ ràng và đạt mục tiêu hiệu quả hơn.',
            vision_3_5_years: '🔮 Tầm nhìn dài hạn giúp bạn định hình tương lai và có động lực mỗi ngày.',
            trading_journal: '📈 Ghi chép giao dịch giúp bạn học hỏi từ kinh nghiệm và cải thiện hiệu suất trading.',
            goal_basic: '🎯 Hãy đặt mục tiêu cụ thể để manifest điều bạn muốn.',
            free_form: '✨ Viết tự do giúp bạn giải tỏa tâm trí và khám phá bản thân.',
          };

          const introText = templateIntroMessages[templateIntent.templateId] || '✨ Hãy điền form để tạo nhật ký và mục tiêu.';

          // Add AI intro message
          const introMsg = {
            id: `template_intro_${Date.now()}`,
            type: 'assistant',
            text: introText,
            timestamp: new Date().toISOString(),
            source: 'template_intent',
          };
          setMessages((prev) => [...prev, introMsg]);

          // Auto-scroll
          setTimeout(() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }, 100);

          // Extract auto-fill data from user message
          const template = getTemplate(templateIntent.templateId);
          const autoFillData = extractContextForAutoFill(text, template);

          // Show template inline form
          setTimeout(() => {
            setTemplateFormState({
              visible: true,
              templateId: templateIntent.templateId,
              autoFillData: autoFillData || {},
            });
          }, 500);

          return; // Don't continue to AI chat
        } else {
          // User doesn't have access - show upgrade prompt
          console.log('[GemMaster] Template access denied:', templateIntent.templateId, 'reason:', access.reason);
          // Continue to normal AI flow which may suggest upgrade
        }
      }

      // NEW: Detect goal/affirmation intent → show INLINE form instead of modal
      const intentDetection = detectGoalAffirmationIntent(text);
      if (intentDetection.shouldShowForm) {
        console.log('[GemMaster] Detected goal/affirmation intent:', intentDetection.formType, 'preSelectedArea:', intentDetection.preSelectedArea);

        // Add user message first to show what user typed
        const userMessage = {
          id: `user_${Date.now()}`,
          type: 'user',
          text,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Determine brief message based on detected life area
        const briefMessages = {
          finance: '💰 Tôi sẽ hướng dẫn bạn manifest tiền bạc và thịnh vượng. Để tạo mục tiêu phù hợp với bạn, hãy trả lời một vài câu hỏi ngắn sau đây.',
          career: '💼 Tôi sẽ hướng dẫn bạn đặt mục tiêu sự nghiệp và phát triển công việc. Để tạo mục tiêu phù hợp với bạn, hãy trả lời một vài câu hỏi ngắn sau đây.',
          health: '🏃 Tôi sẽ hướng dẫn bạn đặt mục tiêu sức khỏe và lối sống lành mạnh. Để tạo mục tiêu phù hợp với bạn, hãy trả lời một vài câu hỏi ngắn sau đây.',
          relationships: '💕 Tôi sẽ hướng dẫn bạn manifest tình yêu và các mối quan hệ tốt đẹp. Để tạo mục tiêu phù hợp với bạn, hãy trả lời một vài câu hỏi ngắn sau đây.',
          personal: '✨ Tôi sẽ hướng dẫn bạn phát triển bản thân và nâng cao kỹ năng. Để tạo mục tiêu phù hợp với bạn, hãy trả lời một vài câu hỏi ngắn sau đây.',
          spiritual: '🙏 Tôi sẽ hướng dẫn bạn phát triển tâm thức và tìm thấy bình an nội tâm. Để tạo mục tiêu phù hợp với bạn, hãy trả lời một vài câu hỏi ngắn sau đây.',
        };

        // Default message if no specific area detected
        const defaultBrief = intentDetection.formType === 'affirmation'
          ? '✨ Tôi sẽ giúp bạn tạo câu khẳng định tích cực. Để tạo affirmation phù hợp với bạn, hãy trả lời một vài câu hỏi ngắn sau đây.'
          : '🎯 Tôi sẽ hướng dẫn bạn đặt mục tiêu hiệu quả. Để tạo mục tiêu phù hợp với bạn, hãy trả lời một vài câu hỏi ngắn sau đây.';

        const briefText = intentDetection.preSelectedArea
          ? briefMessages[intentDetection.preSelectedArea] || defaultBrief
          : defaultBrief;

        // Add AI brief message BEFORE showing form
        const briefMsg = {
          id: `brief_${Date.now()}`,
          type: 'assistant',
          text: briefText,
          timestamp: new Date().toISOString(),
          source: 'intent_brief',
        };
        setMessages((prev) => [...prev, briefMsg]);

        // Auto-scroll to show messages
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);

        // Show INLINE form after a small delay for better UX (gives user time to read brief)
        setTimeout(() => {
          setInlineFormState({
            visible: true,
            formType: intentDetection.formType,
            preSelectedArea: intentDetection.preSelectedArea,
            userInput: intentDetection.userInput,
          });
        }, 500);
        return; // Don't send to AI, show inline form instead
      }

      // Clear previous suggestions
      setSuggestedWidgets(null);
      setCrystalRec({ show: false, context: '' });
      setCurrentCourseRecommendation(null);
      setCurrentAffiliatePromo(null);
      setLastUserQuery(text);

      // Add user message
      const userMessage = {
        id: `user_${Date.now()}`,
        type: 'user',
        text,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Show typing indicator IMMEDIATELY for fast visual feedback
      setIsTyping(true);

      // Auto-scroll to bottom to show typing indicator (inverted list: offset 0 = bottom)
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 50);

      // Decrement quota (fire-and-forget - don't block response)
      if (user) {
        QuotaService.decrementQuota(user.id)
          .then(() => refreshQuota())
          .catch(err => console.warn('[GemMaster] Quota decrement error:', err));
      }

      // Get AI response with conversation history
      // ⚠️ CRITICAL: Pass current messages for context (10 recent messages)
      const currentMessages = [...messages, userMessage];
      const response = await generateResponse(text, currentMessages);

      // ========== INLINE PRODUCT RECOMMENDATIONS ==========
      // Only show products when EXPLICITLY relevant - NOT for every response
      // Skip product recommendations for questionnaire mode
      try {
        const combinedContext = `${text} ${response.text}`;
        const lowerContext = combinedContext.toLowerCase();
        const isQuestionnaireMode = response.mode === 'questionnaire' || response.isQuestionMessage;

        // STRICT keywords - only trigger for explicit mentions
        // Course keywords: Only when user asks about learning/courses (both mindset & trading)
        const courseKeywords = [
          // General course terms
          'khóa học', 'khoá học', 'course', 'học', 'muốn học', 'dạy tôi', 'hướng dẫn học', 'giáo trình',
          // Trading courses
          'học trading', 'học giao dịch', 'tier 1', 'tier 2', 'tier 3', 'tier1', 'tier2', 'tier3', 'starter',
          '11 triệu', '21 triệu', '68 triệu', '11m', '21m', '68m', 'harmonic', 'elliott', 'wyckoff', 'smc',
          'smart money', 'ai prediction', 'whale tracker',
          // Mindset courses
          '7 ngày', 'khai mở', 'tần số gốc', 'tần số', 'tình yêu', 'kích hoạt', '42 ngày', 'boss lady',
          'triệu phú', 'tư duy', 'millionaire', 'mindset', '49 ngày', 'chữa lành', 'năng lượng', 'hawkins',
          // Prices
          '299k', '399k', '499k',
        ];
        // Crystal keywords: Only when specifically asking about crystals/stones
        const crystalKeywords = ['thạch anh', 'crystal', 'đá phong thủy', 'gợi ý đá', 'đá nào', 'mua đá', 'tìm đá'];

        // Check if AI response explicitly recommends courses/crystals
        const aiRecommendsCourse = response.text?.includes('khóa học') && (
          response.text?.includes('đề xuất') ||
          response.text?.includes('gợi ý') ||
          response.text?.includes('nên tham gia')
        );
        const aiRecommendsCrystal = response.text?.includes('Đá phù hợp:') ||
          response.text?.includes('gợi ý đá') ||
          (response.scenario?.crystal && response.text?.includes(response.scenario.crystal));

        // Only show courses if user explicitly asks OR AI explicitly recommends
        // Course-related knowledge keys from gemKnowledge.json
        const courseKnowledgeKeys = [
          'courses_overview', 'courses_trading_overview', 'courses_mindset_overview',
          'course_7_days', 'course_love', 'course_millionaire',
          'course_starter', 'course_tier_1', 'course_tier_2', 'course_tier_3',
          'trading_tier_comparison', 'tier_2_vs_tier_1', 'frequency_formulas',
        ];
        const isCourseKnowledgeResponse = response.source === 'knowledge' && courseKnowledgeKeys.includes(response.knowledgeKey);

        const shouldShowCourses = !isQuestionnaireMode && (
          courseKeywords.some(kw => text.toLowerCase().includes(kw)) ||
          aiRecommendsCourse ||
          isCourseKnowledgeResponse
        );

        // Only show crystals if user explicitly asks OR AI explicitly recommends a specific crystal
        const shouldShowCrystals = !isQuestionnaireMode && (
          crystalKeywords.some(kw => text.toLowerCase().includes(kw)) ||
          aiRecommendsCrystal
        );

        // Fetch products from Shopify based on context
        let inlineProducts = [];

        if (shouldShowCourses) {
          console.log('[GemMaster] Fetching courses for inline display...');
          // Detect course type from context for smarter tag selection
          const lowerText = text.toLowerCase();
          const lowerResponse = (response.text || '').toLowerCase();
          const contextStr = lowerText + ' ' + lowerResponse;

          // Trading course keywords
          const isTradingCourse = ['trading', 'tier 1', 'tier 2', 'tier 3', 'tier1', 'tier2', 'tier3', 'starter',
            '11 triệu', '21 triệu', '68 triệu', 'pattern', 'scanner', 'crypto', 'bitcoin', 'harmonic', 'elliott',
            'wyckoff', 'smc', 'ai prediction', 'whale tracker', 'giao dịch', 'đầu tư'].some(kw => contextStr.includes(kw));

          // Mindset course keywords
          const isMindsetCourse = ['7 ngày', 'khai mở', 'tần số gốc', 'tình yêu', 'kích hoạt', '42 ngày',
            'triệu phú', 'tư duy', 'mindset', '49 ngày', 'chữa lành', 'năng lượng', 'hawkins', 'boss lady',
            '299k', '399k', '499k'].some(kw => contextStr.includes(kw));

          // Select appropriate tags based on context
          let courseTags = ['courses', 'khóa học', 'course'];
          if (isTradingCourse && !isMindsetCourse) {
            courseTags = ['trading', 'tier', 'scanner', 'crypto'];
          } else if (isMindsetCourse && !isTradingCourse) {
            courseTags = ['mindset', 'tần số', 'frequency', 'tư duy'];
          }

          console.log('[GemMaster] Course type:', isTradingCourse ? 'Trading' : isMindsetCourse ? 'Mindset' : 'General');
          const courses = await shopifyService.getProductsByTags(courseTags, 2, false);
          if (courses && courses.length > 0) {
            inlineProducts = [...inlineProducts, ...courses];
            console.log('[GemMaster] Added', courses.length, 'courses to inline products');
          }
        }

        if (shouldShowCrystals) {
          console.log('[GemMaster] Fetching crystals for inline display...');
          // Extract Shopify tags from context - prioritize specific crystal names
          const crystalTags = extractShopifyTags(combinedContext);
          const tagsToUse = crystalTags.length > 0 ? crystalTags : ['Bestseller'];
          const crystals = await shopifyService.getProductsByTags(tagsToUse, 2, true);
          if (crystals && crystals.length > 0) {
            const existingIds = inlineProducts.map(p => p.id);
            const newCrystals = crystals.filter(c => !existingIds.includes(c.id));
            inlineProducts = [...inlineProducts, ...newCrystals.slice(0, 2)];
            console.log('[GemMaster] Added', newCrystals.length, 'crystals to inline products');
          }
        }

        // Limit to max 3 inline products to keep bubble compact
        if (inlineProducts.length > 0) {
          response.products = inlineProducts.slice(0, 3);
          console.log('[GemMaster] Total inline products:', response.products.length);
        }
      } catch (productError) {
        console.warn('[GemMaster] Inline product fetch error:', productError);
      }
      // ====================================================

      setMessages((prev) => [...prev, response]);

      // Auto-scroll to show AI response (especially important for questionnaire flow)
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);

      // ===== WIDGET SUGGESTION SYSTEM (UNIFIED) =====
      // Only show ONE widget suggestion per conversation turn
      // Prioritize WidgetSuggestionCard (legacy) as it integrates with VisionBoard
      // Skip if user already has an active suggestion showing

      let widgetSuggestionShown = false;

      // Check if suggestion should be shown (avoid spam)
      const shouldShowWidgetSuggestion = () => {
        // Don't show if already showing a suggestion
        if (suggestedWidgets?.widgets?.length > 0) return false;
        if (widgetForm.visible) return false;
        return true;
      };

      // Check if this is a karma analysis result with healing suggestions
      const isKarmaAnalysisResult = response.scenario ||
        (response.text?.includes('Bài tập chữa lành') ||
         response.text?.includes('Affirmation:') ||
         response.text?.includes('KẾT QUẢ PHÂN TÍCH'));

      // Method 1: Use widgetFactoryService for VisionBoard integration
      try {
        if (user && shouldShowWidgetSuggestion()) {
          const result = await widgetFactoryService.createWidgetsFromResponse(
            response.text,
            text,
            user.id
          );

          if (result && result.widgets && result.widgets.length > 0) {
            console.log('[GemMaster] Widget suggestion:', result.detection?.type, result.widgets.length, 'widgets');
            setSuggestedWidgets({
              widgets: result.widgets,
              message: result.suggestionMessage || `Tôi có thể thêm ${result.widgets.length} widget vào Vision Board.`,
            });
            widgetSuggestionShown = true;
          }
        }
      } catch (widgetError) {
        console.warn('[GemMaster] Widget detection error:', widgetError);
      }

      // Method 2: Show widget suggestion from karma analysis result
      // If karma analysis contains healing/affirmation, suggest adding to VisionBoard as GOAL type
      if (!widgetSuggestionShown && isKarmaAnalysisResult && user && shouldShowWidgetSuggestion()) {
        try {
          console.log('[GemMaster] Karma analysis detected, showing widget suggestion');

          // Extract affirmations from the response (various formats)
          const affirmationMatch = response.text?.match(/Affirmation:\s*"([^"]+)"/g);
          let affirmations = affirmationMatch
            ? affirmationMatch.map(a => a.replace(/Affirmation:\s*"/, '').replace(/"$/, ''))
            : [];

          // Also try to extract affirmations from bullet points
          if (affirmations.length === 0) {
            const bulletMatch = response.text?.match(/[•✨]\s*([^\n]+)/g);
            if (bulletMatch) {
              const bulletAffirmations = bulletMatch
                .map(b => b.replace(/[•✨]\s*/, '').trim())
                .filter(b => b.toLowerCase().includes('tôi') || b.toLowerCase().includes('xứng đáng'));
              if (bulletAffirmations.length > 0) {
                affirmations = bulletAffirmations;
              }
            }
          }

          // Extract healing exercises as action steps
          const healingSteps = response.scenario?.healing || [];

          // Also try to extract numbered steps from response
          let actionSteps = healingSteps;
          if (actionSteps.length === 0) {
            const numberedMatch = response.text?.match(/\d+\.\s*([^\n]+)/g);
            if (numberedMatch) {
              actionSteps = numberedMatch.map(s => s.replace(/^\d+\.\s*/, '').trim()).slice(0, 5);
            }
          }

          // Create widget suggestion as GOAL type (includes affirmations + action plan)
          const karmaType = response.scenario?.type || response.topics?.[0] || 'general';
          const goalTitle = response.scenario?.title || 'Chữa Lành Năng Lượng';
          const widgetData = {
            type: 'goal', // Changed from 'affirmation' to 'goal'
            title: goalTitle,
            goalTitle: goalTitle,
            icon: KARMA_ICONS[karmaType] || 'Sparkles',
            affirmations: affirmations.length > 0 ? affirmations : healingSteps.slice(0, 3),
            steps: actionSteps.length > 0 ? actionSteps : healingSteps, // Include as action plan
            explanation: `Mục tiêu chữa lành ${goalTitle.toLowerCase()} với affirmations và kế hoạch hành động.`,
            lifeArea: karmaType,
            crystals: response.scenario?.crystal ? [response.scenario.crystal] : [],
          };

          console.log('[GemMaster] Creating goal widget with:', {
            type: widgetData.type,
            affirmationsCount: widgetData.affirmations?.length,
            stepsCount: widgetData.steps?.length,
          });

          setTimeout(() => {
            setWidgetForm({
              visible: true,
              widgetType: 'goal', // Changed from 'affirmation' to 'goal'
              extractedData: widgetData,
              title: widgetData.title,
            });
          }, 1000);
          widgetSuggestionShown = true;
        } catch (karmaWidgetError) {
          console.warn('[GemMaster] Karma widget suggestion error:', karmaWidgetError);
        }
      }

      // Method 2: Only use SmartFormCard if no suggestion shown yet
      // This is disabled to avoid duplicate suggestions
      // The widgetFactoryService above is the primary method
      /*
      try {
        if (!widgetSuggestionShown && user && shouldShowWidgetSuggestion()) {
          const widgetDetection = detectWidgetTrigger(response.text, text);
          if (widgetDetection.shouldShow) {
            console.log('[GemMaster] NEW Widget detection:', widgetDetection.widgetType);
            setTimeout(() => {
              setWidgetForm({
                visible: true,
                widgetType: widgetDetection.widgetType,
                extractedData: widgetDetection.extractedData,
                title: widgetDetection.title,
              });
            }, 1000);
            widgetSuggestionShown = true;
          }
        }
      } catch (newWidgetError) {
        console.warn('[GemMaster] NEW Widget detection error:', newWidgetError);
      }
      */

      // V4: Handle affiliate promotions from gemMasterService
      if (response.showAffiliate && response.affiliatePromo) {
        console.log('[GemMaster] Affiliate promo triggered');
        setCurrentAffiliatePromo(response.affiliatePromo);
      }

      // V4: Handle widget suggestion from gemMasterService (only if no other suggestion shown)
      // Disabled to prevent duplicate suggestions
      /*
      if (!widgetSuggestionShown && response.widgetSuggestion && user) {
        console.log('[GemMaster] V4 Widget suggestion:', response.widgetSuggestion.title);
        setTimeout(() => {
          setWidgetForm({
            visible: true,
            widgetType: response.widgetSuggestion.type,
            extractedData: response.widgetSuggestion,
            title: response.widgetSuggestion.title,
          });
        }, 1500);
      }
      */
      // No scroll needed - inverted FlatList auto-shows new content at bottom

      // Auto-save conversation after getting response
      if (user) {
        try {
          const allMessages = [...messages.filter(m => m.id !== 'welcome'), userMessage, response];
          if (currentConversationId) {
            await chatHistoryService.saveConversation(currentConversationId, allMessages, user.id);
          } else {
            const newConv = await chatHistoryService.createConversation(user.id, allMessages);
            setCurrentConversationId(newConv.id);
          }
        } catch (saveError) {
          console.warn('[GemMaster] Auto-save error:', saveError);
        }

        // ===== CHATBOT UPGRADE: Extract & Save Memories =====
        if (isFeatureEnabled(FEATURES.MEMORY_EXTRACTION)) {
          try {
            // Extract memories from conversation (background, don't block UI)
            userMemoryService.extractAndSaveMemories(
              user.id,
              text,
              response.text,
              response.category || 'general'
            ).then(memories => {
              if (memories?.length > 0) {
                console.log('[GemMaster] Extracted memories:', memories.length);
              }
            }).catch(err => {
              console.warn('[GemMaster] Memory extraction error:', err);
            });
          } catch (memError) {
            console.warn('[GemMaster] Memory extraction error:', memError);
          }
        }

        // ===== CHATBOT UPGRADE: Update Chat Streak =====
        if (isFeatureEnabled(FEATURES.GAMIFICATION)) {
          try {
            // Record chat activity for streak (background)
            streakService.recordActivity(user.id, 'chatbot').then(result => {
              if (result?.milestone) {
                console.log('[GemMaster] Streak milestone reached:', result.milestone);
                // Could show a celebration toast here
              }
            }).catch(err => {
              console.warn('[GemMaster] Streak update error:', err);
            });
          } catch (streakError) {
            console.warn('[GemMaster] Streak error:', streakError);
          }
        }
      }
    },
    [generateResponse, canQuery, user, refreshQuota, messages, currentConversationId, inlineFormState.visible]
  );

  // Handle quick action (from QuickActionBar)
  const handleQuickAction = useCallback((prompt) => {
    handleSend(prompt);
  }, [handleSend]);

  // Step 2: Process pendingPrompt after handleSend is available
  // This handles cross-navigation from VisionBoard with pre-filled prompts
  useEffect(() => {
    if (pendingPrompt && !isTyping && quota?.remaining !== undefined) {
      const canSend = quota?.unlimited || quota?.remaining > 0;
      if (canSend) {
        console.log('[GemMaster] Auto-sending pendingPrompt:', pendingPrompt);
        // Small delay to ensure screen is ready
        const timer = setTimeout(() => {
          handleSend(pendingPrompt);
          setPendingPrompt(null);
          // Reset flag so next navigation can trigger
          initialPromptProcessed.current = false;
        }, 600);
        return () => clearTimeout(timer);
      } else {
        // No quota - clear pending and show upgrade modal
        setPendingPrompt(null);
        initialPromptProcessed.current = false;
        setShowUpgradeModal(true);
      }
    }
  }, [pendingPrompt, isTyping, quota, handleSend]);

  // Handle sending I Ching/Tarot result to chat
  const handleSendResultToChat = useCallback((resultData) => {
    console.log('[GemMaster] Received divination result:', resultData?.type);

    // Handle both string (legacy) and object (new visual) format
    const isObject = typeof resultData === 'object' && resultData !== null;

    // Add result as assistant message with divination visual data
    const resultMessage = {
      id: `result_${Date.now()}`,
      type: 'assistant',
      text: isObject ? resultData.text : resultData,
      timestamp: new Date().toISOString(),
      source: 'divination',
      // Visual data for DivinationResultCard
      divinationType: isObject ? resultData.type : null, // 'iching' or 'tarot'
      hexagram: isObject ? resultData.hexagram : null,   // I Ching hexagram data
      cards: isObject ? resultData.cards : null,         // Tarot cards data
      interpretation: isObject ? resultData.interpretation : null,
      // Image data for display (NEW)
      imageUri: isObject ? resultData.imageUri : null,         // I Ching single image URI
      imageSource: isObject ? resultData.imageSource : null,   // I Ching require() source
      images: isObject ? resultData.images : null,             // Tarot array of image URIs
    };

    console.log('[GemMaster] Result message with images:', {
      type: resultMessage.divinationType,
      hasImageUri: !!resultMessage.imageUri,
      hasImageSource: !!resultMessage.imageSource,
      imagesCount: resultMessage.images?.length || 0,
    });

    setMessages((prev) => [...prev, resultMessage]);
    // No scroll needed - inverted FlatList auto-shows new content at bottom
  }, []);

  // Handle navigation from QuickActionBar
  const handleQuickNavigate = useCallback((screen) => {
    navigation.navigate(screen, {
      onSendToChat: handleSendResultToChat,
    });
  }, [navigation, handleSendResultToChat]);

  // NEW: Handle topic selection from QuickActionBar → show FAQ panel
  const handleTopicSelect = useCallback((topicId) => {
    console.log('[GemMaster] Topic selected:', topicId);
    // Dismiss keyboard first so FAQ panel shows properly
    Keyboard.dismiss();
    setFaqPanelState({
      visible: true,
      topicId,
    });
  }, []);

  // NEW: Handle FAQ question selection → process different action types
  const handleFAQQuestionSelect = useCallback(async (question) => {
    console.log('[GemMaster] FAQ question selected:', question.id, question.action);

    // Close the FAQ panel
    setFaqPanelState({ visible: false, topicId: null });

    // Process based on action type
    switch (question.action) {
      case 'message':
        // Simple message → send to AI
        if (question.prompt) {
          handleSend(question.prompt);
        }
        break;

      case 'message_crystal':
        // Message + crystal products → send to AI (products auto-attached)
        if (question.prompt) {
          handleSend(question.prompt);
        }
        break;

      case 'questionnaire':
        // Karma questionnaire → send trigger message to AI
        const karmaPrompt = question.karmaType === 'money'
          ? 'Phân tích nghiệp tiền bạc của tôi'
          : question.karmaType === 'love'
            ? 'Phân tích nghiệp tình yêu của tôi'
            : 'Phân tích nghiệp của tôi';
        handleSend(karmaPrompt);
        break;

      case 'inline_form':
        // Show inline form → goalSettingForm or InlineChatForm
        // NEW: Add user question and AI brief message first before showing form
        {
          // Add user message to show what they selected
          const userMsg = {
            id: `user_${Date.now()}`,
            type: 'user',
            text: question.text,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, userMsg]);

          // Determine brief message and form config based on form type
          let briefText = '';
          let formConfig = {
            visible: true,
            formType: 'goal',
            preSelectedArea: null,
            userInput: question.text,
          };

          if (question.formType === 'frequency_analysis') {
            briefText = '✨ Tôi sẽ giúp bạn phân tích tần số năng lượng của bạn. Để phân tích chính xác, tôi cần hỏi bạn một số câu hỏi ngắn về trạng thái hiện tại của bạn.';
            formConfig = {
              visible: true,
              formType: 'frequency',
              preSelectedArea: 'spiritual',
              userInput: 'Phân tích tần số năng lượng của tôi',
            };
          } else if (question.formType === 'goal_setting') {
            briefText = '🎯 Tuyệt vời! Tôi sẽ giúp bạn đặt mục tiêu hiệu quả. Để tạo mục tiêu phù hợp nhất, hãy trả lời một vài câu hỏi ngắn sau đây.';
            formConfig = {
              visible: true,
              formType: 'goal',
              preSelectedArea: null,
              userInput: question.text,
            };
          } else if (question.formType === 'manifest_wealth') {
            briefText = '💰 Tôi sẽ hướng dẫn bạn manifest tiền bạc và thịnh vượng. Để tạo mục tiêu manifest phù hợp với bạn, hãy trả lời một vài câu hỏi ngắn sau đây.';
            formConfig = {
              visible: true,
              formType: 'goal',
              preSelectedArea: 'finance',
              userInput: 'Manifest tiền bạc',
            };
          } else if (question.formType === 'manifest_love') {
            briefText = '💕 Tôi sẽ hướng dẫn bạn manifest tình yêu và mối quan hệ tốt đẹp. Để tạo mục tiêu manifest phù hợp với bạn, hãy trả lời một vài câu hỏi ngắn sau đây.';
            formConfig = {
              visible: true,
              formType: 'goal',
              preSelectedArea: 'relationships',
              userInput: 'Manifest tình yêu',
            };
          } else if (question.formType === 'crystal_match') {
            briefText = '💎 Tôi sẽ giúp bạn tìm loại đá thạch anh phù hợp nhất. Để đưa ra gợi ý chính xác, hãy trả lời một vài câu hỏi ngắn về nhu cầu của bạn.';
            formConfig = {
              visible: true,
              formType: 'crystal',
              preSelectedArea: null,
              userInput: 'Đá nào phù hợp với tôi?',
            };
          }

          // Add AI brief message
          const briefMsg = {
            id: `brief_${Date.now()}`,
            type: 'assistant',
            text: briefText,
            timestamp: new Date().toISOString(),
            source: 'faq_brief',
          };
          setMessages(prev => [...prev, briefMsg]);

          // Auto-scroll to show messages
          setTimeout(() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }, 100);

          // Show inline form after a small delay for better UX
          setTimeout(() => {
            setInlineFormState(formConfig);
          }, 500);
        }
        break;

      case 'courses_overview':
        // AI response + course products → send message that triggers course recommendation
        if (question.prompt) {
          handleSend(question.prompt);
        }
        break;

      case 'course_detail':
        // AI response + specific course → send message with course tags
        if (question.prompt) {
          handleSend(question.prompt);
        }
        break;

      case 'affiliate_info':
        // AI response + affiliate CTA → send message then show affiliate promo
        if (question.prompt) {
          handleSend(question.prompt);
        }
        // Show affiliate promo after a delay
        setTimeout(() => {
          setCurrentAffiliatePromo({
            type: 'affiliate_invitation',
            title: 'Trở thành Partner của Gemral',
            description: 'Kiếm thu nhập thụ động với hoa hồng 20-30% khi giới thiệu khóa học & sản phẩm.',
          });
        }, 2000);
        break;

      case 'navigate_ritual':
        // Brief message then navigate to ritual screen
        if (question.briefMessage) {
          // Add brief AI message first
          const briefMsg = {
            id: `brief_${Date.now()}`,
            type: 'assistant',
            text: question.briefMessage,
            timestamp: new Date().toISOString(),
            source: 'faq',
          };
          setMessages(prev => [...prev, briefMsg]);
        }
        // Navigate to ritual screen - rituals are in AccountStack, not VisionBoard
        setTimeout(() => {
          navigation.navigate('Account', {
            screen: question.screen || 'LetterToUniverseRitual',
          });
        }, 1000);
        break;

      case 'navigate_partnership':
        // Navigate directly to partnership registration
        navigation.navigate('AccountTab', {
          screen: 'PartnershipRegistration',
        });
        break;

      default:
        // Unknown action → just send as message
        if (question.prompt || question.text) {
          handleSend(question.prompt || question.text);
        }
        break;
    }
  }, [handleSend, navigation, setInlineFormState, setMessages, setCurrentAffiliatePromo]);

  // Navigate to I Ching
  const handleIChing = useCallback(() => {
    navigation.navigate('IChing', {
      onSendToChat: handleSendResultToChat,
    });
  }, [navigation, handleSendResultToChat]);

  // Navigate to Tarot
  const handleTarot = useCallback(() => {
    navigation.navigate('Tarot', {
      onSendToChat: handleSendResultToChat,
    });
  }, [navigation, handleSendResultToChat]);

  // Clear chat history
  const handleClearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    // Also clear gemMasterService conversation history
    gemMasterService.clearHistory();
  }, []);

  // Save current conversation to database
  const saveCurrentConversation = useCallback(async () => {
    if (!user) return null;

    // Filter out welcome message for storage
    const messagesToSave = messages.filter(m => m.id !== 'welcome');
    if (messagesToSave.length === 0) return null;

    setIsSaving(true);
    try {
      if (currentConversationId) {
        // Update existing conversation
        await chatHistoryService.saveConversation(
          currentConversationId,
          messagesToSave,
          user.id
        );
        return currentConversationId;
      } else {
        // Create new conversation
        const newConversation = await chatHistoryService.createConversation(
          user.id,
          messagesToSave
        );
        setCurrentConversationId(newConversation.id);
        return newConversation.id;
      }
    } catch (error) {
      console.error('[GemMaster] Error saving conversation:', error);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [user, messages, currentConversationId]);

  // Handle New Chat - auto-save current and start fresh
  const handleNewChat = useCallback(async () => {
    // Save current chat if has messages (> welcome message)
    if (messages.length > 1 && user) {
      await saveCurrentConversation();
    }

    // Create new conversation record
    if (user) {
      try {
        const newConversation = await chatHistoryService.createConversation(user.id, []);
        setCurrentConversationId(newConversation.id);
      } catch (error) {
        console.error('[GemMaster] Error creating new conversation:', error);
        setCurrentConversationId(null);
      }
    } else {
      setCurrentConversationId(null);
    }

    // Reset UI
    setMessages([WELCOME_MESSAGE]);
    gemMasterService.clearHistory();
    setSuggestedWidgets(null);
    setCrystalRec({ show: false, context: '' });
  }, [messages, user, saveCurrentConversation]);

  // Handle Open History
  const handleOpenHistory = useCallback(() => {
    // Save current before navigating
    if (messages.length > 1 && user) {
      saveCurrentConversation();
    }
    navigation.navigate('ChatHistory', {
      onLoadConversation: handleLoadConversation,
    });
  }, [navigation, messages, user, saveCurrentConversation]);

  // Handle loading a conversation from history
  const handleLoadConversation = useCallback(async (conversationId) => {
    try {
      const conversation = await chatHistoryService.loadConversation(conversationId);
      if (conversation && conversation.messages) {
        setCurrentConversationId(conversation.id);
        setMessages([WELCOME_MESSAGE, ...conversation.messages]);
        // Clear history - gemMasterService will sync from messages state when next message is sent
        gemMasterService.clearHistory();
      }
    } catch (error) {
      console.error('[GemMaster] Error loading conversation:', error);
      alertService.error('Lỗi', 'Không thể tải cuộc trò chuyện. Vui lòng thử lại.');
    }
  }, []);

  // ===== CHATBOT UPGRADE: Proactive Message Handlers =====
  const handleReadProactiveMessage = useCallback(async (message) => {
    if (!user?.id || !message?.id) return;

    try {
      await proactiveAIService.markMessageRead(message.id);
      setPendingProactiveMessages(prev =>
        prev.filter(m => m.id !== message.id)
      );
      console.log('[GemMaster] Proactive message read:', message.id);
    } catch (error) {
      console.warn('[GemMaster] Error marking message read:', error);
    }
  }, [user?.id]);

  const handleDismissProactiveMessage = useCallback(async (message) => {
    if (!user?.id || !message?.id) return;

    // Just remove from UI, mark as read in background
    setPendingProactiveMessages(prev =>
      prev.filter(m => m.id !== message.id)
    );

    proactiveAIService.markMessageRead(message.id).catch(err => {
      console.warn('[GemMaster] Error dismissing message:', err);
    });
  }, [user?.id]);

  const handleRespondToProactiveMessage = useCallback((message) => {
    // Add the proactive message as a system message, then let user respond
    const systemMessage = {
      id: `proactive_${message.id}`,
      type: 'assistant',
      text: `${message.title}\n\n${message.content}`,
      timestamp: new Date().toISOString(),
      source: 'proactive',
      proactiveType: message.message_type,
    };
    setMessages(prev => [...prev, systemMessage]);

    // Mark as read
    handleReadProactiveMessage(message);
  }, [handleReadProactiveMessage]);

  // Navigate to Rituals screen
  const handleNavigateToRituals = useCallback(() => {
    navigation.navigate('Rituals');
  }, [navigation]);

  // Navigate to Gamification screen
  const handleNavigateToGamification = useCallback(() => {
    navigation.navigate('Gamification');
  }, [navigation]);

  // Handle option selection from questionnaire buttons
  const handleOptionSelect = useCallback((option, messageId) => {
    console.log('[GemMaster] Option selected:', option.label, option.text);

    // Send the selected option as user's answer
    // Format: "A" or the option label
    handleSend(option.label);
  }, [handleSend]);

  // Handle feedback (thumbs up/down) for AI responses (Day 25)
  const handleMessageFeedback = useCallback((messageId, feedback) => {
    console.log('[GemMaster] Feedback received:', messageId, feedback);
    // Import and call the analytics service to track feedback
    // This is fire-and-forget - don't block the UI
    import('../../services/chatbotAnalyticsService').then(({ updateFeedback }) => {
      updateFeedback(messageId, feedback).catch(err => {
        console.warn('[GemMaster] Failed to save feedback:', err);
      });
    });
  }, []);

  // Handle rich response actions (Day 25) - checklist, quiz, affirmation, chart
  const handleRichAction = useCallback((actionType, data, message) => {
    console.log('[GemMaster] Rich action:', actionType, data);

    switch (actionType) {
      case 'checklist_toggle':
        // Update checklist item state locally
        console.log('[GemMaster] Checklist item toggled:', data.index);
        break;

      case 'checklist_complete':
        // Track completion, update karma
        console.log('[GemMaster] Checklist completed!');
        break;

      case 'quiz_answer':
        // Track quiz answer for analytics
        console.log('[GemMaster] Quiz answered:', data.index);
        break;

      case 'view_chart':
        // Navigate to scanner/chart screen
        console.log('[GemMaster] Navigate to chart:', data.symbol);
        navigation.navigate('Trading', {
          screen: 'ScannerMain',
          params: { symbol: data.symbol },
        });
        break;

      case 'affirmation_repeat':
        // Play affirmation audio or haptic
        console.log('[GemMaster] Repeat affirmation');
        break;

      case 'affirmation_save':
        // Save affirmation to Vision Board
        console.log('[GemMaster] Save affirmation:', data.text);
        if (user?.id) {
          import('../../services/gemMasterService').then(({ saveWidgetToVisionBoard }) => {
            saveWidgetToVisionBoard({
              type: 'affirmation',
              title: 'Câu khẳng định',
              affirmations: [data.text],
            }, user.id);
          });
        }
        break;

      case 'comparison_select':
        // User selected a tier from comparison
        console.log('[GemMaster] Tier selected:', data.index);
        navigation.navigate('UpgradeScreen');
        break;

      default:
        console.log('[GemMaster] Unknown rich action:', actionType);
    }
  }, [navigation, user?.id]);

  // Render message item with option selection handler and quick buy
  const renderMessage = useCallback(({ item }) => (
    <MessageBubble
      message={item}
      onOptionSelect={(option) => handleOptionSelect(option, item.id)}
      onQuickBuy={handleQuickBuy}
      onFeedback={handleMessageFeedback}
      onRichAction={handleRichAction}
    />
  ), [handleOptionSelect, handleQuickBuy, handleMessageFeedback, handleRichAction]);

  // Key extractor
  const keyExtractor = useCallback((item) => item.id, []);

  // Header component with tier badge and quota (inside FlatList)
  // NOTE: In inverted FlatList, ListFooterComponent appears at TOP
  const ListHeaderComponent = useCallback(
    () => (
      <View style={styles.listHeader}>
        {/* ===== CHATBOT UPGRADE: Personalized Greeting ===== */}
        {isFeatureEnabled(FEATURES.MEMORY) && user?.id && (
          <PersonalizedGreeting userId={user.id} />
        )}

        {/* Tier, Quota, and Gamification Row */}
        <View style={styles.statusRow}>
          <TierBadge tier={userTier} size="sm" />
          <QuotaIndicator quota={quota} size="sm" showResetTime />

          {/* Mini Streak Display - Tap to open Gamification */}
          {/* Show streak even when 0 to encourage users */}
          {isFeatureEnabled(FEATURES.GAMIFICATION) && gamificationSummary && (
            <TouchableOpacity onPress={handleNavigateToGamification}>
              <MiniStreak
                streak={gamificationSummary.currentStreak || 0}
                level={gamificationSummary.level || 1}
              />
            </TouchableOpacity>
          )}

          {/* Current Emotion Badge */}
          {isFeatureEnabled(FEATURES.EMOTION) && currentEmotion && (
            <EmotionBadge
              emotion={currentEmotion.primary}
              frequency={currentEmotion.frequency}
            />
          )}

          {/* WebSocket Connection Status - Only show in DEV mode (backend not deployed yet) */}
          {__DEV__ && (
            <ConnectionStatus
              isOnline={wsIsOnline}
              isConnected={wsIsConnected}
              statusText={getConnectionStatusText()}
              statusColor={getConnectionStatusColor()}
              queueSize={wsQueueSize}
              isSyncing={wsQueueSyncStatus?.status === 'started'}
              onReconnect={wsConnect}
            />
          )}
        </View>

        {/* ===== CHATBOT UPGRADE: Proactive Messages ===== */}
        {isFeatureEnabled(FEATURES.PROACTIVE) && pendingProactiveMessages.length > 0 && (
          <ProactiveMessageList
            messages={pendingProactiveMessages}
            onReadMessage={handleReadProactiveMessage}
            onDismissMessage={handleDismissProactiveMessage}
            style={{ marginVertical: SPACING.sm }}
          />
        )}

        {/* ===== CHATBOT UPGRADE: Ritual Status Banner ===== */}
        {isFeatureEnabled(FEATURES.RITUALS) && todayRituals && todayRituals.totalCount > 0 && (
          <TouchableOpacity
            style={styles.ritualBanner}
            onPress={handleNavigateToRituals}
            activeOpacity={0.7}
          >
            <View style={styles.ritualBannerContent}>
              <Text style={styles.ritualBannerText}>
                Nghi thức hôm nay: {todayRituals.completedCount}/{todayRituals.totalCount}
              </Text>
              <View style={styles.ritualProgressBar}>
                <View
                  style={[
                    styles.ritualProgressFill,
                    { width: `${(todayRituals.completedCount / todayRituals.totalCount) * 100}%` }
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Logo and Title */}
        <LinearGradient
          colors={GRADIENTS.gold}
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Sparkles size={28} color="#0F1030" />
        </LinearGradient>
        <Text style={styles.headerTitle}>Gem Master</Text>
        <Text style={styles.headerSubtitle}>AI Assistant & Spiritual Guide</Text>

        {/* Clear Chat Button */}
        {messages.length > 1 && (
          <View style={styles.clearButtonContainer}>
            <ClearChatButton onClear={handleClearChat} variant="text" />
          </View>
        )}

        {/* Sponsor Banners - shown at bottom of chat when scrolling up */}
        {sponsorBanners.length > 0 && (
          <View style={{ marginTop: SPACING.md }}>
            {sponsorBanners.map((banner) => (
              <SponsorBanner
                key={banner.id}
                banner={banner}
                navigation={navigation}
                userId={bannerUserId}
                onDismiss={dismissBanner}
                showActions={false}
              />
            ))}
          </View>
        )}
      </View>
    ),
    [userTier, quota, messages.length, handleClearChat, wsIsOnline, wsIsConnected, wsQueueSize, wsQueueSyncStatus, wsConnect, getConnectionStatusText, getConnectionStatusColor, sponsorBanners, bannerUserId, dismissBanner, navigation, user?.id, gamificationSummary, currentEmotion, pendingProactiveMessages, todayRituals, handleReadProactiveMessage, handleDismissProactiveMessage, handleNavigateToRituals, handleNavigateToGamification]
  );

  // Handle scroll event for showing scroll-to-bottom button ONLY
  // With INVERTED FlatList: contentOffset.y = 0 means at bottom (newest), high value = scrolled up (older)
  const handleScroll = useCallback((event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    // With inverted list, contentOffset.y > 0 means user scrolled UP to see older messages
    // Show button when user has scrolled up more than 100px from the newest messages
    const hasEnoughContent = contentSize.height > layoutMeasurement.height;
    const isScrolledUp = contentOffset.y > 100;
    setShowScrollButton(hasEnoughContent && isScrolledUp);
  }, []);

  // Scroll to bottom handler - with inverted list, "bottom" = offset 0
  const handleScrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  // Handle widget creation success
  const handleWidgetsCreated = useCallback((createdWidgets) => {
    console.log('[GemMaster] Widgets created:', createdWidgets?.length);
    setSuggestedWidgets(null);
    // Could show a success toast here
  }, []);

  // Handle showing inline form from WidgetSuggestionCard (for Crystal/Trading)
  const handleShowInlineForm = useCallback((formData) => {
    console.log('[GemMaster] Showing InlineChatForm:', formData);
    setSuggestedWidgets(null); // Close the suggestion card

    // Add brief message before showing form (if not already provided)
    if (!formData.skipBriefMessage) {
      const briefMessages = {
        finance: '💰 Tôi sẽ hướng dẫn bạn manifest tiền bạc và thịnh vượng. Để tạo mục tiêu phù hợp với bạn, hãy trả lời một vài câu hỏi ngắn sau đây.',
        career: '💼 Tôi sẽ hướng dẫn bạn đặt mục tiêu sự nghiệp. Để tạo mục tiêu phù hợp với bạn, hãy trả lời một vài câu hỏi ngắn sau đây.',
        health: '🏃 Tôi sẽ hướng dẫn bạn đặt mục tiêu sức khỏe. Để tạo mục tiêu phù hợp với bạn, hãy trả lời một vài câu hỏi ngắn sau đây.',
        relationships: '💕 Tôi sẽ hướng dẫn bạn manifest tình yêu và mối quan hệ tốt đẹp. Để tạo mục tiêu phù hợp với bạn, hãy trả lời một vài câu hỏi ngắn sau đây.',
        personal: '✨ Tôi sẽ hướng dẫn bạn phát triển bản thân. Để tạo mục tiêu phù hợp với bạn, hãy trả lời một vài câu hỏi ngắn sau đây.',
        spiritual: '🙏 Tôi sẽ hướng dẫn bạn phát triển tâm linh. Để tạo mục tiêu phù hợp với bạn, hãy trả lời một vài câu hỏi ngắn sau đây.',
        crystal: '💎 Tôi sẽ giúp bạn tìm loại đá thạch anh phù hợp nhất. Để đưa ra gợi ý chính xác, hãy trả lời một vài câu hỏi ngắn.',
        trading: '📈 Tôi sẽ giúp bạn đặt mục tiêu trading hiệu quả. Để tạo mục tiêu phù hợp với bạn, hãy trả lời một vài câu hỏi ngắn sau đây.',
      };

      const defaultBrief = '🎯 Để tạo mục tiêu phù hợp nhất với bạn, hãy trả lời một vài câu hỏi ngắn sau đây.';
      const briefText = briefMessages[formData.preSelectedArea] || briefMessages[formData.formType] || defaultBrief;

      const briefMsg = {
        id: `brief_widget_${Date.now()}`,
        type: 'assistant',
        text: briefText,
        timestamp: new Date().toISOString(),
        source: 'widget_brief',
      };
      setMessages((prev) => [...prev, briefMsg]);

      // Show form after brief delay
      setTimeout(() => {
        setInlineFormState({
          visible: true,
          formType: formData.formType || 'goal',
          preSelectedArea: formData.preSelectedArea,
          userInput: formData.userInput || '',
        });
      }, 400);
    } else {
      // Skip brief message (form will show immediately)
      setInlineFormState({
        visible: true,
        formType: formData.formType || 'goal',
        preSelectedArea: formData.preSelectedArea,
        userInput: formData.userInput || '',
      });
    }
  }, []);

  // Handler for course navigation
  const handleCoursePress = useCallback((course) => {
    if (course?.id) {
      navigation.navigate('CourseTab', {
        screen: 'CourseDetail',
        params: { courseId: course.id },
      });
    }
    setCurrentCourseRecommendation(null);
  }, [navigation]);

  // Handler for affiliate navigation
  const handleAffiliatePress = useCallback(() => {
    navigation.navigate('AccountTab', {
      screen: 'AffiliateDashboard',
    });
    setCurrentAffiliatePromo(null);
  }, [navigation]);

  // NEW: Handler for quick buy from crystal recommendations
  const handleQuickBuy = useCallback((product) => {
    console.log('[GemMaster] Quick buy product:', product?.title);
    setQuickBuyModal({
      visible: true,
      product,
    });
  }, []);

  // NEW: Handler for showing upsell modal after adding to cart
  const handleShowUpsell = useCallback((upsellData) => {
    console.log('[GemMaster] Show upsell:', upsellData?.upsells?.length, 'products');
    setUpsellModal({
      visible: true,
      upsellData,
    });
  }, []);

  // NEW: Handler for buy now (opens checkout after quick buy)
  const handleBuyNow = useCallback(async (purchaseData) => {
    console.log('[GemMaster] Buy now:', purchaseData?.product?.title);
    // If there are upsells, show upsell modal
    if (purchaseData?.upsells && purchaseData.upsells.length > 0) {
      setUpsellModal({
        visible: true,
        upsellData: {
          primaryProduct: purchaseData.product,
          upsells: purchaseData.upsells,
        },
      });
    } else {
      // No upsells, navigate to checkout directly
      navigation.navigate('Shop', {
        screen: 'Checkout',
      });
    }
  }, [navigation]);

  // NEW: Handler for checkout from upsell modal
  const handleCheckout = useCallback((checkoutUrl) => {
    console.log('[GemMaster] Opening checkout:', checkoutUrl);
    // Navigate to CheckoutWebView with the checkout URL
    navigation.navigate('Shop', {
      screen: 'Checkout',
      params: { checkoutUrl },
    });
  }, [navigation]);

  // NEW: Handler for continue shopping
  const handleContinueShopping = useCallback(() => {
    // Add success message to chat
    const successMessage = {
      id: `cart_success_${Date.now()}`,
      type: 'assistant',
      text: '🛒 Đã thêm sản phẩm vào giỏ hàng! Bạn có thể tiếp tục mua sắm hoặc thanh toán bất cứ lúc nào.',
      timestamp: new Date().toISOString(),
      source: 'cart',
    };
    setMessages(prev => [...prev, successMessage]);
  }, []);

  // Footer with typing indicator, inline form, widget suggestions, and crystal recommendations
  const ListFooterComponent = useCallback(
    () => (
      <View style={styles.footerContainer}>
        {/* Typing Indicator - shows when local or WebSocket typing */}
        {(isTyping || wsIsTyping) && <TypingIndicator />}

        {/* InlineChatForm - in chat form for goal setting */}
        {inlineFormState.visible && (
          <InlineChatForm
            visible={inlineFormState.visible}
            formType={inlineFormState.formType}
            preSelectedArea={inlineFormState.preSelectedArea}
            userInput={inlineFormState.userInput}
            onClose={() => {
              setInlineFormState({
                visible: false,
                formType: 'goal',
                preSelectedArea: null,
                userInput: null,
              });
            }}
            onResult={(result) => {
              console.log('[GemMaster] InlineChatForm result:', result);
              if (result?.success) {
                const successMessage = {
                  id: `goal_result_${Date.now()}`,
                  type: 'assistant',
                  text: `✅ Đã tạo ${result.widgets?.length || 0} mục tiêu vào Vision Board của bạn!`,
                  timestamp: new Date().toISOString(),
                  source: 'goal_form',
                };
                setMessages(prev => [...prev, successMessage]);
              }
              setInlineFormState({
                visible: false,
                formType: 'goal',
                preSelectedArea: null,
                userInput: null,
              });
            }}
          />
        )}

        {/* NEW: Centralized Templates - TemplateInlineForm */}
        {templateFormState.visible && templateFormState.templateId && (
          <TemplateInlineForm
            visible={templateFormState.visible}
            templateId={templateFormState.templateId}
            autoFillData={templateFormState.autoFillData}
            userTier={userTier}
            userRole={user?.role}
            userId={user?.id}
            onFocusChange={setTemplateFormFocused}
            onClose={() => {
              setTemplateFormFocused(false);
              setTemplateFormState({
                visible: false,
                templateId: null,
                autoFillData: {},
              });
            }}
            onResult={(result) => {
              console.log('[GemMaster] TemplateInlineForm result:', result);
              if (result?.success) {
                const hasGoal = result.goal;
                const hasJournal = result.journalEntry || result.journal;
                let successText = '';
                if (hasJournal && hasGoal) {
                  successText = `✅ Đã tạo nhật ký và mục tiêu thành công!`;
                } else if (hasJournal) {
                  successText = `✅ Đã lưu nhật ký của bạn!`;
                } else if (hasGoal) {
                  successText = `✅ Đã tạo mục tiêu vào Vision Board!`;
                } else {
                  successText = result.message || '✅ Đã lưu thành công!';
                }
                const successMessage = {
                  id: `template_result_${Date.now()}`,
                  type: 'assistant',
                  text: successText,
                  timestamp: new Date().toISOString(),
                  source: 'template_form',
                  // Action buttons for navigation (nested navigator)
                  actionButtons: hasGoal ? [
                    {
                      id: 'view_vision_board',
                      label: 'Xem mục tiêu',
                      icon: 'target',
                      action: 'navigate_nested',
                      tabName: 'Account',
                      screen: 'VisionBoard',
                      params: { scrollToSection: 'goals' },
                    },
                  ] : hasJournal ? [
                    {
                      id: 'view_calendar',
                      label: 'Xem Calendar',
                      icon: 'calendar',
                      action: 'navigate_nested',
                      tabName: 'Account',
                      screen: 'VisionBoard',
                      params: { scrollToSection: 'calendar' },
                    },
                  ] : [],
                };
                setMessages(prev => [...prev, successMessage]);
              }
              setTemplateFormFocused(false);
              setTemplateFormState({
                visible: false,
                templateId: null,
                autoFillData: {},
              });
            }}
          />
        )}

        {/* NEW V4: SmartFormCardNew - Widget suggestion from gemMasterService */}
        {widgetForm.visible && widgetForm.extractedData && (
          <SmartFormCardNew
            widget={widgetForm.extractedData}
            onDismiss={() => {
              setWidgetForm({ visible: false, widgetType: null, extractedData: null, title: '' });
            }}
          />
        )}

        {/* Widget Suggestion Card - Day 17-19 (legacy) */}
        {suggestedWidgets && suggestedWidgets.widgets?.length > 0 && user && (
          <WidgetSuggestionCard
            widgets={suggestedWidgets.widgets}
            suggestionMessage={suggestedWidgets.message}
            userId={user.id}
            onWidgetsCreated={handleWidgetsCreated}
            onDismiss={() => setSuggestedWidgets(null)}
            onShowInlineForm={handleShowInlineForm}
          />
        )}

        {/* NOTE: Product/Crystal recommendations are now shown INSIDE MessageBubble */}
        {/* Removed external recommendations to avoid duplication */}

        {/* Bottom spacing for tab bar - minimal */}
        <View style={{ height: 20 }} />
      </View>
    ),
    [isTyping, wsIsTyping, inlineFormState, templateFormState, userTier, widgetForm, suggestedWidgets, user, handleWidgetsCreated, handleShowInlineForm]
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Fixed Top Header - Always visible */}
        <View style={styles.fixedHeader}>
          {/* History Button */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleOpenHistory}
            activeOpacity={0.7}
          >
            <Clock size={18} color={COLORS.gold} />
          </TouchableOpacity>

          {/* Title in center */}
          <Text style={styles.fixedHeaderTitle}>Gem Master</Text>

          {/* New Chat Button */}
          <TouchableOpacity
            style={[
              styles.headerButton,
              styles.newChatButton,
              messages.length <= 1 && styles.headerButtonDisabled,
            ]}
            onPress={handleNewChat}
            disabled={messages.length <= 1 || isSaving}
            activeOpacity={0.7}
          >
            <Plus size={18} color={messages.length > 1 ? COLORS.gold : COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Smart Triggers Banner (Day 25) - proactive AI engagement */}
        {smartTrigger && (
          <SmartSuggestionBanner
            trigger={smartTrigger}
            onDismiss={dismissSmartTrigger}
            onAction={(action, trigger) => {
              // Handle the action
              handleSmartTriggerAction(action, trigger);

              // Navigate based on action type
              const actionType = typeof action === 'string' ? action : action?.type;
              console.log('[GemMaster] Smart trigger action:', actionType);

              switch (actionType) {
                case 'SUGGEST_PAPER_TRADE':
                  navigation.navigate('Scanner');
                  break;
                case 'SUGGEST_UPGRADE':
                  navigation.navigate('Subscription');
                  break;
                case 'WELCOME_BACK':
                  // Navigate to VisionBoard for returning users
                  navigation.navigate('VisionBoard');
                  break;
                case 'SUGGEST_HEALING':
                  // Send a message to start healing meditation
                  handleSend('Tôi muốn thực hành thiền phục hồi năng lượng.');
                  break;
                case 'SUGGEST_DEEP_DIVE':
                  // Focus on the topic they're interested in
                  if (trigger?.stats?.mostAskedTopic) {
                    handleSend(`Tôi muốn tìm hiểu sâu hơn về ${trigger.stats.mostAskedTopic}`);
                  }
                  break;
                case 'CELEBRATE':
                case 'CELEBRATE_FIRST_WIN':
                  // Just acknowledge, no navigation needed
                  break;
                default:
                  // For any other action type with message
                  if (action?.message) {
                    handleSend(action.message);
                  }
                  break;
              }
            }}
          />
        )}

        {/* Chat Messages Container */}
        <View style={styles.chatContainer}>
          {/* Chat Messages - INVERTED for instant bottom display like Messenger */}
          <FlatList
            ref={flatListRef}
            data={[...messages].reverse()}
            renderItem={renderMessage}
            keyExtractor={keyExtractor}
            inverted={true}
            ListHeaderComponent={ListFooterComponent}
            ListFooterComponent={ListHeaderComponent}
            contentContainerStyle={[
              styles.messagesContent,
              {
                // Khi keyboard mở, cần thêm padding để scroll được đến cuối tin nhắn
                paddingTop: keyboardVisible
                  ? keyboardHeight + CHAT_CONTENT_KEYBOARD_PADDING
                  : CHAT_CONTENT_BOTTOM_PADDING
              }
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={handleScroll}
            scrollEventThrottle={100}
            removeClippedSubviews={false}
            maxToRenderPerBatch={10}
            windowSize={10}
          />

          {/* Scroll to Bottom Button - positioned above input area (smaller) */}
          {showScrollButton && (
            <View style={[styles.scrollToBottomButton, { bottom: keyboardVisible ? keyboardHeight + SCROLL_BUTTON_KEYBOARD_OFFSET : SCROLL_BUTTON_BOTTOM_CLOSED }]}>
              <TouchableOpacity
                style={styles.scrollToBottomButtonInner}
                onPress={handleScrollToBottom}
                activeOpacity={0.8}
              >
                <ChevronDown size={18} color={COLORS.gold} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Upgrade Modal - with Shopify checkout flow */}
        <ChatbotPricingModal
          visible={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          quota={quota}
          currentTier={userTier}
        />

        {/* SmartFormCard - for user to fill in forms */}
        <SmartFormCard
          visible={showSmartForm}
          widgetType={smartFormType}
          initialData={smartFormData}
          onSave={(formResult) => {
            console.log('[GemMaster] SmartFormCard saved:', formResult);
            // Add form result as a message to show user
            const formMessage = {
              id: `form_${Date.now()}`,
              type: 'assistant',
              text: `Đã lưu ${formResult.type} vào Dashboard của bạn!`,
              timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, formMessage]);
            setShowSmartForm(false);
            setSmartFormType(null);
            setSmartFormData({});
          }}
          onCancel={() => {
            setShowSmartForm(false);
            setSmartFormType(null);
            setSmartFormData({});
          }}
          onNavigateToShop={(handle) => {
            navigation.navigate('ShopTab', {
              screen: 'ProductDetail',
              params: { handle },
            });
          }}
        />

        {/* NEW: Goal Setting Form - interactive form instead of text chat */}
        <GoalSettingForm
          visible={goalFormState.visible}
          formType={goalFormState.formType}
          preSelectedArea={goalFormState.preSelectedArea}
          userInput={goalFormState.userInput}
          onClose={() => setGoalFormState({ visible: false, formType: 'goal', preSelectedArea: null, userInput: null })}
          onResult={(result) => {
            console.log('[GemMaster] GoalSettingForm result:', result);
            // Add success message to chat
            if (result?.success) {
              const successMessage = {
                id: `goal_result_${Date.now()}`,
                type: 'assistant',
                text: `Đã tạo ${result.widgets?.length || 0} widgets vào Vision Board của bạn!\n\n${result.analysis || ''}`,
                timestamp: new Date().toISOString(),
                source: 'goal_form',
              };
              setMessages(prev => [...prev, successMessage]);
            }
            setGoalFormState({ visible: false, formType: 'goal', preSelectedArea: null, userInput: null });
          }}
        />

        {/* NEW: Quick Buy Modal for crystal purchase from chat */}
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

        {/* NEW: Binance-style FAQ Panel - slides up from bottom */}
        <FAQPanel
          visible={faqPanelState.visible}
          topicId={faqPanelState.topicId}
          onClose={() => setFaqPanelState({ visible: false, topicId: null })}
          onSelectQuestion={handleFAQQuestionSelect}
        />

        {/* ===== CHATBOT UPGRADE: Crisis Support Alert ===== */}
        {showCrisisAlert && crisisInfo && (
          <View style={styles.crisisOverlay}>
            <View style={styles.crisisModal}>
              <Text style={styles.crisisTitle}>Chúng tôi quan tâm đến bạn</Text>
              <Text style={styles.crisisMessage}>
                {crisisInfo.message || 'Nếu bạn đang trải qua thời điểm khó khăn, xin đừng ngại tìm kiếm sự hỗ trợ.'}
              </Text>
              <View style={styles.crisisHotline}>
                <Text style={styles.crisisHotlineLabel}>Đường dây nóng hỗ trợ:</Text>
                <Text style={styles.crisisHotlineNumber}>1800 599 920</Text>
                <Text style={styles.crisisHotlineNote}>(Miễn phí, 24/7)</Text>
              </View>
              <TouchableOpacity
                style={styles.crisisCloseButton}
                onPress={() => {
                  setShowCrisisAlert(false);
                  setCrisisInfo(null);
                }}
              >
                <Text style={styles.crisisCloseText}>Tôi hiểu</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </SafeAreaView>

      {/* Bottom Input Area - OUTSIDE SafeAreaView for proper absolute positioning */}
      {/* Hide when template form is focused to give more space */}
      {!templateFormFocused && (
        <Animated.View style={[
          styles.bottomInputAreaAbsolute,
          { bottom: keyboardHeightAnim }
        ]}>
          {/* Quick Action Bar - Always visible (sticky above input) */}
          <QuickActionBar
            onAction={handleQuickAction}
            onNavigate={handleQuickNavigate}
            onTopicSelect={handleTopicSelect}
            disabled={!canQuery()}
          />

          {/* Chat Input with Voice (Day 11-12) + Offline Indicator (PHASE 1C) */}
          <ChatInput
            onSend={handleSend}
            disabled={isTyping || !canQuery()}
            placeholder={
              !canQuery()
                ? 'Hết lượt hỏi hôm nay...'
                : 'Nhập tin nhắn...'
            }
            // Voice props
            voiceEnabled={true}
            voiceQuota={voiceQuota}
            onVoiceRecordingStart={handleVoiceRecordingStart}
            onVoiceRecordingStop={handleVoiceRecordingStop}
            onVoiceQuotaPress={handleVoiceQuotaPress}
            onVoiceError={handleVoiceError}
            // Offline props (PHASE 1C)
            isOffline={!wsIsOnline}
            queueSize={wsQueueSize}
          />

          {/* Quota Status Compact (Bottom) - Using new UpgradeBanner */}
          {!canQuery() && (
            <UpgradeBanner
              triggerType="quota_reached"
              tierType="chatbot"
              variant="compact"
              title="Hết lượt hỏi hôm nay"
              subtitle="Nâng cấp để chat không giới hạn"
              ctaText="Nâng cấp"
              source="gem_master_chat"
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          )}
        </Animated.View>
      )}
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
  keyboardView: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  // Fixed header at top - always visible
  fixedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  fixedHeaderTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    letterSpacing: 0.5,
  },
  // List header (inside FlatList)
  listHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatButton: {
    borderColor: COLORS.gold,
  },
  headerButtonDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  clearButtonContainer: {
    marginTop: SPACING.md,
  },
  messagesContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 16, // Reduced padding
  },
  footerContainer: {
    paddingHorizontal: 4,
  },
  bottomInputArea: {
    // Stacks QuickActionBar + ChatInput vertically
    backgroundColor: COLORS.bgDeep || '#0A0F1C',
    // paddingBottom is applied dynamically based on keyboard state
  },
  bottomInputAreaAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: INPUT_AREA_BACKGROUND, // Xem constants/gemMasterLayout.js
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
  },
  quotaExhaustedBanner: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  quotaExhaustedText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
  },
  // Scroll to bottom button container - positioned above input area
  scrollToBottomButton: {
    position: 'absolute',
    right: SPACING.md,
    // bottom is set dynamically based on keyboard state
    zIndex: 10,
  },
  // Scroll to bottom button inner (touchable) - smaller size
  scrollToBottomButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgMid,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },

  // ===== CHATBOT UPGRADE STYLES =====

  // Ritual Banner
  ritualBanner: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    width: '100%',
  },
  ritualBannerContent: {
    alignItems: 'center',
  },
  ritualBannerText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  ritualProgressBar: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  ritualProgressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },

  // Crisis Support Modal
  crisisOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  crisisModal: {
    backgroundColor: COLORS.bgMid,
    borderRadius: 20,
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    alignItems: 'center',
    maxWidth: 350,
  },
  crisisTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  crisisMessage: {
    fontSize: 15,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  crisisHotline: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    width: '100%',
  },
  crisisHotlineLabel: {
    fontSize: 12,
    color: '#A0A0A0',
    marginBottom: 4,
  },
  crisisHotlineNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B6B',
    letterSpacing: 1,
  },
  crisisHotlineNote: {
    fontSize: 11,
    color: '#808080',
    marginTop: 4,
  },
  crisisCloseButton: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  crisisCloseText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gold,
  },
});

export default GemMasterScreen;
