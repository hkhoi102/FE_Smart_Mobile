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
  title?: string;
  data: Product[];
  onSeeAll?: () => void;
  onProductPress?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

const ExclusiveOfferSection: React.FC<ExclusiveOfferSectionProps> = ({ title, data, onSeeAll, onProductPress, onAddToCart }) => {
  // Safety check: ensure data is an array
  const safeData = Array.isArray(data) ? data : [];

  // Don't render if no data
  if (safeData.length === 0 && !title) {
    return null;
  }

  return (
    <View style={styles.container}>
      {(!!title && title.trim().length > 0) || !!onSeeAll ? (
        <View style={styles.header}>
          {!!title && title.trim().length > 0 && <Text style={styles.title}>{title}</Text>}
          {onSeeAll && (
            <TouchableOpacity onPress={onSeeAll}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
      {safeData.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {safeData.map((item, idx) => (
            <ProductCard
              key={item?.id ? `section-${title || 'no-title'}-product-${item.id}-${idx}` : `section-${title || 'no-title'}-product-index-${idx}`}
              {...item}
              hideAddButton={!item.price || item.price.trim().length === 0}
              onPress={() => onProductPress && onProductPress(item)}
              onAdd={() => onAddToCart && onAddToCart(item)}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
};

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
  scrollContent: {
    paddingLeft: 4,
    paddingRight: 20,
  },
});

export default ExclusiveOfferSection;
