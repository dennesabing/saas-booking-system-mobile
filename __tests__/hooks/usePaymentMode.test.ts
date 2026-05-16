import { resolvePaymentMode } from '../../hooks/usePaymentMode';
import { IapPaymentMode } from '../../payment/IapPaymentMode';
import { MockPaymentMode } from '../../payment/MockPaymentMode';

describe('resolvePaymentMode', () => {
  it('returns IapPaymentMode for "iap"', () => {
    expect(resolvePaymentMode('iap')).toBeInstanceOf(IapPaymentMode);
  });
  it('returns MockPaymentMode for "mock"', () => {
    expect(resolvePaymentMode('mock')).toBeInstanceOf(MockPaymentMode);
  });
  it('throws for unknown mode', () => {
    expect(() => resolvePaymentMode('stripe')).toThrow(/no driver/i);
  });
});
