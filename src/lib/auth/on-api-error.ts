import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { APIError } from 'better-auth';

export function handleAuthApiError(error: unknown): void {
  console.error('Auth API error:', error);
  if (error instanceof APIError && error.statusCode < 500) {
    return;
  }
  Sentry.captureException(error, {
    tags: {
      'auth.code':
        error instanceof APIError ? (error.body?.code ?? 'unknown') : 'unknown',
      'auth.status':
        error instanceof APIError ? String(error.status) : 'unknown',
    },
  });
}
