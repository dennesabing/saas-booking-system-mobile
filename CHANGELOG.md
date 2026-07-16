# Changelog

All notable changes to this mobile app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Global marketplace — browse and book services nearby**
  - `app/(customer)/marketplace/index.tsx` — geolocation-based service listing. Requests device location via `expo-location`; falls back to manual address input geocoded via Nominatim. Search bar (400 ms debounce), radius filter chips (5/25/50 km), kind filter chips (All/Slot/Resource). Infinite scroll via `useInfiniteQuery`. Service cards show name, org, distance badge, duration, and price.
  - `app/(customer)/marketplace/[uuid].tsx` — service detail and booking screen. Scrollable: `DateSlotPicker` → attendee count stepper → notes → "Book Now" CTA. On success navigates to the existing booking confirmation screen.
  - `app/(customer)/marketplace/_layout.tsx` — Stack layout for the marketplace route group.
- **PRO Owner — create booking for own service**
  - `app/(staff)/bookables/[id]/create-booking.tsx` — single-screen booking creation for a PRO Owner's service. Booking type selector ("For myself" / "For a customer"); customer mode reveals customer name (required) and email (optional) inputs. Uses `DateSlotPicker`, attendee stepper, and notes. On success shows inline confirmation with "Done" → `router.back()`.
  - `app/(staff)/bookables/[id]/_layout.tsx` — Stack layout for bookable sub-routes.
  - **"+ Create Booking" button** added to `app/(staff)/bookables/[id].tsx` (between "Save changes" and "Delete service"), navigating to the create-booking screen.
- **`DateSlotPicker` shared component** (`components/booking/DateSlotPicker.tsx`) — horizontal 30-day date pill row + 3-column time slot grid. Calls `useAvailability` and handles loading/error/empty states. Reused by both the marketplace detail screen and the PRO Owner create-booking screen.
- **`useMarketplaceBookables` hook** (`hooks/useMarketplaceBookables.ts`) — `useInfiniteQuery` wrapper for `GET /api/v1/marketplace/bookables` with `MarketplaceBookable` and `MarketplaceParams` types.
- **`launch-emulator.ps1`** — dev script that frees port 8085 and starts a fresh Expo dev server on it (`exp://127.0.0.1:8085`), for a consistent emulator setup. Runnable via `npm run emulator`.

- **PRO Owner post-upgrade onboarding flow**: guides a newly-upgraded owner from the success screen to a booking-ready organization.
  - `SuccessStep` updated: primary CTA "Set up your first service →" navigates to setup modal; "Go to dashboard" demoted to secondary text link.
  - `app/(staff)/setup/first-service.tsx` — 2-step modal wizard (step 1: service details; step 2: open hours). On completion creates the first `Bookable` + `AvailabilitySchedule` via API.
  - `ServiceDetailsStep` — name input, duration chips (15/30/45/60/90/120 min, default 30), price field with "free" toggle.
  - `OpenHoursStep` — 7-day open/closed toggle grid; Mon–Fri open 09:00–17:00 by default; "Finish setup" disabled until ≥1 day open.
  - `SetupChecklist` — persistent card on the staff bookings tab showing 4 setup tasks with completion badges; collapses/expands with state persisted to `AsyncStorage`; auto-hides once `setup_completed_at` is set by the backend.
  - Empty-state added to staff bookings tab: rich placeholder with "Add a service" CTA when no bookable exists yet.
- `useOrgSetupStatus` hook — queries `GET /api/v1/org/setup-status`; exports `useMarkBookingLinkShared` PATCH mutation.
- `useFirstServiceSetup` hook — sequential `POST /api/v1/bookables` → `POST /api/v1/bookables/{uuid}/availability-schedules`; invalidates `['tenant-bookables']` and `['org-setup-status']` on success.
- Installed `@react-native-async-storage/async-storage` for checklist collapse persistence; manual Jest mock added at `__mocks__/@react-native-async-storage/async-storage.js`.
- Maestro E2E flows: `pro-owner-onboarding-complete.yaml` (full setup path) and `pro-owner-onboarding-skip.yaml` (skip → checklist visible).

### Fixed

- `UpgradeCtaCard.test.tsx` — added `expo-linear-gradient` mock; removed unnecessary `async`/`waitFor` wrapping; test no longer times out.

- Installed `react-native-svg` for SVG icon rendering
- `ThemeContext` with light/dark token maps, `ThemeProvider`, and `useTheme` hook
- Theme preference persisted to `expo-secure-store` across cold starts
- SVG tab bar icons: Calendar (Bookings tab) and Person (Profile tab) — filled when active, outlined when inactive
- `ThemedTestWrapper` utility for theme-aware test rendering

### Changed

- **Profile screen (Sky Frost theme)** — Sky Frost gradient background, frosted glass cards, iOS-style dark mode `Switch` in profile header
- **My Bookings screen (Sky Frost theme)** — Sky Frost gradient background, frosted glass booking cards, theme-aware colours throughout
