/**
 * Gemral - Gemral Stack Navigator
 * Stack for AI Chat, I Ching, Tarot, and Chat History screens
 * UPDATED: Added ProductDetail screen for in-stack navigation
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// GemMaster Screens
import GemMasterScreen from '../screens/GemMaster/GemMasterScreen';
import IChingScreen from '../screens/GemMaster/IChingScreen';
import TarotScreen from '../screens/GemMaster/TarotScreen';
import ChatHistoryScreen from '../screens/GemMaster/ChatHistoryScreen';
import SpreadSelectionScreen from '../screens/GemMaster/SpreadSelectionScreen';
import TarotReadingScreen from '../screens/GemMaster/TarotReadingScreen';
import ReadingHistoryScreen from '../screens/GemMaster/ReadingHistoryScreen';
import ReadingDetailScreen from '../screens/GemMaster/ReadingDetailScreen';

// Shop screens (for crystal/product recommendations without cross-tab navigation)
import { ProductDetailScreen } from '../screens/Shop';

const Stack = createNativeStackNavigator();

export default function GemMasterStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="GemMasterMain" component={GemMasterScreen} />
      <Stack.Screen name="IChing" component={IChingScreen} />
      {/* Tarot now uses SpreadSelectionScreen as main entry */}
      <Stack.Screen name="Tarot" component={SpreadSelectionScreen} />
      {/* Legacy quick tarot for backwards compatibility */}
      <Stack.Screen name="QuickTarot" component={TarotScreen} />
      <Stack.Screen
        name="ChatHistory"
        component={ChatHistoryScreen}
        options={{ animation: 'slide_from_left' }}
      />
      <Stack.Screen name="SpreadSelection" component={SpreadSelectionScreen} />
      <Stack.Screen name="TarotReading" component={TarotReadingScreen} />
      <Stack.Screen
        name="ReadingHistory"
        component={ReadingHistoryScreen}
        options={{ animation: 'slide_from_left' }}
      />
      <Stack.Screen name="ReadingDetail" component={ReadingDetailScreen} />

      {/* Shop screens - navigate within stack instead of switching tabs */}
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}
