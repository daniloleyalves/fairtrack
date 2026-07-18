import * as Sentry from '@sentry/nextjs';
import { knownAuthErrorCodes } from './auth-helpers';

export function reportAuthError(
  error: { code?: string; status?: number; message?: string },
  context: { flow: string; step: string },
): void {
  if (error.code && knownAuthErrorCodes.has(error.code)) {
    return;
  }
  Sentry.captureException(
    error instanceof Error
      ? error
      : new Error(error.message ?? 'Unknown auth error'),
    {
      tags: {
        flow: context.flow,
        step: context.step,
        'auth.code': error.code ?? 'unknown',
      },
    },
  );
}
