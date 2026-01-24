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

// Custom Tab Bar
import GlassBottomTab from '../components/GlassBottomTab';

// Preload services for instant tab switching
import { preloadShopData } from '../services/shopifyService';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  // Preload shop data in background when tabs are mounted
  // This makes Shop tab instant when user navigates to it
  useEffect(() => {
    // Start preload immediately but non-blocking
    preloadShopData();
  }, []);
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassBottomTab {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* TAB 1: HOME (Forum) */}
      <Tab.Screen name="Home" component={HomeStack} />

      {/* TAB 2: SHOP */}
      <Tab.Screen name="Shop" component={ShopStack} />

      {/* TAB 3: GIAO DỊCH */}
      <Tab.Screen name="Trading" component={ScannerStack} />

      {/* TAB 4: Gemral */}
      <Tab.Screen name="GemMaster" component={GemMasterStack} />

      {/* TAB 5: THÔNG BÁO */}
      <Tab.Screen name="Notifications" component={NotificationsScreen} />

      {/* TAB 6: TÀI SẢN */}
      <Tab.Screen name="Account" component={AccountStack} />
    </Tab.Navigator>
  );
}
