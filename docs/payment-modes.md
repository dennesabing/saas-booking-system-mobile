# Mobile Payment Modes

The mobile app uses a strategy pattern to abstract payment processing. Each named mode implements the same `PaymentMode` interface, letting the app switch between IAP and mock without changing UI code.

## PaymentMode interface

Defined in `payment/types.ts`:

```ts
export interface PaymentMode {
  initialize(): Promise<void>;
  purchase(sku: string, metadata?: Record<string, unknown>): Promise<PurchaseResult>;
  restore(platform: 'ios' | 'android'): Promise<RestoreResult>;
  teardown(): Promise<void>;
}
```

## Available modes

### IapPaymentMode (`payment/modes/IapPaymentMode.ts`)

- Uses `react-native-iap` to interact with the App Store / Play Store.
- Lifecycle:
  1. `initialize()` — calls `initConnection()` and subscribes to purchase updates / errors.
  2. `purchase(sku)` — calls `requestSubscription({ sku })`, waits for the purchase update listener, then calls `finishTransaction()`.
  3. `teardown()` — calls `endConnection()`.
- The receipt (JWS token / purchase token) from `finishTransaction()` is sent to `POST /api/v1/upgrade/pro-owner/purchase`.

### MockPaymentMode (`payment/modes/MockPaymentMode.ts`)

- No store interaction — returns a deterministic `mock_token` immediately.
- Used when `BOOKING_PRO_OWNER_PAYMENT_MODE=mock` is returned from `/offer`.
- Test control:

```ts
MockPaymentMode.failNext('purchase_cancelled'); // next purchase() call throws
```

- Designed for Maestro flows and Jest unit tests where a real store is unavailable.

## The registry

`hooks/usePaymentMode.ts` exports `resolvePaymentMode()`:

```ts
const REGISTRY: Record<string, PaymentMode> = {
  iap:  new IapPaymentMode(),
  mock: new MockPaymentMode(),
};

export function resolvePaymentMode(mode: string): PaymentMode {
  const impl = REGISTRY[mode];
  if (!impl) throw new Error(`Unknown payment mode: ${mode}`);
  return impl;
}
```

The `mode` string comes from the `/offer` API response, so the server controls which mode is active.

## Adding a new mode

1. **Implement `PaymentMode`** — create `payment/modes/MyMode.ts` with `initialize`, `purchase`, `restore`, `teardown`.
2. **Register in REGISTRY** — add `mymode: new MyMode()` to the map in `hooks/usePaymentMode.ts`.
3. **Add to backend config** — add an entry to `config/subscription.php` `payment_modes` with `has_driver_class: true` and the appropriate `driver` value.

## Testing

### Jest unit tests

The `react-native-iap` module is mocked in `jest.setup.js`:

```js
jest.mock('react-native-iap', () => ({
  initConnection: jest.fn().mockResolvedValue(true),
  requestSubscription: jest.fn().mockResolvedValue({ transactionReceipt: 'mock_jws' }),
  finishTransaction: jest.fn().mockResolvedValue(undefined),
  endConnection: jest.fn().mockResolvedValue(undefined),
  purchaseUpdatedListener: jest.fn(() => ({ remove: jest.fn() })),
  purchaseErrorListener: jest.fn(() => ({ remove: jest.fn() })),
}));
```

### Maestro E2E

Maestro flows run against `payment_mode=mock`. See `mobile/maestro/README.md`.
