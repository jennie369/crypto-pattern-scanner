/**
 * GEM Platform - Mobile App
 * React Native with Expo
 * Week 2 Foundation - Day 8 Setup
 */

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
import { TabBarProvider } from './src/contexts/TabBarContext';

// Services
import { notificationService } from './src/services/notificationService';

// Ignore specific warnings (optional)
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
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
            <TabBarProvider>
              <StatusBar style="light" />
              <AppNavigator />
            </TabBarProvider>
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
