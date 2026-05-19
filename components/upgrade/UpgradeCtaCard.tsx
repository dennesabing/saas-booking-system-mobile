import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useOffer } from '../../hooks/useProOwnerUpgrade';

type Props = { currentOrganizationId: number | null };

export default function UpgradeCtaCard({ currentOrganizationId }: Props) {
  const { data: offer } = useOffer();
  if (currentOrganizationId !== null) return null;

  const trial = offer?.trial_months ?? 3;
  const price = offer?.display_price ?? '';

  return (
    <Pressable accessibilityRole="button" onPress={() => router.push('/(customer)/upgrade/pro-owner')} style={styles.wrapper}>
      <LinearGradient colors={['#5B6CFF', '#9B5BFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <Text style={styles.eyebrow}>BECOME A PRO OWNER</Text>
        <Text style={styles.title}>Run your business on UniversalBook</Text>
        <Text style={styles.sub}>{trial} months free{price ? `, then ${price}/mo` : ''}</Text>
        <Text style={styles.cta}>Learn more →</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginVertical: 12 },
  card:    { padding: 16, borderRadius: 16 },
  eyebrow: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title:   { color: 'white', fontSize: 20, fontWeight: '700', marginTop: 6 },
  sub:     { color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  cta:     { color: 'white', marginTop: 12, alignSelf: 'flex-end', fontWeight: '600' },
});
