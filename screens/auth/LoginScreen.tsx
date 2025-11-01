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
import PrimaryButton from '../../components/PrimaryButton';
import { authApi } from '../../services/api';
import AppStateManager from '../../utils/AppStateManager';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
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

  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (isLoading) return;

    // Validate input
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Login:', { email, password });

      // Call real API
      const response = await authApi.login({ email, password });

      if (response.success && response.data) {
        // Save login data
        const appStateManager = AppStateManager.getInstance();
        await appStateManager.saveLoginData(response.data.token || response.data.accessToken, response.data.user);

        // Navigate to main screen
        navigation.replace('Root');
      } else {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      let errorMessage = 'Đăng nhập thất bại';

      // The AuthApi already handles error messages, so just use them
      if (error.message) {
        errorMessage = error.message;
      }

      // Additional network error handling
      if (error.message?.includes('timeout')) {
        errorMessage = 'Kết nối timeout, vui lòng kiểm tra mạng';
      } else if (error.message?.includes('Network request failed')) {
        errorMessage = 'Không thể kết nối đến server';
      }

      setError(errorMessage);
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
              source={require('../../assets/images/carot.png')}
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
            <Text style={styles.title}>Đăng Nhập</Text>
            <Text style={styles.subtitle}>Nhập email và mật khẩu của bạn</Text>
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
                autoCorrect={false}
                autoComplete="off"
                placeholder="Nhập email của bạn"
                placeholderTextColor="#7C7C7C"
              />
              <View style={styles.inputUnderline} />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mật Khẩu</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Nhập mật khẩu của bạn"
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
              <Text style={styles.forgotPasswordText}>Quên Mật Khẩu?</Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#E53E3E" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Login Button */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
              onPress={handleLogin}
              disabled={isLoading}
            />
          </View>

          {/* Signup Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              Chưa có tài khoản?{' '}
              <Text style={styles.signupLink} onPress={handleSignup}>
                Đăng Ký
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
  // Error styles
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderColor: '#FED7D7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
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
