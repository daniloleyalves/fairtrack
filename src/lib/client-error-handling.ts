import { toast } from 'sonner';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { ZodError } from 'zod';

/**
 * Standard error messages in German for common scenarios
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Netzwerkfehler. Bitte versuchen Sie es erneut.',
  VALIDATION_ERROR: 'Bitte überprüfen Sie Ihre Eingaben.',
  PERMISSION_DENIED: 'Sie haben keine Berechtigung für diese Aktion.',
  NOT_FOUND: 'Die angeforderte Ressource wurde nicht gefunden.',
  DATABASE_ERROR: 'Datenbankfehler. Bitte versuchen Sie es später erneut.',
  UNKNOWN_ERROR: 'Ein unbekannter Fehler ist aufgetreten.',
} as const;

/**
 * Gets user-friendly error message based on error code
 */
export function getErrorMessage(code?: string): string {
  switch (code) {
    case 'VALIDATION_ERROR':
      return ERROR_MESSAGES.VALIDATION_ERROR;
    case 'PERMISSION_DENIED':
      return ERROR_MESSAGES.PERMISSION_DENIED;
    case 'NOT_FOUND':
      return ERROR_MESSAGES.NOT_FOUND;
    case 'DATABASE_ERROR':
      return ERROR_MESSAGES.DATABASE_ERROR;
    default:
      return ERROR_MESSAGES.UNKNOWN_ERROR;
  }
}

/**
 * Handles async operations with loading states and error handling
 */
export async function handleClientOperation<T>(
  operation: () => Promise<T>,
  setLoading: (loading: boolean) => void,
  onError?: (error: unknown) => void,
): Promise<T | null> {
  try {
    setLoading(true);
    return await operation();
  } catch (error) {
    console.error('Operation failed:', error);

    if (onError) {
      onError(error);
    } else {
      const message =
        error instanceof Error ? error.message : 'Operation failed';
      toast.error(message);
    }

    return null;
  } finally {
    setLoading(false);
  }
}

export const noop: (loading: boolean) => void = () => {
  // No-op function for when loading state is not needed
};

/**
 * Options for handleAsyncAction
 */
export interface AsyncActionOptions<T> {
  /** Toast text shown on success. Omit to skip the success toast. */
  successMessage?: string;
  /** Toast errors (default: true). */
  showToast?: boolean;
  /** Mirror errors into the form (default: true if `form` is passed). */
  setFormError?: boolean;
  formErrorField?: string;
  onSuccess?: (data: T) => void | Promise<void>;
  onError?: (error: unknown) => void | Promise<void>;
}

/**
 * Wraps a throw-on-error server action so a form can call it with consistent
 * toast + form-error handling. Returns the action's data on success, or
 * `null` if the action threw.
 */
export async function handleAsyncAction<T, TFieldValues extends FieldValues>(
  action: () => Promise<T>,
  form?: UseFormReturn<TFieldValues>,
  options: AsyncActionOptions<T> = {},
): Promise<T | null> {
  const {
    successMessage,
    showToast = true,
    setFormError = !!form,
    formErrorField = 'root.serverError',
    onSuccess,
    onError,
  } = options;

  try {
    if (form) form.clearErrors();

    const data = await action();

    if (showToast && successMessage) {
      toast.success(successMessage);
    }
    if (onSuccess) {
      await onSuccess(data);
    }

    return data;
  } catch (error) {
    console.error('Server action failed:', error);

    const errorMessage =
      error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;

    if (showToast) {
      toast.error(errorMessage);
    }

    if (setFormError && form) {
      if (error instanceof ZodError && error.issues.length > 0) {
        error.issues.forEach((issue) => {
          const fieldPath = issue.path.join('.') as Path<TFieldValues>;
          if (fieldPath) {
            form.setError(fieldPath, { message: issue.message });
          }
        });
      } else {
        form.setError(formErrorField as 'root' | `root.${string}`, {
          message: errorMessage,
        });
      }
    }

    if (onError) {
      await onError(error);
    }

    return null;
  }
}
