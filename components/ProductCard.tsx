import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddButton from './AddButton';

interface ProductCardProps {
  image: any;
  name: string;
  desc: string;
  price: string;
  onAdd?: () => void;
  onPress?: () => void;
  hideAddButton?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ image, name, desc, price, onAdd, onPress, hideAddButton }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
    <Image source={image} style={styles.image} />
    <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">{name}</Text>
    <Text style={styles.desc} numberOfLines={2} ellipsizeMode="tail">{desc}</Text>
    <View style={styles.productFooter}>
      <Text style={styles.price} numberOfLines={1} ellipsizeMode="tail">{price}</Text>
      {hideAddButton ? (
        <Text style={styles.contactLabel}>Liên hệ</Text>
      ) : (
        <AddButton onPress={onAdd} />
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    width: 160,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginRight: 12,
    marginVertical: 8,
    shadowColor: 'transparent',
    elevation: 0,
    justifyContent: 'flex-start',
    height: 280,
  },
  image: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 18,
    marginTop: 2,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 15.5,
    color: '#222',
    marginBottom: 10,
    lineHeight: 20,
    height: 40, // clamp 2 lines
    marginTop: 0,
  },
  desc: {
    color: '#B6B6B6',
    fontSize: 13,
    marginBottom: 18,
    lineHeight: 13,
    height: 26, // clamp 2 lines
    marginTop: 0,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
  contactLabel: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProductCard;
