/**
 * GEM Mobile - Livestream Stack Navigator
 * Navigation stack for AI Livestream related screens
 *
 * Includes:
 * - LivestreamListScreen: List of available/scheduled livestreams
 * - LivestreamViewerScreen: Watch livestream with comments
 * - Admin screens for managing livestream (Admin only)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Livestream Screens
import { LivestreamListScreen, LivestreamViewerScreen } from '../screens/Livestream';

// Admin Screens (conditionally rendered based on user role)
import { AdminLivestreamScreen, AnalyticsDashboardScreen } from '../screens/Admin';

const Stack = createNativeStackNavigator();

export default function LivestreamStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main Livestream List */}
      <Stack.Screen name="LivestreamList" component={LivestreamListScreen} />

      {/* Viewer Screen - Full screen modal */}
      <Stack.Screen
        name="LivestreamViewer"
        component={LivestreamViewerScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
          presentation: 'fullScreenModal',
        }}
      />

      {/* Admin: Livestream Management */}
      <Stack.Screen
        name="AdminLivestream"
        component={AdminLivestreamScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Admin: Analytics Dashboard */}
      <Stack.Screen
        name="LivestreamAnalytics"
        component={AnalyticsDashboardScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
