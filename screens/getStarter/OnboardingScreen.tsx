import React from 'react';
import {
    Dimensions,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }: any) {
  const handleGetStarted = () => {
    navigation.replace('SignIn');
  };

  return (
    <ImageBackground
      source={require('../../assets/images/get_start.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/Group.png')}
              style={styles.carrotIcon}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              Chào mừng{'\n'}đến cửa hàng
            </Text>
            <Text style={styles.description}>
              Nhận hàng tạp hóa nhanh chóng trong vòng một giờ
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton title="Bắt Đầu" onPress={handleGetStarted} />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  carrotIcon: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#fff',
    lineHeight: 42,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
    lineHeight: 24,
    opacity: 0.9,
  },
  footer: {
    paddingHorizontal: 20,
    marginBottom: 80,
  },
});
