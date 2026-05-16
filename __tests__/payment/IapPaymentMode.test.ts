import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';
import { IapPaymentMode } from '../../payment/IapPaymentMode';

describe('IapPaymentMode', () => {
  beforeEach(() => jest.clearAllMocks());

  it('initialise connects and fetches SKUs', async () => {
    const mode = new IapPaymentMode();
    await mode.initialize({ ios_sku: 'com.app.ios', android_sku: 'com.app.android' });
    expect(RNIap.initConnection).toHaveBeenCalled();
    expect(RNIap.getSubscriptions).toHaveBeenCalledWith({ skus: ['com.app.ios'] });
  });

  it('purchase returns receipt + platform', async () => {
    const mode = new IapPaymentMode();
    await mode.initialize({ ios_sku: 'com.app.ios', android_sku: 'com.app.android' });
    const r = await mode.purchase({ orgName: 'X', cycle: 'monthly' });
    expect(r.receipt).toBe('mock-receipt-blob');
    expect(r.platform).toBe(Platform.OS === 'ios' ? 'ios' : 'android');
  });

  it('user-cancel surfaces a typed cancel error', async () => {
    (RNIap.requestSubscription as jest.Mock).mockRejectedValueOnce({ code: 'E_USER_CANCELLED' });
    const mode = new IapPaymentMode();
    await mode.initialize({ ios_sku: 's', android_sku: 's' });
    await expect(mode.purchase({ orgName: 'X', cycle: 'monthly' })).rejects.toMatchObject({ name: 'IapCancelError' });
  });

  it('finishes transaction after purchase succeeds', async () => {
    const mode = new IapPaymentMode();
    await mode.initialize({ ios_sku: 's', android_sku: 's' });
    await mode.purchase({ orgName: 'X', cycle: 'monthly' });
    expect(RNIap.finishTransaction).toHaveBeenCalled();
  });

  it('teardown ends the IAP connection', async () => {
    const mode = new IapPaymentMode();
    await mode.initialize({ ios_sku: 's', android_sku: 's' });
    mode.teardown();
    expect(RNIap.endConnection).toHaveBeenCalled();
  });
});
