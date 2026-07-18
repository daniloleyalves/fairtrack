import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import { captureUnexpected } from '../_lib/sentry-capture';
import {
  DatabaseError,
  NotFoundError,
  PermissionError,
  ValidationError,
} from '../error-handling';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

describe('captureUnexpected', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    new ValidationError('invalid input'),
    new PermissionError('delete', 'contribution'),
    new NotFoundError('Fairteiler', 'abc'),
  ])('skips expected error $name', (error) => {
    captureUnexpected(error);

    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('skips errors whose name is AuthError', () => {
    const error = new Error('no session');
    error.name = 'AuthError';

    captureUnexpected(error);

    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('captures generic errors without a fingerprint', () => {
    const error = new Error('boom');

    captureUnexpected(error);

    expect(Sentry.captureException).toHaveBeenCalledExactlyOnceWith(error);
  });

  it('captures database errors fingerprinted by operation', () => {
    const error = new DatabaseError('insert failed', 'create contribution');

    captureUnexpected(error);

    expect(Sentry.captureException).toHaveBeenCalledExactlyOnceWith(error, {
      fingerprint: ['database-error', 'create contribution'],
    });
  });

  it('falls back to an unknown fingerprint segment without operation', () => {
    const error = new DatabaseError('insert failed');

    captureUnexpected(error);

    expect(Sentry.captureException).toHaveBeenCalledExactlyOnceWith(error, {
      fingerprint: ['database-error', 'unknown'],
    });
  });

  it('captures non-error values', () => {
    captureUnexpected('string failure');

    expect(Sentry.captureException).toHaveBeenCalledExactlyOnceWith(
      'string failure',
    );
  });
});
