import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  image: any;
  name: string;
  desc: string;
  price: string;
  onAdd?: () => void;
}

interface ExclusiveOfferSectionProps {
  title: string;
  data: Product[];
  onSeeAll?: () => void;
  onProductPress?: (product: Product) => void;
}

const ExclusiveOfferSection: React.FC<ExclusiveOfferSectionProps> = ({ title, data, onSeeAll, onProductPress }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      )}
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {data.map((item, idx) => (
        <ProductCard key={idx} {...item} onPress={() => onProductPress && onProductPress(item)} />
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  seeAll: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default ExclusiveOfferSection;
