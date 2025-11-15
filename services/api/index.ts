// Export all API services

export type { ApiError, ApiResponse } from './ApiClient';
export { authApi } from './AuthApi';
export type {
    AuthResponse, LoginRequest, LogoutRequest, RefreshRequest, RegisterRequest, UserInfo
} from './AuthApi';
export { default as CategoryApi } from './CategoryApi';
export type { Category, CategoryResponse } from './CategoryApi';
export { default as CustomerApi } from './CustomerApi';
export type { UserProfile } from './CustomerApi';
export { default as OrderApi } from './OrderApi';
export type { CreateOrderRequest, OrderResponse, PaymentMethod } from './OrderApi';
export { default as PaymentApi } from './PaymentApi';
export { default as ProductApi } from './ProductApi';
export type { Product, ProductResponse, ProductSearchRequest, ProductWithPrice } from './ProductApi';
export { default as ChatApi } from './ChatApi';
export type { ChatMessage, ChatRequest, ChatResponse } from './ChatApi';

