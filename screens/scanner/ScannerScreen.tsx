import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNotification } from '../../contexts/NotificationContext';
import ProductApi from '../../services/api/ProductApi';
import { RootStackParamList } from '../../types/navigation';

const { width, height } = Dimensions.get('window');

type ScannerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Scanner'>;

export default function ScannerScreen() {
  const navigation = useNavigation<ScannerScreenNavigationProp>();
  const { showAlert } = useNotification();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<string>('');
  const [facing, setFacing] = useState<CameraType>('back');
  const [isSearching, setIsSearching] = useState(false);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    // Prevent multiple scans - chỉ quét 1 lần duy nhất
    if (scanned || isSearching) {
      return;
    }

    setScanned(true);
    setScanResult(data);
    setIsSearching(true);

    console.log('🔍 Barcode scanned:', { type, data });

    try {
      // Tìm kiếm sản phẩm theo barcode
      const product = await ProductApi.getProductByBarcode(data);

      if (product) {
        console.log('✅ Product found:', product);

        // Chuyển thẳng đến trang chi tiết sản phẩm
        navigation.navigate('ProductDetail', { id: product.id.toString() });
        setScanned(false);
        setIsSearching(false);
      } else {
        console.log('❌ Product not found for barcode:', data);

        // Hiển thị thông báo không tìm thấy sản phẩm
        showAlert(
          'Không tìm thấy sản phẩm',
          `Mã vạch: ${data}\nSản phẩm không có trong hệ thống`,
          [
            {
              text: 'Quét lại',
              onPress: () => {
                setScanned(false);
                setIsSearching(false);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error searching product by barcode:', error);

      // Hiển thị thông báo lỗi
      showAlert(
        'Lỗi tìm kiếm',
        'Không thể tìm kiếm sản phẩm. Vui lòng thử lại.',
        [
          {
            text: 'Quét lại',
            onPress: () => {
              setScanned(false);
              setIsSearching(false);
            },
          },
        ]
      );
    }
  };

  const handleImageScan = () => {
    // TODO: Implement image scanning functionality
    showAlert(
      'Quét ảnh',
      'Tính năng quét ảnh sẽ được phát triển trong tương lai',
      [{ text: 'OK' }]
    );
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    // Camera permissions are still loading
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.text}>Đang tải quyền truy cập camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="camera" size={64} color="#666" />
          <Text style={styles.text}>Chúng tôi cần quyền truy cập camera để quét mã</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Cấp quyền</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Simple Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quét Mã</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraFacing}
          >
            <Ionicons name="camera-reverse" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Camera View - Full screen with overlay */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_e', 'code128', 'code39'],
          }}
        />

        {/* Dark overlay with square cutout */}
        <View style={styles.overlay}>
          <View style={styles.cutout} />
        </View>

        {/* Simple scanning frame */}
        <View style={styles.scanFrame}>
          <View style={styles.scanLine} />
        </View>

        {/* Simple instruction */}
        <View style={styles.instructionText}>
          {isSearching ? (
            <View style={styles.searchingContainer}>
              <ActivityIndicator size="small" color="#53B175" />
              <Text style={styles.instructionTitle}>Đang tìm kiếm sản phẩm...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.instructionTitle}>
                {scanned ? `Mã đã quét: ${scanResult}` : 'Hướng camera vào mã vạch'}
              </Text>
              {scanned && (
                <TouchableOpacity
                  style={styles.rescanButton}
                  onPress={() => {
                    setScanned(false);
                    setIsSearching(false);
                  }}
                >
                  <Text style={styles.rescanButtonText}>Quét lại</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#53B175',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Simple Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flipButton: {
    padding: 8,
  },
  // Camera - full screen
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  // Dark overlay with square cutout
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cutout: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#53B175',
  },
  // Simple scanning frame
  scanFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -width * 0.4 }, { translateY: -width * 0.4 }],
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLine: {
    width: width * 0.6,
    height: 2,
    backgroundColor: '#53B175',
    borderRadius: 1,
  },
  // Simple instruction
  instructionText: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  rescanButton: {
    backgroundColor: '#53B175',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  rescanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionTitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
