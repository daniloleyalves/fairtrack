-- Clears all bcrypt-hashed credential passwords so the bcrypt verify
-- shim can be removed. After this migration runs:
--
-- * Users with `secure = false` (185 of 201 at migration time): they
--   already flow through the SecurityModal on sign-in, which triggers
--   a password reset. They never used the bcrypt hash to authenticate,
--   so NULLing it is transparent.
--
-- * Users with `secure = true` (16 of 201 at migration time): they did
--   authenticate via the bcrypt hash. They will get
--   `CREDENTIAL_ACCOUNT_NOT_FOUND` on next sign-in until they reset
--   their password. PROD DEPLOY MUST send these users a reset email
--   first — see CHANGELOG for the runbook.

UPDATE "auth"."account"
SET "password" = NULL
WHERE "provider_id" = 'credential'
  AND "password" LIKE '$2%';
