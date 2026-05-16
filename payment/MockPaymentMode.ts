import { PaymentMode, PurchaseArgs, PurchaseResult } from './types';

export class MockPaymentMode implements PaymentMode {
  readonly id = 'mock' as const;
  private static failNextError: string | null = null;

  static failNext(error: string): void { MockPaymentMode.failNextError = error; }
  static reset(): void { MockPaymentMode.failNextError = null; }

  async initialize(_config: unknown): Promise<void> {}

  async purchase(_args: PurchaseArgs): Promise<PurchaseResult> {
    if (MockPaymentMode.failNextError) {
      const err = MockPaymentMode.failNextError;
      MockPaymentMode.failNextError = null;
      throw new Error(err);
    }
    return { token: 'mock-ok-token' };
  }

  teardown(): void {}
}
