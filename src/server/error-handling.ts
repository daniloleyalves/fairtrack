import 'server-only';

/**
 * Standard error types for the application
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public operation?: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, identifier?: string) {
    super(
      identifier
        ? `${resource} with identifier '${identifier}' not found`
        : `${resource} not found`,
    );
    this.name = 'NotFoundError';
  }
}

export class PermissionError extends Error {
  constructor(action: string, resource?: string) {
    super(
      resource
        ? `Permission denied: ${action} ${resource}`
        : `Permission denied: ${action}`,
    );
    this.name = 'PermissionError';
  }
}

/**
 * Standard server action result type
 */
export type ServerActionResult<T = void> =
  | {
      success: true;
      data?: T;
      message?: string;
    }
  | {
      success: false;
      error: string;
      code?: string;
      field?: string;
    };

/**
 * Enhanced database error handler with better context preservation
 */
export function handleDatabaseError(
  error: unknown,
  operation: string,
  resource?: string,
): never {
  console.error(`Database error in ${operation}:`, error);

  // Preserve specific database constraint errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as { code: string; message?: string };

    switch (dbError.code) {
      case '23505': // Unique constraint violation
        throw new DatabaseError(
          `${resource ?? 'Resource'} already exists`,
          operation,
          error,
        );
      case '23503': // Foreign key constraint violation
        throw new DatabaseError(
          `Cannot ${operation} ${resource ?? 'resource'}: referenced by other data`,
          operation,
          error,
        );
      case '23502': // Not null constraint violation
        throw new DatabaseError(
          `Missing required data for ${operation}`,
          operation,
          error,
        );
    }
  }

  // Generic database error
  throw new DatabaseError(
    `Failed to ${operation} ${resource ?? 'data'}`,
    operation,
    error,
  );
}

/**
 * Validates required fields and throws ValidationError if missing
 */
export function validateRequired<T>(
  value: T | null | undefined,
  fieldName: string,
): asserts value is T {
  if (value === null || value === undefined) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
}

/**
 * Validates user permissions and throws PermissionError if denied
 */
export function validatePermission(
  condition: boolean,
  action: string,
  resource?: string,
): asserts condition {
  if (!condition) {
    throw new PermissionError(action, resource);
  }
}
