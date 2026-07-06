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

- TanStack Query + `next-safe-action` foundation (refactor Phase 1): `QueryClient` factory in `src/lib/query-client.ts`, client-side `QueryProvider` mounted in the root layout, and a `next-safe-action` client (`action` + `authedAction`) in `src/server/_lib/safe-action.ts`. SWR remains active alongside; no call sites migrated yet.

### Changed

- Refactor Phase 2 (slice 1/5 — tutorial): tutorial DAL/DTO/actions moved from the server monoliths into `src/server/tutorial/`. Mechanical split; no behavior change. The remaining 4 slices (platform, user, fairteiler, contribution) follow.
- Refactor Phase 2 (slice 2/5 — platform): `getPlatformStats` moved from `src/server/dto.ts` into `src/server/platform/dto.ts`. Single-function move; no behavior change.
- Refactor Phase 2 (slice 3/5 — user): user-domain DAL/DTO/actions extracted into `src/server/user/` (auth/session, profile, preferences, feedback, user-scoped contribution stats, milestones, gamification events). 21 DAL + 9 DTO + 5 actions moved; ~25 caller files repointed; cross-domain imports updated in monoliths and tutorial files. Mechanical split; no behavior change.
- Refactor Phase 2 (slice 4/5 — fairteiler): fairteiler-domain DAL/DTO/actions extracted into `src/server/fairteiler/` (org/membership, tags, origin/category/company catalogs and per-fairteiler links, fairteiler dashboard). 27 DAL + 12 DTO + 14 actions moved; ~20 caller files repointed; cross-domain imports updated in monoliths, platform/, user-side auth-actions, and test mocks. Mechanical split; no behavior change. Final slice (contribution) deletes the monoliths entirely.
- Refactor Phase 2 (slice 5/5 — contribution, final): contribution-domain DAL/DTO/actions extracted into `src/server/contribution/`, and `src/server/{dal,dto,actions}.ts` deleted. 12 DAL + 4 DTO + 3 actions moved (checkin, contribution stats, version history, invitation validation, submit/edit/export). All remaining caller imports repointed via bulk rewrite. Dead commented-out `generateUserFeedbackAction` block dropped. Phase 2 complete — server code is now fully organized by domain.

### Changed

- Refactor Phase 3 (safe-action): `createAction` now throws on error and returns `T` directly; the `ActionState<T>` envelope at the action layer is gone. Action handlers stop wrapping returns in `{ message, data }` — success messages move to call sites (`handleAsyncAction({ successMessage })` or inline `toast.success`). `handleAsyncAction` rewritten to consume throw-on-error actions via try/catch. Call sites that manually narrowed `result.success` migrated to direct value access or `try/catch`. FormData-based actions (`updateFairteilerAction`, `updateUserAction`, the two tutorial step actions) keep the `ActionState` envelope for now (rolled into Phase 5 mutation work).
- Refactor Phase 4a (queries foundation): each domain's `dto.ts` renamed to `queries.ts` and given a `'use server'` directive so client code can call read procedures directly via TanStack. `OnboardingData` extracted to `src/server/user/types.ts` (the only non-async export). Per-domain `query-keys.ts` factories added (`userKeys`, `fairteilerKeys`, `originKeys`, `categoryKeys`, `companyKeys`, `contributionKeys`, `tutorialKeys`, `platformKeys`) with hierarchical keys and co-located `staleTime` constants from a new `src/server/_lib/stale-times.ts`. SWR still in use; no call sites migrated yet — that lands in 4b/4c.
- `PhoneInput` component (shadcn `input-group` + `Command`/`Popover` country picker, `libphonenumber-js`, German country names via `Intl.DisplayNames`); wired into the user profile form with `isValidPhoneNumber` validation. Phone is stored in E.164 format.
- `QuantityIncrementer` gained `showStepperButtons?: boolean` (default `true`). Passed `false` in the fast-mode contribution list; wizard quantity modal keeps the +/- buttons.

### Changed

- Platform + fairteiler statistics dashboards now default to the current calendar year (Jan 1 → today) instead of "Gesamter Zeitraum"; other `TimespanPicker` consumers (history tables) unchanged. The picker also receives the active range so its label reflects "Dieses Jahr".
- Toggling the form-mode preference (fast ↔ wizard) no longer triggers `toast.success('Platformerlebnis erfolgreich aktualisiert!')` — silent save. Toasts on other preference toggles (streaks, quests, AI feedback) unchanged. `updateUserPreferences` DAL signature now lists `formTableView` so its parameter type matches what the action passes.
- Platform export button no longer silently swallows server-action failures — `{ success: false }` responses now surface the server `error` as a toast and "no rows" is reported separately from genuine failures.
- Password hashing fully migrated from bcrypt to better-auth's built-in non-blocking scrypt. Drizzle migration `0040_clear_bcrypt_hashes.sql` NULLs all legacy `$2`-prefixed credential passwords; affected users go through password reset on next sign-in. Demo seed re-hashes its password via `better-auth/crypto` at seed time.
- Upgraded `better-auth` 1.4.7 → 1.6.11. Sign-up form now pre-checks email existence to keep the "Benutzer bereits registriert." UX after 1.6's anti-enumeration change, matching the sign-in pre-check pattern.
- `auth.ts` gained three test/UX-preserving options: `advanced.disableCSRFCheck` in `testing` env (Node-side test clients lack `Origin`), `session.freshAge: 0` to keep pre-1.6 sensitive-op re-auth cadence, and `organization.requireEmailVerificationOnInvitation: false` so synthetic access-view emails still work.
- `user.phone` column: `numeric` → `text` (stores E.164); `user.foodsharing_id`: `numeric` → `integer`. Migrations cast existing data.
- CI Node version bumped to 22 via `.nvmrc` + `package.json#engines`; workflows read from `.nvmrc` as the single source of truth.

### Removed

- "Haltbarkeit" (shelfLife) field removed from every UI surface: wizard quantity modal, wizard category/optional-info steps, fast-mode contribution row + table column, fairteiler contribution info modal, Excel export, contribution zod schema, `ContributionItem` model + factory, `DaysToDateAdapter` helper, related cypress + vitest cases. DB column (`checkin.shelf_life`), `vContributions` view column, and DAL read paths preserved — new contributions write `NULL`, legacy rows untouched.
- "Kühlen" (cool) field removed from every UI surface: optional-fields modal (fast), wizard optional-infos modal, wizard optional-info-step entry, fairteiler contribution info modal, Excel export, fairteiler statistics Kühlanforderungen filter + distribution chart, `getCoolingRequirements` + `CoolingDataPoint`, `getPlatformCoolingRequirements` (dead), `boolean-filter.tsx` deleted, `cool` removed from `ReportFilters` + `applyFilters`. DB column (`food.cool`) is `NOT NULL` with no default, so `checkinContribution` now writes a literal `cool: false`; column + DAL reads + AI feedback schema preserved.
- `bcrypt` and `@types/bcrypt` dependencies. The verify shim that bridged bcrypt and scrypt is gone.

### Deployment notes

- **Before deploying this release to prod**, run the bcrypt → scrypt cutover in this order:
  1. Identify the users who set their own password during the bcrypt era (these are the ones who need a heads-up email — everyone else goes through the existing `SecurityModal` reset flow on next sign-in and needs no special handling):
     ```sql
     SELECT u.id, u.email, u.first_name, u.last_name
     FROM auth."user" u
     JOIN auth."account" a ON a.user_id = u.id
     WHERE a.provider_id = 'credential'
       AND a.password LIKE '$2%'
       AND u.secure = true;
     ```
  2. Send each of them a password reset via `auth.api.requestPasswordReset` (triggers `sendResetPassword`) before proceeding.
  3. Run migrations (`NEXT_PUBLIC_ENV=production pnpm db:migrate`), which applies `0040_clear_bcrypt_hashes.sql` and NULLs every remaining `$2`-prefixed credential password.
  4. Verify: `SELECT count(*) FROM auth."account" WHERE provider_id = 'credential' AND password LIKE '$2%';` should return `0`.
  5. Deploy the code as normal.
  - Rollback: roll back the code deploy only; leave the DB as-is (NULL passwords stay NULL, affected users complete reset and get scrypt hashes via the rolled-back shim). Do not restore bcrypt hashes from a backup.

### Fixed

- Replaced the fragile `account.update.after` hook (parsed `reset-password:${token}` to find the user, only ever fired for the reset flow despite a comment claiming "or password change") with better-auth's `onPasswordReset` for reset and a simplified `account.update.after` that now correctly handles `/change-password` too.
- `additionalFields.phone` was declared as `'number'` while the column was `numeric` (Drizzle: string) — type mismatch that would have broken any phone write. Aligned by switching the column to `text` and the field type to `'string'`. Same shape mismatch on `foodsharing_id` fixed by switching the column to `integer`.
- `hasPermission` / `checkRolePermission` call sites updated for the 1.5 `permission` → `permissions` rename.
