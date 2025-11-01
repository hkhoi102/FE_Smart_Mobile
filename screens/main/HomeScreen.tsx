import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ExclusiveOfferSection from '../../components/ExclusiveOfferSection';
import ProductCard from '../../components/ProductCard';
import SearchBar from '../../components/SearchBar';
import { useNotification } from '../../contexts/NotificationContext';
import CategoryApi from '../../services/api/CategoryApi';
import OrderApi from '../../services/api/OrderApi';
import ProductApi from '../../services/api/ProductApi';
import { CartStore } from '../../stores/CartStore';
import { RootStackParamList } from '../../types/navigation';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { showSuccess } = useNotification();
  const [bestSelling, setBestSelling] = useState<any[]>([]);
  const [loadingBestSelling, setLoadingBestSelling] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [seeAllVisible, setSeeAllVisible] = useState<boolean>(false);
  const [seeAllTitle, setSeeAllTitle] = useState<string>('');
  const [seeAllItems, setSeeAllItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<{ [key: number]: any[] }>({});
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);

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
    const composed = String(product.id ?? '');
    if (composed.includes('_')) {
      // Extract productId and unitId from composed ID (format: productId_unitId)
      const [productId, unitId] = composed.split('_');
      navigation.navigate('ProductDetail', { id: productId, unitId: Number(unitId) });
    } else {
      navigation.navigate('ProductDetail', { id: composed });
    }
  };

  const handleAddToCart = (product: any) => {
    const composed = String(product.id ?? '');
    const unitIdStr = composed.includes('_') ? composed.split('_')[1] : composed;
    const productIdStr = composed.includes('_') ? composed.split('_')[0] : composed;

    // Extract price from product.price (format: "99.000đ")
    const priceStr = product.price || '';
    const priceNum = priceStr.replace(/[^\d]/g, '');
    const priceNumber = priceNum ? Number(priceNum) : 0;

    CartStore.addItem({
      id: unitIdStr,
      name: product.name || 'Sản phẩm',
      price: priceNumber,
      image: product.image,
      productUnitId: composed.includes('_') ? Number(unitIdStr) : undefined,
      productId: Number(productIdStr) || undefined,
    });

    showSuccess('Đã thêm vào giỏ hàng');
  };

  const formatVND = (value?: number) => {
    if (typeof value !== 'number') return '';
    return `${value.toLocaleString('vi-VN')}đ`;
  };

  const toISODate = (d: Date) => d.toISOString().slice(0, 10);

  const mapBestSellingTuplesToCards = async (items: any[]): Promise<any[]> => {
    const cards: any[] = [];

    // Group by productId to handle multiple units per product
    const productMap: { [key: number]: any } = {};

    for (const tuple of items) {
      const unitId = Array.isArray(tuple) ? tuple[0] : tuple?.productUnitId;
      const quantity = Array.isArray(tuple) ? tuple[1] : tuple?.quantity;
      const revenue = Array.isArray(tuple) ? tuple[2] : tuple?.revenue;
      const productId = Array.isArray(tuple) ? tuple[3] : tuple?.productId;

      if (!productId) continue;

      // Initialize product entry if not exists
      if (!productMap[productId]) {
        productMap[productId] = {
          productId: Number(productId),
          units: [],
        };
      }

      // Add unit info to product
      productMap[productId].units.push({
        unitId: unitId ? Number(unitId) : null,
        quantity: quantity ?? 0,
        revenue: revenue ?? 0,
      });
    }

    // Fetch products and create cards for each unit
    for (const productId in productMap) {
      const productInfo = productMap[productId];
      try {
        // Fetch product with all units
        let product: any = null;
        if (productInfo.units[0]?.unitId != null) {
          product = await ProductApi.getProductByUnitId(Number(productInfo.units[0].unitId));
        }
        if (!product) {
          product = await ProductApi.getProductWithPrice(Number(productId));
        }
        if (!product) {
          continue;
        }

        const baseName = product.name ?? 'Sản phẩm';
        const image = product.displayImage ?? require('../../assets/images/illustration.png');
        const units: any[] = Array.isArray(product.units) ? product.units : (Array.isArray(product.productUnits) ? product.productUnits : []);

        if (units.length > 0) {
          // Create a card for each unit
          units.forEach((u: any) => {
            const id = `${productId}_${u.id}`;
            const name = `${baseName} (${u.unitName || 'đơn vị'})`;
            const priceNumber = (u.currentPrice != null ? u.currentPrice : (u.convertedPrice != null ? u.convertedPrice : product.currentPrice));
            const price = priceNumber != null ? formatVND(priceNumber) : '';

            // Find matching unit data from best selling
            const unitData = productInfo.units.find((ud: any) => ud.unitId === u.id);
            const totalQuantity = unitData?.quantity ?? 0;
            const totalRevenue = unitData?.revenue ?? 0;

            const desc = `SL: ${totalQuantity}, DT: ${formatVND(typeof totalRevenue === 'number' ? totalRevenue : Number(totalRevenue))}`;

            cards.push({ id, image, name, desc, price });
          });
        } else {
          // Fallback if no units
          const unitData = productInfo.units[0];
          const totalQuantity = unitData?.quantity ?? 0;
          const totalRevenue = unitData?.revenue ?? 0;
          const id = String(productId);
          const name = baseName;
          const price = product.currentPrice != null ? formatVND(product.currentPrice) : '';
          const desc = `SL: ${totalQuantity}, DT: ${formatVND(typeof totalRevenue === 'number' ? totalRevenue : Number(totalRevenue))}`;
          cards.push({ id, image, name, desc, price });
        }
      } catch (e) {
        console.error(`Error processing product ${productId}:`, e);
      }
    }

    return cards;
  };

  const mapProductsToCards = (items: any[]): any[] => {
    const cards: any[] = [];
    items.forEach((p: any, idx: number) => {
      const image = p.imageUrl ? { uri: p.imageUrl } : require('../../assets/images/illustration.png');
      const baseName = p.name ?? 'Sản phẩm';
      const desc = p.description ?? '';
      const units: any[] = Array.isArray(p.productUnits) ? p.productUnits : [];

      const listUnits = units.length > 0 ? units : [];
      if (listUnits.length > 0) {
        listUnits.forEach((u: any) => {
          const id = `${p.id}_${u.id}`;
          const name = `${baseName} (${u.unitName || 'đơn vị'})`;
          const priceNumber = (u.currentPrice != null ? u.currentPrice : (u.convertedPrice != null ? u.convertedPrice : p.currentPrice));
          const price = priceNumber != null ? formatVND(priceNumber) : '';
          cards.push({ id, image, name, desc, price });
        });
      } else {
        const id = String(p.id ?? idx);
        const price = p.currentPrice != null ? formatVND(p.currentPrice) : '';
        cards.push({ id, image, name: baseName, desc, price });
      }
    });
    return cards;
  };

  const mapProductsToCardsAsync = async (items: any[]): Promise<any[]> => {
    const resolved = await Promise.all(items.map(async (p: any) => {
      if (Array.isArray(p.productUnits) && p.productUnits.length > 0) return p;
      // fetch detail to obtain units if missing
      try {
        const detail = await ProductApi.getProductWithPrice(Number(p.id));
        if (detail) {
          return {
            ...p,
            productUnits: detail.units ?? detail.productUnits ?? [],
            currentPrice: detail.currentPrice,
            imageUrl: (detail as any).imageUrl ?? p.imageUrl,
          };
        }
        // fallback to full product by id if available
        const full = await ProductApi.getProductById(Number(p.id));
        const data = (full as any)?.data?.[0];
        return data ? { ...data } : p;
      } catch {
        return p;
      }
    }));
    return mapProductsToCards(resolved);
  };

  const banners = [
    {
      image: require('../../assets/images/OI.jpg'),
      title: 'Rau Củ Tươi',
      subtitle: 'Giảm Đến 40%',
    },
    {
      image: require('../../assets/images/O.jpg'),
      title: 'Trái Cây Tươi',
      subtitle: 'Giảm Đến 30%',
    },
    {
      image: require('../../assets/images/OIPm.jpg'),
      title: 'Thực Phẩm Hữu Cơ',
      subtitle: 'Giảm Đến 20%',
    },
  ];

  const products = [
    {
      id: '1',
      image: require('../../assets/images/product/rau.png'),
      name: 'Chuối Hữu Cơ',
      desc: '7 quả, Giá',
      price: '99.000đ',
      onAdd: () => {},
    },
    {
      id: '2',
      image: require('../../assets/images/product/thit.png'),
      name: 'Táo Đỏ',
      desc: '1kg, Giá',
      price: '99.000đ',
      onAdd: () => {},
    },
    {
      id: '3',
      image: require('../../assets/images/product/tao.png'),
      name: 'Táo Đỏ',
      desc: '1kg, Giá',
      price: '99.000đ',
      onAdd: () => {},
    },
  ];

  useEffect(() => {
    const fetchBestSelling = async () => {
      try {
        setLoadingBestSelling(true);
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        const data = await OrderApi.getBestSellingProducts({
          startDate: toISODate(start),
          endDate: toISODate(end),
          sortBy: 'quantity',
          limit: 10,
        });
        const cards = await mapBestSellingTuplesToCards(data);
        setBestSelling(cards);
      } catch (e) {
        setBestSelling([]);
      } finally {
        setLoadingBestSelling(false);
      }
    };
    fetchBestSelling();
  }, []);

  // Fetch categories and their products
  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      if (search.trim().length > 0) {
        // Clear categories when searching
        setCategories([]);
        setCategoryProducts({});
        return;
      }

      try {
        setLoadingCategories(true);
        console.log('🔄 Fetching categories for HomeScreen...');
        const categoriesResp = await CategoryApi.getAllCategories();
        console.log('✅ Categories response:', categoriesResp);
        const categoriesList = categoriesResp?.data || [];

        // Filter categories - include if active is true or if active field doesn't exist (default to true)
        // Limit to first 5 categories
        const activeCategories = (categoriesList || []).filter((cat: any) => {
          if (!cat) return false;
          // Include category if active is true or undefined/null (default to showing it)
          return cat.active !== false;
        }).slice(0, 5);
        console.log('✅ Active categories:', activeCategories);
        setCategories(activeCategories);

        // Fetch products for each category
        const productsMap: { [key: number]: any[] } = {};
        if (activeCategories.length > 0) {
          const promises = activeCategories.map(async (category: any) => {
            try {
              if (!category || !category.id) return;
              console.log(`🔄 Fetching products for category ${category.id}...`);
              const productsResp = await ProductApi.getProductsByCategory(category.id, { size: 8 });
              const productsData = (productsResp as any)?.data || [];
              const cards = await mapProductsToCardsAsync(productsData);
              productsMap[category.id] = cards;
              console.log(`✅ Fetched ${cards.length} products for category ${category.id}`);
            } catch (e) {
              console.error(`❌ Error fetching products for category ${category?.id}:`, e);
              productsMap[category?.id] = [];
            }
          });
          await Promise.allSettled(promises);
        }
        console.log('✅ Setting category products:', productsMap);
        setCategoryProducts(productsMap);
      } catch (e) {
        console.error('❌ Error fetching categories:', e);
        setCategories([]);
        setCategoryProducts({});
      } finally {
        setLoadingCategories(false);
      }
    };

    // Delay slightly to ensure other initial loads complete
    const timer = setTimeout(() => {
      fetchCategoriesAndProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Debounced product search
  useEffect(() => {
    let timer: any;
    const run = async () => {
      const q = (search || '').trim();
      if (q.length < 2) {
        setSearchResults([]);
        setSuggestions([]);
        setRelated([]);
        return;
      }
      try {
        setLoadingSearch(true);
        const resp = await ProductApi.searchProducts(q);
        const data = (resp as any)?.data || [];
        const cards = await mapProductsToCardsAsync(data);
        setSearchResults(cards);
        // build suggestions from names
        const names = Array.from(new Set((data || []).map((p: any) => p.name).filter(Boolean)));
        setSuggestions(names.slice(0, 8));
        // fetch related by category of first result
        if (Array.isArray(data) && data.length > 0 && data[0]?.categoryId) {
          try {
            const relResp = await ProductApi.getProductsByCategory(Number(data[0].categoryId), { size: 10 });
            const relData = (relResp as any)?.data || [];
            const relCards = await mapProductsToCardsAsync(relData);
            setRelated(relCards);
          } catch {
            setRelated([]);
          }
        } else {
          setRelated([]);
        }
      } catch (e) {
        setSearchResults([]);
        setSuggestions([]);
        setRelated([]);
      } finally {
        setLoadingSearch(false);
      }
    };
    timer = setTimeout(run, 400);
    return () => clearTimeout(timer);
  }, [search]);

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

  const renderHeader = () => (
    <>
      <Animated.Image
        source={require('../../assets/images/carot.png')}
        style={[styles.carrotIcon, { transform: [{ translateX: shakeAnim }] }]}
      />
      <View style={styles.locationRow}>
        <MaterialIcons name="location-on" size={20} color="#222" />
        <Text style={styles.locationText}>Hồ Chí Minh, <Text style={styles.bold}>Gò Vấp</Text></Text>
      </View>
      <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm kiếm sản phẩm" />
      {search.trim().length > 0 && suggestions.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8, marginBottom: 8 }}>
          {suggestions.map((s, idx) => (
            <TouchableOpacity key={idx} onPress={() => setSearch(s)} style={styles.suggestionChip}>
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </>
  );

  if (seeAllVisible) {
    return (
      <View style={styles.container}>
        <FlatList
          ListHeaderComponent={
            <>
              {renderHeader()}
              {seeAllTitle ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 8, marginBottom: 8, marginTop: 16 }}>
                  <Text style={styles.seeAllHeader}>{seeAllTitle}</Text>
                  <TouchableOpacity onPress={() => setSeeAllVisible(false)}>
                    <Text style={styles.seeAllClose}>Đóng</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </>
          }
          data={seeAllItems}
          keyExtractor={(item, index) => item.id ? String(item.id) : `item-${index}`}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.8} onPress={() => handleProductPress(item)}>
              <ProductCard {...item} onAdd={() => handleAddToCart(item)} />
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {renderHeader()}
      {search.trim().length === 0 && (
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
      )}
      {search.trim().length > 0 && (
        <ExclusiveOfferSection
          title=""
          data={searchResults}
          onProductPress={handleProductPress}
          onAddToCart={handleAddToCart}
        />
      )}
      {search.trim().length > 0 && related.length > 0 && (
        <ExclusiveOfferSection
          title="Sản Phẩm Liên Quan"
          data={related}
          onSeeAll={() => { setSeeAllTitle('Sản Phẩm Liên Quan'); setSeeAllItems(related); setSeeAllVisible(true); }}
          onProductPress={handleProductPress}
          onAddToCart={handleAddToCart}
        />
      )}
      <ExclusiveOfferSection
        title="Bán Chạy Nhất"
        data={bestSelling}
        onSeeAll={() => { setSeeAllTitle('Bán Chạy Nhất'); setSeeAllItems(bestSelling); setSeeAllVisible(true); }}
        onProductPress={handleProductPress}
        onAddToCart={handleAddToCart}
      />
      {search.trim().length === 0 && Array.isArray(categories) && categories.length > 0 && categories.map((category: any) => {
        try {
          if (!category || !category.id) return null;
          const products = categoryProducts[category.id] || [];
          if (!Array.isArray(products) || products.length === 0) return null;

          return (
            <ExclusiveOfferSection
              key={category.id}
              title={category.name || 'Danh mục'}
              data={products}
              onSeeAll={() => {
                navigation.navigate('CategoryDetail', {
                  categoryId: category.id,
                  categoryName: category.name || 'Danh mục',
                });
              }}
              onProductPress={handleProductPress}
              onAddToCart={handleAddToCart}
            />
          );
        } catch (e) {
          console.error('Error rendering category:', category, e);
          return null;
        }
      })}
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
  suggestionChip: {
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  suggestionText: {
    color: '#222',
    fontSize: 14,
  },
  contentContainer: {
    paddingBottom: 100,
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
  seeAllHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  seeAllClose: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 15,
  },
});
