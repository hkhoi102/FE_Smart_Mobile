import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddButton from '../components/AddButton';
import PrimaryButton from '../components/PrimaryButton';
import { RootStackParamList } from '../types/navigation';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

// Sample products data
const sampleProducts = [
  {
    id: '1',
    name: 'Diet Coke',
    desc: '355ml, Price',
    price: '$1.99',
    image: require('../assets/images/product/rau.png'),
  },
  {
    id: '2',
    name: 'Sprite Can',
    desc: '325ml, Price',
    price: '$1.50',
    image: require('../assets/images/product/tao.png'),
  },
  {
    id: '3',
    name: 'Apple & Grape Juice',
    desc: '2L, Price',
    price: '$15.99',
    image: require('../assets/images/product/thit.png'),
  },
  {
    id: '4',
    name: 'Orange Juice',
    desc: '2L, Price',
    price: '$15.99',
    image: require('../assets/images/product/rau.png'),
  },
  {
    id: '5',
    name: 'Coca Cola Can',
    desc: '325ml, Price',
    price: '$4.99',
    image: require('../assets/images/product/tao.png'),
  },
  {
    id: '6',
    name: 'Pepsi Can',
    desc: '330ml, Price',
    price: '$4.99',
    image: require('../assets/images/product/thit.png'),
  },
];

const CategoryDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'CategoryDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { categoryName } = route.params;
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterCategories, setFilterCategories] = useState([
    { id: '1', name: 'Eggs', selected: true },
    { id: '2', name: 'Noodles & Pasta', selected: false },
    { id: '3', name: 'Chips & Crisps', selected: false },
    { id: '4', name: 'Fast Food', selected: false },
  ]);
  const [filterBrands, setFilterBrands] = useState([
    { id: '1', name: 'Individual Collection', selected: false },
    { id: '2', name: 'Cocola', selected: true },
    { id: '3', name: 'Ifad', selected: false },
    { id: '4', name: 'Kazi Farmas', selected: false },
  ]);

  const handleProductPress = (product: any) => {
    navigation.navigate('ProductDetail', { id: product.id, data: sampleProducts });
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleCloseFilter = () => {
    setShowFilterModal(false);
  };

  const toggleCategory = (id: string) => {
    setFilterCategories(prev =>
      prev.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleBrand = (id: string) => {
    setFilterBrands(prev =>
      prev.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const renderProductItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.8}
    >
      <Image source={item.image} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productDesc}>{item.desc}</Text>
      <View style={styles.productFooter}>
        <Text style={styles.productPrice}>{item.price}</Text>
        <AddButton onPress={() => {}} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{showFilterModal ? 'Filter' : categoryName}</Text>
        <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
          <Ionicons name="options-outline" size={24} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      <FlatList
        data={sampleProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
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
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseFilter} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#222" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filters</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Filter Content */}
          <View style={styles.modalContent}>
            {/* Categories */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Categories</Text>
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

            {/* Brands */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Brand</Text>
              {filterBrands.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.filterOption}
                  onPress={() => toggleBrand(item.id)}
                >
                  <View style={[styles.checkbox, item.selected && styles.checkboxSelected]}>
                    {item.selected && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                  <Text style={styles.filterOptionText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Apply Button */}
          <PrimaryButton title="Apply Filter" onPress={handleCloseFilter} style={{ marginBottom: 30 }} />
        </View>
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
    paddingBottom: 20,
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
});

export default CategoryDetailScreen;
