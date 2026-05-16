# IAP manual test checklist

Run against Apple Sandbox + Google internal test track per release. Each item
lists how to trigger and what to assert.

## iOS sandbox

- [ ] First-time purchase
  - Trigger: sandbox tester not previously used Pro Owner trial → walk wizard → "Start Free Trial".
  - Assert: PaymentSheet shows; on confirm, `Subscription(processor=app_store, status=ACTIVE)` exists, user has org, `SubscriptionActivated` in logs.
- [ ] Reused-trial purchase (no free trial)
  - Trigger: sandbox tester that previously used the trial.
  - Assert: PaymentSheet shows full price; `Subscription.amount_cents` ≈ 39999; `isTrial` false in payload.
- [ ] Cancel-from-store
  - Trigger: Settings → Subscriptions → Cancel.
  - Assert: webhook arrives within ~2 min; `Subscription.canceled_at` set; `status=ACTIVE` until expiry.
- [ ] Refund
  - Trigger: TestFlight refund via `xcrun` simulated refund.
  - Assert: webhook arrives; `Subscription.status=CANCELED`; `UserTransaction(type=SUBSCRIPTION_REFUND, amount_cents=-X)` exists.
- [ ] Renewal
  - Trigger: sandbox accelerates renewal (5 min for monthly).
  - Assert: `current_period_ends_at` extended; `UserTransaction(type=SUBSCRIPTION_RENEWAL)` exists.
- [ ] Restore on reinstall
  - Trigger: delete app, reinstall, log in same user, profile → Restore purchases.
  - Assert: route flips to staff tabs; no duplicate Subscription row.

## Android internal test track

- [ ] Same six cases as iOS above, against a Google account that's been added to the internal track.
- [ ] Pub/Sub topic verified to deliver to `/api/v1/iap/webhooks/google` within ~5 min.

## Cross-cutting

- [ ] Price drift (set `BOOKING_PRO_OWNER_MONTHLY_CENTS=29999` after SKU is at $399.99): purchase rejected with 409.
- [ ] `payment_mode=mock`: full wizard works without any store interaction.
- [ ] `payment_mode` set to an unimplemented value (e.g., `stripe`): `/offer` returns 503 with `payment_mode_unavailable`.
