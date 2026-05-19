import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Offer } from '../../hooks/useProOwnerUpgrade';

type Props = { offer: Offer; onContinue: () => void; onRestore: () => void };

export default function OfferStep({ offer, onContinue, onRestore }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{offer.name}</Text>
      <Text style={styles.desc}>{offer.description}</Text>
      <View style={styles.benefits}>
        {offer.benefits.map((b) => <Text key={b} style={styles.benefit}>✓  {b}</Text>)}
      </View>
      <View style={styles.priceCard}>
        <Text style={styles.priceHeadline}>{offer.trial_months} MONTHS FREE</Text>
        <Text style={styles.priceSub}>then {offer.display_price}/month</Text>
        <Text style={styles.priceFine}>Cancel anytime in your App Store or Google Play settings</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={onContinue} style={styles.cta}>
        <Text style={styles.ctaText}>Continue</Text>
      </Pressable>
      {offer.payment_config.restore_supported && (
        <Pressable onPress={onRestore}><Text style={styles.restore}>Already subscribed? Restore purchases</Text></Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { padding: 24 },
  title:         { fontSize: 28, fontWeight: '800', marginBottom: 6 },
  desc:          { fontSize: 15, color: '#555', marginBottom: 16 },
  benefits:      { marginBottom: 20 },
  benefit:       { fontSize: 15, paddingVertical: 4 },
  priceCard:     { borderRadius: 12, borderWidth: 1, borderColor: '#eee', padding: 16, marginBottom: 24 },
  priceHeadline: { fontSize: 18, fontWeight: '700' },
  priceSub:      { fontSize: 15, marginTop: 4 },
  priceFine:     { fontSize: 12, color: '#777', marginTop: 8 },
  cta:           { backgroundColor: '#5B6CFF', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  ctaText:       { color: 'white', fontWeight: '700', fontSize: 16 },
  restore:       { textAlign: 'center', marginTop: 16, color: '#5B6CFF' },
});
