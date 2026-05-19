import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import PaymentStep from '../../../components/upgrade/PaymentStep';

jest.mock('../../../lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));
jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));

const mockApi = require('../../../lib/api').default;

const offer = {
  payment_mode: 'mock', display_price: '$399.99', trial_months: 3,
  payment_config: { fake_amount_cents: 39999, restore_supported: false },
} as any;

const wrap = (ui: React.ReactNode) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
};

describe('PaymentStep', () => {
  it('renders recap with org name and trial date', () => {
    const { getByText } = render(wrap(<PaymentStep offer={offer} orgName="Maria's Business" onSuccess={() => {}} onError={() => {}} />));
    expect(getByText(/Maria's Business/)).toBeTruthy();
    expect(getByText(/Then \$399\.99\/month/)).toBeTruthy();
  });

  it('triggers strategy.purchase on Start Free Trial', async () => {
    mockApi.post.mockResolvedValue({ data: { subscription: { id: 's' }, me: {} } });
    const onSuccess = jest.fn();
    const { getByText } = render(wrap(<PaymentStep offer={offer} orgName="X" onSuccess={onSuccess} onError={() => {}} />));
    await act(async () => { fireEvent.press(getByText('Start Free Trial')); });
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });
});
