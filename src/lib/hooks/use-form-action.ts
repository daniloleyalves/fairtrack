'use client';

import { useAction } from 'next-safe-action/hooks';
import type { HookCallbacks, HookSafeActionFn } from 'next-safe-action/hooks';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { ERROR_MESSAGES } from '@/lib/client-error-handling';

/**
 * Convenience wrapper around `next-safe-action/hooks#useAction` that adds:
 * - Success toast (via `successMessage`)
 * - Auto-map `validationErrors.fieldErrors` → `form.setError(path)` when a
 *   form is supplied
 * - Server-error toast (when no form-level handling is appropriate)
 *
 * This is the modern replacement for `handleAsyncAction` — the action layer
 * is now `next-safe-action`-based, so client call sites use this hook in
 * place of the old `handleAsyncAction(() => action(input), form, opts)`
 * pattern. Returns the full `useAction` hook value (`execute`,
 * `executeAsync`, `isPending`, `result`, …).
 *
 * All actions in this codebase set `serverError: string` (via
 * `handleServerError` in `safe-action.ts`) and `defaultValidationErrorsShape:
 * 'flattened'`, so the generic constraints below match what every action
 * produces.
 */
export interface UseFormActionOptions<TData> {
  /** Toast text on success. Omit to skip the success toast. */
  successMessage?: string;
  /** Toast errors (default: true). When a form is passed, field errors
   *  surface inline and only non-field server errors get toasted unless
   *  `showToast` is false. */
  showToast?: boolean;
  /** Mirror server errors into the form root (default: true if `form`). */
  setFormError?: boolean;
  /** RHF path for non-field server errors. Default `'root.serverError'`. */
  formErrorField?: 'root' | `root.${string}`;
  /** Called with action data after a successful execute. */
  onSuccess?: (data: TData | undefined) => void | Promise<void>;
  /** Called on any error (validation OR server). */
  onError?: (error: {
    serverError?: string;
    validationErrors?: FlattenedValidationErrors | undefined;
  }) => void | Promise<void>;
}

export interface FlattenedValidationErrors {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
}

function isFlattenedValidationErrors(
  v: unknown,
): v is FlattenedValidationErrors {
  return (
    !!v && typeof v === 'object' && 'formErrors' in v && 'fieldErrors' in v
  );
}

function mapValidationErrorsToForm<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  validationErrors: FlattenedValidationErrors,
  formErrorField: 'root' | `root.${string}`,
) {
  for (const [fieldPath, messages] of Object.entries(
    validationErrors.fieldErrors,
  )) {
    if (messages && messages.length > 0) {
      form.setError(fieldPath as Path<TFieldValues>, {
        message: messages[0],
      });
    }
  }
  if (validationErrors.formErrors.length > 0) {
    form.setError(formErrorField, {
      message: validationErrors.formErrors[0],
    });
  }
}

/**
 * Schema generic stays loose (`unknown`) — `useAction` infers it from the
 * action argument anyway, and the wrapper doesn't need to read the schema
 * type. Same for shaped errors: we narrow at runtime via
 * `isFlattenedValidationErrors`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAction<TData> = HookSafeActionFn<string, any, any, TData>;

export function useFormAction<
  TData,
  TFieldValues extends FieldValues = FieldValues,
>(
  action: AnyAction<TData>,
  form?: UseFormReturn<TFieldValues>,
  options: UseFormActionOptions<TData> = {},
) {
  const {
    successMessage,
    showToast = true,
    setFormError = !!form,
    formErrorField = 'root.serverError',
    onSuccess,
    onError,
  } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callbacks: HookCallbacks<string, any, any, TData> = {
    onExecute: () => {
      form?.clearErrors();
    },
    onSuccess: async ({ data }) => {
      if (successMessage) toast.success(successMessage);
      if (onSuccess) await onSuccess(data);
    },
    onError: async ({ error }) => {
      const validationErrors = isFlattenedValidationErrors(
        error.validationErrors,
      )
        ? error.validationErrors
        : undefined;
      const serverError =
        typeof error.serverError === 'string' ? error.serverError : undefined;

      if (validationErrors && setFormError && form) {
        mapValidationErrorsToForm(form, validationErrors, formErrorField);
      }

      if (serverError) {
        if (setFormError && form) {
          form.setError(formErrorField, { message: serverError });
        }
        if (showToast) toast.error(serverError);
      } else if (!validationErrors && showToast) {
        toast.error(ERROR_MESSAGES.UNKNOWN_ERROR);
      }

      if (onError) await onError({ serverError, validationErrors });
    },
  };

  return useAction(action, callbacks);
}

/**
 * Non-hook helper for invoking a next-safe-action procedure from a context
 * where hooks aren't available (e.g. step-flow callbacks, event handlers
 * outside React). Returns the action's `data` on success, throws a regular
 * Error carrying the server error message on failure. Validation errors
 * surface as Error too — call sites needing field-level errors should use
 * `useFormAction` instead.
 */
export async function invokeAction<TData, TInput>(
  action: (input: TInput) => Promise<
    | {
        data?: TData;
        serverError?: string;
        validationErrors?: unknown;
      }
    | undefined
  >,
  input: TInput,
): Promise<TData> {
  const result = await action(input);
  if (result?.serverError) {
    throw new Error(result.serverError);
  }
  if (isFlattenedValidationErrors(result?.validationErrors)) {
    const allMessages = [
      ...result.validationErrors.formErrors,
      ...Object.values(result.validationErrors.fieldErrors)
        .flat()
        .filter((m): m is string => typeof m === 'string'),
    ];
    throw new Error(allMessages[0] ?? ERROR_MESSAGES.VALIDATION_ERROR);
  }
  if (result?.data === undefined) {
    throw new Error('Action returned no data and no error');
  }
  return result.data;
}
