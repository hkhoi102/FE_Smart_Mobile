import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../types/navigation';

const menuItems = [
  {
    id: '1',
    title: 'Orders',
    icon: 'document-text-outline',
  },
  {
    id: '2',
    title: 'My Details',
    icon: 'person-outline',
  },
  {
    id: '3',
    title: 'Delivery Address',
    icon: 'location-outline',
  },
  {
    id: '4',
    title: 'Payment Methods',
    icon: 'card-outline',
  },
  {
    id: '5',
    title: 'Promo Code',
    icon: 'pricetag-outline',
  },
  {
    id: '6',
    title: 'Notifications',
    icon: 'notifications-outline',
  },
  {
    id: '7',
    title: 'Help',
    icon: 'help-circle-outline',
  },
  {
    id: '8',
    title: 'About',
    icon: 'information-circle-outline',
  },
];

const AccountScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const renderMenuItem = (item: typeof menuItems[0]) => (
    <TouchableOpacity key={item.id} style={styles.menuItem} activeOpacity={0.7}>
      <Ionicons name={item.icon as any} size={24} color="#222" />
      <Text style={styles.menuText}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#B6B6B6" />
    </TouchableOpacity>
  );

  const handleLogout = () => {
    navigation.navigate('Login');
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
            <Text style={styles.userName}>Afsar Hossen</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={16} color="#10B981" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userEmail}>lmshuvo97@gmail.com</Text>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuSection} showsVerticalScrollIndicator={false}>
        {menuItems.map(renderMenuItem)}
      </ScrollView>

      {/* Log Out Button */}
      <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#10B981" />
        <Text style={styles.logoutText}>Log Out</Text>
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
});

export default AccountScreen;
