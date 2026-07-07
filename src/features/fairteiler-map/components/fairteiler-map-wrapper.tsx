'use client';

import { FairteilerMap } from '../map';
import { useClientEnv } from '@/lib/hooks/use-client-env';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Fairteiler } from '@/server/db/db-types';

interface FairteilerMapWrapperProps {
  fairteilers: Fairteiler[];
}

export function FairteilerMapWrapper({
  fairteilers,
}: FairteilerMapWrapperProps) {
  const { env, isLoading, error } = useClientEnv();

  if (isLoading) {
    return <Skeleton className='h-[600px] w-full rounded-lg' />;
  }

  if (error || !env) {
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
    <FairteilerMap mapboxToken={env.MAPBOX_TOKEN} fairteilers={fairteilers} />
  );
}
