import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { resolvePaymentMode } from '../../hooks/usePaymentMode';
import { usePurchase } from '../../hooks/useProOwnerUpgrade';
import type { Offer } from '../../hooks/useProOwnerUpgrade';

type Props = { offer: Offer; orgName: string; onSuccess: () => void; onError: (message: string) => void };

function trialEndsLabel(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function PaymentStep({ offer, orgName, onSuccess, onError }: Props) {
  const mode = useMemo(() => resolvePaymentMode(offer.payment_mode), [offer.payment_mode]);
  const purchase = usePurchase();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    mode.initialize(offer.payment_config);
    return () => mode.teardown();
  }, [mode, offer.payment_config]);

  async function handleBuy(): Promise<void> {
    setBusy(true);
    try {
      const result = await mode.purchase({ orgName, cycle: 'monthly' });
      const payload = offer.payment_mode === 'iap'
        ? { payment_mode: 'iap' as const, platform: result.platform!, receipt: result.receipt!, org_name: orgName, billing_cycle: 'monthly' as const }
        : { payment_mode: 'mock' as const, mock_token: result.token ?? 'mock-ok-token', org_name: orgName, billing_cycle: 'monthly' as const };
      await purchase.mutateAsync(payload as any);
      onSuccess();
    } catch (e: any) {
      onError(e?.message ?? 'Purchase failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.recapRow}><Text style={styles.recapLabel}>Plan</Text><Text style={styles.recapValue}>Pro Owner (monthly)</Text></View>
      <View style={styles.recapRow}><Text style={styles.recapLabel}>Business</Text><Text style={styles.recapValue}>{orgName}</Text></View>
      <View style={styles.trialCard}>
        <Text style={styles.trialHead}>Free until {trialEndsLabel(offer.trial_months)}</Text>
        <Text style={styles.trialSub}>Then {offer.display_price}/month</Text>
        <Text style={styles.trialFine}>Billed by Apple / Google Play</Text>
      </View>
      <Text style={styles.tos}>By continuing you agree to our Terms and Privacy Policy.</Text>
      <Pressable accessibilityRole="button" disabled={busy} onPress={handleBuy} style={[styles.cta, busy && styles.ctaDisabled]}>
        {busy ? <ActivityIndicator color="white" /> : <Text style={styles.ctaText}>Start Free Trial</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { padding: 24, flex: 1 },
  recapRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  recapLabel:  { color: '#777' },
  recapValue:  { fontWeight: '600' },
  trialCard:   { borderRadius: 12, borderWidth: 1, borderColor: '#eee', padding: 16, marginTop: 16 },
  trialHead:   { fontSize: 16, fontWeight: '700' },
  trialSub:    { fontSize: 14, marginTop: 4 },
  trialFine:   { fontSize: 12, color: '#777', marginTop: 4 },
  tos:         { fontSize: 12, color: '#777', marginTop: 16 },
  cta:         { backgroundColor: '#5B6CFF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  ctaDisabled: { opacity: 0.5 },
  ctaText:     { color: 'white', fontWeight: '700', fontSize: 16 },
});
