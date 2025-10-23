'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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
import useSWRSuspense from '@/lib/services/swr';
import {
  ACTIVE_FAIRTEILER_KEY,
  CATEGORIES_BY_FAIRTEILER_KEY,
  COMPANIES_BY_FAIRTEILER_KEY,
  FAIRTEILER_TUTORIAL_KEY,
  ORIGINS_BY_FAIRTEILER_KEY,
} from '@/lib/config/api-routes';

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
}

export function ContributionProvider({
  children,
  initialData,
  trackUserLocation = false,
  user = null,
}: ContributionProviderProps) {
  const { coordinates, error, loading, permissionDenied } = useUserLocation({
    enabled: trackUserLocation,
    watchPosition: trackUserLocation,
  });
  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>('loading');

  // Client-side SWR hooks (only active in client mode)
  const { data: swrFairteilerWithMembers } =
    useSWRSuspense<FairteilerWithMembers>(
      !initialData ? ACTIVE_FAIRTEILER_KEY : undefined,
    );
  const { data: swrOrigins } = useSWRSuspense<GenericItem[]>(
    !initialData ? ORIGINS_BY_FAIRTEILER_KEY : undefined,
  );
  const { data: swrCategories } = useSWRSuspense<
    (GenericItem & { image: string })[]
  >(!initialData ? CATEGORIES_BY_FAIRTEILER_KEY : undefined);
  const { data: swrCompanies } = useSWRSuspense<
    (GenericItem & { originId: string })[]
  >(!initialData ? COMPANIES_BY_FAIRTEILER_KEY : undefined);
  const { data: swrTutorial } = useSWRSuspense<FairteilerTutorialWithSteps>(
    !initialData ? FAIRTEILER_TUTORIAL_KEY : undefined,
  );

  // Data resolution based on mode
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
    fairteiler = swrFairteilerWithMembers!;
    origins = swrOrigins!;
    categories = swrCategories!;
    companies = swrCompanies!;
    tutorial = swrTutorial;
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
