import { toast } from 'sonner';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { ActionState } from '@/server/action-helpers';

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
 * Standard error display patterns for client-side
 */
export interface ErrorDisplayOptions {
  showToast?: boolean;
  toastType?: 'error' | 'warning';
  setFormError?: boolean;
  formErrorField?: string;
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
  showToast?: boolean;
  setFormError?: boolean;
  formErrorField?: string;
  onSuccess?: (
    result: Extract<ActionState<T>, { success: true }>,
  ) => void | Promise<void>;
  onError?: (
    result: Extract<ActionState<T>, { success: false }>,
  ) => void | Promise<void>;
}

/**
 * Handles async server actions with consistent error handling for forms
 */
export async function handleAsyncAction<T, TFieldValues extends FieldValues>(
  action: (formValues?: TFieldValues) => Promise<ActionState<T>>,
  form?: UseFormReturn<TFieldValues>,
  options: AsyncActionOptions<T> = {},
): Promise<T | null> {
  const {
    showToast = true,
    setFormError = !!form,
    formErrorField = 'root.serverError',
    onSuccess,
    onError,
  } = options;

  try {
    if (form) {
      form.clearErrors();
    }

    const result = await action();

    if (result.success) {
      // Handle success case
      if (showToast && result.message) {
        toast.success(result.message);
      }

      if (onSuccess) {
        await onSuccess(result);
      }

      return result.data ?? null;
    } else {
      // Handle error case from ActionState
      const errorMessage = result.error;

      // Show toast notification
      if (showToast) {
        toast.error(errorMessage);
      }

      // Set form errors
      if (setFormError && form) {
        if ((result.issues?.length ?? 0) > 0) {
          // Set field-specific validation errors
          result.issues?.forEach((issue) => {
            const fieldPath = issue.path.join('.') as Path<TFieldValues>;
            if (fieldPath) {
              form.setError(fieldPath, {
                message: issue.message,
              });
            }
          });
        } else {
          // Set general form error
          form.setError(formErrorField as 'root' | `root.${string}`, {
            message: errorMessage,
          });
        }
      }

      // Call custom error handler
      if (onError) {
        await onError(result);
      }

      return null;
    }
  } catch (error) {
    // Handle unexpected errors (network issues, etc.)
    console.error('Server action failed with unexpected error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    // Show toast notification
    if (showToast) {
      toast.error(errorMessage);
    }
    // Set form error
    if (setFormError && form) {
      form.setError(formErrorField as 'root' | `root.${string}`, {
        message: errorMessage,
      });
    }

    // Create error result for onError callback
    if (onError) {
      const errorResult: Extract<ActionState<T>, { success: false }> = {
        success: false,
        error: errorMessage,
      };
      await onError(errorResult);
    }

    return null;
  }
}
