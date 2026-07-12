import { DataErrorBoundary } from '@/components/error-boundary';
import { UnauthorizedAccess } from '@/components/unauthorized-access';
import { FairteilerMapWrapper } from '@/features/fairteiler-map/components/fairteiler-map-wrapper';
import { getFairteilers } from '@/server/fairteiler/queries';
import { getSession } from '@/server/user/queries';
import { headers } from 'next/headers';

export default async function FairteilerFinderPage() {
  const fairteilers = await getFairteilers();

  const auth = await getSession(await headers());
  const user = auth?.user;

  if (!user) {
    return <UnauthorizedAccess />;
  }

  return (
    <div className='md:mx-8 md:mt-8'>
      <div className='mb-4 hidden md:block'>
        <h2 className='font-londrina text-4xl font-bold tracking-wider text-white'>
          Fairteiler-Finder
        </h2>
      </div>
      <DataErrorBoundary>
        <FairteilerMapWrapper
          fairteilers={fairteilers}
          mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        />
      </DataErrorBoundary>
    </div>
  );
}
