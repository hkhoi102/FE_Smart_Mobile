import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder = 'Tìm kiếm cửa hàng' }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="search" size={20} color="#222" />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#7C7C7C"
        value={value}
        onChangeText={onChangeText}
        underlineColorAndroid="transparent"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 8,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
  },
});
