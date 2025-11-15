import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { NotificationProvider } from '../contexts/NotificationContext';
import AppStateManager from '../utils/AppStateManager';

import { HapticTab } from '../components/HapticTab';
import { IconSymbol } from '../components/ui/IconSymbol';
import TabBarBackground from '../components/ui/TabBarBackground';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

// Import types
import { RootStackParamList, TabParamList } from '../types/navigation';

// Import screens
import AccountScreen from '../screens/account/AccountScreen';
import OrderDetailScreen from '../screens/account/OrderDetailScreen';
import OrdersScreen from '../screens/account/OrdersScreen';
import ProfileScreen from '../screens/account/ProfileScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import CartScreen from '../screens/cart/CartScreen';
import FavouriteScreen from '../screens/favourite/FavouriteScreen';
import LocationScreen from '../screens/getStarter/LocationScreen';
import OnboardingScreen from '../screens/getStarter/OnboardingScreen';
import SplashScreen from '../screens/getStarter/SplashScreen';
import VerificationScreen from '../screens/getStarter/VerificationScreen';
import ExploreScreen from '../screens/main/ExploreScreen';
import HomeScreen from '../screens/main/HomeScreen';
import NotFoundScreen from '../screens/notification/NotFoundScreen';
import OrderSuccessScreen from '../screens/notification/OrderSuccessScreen';
import CategoryDetailScreen from '../screens/product/CategoryDetailScreen';
import FilterScreen from '../screens/product/filter/FilterScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import SeeAllScreen from '../screens/product/SeeAllScreen';
import ScannerScreen from '../screens/scanner/ScannerScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import AboutScreen from '../screens/account/AboutScreen';
import NotificationScreen from '../screens/account/NotificationScreen';
import HelpScreen from '../screens/account/HelpScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].green,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tab.Screen
        name="Shop"
        component={HomeScreen}
        options={{
          title: 'Cửa Hàng',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="storefront" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: 'Danh mục',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="bag.fill" color={color} />
          ),
        }}
      />
      {false && (
        <Tab.Screen
          name="Scanner"
          component={ScannerScreen}
          options={{
            title: 'Quét Mã',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="qrcode" color={color} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'Giỏ Hàng',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="cart" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Favourite"
        component={FavouriteScreen}
        options={{
          title: 'Yêu Thích',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="heart" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: 'Tài Khoản',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const resolveInitial = async () => {
      const screen = await AppStateManager.getInstance().getInitialScreen();
      if (isMounted) setInitialRoute(screen);
    };
    resolveInitial();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!initialRoute) {
    return (
      <NotificationProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
            <Stack.Screen name="Splash" component={SplashScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </NotificationProvider>
    );
  }

  return (
    <NotificationProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute as any}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="Verification" component={VerificationScreen} />
        <Stack.Screen name="Location" component={LocationScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
        <Stack.Screen name="Root" component={TabNavigator} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} />
        <Stack.Screen  name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
        <Stack.Screen name="Filter" component={FilterScreen} />
        <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
        <Stack.Screen name="Scanner" component={ScannerScreen} />
        <Stack.Screen name="SeeAll" component={SeeAllScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </NotificationProvider>
  );
}
