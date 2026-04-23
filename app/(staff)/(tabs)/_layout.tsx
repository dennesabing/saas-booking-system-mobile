import { Tabs } from 'expo-router';
import React from 'react';

export default function StaffTabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2563eb' }}>
      <Tabs.Screen
        name="bookings"
        options={{ title: 'Bookings', tabBarLabel: 'Bookings' }}
      />
      <Tabs.Screen
        name="bookables"
        options={{ title: 'Bookables', tabBarLabel: 'Bookables' }}
      />
      <Tabs.Screen
        name="scanner"
        options={{ title: 'Scanner', tabBarLabel: 'Scanner' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarLabel: 'Profile' }}
      />
    </Tabs>
  );
}
