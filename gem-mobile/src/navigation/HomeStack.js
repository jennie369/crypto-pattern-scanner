/**
 * GEM Platform - Home Stack Navigator
 * Forum screens navigation stack
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Forum screens
import ForumScreen from '../screens/Forum/ForumScreen';
import PostDetailScreen from '../screens/Forum/PostDetailScreen';
import CreatePostScreen from '../screens/Forum/CreatePostScreen';
import UserProfileScreen from '../screens/Forum/UserProfileScreen';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ForumFeed" component={ForumScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}
