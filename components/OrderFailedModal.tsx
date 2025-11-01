import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OrderFailedModalProps {
  visible: boolean;
  onClose: () => void;
  onTryAgain: () => void;
  onBackToHome: () => void;
}

const OrderFailedModal: React.FC<OrderFailedModalProps> = ({ visible, onClose, onTryAgain, onBackToHome }) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.orderFailedOverlay}>
        <View style={styles.orderFailedModal}>
          <TouchableOpacity onPress={onClose} style={styles.closeFailedButton}>
            <Ionicons name="close" size={24} color="#222" />
          </TouchableOpacity>
          {/* <View style={styles.failedIconContainer}>
            <Ionicons name="bag-outline" size={60} color="#4CAF50" />
          </View> */}
          <Image source={require('../assets/images/error.png')} />
          <Text style={styles.failedTitle}>Ohh! Đơn hàng không thành công</Text>
          <Text style={styles.failedSubtitle}>Đã có lỗi xảy ra</Text>
          <View style={styles.failedButtonContainer}>
            <TouchableOpacity style={styles.tryAgainButton} onPress={onTryAgain}>
              <Text style={styles.tryAgainText}>Vui lòng thử lại</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onBackToHome} style={styles.backToHomeFailedButton}>
              <Text style={styles.backToHomeFailedText}>Về trang chủ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  orderFailedOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  orderFailedModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  closeFailedButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    padding: 8,
  },
  failedIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  failedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },
  failedSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  failedButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  tryAgainButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tryAgainText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  backToHomeFailedButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  backToHomeFailedText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default OrderFailedModal;
