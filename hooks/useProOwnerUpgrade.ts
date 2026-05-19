import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export type Offer = {
  plan_key: string; name: string; description: string; benefits: string[];
  monthly_amount_cents: number; currency: string; display_price: string;
  trial_months: number; billing_cycle: 'monthly'; payment_mode: 'iap' | 'mock';
  payment_config: { ios_sku?: string; android_sku?: string; fake_amount_cents?: number; restore_supported: boolean };
};

export function useOffer() {
  return useQuery<Offer>({
    queryKey: ['pro-owner-offer'],
    queryFn: async () => (await api.get('/api/v1/upgrade/pro-owner/offer')).data,
    retry: false,
  });
}

export type PurchasePayload =
  | { payment_mode: 'iap';  platform: 'ios' | 'android'; receipt: string; org_name: string; billing_cycle: 'monthly' }
  | { payment_mode: 'mock'; mock_token: string; org_name: string; billing_cycle: 'monthly' };

export function usePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PurchasePayload) =>
      (await api.post('/api/v1/upgrade/pro-owner/purchase', payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      qc.invalidateQueries({ queryKey: ['pro-owner-offer'] });
    },
  });
}

export function useRestore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { platform: 'ios' | 'android'; receipt: string; org_name?: string }) =>
      (await api.post('/api/v1/upgrade/pro-owner/restore', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}
