import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../types/navigation';

export default function AboutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giới Thiệu</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Logo/Icon Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="storefront" size={64} color="#6FCF97" />
          </View>
          <Text style={styles.appName}>Siêu Thị Thông Minh</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        {/* About Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Về Ứng Dụng</Text>
          <Text style={styles.sectionText}>
            Ứng dụng Siêu Thị Thông Minh là giải pháp mua sắm hiện đại, giúp bạn dễ dàng tìm kiếm và mua các sản phẩm chất lượng cao với giá cả hợp lý.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tính Năng</Text>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#6FCF97" />
            <Text style={styles.featureText}>Tìm kiếm sản phẩm thông minh</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#6FCF97" />
            <Text style={styles.featureText}>Đặt hàng trực tuyến nhanh chóng</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#6FCF97" />
            <Text style={styles.featureText}>Theo dõi đơn hàng dễ dàng</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#6FCF97" />
            <Text style={styles.featureText}>Trợ lý AI thông minh</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#6FCF97" />
            <Text style={styles.featureText}>Thanh toán an toàn</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên Hệ</Text>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <Text style={styles.contactText}>support@sieuthithongminh.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <Text style={styles.contactText}>1900 1234</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.contactText}>123 Đường ABC, Quận XYZ, TP.HCM</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bản Quyền</Text>
          <Text style={styles.sectionText}>
            © 2024 Siêu Thị Thông Minh. Tất cả các quyền được bảo lưu.
          </Text>
        </View>
      </ScrollView>
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
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
});

