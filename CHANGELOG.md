# Changelog

All notable changes to this mobile app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Installed `react-native-svg` for SVG icon rendering
- `ThemeContext` with light/dark token maps, `ThemeProvider`, and `useTheme` hook
- Theme preference persisted to `expo-secure-store` across cold starts
- SVG tab bar icons: Calendar (Bookings tab) and Person (Profile tab) — filled when active, outlined when inactive
- `ThemedTestWrapper` utility for theme-aware test rendering

### Changed

- **Profile screen (Sky Frost theme)** — Sky Frost gradient background, frosted glass cards, iOS-style dark mode `Switch` in profile header
- **My Bookings screen (Sky Frost theme)** — Sky Frost gradient background, frosted glass booking cards, theme-aware colours throughout
