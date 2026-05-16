import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import SuccessStep from '../../../components/upgrade/SuccessStep';

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));

describe('SuccessStep', () => {
  it('routes to staff bookings on Go to dashboard', () => {
    const qc = new QueryClient();
    const invalidate = jest.spyOn(qc, 'invalidateQueries');
    const { getByText } = render(
      <QueryClientProvider client={qc}><SuccessStep orgName="Maria's Business" /></QueryClientProvider>
    );
    fireEvent.press(getByText('Go to dashboard'));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['me'] });
    expect(router.replace).toHaveBeenCalledWith('/(staff)/(tabs)/bookings');
  });
});
