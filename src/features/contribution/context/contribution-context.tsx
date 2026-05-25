'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUserLocation } from '@/lib/hooks/use-user-location';
import {
  isWithinRadius,
  DEFAULT_PROXIMITY_RADIUS,
  type Coordinates,
} from '@/lib/geo';
import {
  GenericItem,
  FairteilerTutorialWithSteps,
  FairteilerWithMembers,
  User,
  Fairteiler,
} from '@/server/db/db-types';
import {
  getActiveFairteiler,
  getCategoriesByFairteiler,
  getCompaniesByFairteiler,
  getOriginsByFairteiler,
} from '@/server/fairteiler/queries';
import {
  categoryKeys,
  companyKeys,
  fairteilerKeys,
  originKeys,
} from '@/server/fairteiler/query-keys';
import { getFairteilerTutorialWithSteps } from '@/server/tutorial/queries';
import { tutorialKeys } from '@/server/tutorial/query-keys';

export type LocationStatus =
  | 'loading'
  | 'verified'
  | 'denied'
  | 'too-far'
  | 'error';

interface FairteilerData {
  fairteiler: Fairteiler | FairteilerWithMembers;
  origins: GenericItem[];
  categories: GenericItem[];
  companies: GenericItem[];
  tutorial?: FairteilerTutorialWithSteps;
}

interface ContributionContextValue {
  // Fairteiler data
  fairteiler: Fairteiler | FairteilerWithMembers;
  origins: GenericItem[];
  categories: (GenericItem & { image?: string })[];
  companies: (GenericItem & { originId?: string })[];
  tutorial?: FairteilerTutorialWithSteps;

  // User data
  user: User | null;

  // Location authentication
  locationStatus: LocationStatus;
  coordinates: Coordinates | null;
  isLocationVerified: boolean;
  error: string | null;

  // Actions
  requestLocation: () => void;
}

const ContributionContext = createContext<ContributionContextValue | null>(
  null,
);

interface ContributionProviderProps {
  children: React.ReactNode;
  initialData?: FairteilerData;
  trackUserLocation?: boolean;
  user?: User | null;
  pendingFallback?: React.ReactNode;
}

export function ContributionProvider({
  children,
  initialData,
  trackUserLocation = false,
  user = null,
  pendingFallback = null,
}: ContributionProviderProps) {
  const { coordinates, error, loading, permissionDenied } = useUserLocation({
    enabled: trackUserLocation,
    watchPosition: trackUserLocation,
  });
  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>('loading');

  // Client-side TanStack Query reads, gated behind `!initialData`. Five
  // independent hooks → no shared Suspense boundary → no SWR >3-call race.
  const clientEnabled = !initialData;
  const fairteilerQuery = useQuery({
    ...fairteilerKeys.active(),
    queryFn: () => getActiveFairteiler(),
    enabled: clientEnabled,
  });
  const originsQuery = useQuery({
    ...originKeys.byFairteiler(),
    queryFn: () => getOriginsByFairteiler(),
    enabled: clientEnabled,
  });
  const categoriesQuery = useQuery({
    ...categoryKeys.byFairteiler(),
    queryFn: () => getCategoriesByFairteiler(),
    enabled: clientEnabled,
  });
  const companiesQuery = useQuery({
    ...companyKeys.byFairteiler(),
    queryFn: () => getCompaniesByFairteiler(),
    enabled: clientEnabled,
  });
  const tutorialQuery = useQuery({
    ...tutorialKeys.fairteilerTutorial(),
    queryFn: () => getFairteilerTutorialWithSteps(),
    enabled: clientEnabled,
  });

  // Data resolution: prefer initialData (RSC path); otherwise wait for
  // the four required queries to resolve. Tutorial is optional, so we
  // don't gate on its loading state.
  let fairteiler: Fairteiler | FairteilerWithMembers;
  let origins: GenericItem[];
  let categories: (GenericItem & { image?: string })[];
  let companies: (GenericItem & { originId?: string })[];
  let tutorial: FairteilerTutorialWithSteps | undefined;

  if (initialData) {
    fairteiler = initialData.fairteiler;
    origins = initialData.origins;
    categories = initialData.categories as (GenericItem & { image?: string })[];
    companies = initialData.companies as (GenericItem & {
      originId?: string;
    })[];
    tutorial = initialData.tutorial;
  } else {
    if (
      !fairteilerQuery.data ||
      !originsQuery.data ||
      !categoriesQuery.data ||
      !companiesQuery.data
    ) {
      return <>{pendingFallback}</>;
    }
    fairteiler = fairteilerQuery.data;
    origins = originsQuery.data;
    categories = categoriesQuery.data as (GenericItem & { image?: string })[];
    companies = companiesQuery.data as (GenericItem & { originId?: string })[];
    tutorial = tutorialQuery.data ?? undefined;
  }

  const fairteilerCoords: Coordinates = {
    latitude: parseFloat(fairteiler.geoLat),
    longitude: parseFloat(fairteiler.geoLng),
  };

  const isLocationVerified =
    coordinates &&
    isWithinRadius(coordinates, fairteilerCoords, DEFAULT_PROXIMITY_RADIUS);

  useEffect(() => {
    if (!trackUserLocation) {
      setLocationStatus('denied');
      return;
    }

    if (loading) {
      setLocationStatus('loading');
    } else if (permissionDenied) {
      setLocationStatus('denied');
    } else if (error) {
      setLocationStatus('error');
    } else if (coordinates) {
      if (isLocationVerified) {
        setLocationStatus('verified');
      } else {
        setLocationStatus('too-far');
      }
    }
  }, [
    trackUserLocation,
    loading,
    permissionDenied,
    error,
    coordinates,
    isLocationVerified,
  ]);

  const requestLocation = () => {
    // The useUserLocation hook automatically requests location
    // This function can be used to trigger a manual refresh if needed
    window.location.reload();
  };

  const value: ContributionContextValue = {
    fairteiler,
    origins,
    categories,
    companies,
    user,
    tutorial,
    locationStatus,
    coordinates,
    isLocationVerified: Boolean(isLocationVerified),
    error,
    requestLocation,
  };

  return (
    <ContributionContext.Provider value={value}>
      {children}
    </ContributionContext.Provider>
  );
}

export function useContribution() {
  const context = useContext(ContributionContext);
  if (!context) {
    throw new Error(
      'useContribution must be used within a ContributionProvider',
    );
  }
  return context;
}
