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

## [1.2.2] - 2026-10-17

### Fixed

- Chrome's dropped-connection errors ("Failed to fetch", "network error") from long-open or offline tabs are no longer reported to Sentry, matching the existing filter for Firefox and Safari.

### Changed

- Hub pages reload themselves after 30 minutes without input, so tablets left open at a fairteiler always run the latest deploy with fresh data. A contribution form with unsaved input is never reloaded, and nothing reloads while offline.
- Tooling: Vite+ (`vp check` for format, lint and typecheck, `vp test` for unit tests) replaces ESLint, Prettier, Husky and lint-staged. Development needs Node >=22.18; existing clones run `git config --unset core.hooksPath && pnpm install` once.

### Deployment notes

- No database migrations. `next build` is unchanged, and Vercel builds on Node 24.x.

## [1.2.1] - 2026-10-15

### Added

- Announcement banners at the top of the fairteiler area and the user hub. Announcements live in the database with an audience, optional roles and fairteiler, and a start/end window; each user can dismiss them. The first one presents the 1.2.0 highlights to fairteiler owners, members and viewers until 2026-12-01.

### Changed

- The history access filter option "Persönliches Konto" is now called "Nutzerkonto".
- Expected auth errors are reported to Sentry as warnings, and stale-tab `UnrecognizedActionError`s after a deploy are filtered out.

### Fixed

- The fairteiler sidebar no longer crashes when the session has expired or no active fairteiler is set.

### Deployment notes

- Production needs migration `0045_announcements` before this release goes live: the fairteiler and user hub layouts query the new `announcement` table. It only adds the `announcement` and `announcement_dismissal` tables plus the 1.2.0 announcement row, so the running 1.2.0 code keeps working on the migrated database.

## [1.2.0] - 2026-10-15

### Added

- QR codes for unattended fairteilers: owners create and print them under Präferenzen. A scan confirms for 30 minutes that someone is on site. People then contribute with their own account (sign-in or sign-up continues straight to the form) or, if the owner ticked "Beiträge als Gast ermöglichen", without signing in in the same Retteformular, saved under the fairteiler's guest access view.
- Owners, members and employees can record a contribution for an earlier day (up to 365 days back) from the fairteiler Retteformular, so a backlog no longer lands as one spike on the day it is typed in.
- Owners can reset the password of an access view from the members page.
- The fairteiler history can be filtered by access type and by contributor.
- Public site redesign (already live since July): new landing page with product tour and rescued-kg counter, redesigned public fairteiler directory, Info & FAQ split into sections.

### Changed

- A QR scan now counts as on-site proof for contributions with an account, alongside the existing location check, which is now also enforced on the server.
- Users who skipped onboarding get the default preferences (wizard view, streaks, quests, AI feedback) until they change a setting, instead of a broken Retteformular.
- The AI feedback after a contribution runs through Vercel AI Gateway, authenticated by the deployment's Vercel OIDC token. `OPENAI_API_KEY` is now only used outside Vercel (local development).
- Preview and development deployments upload images to a separate non-production Blob store instead of the production store.
- Unexpected auth, database and form errors are reported to Sentry with the signed-in user id and without email addresses; browser noise, forged action posts and extension crashes are dropped (already live since September).
- The landing page prerenders fully and routes no longer wait on the root session fetch (already live since July).
- CI runs on `dev` too; E2E (Cypress) runs for `master`, the weekly run and manual runs, not for `dev`.

### Fixed

- Dashboard milestones no longer pile up: achieved milestones form one horizontal stack topped by the latest (hover lists each with its date), followed by the next milestone, and 100+ milestones fit their badge.
- Custom food names typed into the Retteformular are kept on submit (entries saved before this fix can't be recovered).
- The coffee button in the mobile dock is hidden for users without a fairteiler.
- Sign-in, sign-up, password reset and contribution forms keep their state until the redirect or success page has rendered (already live since July).
- Contribution privilege checks (`submitAs`), tutorial mutations and admin promotion are scoped to the caller's own fairteiler (already live since July).
- Auth accepts Vercel preview hostnames, so sign-in works on preview deployments.

### Deployment notes

- Production needs migrations `0041` to `0044` before this release goes live. Their net effect is additive (new `fairteiler_qr_code` table; `checkin.verified_via` and `session.qr_code_id` are added and dropped again), so the running 1.1.x code keeps working on the migrated database. Run them from a checkout of this release, then merge.
- No new environment variables. AI Gateway uses the deployment's OIDC token; Production keeps its existing `BLOB_READ_WRITE_TOKEN`.

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
- CI `test`/`e2e` jobs share a `concurrency` group — multiple simultaneous workflow runs were racing against the same test database, corrupting each other's fixtures mid-run.
