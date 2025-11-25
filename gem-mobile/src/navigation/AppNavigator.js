/**
 * GEM Platform - App Navigator
 * Main navigation structure with auth flow
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Main app
import TabNavigator from './TabNavigator';
import ProfileFullScreen from '../screens/tabs/ProfileFullScreen';

// Auth context
import { useAuth } from '../contexts/AuthContext';

// Tokens
import { COLORS } from '../utils/tokens';

const Stack = createNativeStackNavigator();

// Loading screen
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.gold} />
    </View>
  );
}

// Auth Stack (not logged in)
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
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
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { loading, initialized, isAuthenticated } = useAuth();

  // Show loading while initializing
  if (!initialized || loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
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
