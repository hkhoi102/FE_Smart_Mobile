import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FilterOption {
  id: string;
  name: string;
  selected: boolean;
}

const FilterScreen: React.FC = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState<FilterOption[]>([
    { id: '1', name: 'Eggs', selected: true },
    { id: '2', name: 'Noodles & Pasta', selected: false },
    { id: '3', name: 'Chips & Crisps', selected: false },
    { id: '4', name: 'Fast Food', selected: false },
  ]);

  const [brands, setBrands] = useState<FilterOption[]>([
    { id: '1', name: 'Individual Collection', selected: false },
    { id: '2', name: 'Cocola', selected: true },
    { id: '3', name: 'Ifad', selected: false },
    { id: '4', name: 'Kazi Farmas', selected: false },
  ]);

  const toggleCategory = (id: string) => {
    setCategories(prev =>
      prev.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleBrand = (id: string) => {
    setBrands(prev =>
      prev.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleApplyFilter = () => {
    // Apply filter logic here
    navigation.goBack();
  };

  const FilterOption = ({ item, onToggle }: { item: FilterOption; onToggle: () => void }) => (
    <TouchableOpacity style={styles.filterOption} onPress={onToggle}>
      <View style={[styles.checkbox, item.selected && styles.checkboxSelected]}>
        {item.selected && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      <Text style={styles.optionText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {categories.map(item => (
            <FilterOption
              key={item.id}
              item={item}
              onToggle={() => toggleCategory(item.id)}
            />
          ))}
        </View>

        {/* Brands */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brand</Text>
          {brands.map(item => (
            <FilterOption
              key={item.id}
              item={item}
              onToggle={() => toggleBrand(item.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Apply Button */}
      <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
        <Text style={styles.applyButtonText}>Apply Filter</Text>
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
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
  checkboxSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  optionText: {
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
});

export default FilterScreen;
