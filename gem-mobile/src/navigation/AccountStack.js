/**
 * GEM Mobile - Account Stack Navigator (Tài Sản Tab)
 * Navigation stack for Account/Profile related screens
 * WITH Creator Tools: Wallet, Earnings, SoundLibrary
 *
 * UPDATED: AccountScreen is now the main hub with UI merged from AssetsHomeScreen:
 * - Stats Cards (Gems, Thu nhập, Affiliate)
 * - Admin Panel with Magenta theme
 * - Action Cards Grid
 * - Profile Header + Stats Row
 * - Dashboard Widgets
 * - Orders, Courses, Affiliate, Settings sections
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Main Account Screen (Hub) - Merged with AssetsHomeScreen UI
import AccountScreen from '../screens/tabs/AccountScreen';

// Sub-screens
import AffiliateDetailScreen from '../screens/Account/AffiliateDetailScreen';
import PortfolioScreen from '../screens/Account/PortfolioScreen';
import TierUpgradeScreen from '../screens/Account/TierUpgradeScreen';
import { UpgradeScreen, TierDetailScreen } from '../screens/Upgrade';
import PaperTradeHistoryScreen from '../screens/Account/PaperTradeHistoryScreen';
import ProfileSettingsScreen from '../screens/Account/ProfileSettingsScreen';
import NotificationSettingsScreen from '../screens/Account/NotificationSettingsScreen';
import HelpSupportScreen from '../screens/Account/HelpSupportScreen';
import TermsScreen from '../screens/Account/TermsScreen';

// Help Center Screens
import {
  HelpCenterScreen,
  HelpCategoryScreen,
  HelpArticleScreen,
  AffiliateWelcomeScreen,
  MarketingKitsScreen,
} from '../screens/Help';

// Partnership Screens
import PartnershipRegistrationScreen from '../screens/Account/PartnershipRegistrationScreen';
import WithdrawRequestScreen from '../screens/Account/WithdrawRequestScreen';

// Affiliate Dashboard
import AffiliateScreen from '../screens/Affiliate/AffiliateScreen';

// NEW: Creator Tools Screens
import WalletScreen from '../screens/Wallet/WalletScreen';
import BuyGemsScreen from '../screens/Wallet/BuyGemsScreen';
import TransactionHistoryScreen from '../screens/Wallet/TransactionHistoryScreen';
import GiftCatalogScreen from '../screens/Wallet/GiftCatalogScreen';
import GiftHistoryScreen from '../screens/Wallet/GiftHistoryScreen';
import GemPurchaseSuccessScreen from '../screens/Wallet/GemPurchaseSuccessScreen';
import GemPurchasePendingScreen from '../screens/Wallet/GemPurchasePendingScreen';
import EarningsScreen from '../screens/Creator/EarningsScreen';
import EarningsHistoryScreen from '../screens/Creator/EarningsHistoryScreen';
import WithdrawScreen from '../screens/Creator/WithdrawScreen';
import WithdrawalHistoryScreen from '../screens/Creator/WithdrawalHistoryScreen';
import SoundLibraryScreen from '../screens/Sounds/SoundLibraryScreen';
import UploadSoundScreen from '../screens/Sounds/UploadSoundScreen';
import BoostedPostsScreen from '../screens/Account/BoostedPostsScreen';

// Privacy & Social Screens
import PrivacySettingsScreen from '../screens/Account/PrivacySettingsScreen';
import CloseFriendsScreen from '../screens/Account/CloseFriendsScreen';
import SavedPostsScreen from '../screens/Account/SavedPostsScreen';

// Sound & Monetization Screens
import SoundDetailScreen from '../screens/Sounds/SoundDetailScreen';
import BoostPostScreen from '../screens/Monetization/BoostPostScreen';
import BoostAnalyticsScreen from '../screens/Monetization/BoostAnalyticsScreen';
import SelectPostForBoostScreen from '../screens/Monetization/SelectPostForBoostScreen';

// Admin Screens
import {
  AdminDashboardScreen,
  AdminApplicationsScreen,
  AdminWithdrawalsScreen,
  AdminUsersScreen,
  AdminReportsScreen,
  AdminNotificationsScreen,
  AdminSponsorBannersScreen,
  AdminShopBannersScreen,
  // Auto-Post & Content Calendar
  ContentCalendarScreen,
  ContentEditorScreen,
  AutoPostLogsScreen,
  PlatformSettingsScreen,
  // Seed Content & AI Bot
  AdminSeedContentScreen,
  // Gift Catalog Management
  AdminGiftCatalogScreen,
  // Content Hub & Push Notifications (Phase 7)
  ContentDashboardScreen,
  PushEditorScreen,
  TemplateLibraryScreen,
  ContentAnalyticsScreen,
  // Subscription Expiration Management
  AdminExpiringUsersScreen,
  AdminExpirationLogsScreen,
  // Sticker Management
  AdminStickerPacksScreen,
  AdminStickerUploadScreen,
  // Course Highlights Management
  AdminCourseHighlightsScreen,
  // Upgrade Management
  AdminUpgradeScreen,
} from '../screens/Admin';

// User Management Screens (Phase B.1)
import UserManagementScreen from '../screens/Admin/UserManagementScreen';
import UserDetailScreen from '../screens/Admin/UserDetailScreen';

// Revenue Dashboard (Phase B.2)
import RevenueDashboardScreen from '../screens/Admin/RevenueDashboardScreen';

// Support Tickets (Phase B.3)
import SupportTicketsScreen from '../screens/Admin/SupportTicketsScreen';
import TicketDetailScreen from '../screens/Admin/TicketDetailScreen';
import CreateTicketScreen from '../screens/Help/CreateTicketScreen';

// Checkout WebView (for UpgradeScreen navigation from modal)
import CheckoutWebView from '../screens/Shop/CheckoutWebView';

// VisionBoard Screens
import {
  VisionBoardScreen,
  AchievementsScreen,
  CalendarScreen,
  GoalDetailScreen,
  AllGoalsScreen,
  DailyRecapScreen,
  RitualPlaygroundScreen,
  RitualHistoryScreen,
  // Calendar & Journal Screens (Smart Journal)
  JournalEntryScreen,
  TradingJournalScreen,
  CalendarSettingsScreen,
  EditEventScreen,
  JournalDetailScreen,
  // New Ritual Screens (Vision Board 2.0 - Cosmic Glassmorphism)
  HeartExpansionRitual,
  GratitudeFlowRitual,
  CleansingBreathRitual,
  WaterManifestRitual,
  LetterToUniverseRitual,
  BurnReleaseRitual,
  StarWishRitual,
  CrystalHealingRitual,
} from '../screens/VisionBoard';

// Gem Economy Screens
import GemPackListScreen from '../screens/Gems/GemPackListScreen';
import DailyCheckinScreen from '../screens/Gems/DailyCheckinScreen';

// Admin Course Screens
import {
  CourseListScreen,
  CourseBuilderScreen,
  ModuleBuilderScreen,
  LessonBuilderScreen,
  QuizBuilderScreen,
  GrantAccessScreen,
  CourseStudentsScreen,
  CoursePreviewScreen,
  StudentProgressScreen,
  CourseAnalyticsScreen,
} from '../screens/Admin/Courses';

// Profile Screens - Follow System (Issue 29-31)
import FollowersListScreen from '../screens/Profile/FollowersListScreen';
import FollowingListScreen from '../screens/Profile/FollowingListScreen';

// Full Profile Screen
import ProfileFullScreen from '../screens/tabs/ProfileFullScreen';

// Order Tracking Screens (V3)
import OrdersScreen from '../screens/Orders/OrdersScreen';
import OrderDetailScreen from '../screens/Orders/OrderDetailScreen';
import LinkOrderScreen from '../screens/Orders/LinkOrderScreen';

// Karma Dashboard Screen
import { KarmaDashboardScreen } from '../screens/Karma';

// Shadow Mode Screens
import {
  ShadowModeScreen,
  ConnectBinanceScreen,
  ShadowReportScreen,
} from '../screens/ShadowMode';

// Livestream Screens (AI Avatar Livestream)
import { LivestreamViewerScreen, LivestreamListScreen } from '../screens/Livestream';

// Livestream Admin Screens
import { AdminLivestreamScreen, AnalyticsDashboardScreen } from '../screens/Admin';

// Partnership Admin Screens (Phase 4-5)
import { AdminPartnershipDashboard, AdminApplicationDetail, AdminPartnersScreen, AdminPartnerResourcesScreen } from '../screens/Admin';

// Waitlist Leads Admin Screen
import { WaitlistLeadsScreen } from '../screens/Admin';

// Instructor Management Admin Screen
import { AdminInstructorsScreen } from '../screens/Admin';

// Exchange Affiliate Screens
import {
  ExchangeOnboardingScreen,
  ExchangeAccountsScreen,
  APIConnectionScreen,
} from '../screens/Exchange';

// Exchange Affiliate Admin Screen
import AffiliateExchangeAdminScreen from '../screens/Admin/AffiliateExchangeAdminScreen';

// Settings Screens (Language, Currency, Theme)
import {
  SettingsScreen,
  LanguageSettingsScreen,
  ThemeSettingsScreen,
  CurrencySettingsScreen,
  AboutScreen,
} from '../screens/Settings';

// ROI Proof System - Personal Insights
import PersonalInsightsScreen from '../screens/Portfolio/PersonalInsightsScreen';

const Stack = createNativeStackNavigator();

export default function AccountStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main Account Screen (Hub) - Merged with AssetsHomeScreen UI */}
      <Stack.Screen name="AssetsHome" component={AccountScreen} />

      {/* Affiliate Detail */}
      <Stack.Screen name="AffiliateDetail" component={AffiliateDetailScreen} />

      {/* Portfolio Management */}
      <Stack.Screen name="Portfolio" component={PortfolioScreen} />

      {/* Paper Trade History */}
      <Stack.Screen name="PaperTradeHistory" component={PaperTradeHistoryScreen} />

      {/* Tier Upgrade */}
      <Stack.Screen name="TierUpgrade" component={TierUpgradeScreen} />

      {/* Upgrade Screen - New Unified Upgrade Flow */}
      <Stack.Screen
        name="UpgradeScreen"
        component={UpgradeScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />

      {/* Tier Detail Screen */}
      <Stack.Screen
        name="TierDetail"
        component={TierDetailScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      {/* Checkout WebView - For UpgradeScreen Learn More */}
      <Stack.Screen
        name="CheckoutWebView"
        component={CheckoutWebView}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      {/* Profile Settings */}
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />

      {/* Notification Settings */}
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />

      {/* Settings (Language, Currency, Theme) */}
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
      <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} />
      <Stack.Screen name="CurrencySettings" component={CurrencySettingsScreen} />
      <Stack.Screen name="AboutSettings" component={AboutScreen} />

      {/* Help & Support */}
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />

      {/* Help Center */}
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="HelpCategory" component={HelpCategoryScreen} />
      <Stack.Screen name="HelpArticle" component={HelpArticleScreen} />

      {/* Affiliate Welcome */}
      <Stack.Screen name="AffiliateWelcome" component={AffiliateWelcomeScreen} />

      {/* Marketing Kits */}
      <Stack.Screen name="MarketingKits" component={MarketingKitsScreen} />

      {/* Vision Board - Goals & Affirmations (2.0 Redesign) */}
      <Stack.Screen name="VisionBoard" component={VisionBoardScreen} />
      {/* New screens for Vision Board 2.0 detail views */}
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="VisionCalendar" component={CalendarScreen} />
      <Stack.Screen name="GoalDetail" component={GoalDetailScreen} />
      <Stack.Screen name="AllGoals" component={AllGoalsScreen} />
      <Stack.Screen name="DailyRecap" component={DailyRecapScreen} />

      {/* Calendar & Journal Screens (Smart Journal) */}
      <Stack.Screen name="JournalEntry" component={JournalEntryScreen} />
      <Stack.Screen name="JournalDetail" component={JournalDetailScreen} />
      <Stack.Screen name="TradingJournal" component={TradingJournalScreen} />
      <Stack.Screen name="CalendarSettings" component={CalendarSettingsScreen} />
      <Stack.Screen name="EditEvent" component={EditEventScreen} />

      {/* Ritual Playground Screens */}
      <Stack.Screen
        name="RitualPlayground"
        component={RitualPlaygroundScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="RitualHistory" component={RitualHistoryScreen} />

      {/* ═══════════════════════════════════════════ */}
      {/* NEW RITUAL SCREENS (Vision Board 2.0) */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen
        name="HeartExpansionRitual"
        component={HeartExpansionRitual}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="GratitudeFlowRitual"
        component={GratitudeFlowRitual}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="CleansingBreathRitual"
        component={CleansingBreathRitual}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="WaterManifestRitual"
        component={WaterManifestRitual}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="LetterToUniverseRitual"
        component={LetterToUniverseRitual}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="BurnReleaseRitual"
        component={BurnReleaseRitual}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="StarWishRitual"
        component={StarWishRitual}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="CrystalHealingRitual"
        component={CrystalHealingRitual}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />

      {/* Affiliate Dashboard */}
      <Stack.Screen name="AffiliateDashboard" component={AffiliateScreen} />

      {/* Terms & Privacy */}
      <Stack.Screen name="Terms" component={TermsScreen} />

      {/* Partnership Registration */}
      <Stack.Screen name="PartnershipRegistration" component={PartnershipRegistrationScreen} />

      {/* Withdraw Request */}
      <Stack.Screen name="WithdrawRequest" component={WithdrawRequestScreen} />

      {/* ═══════════════════════════════════════════ */}
      {/* CREATOR TOOLS SCREENS */}
      {/* ═══════════════════════════════════════════ */}

      {/* Wallet & Gems */}
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="BuyGems" component={BuyGemsScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <Stack.Screen name="GiftCatalog" component={GiftCatalogScreen} />
      <Stack.Screen name="GiftHistory" component={GiftHistoryScreen} />
      <Stack.Screen name="GemPurchaseSuccess" component={GemPurchaseSuccessScreen} />
      <Stack.Screen name="GemPurchasePending" component={GemPurchasePendingScreen} />

      {/* ═══════════════════════════════════════════ */}
      {/* GEM ECONOMY SCREENS */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen name="GemPackList" component={GemPackListScreen} />
      <Stack.Screen name="DailyCheckin" component={DailyCheckinScreen} />

      {/* Creator Earnings */}
      <Stack.Screen name="Earnings" component={EarningsScreen} />
      <Stack.Screen name="EarningsHistory" component={EarningsHistoryScreen} />
      <Stack.Screen name="Withdraw" component={WithdrawScreen} />
      <Stack.Screen name="WithdrawalHistory" component={WithdrawalHistoryScreen} />

      {/* Sound Library */}
      <Stack.Screen name="SoundLibrary" component={SoundLibraryScreen} />
      <Stack.Screen name="UploadSound" component={UploadSoundScreen} />

      {/* Boosted Posts */}
      <Stack.Screen name="BoostedPosts" component={BoostedPostsScreen} />

      {/* ═══════════════════════════════════════════ */}
      {/* PRIVACY & SOCIAL SCREENS */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen name="CloseFriends" component={CloseFriendsScreen} />
      <Stack.Screen name="SavedPosts" component={SavedPostsScreen} />

      {/* ═══════════════════════════════════════════ */}
      {/* PROFILE & FOLLOW SCREENS (Issue 29-31) */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen name="ProfileFull" component={ProfileFullScreen} />
      <Stack.Screen name="FollowersList" component={FollowersListScreen} />
      <Stack.Screen name="FollowingList" component={FollowingListScreen} />

      {/* ═══════════════════════════════════════════ */}
      {/* ORDER TRACKING SCREENS (V3) */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen name="MyOrders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="LinkOrder" component={LinkOrderScreen} />

      {/* ═══════════════════════════════════════════ */}
      {/* KARMA SYSTEM SCREENS */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen name="KarmaDashboard" component={KarmaDashboardScreen} />

      {/* ═══════════════════════════════════════════ */}
      {/* ROI PROOF SYSTEM - PERSONAL INSIGHTS */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen
        name="PersonalInsights"
        component={PersonalInsightsScreen}
        options={{ headerShown: false }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* SHADOW MODE SCREENS */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen name="ShadowMode" component={ShadowModeScreen} />
      <Stack.Screen name="ConnectBinance" component={ConnectBinanceScreen} />
      <Stack.Screen name="ShadowReport" component={ShadowReportScreen} />

      {/* ═══════════════════════════════════════════ */}
      {/* AI LIVESTREAM SCREENS */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen name="LivestreamList" component={LivestreamListScreen} />
      <Stack.Screen
        name="LivestreamViewer"
        component={LivestreamViewerScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="AdminLivestream"
        component={AdminLivestreamScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LivestreamAnalytics"
        component={AnalyticsDashboardScreen}
        options={{ headerShown: false }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* SOUND & MONETIZATION SCREENS */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen name="SoundDetail" component={SoundDetailScreen} />
      <Stack.Screen name="SelectPostForBoost" component={SelectPostForBoostScreen} />
      <Stack.Screen name="BoostPost" component={BoostPostScreen} />
      <Stack.Screen name="BoostAnalytics" component={BoostAnalyticsScreen} />

      {/* ═══════════════════════════════════════════ */}
      {/* ADMIN SCREENS */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AdminApplications"
        component={AdminApplicationsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AdminWithdrawals"
        component={AdminWithdrawalsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AdminReports"
        component={AdminReportsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AdminNotifications"
        component={AdminNotificationsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AdminSponsorBanners"
        component={AdminSponsorBannersScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AdminShopBanners"
        component={AdminShopBannersScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AdminCourseHighlights"
        component={AdminCourseHighlightsScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* ADMIN AUTO-POST & CONTENT CALENDAR */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen
        name="ContentCalendar"
        component={ContentCalendarScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContentEditor"
        component={ContentEditorScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AutoPostLogs"
        component={AutoPostLogsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PlatformSettings"
        component={PlatformSettingsScreen}
        options={{ headerShown: false }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* ADMIN SEED CONTENT & AI BOT */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen
        name="AdminSeedContent"
        component={AdminSeedContentScreen}
        options={{ headerShown: false }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* ADMIN GIFT CATALOG MANAGEMENT */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen
        name="AdminGiftCatalog"
        component={AdminGiftCatalogScreen}
        options={{ headerShown: false }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* ADMIN USER MANAGEMENT (Phase B.1) */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen
        name="UserManagement"
        component={UserManagementScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserDetail"
        component={UserDetailScreen}
        options={{ headerShown: false }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* ADMIN REVENUE DASHBOARD (Phase B.2) */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen
        name="RevenueDashboard"
        component={RevenueDashboardScreen}
        options={{ headerShown: false }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* SUPPORT TICKETS (Phase B.3) */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen
        name="SupportTickets"
        component={SupportTicketsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TicketDetail"
        component={TicketDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateTicket"
        component={CreateTicketScreen}
        options={{ headerShown: false }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* ADMIN CONTENT HUB & PUSH NOTIFICATIONS */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen
        name="ContentDashboard"
        component={ContentDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PushEditor"
        component={PushEditorScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TemplateLibrary"
        component={TemplateLibraryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContentAnalytics"
        component={ContentAnalyticsScreen}
        options={{ headerShown: false }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* ADMIN COURSE MANAGEMENT SCREENS */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen
        name="AdminCourses"
        component={CourseListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CourseBuilder"
        component={CourseBuilderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ModuleBuilder"
        component={ModuleBuilderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LessonBuilder"
        component={LessonBuilderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QuizBuilder"
        component={QuizBuilderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GrantAccess"
        component={GrantAccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CourseStudents"
        component={CourseStudentsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CoursePreview"
        component={CoursePreviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StudentProgress"
        component={StudentProgressScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CourseAnalytics"
        component={CourseAnalyticsScreen}
        options={{ headerShown: false }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* ADMIN SUBSCRIPTION EXPIRATION MANAGEMENT */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen
        name="AdminExpiringUsers"
        component={AdminExpiringUsersScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminExpirationLogs"
        component={AdminExpirationLogsScreen}
        options={{ headerShown: false }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* ADMIN STICKER MANAGEMENT */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen
        name="AdminStickerPacks"
        component={AdminStickerPacksScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminStickerUpload"
        component={AdminStickerUploadScreen}
        options={{ headerShown: false }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* ADMIN UPGRADE MANAGEMENT */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen
        name="AdminUpgrade"
        component={AdminUpgradeScreen}
        options={{ headerShown: false }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* ADMIN PARTNERSHIP SYSTEM v3.0 (Phase 4-5) */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen
        name="AdminPartnershipDashboard"
        component={AdminPartnershipDashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminApplicationDetail"
        component={AdminApplicationDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminPartners"
        component={AdminPartnersScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminPartnerResources"
        component={AdminPartnerResourcesScreen}
        options={{ headerShown: false }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* ADMIN WAITLIST LEADS MANAGEMENT */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen
        name="WaitlistLeads"
        component={WaitlistLeadsScreen}
        options={{ headerShown: false }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* ADMIN INSTRUCTOR MANAGEMENT */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen
        name="AdminInstructors"
        component={AdminInstructorsScreen}
        options={{ headerShown: false }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* EXCHANGE AFFILIATE SCREENS */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen
        name="ExchangeOnboarding"
        component={ExchangeOnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExchangeAccounts"
        component={ExchangeAccountsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="APIConnection"
        component={APIConnectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AffiliateExchangeAdmin"
        component={AffiliateExchangeAdminScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
