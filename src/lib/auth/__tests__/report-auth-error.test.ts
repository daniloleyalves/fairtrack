import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import { reportAuthError } from '../report-auth-error';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

vi.mock('../auth', () => ({
  auth: { $ERROR_CODES: {} },
}));

vi.mock('../auth-client', () => ({
  authClient: {},
}));

describe('reportAuthError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    'INVALID_EMAIL_OR_PASSWORD',
    'USER_ALREADY_EXISTS',
    'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL',
    'INVALID_TOKEN',
  ])('does not report known code %s', (code) => {
    reportAuthError(
      { code, status: 401 },
      { flow: 'sign-in', step: 'credentials' },
    );

    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('reports unknown codes with flow, step, and code tags', () => {
    reportAuthError(
      { code: 'FAILED_TO_CREATE_SESSION', message: 'session failed' },
      { flow: 'sign-up', step: 'submit' },
    );

    expect(Sentry.captureException).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ message: 'session failed' }),
      {
        tags: {
          flow: 'sign-up',
          step: 'submit',
          'auth.code': 'FAILED_TO_CREATE_SESSION',
        },
      },
    );
  });

  it('reports errors without a code as unknown', () => {
    reportAuthError({}, { flow: 'reset-password', step: 'submit' });

    expect(Sentry.captureException).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ message: 'Unknown auth error' }),
      {
        tags: {
          flow: 'reset-password',
          step: 'submit',
          'auth.code': 'unknown',
        },
      },
    );
  });

  it('passes real Error instances through unchanged', () => {
    const error = Object.assign(new Error('network down'), {
      code: undefined,
    });

    reportAuthError(error, { flow: 'sign-in', step: 'credentials' });

    expect(Sentry.captureException).toHaveBeenCalledExactlyOnceWith(error, {
      tags: {
        flow: 'sign-in',
        step: 'credentials',
        'auth.code': 'unknown',
      },
    });
  });
});
