import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { Product, RootStackParamList } from '../types/navigation';

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ProductDetail'>>();
  const navigation = useNavigation();
  const { id, data } = route.params;
  const product = (data as Product[]).find((item) => item.id === id);
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  if (!product) return <View style={styles.container}><Text>Product not found</Text></View>;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Product Image + Header icons overlay */}
        <View style={{ position: 'relative' }}>
          <Image source={product.image} style={styles.image} />
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#222" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="share-social-outline" size={22} color="#222" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Indicator */}

        {/* Info */}
        <View style={styles.infoRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.desc}>{product.desc}</Text>
          </View>
          <TouchableOpacity onPress={() => setFavorite(fav => !fav)}>
            <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={28} color={favorite ? '#10B981' : '#B6B6B6'} />
          </TouchableOpacity>
        </View>
        {/* Quantity & Price */}
        <View style={styles.qtyRow}>
          <View style={styles.qtyBox}>
            <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.qtyBtn}>
              <Ionicons name="remove" size={20} color="#222" />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={styles.qtyBtn}>
              <Ionicons name="add" size={20} color="#222" />
            </TouchableOpacity>
          </View>
          <Text style={styles.price}>{product.price}</Text>
        </View>
        {/* Product Detail */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Detail</Text>
          <Text style={styles.sectionContent}>
            Apples Are Nutritious. Apples May Be Good For Weight Loss. Apples May Be Good For Your Heart. As Part Of A Healthful And Varied Diet.
          </Text>
        </View>
        {/* Nutritions */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Nutritions</Text>
          <View style={styles.nutritionBox}><Text style={styles.nutritionText}>100g</Text></View>
        </View>
        {/* Review */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Review</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {[1,2,3,4,5].map(i => (
              <Ionicons key={i} name="star" size={18} color="#F59E42" />
            ))}
            <MaterialIcons name="keyboard-arrow-right" size={22} color="#B6B6B6" />
          </View>
        </View>
        {/* Add to Basket */}
        <View style={{ height: 70 }} />
      </View>
      <View style={styles.fixedAddBtn}>
        <PrimaryButton title="Add To Basket" onPress={() => {}} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 60,
  },
  headerRow: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F6F6F6',
    marginRight: 8,
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'contain',
    borderRadius: 18,

    marginBottom: 8,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  indicatorDot: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginHorizontal: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  desc: {
    fontSize: 15,
    color: '#888',
    marginBottom: 2,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 18,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: '#222',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 'auto',
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  sectionContent: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  nutritionBox: {
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  nutritionText: {
    fontSize: 13,
    color: '#888',
  },
  fixedAddBtn: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
});

export default ProductDetailScreen;
