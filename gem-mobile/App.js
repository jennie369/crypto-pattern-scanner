/**
 * Gemral - Mobile App
 * React Native with Expo
 * Week 2 Foundation - Day 8 Setup
 */

// Reactotron must be imported FIRST before any other imports
// Only load on native platforms (not web)
import { Platform } from 'react-native';
if (__DEV__ && Platform.OS !== 'web') {
  require('./src/config/ReactotronConfig');
}

// Check if Hermes is enabled
const isHermes = () => !!global.HermesInternal;
console.log('🔥 Hermes enabled:', isHermes());

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Context
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import { CourseProvider } from './src/contexts/CourseContext';
import { TabBarProvider } from './src/contexts/TabBarContext';
import { ScannerProvider } from './src/contexts/ScannerContext';
import { VisionBoardProvider } from './src/contexts/VisionBoardContext';
import { LivestreamProvider } from './src/contexts/LivestreamContext';
import { CallProvider } from './src/contexts/CallContext';
import { CalendarProvider } from './src/contexts/CalendarContext';

// Tooltip Provider for feature discovery
import TooltipProvider from './src/components/Common/TooltipProvider';

// Upgrade Provider for upgrade flow
import { UpgradeProvider } from './src/contexts/UpgradeContext';

// Settings Provider (Language, Currency, Theme)
import { SettingsProvider } from './src/contexts/SettingsContext';

// Initialize i18n
import './src/i18n';

// Services
import { notificationService } from './src/services/notificationService';

// Zone Price Monitor - lazy load to avoid startup issues
let zonePriceMonitor = null;
try {
  zonePriceMonitor = require('./src/services/zonePriceMonitor').zonePriceMonitor;
} catch (e) {
  console.warn('[App] Failed to load zonePriceMonitor:', e.message);
}

// Hooks
import { useActionReset } from './src/hooks/useActionReset';
import { usePendingOrdersChecker } from './src/hooks/usePendingOrdersChecker';

// Global Alert Provider (dark themed alerts)
import GlobalAlertProvider from './src/components/UI/GlobalAlertProvider';

// Ignore specific warnings (optional)
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  '"shadow*" style props are deprecated', // react-native-web specific warning
  '[expo-av]: Expo AV has been deprecated', // Will migrate later
  '[expo-notifications] Listening to push token', // Web-only limitation
]);

/**
 * AppContent - Wrapper inside AuthProvider to use hooks that need auth
 * Handles auto-reset of Vision Board actions on app open/foreground
 * Handles pending orders checking for paper trading
 */
function AppContent() {
  // Get current user for pending orders
  const { user } = useAuth();

  // Initialize Zone Price Monitor for real-time zone alerts
  useEffect(() => {
    if (user?.id && zonePriceMonitor) {
      // Initialize and start zone monitoring
      zonePriceMonitor.init(user.id).then(() => {
        zonePriceMonitor.start();
        if (__DEV__) {
          console.log('[App] Zone Price Monitor started for user:', user.id);
        }
      }).catch(err => {
        console.warn('[App] Zone Price Monitor init error:', err.message);
      });

      // Cleanup on unmount or user change
      return () => {
        zonePriceMonitor.stop();
        if (__DEV__) {
          console.log('[App] Zone Price Monitor stopped');
        }
      };
    }
  }, [user?.id]);

  // Auto-reset Vision Board actions when app opens or comes to foreground
  useActionReset({
    enabled: true,
    onReset: (result) => {
      if (__DEV__ && result.resetCount > 0) {
        console.log(`[App] Reset ${result.resetCount} Vision Board actions`);
      }
    },
  });

  // Check pending orders periodically (Paper Trading)
  usePendingOrdersChecker(user?.id, !!user?.id);

  return (
    <CartProvider>
      <CourseProvider>
        <ScannerProvider>
          <VisionBoardProvider>
            <CalendarProvider>
              <LivestreamProvider>
                <TooltipProvider>
                  <UpgradeProvider>
                    <CallProvider>
                      <TabBarProvider>
                        <StatusBar style="light" />
                        <AppNavigator />
                      </TabBarProvider>
                    </CallProvider>
                  </UpgradeProvider>
                </TooltipProvider>
              </LivestreamProvider>
            </CalendarProvider>
          </VisionBoardProvider>
        </ScannerProvider>
      </CourseProvider>
    </CartProvider>
  );
}

export default function App() {
  // Initialize notifications on app start
  useEffect(() => {
    notificationService.initialize();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <GlobalAlertProvider>
          <AuthProvider>
            <SettingsProvider>
              <AppContent />
            </SettingsProvider>
          </AuthProvider>
        </GlobalAlertProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
