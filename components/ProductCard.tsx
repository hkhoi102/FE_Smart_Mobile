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
}

const ProductCard: React.FC<ProductCardProps> = ({ image, name, desc, price, onAdd, onPress }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
    <Image source={image} style={styles.image} />
    <Text style={styles.name}>{name}</Text>
    <Text style={styles.desc}>{desc}</Text>
    <View style={styles.row}>
      <Text style={styles.price}>{price}</Text>
      <AddButton onPress={onAdd} />
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
    width: 180,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    margin: 8,
    shadowColor: 'transparent',
    elevation: 0,
    justifyContent: 'flex-start',
    height: 260,
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
    marginTop: 0,
  },
  desc: {
    color: '#B6B6B6',
    fontSize: 13,
    marginBottom: 18,
    marginTop: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
});

export default ProductCard;
