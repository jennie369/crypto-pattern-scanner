/**
 * Gemral - Course Navigation Stack
 * Navigation structure for LMS features
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CoursesScreen from '../screens/Courses/CoursesScreen';
import CourseDetailScreen from '../screens/Courses/CourseDetailScreen';
import LessonPlayerScreen from '../screens/Courses/LessonPlayerScreen';

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
    </Stack.Navigator>
  );
};

export default CourseStack;
