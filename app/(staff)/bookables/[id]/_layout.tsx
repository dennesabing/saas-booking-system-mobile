import { Stack } from 'expo-router';
import React from 'react';

export default function BookableSubLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Edit Service', headerShown: true }} />
      <Stack.Screen name="create-booking" options={{ title: 'Create Booking', headerShown: true }} />
    </Stack>
  );
}
