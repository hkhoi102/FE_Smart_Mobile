import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../types/navigation';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'promotion' | 'system';
  read: boolean;
}

// Mock data - replace with real data from API
const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Đơn hàng đã được xác nhận',
    message: 'Đơn hàng #12345 của bạn đã được xác nhận và đang được chuẩn bị.',
    time: '2 giờ trước',
    type: 'order',
    read: false,
  },
  {
    id: '2',
    title: 'Khuyến mãi đặc biệt',
    message: 'Giảm 20% cho tất cả sản phẩm rau củ quả. Áp dụng đến hết ngày 31/12/2024.',
    time: '5 giờ trước',
    type: 'promotion',
    read: false,
  },
  {
    id: '3',
    title: 'Đơn hàng đã được giao',
    message: 'Đơn hàng #12340 đã được giao thành công. Cảm ơn bạn đã mua sắm!',
    time: '1 ngày trước',
    type: 'order',
    read: true,
  },
  {
    id: '4',
    title: 'Cập nhật hệ thống',
    message: 'Ứng dụng đã được cập nhật với nhiều tính năng mới. Hãy trải nghiệm ngay!',
    time: '2 ngày trước',
    type: 'system',
    read: true,
  },
];

export default function NotificationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);

  const getIconName = (type: string) => {
    switch (type) {
      case 'order':
        return 'bag-check-outline';
      case 'promotion':
        return 'pricetag-outline';
      case 'system':
        return 'notifications-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'order':
        return '#6FCF97';
      case 'promotion':
        return '#FF6B6B';
      case 'system':
        return '#4A90E2';
      default:
        return '#666';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      activeOpacity={0.7}
      onPress={() => markAsRead(item.id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${getIconColor(item.type)}20` }]}>
        <Ionicons name={getIconName(item.type) as any} size={24} color={getIconColor(item.type)} />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, !item.read && styles.unreadTitle]}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông Báo</Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Đánh dấu đã đọc</Text>
            </TouchableOpacity>
          )}
          {unreadCount === 0 && <View style={styles.placeholder} />}
        </View>
      </View>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    marginLeft: 12,
  },
  markAllButton: {
    padding: 4,
  },
  markAllText: {
    fontSize: 14,
    color: '#6FCF97',
    fontWeight: '600',
  },
  placeholder: {
    width: 100,
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  unreadNotification: {
    backgroundColor: '#F0F8F0',
    borderColor: '#6FCF97',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6FCF97',
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

