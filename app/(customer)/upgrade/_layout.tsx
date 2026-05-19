import { Stack } from 'expo-router';
import React from 'react';

export default function UpgradeLayout() {
  return <Stack screenOptions={{ presentation: 'modal', headerShown: true, title: 'Upgrade' }} />;
}
