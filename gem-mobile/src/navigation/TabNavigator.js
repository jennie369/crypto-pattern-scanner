/**
 * GEM Platform - Tab Navigator
 * 6-tab bottom navigation with Glass Bottom Tab
 *
 * Sources:
 * - DESIGN_TOKENS.md (colors, typography, spacing)
 * - FINAL_NAVIGATION_STRUCTURE_6_TABS.md (tab names, icons)
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import HomeStack from './HomeStack';
import ShopStack from './ShopStack';
import ScannerStack from './ScannerStack';
import GemMasterStack from './GemMasterStack';
import NotificationsScreen from '../screens/tabs/NotificationsScreen';
import AccountScreen from '../screens/tabs/AccountScreen';

// Custom Tab Bar
import GlassBottomTab from '../components/GlassBottomTab';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
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

      {/* TAB 4: GEM MASTER */}
      <Tab.Screen name="GemMaster" component={GemMasterStack} />

      {/* TAB 5: THÔNG BÁO */}
      <Tab.Screen name="Notifications" component={NotificationsScreen} />

      {/* TAB 6: TÀI SẢN */}
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
