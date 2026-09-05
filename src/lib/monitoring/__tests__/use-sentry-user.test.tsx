import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as Sentry from '@sentry/nextjs';
import { useSentryUser } from '../use-sentry-user';

vi.mock('@sentry/nextjs', () => ({
  setUser: vi.fn(),
}));

const setUser = vi.mocked(Sentry.setUser);

describe('useSentryUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('holds off while the session is still loading', () => {
    renderHook(() => useSentryUser(null, true));

    expect(setUser).not.toHaveBeenCalled();
  });

  it('scopes events to the user id once the session resolves', () => {
    renderHook(() => useSentryUser('user-1', false));

    expect(setUser).toHaveBeenCalledWith({ id: 'user-1' });
  });

  it('never attaches identifying fields beyond the id', () => {
    renderHook(() => useSentryUser('user-1', false));

    expect(setUser).toHaveBeenCalledWith({ id: 'user-1' });
    expect(Object.keys(setUser.mock.calls[0][0] ?? {})).toEqual(['id']);
  });

  it('clears the user when a resolved session has nobody signed in', () => {
    renderHook(() => useSentryUser(null, false));

    expect(setUser).toHaveBeenCalledWith(null);
  });

  it('clears the user on sign-out', () => {
    const { rerender } = renderHook(
      ({ id, loading }: { id: string | null; loading: boolean }) =>
        useSentryUser(id, loading),
      { initialProps: { id: 'user-1' as string | null, loading: false } },
    );
    expect(setUser).toHaveBeenLastCalledWith({ id: 'user-1' });

    rerender({ id: null, loading: false });

    expect(setUser).toHaveBeenLastCalledWith(null);
  });

  it('does not re-set the scope when the id is unchanged', () => {
    const { rerender } = renderHook(
      ({ id }: { id: string | null }) => useSentryUser(id, false),
      { initialProps: { id: 'user-1' as string | null } },
    );

    rerender({ id: 'user-1' });

    expect(setUser).toHaveBeenCalledTimes(1);
  });
});
