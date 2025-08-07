import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import AppStateManager from '../utils/AppStateManager';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('imshuvo97@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShakeAnimation = () => {
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    };

    // Start initial animation
    startShakeAnimation();

    // Set up interval for repeating animation every 3 seconds
    const interval = setInterval(startShakeAnimation, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      console.log('Login:', { email, password });

      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Lưu trạng thái đăng nhập
      const appStateManager = AppStateManager.getInstance();
      const mockToken = 'mock_jwt_token_' + Date.now();
      const mockUserData = {
        id: 1,
        email: email,
        name: 'User',
        avatar: null
      };

      await appStateManager.saveLoginData(mockToken, mockUserData);

      // Chuyển đến màn hình chính
      navigation.replace('Root');
    } catch (error) {
      console.error('Login error:', error);
      // Có thể hiển thị thông báo lỗi ở đây
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password');
    // Handle forgot password logic here
  };

  const handleSignup = () => {
    console.log('Navigate to signup');
    navigation.navigate('SignUp');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Calculate shake transform
  const shakeTransform = shakeAnimation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Animated.Image
              source={require('../assets/images/carot.png')}
              style={[
                styles.carrotLogo,
                {
                  transform: [{ rotate: shakeTransform }],
                }
              ]}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Loging</Text>
            <Text style={styles.subtitle}>Enter your emails and password</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#7C7C7C"
              />
              <View style={styles.inputUnderline} />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#7C7C7C"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={togglePasswordVisibility}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color="#7C7C7C"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.inputUnderline} />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={isLoading ? "Logging In..." : "Log In"}
              onPress={handleLogin}
              disabled={isLoading}
            />
          </View>

          {/* Signup Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              Don't have an account?{' '}
              <Text style={styles.signupLink} onPress={handleSignup}>
                Singup
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 50,
  },
  // Logo styles
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  carrotLogo: {
    width: 80,
    height: 80,
  },
  // Title styles
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1D1D1B',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7C7C7C',
    textAlign: 'center',
  },
  // Form styles
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    color: '#1D1D1B',
    marginBottom: 10,
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    color: '#1D1D1B',
    paddingVertical: 15,
    paddingHorizontal: 0,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1B',
    paddingVertical: 15,
    paddingHorizontal: 0,
  },
  eyeIcon: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputUnderline: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 5,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#7C7C7C',
  },
  // Button styles
  buttonContainer: {
    marginBottom: 30,
  },
  // Signup styles
  signupContainer: {
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#7C7C7C',
  },
  signupLink: {
    color: '#53B175',
    fontWeight: 'bold',
  },
});
