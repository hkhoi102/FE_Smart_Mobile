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
import { useNotification } from '../../contexts/NotificationContext';
import { authApi } from '../../services/api';

const { width, height } = Dimensions.get('window');

interface OtpVerificationScreenProps {
  navigation: any;
  route: {
    params: {
      email: string;
      fullName: string;
    };
  };
}

export default function OtpVerificationScreen({ navigation, route }: OtpVerificationScreenProps) {
  const { email, fullName } = route.params;
  const { showSuccess, showAlert } = useNotification();
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const handleVerifyOtp = async () => {
    if (isLoading) return;

    // Validate input
    if (!otpCode.trim()) {
      setError('Vui lòng nhập mã OTP');
      return;
    }

    if (otpCode.length !== 6) {
      setError('Mã OTP phải có 6 chữ số');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.verifyOtp({
        email,
        otp: otpCode
      });

      if (response.success) {
        // Show success message
        showAlert(
          'Thành công',
          'Tài khoản đã được kích hoạt thành công!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to login screen
                navigation.navigate('Login');
              }
            }
          ]
        );
      } else {
        throw new Error(response.data?.message || 'Xác thực OTP thất bại');
      }
    } catch (error: any) {
      let errorMessage = 'Xác thực OTP thất bại';

      if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResending || !canResend) return;

    setIsResending(true);
    setError('');

    try {
      const response = await authApi.resendOtp(email);

      if (response.success) {
        setTimeLeft(60);
        setCanResend(false);
        showSuccess('Mã OTP mới đã được gửi đến email của bạn');
      } else {
        throw new Error('Gửi lại OTP thất bại');
      }
    } catch (error: any) {
      let errorMessage = 'Gửi lại OTP thất bại';

      if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignUp = () => {
    navigation.goBack();
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
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToSignUp}
          >
            <Ionicons name="arrow-back" size={24} color="#1D1D1B" />
          </TouchableOpacity>

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
            <Text style={styles.title}>Xác Thực OTP</Text>
            <Text style={styles.subtitle}>
              Chúng tôi đã gửi mã xác thực đến{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* OTP Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mã OTP</Text>
              <TextInput
                style={styles.otpInput}
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="Nhập mã 6 chữ số"
                placeholderTextColor="#7C7C7C"
                autoFocus
              />
              <View style={styles.inputUnderline} />
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#E53E3E" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Resend OTP */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Không nhận được mã?{' '}
                {canResend ? (
                  <TouchableOpacity onPress={handleResendOtp} disabled={isResending}>
                    <Text style={styles.resendLink}>
                      {isResending ? 'Đang gửi...' : 'Gửi lại'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.timerText}>
                    Gửi lại sau {timeLeft}s
                  </Text>
                )}
              </Text>
            </View>
          </View>

          {/* Verify Button */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={isLoading ? "Đang xác thực..." : "Xác Thực"}
              onPress={handleVerifyOtp}
              disabled={isLoading}
            />
          </View>

          {/* Back to Sign Up */}
          <View style={styles.backToSignUpContainer}>
            <Text style={styles.backToSignUpText}>
              Sai email?{' '}
              <Text style={styles.backToSignUpLink} onPress={handleBackToSignUp}>
                Quay lại đăng ký
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
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  // Back button
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
    marginBottom: 20,
  },
  // Logo styles
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D1D1B',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7C7C7C',
    textAlign: 'center',
    lineHeight: 24,
  },
  emailText: {
    color: '#53B175',
    fontWeight: '600',
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
  otpInput: {
    fontSize: 24,
    color: '#1D1D1B',
    paddingVertical: 15,
    paddingHorizontal: 0,
    textAlign: 'center',
    letterSpacing: 8,
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
  // Resend styles
  resendContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  resendText: {
    fontSize: 14,
    color: '#7C7C7C',
  },
  resendLink: {
    color: '#53B175',
    fontWeight: '600',
  },
  timerText: {
    color: '#7C7C7C',
    fontWeight: '500',
  },
  // Button styles
  buttonContainer: {
    marginBottom: 30,
  },
  // Back to sign up styles
  backToSignUpContainer: {
    alignItems: 'center',
  },
  backToSignUpText: {
    fontSize: 16,
    color: '#1D1D1B',
  },
  backToSignUpLink: {
    color: '#53B175',
    fontWeight: 'bold',
  },
});
