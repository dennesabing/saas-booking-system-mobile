# mobile/maestro

Maestro flows that exercise the mobile app end-to-end. Designed to run against
a backend with `BOOKING_PRO_OWNER_PAYMENT_MODE=mock` so they do not require
Apple/Google sandbox accounts.

Run locally:

    maestro test mobile/maestro/upgrade-pro-owner-mock.yaml

CI invokes the same command after spinning up an Expo dev build via EAS.
