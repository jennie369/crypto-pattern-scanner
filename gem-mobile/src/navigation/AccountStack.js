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

// VisionBoard Screens
import {
  VisionBoardScreen,
  AchievementsScreen,
  CalendarScreen,
  GoalDetailScreen,
  DailyRecapScreen,
  RitualPlaygroundScreen,
  RitualHistoryScreen,
  // New Ritual Screens (Vision Board 2.0)
  HeartExpansionRitual,
  GratitudeFlowRitual,
  CleansingBreathRitual,
  WaterManifestRitual,
  LetterToUniverseRitual,
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

      {/* Profile Settings */}
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />

      {/* Notification Settings */}
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />

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
      <Stack.Screen name="DailyRecap" component={DailyRecapScreen} />

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
      {/* SHADOW MODE SCREENS */}
      {/* ═══════════════════════════════════════════ */}
      <Stack.Screen name="ShadowMode" component={ShadowModeScreen} />
      <Stack.Screen name="ConnectBinance" component={ConnectBinanceScreen} />
      <Stack.Screen name="ShadowReport" component={ShadowReportScreen} />

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
    </Stack.Navigator>
  );
}
