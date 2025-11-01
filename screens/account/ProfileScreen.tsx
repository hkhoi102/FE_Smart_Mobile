import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNotification } from '../../contexts/NotificationContext';
import { CustomerApi, UserProfile } from '../../services/api';
import { RootStackParamList } from '../../types/navigation';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { showError, showAlert } = useNotification();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const me = await CustomerApi.getMe();
        setProfile(me);
      } catch (e: any) {
        setError(e?.message || 'Không lấy được thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  const saveProfile = async (partial: Partial<UserProfile>) => {
    if (!profile) return;
    const merged: Partial<UserProfile> = {
      fullName: partial.fullName ?? profile.fullName ?? '',
      phoneNumber: partial.phoneNumber ?? profile.phoneNumber ?? '',
    };
    if (!merged.phoneNumber || merged.phoneNumber.trim() === '') {
      showError('Vui lòng nhập SĐT trước khi lưu.');
      return;
    }
    const updated = await CustomerApi.updateMe(merged);
    if (updated) setProfile(updated);
  };

  if (loading) {
    return (
      <View style={styles.containerCenter}>
        <ActivityIndicator size="large" color="#53B175" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Thông Tin Cá Nhân</Text>
        <View style={{ width: 32 }} />
      </View>
      <EditableRow
        label="Họ tên"
        value={profile?.fullName || ''}
        editable
        onSave={async (v) => {
          try { await saveProfile({ fullName: v }); } catch (e: any) { showError(e?.message || 'Không thể cập nhật'); }
        }}
      />
      <EditableRow
        label="Email"
        value={profile?.email || ''}
        keyboardType="email-address"
      />
      {/* Username removed per request */}
      <EditableRow
        label="SĐT"
        value={profile?.phoneNumber || ''}
        keyboardType="phone-pad"
        editable
        onSave={async (v) => {
          try { await saveProfile({ phoneNumber: v }); } catch (e: any) { showError(e?.message || 'Không thể cập nhật'); }
        }}
      />
    </View>
  );
};

const EditableRow = ({ label, value, onSave, keyboardType, editable }: { label: string; value: string; onSave?: (v: string) => Promise<void>; keyboardType?: any; editable?: boolean }) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      {editing ? (
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={[styles.valueInput]}
            value={text}
            onChangeText={setText}
            keyboardType={keyboardType}
            autoFocus
          />
          <TouchableOpacity onPress={async () => { if (onSave) { await onSave(text); } setEditing(false); }} style={{ padding: 6, marginLeft: 8 }}>
            <Ionicons name="checkmark" size={20} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setText(value); setEditing(false); }} style={{ padding: 6 }}>
            <Ionicons name="close" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.value}>{value || '-'}</Text>
          {editable && (
            <TouchableOpacity onPress={() => setEditing(true)} style={{ padding: 6 }}>
              <Ionicons name="pencil" size={16} color="#10B981" />
            </TouchableOpacity>
          )}
        </View>
      )}
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
  containerCenter: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    color: '#FF6B6B',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    width: 100,
    color: '#666',
  },
  value: {
    flex: 1,
    color: '#222',
    fontWeight: '600',
  },
  valueInput: {
    flex: 1,
    color: '#222',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

export default ProfileScreen;


