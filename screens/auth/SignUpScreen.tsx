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

const { width, height } = Dimensions.get('window');

export default function SignUpScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSignUp = async () => {
    if (isLoading) return;

    // Validate input
    if (!username.trim()) {
      setError('Vui lòng nhập họ tên');
      return;
    }
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Sign Up:', { fullName: username, email, password, phoneNumber });

      // Call API through gateway
      const response = await authApi.register({
        fullName: username,
        email,
        password,
        phoneNumber
      });

      if (response.success && response.data) {
        // Navigate to OTP verification screen
        navigation.navigate('OtpVerification', {
          email: email,
          fullName: username
        });
      } else {
        throw new Error(response.message || 'Đăng ký thất bại');
      }
    } catch (error: any) {
      let errorMessage = 'Đăng ký thất bại';

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

  const handleLogin = () => {
    console.log('Navigate to login');
    navigation.navigate('Login');
  };

  const handleTermsOfService = () => {
    console.log('Open Terms of Service');
    // Handle terms of service logic here
  };

  const handlePrivacyPolicy = () => {
    console.log('Open Privacy Policy');
    // Handle privacy policy logic here
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
            <Text style={styles.title}>Đăng Ký</Text>
            <Text style={styles.subtitle}>Nhập thông tin để tiếp tục</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tên người dùng</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="off"
                placeholder="Nhập tên người dùng"
                placeholderTextColor="#7C7C7C"
              />
              <View style={styles.inputUnderline} />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.emailContainer}>
                <TextInput
                  style={styles.emailInput}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  placeholder="Nhập email của bạn"
                  placeholderTextColor="#7C7C7C"
                />
                <View style={styles.checkIcon}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#53B175"
                  />
                </View>
              </View>
              <View style={styles.inputUnderline} />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
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

            {/* Phone Number Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder="Nhập số điện thoại của bạn"
                placeholderTextColor="#7C7C7C"
              />
              <View style={styles.inputUnderline} />
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#E53E3E" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Terms and Privacy */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              Bằng cách tiếp tục, bạn đồng ý với{' '}
              <Text style={styles.termsLink} onPress={handleTermsOfService}>
                Điều Khoản Dịch Vụ
              </Text>
              {' '}và{' '}
              <Text style={styles.termsLink} onPress={handlePrivacyPolicy}>
                Chính Sách Bảo Mật
              </Text>
            </Text>
          </View>

          {/* Sign Up Button */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={isLoading ? "Đang đăng ký..." : "Đăng Ký"}
              onPress={handleSignUp}
              disabled={isLoading}
            />
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Đã có tài khoản?{' '}
              <Text style={styles.loginLink} onPress={handleLogin}>
                Đăng Nhập
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
    color: '#7C7C7C',
    marginBottom: 10,
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    color: '#1D1D1B',
    paddingVertical: 15,
    paddingHorizontal: 0,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailInput: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1B',
    paddingVertical: 15,
    paddingHorizontal: 0,
  },
  checkIcon: {
    padding: 5,
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
  // Terms styles
  termsContainer: {
    marginBottom: 30,
  },
  termsText: {
    fontSize: 14,
    color: '#7C7C7C',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#53B175',
    fontWeight: '500',
  },
  // Button styles
  buttonContainer: {
    marginBottom: 30,
  },
  // Login styles
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#1D1D1B',
  },
  loginLink: {
    color: '#53B175',
    fontWeight: 'bold',
  },
});
