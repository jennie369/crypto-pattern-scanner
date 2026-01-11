/**
 * Gemral - Course Navigation Stack
 * Navigation structure for LMS features
 * Supports: courses, lessons (video/article/quiz), quizzes, certificates
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CoursesScreen from '../screens/Courses/CoursesScreen';
import CourseDetailScreen from '../screens/Courses/CourseDetailScreen';
import LessonPlayerScreen from '../screens/Courses/LessonPlayerScreen';
import QuizScreen from '../screens/Courses/QuizScreen';
import CertificateScreen from '../screens/Courses/CertificateScreen';
import CourseCheckout from '../screens/Courses/CourseCheckout';

// Gamification screens
import {
  CourseAchievementsScreen,
  DailyQuestsScreen,
  LeaderboardScreen,
} from '../screens/Gamification';

const Stack = createNativeStackNavigator();

const CourseStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="CourseList" component={CoursesScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen
        name="LessonPlayer"
        component={LessonPlayerScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="QuizScreen"
        component={QuizScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          gestureEnabled: false, // Prevent accidental swipe back during quiz
        }}
      />
      <Stack.Screen
        name="Certificate"
        component={CertificateScreen}
        options={{
          presentation: 'modal',
          animation: 'fade_from_bottom',
        }}
      />
      <Stack.Screen
        name="CourseCheckout"
        component={CourseCheckout}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          gestureEnabled: false, // Prevent accidental swipe back during checkout
        }}
      />

      {/* Gamification Screens */}
      <Stack.Screen
        name="CourseAchievements"
        component={CourseAchievementsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="DailyQuests"
        component={DailyQuestsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

export default CourseStack;
