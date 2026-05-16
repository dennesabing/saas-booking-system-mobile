import { useMemo } from 'react';
import { IapPaymentMode } from '../payment/IapPaymentMode';
import { MockPaymentMode } from '../payment/MockPaymentMode';
import { PaymentMode } from '../payment/types';

const REGISTRY: Record<string, () => PaymentMode> = {
  iap:  () => new IapPaymentMode(),
  mock: () => new MockPaymentMode(),
};

export function resolvePaymentMode(id: string): PaymentMode {
  const factory = REGISTRY[id];
  if (!factory) throw new Error(`No driver registered for payment mode: ${id}`);
  return factory();
}

export function usePaymentMode(id: string | undefined): PaymentMode | null {
  return useMemo(() => (id ? resolvePaymentMode(id) : null), [id]);
}
