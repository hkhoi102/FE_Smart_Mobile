import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import OrderApi, { OrderResponse } from '../../services/api/OrderApi';
import { RootStackParamList } from '../../types/navigation';

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setError(null);
      const response = await OrderApi.getOrders({ size: 50 });
      if (response.success) {
        setOrders(response.data || []);
      } else {
        setOrders([]);
      }
    } catch (e: any) {
      console.error('Error fetching orders:', e);
      setError(e.message || 'Không thể tải danh sách đơn hàng');
      setOrders([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        await fetchOrders();
        setLoading(false);
      };
      load();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const formatVND = (value?: number | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0đ';
    }
    return `${value.toLocaleString('vi-VN')}đ`;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString || 'N/A';
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString || 'N/A';
    }
  };

  const getPaymentStatusColor = (status?: string | null) => {
    if (!status) return '#F59E0B';
    const upperStatus = status.toUpperCase();
    return upperStatus === 'PAID' ? '#10B981' : '#F59E0B';
  };

  const getPaymentStatusText = (status?: string | null) => {
    if (!status) return 'Chưa thanh toán';
    const upperStatus = status.toUpperCase();
    if (upperStatus === 'PAID') {
      return 'Đã thanh toán';
    } else if (upperStatus === 'UNPAID') {
      return 'Chưa thanh toán';
    }
    return 'Chưa thanh toán'; // Fallback
  };

  const getPaymentMethodText = (method?: string | null) => {
    if (!method) return 'Thanh toán khi nhận hàng';
    if (method === 'COD' || method === 'cod') {
      return 'Tiền mặt';
    } else if (method === 'BANK_TRANSFER' || method === 'Bank_Tra' || method === 'bank_transfer' || method === 'bank_tra') {
      return 'Chuyển khoản';
    }
    return 'Thanh toán khi nhận hàng'; // Fallback
  };

  const getOrderStatusColor = (status?: string | null) => {
    if (!status) return '#F59E0B';
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case 'PENDING':
        return '#F59E0B'; // Vàng cam
      case 'CONFIRMED':
        return '#3B82F6'; // Xanh dương
      case 'DELIVERING':
        return '#8B5CF6'; // Tím
      case 'COMPLETED':
        return '#10B981'; // Xanh lá
      case 'CANCELLED':
        return '#EF4444'; // Đỏ
      default:
        return '#F59E0B';
    }
  };

  const getOrderStatusText = (status?: string | null) => {
    if (!status) return 'Đang chờ';
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case 'PENDING':
        return 'Đang chuẩn bị';
      case 'CONFIRMED':
        return 'Đã chuẩn bị xong';
      case 'DELIVERING':
        return 'Đang giao';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return 'Đang chờ';
    }
  };

  const renderOrderItem = ({ item }: { item: OrderResponse }) => {
    const paymentStatusColor = getPaymentStatusColor(item.paymentStatus);
    const orderStatusColor = getOrderStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.7}
        onPress={() => {
          navigation.navigate('OrderDetail', { orderId: item.id });
        }}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderId}>Mã đơn hàng: {item.orderCode || (item.id ? `#${item.id}` : 'N/A')}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={styles.statusBadgesContainer}>
            <View style={[styles.statusBadge, { backgroundColor: `${orderStatusColor}20` }]}>
              <Text style={[styles.statusText, { color: orderStatusColor }]}>
                {getOrderStatusText(item.status)}
              </Text>
            </View>
            <View style={[styles.statusBadge, styles.paymentStatusBadge, { backgroundColor: `${paymentStatusColor}20` }]}>
              <Text style={[styles.statusText, { color: paymentStatusColor }]}>
                {getPaymentStatusText(item.paymentStatus)}
              </Text>
            </View>
          </View>
        </View>

        {item.orderDetails && item.orderDetails.length > 0 && (
          <View style={styles.orderDetails}>
            {item.orderDetails.slice(0, 2).map((detail, idx) => (
              <Text key={`order-${item.id}-detail-${detail.id || idx}`} style={styles.orderDetailText}>
                {detail.productName || 'Sản phẩm'} {detail.unitName ? `(${detail.unitName})` : ''} - SL: {detail.quantity || 0}
              </Text>
            ))}
            {item.orderDetails.length > 2 && (
              <Text style={styles.moreItemsText}>
                +{item.orderDetails.length - 2 || 0} sản phẩm khác
              </Text>
            )}
          </View>
        )}

        <View style={styles.orderFooter}>
          <View style={styles.orderFooterLeft}>
            <Text style={styles.paymentMethodText}>
              {getPaymentMethodText(item.paymentMethod)}
            </Text>
          </View>
          <Text style={styles.orderTotal}>
            {formatVND(item.totalAmount ?? 0)}
          </Text>
        </View>

        {item.discountAmount && item.discountAmount > 0 && (
          <View style={styles.discountContainer}>
            <Text style={styles.discountText}>
              Đã giảm: {formatVND(item.discountAmount ?? 0)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#B6B6B6" />
      <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
      <Text style={styles.emptySubtitle}>
        Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => {
          navigation.navigate('Root', { screen: 'Shop' });
        }}
      >
        <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đơn Hàng</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (error && orders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đơn Hàng</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F59E0B" />
          <Text style={styles.emptyTitle}>Có lỗi xảy ra</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={onRefresh}
          >
            <Text style={styles.shopButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn Hàng</Text>
        <View style={styles.headerRight} />
      </View>

      {orders.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderEmptyState()}
        </ScrollView>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item, index) => item.id ? String(item.id) : `order-${index}`}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#B6B6B6',
  },
  scrollContent: {
    flexGrow: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#B6B6B6',
  },
  statusBadgesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  paymentStatusBadge: {
    marginRight: 0,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 12,
    paddingLeft: 4,
  },
  orderDetailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  moreItemsText: {
    fontSize: 12,
    color: '#B6B6B6',
    fontStyle: 'italic',
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  orderFooterLeft: {
    flex: 1,
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#666',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  discountContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  discountText: {
    fontSize: 12,
    color: '#10B981',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#B6B6B6',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrdersScreen;

