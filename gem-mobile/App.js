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

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Context
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import { CourseProvider } from './src/contexts/CourseContext';
import { TabBarProvider } from './src/contexts/TabBarContext';

// Services
import { notificationService } from './src/services/notificationService';

// Ignore specific warnings (optional)
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  '"shadow*" style props are deprecated', // react-native-web specific warning
  '[expo-av]: Expo AV has been deprecated', // Will migrate later
  '[expo-notifications] Listening to push token', // Web-only limitation
]);

export default function App() {
  // Initialize notifications on app start
  useEffect(() => {
    notificationService.initialize();
  }, []);
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <CourseProvider>
              <TabBarProvider>
                <StatusBar style="light" />
                <AppNavigator />
              </TabBarProvider>
            </CourseProvider>
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
