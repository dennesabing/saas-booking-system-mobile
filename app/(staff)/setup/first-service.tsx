import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { OpenHoursStep } from '../../../components/setup/OpenHoursStep';
import { ServiceDetailsStep } from '../../../components/setup/ServiceDetailsStep';
import { useFirstServiceSetup, type DaySchedule, type ServiceDetails } from '../../../hooks/useFirstServiceSetup';

export default function FirstServiceModal() {
  const [step, setStep]       = useState<1 | 2>(1);
  const [details, setDetails] = useState<ServiceDetails | null>(null);
  const setup = useFirstServiceSetup();

  function handleDetails(data: ServiceDetails) {
    setDetails(data);
    setStep(2);
  }

  function handleFinish(days: DaySchedule[]) {
    if (!details) return;
    setup.mutate(
      { details, days },
      {
        onSuccess: () => router.replace('/(staff)/(tabs)/bookings'),
        onError:   () => Alert.alert('Something went wrong', 'Please try again.'),
      }
    );
  }

  function skip() {
    router.replace('/(staff)/(tabs)/bookings');
  }

  if (setup.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5B6CFF" />
      </View>
    );
  }

  if (step === 1) {
    return <ServiceDetailsStep onNext={handleDetails} onSkip={skip} />;
  }

  return <OpenHoursStep onFinish={handleFinish} onBack={() => setStep(1)} onSkip={skip} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
