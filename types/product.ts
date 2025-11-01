// Product types for API integration
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
  // For UI display
  displayPrice?: string;
  displayImage?: any; // React Native Image source
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
