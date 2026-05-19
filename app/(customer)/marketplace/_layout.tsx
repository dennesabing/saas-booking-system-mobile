import { Stack } from 'expo-router';
import React from 'react';

export default function MarketplaceLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Find Services', headerShown: true }} />
      <Stack.Screen name="[uuid]" options={{ title: 'Book Service', headerShown: true }} />
    </Stack>
  );
}
