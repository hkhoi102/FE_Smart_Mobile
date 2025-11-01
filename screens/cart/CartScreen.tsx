import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import OrderFailedModal from '../../components/OrderFailedModal';
import PrimaryButton from '../../components/PrimaryButton';
import { useNotification } from '../../contexts/NotificationContext';
import { OrderApi, PaymentApi, type CreateOrderRequest, type PaymentMethod } from '../../services/api';
import CustomerApi from '../../services/api/CustomerApi';
import { CartStore } from '../../stores/CartStore';
import { RootStackParamList } from '../../types/navigation';

interface CartItemUI {
  id: string; // productUnitId as string
  name: string;
  price: number;
  quantity: number;
  image?: any;
}

const CartScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { showError } = useNotification();
  const { items } = CartStore.useCart();
  const [cartItems, setCartItems] = useState<CartItemUI[]>([]);
  const [previewTotal, setPreviewTotal] = useState<number | null>(null);
  const [previewDiscount, setPreviewDiscount] = useState<number | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showOrderFailedModal, setShowOrderFailedModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [qrContent, setQrContent] = useState<string | undefined>();
  const [qrLoadError, setQrLoadError] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | undefined>();
  const [transferContent, setTransferContent] = useState<string | undefined>();
  const [isPolling, setIsPolling] = useState(false);
  const pollingRef = React.useRef<NodeJS.Timeout | null>(null);
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<string>('HOME_DELIVERY');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [countdownTimer, setCountdownTimer] = useState<number>(0); // seconds
  const countdownRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    // map store items to UI items
    setCartItems(items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })));
    previewOrder(items);
  }, [items]);

  // Load user profile to get phone number
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await CustomerApi.getMe();
        if (profile?.phoneNumber) {
          setPhoneNumber(profile.phoneNumber);
        }
      } catch (e) {
        console.error('Error loading profile:', e);
      }
    };
    if (showCheckoutModal) {
      loadProfile();
    }
  }, [showCheckoutModal]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    CartStore.updateQuantity(id, newQuantity);
  };

  const removeItem = (id: string) => {
    CartStore.removeItem(id);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const previewOrder = async (storeItems: ReturnType<typeof CartStore.useCart>['items']) => {
    try {
      if (!storeItems || storeItems.length === 0) {
        setPreviewTotal(0);
        setPreviewDiscount(0);
        return;
      }
      const body = storeItems
        .map(i => ({ productUnitId: (i.productUnitId ?? Number(i.id)) || 0, quantity: i.quantity }))
        .filter(it => typeof it.productUnitId === 'number' && it.productUnitId! > 0 && it.quantity > 0);
      console.log('🧮 preview body', body);
      if (body.length === 0) {
        setPreviewTotal(calculateTotal());
        setPreviewDiscount(0);
        return;
      }
      const res = await OrderApi.preview(body);
      console.log('🧮 preview resp', res);
      if (res && typeof res.finalAmount === 'number') {
        setPreviewTotal(Number(res.finalAmount));
        setPreviewDiscount(Number(res.discountAmount || 0));
      } else {
        setPreviewTotal(calculateTotal());
        setPreviewDiscount(0);
      }
    } catch (e: any) {
      console.error('❌ preview error', e?.status, e?.message || e);
      setPreviewTotal(null);
      setPreviewDiscount(null);
    }
  };

  const renderCartItem = ({ item }: { item: CartItemUI }) => (
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
          {/* description removed since CartItemUI doesn't include it */}

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
            <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const handleCheckoutPress = () => {
    if (cartItems.length === 0) return;
    setCheckoutStep(1);
    setShowCheckoutModal(true);
  };

  const handleCloseCheckout = () => {
    stopCountdownTimer();
    setShowCheckoutModal(false);
    setCheckoutStep(1);
    setQrContent(undefined);
    setTransferContent(undefined);
  };

  const handleContinueToPayment = () => {
    // Validate step 1 fields
    if (!phoneNumber || phoneNumber.trim() === '') {
      showError('Vui lòng nhập số điện thoại');
      return;
    }
    // Only require shipping address for HOME_DELIVERY
    if (deliveryMethod === 'HOME_DELIVERY' && (!shippingAddress || shippingAddress.trim() === '')) {
      showError('Vui lòng nhập địa chỉ giao hàng');
      return;
    }
    // Move to step 2 (payment method)
    setCheckoutStep(2);
  };

  const handlePlaceOrder = async () => {
    try {
      if (!cartItems.length) return;

      // Validate required fields
      if (!phoneNumber || phoneNumber.trim() === '') {
        showError('Vui lòng nhập số điện thoại');
        return;
      }
      // Only require shipping address for HOME_DELIVERY
      if (deliveryMethod === 'HOME_DELIVERY' && (!shippingAddress || shippingAddress.trim() === '')) {
        showError('Vui lòng nhập địa chỉ giao hàng');
        return;
      }

      setShowCheckoutModal(false);
      const orderDetails = cartItems.map((ci, idx) => ({ productUnitId: Number(ci.id) || idx + 1, quantity: ci.quantity }));
      const payload: CreateOrderRequest = {
        orderDetails,
        paymentMethod,
        shippingAddress: deliveryMethod === 'HOME_DELIVERY' ? shippingAddress.trim() : '',
        deliveryMethod: deliveryMethod,
        phoneNumber: phoneNumber.trim(),
      };
      const order = await OrderApi.createOrder(payload);
      console.log('📦 Order created:', JSON.stringify(order, null, 2));
      console.log('💰 Payment Info:', order.paymentInfo);
      console.log('📸 QR Content:', order.paymentInfo?.qrContent);

      if (order.paymentMethod === 'COD') {
        setOrderStatus('success');
        CartStore.clear();
        navigation.navigate({ name: 'OrderSuccess', params: undefined });
        return;
      }

      // For BANK_TRANSFER, show QR code in modal
      setCreatedOrderId(order.id);
      const qrUrl = order.paymentInfo?.qrContent || (order.paymentInfo as any)?.qrCode || (order as any).qrContent || (order as any).qrCode;
      console.log('🔍 QR URL found:', qrUrl);
      setQrContent(qrUrl || undefined);
      setQrLoadError(!qrUrl);

      // Sanitize transfer content: remove non-alphanumeric (e.g., '-') so it becomes ORDER2520c553
      const rawContent = order.paymentInfo?.transferContent || (order as any).transferContent || '';
      const sanitized = rawContent.replace(/[^0-9A-Za-z]/g, '');
      const finalTransferContent = sanitized || rawContent;
      console.log('💳 Transfer Content:', finalTransferContent);
      setTransferContent(finalTransferContent);

      // Stay on step 2 to show QR code
      setCheckoutStep(2);
      setShowCheckoutModal(true);

      // Start 3-minute countdown timer
      startCountdownTimer(order.id);

      startPolling(order.id, finalTransferContent);
    } catch (e) {
      setOrderStatus('failed');
      setShowOrderFailedModal(true);
    }
  };

  const startPolling = (orderId: number, content?: string) => {
    stopPolling();
    if (!content) return;
    setIsPolling(true);
    pollingRef.current = setInterval(async () => {
      try {
        // Prefer order-service status first
        const status = await OrderApi.getPaymentStatus(orderId);
        const isPaid = typeof status === 'boolean' ? status : (status && (status as any).paymentStatus === 'PAID');
        if (isPaid) {
          stopPolling();
          stopCountdownTimer();
          setShowCheckoutModal(false);
          setOrderStatus('success');
          CartStore.clear();
          navigation.navigate({ name: 'OrderSuccess', params: undefined });
          return;
        }
        // Fallback to payment-service match by transfer content
        const amount = previewTotal ?? calculateTotal();
        // Ensure content token contains only letters/digits as payment-service expects
        const token = content.replace(/[^0-9A-Za-z]/g, '');
        const match = await PaymentApi.matchTransfer(token, Math.round(amount));
        console.log('🏦 match resp', match);
        if (match.success) {
          try { await OrderApi.updatePaymentStatus(orderId, 'PAID'); } catch {}
          stopPolling();
          stopCountdownTimer();
          setShowCheckoutModal(false);
          setOrderStatus('success');
          CartStore.clear();
          navigation.navigate({ name: 'OrderSuccess', params: undefined });
        }
      } catch {}
    }, 10000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
  };

  const startCountdownTimer = (orderId: number) => {
    stopCountdownTimer(); // Clear any existing timer
    setCountdownTimer(180); // 3 minutes = 180 seconds

    countdownRef.current = setInterval(() => {
      setCountdownTimer((prev) => {
        if (prev <= 1) {
          // Timer expired, cancel the order
          handleOrderTimeout(orderId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopCountdownTimer = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdownTimer(0);
  };

  const handleOrderTimeout = async (orderId: number) => {
    try {
      stopCountdownTimer();
      stopPolling();

      // Cancel the order
      await OrderApi.updateOrderStatus(orderId, 'CANCELLED', 'Hết thời gian thanh toán');

      // Show error and close modal
      showError('Đơn hàng đã bị hủy do hết thời gian thanh toán');
      setShowCheckoutModal(false);
      setQrContent(undefined);
      setTransferContent(undefined);
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      showError('Không thể hủy đơn hàng');
    }
  };

  React.useEffect(() => {
    return () => {
      stopPolling();
      stopCountdownTimer();
    };
  }, []);

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
        <Text style={styles.headerTitle}>Giỏ Hàng Của Tôi</Text>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item, index) => item.id || `cart-item-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
      />

      {/* Checkout Button fixed bottom */}
      <View style={styles.fixedCheckoutBtn}>
        {previewDiscount && previewDiscount > 0 ? (
          <Text style={{ textAlign: 'right', color: '#10B981', marginBottom: 6 }}>Tiết kiệm: {previewDiscount.toLocaleString('vi-VN')}đ</Text>
        ) : null}
        <PrimaryButton
          title={`Thanh Toán • ${(previewTotal ?? calculateTotal()).toLocaleString('vi-VN')}đ`}
          onPress={handleCheckoutPress}
          disabled={cartItems.length === 0}
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
            <Text style={styles.checkoutModalTitle}>
              {checkoutStep === 1 ? 'Thông Tin Giao Hàng' : 'Phương Thức Thanh Toán'}
            </Text>
            <TouchableOpacity onPress={handleCloseCheckout} style={styles.closeCheckoutButton}>
              <Ionicons name="close" size={24} color="#222" />
            </TouchableOpacity>
          </View>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, checkoutStep >= 1 && styles.stepDotActive]} />
            <View style={[styles.stepLine, checkoutStep >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, checkoutStep >= 2 && styles.stepDotActive]} />
          </View>

          {/* Checkout Content */}
          <ScrollView style={styles.checkoutContent} contentContainerStyle={styles.checkoutScroll}>
            {checkoutStep === 1 ? (
              <>
                {/* Phone Number */}
                <View style={[styles.checkoutItem, styles.inputContainer]}>
                  <Text style={styles.checkoutItemLabel}>Số điện thoại *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Nhập số điện thoại"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                </View>

                {/* Shipping Address - only show for HOME_DELIVERY */}
                {deliveryMethod === 'HOME_DELIVERY' && (
                  <View style={[styles.checkoutItem, styles.inputContainer]}>
                    <Text style={styles.checkoutItemLabel}>Địa chỉ giao hàng *</Text>
                    <TextInput
                      style={[styles.textInput, styles.textAreaInput]}
                      value={shippingAddress}
                      onChangeText={setShippingAddress}
                      placeholder="Nhập địa chỉ giao hàng"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                )}

                {/* Delivery Method */}
                <View style={[styles.checkoutItem, styles.deliveryMethodContainer]}>
                  <Text style={styles.checkoutItemLabel}>Phương thức nhận hàng</Text>
                  <View style={styles.deliveryMethodButtons}>
                    <TouchableOpacity
                      onPress={() => setDeliveryMethod('HOME_DELIVERY')}
                      style={[styles.deliveryMethodBtn, deliveryMethod==='HOME_DELIVERY' && styles.deliveryMethodBtnActive]}
                    >
                      <Ionicons
                        name="home"
                        size={20}
                        color={deliveryMethod==='HOME_DELIVERY' ? '#10B981' : '#666'}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={[styles.deliveryMethodText, deliveryMethod==='HOME_DELIVERY' && styles.deliveryMethodTextActive]}>Giao hàng tận nhà</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setDeliveryMethod('PICKUP_AT_STORE')}
                      style={[styles.deliveryMethodBtn, deliveryMethod==='PICKUP_AT_STORE' && styles.deliveryMethodBtnActive]}
                    >
                      <Ionicons
                        name="storefront"
                        size={20}
                        color={deliveryMethod==='PICKUP_AT_STORE' ? '#10B981' : '#666'}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={[styles.deliveryMethodText, deliveryMethod==='PICKUP_AT_STORE' && styles.deliveryMethodTextActive]}>Nhận tại cửa hàng</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              <>
                {/* Payment method - hide when QR code is displayed */}
                {!qrContent && (
                  <View style={[styles.checkoutItem, styles.paymentMethodContainer]}>
                    <Text style={styles.checkoutItemLabel}>Phương thức thanh toán</Text>
                    <View style={styles.paymentMethodButtons}>
                      <TouchableOpacity onPress={() => setPaymentMethod('COD')} style={[styles.payMethodBtn, paymentMethod==='COD' && styles.payMethodBtnActive]}>
                        <Text style={[styles.payMethodText, paymentMethod==='COD' && styles.payMethodTextActive]}>COD</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setPaymentMethod('BANK_TRANSFER')} style={[styles.payMethodBtn, paymentMethod==='BANK_TRANSFER' && styles.payMethodBtnActive]}>
                        <Text style={[styles.payMethodText, paymentMethod==='BANK_TRANSFER' && styles.payMethodTextActive]}>Chuyển khoản</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

            {/* Total */}
            <View style={[styles.checkoutItem, { paddingBottom: 8, borderBottomWidth: 0 }]}>
              <Text style={styles.checkoutItemLabel}>Tổng Cộng</Text>
              <View style={styles.checkoutItemRight}>
                {previewTotal !== null && previewTotal !== calculateTotal() ? (
                  <>
                    <Text style={[styles.checkoutItemPrice, { color: '#B6B6B6', textDecorationLine: 'line-through', marginRight: 10 }]}>{calculateTotal().toLocaleString('vi-VN')}đ</Text>
                    <Text style={[styles.checkoutItemPrice, { color: '#10B981' }]}>{previewTotal.toLocaleString('vi-VN')}đ</Text>
                  </>
                ) : (
                  <Text style={styles.checkoutItemPrice}>{(previewTotal ?? calculateTotal()).toLocaleString('vi-VN')}đ</Text>
                )}
              </View>
            </View>

            {/* QR Code Section - only show for BANK_TRANSFER after order is created */}
            {paymentMethod === 'BANK_TRANSFER' && (
              <>
                {qrContent ? (
                  <>
                    {/* Countdown Timer */}
                    {countdownTimer > 0 && (
                      <View style={{ alignItems: 'center', marginTop: 6, marginBottom: 10 }}>
                        <View style={{ backgroundColor: countdownTimer <= 60 ? '#FEF2F2' : '#F0F9FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons
                            name="time-outline"
                            size={18}
                            color={countdownTimer <= 60 ? '#DC2626' : '#0284C7'}
                            style={{ marginRight: 6 }}
                          />
                          <Text style={{ fontSize: 16, fontWeight: '600', color: countdownTimer <= 60 ? '#DC2626' : '#0284C7' }}>
                            {Math.floor(countdownTimer / 60)}:{(countdownTimer % 60).toString().padStart(2, '0')}
                          </Text>
                          <Text style={{ fontSize: 14, color: countdownTimer <= 60 ? '#DC2626' : '#0284C7', marginLeft: 4 }}>
                            còn lại
                          </Text>
                        </View>
                      </View>
                    )}
                    <Text style={{ textAlign: 'center', color: '#888', marginTop: 6, marginBottom: 10 }}>Quét QR và chuyển khoản theo nội dung dưới</Text>
                    <View style={{ alignItems: 'center', marginTop: 16 }}>
                      <Text style={{ fontWeight: '600', marginBottom: 8, fontSize: 16, color: '#222' }}>Quét QR để thanh toán</Text>
                      {qrLoadError ? (
                        <View style={{ width: 220, height: 220, backgroundColor: '#F8F8F8', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' }}>
                          <Text style={{ color: '#888', fontSize: 14 }}>Không thể tải QR code</Text>
                        </View>
                      ) : (
                        <Image
                          source={{ uri: qrContent }}
                          style={{
                            width: 220,
                            height: 220,
                            resizeMode: 'contain',
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: '#eee',
                            backgroundColor: '#fff'
                          }}
                          onError={() => {
                            console.error('❌ Error loading QR image:', qrContent);
                            setQrLoadError(true);
                          }}
                        />
                      )}
                      {transferContent ? (
                        <View style={{ marginTop: 16, alignItems: 'center', paddingHorizontal: 20 }}>
                          <Text style={{ color: '#666', marginBottom: 6, fontSize: 14 }}>Nội dung chuyển khoản</Text>
                          <View style={{ backgroundColor: '#F8F8F8', padding: 12, borderRadius: 8, width: '100%' }}>
                            <Text selectable style={{ fontWeight: '600', fontSize: 16, color: '#222', textAlign: 'center' }}>
                              {transferContent}
                            </Text>
                          </View>
                        </View>
                      ) : null}
                    </View>
                  </>
                ) : (
                  <View style={{ alignItems: 'center', marginTop: 16, paddingVertical: 20 }}>
                    <Text style={{ color: '#888', fontSize: 14, textAlign: 'center' }}>
                      Sau khi đặt hàng, mã QR sẽ được hiển thị tại đây
                    </Text>
                  </View>
                )}
              </>
            )}
              </>
            )}
          </ScrollView>

          {/* Terms and Conditions - only show on step 2 */}
          {checkoutStep === 2 && (
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                Bằng cách đặt hàng, bạn đồng ý với{' '}
                <Text style={styles.termsLink}>Điều Khoản Và Điều Kiện</Text> của chúng tôi
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          {checkoutStep === 1 ? (
            <View style={styles.stepButtonsContainer}>
              <PrimaryButton
                title="Tiếp Tục"
                onPress={handleContinueToPayment}
                style={styles.continueButton}
              />
            </View>
          ) : (
            // Only show buttons if QR code hasn't been generated yet (before placing order)
            !qrContent && (
              <View style={styles.stepButtonsContainer}>
                <TouchableOpacity
                  onPress={() => setCheckoutStep(1)}
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>Quay Lại</Text>
                </TouchableOpacity>
                <PrimaryButton title="Đặt Hàng" onPress={handlePlaceOrder} style={{marginBottom: 30, flex: 1, marginLeft: 12}} />
              </View>
            )
          )}
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
    height: '85%',
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
  checkoutScroll: {
    paddingBottom: 140,
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
    fontWeight: '600',
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
  paymentMethodContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  paymentMethodButtons: {
    flexDirection: 'row',
    marginTop: 12,
    width: '100%',
  },
  payMethodBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginRight: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payMethodBtnActive: {
    borderColor: '#10B981',
    backgroundColor: '#EAF7F1',
  },
  payMethodText: {
    color: '#222',
    fontWeight: '600',
  },
  payMethodTextActive: {
    color: '#10B981',
  },
  inputContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  textInput: {
    width: '100%',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#F8F8F8',
  },
  textAreaInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  deliveryMethodContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  deliveryMethodButtons: {
    flexDirection: 'row',
    marginTop: 12,
    width: '100%',
    gap: 12,
  },
  deliveryMethodBtn: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
  },
  deliveryMethodBtnActive: {
    borderColor: '#10B981',
    backgroundColor: '#EAF7F1',
  },
  deliveryMethodText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 14,
  },
  deliveryMethodTextActive: {
    color: '#10B981',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  stepDotActive: {
    backgroundColor: '#10B981',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#10B981',
  },
  stepButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueButton: {
    marginBottom: 30,
    width: '100%',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
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
