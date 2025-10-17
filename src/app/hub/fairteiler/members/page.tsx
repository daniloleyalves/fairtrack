import { Skeleton } from '@components/ui/skeleton';
import { DataErrorBoundary } from '@components/error-boundary';
import { Suspense } from 'react';
import { MemberTablesWrapper } from '@/features/fairteiler/members/components/member-tables-wrapper';

export default function FairteilerMemebersPage() {
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-4 sm:mx-8'>
      <div className='mb-4 flex flex-col gap-2 text-center sm:text-start'>
        <h2 className='font-londrina text-4xl font-bold tracking-wider text-white'>
          Mitglieder
        </h2>
        <p
          className='max-w-5xl font-medium text-secondary'
          aria-description='form to add access view to fairteiler'
        >
          Lade Teammitglieder ein, verwalte ihre Rollen und erstelle
          individuelle Zugangsprofile – z.B. für Mitarbeitende oder als
          Gastzugänge.
        </p>
      </div>
      <DataErrorBoundary>
        <Suspense fallback={<MemberTablesSkeleton />}>
          <MemberTablesWrapper />
        </Suspense>
      </DataErrorBoundary>
    </div>
  );
}

function MemberTablesSkeleton() {
  return (
    <>
      <Skeleton className='h-[250px] w-full' />
      <Skeleton className='h-[250px] w-full' />
    </>
  );
}
