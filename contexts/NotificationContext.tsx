import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import NotificationModal from '../components/NotificationModal';
import AlertModal from '../components/AlertModal';

interface NotificationState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface NotificationContextType {
  showNotification: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState>({
    visible: false,
    message: '',
    type: 'info',
    duration: 2000,
  });

  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    buttons?: AlertButton[];
  }>({
    visible: false,
    title: '',
    message: undefined,
    buttons: [{ text: 'OK' }],
  });

  const contextRef = useRef<NotificationContextType | null>(null);

  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    duration: number = 2000
  ) => {
    setNotification({
      visible: true,
      message,
      type,
      duration,
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, visible: false }));
  };

  const showError = (message: string, duration?: number) => {
    showNotification(message, 'error', duration);
  };

  const showSuccess = (message: string, duration?: number) => {
    showNotification(message, 'success', duration);
  };

  const showInfo = (message: string, duration?: number) => {
    showNotification(message, 'info', duration);
  };

  const showAlert = (title: string, message?: string, buttons?: AlertButton[]) => {
    setAlert({
      visible: true,
      title,
      message,
      buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }],
    });
  };

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
  };

  const contextValue: NotificationContextType = {
    showNotification,
    showError,
    showSuccess,
    showInfo,
    showAlert,
  };

  // Store context reference for utility functions
  useEffect(() => {
    contextRef.current = contextValue;
    // Export to global utility for backward compatibility
    if (typeof global !== 'undefined') {
      (global as any).__notificationContext = contextValue;
    }
  }, []);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationModal
        visible={notification.visible}
        message={notification.message}
        type={notification.type}
        duration={notification.duration}
        onClose={hideNotification}
      />
      <AlertModal
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onClose={hideAlert}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

