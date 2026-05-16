export type PurchaseArgs = { orgName: string; cycle: 'monthly' };
export type PurchaseResult = { receipt?: string; token?: string; platform?: 'ios' | 'android' };
export type RestoreResult = { restored: boolean; receipt?: string; platform?: 'ios' | 'android' };

export interface PaymentMode {
  readonly id: 'iap' | 'mock';
  initialize(config: unknown): Promise<void>;
  purchase(args: PurchaseArgs): Promise<PurchaseResult>;
  restore?(): Promise<RestoreResult>;
  teardown(): void;
}
