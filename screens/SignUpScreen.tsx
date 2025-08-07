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

const { width, height } = Dimensions.get('window');

export default function SignUpScreen({ navigation }: any) {
  const [username, setUsername] = useState('Afsar Hossen Shuvo');
  const [email, setEmail] = useState('imshuvo97@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  const handleSignUp = () => {
    console.log('Sign Up:', { username, email, password });
    // Handle sign up logic here
    navigation.navigate('Root');
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
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>Enter your credentials to continue</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
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
          </View>

          {/* Terms and Privacy */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By continuing you agree to our{' '}
              <Text style={styles.termsLink} onPress={handleTermsOfService}>
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text style={styles.termsLink} onPress={handlePrivacyPolicy}>
                Privacy Policy
              </Text>
            </Text>
          </View>

          {/* Sign Up Button */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title="Sing Up"
              onPress={handleSignUp}
            />
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginLink} onPress={handleLogin}>
                Login
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
