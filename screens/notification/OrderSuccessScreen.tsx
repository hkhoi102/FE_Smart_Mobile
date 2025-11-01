import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../types/navigation';

const CONFETTI_COLORS = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#F44336', '#FFD600'];
const CONFETTI = [
  { top: 30, left: 60, size: 12, color: 0 },
  { top: 60, right: 80, size: 10, color: 1 },
  { bottom: 80, left: 40, size: 14, color: 2 },
  { bottom: 60, right: 60, size: 10, color: 3 },
  { top: 20, right: 40, size: 8, color: 4 },
  { bottom: 30, left: 100, size: 9, color: 5 },
];

const OrderSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Scale in
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
    // Shake 1 lần
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 80, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: 0.7, duration: 60, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true, easing: Easing.linear }),
    ]).start();
  }, []);

  const handleTrackOrder = () => {
    // Navigate to Orders screen
    navigation.navigate('Orders');
  };

  const handleBackToHome = () => {
    navigation.goBack();
  };

  const shake = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-10, 10],
  });

  return (
    <View style={styles.container}>
      {/* Confetti */}
      <View style={styles.confettiContainer} pointerEvents="none">
        {CONFETTI.map((item, idx) => (
          <Animated.View
            key={`confetti-${idx}-${item.color}-${item.size}`}
            style={[
              styles.confetti,
              {
                backgroundColor: CONFETTI_COLORS[item.color],
                width: item.size,
                height: item.size,
                borderRadius: item.size / 2,
                position: 'absolute',
                ...item,
                opacity: 0.85,
                transform: [
                  { scale: scaleAnim },
                  { translateY: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) },
                ],
              },
            ]}
          />
        ))}
      </View>
      {/* Animated Success Image */}
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            { translateX: shake },
          ],
        }}
      >
        <Image source={require('../../assets/images/donecart.png')} style={styles.successImage} />
      </Animated.View>
      <View style={styles.messageContainer}>
        <Text style={styles.successTitle}>Đơn Hàng Của Bạn Đã Được Đặt Thành Công</Text>
        <Text style={styles.successSubtitle}>
          Các sản phẩm của bạn đã được đặt và đang được xử lý
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.trackOrderButton} onPress={handleTrackOrder}>
          <Text style={styles.trackOrderText}>Theo Dõi Đơn Hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBackToHome} style={styles.backToHomeButton}>
          <Text style={styles.backToHomeText}>Về Trang Chủ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  confettiContainer: {
    position: 'absolute',
    width: '100%',
    height: 300,
    top: 0,
    left: 0,
    zIndex: 2,
  },
  confetti: {
    position: 'absolute',
  },
  successImage: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  messageContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  trackOrderButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  trackOrderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  backToHomeButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  backToHomeText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
});

export default OrderSuccessScreen;
