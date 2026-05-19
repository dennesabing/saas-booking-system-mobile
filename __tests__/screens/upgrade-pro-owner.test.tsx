import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import UpgradeProOwnerScreen from '../../app/(customer)/upgrade/pro-owner';

jest.mock('../../lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), replace: jest.fn() },
  useRouter: () => ({ back: jest.fn(), replace: jest.fn() }),
}));
jest.mock('../../hooks/useAuth', () => ({
  useCurrentUser: () => ({ data: { name: 'Maria', current_organization_id: null }, tokenChecked: true }),
}));

const mockApi = require('../../lib/api').default;

const wrap = (ui: React.ReactNode) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
};

describe('UpgradeProOwnerScreen wizard flow (mock mode)', () => {
  beforeEach(() => {
    mockApi.get.mockResolvedValue({ data: {
      plan_key: 'booking.pro_owner', name: 'Pro Owner', description: 'd',
      benefits: ['Unlimited services'], monthly_amount_cents: 39999, currency: 'USD',
      display_price: '$399.99', trial_months: 3, billing_cycle: 'monthly',
      payment_mode: 'mock', payment_config: { fake_amount_cents: 39999, restore_supported: false },
    }});
    mockApi.post.mockResolvedValue({ data: { subscription: { id: 's' }, me: { id: 1, current_organization_id: 9 } }});
  });

  it('walks all 4 steps and lands on success', async () => {
    const { findByText, getByText, getByTestId } = render(wrap(<UpgradeProOwnerScreen />));
    fireEvent.press(await findByText('Continue'));
    fireEvent.changeText(getByTestId('org-name-input'), "Maria's Business");
    fireEvent.press(getByText('Continue'));
    await act(async () => { fireEvent.press(getByText('Start Free Trial')); });
    await waitFor(() => expect(getByText(/You're a Pro Owner\./)).toBeTruthy());
  });
});
