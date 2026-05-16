import { MockPaymentMode } from '../../payment/MockPaymentMode';

describe('MockPaymentMode', () => {
  beforeEach(() => MockPaymentMode.reset());

  it('returns deterministic token on purchase', async () => {
    const mode = new MockPaymentMode();
    await mode.initialize({ fake_amount_cents: 39999 });
    const r = await mode.purchase({ orgName: 'X', cycle: 'monthly' });
    expect(r.token).toBe('mock-ok-token');
  });

  it('supports failNext for tests', async () => {
    MockPaymentMode.failNext('boom');
    const mode = new MockPaymentMode();
    await mode.initialize({ fake_amount_cents: 39999 });
    await expect(mode.purchase({ orgName: 'X', cycle: 'monthly' })).rejects.toThrow('boom');
  });
});
