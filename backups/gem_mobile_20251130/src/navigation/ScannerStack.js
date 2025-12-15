/**
 * Gemral - Scanner Navigation Stack
 * Pattern detection scanner with detail view + Paper Trading
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScannerScreen, PatternDetailScreen } from '../screens/Scanner';
import OpenPositionsScreen from '../screens/Scanner/OpenPositionsScreen';

const Stack = createNativeStackNavigator();

const ScannerStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ScannerMain" component={ScannerScreen} />
      <Stack.Screen
        name="PatternDetail"
        component={PatternDetailScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="OpenPositions"
        component={OpenPositionsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

export default ScannerStack;
