/**
 * Gemral - App Navigator
 * Main navigation structure with auth flow
 * WITH Deep Link Handler for push notifications
 * WITH Welcome screens for first-time users
 */

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet, AppState } from 'react-native';
import * as Linking from 'expo-linking';

// Deep Link Handler for notification navigation and affiliate links
import deepLinkHandler from '../services/deepLinkHandler';

// Welcome service for first launch detection
import welcomeService from '../services/welcomeService';

// Welcome screen (first-time users)
import WelcomeScreen from '../screens/Welcome/WelcomeScreen';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Main app
import TabNavigator from './TabNavigator';
import ProfileFullScreen from '../screens/tabs/ProfileFullScreen';
import MessagesStack from './MessagesStack';
import CourseStack from './CourseStack';
import CallStack from './CallStack';

// Auth context
import { useAuth } from '../contexts/AuthContext';

// Global app resume - recovery system for stuck loading states + reconnections
import { useGlobalAppResume } from '../hooks/useAppResume';

// In-App Notification Provider
import { InAppNotificationProvider } from '../contexts/InAppNotificationContext';

// Call Provider - Global call handling with incoming call overlay
import { CallProvider } from '../contexts/CallContext';

// Upgrade Success Modal (shows after purchase)
import UpgradeSuccessModal from '../components/upgrade/UpgradeSuccessModal';

// Settings context for theming
import { useSettings } from '../contexts/SettingsContext';

// Navigation ref (imported from separate file to avoid circular deps)
import { navigationRef } from './navigationRef';
export { navigationRef };

const Stack = createNativeStackNavigator();

// Loading screen - uses themed colors from context
function LoadingScreen() {
  const { colors } = useSettings();

  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.bgDarkest }]}>
      <ActivityIndicator size="large" color={colors.gold} />
    </View>
  );
}

// Auth Stack (not logged in) - includes Welcome for first-time users
function AuthStack({ hasCompletedWelcome }) {
  return (
    <Stack.Navigator
      initialRouteName={hasCompletedWelcome ? 'Login' : 'Welcome'}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Auth" component={AuthScreens} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={SignupScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// Auth Screens Group (Login/Register)
function AuthScreens() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterScreen" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// Main Stack (logged in)
function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="ProfileFull"
        component={ProfileFullScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      {/* Messages Stack - TikTok style header icon entry */}
      <Stack.Screen
        name="Messages"
        component={MessagesStack}
        options={{
          animation: 'slide_from_right',
        }}
      />
      {/* Courses Stack - LMS feature */}
      <Stack.Screen
        name="Courses"
        component={CourseStack}
        options={{
          animation: 'slide_from_right',
        }}
      />
      {/* Call Stack - Audio/Video calls */}
      <Stack.Screen
        name="Call"
        component={CallStack}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'fullScreenModal',
        }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { loading, initialized, isAuthenticated, upgradeState, closeUpgradeModal } = useAuth();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [hasCompletedWelcome, setHasCompletedWelcome] = useState(null);
  const [welcomeChecked, setWelcomeChecked] = useState(false);
  const appStateRef = useRef(AppState.currentState);

  // C14: Unified resume system (AppResumeManager)
  // - Single AppState listener for all resume operations
  // - Deterministic sequence: session → loading → cache → WS → health
  // - Stuck-state detection (15s) + health checks (60s)
  useGlobalAppResume();

  // React Navigation linking configuration for deep links
  // Handles gem:// scheme and gemral.com universal links automatically
  const linking = useMemo(() => ({
    prefixes: [
      Linking.createURL('/'),             // gem:// scheme
      'gem://',                           // explicit scheme
      'https://gemral.com',              // universal links
      'https://www.gemral.com',          // www variant
    ],
    config: {
      screens: {
        MainTabs: {
          screens: {
            Home: {
              screens: {
                ForumFeed: 'forum',
                PostDetail: 'forum/thread/:postId',
              },
            },
            Shop: {
              screens: {
                ShopMain: 'shop',
                ProductDetail: 'shop/product/:productId',
              },
            },
            Trading: {
              screens: {
                ScannerMain: 'scanner',
              },
            },
            GemMaster: {
              screens: {
                GemMasterMain: 'gemmaster',
              },
            },
            Account: {
              screens: {
                VisionBoard: 'visionboard',
                CourseList: 'courses',
                CourseDetail: 'courses/:courseId',
                LessonPlayer: 'courses/:courseId/lessons/:lessonId',
                Wallet: 'wallet',
                Portfolio: 'portfolio',
                Earnings: 'earnings',
                AffiliateDashboard: 'affiliate',
              },
            },
          },
        },
      },
    },
    // Custom URL parsing: let deepLinkHandler handle affiliate URLs
    // and Supabase og-meta redirect URLs (gem:// scheme from smart links)
    async getInitialURL() {
      // Check for initial URL from deep link
      const url = await Linking.getInitialURL();
      if (url) {
        // Affiliate URLs and web URLs are handled by deepLinkHandler
        if (deepLinkHandler.isAffiliateUrl(url) || deepLinkHandler.isGemralWebUrl(url)) {
          // deepLinkHandler will process these in onNavigationReady
          return null;
        }
      }
      return url;
    },
    subscribe(listener) {
      const subscription = Linking.addEventListener('url', ({ url }) => {
        // Let affiliate/web URLs go through deepLinkHandler
        if (deepLinkHandler.isAffiliateUrl(url) || deepLinkHandler.isGemralWebUrl(url)) {
          deepLinkHandler.handleExternalUrl(url);
          return;
        }
        // Let React Navigation handle gem:// scheme URLs natively
        listener(url);
      });
      return () => subscription?.remove();
    },
  }), []);

  // Global startup timeout - prevents permanent black screen if auth + welcome both stall
  useEffect(() => {
    const startupTimer = setTimeout(() => {
      if (!initialized) {
        console.warn('[AppNavigator] Startup timeout - forcing initialization');
        setInitialized(true);
        setWelcomeChecked(true);
      }
    }, 15000);
    return () => clearTimeout(startupTimer);
  }, [initialized]);

  // Check welcome completion on mount
  useEffect(() => {
    const checkWelcome = async () => {
      try {
        const completed = await welcomeService.hasCompletedWelcome();
        setHasCompletedWelcome(completed);
      } catch (error) {
        console.error('[AppNavigator] Error checking welcome:', error);
        // Default to completed on error to avoid blocking users
        setHasCompletedWelcome(true);
      } finally {
        setWelcomeChecked(true);
      }
    };
    checkWelcome();
  }, []);

  // Initialize deep link handler when navigation is ready
  const onNavigationReady = useCallback(async () => {
    // Initialize deep link handler with navigation ref
    deepLinkHandler.initialize(navigationRef);
    setIsNavigationReady(true);
    console.log('[AppNavigator] Navigation ready, deep link handler initialized');

    // Handle initial URL for affiliate/web links ONLY
    // (gem:// scheme URLs are handled automatically by the `linking` config above)
    try {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        const isAffiliate = deepLinkHandler.isAffiliateUrl(initialUrl);
        const isWebUrl = deepLinkHandler.isGemralWebUrl(initialUrl);
        if (isAffiliate || isWebUrl) {
          console.log('[AppNavigator] Initial URL (affiliate/web):', initialUrl);
          await deepLinkHandler.handleExternalUrl(initialUrl);
        }
      }
    } catch (error) {
      console.error('[AppNavigator] Error getting initial URL:', error);
    }

    // Check for pending affiliate links (deferred deep linking)
    try {
      await deepLinkHandler.checkPendingAffiliateLink();
    } catch (error) {
      console.error('[AppNavigator] Error checking pending affiliate link:', error);
    }

    // Sync any offline clicks
    try {
      await deepLinkHandler.syncOfflineClicks();
    } catch (error) {
      console.error('[AppNavigator] Error syncing offline clicks:', error);
    }
  }, []);

  // NOTE: URL event listening is now handled by the `linking` config's `subscribe` method
  // above (passed to NavigationContainer). No duplicate listener needed here.

  // Handle app state changes (for syncing when coming back online)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to foreground - sync offline clicks
        try {
          await deepLinkHandler.syncOfflineClicks();
        } catch (error) {
          console.log('[AppNavigator] Error syncing on app resume:', error);
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      deepLinkHandler.cleanup();
    };
  }, []);

  // Show loading while initializing or checking welcome
  if (!initialized || loading || !welcomeChecked) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking} onReady={onNavigationReady}>
      <InAppNotificationProvider>
        {isAuthenticated ? (
          <CallProvider>
            <MainStack />
          </CallProvider>
        ) : (
          <AuthStack hasCompletedWelcome={hasCompletedWelcome} />
        )}
      </InAppNotificationProvider>

      {/* Global Upgrade Success Modal - shows after purchase completion */}
      {isAuthenticated && upgradeState?.showModal && (
        <UpgradeSuccessModal
          visible={upgradeState.showModal}
          onClose={closeUpgradeModal}
          tierType={upgradeState.tierType}
          tierName={upgradeState.tierName}
          onExplore={() => {
            closeUpgradeModal();
            // Navigate based on tier type
            if (upgradeState.tierType === 'course' || upgradeState.tierType === 'bundle') {
              navigationRef.current?.navigate('Courses');
            } else if (upgradeState.tierType === 'scanner') {
              navigationRef.current?.navigate('Trading');
            } else if (upgradeState.tierType === 'chatbot') {
              navigationRef.current?.navigate('Home');
            }
          }}
        />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
