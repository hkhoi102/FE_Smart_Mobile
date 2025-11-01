# API Integration Guide - Smart Retail App

## Tổng quan

Đã tích hợp thành công API authentication từ auth-service (port 8081) với React Native app.

## Cấu trúc API đã implement

### 1. ApiClient (`services/api/ApiClient.ts`)
- HTTP client với timeout và error handling
- Tự động thêm Authorization header
- Hỗ trợ GET, POST, PUT, DELETE methods
- Xử lý response và error một cách thống nhất

### 2. AuthApi (`services/api/AuthApi.ts`)
- Login API
- Register API
- Refresh token API
- Logout API
- Health check API

### 3. Cập nhật UI Components

#### LoginScreen
- ✅ Tích hợp API login thực
- ✅ Validation input
- ✅ Error handling với UI feedback
- ✅ Loading states
- ✅ Alert notifications

#### SignUpScreen
- ✅ Tích hợp API register thực
- ✅ Thêm field số điện thoại
- ✅ Validation đầy đủ
- ✅ Error handling
- ✅ Loading states

#### AccountScreen
- ✅ Logout với API call
- ✅ Confirmation dialog
- ✅ Loading states

## Cách test

### 1. Khởi động Backend Services
```bash
# Trong thư mục smart-retail-backend
# Khởi động discovery-server trước
cd discovery-server
mvn spring-boot:run

# Khởi động auth-service
cd ../service-auth
mvn spring-boot:run

# Khởi động user-service (cần thiết cho auth)
cd ../user-service
mvn spring-boot:run
```

### 2. Khởi động React Native App
```bash
# Trong thư mục supermarket-customer-app
npm start
# hoặc
expo start
```

### 3. Test Cases

#### Test Login
1. Mở app → Login screen
2. Nhập email: `user@example.com`
3. Nhập password: `Password123!`
4. Nhấn "Đăng Nhập"
5. Kiểm tra console logs để xem API calls

#### Test Register
1. Mở app → SignUp screen
2. Điền đầy đủ thông tin:
   - Tên: `Nguyễn Văn A`
   - Email: `newuser@example.com`
   - Password: `Password123!`
   - Số điện thoại: `0123456789`
3. Nhấn "Đăng Ký"

#### Test Error Handling
1. Thử login với sai password
2. Thử register với email đã tồn tại
3. Thử với mạng bị ngắt

## Cấu hình API

### Base URL
- Auth Service: `http://localhost:8081`
- Có thể thay đổi trong `services/api/ApiClient.ts`

### Timeout
- Mặc định: 10 giây
- Có thể điều chỉnh trong ApiClient constructor

## Lưu ý quan trọng

### 1. Network Configuration
- Đảm bảo backend services đang chạy
- Kiểm tra firewall và network connectivity
- Với Android emulator, có thể cần dùng `10.0.2.2` thay vì `localhost`

### 2. CORS Issues
- Backend cần cấu hình CORS cho mobile app
- Kiểm tra Spring Security configuration

### 3. Token Management
- Access token được lưu trong AsyncStorage
- Refresh token logic chưa được implement đầy đủ
- Cần thêm auto-refresh token khi access token hết hạn

### 4. Error Handling
- Đã implement basic error handling
- Có thể cần thêm retry logic cho network errors
- Cần thêm offline mode handling

## Next Steps

1. **JWT Token Decoding**: Implement JWT decode để lấy user info từ token
2. **Auto Refresh Token**: Tự động refresh token khi hết hạn
3. **Offline Mode**: Xử lý khi không có mạng
4. **Biometric Authentication**: Thêm xác thực sinh trắc học
5. **Remember Me**: Lưu trạng thái đăng nhập lâu dài

## Troubleshooting

### Lỗi "Network request failed"
- Kiểm tra backend services có đang chạy không
- Kiểm tra network connectivity
- Thử đổi localhost thành IP address thực

### Lỗi "Request timeout"
- Tăng timeout trong ApiClient
- Kiểm tra server performance

### Lỗi 401 Unauthorized
- Kiểm tra token có hợp lệ không
- Kiểm tra token có hết hạn không
- Thử login lại

## API Endpoints

```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/health
GET  /api/auth/test
```

## Response Format

```typescript
interface AuthResponse {
  accessToken: string;
  tokenType: string;
  refreshToken: string;
}
```
