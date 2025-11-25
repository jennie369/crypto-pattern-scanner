/**
 * GEM Platform - GEM Master Stack Navigator
 * Stack for AI Chat, I Ching, and Tarot screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import GemMasterScreen from '../screens/GemMaster/GemMasterScreen';
import IChingScreen from '../screens/GemMaster/IChingScreen';
import TarotScreen from '../screens/GemMaster/TarotScreen';

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
    </Stack.Navigator>
  );
}
