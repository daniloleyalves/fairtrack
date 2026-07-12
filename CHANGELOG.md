# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## How to use

Append a one-line entry to `[Unreleased]` as you ship meaningful work. Use one of these sections — create only the ones you need:

- `Added` — new features
- `Changed` — changes to existing behavior
- `Deprecated` — soon-to-be-removed features
- `Removed` — features removed in this release
- `Fixed` — bug fixes
- `Security` — vulnerability fixes

On release: rename `[Unreleased]` to `[X.Y.Z] - YYYY-MM-DD` and create a new empty `[Unreleased]` heading above it.

## [Unreleased]

## [1.1.0] - 2026-07-12

### Added

- Data layer migrated from SWR + in-house action wrapper to TanStack Query + `next-safe-action`, and server code reorganized by domain (`user`, `fairteiler`, `contribution`, `tutorial`, `platform`). No functional change.
- `PhoneInput` component with country picker; phone numbers now stored in E.164 format.

### Changed

- Platform + fairteiler dashboards default to the current calendar year instead of all-time.
- Platform export surfaces real server errors instead of swallowing them.
- Password hashing migrated from bcrypt to better-auth's built-in scrypt; `better-auth` upgraded 1.4.7 → 1.6.11. See Deployment notes.
- `user.phone` and `user.foodsharing_id` columns corrected to `text`/`integer` to match their actual data.
- CI pipeline modernized: GitHub Actions bumped off the deprecated node20 runtime, and missing `TINYMCE_KEY`/`NEXT_PUBLIC_MAPBOX_TOKEN` test-env secrets (was flooding e2e logs) fixed.

### Removed

- "Haltbarkeit" (shelf life) and "Kühlen" (cooling) fields removed from the UI; DB columns and historical data preserved.
- `bcrypt` dependency and its verify shim.

### Deployment notes

- Bcrypt → scrypt cutover: migration `0040_clear_bcrypt_hashes.sql` NULLs legacy `$2`-prefixed credential passwords. Affected users are prompted to set a new password on their next sign-in attempt (`SecurityModal`, gated on whether a credential password currently exists) — no pre-migration email step needed. Rollback: revert the code only; leave NULLed passwords as-is.

### Fixed

- Password reset/change hook (`account.update.after`) now correctly handles both flows via better-auth's `onPasswordReset`.
- `hasPermission` / `checkRolePermission` call sites updated for the 1.5 `permission` → `permissions` rename.
- Stray `console.log('loading session')` removed from `loadSession`, which fired on every session check.
- `checkPermissionOnServer` retries on `MEMBER_NOT_FOUND` — a transient consistency gap right after a membership is created (e.g. accepting an invitation), not a real authorization failure.
