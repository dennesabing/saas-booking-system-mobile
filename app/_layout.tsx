import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { queryClient } from '../lib/queryClient';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
