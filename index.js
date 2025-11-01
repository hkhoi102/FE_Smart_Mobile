import { registerRootComponent } from 'expo';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { LogBox } from 'react-native';

import AppNavigator from './navigations/AppNavigator';

// Ẩn tất cả warnings/errors về duplicate keys
if (__DEV__) {
  // Override console.warn
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('Encountered two children with the same key') ||
      message.includes('Keys should be unique') ||
      message.includes('Non-unique keys may cause') ||
      message.includes('same key')
    ) {
      return; // Bỏ qua warning về duplicate keys
    }
    originalWarn.apply(console, args);
  };

  // Override console.error
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('Encountered two children with the same key') ||
      message.includes('Keys should be unique') ||
      message.includes('Non-unique keys may cause') ||
      message.includes('same key')
    ) {
      return; // Bỏ qua error về duplicate keys
    }
    originalError.apply(console, args);
  };

  LogBox.ignoreLogs([
    'Encountered two children with the same key',
    'Keys should be unique',
    'Non-unique keys may cause',
  ]);
}

function App() {
  const [loaded] = useFonts({
    SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}

registerRootComponent(App);
