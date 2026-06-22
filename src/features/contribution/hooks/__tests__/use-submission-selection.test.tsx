import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

vi.mock('@/lib/services/local-storage-service', () => {
  const store = new Map<string, string>();
  return {
    storage: {
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store.set(key, value);
      }),
      __store: store,
    },
  };
});

import { storage } from '@/lib/services/local-storage-service';
import { useSubmissionSelection } from '../use-submission-selection';

const FAIRTEILER_ID = 'fairteiler-123';
const STORAGE_KEY = `fairtrack:contribution-submit-as:${FAIRTEILER_ID}`;

interface MockedStorage {
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
  __store: Map<string, string>;
}
const mockedStorage = storage as unknown as MockedStorage;

const removeItemSpy = vi.fn((key: string) => {
  mockedStorage.__store.delete(key);
});
Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: { ...window.localStorage, removeItem: removeItemSpy },
});

beforeEach(() => {
  mockedStorage.__store.clear();
  mockedStorage.getItem.mockClear();
  mockedStorage.setItem.mockClear();
  removeItemSpy.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useSubmissionSelection', () => {
  it('initializes from storage on first render', () => {
    mockedStorage.__store.set(STORAGE_KEY, 'view-7');

    const { result } = renderHook(() => useSubmissionSelection(FAIRTEILER_ID));

    expect(result.current[0]).toBe('view-7');
    expect(mockedStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('returns null when no stored value exists', () => {
    const { result } = renderHook(() => useSubmissionSelection(FAIRTEILER_ID));
    expect(result.current[0]).toBeNull();
  });

  it('persists the selected id under the per-fairteiler storage key', () => {
    const { result } = renderHook(() => useSubmissionSelection(FAIRTEILER_ID));

    act(() => result.current[1]('view-42'));

    expect(result.current[0]).toBe('view-42');
    expect(mockedStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'view-42');
  });

  it('removes the storage entry when set back to null', () => {
    mockedStorage.__store.set(STORAGE_KEY, 'view-1');

    const { result } = renderHook(() => useSubmissionSelection(FAIRTEILER_ID));
    expect(result.current[0]).toBe('view-1');

    act(() => result.current[1](null));

    expect(result.current[0]).toBeNull();
    expect(removeItemSpy).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('uses a distinct storage key per fairteiler', () => {
    mockedStorage.__store.set('fairtrack:contribution-submit-as:f-a', 'view-a');
    mockedStorage.__store.set('fairtrack:contribution-submit-as:f-b', 'view-b');

    const { result: a } = renderHook(() => useSubmissionSelection('f-a'));
    const { result: b } = renderHook(() => useSubmissionSelection('f-b'));

    expect(a.current[0]).toBe('view-a');
    expect(b.current[0]).toBe('view-b');
  });
});
