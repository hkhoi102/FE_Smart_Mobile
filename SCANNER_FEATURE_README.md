# Tính năng Quét Mã Vạch - SuperMarket Customer App

## Tổng quan

Đã thêm thành công tính năng quét mã vạch và QR code vào ứng dụng SuperMarket Customer App. Tính năng này cho phép người dùng quét mã vạch sản phẩm để tìm kiếm thông tin sản phẩm một cách nhanh chóng.

## Các tính năng đã implement

### 1. **ScannerScreen** (`screens/scanner/ScannerScreen.tsx`)
- ✅ Giao diện quét mã vạch với camera thực tế
- ✅ Hỗ trợ quét nhiều loại mã vạch: QR, EAN13, EAN8, UPC, Code128, Code39, Codabar
- ✅ Giao diện overlay với khung quét rõ ràng
- ✅ Chuyển đổi camera trước/sau
- ✅ Xử lý quyền truy cập camera
- ✅ Tích hợp với API backend để tìm kiếm sản phẩm

### 2. **ProductApi** (`services/api/ProductApi.ts`)
- ✅ API tìm kiếm sản phẩm theo mã vạch
- ✅ API lấy danh sách sản phẩm với pagination
- ✅ API tìm kiếm sản phẩm theo tên
- ✅ API lấy sản phẩm theo danh mục
- ✅ Error handling đầy đủ

### 3. **Navigation Integration**
- ✅ Thêm tab "Quét Mã" vào bottom navigation
- ✅ Icon QR code cho tab scanner
- ✅ Navigation từ scanner đến product detail

## Cách sử dụng

### 1. **Truy cập tính năng quét mã**
- Mở ứng dụng và đăng nhập
- Nhấn vào tab "Quét Mã" ở bottom navigation
- Cấp quyền truy cập camera khi được yêu cầu

### 2. **Quét mã vạch**
- Hướng camera vào mã vạch hoặc QR code
- Đảm bảo mã vạch nằm trong khung quét
- Ứng dụng sẽ tự động nhận diện và hiển thị kết quả

### 3. **Xem kết quả**
- Nếu tìm thấy sản phẩm: Chuyển đến trang chi tiết sản phẩm
- Nếu không tìm thấy: Hiển thị thông báo và tùy chọn quét lại hoặc tìm kiếm thủ công

## Cấu hình API

### Backend Integration
- **API Gateway**: `http://192.168.31.122:8080`
- **Product Service**: `http://192.168.31.122:8084`
- **Endpoint**: `GET /api/products/by-code/{code}`

### Cấu hình trong `config/api-config.ts`
```typescript
DEVELOPMENT: {
  ANDROID_DEVICE: 'http://192.168.31.122:8080', // API Gateway
  IOS_DEVICE: 'http://192.168.31.122:8080', // API Gateway
}
```

## Dependencies đã thêm

```json
{
  "expo-camera": "^latest",
  "expo-barcode-scanner": "^latest"
}
```

## Cấu trúc file

```
screens/scanner/
├── ScannerScreen.tsx          # Màn hình quét mã chính

services/api/
├── ProductApi.ts              # API service cho sản phẩm
├── index.ts                   # Export API services

navigations/
├── AppNavigator.tsx           # Navigation với tab Scanner

types/
├── navigation.ts              # Type definitions
```

## API Endpoints được sử dụng

### 1. Tìm kiếm sản phẩm theo mã vạch
```
GET /api/products/by-code/{code}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Coca Cola",
    "description": "Nước ngọt Coca Cola",
    "imageUrl": "https://example.com/coca-cola.jpg",
    "categoryId": 1,
    "active": true
  }
}
```

### 2. Lấy danh sách sản phẩm
```
GET /api/products?page=0&size=10&name=coca&categoryId=1
```

### 3. Tìm kiếm sản phẩm
```
GET /api/products/search?q=keyword
```

## Error Handling

- **Camera Permission**: Xử lý khi người dùng từ chối quyền camera
- **Network Error**: Xử lý khi không thể kết nối API
- **Product Not Found**: Xử lý khi không tìm thấy sản phẩm
- **Invalid Barcode**: Xử lý khi mã vạch không hợp lệ

## Testing

### 1. Test Camera Permission
- Từ chối quyền camera → Hiển thị màn hình yêu cầu cấp quyền
- Cấp quyền camera → Chuyển đến màn hình quét

### 2. Test Barcode Scanning
- Quét mã vạch hợp lệ → Tìm thấy sản phẩm → Chuyển đến product detail
- Quét mã vạch không tồn tại → Hiển thị thông báo lỗi

### 3. Test Navigation
- Tab Scanner hoạt động bình thường
- Navigation từ scanner đến product detail
- Back button hoạt động

## Troubleshooting

### 1. Camera không hoạt động
- Kiểm tra quyền camera trong Settings
- Restart ứng dụng
- Kiểm tra thiết bị có camera không

### 2. Không tìm thấy sản phẩm
- Kiểm tra kết nối mạng
- Kiểm tra API Gateway có chạy không
- Kiểm tra Product Service có chạy không
- Kiểm tra mã vạch có trong database không

### 3. Lỗi API
- Kiểm tra IP address trong config
- Kiểm tra CORS settings
- Kiểm tra logs trong console

## Future Enhancements

1. **Image Scanning**: Quét mã vạch từ hình ảnh có sẵn
2. **History**: Lưu lịch sử quét mã
3. **Offline Mode**: Hoạt động khi không có mạng
4. **Batch Scanning**: Quét nhiều mã cùng lúc
5. **Custom Barcode Types**: Hỗ trợ thêm loại mã vạch khác

## Notes

- Tính năng yêu cầu camera thực tế để hoạt động
- Cần cấu hình đúng IP address của API Gateway
- Backend Product Service phải có endpoint `/api/products/by-code/{code}`
- Cần cấu hình CORS cho mobile app trong backend
