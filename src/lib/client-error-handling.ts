import { toast } from 'sonner';

/**
 * Standard error messages in German for common scenarios.
 * Used by `useFormAction` and other client-side error paths as a
 * fallback when the action's serverError message isn't user-friendly.
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
 * Handles a generic async client operation (not a server action) with a
 * loading state and toast-based error reporting. Used for operations like
 * file uploads, auth client calls, etc. — anywhere that's not wrapped by
 * next-safe-action.
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
