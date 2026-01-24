/**
 * Gemral - App Navigator
 * Main navigation structure with auth flow
 * WITH Deep Link Handler for push notifications
 * WITH Welcome screens for first-time users
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
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

// In-App Notification Provider
import { InAppNotificationProvider } from '../contexts/InAppNotificationContext';

// Tokens
import { COLORS } from '../utils/tokens';

// Navigation ref (imported from separate file to avoid circular deps)
import { navigationRef } from './navigationRef';
export { navigationRef };

const Stack = createNativeStackNavigator();

// Loading screen
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.gold} />
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
  const { loading, initialized, isAuthenticated } = useAuth();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [hasCompletedWelcome, setHasCompletedWelcome] = useState(null);
  const [welcomeChecked, setWelcomeChecked] = useState(false);
  const appStateRef = useRef(AppState.currentState);

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

    // Handle initial URL (app opened via deep link)
    try {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('[AppNavigator] Initial URL:', initialUrl);
        await deepLinkHandler.handleExternalUrl(initialUrl);
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

  // Listen for deep link URL events while app is running
  useEffect(() => {
    // Subscribe to URL events
    const subscription = Linking.addEventListener('url', async (event) => {
      console.log('[AppNavigator] URL event:', event.url);
      if (event.url) {
        await deepLinkHandler.handleExternalUrl(event.url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

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
    <NavigationContainer ref={navigationRef} onReady={onNavigationReady}>
      <InAppNotificationProvider>
        {isAuthenticated ? (
          <MainStack />
        ) : (
          <AuthStack hasCompletedWelcome={hasCompletedWelcome} />
        )}
      </InAppNotificationProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
