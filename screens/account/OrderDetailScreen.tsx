import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useNotification } from '../../contexts/NotificationContext';
import OrderApi, { OrderDetail, OrderResponse, ReturnDetailRequest } from '../../services/api/OrderApi';
import ProductApi from '../../services/api/ProductApi';
import { RootStackParamList } from '../../types/navigation';

interface EnrichedOrderDetail extends OrderDetail {
  enrichedProductName?: string;
  enrichedUnitName?: string;
  enrichedPrice?: number;
}

const OrderDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'OrderDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { orderId } = route.params;
  const { showError, showSuccess, showAlert } = useNotification();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [enrichedDetails, setEnrichedDetails] = useState<EnrichedOrderDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showReturnModal, setShowReturnModal] = useState<boolean>(false);
  const [returnReason, setReturnReason] = useState<string>('');
  const [returnDetails, setReturnDetails] = useState<{ [key: number]: number }>({}); // orderDetailId -> quantity
  const [submittingReturn, setSubmittingReturn] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelNote, setCancelNote] = useState<string>('');
  const [cancellingOrder, setCancellingOrder] = useState<boolean>(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await OrderApi.getOrderById(orderId);
      setOrder(orderData);

      // Enrich order details with product information
      if (orderData.orderDetails && orderData.orderDetails.length > 0) {
        const enriched = await Promise.all(
          orderData.orderDetails.map(async (detail: OrderDetail) => {
            try {
              if (detail.productUnitId) {
                const product = await ProductApi.getProductByUnitId(detail.productUnitId);
                if (product) {
                  // Find the specific product unit by productUnitId to get correct price and unit name
                  const productUnits = product.units || product.productUnits || [];
                  const matchingUnit = productUnits.find((unit: any) => unit.id === detail.productUnitId);

                  const unitPrice = matchingUnit?.currentPrice || matchingUnit?.convertedPrice || product.currentPrice || detail.price || 0;
                  const unitName = matchingUnit?.unitName || product.priceUnit || detail.unitName;

                  // Calculate total price: quantity × price
                  const calculatedTotalPrice = (detail.quantity || 0) * unitPrice;

                  return {
                    ...detail,
                    enrichedProductName: product.name || detail.productName,
                    enrichedUnitName: unitName,
                    enrichedPrice: unitPrice,
                    totalPrice: detail.totalPrice || calculatedTotalPrice, // Use calculated if original is missing/0
                  } as EnrichedOrderDetail;
                }
              }
              // Even if product fetch fails, try to calculate totalPrice from quantity × price
              const calculatedTotalPrice = (detail.quantity || 0) * (detail.price || 0);
              return {
                ...detail,
                totalPrice: detail.totalPrice || calculatedTotalPrice,
              } as EnrichedOrderDetail;
            } catch (e) {
              console.error(`Error fetching product for unitId ${detail.productUnitId}:`, e);
              // Calculate totalPrice even on error
              const calculatedTotalPrice = (detail.quantity || 0) * (detail.price || 0);
              return {
                ...detail,
                totalPrice: detail.totalPrice || calculatedTotalPrice,
              } as EnrichedOrderDetail;
            }
          })
        );
        setEnrichedDetails(enriched);
      } else {
        setEnrichedDetails([]);
      }
    } catch (e: any) {
      console.error('Error fetching order detail:', e);
      setError(e.message || 'Không thể tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
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
    return 'Chưa thanh toán';
  };

  const getPaymentMethodText = (method?: string | null) => {
    if (!method) return 'Thanh toán khi nhận hàng';
    if (method === 'COD' || method === 'cod') {
      return 'Tiền mặt';
    } else if (method === 'BANK_TRANSFER' || method === 'Bank_Tra' || method === 'bank_transfer' || method === 'bank_tra') {
      return 'Chuyển khoản';
    }
    return 'Thanh toán khi nhận hàng';
  };

  const handleReturnOrder = () => {
    setShowReturnModal(true);
    setReturnReason('');
    setReturnDetails({});
  };

  const handleToggleReturnDetail = (orderDetailId: number, maxQuantity: number) => {
    setReturnDetails((prev) => {
      const current = prev[orderDetailId] || 0;
      if (current === 0) {
        return { ...prev, [orderDetailId]: 1 };
      } else {
        return { ...prev, [orderDetailId]: 0 };
      }
    });
  };

  const handleChangeReturnQuantity = (orderDetailId: number, quantity: number, maxQuantity: number) => {
    const validQuantity = Math.max(0, Math.min(quantity, maxQuantity));
    setReturnDetails((prev) => ({
      ...prev,
      [orderDetailId]: validQuantity,
    }));
  };

  const handleSubmitReturn = async () => {
    if (!returnReason.trim()) {
      showError('Vui lòng nhập lý do trả hàng');
      return;
    }

    const returnDetailsList: ReturnDetailRequest[] = Object.entries(returnDetails)
      .filter(([_, quantity]) => quantity && quantity > 0)
      .map(([orderDetailId, quantity]) => ({
        orderDetailId: Number(orderDetailId),
        quantity: Number(quantity) || 0,
      }));

    if (returnDetailsList.length === 0) {
      showError('Vui lòng chọn ít nhất một sản phẩm để trả');
      return;
    }

    try {
      setSubmittingReturn(true);
      const response = await OrderApi.createReturn({
        orderId: orderId,
        reason: returnReason.trim(),
        returnDetails: returnDetailsList,
      });

      if (response.success) {
        setShowReturnModal(false);
        showSuccess('Yêu cầu trả hàng đã được gửi thành công');
        fetchOrderDetail(); // Refresh order detail
      } else {
        throw new Error(response.message || 'Không thể tạo yêu cầu trả hàng');
      }
    } catch (e: any) {
      console.error('Error submitting return:', e);
      showError(e.message || 'Không thể gửi yêu cầu trả hàng. Vui lòng thử lại sau.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleCancelOrder = () => {
    setShowCancelModal(true);
    setCancelNote('');
  };

  const handleSubmitCancel = async () => {
    try {
      setCancellingOrder(true);
      await OrderApi.updateOrderStatus(orderId, 'CANCELLED', cancelNote.trim() || undefined);
      setShowCancelModal(false);
      showSuccess('Đơn hàng đã được hủy');
      fetchOrderDetail(); // Refresh order detail
    } catch (e: any) {
      console.error('Error cancelling order:', e);
      showError(e.message || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setCancellingOrder(false);
    }
  };

  const getOrderStatus = () => {
    if (!order || !order.status) return '';
    return order.status.toUpperCase();
  };

  const shouldShowReturnButton = () => {
    const status = getOrderStatus();
    return status === 'COMPLETED';
  };

  const shouldShowCancelButton = () => {
    const status = getOrderStatus();
    return status === 'PENDING';
  };

  const renderOrderDetailItem = (detail: EnrichedOrderDetail | null | undefined, index: number) => {
    if (!detail) return null;

    const productName = detail.enrichedProductName || detail.productName || 'Sản phẩm';
    const unitName = String(detail.enrichedUnitName || detail.unitName || '');
    const price = detail.enrichedPrice ?? detail.price ?? 0;
    const quantity = detail.quantity ?? 0;

    // Calculate total price if missing or 0: quantity × price
    const totalPrice = (detail.totalPrice && detail.totalPrice > 0)
      ? detail.totalPrice
      : (quantity * price);

    return (
      <View style={styles.detailItem}>
        <View style={styles.detailItemLeft}>
          <Text style={styles.detailItemName}>
            {productName} {unitName ? `(${unitName})` : ''}
          </Text>
          <Text style={styles.detailItemQuantity}>
            Số lượng: {String(quantity || 0)} x {formatVND(price || 0)}
          </Text>
        </View>
        <Text style={styles.detailItemTotal}>{formatVND(totalPrice)}</Text>
      </View>
    );
  };

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
          <Text style={styles.headerTitle}>Chi Tiết Đơn Hàng</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi Tiết Đơn Hàng</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F59E0B" />
          <Text style={styles.emptyTitle}>Có lỗi xảy ra</Text>
          <Text style={styles.emptySubtitle}>{error || 'Không tìm thấy đơn hàng'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchOrderDetail}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusColor = getPaymentStatusColor(order.paymentStatus);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Đơn Hàng</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Thông Tin Đơn Hàng</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getPaymentStatusText(order.paymentStatus)}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã đơn hàng:</Text>
            <Text style={styles.infoValue}>{order.orderCode || (order.id ? `#${order.id}` : 'N/A')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày đặt:</Text>
            <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phương thức thanh toán:</Text>
            <Text style={styles.infoValue}>{getPaymentMethodText(order.paymentMethod)}</Text>
          </View>
        </View>

        {/* Order Details */}
        {Array.isArray(enrichedDetails) && enrichedDetails.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sản Phẩm ({enrichedDetails.length || 0})</Text>
            {enrichedDetails.map((detail, index) => (
              <React.Fragment key={detail.id ? `detail-${detail.id}` : `detail-index-${index}`}>
                {renderOrderDetailItem(detail, index)}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Payment Info */}
        {order.paymentInfo && order.paymentMethod !== 'COD' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông Tin Thanh Toán</Text>
            {order.paymentInfo.accountNumber ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số tài khoản:</Text>
                <Text style={styles.infoValue}>{String(order.paymentInfo.accountNumber || '')}</Text>
              </View>
            ) : null}
            {order.paymentInfo.accountName ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Chủ tài khoản:</Text>
                <Text style={styles.infoValue}>{String(order.paymentInfo.accountName || '')}</Text>
              </View>
            ) : null}
            {order.paymentInfo.bankCode ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ngân hàng:</Text>
                <Text style={styles.infoValue}>{String(order.paymentInfo.bankCode || '')}</Text>
              </View>
            ) : null}
            {order.paymentInfo.transferContent ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nội dung chuyển khoản:</Text>
                <Text style={styles.infoValue}>{String(order.paymentInfo.transferContent || '')}</Text>
              </View>
            ) : null}
            {order.paymentInfo.qrContent ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>QR Code:</Text>
                <Text style={styles.infoValue} numberOfLines={3}>{String(order.paymentInfo.qrContent || '')}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tổng Kết</Text>
          {order.discountAmount && order.discountAmount > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giảm giá:</Text>
              <Text style={styles.summaryDiscountValue}>-{formatVND(order.discountAmount ?? 0)}</Text>
            </View>
          ) : null}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Tổng tiền:</Text>
            <Text style={styles.summaryTotalValue}>{formatVND(order.totalAmount ?? 0)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {shouldShowReturnButton() ? (
          <TouchableOpacity
            style={styles.returnButton}
            onPress={handleReturnOrder}
            activeOpacity={0.8}
          >
            <Ionicons name="return-down-back-outline" size={20} color="#fff" />
            <Text style={styles.returnButtonText}>Trả Hàng</Text>
          </TouchableOpacity>
        ) : null}
        {shouldShowCancelButton() ? (
          <TouchableOpacity
            style={styles.cancelOrderButton}
            onPress={handleCancelOrder}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={20} color="#fff" />
            <Text style={styles.cancelOrderButtonText}>Hủy Đơn</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      {/* Return Modal */}
      <Modal
        visible={showReturnModal}
        transparent
        animationType="slide"
        onRequestClose={() => !submittingReturn && setShowReturnModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Trả Hàng</Text>
              <TouchableOpacity
                onPress={() => setShowReturnModal(false)}
                disabled={submittingReturn}
              >
                <Ionicons name="close" size={24} color="#222" />
              </TouchableOpacity>
            </View>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <Text style={styles.sectionTitle}>Chọn sản phẩm muốn trả:</Text>
              {Array.isArray(enrichedDetails) && enrichedDetails.length > 0 ? (
                enrichedDetails
                  .filter((detail) => detail && detail.id)
                  .map((detail, index) => {
                    const detailId = detail.id!;
                    const maxQuantity = Number(detail.quantity ?? 0);
                    const returnQuantity = Number(returnDetails[detailId] || 0);
                    const isSelected = Boolean(returnQuantity > 0);

                return (
                  <View key={`return-${detailId}-${index}`} style={styles.returnItem}>
                    <TouchableOpacity
                      style={styles.returnItemCheckbox}
                      onPress={() => handleToggleReturnDetail(detailId, maxQuantity)}
                      disabled={submittingReturn}
                    >
                      <Ionicons
                        name={isSelected ? 'checkbox' : 'square-outline'}
                        size={24}
                        color={isSelected ? '#10B981' : '#B6B6B6'}
                      />
                      <View style={styles.returnItemInfo}>
                        <Text style={styles.returnItemName}>
                          {detail.enrichedProductName || detail.productName || 'Sản phẩm'}
                          {detail.enrichedUnitName || detail.unitName ? ` (${String(detail.enrichedUnitName || detail.unitName || '')})` : ''}
                        </Text>
                        <Text style={styles.returnItemQuantity}>
                          Đã mua: {String(maxQuantity || 0)} {String(detail.enrichedUnitName || detail.unitName || 'sản phẩm')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    {isSelected ? (
                      <View style={styles.quantitySelector}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => handleChangeReturnQuantity(detailId, returnQuantity - 1, maxQuantity)}
                          disabled={submittingReturn || returnQuantity <= 1}
                        >
                          <Ionicons name="remove" size={20} color="#222" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{String(returnQuantity || 0)}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => handleChangeReturnQuantity(detailId, returnQuantity + 1, maxQuantity)}
                          disabled={submittingReturn || returnQuantity >= maxQuantity}
                        >
                          <Ionicons name="add" size={20} color="#222" />
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>Không có sản phẩm để trả</Text>
            )}

              <Text style={styles.sectionTitle}>Lý do trả hàng:</Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="Nhập lý do trả hàng..."
                multiline
                numberOfLines={4}
                value={returnReason}
                onChangeText={setReturnReason}
                editable={!submittingReturn}
                placeholderTextColor="#B6B6B6"
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              </ScrollView>
            </TouchableWithoutFeedback>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowReturnModal(false)}
                disabled={submittingReturn}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton, submittingReturn && styles.submitButtonDisabled]}
                onPress={handleSubmitReturn}
                disabled={submittingReturn}
              >
                {submittingReturn ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Gửi Yêu Cầu</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => !cancellingOrder && setShowCancelModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hủy Đơn Hàng</Text>
              <TouchableOpacity
                onPress={() => setShowCancelModal(false)}
                disabled={cancellingOrder}
              >
                <Ionicons name="close" size={24} color="#222" />
              </TouchableOpacity>
            </View>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <Text style={styles.sectionTitle}>Ghi chú (tùy chọn):</Text>
                <TextInput
                  style={styles.reasonInput}
                  placeholder="Nhập lý do hủy đơn..."
                  multiline
                  numberOfLines={4}
                  value={cancelNote}
                  onChangeText={setCancelNote}
                  editable={!cancellingOrder}
                  placeholderTextColor="#B6B6B6"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </ScrollView>
            </TouchableWithoutFeedback>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCancelModal(false)}
                disabled={cancellingOrder}
              >
                <Text style={styles.cancelButtonText}>Không</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitCancelButton, cancellingOrder && styles.submitButtonDisabled]}
                onPress={handleSubmitCancel}
                disabled={cancellingOrder}
              >
                {cancellingOrder ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Xác Nhận Hủy</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
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
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  detailItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    marginBottom: 4,
  },
  detailItemQuantity: {
    fontSize: 13,
    color: '#666',
  },
  detailItemTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryDiscountValue: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
  retryButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  returnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  modalBody: {
    padding: 20,
    maxHeight: '60%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
    marginTop: 8,
  },
  returnItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  returnItemCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  returnItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  returnItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    marginBottom: 4,
  },
  returnItemQuantity: {
    fontSize: 13,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#B6B6B6',
    textAlign: 'center',
    paddingVertical: 20,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#222',
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#F9F9F9',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#10B981',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  cancelOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  submitCancelButton: {
    backgroundColor: '#EF4444',
  },
});

export default OrderDetailScreen;

