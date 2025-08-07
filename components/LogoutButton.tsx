import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import AppStateManager from '../utils/AppStateManager';

interface LogoutButtonProps {
  onLogout?: () => void;
}

export default function LogoutButton({ onLogout }: LogoutButtonProps) {
  const handleLogout = async () => {
    try {
      const appStateManager = AppStateManager.getInstance();
      await appStateManager.logout();

      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    margin: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
