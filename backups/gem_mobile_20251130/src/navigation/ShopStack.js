/**
 * Gemral - Shop Navigation Stack
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
} from '../screens/Shop';
import GemPurchaseSuccessScreen from '../screens/Wallet/GemPurchaseSuccessScreen';

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
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
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

      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
  );
};

export default ShopStack;
