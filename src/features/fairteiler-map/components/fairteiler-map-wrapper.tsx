'use client';

import { FairteilerMap } from '../map';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import type { Fairteiler } from '@/server/db/db-types';

interface FairteilerMapWrapperProps {
  fairteilers: Fairteiler[];
  mapboxToken: string | undefined;
}

export function FairteilerMapWrapper({
  fairteilers,
  mapboxToken,
}: FairteilerMapWrapperProps) {
  if (!mapboxToken) {
    return (
      <Alert className='mb-4' variant='destructive'>
        <AlertCircle className='size-4' />
        <AlertDescription>
          Die Karte konnte nicht geladen werden. Bitte versuche es später
          erneut.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ErrorBoundary sentryTags={{ component: 'fairteiler-map' }}>
      <FairteilerMap mapboxToken={mapboxToken} fairteilers={fairteilers} />
    </ErrorBoundary>
  );
}
