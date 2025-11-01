import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import AddButton from '../../components/AddButton';
import PrimaryButton from '../../components/PrimaryButton';
import { useNotification } from '../../contexts/NotificationContext';
import CategoryApi from '../../services/api/CategoryApi';
import ProductApi from '../../services/api/ProductApi';
import { CartStore } from '../../stores/CartStore';
import { RootStackParamList } from '../../types/navigation';
import { Product, ProductWithPrice } from '../../types/product';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

// Default images for products (fallback when no image from API)
const defaultProductImages = [
  require('../../assets/images/product/rau.png'),
  require('../../assets/images/product/tao.png'),
  require('../../assets/images/product/thit.png'),
];

// Process products for display
const processProducts = (products: Product[]): ProductWithPrice[] => {
  return products.map((product, index) => ({
    ...product,
    displayPrice: product.currentPrice ? `${product.currentPrice.toLocaleString()}đ` : 'Liên hệ',
    displayImage: product.imageUrl ? { uri: product.imageUrl } : defaultProductImages[index % defaultProductImages.length],
  }));
};

const CategoryDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'CategoryDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { categoryName, categoryId } = route.params;
  const { showSuccess } = useNotification();

  // State for products and loading
  const [products, setProducts] = useState<ProductWithPrice[]>([]);
  const [allProducts, setAllProducts] = useState<ProductWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter modal state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterCategories, setFilterCategories] = useState<{ id: string; name: string; selected: boolean; }[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, [categoryId]);

  // Load categories for filter modal
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const resp = await CategoryApi.getAllCategories();
        const list = (resp.data || []).map((c: any) => ({ id: String(c.id), name: c.name, selected: c.id === categoryId }));
        setFilterCategories(list);
      } catch (e) {
        setFilterCategories([{ id: String(categoryId), name: categoryName, selected: true } as any]);
      }
    };
    loadCategories();
  }, [categoryId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching products with prices for category:', categoryName, 'ID:', categoryId);

      // Get products by category ID
      const response = await ProductApi.getProductsByCategory(categoryId, { size: 50 });
      console.log('📦 Products API response:', response);

      if (response.success && response.data) {
        console.log('✅ Products data:', response.data);

        // Process products with all units as separate items
        const productsWithPrices: any[] = [];

        response.data.forEach((product) => {
          if (product.productUnits && product.productUnits.length > 0) {
            let hasValidUnit = false;

            // Create a separate item for each unit
            product.productUnits.forEach((unit: any) => {
              // Only show units that have a valid price
              if (unit.currentPrice !== null && unit.currentPrice !== undefined) {
                hasValidUnit = true;
                productsWithPrices.push({
                  ...product,
                  id: `${product.id}_${unit.id}`, // Unique ID for each unit
                  name: `${product.name} (${unit.unitName})`, // Show unit in name
                  currentPrice: unit.currentPrice,
                  priceUnit: unit.unitName || 'đơn vị',
                  unitDescription: unit.unitDescription,
                  isDefault: unit.isDefault,
                  convertedPrice: unit.convertedPrice,
                });
              }
            });

            // If no valid units found, add the product without price
            if (!hasValidUnit) {
              productsWithPrices.push({
                ...product,
                currentPrice: 0,
                priceUnit: 'đơn vị',
              });
            }
          } else {
            // If no units, add as single item
            productsWithPrices.push({
              ...product,
              currentPrice: 0,
              priceUnit: 'đơn vị',
            });
          }
        });

        const processedProducts = processProducts(productsWithPrices);
        console.log('🎨 Processed products with prices:', processedProducts);
        setAllProducts(processedProducts);
        setProducts(processedProducts);
      } else {
        console.log('❌ Products response not successful:', response);
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (error: any) {
      console.error('❌ Error fetching products:', error);
      setError(error.message || 'Failed to load products');

      // Show fallback data on error
      console.log('🔄 Using fallback products...');
      const fallbackProducts: Product[] = [
        { id: 1, name: 'Coca Cola Diet', description: '355ml', categoryId: categoryId, active: true, createdAt: '', updatedAt: '', currentPrice: 39000 },
        { id: 2, name: 'Sprite Lon', description: '325ml', categoryId: categoryId, active: true, createdAt: '', updatedAt: '', currentPrice: 30000 },
        { id: 3, name: 'Nước Ép Táo & Nho', description: '2L', categoryId: categoryId, active: true, createdAt: '', updatedAt: '', currentPrice: 319000 },
        { id: 4, name: 'Nước Ép Cam', description: '2L', categoryId: categoryId, active: true, createdAt: '', updatedAt: '', currentPrice: 319000 },
        { id: 5, name: 'Coca Cola Lon', description: '325ml', categoryId: categoryId, active: true, createdAt: '', updatedAt: '', currentPrice: 99000 },
        { id: 6, name: 'Pepsi Lon', description: '330ml', categoryId: categoryId, active: true, createdAt: '', updatedAt: '', currentPrice: 99000 },
      ];
      const processedFallback = processProducts(fallbackProducts);
      setProducts(processedFallback);
    } finally {
      console.log('🏁 Products loading finished');
      setLoading(false);
    }
  };

  const handleProductPress = (product: ProductWithPrice) => {
    // Extract original product ID from the combined ID (e.g., "1_1" -> "1")
    const originalId = product.id.toString().split('_')[0];
    console.log('🔍 Navigating to ProductDetail with ID:', originalId, 'from product:', product);
    navigation.navigate('ProductDetail', { id: originalId });
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleCloseFilter = () => {
    setShowFilterModal(false);
  };

  const applyFilters = () => {
    Keyboard.dismiss();
    const selectedCategoryIds = filterCategories.filter(c => c.selected).map(c => Number(c.id));
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;

    const filtered = allProducts.filter(p => {
      const okCat = selectedCategoryIds.length === 0 || selectedCategoryIds.includes((p as any).categoryId);
      const price = typeof p.currentPrice === 'number' ? p.currentPrice : 0;
      const okMin = min === undefined || price >= min;
      const okMax = max === undefined || price <= max;
      return okCat && okMin && okMax;
    });

    setProducts(filtered);
    setShowFilterModal(false);
  };

  const toggleCategory = (id: string) => {
    setFilterCategories(prev =>
      prev.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // removed brand toggling

  const renderProductItem = ({ item }: { item: ProductWithPrice }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.8}
    >
      <Image source={item.displayImage} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productDesc}>{item.description || 'Sản phẩm chất lượng'}</Text>
      <View style={styles.productFooter}>
        <Text style={styles.productPrice}>{item.displayPrice}</Text>
        <AddButton onPress={() => {
          const composed = item.id.toString();
          const unitIdStr = composed.includes('_') ? composed.split('_')[1] : composed;
          const productIdStr = composed.includes('_') ? composed.split('_')[0] : composed;
          const priceNum = typeof item.currentPrice === 'number' ? item.currentPrice : 0;
          CartStore.addItem({
            id: unitIdStr,
            name: item.name,
            price: priceNum,
            image: item.displayImage,
            productUnitId: Number(unitIdStr) || undefined,
            productId: Number(productIdStr) || undefined,
            categoryId: (item as any).categoryId,
          });
          showSuccess('Đã thêm vào giỏ hàng');
          // Optional: navigate to Cart to verify
          navigation.navigate({ name: 'Root', params: { screen: 'Cart' } } as any);
        }} />
      </View>
    </TouchableOpacity>
  );

  // Render loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <View style={styles.filterButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#53B175" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      </View>
    );
  }

  // Render error state
  if (error && products.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <View style={styles.filterButton} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{showFilterModal ? 'Bộ Lọc' : categoryName}</Text>
        <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
          <Ionicons name="options-outline" size={24} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item, index) => item.id ? item.id.toString() : `product-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseFilter} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#222" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Bộ Lọc</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Filter Content */}
          <View style={styles.modalContent}>
            {/* Categories */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Danh Mục</Text>
              {filterCategories.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.filterOption}
                  onPress={() => toggleCategory(item.id)}
                >
                  <View style={[styles.checkbox, item.selected && styles.checkboxSelected]}>
                    {item.selected && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                  <Text style={styles.filterOptionText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

          {/* Price Range */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Khoảng Giá</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={[styles.priceInput, { marginRight: 12 }]}
                placeholder="Từ (đ)"
                keyboardType="numeric"
                value={minPrice}
                onChangeText={setMinPrice}
              />
              <TextInput
                style={styles.priceInput}
                placeholder="Đến (đ)"
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
            </View>
          </View>
          </View>

          {/* Apply Button */}
          <PrimaryButton title="Áp Dụng Bộ Lọc" onPress={applyFilters} style={{ marginBottom: 30 }} />
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  filterButton: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: 'transparent',
    elevation: 0,
  },
  productImage: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 14,
    color: '#B6B6B6',
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  modalContent: {
    flex: 1,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterSection: {
    marginBottom: 30,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#222',
  },
  applyButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkboxSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
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

export default CategoryDetailScreen;
