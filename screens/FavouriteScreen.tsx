import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { RootStackParamList } from '../types/navigation';

const favouriteProducts = [
  {
    id: '1',
    name: 'Sprite Can',
    desc: '325ml, Price',
    price: '$1.50',
    image: require('../assets/images/product/rau.png'),
  },
  {
    id: '2',
    name: 'Diet Coke',
    desc: '355ml, Price',
    price: '$1.99',
    image: require('../assets/images/product/tao.png'),
  },
  {
    id: '3',
    name: 'Apple & Grape Juice',
    desc: '2L, Price',
    price: '$15.50',
    image: require('../assets/images/product/thit.png'),
  },
  {
    id: '4',
    name: 'Coca Cola Can',
    desc: '325ml, Price',
    price: '$4.99',
    image: require('../assets/images/product/rau.png'),
  },
  {
    id: '5',
    name: 'Pepsi Can',
    desc: '330ml, Price',
    price: '$4.99',
    image: require('../assets/images/product/tao.png'),
  },
];

const FavouriteScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleProductPress = (product: any) => {
    navigation.navigate('ProductDetail', { id: product.id, data: favouriteProducts });
  };

  const renderItem = ({ item }: { item: typeof favouriteProducts[0] }) => (
    <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={() => handleProductPress(item)}>
      <Image source={item.image} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc}>{item.desc}</Text>
      </View>
      <Text style={styles.itemPrice}>{item.price}</Text>
      <Ionicons name="chevron-forward" size={22} color="#B6B6B6" style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.header}>Favourite</Text>
        <FlatList
          data={favouriteProducts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 90 }}
        />
      </View>
      <View style={styles.fixedBtn}>
        <PrimaryButton title="Add All To Cart" onPress={() => {}} />
      </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 22,
    paddingHorizontal: 0,
  },
  itemImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginRight: 14,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 15,
    color: '#B6B6B6',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 8,
  },
  fixedBtn: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 100,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
});

export default FavouriteScreen;
