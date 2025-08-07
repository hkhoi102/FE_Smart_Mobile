import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import AppStateManager from '../utils/AppStateManager';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Đợi 2 giây để hiển thị splash screen
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Lấy màn hình khởi động dựa trên trạng thái app
        const appStateManager = AppStateManager.getInstance();
        const initialScreen = await appStateManager.getInitialScreen();

        // Chuyển đến màn hình tương ứng
        navigation.replace(initialScreen);
      } catch (error) {
        console.error('Error initializing app:', error);
        // Mặc định chuyển đến Onboarding nếu có lỗi
        navigation.replace('Onboarding');
      }
    };

    initializeApp();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/Group.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Supermarket App</Text>
        <Text style={styles.tagline}>Your grocery shopping companion</Text>
      </View>

      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#53B175',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 100,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.7,
  },
});
