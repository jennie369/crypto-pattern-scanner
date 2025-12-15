/**
 * Gemral - Home Stack Navigator
 * Forum screens navigation stack
 * WITH Post Gifts screen
 * WITH ProductDetail (from tagged products in posts)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Forum screens
import ForumScreen from '../screens/Forum/ForumScreen';
import PostDetailScreen from '../screens/Forum/PostDetailScreen';
import CreatePostScreen from '../screens/Forum/CreatePostScreen';
import EditPostScreen from '../screens/Forum/EditPostScreen';
import HashtagFeedScreen from '../screens/Forum/HashtagFeedScreen';
import UserProfileScreen from '../screens/Forum/UserProfileScreen';
import SearchScreen from '../screens/Forum/SearchScreen';
import PostAnalyticsScreen from '../screens/Forum/PostAnalyticsScreen';
import PostGiftsScreen from '../screens/Forum/PostGiftsScreen';

// Global Search
import GlobalSearchScreen from '../screens/Search/GlobalSearchScreen';

// Profile screens (Follow System - Issue 31)
import FollowersListScreen from '../screens/Profile/FollowersListScreen';
import FollowingListScreen from '../screens/Profile/FollowingListScreen';

// Shop screen (for viewing products from posts without cross-tab navigation)
import { ProductDetailScreen } from '../screens/Shop';

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
      <Stack.Screen
        name="EditPost"
        component={EditPostScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="HashtagFeed"
        component={HashtagFeedScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="GlobalSearch"
        component={GlobalSearchScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="PostAnalytics"
        component={PostAnalyticsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="PostGifts"
        component={PostGiftsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />

      {/* Follow System Screens - Issue 31 */}
      <Stack.Screen
        name="FollowersList"
        component={FollowersListScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="FollowingList"
        component={FollowingListScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />

      {/* Product Detail - for viewing products from tagged posts */}
      {/* This avoids cross-tab navigation which causes back button loop */}
      <Stack.Screen
        name="ProductDetailFromPost"
        component={ProductDetailScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}
