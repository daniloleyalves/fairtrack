'use client';

import { FairteilerMap } from '../map';
import { useClientEnv } from '@/lib/hooks/use-client-env';
import { Skeleton } from '@/components/ui/skeleton';
import type { Fairteiler } from '@/server/db/db-types';

interface FairteilerMapWrapperProps {
  fairteilers: Fairteiler[];
}

export function FairteilerMapWrapper({
  fairteilers,
}: FairteilerMapWrapperProps) {
  const { env, isLoading } = useClientEnv();

  if (isLoading || !env) {
    return <Skeleton className='h-[600px] w-full rounded-lg' />;
  }

  return (
    <FairteilerMap mapboxToken={env.MAPBOX_TOKEN} fairteilers={fairteilers} />
  );
}
