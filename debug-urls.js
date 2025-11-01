// Debug script to check which URLs are being used
const { Platform } = require('react-native');

// Simulate the config logic
const API_CONFIG = {
  DEVELOPMENT: {
    ANDROID_EMULATOR: 'http://10.0.2.2:8085',
    ANDROID_DEVICE: 'http://192.168.31.117:8085',
    IOS_SIMULATOR: 'http://localhost:8085',
    IOS_DEVICE: 'http://192.168.31.117:8085',
  }
};

const getBaseURL = () => {
  const isDevelopment = true; // __DEV__ equivalent

  if (Platform.OS === 'android') {
    return API_CONFIG.DEVELOPMENT.ANDROID_DEVICE;
  } else if (Platform.OS === 'ios') {
    return API_CONFIG.DEVELOPMENT.IOS_DEVICE;
  }

  return API_CONFIG.DEVELOPMENT.ANDROID_DEVICE;
};

const getDirectAuthURL = () => {
  return 'http://192.168.31.117:8081';
};

console.log('🔍 URL Configuration Debug:');
console.log('Platform.OS:', Platform.OS);
console.log('Base URL (API Gateway):', getBaseURL());
console.log('Direct Auth URL:', getDirectAuthURL());
console.log('');

// Test the URLs
async function testUrls() {
  const baseURL = getBaseURL();
  const directURL = getDirectAuthURL();

  console.log('🧪 Testing URLs...');

  // Test API Gateway
  try {
    console.log('Testing API Gateway:', baseURL);
    const response = await fetch(`${baseURL}/api/auth/health`);
    const data = await response.text();
    console.log('✅ API Gateway OK:', data);
  } catch (error) {
    console.error('❌ API Gateway Failed:', error.message);
  }

  // Test Direct Auth
  try {
    console.log('Testing Direct Auth:', directURL);
    const response = await fetch(`${directURL}/api/auth/health`);
    const data = await response.text();
    console.log('✅ Direct Auth OK:', data);
  } catch (error) {
    console.error('❌ Direct Auth Failed:', error.message);
  }
}

testUrls();
