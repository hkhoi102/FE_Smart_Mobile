import ApiClient, { ApiResponse } from './ApiClient';

export type PaymentMethod = 'COD' | 'BANK_TRANSFER';

export interface PreviewItem {
  productUnitId: number;
  quantity: number;
}

export interface OrderPreviewResponse {
  finalAmount: number;
  discountAmount: number;
  items?: any[];
}

export interface CreateOrderDetailRequest {
  productUnitId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  orderDetails: CreateOrderDetailRequest[];
  promotionAppliedId?: number;
  paymentMethod?: PaymentMethod;
  shippingAddress?: string;
  deliveryMethod?: string;
  phoneNumber?: string;
}

export interface OrderResponse {
  id: number;
  orderCode?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: PaymentMethod;
  paymentStatus: 'UNPAID'|'PAID';
  totalAmount: number;
  discountAmount?: number;
  paymentInfo?: {
    qrContent?: string;
    accountNumber?: string;
    accountName?: string;
    bankCode?: string;
    transferContent?: string;
    referenceId?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  orderDetails?: OrderDetail[];
}

export interface OrderDetail {
  id: number;
  productUnitId: number;
  productName?: string;
  unitName?: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface OrdersListResponse {
  success: boolean;
  data: OrderResponse[];
  total?: number;
  totalElements?: number;
  totalPages?: number;
  currentPage?: number;
}

export interface ReturnDetailRequest {
  orderDetailId: number;
  quantity: number;
}

export interface CreateReturnRequest {
  orderId: number;
  reason: string;
  returnDetails: ReturnDetailRequest[];
}

export interface ReturnResponse {
  success: boolean;
  message?: string;
  data?: any;
}

class OrderApi {
  private apiClient = ApiClient;

  async preview(items: PreviewItem[]): Promise<OrderPreviewResponse | null> {
    // Backend expects { orderDetails: [ { productUnitId, quantity } ] }
    const resp: ApiResponse<any> = await this.apiClient.post('/api/orders/preview', { orderDetails: items });
    const d = resp?.data ?? resp;
    const data = d?.data ?? d;
    if(!data) return null;
    const finalAmount = data.totalFinalAmount ?? data.finalAmount;
    const discountAmount = data.totalDiscountAmount ?? data.discountAmount ?? 0;
    return { finalAmount, discountAmount, items: data.items };
  }

  async createOrder(payload: CreateOrderRequest): Promise<OrderResponse> {
    const resp: ApiResponse<any> = await this.apiClient.post('/api/orders', payload);
    const d = resp?.data ?? resp;
    const data = d?.data ?? d;
    return data as OrderResponse;
  }

  async getPaymentStatus(orderId: number): Promise<any> {
    const resp: ApiResponse<any> = await this.apiClient.get(`/api/orders/${orderId}/payment-status`);
    return resp?.data ?? resp;
  }

  async updatePaymentStatus(orderId: number, paymentStatus: 'PAID'|'UNPAID'){
    // Backend controller defines @PatchMapping("/api/orders/{id}/payment-status")
    const resp: ApiResponse<any> = await this.apiClient.patch(`/api/orders/${orderId}/payment-status`, { paymentStatus });
    return resp?.data ?? resp;
  }

  // Get order by ID
  async getOrderById(orderId: number): Promise<OrderResponse> {
    try {
      const resp: ApiResponse<any> = await this.apiClient.get(`/api/orders/${orderId}`);
      const d = resp?.data ?? resp;
      const data = d?.data ?? d;

      if (data) {
        return data as OrderResponse;
      }

      throw new Error('Order not found');
    } catch (error: any) {
      console.error('OrderApi.getOrderById error:', error);
      throw new Error(error.message || 'Failed to fetch order');
    }
  }

  // Get orders list for current user
  async getOrders(params?: { page?: number; size?: number; status?: string }): Promise<OrdersListResponse> {
    try {
      const query = new URLSearchParams();
      if (params?.page !== undefined) query.append('page', params.page.toString());
      if (params?.size !== undefined) query.append('size', params.size.toString());
      if (params?.status) query.append('status', params.status);

      const endpoint = `/api/orders/me${query.toString() ? `?${query.toString()}` : ''}`;
      const resp: ApiResponse<any> = await this.apiClient.get(endpoint);
      const d = resp?.data ?? resp;

      // Handle different response formats
      if (Array.isArray(d)) {
        return { success: true, data: d };
      } else if (d?.data && Array.isArray(d.data)) {
        return {
          success: true,
          data: d.data,
          total: d.total,
          totalElements: d.totalElements,
          totalPages: d.totalPages,
          currentPage: d.currentPage,
        };
      } else if (d?.success !== undefined) {
        return d as OrdersListResponse;
      }

      return { success: false, data: [] };
    } catch (error: any) {
      console.error('OrderApi.getOrders error:', error);
      throw new Error(error.message || 'Failed to fetch orders');
    }
  }

  // Update order status
  async updateOrderStatus(orderId: number, status: string, note?: string): Promise<any> {
    try {
      const payload: any = { status };
      if (note) {
        payload.note = note;
      }
      const resp: ApiResponse<any> = await this.apiClient.patch(`/api/orders/${orderId}/status`, payload);
      return resp?.data ?? resp;
    } catch (error: any) {
      console.error('OrderApi.updateOrderStatus error:', error);
      throw new Error(error.message || 'Failed to update order status');
    }
  }

  // Create return order
  async createReturn(payload: CreateReturnRequest): Promise<ReturnResponse> {
    try {
      const resp: ApiResponse<any> = await this.apiClient.post('/api/returns', payload);
      const d = resp?.data ?? resp;

      if (d?.success !== undefined) {
        return d as ReturnResponse;
      }

      return { success: true, data: d };
    } catch (error: any) {
      console.error('OrderApi.createReturn error:', error);
      throw new Error(error.message || 'Failed to create return order');
    }
  }

  // Get best-selling products analytics
  async getBestSellingProducts(params: {
    startDate: string;
    endDate: string;
    sortBy?: 'quantity' | 'revenue';
    limit?: number;
  }): Promise<any[]> {
    const query = new URLSearchParams();
    query.append('startDate', params.startDate);
    query.append('endDate', params.endDate);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.limit !== undefined) query.append('limit', String(params.limit));

    const endpoint = `/api/orders/analytics/products/best-selling?${query.toString()}`;
    const resp: ApiResponse<any> = await this.apiClient.get(endpoint);
    const d = resp?.data ?? resp;
    const data = d?.data ?? d;
    return Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  }
}

export default new OrderApi();


