/**
 * Gemral - Call Stack Navigator
 * Audio/Video call screens navigation
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Call screens
import {
  OutgoingCallScreen,
  IncomingCallScreen,
  InCallScreen,
  VideoCallScreen,
  CallEndedScreen,
  CallHistoryScreen,
} from '../screens/Call';

const Stack = createNativeStackNavigator();

export default function CallStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: false, // Disable swipe back during calls
      }}
    >
      {/* Outgoing call - initiating a call */}
      <Stack.Screen
        name="OutgoingCall"
        component={OutgoingCallScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />

      {/* Incoming call - receiving a call */}
      <Stack.Screen
        name="IncomingCall"
        component={IncomingCallScreen}
        options={{
          animation: 'fade',
        }}
      />

      {/* Active audio call - connected call */}
      <Stack.Screen
        name="InCall"
        component={InCallScreen}
        options={{
          animation: 'fade',
        }}
      />

      {/* Active video call - full screen video */}
      <Stack.Screen
        name="VideoCall"
        component={VideoCallScreen}
        options={{
          animation: 'fade',
        }}
      />

      {/* Call ended - summary screen */}
      <Stack.Screen
        name="CallEnded"
        component={CallEndedScreen}
        options={{
          animation: 'fade',
        }}
      />

      {/* Call history - list of past calls */}
      <Stack.Screen
        name="CallHistory"
        component={CallHistoryScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}
