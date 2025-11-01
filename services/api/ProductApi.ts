import ApiClient from './ApiClient';

// Product types
export interface ProductUnit {
  id: number;
  unitId: number;
  unitName: string;
  unitDescription: string;
  conversionRate: number;
  currentPrice: number;
  priceValidFrom: string;
  priceValidTo: string;
  isDefault: boolean;
  convertedPrice: number;
  quantity?: number;
  availableQuantity?: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  expirationDate?: string;
  categoryId: number;
  categoryName?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  defaultUnitId?: number;
  productUnits?: ProductUnit[];
  barcodes?: any;
  currentPrice?: number; // For display purposes
}


export interface ProductPrice {
  id: number;
  productUnitId: number;
  price: number;
  timeStart: string;
  timeEnd: string;
  active: boolean;
}

export interface ProductWithPrice extends Product {
  units?: ProductUnit[];
  currentPrice?: number;
  priceUnit?: string;
  displayPrice?: string;
  displayImage?: any;
}

export interface ProductResponse {
  success: boolean;
  data: Product[];
  message?: string;
  total?: number;
  totalElements?: number;
  totalPages?: number;
  currentPage?: number;
  size?: number;
}

export interface ProductSearchRequest {
  page?: number;
  size?: number;
  name?: string;
  categoryId?: number;
}

class ProductApi {
  private apiClient: typeof ApiClient;

  constructor() {
    this.apiClient = ApiClient;
  }

  // Get all products with pagination and filters
  async getProducts(params?: ProductSearchRequest): Promise<ProductResponse> {
    try {
      let endpoint = '/api/products';
      const queryParams = new URLSearchParams();

      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.name) queryParams.append('name', params.name);
      if (params?.categoryId !== undefined) queryParams.append('categoryId', params.categoryId.toString());

      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }

      const response = await this.apiClient.get<any>(endpoint);
      console.log('🔍 Raw products API response:', response);

      // Handle different response formats
      if (response.data) {
        if (Array.isArray(response.data)) {
          return { success: true, data: response.data };
        } else if (response.data.data && Array.isArray(response.data.data)) {
          return {
            success: true,
            data: response.data.data,
            total: response.data.total,
            totalElements: response.data.totalElements,
            totalPages: response.data.totalPages,
            currentPage: response.data.currentPage,
            size: response.data.size
          };
        }
      }

      return { success: false, data: [] };
    } catch (error: any) {
      console.error('ProductApi.getProducts error:', error);
      throw new Error(error.message || 'Failed to fetch products');
    }
  }

  // Get products by category
  async getProductsByCategory(categoryId: number, params?: { page?: number; size?: number }): Promise<ProductResponse> {
    try {
      let endpoint = `/api/products/category/${categoryId}`;
      const queryParams = new URLSearchParams();

      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());

      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }

      const response = await this.apiClient.get<any>(endpoint);
      console.log('🔍 Raw category products API response:', response);

      // Handle different response formats
      if (response.data) {
        if (Array.isArray(response.data)) {
          return { success: true, data: response.data };
        } else if (response.data.data && Array.isArray(response.data.data)) {
          return {
            success: true,
            data: response.data.data,
            total: response.data.total,
            totalElements: response.data.totalElements,
            totalPages: response.data.totalPages,
            currentPage: response.data.currentPage,
            size: response.data.size
          };
        }
      }

      return { success: false, data: [] };
    } catch (error: any) {
      console.error('ProductApi.getProductsByCategory error:', error);
      throw new Error(error.message || 'Failed to fetch products by category');
    }
  }

  // Get product by ID
  async getProductById(id: number): Promise<ProductResponse> {
    try {
      const response = await this.apiClient.get<any>(`/api/products/${id}`);
      console.log('🔍 Raw product detail API response:', response);

      if (response.data && response.data.data) {
        // API returns { data: { ... }, success: true }
        return { success: true, data: [response.data.data] };
      } else if (response.data) {
        // Fallback if structure is different
        return { success: true, data: [response.data] };
      }

      return { success: false, data: [] };
    } catch (error: any) {
      console.error('ProductApi.getProductById error:', error);
      throw new Error(error.message || 'Failed to fetch product');
    }
  }

  // Search products
  async searchProducts(query: string): Promise<ProductResponse> {
    try {
      const response = await this.apiClient.get<any>(`/api/products/search?q=${encodeURIComponent(query)}`);
      console.log('🔍 Raw search API response:', response);

      if (response.data) {
        if (Array.isArray(response.data)) {
          return { success: true, data: response.data };
        } else if (response.data.data && Array.isArray(response.data.data)) {
          return { success: true, data: response.data.data };
        }
      }

      return { success: false, data: [] };
    } catch (error: any) {
      console.error('ProductApi.searchProducts error:', error);
      throw new Error(error.message || 'Failed to search products');
    }
  }

  // Get current price for product
  async getCurrentPrice(productId: number, productUnitId?: number): Promise<{ price: number; unit: string } | null> {
    try {
      let endpoint = `/api/products/${productId}/prices/current`;
      if (productUnitId) {
        endpoint += `?productUnitId=${productUnitId}`;
      }

      const response = await this.apiClient.get<any>(endpoint);
      console.log('🔍 Price API response:', response);

      if (response.data && response.data.price) {
        return {
          price: response.data.price,
          unit: response.data.unitName || 'đơn vị'
        };
      }

      // Return default price if no price found
      return {
        price: 50000, // Default price
        unit: 'đơn vị'
      };
    } catch (error: any) {
      console.error('ProductApi.getCurrentPrice error:', error);
      // Return default price on error
      return {
        price: 50000, // Default price
        unit: 'đơn vị'
      };
    }
  }

  // Get product with price
  async getProductWithPrice(productId: number): Promise<ProductWithPrice | null> {
    try {
      console.log('🔄 getProductWithPrice called with ID:', productId);

      // Call API directly to get product details
      const response = await this.apiClient.get<any>(`/api/products/${productId}`);
      console.log('🔍 Raw API response:', response);

      if (!response.data || !response.data.data) {
        console.log('❌ No data in response');
        return null;
      }

      const product = response.data.data;
      console.log('🔍 Product data:', product);
      console.log('🔍 Product name:', product.name);
      console.log('🔍 Product description:', product.description);
      console.log('🔍 Product units:', product.productUnits);

      // Extract price from productUnits
      let currentPrice = 0;
      let priceUnit = 'đơn vị';

      if (product.productUnits && product.productUnits.length > 0) {
        // Find default unit or use first unit with valid price
        const defaultUnit = product.productUnits.find((unit: any) => unit.isDefault) || product.productUnits[0];
        const validUnit = product.productUnits.find((unit: any) => unit.currentPrice !== null && unit.currentPrice !== undefined) || defaultUnit;

        currentPrice = validUnit.currentPrice || 0;
        priceUnit = validUnit.unitName || 'đơn vị';
        console.log('💰 Price info:', { currentPrice, priceUnit, unit: validUnit });
      }

      // Process product with price
      const productWithPrice: ProductWithPrice = {
        ...product,
        currentPrice: currentPrice,
        priceUnit: priceUnit,
        displayPrice: currentPrice > 0 ? `${currentPrice.toLocaleString()}đ` : 'Liên hệ',
        displayImage: product.imageUrl ? { uri: product.imageUrl } : null,
        units: product.productUnits, // Map productUnits to units
      };

      console.log('🎨 Final product with price:', productWithPrice);
      return productWithPrice;
    } catch (error: any) {
      console.error('ProductApi.getProductWithPrice error:', error);
      return null;
    }
  }

  // Get product by barcode
  async getProductByBarcode(barcode: string): Promise<ProductWithPrice | null> {
    try {
      console.log('🔍 Searching product by barcode:', barcode);

      const response = await this.apiClient.get<any>(`/api/products/by-code/${barcode}`);
      console.log('🔍 Barcode search API response:', response);

      if (!response.data || !response.data.data) {
        console.log('❌ No product found for barcode:', barcode);
        return null;
      }

      const product = response.data.data;
      console.log('🔍 Product found by barcode:', product);

      // Extract price from productUnits
      let currentPrice = 0;
      let priceUnit = 'đơn vị';

      if (product.productUnits && product.productUnits.length > 0) {
        // Find default unit or use first unit with valid price
        const defaultUnit = product.productUnits.find((unit: any) => unit.isDefault) || product.productUnits[0];
        const validUnit = product.productUnits.find((unit: any) => unit.currentPrice !== null && unit.currentPrice !== undefined) || defaultUnit;

        currentPrice = validUnit.currentPrice || 0;
        priceUnit = validUnit.unitName || 'đơn vị';
        console.log('💰 Price info from barcode:', { currentPrice, priceUnit, unit: validUnit });
      }

      // Process product with price
      const productWithPrice: ProductWithPrice = {
        ...product,
        currentPrice: currentPrice,
        priceUnit: priceUnit,
        displayPrice: currentPrice > 0 ? `${currentPrice.toLocaleString()}đ` : 'Liên hệ',
        displayImage: product.imageUrl ? { uri: product.imageUrl } : null,
        units: product.productUnits, // Map productUnits to units
      };

      console.log('🎨 Final product from barcode:', productWithPrice);
      return productWithPrice;
    } catch (error: any) {
      console.error('ProductApi.getProductByBarcode error:', error);
      return null;
    }
  }

  // Resolve product information from a productUnitId
  async getProductByUnitId(productUnitId: number): Promise<ProductWithPrice | null> {
    // Try a few common endpoint shapes used by the product service
    const candidateEndpoints = [
      `/api/product-units/${productUnitId}`,
      `/api/products/units/${productUnitId}`,
      `/api/products/unit/${productUnitId}`,
    ];

    for (const ep of candidateEndpoints) {
      try {
        const resp = await this.apiClient.get<any>(ep);
        const d = resp?.data ?? resp;
        const data = d?.data ?? d;

        if (!data) continue;

        // If API returns a product directly
        if (data && data.id && (data.name || data.productUnits)) {
          // Build display fields similar to getProductWithPrice
          let currentPrice = 0;
          let priceUnit = 'đơn vị';
          if (Array.isArray(data.productUnits) && data.productUnits.length > 0) {
            const defaultUnit = data.productUnits.find((u: any) => u.isDefault) || data.productUnits[0];
            const validUnit = data.productUnits.find((u: any) => u.currentPrice != null) || defaultUnit;
            currentPrice = validUnit?.currentPrice || 0;
            priceUnit = validUnit?.unitName || 'đơn vị';
          }

          const productWithPrice: ProductWithPrice = {
            ...data,
            currentPrice,
            priceUnit,
            displayPrice: currentPrice > 0 ? `${currentPrice.toLocaleString()}đ` : 'Liên hệ',
            displayImage: data.imageUrl ? { uri: data.imageUrl } : null,
            units: data.productUnits,
          };
          return productWithPrice;
        }

        // If API returns a structure containing product or productId
        const product = data.product ?? data?.productInfo;
        const productId = data.productId ?? data?.product?.id;
        if (product) {
          // Build display product from embedded product
          let currentPrice = 0;
          let priceUnit = 'đơn vị';
          const productUnits = product.productUnits || data.productUnits;
          if (Array.isArray(productUnits) && productUnits.length > 0) {
            const defaultUnit = productUnits.find((u: any) => u.isDefault) || productUnits[0];
            const validUnit = productUnits.find((u: any) => u.currentPrice != null) || defaultUnit;
            currentPrice = validUnit?.currentPrice || 0;
            priceUnit = validUnit?.unitName || 'đơn vị';
          }
          const productWithPrice: ProductWithPrice = {
            ...product,
            currentPrice,
            priceUnit,
            displayPrice: currentPrice > 0 ? `${currentPrice.toLocaleString()}đ` : 'Liên hệ',
            displayImage: product.imageUrl ? { uri: product.imageUrl } : null,
            units: productUnits,
          } as any;
          return productWithPrice;
        }

        if (productId) {
          // Fallback: fetch by product id
          return await this.getProductWithPrice(Number(productId));
        }
      } catch (e) {
        // try next endpoint candidate
        continue;
      }
    }

    return null;
  }
}

// Export singleton instance
export default new ProductApi();
