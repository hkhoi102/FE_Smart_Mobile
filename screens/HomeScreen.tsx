import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LogoutButton from '../components/LogoutButton';
import AppStateManager from '../utils/AppStateManager';

export default function HomeScreen({ navigation }: any) {
  const handleLogout = () => {
    // Chuyển về màn hình Login sau khi logout
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleResetAppState = async () => {
    try {
      const appStateManager = AppStateManager.getInstance();
      await appStateManager.resetAppState();

      // Chuyển về Splash screen để test lại flow
      navigation.reset({
        index: 0,
        routes: [{ name: 'Splash' }],
      });
    } catch (error) {
      console.error('Error resetting app state:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Home Screen!</Text>
      <Text style={styles.subtitle}>You are successfully logged in</Text>

      <LogoutButton onLogout={handleLogout} />

      <TouchableOpacity style={styles.resetButton} onPress={handleResetAppState}>
        <Text style={styles.resetButtonText}>Reset App State (Test Onboarding)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1B',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7C7C7C',
    marginBottom: 30,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
