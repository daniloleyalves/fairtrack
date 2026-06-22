import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { invokeAction, useFormAction } from '../use-form-action';

// Capture the callbacks `useFormAction` passes through to next-safe-action's
// `useAction` so each test can invoke them directly and verify the wrapping
// logic without standing up a real action runtime.
type Callbacks = {
  onExecute?: () => void;
  onSuccess?: (args: { data: unknown }) => Promise<void> | void;
  onError?: (args: { error: unknown }) => Promise<void> | void;
};

let capturedCallbacks: Callbacks | undefined;
const useActionMock = vi.fn();

vi.mock('next-safe-action/hooks', () => ({
  useAction: (_action: unknown, callbacks: Callbacks) => {
    capturedCallbacks = callbacks;
    return useActionMock(_action, callbacks);
  },
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

beforeEach(() => {
  capturedCallbacks = undefined;
  useActionMock.mockReset();
  useActionMock.mockReturnValue({
    execute: vi.fn(),
    isPending: false,
    result: {
      data: undefined,
      serverError: undefined,
      validationErrors: undefined,
    },
  });
  toastSuccess.mockReset();
  toastError.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

const noopAction = vi.fn();

function renderUseFormAction(
  options: Parameters<typeof useFormAction>[2] = {},
  withForm = false,
) {
  return renderHook(() => {
    const form = useForm<{ name: string }>({ defaultValues: { name: '' } });
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hook: useFormAction<any, any, any>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        noopAction as any,
        withForm ? form : undefined,
        options,
      ),
      form,
    };
  });
}

describe('useFormAction', () => {
  it('fires successMessage toast and calls onSuccess(data) on success', async () => {
    const onSuccess = vi.fn();
    renderUseFormAction({ successMessage: 'Saved!', onSuccess });

    await capturedCallbacks?.onSuccess?.({ data: { id: 42 } });

    expect(toastSuccess).toHaveBeenCalledExactlyOnceWith('Saved!');
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith({ id: 42 });
  });

  it('skips the success toast when successMessage is omitted', async () => {
    renderUseFormAction({});
    await capturedCallbacks?.onSuccess?.({ data: undefined });
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('toasts the serverError and mirrors it to root.serverError when a form is supplied', async () => {
    const { result } = renderUseFormAction({}, true);
    const setError = vi.spyOn(result.current.form, 'setError');
    await act(async () => {
      await capturedCallbacks?.onError?.({ error: { serverError: 'boom' } });
    });

    expect(toastError).toHaveBeenCalledExactlyOnceWith('boom');
    expect(setError).toHaveBeenCalledWith('root.serverError', {
      message: 'boom',
    });
  });

  it('routes serverError to a custom formErrorField when provided', async () => {
    const { result } = renderUseFormAction(
      { formErrorField: 'root.network' as const },
      true,
    );
    const setError = vi.spyOn(result.current.form, 'setError');
    await act(async () => {
      await capturedCallbacks?.onError?.({ error: { serverError: 'oops' } });
    });

    expect(setError).toHaveBeenCalledWith('root.network', { message: 'oops' });
  });

  it('maps flattened validationErrors.fieldErrors onto form.setError(path)', async () => {
    const { result } = renderUseFormAction({}, true);
    const setError = vi.spyOn(result.current.form, 'setError');
    await act(async () => {
      await capturedCallbacks?.onError?.({
        error: {
          validationErrors: {
            formErrors: [],
            fieldErrors: { name: ['Name is required'] },
          },
        },
      });
    });

    expect(setError).toHaveBeenCalledWith('name', {
      message: 'Name is required',
    });
    // No serverError → no toast for validation-only errors
    expect(toastError).not.toHaveBeenCalled();
  });

  it('maps formErrors[0] onto root.serverError', async () => {
    const { result } = renderUseFormAction({}, true);
    const setError = vi.spyOn(result.current.form, 'setError');
    await act(async () => {
      await capturedCallbacks?.onError?.({
        error: {
          validationErrors: {
            formErrors: ['Form is invalid'],
            fieldErrors: {},
          },
        },
      });
    });

    expect(setError).toHaveBeenCalledWith('root.serverError', {
      message: 'Form is invalid',
    });
  });

  it('falls back to a generic toast when neither serverError nor validationErrors are set', async () => {
    renderUseFormAction({}, true);
    await capturedCallbacks?.onError?.({ error: {} });
    expect(toastError).toHaveBeenCalledOnce();
  });

  it('respects showToast: false — no toast even on serverError', async () => {
    const { result } = renderUseFormAction({ showToast: false }, true);
    const setError = vi.spyOn(result.current.form, 'setError');
    await act(async () => {
      await capturedCallbacks?.onError?.({ error: { serverError: 'silent' } });
    });

    expect(toastError).not.toHaveBeenCalled();
    // serverError still mirrored to the form because setFormError defaults to true when a form is supplied
    expect(setError).toHaveBeenCalledWith('root.serverError', {
      message: 'silent',
    });
  });

  it('respects setFormError: false — serverError toasts but does NOT touch the form', async () => {
    const { result } = renderUseFormAction({ setFormError: false }, true);
    const setError = vi.spyOn(result.current.form, 'setError');
    await act(async () => {
      await capturedCallbacks?.onError?.({
        error: { serverError: 'just-toast' },
      });
    });

    expect(toastError).toHaveBeenCalledExactlyOnceWith('just-toast');
    expect(setError).not.toHaveBeenCalled();
  });

  it('calls the user-supplied onError with the normalized payload', async () => {
    const onError = vi.fn();
    renderUseFormAction({ onError, showToast: false });
    await capturedCallbacks?.onError?.({
      error: {
        serverError: 'srv',
        validationErrors: { formErrors: [], fieldErrors: {} },
      },
    });

    expect(onError).toHaveBeenCalledOnce();
    const payload = onError.mock.calls[0][0] as {
      serverError?: string;
      validationErrors?: unknown;
    };
    expect(payload.serverError).toBe('srv');
    expect(payload.validationErrors).toEqual({
      formErrors: [],
      fieldErrors: {},
    });
  });

  it('calls form.clearErrors on onExecute', () => {
    const { result } = renderUseFormAction({}, true);
    const clearErrors = vi.spyOn(result.current.form, 'clearErrors');
    act(() => {
      capturedCallbacks?.onExecute?.();
    });
    expect(clearErrors).toHaveBeenCalled();
  });
});

describe('invokeAction', () => {
  it('returns the action data on success', async () => {
    const action = vi.fn().mockResolvedValue({ data: { id: 'x' } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await invokeAction(action as any, { id: 'x' } as any);
    expect(result).toEqual({ id: 'x' });
  });

  it('resolves to undefined for void-returning actions (no throw)', async () => {
    const action = vi.fn().mockResolvedValue({ data: undefined });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await invokeAction(action as any, undefined as any);
    expect(result).toBeUndefined();
  });

  it('throws with the serverError message', async () => {
    const action = vi.fn().mockResolvedValue({ serverError: 'nope' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(invokeAction(action as any, {} as any)).rejects.toThrow(
      'nope',
    );
  });

  it('throws with the first validation message when present', async () => {
    const action = vi.fn().mockResolvedValue({
      validationErrors: {
        formErrors: ['form is broken'],
        fieldErrors: {},
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(invokeAction(action as any, {} as any)).rejects.toThrow(
      'form is broken',
    );
  });
});
