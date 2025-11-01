import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertModalProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK' }],
  onClose,
}) => {
  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return [styles.button, styles.destructiveButton];
      case 'cancel':
        return [styles.button, styles.cancelButton];
      default:
        return [styles.button, styles.defaultButton];
    }
  };

  const getButtonTextStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return [styles.buttonText, styles.destructiveButtonText];
      case 'cancel':
        return [styles.buttonText, styles.cancelButtonText];
      default:
        return [styles.buttonText, styles.defaultButtonText];
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="information-circle" size={48} color="#3B82F6" />
          </View>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  getButtonStyle(button.style),
                  index > 0 && { marginLeft: 12 },
                ]}
                onPress={() => handleButtonPress(button)}
              >
                <Text style={getButtonTextStyle(button.style)}>{button.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  defaultButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  destructiveButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  defaultButtonText: {
    color: '#fff',
  },
  cancelButtonText: {
    color: '#666',
  },
  destructiveButtonText: {
    color: '#fff',
  },
});

export default AlertModal;

