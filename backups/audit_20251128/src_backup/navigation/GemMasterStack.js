/**
 * Gemral - Gemral Stack Navigator
 * Stack for AI Chat, I Ching, Tarot, and Chat History screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import GemMasterScreen from '../screens/GemMaster/GemMasterScreen';
import IChingScreen from '../screens/GemMaster/IChingScreen';
import TarotScreen from '../screens/GemMaster/TarotScreen';
import ChatHistoryScreen from '../screens/GemMaster/ChatHistoryScreen';

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
      <Stack.Screen name="Tarot" component={TarotScreen} />
      <Stack.Screen
        name="ChatHistory"
        component={ChatHistoryScreen}
        options={{ animation: 'slide_from_left' }}
      />
    </Stack.Navigator>
  );
}
