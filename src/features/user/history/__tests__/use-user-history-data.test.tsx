import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/server/user/queries', () => ({
  getUserContributions: vi.fn(),
}));

import { getUserContributions } from '@/server/user/queries';
import { userKeys } from '@/server/user/query-keys';
import { useUserHistoryData } from '../use-user-history-data';

const mockedGetUserContributions = vi.mocked(getUserContributions);

const INITIAL_OPTIONS = { limit: 100 } as const;
const ALL_OPTIONS = { limit: 100000 } as const;

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, Wrapper };
}

function makeContributions(count: number, total = count) {
  return {
    data: Array.from({ length: count }, (_, i) => ({
      checkinId: `c-${i}`,
      contributionDate: new Date(),
      quantity: 1,
      shelfLife: new Date(),
      foodTitle: `Item ${i}`,
      foodCompany: null,
      foodCool: false,
      foodAllergens: null,
      foodComment: null,
      categoryName: 'Test',
      categoryImage: null,
      originName: 'Test',
      companyName: null,
      contributorId: 'user-1',
      contributorName: 'Test User',
      contributorEmail: 'test@example.com',
      contributorImage: null,
      contributorIsAnonymous: false,
      fairteilerId: 'f-1',
      fairteilerName: 'Test Fairteiler',
    })),
    total,
  };
}

beforeEach(() => {
  mockedGetUserContributions.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useUserHistoryData', () => {
  it('fetches the initial slice with limit=100 and exposes contributions', async () => {
    mockedGetUserContributions.mockResolvedValue(makeContributions(2));
    const { Wrapper } = makeWrapper();

    const { result } = renderHook(() => useUserHistoryData(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.loadedCount).toBe(2));
    expect(result.current.contributions).toHaveLength(2);
    expect(result.current.totalCount).toBe(2);
    expect(mockedGetUserContributions).toHaveBeenCalledWith(INITIAL_OPTIONS);
  });

  it('keeps the all-query disabled until loadAll() is called', async () => {
    mockedGetUserContributions.mockResolvedValue(makeContributions(100, 500));
    const { Wrapper } = makeWrapper();

    const { result } = renderHook(() => useUserHistoryData(), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.loadedCount).toBe(100));

    expect(mockedGetUserContributions).toHaveBeenCalledTimes(1);
    expect(mockedGetUserContributions).toHaveBeenCalledWith(INITIAL_OPTIONS);
    expect(result.current.isLoadingAll).toBe(false);
  });

  it('switches to the all-data query after loadAll()', async () => {
    mockedGetUserContributions.mockImplementation((opts) => {
      if (opts?.limit === ALL_OPTIONS.limit) {
        return Promise.resolve(makeContributions(500));
      }
      return Promise.resolve(makeContributions(100, 500));
    });
    const { Wrapper } = makeWrapper();

    const { result } = renderHook(() => useUserHistoryData(), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.loadedCount).toBe(100));

    act(() => result.current.loadAll());

    await waitFor(() => expect(result.current.loadedCount).toBe(500));
    expect(result.current.hasLoadedAll).toBe(true);
    expect(mockedGetUserContributions).toHaveBeenCalledWith(ALL_OPTIONS);
  });

  it('flags hasLoadedAll when the initial slice already contains every row', async () => {
    mockedGetUserContributions.mockResolvedValue(makeContributions(50, 50));
    const { Wrapper } = makeWrapper();

    const { result } = renderHook(() => useUserHistoryData(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.loadedCount).toBe(50));
    expect(result.current.hasLoadedAll).toBe(true);
  });

  it('flags isEmpty when the server returns zero rows', async () => {
    mockedGetUserContributions.mockResolvedValue({ data: [], total: 0 });
    const { Wrapper } = makeWrapper();

    const { result } = renderHook(() => useUserHistoryData(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isEmpty).toBe(true));
    expect(result.current.contributions).toEqual([]);
  });

  it('invalidates only the initial query before loadAll() and both queries after', async () => {
    mockedGetUserContributions.mockResolvedValue(makeContributions(100, 500));
    const { client, Wrapper } = makeWrapper();

    const { result } = renderHook(() => useUserHistoryData(), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.loadedCount).toBe(100));

    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');

    act(() => result.current.refresh());
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(invalidateSpy.mock.calls[0][0]).toEqual({
      queryKey: userKeys.contributions(INITIAL_OPTIONS).queryKey,
    });

    invalidateSpy.mockClear();
    mockedGetUserContributions.mockResolvedValue(makeContributions(500));
    act(() => result.current.loadAll());
    await waitFor(() => expect(result.current.hasLoadedAll).toBe(true));

    act(() => result.current.refresh());
    const refreshKeys = invalidateSpy.mock.calls.map((c) => c[0]);
    expect(refreshKeys).toContainEqual({
      queryKey: userKeys.contributions(INITIAL_OPTIONS).queryKey,
    });
    expect(refreshKeys).toContainEqual({
      queryKey: userKeys.contributions(ALL_OPTIONS).queryKey,
    });
  });
});
