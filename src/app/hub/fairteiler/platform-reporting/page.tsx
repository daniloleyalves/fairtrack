import { DataErrorBoundary } from '@/components/error-boundary';
import PlatformReportingWrapper from '@/features/platform/reporting/components/platform-reporting-wrapper';
import { getIsPlatformAdmin } from '@/server/user/queries';
import { headers } from 'next/headers';

export default async function FairteilerPlatformReportingPage() {
  const canExport = await getIsPlatformAdmin(await headers());
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-4 sm:mx-8'>
      <div className='mb-4 flex flex-col gap-2 text-center sm:text-start'>
        <h2 className='font-londrina text-4xl font-bold tracking-wider text-white'>
          Platform-Statistiken
        </h2>
        <p
          className='max-w-5xl text-sm font-medium text-secondary'
          aria-description='form to add access view to fairteiler'
        >
          Analysiere die gesammelten Daten und verschaffe dir einen Überblick
          über alle relevanten, plattformweiten Statistiken des
          FairTrack-Netzwerks.
        </p>
      </div>

      <DataErrorBoundary>
        <PlatformReportingWrapper canExport={canExport} />
      </DataErrorBoundary>
    </div>
  );
}
