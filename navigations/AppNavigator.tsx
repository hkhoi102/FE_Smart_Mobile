import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '../components/HapticTab';
import { IconSymbol } from '../components/ui/IconSymbol';
import TabBarBackground from '../components/ui/TabBarBackground';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

// Import types
import { RootStackParamList, TabParamList } from '../types/navigation';

// Import screens
import ExploreScreen from '../screens/ExploreScreen';
import HomeScreen from '../screens/HomeScreen';
import LocationScreen from '../screens/LocationScreen';
import LoginScreen from '../screens/LoginScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SplashScreen from '../screens/SplashScreen';
import VerificationScreen from '../screens/VerificationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
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
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="Verification" component={VerificationScreen} />
        <Stack.Screen name="Location" component={LocationScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Root" component={TabNavigator} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
