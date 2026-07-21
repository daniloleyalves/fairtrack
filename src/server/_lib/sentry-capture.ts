import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { DatabaseError } from '@/server/error-handling';

const NON_REPORTED_ERROR_NAMES = new Set([
  'ValidationError',
  'PermissionError',
  'NotFoundError',
  'AuthError',
]);

export function captureUnexpected(error: unknown): void {
  if (error instanceof Error && NON_REPORTED_ERROR_NAMES.has(error.name)) {
    return;
  }
  if (error instanceof DatabaseError) {
    Sentry.captureException(error, {
      fingerprint: ['database-error', error.operation ?? 'unknown'],
    });
    return;
  }
  Sentry.captureException(error);
}
