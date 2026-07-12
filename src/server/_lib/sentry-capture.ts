import 'server-only';
import * as Sentry from '@sentry/nextjs';

const NON_REPORTED_ERROR_NAMES = new Set([
  'ValidationError',
  'PermissionError',
  'NotFoundError',
  'AuthError',
  'DatabaseError',
]);

export function captureUnexpected(error: unknown): void {
  if (error instanceof Error && NON_REPORTED_ERROR_NAMES.has(error.name)) {
    return;
  }
  Sentry.captureException(error);
}
