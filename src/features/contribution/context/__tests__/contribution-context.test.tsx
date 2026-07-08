import { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// next-safe-action's server-action helpers are 'use server' modules; they
// can't run in jsdom. Mock the four required server queries with resolvable
// stubs so the hook ordering check is the only thing under test.
vi.mock('@/server/fairteiler/queries', () => ({
  getActiveFairteiler: vi.fn().mockResolvedValue({
    id: 'f1',
    name: 'Test',
    geoLat: '48.7',
    geoLng: '9.1',
  }),
  getOriginsByFairteiler: vi.fn().mockResolvedValue([]),
  getCategoriesByFairteiler: vi.fn().mockResolvedValue([]),
  getCompaniesByFairteiler: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/server/tutorial/queries', () => ({
  getFairteilerTutorialWithSteps: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/hooks/use-user-location', () => ({
  useUserLocation: () => ({
    coordinates: null,
    error: null,
    loading: false,
    permissionDenied: false,
  }),
}));

import { ContributionProvider, useContribution } from '../contribution-context';
import { tutorialKeys } from '@/server/tutorial/query-keys';

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, Wrapper };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('ContributionProvider', () => {
  it('re-renders from pendingFallback to children once the queries resolve, without violating Rules of Hooks', async () => {
    const { Wrapper } = makeWrapper();
    const { getByText, queryByText } = render(
      <Wrapper>
        <ContributionProvider pendingFallback={<div>pending</div>}>
          <div>child</div>
        </ContributionProvider>
      </Wrapper>,
    );

    expect(getByText('pending')).toBeTruthy();
    await waitFor(() => expect(queryByText('child')).toBeTruthy());
  });

  it('skips the pending fallback when initialData is supplied (RSC path)', () => {
    const { Wrapper } = makeWrapper();
    const { getByText, queryByText } = render(
      <Wrapper>
        <ContributionProvider
          pendingFallback={<div>pending</div>}
          initialData={{
            fairteiler: {
              id: 'f1',
              name: 'Test',
              geoLat: '48.7',
              geoLng: '9.1',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
            origins: [],
            categories: [],
            companies: [],
          }}
        >
          <div>child</div>
        </ContributionProvider>
      </Wrapper>,
    );

    expect(getByText('child')).toBeTruthy();
    expect(queryByText('pending')).toBeNull();
  });

  it('does not fall back to a cached tutorial when initialData has none', () => {
    const { client, Wrapper } = makeWrapper();
    client.setQueryData(tutorialKeys.fairteilerTutorial().queryKey, {
      id: 'stale-tutorial',
      steps: [],
    });

    let tutorial: unknown = 'unset';
    function Probe() {
      tutorial = useContribution().tutorial;
      return null;
    }

    render(
      <Wrapper>
        <ContributionProvider
          initialData={{
            fairteiler: {
              id: 'f2',
              name: 'No-Tutorial',
              geoLat: '48.7',
              geoLng: '9.1',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
            origins: [],
            categories: [],
            companies: [],
          }}
        >
          <Probe />
        </ContributionProvider>
      </Wrapper>,
    );

    expect(tutorial).toBeUndefined();
  });
});
