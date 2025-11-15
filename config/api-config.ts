import { Platform } from 'react-native';

// API Configuration
export const API_CONFIG = {
  // For development - change these IPs based on your network
  DEVELOPMENT: {
    ANDROID_EMULATOR: 'http://10.0.2.2:8085',
    ANDROID_DEVICE: 'http://103.229.52.246:8085', // Your actual IP
    IOS_SIMULATOR: 'http://localhost:8085',
    IOS_DEVICE: 'http://103.229.52.246:8085', // Your actual IP
  },
  // For production
  PRODUCTION: {
    BASE_URL: 'https://your-production-api.com',
  },
};

// Get the appropriate base URL based on platform and environment
export const getBaseURL = (): string => {
  const isDevelopment = __DEV__;

  if (!isDevelopment) {
    return API_CONFIG.PRODUCTION.BASE_URL;
  }

  // For now, always use the actual IP address for testing
  // You can add logic to detect emulator vs real device later
  if (Platform.OS === 'android') {
    return API_CONFIG.DEVELOPMENT.ANDROID_DEVICE; // Use actual IP
  } else if (Platform.OS === 'ios') {
    return API_CONFIG.DEVELOPMENT.IOS_DEVICE; // Use actual IP
  }

  return API_CONFIG.DEVELOPMENT.ANDROID_DEVICE; // fallback to actual IP
};

// Alternative: Direct connection to auth-service (bypass gateway for testing)
export const getDirectAuthURL = (): string => {
  // Use actual IP for both platforms for testing
  return 'http://192.168.31.117:8081'; // Your actual IP for direct connection
};
