import { Tabs } from 'expo-router';
import React from 'react';

export default function CustomerTabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2563eb' }}>
      <Tabs.Screen
        name="my-bookings"
        options={{ title: 'My Bookings', tabBarLabel: 'Bookings' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarLabel: 'Profile' }}
      />
    </Tabs>
  );
}
