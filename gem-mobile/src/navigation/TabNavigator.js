/**
 * Gemral - Tab Navigator
 * 6-tab bottom navigation with Glass Bottom Tab
 *
 * Sources:
 * - DESIGN_TOKENS.md (colors, typography, spacing)
 * - FINAL_NAVIGATION_STRUCTURE_6_TABS.md (tab names, icons)
 */

import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import HomeStack from './HomeStack';
import ShopStack from './ShopStack';
import ScannerStack from './ScannerStack';
import GemMasterStack from './GemMasterStack';
import NotificationsScreen from '../screens/tabs/NotificationsScreen';
import AccountStack from './AccountStack';

// C10 FIX: ErrorBoundary prevents tab crashes from taking down the whole app
import ErrorBoundary from '../components/ErrorBoundary';

// Custom Tab Bar
import GlassBottomTab from '../components/GlassBottomTab';

// Preload services for instant tab switching
import { preloadAllShopData } from '../services/shopifyService';

// C10 FIX: Wrap each tab stack in ErrorBoundary for crash isolation
const SafeHomeStack = (props) => (
  <ErrorBoundary navigation={props.navigation}><HomeStack {...props} /></ErrorBoundary>
);
const SafeShopStack = (props) => (
  <ErrorBoundary navigation={props.navigation}><ShopStack {...props} /></ErrorBoundary>
);
const SafeScannerStack = (props) => (
  <ErrorBoundary navigation={props.navigation}><ScannerStack {...props} /></ErrorBoundary>
);
const SafeGemMasterStack = (props) => (
  <ErrorBoundary navigation={props.navigation}><GemMasterStack {...props} /></ErrorBoundary>
);
const SafeNotificationsScreen = (props) => (
  <ErrorBoundary navigation={props.navigation}><NotificationsScreen {...props} /></ErrorBoundary>
);
const SafeAccountStack = (props) => (
  <ErrorBoundary navigation={props.navigation}><AccountStack {...props} /></ErrorBoundary>
);

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  // Preload ALL shop data in background when tabs are mounted
  // This makes Shop tab instant when user navigates to it
  useEffect(() => {
    // Start preload immediately but non-blocking
    // Uses enhanced preload that loads products, banners, and digital products
    preloadAllShopData();
  }, []);
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassBottomTab {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: true, // Only mount screen when first accessed - improves performance
        freezeOnBlur: true, // Freeze inactive screens to reduce re-renders
      }}
      backBehavior="history"
    >
      {/* TAB 1: HOME (Forum) — C10: wrapped in ErrorBoundary */}
      <Tab.Screen name="Home" component={SafeHomeStack} />

      {/* TAB 2: SHOP */}
      <Tab.Screen name="Shop" component={SafeShopStack} />

      {/* TAB 3: GIAO DỊCH */}
      <Tab.Screen name="Trading" component={SafeScannerStack} />

      {/* TAB 4: Gemral */}
      <Tab.Screen name="GemMaster" component={SafeGemMasterStack} />

      {/* TAB 5: THÔNG BÁO */}
      <Tab.Screen name="Notifications" component={SafeNotificationsScreen} />

      {/* TAB 6: TÀI SẢN */}
      <Tab.Screen name="Account" component={SafeAccountStack} />
    </Tab.Navigator>
  );
}
