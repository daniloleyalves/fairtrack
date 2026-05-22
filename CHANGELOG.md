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

### Added

- `PhoneInput` component (shadcn `input-group` + `Command`/`Popover` country picker, `libphonenumber-js`, German country names via `Intl.DisplayNames`); wired into the user profile form with `isValidPhoneNumber` validation. Phone is stored in E.164 format.

### Changed

- Password hashing fully migrated from bcrypt to better-auth's built-in non-blocking scrypt. Drizzle migration `0040_clear_bcrypt_hashes.sql` NULLs all legacy `$2`-prefixed credential passwords; affected users go through password reset on next sign-in. Demo seed re-hashes its password via `better-auth/crypto` at seed time.
- Upgraded `better-auth` 1.4.7 → 1.6.11. Sign-up form now pre-checks email existence to keep the "Benutzer bereits registriert." UX after 1.6's anti-enumeration change, matching the sign-in pre-check pattern.
- `auth.ts` gained three test/UX-preserving options: `advanced.disableCSRFCheck` in `testing` env (Node-side test clients lack `Origin`), `session.freshAge: 0` to keep pre-1.6 sensitive-op re-auth cadence, and `organization.requireEmailVerificationOnInvitation: false` so synthetic access-view emails still work.
- `user.phone` column: `numeric` → `text` (stores E.164); `user.foodsharing_id`: `numeric` → `integer`. Migrations cast existing data.
- CI Node version bumped to 22 via `.nvmrc` + `package.json#engines`; workflows read from `.nvmrc` as the single source of truth.

### Removed

- `bcrypt` and `@types/bcrypt` dependencies. The verify shim that bridged bcrypt and scrypt is gone.

### Deployment notes

- **Before deploying this release to prod**, follow `docs/release-bcrypt-removal.md`: identify the ~16 users with `secure = true` and bcrypt hashes, send each a password reset email, then run the migration. The 185 users with `secure = false` go through the existing `SecurityModal` reset flow on next sign-in and need no special handling.

### Fixed

- Replaced the fragile `account.update.after` hook (parsed `reset-password:${token}` to find the user, only ever fired for the reset flow despite a comment claiming "or password change") with better-auth's `onPasswordReset` for reset and a simplified `account.update.after` that now correctly handles `/change-password` too.
- `additionalFields.phone` was declared as `'number'` while the column was `numeric` (Drizzle: string) — type mismatch that would have broken any phone write. Aligned by switching the column to `text` and the field type to `'string'`. Same shape mismatch on `foodsharing_id` fixed by switching the column to `integer`.
- `hasPermission` / `checkRolePermission` call sites updated for the 1.5 `permission` → `permissions` rename.
