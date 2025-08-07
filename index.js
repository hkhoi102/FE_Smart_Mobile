import { registerRootComponent } from 'expo';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import AppNavigator from './navigations/AppNavigator';

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
