import * as Sentry from '@sentry/nextjs';
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from 'next-safe-action';
import { headers } from 'next/headers';
import { loadAuthenticatedSession } from '@/server/user/dal';
import { AuthError } from '@/server/api-helpers';
import { captureUnexpected } from '@/server/_lib/sentry-capture';

/**
 * Base safe-action client.
 *
 * - Validation errors flattened to `{ formErrors, fieldErrors }` for clean
 *   react-hook-form mapping at call sites.
 * - Server errors propagated by message; the in-house error classes
 *   (`AuthError`, `NotFoundError`, `ValidationError`, `DatabaseError`) all
 *   extend `Error`, so their `message` reaches the client.
 */
export const action = createSafeActionClient({
  defaultValidationErrorsShape: 'flattened',
  handleServerError(e) {
    captureUnexpected(e);
    if (e instanceof Error) return e.message;
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

/**
 * Authenticated procedure. Loads the session in middleware and passes it
 * via `ctx`. Use when the action needs `ctx.session` but not an active
 * organization (e.g. user-profile updates).
 */
export const authedAction = action.use(async ({ next }) => {
  const session = await loadAuthenticatedSession(await headers());
  Sentry.setUser({ id: session.user.id });
  return next({ ctx: { session } });
});

/**
 * Organization-scoped procedure. Builds on `authedAction` and asserts an
 * active fairteiler. Use for any action that operates on the active
 * organization — adds/removes/edits within the current fairteiler.
 *
 * `ctx.fairteilerId` is the active organization id; `ctx.session` is the
 * authenticated session (same as `authedAction`).
 */
export const fairteilerAction = authedAction.use(async ({ ctx, next }) => {
  const fairteilerId = ctx.session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization selected.');
  }
  Sentry.setTag('fairteilerId', fairteilerId);
  return next({ ctx: { ...ctx, fairteilerId } });
});
