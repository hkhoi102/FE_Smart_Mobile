import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { authApi, CustomerApi, UserProfile } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { RootStackParamList } from '../../types/navigation';
import AppStateManager from '../../utils/AppStateManager';

const menuItems = [
  {
    id: '1',
    title: 'Đơn Hàng',
    icon: 'document-text-outline',
  },
  {
    id: '2',
    title: 'Thông Tin Cá Nhân',
    icon: 'person-outline',
  },
  {
    id: '4',
    title: 'Thông Báo',
    icon: 'notifications-outline',
  },
  {
    id: '6',
    title: 'Trợ Giúp',
    icon: 'help-circle-outline',
  },
  {
    id: '7',
    title: 'Giới Thiệu',
    icon: 'information-circle-outline',
  },
];

const AccountScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { showError, showAlert } = useNotification();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [me, setMe] = useState<UserProfile | null>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        const profile = await CustomerApi.getMe();
        setMe(profile);
      } catch {}
    };
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  const renderMenuItem = (item: typeof menuItems[0]) => (
    <TouchableOpacity
      style={styles.menuItem}
      activeOpacity={0.7}
      onPress={() => {
        if (item.title === 'Thông Tin Cá Nhân') {
          navigation.navigate('Profile');
        } else if (item.title === 'Đơn Hàng') {
          navigation.navigate('Orders');
        }
      }}
    >
      <Ionicons name={item.icon as any} size={24} color="#222" />
      <Text style={styles.menuText}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#B6B6B6" />
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    if (isLoggingOut) return;

    showAlert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              // Get refresh token from storage
              const appStateManager = AppStateManager.getInstance();
              const currentState = appStateManager.getCurrentState();

              // Call logout API if we have refresh token
              if (currentState.userToken) {
                try {
                  await authApi.logout({
                    refreshToken: currentState.userToken, // This should be refresh token
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
              showError('Có lỗi xảy ra khi đăng xuất');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImage}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{me?.fullName || '—'}</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={16} color="#10B981" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userEmail}>{me?.email || '—'}</Text>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuSection} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {menuItems.map((item) => (
          <View key={item.id}>{renderMenuItem(item)}</View>
        ))}
      </ScrollView>

      {/* Log Out Button */}
      <TouchableOpacity
        style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
        activeOpacity={0.8}
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        <Ionicons name="log-out-outline" size={20} color="#10B981" />
        <Text style={styles.logoutText}>
          {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng Xuất'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#B6B6B6',
  },
  menuSection: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8F0',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 100,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 8,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
});

export default AccountScreen;
