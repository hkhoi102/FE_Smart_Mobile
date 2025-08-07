import React, { useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import SearchBar from '../components/SearchBar';

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

// Sample data structure for database
const sampleCategories = [
  { id: '1', name: 'Fresh Fruits & Vegetable', image: require('../assets/images/product/rau.png') },
  { id: '2', name: 'Cooking Oil & Ghee', image: require('../assets/images/product/tao.png') },
  { id: '3', name: 'Meat & Fish', image: require('../assets/images/product/thit.png') },
  { id: '4', name: 'Bakery & Snacks', image: require('../assets/images/product/rau.png') },
  { id: '5', name: 'Dairy & Eggs', image: require('../assets/images/product/tao.png') },
  { id: '6', name: 'Beverages', image: require('../assets/images/product/thit.png') },
];

// Process categories with random colors
const processCategories = (categories: any[]) => {
  return categories.map(category => ({
    ...category,
    ...getRandomColorPalette(),
  }));
};

const categories = processCategories(sampleCategories);

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

export default function ExploreScreen() {
  const [search, setSearch] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find Products</Text>
      <SearchBar value={search} onChangeText={setSearch} />
      <FlatList
        data={categories}
        numColumns={2}
        keyExtractor={item => item.id}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 24, marginTop: 8 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: item.bgColor, borderColor: item.borderColor, width: ITEM_WIDTH }]}>
            <Image source={item.image} style={styles.cardImage} />
            <Text style={styles.cardText}>{item.name}</Text>
          </View>
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
});
