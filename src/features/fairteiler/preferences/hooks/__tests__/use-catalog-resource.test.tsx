import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useCatalogResource } from '../use-catalog-resource';

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

interface Item {
  id: string;
  name: string;
}

const allKey = { queryKey: ['catalog', 'all'] as const };
const chosenKey = { queryKey: ['catalog', 'chosen'] as const };

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, Wrapper };
}

interface SetupOptions {
  initialAll?: Item[];
  initialChosen?: Item[];
  addImpl?: (item: Item) => Promise<Item>;
  removeImpl?: (item: Item) => Promise<Item>;
  updateImpl?: (item: Item) => Promise<Item>;
  suggestImpl?: (item: Item) => Promise<Item>;
  messages?: Parameters<typeof useCatalogResource>[0]['messages'];
}

function setup({
  initialAll = [{ id: 'a', name: 'A' }],
  initialChosen = [],
  addImpl,
  removeImpl,
  updateImpl,
  suggestImpl,
  messages,
}: SetupOptions = {}) {
  const { client, Wrapper } = makeWrapper();

  // Mutable server state — query refetches (e.g. after onSettled invalidate)
  // see whatever the last successful mutation wrote, so the optimistic
  // update isn't blown away by a stale fixture.
  let allState = [...initialAll];
  let chosenState = [...initialChosen];

  const defaultAdd = (item: Item) => {
    chosenState = [...chosenState, item];
    return Promise.resolve(item);
  };
  const defaultRemove = (item: Item) => {
    chosenState = chosenState.filter((c) => c.id !== item.id);
    return Promise.resolve(item);
  };
  const defaultUpdate = (item: Item) => {
    chosenState = chosenState.map((c) => (c.id === item.id ? item : c));
    return Promise.resolve(item);
  };
  const defaultSuggest = (item: Item) => {
    allState = [...allState, item];
    return Promise.resolve(item);
  };

  const config = {
    allKey,
    allQueryFn: vi.fn().mockImplementation(() => Promise.resolve(allState)),
    chosenKey,
    chosenQueryFn: vi
      .fn()
      .mockImplementation(() => Promise.resolve(chosenState)),
    addToFairteiler: addImpl ?? vi.fn().mockImplementation(defaultAdd),
    removeFromFairteiler:
      removeImpl ?? vi.fn().mockImplementation(defaultRemove),
    updatePlatformItem: updateImpl ?? vi.fn().mockImplementation(defaultUpdate),
    suggestPlatformItem:
      suggestImpl ?? vi.fn().mockImplementation(defaultSuggest),
    messages,
  } as const;

  const view = renderHook(() => useCatalogResource<Item, Item>(config), {
    wrapper: Wrapper,
  });

  return { ...view, client, config };
}

beforeEach(() => {
  toastSuccess.mockReset();
  toastError.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useCatalogResource', () => {
  describe('queries', () => {
    it('seeds `all` and `chosen` from the queryFns once they resolve', async () => {
      const { result } = setup({
        initialAll: [
          { id: 'a', name: 'A' },
          { id: 'b', name: 'B' },
        ],
        initialChosen: [{ id: 'b', name: 'B' }],
      });
      await waitFor(() => expect(result.current.all.length).toBe(2));
      expect(result.current.chosen).toEqual([{ id: 'b', name: 'B' }]);
    });

    it('returns empty arrays before queries resolve', () => {
      const { result } = setup();
      expect(result.current.all).toEqual([]);
      expect(result.current.chosen).toEqual([]);
    });
  });

  describe('addToFairteiler', () => {
    it('optimistically appends to chosen and keeps the value on success', async () => {
      const { result, client } = setup({
        initialChosen: [{ id: 'b', name: 'B' }],
      });
      await waitFor(() => expect(result.current.chosen.length).toBe(1));

      await act(async () => {
        result.current.addToFairteiler({ id: 'c', name: 'C' });
      });

      await waitFor(() =>
        expect(client.getQueryData<Item[]>(chosenKey.queryKey)).toEqual([
          { id: 'b', name: 'B' },
          { id: 'c', name: 'C' },
        ]),
      );
    });

    it('rolls back to the previous snapshot when the mutation rejects', async () => {
      const { result, client } = setup({
        initialChosen: [{ id: 'b', name: 'B' }],
        addImpl: vi.fn().mockRejectedValue(new Error('nope')),
      });
      await waitFor(() => expect(result.current.chosen.length).toBe(1));

      await act(async () => {
        result.current.addToFairteiler({ id: 'c', name: 'C' });
      });

      await waitFor(() => expect(toastError).toHaveBeenCalled());
      expect(client.getQueryData<Item[]>(chosenKey.queryKey)).toEqual([
        { id: 'b', name: 'B' },
      ]);
    });
  });

  describe('removeFromFairteiler', () => {
    it('optimistically filters out the item and fires the default success toast', async () => {
      const { result, client } = setup({
        initialChosen: [
          { id: 'b', name: 'B' },
          { id: 'c', name: 'C' },
        ],
      });
      await waitFor(() => expect(result.current.chosen.length).toBe(2));

      await act(async () => {
        result.current.removeFromFairteiler({ id: 'b', name: 'B' });
      });

      await waitFor(() =>
        expect(client.getQueryData<Item[]>(chosenKey.queryKey)).toEqual([
          { id: 'c', name: 'C' },
        ]),
      );
      await waitFor(() =>
        expect(toastSuccess).toHaveBeenCalledWith(
          'Änderung erfolgreich gespeichert.',
        ),
      );
    });

    it('rolls back on error', async () => {
      const { result, client } = setup({
        initialChosen: [{ id: 'b', name: 'B' }],
        removeImpl: vi.fn().mockRejectedValue(new Error('forbidden')),
      });
      await waitFor(() => expect(result.current.chosen.length).toBe(1));

      await act(async () => {
        result.current.removeFromFairteiler({ id: 'b', name: 'B' });
      });

      await waitFor(() => expect(toastError).toHaveBeenCalled());
      expect(client.getQueryData<Item[]>(chosenKey.queryKey)).toEqual([
        { id: 'b', name: 'B' },
      ]);
    });
  });

  describe('updatePlatformItem', () => {
    it('optimistically swaps the matching chosen item in place', async () => {
      const { result, client } = setup({
        initialChosen: [
          { id: 'b', name: 'Old' },
          { id: 'c', name: 'C' },
        ],
      });
      await waitFor(() => expect(result.current.chosen.length).toBe(2));

      await act(async () => {
        result.current.updatePlatformItem({ id: 'b', name: 'New' });
      });

      await waitFor(() =>
        expect(client.getQueryData<Item[]>(chosenKey.queryKey)).toEqual([
          { id: 'b', name: 'New' },
          { id: 'c', name: 'C' },
        ]),
      );
    });

    it('invalidates both chosenKey and allKey after settled', async () => {
      const { result, client } = setup({
        initialChosen: [{ id: 'b', name: 'B' }],
      });
      await waitFor(() => expect(result.current.chosen.length).toBe(1));
      const invalidateSpy = vi.spyOn(client, 'invalidateQueries');

      await act(async () => {
        result.current.updatePlatformItem({ id: 'b', name: 'BB' });
      });

      await waitFor(() => {
        const keys = invalidateSpy.mock.calls.map(
          (c) => (c[0] as { queryKey?: readonly unknown[] }).queryKey,
        );
        expect(keys).toEqual(
          expect.arrayContaining([chosenKey.queryKey, allKey.queryKey]),
        );
      });
    });

    it('rolls back chosen on error', async () => {
      const { result, client } = setup({
        initialChosen: [{ id: 'b', name: 'Original' }],
        updateImpl: vi.fn().mockRejectedValue(new Error('boom')),
      });
      await waitFor(() => expect(result.current.chosen.length).toBe(1));

      await act(async () => {
        result.current.updatePlatformItem({ id: 'b', name: 'Changed' });
      });

      await waitFor(() => expect(toastError).toHaveBeenCalled());
      expect(client.getQueryData<Item[]>(chosenKey.queryKey)).toEqual([
        { id: 'b', name: 'Original' },
      ]);
    });
  });

  describe('suggestPlatformItem', () => {
    it('optimistically appends to allKey cache', async () => {
      const { result, client } = setup({
        initialAll: [{ id: 'a', name: 'A' }],
      });
      await waitFor(() => expect(result.current.all.length).toBe(1));

      await act(async () => {
        result.current.suggestPlatformItem({ id: 'x', name: 'X' });
      });

      await waitFor(() =>
        expect(client.getQueryData<Item[]>(allKey.queryKey)).toEqual([
          { id: 'a', name: 'A' },
          { id: 'x', name: 'X' },
        ]),
      );
    });

    it('rolls back allKey + toasts the default suggest-error message on rejection', async () => {
      const { result, client } = setup({
        initialAll: [{ id: 'a', name: 'A' }],
        suggestImpl: vi.fn().mockRejectedValue(new Error('nope')),
      });
      await waitFor(() => expect(result.current.all.length).toBe(1));

      await act(async () => {
        result.current.suggestPlatformItem({ id: 'x', name: 'X' });
      });

      await waitFor(() =>
        expect(toastError).toHaveBeenCalledWith(
          'Fehlgeschlagen, Vorschlag konnte nicht gespeichert werden.',
        ),
      );
      expect(client.getQueryData<Item[]>(allKey.queryKey)).toEqual([
        { id: 'a', name: 'A' },
      ]);
    });
  });

  describe('messages override', () => {
    it('uses an overridden removeSuccess message', async () => {
      const { result } = setup({
        initialChosen: [{ id: 'b', name: 'B' }],
        messages: { removeSuccess: 'Kategorie erfolgreich entfernt' },
      });
      await waitFor(() => expect(result.current.chosen.length).toBe(1));

      await act(async () => {
        result.current.removeFromFairteiler({ id: 'b', name: 'B' });
      });

      await waitFor(() =>
        expect(toastSuccess).toHaveBeenCalledWith(
          'Kategorie erfolgreich entfernt',
        ),
      );
    });
  });

  describe('flags', () => {
    it('flags isAdding while the add mutation is in flight', async () => {
      let resolveAdd: ((v: Item) => void) | undefined;
      const addImpl = vi
        .fn()
        .mockImplementation(
          () => new Promise<Item>((res) => (resolveAdd = res)),
        );
      const { result } = setup({ addImpl });

      expect(result.current.flags.isAdding).toBe(false);
      act(() => {
        result.current.addToFairteiler({ id: 'x', name: 'X' });
      });
      await waitFor(() => expect(result.current.flags.isAdding).toBe(true));

      act(() => resolveAdd?.({ id: 'x', name: 'X' }));
      await waitFor(() => expect(result.current.flags.isAdding).toBe(false));
    });
  });
});
