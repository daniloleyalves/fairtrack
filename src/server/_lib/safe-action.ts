import { createSafeActionClient } from 'next-safe-action';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';

export const action = createSafeActionClient({
  throwValidationErrors: true,
  handleServerError: (e) => {
    throw e;
  },
});

export const authedAction = action.use(async ({ next }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return next({ ctx: { session } });
});
