import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SearchBar from '../../components/SearchBar';
import CategoryApi from '../../services/api/CategoryApi';
import { Category, CategoryWithColor } from '../../types/category';
import { RootStackParamList } from '../../types/navigation';

// Define color palettes for random assignment
const colorPalettes = [
  { bgColor: '#E9F5E1', borderColor: '#B6E2A1' }, // Green
  { bgColor: '#FFF7E1', borderColor: '#FFE1A1' }, // Yellow
  { bgColor: '#FFE9E9', borderColor: '#FFB6B6' }, // Pink
  { bgColor: '#F3E9FF', borderColor: '#D1B6FF' }, // Purple
  { bgColor: '#FFF9E1', borderColor: '#FFF1A1' }, // Light Yellow
  { bgColor: '#E9F3FF', borderColor: '#B6D6FF' }, // Blue
];

// Function to get random color palette
const getRandomColorPalette = () => {
  const randomIndex = Math.floor(Math.random() * colorPalettes.length);
  return colorPalettes[randomIndex];
};

// Default images for categories (fallback when no image from API)
const defaultCategoryImages = [
  require('../../assets/images/product/rau.png'),
  require('../../assets/images/product/tao.png'),
  require('../../assets/images/product/thit.png'),
];

// Process categories with random colors and default images
const processCategories = (categories: Category[]): CategoryWithColor[] => {
  return categories.map((category, index) => ({
    ...category,
    ...getRandomColorPalette(),
    // Use default image if no imageUrl from API
    image: category.imageUrl ? { uri: category.imageUrl } : defaultCategoryImages[index % defaultCategoryImages.length],
  }));
};

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<CategoryWithColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching categories...');

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 seconds timeout
      });

      const response = await Promise.race([
        CategoryApi.getAllCategories(),
        timeoutPromise
      ]) as any;

      console.log('📦 API Response:', response);

      if (response.success && response.data) {
        console.log('✅ Categories data:', response.data);
        const processedCategories = processCategories(response.data);
        console.log('🎨 Processed categories:', processedCategories);
        setCategories(processedCategories);
      } else {
        console.log('❌ API response not successful:', response);
        throw new Error(response.message || 'Failed to fetch categories');
      }
    } catch (error: any) {
      console.error('❌ Error fetching categories:', error);
      setError(error.message || 'Failed to load categories');

      // Show fallback data on error
      console.log('🔄 Using fallback data...');
      const fallbackCategories: Category[] = [
        { id: 1, name: 'Trái Cây & Rau Củ Tươi', description: 'Rau củ quả tươi ngon', active: true, createdAt: '', updatedAt: '' },
        { id: 2, name: 'Dầu Ăn & Mỡ', description: 'Các loại dầu ăn và mỡ', active: true, createdAt: '', updatedAt: '' },
        { id: 3, name: 'Thịt & Cá', description: 'Thịt cá tươi sống', active: true, createdAt: '', updatedAt: '' },
        { id: 4, name: 'Bánh Mì & Đồ Ăn Vặt', description: 'Bánh mì và đồ ăn vặt', active: true, createdAt: '', updatedAt: '' },
        { id: 5, name: 'Sữa & Trứng', description: 'Sữa và các sản phẩm từ sữa', active: true, createdAt: '', updatedAt: '' },
        { id: 6, name: 'Đồ Uống', description: 'Các loại đồ uống', active: true, createdAt: '', updatedAt: '' },
      ];
      const processedFallback = processCategories(fallbackCategories);
      setCategories(processedFallback);
    } finally {
      console.log('🏁 Loading finished');
      setLoading(false);
    }
  };

  const handleCategoryPress = (category: CategoryWithColor) => {
    navigation.navigate('CategoryDetail', {
      categoryName: category.name,
      categoryId: category.id
    });
  };

  const handleRetry = () => {
    fetchCategories();
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Tìm Sản Phẩm</Text>
        <SearchBar value={search} onChangeText={setSearch} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#53B175" />
          <Text style={styles.loadingText}>Đang tải danh mục...</Text>
        </View>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Tìm Sản Phẩm</Text>
        <SearchBar value={search} onChangeText={setSearch} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render empty state
  if (categories.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Tìm Sản Phẩm</Text>
        <SearchBar value={search} onChangeText={setSearch} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có danh mục nào</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Tải lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tìm Sản Phẩm</Text>
      <SearchBar value={search} onChangeText={setSearch} />
      <FlatList
        data={categories}
        numColumns={2}
        keyExtractor={item => item.id.toString()}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 100, marginTop: 8 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: item.bgColor, borderColor: item.borderColor, width: ITEM_WIDTH }]}
            onPress={() => handleCategoryPress(item)}
            activeOpacity={0.8}
          >
            <Image source={item.image} style={styles.cardImage} />
            <Text style={styles.cardText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  cardImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '600',
    textAlign: 'center',
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
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
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
