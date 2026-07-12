import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { useFormAction } from '../use-form-action';

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

// The hook only runs its result callbacks for a live execution (onExecute
// arms them, they disarm after firing once) — mirror the real
// next-safe-action lifecycle when driving the captured callbacks.
async function fireSuccess(data: unknown) {
  await act(async () => {
    capturedCallbacks?.onExecute?.();
    await capturedCallbacks?.onSuccess?.({ data });
  });
}

async function fireError(error: unknown) {
  await act(async () => {
    capturedCallbacks?.onExecute?.();
    await capturedCallbacks?.onError?.({ error });
  });
}

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

    await fireSuccess({ id: 42 });

    expect(toastSuccess).toHaveBeenCalledExactlyOnceWith('Saved!');
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith({ id: 42 });
  });

  it('skips the success toast when successMessage is omitted', async () => {
    renderUseFormAction({});
    await fireSuccess(undefined);
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('toasts the serverError and mirrors it to root.serverError when a form is supplied', async () => {
    const { result } = renderUseFormAction({}, true);
    const setError = vi.spyOn(result.current.form, 'setError');
    await fireError({ serverError: 'boom' });

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
    await fireError({ serverError: 'oops' });

    expect(setError).toHaveBeenCalledWith('root.network', { message: 'oops' });
  });

  it('maps flattened validationErrors.fieldErrors onto form.setError(path)', async () => {
    const { result } = renderUseFormAction({}, true);
    const setError = vi.spyOn(result.current.form, 'setError');
    await fireError({
      validationErrors: {
        formErrors: [],
        fieldErrors: { name: ['Name is required'] },
      },
    });

    expect(setError).toHaveBeenCalledWith('name', {
      message: 'Name is required',
    });
    expect(toastError).not.toHaveBeenCalled();
  });

  it('maps formErrors[0] onto root.serverError', async () => {
    const { result } = renderUseFormAction({}, true);
    const setError = vi.spyOn(result.current.form, 'setError');
    await fireError({
      validationErrors: {
        formErrors: ['Form is invalid'],
        fieldErrors: {},
      },
    });

    expect(setError).toHaveBeenCalledWith('root.serverError', {
      message: 'Form is invalid',
    });
  });

  it('falls back to a generic toast when neither serverError nor validationErrors are set', async () => {
    renderUseFormAction({}, true);
    await fireError({});
    expect(toastError).toHaveBeenCalledOnce();
  });

  it('respects showToast: false — no toast even on serverError', async () => {
    const { result } = renderUseFormAction({ showToast: false }, true);
    const setError = vi.spyOn(result.current.form, 'setError');
    await fireError({ serverError: 'silent' });

    expect(toastError).not.toHaveBeenCalled();
    // serverError still mirrored to the form because setFormError defaults to true when a form is supplied
    expect(setError).toHaveBeenCalledWith('root.serverError', {
      message: 'silent',
    });
  });

  it('respects setFormError: false — serverError toasts but does NOT touch the form', async () => {
    const { result } = renderUseFormAction({ setFormError: false }, true);
    const setError = vi.spyOn(result.current.form, 'setError');
    await fireError({ serverError: 'just-toast' });

    expect(toastError).toHaveBeenCalledExactlyOnceWith('just-toast');
    expect(setError).not.toHaveBeenCalled();
  });

  it('calls the user-supplied onError with the normalized payload', async () => {
    const onError = vi.fn();
    renderUseFormAction({ onError, showToast: false });
    await fireError({
      serverError: 'srv',
      validationErrors: { formErrors: [], fieldErrors: {} },
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

  it('fires result callbacks once per execution — replayed callbacks are ignored', async () => {
    const onSuccess = vi.fn();
    renderUseFormAction({ successMessage: 'Saved!', onSuccess });

    await fireSuccess({ id: 1 });
    // Replay without a new onExecute — simulates Next re-mounting the
    // segment and next-safe-action re-delivering the last result.
    await act(async () => {
      await capturedCallbacks?.onSuccess?.({ data: { id: 1 } });
    });

    expect(toastSuccess).toHaveBeenCalledExactlyOnceWith('Saved!');
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('ignores result callbacks that arrive without any execution', async () => {
    const onError = vi.fn();
    renderUseFormAction({ onError });

    await act(async () => {
      await capturedCallbacks?.onError?.({ error: { serverError: 'stale' } });
    });

    expect(toastError).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
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
