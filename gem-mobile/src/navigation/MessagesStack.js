/**
 * Gemral - Messages Stack Navigator
 * TikTok-style messaging screens navigation
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Messages screens
import ConversationsListScreen from '../screens/Messages/ConversationsListScreen';
import ChatScreen from '../screens/Messages/ChatScreen';
import NewConversationScreen from '../screens/Messages/NewConversationScreen';
import ConversationInfoScreen from '../screens/Messages/ConversationInfoScreen';
import MediaGalleryScreen from '../screens/Messages/MediaGalleryScreen';
import CreateGroupScreen from '../screens/Messages/CreateGroupScreen';
import MessageSearchScreen from '../screens/Messages/MessageSearchScreen';
import ForwardMessageScreen from '../screens/Messages/ForwardMessageScreen';
import BlockedUsersScreen from '../screens/Messages/BlockedUsersScreen';
import PinnedMessagesScreen from '../screens/Messages/PinnedMessagesScreen';
import ScheduledMessagesScreen from '../screens/Messages/ScheduledMessagesScreen';
import StarredMessagesScreen from '../screens/Messages/StarredMessagesScreen';

const Stack = createNativeStackNavigator();

export default function MessagesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main conversations list */}
      <Stack.Screen
        name="ConversationsList"
        component={ConversationsListScreen}
      />

      {/* Individual chat screen */}
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
      />

      {/* Create new conversation */}
      <Stack.Screen
        name="NewConversation"
        component={NewConversationScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />

      {/* Conversation info (participants, settings) */}
      <Stack.Screen
        name="ConversationInfo"
        component={ConversationInfoScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />

      {/* Media gallery for conversation */}
      <Stack.Screen
        name="MediaGallery"
        component={MediaGalleryScreen}
        options={{
          animation: 'fade',
        }}
      />

      {/* Create group conversation */}
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />

      {/* Message search */}
      <Stack.Screen
        name="MessageSearch"
        component={MessageSearchScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />

      {/* Forward message */}
      <Stack.Screen
        name="ForwardMessage"
        component={ForwardMessageScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />

      {/* Blocked users */}
      <Stack.Screen
        name="BlockedUsers"
        component={BlockedUsersScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />

      {/* Pinned messages */}
      <Stack.Screen
        name="PinnedMessages"
        component={PinnedMessagesScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />

      {/* Scheduled messages */}
      <Stack.Screen
        name="ScheduledMessages"
        component={ScheduledMessagesScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />

      {/* Starred messages */}
      <Stack.Screen
        name="StarredMessages"
        component={StarredMessagesScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}
