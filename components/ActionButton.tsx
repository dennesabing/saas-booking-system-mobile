import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

type Variant = 'primary' | 'danger' | 'secondary';

const VARIANT_STYLES: Record<Variant, { bg: string; text: string }> = {
  primary:   { bg: '#2563eb', text: '#fff' },
  danger:    { bg: '#dc2626', text: '#fff' },
  secondary: { bg: '#f3f4f6', text: '#374151' },
};

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export default function ActionButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: Props) {
  const v = VARIANT_STYLES[variant];
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: v.bg }, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <Text style={[styles.text, { color: v.text }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: 8, padding: 14, alignItems: 'center', marginVertical: 4 },
  text: { fontSize: 15, fontWeight: '600' },
});
