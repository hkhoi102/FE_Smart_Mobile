import apiClient, { ApiResponse } from './ApiClient';

// Auth interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  refreshToken: string;
  token?: string; // Alias for accessToken
  user?: UserInfo; // User info from response
}

export interface UserInfo {
  id: number;
  email: string;
  fullName?: string;
  username?: string;
  role?: string;
}

export interface ErrorResponse {
  message: string;
  timestamp: number;
}

export interface OtpVerificationRequest {
  email: string;
  otp: string;
}

export interface OtpVerificationResponse {
  success: boolean;
  message: string;
}

class AuthApi {
  private baseEndpoint = '/api/auth';

  // Login user
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<AuthResponse | ErrorResponse>(
        `${this.baseEndpoint}/login`,
        credentials
      );

      // Check if response contains error message (and it's not empty)
      if (response.data && 'message' in response.data && response.data.message && response.data.message.trim() !== '') {
        // This is an error response
        throw {
          message: response.data.message,
          status: 200, // Backend returns 200 for errors now
          data: response.data
        };
      }

      // Add token alias and create mock user info
      if (response.data && 'accessToken' in response.data) {
        response.data.token = response.data.accessToken;
        response.data.user = {
          id: 1, // Mock user ID
          email: credentials.email,
          username: credentials.email.split('@')[0],
          fullName: credentials.email.split('@')[0],
          role: 'CUSTOMER'
        };
      }

      return response as ApiResponse<AuthResponse>;
    } catch (error: any) {
      // Extract detailed error message from response
      let errorMessage = 'Đăng nhập thất bại';

      if (error.data && error.data.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific error cases
      if (error.status === 400) {
        errorMessage = 'Thông tin đăng nhập không hợp lệ';
      } else if (error.status === 401) {
        errorMessage = 'Email hoặc mật khẩu không đúng';
      } else if (error.status === 404) {
        errorMessage = 'Tài khoản không tồn tại';
      } else if (error.status === 500) {
        errorMessage = 'Lỗi server, vui lòng thử lại sau';
      }

      throw {
        message: errorMessage,
        status: error.status || 500,
        data: error.data,
      };
    }
  }

  // Register user
  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      console.log('🔍 AuthApi.register called with:', userData);
      console.log('🔍 Calling endpoint:', `${this.baseEndpoint}/register`);

      const response = await apiClient.post<AuthResponse | ErrorResponse>(
        `${this.baseEndpoint}/register`,
        userData
      );

      console.log('🔍 AuthApi.register response:', response);

      // Check if response contains error message (and it's not empty)
      if (response.data && 'message' in response.data && response.data.message && response.data.message.trim() !== '') {
        // This is an error response
        throw {
          message: response.data.message,
          status: 200, // Backend returns 200 for errors now
          data: response.data
        };
      }

      // Add token alias and create mock user info
      if (response.data && 'accessToken' in response.data) {
        response.data.token = response.data.accessToken;
        response.data.user = {
          id: 1, // Mock user ID
          email: userData.email,
          username: userData.fullName,
          fullName: userData.fullName,
          role: 'CUSTOMER'
        };
      }

      return response as ApiResponse<AuthResponse>;
    } catch (error: any) {
      // Extract detailed error message from response
      let errorMessage = 'Đăng ký thất bại';

      if (error.data && error.data.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific error cases
      if (error.status === 400) {
        errorMessage = 'Thông tin đăng ký không hợp lệ';
      } else if (error.status === 409) {
        errorMessage = 'Email đã được sử dụng';
      } else if (error.status === 422) {
        errorMessage = 'Dữ liệu không hợp lệ';
      } else if (error.status === 500) {
        errorMessage = 'Lỗi server, vui lòng thử lại sau';
      }

      throw {
        message: errorMessage,
        status: error.status || 500,
        data: error.data,
      };
    }
  }

  // Refresh token
  async refreshToken(refreshData: RefreshRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<AuthResponse>(
        `${this.baseEndpoint}/refresh`,
        refreshData
      );
      return response;
    } catch (error: any) {
      console.error('Refresh token API error:', error);
      throw {
        message: error.message || 'Làm mới token thất bại',
        status: error.status || 500,
      };
    }
  }

  // Logout user
  async logout(logoutData: LogoutRequest): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>(
        `${this.baseEndpoint}/logout`,
        logoutData
      );
      return response;
    } catch (error: any) {
      console.error('Logout API error:', error);
      throw {
        message: error.message || 'Đăng xuất thất bại',
        status: error.status || 500,
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<string>> {
    try {
      const response = await apiClient.get<string>(`${this.baseEndpoint}/health`);
      return response;
    } catch (error: any) {
      console.error('Health check API error:', error);
      throw {
        message: error.message || 'Không thể kết nối đến server',
        status: error.status || 500,
      };
    }
  }

  // Test endpoint
  async test(): Promise<ApiResponse<string>> {
    try {
      const response = await apiClient.get<string>(`${this.baseEndpoint}/test`);
      return response;
    } catch (error: any) {
      console.error('Test API error:', error);
      throw {
        message: error.message || 'Test API thất bại',
        status: error.status || 500,
      };
    }
  }

  // Verify OTP
  async verifyOtp(otpData: OtpVerificationRequest): Promise<ApiResponse<OtpVerificationResponse>> {
    try {
      console.log('🔍 AuthApi.verifyOtp called with:', otpData);

      // Call real backend API for OTP verification
      const response = await apiClient.post<OtpVerificationResponse>(
        '/api/users/activate',
        otpData
      );

      console.log('🔍 AuthApi.verifyOtp response:', response);
      return response;
    } catch (error: any) {
      // Extract detailed error message from response
      let errorMessage = 'Xác thực OTP thất bại';

      if (error.data && error.data.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific error cases
      if (error.status === 400) {
        errorMessage = 'Mã OTP không hợp lệ';
      } else if (error.status === 404) {
        errorMessage = 'Mã OTP đã hết hạn';
      } else if (error.status === 500) {
        errorMessage = 'Lỗi server, vui lòng thử lại sau';
      }

      throw {
        message: errorMessage,
        status: error.status || 500,
        data: error.data,
      };
    }
  }

  // Resend OTP
  async resendOtp(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      // Call real backend API for resend OTP
      const response = await apiClient.post<{ message: string }>(
        '/api/users/resend-otp',
        { email }
      );

      return response;
    } catch (error: any) {
      // Extract detailed error message from response
      let errorMessage = 'Gửi lại OTP thất bại';

      if (error.data && error.data.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific error cases
      if (error.status === 400) {
        errorMessage = 'Email không hợp lệ';
      } else if (error.status === 404) {
        errorMessage = 'Tài khoản không tồn tại';
      } else if (error.status === 429) {
        errorMessage = 'Vui lòng đợi trước khi gửi lại OTP';
      } else if (error.status === 500) {
        errorMessage = 'Lỗi server, vui lòng thử lại sau';
      }

      throw {
        message: errorMessage,
        status: error.status || 500,
        data: error.data,
      };
    }
  }
}

// Export singleton instance
export const authApi = new AuthApi();
export default AuthApi;
