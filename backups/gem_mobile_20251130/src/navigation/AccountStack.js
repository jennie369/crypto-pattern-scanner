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
import GemPurchaseSuccessScreen from '../screens/Wallet/GemPurchaseSuccessScreen';
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
} from '../screens/Admin';

// Admin Course Screens
import {
  CourseListScreen,
  CourseBuilderScreen,
  ModuleBuilderScreen,
  LessonBuilderScreen,
  QuizBuilderScreen,
  GrantAccessScreen,
  CourseStudentsScreen,
} from '../screens/Admin/Courses';

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
      <Stack.Screen name="GemPurchaseSuccess" component={GemPurchaseSuccessScreen} />

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
    </Stack.Navigator>
  );
}
