# Release runbook: bcrypt → scrypt migration

This is a one-time deployment runbook. Once executed in prod and verified, delete this file.

## Background

The legacy auth stack used `bcrypt` for password hashing. better-auth 1.6 ships non-blocking scrypt as the default. We've removed the `bcrypt` dep and the verify shim that bridged the two algorithms.

At the time of cutover (dev DB snapshot):

- 201 credential accounts had bcrypt-hashed passwords
- 185 of those had `secure = false` — they were assigned the historical "standard" password and never set their own. They authenticate via the `SecurityModal` flow on sign-in, which triggers a password reset; they never used the bcrypt hash to authenticate directly.
- 16 of those had `secure = true` — they set their own password during the bcrypt era. They authenticate via the password field directly. **These users will be locked out** until they reset their password.

## What ships in code

- `password.verify` override removed from `auth.ts`. better-auth now uses its built-in scrypt verify exclusively.
- `bcrypt` and `@types/bcrypt` removed from `package.json`.
- Demo seed now hashes its password with scrypt via `better-auth/crypto`.
- Drizzle migration `0040_clear_bcrypt_hashes.sql` NULLs every `$2`-prefixed credential password. better-auth treats NULL passwords as "no credential account" — the user gets `CREDENTIAL_ACCOUNT_NOT_FOUND` and must reset.

## Prod deploy sequence

### 1. Identify the affected users (before applying the migration)

```sql
SELECT u.id, u.email, u.first_name, u.last_name
FROM auth."user" u
JOIN auth."account" a ON a.user_id = u.id
WHERE a.provider_id = 'credential'
  AND a.password LIKE '$2%'
  AND u.secure = true;
```

This returns the users who set their own password during the bcrypt era. They are the ones who need a heads-up email.

### 2. Send password reset emails

For each user in the result above, call `auth.api.requestPasswordReset` so they receive a reset link via `sendResetPassword` (our existing Resend template). A one-off script using the project's auth instance is the simplest approach. Subject line suggestion: "FairTrack: Bitte setzen Sie Ihr Passwort neu" — explain we're upgrading password security.

### 3. Apply the migration

```bash
NEXT_PUBLIC_ENV=production pnpm db:migrate
```

This runs `drizzle/0040_clear_bcrypt_hashes.sql` (and any others pending). After it completes, zero `$2`-prefixed passwords remain.

### 4. Verify

```sql
SELECT count(*) FROM auth."account"
WHERE provider_id = 'credential' AND password LIKE '$2%';
-- Expected: 0
```

### 5. Deploy the code

Standard deploy. The `password.verify` override is gone; better-auth handles everything natively.

### 6. Monitor

Watch the Resend dashboard / Sentry for password-reset traffic spikes from the 16 users over the next few days. Any user who hits "wrong password / account not found" and doesn't follow up via reset is a candidate for direct outreach.

## Rollback

If something goes wrong during cutover, the safest rollback is:

1. Roll back the code deploy (restores the bcrypt shim and dep).
2. Leave the DB as-is — NULL passwords are still NULL. Affected users complete reset and get scrypt hashes via the rolled-back shim flow.

Do **not** try to restore bcrypt hashes from a backup; that just re-introduces the problem.
