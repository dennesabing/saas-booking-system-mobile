import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function OfflineBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>⚠</Text>
      <Text style={styles.text}>No internet connection — booking is unavailable offline.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  icon: { fontSize: 16, color: '#dc2626' },
  text: { flex: 1, fontSize: 13, color: '#dc2626', fontWeight: '500' },
});
