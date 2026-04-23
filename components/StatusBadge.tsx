import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const COLORS: Record<string, { bg: string; text: string }> = {
  pending:         { bg: '#fef9c3', text: '#854d0e' },
  pending_payment: { bg: '#fef9c3', text: '#854d0e' },
  confirmed:       { bg: '#dcfce7', text: '#166534' },
  completed:       { bg: '#dbeafe', text: '#1e40af' },
  cancelled:       { bg: '#fee2e2', text: '#991b1b' },
  no_show:         { bg: '#f3f4f6', text: '#374151' },
};

type Props = { status: string };

export default function StatusBadge({ status }: Props) {
  const color = COLORS[status] ?? { bg: '#f3f4f6', text: '#374151' };
  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={[styles.text, { color: color.text }]}>
        {status.replace(/_/g, ' ')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
});
