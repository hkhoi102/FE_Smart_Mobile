import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NotificationModalProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number; // Auto close after duration (ms), 0 = no auto close
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  message,
  type = 'info',
  onClose,
  duration = 2000,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      // Reset animations when hidden
      fadeAnim.setValue(0);
      slideAnim.setValue(-100);
    }
  }, [visible, duration]);

  const handleClose = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'info':
      default:
        return '#3B82F6';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#ECFDF5';
      case 'error':
        return '#FEF2F2';
      case 'info':
      default:
        return '#EFF6FF';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={duration > 0 ? handleClose : undefined}
      >
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.modalContent, { backgroundColor: getBackgroundColor() }]}>
            <View style={styles.iconContainer}>
              <Ionicons name={getIconName()} size={32} color={getIconColor()} />
            </View>
            <Text style={styles.message}>{message}</Text>
            {duration === 0 && (
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
  },
  container: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  closeButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NotificationModal;

