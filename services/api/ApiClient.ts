import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseURL } from '../../config/api-config';

// Base configuration - Using API Gateway
const BASE_URL = getBaseURL();


// Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  status?: number;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = BASE_URL;
    this.timeout = 10000; // 10 seconds
  }

  // Get auth token from storage
  private async getAuthToken(): Promise<string | null> {
    try {
      // Prefer authToken; fallback to userToken (some flows save under this key)
      const token = await AsyncStorage.getItem('authToken');
      if (token) return token;
      const userToken = await AsyncStorage.getItem('userToken');
      return userToken;
    } catch (error) {
      return null;
    }
  }

  // Set auth token in storage
  private async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      // Silent fail
    }
  }

  // Remove auth token from storage
  private async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      // Silent fail
    }
  }

  // Handle response
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    console.log('🔁 ApiClient.handleResponse - status:', response.status, response.statusText);
    try {
      const clone = response.clone();
      const raw = await clone.text();
      if (raw) console.log('🔁 ApiClient.handleResponse - raw body:', raw);
    } catch {}
    // Check if response is ok
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorData: any = null;

      try {
        // Try to parse error response as JSON first
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } else {
          // If not JSON, try to get text
          const text = await response.text();
          if (text) {
            errorMessage = text;
          }
        }
      } catch (parseError) {
        // Silent fail
      }

      const error: ApiError = {
        message: errorMessage,
        status: response.status,
        data: errorData
      };

      throw error;
    }

    // Parse successful response
    try {
      const data = await response.json();
      return {
        success: true,
        data,
        status: response.status
      };
    } catch (error) {
      return {
        success: true,
        data: undefined,
        status: response.status
      };
    }
  }

  // Make HTTP request
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    console.log('🚀 ApiClient.request - Full URL:', url);
    console.log('🚀 ApiClient.request - Base URL:', this.baseURL);
    console.log('🚀 ApiClient.request - Endpoint:', endpoint);

    // Get auth token
    const token = await this.getAuthToken();

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    // Add auth token if available
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    };

    try {
      console.log('📦 ApiClient.request - Method:', (requestOptions as any)?.method || 'GET');
      if ((requestOptions as any)?.body) {
        console.log('📦 ApiClient.request - Body:', (requestOptions as any).body);
      }
      console.log('📦 ApiClient.request - Headers:', requestOptions.headers);
    } catch {}

    try {
      const response = await fetch(url, requestOptions);

      return await this.handleResponse<T>(response);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw {
          message: 'Request timeout',
          status: 408,
        } as ApiError;
      }
      throw error;
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, customHeaders?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, customHeaders);
  }

  async post<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }, customHeaders);
  }

  async put<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    }, customHeaders);
  }

  async patch<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    }, customHeaders);
  }

  async delete<T>(endpoint: string, customHeaders?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, customHeaders);
  }

  // Auth methods
  async setToken(token: string): Promise<void> {
    await this.setAuthToken(token);
  }

  async clearToken(): Promise<void> {
    await this.removeAuthToken();
  }

  async getToken(): Promise<string | null> {
    return await this.getAuthToken();
  }
}

// Export singleton instance
export default new ApiClient();
