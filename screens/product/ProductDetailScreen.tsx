import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { useNotification } from '../../contexts/NotificationContext';
import ProductApi from '../../services/api/ProductApi';
import { CartStore } from '../../stores/CartStore';
import { FavouriteStore } from '../../stores/FavouriteStore';
import { RootStackParamList } from '../../types/navigation';
import { ProductWithPrice } from '../../types/product';

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ProductDetail'>>();
  const navigation = useNavigation();
  const { id, unitId } = route.params;
  const { showSuccess } = useNotification();

  // State for product and loading
  const [product, setProduct] = useState<ProductWithPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Get favourite status from store (reactive)
  const { items: favouriteItems } = FavouriteStore.useFavourites();
  const getProductFavouriteId = () => {
    if (!product) return null;
    // Use unitId from params if available, otherwise use first available unit or product id
    const selectedUnitId = unitId !== undefined
      ? unitId
      : (product.units?.find(u => u.currentPrice !== null && u.currentPrice !== undefined)?.id
         || product.id);
    return unitId !== undefined ? `${product.id}_${selectedUnitId}` : String(product.id);
  };
  const productFavouriteId = getProductFavouriteId();
  const favorite = productFavouriteId ? FavouriteStore.isFavourite(productFavouriteId) : false;

  // Default images for products (fallback when no image from API)
  const defaultProductImages = [
    require('../../assets/images/product/rau.png'),
    require('../../assets/images/product/tao.png'),
    require('../../assets/images/product/thit.png'),
  ];

  // Fetch product details when component mounts
  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching product details with price for ID:', id);

      // Get product with price
      const productWithPrice = await ProductApi.getProductWithPrice(parseInt(id));
      console.log('📦 Product with price API response:', productWithPrice);

      if (productWithPrice) {
        console.log('✅ Product with price data:', productWithPrice);

        // Use fallback image if no image from API
        const processedProduct: ProductWithPrice = {
          ...productWithPrice,
          displayImage: productWithPrice.displayImage || defaultProductImages[0],
        };

        console.log('🎨 Processed product with price:', processedProduct);
        setProduct(processedProduct);
      } else {
        console.log('❌ Product with price not found');
        throw new Error('Product not found');
      }
    } catch (error: any) {
      console.error('❌ Error fetching product with price:', error);
      setError(error.message || 'Failed to load product');

      // Show fallback data on error
      console.log('🔄 Using fallback product...');
      const fallbackProduct: ProductWithPrice = {
        id: parseInt(id),
        name: 'Sản phẩm mẫu',
        description: 'Mô tả sản phẩm mẫu',
        categoryId: 1,
        active: true,
        createdAt: '',
        updatedAt: '',
        currentPrice: 50000,
        priceUnit: 'đơn vị',
        displayPrice: '50.000đ',
        displayImage: defaultProductImages[0],
      };
      setProduct(fallbackProduct);
    } finally {
      console.log('🏁 Product loading finished');
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#222" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="share-social-outline" size={22} color="#222" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#53B175" />
            <Text style={styles.loadingText}>Đang tải chi tiết sản phẩm...</Text>
          </View>
        </View>
      </View>
    );
  }

  // Render error state
  if (error && !product) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#222" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="share-social-outline" size={22} color="#222" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchProductDetails}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Render product not found
  if (!product) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#222" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="share-social-outline" size={22} color="#222" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchProductDetails}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Debug log
  console.log('🔍 ProductDetailScreen render - product:', product);
  console.log('🔍 Product name:', product?.name);
  console.log('🔍 Product price:', product?.displayPrice, product?.currentPrice);
  console.log('🔍 Product ID from route:', id);
  console.log('🔍 Loading state:', loading);
  console.log('🔍 Error state:', error);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Product Image + Header icons overlay */}
        <View style={{ position: 'relative' }}>
          <Image source={product.displayImage} style={styles.image} />
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#222" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="share-social-outline" size={22} color="#222" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Indicator */}

        {/* Info */}
        <View style={styles.infoRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {loading ? 'Đang tải...' : (product?.name || 'Không có tên')}
            </Text>
            <Text style={styles.desc}>
              {loading ? 'Đang tải mô tả...' : (product?.description || 'Sản phẩm chất lượng')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => {
            if (!product) return;

            const selectedUnitId = unitId !== undefined
              ? unitId
              : (product.units?.find(u => u.currentPrice !== null && u.currentPrice !== undefined)?.id
                 || product.id);
            const favouriteId = unitId !== undefined ? `${product.id}_${selectedUnitId}` : String(product.id);

            const favouriteItem = {
              id: favouriteId,
              productId: product.id,
              unitId: selectedUnitId !== product.id ? selectedUnitId : undefined,
              name: product.name,
              price: product.displayPrice || (product.currentPrice ? `${product.currentPrice.toLocaleString()}đ` : 'Liên hệ'),
              desc: product.description || '',
              image: product.displayImage,
              productUnitId: selectedUnitId !== product.id ? selectedUnitId : undefined,
              categoryId: (product as any).categoryId,
            };

            // Toggle yêu thích mà không hiện thông báo
            FavouriteStore.toggleItem(favouriteItem);
          }}>
            <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={28} color={favorite ? '#10B981' : '#B6B6B6'} />
          </TouchableOpacity>
        </View>
        {/* Quantity & Price */}
        <View style={styles.qtyRow}>
          <View style={styles.qtyBox}>
            <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.qtyBtn}>
              <Ionicons name="remove" size={20} color="#222" />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={styles.qtyBtn}>
              <Ionicons name="add" size={20} color="#222" />
            </TouchableOpacity>
          </View>
          <Text style={styles.price}>
            {loading ? 'Đang tải...' : (product?.displayPrice || (product?.currentPrice ? `${product.currentPrice.toLocaleString()}đ` : 'Liên hệ'))}
          </Text>
        </View>
        {/* Available Units */}
        {(() => {
          const filteredUnits = product.units?.filter((unit) => {
            // If unitId is specified, only show that unit
            if (unitId !== undefined) {
              return unit.id === unitId && unit.currentPrice !== null && unit.currentPrice !== undefined;
            }
            // Otherwise show all units with valid price
            return unit.currentPrice !== null && unit.currentPrice !== undefined;
          }) || [];

          // If unitId is specified and only 1 unit matches, don't show the section
          // (because we're showing only the specific unit that was clicked)
          if (unitId !== undefined && filteredUnits.length === 1) {
            return null;
          }

          // Show section if there are filtered units and more than 1 unit
          return filteredUnits.length > 1 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Các Đơn Vị Có Sẵn</Text>
            {filteredUnits.map((unit, index) => (
                <View key={unit?.id ? `unit-${unit.id}` : `unit-index-${index}`} style={styles.unitItem}>
                  <View style={styles.unitInfo}>
                    <Text style={styles.unitName}>{unit.unitName}</Text>
                    <Text style={styles.unitDescription}>{unit.unitDescription}</Text>
                  </View>
                  <Text style={styles.unitPrice}>
                    {unit.currentPrice.toLocaleString()}đ
                  </Text>
                </View>
              ))}
          </View>
          ) : null;
        })()}

        {/* Product Detail */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi Tiết Sản Phẩm</Text>
          <Text style={styles.sectionContent}>
            {product.description || 'Thông tin chi tiết sản phẩm sẽ được cập nhật sớm.'}
          </Text>
        </View>
        {/* Add to Basket */}
        <View style={{ height: 70 }} />
      </View>
      <View style={styles.fixedAddBtn}>
        <PrimaryButton title="Thêm Vào Giỏ" onPress={() => {
          if (!product) return;
          const unitId = product?.units?.find(u => u.isDefault)?.id
            || product?.units?.find(u => u.currentPrice !== null && u.currentPrice !== undefined)?.id
            || product.id;
          const priceNum = typeof product.currentPrice === 'number' ? product.currentPrice : 0;
          CartStore.addItem({
            id: String(unitId),
            name: product.name,
            price: priceNum,
            image: product.displayImage,
            productUnitId: Number(unitId) || undefined,
            productId: Number(product.id) || undefined,
            categoryId: (product as any).categoryId,
          });
          showSuccess('Đã thêm vào giỏ hàng');
          (navigation as any).navigate({ name: 'Root', params: { screen: 'Cart' } });
        }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 60,
  },
  headerRow: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F6F6F6',
    marginRight: 8,
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'contain',
    borderRadius: 18,

    marginBottom: 8,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  indicatorDot: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginHorizontal: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  desc: {
    fontSize: 15,
    color: '#888',
    marginBottom: 2,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 18,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: '#222',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 'auto',
  },
  unitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  unitInfo: {
    flex: 1,
  },
  unitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  unitDescription: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  unitPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#53B175',
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  sectionContent: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  fixedAddBtn: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Retry button
  retryButton: {
    backgroundColor: '#53B175',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductDetailScreen;
