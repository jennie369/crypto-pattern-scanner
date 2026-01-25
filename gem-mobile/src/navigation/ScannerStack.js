/**
 * Gemral - Scanner Navigation Stack
 * Pattern detection scanner with detail view + Paper Trading
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScannerScreen, PatternDetailScreen, MTFDashboardScreen } from '../screens/Scanner';
import OpenPositionsScreen from '../screens/Scanner/OpenPositionsScreen';
import PaperTradeHistoryScreen from '../screens/Account/PaperTradeHistoryScreen';

// Exchange Affiliate Screens (for navigation within Scanner tab)
import {
  ExchangeOnboardingScreen,
  ExchangeAccountsScreen,
  APIConnectionScreen,
} from '../screens/Exchange';

const Stack = createNativeStackNavigator();

const ScannerStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ScannerMain" component={ScannerScreen} />
      <Stack.Screen
        name="PatternDetail"
        component={PatternDetailScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="OpenPositions"
        component={OpenPositionsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="PaperTradeHistory"
        component={PaperTradeHistoryScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="MTFDashboard"
        component={MTFDashboardScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* EXCHANGE AFFILIATE (within Scanner tab) */}
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
    </Stack.Navigator>
  );
};

export default ScannerStack;
