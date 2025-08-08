import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import OrderFailedModal from '../components/OrderFailedModal';
import PrimaryButton from '../components/PrimaryButton';
import { RootStackParamList } from '../types/navigation';

interface CartItem {
  id: string;
  name: string;
  desc: string;
  price: string;
  quantity: number;
  image: any;
}

const CartScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Bell Pepper Red',
      desc: '1kg, Price',
      price: '$4.99',
      quantity: 1,
      image: require('../assets/images/product/rau.png'),
    },
    {
      id: '2',
      name: 'Egg Chicken Red',
      desc: '4pcs, Price',
      price: '$1.99',
      quantity: 1,
      image: require('../assets/images/product/tao.png'),
    },
    {
      id: '3',
      name: 'Organic Bananas',
      desc: '12kg, Price',
      price: '$3.00',
      quantity: 1,
      image: require('../assets/images/product/thit.png'),
    },
    {
      id: '4',
      name: 'Ginger',
      desc: '250gm, Price',
      price: '$2.99',
      quantity: 1,
      image: require('../assets/images/product/rau.png'),
    },
  ]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return total + (price * item.quantity);
    }, 0).toFixed(2);
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItem(item.id)}
      >
        <Ionicons name="close" size={20} color="#B6B6B6" />
      </TouchableOpacity>

      <View style={styles.itemContent}>
        <Image source={item.image} style={styles.itemImage} />

        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDesc}>{item.desc}</Text>

          <View style={styles.itemFooter}>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Ionicons name="remove" size={16} color="#222" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Ionicons name="add" size={16} color="#222" />
              </TouchableOpacity>
            </View>
            <Text style={styles.itemPrice}>{item.price}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showOrderFailedModal, setShowOrderFailedModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  const handleCheckoutPress = () => {
    setShowCheckoutModal(true);
  };

  const handleCloseCheckout = () => {
    setShowCheckoutModal(false);
  };

  const handlePlaceOrder = () => {
    setShowCheckoutModal(false);
    // Simulate order processing
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3; // 70% success rate
      if (isSuccess) {
        setOrderStatus('success');
        navigation.navigate({ name: 'OrderSuccess', params: undefined });
      } else {
        setOrderStatus('failed');
        setShowOrderFailedModal(true);
      }
    }, 1000);
  };

  const handleCloseOrderFailed = () => {
    setShowOrderFailedModal(false);
  };

  const handleTryAgain = () => {
    setShowOrderFailedModal(false);
    setShowCheckoutModal(true);
  };

  const handleBackToHome = () => {
    setShowOrderFailedModal(false);
    navigation.navigate({ name: 'Root', params: { screen: 'Shop' } });
  };

  const MODAL_HEIGHT = Math.min(420, Dimensions.get('window').height * 0.6);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: 90 }]}
      />

      {/* Checkout Button fixed bottom */}
      <View style={styles.fixedCheckoutBtn}>
        <PrimaryButton
          title={`Go to Checkout • $${calculateTotal()}`}
          onPress={handleCheckoutPress}
        />
      </View>

      {/* Checkout Modal */}
      <Modal
        visible={showCheckoutModal}
        animationType="slide"
        transparent={true}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(238, 236, 236, 0.2)' }} />
          <View style={styles.checkoutModalContainer}>
          {/* Modal Header */}
          <View style={styles.checkoutModalHeader}>
            <Text style={styles.checkoutModalTitle}>Checkout</Text>
            <TouchableOpacity onPress={handleCloseCheckout} style={styles.closeCheckoutButton}>
              <Ionicons name="close" size={24} color="#222" />
            </TouchableOpacity>
          </View>

          {/* Checkout Content */}
          <View style={styles.checkoutContent}>
            {/* Delivery */}
            <TouchableOpacity style={styles.checkoutItem}>
              <Text style={styles.checkoutItemLabel}>Delivery</Text>
              <View style={styles.checkoutItemRight}>
                <Text style={styles.checkoutItemAction}>Select Method</Text>
                <Ionicons name="chevron-forward" size={20} color="#B6B6B6" />
              </View>
            </TouchableOpacity>

            {/* Payment */}
            <TouchableOpacity style={styles.checkoutItem}>
              <View style={styles.checkoutItemLeft}>
                <View />

                <Text style={styles.checkoutItemLabel}>Payment</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#B6B6B6" />
            </TouchableOpacity>

            {/* Promo Code */}
            <TouchableOpacity style={styles.checkoutItem}>
              <Text style={styles.checkoutItemLabel}>Promo Code</Text>
              <View style={styles.checkoutItemRight}>
                <Text style={styles.checkoutItemAction}>Pick discount</Text>
                <Ionicons name="chevron-forward" size={20} color="#B6B6B6" />
              </View>
            </TouchableOpacity>

            {/* Total Cost */}
            <TouchableOpacity style={styles.checkoutItem}>
              <Text style={styles.checkoutItemLabel}>Total Cost</Text>
              <View style={styles.checkoutItemRight}>
                <Text style={styles.checkoutItemPrice}>${calculateTotal()}</Text>
                <Ionicons name="chevron-forward" size={20} color="#B6B6B6" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By placing an order you agree to our{' '}
              <Text style={styles.termsLink}>Terms And Conditions</Text>
            </Text>
          </View>

          {/* Place Order Button */}
          <PrimaryButton title="Place Order" onPress={handlePlaceOrder} style={{marginBottom: 30}} />
          </View>
        </View>
      </Modal>

      <OrderFailedModal
        visible={showOrderFailedModal}
        onClose={handleCloseOrderFailed}
        onTryAgain={handleTryAgain}
        onBackToHome={handleBackToHome}
      />
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  listContent: {
    paddingBottom: 20,
  },
  cartItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  itemImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 14,
    color: '#B6B6B6',
    marginBottom: 16,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityBtn: {
    padding: 4,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
    color: '#222',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  fixedCheckoutBtn: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 100,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  checkoutModalContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  checkoutModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  checkoutModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  closeCheckoutButton: {
    padding: 8,
  },
  checkoutContent: {
    flex: 1,
  },
  checkoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkoutItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkoutItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkoutItemLabel: {
    fontSize: 16,
    color: '#222',
    marginLeft: 12,
  },
  checkoutItemAction: {
    fontSize: 14,
    color: '#B6B6B6',
    marginRight: 8,
  },
  checkoutItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 8,
  },

  termsContainer: {
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    color: '#B6B6B6',
    textAlign: 'center',
  },
  termsLink: {
    fontWeight: 'bold',
    color: '#222',
  },
});

export default CartScreen;
