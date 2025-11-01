import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProductCard from '../../components/ProductCard';
import { useNotification } from '../../contexts/NotificationContext';
import { CartStore } from '../../stores/CartStore';
import { RootStackParamList } from '../../types/navigation';

const SeeAllScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'SeeAll'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { title, items } = route.params;
  const { showSuccess } = useNotification();

  const handlePress = (item: any) => {
    const composed = String(item.id ?? '');
    const originalId = composed.includes('_') ? composed.split('_')[0] : composed;
    navigation.navigate('ProductDetail', { id: originalId });
  };

  const handleAddToCart = (item: any) => {
    const composed = String(item.id ?? '');
    const unitIdStr = composed.includes('_') ? composed.split('_')[1] : composed;
    const productIdStr = composed.includes('_') ? composed.split('_')[0] : composed;

    // Extract price from product.price (format: "99.000đ")
    const priceStr = item.price || '';
    const priceNum = priceStr.replace(/[^\d]/g, '');
    const priceNumber = priceNum ? Number(priceNum) : 0;

    CartStore.addItem({
      id: unitIdStr,
      name: item.name || 'Sản phẩm',
      price: priceNumber,
      image: item.image,
      productUnitId: composed.includes('_') ? Number(unitIdStr) : undefined,
      productId: Number(productIdStr) || undefined,
    });

    showSuccess('Đã thêm vào giỏ hàng');
  };

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.header}>{title}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(item, index) => item.id ? String(item.id) : `seeall-${index}`}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.8} onPress={() => handlePress(item)}>
            <ProductCard {...item} onAdd={() => handleAddToCart(item)} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
});

export default SeeAllScreen;


