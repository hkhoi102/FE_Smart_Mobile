import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNotification } from '../../contexts/NotificationContext';
import { authApi, CustomerApi } from '../../services/api';
import { RootStackParamList } from '../../types/navigation';
import AppStateManager from '../../utils/AppStateManager';

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { showError, showSuccess } = useNotification();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword.trim()) {
      showError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (!newPassword.trim()) {
      showError('Vui lòng nhập mật khẩu mới');
      return;
    }

    if (newPassword.length < 6) {
      showError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    if (currentPassword === newPassword) {
      showError('Mật khẩu mới phải khác mật khẩu hiện tại');
      return;
    }

    try {
      setLoading(true);
      await CustomerApi.changePassword(currentPassword, newPassword);
      showSuccess('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Logout after a short delay to show success message
      setTimeout(async () => {
        try {
          // Get refresh token from storage
          const appStateManager = AppStateManager.getInstance();
          const currentState = appStateManager.getCurrentState();

          // Call logout API if we have refresh token
          if (currentState.userToken) {
            try {
              await authApi.logout({
                refreshToken: currentState.userToken,
              });
            } catch (error) {
              console.log('Logout API call failed, but continuing with local logout');
            }
          }

          // Clear local storage
          await appStateManager.logout();

          // Navigate to login
          navigation.navigate('Login');
        } catch (error) {
          console.error('Logout error:', error);
          // Even if logout fails, navigate to login
          navigation.navigate('Login');
        }
      }, 1500);
    } catch (error: any) {
      // Check if error is related to incorrect current password
      const errorMessage = error?.message || '';
      const errorStatus = error?.status;

      // Check for common error messages indicating wrong current password
      const isWrongPassword =
        errorStatus === 400 ||
        errorStatus === 401 ||
        errorMessage.toLowerCase().includes('current password') ||
        errorMessage.toLowerCase().includes('mật khẩu hiện tại') ||
        errorMessage.toLowerCase().includes('incorrect password') ||
        errorMessage.toLowerCase().includes('sai') ||
        errorMessage.toLowerCase().includes('wrong password') ||
        errorMessage.toLowerCase().includes('invalid password');

      if (isWrongPassword) {
        showError('Mật khẩu hiện tại sai');
      } else {
        showError(errorMessage || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Đổi Mật Khẩu</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        {/* Current Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu hiện tại</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.passwordInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Nhập mật khẩu hiện tại"
              secureTextEntry={!showCurrentPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu mới</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.passwordInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Đổi Mật Khẩu</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  content: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#222',
  },
  eyeIcon: {
    padding: 12,
  },
  submitButton: {
    backgroundColor: '#53B175',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChangePasswordScreen;

