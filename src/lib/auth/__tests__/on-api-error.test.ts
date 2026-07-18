import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import { APIError } from 'better-auth';
import { handleAuthApiError } from '../on-api-error';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

describe('handleAuthApiError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it.each(['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'UNPROCESSABLE_ENTITY'])(
    'does not report user-correctable %s errors',
    (status) => {
      const error = new APIError(status as 'UNAUTHORIZED', {
        code: 'INVALID_EMAIL_OR_PASSWORD',
      });

      handleAuthApiError(error);

      expect(Sentry.captureException).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Auth API error:', error);
    },
  );

  it('reports internal server errors with auth tags', () => {
    const error = new APIError('INTERNAL_SERVER_ERROR', {
      code: 'FAILED_TO_CREATE_SESSION',
    });

    handleAuthApiError(error);

    expect(Sentry.captureException).toHaveBeenCalledExactlyOnceWith(error, {
      tags: {
        'auth.code': 'FAILED_TO_CREATE_SESSION',
        'auth.status': 'INTERNAL_SERVER_ERROR',
      },
    });
  });

  it('reports server errors without a code as unknown', () => {
    const error = new APIError('INTERNAL_SERVER_ERROR');

    handleAuthApiError(error);

    expect(Sentry.captureException).toHaveBeenCalledExactlyOnceWith(error, {
      tags: {
        'auth.code': 'unknown',
        'auth.status': 'INTERNAL_SERVER_ERROR',
      },
    });
  });

  it('reports plain errors with unknown tags', () => {
    const error = new Error('resend unavailable');

    handleAuthApiError(error);

    expect(Sentry.captureException).toHaveBeenCalledExactlyOnceWith(error, {
      tags: {
        'auth.code': 'unknown',
        'auth.status': 'unknown',
      },
    });
    expect(console.error).toHaveBeenCalledWith('Auth API error:', error);
  });
});
