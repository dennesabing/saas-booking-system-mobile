import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import OfferStep from '../../../components/upgrade/OfferStep';
import OrgDetailsStep from '../../../components/upgrade/OrgDetailsStep';
import PaymentStep from '../../../components/upgrade/PaymentStep';
import SuccessStep from '../../../components/upgrade/SuccessStep';
import { useCurrentUser } from '../../../hooks/useAuth';
import { useOffer, useRestore } from '../../../hooks/useProOwnerUpgrade';
import { resolvePaymentMode } from '../../../hooks/usePaymentMode';

type Step = 'offer' | 'org' | 'pay' | 'success';

export default function UpgradeProOwnerScreen() {
  const { data: user } = useCurrentUser();
  const { data: offer, isLoading } = useOffer();
  const restore = useRestore();
  const [step, setStep] = useState<Step>('offer');
  const [orgName, setOrgName] = useState('');

  if (isLoading || !offer || !user) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>;
  }

  if (user.current_organization_id !== null) {
    router.replace('/(staff)/(tabs)/bookings');
    return null;
  }

  async function handleRestore(): Promise<void> {
    try {
      const mode = resolvePaymentMode(offer!.payment_mode);
      await mode.initialize(offer!.payment_config);
      const r = await mode.restore?.();
      if (!r?.restored) { Alert.alert('No purchases to restore.'); return; }
      await restore.mutateAsync({ platform: r.platform!, receipt: r.receipt! });
      setStep('success');
    } catch (e: any) { Alert.alert('Restore failed', e?.message ?? ''); }
  }

  switch (step) {
    case 'offer':   return <OfferStep offer={offer} onContinue={() => setStep('org')} onRestore={handleRestore} />;
    case 'org':     return <OrgDetailsStep userName={user.name} initial={orgName} onContinue={(name) => { setOrgName(name); setStep('pay'); }} />;
    case 'pay':     return <PaymentStep offer={offer} orgName={orgName} onSuccess={() => setStep('success')} onError={(msg) => Alert.alert('Purchase failed', msg)} />;
    case 'success': return <SuccessStep orgName={orgName} />;
  }
}
