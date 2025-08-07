import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import PrimaryButton from '../components/PrimaryButton';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.4;

export default function SignInScreen({ navigation }: any) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleContinueWithPhone = () => {
    // Xử lý đăng nhập bằng số điện thoại
    console.log('Phone number:', phoneNumber);
    // Navigate to verification screen
    navigation.navigate('Verification');
  };

  const handleContinueWithGoogle = () => {
    // Xử lý đăng nhập bằng Google
    console.log('Continue with Google');
  };

  const handleContinueWithFacebook = () => {
    // Xử lý đăng nhập bằng Facebook
    console.log('Continue with Facebook');
  };

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 2],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [1, 1.2],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [1, 0.8, 0.6],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
    outputRange: [1.5, 1, 1.3],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            transform: [
              { translateY: headerTranslateY },
              { scale: headerScale },
            ],
            opacity: headerOpacity,
          },
        ]}
      >
        <Animated.Image
          source={require('../assets/images/mark.png')}
          style={[
            styles.headerImage,
            {
              transform: [{ scale: imageScale }],
            },
          ]}
          resizeMode="cover"
        />

      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.spacer} />
        <View style={styles.loginSection}>
          <Text style={styles.title}>Get your groceries with nectar</Text>

          {/* Phone Number Input */}
          <View style={styles.phoneInputContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.flag}>🇧🇩</Text>
              <Text style={styles.countryCodeText}>+880</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          <PrimaryButton
            title="Continue with Phone"
            onPress={handleContinueWithPhone}
            style={styles.phoneButton}
          />

          {/* Separator */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>Or connect with social media</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Social Media Buttons */}
          <TouchableOpacity style={styles.googleButton} onPress={handleContinueWithGoogle}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.facebookButton} onPress={handleContinueWithFacebook}>
            <Text style={styles.facebookIcon}>f</Text>
            <Text style={styles.facebookText}>Continue with Facebook</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: HEADER_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: HEADER_HEIGHT,
  },
  spacer: {
    height: 20,
  },
  loginSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1B',
    marginBottom: 30,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#F8F8F8',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#1D1D1B',
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#1D1D1B',
  },
  phoneButton: {
    marginBottom: 30,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  separatorText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#7C7C7C',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    color: '#4285F4',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 15,
  },
  googleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  facebookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1877F2',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  facebookIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    color: '#1877F2',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 15,
  },
  facebookText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
