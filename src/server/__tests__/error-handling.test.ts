import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ValidationError,
  DatabaseError,
  NotFoundError,
  PermissionError,
  handleDatabaseError,
  validateRequired,
  validatePermission,
} from '../error-handling';
import * as Sentry from '@sentry/nextjs';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('error classes', () => {
  it('ValidationError carries name, message, and field', () => {
    const error = new ValidationError('email is required', 'email');

    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('email is required');
    expect(error.field).toBe('email');
    expect(error).toBeInstanceOf(Error);
  });

  it('DatabaseError carries name, operation, and cause', () => {
    const cause = { code: '23505' };
    const error = new DatabaseError('boom', 'create user', cause);

    expect(error.name).toBe('DatabaseError');
    expect(error.message).toBe('boom');
    expect(error.operation).toBe('create user');
    expect(error.cause).toBe(cause);
  });

  it('NotFoundError includes the identifier when given', () => {
    const error = new NotFoundError('User', 'abc-123');

    expect(error.name).toBe('NotFoundError');
    expect(error.message).toBe("User with identifier 'abc-123' not found");
  });

  it('NotFoundError omits the identifier clause when not given', () => {
    expect(new NotFoundError('User').message).toBe('User not found');
  });

  it('PermissionError composes action and resource', () => {
    const error = new PermissionError('delete', 'contribution');

    expect(error.name).toBe('PermissionError');
    expect(error.message).toBe('Permission denied: delete contribution');
  });

  it('PermissionError with action only omits the resource', () => {
    expect(new PermissionError('delete').message).toBe(
      'Permission denied: delete',
    );
  });
});

describe('handleDatabaseError', () => {
  it('maps unique constraint violations (23505) to an "already exists" error', () => {
    const pgError = { code: '23505' };

    try {
      handleDatabaseError(pgError, 'create user', 'User');
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(DatabaseError);
      expect((error as DatabaseError).message).toBe('User already exists');
      expect((error as DatabaseError).operation).toBe('create user');
      expect((error as DatabaseError).cause).toBe(pgError);
    }
  });

  it('falls back to "Resource" for 23505 without a resource', () => {
    expect(() => handleDatabaseError({ code: '23505' }, 'create')).toThrow(
      'Resource already exists',
    );
  });

  it('maps foreign key violations (23503) to a "referenced by other data" error', () => {
    expect(() =>
      handleDatabaseError({ code: '23503' }, 'delete', 'fairteiler'),
    ).toThrow('Cannot delete fairteiler: referenced by other data');
  });

  it('maps not-null violations (23502) to a "missing required data" error', () => {
    expect(() =>
      handleDatabaseError({ code: '23502' }, 'update contribution', 'User'),
    ).toThrow('Missing required data for update contribution');
  });

  it('throws a generic error for unknown codes', () => {
    const pgError = { code: '42P01' };

    expect(() => handleDatabaseError(pgError, 'load', 'contributions')).toThrow(
      'Failed to load contributions',
    );
  });

  it('throws a generic error for non-object errors', () => {
    expect(() => handleDatabaseError('connection refused', 'save')).toThrow(
      'Failed to save data',
    );
  });

  it('does not report to Sentry itself', () => {
    expect(() => handleDatabaseError({ code: '23505' }, 'create')).toThrow(
      DatabaseError,
    );
    expect(() => handleDatabaseError({ code: '42P01' }, 'load')).toThrow(
      DatabaseError,
    );
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});

describe('validateRequired', () => {
  it('throws a ValidationError naming the field for null', () => {
    try {
      validateRequired(null, 'userId');
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).message).toBe('userId is required');
      expect((error as ValidationError).field).toBe('userId');
    }
  });

  it('throws a ValidationError for undefined', () => {
    expect(() => validateRequired(undefined, 'email')).toThrow(
      'email is required',
    );
  });

  it('accepts falsy but present values', () => {
    expect(() => validateRequired(0, 'quantity')).not.toThrow();
    expect(() => validateRequired('', 'comment')).not.toThrow();
    expect(() => validateRequired(false, 'isActive')).not.toThrow();
  });
});

describe('validatePermission', () => {
  it('throws a PermissionError composing action and resource when denied', () => {
    try {
      validatePermission(false, 'edit', 'fairteiler');
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(PermissionError);
      expect((error as PermissionError).message).toBe(
        'Permission denied: edit fairteiler',
      );
    }
  });

  it('throws with the action only when no resource is given', () => {
    expect(() => validatePermission(false, 'export data')).toThrow(
      'Permission denied: export data',
    );
  });

  it('does not throw when the condition holds', () => {
    expect(() => validatePermission(true, 'edit', 'fairteiler')).not.toThrow();
  });
});
