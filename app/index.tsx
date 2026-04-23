import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { isStaff, useCurrentUser } from '../hooks/useAuth';

export default function Index() {
  const { data: user, isLoading, tokenChecked } = useCurrentUser();

  if (!tokenChecked || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isStaff(user)) {
    return <Redirect href="/(staff)/(tabs)/bookings" />;
  }

  return <Redirect href="/(customer)/(tabs)/my-bookings" />;
}
