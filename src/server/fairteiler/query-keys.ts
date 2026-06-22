import { STALE } from '../_lib/stale-times';
import {
  getActiveFairteiler,
  getCategories,
  getCategoriesByFairteiler,
  getCompanies,
  getCompaniesByFairteiler,
  getFairteilerDashboardData,
  getFairteilers,
  getOrigins,
  getOriginsByFairteiler,
  getTags,
} from './queries';

export const fairteilerKeys = {
  all: () => ({
    queryKey: ['fairteiler'] as const,
    staleTime: STALE.PROFILE,
  }),
  list: () => ({
    queryKey: ['fairteiler', 'list'] as const,
    queryFn: getFairteilers,
    staleTime: STALE.CATALOG,
  }),
  active: () => ({
    queryKey: ['fairteiler', 'active'] as const,
    queryFn: getActiveFairteiler,
    staleTime: STALE.ACTIVE_SESSION,
    refetchOnMount: 'always' as const,
  }),
  activeMembership: () => ({
    queryKey: ['fairteiler', 'active', 'membership'] as const,
    staleTime: STALE.ACTIVE_SESSION,
    refetchOnMount: 'always' as const,
  }),
  tags: () => ({
    queryKey: ['fairteiler', 'tags'] as const,
    queryFn: getTags,
    staleTime: STALE.PROFILE,
  }),
  dashboard: () => ({
    queryKey: ['fairteiler', 'dashboard'] as const,
    queryFn: getFairteilerDashboardData,
    staleTime: STALE.DASHBOARD,
  }),
};

export const originKeys = {
  all: () => ({
    queryKey: ['origins'] as const,
    queryFn: getOrigins,
    staleTime: STALE.CATALOG,
  }),
  list: () => ({
    queryKey: ['origins', 'list'] as const,
    staleTime: STALE.CATALOG,
  }),
  byFairteiler: () => ({
    queryKey: ['origins', 'by-fairteiler'] as const,
    queryFn: getOriginsByFairteiler,
    staleTime: STALE.CATALOG,
  }),
};

export const categoryKeys = {
  all: () => ({
    queryKey: ['categories'] as const,
    queryFn: getCategories,
    staleTime: STALE.CATALOG,
  }),
  list: () => ({
    queryKey: ['categories', 'list'] as const,
    staleTime: STALE.CATALOG,
  }),
  byFairteiler: () => ({
    queryKey: ['categories', 'by-fairteiler'] as const,
    queryFn: getCategoriesByFairteiler,
    staleTime: STALE.CATALOG,
  }),
};

export const companyKeys = {
  all: () => ({
    queryKey: ['companies'] as const,
    queryFn: getCompanies,
    staleTime: STALE.CATALOG,
  }),
  list: () => ({
    queryKey: ['companies', 'list'] as const,
    staleTime: STALE.CATALOG,
  }),
  byFairteiler: () => ({
    queryKey: ['companies', 'by-fairteiler'] as const,
    queryFn: getCompaniesByFairteiler,
    staleTime: STALE.CATALOG,
  }),
};
