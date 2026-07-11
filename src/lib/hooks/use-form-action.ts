'use client';

import { useAction } from 'next-safe-action/hooks';
import type {
  HookCallbacks,
  HookSafeActionFn,
  UseActionHookReturn,
} from 'next-safe-action/hooks';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { SafeActionFn } from 'next-safe-action';
import { useRef } from 'react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { ERROR_MESSAGES } from '@/lib/client-error-handling';

/**
 * Validation-errors shape produced by every action in this codebase, set by
 * `defaultValidationErrorsShape: 'flattened'` in `src/server/_lib/safe-action.ts`.
 * Mirrors `next-safe-action`'s flattened format so we can constrain wrapper
 * generics without re-running its formatter.
 */
export interface FlattenedValidationErrors {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
}

/**
 * The action shape every procedure in this codebase produces: `serverError`
 * is a `string` (set by `handleServerError(e) => e.message`), validation
 * errors are flattened. Schema and Data flow through generic inference at
 * the call site of `useFormAction`/`invokeAction`.
 */
export type AppHookActionFn<
  TSchema extends StandardSchemaV1 | undefined,
  TData,
> = HookSafeActionFn<string, TSchema, FlattenedValidationErrors, TData>;

/**
 * Same shape, but for direct invocation (no hook). Mirrors
 * `next-safe-action`'s `SafeActionFn` with our fixed `serverError: string`
 * and `validationErrors: FlattenedValidationErrors`. `BindArgsSchemas` is
 * `readonly []` because none of our actions use bound args (we're not on
 * the React 19 `useFormState` paradigm).
 */
export type AppActionFn<
  TSchema extends StandardSchemaV1 | undefined,
  TData,
> = SafeActionFn<
  string,
  TSchema,
  readonly [],
  FlattenedValidationErrors,
  TData
>;

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
    validationErrors?: FlattenedValidationErrors;
  }) => void | Promise<void>;
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
 * Convenience wrapper around `next-safe-action/hooks#useAction` that adds:
 * - Success toast (`successMessage`)
 * - Auto-map `validationErrors.fieldErrors` → `form.setError(path)` when a
 *   form is supplied
 * - Server-error toast (when no form-level handling is appropriate)
 *
 * Replaces the old `handleAsyncAction` helper. The Schema and Data generics
 * flow from the action argument — call sites get full type safety on
 * `execute(input)` and `result.data`.
 */
export function useFormAction<
  TSchema extends StandardSchemaV1 | undefined,
  TData,
  TFieldValues extends FieldValues = FieldValues,
>(
  action: AppHookActionFn<TSchema, TData>,
  form?: UseFormReturn<TFieldValues>,
  options: UseFormActionOptions<TData> = {},
): UseActionHookReturn<string, TSchema, FlattenedValidationErrors, TData> {
  const {
    successMessage,
    showToast = true,
    setFormError = !!form,
    formErrorField = 'root.serverError',
    onSuccess,
    onError,
  } = options;

  const pendingCallbackRef = useRef(false);

  const callbacks: HookCallbacks<
    string,
    TSchema,
    FlattenedValidationErrors,
    TData
  > = {
    onExecute: () => {
      pendingCallbackRef.current = true;
      form?.clearErrors();
    },
    onSuccess: async ({ data }) => {
      if (!pendingCallbackRef.current) return;
      pendingCallbackRef.current = false;
      if (successMessage) toast.success(successMessage);
      if (onSuccess) await onSuccess(data);
    },
    onError: async ({ error }) => {
      if (!pendingCallbackRef.current) return;
      pendingCallbackRef.current = false;
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
 * where hooks aren't available (e.g. step-flow callbacks, SWR mutation
 * fetchers, RSC pages). Returns the action's `data` on success — `TData`
 * itself is `void`/optional for actions with no return value, so the type
 * already tells call sites when that's possible — and throws an `Error`
 * carrying the server error message on failure. Validation errors surface
 * as `Error` too — call sites needing field-level errors should use
 * `useFormAction` instead.
 */
export async function invokeAction<
  TSchema extends StandardSchemaV1 | undefined,
  TData,
>(
  action: AppActionFn<TSchema, TData>,
  input: TSchema extends StandardSchemaV1<infer Input> ? Input : void,
): Promise<TData> {
  const result = await (
    action as (input: unknown) => ReturnType<typeof action>
  )(input);
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
  return result?.data as TData;
}
