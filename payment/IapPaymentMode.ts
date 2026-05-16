import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import { PaymentMode, PurchaseArgs, PurchaseResult, RestoreResult } from './types';

type IapConfig = { ios_sku: string; android_sku: string };

export class IapCancelError extends Error { name = 'IapCancelError'; }

export class IapPaymentMode implements PaymentMode {
  readonly id = 'iap' as const;
  private sku: string | null = null;

  async initialize(config: unknown): Promise<void> {
    const cfg = config as IapConfig;
    await RNIap.initConnection();
    this.sku = Platform.OS === 'ios' ? cfg.ios_sku : cfg.android_sku;
    await RNIap.getSubscriptions({ skus: [this.sku] });
  }

  async purchase(_args: PurchaseArgs): Promise<PurchaseResult> {
    if (!this.sku) throw new Error('IapPaymentMode not initialised.');
    try {
      const result: any = await RNIap.requestSubscription({ sku: this.sku });
      const receipt = result?.transactionReceipt ?? result?.purchaseToken ?? '';
      await RNIap.finishTransaction({ purchase: result, isConsumable: false });
      return { receipt, platform: Platform.OS === 'ios' ? 'ios' : 'android' };
    } catch (e: any) {
      if (e?.code === 'E_USER_CANCELLED') throw new IapCancelError('Purchase canceled.');
      throw e;
    }
  }

  async restore(): Promise<RestoreResult> {
    const purchases = await RNIap.getAvailablePurchases();
    if (purchases.length === 0) return { restored: false };
    const p: any = purchases[0];
    return { restored: true, receipt: p?.transactionReceipt ?? p?.purchaseToken ?? '', platform: Platform.OS === 'ios' ? 'ios' : 'android' };
  }

  teardown(): void { RNIap.endConnection(); }
}
