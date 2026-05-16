import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useOffer, usePurchase, useRestore } from '../../hooks/useProOwnerUpgrade';

jest.mock('../../lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));
jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));

const mockApi = require('../../lib/api').default;

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('useProOwnerUpgrade', () => {
  beforeEach(() => jest.resetAllMocks());

  it('useOffer fetches and returns the offer', async () => {
    mockApi.get.mockResolvedValue({ data: { plan_key: 'booking.pro_owner', payment_mode: 'iap' } });
    const { result } = renderHook(() => useOffer(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeTruthy());
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/upgrade/pro-owner/offer');
    expect(result.current.data?.payment_mode).toBe('iap');
  });

  it('usePurchase posts purchase', async () => {
    mockApi.post.mockResolvedValue({ data: { subscription: { id: 's' }, me: { id: 1 } } });
    const { result } = renderHook(() => usePurchase(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ payment_mode: 'iap', platform: 'ios', receipt: 'r', org_name: 'X', billing_cycle: 'monthly' });
    });
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/upgrade/pro-owner/purchase', expect.objectContaining({ payment_mode: 'iap' }));
  });

  it('useRestore posts restore', async () => {
    mockApi.post.mockResolvedValue({ data: { restored: true } });
    const { result } = renderHook(() => useRestore(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ platform: 'ios', receipt: 'r' });
    });
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/upgrade/pro-owner/restore', expect.objectContaining({ platform: 'ios' }));
  });
});
