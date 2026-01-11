/**
 * Gemral - Shop Navigation Stack
 * Enhanced with Wishlist, Recently Viewed, and Categories screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ShopScreen,
  ProductDetailScreen,
  CartScreen,
  CheckoutScreen,
  CheckoutWebView,
  OrderSuccessScreen,
  OrdersScreen,
  OrderDetailScreen,
  ProductSearchScreen,
  ProductListScreen,
} from '../screens/Shop';
import WishlistScreen from '../screens/Shop/WishlistScreen';
import RecentlyViewedScreen from '../screens/Shop/RecentlyViewedScreen';
import AllCategoriesScreen from '../screens/Shop/AllCategoriesScreen';
import GemPurchaseSuccessScreen from '../screens/Wallet/GemPurchaseSuccessScreen';
import GemPurchasePendingScreen from '../screens/Wallet/GemPurchasePendingScreen';

// Course Screens (LMS)
import CoursesScreen from '../screens/Courses/CoursesScreen';
import CourseDetailScreen from '../screens/Courses/CourseDetailScreen';
import LessonPlayerScreen from '../screens/Courses/LessonPlayerScreen';
import QuizScreen from '../screens/Courses/QuizScreen';
import CertificateScreen from '../screens/Courses/CertificateScreen';
import CourseCheckout from '../screens/Courses/CourseCheckout';
import { CourseAchievementsScreen } from '../screens/Gamification';

// Payment Status Screens (Bank Transfer)
import PaymentStatusScreen from '../screens/Shop/PaymentStatusScreen';
import PaymentSuccessScreen from '../screens/Shop/PaymentSuccessScreen';
import PaymentExpiredScreen from '../screens/Shop/PaymentExpiredScreen';

const Stack = createNativeStackNavigator();

const ShopStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ShopMain" component={ShopScreen} />
      <Stack.Screen name="ProductSearch" component={ProductSearchScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />

      {/* Shop Enhancement Screens */}
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="RecentlyViewedScreen" component={RecentlyViewedScreen} />
      <Stack.Screen name="AllCategories" component={AllCategoriesScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />

      {/* Checkout WebView - Fullscreen Modal */}
      <Stack.Screen
        name="CheckoutWebView"
        component={CheckoutWebView}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          gestureEnabled: false, // Prevent accidental dismissal
        }}
      />

      {/* Order Success Screen */}
      <Stack.Screen
        name="OrderSuccess"
        component={OrderSuccessScreen}
        options={{
          headerShown: false,
          gestureEnabled: false, // Prevent swipe back
          animation: 'fade',
        }}
      />

      {/* Gem Purchase Success Screen - for gem package purchases */}
      <Stack.Screen
        name="GemPurchaseSuccess"
        component={GemPurchaseSuccessScreen}
        options={{
          headerShown: false,
          gestureEnabled: false, // Prevent swipe back
          animation: 'fade',
        }}
      />

      {/* Gem Purchase PENDING Screen - shows after order created, before payment confirmed */}
      <Stack.Screen
        name="GemPurchasePending"
        component={GemPurchasePendingScreen}
        options={{
          headerShown: false,
          gestureEnabled: false, // Prevent swipe back
          animation: 'fade',
        }}
      />

      {/* Payment Status Screen - Bank Transfer with QR Code and Countdown */}
      <Stack.Screen
        name="PaymentStatus"
        component={PaymentStatusScreen}
        options={{
          headerShown: true,
          title: 'Trạng thái thanh toán',
          headerBackVisible: false, // Prevent going back during payment
          gestureEnabled: false,
          headerStyle: {
            backgroundColor: '#0F1030',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />

      {/* Payment Success Screen - Bank Transfer Confirmed */}
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{
          headerShown: false,
          gestureEnabled: false, // Prevent swipe back
          animation: 'fade',
        }}
      />

      {/* Payment Expired Screen - Bank Transfer Timeout */}
      <Stack.Screen
        name="PaymentExpired"
        component={PaymentExpiredScreen}
        options={{
          headerShown: true,
          title: 'Đơn hàng hết hạn',
          headerBackVisible: false,
          headerStyle: {
            backgroundColor: '#0F1030',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />

      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />

      {/* Course Screens - LMS inside Shop for bottom bar visibility */}
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
          gestureEnabled: false,
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
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="CourseAchievements"
        component={CourseAchievementsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

export default ShopStack;
