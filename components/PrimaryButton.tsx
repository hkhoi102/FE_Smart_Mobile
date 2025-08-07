import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function PrimaryButton({
  title,
  onPress,
  style,
  textStyle,
  disabled = false
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        style
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={[
        styles.buttonText,
        disabled && styles.buttonTextDisabled,
        textStyle
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#53B175',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTextDisabled: {
    color: '#7C7C7C',
  },
});
