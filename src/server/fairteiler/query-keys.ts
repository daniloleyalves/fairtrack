import { STALE } from '../_lib/stale-times';

export const fairteilerKeys = {
  all: () => ({ queryKey: ['fairteiler'] as const, staleTime: STALE.PROFILE }),
  list: () => ({
    queryKey: ['fairteiler', 'list'] as const,
    staleTime: STALE.CATALOG,
  }),
  active: () => ({
    queryKey: ['fairteiler', 'active'] as const,
    staleTime: STALE.ACTIVE_SESSION,
  }),
  bySlug: (slug: string) => ({
    queryKey: ['fairteiler', 'by-slug', slug] as const,
    staleTime: STALE.PROFILE,
  }),
  activeMembership: () => ({
    queryKey: ['fairteiler', 'active', 'membership'] as const,
    staleTime: STALE.ACTIVE_SESSION,
  }),
  tags: () => ({
    queryKey: ['fairteiler', 'tags'] as const,
    staleTime: STALE.PROFILE,
  }),
  dashboard: () => ({
    queryKey: ['fairteiler', 'dashboard'] as const,
    staleTime: STALE.DASHBOARD,
  }),
};

export const originKeys = {
  all: () => ({ queryKey: ['origins'] as const, staleTime: STALE.CATALOG }),
  list: () => ({
    queryKey: ['origins', 'list'] as const,
    staleTime: STALE.CATALOG,
  }),
  byFairteiler: () => ({
    queryKey: ['origins', 'by-fairteiler'] as const,
    staleTime: STALE.CATALOG,
  }),
};

export const categoryKeys = {
  all: () => ({ queryKey: ['categories'] as const, staleTime: STALE.CATALOG }),
  list: () => ({
    queryKey: ['categories', 'list'] as const,
    staleTime: STALE.CATALOG,
  }),
  byFairteiler: () => ({
    queryKey: ['categories', 'by-fairteiler'] as const,
    staleTime: STALE.CATALOG,
  }),
};

export const companyKeys = {
  all: () => ({ queryKey: ['companies'] as const, staleTime: STALE.CATALOG }),
  list: () => ({
    queryKey: ['companies', 'list'] as const,
    staleTime: STALE.CATALOG,
  }),
  byFairteiler: () => ({
    queryKey: ['companies', 'by-fairteiler'] as const,
    staleTime: STALE.CATALOG,
  }),
};
