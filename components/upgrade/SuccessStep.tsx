import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SuccessStep({ orgName }: { orgName: string }) {
  const qc = useQueryClient();
  function go() {
    qc.invalidateQueries({ queryKey: ['me'] });
    router.replace('/(staff)/(tabs)/bookings');
  }
  return (
    <View style={styles.container}>
      <View style={styles.check}><Text style={styles.checkMark}>✓</Text></View>
      <Text style={styles.title}>You're a Pro Owner.</Text>
      <Text style={styles.sub}>Welcome to {orgName}.{"\n"}Let's set up your first service.</Text>
      <Pressable accessibilityRole="button" onPress={go} style={styles.cta}>
        <Text style={styles.ctaText}>Go to dashboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flex: 1, alignItems: 'center', justifyContent: 'center' },
  check:     { width: 96, height: 96, borderRadius: 48, backgroundColor: '#5B6CFF', alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: 'white', fontSize: 56, fontWeight: '800' },
  title:     { fontSize: 24, fontWeight: '800', marginTop: 24 },
  sub:       { textAlign: 'center', marginTop: 12, color: '#555' },
  cta:       { backgroundColor: '#5B6CFF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', alignSelf: 'stretch', marginTop: 'auto' },
  ctaText:   { color: 'white', fontWeight: '700', fontSize: 16 },
});
