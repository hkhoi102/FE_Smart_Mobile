import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import ExclusiveOfferSection from '../components/ExclusiveOfferSection';
import SearchBar from '../components/SearchBar';
import { RootStackParamList } from '../types/navigation';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Hàm shake
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      shake();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleProductPress = (product: any) => {
    navigation.navigate('ProductDetail', { id: product.id, data: products });
  };

  const banners = [
    {
      image: require('../assets/images/OI.jpg'),
      title: 'Fresh Vegetables',
      subtitle: 'Get Up To 40% OFF',
    },
    {
      image: require('../assets/images/O.jpg'),
      title: 'Fresh Fruits',
      subtitle: 'Get Up To 30% OFF',
    },
    {
      image: require('../assets/images/OIPm.jpg'),
      title: 'Organic Foods',
      subtitle: 'Get Up To 20% OFF',
    },
  ];

  const products = [
    {
      id: '1',
      image: require('../assets/images/product/rau.png'),
      name: 'Organic Bananas',
      desc: '7pcs, Priceg',
      price: '$4.99',
      onAdd: () => {},
    },
    {
      id: '2',
      image: require('../assets/images/product/thit.png'),
      name: 'Red Apple',
      desc: '1kg, Priceg',
      price: '$4.99',
      onAdd: () => {},
    },
    {
      id: '3',
      image: require('../assets/images/product/tao.png'),
      name: 'Red Apple',
      desc: '1kg, Priceg',
      price: '$4.99',
      onAdd: () => {},
    },
  ];

  const bestSelling = [
    {
      id: '4',
      image: require('../assets/images/illustration.png'),
      name: 'Green Grapes',
      desc: '500g, Priceg',
      price: '$3.99',
      onAdd: () => {},
    },
    {
      id: '5',
      image: require('../assets/images/mark.png'),
      name: 'Fresh Carrot',
      desc: '1kg, Priceg',
      price: '$2.99',
      onAdd: () => {},
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % banners.length;
      setCurrentIndex(nextIndex);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          x: nextIndex * (width - 40),
          animated: true,
        });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const onScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / (width - 40));
    setCurrentIndex(slide);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <Animated.Image
        source={require('../assets/images/carot.png')}
        style={[styles.carrotIcon, { transform: [{ translateX: shakeAnim }] }]}
      />
      <View style={styles.locationRow}>
        <MaterialIcons name="location-on" size={20} color="#222" />
        <Text style={styles.locationText}>Dhaka, <Text style={styles.bold}>Banassre</Text></Text>
      </View>
      <SearchBar value={search} onChangeText={setSearch} />
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {banners.map((banner, idx) => (
            <View style={styles.bannerSlide} key={idx}>
              <Image source={banner.image} style={styles.bannerImage} />
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.indicatorContainer}>
          {banners.map((_, idx) => (
            <View
              key={idx}
              style={[styles.indicatorDot, currentIndex === idx && styles.indicatorDotActive]}
            />
          ))}
        </View>
      </View>
      <ExclusiveOfferSection
        title="Exclusive Offer"
        data={products}
        onSeeAll={() => {}}
        onProductPress={handleProductPress}
      />
      <ExclusiveOfferSection
        title="Best Selling"
        data={products}
        onSeeAll={() => {}}
        onProductPress={handleProductPress}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    // alignItems: 'center', // Bỏ dòng này để tránh bóp chiều rộng
    paddingTop: 50,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  carrotIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginTop: 16,
    marginBottom: 12,
    alignSelf: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    justifyContent: 'center',
  },
  locationText: {
    marginLeft: 6,
    fontSize: 18,
    color: '#222',
    fontWeight: '500',
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
  },
  carouselContainer: {
    width: width - 40,
    height: 180,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  bannerSlide: {
    width: width - 40,
    height: 180,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    resizeMode: 'cover',
  },
  bannerTitle: {
    color: '#222',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  bannerSubtitle: {
    color: '#6FCF97',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'right',
  },
  bannerTextContainer: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -32 }],
    alignItems: 'flex-end',

    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
  },
  indicatorDot: {
    width: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 3,
  },
  indicatorDotActive: {
    backgroundColor: '#6FCF97',
    width: 24,
  },
});
