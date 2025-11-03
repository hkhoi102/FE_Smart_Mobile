import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { useNotification } from '../../contexts/NotificationContext';
import { CartStore } from '../../stores/CartStore';
import { FavouriteStore } from '../../stores/FavouriteStore';
import { RootStackParamList } from '../../types/navigation';

const FavouriteScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { items: favouriteProducts } = FavouriteStore.useFavourites();
  const { showSuccess } = useNotification();

  const handleProductPress = (product: any) => {
    if (product.unitId) {
      navigation.navigate('ProductDetail', { id: String(product.productId), unitId: product.unitId });
    } else {
      navigation.navigate('ProductDetail', { id: String(product.productId) });
    }
  };

  const renderItem = ({ item }: { item: typeof favouriteProducts[0] }) => (
    <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={() => handleProductPress(item)}>
      <Image source={item.image || require('../../assets/images/product/rau.png')} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc}>{item.desc || 'Sản phẩm chất lượng'}</Text>
      </View>
      <Text style={styles.itemPrice}>{item.price}</Text>
      <TouchableOpacity
        style={{ padding: 8, marginLeft: 8 }}
        onPress={() => {
          FavouriteStore.removeItem(item.id);
        }}
      >
        <Ionicons name="heart" size={22} color="#10B981" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={64} color="#B6B6B6" />
      <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
      <Text style={styles.emptySubtitle}>
        Hãy thêm sản phẩm vào yêu thích để xem lại dễ dàng!
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.header}>Yêu Thích</Text>
        {favouriteProducts.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={favouriteProducts}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.id || `favourite-${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={renderEmptyState()}
          />
        )}
      </View>
      {favouriteProducts.length > 0 && (
        <View style={styles.fixedBtn}>
          <PrimaryButton title="Thêm Tất Cả Vào Giỏ" onPress={() => {
            if (favouriteProducts.length === 0) return;

            let addedCount = 0;
            let skippedCount = 0;

            favouriteProducts.forEach((item) => {
              try {
                // Parse price from string (e.g., "50.000đ" -> 50000)
                let price = 0;
                if (item.price) {
                  const priceStr = item.price.replace(/[^\d]/g, ''); // Remove all non-digit characters
                  price = parseInt(priceStr, 10) || 0;
                }

                // Skip items without valid price
                if (!price || price <= 0) {
                  skippedCount++;
                  return;
                }

                // Determine cart item ID and productUnitId
                // If item.id contains "_", it's productId_unitId format
                let cartItemId = item.id;
                let productUnitId = item.productUnitId || item.unitId;

                if (!productUnitId && item.id.includes('_')) {
                  // Extract unitId from id format "productId_unitId"
                  const parts = item.id.split('_');
                  if (parts.length === 2) {
                    cartItemId = parts[1]; // Use unitId as cart item id
                    productUnitId = parseInt(parts[1], 10);
                  }
                } else if (!productUnitId) {
                  // If no unitId, use productId as cart item id
                  cartItemId = String(item.productId || item.id);
                  productUnitId = undefined;
                } else {
                  cartItemId = String(productUnitId);
                }

                // Add to cart
                CartStore.addItem({
                  id: cartItemId,
                  name: item.name,
                  price: price,
                  quantity: 1,
                  image: item.image,
                  productUnitId: productUnitId,
                  productId: item.productId,
                  categoryId: item.categoryId,
                });

                addedCount++;
              } catch (e) {
                console.error('Error adding item to cart:', item, e);
              }
            });

            const message = skippedCount > 0
              ? `Đã thêm ${addedCount} sản phẩm (bỏ qua ${skippedCount} không có giá)`
              : `Đã thêm ${addedCount} sản phẩm vào giỏ hàng`;
            showSuccess(message);

            // Navigate to cart
            navigation.navigate('Root', { screen: 'Cart' });
          }} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 22,
    paddingHorizontal: 0,
  },
  itemImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginRight: 14,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 15,
    color: '#B6B6B6',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 8,
  },
  fixedBtn: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 100,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#B6B6B6',
    textAlign: 'center',
  },
});

export default FavouriteScreen;
